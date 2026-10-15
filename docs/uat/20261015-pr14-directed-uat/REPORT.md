# PR #14 定向独立复验 / Targeted independent retest

## 结论 / Verdict

**PASS：六个目标问题全部通过，6 PASS / 0 FAIL / 0 NOT TESTED（统计单位为六个目标问题）。**

**PASS: all six targeted findings cleared in this independent sample.** Six findings passed; none failed or went untested. This is a targeted gate, not a repeat of the original 40-mission acceptance or the developer's automated suite.

原版真实程序重新触发了 UAT-01、02、03、04、06、07 的原症状；相同合成数据及触发路径在候选版没有再出现这些症状。追加验证覆盖动态分类更新、报价来源持久化和导出、旧版数据恢复、其他弹窗键盘操作及三种宽度的实际横滚。没有发现本轮范围内需要阻止合入开发基线的新缺陷。**建议 PR #14 可进入开发基线合并，由用户/ChatGPT作最终决策；本轮没有合并、转正式 PR 或修改程序。**

The original application reproduced all six symptoms. The candidate eliminated them on the same fictional data and trigger paths. Additional checks covered dynamic categories, persisted/exported provenance, restored legacy data, other dialog keyboard paths and actual horizontal scrolling at three widths. No new defect was observed that blocks this targeted development-baseline merge. **Recommend PR #14 for development-baseline merge, with the final decision left to the user/ChatGPT. No merge, ready-for-review transition, or program fix was performed.**

**UAT-05（首屏密度）仍明确延期，未关闭。Windows 原生 PDF、桌面 Excel 等上轮 NOT TESTED 项也未因此通过。** / UAT-05 remains deferred and open. Prior Windows/native PDF/desktop Excel gaps remain untested; this result does not clear them.

## 固定版本、环境与隔离 / Fixed versions, environment, isolation

- PR: <https://github.com/yudacheng666/SRM_System/pull/14>. 初读及发布前都没有讨论评论；任务依据为 PR 说明和用户本轮六项复验要求。 / No discussion comments existed at both reads; scope came from the PR description and this user's request.
- Candidate HEAD: **`5d5529fa035d1571274815cf031fc69345a045bd`**, branch `fix/20261016-ui-v2-codex-uat-p2-p3`.
- Development base: `draft/20261013-m1-storage-ui-audit`, SHA **`49cd430b5b695f281e7f81931d174cbc1fb32cb5`**.
- 原版对照服务使用上一轮报告工作树 `be1bf21`；已用 git diff 验证其 HTML 与整个 Python backend 同 `49cd430b` 无差异。该工作树附带文档不影响运行程序。 / Baseline control ran from the previous report worktree `be1bf21`; HTML and the entire backend were verified identical to application baseline `49cd430b`. Its extra documentation does not affect executable behavior.
- Candidate independent worktree `/tmp/srm-pr14-uat`, evidence branch `test/20261015-pr14-directed-uat`, created from exact candidate HEAD.
- Real Chromium 154.0.8037.57 + Playwright 1.58.2, cloud Linux. Actual application started with its existing `serve.py` wrapper and real `server.main()`; not a mock/static prototype.
- Baseline: port **8830**, SQLite/PDF root **`/tmp/srm-pr14-old-data`**.
- Candidate: port **8831**, root **`/tmp/srm-pr14-new-data`**.
- Legacy-recovery candidate instance: port **8832**, root **`/tmp/srm-pr14-legacy-data`**, initially empty.
- 独立目录全部新建，只含虚构物料、供应商、价格和 PDF；没有读写用户业务数据。 / All three newly created roots contain only fictional data; no user business data was accessed.
- Execution **2026-10-15 UTC**, approximately 17:18–17:32 (2026-10-16 01:18–01:32 Asia/Shanghai). Logs are UTC; artifact paths use the UTC date.
- 没有运行 `uat-13-fixes.spec.cjs`、原 22 项或新 27 项 Playwright 套件。独立控制台根据页面观察逐步操作；API/SQLite 不用于写入或制造结果。SQLite/OOXML只读检查用来核实保存与导出。 / No existing or developer-added test suite was run. Adaptive real UI actions generated the results; read-only SQLite and OOXML inspection corroborated them.

## 测试数据 / Synthetic data

Both applications received the same four material rows by the visible paste/preview/confirm workflow:

| 编码 / Code | 名称 / Name | 分类 / Category | 数量 / Qty |
|---|---|---|---:|
| TST-001 | 虚构泵体 | UAT机加工 | 10 |
| TST-002 | 虚构支架 | UAT钣金 | 3 |
| TST-003 | 虚构轴套 | UAT机加工 | 4 |
| TST-004 | 虚构备用件 | UAT电气 | 5 |

Supplier Excel adds UAT-A/虚构精工甲, UAT-B/虚构机件乙, UAT-C/虚构备选丙. A and B are each explicitly allocated all four rows. Candidate TST-004 was intentionally renamed to `虚构备用件_已保存` and reclassified as `UAT新材料` during the saved-editor/category check; quantities and pricing remain comparable.

A R1/V1: TST-001 CSV file18, TST-002 paste30, TST-003 manual40, TST-004 manual50. Commercial evidence type is `chat_screenshot` with a fictional explanatory note, independent of the input method. B R1/V1: pasted prices19/28/42/48. All submissions were confirmed through the UI.

A subsequent R1/V2 imports one real XLSX row for TST-001: `1-9:20|10+:17.5`; quantity10 selects17.5. Other copied lines stay explicitly `revision-copy`; R1/V1 remains available.

Projects: baseline `RFQ-1792084709312-NJYZU0`; candidate `RFQ-1792084720071-V2LE4D`. An additional empty candidate project checks obsolete filter clearing and empty-project drawing guidance, then the main project is reopened.

## 六项逐项结果 / Six issue-level results

### UAT-01 — PASS — 实际分类筛选 / Actual project categories

**原问题与影响 / Original impact:** 导入分类无法用于批量分配；只有演示类别。 / Imported categories were unusable for scoped allocation.

**重现步骤 / Reproduction:** 两版都导入上表四行，进入分配页，检查按物料和按供应商的分类下拉框；候选版选择机加工、钣金并实际搜索。 / Import the four rows, inspect both allocation selectors, select actual categories and execute search.

**原版 / Baseline:** 两视角均为“全部分类、类别A–F”，没有任一实际分类。 / Both views list only demo A–F.

**候选预期及实际 / Expected and observed:** 两视角包含实际三个分类，机加工返回2行，供应商视角钣金返回1行。修改004分类后移除电气、增加新材料，有效机加工选择仍保留。切换至新空白项目时旧分类清空为“全部分类”、值为空；重新打开主项目恢复正确类别。 / Both selectors show real categories; searches return 2 and 1 rows respectively. Changing 004 updates both options while retaining a valid filter. A new empty project clears obsolete options/filter; reopening restores real categories.

**证据 / Evidence:** [原版](evidence/01-baseline-categories.txt), [候选](evidence/01-candidate-categories.txt), [反向筛选截图](evidence/02-candidate-reverse-filter.png), [动态/切换操作记录](evidence/actions.jsonl), [空白项目](evidence/14-candidate-empty-project-guidance.txt).

### UAT-02 — PASS — 录入来源与历史兼容 / Entry provenance and legacy compatibility

**原问题与影响 / Original impact:** 手工与粘贴报价被记为import，审计来源不可信。 / Manual/pasted entry was indistinguishable from file import.

**重现步骤 / Reproduction:** 同一供应商同一轮，先CSV001，再粘贴002，再单条录入003/004；确认、保存、刷新，导出内部比价文件。另由原版下载完整ZIP，在第三个空白候选服务中恢复。 / Mix file, paste and manual inputs within one round; confirm/save/reload/export, then restore an actual baseline-generated backup into an empty candidate instance.

**原版 / Baseline:** 四行 UI 都为“导入”，SQLite均为 `import`。 / All four display Imported; persisted source is import.

**候选预期及实际 / Expected and observed:** UI分别为“文件导入、表格粘贴、手工录入/修正”；确认后SQLite为 `file,paste,manual,manual`，刷新不变，Excel明细U2–U5同样为这四值。商业凭证仍为 `chat_screenshot`，未被输入入口覆盖。真实XLSX修订001仍记为file，旧版本原入口保留在历史；复制行明示revision-copy。恢复的旧import记录保留原值，UI只称“旧记录（来源未细分）”，没有猜测改成manual/file；旧版和恢复后的报价历史完全相同。 / Distinct channels survive confirmation, storage, reload and workbook export. Commercial evidence remains separate. XLSX revision records file while older history retains original channels; inherited rows say revision-copy. Legacy import stays unchanged and is visibly marked unclassified rather than guessed.

**证据 / Evidence:** [原版横滚截图](evidence/08-baseline-source-and-identity.png), [候选截图](evidence/08-candidate-source-and-identity.png), [持久化核对](evidence/persistence-checks.json), [Excel逐格检查](evidence/export-inspection.json), [实际导出](evidence/candidate-comparison.xlsx), [旧记录恢复截图](evidence/12-candidate-legacy-sources.png), [真实原版备份](evidence/baseline-legacy-import-backup.zip).

### UAT-03 — PASS — 恢复反馈直接可见 / Visible restore feedback

**原问题与影响 / Original impact:** 非空恢复虽被拒绝，但用户在当前区域看不到结果。 / Correctly refused restore appeared unresponsive.

**重现步骤 / Reproduction:** 两版在已有正式数据、项目操作区折叠时打开备份区域，选ZIP并点击恢复；另外在空白候选目录选择损坏ZIP。 / Keep Project operations collapsed and attempt restore in both formal projects; try a corrupt ZIP in the empty candidate instance.

**原版 / Baseline:** 唯一拒绝提示不可见，`isVisible=false`。 / Refusal exists only in hidden project drawer.

**候选预期及实际 / Expected and observed:** 备份区按钮旁红色持久提示可见，项目区仍折叠；DOM语义为 `role=alert`、`aria-live=assertive`。空白环境损坏ZIP的HTTP400原因也在同一区域可见，随后正常ZIP能恢复。原版已有数据保护未被放松。 / Persistent refusal is visible beside the action while Project remains collapsed, with alert/live semantics. Corrupt-ZIP400 feedback is also local and visible; a valid backup subsequently restores. Existing-data protection remains effective.

**证据 / Evidence:** [原版无可见反馈](evidence/07-baseline-restore-feedback.png), [候选可见反馈](evidence/07-candidate-restore-feedback.png), [空白目录损坏ZIP](evidence/11-candidate-invalid-restore-visible.png), [服务端记录](evidence/legacy-server.log).

### UAT-04 — PASS — 弹窗键盘及脏编辑保护 / Modal keyboard and dirty edits

**原问题与影响 / Original impact:** Tab进入背景导航，Esc不关闭，键盘上下文丢失。 / Focus escaped the modal and Escape did not dismiss it.

**重现步骤 / Reproduction:** 1024×768双击004，按Esc及18次Tab。候选版修改名称后，依次尝试Esc、关闭、取消并拒绝丢弃，再明确接受丢弃。重开后真正保存名称/分类。另检查议价原因、询价预览及图纸弹窗。 / At1024 open004, Escape and Tab18; reject dirty-close via Escape/Close/Cancel, then accept discard; reopen and actually save. Exercise award, preview and drawing dialogs too.

**原版 / Baseline:** Esc后仍打开；第8次Tab起焦点离开弹窗并到背景管理按钮。 / Escape leaves modal open; focus leaves after seven controls.

**候选预期及实际 / Expected and observed:** 未改动Esc关闭，焦点回到先前itemSearch；18次Tab均在物料编辑内。修改后3种关闭方式都先确认，拒绝后输入保留；接受丢弃后原名称不变，真正保存则更新且刷新保持。议价原因与询价预览各16次Tab+16次Shift+Tab全在弹窗内，Esc关闭并返回原触发按钮；图纸弹窗16次交替Tab/Shift+Tab也在内部，Esc返回PDF按钮。此图纸检查仅针对外层弹窗，不证明原生PDF内容/键盘行为。 / Focus containment, Escape, restoration and actual dirty protection all work. Other dialogs passed explicit forward/reverse traversal and return-to-trigger checks. Native PDF internals remain outside this result.

**证据 / Evidence:** [原版焦点逃逸](evidence/03-baseline-modal-focus.png), [候选焦点](evidence/03-candidate-modal-focus.png), [未保存输入保留](evidence/04-candidate-dirty-protected.png), [议价弹窗](evidence/13-award-modal.png), [询价预览](evidence/13-rfq-preview-modal.png), [逐键观察记录](evidence/actions.jsonl).

### UAT-06 — PASS — 横向核价保留稳定身份 / Stable identity during horizontal review

**原问题与影响 / Original impact:** 横滚到来源/操作列，编码和RFQ ID消失，核价容易串行。 / Right-side review lost row identity.

**重现步骤 / Reproduction:** 在1024×768、1366×768、1600×900报价明细及比价表上悬停并实际水平滚轮至右端，同时记录首列和容器边界。 / Hover and horizontally wheel to the right edge at all three sizes; inspect screenshots and measured bounds.

**原版 / Baseline:** 1024报价首列left=-429、容器left=103；1366报价首列=-87、容器=263。1024比价首列39、容器104，被滚出自身可视区域。 / Identity scrolls outside the container.

**候选预期及实际 / Expected and observed:** 首列保持可见sticky，1024报价滚动568px后首列104、容器103；1024比价滚95px后首列105、容器104。1366及1600报价也分别在386/152px横滚后保留身份。1366、1600的本次两供应商比价表无需横滚，布局正常；不声称这些宽度执行了不存在的比价横滚。 / Identity stays pinned in actual overflow cases. The wider two-supplier comparison fits and requires no horizontal scrolling; those cases are reported as layout checks, not nonexistent scroll tests.

**证据 / Evidence:** [原版1024](evidence/09-baseline-quote-1024.png), [候选1024报价](evidence/09-candidate-quote-1024.png), [候选1024比价](evidence/09-candidate-compare-1024.png), [1366](evidence/09-candidate-quote-1366.png), [1600](evidence/09-candidate-quote-1600.png), 数值见 / measurements in [actions.jsonl](evidence/actions.jsonl).

### UAT-07 — PASS — 图纸提示随真实状态变化 / State-aware drawing guidance

**原问题与影响 / Original impact:** 已有正式物料仍提示先进入正式工作，误导采购员。 / Formal work falsely appeared uninitialized.

**重现步骤 / Reproduction:** 正式项目选001、关联真实合成PDF、切到无图002再返回；新建空白项目；重新打开已报价项目。 / Select001, attach a real synthetic PDF, switch to unlinked002 and back, create an empty project, reopen quoted work.

**原版 / Baseline:** 正式项目已有4行仍称“请先进入正式工作并添加物料”。 / Existing formal project shows obsolete demo guidance.

**候选预期及实际 / Expected and observed:** 提示含实际编码/RFQ ID；无图为“尚未关联PDF”，001关联后为“已关联1份PDF”；空白项目为“暂无物料”；已有报价行明确提示不能静默修改图纸。没有再出现旧引导。 / Guidance reflects selected identity and unlinked/linked/empty/quoted-lock states.

**证据 / Evidence:** [原版](evidence/05-baseline-drawing-guidance.png), [候选无图](evidence/05-candidate-drawing-guidance.png), [候选已关联](evidence/06-candidate-guidance-linked.png), [空白项目](evidence/14-candidate-empty-project-guidance.png), [锁定行记录](evidence/actions.jsonl).

## 附加业务核对 / Additional business corroboration

| Check | Independent expectation | Actual |
|---|---|---|
| A R1/V1 | `18×10 + 30×3 + 40×4 + 50×5` | ¥680 |
| B R1/V1 | `19×10 + 28×3 + 42×4 + 48×5` | ¥682 |
| First minimum combination | `180+84+160+240` | ¥664 |
| A R1/V2 XLSX tier | Qty10 →17.5; total `175+90+160+250` | ¥675 |
| Latest minimum combination | `175+84+160+240` | ¥659 |

导出有4行汇总、12条历史报价明细，确认轮次/版本及来源相符。商业凭证说明仅为虚构文字，未声称原聊天图片已归档。Excel公式文本已读取，未在Windows Excel重算或打印。 / Export has4 summary rows and12 historical quote lines with correct versions/channels. Evidence notes are fictional text; no actual chat-image archival is claimed. OOXML/formula text was inspected; Windows Excel recalculation/printing was not tested.

## CI与剩余范围 / CI and remaining scope

Exact candidate SHA was independently queried through GitHub Actions metadata; both runs are completed/success:

- [UI V2 Unified Candidate Acceptance — 38774492186](https://github.com/yudacheng666/SRM_System/actions/runs/38774492186).
- [S3/S4 Regression — 38774491931](https://github.com/yudacheng666/SRM_System/actions/runs/38774491931).

PR说明称27/27浏览器用例通过，本轮只读取成功记录，没有重复执行或计入6项统计。 / PR description reports27/27 browser cases; this independent retest read CI success but did not rerun/count those cases.

保留项 / Remain open: UAT-05首屏信息密度；Windows启动、权限/路径和资源管理器集成；原生PDF内容/翻页/缩放；桌面Excel重算/打印；真实系统剪贴板；源邮件/截图附件归档；磁盘/断电故障与跨日备份耐久。这些不在本次六项关闭范围。 / Deferred density and prior Windows, PDF, Excel, clipboard, source-attachment, disk/crash and multi-day durability gaps are not cleared.

## 证据、完整性与分支边界 / Evidence and branch boundaries

[Evidence index](EVIDENCE.md) includes original screenshots, visible body-text captures, adaptive command/result/dialog logs, original synthetic inputs, SQLite read-only snapshots, exported workbook, real baseline backup and a compact Playwright trace.

为避免向仓库加入64MB连续截图，发布trace仅移除了1222个screencast-frame事件及对应JPEG；662组动作前后事件、1892个DOM快照、网络/控制台/日志均保留。独立PNG截图未编辑。compact文件已用真实Chromium打开本机Playwright Trace Viewer，成功显示动作列表。处理脚本、完整原trace的SHA256、大小及compact文件SHA均已归档；原64MB trace保留在本次云端scratch路径，未提交。 / Published trace omits only1222 screencast frame events/JPEGs, retaining662 before/after action pairs,1892 DOM snapshots, network/console/log records. Original separate PNGs are unedited. Processing recipe and original/compact hashes are recorded; the full64MB source stays in scratch, not Git.

自适应记录保留了驱动定位等待错误：最初期待CSV显示“来自文件名”的提示，之后重新选相同文件又没有change事件；清空文件选择再上传后正常继续。这些为驱动更正，不计为产品缺陷。 / Transcript retains driver corrections: an incorrect CSV-message wait and reselecting the same file without a change event. Clearing and reselecting the file restored the intended path; these are not product failures.

所有本轮提交限定为 `docs/uat/20261015-pr14-directed-uat/`。不改现有业务代码、测试、CI、数据库结构；不修改main、开发基线或PR #14修复分支；不合并PR #13证据分支。 / This retest adds only its own documentation/evidence directory, leaving application, existing tests/CI/schema, main, development base and PR #14 head untouched. PR #13 evidence branch is not merged.
