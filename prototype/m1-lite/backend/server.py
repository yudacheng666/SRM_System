"""中文：SRM 本机 API 与静态页面服务。English: SRM loopback API and static UI host."""
from __future__ import annotations

import json
import os
import secrets
import threading
import webbrowser
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit

from store import RevisionConflict, SnapshotStore, StoreError

# 中文：仅监听本机，不暴露到局域网。
# English: Bind only to loopback; never expose the development backend to the LAN.
HOST = "127.0.0.1"
DEFAULT_PORT = 8765
MAX_BODY = 16 * 1024 * 1024 + 32768
ROOT = Path(__file__).resolve().parent.parent


def user_data_dir() -> Path:
    """中文：数据独立于 Git 源码。English: Store user data outside the Git checkout."""
    base = os.environ.get("LOCALAPPDATA")
    return (Path(base) / "SRM-Lite" if base else Path.home() / ".srm-lite").resolve()


def make_handler(store: SnapshotStore, root: Path = ROOT, port: int = DEFAULT_PORT):
    """中文：隔离单个服务实例便于测试。English: Independent request handler per server."""

    class Handler(BaseHTTPRequestHandler):
        server_version = "SRM-Local-S2"
        sys_version = ""

        def _headers(self, code: int, media: str, size: int) -> None:
            """中文：禁止缓存敏感响应。English: No-store and anti-framing headers."""
            self.send_response(code)
            self.send_header("Content-Type", media)
            self.send_header("Content-Length", str(size))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("X-Frame-Options", "DENY")
            self.send_header("Referrer-Policy", "no-referrer")
            self.end_headers()

        def _json(self, code: int, value: object) -> None:
            """中文：统一 JSON 响应。English: UTF-8 JSON response, no cross-origin grant."""
            data = json.dumps(value, ensure_ascii=False, allow_nan=False).encode("utf-8")
            self._headers(code, "application/json; charset=utf-8", len(data))
            self.wfile.write(data)

        def _guard(self, write: bool = False) -> bool:
            """中文：防止跨站写入和 DNS 重绑定。English: Validate Host and Origin."""
            hosts = {f"127.0.0.1:{self.server.server_port}", f"localhost:{self.server.server_port}"}
            origins = {f"http://{host}" for host in hosts}
            if self.headers.get("Host", "").lower() not in hosts:
                self._json(403, {"error": "INVALID_HOST"})
                return False
            if write and self.headers.get("Origin", "") not in origins:
                self._json(403, {"error": "INVALID_ORIGIN"})
                return False
            return True

        def _body(self) -> dict:
            """中文：仅接收受限大小 JSON。English: Bounded JSON input."""
            if self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower() != "application/json":
                raise ValueError("JSON_CONTENT_TYPE_REQUIRED")
            size = self.headers.get("Content-Length")
            if not size or not size.isdigit() or int(size) > MAX_BODY:
                raise ValueError("INVALID_BODY_SIZE")
            try:
                value = json.loads(self.rfile.read(int(size)).decode("utf-8"))
            except (UnicodeError, json.JSONDecodeError) as exc:
                raise ValueError("INVALID_JSON") from exc
            if not isinstance(value, dict):
                raise ValueError("JSON_OBJECT_REQUIRED")
            return value

        def _id(self, path: str) -> str | None:
            """中文：工作区 ID 只允许一个路由段。English: Restrict workspace IDs."""
            prefix = "/api/workspaces/"
            if not path.startswith(prefix):
                return None
            value = unquote(path[len(prefix):])
            if not value or "/" in value or "\\" in value or len(value) > 180:
                return None
            return value

        def do_GET(self) -> None:
            """中文：获取前端页面和业务快照。English: Serve UI and read-only API."""
            if not self._guard():
                return
            parsed = urlsplit(self.path)
            path = parsed.path
            if path == "/api/health":
                self._json(200, {"status": "ok", "mode": "offline", "backend": "sqlite",
                                 "stage": "S2", "uiPersistence": "IndexedDB (not yet migrated)"})
                return
            if path == "/api/workspaces":
                self._json(200, {"workspaces": store.list_workspaces()})
                return
            wid = self._id(path)
            if wid is not None:
                args = parse_qs(parsed.query)
                try:
                    rev = args.get("revision", [None])[0]
                    revision = int(rev) if rev is not None and rev.isdecimal() else None
                    if rev is not None and (revision is None or revision < 1):
                        raise ValueError("INVALID_REVISION")
                    data = store.get(wid, revision)
                except (ValueError, StoreError) as exc:
                    self._json(400, {"error": str(exc)})
                    return
                self._json(200 if data is not None else 404, {"workspace": data} if data else {"error": "NOT_FOUND"})
                return
            static = {"/": "index.html", "/index.html": "index.html",
                      "/storage-check": "storage-check.html", "/storage-check.html": "storage-check.html"}
            name = static.get(path)
            if name is not None:
                path_to_file = root / name if name == "index.html" else Path(__file__).resolve().parent / name
                if not path_to_file.is_file():
                    self._json(404, {"error": "PAGE_NOT_FOUND"})
                    return
                data = path_to_file.read_bytes()
                self._headers(200, "text/html; charset=utf-8", len(data))
                self.wfile.write(data)
                return
            self._json(404, {"error": "NOT_FOUND"})

        def do_PUT(self) -> None:
            """中文：按旧版本条件写入，防止覆盖。English: Revision-based compare-and-swap."""
            if not self._guard(write=True):
                return
            wid = self._id(urlsplit(self.path).path)
            if wid is None:
                self._json(404, {"error": "NOT_FOUND"})
                return
            try:
                body = self._body()
                snapshot = body.get("workspace")
                expected = body.get("expectedRevision")
                if expected is not None and (type(expected) is not int or expected < 1):
                    raise ValueError("INVALID_EXPECTED_REVISION")
                if not isinstance(snapshot, dict) or snapshot.get("workspaceId") != wid:
                    raise ValueError("WORKSPACE_ID_MISMATCH")
                revision = store.save(snapshot, expected_revision=expected)
                self._json(200, {"saved": True, "workspaceId": wid, "revision": revision})
            except RevisionConflict as exc:
                self._json(409, {"error": "REVISION_CONFLICT", "message": str(exc)})
            except (ValueError, StoreError, TypeError) as exc:
                self._json(400, {"error": "VALIDATION_ERROR", "message": str(exc)})

        def do_POST(self) -> None:
            """中文：此阶段仅提供数据库备份，不含附件。English: Database-only backup."""
            if not self._guard(write=True):
                return
            if urlsplit(self.path).path != "/api/backups/database":
                self._json(404, {"error": "NOT_FOUND"})
                return
            try:
                if self._body():
                    raise ValueError("EXPECTED_EMPTY_JSON")
                stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                name = f"{stamp}_SRM_database_{secrets.token_hex(4)}.sqlite3"
                target = store.backup(store.path.parent / "backups" / name)
                self._json(201, {"created": True, "fileName": target.name,
                                 "includesAttachments": False, "verified": True})
            except (ValueError, StoreError) as exc:
                self._json(400, {"error": str(exc)})

        def do_OPTIONS(self) -> None:
            """中文：不开启跨站调用。English: Explicitly refuse CORS preflight."""
            self._json(403, {"error": "CORS_DISABLED"})

    return Handler


def create_server(port: int = DEFAULT_PORT, data_dir: Path | None = None, root: Path = ROOT) -> ThreadingHTTPServer:
    """中文：建立测试或正式本机实例。English: Construct a loopback HTTP server."""
    location = data_dir if data_dir is not None else user_data_dir()
    store = SnapshotStore(location / "srm.sqlite3")
    server = ThreadingHTTPServer((HOST, port), make_handler(store, root, port))
    server.daemon_threads = True
    return server


def main() -> None:
    """中文：启动后自动在浏览器打开原型。English: Open the prototype browser UI."""
    server = create_server()
    url = f"http://{HOST}:{server.server_port}/"
    print(f"SRM local prototype: {url}", flush=True)
    print("NOTICE: current business UI still saves to IndexedDB until S3 migration.", flush=True)
    print("SQLite API check: " + url + "storage-check", flush=True)
    # 中文：默认打开存储检查页，避免旧 file:// 用户误以为 IndexedDB 已迁移。
    # English: Start on the status page to avoid confusing file-origin and HTTP-origin data.
    threading.Timer(0.8, lambda: webbrowser.open(url + "storage-check")).start()
    try:
        server.serve_forever(poll_interval=0.2)
    except KeyboardInterrupt:
        print("Stopping SRM local server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
