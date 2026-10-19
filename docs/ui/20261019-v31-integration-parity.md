# SRM V3.1 正式接入与视觉一致性清单 / V3.1 integration parity tracker

**目标 / Target:** [PR #23 V3.1 设计](https://github.com/yudacheng666/SRM_System/pull/23) 是已认可的视觉与信息架构参考；[PR #24 正式 M1-Lite](https://github.com/yudacheng666/SRM_System/pull/24) 保留真实采购逻辑。
**Boundary:** Visual parity must not replace existing SQLite, PDFs, confirmed quotation history, API, RFQ identity, backups, Excel reports or importing logic.

## 此批实施 / Implemented in this batch

| 范围 / Scope | 本批变化 / Change | 验收要点 / Acceptance |
|---|---|---|
| 左侧导航 / Sidebar | V3.1 式品牌、层级、深色导航与活跃标记 | 1024/1366/1600 可达，无侧栏遮挡 |
| 业务流程 / Workflow | 现有真实 tab 统一为连续步骤导航，保留原事件委托 | 点击后 sidebar + tab + panel 状态同步 |
| 页面层级 / Page hierarchy | 物料、分配、报价回收、比价、设置五页均有统一标题、阶段/语境和说明 | 每页 V3 页面标题真实存在且布局不冲突 |
| 项目区 / RFQ operations | 将原有可折叠的项目/供应商/备份区压缩为按需管理入口；不删除任何控件 | 新建、保存、历史切换、供应商、备份、导出仍可使用 |
| 表格与操作 / Tables and actions | 统一高密度表格标题/斑马纹、卡片层级、主要/危险按钮视觉 | 主要操作明显，不遮挡完整业务字段 |
| 报价锁定 / Quote lock | 所有禁用按钮统一灰阶、禁用光标；已锁定报价在按钮旁显示明确状态 | 关闭/确认后仅 UI 可见变化；不得改变历史快照 |
| 小屏 / Laptop | 专门压缩 768 高度的标题、导航、项目区密度 | 1024×768 及 1366×768 实际浏览器逐屏核实 |

## 尚未完成与不可误报 / Not yet established

- **未宣称 PR #23 与正式 M1-Lite 逐像素一致 / Not pixel-perfect parity.** PR #23 的大部分页面是简化业务演示；正式系统还包括大量 Excel、PDF、字段、审计与备份功能，不能直接替换为概念原型。
- **供应商分配双栏、报价版本差异、比价矩阵的深度结构一致性仍待逐页截图对照 / Detailed layout parity requires side-by-side real captures.**
- **PR #23 项目总览和设置部分原为概念占位 / Concept-only pages require design, not fake functional controls.**
- **业务完整回归与浏览器视觉对照须由 Codex 独立执行 / Codex must independently perform functional and visual UAT.**

## Codex Cloud 独立验收门槛 / Independent gates

1. Checkout PR #24 最新准确 HEAD，真实启动 Python + SQLite，使用隔离 `SRM_DATA_DIR`，不要用 PR #23 内存原型冒充产品。
2. 在 1024×768、1366×768、1600×900 逐页截图，对照 PR #23 V3.1 的视觉规范，明确区分“已改造”“仍为旧版布局”“业务上必须保留不同结构”。
3. 在新建项目、正式物料导入、图纸匹配与 PDF、供应商双向分配、报价确认与 V2 修订、比价选择/理由、Excel/CSV、保存重启、S4 恢复中运行真实 GUI 路径。
4. 重点复验 P3-01：`#confirmQuoteRound` 确认后显示不可点击灰阶、cursor 不为 pointer，并有已锁定提示；已确认历史必须不可变。
5. 测试报告列明 **视觉一致性单独结论** 与 **业务正确性单独结论**；截图、问题证据、准确 SHA、PASS/FAIL/NOT TESTED 写入新独立 `test/` 证据分支及 Draft 证据 PR，回评 PR #24。Codex TEST-ONLY，禁止修改产品、主分支或合并。

**安全 / Safety:** GitHub 开发 PR 保持 Draft；本次只接入 HTML/CSS/呈现同步与自检，不更改业务模型、SQLite 后端、真实数据。
