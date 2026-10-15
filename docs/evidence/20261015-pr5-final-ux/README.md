# U7/U8/N1 最终定向采购员复验 / Focused buyer recheck

**结论：U8 PASS、N1 PASS；U7 的项目/历史入口与窄屏操作通过，但 1366×768 页面顶部的实际物料首行仍不在首屏，U7 FAIL（P2）。不得以 CI 13/13 代替这项视觉验收。**
**Verdict: U8 and N1 pass. Project/history access and narrow-screen operation work, but U7's actual first item row remains below the initial laptop viewport; U7 fails at P2. CI success does not close this visual finding.**

## 提交与方法 / Commit and method

- [本轮任务](https://github.com/yudacheng666/SRM_System/pull/5#issuecomment-6185063028)；精确被测 SHA **`9696bf8e810032c76edcf32173cc2a7c9ec9399d`**。
- [CI 38686016370](https://github.com/yudacheng666/SRM_System/actions/runs/38686016370) completed/success：[Windows](https://github.com/yudacheng666/SRM_System/actions/runs/38686016370/job/116260907158)、[Linux](https://github.com/yudacheng666/SRM_System/actions/runs/38686016370/job/116260907467) 均 success。读取日志见 Python 43、Node 10、Playwright **13 passed (2.4m)**，12/13 新增场景通过。**本轮未重复这些套件。**
- 实际 GUI 操作约 **2026-10-15 13:25–13:32 Asia/Shanghai**；Linux Chromium 154 / Playwright 1.58.2，1366×768、960×900。固定 SHA 独立 worktree，端口 8805、全新临时数据目录、虚构物料/供应商。
- 所有新建、导入、分配、导出、历史切换均从可见控件操作；只读 DOM 坐标、截图和下载 XLSX/CSV 用于佐证，没有直接 API 注入或程序状态改写。截图确已打开审查。
- **只提交本目录文档与证据；没有修改应用、自动化测试或 CI，没有自修、合并或推送 PR 源分支；main 与开发基线不变。PR 保持 Draft。**
- Isolated real browser/server with synthetic data; no repeated regression suite or application/test/CI edits. Repository evidence only; no merge.

## 结果 / Results

| 项目 / Check | 结果 / Result | 关键事实 / Actual outcome |
|---|---|---|
| U7：1366×768 首屏物料 | **FAIL / P2** | 导入后返回页面顶部、新开页面两次均无数据行；首行 top=858.5、bottom=925.5，viewport height=768，scrollY=0。 |
| U7：项目/历史入口 | PASS | 项目默认折叠；顶部“询价项目”一击展开，新建与历史下拉/打开按钮可达；已实际创建第二笔并切回第一笔。 |
| U7：960 操作 | PASS | 项目按钮可换行使用；供应商操作跳转进入卡片区；文档宽度=视口宽度=960，未见页面级横向溢出。 |
| U8：自动保存反馈 | **PASS，关闭** | 导入三家供应商后不点手动保存，实际自动保存为第3版，供应商提示更新为“供应商已保存到当前询价（第3版）”；新 RFQ 无旧三家提示。 |
| N1：跨项目报告 | **PASS，关闭** | 报表保持展开、新建后候选为空、旧成功消息消失、列配置默认恢复；添加新供应商并分配后只有 SUP-NEW；实际导出内容/身份正确；历史切回后候选为第一笔有效供应商 A。 |
| Windows 原生操作、PDF 像素、桌面 Excel | SKIP | 非本轮范围，未冒充 PASS。也未重跑 13 场景或完整恢复等既有覆盖。 |

These are targeted finding-level outcomes, not a newly executed three-case automated suite. PDF fixtures are synthetic, but PDF rendering was not exercised for these UI-state fixes.

## U7 剩余缺陷与 CI 覆盖边界 / Remaining layout defect

**操作：**新建正式 RFQ→导入 items12.xlsx→确认12项（导入区自动收起）→回到页面顶部。项目操作、供应商工具、数据工具、PDF 编辑均为折叠状态。另用全新页面打开该已保存 RFQ，默认物料步骤，复查首屏。

**预期：**1366×768 的页面顶部可读到至少首条实际物料，而非只看到标题/按钮/列名。
**实际：**两次截图均看不到数据行；TST-012 是排序后的第一条实际物料，其坐标如下：

```json
{"top":858.5,"bottom":925.5,"height":768,"scrollY":0}
```

数据行开始位置低于视口底部 **90.5px**；若要求完整读出该行，尚需约 **157.5px** 的空间。折叠改动有效，但尚不足以达到声明的首屏目标。这是布局问题，非物料导入失败；滚动后数据存在。

**证据：**[导入后页面顶部](01-imported-laptop-1366.png)、[全新页面交叉确认](07-fresh-laptop-1366.png)、[原始坐标](geometry.json)。

**为什么 CI 仍 PASS：**只读核对了 [场景13源码](https://github.com/yudacheng666/SRM_System/blob/9696bf8e810032c76edcf32173cc2a7c9ec9399d/prototype/m1-lite/tests/e2e/acceptance.spec.cjs#L436)：它在完成文件选择和确认后读取当时的 getBoundingClientRect().top，检查 top < innerHeight，未要求页面处于 scrollY=0，也未检查行底部。文件选择/确认的正常操作可能已把页面滚动到下部，因此该检查不能排除本轮发现的“页面顶部/新页面首屏”问题。本轮未重跑、改写或放宽该场景；不声称掌握 CI 当时未记录的具体 scrollY。

**给 ChatGPT 的建议：**继续压缩首屏的标题/当前工作/项目与工具外壳、重复步骤说明及表格前操作区；在这套尺寸下腾出足够空间呈现实际数据。修复后从新页面或明确页面顶部验收，并同时检查行 top/bottom 与截图；代码/断言由 ChatGPT 修改。

**English:** With all relevant tools collapsed and scrollY=0, the first real row starts at 858.5px in a 768px viewport. A fresh page reproduces it. CI scenario 13 checks the row position after interactions without requiring page-top position; it does not exclude this independent finding. Compact the remaining overhead and verify the actual row at page top. Codex made no fix or test edit.

## U8：实际自动保存，无旧手动保存提示 / Actual autosave feedback

1. 第一笔 `RFQ-1792041900722-FVP06J` 导入12项，从分配页供应商入口导入 A/B/C。
2. **没有点手动保存**，自然等待实际自动保存；页面显示第3版，供应商区同步为“供应商已保存到当前询价（第3版）”。
3. 后续新建第二笔时，旧导入成功消息清除，恢复“仅针对当前询价导入供应商；导入后会自动保存”的说明。历史操作未把第二笔旧提示带回第一笔。

证据：[三家供应商自动保存成功](02-supplier-autosaved.png)、[新询价工具区与历史入口](06-history-controls-960.png)。

**English:** Three suppliers were imported and actually autosaved, with the persisted revision reflected in the message and no manual-save instruction. The old import feedback clears when changing RFQs. U8 is closed for this tested path.

## N1：持续展开、列设置复位、真实导出 / Open-panel reset and actual files

**第一笔：**给 A 分配 TST-001/002，进入真实报表区；取消“所属类别”可选列并下载。界面显示两项下载成功，文件确为两项、无“所属类别”列。另曾选中内部报表的 A；未分配的 B/C 不属于有效报表候选。

**新建第二笔：**保持数据/报表区域展开，通过顶部“询价项目”新建 `RFQ-1792042139912-VKHAAY`。面板立即清空旧供应商和下载成功反馈，“所属类别”恢复默认勾选。

**第二笔业务：**单条输入 NEW-777→预览→确认，新增独立 SUP-NEW，分配后重新进入报表。候选仅“虚构新项目供应商 (SUP-NEW)”；下载结果仅 NEW-777、数量7，未含 TST-001/002。漏报 CSV 的文件名及表内编号均为第二笔正式 RFQ。

**历史切回：**通过可见历史入口切回第一笔，报表候选恢复 A，未保留第二笔 SUP-NEW 或其下载完成信息。截图仅保留关键前后状态；[UI 观察记录](context-notes.json) 保留项目身份和历史切回后的报表文本。

| 实际文件 / File | 核对结果 / Verified content |
|---|---|
| [first-supplier-A.xlsx](first-supplier-A.xlsx) | 两项 TST-001/002，数量2/3；未勾选的“所属类别”不在列中。 |
| [second-supplier-NEW.xlsx](second-supplier-NEW.xlsx) | 仅 NEW-777，数量7；默认“所属类别”列已恢复；无第一笔物料。下载原名 SRM_询价单_SUP-NEW_虚构新项目供应商.xlsx。 |
| [second-identity.csv](second-identity.csv) | 文件名 RFQ-1792042139912-VKHAAY_SUP-NEW_R1_漏报.csv；表内 RFQ、SUP-NEW、NEW-777、数量7均对应第二笔。 |

截图：[第一笔已导出及自定义列](03-first-report.png) → [第二笔空白报告复位](04-empty-second-report.png) → [第二笔仅新有效候选](05-second-valid-supplier.png)。

**English:** The still-open report resets on new RFQ creation. Custom columns revert, old candidates/feedback disappear, and a newly assigned supplier exports only the second project's distinct item. Download identity matches the second RFQ; switching history rebuilds the correct first-project candidates. This establishes the tested GUI/file isolation, not exhaustive leakage testing.

## 入口、窄屏与证据范围 / Access, narrow viewport and evidence

项目折叠后，顶部“询价项目”仍是可见入口；历史切换路径为点击入口→选历史 RFQ→打开。960 像素下新建/保存/历史等按钮正常换行可点，供应商跳转直接进入卡片区。

证据：[960 项目/历史控件](06-history-controls-960.png)、[960 供应商操作区](08-narrow-supplier-960.png)。

本目录仅 **8 张关键截图**、2 XLSX、1 CSV 与少量 JSON/确认文本；截图未改写内容。[manifest](evidence-manifest.json) 含大小及 SHA-256，published 标明实际远端证据。约10MB完整 trace 仅在本会话 `/tmp/srm-final-ux-evidence/exploration-trace.zip` 保留，未提交 Git 或冒充 CI Artifact；临时会话销毁后可能不可用。远端证据随仓库保留，受私有仓库权限限制，不采用 Actions 14天过期策略。

探索时按实际候选修正了一次不存在的 SUP-B 选择器；未把控制台等待超时当作产品失败。新建/历史切换出现未保存修改确认时按明确提示操作，仅限虚构数据。没有修改源码来获得 PASS。

**交接：U8、N1 可关闭；U7 保持 P2 未关闭，交 ChatGPT 继续修复首屏布局及相应验收覆盖。保持 PR Draft，不合并。**
**Handoff: close U8/N1. Keep U7 open at P2 and hand layout/coverage fixes to ChatGPT. Draft remains; no merge.**
