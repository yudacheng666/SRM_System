# UI V1 采购员自主探索报告 / Autonomous buyer exploration

**结论：发现两项 P1 业务显示/单据追溯缺陷及多项 P2 易用性问题，交 ChatGPT 修复；本轮不建议据 CI 全绿宣称采购员体验已验收。未发现 P0。**
**Verdict: two P1 business display/traceability defects and several P2 usability findings need ChatGPT follow-up. Green CI alone does not establish buyer acceptance. No P0 observed.**

## 提交和方法 / Commit and method

- 被测 SHA：`1747df6896ed888986d2f1e49398fd13b0af37e3`，PR #5 保持 Draft。
- [最新任务](https://github.com/yudacheng666/SRM_System/pull/5#issuecomment-6183698488)；按仓库《20261015 SRM Codex 可视化代理验收规范 V1》执行。
- 2026-10-15，约 11:34–12:01（Asia/Shanghai）。Linux Chromium 154 / Playwright 1.58.2；1440×900、1366×768、960×900、760×900。
- 先核对 [同 SHA CI 38676212138](https://github.com/yudacheng666/SRM_System/actions/runs/38676212138)：[Linux](https://github.com/yudacheng666/SRM_System/actions/runs/38676212138/job/116230284585)、[Windows](https://github.com/yudacheng666/SRM_System/actions/runs/38676212138/job/116230284656) 均 success。**本轮未重跑 Python、Node 或已有 9 场景套件。**
- 通过临时浏览器控制台逐步观察页面、截图，再决定点击/输入/上传/下载；未直接调用 API 代替业务操作，未读取 UI 源码寻找功能入口。只读 SQLite/ZIP/XLSX 检查用于佐证实际 UI 结果。
- Isolated actual service/browser, synthetic data, adaptive visible-page exploration. Existing passing suites were not rerun. DOM was read to identify visible controls; SQLite and exported files only corroborate UI actions.
- 原始被测 worktree 在写报告前跟踪文件无差异。此独立 docs 分支仅增加本目录报告/证据；**应用、测试、CI 源码无修改，未实施修复，未合并；main、开发基线及 PR 源分支没有推送。**
- Only this separate documentation branch receives evidence. No application/test/workflow changes, fixes or merges; no writes to main, baseline or PR head.

## 实际任务结果 / Missions

| 任务 / Mission | 状态 / Status | 实际交互与结果 / Interaction and outcome |
|---|---|---|
| M1 布局 / layout | FAIL（P2） | 实际查看四种尺寸截图；入口可访问，960 文档宽度为 960，无页面级横向溢出；首屏密度和滚动表头问题见 U5/U7。不是只切换视口后作 JS 断言。 |
| M2 物料 / items | PASS；显示缺陷另见 F1 | 新建 12 项 RFQ，再建独立 100 项 RFQ；文件预览后确认；本页全选 50→下一页本页反选→共选 100；取消选择；双击 BIG-001，-1 被红字拒绝，改 10，保存/F5/搜索后仍为 10；历史切换保留两个项目。 |
| M3 供应商与分配 / allocation | FAIL（F1）；导出快捷键 NOT_IMPLEMENTED | 导入 A/B/C 三家；按物料将 001/002 追加给 A/B；切按供应商给 C 关联 003；覆盖 3/12，关系未被覆盖；筛选后保留隐藏选择见 U4；真正供应商 ZIP 导出可用，分配页生成按钮却只有占位提示，见 U3。 |
| M4 图纸 / drawings | PASS（关联流程）；SKIP（PDF 像素） | 上传 2 页 TST-001_A.pdf 与无法识别的 unmatched.pdf；预览唯一匹配/未匹配，人工指定后确认两项。初次遇到状态过期提示，保存/F5 后重新预览成功。恢复库中给未报价的 003 复用图纸→解除→重关联；对已有报价的 001 禁止静默改图并提示新建询价版本。PDF 查看器黑屏，不能声称实际多页画面通过。 |
| M5 报价/比价 / quotes and comparison | FAIL（F2）；主要流程 PASS | A 两条有效报价+UNKNOWN，确认只写入两条，错误行保留；B 只报 001，漏报 002 可见，确认锁定时有异常警告；A 第二轮范围缩为 001，降价至 16；共同一项 A/B=32/38 元，整体最低组合=103.25 元；下载并读取 XLSX/ZIP/CSV。漏报单 RFQ 编号错误见 F2。 |
| M6 入口发现 / discoverability | FAIL（U3/U6/U7） | 图纸：业务页 1 次入口；供应商：分配页 1 次入口展开上方导入；备份：顶部 1 次入口；报表：顶部数据入口→导出业务单据→类型/范围→下载；字段设置：顶部 1 次入口。报表入口远离业务步骤，且内部导出仍用供应商文案。 |
| M7 保存/恢复 / persistence and restore | PASS | F5、历史切换；关闭整个 Chromium 进程并启动全新进程，无浏览器缓存仍加载原项目/报价；下载完整 ZIP，另一临时空库经 UI 恢复成功，两笔 RFQ 可见；只读佐证原 20 个历史版本逐项相同、PDF 字节哈希相同；非空库重复恢复被 UI 拒绝。恢复后 003 的关联操作仅作用于该临时副本。 |

Statuses describe exploratory missions, not a new automated suite score. M4's relation operations pass but PDF rendering remains unverified. M7 verifies this synthetic backup, not every archive or platform.

## F1 — P1 业务显示：跨步骤状态未刷新 / Stale cross-step business display

**复现：**新建空白正式询价→导入 12 项→导入供应商→在分配页给 TST-001/002 添加 A/B，再给 003 添加 C→切回“物料与图纸”。

**预期：**物料表分别显示 2/2/1 家；图纸管理下拉框立即含当前 12 项。
**实际：**分配页正确显示 A/B/C 关系，物料页所有行供应商数仍为 0；图纸行下拉框为空，底部仍提示“请先进入正式工作并添加物料”。保存+F5 后表格恢复 2/2/1，图纸下拉框也恢复。未证实存储丢失，确认是用户可见状态不同步。

**建议 ChatGPT：**在导入/分配完成、切业务步骤时同步更新依赖视图及启用状态；无需买方刷新。复验须从空白 RFQ 连续操作，避免每步 F5 掩盖问题。

**English:** Import and allocate without reloading; allocation shows valid relationships while the item table still shows zero and drawing controls lack the imported rows. Save/reload repairs the display. Synchronize dependent views and controls after mutations; do not rely on reload between steps.

证据：[分配关系](08-partial-allocation.png)、[刷新前全 0](11-items-stale-assignment.png)、[刷新后 2/2/1](12-items-after-refresh.png)、[图纸控件缺项/陈旧提示](10-drawing-match.png)。

## F2 — P1 业务追溯：漏报 CSV 使用演示 RFQ 编号 / Missing-quote CSV uses demo identity

**复现：**当前正式 RFQ `RFQ-1792035284104-Q9RJT3`→报价回收→供应商 B，只报 001、漏报 002→“导出本供应商本轮漏报 CSV”。关闭重开浏览器后再次导出仍相同。

**预期：**CSV 的 RFQ 编号对应当前正式询价。
**实际：**两次下载均写 `RFQ-DEMO-001`，行内 SUP-B/TST-002、数量 3 正确。跨 RFQ 追踪时可能错误归档。实际内部比价单下载名则包含正式 workspaceId，口径不一致。

```csv
"RFQ编号","供应商编码","报价轮次","报价版本","RFQ Line ID","存货编码","存货名称","询价数量","询价单位"
"RFQ-DEMO-001","SUP-B","1","1","RFQ-L00002","TST-002","虚构物料2","3","件"
```

**建议 ChatGPT：**明确并统一 workspaceId 与业务 RFQ 编号；新建正式工作不得沿用演示编号，所有单据由当前项目身份生成。至少用两笔正式 RFQ 分别导出核对，不能只核对行数。

**English:** The missing-quote export labels the formal project as RFQ-DEMO-001, including after a fresh browser launch. Correct project identity across new RFQs and all exports; verify identity, not just item counts.

证据：[正式 RFQ 上下文](34-missing-rfq-context.png)、[首次 CSV](missing-B.csv)、[重开后 CSV](missing-B-reopened.csv)。

## U3 — P2 入口与实现不符 / Placeholder generation action

分配 2/12 后点击“生成已分配询价单”，弹窗原文：“原型动作：允许生成。已覆盖 2/12 项，未覆盖 10 项将保留在当前 RFQ 中。正式 M4 再实现 Excel 文件生成。”没有下载。

这条快捷路径标为 **NOT_IMPLEMENTED**，不把整项“询价导出”误报为不可用：数据与备份→业务单据中的实际供应商导出成功（两条分配行+两份 PDF ZIP，无内部报价）。

建议直接接入现有导出流程并带入供应商/分配范围；未接入前明确“预览/尚未实现”，避免醒目的蓝色生成按钮让人以为已发起下载。

**English:** The assignment-page Generate action only shows a prototype alert, while actual supplier export exists elsewhere. Route the shortcut to the working flow or label its incomplete state explicitly.

证据：[生成入口与部分分配](09-filter-selection.png)、[实际供应商询价包](supplier-A-package.zip)。

## U4 — P2 隐藏选择缺少说明 / Hidden selections need explicit feedback

选中 001/002 后，搜索 TST-003：画面只见未勾选的 003，仍显示“已选 2 项”，A/B 卡片为 2/2，操作按钮依然面向隐藏的 001/002。保留跨筛选选择可以合理，但没有“当前隐藏 2 项”或清单提示，容易误操作；不是已证实系统选错对象。

建议拆分“本页/筛选可见/隐藏已选”，提交确认列出物料编码，提供“清除隐藏选择”。

**English:** Filtering preserves selected hidden rows without distinguishing visible and hidden counts. Add hidden-selection counts and show affected item IDs in confirmations.

证据：[仅显示 003 却已选 2 项](09-filter-selection.png)。

## U5 — P2 视觉：表头滚动后缺失 / Column names disappear while scrolling

在 12 项/100 项表内滚动到低处，四步导航和筛选行仍占顶部，列名行消失；采购员读数字时难以分辨数量/供应商数。截图里能看到顶部筛选行与下方数据行，但列名已不在视口。

建议统一导航、列名和筛选行的粘性偏移，避免数据被覆盖；在 1366×768 和内部表格滚动区域复核。

**English:** Scrolled views retain the filter row while column names disappear. Coordinate sticky offsets and preserve context at typical laptop heights.

证据：[滚动后的表格](11-items-stale-assignment.png)。

## U6 — P2 单据文案：内部导出仍写供应商询价 / Wrong internal-export label

数据与备份→导出业务单据→选择“内部比价议价单”：按钮仍写“下载当前供应商询价 Excel”。实际选择 A/B 后下载 `SRM_比价议价单_RFQ-1792035284104-Q9RJT3.xlsx`，两张表及价格内容正确。

建议随类型动态改名，并明确“仅内部使用”；比较页已有 A/B 选择与报告区 A/B 选择各自独立，建议带入并提示，避免重复选择。

**English:** Internal comparison export retains a supplier-RFQ button label although the downloaded file is correctly internal. Update the label and clarify the separate supplier selection.

证据：[内部类型+错误按钮文案](27-internal-export-label.png)、[实际内部 XLSX](internal-comparison.xlsx)。

## U7 — P2 布局与信息层级 / Density and hierarchy

1366×768 首屏主要被标题、当前项目、保存提示及工具区占用，物料行不在首屏；960 像素的分配页左右区变为上下堆叠，选物料后需再滚动寻找供应商。760 顶部入口换行，未观察到被遮挡；960 文档无横向溢出。没有把正常表内横向滚动当作页面溢出缺陷。

建议首屏压缩项目/保存/备份信息，提供可折叠项目区；960 下提供固定的“对所选物料分配”操作栏或供应商抽屉，保留可见已选数量。

**English:** Laptop-height layouts spend most of the first screen on administrative content. At 960px, allocation becomes a long vertical workflow. Compact the header/project block and keep relevant assignment actions close to selection.

证据：[1366](02-start-1366.png)、[960 首屏](03-start-960.png)、[760](04-start-760.png)、[960 分配](32-allocation-960.png)。

## U8 — P2 陈旧导入来源/保存提示 / Stale source and save hints

A 用 quotes.xlsx 导入后，切 B 用粘贴导入，文件区仍显示“来自 quotes.xlsx…请核对报价后明确点击写入”；B 明细实际上是粘贴的 19 元。类似地，已自动保存后供应商区还提示“记得点击保存”。这会混淆当前供应商/当前操作与上一次文件来源；未据此断言原始凭证数据已损坏。

建议切供应商/轮次/输入方式时清理或标记“上次文件”，并使操作反馈与当前自动保存状态一致。

**English:** A previous supplier's file status remains after pasting another supplier's quote. Clear or scope transient provenance and save messages to the current operation.

证据：[B 粘贴报价但文件区仍显示 quotes.xlsx](17-quote-missing.png)。

## 下载核对与边界 / Downloads and limits

- [business.xlsx](business.xlsx)：3 Sheet，12 个物料、3 家供应商、A 一轮两条+A 二轮一条+B 一轮一条，共 4 条报价，包含阶梯及商务备注。
- [supplier-A-package.zip](supplier-A-package.zip)：仅 A 的 001/002 两行，空白待填报价列；原名 TST-001_A.pdf 和 unmatched.pdf 均在包内。未包含 B 的报价或内部选择。
- [internal-comparison.xlsx](internal-comparison.xlsx)：比价汇总、报价议价明细；A 二轮 16、B 一轮 19；数量 2，同范围行金额公式为 `ROUND(单价*数量,2)`，合计仅计共同有效行。XML/公式及页面数值已检查，未启动桌面 Excel 重算。
- [100 项跨页选择](22-items100-selection.png)、[负数校验](24-invalid-qty.png)、[恢复后的比价页](29-restored-comparison.png)、[重复恢复拒绝](31-repeat-restore.png)、[比价数值](35-comparison-totals.png)。
- 图纸弹窗、文件名、页码请求及下一页入口确可操作，但 [云端 PDF 画面](13-pdf-preview.png) 呈黑屏。**SKIP：PDF 两页内容像素及缩放正确性、Windows 双击 BAT/文件窗口/PDF 查看器、桌面 Excel 渲染和长期运行。**未要求用户重复常规人工测试。
- 原始邮件/截图归档、正式 ERP/历史采购价仍 **NOT_IMPLEMENTED/范围外**；未当作新回归缺陷。

## 证据来源与保留 / Provenance and retention

本目录是本轮独立探索原始截图和轻量下载证据，均为虚构资料；图片经过实际打开审查，未作标注或内容改写。Git 分支上的文件随仓库保留，无 Actions 14 天过期；访问受该私有仓库权限限制。

These screenshots and exports come from this independent session, not existing CI artifacts. They remain in the repository evidence branch, subject to repository retention/access.

完整操作 trace 约 36MB、完整备份约 240KB，仅在本会话 `/tmp/srm-buyer-evidence/` 保留，不大量提交 Git，亦未冒充已上传 Actions Artifact。全体本地文件大小及 SHA-256 见 [manifest](local-evidence-manifest.json)；manifest 有文件不代表它已上传，本目录可实际打开的文件才是远端证据。临时会话删除后原始 trace/备份可能不可用；核心复现步骤、关键截图和下载文件已持久写入 GitHub。

Full trace and full backup remain session-local and may expire with the environment. The manifest indexes local originals; only files actually present in this directory are remotely published. The report does not claim desktop/native rendering or exhaustive production coverage.

**交 ChatGPT：优先处理 F1/F2，再处理误导入口和内外部单据文案，随后改善隐藏选择与滚动布局；修复后按连续用户路径定向复验。Codex 本轮只测试和发布证据，未修复、未合并。**
**Handoff: fix F1/F2 first, then misleading generation/export controls, selection feedback and layout. Retest continuous buyer workflows after fixes. Codex tested and reported only; no merge.**
