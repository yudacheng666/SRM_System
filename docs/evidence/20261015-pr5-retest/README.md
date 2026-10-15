# UI V1 修复后采购员式独立复验 / Buyer-style fix verification

**结论：F1/F2 两项 P1 已独立验证修复，U3–U6 通过；U7/U8 部分修复但仍有 P2 未关闭，并发现一个跨询价报表面板陈旧上下文问题 N1（P2）。不将 CI 全绿写成界面全部验收通过。**
**Verdict: both P1 findings F1/F2 and findings U3–U6 pass independent verification. U7/U8 improve but retain P2 issues; a further P2 stale export-context issue N1 was observed. Green CI does not mean complete UX acceptance.**

## 目标与执行边界 / Target and boundaries

- [复验任务](https://github.com/yudacheng666/SRM_System/pull/5#issuecomment-6184177969)，针对 [前次采购员报告](https://github.com/yudacheng666/SRM_System/pull/5#issuecomment-6184078446)。
- 被测精确 SHA / Tested SHA: `9c6a970f0f14b40b21c81d62edcfcb9335bd4c04`。
- [同 SHA CI 38679696711](https://github.com/yudacheng666/SRM_System/actions/runs/38679696711) completed/success；[Linux job](https://github.com/yudacheng666/SRM_System/actions/runs/38679696711/job/116241182274)、[Windows job](https://github.com/yudacheng666/SRM_System/actions/runs/38679696711/job/116241182443) 均 success。Linux 已有日志：Python 43、Node 10、Playwright **11 passed (2.0m)**，含新增 10/11。这些数字来自 CI 日志，**本轮未重跑完整 Python/Node/Playwright 套件**。
- 操作时间约 2026-10-15 **12:55–13:06 Asia/Shanghai**（04:55–05:06 UTC）；Linux Chromium 154、Playwright 1.58.2，1440×900、1366×768、960×900。
- 固定 SHA 的独立 worktree，真实服务端口 8795，单独临时 SRM_DATA_DIR；仅虚构 Excel/物料/供应商。浏览器按可见入口逐步操作并打开截图审查；不通过 API 注入业务数据。
- Actual isolated server/browser and synthetic inputs. Adaptive GUI interaction and screenshot review, rather than rerunning the existing suite. Export XML inspection corroborates downloaded files, not desktop Excel rendering.
- F1 从新建到返回物料页**没有 F5/重新加载**；全部业务操作经 GUI 完成。后段仅临时停止自己的隔离服务以保持未保存状态，检查导出保护，随后重启并手动保存；没有改程序、测试或 CI。
- 文档提交前被测 worktree `git status --porcelain` 为空、跟踪文件无差异。此独立 docs 分支仅报告/证据；不推送 PR 源分支、不合并，PR 保持 Draft，main/开发基线不改。

## 8 项逐项结果 / Findings verification

| 原项 / Finding | 结果 / Result | 操作与证据 / Actual verification |
|---|---|---|
| **F1 P1** | **PASS，关闭 / closed** | 新建→导入 12 项→导入 A/B/C→选 001/002 给 A/B→直接回物料页，立即显示 2/2；展开图纸工具，行下拉框包含 12 项。未刷新。后续给隐藏的 001/002 加 C，再回表为 3/3。 |
| **F2 P1** | **PASS，关闭 / closed** | 第一笔 RFQ 的 B 漏报 CSV 文件名/表内 RFQ 均正确；另建第二笔 RFQ，经单条预览确认、独立供应商/分配后导出，编号也正确且与第一笔不同。两份原件可下载。 |
| **U3 P2** | **PASS，关闭 / closed** | 按“导出已分配询价单”进入真实供应商导出面板，提示已分配 2/12、其余不外发；实际 XLSX 仅 001/002。额外验证未保存状态拒绝下载，恢复保存后导出 001/002/003。 |
| **U4 P2** | **PASS，关闭 / closed** | 选 001/002，筛选仅 003；橙字明确 2 项隐藏且仍参与批量操作。给 C 添加时确认框列出 TST-001、TST-002。确认后 003 未分配，001/002 各新增 C。 |
| **U5 P2** | **PASS，关闭 / closed** | 滚动物料列表至下部，列名与筛选行分别保留；1440/1366 截图可辨数量/供应商数；960 也保留列名，宽表在自身区域内。 |
| **U6 P2** | **PASS，关闭 / closed** | 报表类型改为内部比价议价单后，按钮为“下载内部比价议价单 Excel（仅内部）”；选 A/B 实际下载两张表的内部 XLSX，价格/公式与当前报价相符。 |
| **U7 P2** | **FAIL（部分修复，仍留 P2） / partially fixed** | 图纸编辑区新页面默认折叠；960 的“查看供应商分配操作 ↓”真实跳到供应商卡片，document width=960。新页面的 1366×768 首屏仍没有物料行，管理区仍占大量高度，原密度问题未完全关闭。 |
| **U8 P2** | **FAIL（部分修复，仍留 P2） / partially fixed** | 切 A→B、粘贴、B 的二轮文件预览→切回一轮均清除 quotes.xlsx 旧提示；但供应商导入成功后仍显示“已新增 3 家供应商，记得点击保存到本机”，手动保存成功后仍在，且带到新 RFQ。 |

This is a finding-level result: six PASS and two residual P2 findings, not a claim that six of eight automated tests passed. N1 below is an additional exploratory finding. No new P0/P1 was established during this session.

## F1：连续操作、无需刷新 / Continuous no-reload evidence

1. 新建 `RFQ-1792040110427-UQ5GUX`，从“+ 添加询价物料”选择 items12.xlsx，预览后确认 12 项。
2. 分配页通过“添加/导入供应商”导入三家虚构供应商。
3. 勾选 TST-001/002，分别添加 A 和 B，确认框说明实际变更。
4. 直接切回“物料与图纸”，表中已分配供应商为 2/2；展开图纸管理下拉框立即有全部物料。
5. 没有中途保存/F5 作为页面刷新替代。自动保存自然运行。

No reload was used to make the fix pass. Data counts and dependent controls updated through normal workflow navigation.

证据：[分配后](04-assigned-two.png)、[返回表格 2/2](05-f1-no-reload.png)、[图纸选项](06-drawing-options.png)。

## F2：两笔正式询价的 CSV 身份 / CSV identity in two formal RFQs

第一笔下载名 / First filename:
`RFQ-1792040110427-UQ5GUX_SUP-B_R1_漏报.csv`

```csv
"RFQ-1792040110427-UQ5GUX","SUP-B","1","1","RFQ-L00002","TST-002","虚构物料2","3","件"
```

第二笔下载名 / Second filename:
`RFQ-1792040536818-5K8OOJ_SUP-SECOND_R1_漏报.csv`

```csv
"RFQ-1792040536818-5K8OOJ","SUP-SECOND","1","1","RFQ-L00014","SECOND-001","虚构第二询价物料","5","件"
```

第一笔 A 导入两条有效报价及 UNKNOWN，保留有效行、错误留预览；B 只报 001，漏报 002。第二笔使用可见单条输入→预览→确认，再添加独立供应商、分配一项，未写报价。CSV 均由页面按钮实际下载，不是构造文件。没有出现 RFQ-DEMO-001。

The two downloaded CSVs use distinct actual workspace IDs in both filenames and rows. The second RFQ was created and populated independently through GUI controls.

原件：[第一笔](missing-B.csv)、[第二笔](missing-second-rfq.csv)；[第二笔页面上下文](22-second-rfq-csv.png)。

## U3/U4：部分范围、隐藏选择与保存保护 / Scoped export and safety feedback

- 初始只有 2/12 物料分配；快捷入口展开实际报表面板并滚动到该区域。初次截图拍在滚动过渡中，待动画稳定后的 [截图](18-shortcut-settled.png) 才用于判断最终位置，不将瞬时画面当作缺陷。
- 下载 [partial-supplier-A.xlsx](partial-supplier-A.xlsx) 仅两项，数量 2/3，空白待填报价列，无其他供应商价格。
- 隐藏选择截图与实际确认记录：[橙色隐藏 2 项提示](07-hidden-selected.png)、[原始确认文本](dialogs.jsonl)。
- 为验证“未保存不得下载”，停止自己的临时服务，取消旧选择、选 003 给 A 追加关系，进入真实导出并点击下载。UI 显示“不能导出：有未保存的修改，请先点击保存到本机，成功后再导出单据”，期间未观察到 download 事件。
- 重启同一隔离服务，按“保存到本机”，再下载成功；[supplier-A-after-save.xlsx](supplier-A-after-save.xlsx) 为 001/002/003 三项。

With autosave unavailable, the dirty export was visibly rejected; after service recovery and explicit save, the updated scoped export succeeded. No network mocks or application changes were used.

证据：[未保存被拒](19-unsaved-export-refused.png)、[保存后成功](20-export-after-save.png)。

## U5/U6：表头与正确内部导出 / Headers and internal export

- [1440 滚动表头](09-sticky-1440.png)、[1366](10-sticky-1366.png)、[960](11-sticky-960.png)。截图经过实际打开检查：列名与筛选行都有保留，原“只有筛选条、没有列名”现象未再现。
- [内部按钮新文案](15-internal-label.png)，下载 [internal-comparison.xlsx](internal-comparison.xlsx)：比价汇总和报价议价明细两表；共同的 001 数量为 2，A 适用价 17.25、B 为 19，行金额公式 ROUND(单价×数量,2)，对应 34.50/38.00。A 的 002 为 23.75、数量 3；没有把 B 漏报当 0 参与共同范围。
- 检查的是下载内容/XML/公式及界面，不声称已用桌面 Excel 重算或验收打印布局。

Downloaded content, prices and formulas match the current synthetic quotes. Desktop Excel rendering/recalculation was not performed.

## U7 仍留 P2：首屏密度 / Residual first-screen density

**已通过的改进：**新页面图纸区折叠；960 的供应商操作跳转将供应商卡片带入视口，未看到页面级横向溢出。
**仍未满足：**即使新页面、工具区折叠，1366×768 下第一屏仍主要是标题/项目/保存/工具与步骤；下方仅露出物料区标题，无物料数据行。1440×900 也只有表格工具区出现在首屏。

**建议 ChatGPT：**将当前项目、保存、自动备份收敛到紧凑状态条，或把项目操作默认收起；保留明显的新建/保存入口。以“新页面打开即可看到至少若干物料行”为具体视觉验收目标，不能只用 PDF drawer 的 closed 属性代替截图判断。

**English:** Collapsing the PDF editor and adding a supplier jump work. However, the actual laptop-height first screen still contains no item rows. Compact project/admin status or collapse project controls while keeping key actions discoverable; verify real screenshots.

证据：[960 跳转](17-narrow-supplier-jump.png)、[正式项目新页面 1366](24-fresh-formal-1366.png)、[1440](25-fresh-formal-1440.png)、[960](26-fresh-formal-960.png)。

## U8 仍留 P2：导入反馈保留手动保存旧提示 / Residual manual-save message

**通过：**A 文件导入后切到 B，文件来源提示清除；B 粘贴报价后不再显示 A 文件；在 B 第二轮选择 quotes.xlsx 后，页面可见来源提示，切回一轮消失。

**复现剩余问题：**导入三家供应商→自然自动保存或点击“保存到本机”成功→再次看供应商工具区。
**预期：**与实际保存状态一致，显示已保存/自动保存，无额外必做步骤。
**实际：**顶部显示“已手动保存第 9 版”，供应商区仍是“已新增 3 家供应商，记得点击保存到本机”；到第二笔新询价仍带着这条三家旧提示。

**建议 ChatGPT：**修正成功回调产生的状态文本，而不仅是静态说明；保存成功或切换 workspace 时清理/更新导入反馈。不需要为文案再保存一次。

**English:** Cross-supplier/round/file-to-paste provenance is fixed. The dynamic supplier-import success message still requests manual saving after successful save and survives into a new project. Update dynamic feedback and clear it on workspace change.

证据：[供应商切换](12-switch-clears-file.png)、[粘贴无旧文件提示](13-paste-no-stale-file.png)、[切轮次](14-round-clears-file.png)、[已保存第9版仍提示保存](16-saved-stale-supplier-hint.png)、[新询价仍保留三家旧提示](22-second-rfq-csv.png)。

## N1 — 新观察 P2：新建 RFQ 后报表仍是上一笔上下文 / New stale report context

**复现：**在第一笔 RFQ 中展开供应商报表面板并成功下载三项询价单→点击“新建另一笔空白询价”→回看仍展开的报表区。随后在第二笔添加独立 SUP-SECOND，也未自动消除原 A/B/C 选项。

**预期：**报表供应商和下载反馈立即属于新项目；空项目显示无可导出供应商，清除旧下载成功消息。
**实际：**UI 当前 RFQ 为 `RFQ-1792040536818-5K8OOJ`，物料/分配计数为 0 时，报表供应商下拉框仍列 A/B/C，还显示“已发起供应商询价 Excel 下载：3 条物料”。第二笔已有独立供应商后也仍能看到旧 A 选项；[截图](22-second-rfq-csv.png) 同屏显示第二笔 RFQ 及旧报表上下文。

**范围：**确认的是页面陈旧上下文，未测试由这些旧选项导出，也未证实旧报价泄漏或跨 RFQ 保存污染；不得据此升级为数据泄漏结论。

**建议 ChatGPT：**新建/切换 RFQ 时同步重建报表供应商候选、清除旧下载结果和选中范围，保留当前导出类型时也应重算依赖数据。用“面板保持展开→新建项目”而非每次重新打开面板复验。

**English:** Keeping the export panel open across a new RFQ retains old supplier choices and the prior three-item download message. Reset dependent report state on workspace changes. This demonstrates stale UI context, not proven cross-project data leakage; export using the stale options was not attempted.

证据：[新项目的旧报表面板](23-new-rfq-old-report-context.png)、[第二笔已保存但仍旧选项](22-second-rfq-csv.png)。

## 证据与范围 / Evidence and scope

- 本目录发布 **21 张本轮截图**、两份 CSV、三份 XLSX、真实确认文本和 [manifest](evidence-manifest.json)。图像未修改内容；不是前次 CI 的截图。
- 原始 21MB trace 仅本会话 `/tmp/srm-buyer-retest-evidence/exploration-trace.zip` 保留；manifest 标记 published=false，未声称它已上传 GitHub。核心截图/文件存于独立证据分支，随仓库保留，无 Actions 自动过期时间，受私有仓库访问权限约束。
- **SKIP：**本轮未重复已通过的完整自动化；未再做完整备份恢复/所有 100 项场景，也未验证 Windows BAT/原生文件窗口/PDF 像素、桌面 Excel 或长期运行。这些不计成本轮 PASS；前次结果仍属于前次 SHA。
- **NOT_IMPLEMENTED/范围外：**正式 ERP/历史采购价/原始邮件截图归档，未当作本次新缺陷。
- 探索中有旧按钮名选择器无匹配、第二笔单条输入预览尚未确认等操作修正；按实际可见状态纠正后继续，不把控制台等待超时当产品缺陷，亦不修改源码/断言换取通过。

Published evidence comes from this exact-head independent exploration, not CI artifacts or prior-version tests. Session-only trace may expire with the environment. No blanket production or native-desktop acceptance is claimed.

**交 ChatGPT：P1 已关闭；继续处理 U8 的动态保存文案、N1 的跨项目报表状态，并决定 U7 紧凑布局方案。Codex 仅提交报告与证据，保持 Draft，不改源码、不合并。**
**Handoff: P1 findings are closed. Follow up on U8 dynamic messaging, N1 cross-project report state and the remaining U7 layout decision. Documentation/evidence only; keep Draft and do not merge.**
