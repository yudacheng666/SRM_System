"""中文：S4 实际 HTTP 备份下载与恢复接口测试。English: S4 HTTP integration tests."""
import http.client
import json
import tempfile
import threading
import unittest
from pathlib import Path

from server import create_server
from test_store import make_workspace


class S4HttpTests(unittest.TestCase):
    """中文：随机本地端口、临时独立数据库。English: Random loopback ports and temporary data."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root / "index.html").write_text("<html>S4</html>", encoding="utf-8")
        self.origin = self._start("origin")
        self.target = self._start("destination")

    def _start(self, name):
        server = create_server(0, self.root / name, self.root)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        return server.server_port

    def call(self, port, method, route, content=None, media=None, origin=True):
        conn = http.client.HTTPConnection("127.0.0.1", port, timeout=20)
        headers = {"Host":f"127.0.0.1:{port}"}
        if method in ("PUT","POST") and origin:
            headers["Origin"] = f"http://127.0.0.1:{port}"
        if media is not None:
            headers["Content-Type"] = media
        if isinstance(content, dict):
            data = json.dumps(content).encode("utf-8")
            headers["Content-Type"] = "application/json"
        else:
            data = content
        conn.request(method, route, body=data, headers=headers)
        response = conn.getresponse()
        raw = response.read()
        code = response.status
        is_json = response.getheader("Content-Type", "").startswith("application/json")
        conn.close()
        return code, json.loads(raw) if is_json else raw

    def test_http_backup_download_restore_and_reject_overwrite(self):
        """中文：下载 ZIP，并恢复到不同端口的空库。English: Real HTTP roundtrip."""
        source = make_workspace()
        code, _ = self.call(self.origin,"PUT","/api/workspaces/RFQ-DEMO-001",
                            {"workspace":source,"expectedRevision":None})
        self.assertEqual(code,200)
        code, result = self.call(self.origin,"POST","/api/backups/full",{})
        self.assertEqual(code,201)
        self.assertTrue(result["backup"]["verified"])
        self.assertEqual(result["backup"]["workspaceCount"],1)
        code, zipped = self.call(self.origin,"GET",result["downloadUrl"])
        self.assertEqual(code,200)
        self.assertEqual(len(zipped), result["backup"]["bytes"])
        self.assertTrue(zipped.startswith(b"PK"))
        code, empty = self.call(self.target,"GET","/api/health")
        self.assertEqual(code,200)
        self.assertTrue(empty["features"]["fullBackupRestore"])
        code, restored = self.call(self.target,"POST","/api/backups/full/restore",zipped,"application/zip")
        self.assertEqual(code,200)
        self.assertTrue(restored["restored"])
        self.assertEqual(restored["workspaceCount"],1)
        code, snapshot = self.call(self.target,"GET","/api/workspaces/RFQ-DEMO-001")
        self.assertEqual(code,200)
        self.assertEqual(snapshot["workspace"],source)
        code, second_try = self.call(self.target,"POST","/api/backups/full/restore",zipped,"application/zip")
        self.assertEqual(code,409)
        self.assertIn("RESTORE_TARGET_NOT_EMPTY",second_try["message"])

    def test_full_restore_rejects_cross_origin_and_invalid_archive(self):
        """中文：非法来源与坏 ZIP 均应拒绝。English: Origin and malformed uploads fail."""
        self.assertEqual(self.call(self.target,"POST","/api/backups/full/restore",
                                   b"bad","application/zip",origin=False)[0],403)
        code, _ = self.call(self.target,"POST","/api/backups/full/restore",
                            b"not a zip","application/zip")
        self.assertEqual(code,400)
        self.assertEqual(self.call(self.target,"GET","/api/workspaces")[1]["workspaces"],[])

    def test_backup_endpoint_requires_same_origin_and_no_data_loss(self):
        """中文：跨站不应触发完整备份。English: Cross-origin backup denied."""
        self.assertEqual(self.call(self.origin,"POST","/api/backups/full",{},origin=False)[0],403)
        code, backup = self.call(self.origin,"POST","/api/backups/full",{})
        self.assertEqual(code,201)
        self.assertEqual(backup["backup"]["workspaceCount"],0)


if __name__ == "__main__":
    unittest.main()
