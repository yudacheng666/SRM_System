"""中文：SRM 离线原型的 SQLite 快照存储基础。English: Offline SRM SQLite snapshot foundation."""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager, closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class StoreError(Exception):
    """中文：拒绝不合法的数据操作。English: Rejected storage operation."""


class RevisionConflict(StoreError):
    """中文：现有修订版与期望版不一致。English: Optimistic revision mismatch."""


def _validate(snapshot: dict[str, Any]) -> str:
    """中文：校验外围存储契约；完整业务规则仍由前端领域模型校验。English: Validate storage envelope."""
    if not isinstance(snapshot, dict) or snapshot.get("format") != "srm-workspace":
        raise StoreError("Invalid workspace format")
    if snapshot.get("schemaVersion") != 1 or snapshot.get("origin") != "buyer":
        raise StoreError("Unsupported schema or non-buyer workspace")
    identity = snapshot.get("workspaceId")
    if not isinstance(identity, str) or not identity or identity.strip() != identity or len(identity) > 180:
        raise StoreError("Invalid workspace ID")
    revision = snapshot.get("revision")
    if type(revision) is not int or revision < 1:
        raise StoreError("Committed revision must be positive")
    state = snapshot.get("state")
    if not isinstance(state, dict):
        raise StoreError("Missing workspace state")
    required = ("items", "suppliers", "assignments", "quoteRounds", "awards",
                "awardReasons", "manualAwards", "awardReviewIds", "supplierPool",
                "selectedCompareSuppliers", "customFields")
    if any(not isinstance(state.get(field), list) for field in required):
        raise StoreError("Incomplete workspace state")
    if any(type(state.get(key)) is not int or state[key] < 0 for key in ("lineSeq", "createdSeq")):
        raise StoreError("Invalid workspace sequence")
    if state.get("quoteComparisonMode") not in ("returned",):
        raise StoreError("Invalid business quotation mode")
    return identity


class SnapshotStore:
    """中文：显式提交快照、保存全部历史版、提供一致性数据库备份。English: Versioned atomic snapshots and backups."""

    def __init__(self, db_path: str | Path):
        self.path = Path(db_path).expanduser().resolve()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.executescript("""
                CREATE TABLE IF NOT EXISTS workspaces (
                    workspace_id TEXT PRIMARY KEY,
                    revision INTEGER NOT NULL,
                    snapshot_json TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS app_state (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS workspace_versions (
                    workspace_id TEXT NOT NULL,
                    revision INTEGER NOT NULL,
                    snapshot_json TEXT NOT NULL,
                    committed_at TEXT NOT NULL,
                    PRIMARY KEY (workspace_id, revision),
                    FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id)
                );
            """)

    @contextmanager
    def _connect(self):
        connection = sqlite3.connect(self.path, timeout=5)
        connection.execute("PRAGMA busy_timeout = 5000")
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("PRAGMA journal_mode = WAL")
        connection.execute("PRAGMA synchronous = FULL")
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def save(self, snapshot: dict[str, Any], expected_revision: int | None = None) -> int:
        """中文：必须匹配现有修订；新工作空间要求版本 1。English: Compare-and-swap with immutable revisions."""
        identity = _validate(snapshot)
        payload = json.dumps(snapshot, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
        if len(payload.encode("utf-8")) > 16 * 1024 * 1024:
            raise StoreError("Workspace exceeds 16 MiB")
        now = datetime.now(timezone.utc).isoformat()
        with self._connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            row = connection.execute("SELECT revision, snapshot_json FROM workspaces WHERE workspace_id = ?", (identity,)).fetchone()
            current = row[0] if row else None
            if current != expected_revision or snapshot["revision"] != (current or 0) + 1:
                raise RevisionConflict("Workspace revision changed; refusing overwrite")
            if row is not None:
                previous = json.loads(row[1])
                # 中文：已确认报价不能通过新接口被静默改写或删除。
                # English: Never overwrite or remove confirmed quote rounds without an explicit workflow.
                old_rounds = (r for r in previous["state"]["quoteRounds"] if r.get("status") == "confirmed")
                current_rounds = snapshot["state"]["quoteRounds"]
                for old in old_rounds:
                    key = (old.get("supplierId"), old.get("roundNo"), old.get("revisionNo"))
                    if not any((r.get("supplierId"), r.get("roundNo"), r.get("revisionNo")) == key
                               and r == old for r in current_rounds):
                        raise StoreError("Confirmed quotation history cannot be modified")
            if current is None:
                connection.execute(
                    "INSERT INTO workspaces VALUES (?, ?, ?, ?)",
                    (identity, snapshot["revision"], payload, now),
                )
            else:
                connection.execute(
                    "UPDATE workspaces SET revision = ?, snapshot_json = ?, updated_at = ? WHERE workspace_id = ?",
                    (snapshot["revision"], payload, now, identity),
                )
            connection.execute(
                "INSERT INTO workspace_versions VALUES (?, ?, ?, ?)",
                (identity, snapshot["revision"], payload, now),
            )
            if current is None:
                connection.execute(
                    "INSERT INTO app_state(key,value) VALUES ('active_workspace',?) "
                    "ON CONFLICT(key) DO UPDATE SET value=excluded.value", (identity,)
                )
        return snapshot["revision"]

    def get(self, workspace_id: str, revision: int | None = None) -> dict[str, Any] | None:
        """中文：读取当前版本或某一历史版本。English: Read current or historical snapshot."""
        if not isinstance(workspace_id, str) or not workspace_id:
            raise StoreError("Invalid workspace ID")
        table = "workspaces" if revision is None else "workspace_versions"
        query = f"SELECT snapshot_json FROM {table} WHERE workspace_id = ?"
        params: tuple[Any, ...] = (workspace_id,)
        if revision is not None:
            query += " AND revision = ?"
            params += (revision,)
        with self._connect() as connection:
            row = connection.execute(query, params).fetchone()
        return json.loads(row[0]) if row else None

    def active_id(self) -> str | None:
        """中文：返回当前询价索引，不读取整个列表。English: Return active RFQ ID."""
        with self._connect() as connection:
            row = connection.execute("SELECT value FROM app_state WHERE key='active_workspace'").fetchone()
        return row[0] if row else None

    def active(self) -> dict[str, Any] | None:
        """中文：读取活动询价。English: Load the active RFQ."""
        identity = self.active_id()
        return self.get(identity) if identity else None

    def select(self, identity: str, expected_active: str | None) -> None:
        """中文：显式切换询价，拒绝旧页面改变其他窗口的活动项。English: Guard active selection."""
        with self._connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            row = connection.execute("SELECT value FROM app_state WHERE key='active_workspace'").fetchone()
            old = row[0] if row else None
            if old != expected_active:
                raise RevisionConflict("Active RFQ changed in another window")
            exists = connection.execute("SELECT 1 FROM workspaces WHERE workspace_id=?", (identity,)).fetchone()
            if not exists:
                raise StoreError("RFQ does not exist")
            connection.execute("INSERT INTO app_state(key,value) VALUES ('active_workspace',?) "
                               "ON CONFLICT(key) DO UPDATE SET value=excluded.value", (identity,))

    def list_workspaces(self) -> list[dict[str, Any]]:
        """中文：只返回索引元数据而非整份询价。English: Return metadata only."""
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT workspace_id, revision, updated_at FROM workspaces ORDER BY updated_at DESC, workspace_id"
            ).fetchall()
        return [{"workspaceId": x[0], "revision": x[1], "updatedAt": x[2]} for x in rows]

    def backup(self, destination: str | Path) -> Path:
        """中文：使用 SQLite Backup API 导出一致性副本并校验。English: Consistent verified backup."""
        target = Path(destination).expanduser().resolve()
        if target == self.path:
            raise StoreError("Backup destination must differ from active database")
        if target.exists():
            raise StoreError("Backup already exists; refusing overwrite")
        target.parent.mkdir(parents=True, exist_ok=True)
        try:
            with self._connect() as source, closing(sqlite3.connect(target)) as backup_connection:
                source.backup(backup_connection)
                result = backup_connection.execute("PRAGMA integrity_check").fetchone()[0]
                if result != "ok":
                    raise StoreError("Backup integrity check failed")
        except Exception:
            target.unlink(missing_ok=True)
            raise
        return target
