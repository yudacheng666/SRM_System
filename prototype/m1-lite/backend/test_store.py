"""中文：持久化模块的离线单元测试。English: Offline storage unit tests."""
import tempfile
import unittest
from pathlib import Path
from store import RevisionConflict, SnapshotStore, StoreError


def make_workspace(revision=1, name="模拟物料"):
    """中文：只用虚构测试数据。English: Use synthetic values only."""
    return {
        "format": "srm-workspace", "schemaVersion": 1, "workspaceId": "RFQ-DEMO-001",
        "origin": "buyer", "revision": revision,
        "state": {"items": [{"id": "ITEM-001", "name": name}], "suppliers": [],
                  "assignments": [], "quoteRounds": [], "awards": [], "awardReasons": []},
    }


class SnapshotStoreTests(unittest.TestCase):
    """中文：验证新建、修订、拒绝覆盖、重启及备份。English: Persistence and conflict tests."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / "demo.sqlite3"
        self.store = SnapshotStore(self.path)

    def test_round_trip_after_reopen(self):
        self.assertEqual(self.store.save(make_workspace()), 1)
        reopened = SnapshotStore(self.path)
        self.assertEqual(reopened.get("RFQ-DEMO-001")["state"]["items"][0]["name"], "模拟物料")
        self.assertEqual(len(reopened.list_workspaces()), 1)

    def test_revision_conflict_preserves_existing_data(self):
        self.store.save(make_workspace())
        self.store.save(make_workspace(2, "修改版"), expected_revision=1)
        with self.assertRaises(RevisionConflict):
            self.store.save(make_workspace(2, "错误覆盖"), expected_revision=1)
        self.assertEqual(self.store.get("RFQ-DEMO-001")["revision"], 2)
        self.assertEqual(self.store.get("RFQ-DEMO-001", revision=1)["revision"], 1)
        self.assertEqual(self.store.get("RFQ-DEMO-001")["state"]["items"][0]["name"], "修改版")

    def test_malformed_and_demo_rejected(self):
        data = make_workspace()
        data["origin"] = "demo"
        with self.assertRaises(StoreError):
            self.store.save(data)
        self.assertIsNone(self.store.get("RFQ-DEMO-001"))

    def test_verified_backup(self):
        self.store.save(make_workspace())
        target = Path(self.tmp.name) / "backups" / "copy.sqlite3"
        self.assertEqual(self.store.backup(target), target)
        self.assertEqual(SnapshotStore(target).get("RFQ-DEMO-001")["revision"], 1)
        with self.assertRaises(StoreError):
            self.store.backup(target)


if __name__ == "__main__":
    unittest.main()
