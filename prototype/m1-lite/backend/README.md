# SRM S2 本机离线数据服务 / SRM S2 Local Offline Data Service

## 当前开发状态 / Current Stage

- S1 SQLite 快照和历史版本已实现；S2 环回 HTTP API、Windows 启动入口、数据库备份与检查页已实现。
- S1 SQLite snapshots/versioning are implemented; S2 loopback API, Windows launcher, database backup and status page are implemented.
- **原业务页面仍使用 IndexedDB 手动保存，尚未改为 SQLite。**
- **The existing business UI still saves manually to IndexedDB; it is not connected to SQLite yet.**
- **不要用于真实采购数据；本阶段只做虚构数据及接口验证。**
- **Do not use real procurement data at this stage; only synthetic integration tests are supported.**
- 不修改 `main`，也不将真实业务数据库、备份和附件写入 Git 仓库。
- Do not change `main` or commit real databases, backups or attachments to Git.

## Windows 本地启动 / Windows Local Launch

1. 在 GitHub 切换到 `draft/20261013-m1-storage-ui-audit` 分支，下载该分支 ZIP 并解压。
1. Switch to `draft/20261013-m1-storage-ui-audit` on GitHub, download the branch ZIP and extract it.
2. 安装 Python 3.10 或更新版本，无需联网安装第三方 Python 包。
2. Install Python 3.10+; no external Python dependencies are required.
3. 双击 `prototype/m1-lite/run_local.bat`，保持启动窗口开启。
3. Double-click `prototype/m1-lite/run_local.bat` and leave the terminal open.
4. 浏览器会打开 `http://127.0.0.1:8765/storage-check`，点击“检查本机服务”和“读取 SQLite 询价索引”。
4. The browser opens `http://127.0.0.1:8765/storage-check`; click “Check service” and “Read SQLite index”.
5. 如需退出，请关闭启动窗口或在终端按 `Ctrl+C`。
5. To stop the server, close its terminal or press `Ctrl+C`.

- 若浏览器没有自动打开，请手动输入 `http://127.0.0.1:8765/storage-check`。
- If the browser does not open, navigate manually to `http://127.0.0.1:8765/storage-check`.
- 本机地址只对当前电脑有效，不是公司服务器地址。
- The loopback URL works only on the current PC; it is not an intranet server address.
- 如 8765 端口已被占用，服务不会在另一个端口悄悄启动，应检查终端错误。
- If port 8765 is occupied, the server does not silently move to another port; inspect the terminal error.
- **已确认现有 JSON/ZIP 与 IndexedDB 均仅为虚构测试数据，无需迁移到新的 SQLite；新数据库从空白开始。**
- **Confirmed: existing JSON/ZIP and IndexedDB are synthetic tests only; no SQLite migration is required. Start clean.**
- 当前旧 `file://` 页面与新的本机 HTTP 页面仍是不同浏览器存储来源；S3 接入之前不得把旧 HTML 误认为已经使用 SQLite。
- The old `file://` page and local HTTP page still use separate browser origins; do not assume the old HTML uses SQLite before S3.

## 数据保存位置 / Data Location

- Windows：`%LOCALAPPDATA%\SRM-Lite\srm.sqlite3`。
- Windows: `%LOCALAPPDATA%\SRM-Lite\srm.sqlite3`.
- S2 数据库备份：`%LOCALAPPDATA%\SRM-Lite\backups\`。
- S2 DB-only backups: `%LOCALAPPDATA%\SRM-Lite\backups\`.
- 当前尚未开发完整附件存储，数据库备份不包含 PDF、邮件、截图等文件。
- Attachment storage is not implemented yet; database backups do not include PDFs, emails or screenshots.
- 这是开发阶段的数据服务目录，不代表完整业务备份或生产安全方案。
- This is a development data location, not a complete business backup or production security policy.

## API 契约 / API Contract

| 方法 / Method | 路径 / Path | 功能 / Purpose |
|---|---|---|
| GET | `/api/health` | 服务状态 / Health check |
| GET | `/api/workspaces` | 仅工作区摘要 / Workspace metadata only |
| GET | `/api/workspaces/{id}` | 当前工作区快照 / Current workspace snapshot |
| GET | `/api/workspaces/{id}?revision=N` | 指定历史版 / Historical snapshot |
| PUT | `/api/workspaces/{id}` | 按期望修订号保存 / Compare-and-swap save |
| POST | `/api/backups/database` | 一致性数据库备份 / Verified DB-only backup |

- PUT 请求格式：`{"workspace": <完整的 M1WorkspaceCore 快照>, "expectedRevision": null 或整数}`。
- PUT body: `{"workspace": <full M1WorkspaceCore snapshot>, "expectedRevision": null or integer}`.
- 新工作区第 1 版传 `null`，已存在工作区更新必须提供实际现存版本；冲突返回 HTTP 409。
- First save sends `null`; updates require the current stored revision and return HTTP 409 on conflict.
- 为阻止跨站网页驱动本机数据接口，修改操作要求同源 `Origin`，API 不启用 CORS。
- To prevent cross-site drives of local APIs, mutations require a same-origin `Origin`; CORS is disabled.
- **服务端目前只有外围状态验证和已确认报价版本保护，深层业务模型验证仍待迁移。**
- **The server currently validates the snapshot envelope and confirmed-quote preservation only; full domain validation is pending.**

## 自动化测试 / Automated Tests

```powershell
cd prototype\m1-lite\backend
py -3 -m unittest -v test_store test_server
```

- 测试检查本机数据库持久化、重新打开、历史版、并发修订冲突、报价历史不可改、无效状态拒绝、HTTP 同源限制、路径安全与数据库备份。
- Tests cover database durability, reopen, historical revisions, revision conflicts, confirmed quote immutability, invalid states, HTTP origin checks, path restrictions and backup.
- 在 Linux/Python 3.13 隔离测试环境中执行 10 项测试通过；Windows 打包安装、真实浏览器和既有 HTML 与 API 接入仍未完成验收。
- Ten tests were previously reported as passing in an isolated environment; Windows packaging and the actual business UI integration remain unverified.

## 接下来的工作 / Next Deliverables

- S3：直接把新版业务页面接入 SQLite API，默认从空白数据库开始；**不开发旧 JSON/ZIP/IndexedDB 测试数据迁移**。
- S3: Wire the new business UI directly to SQLite API and begin with an empty database; **do not build legacy JSON/ZIP/IndexedDB test-data migration**.
- S4：原始图纸、报价邮件、截图等附件按哈希管理，并完成可校验的全量备份与恢复。
- S4: Hash-manage drawings, quote emails and screenshots with verified full backup/restore.
- S5：重新设计 UI 导航、页面布局与交互，确保采购员可直接上手。
- S5: Redesign navigation, page layout and buyer-facing interaction.
