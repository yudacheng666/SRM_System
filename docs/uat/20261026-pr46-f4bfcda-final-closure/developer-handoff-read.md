## 2026-10-26 整改复验 103 PASS / 7 FAIL：ChatGPT 已处理全部剩余确认阻断，现待新 SHA 实测

### 已核实上一轮 [PR #50 原报告](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6415100958)
- 实测旧产品 `795f663933f6883bc6e05d30b4ebbc2623a3301c`：Python44 PASS、Node10 PASS、Chromium49 PASS/7 FAIL（合计**103 PASS/7 FAIL**），原15项12 PASS/3 FAIL；独立UX **8 PASS/1 P3 FAIL**，核心业务12 PASS，Windows原生3 NOT TESTED。
- 原先阻断的 **S4合法ZIP_STORED内容篡改SHA校验已真实通过**（400 RESTORE_PDF_HASH_MISMATCH，空目标不变），本轮不再把S4标BLOCKED。正常恢复/非空拒绝、报价历史/人工定标及供应商隔离仍有旧SHA的独立证据。
- 6项测试适配：AF02刷新后隐藏物料搜索、AF04断开服务时隐藏供应商输入、AF06刷新后不合理期待常驻项目页关闭；另UX pending-only、UX manual-only、B3 tied-lowest整格中心点击命中详情而非报价按钮。**均为旧测试路径/定位假设**，不是已确认6个产品计算BUG。
- 唯一新确认产品P3为比价普通行44.4375px（验收上限44）与1366×768首个报价行top843.96875（未入首屏）；价格与详情同排已有PASS。

### ChatGPT 已提交，**新候选唯一SHA `f4bfcda8efdf3998c833ed25c3193a056fdde451`（仅静态检查、尚未执行真实浏览器）**
- `acceptance.spec.cjs`：AF02刷新后明确进入物料页；AF04断线前显示供应商表单；AF06刷新后重新进入物料页、仍检查首行全可见；保留原来的完整PDF、报价/ZIP/并发与U7业务断言。
- `ui-ux-structural.spec.cjs`：两条点击改为**真实 `.quotePrice`**，保留真实待决定数量与人工金额断言。
- `ui-v2-b3.spec.cjs`：并列最低和非最低按钮明确选价，不误点交易条款展开区域；原因弹窗/状态原断言不删。
- `index.html`：UX09将仅说明性质的完整规则折叠区移到报价表之后；1366×768时五项决策数值压成一行、保留人工/建议区分、缩小非关键解释与重复标题、降低普通报价行内边距，仍保留全部金额、报价与可展开商务条款。
- `ui-ux-structural.spec.cjs` UX09额外严格要求普通行≤44px、**首条报价整行**进入768px首屏、价格详情中心同排、展开可见。
- 代码层静态 JS 检查通过；**这是代码整改，不是新的PASS**。实际首次屏高/布局及6项测试结果均待Codex重测确认。

[下一步TEST-ONLY统一复验任务将在现有 Draft PR #50 评论中交接]：准确本SHA先定向7个上一轮失败（6适配+UX09），再完整 Python/Node/Chromium 和独立业务烟雾，Windows三项除非真实原生环境否则 NOT TESTED；旧证据原目录不可覆盖。保留三个 PR Draft，禁止付费Actions、main/M1合并或将本评论视作已启动测试。

English: Six legacy test-interaction failures adapted without weakening business assertions; UX09 layout further compressed with stricter fully-visible first row criterion. New exact SHA has static parse only. Existing confirmed STORED S4 tamper rejection PASS remains historical evidence, not transferred to new SHA.
