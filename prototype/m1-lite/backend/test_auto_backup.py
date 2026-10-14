"""中文：自动备份节流、变更检测及保留七份测试。English: Automatic backup policy regression."""
import os
import hashlib
import json
import tempfile
import time
import unittest
import zipfile
from pathlib import Path

from auto_backup import DAY_SECONDS, run_if_due
from backup_bundle import restore
from assets import AssetStore
from store import SnapshotStore, StoreError
from test_store import make_workspace


class AutoBackupPolicyTests(unittest.TestCase):
    """中文：全部在临时数据库执行，绝不清理用户手工备份。English: Temporary roots only."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.store = SnapshotStore(self.root / "srm.sqlite3")
        # 中文：与真实服务器一致，初始化完整备份所需附件表。
        # English: Initialize the asset schema exactly as the real server does.
        AssetStore(self.store)

    def test_no_workspace_does_not_create_backup(self):
        """中文：无询价不产生空备份。English: No empty archive loops."""
        self.assertEqual(run_if_due(self.store)["reason"],"NO_SAVED_RFQS")
        self.assertFalse((self.root / "backups" / "auto").exists())

    def test_first_save_makes_full_zip_but_repeated_checks_do_not(self):
        """中文：首次备份成功；短间隔和无变更不会重复。English: Throttle and changed-only."""
        self.store.save(make_workspace())
        first = run_if_due(self.store)
        self.assertTrue(first["created"])
        auto = self.root / "backups" / "auto"
        files = list(auto.glob("SRM_FULL_*.zip"))
        self.assertEqual(len(files),1)
        with zipfile.ZipFile(files[0]) as archive:
            self.assertIn("database/srm.sqlite3",archive.namelist())
            self.assertIn("manifest.json",archive.namelist())
        self.assertEqual(run_if_due(self.store)["reason"],"NOT_DUE")
        self.assertEqual(run_if_due(self.store,now=time.time()+DAY_SECONDS+10)["reason"],"UNCHANGED")
        self.assertEqual(len(list(auto.glob("*.zip"))),1)

    def test_changes_after_a_day_create_new_copy(self):
        """中文：间隔到期且内容变化时才新增备份。English: A later edit creates next daily copy."""
        self.store.save(make_workspace())
        run_if_due(self.store)
        auto = self.root / "backups" / "auto"
        first = next(auto.glob("*.zip"))
        yesterday = time.time()-DAY_SECONDS-10
        os.utime(first,(yesterday,yesterday))
        self.store.save(make_workspace(revision=2,name="虚拟物料第二版"),expected_revision=1)
        saved = run_if_due(self.store)
        self.assertTrue(saved["created"])
        self.assertEqual(len(list(auto.glob("*.zip"))),2)

    def test_pdf_upload_without_workspace_save_is_a_change(self):
        """中文：附件落盘后尚未保存关联，也必须进入到期完整备份。
        English: Persisted PDF uploads count as changes before a workspace save.
        """
        ws = make_workspace()
        self.store.save(ws)
        first = run_if_due(self.store)
        folder = self.root / "backups" / "auto"
        newest = next(folder.glob("*.zip")).stat().st_mtime
        raw = b"%PDF-1.4\nsynthetic backup regression\n%%EOF"
        sha = hashlib.sha256(raw).hexdigest()
        AssetStore(self.store).write(ws["workspaceId"], sha, "synthetic.pdf", raw)
        self.assertEqual(run_if_due(self.store, now=newest+1)["reason"], "NOT_DUE")
        result = run_if_due(self.store, now=newest+DAY_SECONDS+1)
        self.assertTrue(result["created"])
        self.assertEqual(result["backup"]["pdfCount"], 1)

    def test_corrupted_recent_backup_creates_replacement_after_due(self):
        """中文：损坏旧备份不能阻止新备份，或删除之前的健康备份。
        English: Corruption cannot prevent fresh backup or delete earlier valid copies.
        """
        self.store.save(make_workspace())
        self.assertTrue(run_if_due(self.store)["created"])
        folder = self.root / "backups" / "auto"
        healthy = next(folder.glob("*.zip"))
        healthy_bytes = healthy.read_bytes()
        old = time.time() - DAY_SECONDS - 100
        os.utime(healthy, (old, old))
        self.store.save(make_workspace(revision=2, name="虚拟变更"), expected_revision=1)
        self.assertTrue(run_if_due(self.store)["created"])
        recent = next(p for p in folder.glob("*.zip") if p != healthy)
        recent.write_bytes(b"damaged synthetic ZIP")
        now = recent.stat().st_mtime + DAY_SECONDS + 5
        result = run_if_due(self.store, now=now)
        self.assertTrue(result["created"])
        self.assertIn("unreadable or corrupt", result["warning"])
        self.assertEqual(result["removed"], 0)
        self.assertEqual(healthy.read_bytes(), healthy_bytes)
        self.assertEqual(recent.read_bytes(), b"damaged synthetic ZIP")
        self.assertEqual(len(list(folder.glob("*.zip"))), 3)
        restored = [p for p in folder.glob("*.zip") if p not in (healthy, recent)]
        self.assertEqual(len(restored), 1)
        with zipfile.ZipFile(restored[0]) as archive:
            self.assertIn("database/srm.sqlite3", archive.namelist())
            self.assertIsNone(archive.testzip())

    def test_missing_or_invalid_manifest_never_claims_unchanged(self):
        """中文：无清单或伪造清单不能导致自动备份误判。
        English: Missing/malformed manifests cannot suppress a needed fresh archive.
        """
        for mutation in ("missing", "bad-json", "bad-structure"):
            with self.subTest(mutation=mutation), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                store = SnapshotStore(root / "srm.sqlite3")
                AssetStore(store)
                store.save(make_workspace())
                self.assertTrue(run_if_due(store)["created"])
                folder = root / "backups" / "auto"
                old_archive = next(folder.glob("*.zip"))
                with zipfile.ZipFile(old_archive, "r") as source:
                    original = {name: source.read(name) for name in source.namelist()}
                with zipfile.ZipFile(old_archive, "w", compression=zipfile.ZIP_STORED) as out:
                    for name, payload in original.items():
                        if name == "manifest.json" and mutation == "missing":
                            continue
                        if name == "manifest.json" and mutation == "bad-json":
                            payload = b"{broken json"
                        if name == "manifest.json" and mutation == "bad-structure":
                            payload = b'{"format":"srm-s4-full-backup","version":1,"database":[]}'
                        out.writestr(name, payload)
                previous_bytes = old_archive.read_bytes()
                result = run_if_due(store, now=old_archive.stat().st_mtime+DAY_SECONDS+3)
                self.assertTrue(result["created"])
                self.assertTrue(result["warning"])
                self.assertEqual(result["removed"], 0)
                self.assertEqual(old_archive.read_bytes(), previous_bytes)
                self.assertEqual(len(list(folder.glob("*.zip"))), 2)

    def test_valid_zip_with_tampered_database_is_not_trusted(self):
        """中文：即使 ZIP 本身 CRC 正常，数据库哈希变化也应拒绝。
        English: Valid ZIP CRC cannot mask modified SQLite bytes against manifest SHA.
        """
        self.store.save(make_workspace())
        run_if_due(self.store)
        folder = self.root / "backups" / "auto"
        target = next(folder.glob("*.zip"))
        with zipfile.ZipFile(target) as source:
            original = {name: source.read(name) for name in source.namelist()}
        with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_STORED) as out:
            for name, payload in original.items():
                if name == "database/srm.sqlite3":
                    payload = payload[:-1] + (b"X" if payload[-1:] != b"X" else b"Y")
                out.writestr(name, payload)
        result = run_if_due(self.store, now=target.stat().st_mtime+DAY_SECONDS+3)
        self.assertTrue(result["created"])
        self.assertIn("corrupt", result["warning"])
        self.assertEqual(result["removed"], 0)

    def test_hash_consistent_non_sqlite_is_replaced_and_original_preserved(self):
        """中文：ZIP CRC 和清单 SHA 即使自洽，也不能绕过 SQLite 完整性验证。
        English: Hash-consistent non-SQLite payload must never suppress replacement.
        """
        self.store.save(make_workspace())
        self.assertTrue(run_if_due(self.store)["created"])
        folder = self.root / "backups" / "auto"
        original = next(folder.glob("*.zip"))
        with zipfile.ZipFile(original) as source:
            content = {name: source.read(name) for name in source.namelist()}
        broken = b"synthetic non-SQLite database"
        manifest = json.loads(content["manifest.json"])
        manifest["database"]["size"] = len(broken)
        manifest["database"]["sha256"] = hashlib.sha256(broken).hexdigest()
        content["database/srm.sqlite3"] = broken
        content["manifest.json"] = json.dumps(manifest).encode("utf-8")
        with zipfile.ZipFile(original, "w", compression=zipfile.ZIP_STORED) as output:
            for name, payload in content.items():
                output.writestr(name, payload)
        original_bytes = original.read_bytes()
        due = original.stat().st_mtime + DAY_SECONDS + 2
        result = run_if_due(self.store, now=due)
        self.assertTrue(result["created"])
        self.assertIn("corrupt", result["warning"])
        self.assertEqual(result["removed"], 0)
        self.assertEqual(original.read_bytes(), original_bytes)
        self.assertEqual(len(list(folder.glob("*.zip"))), 2)
        replacement = next(path for path in folder.glob("*.zip") if path != original)
        recovered_store = SnapshotStore(self.root / "recovered" / "srm.sqlite3")
        AssetStore(recovered_store)
        restored = restore(recovered_store, replacement)
        self.assertTrue(restored["verified"])
        self.assertEqual(recovered_store.get("RFQ-DEMO-001")["revision"], 1)

    def test_boolean_manifest_version_rejected_by_backup_and_restore(self):
        """中文：版本 true 不能当作整型 1，完整恢复同样不得接受。
        English: Boolean true cannot substitute for integer schema version 1.
        """
        self.store.save(make_workspace())
        run_if_due(self.store)
        folder = self.root / "backups" / "auto"
        original = next(folder.glob("*.zip"))
        with zipfile.ZipFile(original) as source:
            content = {name: source.read(name) for name in source.namelist()}
        manifest = json.loads(content["manifest.json"])
        manifest["version"] = True
        content["manifest.json"] = json.dumps(manifest).encode("utf-8")
        with zipfile.ZipFile(original, "w", compression=zipfile.ZIP_STORED) as output:
            for name, payload in content.items():
                output.writestr(name, payload)
        recovered_store = SnapshotStore(self.root / "recovered" / "srm.sqlite3")
        AssetStore(recovered_store)
        with self.assertRaisesRegex(StoreError, "RESTORE_FORMAT_UNSUPPORTED"):
            restore(recovered_store, original)
        self.assertIsNone(recovered_store.get("RFQ-DEMO-001"))
        before = original.read_bytes()
        result = run_if_due(self.store, now=original.stat().st_mtime + DAY_SECONDS + 2)
        self.assertTrue(result["created"])
        self.assertIn("corrupt", result["warning"])
        self.assertEqual(result["removed"], 0)
        self.assertEqual(original.read_bytes(), before)
        replacement = next(p for p in folder.glob("*.zip") if p != original)
        self.assertTrue(restore(recovered_store, replacement)["verified"])

    def test_retention_never_deletes_manual_backups(self):
        """中文：保留 7 份自动备份，手动备份永不删除。English: Auto-only pruning."""
        self.store.save(make_workspace())
        folder = self.root / "backups" / "auto"
        manual = self.root / "backups" / "full"
        manual.mkdir(parents=True)
        keep_manual = manual / "MANUAL_KEEP.zip"
        keep_manual.write_bytes(b"independent manually retained backup")
        for version in range(1,11):
            if version > 1:
                self.store.save(make_workspace(revision=version,name="虚拟物料版本"+str(version)),
                                expected_revision=version-1)
            existing = sorted(folder.glob("*.zip"))
            old = time.time()-DAY_SECONDS-100
            for filename in existing:
                os.utime(filename,(old,old))
            created = run_if_due(self.store)
            self.assertTrue(created["created"])
        self.assertEqual(len(list(folder.glob("SRM_FULL_*.zip"))),7)
        self.assertEqual(keep_manual.read_bytes(),b"independent manually retained backup")


if __name__ == "__main__":
    unittest.main()
