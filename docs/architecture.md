# SRM M1 Lite 当前架构 / Current architecture

> 核实日期：2026-11-03。本文描述当前 main 的实际架构，不代表公司服务器部署已完成。
> Verified: 2026-11-03. This describes the current main implementation, not a completed company-server deployment.

## 1. 运行形态 / Runtime

- 浏览器 UI 由 Python 本机 HTTP 服务提供；Windows 启动入口为 `prototype/m1-lite/run_local.bat`。
- The browser UI is served by a local Python HTTP service; the Windows launcher is `prototype/m1-lite/run_local.bat`.
- 启动后访问 `http://127.0.0.1:8765/`；服务默认只监听 loopback，不向公司局域网开放。
- Open `http://127.0.0.1:8765/`; the service binds to loopback and is not exposed to the company LAN.
- 日常使用需要 Python 3.10+；Node.js/npm 仅用于开发和自动化测试。
- Daily use requires Python 3.10+; Node.js/npm are for development and automated tests.

## 2. 数据存储 / Data storage

默认数据目录为 Windows `%LOCALAPPDATA%\SRM-Lite\`；可通过 `SRM_DATA_DIR` 显式指定隔离目录。非 Windows 环境默认使用用户目录下的 `.srm-lite`。
The default data root is Windows `%LOCALAPPDATA%\SRM-Lite\`; `SRM_DATA_DIR` overrides it for isolated runs. Non-Windows defaults to `.srm-lite` under the user's home directory.

| 内容 | 默认位置 |
|---|---|
| SQLite 数据库 | `srm.sqlite3` |
| PDF 原件 | `assets/<hash-prefix>/<sha256>.pdf` |
| 完整手动备份 | `backups/full/` |
| 自动完整备份 | `backups/auto/` |
| SQLite 单独备份 | `backups/` |

SQLite 保存工作区当前快照、历史修订和资产索引。保存采用版本号检查；冲突时拒绝覆盖。已确认报价和历史修订不能被静默改写。
SQLite stores current workspace snapshots, historical revisions and asset indexes. Writes use revision checks and reject conflicts; confirmed quotations and historical revisions cannot be silently overwritten.

## 3. 工作区身份与业务数据 / Workspace identity and business data

工作区使用稳定的 `workspaceId`、`schemaVersion` 和递增 `revision`。业务状态包含物料行、供应商、分配关系、报价轮次/修订、阶梯价、人工定标及同范围比较供应商组。
Each workspace uses a stable `workspaceId`, `schemaVersion` and increasing `revision`. Business state includes RFQ lines, suppliers, assignments, quotation rounds/revisions, tier prices, buyer awards and selected comparison groups.

`RFQ Line ID` 是询价行身份，不等于 ERP 存货编码；往来单位编码和供应商编码也保持各自语义。ERP 未映射列可以保留原值，但不自动推断字段含义。
`RFQ Line ID` identifies an RFQ line and is not the ERP item code; counterparty and supplier codes also retain distinct meanings. Unmapped ERP columns may be preserved verbatim but are not assigned inferred semantics.

## 4. PDF 与备份恢复 / PDF assets and backup/restore

- 已登记 PDF 原件独立保存，并通过 SHA-256 校验；供应商 ZIP 只包含对应供应商的询价 Excel 和已关联 PDF。
- Registered PDF originals are stored separately and verified with SHA-256; supplier ZIPs contain only that supplier's RFQ workbook and linked PDFs.
- S4 完整 ZIP 包含 SQLite 数据库、资产清单和已登记 PDF；恢复前验证文件清单、数据库完整性和哈希。
- S4 full ZIP contains the SQLite database, asset manifest and registered PDFs; restore preflights the file list, database integrity and hashes.
- 完整恢复只允许目标数据目录为空；已有工作区或 PDF 时必须拒绝，不做覆盖或合并。
- Full restore is allowed only into an empty data root; existing workspaces or PDFs cause rejection, never overwrite or merge.
- 单 PDF 上限 12 MiB、数据库上限 128 MiB、完整 ZIP 上限 512 MiB、最多 2,000 个不同 PDF。
- Limits: 12 MiB per PDF, 128 MiB database, 512 MiB archive and up to 2,000 distinct PDFs.

## 5. 自动保存与自动备份 / Autosave and automatic backup

业务状态发生变化并达到空闲条件后自动保存；手动保存入口仍保留。后台完整备份只在数据变化且达到 24 小时间隔时创建，正常情况下保留最近 7 份自动备份；手动备份不被自动清理。
Committed business-state changes are autosaved after the idle condition; manual save remains available. Background full backups are created only when data has changed and the 24-hour interval is due; normally the newest seven automatic archives are retained, while manual backups are not pruned.

自动备份失败、异常或没有生成记录时，不得显示为成功；用户仍应定期确认备份文件可用。
Failures, warnings or a missing backup record must never be reported as success; users should still periodically verify that backup files are usable.

## 6. 当前边界 / Current boundaries

- 当前是本机单用户应用；尚未部署公司服务器，也没有多用户并发、SSO 或企业权限体系。
- This is a local single-user application; company-server deployment, multi-user concurrency, SSO and enterprise permissions are not implemented.
- ERP API 主数据同步尚未实现；物料/供应商主数据准入约束与未命中时的临时录入策略仍待业务确认。
- ERP API master-data synchronization is not implemented; item/supplier master-data admission rules and unmatched-record handling remain subject to business approval.
- ERP 完整 220 字段字典及所有字段语义、代码转换和单位换算尚未完成核验。
- The complete 220-field ERP dictionary, semantics, code conversions and unit conversions have not been fully verified.
- 当前持久化资产范围以 PDF 图纸为主；原始邮件、聊天截图等报价凭证的文件化归档尚未实现。
- Persisted assets currently focus on PDF drawings; file-based archiving of original quotation emails and chat screenshots is not implemented.
