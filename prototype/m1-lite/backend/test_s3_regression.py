"""中文：S3 异常回归：保证坏数据不覆盖好数据。English: S3 failure-path regression suite."""
import hashlib
import tempfile
import unittest
from pathlib import Path

from assets import AssetStore
from store import RevisionConflict, SnapshotStore, StoreError
from test_store import make_workspace


class S3FailurePathTests(unittest.TestCase):
    """中文：仅使用临时目录和虚构数据。English: Synthetic data in temporary storage only."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.store = SnapshotStore(self.root / "data" / "srm.sqlite3")
        self.assets = AssetStore(self.store)
        self.pdf = b"%PDF-1.4\n% synthetic drawing\n%%EOF"
        self.sha = hashlib.sha256(self.pdf).hexdigest()

    def prepare(self):
        """中文：先保存一笔询价。English: Commit a workspace before storing assets."""
        self.store.save(make_workspace())

    def test_unsaved_workspace_must_not_accept_pdf(self):
        """中文：禁止未提交的询价上传图纸。English: Reject asset writes before RFQ save."""
        with self.assertRaises(StoreError):
            self.assets.write("RFQ-DEMO-001", self.sha, "TEST-DWG.pdf", self.pdf)
        self.assertFalse(self.assets._path(self.sha).exists())

    def test_missing_pdf_fails_closed(self):
        """中文：原件被删除时，读取不得伪装成功。English: Missing original must fail."""
        self.prepare()
        self.assets.write("RFQ-DEMO-001", self.sha, "TEST-DWG.pdf", self.pdf)
        self.assets._path(self.sha).unlink()
        with self.assertRaises(StoreError):
            self.assets.read("RFQ-DEMO-001", self.sha)

    def test_corrupted_pdf_fails_integrity_check(self):
        """中文：即使长度不变也能发现 PDF 被修改。English: Detect same-length corruption."""
        self.prepare()
        self.assets.write("RFQ-DEMO-001", self.sha, "TEST-DWG.pdf", self.pdf)
        changed = bytearray(self.pdf)
        changed[8] ^= 1
        self.assets._path(self.sha).write_bytes(changed)
        with self.assertRaises(StoreError):
            self.assets.read("RFQ-DEMO-001", self.sha)

    def test_same_pdf_cannot_silently_change_original_name(self):
        """中文：相同 SHA 不允许静默改变原始文件身份。English: Reject identity reassignment."""
        self.prepare()
        self.assets.write("RFQ-DEMO-001", self.sha, "DRAWING-A.pdf", self.pdf)
        with self.assertRaises(StoreError):
            self.assets.write("RFQ-DEMO-001", self.sha, "DRAWING-B.pdf", self.pdf)
        self.assertEqual(self.assets.read("RFQ-DEMO-001", self.sha), self.pdf)

    def test_asset_cannot_be_read_from_another_workspace(self):
        """中文：供应商及询价资料不能串单。English: Keep assets isolated by RFQ."""
        self.prepare()
        self.assets.write("RFQ-DEMO-001", self.sha, "DRAWING-A.pdf", self.pdf)
        second = make_workspace()
        second["workspaceId"] = "RFQ-DEMO-002"
        self.store.save(second)
        self.assertEqual(self.assets.read("RFQ-DEMO-001", self.sha), self.pdf)
        with self.assertRaises(StoreError):
            self.assets.read("RFQ-DEMO-002", self.sha)

    def test_bad_workspace_update_does_not_create_new_revision(self):
        """中文：验证失败不得污染上一有效版本。English: Invalid update stays atomic."""
        self.prepare()
        wrong = make_workspace(revision=2)
        wrong["state"]["items"] = "not a list"
        with self.assertRaises(StoreError):
            self.store.save(wrong, expected_revision=1)
        self.assertEqual(self.store.get("RFQ-DEMO-001")["revision"], 1)
        self.assertIsNone(self.store.get("RFQ-DEMO-001", revision=2))

    def test_stale_tab_cannot_change_active_workspace(self):
        """中文：旧页面不得覆盖其他窗口选择。English: Reject stale tab selection."""
        self.prepare()
        second = make_workspace()
        second["workspaceId"] = "RFQ-DEMO-002"
        self.store.save(second)
        self.store.select("RFQ-DEMO-001", expected_active="RFQ-DEMO-002")
        with self.assertRaises(RevisionConflict):
            self.store.select("RFQ-DEMO-002", expected_active="RFQ-DEMO-002")
        self.assertEqual(self.store.active_id(), "RFQ-DEMO-001")

    def test_sqlite_backup_is_not_full_pdf_restore(self):
        """中文：数据库备份不等于含 PDF 的完整恢复包。English: DB backup excludes binary PDFs."""
        self.prepare()
        self.assets.write("RFQ-DEMO-001", self.sha, "DRAWING-A.pdf", self.pdf)
        backup_path = self.root / "backups" / "verified.sqlite3"
        self.store.backup(backup_path)
        reopened = SnapshotStore(backup_path)
        self.assertEqual(reopened.get("RFQ-DEMO-001")["revision"], 1)
        with self.assertRaises(StoreError):
            AssetStore(reopened).read("RFQ-DEMO-001", self.sha)


if __name__ == "__main__":
    unittest.main()
