# SRM_System PROJECT_STATE / 项目当前有效状态

> 核实日期 / Checked: 2026-10-26. Current state reconciled with actual GitHub refs, Codex #50 evidence and user's approval of temporary option A; not continuous monitoring.
> 此文件由已合并的 PR #47 初始化到 M1 开发基线；本次续开发状态更新在单独的 Draft 文档 PR 中，合并前不属于开发基线。

## Goal / 产品目标

- 本地轻量 SRM：物料 → 多供应商询价分配 → Excel/PDF 询价包 → 回收报价/多轮议价 → 同范围比价与定标 → SQLite 历史和 S4 安全备份。
- Lightweight local RFQ lifecycle with supplier-specific documents, revisions, traceable price comparison and backup; suppliers do not log in.
- 当前为 Windows localhost + SQLite 采购员试用开发版，不是正式部署的 ERP/多用户系统。
- No real enterprise data in GitHub, even in private repos; only synthetic fixtures.

## Branch truth / 当前分支和版本

| Layer / 层级 | Verified ref / 准确版本 | Status / 状态 |
| --- | --- | --- |
| 正式主线 / Main | main @ \`f330de510f97c552629052ff1841d7223194e7f8\` | M0 prototype and comparison only; **not M1**, no new release |
| M1 开发基线 / Development | draft/20261013-m1-storage-ui-audit @ \`b0629a06a7ab2880fc86427e26a953d722487a57\` | M1 Lite, SQLite, ERP core fields, V3.1, S4 and merged #47 memory |
| 已批准 UI 设计 / Design | [#44](https://github.com/yudacheng666/SRM_System/pull/44) Draft @ \`8e643520\` | Architecture and acceptance matrix only, not product code |
| 并行历史候选 / Alternate | [#45](https://github.com/yudacheng666/SRM_System/pull/45) Draft @ \`4480482c5bbb280257c06aa44889706705663280\` | Two CI SUCCESS on that SHA, **not** evidence for #46 |
| 当前 UI 产品候选 / Active UI | [#46](https://github.com/yudacheng666/SRM_System/pull/46) Draft @ `424dce48c7ba0a66e25d4f97de633d40c4c1ccd6` | Buyer feedback issues 1–5 fixed in branch (Chinese title/renamable RFQ + project sidebar selection); **static JS syntax PASS ONLY; final exact-SHA browser regression intentionally DEFERRED until user finishes collecting issues**; old 103+8 PASS pertains only to `2dbde57`, not current head; not merged |
| 项目记忆 / Memory | [#47](https://github.com/yudacheng666/SRM_System/pull/47), merged 2026-10-22 | AGENTS.md + PROJECT_STATE + DECISIONS + original session now on M1 dev, not main |

## Validated development history / 已核实开发和证据

- M1 development has local SQLite persistence/round history, imported XLSX/CSV, RFQ supplier assignment, quote-tier applicable pricing, line-level awards, original PDF per RFQ line, supplier-isolated ZIP exports and safe empty-target-only S4 restore.
  这些能力属于 M1 开发基线，不代表完整采购员现场实机验收。
- ERP Chinese core fields and unknown-column retention were integrated; semantics of the complete historical ERP field dictionary remain unverified.
  ERP 全字段语义与现场源数据尚未完成核验。
- Scope-specific TEST-ONLY evidence: #33 S4 feedback, #34 S4 restore, #39 export/navigation at \`9633c03\`, and #43 C08/C09 at \`c8429ef\`. These are exact-SHA limited acceptance reports, not blanket approval of future UI code.
  不把历史 PASS 迁移为新提交 PASS。
- PR #45 CI: [UI 39729243552](https://github.com/yudacheng666/SRM_System/actions/runs/39729243552) SUCCESS, [S3/S4 39729243554](https://github.com/yudacheng666/SRM_System/actions/runs/39729243554) SUCCESS. It remains a separate unmerged UI candidate.

## Most recent development / 最新续开发

- [Commit c2737f0](https://github.com/yudacheng666/SRM_System/commit/c2737f0221a7b529114da2df363e062e75c7544c) on PR #46 edits only \`prototype/m1-lite/index.html\` and \`prototype/m1-lite/tests/e2e/ui-ux-structural.spec.cjs\`.
- Fixes quote comparison's “仅显示待人工决定”: filter **valid quotable lines before pagination**, respect original full-list item index for pricing, preserve unfiltered totals/decision overview, reset pager and show accurate filtered count.
  解决以前“只隐藏当前页行，导致空白页和统计不符”的静态可确认逻辑问题。
- Added isolated synthetic 12-line Chromium+SQLite E2E covering two pages (10+2), read-only filter, real award selection and full-scope counts.
  8 个页面内嵌 JS 和新增测试源码 V8 语法解析 PASS；随后 Codex Cloud 在真实 Chromium 上执行新增3项及全部49项 E2E，连同后端/Node共102 PASS，均为临时非 Actions 证据。

## Latest independent UAT and repair / 最新独立验收与修复

- [Codex continuation PR #50](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6337865994) @ evidence 8296b853b3de03eb406ccd1f6eca50fdfdfdfa44 tested prior product SHA c2737f0: independent 14 groups **12 PASS / 2 FAIL**, plus native Windows **3 NOT TESTED**. Passed real round/revision/tier, price decisions, supplier ZIP, S4 empty restore + nonempty rejection and three-viewport geometry/keyboard checks. P2 UX-01: missing manual-only subtotal (3 manual items ¥1,979.00, theoretical ¥6,940.00, mixed recommendations ¥7,064.00); P3 UX-02: duplicate technical autosave mirror in top header. No confirmed corruption or security leakage.
- ChatGPT fixed **both** on [PR #46 commit 2dbde57](https://github.com/yudacheng666/SRM_System/commit/2dbde578165de720fed290cddbfef0a34e99f032): valid, non-review buyer selections now have a separate manual-only amount, and top header no longer duplicates raw technical status; raw diagnostics remain expandable. UI regression updated across 3 test files, one new manual-only E2E; 8 page scripts + 3 E2E test files syntax PASS. **New-SHA real test status is superseded below by PR #50 evidence; static tests were preliminary.**
- [PR #46 developer retest instruction](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6338965924) was **completed**. [PR #50 exact-SHA evidence](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6341985654) @ `17fbf6bbb72b8f536cb50fc55bf466c8e3000a82`: **Python43 / Node10 / Chromium50 = 103 PASS** (0 FAIL/SKIP/RETRY) run on actual **`2dbde578165de720fed290cddbfef0a34e99f032`**; independent P2/C05 5 PASS + P3/V01 3 PASS = **8 PASS**, no new confirmed product defect. Windows-native 3 NOT TESTED; exact SHA GitHub Actions still have no runner, not CI-green.
- Actual 12-line buyer fixture: independently verified **¥1,979.00 (3 manual)** distinct from **¥6,940.00 theoretical / ¥7,064.00 mixed**, and **¥1,815.00 (2 manual)** after one bid changed to a new confirmed revision requiring review. Reset/zero-quote path and 46 actual export/ZIP/PDF checks passed. Three viewport tests verified one visible save status and actual pending PUT 200 / real stale-tab 409 with expandable raw diagnostics. `保存状态待确认` during in-flight saving is an optional wording improvement, **not** a confirmed blocking defect.
- [ChatGPT evidence review comment PR #46](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6342862031) accepts the **scoped** fix verification as PASS, not as release readiness. Original c2737f0 evidence and two earlier defects remain in old PR #50 directories without being rewritten.
  已提交两项修复，但旧版的 102 PASS / 12 PASS 不得套用到新 SHA。


## 2026-10-26 buyer pilot feedback / Windows 试用四处反馈

- User annotated four issues in the locally running older UI: top S4/SQLite technical message incomprehensible to buyer, opaque `RFQ-179...-...` identity repeatedly raised, unnecessary English `Current RFQ` and `PURCHASING WORKSPACE`. This is **actual user visual feedback**; no inference of business quote data from screenshots.
- **Owner clarified D-024 on 2026-10-26:** SRM is **still a test-stage product**; previous test SQLite/ZIP snapshots and sample RFQ names are disposable and can be regenerated. **Do not require backward compatibility, migrations, or a dedicated legacy-import test gate for old synthetic data.** This narrows the prior `legacy restore` test handoff: current `08f4c57` should be tested with fresh isolated synthetic RFQs for rename → actual SQLite save → reload → history switching, and current-version S4 backup/restore plus quotation/PDF ID integrity. The optional blank-name fallback is not a commitment to migrate all previous pilot records. Keep actual existing user local files untouched; real ERP historical imports remain separately scoped.
  不再让旧试用数据兼容阻塞项目；新版关联和安全不放松。
- ChatGPT implemented [PR #46 new head `08f4c57`](https://github.com/yudacheng666/SRM_System/commit/08f4c570666060cd263883949e24616c73811fa9): simple Chinese status text and labels including local-mode badge, optional editable `state.projectName` for buyer-facing current/history display; immutable `workspaceId` retained for SQLite, revisions, supplier files, quotation and PDF bindings and only shown in technical detail. New Python list-index/history and Playwright rename/reload checks; updated two outdated UI assertions that required `RFQ-` visible.
- The HTML inline JS and affected E2E JS passed static V8 syntax; **no actual new-head Python/Node/Chromium/Windows acceptance has run**. Prior [PR #50 evidence 103 + 8 PASS](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6341985654) is for **`2dbde57` only**; it remains valid history, cannot be relabeled as current-head PASS. [PR #46 test-only instruction](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6406983737) requests an exact `08f4c57` isolated Codex rerun and new independent business-title/legacy-backup verification.
- GitHub Actions runner/account restriction and native Windows three NOT TESTED remain; locally running user's application is not automatically upgraded by GitHub commits. Under approved [D-022](DECISIONS.md) development alternative, reverify cloud suites for the changed SHA, then native Windows and separate user authorization before any merge. [D-023](DECISIONS.md) records buyer-friendly Chinese naming/copy rule; no backend ID migration.
  新提交仅静态检查通过；不要把旧版全绿报告套用到新版本。

- **Buyer feedback #5 (2026-10-26):** Clicking `询价项目` opened the project controls but left `物料与图纸` selected in the sidebar. [PR #46 fix `424dce4`](https://github.com/yudacheng666/SRM_System/commit/424dce48c7ba0a66e25d4f97de633d40c4c1ccd6) makes project/admin drawer actions retain the **exclusive** `aria-current` selection until navigating to another page or collapsing that active drawer. Same behavior for header shortcuts; no business-state mutation. Added precise assertions in `ui-v2-exploratory.spec.cjs`. **8 inline JS scripts and test spec parse PASS; actual Chromium on new head NOT YET RUN**. User expressly requested incremental fixes and **one consolidated Codex Cloud run only after declaring feedback complete**, not tests after each minor bug.
  当前先继续采集并修复问题；待用户明确“统一测试”后冻结最终SHA一次性复验，不自动启动Codex。

## CI blocker / 自动化阻断

- Exact PR #46 HEAD \`c2737f0\` triggered [S3/S4 run 39743002740](https://github.com/yudacheng666/SRM_System/actions/runs/39743002740) and [UI run 39743002722](https://github.com/yudacheng666/SRM_System/actions/runs/39743002722); both concluded FAILURE **before test execution**.
- 4 jobs: \`steps=[]\`, blank runner assignment, ~2–3 s duration. User's prior Actions annotation explicitly says: "The job was not started because recent account payments have failed or your spending limit needs to be increased."
- The account-side blocker is established, but **which payment/budget subcondition** caused it remains UNVERIFIED. GitHub-hosted product assertions did not run, although independent local-cloud suites later ran; never relabel these as GitHub Actions PASS.
  按用户决定：不充值，等待十一月检查额度/账户状态；不能保证账户问题会自动恢复，暂不手动反复重跑。
- User-authorized temporary **pre-CI TEST-ONLY** Codex execution **has now run** on exact SHA (despite earlier `@codex` GitHub bot's environment-setup response). [Draft evidence PR #50](https://github.com/yudacheng666/SRM_System/pull/50) @ `75a06ab23a5e2d93c169651f511ccbedb035e468`: Python 43/43, Node 10/10, Chromium 49/49 **PASS (102 total)** with isolated fictional data, including new 12-line 10+2 pending-only E2E.
  临时 Linux 云端实际自动化全绿，不代表 GitHub Actions 或 Windows 专项通过。
- [Codex bilingual report](https://github.com/yudacheng666/SRM_System/blob/75a06ab23a5e2d93c169651f511ccbedb035e468/docs/uat/20261022-pr46-c2737f0-temp-ci/REPORT.zh-CN.md): Playwright dependency install blocked by `su: Authentication failure`, used already available real Chromium via supported `SRM_CHROMIUM_PATH`. Independent buyer UAT **0 PASS / 1 BLOCKED / 13 NOT TESTED**, plus native Windows **3 NOT TESTED**; two isolated driver errors (wrong `多候选` vs actual `多个候选` label, null `.disabled` read before async XLSX preview). **No new confirmed product defect**; not proof for untested scope.
- [ChatGPT review on PR #50](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6337013474) and [development PR #46](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6337014255): accept exact-SHA temporary automated evidence, independent UAT still NOT READY. Retain Draft, no merge. A **separately authorized scoped continuation** should inspect actual DOM labels and null-guard asynchronous waits, then complete only untested UAT; do not re-run 102 cases absent head change. Official exact-SHA GitHub Actions and owner approval remain gates.
  已审原始错误登记、截图文本、冻结脚本和报告；旧 Issue #49 的“一次修正上限”不得偷偷突破，本轮停止有效。

## Temporary development acceptance — owner approved option A / 临时开发验收方案

- **User decision 2026-10-23: [D-022](DECISIONS.md), temporary for current SRM M1 candidate PR #46 only while GitHub Actions has no assigned runner.** Accept **exact-product-SHA Codex Cloud full Python/Node/Chromium suite PASS + separate independent TEST-ONLY buyer UAT PASS + native Windows isolated Python 3.13, Node 22, PowerShell/BAT, real local launch and safety PASS** as an alternative **for entering M1 development merge approval**, not official GitHub Actions or release/main approval.
- Already evidenced on product SHA `2dbde578165de720fed290cddbfef0a34e99f032`: [103 PASS + 8 independent PASS](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6341985654), audited via [PR #46 review](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6342862031). **Native Windows 3 NOT TESTED**, so **temporary development merge gate is NOT COMPLETE**. Do not repeat 103/8 until source SHA or relevant scope changes.
- [UI Actions](https://github.com/yudacheng666/SRM_System/actions/runs/39766115997) and [S3/S4 Actions](https://github.com/yudacheng666/SRM_System/actions/runs/39766115887) were `failure` **before any job steps**, no runner; official checks remain unresolved and may still block GitHub merging if required by repository rules. The user's no-payment preference remains; account restoration timing unverified. When GitHub allows it, rerun all required workflows on accurate latest head.
- **Even after native Windows PASS:** user must separately authorize any PR #46 merge into M1 development. Approval of option A alone is *not* merge authorization, nor permission to close PR #50 / #48 or promote M1 to `main`. Main remains M0. Codex TEST-ONLY role and anonymized test data unchanged.
  临时验收用于推进开发，不虚构正式CI；Windows专项未测，不能自动合并。

## Open gates / 后续门槛

1. **Next immediate action: incremental Windows buyer feedback** on Draft PR #46 `424dce4`; user will send additional screenshots/problems and ChatGPT fixes them on the existing branch, with static sanity checks only. Do **not** start another Codex run for each change. After the user's explicit final collection/“统一测试”, freeze **actual final SHA** and run full Python/Node/Chromium, focused title/persistence/sidebar + current-version S4 safety on fresh isolated fixtures (no old test backup migration under D-024), then native Windows safety checks. Prior 103+8 PASS is old SHA only.
2. New 2dbde57 push triggered [UI 39766115997](https://github.com/yudacheng666/SRM_System/actions/runs/39766115997) and [S3-S4 39766115887](https://github.com/yudacheng666/SRM_System/actions/runs/39766115887); four jobs again steps=[] / no runner. In November, first inspect account billing/limit, then rerun exact new HEAD on actual Actions runners.
3. Codex Cloud full suites/UAT on **old** `2dbde57` completed (103+8 PASS). Product changed since then; new-head suites will be run **once after user declares the feedback batch complete**, not yet. After final-head cloud evidence + native Windows checks PASS, prepare M1 development merge recommendation subject to separate owner approval and enforced GitHub checks; no `main` promotion.
4. Reconcile #45/#46 duplication, collect buyer feedback, and ask owner for explicit permission before any merge to M1/main. Main stays M0 until approved.
5. Update canonical memory after each substantial new code/CI/UAT/decision milestone through authorized docs-only PRs; do not overwrite this unmerged checkpoint concurrently.

## Decisions / 需要用户决定

- Review current PR #46 UX in isolated buyer pilot.
- Whether #46 supersedes #45 **after** CI and independent acceptance.
- Promotion of M1 to main is a separate explicit owner decision.

Detailed durable business decisions remain in \`docs/ai-memory/DECISIONS.md\`; historical original evidence remains in earlier session files.
