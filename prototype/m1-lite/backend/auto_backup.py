"""中文：本地 SRM 自动完整备份与数量保留。English: Scheduled, bounded full backup retention."""
from __future__ import annotations

import secrets
from datetime import datetime, timezone
from pathlib import Path
from time import time
from typing import Any

from backup_bundle import create
from store import SnapshotStore, StoreError

DAY_SECONDS = 24 * 60 * 60
KEEP_ARCHIVES = 7


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
    if existing:
        newest = existing[0].stat().st_mtime
        if moment - newest < minimum_interval:
            return {"created": False, "reason": "NOT_DUE", "nextAfter": newest + minimum_interval}
        changed_at = datetime.fromisoformat(latest[0]).astimezone(timezone.utc).timestamp()
        if changed_at <= newest:
            return {"created": False, "reason": "UNCHANGED"}
    stamp = datetime.fromtimestamp(moment).strftime("%Y%m%d_%H%M%S")
    target = folder / f"SRM_FULL_{stamp}_{secrets.token_hex(4)}.zip"
    # 中文：只有完整创建及检验成功后才执行保留清理。
    # English: Retention runs only after fully validated backup creation.
    created = create(store, target)
    old = sorted(folder.glob("SRM_FULL_*.zip"), key=lambda p: p.stat().st_mtime, reverse=True)
    removed = 0
    for path in old[keep:]:
        path.unlink()
        removed += 1
    return {"created": True, "backup": created, "retained": min(keep, len(old)),
            "removed": removed}
