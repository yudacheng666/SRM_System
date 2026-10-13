# SRM M1-Lite SQLite 核心 / SRM M1-Lite SQLite Core

- 当前模块是独立的 S1 基础设施，不与现有 `index.html` 绑定；现有页面仍使用 IndexedDB 手动保存。
- This is an isolated S1 storage foundation, not yet connected to `index.html`; the existing UI still saves manually to IndexedDB.
- 不要在此阶段使用真实采购数据测试；示例和测试数据均为虚构。
- Do not test this stage with real procurement data; samples and tests use synthetic values only.
- 使用 Python 3.10+ 标准库，无第三方依赖。
- Uses Python 3.10+ standard library without third-party packages.

## 测试 / Tests

```powershell
cd prototype/m1-lite/backend
python -m unittest -v test_store
```

- `store.py` 提供 `SnapshotStore(path)`、`save(snapshot, expected_revision)`、`get(id, revision)`、`list_workspaces()` 和 `backup(destination)`。
- `store.py` exposes `SnapshotStore(path)`, `save(snapshot, expected_revision)`, `get(id, revision)`, `list_workspaces()`, and `backup(destination)`.
- 数据库默认路径由调用方提供；将来本机服务应将路径设在用户数据目录，而不是 Git 工作区。
- The caller supplies a DB path; the upcoming local service should use a user data directory, not the Git checkout.
- 新建已提交快照的修订号为 `1`、期望修订为 `None`；更新时提供数据库现有修订号。
- A new committed snapshot uses revision `1` with expected revision `None`; updates must send the current stored revision.
- 历史版本只追加；版本号冲突直接拒绝覆盖。
- Historical revisions are append-only and mismatches reject overwrite.
- `backup()` 仅备份 SQLite 业务数据；**不包含任何图纸或原始报价附件**。
- `backup()` backs up SQLite business data only; **it does not include drawings or original quote evidence**.
- 完整业务规则目前仍由 `M1WorkspaceCore.validate` 校验；本模块只检查快照外围字段，未来 API 阶段需补齐服务端业务校验。
- The frontend domain model still owns deep validation; this module checks only the snapshot envelope, and the API stage must add server-side domain validation.
- 未实现 HTTP API、前端自动保存、旧 JSON/ZIP 迁移及附件独立落盘。
- HTTP API, frontend autosave, legacy JSON/ZIP migration, and native asset storage are not implemented yet.
