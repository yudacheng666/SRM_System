"""中文：SRM 本机 API 与静态页面服务。English: SRM loopback API and static UI host."""
from __future__ import annotations

import json
import os
import secrets
import sqlite3
import tempfile
import threading
import webbrowser
import zipfile
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit

from store import RevisionConflict, SnapshotStore, StoreError
from assets import AssetStore, MAX_PDF_BYTES
from backup_bundle import ARCHIVE_NAME, MAX_ARCHIVE, create as create_full_backup, restore as restore_full_backup

# 中文：仅监听本机，不暴露到局域网。
# English: Bind only to loopback; never expose the development backend to the LAN.
HOST = "127.0.0.1"
DEFAULT_PORT = 8765
MAX_BODY = 16 * 1024 * 1024 + 32768
ROOT = Path(__file__).resolve().parent.parent


def user_data_dir() -> Path:
    """中文：数据独立于 Git 源码；测试可显式指定隔离目录。English: Support opt-in isolated test roots."""
    # 中文：显式测试路径，不会自动迁移或删除正式本机数据。
    # English: Explicit data-root override never migrates or deletes existing data.
    override = os.environ.get("SRM_DATA_DIR")
    if override:
        return Path(override).expanduser().resolve()
    base = os.environ.get("LOCALAPPDATA")
    return (Path(base) / "SRM-Lite" if base else Path.home() / ".srm-lite").resolve()


def make_handler(store: SnapshotStore, root: Path = ROOT, port: int = DEFAULT_PORT):
    """中文：隔离单个服务实例便于测试。English: Independent request handler per server."""

    assets = AssetStore(store)
    # 中文：备份和恢复期间阻止任何其他写入。
    # English: Serialize all local operations with backup and restore.
    operation_lock = threading.RLock()

    class Handler(BaseHTTPRequestHandler):
        server_version = "SRM-Local-S3"
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

        def _asset_route(self, path: str):
            """中文：仅接受 /api/assets/询价ID/哈希。English: Exact asset URI validation."""
            parts = unquote(path).split("/")
            if len(parts) == 5 and parts[:3] == ["", "api", "assets"] and parts[3] and parts[4]:
                return parts[3], parts[4]
            return None

        def do_GET(self) -> None:
            """中文：获取前端页面和业务快照。English: Serve UI and read-only API."""
            with operation_lock:
                if not self._guard():
                    return
                parsed = urlsplit(self.path)
                path = parsed.path
                if path == "/api/health":
                    self._json(200, {"status": "ok", "mode": "offline", "backend": "sqlite",
                                     "stage": "S4", "uiPersistence": "SQLite API",
                                     "features": {"fullBackupRestore": True}})
                    return
                if path.startswith("/api/backups/full/") and path != "/api/backups/full/restore":
                    # 中文：只允许下载固定安全格式的本机备份名称。
                    # English: Download generated filenames only; never allow traversal.
                    filename = path[len("/api/backups/full/"):]
                    if not ARCHIVE_NAME.fullmatch(filename):
                        self._json(404, {"error":"BACKUP_NOT_FOUND"})
                        return
                    source = store.path.parent / "backups" / "full" / filename
                    if not source.is_file():
                        self._json(404, {"error":"BACKUP_NOT_FOUND"})
                        return
                    self._headers(200, "application/zip", source.stat().st_size)
                    with source.open("rb") as stream:
                        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                            self.wfile.write(chunk)
                    return
                if path == "/api/active":
                    self._json(200, {"workspace": store.active(), "activeId": store.active_id()})
                    return
                asset_route = self._asset_route(path)
                if asset_route:
                    try:
                        content = assets.read(*asset_route)
                        self._headers(200, "application/pdf", len(content))
                        self.wfile.write(content)
                    except StoreError as exc:
                        self._json(404, {"error": str(exc)})
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
            with operation_lock:
                if not self._guard(write=True):
                    return
                path = urlsplit(self.path).path
                asset_route = self._asset_route(path)
                if asset_route:
                    try:
                        raw_size = self.headers.get("Content-Length", "")
                        if self.headers.get("Content-Type", "").split(";")[0].lower() != "application/pdf":
                            raise ValueError("PDF_CONTENT_TYPE_REQUIRED")
                        if not raw_size.isdecimal() or not 0 < int(raw_size) <= MAX_PDF_BYTES:
                            raise ValueError("INVALID_PDF_SIZE")
                        name = unquote(self.headers.get("X-SRM-Filename", ""))
                        info = assets.write(asset_route[0], asset_route[1], name, self.rfile.read(int(raw_size)))
                        self._json(200, {"saved": True, "document": info})
                    except (ValueError, StoreError) as exc:
                        self._json(400, {"error": str(exc)})
                    return
                wid = self._id(path)
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
                    kwargs = {"expected_active": body.get("expectedActive")} if "expectedActive" in body else {}
                    revision = store.save(snapshot, expected_revision=expected, **kwargs)
                    self._json(200, {"saved": True, "workspaceId": wid, "revision": revision})
                except RevisionConflict as exc:
                    self._json(409, {"error": "REVISION_CONFLICT", "message": str(exc)})
                except (ValueError, StoreError, TypeError) as exc:
                    self._json(400, {"error": "VALIDATION_ERROR", "message": str(exc)})

        def do_POST(self) -> None:
            """中文：选择询价和执行 S4 完整备份恢复。English: State and backup routes."""
            with operation_lock:
                if not self._guard(write=True):
                    return
                if urlsplit(self.path).path == "/api/active/select":
                    try:
                        request = self._body()
                        identity = request.get("workspaceId")
                        expected = request.get("expectedActive")
                        if not isinstance(identity, str) or not isinstance(expected, (str, type(None))):
                            raise ValueError("INVALID_SELECTION")
                        store.select(identity, expected)
                        self._json(200, {"activeId": identity, "workspace": store.get(identity)})
                    except RevisionConflict as exc:
                        self._json(409, {"error": "REVISION_CONFLICT", "message": str(exc)})
                    except (ValueError, StoreError) as exc:
                        self._json(400, {"error": str(exc)})
                    return
                if urlsplit(self.path).path == "/api/backups/full":
                    try:
                        if self._body():
                            raise ValueError("EXPECTED_EMPTY_JSON")
                        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                        name = f"SRM_FULL_{stamp}_{secrets.token_hex(4)}.zip"
                        result = create_full_backup(store, store.path.parent / "backups" / "full" / name)
                        self._json(201, {"created":True,"backup":result,
                                         "downloadUrl":"/api/backups/full/"+name})
                    except (ValueError, StoreError, sqlite3.DatabaseError, OSError, zipfile.BadZipFile) as exc:
                        self._json(400, {"error":"FULL_BACKUP_FAILED","message":str(exc)})
                    return
                if urlsplit(self.path).path == "/api/backups/full/restore":
                    # 中文：只接收完整 ZIP 并先验证；只可恢复至空白数据库。
                    # English: Preflight complete ZIP; restore only into an empty data root.
                    rawsize = self.headers.get("Content-Length","")
                    if self.headers.get("Content-Type","").split(";")[0].strip().lower() != "application/zip" or not rawsize.isdecimal() or not 0 < int(rawsize) <= MAX_ARCHIVE:
                        self._json(400, {"error":"INVALID_RESTORE_UPLOAD"})
                        return
                    try:
                        with tempfile.TemporaryDirectory(prefix=".s4upload-", dir=store.path.parent) as stage:
                            source = Path(stage)/"incoming.zip"
                            left = int(rawsize)
                            with source.open("xb") as out:
                                while left:
                                    block = self.rfile.read(min(left, 1024*1024))
                                    if not block:
                                        raise ValueError("INCOMPLETE_RESTORE_UPLOAD")
                                    out.write(block)
                                    left -= len(block)
                            result = restore_full_backup(store, source)
                        self._json(200, result)
                    except StoreError as exc:
                        code = 409 if str(exc).startswith("RESTORE_TARGET_") else 400
                        self._json(code, {"error":"RESTORE_REJECTED","message":str(exc)})
                    except (ValueError, sqlite3.DatabaseError, OSError, zipfile.BadZipFile, json.JSONDecodeError) as exc:
                        self._json(400, {"error":"RESTORE_FAILED","message":str(exc)})
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
    print("S4 SQLite + PDF backup/restore active. Run the SRM page through this local server, never file://.", flush=True)
    print("SQLite API check: " + url + "storage-check", flush=True)
    # 中文：本机服务直接打开业务原型；关闭服务后数据仍保存在 SQLite。
    # English: Open the app; the local SQLite database persists after service shutdown.
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever(poll_interval=0.2)
    except KeyboardInterrupt:
        print("Stopping SRM local server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
