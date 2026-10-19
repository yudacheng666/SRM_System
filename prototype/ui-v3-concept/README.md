# SRM UI V3 · 独立可交互原型（非正式业务程序）
# SRM UI V3 · Independent interactive concept (not the production application)

## 定位 / Purpose

- **设计审核，不是 M1-Lite 业务版本。** 页面只使用虚构物料、供应商、价格，所有交互仅操作浏览器内存；不请求本地 SRM API、不连接 SQLite、不导入旧 RFQ、不修改历史业务数据。
- **Design review only, not M1-Lite.** All sample records are fictional, interaction state is browser-memory only, and no SRM API, SQLite database, historical RFQ or production data are involved.
- 原型覆盖三个复杂环节：供应商分配、报价回收、比价议价；询价项目、物料与图纸、设置管理提供统一导航和业务归属展示。
- The prototype focuses on supplier allocation, quote intake/revisions and buyer comparison/awards; the remaining screens illustrate navigation and functional ownership.

## 打开方式 / Open locally

1. 在 GitHub 选择 **design/20261019-srm-ui-v3-interactive-prototype** 分支，下载完整 ZIP 并解压。
1. Select the GitHub branch **design/20261019-srm-ui-v3-interactive-prototype**, download the ZIP and extract it.
2. 直接双击 **prototype/ui-v3-concept/index.html**，用 Edge/Chrome 打开。**不需要 Python、BAT、npm 或后台服务。**
2. Open **prototype/ui-v3-concept/index.html** directly in Edge/Chrome. **No Python, BAT, npm or server is needed.**
3. 刷新页面会重置本次原型操作。CSV 下载属于虚构的评审产物，不是正式询价包或真实比价报告。
3. Refresh resets all prototype interactions. CSV downloads are fictional review artifacts, not official quote packages or procurement reports.

**请勿**将原型的 CSV 上传至实际业务工作区，或把原型“确认报价”当作持久化操作。
**Do not** use exported demo CSVs as actual business records or assume quote confirmation writes anything to SQLite.

## V3.1：不需要先做逐项人工测试 / Guided visual review

这次优先把页面做得更像完整的企业采购工作台，而不是再让采购管理人员充当测试工程师：

- 打开页面默认显示 **比价与议价**，包含整齐的指标、业务提醒、供应商对比矩阵，以及并列最低价决策入口。
- 右上角点击 **「查看典型场景」**，直接选择 **「跨页分配」/「报价修订」/「并列最低价」**，页面会自动进入对应演示状态；不必手工导入 Excel 或维护测试数据。
- 在供应商分配表格上方切换 **「紧凑 / 舒适」**，观察不同内容密度。
- 在 GitHub [SRM UI V3 Design Preview](https://github.com/yudacheng666/SRM_System/actions/workflows/srm-ui-v3-design-preview.yml) 自动检查中，Playwright 会在 **1024×768、1366×768、1600×900** 下真实截图。用户可以先看自动截图和独立 UX 审核报告，再决定是否做人工评审。

- The page opens directly into the comparison workbench; a guided tour prepares realistic scenarios automatically.
- Dense/comfortable row modes let reviewers assess data readability without importing real files.
- Automated Chromium screenshots capture three desktop viewports; static checks alone never count as actual usability acceptance.

## 先按这份清单评审 / Review in this order

| 步骤 / Step | 实际操作 / Try | 预期 / Expected |
|---|---|---|
| 1 | 导航切换「供应商分配 → 比价议价 → 供应商分配」 / Switch navigation | 高亮准确，不跳出工作区 / Active nav stays accurate |
| 2 | 左栏选 SUP-A，右侧勾选一页；跳到下一页继续勾选；返回批量追加关联 / Select items across pages and link | 选中数跨页保留，其余供应商关系不被覆盖 / Selection persists across pages, links are additive |
| 3 | 「新增供应商」尝试重复编码和同名不同码；「模拟 Excel 导入」 / Try manual duplicate and mock Excel import | 重复编码禁止；同名转人工核查；唯一项才导入 / Duplicate codes are rejected, ambiguous names flagged |
| 4 | 「导出当前供应商询价单」 / Export a supplier RFQ CSV | 含虚构 RFQ 身份及本供应商分配的物料，不含内部报价 / Only assigned items and synthetic identity |
| 5 | 「报价回收」查看 R1 V1，尝试修改；点「基于当前版本修订」改一行、模拟导入、确认 / Open R1 V1 and revise | 已确认版本不可改；V2 差异突出、可确认；回看 V1 保持原样 / Confirmed immutable, revisions preserve history |
| 6 | 新建下一轮，查看缺报项目；只报部分物料并确认 / Create next round and leave some items unquoted | 未录入不自动沿用上一轮、不按零元报价 / No silent carryforward or zero-price imputation |
| 7 | 「比价议价」第一条 DEMO-1001 为两家并列最低 / Compare first item | 不自动选择 AAA/BBB；点「选择供应商」，必须写明理由 / Ties remain unawarded until explicit reason |
| 8 | 调整比较供应商、查看并列/待决定筛选、导出决策 CSV / Use supplier scope, filters and export | 最低价推荐与采购员选定分开；输出原因 / Calculated recommendation is separate from award |
| 9 | 按 1366×768、1024×768、1600×900 分别观察 / Compare responsive viewports | 内容主次、列宽、横向滚动、紧凑密度清晰 / Compact dense table remains usable |
| 10 | 点击「复制评审摘要」，记录修改意见 / Copy review summary | 可粘贴到 ChatGPT 或 PR 评论 / Reusable review notes |

## 这次特别需要评审的设计规则 / Design decisions to verify

1. **导航归属**：供应商新增、批量导入、关系分配、询价单导出在同一模块；比价报告只在比价页；备份及模板只在系统管理。
1. **Functional ownership**: supplier editing/allocation/RFQ export remain together; comparison reports live in comparison; backup/templates stay in admin.
2. **数据表格**：紧凑行高、固定工具栏、多选明确、关联供应商尽量完整显示；1366×768优先优化。
2. **Dense tables**: short rows, fixed tools, clear selection and full supplier badges, designed for 1366×768 first.
3. **报价历史**：已确认版本不编辑，修订创建新版本，保留旧版；暂不更换后端完整快照模型。
3. **Quote history**: confirmed revisions remain read-only; do not redesign the underlying snapshot database in this prototype.
4. **比价决定**：相同有效最低价属于并列待确认，须人工选定并填理由；推荐不等于采购最终中选。
4. **Buyer decision**: equal applicable prices produce a tie requiring buyer selection and reasoning, never first-in-list defaults.
5. **身份与隐私**：示范可读 RFQ 业务编号和行号；任何数据均虚构，不使用真实企业、产品、供应商或个人信息。
5. **Identity and privacy**: readable demo RFQ numbering, fully fictitious records only.

## 局限与下一阶段 / Limitations and next phase

- 没有真实 Excel 导入、复杂多币种/税率/阶梯区间、PDF 上传、SQLite 自动保存或 S4 备份；这些功能应保留原系统代码，之后单独开发与回归。
- No real XLSX parser, currency/tax tier engine, PDF persistence, SQLite autosave or S4 restore; existing M1-Lite implementations must be preserved and independently tested after integration.
- 本原型仅示范供应商去重校验和模拟粘贴报价，不代表已完成正式去重数据治理、异常处理或报价证据链。
- Supplier deduplication and quote paste are concept demonstrations, not production-grade master-data rules or evidence-chain processing.
- 供应商分配与决策 CSV 为模拟输出，不包含正式客户和供应商信息。请勿据此办理真实采购。
- Demo CSV exports are not real procurement documents. No real commercial data may be committed to this repository.
- 当前未执行 Windows 本机手工浏览器验收；代码静态检查不能代替真正的采购员交互评审。
- Windows desktop manual usability acceptance remains outstanding; static code checks are not a substitute for buyer review.

## 下一步 / Next

用户先评审页面的导航、层级、密度和三大模块的操作逻辑；**只有界面和业务规则获得确认后**，才在独立产品分支中分阶段接入实际 SRM，保持原有数据、历史及 S4 恢复能力。Codex Cloud 仅负责独立验收和报告。
The user reviews the IA, density, and workflows first. Integrate with real SRM only after signoff, on a separate product branch, preserving existing business records/history/S4. Codex Cloud tests independently and reports only.
