# M1 Lite 本机运行与测试 / M1 Lite local runtime and tests

## 用途与边界 / Purpose and boundary

M1 Lite 是单用户 Windows 本机询比价应用。浏览器页面由 Python 服务提供，业务快照和历史版本保存在 SQLite，登记的 PDF 图纸单独存储。
M1 Lite is a single-user local procurement application. A Python service hosts the browser UI; SQLite stores workspace snapshots and revisions, while registered PDF drawings are stored separately.

当前不是公司服务器部署、多用户服务或 ERP 替代系统。原始邮件、聊天截图等报价凭证的文件化归档尚未实现。
This is not a company-server deployment, multi-user service or ERP replacement. File-based archiving of original quotation emails and chat screenshots is not implemented.

## Windows 启动 / Windows launch

1. 安装 Python 3.10 或更新版本；日常运行不需要 Node.js。
1. Install Python 3.10 or later; Node.js is not required for daily use.
2. 双击 `prototype/m1-lite/run_local.bat`，保持命令行窗口运行。
2. Double-click `prototype/m1-lite/run_local.bat` and keep its terminal open.
3. 浏览器打开 `http://127.0.0.1:8765/`。
3. Open `http://127.0.0.1:8765/` in the browser.
4. 正常退出时在命令行按 `Ctrl+C`。
4. Stop the server with `Ctrl+C`.

启动脚本会相对自身定位 `backend/server.py`，并优先检查可用的 Python 3.10+。不要直接双击 `index.html`；业务持久化依赖本机服务。
The launcher resolves `backend/server.py` relative to itself and checks for a working Python 3.10+. Do not open `index.html` directly; business persistence requires the local service.

## 数据目录 / Data directory

默认 Windows 数据目录：`%LOCALAPPDATA%\SRM-Lite\`。设置环境变量 `SRM_DATA_DIR` 可为测试或隔离恢复指定独立目录。
Default Windows data root: `%LOCALAPPDATA%\SRM-Lite\`. Set `SRM_DATA_DIR` to use an isolated test or restore directory.

| 数据 | 路径 |
|---|---|
| SQLite | `srm.sqlite3` |
| PDF 原件 | `assets/` |
| 完整手动 ZIP | `backups/full/` |
| 自动完整 ZIP | `backups/auto/` |
| SQLite 单独备份 | `backups/` |

源码更新不会自动删除该数据目录。切勿把数据库、PDF 原件或备份 ZIP 放入 Git 仓库。
Updating source code does not automatically delete this data root. Never place databases, original PDFs or backup ZIPs in the Git repository.

## 数据安全 / Data safety

- SQLite 使用事务和修订号冲突检查；服务未确认成功时，界面不得显示保存成功。
- SQLite writes use transactions and revision-conflict checks; the UI must not report success before server confirmation.
- PDF 原件按内容哈希保存；供应商资料包只包含对应供应商的询价 Excel 和关联 PDF，保留原始 PDF 文件名。
- PDF originals are content-hash stored; supplier packages contain only that supplier's RFQ workbook and linked PDFs, preserving original PDF filenames.
- S4 完整 ZIP 包含 SQLite、清单及已登记 PDF；恢复前验证文件集合、数据库完整性和 SHA-256。
- S4 full ZIP contains SQLite, a manifest and registered PDFs; restore verifies the file set, database integrity and SHA-256 hashes.
- 完整恢复仅允许目标数据目录为空；已有工作区或 PDF 时拒绝恢复，不覆盖、不合并。
- Full restore is allowed only into an empty data root; existing workspaces or PDFs cause rejection, never overwrite or merge.
- 完整 ZIP 限制：单 PDF 12 MiB、数据库 128 MiB、ZIP 512 MiB、最多 2,000 个不同 PDF。
- Full archive limits: 12 MiB per PDF, 128 MiB database, 512 MiB ZIP and up to 2,000 distinct PDFs.
- 自动完整备份仅在数据变化且达到 24 小时间隔时创建，正常情况下保留最近 7 份；手动备份不由自动保留任务清理。
- Automatic full backups are created only after data changes and when the 24-hour interval is due; normally the newest seven are retained, while manual backups are not pruned.
- 服务默认只监听 `127.0.0.1`，并校验 Host/Origin；不是局域网共享服务。
- The service binds to `127.0.0.1` and validates Host/Origin; it is not a LAN-shared service.

## 主要 API / Main API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | 服务健康状态 / Health |
| GET | `/api/active` | 当前活动询价 / Active workspace |
| GET | `/api/workspaces` | 询价列表 / Workspace index |
| GET | `/api/workspaces/{id}` | 当前快照 / Current snapshot |
| GET | `/api/workspaces/{id}?revision=N` | 历史版本 / Historical revision |
| PUT | `/api/workspaces/{id}` | 条件保存 / Conditional save |
| POST | `/api/active/select` | 切换活动询价 / Select active workspace |
| GET/PUT | `/api/assets/{workspaceId}/{sha256}` | 读取/保存 PDF / Read or store PDF |
| POST | `/api/backups/full` | 创建 SQLite + PDF 完整备份 / Create full backup |
| GET | `/api/backups/full/{filename}` | 下载完整备份 / Download full backup |
| POST | `/api/backups/full/restore` | 空目录完整恢复 / Restore into empty root |
| GET | `/api/backups/auto/status` | 自动备份状态 / Automatic backup status |
| POST | `/api/backups/database` | SQLite 单独备份 / Database-only backup |

## 自动化测试 / Automated tests

在仓库根目录运行。日常使用不需要安装这些开发依赖。
Run from the repository root. These development dependencies are not required for daily use.

```powershell
npm ci
python -m unittest discover -v -s prototype/m1-lite/backend -p "test_*.py"
npm test
npm run test:e2e
```

- Python 测试覆盖 SQLite、历史修订、冲突、HTTP 安全、PDF 和备份恢复。
- Python tests cover SQLite, revision history, conflicts, HTTP security, PDFs and backup/restore.
- Node 测试覆盖报价/业务规则、自动保存规则及供应商资料包。
- Node tests cover quotation/business rules, autosave rules and supplier packages.
- Playwright 使用独立临时数据目录和真实本机服务；禁止指向使用者默认数据目录。
- Playwright uses isolated temporary data roots and the real local service; never point tests at the user's default data.
- 以 GitHub Actions 的准确 SHA 运行记录为 CI 结论依据。
- Exact-SHA GitHub Actions runs are the source of truth for CI results.
