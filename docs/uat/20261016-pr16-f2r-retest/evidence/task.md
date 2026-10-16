## [Codex Cloud RETEST TASK] PR #16 F2-R 第二轮议价范围补修 · 独立定向复验
**仅测试，不开发、不修改代码或原测试、不合并。**

### 版本与事实
- 原独立复验：[PR #16 HOLD 报告](https://github.com/yudacheng666/SRM_System/pull/16#issuecomment-6210893813)；[完整报告](https://github.com/yudacheng666/SRM_System/blob/0fabd5fec3c9e9ec0b9c43659f6888faf2ca3e49/docs/uat/20261016-pr16-independent-retest/REPORT.md)。原候选 `da406eb55da75971c08881ca96c87d66ba7f5bfa` 中 F1 PASS、F3 原缺陷 PASS、F2 的已测七处 PASS，但新发现**第二轮议价范围选项未显示规格**（F2-R / R20 FAIL）。
- ChatGPT 补修候选 **`9406973f0e99bd33f9f4140c89b9df5d7c58d443`**，分支 `fix/20261016-pr15-uat-f1-f3`，Draft PR #16 的目标是 `feat/20261016-erp-core-field-alignment`（PR #15）。复验开始前确认 PR HEAD 与此 SHA 一致；若变化，明确记录实际 SHA。
- 本次仅修改 `prototype/m1-lite/index.html` 中「第二轮议价范围」及相邻「沿用上轮项目」的**可见物料身份文案**，新增 `ERP09` Playwright 回归；不更改报价结构、ID、历史、议价范围保存与价格计算。
- 开发者 CI（本次候选准确 SHA）：[S3/S4 Linux+Windows](https://github.com/yudacheng666/SRM_System/actions/runs/38872038785) **SUCCESS**；[UI V2 Linux Chromium+Windows](https://github.com/yudacheng666/SRM_System/actions/runs/38872038877) **SUCCESS**。CI 不等于 Codex 独立复验。

### 测试方式
- 使用独立 **Codex Cloud / Linux** 隔离服务、独立 SQLite/HTTP/浏览器配置及**匿名数据**，按真实采购员 UI 操作按钮和表单；不可直接改 JS/SQLite 注入模拟状态。提供浏览器版本、实际步骤、截图和 trace。
- Windows Computer Use/Windows 原生 Excel 仍暂停并标记 NOT TESTED。Codex 不修程序、不修改既有测试/CI，不合并任何 PR。

### F2-R 原版观察 → 当前候选消除
1. 参考旧版证据 [scope follow-up](https://github.com/yudacheng666/SRM_System/blob/0fabd5fec3c9e9ec0b9c43659f6888faf2ca3e49/docs/uat/20261016-pr16-independent-retest/evidence/new-30-residual-scope-spec-missing.png) 和 `scope-followup-rows.json`。在补修前旧候选 `da406eb5` 的第二轮范围项只有 TEST-001/名称/RFQ行ID，缺 M16/M20。原版问题**已有独立复现证据**；若重新实际复现，单独记录，不得挪用证据谎称本轮操作。
2. 在新候选从真实 UI 创建虚构 RFQ：两个**同存货编码+同名称**但规格分别 `M16`、`M20` 的询价行；分配同一家虚构供应商；通过导入/录入确认**第一轮两条有效报价**，记录对应不可变 RFQ Line ID 和单价。
3. 点击「新增下一轮」→「设置本轮议价范围」；**两行选项必须同时显示 M16/M20 与各自 RFQ Line ID**，而非只有编号；空规格写「未填写」，长规格的完整值须能通过正常标题/hover 属性读取，三个宽度 1024×768、1366×768、1600×900 检查没有遮挡/串行。
4. **仅勾选 M20**，保存范围。验证第二轮 `expectedLineIds` 仅为 M20 那个不可变行 ID（可以只读检查保存态），第一轮 M16 和 M20 历史记录完整；第二轮录入新单价仅影响 M20，不将 M16 误合并/改价。刷新并重启后再次核验范围、有效价、轮次、来源与历史。
5. 在第二轮遗漏报价、仍有可安全沿用的场景，点击「选择沿用上轮项目」；候选选项也必须显示正确规格与原 RFQ ID，不能让 M16/M20 混淆；不得修改确认依据、自动带价、已确认锁定等已有安全规则。可复核空规格、长规格、勾选、取消后的状态。
6. 做小范围防回归：旧报告的图纸候选、人工匹配、供应商双向分配、报价预览/已确认明细、比价固定身份区仍能区分规格；F1 的来源 RFQ 身份往返、F3 「不供货」展示只作精简抽测，不必重复整个 46 项完整验收。旧报告 19 PASS 项与 F4/F5 的结论不得无依据改写。

### 报告要求
- 明确 `F2-R: PASS / FAIL / NOT TESTED`、原版证据与新候选操作截图/trace、所选 M20 RFQ行ID、第二轮仅一条范围、第一轮历史未变、是否发生额外回归。
- 单独列出 F1/F3 既有 PASS 是否被影响、Windows 等能力限制、任何新缺陷及复现步骤。禁止以已有 CI 结果冒充第三方操作。
- 中文为主，英文对照摘要；将简洁结论写回**PR #16 顶层评论**，大体积证据可置于独立 `test/` 证据分支（匿名数据，绝不修改业务代码）。
- 结论即使 PASS，也只能**建议用户考虑合并 PR #16 到 PR #15 的 ERP 候选分支**；不自行合并或覆盖 `main`，不宣称 Windows 本机验收完成。

**任务停止点：** 完成独立 F2-R 定向复验并回写 PR #16，等待用户批准下一步。
