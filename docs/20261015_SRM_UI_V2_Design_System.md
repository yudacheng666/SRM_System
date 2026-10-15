# SRM UI V2 Design System / 设计系统
日期 / Date: 2026-10-15
状态：候选待确认 / Status: Proposed, pending approval

## 方向 / Directions
- A「沉静专业」：左侧细导航、暖中性工作区、深墨色主 CTA、文档式留白；面向管理者和采购员日常工作。
- A “Quiet Professional”: slender navigation, warm-neutral canvas, ink primary CTA, document-like spacing.
- B「数据控制台」：深色竖侧边栏、蓝青信号、紧凑高密度表格与 KPI；适合大量物料快速筛查。
- B “Operations Console”: dark rail, blue-teal signals, denser tables and actionable metrics.
- A/B 都只使用原生 HTML/CSS/JS，可离线打开，无外部 CDN。
- Both prototypes use standalone HTML/CSS/JS, work offline, and do not depend on CDNs.

## Token 表 / Tokens
| Token | A | B |
|---|---|---|
| canvas | #F6F5F2 | #F4F7FB |
| surface | #FFFFFF | #FFFFFF |
| primary | #18372F | #175CD3 |
| heading | #17231F | #15243B |
| body | #33413B | #334155 |
| muted | #6A7772 | #64748B |
| border | #DDE2DC | #DFE6EF |
| selection | #E8F2EA | #ECF4FF |
| danger | #B42318 | #B42318 |
| success | #157347 | #087F5B |
| warning | #AD6800 | #A66300 |

## 尺度 / Scale
- 字体栈 / Font stack: "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif.
- 页面标题 / Page title: 24px / 650; 区块标题 / Section title: 18px / 650; 正文 / Body: 14px / 400; 表格 / Table: 13–14px; 辅助 / Secondary: 12–13px.
- 行高 / Line height: body 1.5; table 1.4.
- 间距 / Spacing: 4, 8, 12, 16, 24, 32px; 内容区 / Content width: fluid; 页面 padding 20–28px.
- 圆角 / Radius: input and button 6–8px; card 10–12px; tag 4px; no decorative oversized pills.
- 按钮高度 / Button height: 36px default; 32px dense; 40px prominent; focused keyboard ring 2px.
- 表格行高 / Table row: 42–46px; compact option 36–40px; sticky table headers.
- 优先桌面尺寸 / Target viewport: 1366×768 and 1600×900; narrow layout ≥ 980px, horizontal scroll for broad tables.

## 组件行为 / Component Behaviors
- 主按钮：单一强色填充，最多一项 / Primary: one solid dominant action per panel.
- 次按钮：浅底色或描边 / Secondary: quiet surface or outline.
- 危险动作：仅选择后在上下文工具条出现，并二次确认 / Danger: contextual only, requires confirmation.
- 工具栏：搜索/筛选在第一行，结果/批量操作按状态显示 / Search separated from bulk actions.
- KPI：至多 3–4 个重要指标，异常优先于装饰数字 / At most 3–4 high-value indicators.
- 导航：四步导航相同位置，当前页有颜色+文本状态 / Four-stage navigation fixed and clearly active.
- 图纸：物料行可见关联状态，点击进入抽屉，不在主屏全展开 / Drawings contextual, drawer-based.
- 轮次：供应商、轮次、版本、证据来源先明确，再处理报价 / Clear context before quote actions.
- 无障碍：键盘可见焦点；不以颜色作唯一信号；表头有语义；禁用状态明确 / Accessible focus, labels, headings and states.

## 接入原则 / Integration
- 不引入 React/Tailwind/远程字体；原生 CSS token 化后逐步集成。
- No React/Tailwind/remote font dependency; integrate native tokens incrementally.
- 保留现有 DOM ID、事件、SQLite、备份/恢复、冲突提示、报价历史规则。
- Preserve DOM IDs, events, SQLite, backup and restore, conflict warnings and quote history.
- 两个静态 HTML 原型均仅用于外观比较，没有真实文件导入或存储能力。
- These prototypes are for visual comparison only; they do not import files or persist data.
