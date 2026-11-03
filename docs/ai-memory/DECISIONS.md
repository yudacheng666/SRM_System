# SRM_System DECISIONS / 长期有效决策登记

> Baseline: 2026-10-22. Status: 有效 VALID / 被替代 SUPERSEDED / 待确认 UNVERIFIED. Dates are evidence-backed when available; a historical item's exact original confirmation date may be marked 待核实.
> 来源优先级：用户最新明确批准的业务要求 > 当前代码和准确 SHA 测试事实（实现状态）> 旧计划。代码实现不擅自改变业务决策。

| ID | Confirmed / 确认日期 | Status | Decision & rationale / 决策及原因 | Evidence / 证据 |
| --- | --- | --- | --- | --- |
| D-001 | 2026-10-08 | VALID | 轻量 RFQ/询价分配/报价/比价/历史闭环；不用完整 ERP、供应商无需登录。聚焦采购效率。 Lightweight RFQ scope; no supplier portal or ERP replacement. | docs/01_产品需求PRD.md |
| D-002 | 2026-10-13 | VALID | 先本地 Windows 离线 HTTP + SQLite，服务器与多用户鉴权后置；减少试用部署复杂度。 Offline localhost pilot first, server later. | docs/architecture.md; prototype/m1-lite/backend/README.md |
| D-003 | 2026-10-09（原始确认日待核实） | VALID | RFQ Revision 不覆盖旧版，RFQ Line ID 是稳定行身份且独立于物料编码；保障回报匹配和追溯。 Stable RFQ-line identity; immutable revisions. | docs/02_业务规则.md §§A/G |
| D-004 | 2026-10-09（原始确认日待核实） | VALID | 物料和供应商多对多，默认追加关系不隐式覆盖；选择状态清晰。 Multi-to-many, additive allocations. | docs/02_业务规则.md §§C/D |
| D-005 | 2026-10-09（原始确认日待核实） | VALID | Coverage 小于 100% 仍允许导出询价包，未分配物料保留；避免强制全覆盖。 Incomplete allocation does not block RFQ generation. | docs/02_业务规则.md §§A/E |
| D-006 | 2026-10-08 | VALID | 导入先预览再确认，精确表头/主键、空列保位，普通空格不得作分隔；防错位与静默改数。 Preview-first, explicit headers, no whitespace split. | docs/01_产品需求PRD.md §4; docs/02_业务规则.md §B |
| D-007 | 2026-10-12（项目计划记录） | VALID | PDF 可多页、一物料多文件；按 RFQ 行及供应商范围匹配和隔离打包，保留历史快照。 PDF line matching and supplier-specific packets. | docs/02_业务规则.md §E; prototype/m1-lite/backend/README.md |
| D-008 | 2026-09-29（用户历史确认） | VALID | 有邮件留原邮件及附件，无邮件可用截图/独立 PDF；无法可靠结构化则人工录入，证据与数据分离。 Quotation source evidence survives manual normalization. | docs/02_业务规则.md §F; 项目历史确认 |
| D-009 | 2026-10-09（原始确认日待核实） | VALID | Round 与同轮 Revision 分开，后轮/更正不覆盖历史；漏报不自动沿用旧价，沿用须明确确认。 Keep round/submission history, no implicit carry-forward. | docs/02_业务规则.md §§G-J |
| D-010 | 2026-09-29（用户历史确认） | VALID | 阶梯价为可选结构；保留全部档位，仅取当前数量适用价；无适用档不得猜价。 Preserve tiers; no invented prices. | docs/02_业务规则.md §K |
| D-011 | 2026-10-09（原始确认日待核实） | VALID | 默认最低有效价；非最低选择记录理由；公平总价必须同范围，缺报价不按零。 Lowest valid by default; explain overrides; compare like-for-like. | docs/02_业务规则.md §L; #2 |
| D-012 | 2026-10-09（原始确认日待核实） | VALID | 历史导入只还原有证据的信息，不编造历史 RFQ/轮次；保留来源和异常。 Evidence-based historical migration only. | docs/02_业务规则.md §§M-N |
| D-013 | 2026-10-16 | VALID | ERP 已用中文核心字段对齐，保留未知原列但不臆断语义；RFQ Line ID 与存货编码不同。 Align core fields without claiming all 220-field mapping. | #15; docs/erp-core-fields.md |
| D-014 | 2026-10-13 | VALID | SQLite 版本条件写入防冲突；只在服务端成功确认后显示保存，真实资产不得进入 Git。 Safe local persistence and data isolation. | docs/architecture.md; prototype/m1-lite/backend/README.md |
| D-015 | 2026-10-14 | VALID | S4 ZIP 内部备份需一致数据库/已登记 PDF 和校验；恢复仅空白目录，不能向供应商外发内部 ZIP。 Atomic full backup, empty-root-only restore. | prototype/m1-lite/backend/README.md; #33/#34 |
| D-016 | 2026-10-22 | VALID | UI 先清晰的采购决策层级：报价回收紧凑视图/安全只读刷新、比价决策前置、报表与 S4 管理分开，不改变报价及恢复语义。 Approved UI direction, implemented in PR #46 and promoted to main via PR #52; CI evidence does not replace buyer usability feedback. | PR #44; PR #46; PR #52 |
| D-017 | 2026-10-22（再次确认） | VALID | ChatGPT 主导业务/代码/主记忆，Codex Cloud 只做独立 TEST-ONLY 与证据归档；准确 SHA 的 CI 门槛先于独立验收。 Separate developer and independent tester roles. | 用户本次明确指令; #24/#39/#46 |
| D-018 | 2026-09-28（仓库初始规范） | VALID | 文档/代码/测试/截图仅用匿名虚构资料，即使私有仓库也不保存真实业务数据。 Synthetic-only repository fixtures. | README.md; docs/01_产品需求PRD.md |
| D-019 | 2026-10-22 | VALID | main 不因候选开发/测试自动更新；合并任何 PR 必须用户明确批准，证据 PR 不等于产品合并。 Explicit owner merge gate; distinguish main/dev/evidence. | 用户本次明确指令; #2; #24; #43 |
| D-020 | 2026-10-22 | VALID | GitHub + Markdown 主记忆；实质里程碑及时固化，按任务在授权文档分支提交 PR，新会话先读入口文件并核验仓库。 Checkpoint on substantive changes; no claim of autonomous background persistence. | 用户 2026-10-22 明确指令; AGENTS.md; PR #47/#53 |
| D-021 | 2026-10-12（计划记录） | VALID | 首次采购员试用前保留 ERP 完全对接/审批/服务器功能为后续阶段；但真实 PDF 与安全恢复必须达到试用门槛。 Avoid scope creep while protecting buyer pilot quality. | docs/architecture.md; PR #52 |

| D-022 | 2026-10-30 | VALID | GitHub Actions 是自动化验收首选；同 SHA/环境/用例已有 CI PASS 不再默认让 Codex 重跑。按低/中/高风险安排独立定向 UAT；CI 不可用时 Codex 仅补未测缺口，Windows Runner 优先，实机仅补专属场景；仍保留高风险合并门槛和用户批准。 CI-first, deduplicated risk-based independent UAT. | 用户 2026-10-30 明确指令；AGENTS.md 测试分级与去重 |

## Change handling / 决策变更规则

- Never delete a superseded decision. Keep original ID, set SUPERSEDED, link successor and the explicit owner's latest approval date.
  决策冲突不覆盖历史；新旧编号相互关联，保留原因和来源。
- Do not upgrade a historical proposal or a statement in a Draft PR to VALID unless user confirmation or authoritative existing approved rule supports it.
  Draft PR 的实现说明本身不代表业务授权。
- D-016 records the approved UI direction, implemented in PR #46 and promoted to main through PR #52; CI evidence is recorded in PROJECT_STATE.md. D-020 describes the documented collaboration workflow, not an autonomous background service.
  UI 方向已实施并进入 main；仍需区分自动化验收与采购员现场体验。自动固化依赖实际执行任务时读取本规则。
