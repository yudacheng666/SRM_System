"""中文：自动备份节流、变更检测及保留七份测试。English: Automatic backup policy regression."""
import os
import hashlib
import tempfile
import time
import unittest
import zipfile
from pathlib import Path

from auto_backup import DAY_SECONDS, run_if_due
from assets import AssetStore
from store import SnapshotStore
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
