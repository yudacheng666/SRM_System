# SRM_System DECISIONS / 长期有效决策登记

> Baseline: 2026-10-22. Status: 有效 VALID / 被替代 SUPERSEDED / 待确认 UNVERIFIED. Dates are evidence-backed when available; a historical item's exact original confirmation date may be marked 待核实.
> 来源优先级：用户最新明确批准的业务要求 > 当前代码和准确 SHA 测试事实（实现状态）> 旧计划。代码实现不擅自改变业务决策。

| ID | Confirmed / 确认日期 | Status | Decision & rationale / 决策及原因 | Evidence / 证据 |
| --- | --- | --- | --- | --- |
| D-001 | 2026-10-08 | VALID | 轻量 RFQ/询价分配/报价/比价/历史闭环；不用完整 ERP、供应商无需登录。聚焦采购效率。 Lightweight RFQ scope; no supplier portal or ERP replacement. | docs/01_产品需求PRD.md |
| D-002 | 2026-10-13 | VALID | 先本地 Windows 离线 HTTP + SQLite，服务器与多用户鉴权后置；减少试用部署复杂度。 Offline localhost pilot first, server later. | docs/20261013_SRM_离线持久化与UI改造边界_V1.md |
| D-003 | 2026-10-09（原始确认日待核实） | VALID | RFQ Revision 不覆盖旧版，RFQ Line ID 是稳定行身份且独立于物料编码；保障回报匹配和追溯。 Stable RFQ-line identity; immutable revisions. | docs/02_业务规则.md §§A/G |
| D-004 | 2026-10-09（原始确认日待核实） | VALID | 物料和供应商多对多，默认追加关系不隐式覆盖；选择状态清晰。 Multi-to-many, additive allocations. | docs/02_业务规则.md §§C/D |
| D-005 | 2026-10-09（原始确认日待核实） | VALID | Coverage 小于 100% 仍允许导出询价包，未分配物料保留；避免强制全覆盖。 Incomplete allocation does not block RFQ generation. | docs/02_业务规则.md §§A/E |
| D-006 | 2026-10-08 | VALID | 导入先预览再确认，精确表头/主键、空列保位，普通空格不得作分隔；防错位与静默改数。 Preview-first, explicit headers, no whitespace split. | docs/01_产品需求PRD.md §4; docs/02_业务规则.md §B |
| D-007 | 2026-10-12（项目计划记录） | VALID | PDF 可多页、一物料多文件；按 RFQ 行及供应商范围匹配和隔离打包，保留历史快照。 PDF line matching and supplier-specific packets. | docs/02_业务规则.md §E; 20261010_SRM_项目总控与最小试用计划.md |
| D-008 | 2026-09-29（用户历史确认） | VALID | 有邮件留原邮件及附件，无邮件可用截图/独立 PDF；无法可靠结构化则人工录入，证据与数据分离。 Quotation source evidence survives manual normalization. | docs/02_业务规则.md §F; 项目历史确认 |
| D-009 | 2026-10-09（原始确认日待核实） | VALID | Round 与同轮 Revision 分开，后轮/更正不覆盖历史；漏报不自动沿用旧价，沿用须明确确认。 Keep round/submission history, no implicit carry-forward. | docs/02_业务规则.md §§G-J |
| D-010 | 2026-09-29（用户历史确认） | VALID | 阶梯价为可选结构；保留全部档位，仅取当前数量适用价；无适用档不得猜价。 Preserve tiers; no invented prices. | docs/02_业务规则.md §K |
| D-011 | 2026-10-09（原始确认日待核实） | VALID | 默认最低有效价；非最低选择记录理由；公平总价必须同范围，缺报价不按零。 Lowest valid by default; explain overrides; compare like-for-like. | docs/02_业务规则.md §L; #2 |
| D-012 | 2026-10-09（原始确认日待核实） | VALID | 历史导入只还原有证据的信息，不编造历史 RFQ/轮次；保留来源和异常。 Evidence-based historical migration only. | docs/02_业务规则.md §§M-N |
| D-013 | 2026-10-16 | VALID | ERP 已用中文核心字段对齐，保留未知原列但不臆断语义；RFQ Line ID 与存货编码不同。 Align core fields without claiming all 220-field mapping. | #15; docs/20261016_SRM_ERP核心字段统一与兼容范围_V1.md |
| D-014 | 2026-10-13 | VALID | SQLite 版本条件写入防冲突；只在服务端成功确认后显示保存，真实资产不得进入 Git。 Safe local persistence and data isolation. | docs/20261013_SRM_离线持久化与UI改造边界_V1.md |
| D-015 | 2026-10-14 | VALID | S4 ZIP 内部备份需一致数据库/已登记 PDF 和校验；恢复仅空白目录，不能向供应商外发内部 ZIP。 Atomic full backup, empty-root-only restore. | docs/20261014_SRM_S4完整备份恢复开发记录_V1.md; #33/#34 |
| D-016 | 2026-10-22 | VALID | UI 先清晰的采购决策层级：报价回收紧凑视图/安全只读刷新、比价决策前置、报表与 S4 管理分开，不改变报价及恢复语义。 Approved design direction, not necessarily accepted implementation. | #44; #45; #46 |
| D-017 | 2026-10-22（再次确认） | VALID | ChatGPT 主导业务/代码/主记忆，Codex Cloud 只做独立 TEST-ONLY 与证据归档；准确 SHA 的 CI 门槛先于独立验收。 Separate developer and independent tester roles. | 用户本次明确指令; #24/#39/#46 |
| D-018 | 2026-09-28（仓库初始规范） | VALID | 文档/代码/测试/截图仅用匿名虚构资料，即使私有仓库也不保存真实业务数据。 Synthetic-only repository fixtures. | README.md; docs/01_产品需求PRD.md |
| D-019 | 2026-10-22 | VALID | main 不因候选开发/测试自动更新；合并任何 PR 必须用户明确批准，证据 PR 不等于产品合并。 Explicit owner merge gate; distinguish main/dev/evidence. | 用户本次明确指令; #2; #24; #43 |
| D-020 | 2026-10-22 | VALID | GitHub + Markdown 主记忆；实质里程碑及时固化，按任务在授权文档分支提交 PR，新会话先读入口文件并核验仓库。 Checkpoint on substantive changes; no claim of autonomous background persistence. | 用户本次明确指令; 本次 docs-only PR |
| D-021 | 2026-10-12（计划记录） | VALID | 首次采购员试用前保留 ERP 完全对接/审批/服务器功能为后续阶段；但真实 PDF 与安全恢复必须达到试用门槛。 Avoid scope creep while protecting buyer pilot quality. | 20261010_SRM_项目总控与最小试用计划.md |
| D-022 | 2026-10-23（用户选择方案 A） | VALID · TEMPORARY / 临时有效 | **SRM M1 开发候选临时验收门槛**：GitHub-hosted Actions 因无 runner / 账户限制不能执行期间，允许以 **同一准确产品 SHA 的 Codex Cloud 完整 Python+Node+Chromium 自动化 PASS、独立业务 TEST-ONLY 验收 PASS、原生 Windows 隔离环境 Python3.13/Node22/PowerShell-BAT 及实际本机启动安全核验 PASS**，作为候选版本进入 *M1 开发基线合并审批* 的替代证据；缺任何一项即不得以本临时门槛宣称合并条件完备。**这是对 D-017“CI 先行”流程的临时例外，不更改 ChatGPT 开发 / Codex TEST-ONLY 角色分工。** 任何合并（包括 M1、main）仍须用户另行明确授权；本规则本身不授权合并。Codex 不是 GitHub Actions runner，不得写成 Actions SUCCESS / 通过 GitHub 必需状态检查，不绕过仓库保护；账户恢复后按准确最终 SHA 补跑正式 Actions，正式发布和 main 晋级仍须另行审核。新增代码/SHA 改变时相关证据重新核对与复验，不能沿用旧 SHA。 Scope: current SRM M1 / PR #46 only until exception explicitly retired. | 用户本对话选 A；[PR #46](https://github.com/yudacheng666/SRM_System/pull/46)；[PR #50 测试证据](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6341985654)；[Actions UI](https://github.com/yudacheng666/SRM_System/actions/runs/39766115997)、[S3/S4](https://github.com/yudacheng666/SRM_System/actions/runs/39766115887) |

| D-023 | 2026-10-26（Windows 试用四处明确批注） | VALID | **采购员界面优先通俗中文**：移除“PURCHASING WORKSPACE”“Current RFQ”等无意义英文和“S4/SQLite”等突出显示的技术术语。**询价项目须有可修改的中文业务名称**，并显示在当前项目与历史列表；稳定的内部 `workspaceId` 不作为采购员的主要项目名称，不可直接更改，因为其关联 SQLite 版本、图纸、报价和导出。旧项目名称缺失时可显示创建时间的待命名提示；内部 ID 仅在详情/数据引用中保留。新增名称通过真实安全保存，不伪造已保存。 中文优先只约束采购员可见 UI，不禁止代码/开发文档中的技术英文。 | [PR #46 UX 修复](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6406983737)；2026-10-26 本机界面四张批注截图 |
| D-024 | 2026-10-26（用户明确确认） | VALID | **开发测试期数据不承担历史兼容包袱**：当前 SRM 为测试软件；之前创建的模拟询价、报价、测试 SQLite、测试 ZIP 等均视为可重建的测试资产。当前及下一开发版本**不因旧测试快照、旧 schema、旧名称或旧备份的读写兼容而阻塞开发/验收/合并**，不增加专门迁移机制或历史数据回填。新版验收优先使用隔离的全新虚构数据，验证当前版本新建询价、名称编辑、正常保存、轮次、图纸引用、比价及本版 S4 备份/恢复安全。**不得为了简化测试而破坏同一当前版本内的身份主键、数据关联、历史轮次、并发保护或备份安全。** 不主动删除用户电脑中的已有试用资料，不覆盖不可变测试证据；清理须明确可控。日后真实 ERP/采购历史数据导入是独立业务任务，不因本决策被否定。 / Test-stage fixtures are disposable; no legacy migration gate, but current-version referential integrity and safety remain mandatory. | 用户 2026-10-26 直接明确：“软件还在测试，不用考虑历史数据包袱问题。”；[PR #46](https://github.com/yudacheng666/SRM_System/pull/46)；补充 D-023 名称展示决策的适用范围 |
| D-025 | 2026-10-26（用户两处浏览器直接批注） | VALID | **询价项目是采购业务流程第一步，必须有与“物料与图纸”同级的完整常驻操作页面**，不得继续作为所有页面顶端的折叠项目工具抽屉。左侧导航和顶部业务流程顺序一致：①询价项目 → ②物料与图纸 → ③供应商分配 → ④报价回收 → ⑤比价议价。项目页复用原新建/切换/保存/历史控件而非复制业务处理器；供应商管理归供应商分配页；数据备份保持单独管理入口。任何界面移动不得改变稳定 RFQ 身份、业务快照和 S4 安全。现阶段按照用户工作流继续累积 UI 反馈，最终用户要求时再交 Codex Cloud 一次性准确 SHA 验收。 / RFQ project is a first-class, permanently visible step—not an accordion above all pages. | 用户 2026-10-26 本机“项目操作”和“采购业务流程”两条浏览器批注；[PR #46](https://github.com/yudacheng666/SRM_System/pull/46) |
| D-026 | 2026-10-26（本机试用四处浏览器批注） | VALID | **“询价项目”只处理新建、保存、选择其他询价**，采购员可见主操作按钮统一简称“新建”“保存”。**“数据与备份”独立于五步采购业务流程**，备份 ZIP/JSON、空目录恢复、技术保存详情、单据导出从此页操作，不能继续挂在询价项目页下方。旧“恢复当前已保存记录”实际只是重新从 SQLite 加载当前已存状态、会放弃未保存的页面修改；并非历史恢复或旧版功能迁移，不占用日常项目工具栏，保留为数据管理中的明确风险提示辅助操作“重新读取已保存数据”。沿用同一套 SQLite/S4 保护和业务事件，不允许借页面移动改变安全语义。仍按用户要求累计批注后统一 Codex Cloud 验收。 / Separate admin management from procurement stages; use clear names and preserve reload safety. | 用户2026-10-26 本机四条批注；[PR #46 的实现回评](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6408464127) |
| D-027 | 2026-10-26（物料图纸三张标注截图） | VALID | **物料与图纸主表采用紧凑行高**，参照同页 Excel 导入预览表；针对物料正文减少内边距和图纸字段冗余信息，不影响其他页面表格。对于需要图纸但尚无真实文件的物料，**在原按钮中直接显示“缺图纸”替换 PDF**，不要同时显示 PDF 与下一行“缺图纸”；有已关联图纸的按钮仍显示 PDF 并保持原查看动作；“无需图纸”按独立业务状态保留，不误标为缺失。图纸关联和文件数量等信息可通过悬停提示/关联管理查看。 / Compact only item-detail rows and replace the missing drawing badge text in place, not the existing PDF action for attached files. | 2026-10-26 本机三张截图批注；[PR #46 新代码与记录](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6408786011) |
## Change handling / 决策变更规则

- Never delete a superseded decision. Keep original ID, set SUPERSEDED, link successor and the explicit owner's latest approval date.
  决策冲突不覆盖历史；新旧编号相互关联，保留原因和来源。
- Do not upgrade a historical proposal or a statement in a Draft PR to VALID unless user confirmation or authoritative existing approved rule supports it.
  Draft PR 的实现说明本身不代表业务授权。
- D-016 describes the UI direction; #46's scoped Codex automated/UAT PASS is not GitHub Actions PASS or full release approval. D-020 is a workflow convention, not a daemon. D-022 is the explicitly authorized **temporary development gate**; the original D-017 CI-first rule resumes when the exception expires. Windows-native tests and separate merge authorization are still outstanding.
  UI 两项整改已独立复验通过；在原生 Windows 专项与单独合并审批完成前，不得以方案 A 自动合并；项目记忆 PR 未合并前不属于 M1 开发基线。
