## [Codex Cloud INDEPENDENT RETEST TASK] PR #20 INTEG-01 + BASE-01（仅测试，不修改产品）

**分工不变：ChatGPT 修复代码和回归；Codex Cloud 只进行独立第三方真实 GUI 验收、脱敏证据与报告；不修改业务代码/既有测试/CI、不自行合并。**

### 版本和已知证据
- **原集成基线：** `420d2af326a3f59c1c6015d6b0fe44db23fe0fc6`。
- **前一候选：** `dec5e480cf87441972da05f1074dfa3589285b30`，独立 [PR #20 PARTIAL 报告](https://github.com/yudacheng666/SRM_System/pull/20#issuecomment-6220094085)、[Draft 证据 PR #21](https://github.com/yudacheng666/SRM_System/pull/21)；INTEG-01 CSV 身份独立 PASS（旧版重新复现），但此前 Actions 新增第14项超时，且发现 **BASE-01/P2：供应商视角跨 RFQ 新建时残留旧供应商，页面报错**。
- **本次新修复候选：`244dc7c9088cee2e1f0e9488156c249dfbb59ac3`**，`fix/20261016-common-scope-csv-rfq-id` → `draft/20261013-m1-storage-ui-audit`，仍是 Draft PR #20；测试前/后锁定实际 HEAD。
- 本次增量只针对 BASE-01 清理 `activeSupplier` 旧 RFQ 视图身份、渲染时额外检查供应商属于当前 RFQ；修正测试 14 的动态 `:not(:checked)` 定位器为稳定供应商编码；新增测试 15 完整跨 RFQ 的供应商视图创建/切回。**不更改 CSV 核心修复、数据库结构、报价算法或已确认历史。**
- [UI V2 最新工作流](https://github.com/yudacheng666/SRM_System/actions/runs/38938757239)、[S3/S4 最新工作流](https://github.com/yudacheng666/SRM_System/actions/runs/38938757220)；开始独立测试前核实是否全部 `completed/success`。若失败，保留真实失败，不得将先前 38 PASS 冒充本轮全通过。

### 独立实际操作（新数据目录、真实浏览器+SQLite、全虚构）
1. **BASE-01 旧版再现：** 在 `420d2af3` 或 `dec5e48` 上从 GUI 建正式 RFQ，导入至少两家虚构供应商及物料、分配；切「供应商分配 → 按供应商」并选中 SUP-B；直接点「新建另一笔空白询价」。预期旧版抛出 `Cannot read properties of undefined (reading 'name')`，供应商标题残留；要求原版操作截图、浏览器 console/pageerror trace。若没有重跑旧版，明确使用上一轮已有复现实证据，不能冒充新复现。
2. **BASE-01 新版：** 同样的真实 GUI 操作于本候选复验。新 RFQ 工作区必须真实独立：供应商列表为空，标题显示「选择左侧供应商」，不显示 SUP-B、无 pageerror/console 异常。观察自动保存、刷新及真实服务重启，确保不会无故生成旧供应商关联。
3. **切回和反向边界：** 在新 RFQ 用页面重新导入供应商和物料、进入供应商视角选择 SUP-A，再从项目列表切回原 RFQ。检查供应商标题重置，两个 RFQ 的物料/供应商、分配、报价历史、SQLite 持久化快照均各自正确且不相互污染。也检查“旧 SUP-B 从本项目移出”后 UI 能正常回退未选择状态；不能绕过已确认历史保护。
4. **INTEG-01 不回归：** 真实 UI 同比较组导出两笔正式 RFQ 的 CSV，文件名、表头和每条明细/合计行都含各自真实 workspaceId；原 `RFQ Line ID` 仍存在；两个 RFQ 可用相同本地行号而不能混淆；金额计算、UTF-8 BOM、中文/CSV 安全转义、刷新及服务重启一致；导出前后 SQLite 版本和 snapshot SHA 不变。演示文件仍明确使用演示身份。
5. **新增 CI 测试 14、15 观察**：记录当前 HEAD 两套 Actions 原始状态、各自测试数、失败/跳过数；分析它们是产品问题还是测试定位器问题，绝不能只凭 CI 判定 BASE-01 的真实 GUI 通过。可独立在云端重新跑定向 GUI，不得修改回归脚本。
6. **最小受影响回归**：F1 ERP 当前/来源 RFQ 身份、F2 同编码规格显示/供应商分配、F3 不供货、有效报价历史以及 S4 备份恢复抽测；Windows 本机 GUI、Windows 原生 Excel、真实采购员生产 UAT 继续 NOT TESTED。

### 提交
在 **PR #20 顶层新评论**提交中文版逐项 PASS/FAIL/NOT TESTED、英文摘要、两个缺陷的原版与新版本对照、GitHub Actions 结果、实操截图/trace、JSON 快照及准确 SHA。大体量可使用新的独立 `test/` 分支和 Draft 证据 PR；不得改动产品代码、现有测试或 CI；不得合并 PR #20 或变更开发基线/`main`。

**停止点：** 报告 INTEG-01 与 BASE-01 是否均消除、是否建议用户合并 PR #20 后停止，等待用户批准。
