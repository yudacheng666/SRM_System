# SRM UI V2 · 方案 B 定向深化设计评审
# SRM UI V2 · Selected Concept B Refinement Review

日期 / Date: 2026-10-15
状态：设计稿待视觉确认；未集成业务功能 / Status: Visual review pending; no business integration.

## 1. 用户选择 / User Decision
- 已选择 B：数据控制台；不继续推进 A。
- Concept B (Operations Console) is selected. Concept A is not carried forward.
- 设计变更保留在 `design/20261015-ui-system-v2`，不修改 main 或 M1-Lite 页面。
- Design changes remain isolated on the design branch; main and M1-Lite are untouched.

## 2. 本次深化 / This Refinement
- 将方案 B 扩展到四步询价场景：物料与图纸、供应商与分配、报价回收、比价议价。
- Extended concept B into four RFQ stages: items/drawings, suppliers/assignment, quote intake, comparison/negotiation.
- 字体层级：标题 27px、模块标题 16px、正文 14px、表格 13px、辅助说明 12px；重要数值更突出。
- Type hierarchy: 27px page headings, 16px section headings, 14px body, 13px table, 12px secondary information, stronger data numbers.
- 组件：一屏单一主 CTA、筛选区与表格分层、语义状态标签、统一焦点态、选择后才出现批量操作栏。
- Components: one dominant CTA per view, distinct filters and tables, semantic status tags, visible keyboard focus, contextual bulk actions.
- 主数据区保持清晰的水平结构；信息卡限制为四项，避免装饰性卡片堆叠。
- The main data zone retains a clear horizontal rhythm; KPI cards are limited to four.
- 保留业务中已确定的安全表达：供应商关联不覆盖、低于 100% 仍可导出已分配部分、图纸匹配需人工确认、报价证据留存、同范围可比、非最低价选择需说明。
- Preserve the approved business concepts: append-only supplier assignment, partial RFQ coverage export, manual drawing confirmation, quotation evidence, comparable scope and reasons for non-lowest awards.

## 3. 文件 / Review File
`design/ui-v2/concept-b-refined.html`
- 独立 HTML/CSS/JS，可离线打开；4 个业务步骤可切换；物料表支持示例搜索、筛选与勾选。
- Standalone HTML/CSS/JS can open offline. Four stages switch visually; the mock item table supports example search, filtering and selection.
- 页面显示均为匿名虚构数据；业务按钮弹出“视觉演示”提示，不与正式后端连接。
- All displayed data is fictional; business-action buttons are visual placeholders and do not access an application backend.

## 4. 视觉验收清单 / Visual Review Checklist
- 1366×768 下主工作区内容是否优先于导航与头部 / Does business content dominate above the fold?
- 1600×900 下表格是否舒适且不空洞 / Is the table balanced on a larger screen?
- 中文文本是否清楚、主次是否明确 / Is Chinese typography legible with clear hierarchy?
- 主操作是否一眼可见、危险操作是否被弱化 / Is the primary action apparent and destructive action subdued?
- 四个业务步骤在同一设计语言下是否连贯 / Are all four stages visually consistent?
- 横向宽表和 980px 以下窄屏是否可接受 / Are wide tables and narrower layouts tolerable?
- 键盘焦点和状态信息是否可辨 / Are keyboard focus and statuses identifiable?

## 5. 后续接入门槛 / Integration Gates
1. 用户确认本视觉设计后，才按现有 DOM ID 和业务流程规划修改。
1. Integrate only after user confirms the visual direction.
2. 先由 ChatGPT 实施 UI 层改动并保留 SQLite、备份、报价、图纸及历史版本逻辑。
2. ChatGPT implements UI-layer changes while preserving business and persistence behavior.
3. 在独立开发分支开展浏览器视觉检查与 Python/Node/Playwright 回归；Codex 可独立验收并记录缺陷。
3. Use isolated development branch with browser visual tests and Python/Node/Playwright regression; Codex may independently validate.
4. 任何合并均需明确批准；禁止自动合并 main。
4. Every merge requires explicit approval; never automatically merge main.

## 6. 未完成项 / Limitations
- 本次未运行真实浏览器截图比较，未测量 1366×768 实际像素结果。
- Real-browser screenshots and pixel-level checks at 1366×768 have not yet been performed.
- 未做 SRM 真实交互测试，也未修改原业务代码。
- No real SRM interaction test has been conducted and no business code was altered.
