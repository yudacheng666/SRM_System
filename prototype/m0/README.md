# SRM M0 交互原型
# SRM M0 Interaction Prototype

## 用途
## Purpose

M0 用虚构数据验证轻量 SRM 的物料导入、供应商分配、PDF 式预览、报价轮次与比价交互，不是正式持久化系统。
M0 uses synthetic data to validate lightweight SRM item imports, supplier assignment, PDF-style previews, quotation rounds and comparisons; it is not the persistent production application.

## 启动
## Run

直接在现代浏览器打开 `prototype/m0/index.html`，无需联网或安装依赖。
Open `prototype/m0/index.html` in a modern browser; no internet connection or dependencies are required.

如需浏览器自动化，可由 Codex 使用本地 HTTP 服务运行，但本页面仍不保存修改后的业务数据。
Codex may serve the file over a local HTTP server for browser automation, but this page still does not persist edited business data.

## 当前入口
## Current views

本次询价物料：单条录入、首行标题粘贴、CSV/TXT、Excel 模拟、搜索、排序、选择、批量更新与来源合并。
Inquiry items: manual entry, header-mapped paste, CSV/TXT, simulated Excel, search, sort, selection, batch update and source-row consolidation.

询价分配中心：物料—供应商多对多关系、两种视角、Coverage 及供应商询价包/附件预览。
Assignment center: many-to-many item-supplier relations, both perspectives, coverage and supplier RFQ package/attachment preview.

报价回收导入：按供应商/轮次/版本导入报价，识别状态、阶梯价、覆盖异常及漏报清单 CSV。
Quotation return: import per supplier/round/version, validate statuses, tiers and coverage exceptions, and export missing lines as CSV.

报价比较：当前 RFQ 全部已分配范围的逐项比较、自身范围总额、共同物料总额、理论最低与最终选择总额。
Quote comparison: line-by-line and aggregate analyses for all assigned RFQ lines, including quoted-scope totals, common-scope totals, theoretical lowest and selected totals.

## 剪贴板规则（2026-10-08）
## Clipboard rules (2026-10-08)

第一行是列标题，第二行才是数据；物料导入必须精确包含“物料编码”列标题。
The first row contains column headers; data begins on row two; item imports require the exact “物料编码” header.

示例（物料）：`物料编码,物料名称,数量,单位` / `P-001,304 不锈钢,3,pcs`。
Example (items): `物料编码,物料名称,数量,单位` / `P-001,304 不锈钢,3,pcs`.

报价导入第一行必须精确包含“RFQ Line ID”或“物料编码”；有 Line ID 优先使用，否则只有唯一代码才可匹配。
Quote imports require “RFQ Line ID” or “物料编码”; prefer Line ID, and fall back to item code only for unique matches.

示例（报价）：`RFQ Line ID,单价,交期,MOQ,状态` / `RFQ-L00001,100,7,10,正常报价`。
Example (quotation): `RFQ Line ID,单价,交期,MOQ,状态` / `RFQ-L00001,100,7,10,正常报价`.

Tab 和 CSV 都保留空列，支持引号内逗号；普通空格不会拆列，缺主键表头会被拒绝。
Tab and CSV parsing preserve empty fields and quoted commas; ordinary spaces never split columns and missing key headers are rejected.

## 同编码合并
## Same-code consolidation

编码相同且名称、单位、分类、技术/交付属性兼容时可合并数量，同时保留每条来源需求行。
Quantity may be consolidated when codes, names, units, categories and technical/delivery attributes are compatible, while preserving source-demand lines.

已分配、已报价或属性冲突不能静默合并，采购员可取消整个批次或确认独立保留冲突行。
Allocated, quoted or incompatible items are never silently merged; the buyer may cancel the batch or explicitly keep conflicting lines separate.

## PDF 与报价
## PDF and quotations

PDF 页面和多文件切换目前仍为虚构示意交互，正式 PDF 渲染及实际打包留待后续阶段。
PDF page and multi-document switching remain synthetic M0 interactions; actual PDF rendering and attachment packaging are later-milestone tasks.

已确认报价版本不能直接覆盖；下一轮的漏报不会自动沿用上轮，阶梯价不适用时不能猜测价格。
Confirmed quotation versions cannot be overwritten; missing later-round quotes are not auto-carried and an unmatched tier must not be guessed.

界面统一显示“第N轮 · 第M版”，报价状态使用中文业务名称，不显示内部 null。
The UI shows “Round N · Version M” with readable Chinese business statuses, never internal null values.

## 正式需求与测试记录
## Canonical requirements and test records

产品需求：`docs/01_产品需求PRD.md`；业务规则：`docs/02_业务规则.md`。
Product requirements: `docs/01_产品需求PRD.md`; business rules: `docs/02_业务规则.md`.

本次回归结果：`docs/05_20261008_M0体验修改回归.md`。
Current regression report: `docs/05_20261008_M0体验修改回归.md`.

测试数据与代码注释都必须匿名/虚构；所有修改保持在草稿分支，用户确认之前不合并 main。
Test data and comments must remain synthetic/anonymous; all work stays on the draft branch until the user approves merging to main.
