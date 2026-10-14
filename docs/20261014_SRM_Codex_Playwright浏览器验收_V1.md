# SRM Codex Cloud + Playwright 浏览器验收 V1
# SRM Codex Cloud + Playwright Browser Acceptance V1

关联任务：GitHub Issue #3；验收日期：2026-10-14（Asia/Shanghai）。
Task: GitHub Issue #3; acceptance date: 2026-10-14 (Asia/Shanghai).

基线：`draft/20261013-m1-storage-ui-audit`，提交 `49d52084190bece75ae5a0ab90da722df5872f82`；独立分支：`test/20261014-issue3-playwright`。
Base: `draft/20261013-m1-storage-ui-audit`, commit `49d52084190bece75ae5a0ab90da722df5872f82`; dedicated branch: `test/20261014-issue3-playwright`.

main 起始提交：`f330de510f97c552629052ff1841d7223194e7f8`。所有修改只提交至独立测试分支，PR 目标为上述 draft 分支；不合并。
Initial main: `f330de510f97c552629052ff1841d7223194e7f8`. All changes go to the test branch; the PR targets the named draft branch and is not merged.

## 执行环境与证据
## Execution environment and evidence

Linux 云端、Python 3.12、Node 24、Playwright 1.58.2、系统 Chromium。测试使用真实 `server.main()`，包含 SQLite、同源 loopback API 和真实后台备份线程。
Cloud Linux, Python 3.12, Node 24, Playwright 1.58.2 and system Chromium. Tests run real `server.main()` with SQLite, same-origin loopback APIs and the actual background backup thread.

每个测试新建临时 `SRM_DATA_DIR`；恢复另开独立空白目录和端口 8766。测试结束停止子进程并删除临时目录，从未使用默认数据库或用户电脑。
Each test creates a temporary `SRM_DATA_DIR`; restore uses another empty root on port 8766. Teardown stops processes and removes temporary roots; no default database or user's computer is used.

XLSX、两个有效两页 PDF、坏文件均由 `tests/e2e/fixtures.py` 确定性生成；供应商 SUP-A/SUP-B、物料 TST/BIG、报价均为虚构样本。询价 ID 由真实页面生成，不依赖固定时间或价格 100/90。
XLSX, two valid two-page PDFs and malformed inputs are generated deterministically by `tests/e2e/fixtures.py`; SUP-A/SUP-B, TST/BIG items and prices are synthetic. The real UI generates RFQ IDs; assertions do not depend on fixed times or prices 100/90.

业务数据通过真实点击、输入、文件选择和确认准备；API/SQLite 用于独立核对、历史读取和恶意写入保护测试。下列条目明确区分浏览器与 Python/Node 验证。
Business setup uses real clicks, inputs, file selection and confirmations; API/SQLite reads independently verify data/history and malicious requests test protections. Entries below distinguish browser checks from Python/Node checks.

轻量摘要与原始证据 SHA-256 索引位于 `docs/evidence/20261014-issue3/`；大型截图、Trace、下载附件和运行日志改由每次 GitHub Actions 的 `srm-playwright-evidence` Artifacts 保存（保留 14 天）。
Lightweight summaries and historical SHA-256 lists stay under `docs/evidence/20261014-issue3/`; large screenshots, traces, downloaded files and run logs are stored in per-run GitHub Actions `srm-playwright-evidence` artifacts (14-day retention).
运行说明位于 `prototype/m1-lite/tests/e2e/README.md`；早期完整证据可从原始历史提交 `08ddba9cea200fe2b1bcbd6cce202f24db68d0d2` 追溯，但当前分支不再重复追踪这些运行产物。
Run instructions are in `prototype/m1-lite/tests/e2e/README.md`; the initial historical commit `08ddba9cea200fe2b1bcbd6cce202f24db68d0d2` remains traceable, while current branch snapshots no longer track duplicate runtime artifacts.

## 场景结果
## Scenario results

1. **启动与隔离：PASS（浏览器）**。健康检查 200；演示未写数据库；空白正式询价无演示物料；首次空闲自动提交；导入 12 行后等待服务器快照一致，刷新、停止/重启真实服务后状态一致。trace 01 和 startup.png。
   **Startup/isolation: PASS (browser)**. Health 200; demo never persists; fresh RFQ has no demo items; first idle autosave commits; after importing 12 rows, wait for server equality, reload and restart the real service, then assert state equality. Trace 01 and startup.png.

2. **物料：PASS（浏览器）**。真实 XLSX 预览、确认 12 行及另一询价 100 行；重复编码不增加物料行；非法数量确认按钮禁用；损坏 XLSX 显示读取失败；刷新数量保持。trace 02。
   **Items: PASS (browser)**. Real XLSX preview/confirmation for 12 and 100 rows in separate RFQs; duplicates do not add item identities; invalid quantities disable confirmation; broken XLSX reports failure; counts survive reload. Trace 02.

3. **供应商：PASS（浏览器）**。真实供应商 XLSX 预览、确认两家；重复导入显示重复且不能确认；本询价参与供应商和选择控件与快照一致。trace 03。
   **Suppliers: PASS (browser)**. Preview/confirm a real two-supplier workbook; duplicate import reports duplication and disables confirmation; RFQ participants and selection controls match snapshots. Trace 03.

4. **双向分配：PASS（浏览器）**。12 行先加 A 再加 B，断言每行同时关联两家；移除 B，再从供应商方向勾选一行，保存；新建、切回旧询价后逐条关系一致。trace 03。
   **Bidirectional allocation: PASS (browser)**. Add A then B to 12 lines and assert two suppliers per line; remove B, check one line from the supplier view and save; create/switch RFQs and assert exact allocation equality. Trace 03.

5. **报价：PASS（浏览器 + 真实保护 API）**。A 的 XLSX 含两行有效报价及 UNKNOWN 多报行，显式确认部分导入，漏报 10 行；第一轮阶梯价、第二轮 15.125、新增本轮版本、B 粘贴实际 16.75/22.25；确认后按钮锁定。篡改已确认轮次使用当前修订发起真实 PUT，400 拒绝且修订不增。trace 04。
   **Quotes: PASS (browser + real protection API)**. A's XLSX has two valid lines and UNKNOWN extra; explicitly confirm partial import and observe ten missing lines; first-round tiers, round two at 15.125, a new revision and B's actual pasted 16.75/22.25 prices; confirmation locks the UI. Tamper using a current-revision PUT: 400 rejection and no revision increase. Trace 04.

6. **比价与 XLSX：PASS（浏览器 + 下载解析）**。明确选择两家；第二轮 A 仅报价 TST-001，因此共同有效范围为 1 项；数量 2 件，A 金额 30.25、B 金额 33.50；最低价组合 97.00。下载真实比价 XLSX，检查 OOXML、实际报价、ROUND/SUMIF 公式，独立从导出单价与数量重算共同范围金额。trace 04、comparison.xlsx。
   **Comparison/XLSX: PASS (browser + download parsing)**. Explicitly select two suppliers; A round two only covers TST-001, so shared valid scope is one line; quantity two yields A 30.25 and B 33.50, with theoretical minimum combination 97.00. Download real XLSX, inspect OOXML, actual prices and ROUND/SUMIF formulas, and recompute shared totals independently from exported prices/quantities. Trace 04, comparison.xlsx.

7. **图纸：PASS（浏览器）**。真实两页 PDF 的文件名自动匹配 TST-001；另一个未匹配文件人工纠正至 TST-002；确认后两个关联保持；刷新后打开原件 iframe 并翻至第二页，原件读取经 SHA-256 校验。PDF 字节另在 ZIP/恢复场景逐字节核对。trace 05。
   **Drawings: PASS (browser)**. Filename matching links a real two-page PDF candidate to TST-001; manually correct the unmatched PDF to TST-002; confirmation creates two persisted links; after reload, open the original PDF iframe and navigate to page two through checksum-verified reads. ZIP/restore checks additionally compare original bytes. Trace 05.

8. **供应商 ZIP：PASS（浏览器 + 下载解析）**。A 关联 12 行、B 仅 TST-002；逐家下载 ZIP，仅一个本家 XLSX 和对应原名 PDF，禁止 JSON；B 不含 TST-001 或 A 的图纸。检查 XLSX 文件名供应商身份、物料范围和每份 PDF SHA-256。trace 05、SUP-A.zip、SUP-B.zip。
   **Supplier ZIP: PASS (browser + download parsing)**. A has 12 lines; B only TST-002. Download each ZIP: exactly one scoped XLSX and the corresponding original-name PDFs, no JSON; B excludes TST-001 and A's drawing. Check supplier identity in the workbook filename, item scope and PDF SHA-256. Trace 05, SUP-A.zip, SUP-B.zip.

9. **自动保存：PASS（浏览器 + Node）**。真实导入后等服务器状态一致再 F5；新空白询价首次自动提交；纯搜索/筛选/导航跨完整 5 秒窗口不增修订；保留手动保存。旧标签修改遇到真实 409，显示失败并停止重试；真正停止服务后修改也失败，重启后手动保存恢复。Node 检查空闲时间和停止规则。trace 01/07。
   **Autosave: PASS (browser + Node)**. Wait for server equality after real import before reload; empty RFQs autosave initially; pure search/filter/navigation creates no revisions over a full five-second window; manual Save remains. A stale tab receives real 409 and halts with a visible error; stopping the service also fails visibly, then restarting and manual saving recovers. Node verifies idle/failure rules. Traces 01/07.

10. **完整备份恢复：PASS（浏览器 + 精确数据核对）**。通过按钮下载含 SQLite 与 PDF 的 ZIP；另一空库文件选择并确认恢复两笔询价；逐询价、逐历史修订核对完整快照，包含实际 XLSX/粘贴导入的报价及多轮版本；逐份 PDF 字节一致。恢复后页面切换到带报价询价；再次 UI 恢复拒绝，直接服务端恢复也 409。trace 06、restore-trace.zip、full-backup.zip。
    **Full restore: PASS (browser + exact data checks)**. Download SQLite/PDF ZIP through the UI; choose/confirm it in another empty root and recover two RFQs; compare every RFQ and historical snapshot, including actual XLSX/pasted quote data and all rounds/revisions; compare every PDF byte. Switch restored RFQs in the UI; repeated restore is refused in both UI and direct backend (409). Trace 06, restore-trace.zip, full-backup.zip.

11. **定期完整备份：PASS（真实后台 + Python 时间注入）**。真实首次自动保存生成一份完整 ZIP；Python 检查 24 小时节流、无变更不重复、变更到期新建、最多七份、手动备份不清理；新增附件单独变更回归修复前失败、修复后通过。不宣称实际运行了一整天。trace 01、python.log、backup-defect-before.log、backup-defect-after.log。
    **Scheduled backup: PASS (real background + injected Python time)**. Real first autosave creates one full ZIP; Python checks 24-hour throttling, unchanged suppression, changed-and-due creation, seven-copy retention and manual-copy protection. A new asset-only-change regression failed before the fix and passed after it. No claim of a day-long run. Trace 01, python.log and defect before/after logs.

12. **异常：PASS（浏览器 + Python）**。浏览器上传坏 PDF 后出现失败且有效物料不变，坏 ZIP 恢复空目录失败且零询价；重复导入、真实断线及 409 见前述场景。Python 另覆盖错哈希、附件丢失/损坏、夹带文件、数据库/PDF 篡改和跨询价串读；无效操作不产生有效新修订。trace 08、python.log。
    **Negative paths: PASS (browser + Python)**. Browser upload of bad PDF reports failure without changing valid items; malformed ZIP restore fails and leaves zero RFQs. Duplicate imports, real disconnect and 409 are covered above. Python also verifies wrong hashes, missing/corrupt assets, unexpected ZIP entries, database/PDF tampering and cross-RFQ reads; invalid operations do not create valid revisions. Trace 08, python.log.

## 缺陷与复现
## Defect and reproduction

修复前：保存一笔询价并自动备份；仅上传 PDF 原件，不保存物料关联；注入到首次备份之后 24 小时的检查时间。原 `run_if_due` 只检查 workspaces.updated_at，返回 UNCHANGED，漏掉新的 assets 登记。
Before the fix: save an RFQ and create its first automatic copy; upload only a PDF original without saving item links; inject a check after 24 hours. Original `run_if_due` checked only workspaces.updated_at and returned UNCHANGED, omitting the new asset registration.

修复后：在询价时间未变化时，比较当前附件登记与上一份完整备份清单；新登记同样视为变更，保持 24 小时节流与七份清理规则。修复位于 auto_backup.py，回归 test_pdf_upload_without_workspace_save_is_a_change 保留原断言。
After the fix: when workspace time is unchanged, compare current asset registrations to the previous full-backup manifest; new registrations count as changes while preserving daily throttling and seven-copy retention. The fix is in auto_backup.py; test_pdf_upload_without_workspace_save_is_a_change retains its original assertion.

基线既有自动备份测试缺少真实服务器会创建的 assets 表，导致三个测试初始化错误；补齐 AssetStore 初始化后重新执行。浏览器测试构建期也修正了旧保存提示的等待、真实共同范围、图纸选择及供应商身份位于文件名的断言；没有跳过失败用例或降低范围/字节保护检查。
Existing baseline backup tests omitted the assets schema initialized by the real server, causing three fixture errors; initialize AssetStore and rerun. During browser test construction, correct waits for stale save labels, actual shared scope, drawing selection and supplier identity in filenames; no failing case is skipped and scope/byte protection checks remain intact.

## 明确的边界与建议
## Explicit limits and recommendation

NOT_IMPLEMENTED：报价邮件、聊天截图及非 PDF 原始凭证归档；已有报价供应商的正式取消/作废状态（现有 UI 拒绝破坏历史的直接移出）。代码证据：index.html 的 pilotFooter、data-pool-remove 处理器及 backend/README.md；本任务不把这些标为 PASS。
NOT_IMPLEMENTED: archived quotation emails, chat screenshots and non-PDF evidence; formal cancellation/voiding for suppliers with quote history (current UI refuses destructive removal). Evidence: index.html pilotFooter, data-pool-remove handler and backend/README.md; these are not reported PASS.

SKIP：云端 Linux 无法代替用户 Windows 双击启动、打印/人工视觉检查和实际 24 小时长期运行；启动脚本 ASCII 与路径仅做静态检查。PDF 截图可见查看器背景，原生查看器像素渲染未独立验证，不能据 iframe 或第二页 URL 宣称画面已完成渲染。原型历史 ERP 采购价仍未接入。
SKIP: cloud Linux does not replace Windows double-click launch, printing/manual visual inspection or a real 24-hour endurance run; launcher ASCII/path checks are static only. The PDF screenshot shows the viewer background; native-viewer pixel rendering is not independently verified, and iframe/page-two URL checks do not establish finished visual rendering. Historical ERP purchasing prices remain unconnected.

建议：在本分支备份遗漏修复经评审并纳入开发基线后，可以继续 UI/ERP 字段开发；修复未纳入前，应先处理该数据保护缺陷。原型仍不应作为真实采购资料的唯一存储。PR 不自动合并，需用户独立确认。
Recommendation: after reviewing and incorporating this branch's backup-omission fix, UI/ERP field development can continue; before that fix lands, address the data-protection defect first. The prototype should not be the sole store for real purchasing records. The PR is not automatically merged and requires the user's separate confirmation.

GitHub Actions 执行状态与链接将在 PR 中按实际观察记录；云端 Codex 已执行结果和 Actions 结果分别记录，不用配置文件存在代替 CI 成功。
Observed GitHub Actions status/links are recorded in the PR; executed Codex cloud results and Actions results are recorded separately, never equating workflow configuration with CI success.

## 最终云端执行统计
## Final cloud execution totals

Python 38/38、Node 2/2、Playwright 完整运行 8/8，通过且无跳过/重试；新增筛选与 PDF 第二页断言后，01/05 定向重跑 2/2 通过。完整运行开始于 2026-10-14 13:56:48（Asia/Shanghai），耗时约 150 秒。
Python 38/38, Node 2/2 and the full Playwright suite 8/8 passed without skips/retries; after adding filter and PDF-page-two assertions, targeted 01/05 reruns passed 2/2. The full run started at 2026-10-14 13:56:48 (Asia/Shanghai), lasting approximately 150 seconds.

## PR 与 GitHub Actions
## PR and GitHub Actions

[Draft PR #4](https://github.com/yudacheng666/SRM_System/pull/4) 已创建；初始代码提交 c6797e1。首次 [push CI](https://github.com/yudacheng666/SRM_System/actions/runs/38519844286) 与 [PR CI](https://github.com/yudacheng666/SRM_System/actions/runs/38519937689) 已实际启动；本报告补充时仍在执行，最终观察结果及最新 CI 链接由 PR 描述记录。
[Draft PR #4](https://github.com/yudacheng666/SRM_System/pull/4) is created at initial code commit c6797e1. Initial [push CI](https://github.com/yudacheng666/SRM_System/actions/runs/38519844286) and [PR CI](https://github.com/yudacheng666/SRM_System/actions/runs/38519937689) actually started; they are running when this addendum is written. The PR description records final observed results and the latest CI links.

推送后的远端检查确认 main 仍为 f330de510f97c552629052ff1841d7223194e7f8，draft 基线仍为 49d52084190bece75ae5a0ab90da722df5872f82。
Remote checks after push confirm main remains f330de510f97c552629052ff1841d7223194e7f8 and the draft base remains 49d52084190bece75ae5a0ab90da722df5872f82.

首次 push CI 的 Linux Chromium job 已通过；Windows job 在 test_verified_backup 因 8.3 短路径与规范路径比较误报失败。按 store.backup 既有返回规范修正为 target.resolve()，保持内容与防覆盖断言；Linux store 定向 6/6 通过，Windows 重跑以 PR 最新 CI 结果为准。详见 evidence 中 windows-path-defect.md。
The initial push CI Linux Chromium job passed; the Windows job falsely failed test_verified_backup when comparing an 8.3 alias to a canonical path. Compare against target.resolve() to match the existing store.backup return contract, preserving content and no-overwrite checks; targeted Linux store tests pass 6/6, with Windows reruns tracked in the PR's latest CI. See windows-path-defect.md in evidence.

## ChatGPT 后续修复（待 Codex 复测）
## Subsequent ChatGPT Fixes (Awaiting Codex Retest)

- **职责分工**：ChatGPT 负责设计、修复代码、提交；Codex 只负责独立运行自动化测试、分析失败、提交测试结论，不自行修改代码或合并。
- **Division of responsibility**: ChatGPT owns design, code fixes and commits; Codex independently runs tests, diagnoses failures and reports results without editing code or merging.
- **备份安全加固**：上一份到期自动备份现在按 ZIP 结构、清单版本/索引及数据库/PDF SHA-256 检查；若其损坏，尝试制作完整新备份并保留所有旧备份，不执行该轮轮转删除，服务日志输出 WARNING。
- **Backup hardening**: Before treating an eligible prior ZIP as valid, check structure, manifest, asset links and full DB/PDF SHA-256; if damaged, attempt a new complete backup and preserve all older archives without retention pruning that round, emitting a WARNING.
- **测试证据精简**：PR 当前快照保留测试脚本、验证说明、概要和 SHA 清单。大型下载、截图、Trace 和日志由 GitHub Actions Artifacts（14 天）保存；原始提交历史不改写。
- **Evidence cleanup**: The PR snapshot retains source, instructions, concise summary and SHA list. Downloads, screenshots, traces and logs belong to GitHub Actions artifacts (14 days); existing commit history is not rewritten.
- **当前验收状态**：上述新修复尚未经过 Codex 的最新运行验证，先前的 8/8、38/38、2/2 仅代表旧提交 `08ddba9` 的结果。不得将此前结果直接用作这次修复的 PASS。
- **Current verification**: The new fixes need fresh Codex/CI execution. Previous 8/8, 38/38 and 2/2 results belong to old commit `08ddba9` only and must not be presented as a pass for these changes.
