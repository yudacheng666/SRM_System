# SRM S3 离线 SQLite 原型 / SRM S3 Offline SQLite Prototype

## 已实现范围 / Implemented Scope

- 在单台 Windows 电脑离线运行，浏览器通过本机 `http://127.0.0.1:8765` 打开完整 M1-Lite 业务页面。
- Run the complete M1-Lite business UI offline on one Windows PC at `http://127.0.0.1:8765`.
- 询价数据不再写入浏览器 IndexedDB；通过本机 HTTP API 读写 SQLite，支持多笔询价、历史切换及版本冲突保护。
- Business data no longer uses browser IndexedDB; loopback API persists SQLite workspaces, RFQ selection and revision checks.
- PDF 图纸原件写入本机独立目录，并用 SHA-256 校验；关联关系存入业务快照。
- PDF originals persist in a separate local directory with SHA-256 validation; their relationships remain in workspace snapshots.
- 仍采用 **手动点击“保存到本机”**，尚未开发自动保存。
- **Manual “Save to this computer” is still required**; autosave has not been implemented.
- 报价邮件、截图等非图纸凭证，完整备份恢复，以及新 UI 设计仍在后续阶段。
- Non-drawing evidence files, verified full backup/restore, and redesigned UI remain future work.
- 旧 IndexedDB、JSON、ZIP 全部是可丢弃的测试数据；本版直接创建空白 SQLite，无迁移程序。
- Old browser records, JSON and ZIP contain disposable tests; start fresh in SQLite without migration.
- 所有源代码、示例和测试文件均为虚构信息，真实业务数据切勿提交 GitHub。
- Source code, samples and tests use synthetic information; never commit real business data to GitHub.

## Windows 本机启动 / Windows Launch

1. 下载 `draft/20261013-m1-storage-ui-audit` 分支的 ZIP 并解压。
1. Download and extract the ZIP from branch `draft/20261013-m1-storage-ui-audit`.
2. 安装 Python 3.10+（如果电脑尚未安装），无需另外安装 Python 第三方库或 SQLite 软件。
2. Install Python 3.10+ if missing; no third-party Python libraries or separate SQLite install are needed.
3. 双击 `prototype/m1-lite/run_local.bat`，保持启动的命令行窗口开启。
3. Double-click `prototype/m1-lite/run_local.bat`; leave the terminal open.
4. 浏览器打开 `http://127.0.0.1:8765/`；若未自动打开，请手动输入网址。
4. Open `http://127.0.0.1:8765/` in the browser if not launched automatically.
5. 点击“新建空白正式工作” → 导入虚构物料和供应商 → 点击“保存到本机” → 再上传 PDF。
5. Create a fresh buyer workspace, add synthetic items/suppliers, save first, then upload PDFs.
6. 关闭浏览器再打开，或重启程序，验证已保存的询价及 PDF 是否可恢复。
6. Reopen the browser or restart the service to verify workspace and PDF persistence.
7. 如需停止程序，在命令行按 `Ctrl+C`；退出后 SQLite 数据仍保留。
7. Stop with `Ctrl+C`; SQLite data persists across service restarts.

## 硬盘位置 / Disk Location

- SQLite 数据库：`%LOCALAPPDATA%\SRM-Lite\srm.sqlite3`
- SQLite database: `%LOCALAPPDATA%\SRM-Lite\srm.sqlite3`
- PDF 图纸原件：`%LOCALAPPDATA%\SRM-Lite\assets\`
- PDF originals: `%LOCALAPPDATA%\SRM-Lite\assets\`
- 单独数据库备份：`%LOCALAPPDATA%\SRM-Lite\backups\`
- Database-only backups: `%LOCALAPPDATA%\SRM-Lite\backups\`
- 代码目录与数据库目录互相分离；重新下载代码不会自动删除已写入数据库。
- Source files and runtime data are separate; refreshing code does not erase the database.
- API 的 SQLite 单独备份不包含 PDF；页面中“导出询价及 PDF 原件 ZIP”是数据导出，**当前尚无与之对应的 SQLite 恢复功能**。
- API SQLite backups exclude PDFs; the UI’s PDF ZIP is an export, **not yet a complete SQLite restore solution**.

## 验收边界 / Acceptance Boundary

- 当前 S3 是候选开发版，尚未完成完整 Windows 浏览器端到端验收，不用于正式采购记录。
- S3 is a development candidate, not yet fully acceptance-tested on Windows and not ready for official purchasing data.
- 测试数据使用虚构物料编码、供应商和报价，不需要迁移既有样例。
- Use synthetic item IDs, suppliers, and quotes; no legacy fixture migration is required.
- 旧版 HTML 直接双击 `file://` 已不再支持业务持久化；必须通过本机启动服务访问。
- Direct `file://` use no longer supports business persistence; access through the local server.
- 断开或停止本机服务，业务操作必须报错，不能假装已保存，更不能退回浏览器数据库。
- If the local API stops, writes must fail visibly rather than pretend to save or fall back to browser storage.
- 新询价需先成功保存一次，之后才允许将图纸 PDF 存入硬盘。
- A new workspace must be saved once before original PDFs can be uploaded.

## API / API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | 本机服务状态 / Service health |
| GET | `/api/active` | 活动询价 / Active RFQ |
| GET | `/api/workspaces` | 询价列表 / Workspace index |
| GET | `/api/workspaces/{id}` | 工作区快照 / Snapshot |
| GET | `/api/workspaces/{id}?revision=N` | 历史版本 / Historical revision |
| PUT | `/api/workspaces/{id}` | 版本化保存 / Conditional save |
| POST | `/api/active/select` | 切换活动询价 / Switch active RFQ |
| PUT | `/api/assets/{workspaceId}/{sha256}` | 写入 PDF 原件 / Store PDF |
| GET | `/api/assets/{workspaceId}/{sha256}` | 校验读取 PDF / Read PDF |
| POST | `/api/backups/database` | SQLite 单独备份 / DB-only backup |

- 修改类接口要求合法的同源 `Origin`，服务仅监听 `127.0.0.1`，不提供公司内网共享。
- Mutation APIs require a same-origin `Origin`; listener binds only to `127.0.0.1`, not the company LAN.
- 深层服务端业务规则校验仍需补足；现阶段保留原页面的 `M1WorkspaceCore` 校验和后端已确认报价保护。
- Full server-side domain validation remains future work; existing `M1WorkspaceCore` checks and confirmed quote protection apply.

## 单元/接口测试 / Unit and API Tests

```powershell
cd prototype\m1-lite\backend
py -3 -m unittest -v test_store test_server
```

- 测试文件包含 SQLite 读写、冲突保护、已确认报价不可变、历史切换、HTTP 同源控制、PDF 真正落盘以及校验值错误拒绝。
- Tests cover SQLite durability, conflicts, confirmed quotes, active selection, HTTP origin restrictions, PDF disk persistence, and bad-checksum rejection.
- 下一阶段将继续补齐本机 Windows 浏览器操作验收、自动保存、原始报价附件、完整备份恢复和统一 UI 设计。
- Next tasks are Windows browser acceptance, autosave, original quote evidence, full backup/restore, and unified UI design.
