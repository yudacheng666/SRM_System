# 20261015 SRM UI V2 B · 代码集成准备与 DOM 映射
# 20261015 SRM UI V2 B · Integration Readiness and DOM Mapping

## 0. 当前状态 / Current Status
- 用户已确认 UI 方案 B 的视觉方向；本分支仅作集成准备，不改动可执行 SRM 页面。
- The user approved Concept B's visual direction. This branch is preparation only; it does not change the executable SRM UI.
- 集成基础：`draft/20261013-m1-storage-ui-audit`；本文件所在独立分支：`prep/20261015-ui-v2-integration`。
- Integration base: `draft/20261013-m1-storage-ui-audit`; isolated preparation branch: `prep/20261015-ui-v2-integration`.
- 设计原型：`design/20261015-ui-system-v2/design/ui-v2/concept-b-refined.html`；浏览器优化候选：`test/20261015-ui-v2-browser/design/ui-v2/concept-b-v2.1.html`。
- Design concept and laptop-optimized variant are referenced across branches, not copied over the working application.
- 设计分支相对开发分支出现一个合并提交的差异；禁止直接整分支覆盖或合并业务文件。
- The design branch diverges from the latest development base by one merge commit; never wholesale-overwrite business files.

## 1. 核心文件 / Existing Files
- `prototype/m1-lite/index.html`：现有业务页面和大量内联 CSS/JS；必须保留原事件绑定与 ID。
- `prototype/m1-lite/index.html`: the real business page with extensive inline CSS/JS; preserve all DOM IDs and handlers.
- `prototype/m1-lite/backend/`：SQLite、历史记录、备份/恢复相关后台；设计集成期间不触碰。
- `prototype/m1-lite/backend/`: backend and persistence safety; out of scope.
- `prototype/m1-lite/tests/e2e/acceptance.spec.cjs`：真实业务操作浏览器回归测试。
- `prototype/m1-lite/tests/e2e/acceptance.spec.cjs`: existing end-to-end browser regression.
- `playwright.config.cjs`, `package.json`：既有测试运行器与依赖，尽量复用。
- `playwright.config.cjs`, `package.json`: reuse existing runner and dependencies.

## 2. UI V2 → 业务 DOM 接入映射 / Integration Mapping
| 模块 / Region | 保留/复用现有节点 / Existing Hooks | 设计实现方法 / UI Approach |
|---|---|---|
| 顶部与当前询价 / Header and context | `#uiProjectJump`, `#uiAdminToggle`, `#uiFieldSettings`, `#uiCurrentRfq`, `#pilotModeBadge` | 建立深色导航外壳，当前询价与真实模式状态仍可见 / Adopt the dark shell; retain workspace and demo/real state |
| 保存与备份状态 / Save states | `#pilotSaveStatus`, `#pilotAutosaveStatus`, `#pilotAutoBackupStatus` | 收敛为统一状态显示，不移除节点；失效/冲突/未备份需明确 / Surface status but never remove hooks or conceal warnings |
| 询价/备份入口 / Workspace administration | `#pilotControls`, `#pilotNewWorkspace`, `#pilotHistoryWorkspace`, `#pilotS4DownloadFull`, `#pilotS4RestoreFull` | 分组折叠或右侧抽屉；完整备份和兼容 JSON 明确区分 / Contextual admin drawer, no ambiguous restore actions |
| 四步业务导航 / RFQ stage navigation | `[data-tab="items"]`, `[data-tab="assign"]`, `[data-tab="quoteImport"]`, `[data-tab="quotes"]`, `#items`, `#assign`, `#quoteImport`, `#quotes` | 用原 data-tab 触发器与 panel，不能添加另一套平行数据切换逻辑 / Reuse real tab triggers rather than mock handlers |
| 物料与图纸 / Items and drawings | `#itemSearch`, `#runItemSearch`, `#toggleItemIntake`, `#itemHead`, `#itemBody`, `#itemPager`, `#pilotDrawingPanel` | 列表优先；真实导入、PDF 匹配及人工确认仍按原 ID 调用 / Table-first with real existing intake/matching |
| 物料批量操作 / Bulk items | `#deleteSelectedItems`, `#fieldTools`, `#itemSelectAll`, `#itemSelectPage`, `#itemInvertAll` | 将操作移入选择后上下文条；危险操作不与添加按钮同等级 / Contextual bulk toolbar |
| 供应商分配 / Assignment | `#itemFirstView`, `#supplierFirstView`, `#assignItemBody`, `#supplierList`, `#previewBtn`, `#generateBtn` | 继续支持双向分配与已有关系提示；保持追加不覆盖规则 / Preserve both assignment directions and append semantics |
| 报价回收 / Quote intake | `#quoteImportSupplier`, `#quoteRoundSelect`, `#quoteEvidenceType`, `#quoteImportFile`, `#quoteCoverageSummary`, `#quoteRoundBody`, `#confirmQuoteRound` | 供应商/轮次→录入/导入→异常→确认；证据与轮次不得丢 / Guided multi-round quote intake, keep evidence |
| 比价议价 / Comparison | `#commonScopePicker`, `#quoteAnalysis`, `#quoteTable`, `#quotePager`, `#pilotReportOpen` | 以实际同范围表格为主，不将漏报当作 0；导出复用现有处理 / Emphasize valid comparable data and existing exports |

## 3. 容易踩坑的地方 / Integration Risks
1. HTML 文件的 CSS 包含多轮 selector 覆盖与 `body.ui-buyer-mode` 条件式布局；不能只堆叠一组全局 `.btn`/`.card` 覆盖，需逐步移除冲突规则。
1. Inline CSS has layered overrides and `body.ui-buyer-mode`; do not blindly append generic global styles.
2. 模拟原型中的导航按钮、KPI 和示例价格没有连接真实 SRM 状态；不复制演示事件代码。
2. The concept's sidebar, KPIs and prices are mock UI; never copy its demo event handlers into production.
3. 当前真实系统并不存在完整独立的“供应商首页”“分析首页”，必须避免创建失效导航项；沿用已有工作区入口。
3. Do not introduce unimplemented standalone Suppliers or Analytics routes merely because the concept shows them.
4. UI 重排不得改变 PDF 关联确认、报价锁定、轮次与阶梯价、部分覆盖导出、完整备份恢复或 409 冲突响应逻辑。
4. DOM rearrangement must preserve PDF confirmation, quote lock, revisions/tier pricing, partial exports, S4 restore and 409 conflict handling.
5. 保存/备份失败不得被演示“已保存”文字掩盖；真实状态必须绑定现有 `#pilotAutosaveStatus` 等节点。
5. Never replace live save/error reporting with the concept's static “saved” label.

## 4. 推荐实施顺序 / Recommended Implementation Order
- UI-2.1 样式骨架：先提取原内联样式为可管理的层级，只接入语义化 Token 和桌面布局，不迁移业务数据/事件。
- UI-2.1 shell: progressively organize styles, tokens and layout while keeping original DOM hooks.
- UI-2.2 物料页面：搜索、筛选、选择上下文条、表格样式；使用原 `#itemBody` 等节点。
- UI-2.2 items: table, filters and contextual selection with the original rendering hooks.
- UI-2.3 图纸与供应商：只调整入口与布局，真实匹配、供应商关联逻辑不变。
- UI-2.3 drawings and allocation: change presentation, not association semantics.
- UI-2.4 报价与比价：轮次、凭证、异常、同范围分析分层。
- UI-2.4 quotes and comparison: progressive disclosure without changing business calculations.
- UI-2.5 真实验收：1366×768、1600×900，以及浏览器缩放/键盘可用性检查；所有现有 Python、Node、Playwright 测试回归。
- UI-2.5 real acceptance: both desktop widths, keyboard and zoom usability plus all existing automated regressions.

## 5. 必须达到的门槛 / Gates
- 截图：四个真实页面的首屏截图；1366×768 下表格完整第一行出现，状态/主操作清晰。
- Screenshots: actual four-stage SRM views, with first full data row visible at 1366×768.
- 业务：至少真实执行新建、导入 12 条模拟物料与 PDF、供应商分配、两轮报价、比价、保存、重新打开、完整备份/恢复。
- Workflow: create workspace, import synthetic items/PDF, allocate, quote two rounds, compare, save, reopen, backup/restore.
- 数据：SQLite 快照、PDF 字节、供应商外发文件边界与历史报价不被 UI 修改破坏。
- Data integrity: preserve snapshots, PDF bytes, external-facing supplier package scope and quote history.
- 合并：在独立功能分支做 Draft PR；测试与视觉检查通过后向用户申请批准，绝不自动合并 main。
- Merge: isolated draft PR, user approval required; never auto-merge main.

## 6. 当前限制 / Current Limitations
- 本准备分支没有加载 `integration-tokens.css`，也不改业务 HTML 或后端；只是候选规范和接入清单。
- The candidate stylesheet is intentionally unlinked; business HTML/backend remain unchanged.
- 概念的真实 Chromium 测试位于单独 Draft PR #6，和业务回归测试不是一回事。
- Concept Chromium visual evidence in Draft PR #6 is distinct from application end-to-end regression.
