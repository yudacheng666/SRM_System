# SRM UI V2：代码审计与 Skill 选型 / Code Audit and Skill Selection
日期 / Date: 2026-10-15

## 基线 / Baseline
- 来源：draft/20261014-ui-v1 的 prototype/m1-lite/index.html；新分支仅新增独立文档和静态视觉原型。
- Source: prototype/m1-lite/index.html on draft/20261014-ui-v1; this branch adds standalone design documents and static visual prototypes only.
- 原 UI-1 PR #5 已在开发分支完成合并；本轮不修改生产页面和 main。
- Original UI-1 PR #5 is merged into its development baseline; this work changes neither the working application nor main.

## Skill 调研 / Skill Research
| 来源 / Source | 核查结果 / Finding | 决策 / Decision |
|---|---|---|
| nextlevelbuilder/ui-ux-pro-max-skill | 设计检索、风格、配色、字号、规范生成；非自动验收工具 / Design search and token guidance, not an automated acceptance test | 借鉴设计系统方法；暂不运行安装脚本 / Use guidance; don't execute installer |
| anthropics/claude-code frontend-design | 强调独特的字体、节奏、对比、构图，避免模板感 / Promotes deliberate type, contrast and composition | 用于视觉方向与页面审美审查 / Aesthetic direction |
| vercel-labs/web-interface-guidelines | 键盘、焦点、表单、交互目标、可访问性 / Keyboard, focus, forms, targets, accessibility | 作为静态 UI 验收清单 / Audit checklist |
| Ant Design | 密集数据表格、筛选、分页、状态、批量操作的交互参考 / Enterprise table and operation references | 借鉴模式，不直接引入 React / Pattern reference only |
| shadcn/ui | 清爽组件尺度与状态风格 / Clean component scale and states | 借鉴外观，不安装组件库 / Style reference only |

参考 / Sources:
- https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md
- https://github.com/vercel-labs/web-interface-guidelines
- https://ant.design/
- https://ui.shadcn.com/

## 静态 UI 审计 / Static UI Audit
| 严重度 / Severity | 源码证据 / Code Evidence | 影响与建议 / Impact & Direction |
|---|---|---|
| P0 | .small 12px; .table 13px; .analysisTable 12px; .ui-eyebrow 11px | 中文密集信息可读性不足；正文 14px，辅助文字 12–13px，表格 13–14px / Increase legibility |
| P0 | #items .cardhead .toolbar 同排搜索、清空、添加、删除、批量更新；.selectionBar 又显示 5 个选择按钮 | 强弱操作混排；将搜索、主操作、已选上下文操作分层 / Split search, primary CTA and contextual actions |
| P0 | .ui-appHeader、.ui-context、#pilotControls、.ui-workNav、.ui-panelLead 多级顶部叠放 | 首屏纵向空间消耗高；压缩外壳但保留关键信息 / Reduce stacked chrome |
| P1 | .btn/.tab/.card/.ui-drawer 多套圆角与边框，.btn.soft 和 .tab.active 各自配色 | 组件语言不统一；建立状态与 token / Standardize variants |
| P1 | 重复 CSS 定义 #pilotControls、.ui-workNav、.ui-context 等，并以 body.ui-buyer-mode 再覆盖 | 累积式补丁易导致样式失控；V2 应集中单一 token 与语义组件 / Eliminate overriding patches on integration |
| P1 | #pilotDrawingPanel 多重内联 style；图纸批量匹配+单项上传+关联堆在一屏 | 将图纸入口与物料视图关联，任务抽屉内分步操作 / Contextual drawing workflow |
| P1 | .coverageMini 有 7 个并列 KPI；报价回收还包含多轮、备注、来源、粘贴与文件导入 | 报价流程主动作缺乏聚焦；供应商/轮次→导入→核验→确认 / Progressive disclosure |
| P1 | .grid2、.tablewrap 固定最多 620px 高度，列较多 | 保留横向滚动和 sticky 表头，增加密度切换与重要列的视觉突出 / High-density tables with hierarchy |
| P2 | 11–12px 的 .roundBadge、.pdfMeta | 重要状态不应只靠颜色或极小字体 / Text and icon redundancy |

审计边界 / Limits:
- 本轮基于 GitHub 源代码静态审计，未运行当前业务系统的真实浏览器测试。
- Based on static GitHub source review; no real-browser execution of the business application in this round.
- 原型展示匿名模拟记录，不承诺业务按钮生效；仅切换标签与演示筛选等必要视觉交互。
- Prototypes use fictional records and are not functional RFQ applications.

## 核心设计原则 / Design Principles
1. 列表优先：主表格尽早进入首屏，避免顶部层层卡片 / Table-first, minimize stacked headers.
2. 操作强弱：每屏唯一主 CTA，危险动作移到选择后 / One primary action; destructive actions only in selection context.
3. 密集但舒适：正文 14px，标题 20–24px，列标题 12–13px，数字等宽 / Comfortable, dense enterprise typography.
4. 稳定结构：四步导航与保存状态常驻；高级选项按需展开 / Stable four-stage navigation and save status.
5. 不以颜色代替状态：状态同时写文字 / Text labels accompany colors.
6. 数据安全：不改变任何保存、版本、附件、报价规则 / No changes to persistence or quotation semantics.

## 提交物与验收 / Deliverables & Gates
- docs/20261015_SRM_UI_V2_Audit_and_Skills.md 本审计 / This audit.
- docs/20261015_SRM_UI_V2_Design_System.md 设计规范 / Design system.
- design/ui-v2/concept-a.html 沉静专业 / Restrained professional direction.
- design/ui-v2/concept-b.html 数据控制台 / Dense data command-center direction.
- 当前仅供视觉评审；选定方向后才适配现有 DOM ID 与交互，跑 Python/Node/Playwright。
- Visual approval first; adapt to existing DOM IDs and run regressions afterward.
