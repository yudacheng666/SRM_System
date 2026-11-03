"""中文：完整备份及空库恢复回归。English: Full backup/restore regression with synthetic data."""
import hashlib
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

from assets import AssetStore
from backup_bundle import create, restore
from store import SnapshotStore, StoreError
from test_store import make_workspace


class S4FullBackupTests(unittest.TestCase):
    """中文：所有测试只写临时目录。English: All tests use disposable temporary roots."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.origin = SnapshotStore(self.root / "origin" / "srm.sqlite3")
        self.orig_assets = AssetStore(self.origin)
        self.backup = self.root / "export" / "SRM_FULL_20261014_120000_aabbccdd.zip"
        self.a = b"%PDF-1.4\n% synthetic drawing A\n%%EOF"
        self.b = b"%PDF-1.4\n% synthetic drawing B\n%%EOF"
        self.sha_a = hashlib.sha256(self.a).hexdigest()
        self.sha_b = hashlib.sha256(self.b).hexdigest()

    def populate(self):
        """中文：两笔询价，首笔带历史版本。English: Two RFQs including a historical revision."""
        first = make_workspace()
        first["state"]["items"][0]["lineId"] = "LINE-001"
        first["state"]["suppliers"] = [{"id":"SUP-DEMO","name":"模拟供应商"}]
        first["state"]["assignments"] = [{"key":"LINE-001","values":["SUP-DEMO"]}]
        first["state"]["quoteRounds"] = [{
            "supplierId":"SUP-DEMO","roundNo":1,"revisionNo":1,"status":"confirmed",
            "lines":[{"lineId":"LINE-001","price":100}],"expectedLineIds":["LINE-001"]
        }]
        self.origin.save(first)
        self.orig_assets.write(first["workspaceId"], self.sha_a, "DRAW-A.pdf", self.a)
        # 中文：第 2 轮不允许覆盖已确认的第 1 轮。English: Preserve confirmed history.
        revised = json.loads(json.dumps(first))
        revised["revision"] = 2
        revised["state"]["items"][0]["name"] = "模拟物料更新版"
        revised["state"]["quoteRounds"].append({
            "supplierId":"SUP-DEMO","roundNo":2,"revisionNo":1,"status":"confirmed",
            "lines":[{"lineId":"LINE-001","price":90}],"expectedLineIds":["LINE-001"]
        })
        self.origin.save(revised, expected_revision=1)
        second = make_workspace()
        second["workspaceId"] = "RFQ-DEMO-002"
        self.origin.save(second)
        self.orig_assets.write(second["workspaceId"], self.sha_b, "DRAW-B.pdf", self.b)

    def empty_target(self, folder="target"):
        """中文：恢复端自带空表，无用户数据。English: Destination schema exists but no records."""
        store = SnapshotStore(self.root / folder / "srm.sqlite3")
        AssetStore(store)
        return store

    def test_roundtrip_two_rfqs_revisions_and_pdf_bytes(self):
        """中文：真实 ZIP 完整往返包含历史与原件。English: End-to-end archive roundtrip."""
        self.populate()
        result = create(self.origin, self.backup)
        self.assertEqual(result["workspaceCount"], 2)
        self.assertEqual(result["pdfCount"], 2)
        with zipfile.ZipFile(self.backup) as archive:
            names = set(archive.namelist())
            self.assertIn("manifest.json", names)
            self.assertIn("database/srm.sqlite3", names)
            self.assertIn("assets/" + self.sha_a + ".pdf", names)
            self.assertIn("assets/" + self.sha_b + ".pdf", names)
        new = self.empty_target()
        restored = restore(new, self.backup)
        self.assertTrue(restored["verified"])
        self.assertEqual(restored["workspaceCount"], 2)
        self.assertEqual(new.active_id(), "RFQ-DEMO-002")
        self.assertEqual(new.get("RFQ-DEMO-001")["revision"], 2)
        self.assertEqual(new.get("RFQ-DEMO-001", revision=1)["revision"], 1)
        self.assertEqual(new.get("RFQ-DEMO-001")["state"]["assignments"][0]["values"], ["SUP-DEMO"])
        self.assertEqual([r["lines"][0]["price"] for r in new.get("RFQ-DEMO-001")["state"]["quoteRounds"]], [100, 90])
        self.assertEqual(len(new.get("RFQ-DEMO-001",revision=1)["state"]["quoteRounds"]), 1)
        self.assertEqual(AssetStore(new).read("RFQ-DEMO-001", self.sha_a), self.a)
        self.assertEqual(AssetStore(new).read("RFQ-DEMO-002", self.sha_b), self.b)
        with self.assertRaises(StoreError):
            AssetStore(new).read("RFQ-DEMO-001", self.sha_b)

    def test_existing_business_data_cannot_be_overwritten(self):
        """中文：有数据的目标必须拒绝恢复。English: Existing RFQs are never overwritten."""
        self.populate()
        create(self.origin, self.backup)
        target = self.empty_target()
        target.save(make_workspace(name="另一本地询价"))
        with self.assertRaisesRegex(StoreError, "RESTORE_TARGET_NOT_EMPTY"):
            restore(target, self.backup)
        self.assertEqual(target.get("RFQ-DEMO-001")["state"]["items"][0]["name"], "另一本地询价")

    def mutate_archive(self, filename, change):
        """中文：重新生成 ZIP，使 CRC 有效但内容/清单异常。English: Tamper with regenerated CRC."""
        altered = self.root / filename
        with zipfile.ZipFile(self.backup) as original, zipfile.ZipFile(altered, "w", compression=zipfile.ZIP_STORED) as out:
            for entry in original.infolist():
                data = original.read(entry)
                out.writestr(entry.filename, change(entry.filename, data))
        return altered

    def test_modified_pdf_rejected_without_touching_target(self):
        """中文：文件长度可相同，但哈希一变即拒绝。English: SHA protects even CRC-valid tampering."""
        self.populate()
        create(self.origin, self.backup)
        changed = self.mutate_archive("bad-pdf.zip",lambda name, data: data[:-1] + b"X" if name == "assets/" + self.sha_a + ".pdf" else data)
        target = self.empty_target()
        with self.assertRaisesRegex(StoreError, "RESTORE_PDF_HASH_MISMATCH"):
            restore(target, changed)
        self.assertIsNone(target.get("RFQ-DEMO-001"))
        self.assertFalse(list((target.path.parent / "assets").rglob("*.pdf")))

    def test_missing_file_and_extra_entry_rejected(self):
        """中文：缺失/夹带文件不允许恢复。English: Reject incomplete and unexpected entries."""
        self.populate()
        create(self.origin, self.backup)
        missing = self.root / "missing.zip"
        with zipfile.ZipFile(self.backup) as source, zipfile.ZipFile(missing, "w") as output:
            for name in source.namelist():
                if name != "assets/" + self.sha_a + ".pdf":
                    output.writestr(name, source.read(name))
        target = self.empty_target()
        with self.assertRaisesRegex(StoreError, "RESTORE_EXTRA_OR_MISSING_ENTRIES"):
            restore(target, missing)
        extra = self.root / "extra.zip"
        with zipfile.ZipFile(self.backup) as source, zipfile.ZipFile(extra, "w") as output:
            for name in source.namelist():
                output.writestr(name, source.read(name))
            output.writestr("../evil.pdf", b"not exported")
        with self.assertRaisesRegex(StoreError, "RESTORE_EXTRA_OR_MISSING_ENTRIES"):
            restore(target, extra)

    def test_invalid_database_hash_rejected(self):
        """中文：数据库快照被改写时不得恢复。English: Reject modified SQLite bytes."""
        self.populate()
        create(self.origin, self.backup)
        damaged = self.mutate_archive("bad-db.zip",lambda name, data: data[:-1]+b"X" if name == "database/srm.sqlite3" else data)
        with self.assertRaisesRegex(StoreError, "RESTORE_DATABASE_HASH_MISMATCH"):
            restore(self.empty_target(), damaged)

    def test_missing_source_pdf_rejects_backup_without_output(self):
        """中文：原始 PDF 缺失不能生成虚假的完整备份。English: No false complete backup."""
        self.populate()
        self.orig_assets._path(self.sha_a).unlink()
        with self.assertRaisesRegex(StoreError, "BACKUP_MISSING_OR_CORRUPT_PDF"):
            create(self.origin, self.backup)
        self.assertFalse(self.backup.exists())

    def test_backup_refuses_existing_filename(self):
        """中文：备份不会覆盖现有同名文件。English: No overwrite of existing archives."""
        self.populate()
        create(self.origin, self.backup)
        original_bytes = self.backup.read_bytes()
        with self.assertRaisesRegex(StoreError, "BACKUP_ALREADY_EXISTS"):
            create(self.origin, self.backup)
        self.assertEqual(self.backup.read_bytes(), original_bytes)

    def test_empty_workspace_without_pdfs_is_counted(self):
        """中文：没有 PDF 的询价也在数据库历史里。English: Count RFQs with zero PDF links."""
        self.origin.save(make_workspace())
        result = create(self.origin, self.backup)
        self.assertEqual(result["workspaceCount"], 1)
        self.assertEqual(result["pdfCount"], 0)
        target = self.empty_target()
        self.assertEqual(restore(target, self.backup)["workspaceCount"], 1)
        self.assertEqual(target.get("RFQ-DEMO-001")["revision"], 1)


if __name__ == "__main__":
    unittest.main()
