# PR #24 V3.1 独立对照验收 / Independent visual parity and business retest

**视觉一致性：FAIL，尚不能宣布完整 V3.1 接入完成。既有核心业务回归：PASS（本轮实测范围）。原 P3-01：PASS，修复有效。**

分别统计：业务 **23 PASS / 0 FAIL / 3 NOT TESTED**；视觉 **4 PASS / 5 FAIL（P2）/ 2 NOT TESTED（原型细节基线不足）**。P1=0、P2=5、未解决 P3=0。两个维度不相加；业务正确、CSS 加载、CI 成功均不能代替视觉签字。本轮仅测试并报告，**不建议将 PR #24 宣称为整体验收通过，不合并**。

## 任务、版本与证据边界 / Task and version scope

已读取 PR #24 说明、全部 8 条评论、最新开发提交，以及指定 [视觉跟踪文档](https://github.com/yudacheng666/SRM_System/blob/076561a1d3e1c14a6bbe405f0867cbb323b0a36c/docs/ui/20261019-v31-integration-parity.md)。原始内容存于 [github-initial.json](evidence/github-initial.json)及 [parity-task.md](evidence/parity-task.md)。不沿用上一轮 67b1a762 的 PASS 作为本候选结论。

| 对象 | 精确版本 / Identity |
|---|---|
| 本轮产品 HEAD | `076561a1d3e1c14a6bbe405f0867cbb323b0a36c` |
| PR #23 视觉参考 HEAD | `67a3a7ca02465306c514da5fc2ac61409495a3ae` |
| PR #24 分支（未写入） | `feat/20261019-srm-ui-v3-integration` |
| 开发基线（未写入） | `457edcf4214220deacb4288b372ea78f144e5333` |
| main（未写入） | `f330de510f97c552629052ff1841d7223194e7f8` |
| 独立证据分支 | `test/20261019-pr24-v31-parity-uat` |
| 浏览器 | Chromium 154.0.8037.57，Playwright 1.58.2，真实云端 Linux 浏览器 |
| 隔离正式程序 | `/tmp/srm-v31`，真实 M1-Lite Python/SQLite/S4；`SRM_DATA_DIR=/tmp/v31/data` :8960；空白恢复目录 `/tmp/v31/restore` :8961 |
| 参考原型 | `/tmp/srm-v31-reference/prototype/ui-v3-concept` :8962，仅作视觉参考，不当作正式程序/业务通过证据 |
| 执行时间 | 主路径 2026-10-19 21:17–21:27 Asia/Shanghai（原始日志 13:17–13:27 UTC）；随后只读视觉/PDF补验至约21:30 |

新浏览器、新临时 SQLite、全虚构物料/供应商/图纸/条款与报价；没有真实企业数据。通过 GUI 操作全部业务，数据库只以 `mode=ro` 核对版本和快照，没有 API 灌入状态。没有运行既有 41 项用例代替本次验收。源程序、原有测试程序、CI、开发分支和 main 均未修改；提交只含报告、原始证据、虚构输入和下载文件，没有提交修改后的测试程序。

## CI 门槛 / Exact-candidate CI gate

开始前两套均 completed/success，才启动独立验收；结束时再次核对仍成功、HEAD 未变、PR 仍 Draft/未合并，见 [github-final.json](evidence/github-final.json)和 [refs](evidence/remote-refs.txt)。

| 工作流 | 状态与真实计数 |
|---|---|
| [UI Unified #38 / 39257002067](https://github.com/yudacheng666/SRM_System/actions/runs/39257002067) | success；41 Chromium passed / 0 failed / 0 skipped；Python43、Node10；Windows business safety success。 |
| [S3/S4 #125 / 39257001999](https://github.com/yudacheng666/SRM_System/actions/runs/39257001999) | success；41 Chromium passed / 0 failed / 0 skipped；Python43、Node10；Windows SQLite/S4/supplier ZIP success。 |

原始日志：[UI](evidence/ci-ui.txt)、[S3/S4](evidence/ci-s3s4.txt)。两套实际 checkout 均为 GitHub PR 合成 merge commit `7ed0833…`，完整 SHA 在结束元数据原始 checkout 行；合并组成是本候选与上述开发基线。本轮 GUI 直接 checkout 产品 HEAD。两个41是同一套场景两次执行，不是82项不同验收。

两套 CI 都有 artifact storage quota 上传错误，continue-on-error 仅令附件步骤非阻断，真实测试成功；未宣称有已上传的 Actions 附件。本次另用 Git 证据分支归档。前一候选因旧颜色断言失败，与本候选不同；本轮真实浏览器背景确为 `rgb(246,248,251)` / `#F6F8FB`，但该颜色正确只证明一个视觉 token。

## 逐页对照结论 / Page-by-page visual parity

所有对照在同一 Chromium、相同分辨率下真实打开两套页面。参考有18条演示物料，正式测试为3条，不按文字/行数或像素差判错；对照信息层级、空间分配、关键状态和入口。参考截图不能证明 SQLite/PDF/导出等正式功能通过。

| 模块 | 已改造 / Improved | 旧结构残留 / Remaining gap | 必须保留的正式差异 / Legitimate difference |
|---|---|---|---|
| 导航、顶栏、RFQ | S 品牌、深色导航、活动标记、步骤轨迹、背景及标题语言接近 V3.1 | 顶部仍独立叠加 RFQ条、长期提示和管理抽屉；展开时留白问题见 P2-V02 | 真实 workspaceId、SQLite 保存/冲突状态必须保留，不能替换成演示编号/假状态 |
| 项目/总览 | 新建/保存/历史入口均可用 | 当前仅展开全局管理区，不是参考的独立总览；其中真实空白缺陷 P2-V02 可客观验收 | 参考总览为概念占位；不把缺少假“未启用持久化”卡片判产品错误，深度功能布局待设计 |
| 物料/图纸 | 表格、过滤、图纸入口和真实数据保留 | 新 V3 标题被旧 CSS 隐藏，P2-V01；仍是无页面标题的旧工具/筛选结构 | ERP、排序、批量更新、PDF管理比简化参考复杂，不能删字段求相同 |
| 供应商分配 | 新阶段标题、选中态及追加关系保留 | 窄物料区/过宽供应商区和1024堆叠仍为旧结构，P2-V03 | 双向视角、搜索、关系保护有业务价值；可保留额外视角，不能借此接受主视角缺乏信息密度 |
| 报价/修订 | 新页面标题、灰阶锁定和锁定说明已落地 | 原三块导入面板仍先占屏；同轮 V2 不展示上版本价格/变化，P2-V04 | Excel/粘贴/手工来源、凭证、商务条款和确认历史必须保留，可按当前版本状态按需显示 |
| 比价/决策 | 新标题、可比口径及理由业务保留 | 旧提醒/表头/下置分析，推荐与人工决定区分仍不足，P2-V05 | 不同供应商范围、实际轮次和报表规则必须保留，不复制原型虚构算法 |
| 设置 | 新标题、统一模板卡片；真实模板下载可用 | 无完整可执行目标布局可逐项判 parity | 参考只是三张占位卡；真实模板/字段/S4 必须保留，深度设计 NOT TESTED |

视觉检查项：品牌/基础主题 PASS，导航与真实 tab 同步 PASS，P3锁定呈现 PASS，三分辨率无 document 横溢/侧栏遮挡 PASS；下列5项 FAIL；项目总览及设置的完整目标细节尚未定义，分别 NOT TESTED。**“DOM 中存在五个标题”不能代替“买家看得到五个标题”。**

## 五项 P2 / Five P2 findings

### P2-V01 物料页 V3 标题被旧 CSS 隐藏 / Items heading hidden by legacy CSS

页面：物料与图纸；类型：视觉/旧版残留。复现：正式新建并导入物料→进入物料页；1024/1366/1600均可复现。预期：与参考一致，流程导航后可见页面阶段、标题与说明。实际：`#srmV3PageStage-items` 存在但 `display:none`、clientRects=0；买家看不到“物料与图纸 / 清单与技术资料”。旧规则 `body.ui-buyer-mode #items .ui-panelLead{display:none}` 压过新增呈现规则。影响：物料页没有其他四页的新层级，直接违反五页统一标题验收。

证据：[候选1366](evidence/prod-1366-items.png)、[参考1366](evidence/ref-1366-items.png)、[DOM/计算样式](evidence/visual-probe.json)、[三分辨率尺寸](evidence/product-geometry.json)。建议：调整旧隐藏规则与新标题的作用范围，保留原业务控件和事件。未修复。

### P2-V02 收起抽屉仍被撑高 / Collapsed management drawers stretch into empty cards

页面：所有页的项目管理区；类型：布局/操作体验。复现：任一正式页点击侧栏“询价项目”（或首次启动默认展开项目）；另外两个管理抽屉保持收起。预期：只有实际展开内容占空间，收起入口保持紧凑，不压走当前业务。实际：1024下三个卡片高度均329.97px，1366均311.38px，1600均231.38px；其中两张 closed 抽屉 summary仅28/32px，却被撑成大空白卡。影响：管理操作后工作区明显后退，笔记本首屏浪费，未达到按需管理的结构目标。

证据：[1024](evidence/prod-1024-projects.png)、[1366](evidence/prod-1366-projects.png)、[1600](evidence/prod-1600-projects.png)，browser.jsonl 中 project drawer geometry。参考项目总览虽属占位，不要求照搬其假业务卡；本缺陷来自正式页自己的 open/closed 几何状态。建议：隔离管理呈现或修正 grid stretch，仅令展开内容占高，避免全局挤压。未修复。

### P2-V03 分配主视角仍是旧比例与堆叠 / Allocation retains legacy proportions and stacking

页面：供应商分配→按供应商→选 U24-B；类型：视觉/信息架构。预期：参考窄供应商栏+主物料工作区，能快速看物料、规格、数量及全部关联方。实际：1366/1600供应商区占大块宽度，物料区偏窄；1024整块供应商名单在上、物料表在下，首屏只有2家供应商也看不到物料行。候选该视角表头仍是“已关联/物料/分类”，参考“全部关联供应商/数量/当前供应商”信息不在相同工作区完整呈现；要切旧按物料视角或滚动找信息。影响：批量分配与核对需反复移动/切换，形式仍不像参考工作区。

证据：[候选1024](evidence/prod-1024-assign.png) vs [参考1024](evidence/ref-1024-assign.png)，[候选1366](evidence/prod-1366-assign.png) vs [参考1366](evidence/ref-1366-assign.png)，[候选1600](evidence/prod-1600-assign.png)。数据关联本身仍为每行A+B，无覆盖错误。建议：保留真实双向逻辑，重排主工作区比例/列信息，降低非当前操作入口密度。未修复。

### P2-V04 同轮修订缺少“上版本”差异 / Same-round revision lacks previous-version differences

页面：报价回收；类型：信息架构/旧结构残留。复现：A R1V1首行10元→新增本轮V2→改9元→查看V2及原V1。预期：参考明确展示上版本10、当前9、已调整及变化数量；导入工具不应盖过当前版本核查。实际：原V1存在且可切回，但V2仍显示旧“上轮单价/单价变化”列，R1无上轮，因此两列为“—”；没有同轮版本变化摘要，大片手工/粘贴/文件面板仍先于版本审核。影响：要手动切版本找差异，未达到参考的只看变化行/改动可见。

证据：[参考V2表](evidence/ref-1366-revision-table.png)、[候选V2表](evidence/visual-same-round-version-columns.png)、[列和各单元格](evidence/visual-probe.json)、[候选首屏](evidence/prod-1366-quoteImport.png)。这不是断言旧“上轮”字段算法算错，而是目标“上版本”呈现未实现；数据/确认历史测试通过。建议：增加只读版本对比投影、突出变化行，保留跨轮价格和原历史。未修复。

### P2-V05 比价仍是旧分析顺序与决定语义 / Comparison retains legacy analysis hierarchy and decision affordance

页面：比价与议价；类型：视觉/决策信息架构。复现：两供应商R1确认后进入比价，随后记录本轮人工决定。预期：参考上方先有比较范围/待决定/人工决定/决定金额和行动提示，再是可筛选决策清单；系统推荐和人工决定分开。实际：旧“报价比较”标题、说明、历史价（未接入）和供应商表头先占屏，金额分析仍在整表下；没有参考的待决定/并列筛选及独立推荐/人工决定列。原始确认后尚未点击定标，`awards`已含A/B而`manualAwards=[]`，UI却直接放在“最终选择”列。影响：不能从首屏快速区分推荐、尚未人工确认和真实采购决定，单纯换颜色不能签 parity。

证据：[候选1366](evidence/prod-1366-quotes.png) vs [参考1366](evidence/ref-1366-compare.png)，[候选1024](evidence/prod-1024-quotes.png)，[人工定标前真实快照](evidence/03-R1-confirmed.json)及当时 [V2草稿比价文字](evidence/05-revision-draft.txt)。这是现有M0呈现/状态语义差距，**未证明为本提交新增的报价算法回归**；本轮无并列报价数据，不据此推断并列算法错误。建议：保留已验证计算，以现有人工标记区分推荐与决定，重排决策摘要/筛选，不复制概念原型业务模型。未修复。

## 业务回归 / Business regression (23 PASS)

| ID | 结果 | 真实操作及结果 / Operation and result |
|---|---|---|
| B01 | PASS | 正式新建RFQ、新临时SQLite，空白状态独立 |
| B02 | PASS | Excel导入3物料，同码M16/M20分行，ERP扩展保留 |
| B03 | PASS | 导入2家供应商，名称/编码落入当前询价 |
| B04 | PASS | 按物料关联A、按供应商追加B，3行×2家=6关系，无覆盖 |
| B05 | PASS | PDF匹配有单候选/多候选/未匹配，预览不改保存版本/快照 |
| B06 | PASS | 明确确认唯一候选后只给RFQ-L00001关联1PDF，其余2文件不静默落入物料 |
| B07 | PASS | 重启后实际PDF读取与新会话原生查看器显示“V31 FICTIONAL D16” |
| B08 | PASS | A/B报价Excel真实导入，正常/不供货/明确未报价、凭证/商务条款保留 |
| B09 | PASS | A R1V2草稿首行9元时，比价仍使用已确认V1的10元；确认V2才采用9 |
| B10 | PASS | 原确认V1对象不变，UI切回V1可见10，V2可见9；三份确认历史保留 |
| B11 | PASS | 原P3锁定修复：三分辨率禁用灰阶、not-allowed、就近锁定说明；重启后仍正确 |
| B12 | PASS | 同范围金额A590/B570，逐项最低540；缺价/不供货不当零元 |
| B13 | PASS | 非最低价选择空原因被拦截，填虚构交付原因后两项选B，金额570 |
| B14 | PASS | 实际CSV含BOM、真实RFQ编号/Line ID，明细数量×价格及合计独立重算 |
| B15 | PASS | 内部3-sheet业务表、2-sheet比价表的ERP/规格/轮次/原因及ROUND/SUMIF引用正确 |
| B16 | PASS | 实际A/B供应商ZIP各3物料、报价空白、无另一方或ERP私有字段；PDF字节一致；整包含2独立供应商ZIP |
| B17 | PASS | 设置入口真实下载空白物料模板，单sheet及10表头正确（非全模块模板round-trip） |
| B18 | PASS | CSV/业务表/比价表/模板/供应商包/完整备份导出不改revision/raw snapshot SHA/业务/PDF |
| B19 | PASS | 保存后F5精确恢复报价、物料、关系、定标原因和PDF |
| B20 | PASS | 已选B时新建第二RFQ为空，标题未选择，再返回原项目无串写 |
| B21 | PASS | 真实终止并重启Python服务，同目录两RFQ、版本/raw SHA/PDF不变 |
| B22 | PASS | S4下载→空白恢复精确相等；非空恢复明确拒绝且不覆盖；备份SQLite integrity_check=ok |
| B23 | PASS | 非法表头XLSX及清空预览不改保存版本、行号、业务或快照 |
| NT-B1 | NOT TESTED | Windows本机GUI：云端Linux环境 |
| NT-B2 | NOT TESTED | Windows原生Excel重算/打印/安全提示：检查实际文件与公式，不代替原生行为 |
| NT-B3 | NOT TESTED | 真实企业采购员生产UAT：全部为虚构资料 |

主项目 `RFQ-1792415853779-CRPV46`，最终revision12；空白第二项目 `RFQ-1792416228883-WKWT4B`，revision1。金额输入：A首行9×10+20×25=590，B12×10+18×25=570，理论最低9×10+18×25=540。全部CSV、XLSX、ZIP原样归档；详见 [文件/状态检验](evidence/artifact-inspection.json)、[供应商隔离检验](evidence/supplier-export-inspection.json)。本节验证既有业务合同，不表示候选已经实现PR23全部决策交互语义，P2-V05另行阻断视觉签字。

## 原 P3-01 专项结果 / Original P3-01 result

**PASS，三个尺寸及真实重启后均验证。** `disabled=true`、背景 `rgb(232,237,243)` / #E8EDF3、cursor=`not-allowed`；hover后仍灰；附近显示“已确认并锁定 · 修改请新建版本”，title解释需新建版本。原V1无修改，UI导航/hover/PDF/导出操作后的SQLite原始快照不变。

截图：[1024](evidence/P3-fixed-1024.png)、[1366](evidence/P3-fixed-1366.png)、[1600](evidence/P3-fixed-1600.png)、[重启后](evidence/P3-after-restart.png)。没有把P3修复通过扩大成全部V3.1布局通过。

## 证据说明 / Evidence qualifications

- [主路径日志](evidence/browser.jsonl)有94个辅助PASS、0辅助FAIL、0 driver-error、0 pageerror；两origin各有favicon404，保留。辅助数不替代独立业务/视觉case计数。
- 首次15秒PDF帧仍空，保留 [原图](evidence/PDF-real-preview-after-restart.png)；未将空帧标通过。相同已保存PDF在新会话20秒截图已实际显示：[显示内容](evidence/PDF-fresh-session-20s.png)，附独立trace。输入PDF无解析警告，字节哈希与下载/恢复一致；没有修改原件来掩盖问题，也未作性能SLA结论。
- 主trace通过CRC检验并实际用Trace Viewer打开。查看器首轮路径错误属于归档辅助工具，原始错误页 [保留](evidence/trace-viewer-first-wrong-path.txt)，修正路径后 [实际加载](evidence/trace-viewer-validation.png)与成功日志保留，不属于产品业务driver错误。
- 主快照及后续只读probe后全状态相等，见 `20-final-after-probes.json`。截图、原始JSON、日志、trace均未改写；[SHA256SUMS](SHA256SUMS)可核对。没有修改或合并任何产品/开发/main分支。

## English report

**Visual parity FAIL: do not declare PR #24 fully accepted as V3.1. Legacy core business regression PASS within tested scope; original disabled-button P3-01 PASS/fixed.** Product SHA is exactly `076561a1d3e1c14a6bbe405f0867cbb323b0a36c`; the approved PR #23 reference is `67a3a7ca02465306c514da5fc2ac61409495a3ae`. Both exact-candidate Actions succeeded before testing, each with 41 Chromium passes, Python43 and Node10, using the documented PR synthetic merge checkout. Artifact uploads still failed due to quota; separate Git-backed evidence is provided.

Real Chromium operated the actual M1-Lite Python/SQLite application with fresh isolated synthetic-only data. PR #23 was opened separately strictly as a design reference. Matched 1024×768, 1366×768 and 1600×900 captures distinguish improved branding/theme/navigation/locked states, legacy layout remnants and necessary real-business differences. Background #F6F8FB is correct but not proof of design parity.

**Five P2 findings:** (V01) the new Items stage heading exists in DOM but a legacy selector hides it in buyer mode at all three sizes; (V02) closed management drawers stretch to the height of the open project drawer, creating large empty cards; (V03) supplier-first allocation retains oversized supplier space/narrow material space and stacks the material table below the first laptop screen, unlike the reference rail/workspace; (V04) same-round V2 has no previous-version/difference projection despite intact V1 history, and import tools dominate; (V05) comparison retains the old explanation/table-first hierarchy and does not clearly separate automatic recommendations from manual final decisions. These are parity/UX findings, not five newly introduced purchasing-calculation regressions. Preserve business rules and histories while fixing presentation; do not copy the concept's in-memory business model.

Business cases: **23 PASS / 0 FAIL / 3 NOT TESTED**. Visual gates: **4 PASS / 5 P2 FAIL / 2 NOT TESTED** (project/settings reference pages lack detailed executable target designs). Do not add the two axes. The tested flow includes real imports, additive assignment, three drawing-match states with explicit unique confirmation, native real PDF display, confirmed quotes and revision/history checks, arithmetic and justified non-lowest award, real CSV/XLSX/supplier ZIPs, F5/RFQ isolation/actual process restart, S4 restore/overwrite refusal and invalid-preview safety. Native Windows GUI, native Excel behavior and production buyer UAT remain NOT TESTED.

P3-01 is genuinely fixed: disabled grey #E8EDF3, not-allowed cursor, visible locked explanation at all three sizes and after restart, with no history mutation. Main GUI log retains 94 helper passes, zero driver/page errors and favicon noise. The initial blank PDF frame and fresh-session successful render are both retained, as is an archive-viewer path mistake followed by successful trace loading. Only new reports and evidence are committed; no product, test program, CI, development branch, baseline or main change, and no merge. **Return remaining visual gaps to ChatGPT and keep PR #24 unmerged.**
