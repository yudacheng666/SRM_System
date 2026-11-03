# PR #46 final unified independent acceptance (TEST-ONLY)

**Verdict: NOT READY for the current development acceptance scope.** Sole product SHA: **`66a0579d88177143737b109efb3a8790c6cce053`**.

Actual full automation: **94 PASS /15 FAIL** (Python44/44,Node10/10,Chromium40/55), no Chromium skip/retry. Independent nine UX groups: **7 PASS /1 FAIL /1 BLOCKED**. Independent core subcases: **11 PASS /1 BLOCKED**. Native Windows3 **NOT TESTED**. Neither official Actions success nor release/development-merge approval is established.

## 1. Authority, identity and environment

[Complete task](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6409929850). PR #46 stayed Draft/unmerged at the exact SHA during start/mid/end checks. Actual M1 ran in detached `/tmp/srm66-product`. Only this new directory is appended to existing PR #50 from evidence parent `17fbf6bbb72b8f536cb50fc55bf466c8e3000a82`; all three older evidence trees and canonical memory remain untouched.

PR #48 unmerged AGENTS/PROJECT_STATE/DECISIONS at760406cf9cf1af3e140b5196531a439579d57500, current product differences and previous PR #50 reports were read. D-022 permits temporary cloud development evidence only; D-024 excludes legacy synthetic migration gates. No old-SHA database/ZIP was imported. Each independent attempt began with an empty new SQLite root and newly generated fictional RFQs/items/vendors/PDFs/quotes from current-version fixtures.

Linux,Python3.12.14,Node24.19.0 (differs from preferred22),Playwright1.58.2,real Chromium154.0.8037.57 at `/usr/bin/chromium`, selected by supported SRM_CHROMIUM_PATH. Existing browser required no installation. No mock/static prototype or GitHub Actions runner was used; cloud-environment-runtime checked runtime/network constraints.

[Start identity](identity-start.json),[end identity](identity-end.json),[HTTP trace proof](http-product-identity.json): all10 original captured root HTML responses, including first/last and restore services, match checkout SHA256 **c62731be8c936205c75feefecba40d7a81d42ba4d840b92b17445dd10a3d284b**. HTTP hashes were verified post-run from immutable original trace bodies, not falsely claimed to have been printed before execution. Git SHA was checked before/during/after; source and protected refs did not move.

## 2. Actual complete automation and15 failures

| Unmodified command | Actual outcome | Evidence |
|---|---|---|
|python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'|44PASS,exit0|[stderr](automation/python-backend/stderr.log)|
|npm ci,first attempt|exit254,environment cache path failure|[stderr](automation/npm-ci/stderr.log)|
|same npm ci,task-local cache only|exit0,locked install succeeds|[metadata](automation/npm-ci-cache-retry/command.json)|
|npm test|10PASS,exit0|[stdout](automation/node-business/stdout.log)|
|npm run test:e2e|40PASS/15FAIL of55,exit1,no skip/retry|[stdout](automation/chromium-e2e/stdout.log)|

Original `/home/agent/.npm/_cacache` could not be created/written. Full failure was retained; setting npm_config_cache to `/tmp/uat66/npm-cache` resolved installation without changing source/lock/tests/config. Failed Chromium cases were not rerun. New exact-SHA total is109 cases, not historical103. [Summary](automation-summary.json),[every case](automation-cases.csv).

**P2-TEST-01: test setup/navigation/assertion coverage gap, not a confirmed business-logic defect.** [All15 raw failures and source locations](automation/failure-classification.json); per-failure screenshots/JSON live under automation/failures/AF-01..AF-15. Reproduce with the original full E2E command.

| Original failure | Evidence-backed classification |
|---|---|
|acceptance01,line147|After reopening at the project page, fills hidden material search without entering Items|
|acceptance05/06/07,lines237/284/305|Old 正式 text assertion versus approved actual 本机工作模式|
|acceptance12,line442|After New enters project page, still expects admin report panel visible|
|acceptance13,line458|Expects collapsed old drawer, contrary to permanent project-stage controls|
|acceptance44,line612|Clicks intentionally hidden old project summary|
|acceptance46,line699|Targets supplier-material checkbox while its page is inactive|
|ERP09,line402|Requires removed literal 规格： prefix; actual inline120W/220W values/prices/IDs remain visible|
|UX title/project-page/admin at217/257/286|Three tests omit app fixture and their own startup/goto, leaving no application DOM|
|UX item rows,line326|Assumes first rowTST-001; current documented default descending order yieldsTST-012; density assertion already passed|
|B3 1366/1600,helper46/caller97|Old close helper clicks hidden project summary and times out|

Classifications use unedited runner errors and actual current UI/source. Independent results do not relabel suite FAILs; assertions after each failure remain **NOT REACHED**. ChatGPT should repair actual paths,fixtures and semantic assertions then run the new exact-SHA suite. This TEST-ONLY task did not repair them.

## 3. Nine independent UX groups

| Group | Result | Actual evidence |
|---|---|---|
|UX-01|PASS|Three-size plain Chinese header without prominent S4/SQLite/Current RFQ/PURCHASING WORKSPACE; real pending/conflict not falsely saved; diagnostics on admin page|
|UX-02|PASS|New/rename,current title and OTHER-project names,SQLite save/switch/F5/service restart retain immutable IDs and every quote/PDF link|
|UX-03|PASS|Sidebar/header/admin/workflow transitions keep exactly one current sidebar highlight, all sizes|
|UX-04|PASS|Permanent first Project page,five correct steps,direct New/Save/history and real next-step action|
|UX-05|BLOCKED|Admin placement/labels/reread-cancel/valid S4 roundtrip/nonempty refusal PASS; extra malformed/content-tamper evidence chain incomplete, conservatively BLOCKED overall, not a confirmed restore bug|
|UX-06|PASS|Actual material rows31–32px at all sizes;12-line list plus52-line preview/list50+2 and retained selection/filter/scroll|
|UX-07|PASS|In-place missing label only; attached PDF opens exact original bytes; not-required state distinct, no duplicated second-line metadata|
|UX-08|PASS|31–32px inline code/name/spec with full hover; consistent drawing state,additive/repeated/removal/search/52-line pagination accurately retained|
|UX-09|FAIL|P3 visual-density gap: comparison58.375–62px versus material/allocation31–32,intake39–40; first actual comparison rowy884.97 at1366×768. Actual prices/tiers/reasons/details/keyboard remain usable|

Twenty-one major layouts (seven pages × three sizes) had no document horizontal overflow. Real details/full columns/keyboard were exercised. An eight-row dedicated dataset was not separately created; actual data volumes were12 and52, not an inferred eight-row specific pass.

## 4. Core procurement and current-version S4

Each fresh attempt created12 fictional items including duplicate codes with distinct specs/line IDs,three vendors and three valid multipage PDFs. A/B each12 assigned lines,C2; unique/ambiguous/unmatched1/2/0 preview did not commit; explicit confirmed links and original viewer bytes matched. Actual XLSX/paste/manual quotes included A R1V1/R1V2/R2V1 with nine explicit carries,five confirmed submissions/50 history lines,immutable earlier versions and quantity-applicable tier118/2.25.

Genuine pending10+2 pagination,selected L12 removal,tied75/75 accepted without false reason,higher82vs20 required actual persisted reason,blank/cancel protection and missing/cannot-supply not zero all passed. Manual3/**1979**,theoretical/**6940**,mixed suggestion/**7064** are separately shown and saved. Own scope A6420/B7185/C990 is not ranked across unequal ranges; shared A/B10 items6420/6665. Actual individual/all supplier ZIPs,CSV/internal XLSX underwent **46 content checks**,including RFQ identities/quantities/prices/reason,exact original PDF names/bytes and no competitor/internalJSON/reason leakage to vendors.

A second named fresh52-line RFQ verified preview50+2,confirm ALL52,formal list50+2 and selection retention through filters/pages; selected all52 retained additive A/B links. Two names,RFQ switch,F5 and real service restart preserved all DB/history/PDF bytes. Actual rename generated pending PUT; DB stayed unchanged and S4 was disabled until actual200. Canceling reread retained unsaved draft. Real stale-tab SQLite409 preserved committed winner and stale in-memory name, confirmed by F5.

| Core subcases | Result |
|---|---|
|CORE-01..08: import/PDF/allocation/history/awards/actual files/persistence/pending-and409|8PASS|
|CORE-09A: current S4 CRC/manifestDBSHA/SQLite integrity/four complete tables/3PDF hashes|PASS,11 archive checks|
|CORE-09B: actual empty-target UI restore|PASS,HTTP200,twoRFQs/all versions/PDFs/1979 exact|
|CORE-09C: nonempty refusal|PASS,UI refusal plus real409 RESTORE_TARGET_NOT_EMPTY,no changes|
|CORE-09D: extra content-tamper rejection|BLOCKED after third runtime fault and fixture precondition gap|

Third fault: `response.json: Protocol error (Network.getResponseBody): Request content was evicted from inspector cache` while reading an additional invalid-restore response. Why eviction occurred is unknown. Valid restore/nonempty safety assertions had already completed; neither a product restore failure nor full S4 completion is inferred.

Original logs/screenshot show400 with **RESTORE_UNSUPPORTED_ARCHIVE**. Read-only post-stop analysis found the negative helper rewrote ZIP_DEFLATED, while current S4 only accepts ZIP_STORED, so it was rejected at format validation **before intended PDF-content-hash rejection**. Read-only target snapshot remained empty/unchanged. No fallback bypass,fixture fix,new request or PASS reclassification followed.

## 5. Confirmed visual finding

**P3-UX09-01: comparison density still differs substantially and1366×768 first screen contains no actual quote row** (UI/usability,not data corruption).

Reproduce with this fresh12-line/three-vendor fixture,confirm quotes and three manual awards,open Comparison at1366×768 and scroll to top. First actual quote row is approximately **y884.97**,below768px. Scrolled ordinary quote rows measure **58.375–62px**,versus material/allocation **31–32px**,intake **39–40px**. All three sizes were measured in the real browser.

Expected: group9's consistent compact reading experience and easier primary matrix access,retaining details. Actual price/disclosure/decision blocks remain stacked and require more scrolling. This does not assert every semantic row must have identical height; values are measurements and the remaining compactness gap is an independent buyer-design judgment for ChatGPT review.

[Native1366 first screen](attempt-03/evidence/UX-1366-quotes.png),[actual rows/amounts](attempt-03/evidence/UX09-1366-separate-award-totals.png),[metrics](row-density-summary.json),original browser row-density events. Suggested direction: price/detail entry on one line where possible,clear decision/reason disclosure,and less nonprimary guidance/filter height without hiding fields/actions. No implementation change was made.

No confirmed P1/P2 product data/security defect. P2-TEST-01 is a suite coverage/setup issue. Blocked/untested does not establish absence of defects.

## 6. Correction limit and original failures

DRIVER-01 misread paginated preview50 as incomplete52,then a documented correction verified actual preview50+2,ALL52 commit and formal pagination/selection from fresh attempt02. DRIVER-02 incorrectly expected current name in OTHER-project picker; documented correction separately checked current header/other history and retained full state/ID comparisons from fresh attempt03. DRIVER-03 was the inspector response-body error. **Two corrections exhausted; affected extra negative path stopped. No further driver fix or fourth browser run.** Only read-only log/snapshot/fixture analysis and packaging followed.

Raw unclassified failures remain unchanged; final classifications live in[register](raw-error-register.json),[correction1](driver-correction-01.json)/[diff](driver-correction-01.diff),[correction2](driver-correction-02.json)/[diff](driver-correction-02.diff). Prior attempt passes are not extra independent cases. Original suite15FAILs were never overwritten by corrected independent drivers.

## 7. Screenshots, traces and remaining gates

| Size | Project | Materials | Supplier view | Intake | Comparison first screen |
|---|---|---|---|---|---|
|1024×768|[image](attempt-03/evidence/UX-1024-project.png)|[image](attempt-03/evidence/UX-1024-items.png)|[image](attempt-03/evidence/UX08-1024-supplier-first.png)|[image](attempt-03/evidence/UX-1024-quoteImport.png)|[image](attempt-03/evidence/UX-1024-quotes.png)|
|1366×768|[image](attempt-03/evidence/UX-1366-project.png)|[image](attempt-03/evidence/UX-1366-items.png)|[image](attempt-03/evidence/UX08-1366-supplier-first.png)|[image](attempt-03/evidence/UX-1366-quoteImport.png)|[image](attempt-03/evidence/UX-1366-quotes.png)|
|1600×900|[image](attempt-03/evidence/UX-1600-project.png)|[image](attempt-03/evidence/UX-1600-items.png)|[image](attempt-03/evidence/UX08-1600-supplier-first.png)|[image](attempt-03/evidence/UX-1600-quoteImport.png)|[image](attempt-03/evidence/UX-1600-quotes.png)|

All three independent traces capture real stops,not an invented clean run:[first](independent/evidence/trace-first-attempt.zip),[second](attempt-02/evidence/trace-first-attempt.zip),[third](attempt-03/evidence/trace-first-attempt.zip). All168 independent screenshots and successful/failed/interrupted browser/server records remain. All55 suite traces and441 original runner/HTML files are losslessly archived with standard tar hardlink deduplication of identical copies;every original path/byte hash revalidated.[Instructions](README-raw-evidence.md),[SHA256](SHA256SUMS).

NOT TESTED:native Windows Python3.13,Node22,PowerShell/BAT/local launch (three groups),legacy synthetic migration (explicitly excluded D-024),complete real ERP dictionary/desktop Excel,multiple browsers,exhaustive load/failure/accessibility. Linux is not Windows. Current valid-format content-tamper rejection remains BLOCKED.

Next:ChatGPT should repair15 suite adaptations/preconditions,review the P3 density finding and arrange scoped evidence for the blocked extra check. Any new product/test SHA requires accurate-SHA validation. No product/existing tests/CI/memory/main/M1 edits,no PR merge/closure. Formal Actions,native Windows and separate owner approval remain gates.
