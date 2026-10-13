"""中文：PDF 附件持久化（S3）；English: Content-addressed PDF asset persistence."""
from __future__ import annotations
import hashlib
import os
import re
import sqlite3
from pathlib import Path
from store import StoreError, SnapshotStore

MAX_PDF_BYTES = 12 * 1024 * 1024


class AssetStore:
    """中文：附件独立文件落盘，SQLite 记录询价关联。English: Disk assets with SQLite linkage."""

    def __init__(self, store: SnapshotStore):
        """中文：复用业务数据目录但不使用浏览器文件库。English: Share the local data root."""
        self.store = store
        self.root = store.path.parent / "assets"
        self.root.mkdir(parents=True, exist_ok=True)
        with self.store._connect() as db:
            db.execute("""CREATE TABLE IF NOT EXISTS assets (
                          workspace_id TEXT NOT NULL,
                          sha256 TEXT NOT NULL,
                          original_name TEXT NOT NULL,
                          size INTEGER NOT NULL,
                          PRIMARY KEY(workspace_id,sha256),
                          FOREIGN KEY(workspace_id) REFERENCES workspaces(workspace_id))""")

    def _path(self, sha256: str) -> Path:
        """中文：内容哈希固定路径，不使用用户提供的文件名。English: Hash-based safe path."""
        if not re.fullmatch(r"[a-f0-9]{64}", sha256):
            raise StoreError("Invalid PDF SHA-256")
        return self.root / sha256[:2] / (sha256 + ".pdf")

    def write(self, workspace_id: str, sha256: str, filename: str, raw: bytes) -> dict:
        """中文：校验、落盘、登记；文件不会被不相同内容覆盖。English: Verify, persist, and index."""
        if not self.store.get(workspace_id):
            raise StoreError("Save the RFQ before uploading PDF originals")
        if not isinstance(filename, str) or not filename.lower().endswith(".pdf") or not 0 < len(filename) < 240:
            raise StoreError("Invalid PDF filename")
        if any(x in filename for x in ("/", "\\", "\0")):
            raise StoreError("Unsafe PDF filename")
        if not isinstance(raw, bytes) or not (0 < len(raw) <= MAX_PDF_BYTES):
            raise StoreError("PDF size invalid")
        if not raw.startswith(b"%PDF-") or b"%%EOF" not in raw[-2048:]:
            raise StoreError("PDF signature/EOF missing")
        if hashlib.sha256(raw).hexdigest() != sha256:
            raise StoreError("PDF checksum mismatch")
        path = self._path(sha256)
        path.parent.mkdir(parents=True, exist_ok=True)
        if path.exists():
            if path.stat().st_size != len(raw) or hashlib.sha256(path.read_bytes()).hexdigest() != sha256:
                raise StoreError("Existing PDF bytes do not match checksum")
        else:
            try:
                with path.open("xb") as stream:
                    stream.write(raw)
                    stream.flush()
                    os.fsync(stream.fileno())
            except FileExistsError:
                if hashlib.sha256(path.read_bytes()).hexdigest() != sha256:
                    raise StoreError("Concurrent PDF write conflict")
        with self.store._connect() as db:
            db.execute("BEGIN IMMEDIATE")
            old = db.execute("SELECT original_name,size FROM assets WHERE workspace_id=? AND sha256=?",
                             (workspace_id, sha256)).fetchone()
            if old and (old[0] != filename or old[1] != len(raw)):
                raise StoreError("Same PDF has conflicting identity metadata")
            if not old:
                db.execute("INSERT INTO assets VALUES (?,?,?,?)", (workspace_id, sha256, filename, len(raw)))
        return {"sha256": sha256, "size": len(raw), "name": filename}

    def read(self, workspace_id: str, sha256: str) -> bytes:
        """中文：只允许读取已登记到相应询价的文件。English: Read only workspace-linked assets."""
        path = self._path(sha256)
        with self.store._connect() as db:
            row = db.execute("SELECT size FROM assets WHERE workspace_id=? AND sha256=?",
                             (workspace_id, sha256)).fetchone()
        if not row or not path.is_file():
            raise StoreError("PDF is not linked or does not exist")
        raw = path.read_bytes()
        if len(raw) != row[0] or hashlib.sha256(raw).hexdigest() != sha256:
            raise StoreError("PDF integrity check failed")
        return raw
