## 已准备：PR #46 统一验收失败后的定向复验任务 / TEST-ONLY remediation verification (not yet started)

**任务状态：READY TO START IN CODEX CLOUD；不是已执行报告。** 本任务只针对上一轮 NOT READY 已有确定失败和新修复，不新建 PR 或重复修改旧证据。

- **唯一待测产品 HEAD：`795f663933f6883bc6e05d30b4ebbc2623a3301c`**，当前 [PR #46](https://github.com/yudacheng666/SRM_System/pull/46) Draft；之前 `66a0579...` 的原始 **94 PASS/15 FAIL、UX7 PASS/1 FAIL/1 BLOCKED** 仍然有效且不改变。先读最新 PR #46 [整改回评](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6414180453)、AGENTS / PROJECT_STATE / DECISIONS，以及本 PR 原 [failure-classification](https://github.com/yudacheng666/SRM_System/blob/369e2b775c2b8a022521c1b3b3411dec9005e8be/docs/uat/20261026-pr46-66a0579-unified/automation/failure-classification.json) / density / original traces。
- 使用隔离虚构数据、localhost 真 SQLite、真实 Chromium。开始/结束准确 SHA + HTTP 静态页面身份校验；若产品 HEAD 改变，请停止 `BLOCKED SOURCE MOVED`，不要偷偷改用新版本。
- **Phase 1 targeted smoke：** 以现有 Playwright 原测试的准确测试名定向跑原 AF-01–AF-15 所在测试（包括 B3 两种分辨率）、新 UX09 1366 行高回归。逐项报告实际 PASS/FAIL、原来的未到达断言是否现在走通；此前 15个FAIL不可预先改写成PASS。比价行高验收：真实单行尽量≤44px、价格/详情同排，1366×768首个有效报价行可见，人工已确认金额/理论/建议三口径与高价定标理由正确；如果首屏或行高仍FAIL则作为产品问题保留。
- **Phase 2 complete:** Phase1 没有 P1/P2产品安全缺陷后跑真实完整 `python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'`、`npm ci`、`npm test`、`npm run test:e2e`，记录真实 N PASS/N FAIL、完整 exit codes 和环境版本，不复用旧数字。
- **Phase 3 narrow independent negative S4 gap:** 新建**符合当前 S4 ZIP_STORED** 格式的合法新版本 S4 包，在保持文件名和 manifest 期望 hash 不变的情况下只更改 ZIP 中某个 PDF 的字节，重新计算 ZIP 自身必要 CRC 使 ZIP 结构仍有效，但**不得更新 S4 manifest PDF sha256**。从纯虚构源数据复制到空的测试目标，验证恢复明确拒绝内容 hash 不匹配、未进行任何写入，绝不能只是 ZIP_DEFLATED 的 `RESTORE_UNSUPPORTED_ARCHIVE`。针对以往 Playwright `Network.getResponseBody: ... evicted`，使用支持的后端响应读取手段/响应状态和有凭据的审计日志，保留原始错误和新 driver 源。此轮可有至多 2 次**有记录的驱动自身修正**，每次独立重启；真实产品安全失败绝不可绕过。
- **Independent buyer UAT regression:** 复核已通过 UX-01～08的关键行为（有真实数据支持）；重点 UX-09 的 row-height/1366 首屏、价格详情展开、选择有效；UX-05只将此前 **BLOCKED** 部分在新有效夹具实际测试后按真值分类。当前版本 S4 正常恢复与非空拒绝仍需烟雾回归，勿把历史已PASS写成新SHA自动PASS。
- **Native Windows 3:** 若没有真实原生 Windows 3.13/22/PowerShell-BAT 环境，明确 `NOT TESTED`，不能拿 Linux 或 GitHub Actions 无runner 结果冒充。**不启用收费 GitHub Actions**。
- **证据:** 只在既有 Draft PR #50 分支添加新目录 `docs/uat/20261026-pr46-795f663-remediation-retest/`，包含中英双语报告、逐项 results.csv、原始日志/截图/trace/exitCode、driver error register、SHA256、身份核对。发 PR #50 与 PR #46 回评。旧 `docs/uat/20261026-pr46-66a0579-unified/` 不改一字；不用新 PR/Issue、不修改产品、既有测试、CI、main/M1、不合并或关闭。若发现新的产品 BUG，留真实复现交由 ChatGPT 修复。

**GitHub comment is a handoff only, not actual Codex execution.** 只有 Codex Cloud 的真实日志/提交才算开始与完成。

