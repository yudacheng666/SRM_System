"""中文：使用真实 HTTP 调用验证本机 API。English: Integration tests against a real loopback server."""
import http.client
import json
import tempfile
import threading
import unittest
from pathlib import Path

from server import create_server
from test_store import make_workspace


class LocalApiTests(unittest.TestCase):
    """中文：仅虚构数据，测试端口随机分配。English: Synthetic data and ephemeral test ports."""

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "index.html").write_text("<html><body>Offline UI Test</body></html>", encoding="utf-8")
        self.server = create_server(0, self.root / "data", self.root)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.addCleanup(self.server.server_close)
        self.addCleanup(self.server.shutdown)
        self.port = self.server.server_port

    def request(self, method, path, obj=None, headers=None):
        """中文：默认携带真实同源头。English: Default to valid same-origin headers."""
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        req_headers = {"Host": f"127.0.0.1:{self.port}"}
        if obj is not None:
            req_headers.update({"Content-Type": "application/json", "Origin": f"http://127.0.0.1:{self.port}"})
            body = json.dumps(obj).encode("utf-8")
        else:
            body = None
        if headers:
            req_headers.update(headers)
        conn.request(method, path, body, headers=req_headers)
        resp = conn.getresponse()
        payload = resp.read()
        conn.close()
        if resp.getheader("Content-Type", "").startswith("application/json"):
            return resp.status, json.loads(payload)
        return resp.status, payload

    def test_health_static_and_roundtrip(self):
        self.assertEqual(self.request("GET", "/api/health")[1]["backend"], "sqlite")
        self.assertEqual(self.request("GET", "/")[0], 200)
        ws = make_workspace()
        self.assertEqual(self.request("PUT", "/api/workspaces/RFQ-DEMO-001",
                                      {"workspace": ws, "expectedRevision": None})[0], 200)
        self.assertEqual(self.request("GET", "/api/workspaces")[1]["workspaces"][0]["workspaceId"], ws["workspaceId"])
        self.assertEqual(self.request("GET", "/api/workspaces/RFQ-DEMO-001")[1]["workspace"]["revision"], 1)

    def test_conflict_and_previous_revision(self):
        ws = make_workspace()
        self.request("PUT", "/api/workspaces/RFQ-DEMO-001", {"workspace": ws, "expectedRevision": None})
        ws["revision"] = 2
        self.assertEqual(self.request("PUT", "/api/workspaces/RFQ-DEMO-001",
                                      {"workspace": ws, "expectedRevision": 1})[0], 200)
        self.assertEqual(self.request("PUT", "/api/workspaces/RFQ-DEMO-001",
                                      {"workspace": ws, "expectedRevision": 1})[0], 409)
        self.assertEqual(self.request("GET", "/api/workspaces/RFQ-DEMO-001?revision=1")[1]["workspace"]["revision"], 1)

    def test_host_and_origin_rejected(self):
        self.assertEqual(self.request("GET", "/api/workspaces", headers={"Host": "evil.example"})[0], 403)
        ws = make_workspace()
        self.assertEqual(self.request("PUT", "/api/workspaces/RFQ-DEMO-001", {"workspace": ws},
                                      {"Origin": "http://evil.example"})[0], 403)
        self.assertEqual(self.request("PUT", "/api/workspaces/RFQ-DEMO-001", {"workspace": ws},
                                      {"Origin": ""})[0], 403)

    def test_db_only_backup(self):
        ws = make_workspace()
        self.request("PUT", "/api/workspaces/RFQ-DEMO-001", {"workspace": ws, "expectedRevision": None})
        code, result = self.request("POST", "/api/backups/database", {})
        self.assertEqual(code, 201)
        self.assertTrue(result["verified"])
        self.assertFalse(result["includesAttachments"])
        self.assertEqual(len(list((self.root / "data" / "backups").glob("*.sqlite3"))), 1)

    def test_reject_path_traversal_and_bad_json(self):
        self.assertEqual(self.request("GET", "/../../store.py")[0], 404)
        self.assertEqual(self.request("GET", "/api/workspaces/RFQ%2FOTHER")[0], 404)
        self.assertEqual(self.request("PUT", "/api/workspaces/RFQ-DEMO-001", {"workspace": {}})[0], 400)


if __name__ == "__main__":
    unittest.main()
