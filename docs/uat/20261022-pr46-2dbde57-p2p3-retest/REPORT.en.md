# PR #46 independent P2/P3 fix retest (TEST-ONLY)

**Scoped verdict: PASS. P2/C05 PASS; P3/V01 PASS.** Sole product SHA: **`2dbde578165de720fed290cddbfef0a34e99f032`**.

New-SHA local cloud automation: **Python43 + Node10 + Chromium50 =103 PASS,0FAIL,0SKIP,0RETRY**. Independent buyer retest: **8PASS /0FAIL /0BLOCKED /0NOT TESTED**. Three additional native Windows groups remain **NOT TESTED**. No new confirmed product defect or new driver error/correction.

This is not official GitHub Actions success or whole-product release/merge approval. Formal CI, native Windows and owner review gates remain. Old c2737f0 reports retain their original102 automation and12PASS/2FAIL independent outcomes; none is relabeled as this SHA.

## 1. Task, version and isolation

[Full handoff](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6338965924). PR #46 Draft HEAD and detached checkout `/tmp/srm46-retest-product` matched the exact SHA. Served HTML matched checkout SHA256 **8f83160fb81b3d0626743e419a8f6882abce668aa5d2867f8ad8fbd27667e040**: [start](identity-start.json), [HTTP proof](http-product-identity.json), [finish](identity-end.json). Actual M1 frontend/backend ran, not a concept prototype or unconfirmed merge.

Current M1 AGENTS/PROJECT_STATE/DECISIONS were read and checked against actual refs. The latest explicit user authorization permits cloud suites despite unavailable Actions and forbids canonical memory changes; it governs over historical generic gates. The cloud-environment-runtime skill checked runtime/network policy. No Actions/paid runner was used.

Cloud Linux, Python3.12.14, Node24.19.0, Playwright1.58.2, real Chromium154.0.8037.57. Existing dependencies matched the new commit's byte-identical package-lock; the runtime-only node_modules link was removed afterward. Product, existing tests/assertions/CI stayed unchanged. All fictional data used new `/tmp/pr46-retest/independent/data`; automated fixtures likewise had isolated temporary roots. No existing user business data was accessed.

To reproduce the same anonymous case, the prior actual fictional S4 ZIP was restored through the new product UI into an empty directory. All four tables/history/PDF bytes matched the original seed. This was setup, not inferred new-SHA acceptance: reset, reselection, quote revision, calculation, save and export were actually rechecked. Drivers preflighted dynamic visible/enabled controls and disclosure state, with no blind toggle. See [method freeze](preflight-methods.json).

## 2. Actual complete automation

| Unmodified original command | Actual result | Raw evidence |
|---|---|---|
| `python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'` |43PASS,exit0|[stderr](automation/python-backend/stderr.log),[command](automation/python-backend/command.json)|
| `npm test` |10PASS,exit0|[stdout](automation/node-business/stdout.log),[command](automation/node-business/command.json)|
| `npm run test:e2e` |50PASS,exit0,single worker,no skip/retry|[stdout](automation/chromium-e2e/stdout.log),[command](automation/chromium-e2e/command.json)|

Supported `SRM_CHROMIUM_PATH=/usr/bin/chromium` selected the real installed browser without editing config/assertions. New `UX manual-only: buyer-approved amount distinct from suggested totals / 人工定标金额独立显示` actually ran and passed. These103 are fresh-SHA executions, not copied historical102. [Every case](automation-cases.csv),[runner summary](automation/automated-results.json). All original runner JSON,50 traces,server logs and HTML report are losslessly archived: [instructions](README-raw-evidence.md).

## 3. P2/C05 independent business retest

| ID | Result | Actual outcome |
|---|---|---|
| P2-01 |PASS|L2 B82×2,L5 B75×5,L12 A120×12: independent manual **3/1979.00**, theoretical **6940.00**, mixed suggestion **7064.00 including suggestions**, original labels preserved|
| P2-02 |PASS|Actual CSV/internal XLSX/individual and all-supplier ZIP downloads:46 numerical/identity/isolation/PDF-byte checks; no DB changes|
| P2-03 |PASS|Reset leaves0 manual with explicit no confirmed award, no misleading priced zero; genuine3-line reselection and save/F5 retain1979|
| P2-04 |PASS|Real B same-round new revision changes L2 from82 to83 and confirms; L2 flagged for review; eligible manual **2/1815.00**, old confirmed quote history unchanged, exclusion persists after F5|
| P2-05 |PASS|New formal RFQ imports12 actual material rows with no valid quotation; explicit0 manual/no confirmed award, no fabricated manual zero-price sum|

1979=164+375+1440;1815=375+1440. No state-set injection manufactured results. Actual own-scope totals remain A10/6420,B12/7185,C2/990; shared A/B10 lines6420/6665. Missing is not zero; applicable tier prices remain correct. Actual XLSX retains all12RFQ identities,selected L12 price120,L2 price82 and higher-price reason.

[Three separate totals](independent/evidence/P2-3-manual-1979-theory6940-mixed7064.png),[reset](independent/evidence/P2-zero-after-reset.png),[review exclusion](independent/evidence/P2-excludes-pending-review-1815-2-lines.png),[no valid bids](independent/evidence/P2-no-effective-quotation-zero-manual.png),[46 actual file checks](independent/evidence/export-checks.json).

## 4. P3/V01 three sizes and real save states

| ID | Result | Actual outcome |
|---|---|---|
| P3-01 |PASS|1024×768,1366×768,1600×900 × five pages (items/allocation/intake/comparison/settings): one persistent concise indicator with drawers closed, old mirror absent; actual server state equals saved snapshot. Original three diagnostics remain reachable with versions/times/backup details|
| P3-02 |PASS|Adding fictional supplier creates actual unsaved state; real PUT is held then continued, never replaced with fake response. All sizes show pending rather than saved; all DB/history/PDF bytes unchanged until release; actual200 then persists supplier|
| P3-03 |PASS|Two real browser tabs yield genuine stale-version SQLite409 after first tab wins. All sizes show sole concise error state; diagnostics retain409/stopped-retry; stale unsaved supplier remains in memory but is never acknowledged, committed DB and PDFs remain exactly winner state, confirmed by reload|

While the real request was pending the actual concise text was **保存状态待确认** with pending styling; diagnostics said **正在自动保存……**. It did not falsely claim saved. Under this task's truthfulness requirement it passes; more specific in-progress wording is a usability suggestion, not a new confirmed false-save defect. Conflict was actual backend revision protection, not a fabricated409.

| Size | Saved | Actual pending | Actual409 | Original error diagnostics |
|---|---|---|---|---|
|1024×768|[image](independent/evidence/P3-saved-1024-quotes.png)|[image](independent/evidence/P3-pending-1024.png)|[image](independent/evidence/P3-conflict-1024.png)|[details](independent/evidence/P3-conflict-diagnostics-1024.png)|
|1366×768|[image](independent/evidence/P3-saved-1366-quotes.png)|[image](independent/evidence/P3-pending-1366.png)|[image](independent/evidence/P3-conflict-1366.png)|[details](independent/evidence/P3-conflict-diagnostics-1366.png)|
|1600×900|[image](independent/evidence/P3-saved-1600-quotes.png)|[image](independent/evidence/P3-pending-1600.png)|[image](independent/evidence/P3-conflict-1600.png)|[details](independent/evidence/P3-conflict-diagnostics-1600.png)|

[Actual409](independent/evidence/P3-conflict-http.json),[SQLite before/after plus browser/server logs](independent/evidence),[independent trace](independent/evidence/independent-trace.zip). Additional diagnostics/context shown only after explicit disclosure are not another persistent indicator; errors were never hidden to manufacture the one-status result.

## 5. Errors, environment and untested boundaries

The eight independent groups include117 explicit business/status checks plus46 file checks, counted separately from103 suite cases. No new driver error/correction,pageerror or failed transport. Expected409 is a passing safety rejection; raw console evidence remains. NO_COLOR/FORCE_COLOR warnings are nonfatal environment messages; all commands exited0. [Register](raw-error-register.json),[execution summary](independent/execution-summary.json).

Exact-SHA [UI Actions39766115997](https://github.com/yudacheng666/SRM_System/actions/runs/39766115997) and[S3/S4 Actions39766115887](https://github.com/yudacheng666/SRM_System/actions/runs/39766115887) remain failure; API returned no execution steps for four jobs (steps=null):[runs](actions.json),[UI jobs](actions-jobs-ui.json),[S4 jobs](actions-jobs-s4.json). Developer handoff attributes non-start to account quota/billing; missing steps alone does not independently prove that root cause. Local103PASS cannot be converted into official Actions success.

**NOT TESTED:** native Windows Python3.13,Windows Node,PowerShell/batch pilot launch (three groups; no actual Windows environment). Exhaustive failure/load matrices,multiple browsers,full accessibility/pixel fidelity,real business data/desktop Excel are outside this scoped run. No inference fills these gaps.

## 6. Evidence and recommendation

Only `docs/uat/20261022-pr46-2dbde57-p2p3-retest/` is appended to existing Draft PR #50. Both original c2737f0 evidence directories/reports remain unchanged. Evidence-branch historical HEAD is not the tested product SHA; the independent exact checkout and report lock2dbde57. Full raw artifacts use lossless standard tar hardlink deduplication and32MiB volumes; every original file hash was revalidated. There are34 independent original screenshots,one independent trace and50 suite traces.

ChatGPT can review the evidence and accept the two targeted fixes as independently retested, while formalCI/Windows/owner gates remain. **Do not merge evidence/product PRs or declare whole-product release-ready.** Product,existing tests,CI,memory,main/M1/product branches were not changed; no PR was closed.
