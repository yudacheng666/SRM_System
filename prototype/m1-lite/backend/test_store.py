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
                  "assignments": [], "quoteRounds": [], "awards": [], "awardReasons": [],
                  "manualAwards": [], "awardReviewIds": [], "supplierPool": [],
                  "selectedCompareSuppliers": [], "customFields": [],
                  "lineSeq": 1, "createdSeq": 1, "quoteComparisonMode": "returned"},
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

    def test_business_project_name_in_history_keeps_immutable_id(self):
        """中文：改项目名称只更新显示索引，不改数据身份和旧版本。English: Rename never rewrites identity."""
        old = make_workspace()
        self.store.save(old)
        self.assertEqual(self.store.list_workspaces()[0]["projectName"], "")
        next_ws = make_workspace(revision=2)
        next_ws["state"]["projectName"] = "示例设备零件询价（第二批）"
        self.store.save(next_ws, expected_revision=1)
        row = self.store.list_workspaces()[0]
        self.assertEqual(row["workspaceId"], "RFQ-DEMO-001")
        self.assertEqual(row["projectName"], "示例设备零件询价（第二批）")
        self.assertEqual(self.store.get("RFQ-DEMO-001", revision=1)["state"].get("projectName"), None)
        self.assertEqual(self.store.get("RFQ-DEMO-001")["state"]["projectName"], row["projectName"])

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

    def test_confirmed_round_cannot_be_mutated(self):
        ws = make_workspace()
        ws["state"]["quoteRounds"] = [{"supplierId": "SUP-01", "roundNo": 1, "revisionNo": 1,
                                        "status": "confirmed", "lines": [], "expectedLineIds": []}]
        self.store.save(ws)
        revised = make_workspace(revision=2)
        with self.assertRaises(StoreError):
            self.store.save(revised, expected_revision=1)
        self.assertEqual(self.store.get("RFQ-DEMO-001")["revision"], 1)

    def test_active_workspace_after_new_and_switch(self):
        """中文：多询价保留并切换。English: Preserve and select independent RFQs."""
        first = make_workspace()
        second = make_workspace()
        second["workspaceId"] = "RFQ-DEMO-002"
        self.store.save(first)
        self.assertEqual(self.store.active_id(), "RFQ-DEMO-001")
        self.store.save(second)
        self.assertEqual(self.store.active_id(), "RFQ-DEMO-002")
        self.assertEqual(len(self.store.list_workspaces()), 2)
        self.store.select("RFQ-DEMO-001", expected_active="RFQ-DEMO-002")
        self.assertEqual(self.store.active()["workspaceId"], "RFQ-DEMO-001")
        with self.assertRaises(RevisionConflict):
            self.store.select("RFQ-DEMO-002", expected_active="RFQ-DEMO-002")
        self.assertEqual(self.store.active_id(), "RFQ-DEMO-001")

    def test_verified_backup(self):
        self.store.save(make_workspace())
        target = Path(self.tmp.name) / "backups" / "copy.sqlite3"
        # 中文：Windows 临时目录可能使用 8.3 短名；备份 API 返回规范路径。
        # English: Windows temp roots may use 8.3 aliases; the API returns a resolved path.
        self.assertEqual(self.store.backup(target), target.resolve())
        self.assertEqual(SnapshotStore(target).get("RFQ-DEMO-001")["revision"], 1)
        with self.assertRaises(StoreError):
            self.store.backup(target)


if __name__ == "__main__":
    unittest.main()
