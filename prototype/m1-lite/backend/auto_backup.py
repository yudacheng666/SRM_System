"""中文：本地 SRM 自动完整备份与数量保留。English: Scheduled, bounded full backup retention."""
from __future__ import annotations

import hashlib
import secrets
import json
import sqlite3
import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from time import time
from typing import Any

from backup_bundle import (FORMAT, VERSION, MAX_ARCHIVE, MAX_DATABASE, MAX_FILES, MAX_MANIFEST,
                           MAX_PDF, HASH, _db_inventory, create)
from store import SnapshotStore, StoreError

DAY_SECONDS = 24 * 60 * 60
KEEP_ARCHIVES = 7


def _verified_asset_links(path: Path) -> list[dict]:
    """中文：校验上一份 ZIP 全部条目与 SHA，而非相信文件存在即可恢复。
    English: Validate all entries and hashes of the prior full ZIP, not just its existence.
    """
    if not path.is_file() or path.stat().st_size > MAX_ARCHIVE:
        raise StoreError("AUTO_BACKUP_ARCHIVE_SIZE")
    with zipfile.ZipFile(path) as archive:
        entries = archive.infolist()
        names = [entry.filename for entry in entries]
        if len(names) != len(set(names)) or len(names) > MAX_FILES + 2:
            raise StoreError("AUTO_BACKUP_INVALID_ENTRIES")
        if "manifest.json" not in names or "database/srm.sqlite3" not in names:
            raise StoreError("AUTO_BACKUP_MISSING_MANIFEST_OR_DATABASE")
        if any(entry.is_dir() or entry.flag_bits & 1 or entry.compress_type != zipfile.ZIP_STORED
               for entry in entries):
            raise StoreError("AUTO_BACKUP_UNSUPPORTED_ZIP")
        if sum(entry.file_size for entry in entries) > MAX_ARCHIVE:
            raise StoreError("AUTO_BACKUP_EXPANSION_LIMIT")
        if archive.getinfo("manifest.json").file_size > MAX_MANIFEST:
            raise StoreError("AUTO_BACKUP_MANIFEST_TOO_LARGE")
        manifest = json.loads(archive.read("manifest.json").decode("utf-8"))
        # 中文：bool 是 int 的子类；格式版本只允许真正的整数 1。
        # English: Python True == 1, so require exact int to reject boolean versions.
        if (not isinstance(manifest, dict) or manifest.get("format") != FORMAT
                or type(manifest.get("version")) is not int or manifest["version"] != VERSION):
            raise StoreError("AUTO_BACKUP_MANIFEST_FORMAT")
        db = manifest.get("database")
        files = manifest.get("assets")
        links = manifest.get("assetLinks")
        if (not isinstance(db, dict) or db.get("path") != "database/srm.sqlite3"
                or not isinstance(db.get("sha256"), str) or not HASH.fullmatch(db["sha256"])
                or type(db.get("size")) is not int or not 0 < db["size"] <= MAX_DATABASE
                or not isinstance(files, list) or len(files) > MAX_FILES
                or not isinstance(links, list) or len(links) > MAX_FILES * 16):
            raise StoreError("AUTO_BACKUP_MANIFEST_SCHEMA")
        checks = {"database/srm.sqlite3": (db["size"], db["sha256"])}
        for item in files:
            if not isinstance(item, dict):
                raise StoreError("AUTO_BACKUP_ASSET_SCHEMA")
            sha = item.get("sha256")
            size = item.get("size")
            if (not isinstance(sha, str) or not HASH.fullmatch(sha)
                    or item.get("path") != f"assets/{sha}.pdf"
                    or type(size) is not int or not 0 < size <= MAX_PDF
                    or item["path"] in checks):
                raise StoreError("AUTO_BACKUP_ASSET_SCHEMA")
            checks[item["path"]] = (size, sha)
        if set(names) != set(checks) | {"manifest.json"}:
            raise StoreError("AUTO_BACKUP_UNEXPECTED_OR_MISSING_ASSETS")
        file_sizes = {item["sha256"]: item["size"] for item in files}
        for link in links:
            if (not isinstance(link, dict) or link.get("sha256") not in file_sizes
                    or link.get("size") != file_sizes[link["sha256"]]
                    or not isinstance(link.get("workspaceId"), str)
                    or not isinstance(link.get("name"), str)):
                raise StoreError("AUTO_BACKUP_ASSET_LINK_INVALID")
        for filename, (size, expected_sha) in checks.items():
            info = archive.getinfo(filename)
            if info.file_size != size:
                raise StoreError("AUTO_BACKUP_FILE_SIZE_MISMATCH")
            digest = hashlib.sha256()
            with archive.open(info) as stream:
                for block in iter(lambda: stream.read(1024 * 1024), b""):
                    digest.update(block)
            if digest.hexdigest() != expected_sha:
                raise StoreError("AUTO_BACKUP_FILE_HASH_MISMATCH")

        # 中文：哈希自洽不等于 SQLite 可以恢复；复用 S4 恢复时的数据库结构和历史校验。
        # English: Matching manifest hashes do not prove SQLite recoverability.
        # Reuse the same schema, integrity and history validation as S4 restore.
        with tempfile.TemporaryDirectory(prefix=".srm-auto-verify-") as temporary:
            database_path = Path(temporary) / "srm.sqlite3"
            with archive.open("database/srm.sqlite3") as source, database_path.open("xb") as sink:
                remaining = db["size"]
                for chunk in iter(lambda: source.read(min(1024 * 1024, max(remaining, 1))), b""):
                    remaining -= len(chunk)
                    if remaining < 0:
                        raise StoreError("AUTO_BACKUP_DATABASE_OVERFLOW")
                    sink.write(chunk)
            if remaining != 0:
                raise StoreError("AUTO_BACKUP_DATABASE_TRUNCATED")
            indexed = _db_inventory(database_path)
        if indexed != links:
            raise StoreError("AUTO_BACKUP_DATABASE_ASSET_LINK_MISMATCH")
        if set(file_sizes) != {row["sha256"] for row in indexed}:
            raise StoreError("AUTO_BACKUP_DATABASE_PDF_SET_MISMATCH")
        return links


def run_if_due(store: SnapshotStore, *, now: float | None = None,
               minimum_interval: int = DAY_SECONDS, keep: int = KEEP_ARCHIVES) -> dict[str, Any]:
    """中文：只在内容变更且到期时保存，不清理用户手动备份。English: Changed-and-due backups only."""
    if minimum_interval < 0 or keep < 1:
        raise ValueError("Invalid automatic backup policy")
    moment = time() if now is None else now
    folder: Path = store.path.parent / "backups" / "auto"
    with store._connect() as db:
        latest = db.execute("SELECT MAX(updated_at),COUNT(*) FROM workspaces").fetchone()
    if not latest[1]:
        return {"created": False, "reason": "NO_SAVED_RFQS"}
    existing = sorted(folder.glob("SRM_FULL_*.zip"), key=lambda p: p.stat().st_mtime, reverse=True) if folder.exists() else []
    warning = None
    if existing:
        newest = existing[0].stat().st_mtime
        if moment - newest < minimum_interval:
            return {"created": False, "reason": "NOT_DUE", "nextAfter": newest + minimum_interval}
        # 中文：只有已完整验证的历史备份，才能用于“没有变化”的判断。
        # English: A prior archive can suppress a backup only after full integrity checks.
        try:
            previous_links = _verified_asset_links(existing[0])
        except (StoreError, OSError, ValueError, TypeError, KeyError, UnicodeError,
                EOFError, RuntimeError, sqlite3.DatabaseError, zipfile.BadZipFile) as exc:
            warning = "Previous automatic ZIP is unreadable or corrupt: " + str(exc)
            # 中文：旧文件一律保留，不静默删除或覆盖；必须另建完整新备份。
            # English: Preserve the damaged file and all older backups; create a fresh ZIP.
        else:
            changed_at = datetime.fromisoformat(latest[0]).astimezone(timezone.utc).timestamp()
            if changed_at <= newest:
                # 中文：PDF 登记独立于业务快照；单独上传图纸也需要到期备份。
                # English: PDF-only changes are independent of workspace updated_at.
                with store._connect() as db:
                    links = [{"workspaceId": wid, "sha256": sha, "name": name, "size": size}
                             for wid, sha, name, size in db.execute(
                                 "SELECT workspace_id,sha256,original_name,size FROM assets ORDER BY workspace_id,sha256")]
                if links == previous_links:
                    return {"created": False, "reason": "UNCHANGED"}
    stamp = datetime.fromtimestamp(moment).strftime("%Y%m%d_%H%M%S")
    target = folder / f"SRM_FULL_{stamp}_{secrets.token_hex(4)}.zip"
    # 中文：只有完整创建及检验成功后才执行保留清理。
    # English: Retention runs only after fully validated backup creation.
    created = create(store, target)
    old = sorted(folder.glob("SRM_FULL_*.zip"), key=lambda p: p.stat().st_mtime, reverse=True)
    removed = 0
    if warning is None:
        # 中文：校验与创建均正常时才执行既定七份保留清理。
        # English: Normal retention only after a clean preflight and successful creation.
        for path in old[keep:]:
            path.unlink()
            removed += 1
    # 中文：如果发现损坏，安全优先，暂时允许超过七份，等待人工处理异常备份。
    # English: During corruption, temporarily exceed seven copies rather than delete evidence.
    return {"created": True, "backup": created, "retained": len(old)-removed,
            "removed": removed, "warning": warning}
