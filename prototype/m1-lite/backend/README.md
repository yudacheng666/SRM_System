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

## S3 工程收尾更新（2026-10-14） / S3 Engineering Follow-up (2026-10-14)

- Windows 启动脚本 `run_local.bat` 已改为纯 ASCII、按脚本位置解析完整 `backend\\server.py` 路径，并检测可用的 Python 3.10+；仍需 Windows 本机双击复测。
- The Windows launcher is now ASCII-only, resolves the absolute backend path relative to itself and checks for usable Python 3.10+; a real Windows double-click retest remains pending.
- 供应商外发 ZIP 只包含独立 Excel 与原文件名 PDF，不再含图纸关联 JSON；用户已实际复测通过。
- Supplier-facing ZIP now contains scoped XLSX and original-name PDFs without a drawing JSON manifest; buyer retest passed.
- 已新增临时数据库异常回归测试 `test_s3_regression.py`、供应商 ZIP 测试 `../tests/supplier_package.test.cjs` 及开发分支 Windows CI 流程。
- Added temporary-database failure-path tests, supplier ZIP tests and a Windows CI workflow for the development branch.
- 当前 SQLite 单独备份可执行数据库一致性检查，但**不包含原始 PDF**；页面的完整 ZIP 导出有校验和解包基础函数，**尚未实现回写 SQLite 及附件的经验证完整恢复流程**。
- SQLite database backup is consistency-checked but **excludes original PDFs**. The browser ZIP exporter and validation helpers exist, but there is **no verified, atomic import restoring SQLite and attachments**.
- 当前仍为手动保存；不承诺自动保存、系统级一键恢复或面向正式业务的可靠性。
- Saving remains manual; neither autosave, one-click full restore nor production-grade reliability is claimed.

### 新增测试运行方式 / Run Expanded Regression Suite

```powershell
cd prototype\m1-lite
python -m unittest discover -v -s backend -p "test_*.py"
node --test tests/supplier_package.test.cjs
```

- 运行 Python 测试需要 Python 3.10+；运行供应商 ZIP 测试需要 Node.js 20+，日常使用 SRM 不需要安装 Node.js。
- Python tests require Python 3.10+; supplier ZIP tests require Node.js 20+, but daily SRM use does not require Node.js.
- GitHub Actions 工作流文件：`.github/workflows/srm-s3-regression.yml`；只有出现成功的工作流记录才能算云端自动测试通过。
- The GitHub Actions workflow lives at `.github/workflows/srm-s3-regression.yml`; cloud execution must be confirmed by a successful workflow run before claiming the CI passed.
- 本机当前已打开的服务需先按 `Ctrl+C` 停止，替换 `run_local.bat` 后才能测试新脚本；修改源码不会清理 `%LOCALAPPDATA%\\SRM-Lite` 下的数据。
- Stop the currently running server with `Ctrl+C`, replace `run_local.bat` and retest; source updates do not erase data under `%LOCALAPPDATA%\\SRM-Lite`.

## S4: SQLite + PDF 完整备份恢复候选 / S4 Full SQLite + PDF Backup and Restore Candidate

- 新增可下载的 S4 完整 ZIP，包含 SQLite **当前询价、全部历史版本、关联关系**，以及资产表登记的所有原始 PDF。
- A downloadable S4 ZIP contains SQLite **current RFQs, all committed history, relationships**, and all registered original PDFs.
- 和仅导出业务 JSON 的旧功能不同，S4 ZIP 内含真正的 SQLite 数据库文件及内容寻址 PDF。
- Unlike legacy JSON exports, an S4 ZIP includes the actual SQLite backup and content-addressed PDF originals.
- 备份时使用 SQLite Backup API，并检查数据库完整性、ZIP 内数据库及 PDF SHA-256。
- Backup uses the SQLite Backup API and validates the database and ZIP-contained database/PDF SHA-256 checksums.
- 恢复只允许 **空白数据目录**；现有询价或 PDF 文件存在则服务端拒绝恢复，不允许合并或覆盖。
- Restore is allowed only into an **empty data directory**; existing RFQs or PDFs cause a server-side refusal. No merge or overwrite.
- 读取备份 ZIP 时验证文件清单、格式版本、条目大小、文件哈希、数据库数据和附件登记信息。
- Restore checks format/version, exact ZIP entries, size limits, hashes, database records, and asset index correspondence.
- 恢复完成后可重新启动/刷新浏览器打开以前的询价、历史版本和 PDF。
- After restore, reload the page to reopen RFQs, histories, and PDFs.
- 目前报价原始邮件、聊天截图、其他文档附件仍未实现上传存储，因此不在 S4 ZIP 中。
- Raw quotation email, chat screenshots, and non-PDF evidence have not been implemented and are not included in this S4 ZIP.
- 单个原始 PDF 上限 12 MiB；备份数据库上限 128 MiB；ZIP 上限 512 MiB；最多 2,000 个不同 PDF。
- Limits: PDF <=12 MiB each, backed-up SQLite <=128 MiB, ZIP <=512 MiB and <=2,000 distinct PDFs.
- S4 仍手动保存，未开发自动保存，不能作为正式唯一数据存储。
- S4 still requires manual saves and is not a sole production data store.

### 本机使用 / Windows Workflow

1. 下载本开发分支最新完整文件夹并替换旧程序代码（不删除原始数据目录）。
1. Download the entire updated development branch and replace the old source code without deleting the data root.
2. 双击最新 \`run_local.bat\`，打开 \`http://127.0.0.1:8765/\`。
2. Double-click the latest launcher and open \`http://127.0.0.1:8765/\`.
3. 先保存所有修改，再点击“下载 S4 完整备份（SQLite + PDF）”，保存 ZIP 到安全位置。
3. Save pending edits and click **Download S4 Full Backup (SQLite + PDF)**; retain the ZIP securely.
4. 在全新电脑或明确隔离的空数据目录打开 S4，选择 ZIP，点击“恢复完整备份（仅空白数据）”。
4. On a new PC or clearly isolated empty data directory, select the ZIP and choose **Restore Full Backup (Empty Data Only)**.
5. 验证询价数量、历史版本、供应商关联和 PDF 预览；不能在已有询价的电脑上强行恢复覆盖。
5. Check RFQ counts, historical revisions, supplier assignments and PDF previews; existing RFQs cannot be forcibly overwritten.

### 隔离测试目录 / Safe Isolated Restore Test

- 此方式**不会修改** \`%LOCALAPPDATA%\SRM-Lite\` 下原有的 SQLite 和 PDF。
- This method **does not modify** the default SQLite or PDFs under \`%LOCALAPPDATA%\SRM-Lite\`.
- 先用 Ctrl+C 关闭原服务器，在 \`prototype\m1-lite\` 的 CMD 窗口执行：
- Stop the original server with Ctrl+C, then run in CMD from \`prototype\m1-lite\`:

\`\`\`bat
set "SRM_DATA_DIR=%TEMP%\SRM-S4-RESTORE-%RANDOM%"
python backend\server.py
\`\`\`

- 此新进程将在临时空白目录建立独立数据库；关闭后用原有快捷方式/批处理在另一窗口正常启动即可切回默认数据目录。
- This process initializes an isolated blank database; afterward, starting the launcher in a new normal window returns to the default data location.
- 注意：本机端口 8765 一次只能运行一个服务器。
- Only one local server can use port 8765 at a time.

### 新 API / New Routes

| Method | Path | Function |
|---|---|---|
| POST | \`/api/backups/full\` | Create checked SQLite+PDF ZIP |
| GET | \`/api/backups/full/{generated-name}\` | Download archive |
| POST | \`/api/backups/full/restore\` | Verify and restore only if data root empty |

### S4 运行测试 / Run S4 Tests

\`\`\`powershell
cd prototype\m1-lite
python -m unittest discover -v -s backend -p "test_*.py"
node --test tests/supplier_package.test.cjs
\`\`\`

- Python 单元和 HTTP 测试使用临时数据目录，不读取使用者默认数据。
- Python unit and HTTP tests use temporary directories and do not access the user's default data.
- 在 GitHub Actions 成功运行前，不应宣称 CI 已通过；Windows 上的完整业务恢复仍需独立人工验收。
- Do not claim CI passed without a successful workflow run; Windows business recovery still requires independent buyer acceptance.

## S4 自动保存及定期完整备份候选（2026-10-14） / S4 Autosave and Scheduled Full-Backup Candidate

- 当前版本新增自动保存：进入正式询价后检测真实业务状态变化，停止修改至少约 2.5 秒后自动写入 SQLite；扫描间隔约 0.75 秒。
- The current version autosaves real buyer-state changes after approximately 2.5 seconds of idle time, scanning about every 0.75 seconds.
- 不会因为搜索、切换列表或浏览页面产生相同内容的无效历史版本；新建的空白正式询价也会尝试首次自动提交。
- Searches, browsing or no-op navigation do not create duplicate state revisions; a new empty buyer RFQ gets its first automatic commit.
- 保留“保存到本机”按钮；已确认报价不得被改写，使用已有版本冲突检查。
- The explicit Save button remains available; existing immutable confirmed rounds and optimistic revision checks remain in force.
- 页面显示“检测到修改 / 自动保存中 / 第 N 版已保存 / 保存失败”等状态；失败后停止自动重试，需用户检查并手动保存。
- The UI distinguishes dirty, saving, saved revision and failed states; failed autosave stops retrying until the user intervenes.
- 页面离开时如有未保存业务修改，将触发浏览器支持范围内的离开确认；不能保证断电前未提交的输入被保存。
- Uncommitted changes trigger a browser-supported navigation warning; power loss before a commit cannot be prevented.
- **自动保存仅覆盖已经提交到业务状态的数据**。尚未点击“确认导入”“确认修改”等按钮的文本框或预览输入仍需用户完成确认。
- **Autosave covers committed in-memory business state only**. Pending input forms and import previews still require their normal Confirm/Apply step.
- 后台自动完整备份默认开通：程序启动、业务保存或图纸上传后检查备份是否到期；服务持续运行时每小时检查一次。
- Background full backups are enabled in the normal app server: due checks happen at startup, after saved work/PDF upload and hourly while running.
- 首次存在已保存询价时创建备份；此后数据有变动且距离上次自动备份至少 24 小时才再生成。
- The first existing saved RFQ triggers a complete backup; afterward, another backup requires both a data change and a 24-hour interval.
- 自动备份保留最近 **7** 份，不清理用户手动创建的 ZIP；备份保存在 \`%LOCALAPPDATA%\SRM-Lite\backups\auto\`。
- Keep the newest **seven automatic** archives; manually created ZIPs are untouched. Automatic copies reside under \`%LOCALAPPDATA%\SRM-Lite\backups\auto\`.
- 每份自动备份使用与手动 S4 完整备份相同的 SHA-256 校验和数据库一致性校验；出现错误时会在 CMD 输出 WARNING，不会谎称备份成功。
- Automatic backups use the same SQLite and PDF integrity checks as manual full ZIPs; failures are logged as WARNING, not reported as success.
- 页面显示最近自动备份时间和保留份数；若没有生成，不应理解为已有自动备份。
- The UI shows the last automatic-backup time and retained-copy count; a missing timestamp means no automatic backup has completed.
- 以上为开发候选功能，Windows 真实业务与长期运行仍需验收，不能当作无需人工检查的最终数据保护措施。
- These are development-candidate controls requiring real Windows and long-running tests, not a substitute for independent verified backups.

### 新增数据安全测试 / Additional Safety Tests

\`\`\`powershell
cd prototype\m1-lite
python -m unittest discover -v -s backend -p "test_*.py"
node --test tests/autosave_rules.test.cjs tests/supplier_package.test.cjs
\`\`\`

- Python 测试包含自动备份节流、变化检测、七份保留及独立数据库完整恢复；Node 测试覆盖自动保存的空闲时间和错误停止规则。
- Python tests cover backup cadence, change detection, seven-copy retention and isolated restore; Node tests cover autosave idle and failure-halt rules.
- 自动备份元数据 API：\`GET /api/backups/auto/status\`（只读，返回份数与最近一次时间）。
- Automatic-backup metadata API: \`GET /api/backups/auto/status\` (read-only, counts and most recent time).
