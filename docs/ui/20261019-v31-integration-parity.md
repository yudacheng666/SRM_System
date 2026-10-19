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

## PR #26 独立复验发现与定向修复 / Visual P2 remediation (2026-10-19)

参考：[Codex 独立测试 PR #26](https://github.com/yudacheng666/SRM_System/pull/26)；该次测试业务 23 PASS、视觉 5 P2 FAIL，原 P3 已修复。**视觉改造未经验收，不得将以下代码修复等同于 P2 PASS。**

| 缺口 | 代码整改（正式 M1-Lite，不移植模拟模型） | 独立复验标准 |
|---|---|---|
| P2-V01 物料新标题隐藏 | 正式询价模式恢复 `srmV3PageStage-items` 可见，旧按钮和业务 DOM 保留 | 买方模式三尺寸实拍有正确标题 |
| P2-V02 关闭抽屉留白 | 所有管理 `details` 折叠时高度紧贴 `summary`，展开时允许自身增长 | 任一抽屉打开，其他已收起抽屉不被拉伸 |
| P2-V03 分配结构旧、状态欠缺 | 1024/1366/1600 物料优先双栏，供应商视角左侧紧凑名单、右侧宽物料；显示数量、全部关联供应商和勾选状态 | 双向追加、Shift 连选、分页、历史锁定一致；关联方和数量来自真实状态 |
| P2-V04 同轮版本差异缺失 | 从 `quoteRounds` 内同轮**此前已确认版本**只读计算 V1→V2 变更、价格与状态差异；旧单价列指明“同轮上版” | V1 单价 10 → V2 单价 9，应显示上版 ¥10、新版 ¥9、变化 -1 / -10%，切回 V1 仍只读、无覆盖 |
| P2-V05 比价自动/人工含义混淆 | 上置真实报价决策摘要，`manualAwards` 与 `awards` 分开显示；自动最低价不叫“最终选择”；金额分析注明含自动建议 | 报价已确认但尚未人工选定时人工数 0；人工选 B 后更新来源与数量；金额及非最低价理由保持正确 |

所有修改仅针对呈现及真实状态读取，禁止变更 SQLite 模型、报价确认/定标算法、PDF 字节、Excel 输出、S4 备份。新增的自动化只验证可稳定断言的 DOM/几何；**同轮 V1/V2 差异、人工选择语义仍必须由 Codex Cloud 使用真实 GUI 独立核验。**

**验收门槛：** 新 HEAD 的 UI Unified、S3/S4 两套 CI 全部成功后，Codex Cloud TEST-ONLY 逐项给出 P2-V01 至 P2-V05 的独立 PASS/FAIL/NOT TESTED，提供对照 PR #23 的三分辨率截图及真实业务断言；视觉和功能分别汇报，证据写入独立 Draft PR。保持 PR #24 Draft，不合并 main。

## PR #27 独立报告 — 并列最低定标与提示修复 / Tie-resolution follow-up (2026-10-20)

来源：[Codex TEST-ONLY PR #27](https://github.com/yudacheng666/SRM_System/pull/27)（目标 `10d35fa6...`）：V01–V04、原 P3 PASS；**V05 FAIL + 业务 B01 FAIL**；保存/重启/S4 PASS。

### 根因与修复 / Root causes and fixes

- **P2-B01：** 原代码用 `lowestSupplierForItem()` 返回的**第一家**供应商编码作为唯一合法最低报价判定。¥20/¥20 时选择第二家被当作非最低，错误强制填写理由，还把理由写入导出。新增 `isLowestApplicableOffer()` 判断**所有有效适用价中的最低价格集合**；容许细微浮点误差，保留真正高价需原因的控制。应用于单选、批选、提交、理由写入和确认报价后的人工定标复核。系统自动默认建议仍可选择其中一家，**不等于人工明确决定**。
- **P3-U01：** 原“并列最低待核对”汇总了所有并列，不考虑人工是否已选择。现在只统计**并列且尚未人工确认/因新报价需要重新复核**的项目。完成后显示 0；重开采购项目及 F5 应保持正确。
- **一致性：** 并列最低报价单元格都标记最低价视觉，不应一方被标为次低。既有最低价理论组合、比较组、有效阶梯适用价与货币口径规则保持不变；历史资料不进行自动删除或重写。

### 开发者新回归 / New automated regression

扩充正式 SQLite + Chromium `ui-v2-b3.spec.cjs`：创建真实 RFQ → 导入12条虚构物料与两家供应商 → 两家分别确认含两项的报价（`TST-001 A=20/B=20`, `TST-002 A=8/B=12`）→ 选择 B 的并列最低无需弹非最低理由，`manualAwards` 和 `awardReasons` 正确 → 选择 B 的真正高价仍弹原因且未填时不提交 → 手工确认后“并列最低待核对 0”、人工已选 2、待人工 0 → SQLite 持久化与 F5 状态保持。

以上是产品开发修复与测试定义，**不是独立验收 PASS**。本轮仍需等待最新准确 HEAD 的 UI Unified 与 S3/S4 两套 CI 全部成功，随后 Codex Cloud 再执行 TEST-ONLY 并提交独立报告；使用虚构数据且不修改 `main`。历史用户数据如存有错误理由，不做无授权自动改写。
