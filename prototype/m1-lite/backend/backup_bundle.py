"""中文：完整 SQLite/PDF 备份与空数据目录恢复。English: Complete backup and empty-root restore."""
from __future__ import annotations

import hashlib
import json
import os
import re
import sqlite3
import tempfile
import zipfile
from contextlib import closing
from datetime import datetime
from pathlib import Path

from store import SnapshotStore, StoreError

FORMAT = "srm-s4-full-backup"
VERSION = 1
MAX_ARCHIVE = 512 * 1024 * 1024
MAX_DATABASE = 128 * 1024 * 1024
MAX_FILES = 2000
MAX_PDF = 12 * 1024 * 1024
MAX_MANIFEST = 2 * 1024 * 1024
ARCHIVE_NAME = re.compile(r"SRM_FULL_[0-9]{8}_[0-9]{6}_[0-9a-f]{8}\.zip\Z")
HASH = re.compile(r"[0-9a-f]{64}\Z")


def _hash(path: Path) -> str:
    """中文：流式校验，不把附件全部读入内存。English: Stream SHA-256."""
    h = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _db_inventory(path: Path) -> list[dict]:
    """中文：验证备份数据库结构及原件索引。English: Validate schema and asset metadata."""
    if not path.is_file() or path.stat().st_size > MAX_DATABASE:
        raise StoreError("BACKUP_DATABASE_SIZE_INVALID")
    with closing(sqlite3.connect(path)) as db:
        db.execute("PRAGMA trusted_schema=OFF")
        if db.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise StoreError("BACKUP_DATABASE_CORRUPT")
        definitions = db.execute("SELECT type,name FROM sqlite_master").fetchall()
        allowed = {"workspaces", "workspace_versions", "app_state", "assets"}
        if any(kind in ("view", "trigger") or (kind == "table" and name not in allowed and not name.startswith("sqlite_"))
               for kind, name in definitions):
            raise StoreError("BACKUP_DATABASE_UNEXPECTED_SCHEMA")
        tables = {name for kind, name in definitions if kind == "table"}
        if not allowed.issubset(tables):
            raise StoreError("BACKUP_DATABASE_SCHEMA_MISSING")
        rows = db.execute("SELECT workspace_id,sha256,original_name,size FROM assets ORDER BY workspace_id,sha256").fetchall()
        if len(rows) > MAX_FILES * 16:
            raise StoreError("BACKUP_TOO_MANY_LINKS")
        workspaces = {row[0] for row in db.execute("SELECT workspace_id FROM workspaces")}
        revisions = db.execute("SELECT workspace_id,revision,snapshot_json FROM workspace_versions").fetchall()
        for wid, rev, source in revisions:
            state = json.loads(source)
            if not isinstance(state, dict) or wid not in workspaces or state.get("workspaceId") != wid or state.get("revision") != rev:
                raise StoreError("BACKUP_HISTORY_INVALID")
        for wid, source in db.execute("SELECT workspace_id,snapshot_json FROM workspaces"):
            snapshot = json.loads(source)
            if not isinstance(snapshot, dict) or snapshot.get("workspaceId") != wid:
                raise StoreError("BACKUP_WORKSPACE_INVALID")
        active = db.execute("SELECT value FROM app_state WHERE key='active_workspace'").fetchone()
        if active is not None and active[0] not in workspaces:
            raise StoreError("BACKUP_ACTIVE_RFQ_INVALID")
        results = []
        for wid, sha, name, size in rows:
            if wid not in workspaces or not isinstance(sha, str) or not HASH.fullmatch(sha) or not isinstance(name, str) or not name.lower().endswith(".pdf") or type(size) is not int or not 0 < size <= MAX_PDF:
                raise StoreError("BACKUP_ASSET_INDEX_INVALID")
            results.append({"workspaceId":wid, "sha256":sha, "name":name, "size":size})
        return results


def create(store: SnapshotStore, output: Path) -> dict:
    """中文：生成数据库一致性快照及全部已登记 PDF。English: Snapshot all indexed originals."""
    output = Path(output).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        raise StoreError("BACKUP_ALREADY_EXISTS")
    with tempfile.TemporaryDirectory(prefix=".s4backup-", dir=output.parent) as temporary:
        dbcopy = Path(temporary) / "srm.sqlite3"
        store.backup(dbcopy)
        records = _db_inventory(dbcopy)
        sha_set = sorted({row["sha256"] for row in records})
        if len(sha_set) > MAX_FILES:
            raise StoreError("BACKUP_TOO_MANY_PDFS")
        files = []
        for sha in sha_set:
            original = store.path.parent / "assets" / sha[:2] / (sha + ".pdf")
            if not original.is_file() or original.stat().st_size > MAX_PDF or _hash(original) != sha:
                raise StoreError("BACKUP_MISSING_OR_CORRUPT_PDF:" + sha)
            files.append({"path":"assets/" + sha + ".pdf", "sha256":sha, "size":original.stat().st_size})
        known = {x["sha256"]:x["size"] for x in files}
        if any(known[x["sha256"]] != x["size"] for x in records):
            raise StoreError("BACKUP_PDF_SIZE_MISMATCH")
        manifest = {"format":FORMAT, "version":VERSION, "database":{"path":"database/srm.sqlite3","size":dbcopy.stat().st_size,"sha256":_hash(dbcopy)},
                    "assets":files, "assetLinks":records}
        # 中文：写 ZIP 之前预估大小，避免异常附件过多耗尽硬盘。
        # English: Bound archive output before writing it to prevent disk exhaustion.
        manifest_bytes = json.dumps(manifest, ensure_ascii=False, separators=(",",":")).encode("utf-8")
        if len(manifest_bytes) > MAX_MANIFEST or dbcopy.stat().st_size + sum(f["size"] for f in files) + len(manifest_bytes) + 1024 * (len(files)+2) > MAX_ARCHIVE:
            raise StoreError("BACKUP_SIZE_LIMIT")
        part = Path(temporary) / "bundle.partial"
        with zipfile.ZipFile(part, "w", compression=zipfile.ZIP_STORED, allowZip64=False) as archive:
            archive.writestr("manifest.json", manifest_bytes)
            archive.write(dbcopy, "database/srm.sqlite3")
            for item in files:
                sha = item["sha256"]
                archive.write(store.path.parent / "assets" / sha[:2] / (sha + ".pdf"), item["path"])
        if part.stat().st_size > MAX_ARCHIVE:
            raise StoreError("BACKUP_SIZE_LIMIT")
        # 中文：创建完成后从 ZIP 重新读取和校验，避免误报备份成功。
        # English: Verify the final archive stream before publishing a successful backup.
        with zipfile.ZipFile(part, "r") as check:
            names = set(check.namelist())
            if names != {"manifest.json", "database/srm.sqlite3"} | {f["path"] for f in files}:
                raise StoreError("BACKUP_ARCHIVE_ENTRY_MISMATCH")
            for member, expected in [("database/srm.sqlite3", manifest["database"]["sha256"])] + [
                (item["path"],item["sha256"]) for item in files
            ]:
                digest = hashlib.sha256()
                with check.open(member) as binary:
                    for block in iter(lambda: binary.read(1024 * 1024), b""):
                        digest.update(block)
                if digest.hexdigest() != expected:
                    raise StoreError("BACKUP_ARCHIVE_HASH_MISMATCH")
        os.replace(part, output)
        return {"fileName":output.name, "workspaceCount":_workspace_count(dbcopy),
                "pdfCount":len(files), "assetLinks":len(records), "bytes":output.stat().st_size, "verified":True}


def _workspace_count(path: Path) -> int:
    with closing(sqlite3.connect(path)) as db:
        return db.execute("SELECT count(*) FROM workspaces").fetchone()[0]


def restore(store: SnapshotStore, source: Path) -> dict:
    """中文：只恢复到空库，完整预校验后写入，绝不覆盖已有询价。English: Reject nonempty destinations."""
    source = Path(source).resolve()
    if not source.is_file() or source.stat().st_size > MAX_ARCHIVE:
        raise StoreError("RESTORE_ARCHIVE_SIZE_INVALID")
    root = store.path.parent
    with store._connect() as db:
        if db.execute("SELECT count(*) FROM workspaces").fetchone()[0] or db.execute("SELECT count(*) FROM assets").fetchone()[0]:
            raise StoreError("RESTORE_TARGET_NOT_EMPTY")
    if any((root / "assets").rglob("*.pdf")):
        raise StoreError("RESTORE_TARGET_FILES_NOT_EMPTY")
    with tempfile.TemporaryDirectory(prefix=".s4restore-", dir=root) as temporary:
        stage = Path(temporary)
        with zipfile.ZipFile(source, "r", allowZip64=False) as archive:
            entries = archive.infolist()
            names = [x.filename for x in entries]
            if len(names) != len(set(names)) or len(names) > MAX_FILES + 2 or "manifest.json" not in names or "database/srm.sqlite3" not in names:
                raise StoreError("RESTORE_INVALID_ARCHIVE_ENTRIES")
            if any(x.is_dir() or x.flag_bits & 1 or x.compress_type != zipfile.ZIP_STORED for x in entries):
                raise StoreError("RESTORE_UNSUPPORTED_ARCHIVE")
            if sum(x.file_size for x in entries) > MAX_ARCHIVE:
                raise StoreError("RESTORE_ARCHIVE_EXPANSION_LIMIT")
            info = archive.getinfo("manifest.json")
            if info.file_size > MAX_MANIFEST:
                raise StoreError("RESTORE_MANIFEST_TOO_LARGE")
            manifest = json.loads(archive.read("manifest.json"))
            if not isinstance(manifest, dict) or manifest.get("format") != FORMAT or manifest.get("version") != VERSION:
                raise StoreError("RESTORE_FORMAT_UNSUPPORTED")
            database = manifest.get("database",{})
            if not isinstance(database, dict):
                raise StoreError("RESTORE_DATABASE_MANIFEST_INVALID")
            if database.get("path") != "database/srm.sqlite3" or not HASH.fullmatch(str(database.get("sha256",""))) or type(database.get("size")) is not int or not 0 < database["size"] <= MAX_DATABASE:
                raise StoreError("RESTORE_DATABASE_MANIFEST_INVALID")
            files = manifest.get("assets")
            links = manifest.get("assetLinks")
            if not isinstance(files,list) or len(files)>MAX_FILES or not isinstance(links,list):
                raise StoreError("RESTORE_ASSET_MANIFEST_INVALID")
            expected = {"manifest.json","database/srm.sqlite3"}
            seen_sha = set()
            for f in files:
                if not isinstance(f,dict):
                    raise StoreError("RESTORE_ASSET_MANIFEST_INVALID")
                sha = f.get("sha256")
                if not isinstance(sha,str) or not HASH.fullmatch(sha) or sha in seen_sha or f.get("path") != "assets/" + sha + ".pdf" or type(f.get("size")) is not int or not 0 < f["size"] <= MAX_PDF:
                    raise StoreError("RESTORE_ASSET_MANIFEST_INVALID")
                seen_sha.add(sha)
                expected.add(f["path"])
            if set(names) != expected:
                raise StoreError("RESTORE_EXTRA_OR_MISSING_ENTRIES")
            for entry in entries:
                allowed_size = MAX_MANIFEST if entry.filename == "manifest.json" else MAX_DATABASE if entry.filename == "database/srm.sqlite3" else MAX_PDF
                if entry.file_size > allowed_size:
                    raise StoreError("RESTORE_ENTRY_SIZE_INVALID")
                destination = stage / entry.filename
                destination.parent.mkdir(parents=True, exist_ok=True)
                with archive.open(entry) as reader, destination.open("xb") as writer:
                    for block in iter(lambda: reader.read(1024 * 1024), b""):
                        writer.write(block)
            dbcopy = stage / "database" / "srm.sqlite3"
            if dbcopy.stat().st_size != database["size"] or _hash(dbcopy) != database["sha256"]:
                raise StoreError("RESTORE_DATABASE_HASH_MISMATCH")
            indexed = _db_inventory(dbcopy)
            if indexed != links:
                raise StoreError("RESTORE_DB_MANIFEST_CONFLICT")
            sizes = {f["sha256"]:f["size"] for f in files}
            if set(sizes) != {row["sha256"] for row in indexed}:
                raise StoreError("RESTORE_PDF_SET_MISMATCH")
            for sha,size in sizes.items():
                pdf = stage / "assets" / (sha + ".pdf")
                if pdf.stat().st_size != size or _hash(pdf) != sha:
                    raise StoreError("RESTORE_PDF_HASH_MISMATCH")
        # 中文：以上校验全部通过后才写入空白目标；数据副本先放入最终文件系统。
        # English: Publish verified assets only after complete preflight, then restore the database.
        published = []
        try:
            for sha in sizes:
                final = root / "assets" / sha[:2] / (sha + ".pdf")
                final.parent.mkdir(parents=True, exist_ok=True)
                if final.exists():
                    raise StoreError("RESTORE_TARGET_FILES_CHANGED")
                os.replace(stage / "assets" / (sha + ".pdf"), final)
                published.append(final)
            with closing(sqlite3.connect(dbcopy)) as origin, closing(sqlite3.connect(store.path, timeout=5)) as destination:
                origin.backup(destination)
            if _db_inventory(store.path) != indexed:
                raise StoreError("RESTORE_FINAL_DATABASE_MISMATCH")
        except Exception:
            # 中文：仅删除本次新写入的 PDF；禁止触碰恢复前存在的其他文件。
            # English: Roll back newly published PDFs only; never touch preexisting user files.
            for pdf in published:
                pdf.unlink(missing_ok=True)
            raise
        return {"restored":True,"workspaceCount":_workspace_count(store.path),"pdfCount":len(sizes),
                "assetLinks":len(indexed),"verified":True}
