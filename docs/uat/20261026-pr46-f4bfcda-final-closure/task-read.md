# SRM PR #46 第三轮短周期收口验收：精准冻结新 HEAD，Codex Cloud TEST-ONLY

**状态：任务已在GitHub交接，Codex Cloud尚未实际启动；用户上一轮确实完成 `795f663` 测试。**

| 范围 | SHA/约束 |
|---|---|
| 最新唯一被测产品 | `f4bfcda8efdf3998c833ed25c3193a056fdde451`，现有 Draft [PR #46](https://github.com/yudacheng666/SRM_System/pull/46) |
| 旧版的真实 NOT READY | `795f663`：103 PASS/7 FAIL，独立UX8 PASS/1 FAIL，S4完整格式篡改拒绝PASS |
| 新测试证据独立目录 | `docs/uat/20261026-pr46-f4bfcda-final-closure/`，只能追加到现有 Draft PR #50，原所有证据只读 |
| 参考整改记录 | [PR #46 最新ChatGPT回评](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6415422410) |

## A. 精准版身份与环境

从仓库阅读 `AGENTS.md`、`docs/ai-memory/PROJECT_STATE.md`、`DECISIONS.md`，核实准确被测 PR HEAD/start/end、Git checkout及 HTTP 实际 `index.html` 文件哈希。使用原 M1 SQLite localhost、虚构新数据、Node和真实Chromium隔离运行。若被测SHA变更则标 `SOURCE MOVED BLOCKED`，不能静默以别版替换。Codex **只测试和交证据，不修改产品/现有测试/CI**，不启用收费GitHub Actions，原生Windows3若无真实Windows标NOT TESTED。

## B. 定向“清零7项”验收（先执行，不能略过）
1. 原AF02：`acceptance05` 刷新后点击物料页，再验证原物料搜索、PDF原件预览和双供应商隔离 ZIP 断言全部真实到达。
2. 原AF04：`acceptance07` 真实409和断线后在可见供应商表单作修改，显示失败，服务重启手动保存；全部原断言运行。
3. 原AF06：`acceptance13` 1366×768导入与刷新后实际导航到物料页，**完整首条物料行**在首屏内。
4. `UX pending-only`：点击真正价格按钮，待决定分页数量变化与状态保持（此前整格点开详情）。
5. `UX manual-only`：3个显式报价按钮后真实人工已确认金额及统计，不把自动建议混入。
6. `B3 tied-lowest`：点击显式报价按钮，验证同价无理由、较高价强制理由和原始持久化断言。
7. `UX09 1366 comparison density`：用**真实当前版本业务数据**，测量普通有效报价行严格 **≤44px**，且首个可选择报价 **整行下边缘≤768px**，价格按钮与详情同排、真实可展开、有效选择与金额未变。必须报告 DOM 的 top/bottom/height/viewport 和 **1366×768 scrollY=0 首屏截图**；若仍不达标，维持 FAIL/P3，不得把 CSS 改动当作通过。另检查 1024×768、1600×900 无溢出/截断。

## C. 本准确 SHA 的全套 & 业务回归

B定向后仍真实执行全部 Python unittest、`npm ci`、`npm test`、`npm run test:e2e`；完整原用例都跑、不预设成功数量、不得因为单项独立PASS而修改原套件 FAIL。归档每条 PASS/FAIL、运行时版本、exit code、服务日志、原始测试截图/trace及 HTML identity。独立重测：UX01-09、Excel预览/确认、物料-PDF映射/原文件、供应商追加与ZIP隔离、阶梯与多轮报价、并列/非最低价定标理由、人工1979与理论6940/建议7064不同口径（仅在同一指定模拟夹具下）、RFQ持久化/409、S4完整备份及**正确ZIP_STORED篡改PDF哈希拒绝、空恢复、非空拒绝**。之前版本的S4 PASS仅作为回归基线，不自动算新SHA通过。旧演示数据库迁移兼容排除(D-024)。

## D. 结果与写回

只在既有证据 PR #50 分支追加 `docs/uat/20261026-pr46-f4bfcda-final-closure/`，中英双语报告、逐例CSV、原始日志、截图、trace/缺口登记、准确SHA校验及文件校验和。回评 PR #50 和 PR #46：准确自动化数量、UX09实际测量、未测/阻断、是否有真实P1/P2/P3，以及明确 **READY / NOT READY for this development candidate**。若确认产品 BUG，保留真实复现由 ChatGPT 开发修复，Codex不修产品，不新增PR/Issue，不合并/关闭既有PR。Windows3、Actions本轮均不是隐含PASS。

**本GitHub任务说明仅是交接，不会自动启动 Codex Cloud。** / This posted assignment is not an actual run.
