# PR #24 — 独立采购员定向复验 / Independent buyer retest

**产品 / Product HEAD:** `10d35fa6b4935f9376cb50afc298925362612698`  
**测试日期 / Executed:** 2026-10-19 UTC / 2026-10-20 Asia/Shanghai.  
**TEST-ONLY：仅新增文档和匿名证据；未修改产品、原测试、CI、开发分支、main，未合并。**  
Documentation/evidence only; no product/test/workflow modifications and no merge.

## 结论 / Verdict

**视觉一致性：FAIL；业务功能：FAIL（并列最低选择的理由校验有误）。数据持久化与安全回归：PASS。**
**Visual parity: FAIL. Business acceptance: FAIL due to incorrect tied-lowest selection semantics. Persistence/safety regression: PASS.**

原五项 P2 的 V01–V04 已实际消除；V05 的自动建议/人工来源、初始人工数0和实际选择计数已修正，但完成并列项人工选择后仍显示“并列最低待核对1”，因此 V05 完整关闭条件判 FAIL。另发现并列最低的第二家被误称为“非最低价”并强制理由。没有发现 P0/P1、已确认历史被覆盖或数据丢失；可用理由绕过继续完成虚构采购，但不建议以此版本宣布完整视觉/业务验收通过。先交由开发者修复，再针对这两项独立复验；不建议直接扩大到无指导采购员试用。

V01–V04 are fixed in observed real UI. V05 correctly distinguishes suggestions from human awards, but its outstanding tie indicator remains after a completed human decision. Selecting the second supplier at the same lowest price is also incorrectly forced through the non-lowest justification dialog. No P0/P1, confirmed-history overwrite or data loss was observed. The workflow completes with a justification workaround; this does not constitute full acceptance. Recommend correcting these two issues before an unguided buyer trial.

| 独立案例组 / Case group | PASS | FAIL | NOT TESTED |
|---|---:|---:|---:|
| 视觉定向 V01–V05 + 原 P3 / Visual targets + original P3 | 5 | 1 | 0 |
| 概念页深度一致性 / Concept-only parity targets | 0 | 0 | 2 |
| 业务案例 B01–B25 / Independent business cases | 24 | 1 | 0 |
| 外部环境/真实运营 / External environments/operations | 0 | 0 | 3 |

这些是报告中的业务案例计数，不是自动化断言数；V05 与 B25 涉及相同并列情景，不应相加当作独立缺陷。新增问题 **P2×1、P3×1**；原 P3 持续 PASS。Case counts are not assertion counts; overlapping visual/business observations are not additional defects.

## 门槛与来源 / Gate and provenance

已完整读取 [最新交接](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6278948580)、[详细验收](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6270799638)、全部 PR 评论与 [本 SHA 视觉清单](evidence/parity-task.md)。原始快照：[GitHub metadata/comments/jobs](evidence/github-initial.json)，相关交接全文：[HANDOFF.md](HANDOFF.md)。

| CI（浏览器前已核实 / verified before GUI） | 最终状态 / Result | 日志 / Raw logs |
|---|---|---|
| [UI Unified #43 / 39280241912](https://github.com/yudacheng666/SRM_System/actions/runs/39280241912) | completed / success，Linux + Windows success | [ui](evidence/ci-ui.txt) |
| [S3/S4 #130 / 39280242140](https://github.com/yudacheng666/SRM_System/actions/runs/39280242140) | completed / success，Linux + Windows success | [s3s4](evidence/ci-s3s4.txt) |

两套 Linux 日志均为 Playwright 42 passed，Python 43、Node 10 通过；这不是本轮独立测试的替代。CI 对 PR 合成 merge 执行，直接候选 SHA 的独立 GUI 在本轮另行执行。artifact 上传因仓库配额失败，是非阻断上传故障，不能称其截图已上传；本证据 PR 自行保存新截图。Both suites succeeded; artifact quota failures are explicitly separate from test outcomes.

旧对照来自 PR #26，证据提交 `4f8951b74a987d63f6737ab17fbad15fc5ea5ca7`、旧产品 `076561a1…`。本目录 [previous](evidence/previous/provenance.json) 是逐字节复制的历史证据，**未在本轮重跑旧版**。设计参考 PR #23 精确 SHA `67a3a7ca02465306c514da5fc2ac61409495a3ae`，本轮重新通过 Chromium 拍摄。The prototype is only a visual reference, never a functional acceptance substitute.

## 环境与操作 / Environment and method

- Linux Codex Cloud，真实 Chromium `154.0.8037.57`，Playwright `1.58.2`；真实 Python M1-Lite `serve.py`，产品未改动。
- 候选独立 worktree `/tmp/srm-r10`，证据分支 `test/20261020-pr24-five-p2-retest`，从准确产品 HEAD 创建。
- 临时 `SRM_DATA_DIR=/tmp/r10/data`；空目录恢复 `/tmp/r10/restore`；分页测试 `/tmp/r10/aux`，三个 SQLite 完全隔离。业务验收8970、恢复8971、视觉原型8972、分页辅助8973。
- 所有 XLSX/PDF、企业名称、ERP 字段和理由均虚构；主 RFQ `RFQ-1792449920474-GCGOHX`。三物料：同编码两规格 M16/220mm 数量10、M20/350mm 数量25；不供货底座数量4。甲方 V1 [10,20,不供货] → V2 [9,20,不供货]；乙方 [12,20,明确未报价]。甲/乙交期10/4天，MOQ均1。
- 仅通过真实 GUI 修改业务状态；SQLite 只读指纹核对快照版本、原始 snapshot JSON SHA256 与 PDF 哈希。完整动作源码在 [browser.jsonl](evidence/browser.jsonl) 的 step/command 中，辅助 [aux-browser.jsonl](evidence/aux-browser.jsonl)，未提交可执行测试程序、未改原测试。
- 未重复运行原有42条用例来代替独立验收；另设计同编码不同规格、同轮修订、并列价、61项跨页/Shift、重启/恢复、非法预览等路径。

## 五项 P2 与原 P3 / Targeted results

| 目标 / Target | 结果 | 独立观察与证据 / Observation and evidence |
|---|---|---|
| P2-V01 物料标题 / Items heading | **PASS** | 三尺寸标题真实可见、有非零布局高度，未被旧CSS隐藏。[1024](evidence/prod-1024-items.png) / [1366](evidence/prod-1366-items.png) / [1600](evidence/prod-1600-items.png) |
| P2-V02 收起抽屉 / Collapsed drawers | **PASS** | 三尺寸逐一打开项目/供应商/备份，其余收起高度只比summary多2px：30/28或34/32，不再相邻拉伸。[1024](evidence/V02-1024-uiDataTools.png) / [1366](evidence/V02-1366-uiSupplierTools.png) / [1600](evidence/V02-1600-uiProjectDetails.png) |
| P2-V03 分配布局和状态 / Allocation | **PASS** | 供应商视角左/右宽约291/625、308/770、375/937，保持双栏；真实数量与全部关联方可见。双向追加、61项Shift跨页、确认历史保护均通过。[布局](evidence/prod-1366-assign.png) / [物料视角](evidence/prod-1024-assign-item.png) / [分页](evidence/aux-shift-pagination.png) / [历史保护](evidence/V03-confirmed-history-protection.png) |
| P2-V04 同轮修订 / Same-round revision | **PASS** | GUI创建真实V2，前版10、现版9、-1/-10%；未确认草稿仍用10比价；确认V2后V1原对象和原价不变。[草稿](evidence/V04-V2-draft-diff.png) / [已确认](evidence/V04-V2-confirmed-diff.png) / [原V1只读](evidence/V04-original-V1-read-only.png) |
| P2-V05 决策层级 / Decision hierarchy | **FAIL** | 初始系统建议+人工0，人工B后计数1，再确认并列B后人工2/待决定0均正确。但“并列最低待核对1”仍保留，与完成状态矛盾；参见P3-U01。旧核心歧义已改善，不能将整个目标关闭。[初始](evidence/V05-before-any-human-choice.png) / [人工1](evidence/V05-one-human-choice.png) / [人工2但待核对1](evidence/prod-1366-quotes.png) |
| 原 P3 禁用确认 / Original disabled control | **PASS** | 三尺寸及真实重启后 disabled=true、灰色rgb(232,237,243)、cursor=not-allowed，旁边显示已确认锁定；V1不变。[1024](evidence/P3-fixed-1024.png) / [1366](evidence/P3-fixed-1366.png) / [1600](evidence/P3-fixed-1600.png) / [重启后](evidence/P3-after-restart.png) |

三尺寸页面均无文档级横向溢出、侧栏不遮挡内容；表格内部保留横向滚动以容纳真实字段。[实际几何](evidence/product-geometry.json)。背景实际 #F6F8FB；未使用旧背景断言。

## 新问题 / New findings

### P2-B01 — 并列最低的第二家被误判为非最低 / Equal-lowest supplier incorrectly requires non-lowest justification

**页面/类型 / Page/type:** 比价与议价；业务逻辑与操作体验 / comparison, business logic and usability.

**复现 / Reproduce:**
1. 导入并确认甲/乙报价：RFQ-L00002、M20/350mm、数量25，甲20元/10天，乙20元/4天，MOQ均1、相同币种税口径。
2. 在比价表点击第二家乙方的 ¥20.00 单元格。
3. 实际弹出“选择非最低价供应商 · 需要原因”，说明“其中1条并非最低报价”；不填理由不能确认。
4. 填写“虚构采购决策：并列20元时选择乙方4天交付”后才可继续并保存。

**预期/实际/影响 / Expected, actual, impact:** 两家20都属于最低；可因交期选择乙方，不应记录成价格更高的例外。实际被供应商顺序误导为非最低，采购员需制造“非最低理由”，导出报表的“非最低价选择原因”也保留这段记录，影响采购审批解释。No amount error was observed; the classification and resulting audit explanation are wrong.

**证据 / Evidence:** [原因弹窗](evidence/V05-tie-reason-dialog.png)，[两家均20的界面正文](evidence/09-reloaded-awards.txt)，[真实Excel报表](downloads/comparison-report.xlsx)，[报价与理由快照](evidence/05-awarded.json)，[原始trace](evidence/independent-v31-browser-trace.zip)。

**建议 / Direction:** 基于同范围有效数值最低价集合（适当精度）判定并列，非最低必填规则只适用于严格高于最低的价格；保留可选商务决策理由，不把并列者强制标成非最低。Developer to fix; no code change made here. Whether pre-existing or newly introduced is NOT ESTABLISHED: old product was not rerun.

### P3-U01 — 已完成人工选择仍显示“并列最低待核对1” / Outstanding tie counter survives completed human choice

**页面/类型 / Page/type:** 比价决策概览；UI状态语义/操作体验 / comparison overview, UI state semantics.

**复现 / Reproduce:** 接上例，分别为第一行非最低B及第二行并列B完成理由确认。人工已选2、待人工决定0；保存、刷新、进程重启，仍显示橙色“并列最低待核对1”。

**预期/实际/影响 / Expected, actual, impact:** 已解决的并列选择不应继续叫“待核对”；如果该数字仅是并列总数，应改为“并列最低项数”并区分已处理/待处理。Current label falsely suggests unfinished work and fails V05 closure, although actual manual awards and totals remain correct.

**证据 / Evidence:** [1366](evidence/prod-1366-quotes.png)、[1600](evidence/prod-1600-quotes.png)、[重启后](evidence/11-real-restart-awards.png)、[浏览器状态记录](evidence/browser.jsonl)。

**建议 / Direction:** 按人工确认/待复核状态计数未处理并列，或准确重命名为总量；不改变真实人工选择数据。

## 真实业务回归 / Independent business regression

| ID | 实际验收 / Executed check | 结果 | 证据 / Evidence |
|---|---|---|---|
| B01 | 全新隔离RFQ/空业务 / Fresh isolated RFQ | PASS | [initial](evidence/01-empty.json) |
| B02 | Excel物料预览与正式导入、同码两规格 / Real material import, duplicate code distinct specs | PASS | [preview](evidence/01-material-preview.png), [seed](evidence/02-seeded.json) |
| B03 | Excel供应商导入并保存 / Supplier Excel import | PASS | [seed](evidence/02-seeded.json) |
| B04 | 物料优先A再供应商优先B，6条关联追加 / Bidirectional additive links | PASS | [allocation](evidence/02-supplier-multi-allocation.png) |
| B05 | 61行物料视角Shift连选4项 / Item-view Shift range | PASS | [aux logs](evidence/aux-browser.jsonl) |
| B06 | 供应商视角Shift关联4项 / Supplier-view Shift links | PASS | [aux logs](evidence/aux-browser.jsonl) |
| B07 | 跨第1/2页追加，5项各保留A+B / Cross-page retained additive links | PASS | [aux final](evidence/aux-final.json) |
| B08 | 已确认报价后撤销关联被阻止且数据不变 / Confirmed history link protection | PASS | [guard](evidence/V03-confirmed-history-protection.png) |
| B09 | 图纸唯一/多候选/未匹配预览不落盘 / Drawing matching preview does not mutate | PASS | [proposals](evidence/03-drawing-match-candidates.png) |
| B10 | 正式确认仅关联唯一PDF、不误绑其他两项 / Unique drawing confirmation | PASS | [result](evidence/02c-drawing-confirmed.json) |
| B11 | 重启后真实Chromium PDF可见并正常关闭 / Native PDF render after restart | PASS | [PDF](evidence/PDF-real-preview-after-restart.png) |
| B12 | A/B Excel报价、凭证、条款与确认锁定 / Quote import, provenance, terms, lock | PASS | [A](evidence/04-quote-A-preview.png), [B](evidence/04-quote-B-preview.png) |
| B13 | V2草稿不进入正式比价 / Draft revision excluded from comparison | PASS | [browser checks](evidence/browser.jsonl) |
| B14 | V2确认后V1内容不变且UI只读 / Immutable original confirmed V1 | PASS | [V1](evidence/V04-original-V1-read-only.png), [revision snapshot](evidence/04-revision-confirmed.json) |
| B15 | 真正非最低B首行空理由不能确认 / Genuine non-lowest reason required | PASS | [empty reason](evidence/V05-empty-reason-rejected.png) |
| B16 | 人工0→1→2，决定/理由持久化，未报价非0 / Explicit awards retained, unpriced not zero | PASS | [awards](evidence/05-awarded.json), [reloaded](evidence/09-reloaded-awards.png) |
| B17 | 实际CSV RFQ追溯及数量×价格590/620 / Actual CSV identity and arithmetic | PASS | [CSV](downloads/common-scope.csv), [validation](evidence/download-validation.json) |
| B18 | 业务3表9条历史明细；比价2表及公式 / XLSX history and comparison formulas | PASS | [business](downloads/business.xlsx), [comparison](downloads/comparison-report.xlsx) |
| B19 | 供应商ZIP不泄露ERP/竞价、价格空白、PDF原字节 / Supplier export confidentiality | PASS | [A ZIP](downloads/supplier-A.zip), [B ZIP](downloads/supplier-B.zip), [checks](evidence/download-validation.json) |
| B20 | 保存与F5原始快照版本/hash/PDF一致 / Save and refresh exact snapshot | PASS | [before](evidence/07-before-exports.json), [after](evidence/09-after-F5.json) |
| B21 | 新RFQ清空供应商选择；返回原RFQ完整 / Cross-RFQ reset and return | PASS | [two RFQs](evidence/11-two-RFQ-final.json) |
| B22 | 真正终止PID734、重启进程后完整恢复 / Actual server process restart | PASS | [restart](evidence/13-real-restart.json) |
| B23 | S4真实下载、SQLite integrity、空目录恢复；非空拒绝覆盖 / S4 backup/restore safety | PASS | [backup](downloads/full-S4.zip), [restored](evidence/14-restored.json), [refusal](evidence/13-nonempty-restore-refused.png) |
| B24 | 非法导入预览/取消不改revision、RFQ行号/数据 / Invalid/cancelled preview has no autosave | PASS | [invalid](evidence/invalid-import.png), [final](evidence/19-final.json) |
| B25 | 第二家并列最低不应被称为非最低 / Equal-lowest classification | **FAIL** | P2-B01 above |

金额 / Arithmetic: A = 9×10 +20×25 = **590**；B = 12×10 +20×25 = **620**；理论最低 **590**；明确选择B两项 **620**。第三行不供货/明确未报价，不参与总额。业务快照在导出、导航、刷新、重启、恢复、非法预览后精确核对，不以页面无报错代替保存验证。Excel公式静态引用已核对，未宣称原生Excel重新计算验证。

## 逐页视觉对照与保留差异 / Page parity and retained differences

完整三尺寸六页配对：[SCREENSHOTS.md](SCREENSHOTS.md)，另有物料视角、修订明细、抽屉各展开状态和异常证据。

- 物料 / Items：新标题已恢复，深色侧栏、背景、标题层级统一。正式列筛选、自定义字段和图纸入口保留，故真实表比原型更密，1024需表内水平滚动。New heading is fixed; production retains necessary field/filter tools.
- 分配 / Allocation：右宽双栏、数量、全部关联方来自真实状态，三尺寸不退回旧堆叠；正式多种批量操作与历史保护保留，工具区仍比原型更高。Two-column hierarchy now follows the design direction; production operations need additional space.
- 报价 / Quote intake：同轮V1/V2真实差异已具备；正式手工/粘贴/文件入口和校验区比原型多，差异区在下方，需要滚动。Distinct retained business structure, not pixel-identical.
- 比价 / Comparison：顶部新增人工/建议概览有效；并列待处理语义仍失败。矩阵和金额口径说明保留，不能为压缩首屏删除。Decision overview is improved, but tie status remains inaccurate.
- 项目 / Projects：正式系统是管理抽屉，不是原型项目总览；已测试创建/切换/保存，但“完整项目总览结构一致性” **NOT TESTED/未建立可执行目标**，需设计方明确。Concept dashboard does not define a complete real product target.
- 设置 / Settings：正式模板和字段实际可用，原型三卡仅占位；深度布局一致性 **NOT TESTED/目标不完整**；不伪造备份或日志控件。Prototype placeholders cannot establish full functional parity.

这不是全产品逐像素PASS。可继续改进首屏密度：将不影响当前阶段的全局保存说明压缩，已锁定报价优先呈现历史/差异，并保留完整导入工具的可达性。These are design suggestions, not additional counted defects.

## NOT TESTED 与限制 / Coverage limits

1. Windows本机浏览器/安装与文件对话框：本任务为Linux云端；Windows CI PASS仅是既有CI证据，不冒充本轮人工操作。Windows desktop manual UAT not performed.
2. 原生Microsoft Excel公式重新计算/打印：已验证下载文件结构、公式引用和独立算术，没有原生Excel环境。Native Excel behavior not tested.
3. 真实企业数据、多人并发、生产部署：禁止真实业务数据，未执行生产试用。Real operations/concurrency/deployment not tested.

其余长尾（如完整阶梯价/第二轮议价矩阵、所有导入错误组合）不在本次定向用例集合内，不能从本报告推导全面PASS；既有42项CI仅提供基线。No claim of exhaustive product testing.

## 原始执行记录与证据完整性 / Raw execution and integrity

[主浏览器日志](evidence/browser.jsonl) 有138条检查：136 true、2 false；辅助5条true；下载文件20条true。两条false是点击并列B后错误预期立即提交，随后保存点击被真实理由弹窗遮挡，出现一次driver timeout。**没有删除或伪装为通过**：保留原始步骤、弹窗截图及后续正常填理由确认的复验；人工数之后确为2、待决定0，根因记录为P2-B01。This is not a clean all-green automation run; the interrupted action exposed the genuine tie classification issue. No forced DOM mutation was used.

无 pageerror/requestfailed/http-error 事件；两条console404来自浏览器自动favicon请求（见server日志），不是业务失败；日志事件数不替代视觉/业务判定。[汇总](evidence/execution-summary.json)。

[主Playwright trace](evidence/independent-v31-browser-trace.zip) / [跨页trace](evidence/aux-shift-pagination-trace.zip) / [下载检查](evidence/download-validation.json) / [哈希清单](SHA256SUMS.txt)。trace含DOM快照与动作；截图以PNG单独归档。所有证据均为本轮虚构数据，previous目录明确为历史对照。

**最终建议 / Recommendation:** 保持 PR #24 Draft，不合并；先修复P2-B01与P3-U01，再执行定向独立复验。此次未发现阻止继续隔离试用的数据安全缺陷，但尚不建议宣布V3.1完整视觉或业务PASS。No merge was performed or authorized by this report.
