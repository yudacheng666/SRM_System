# PR #46 final-closure independent retest — TEST-ONLY

**Cloud scope: PASS / READY for scoped cloud review. Exact product SHA `f4bfcda8efdf3998c833ed25c3193a056fdde451` only.**

**Development-baseline merge gate: NOT READY**: native Windows3 untested, no officialActions run, and separate owner merge approval remains required. This scoped cloud success is not whole-product/release approval, Windows equivalence or GitHubActions SUCCESS.

| Actual executed scope | PASS | FAIL | NOT TESTED | BLOCKED |
|---|---:|---:|---:|---:|
| Targeted remaining6 +UX09 |7|0|0|0|
| Full Python |44|0|0|0|
| Full Node |10|0|0|0|
| Full Chromium |56|0|0|0|
| Independent UX01–09 |9|0|0|0|
| Independent core subgroups |12|0|0|0|
| NativeWindows |0|0|3|0|

Full automation **110PASS/0FAIL, 110cases, zero skips/retries**. Overlapping targeted/full/independent sets are not added together. One independent fixture error and one documented correction remain explicitly recorded; fresh attempt02 then completes the buyerUAT. Historical795f663103/7 andUX8/1 evidence remains unchanged.

## Exact identity and authority

[Full task](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6415440257), [developer handoff](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6415422410) fully read. PR46 start/mid/end exact HEAD remains Draft/unmerged; detached `/workspace/srmf4-product` serves actual M1Lite. No concept prototype or synthetic merge target. This product branch lacks AGENTS/canonical memory files; repository PR48 unmerged HEAD6b4e43d AGENTS/PROJECT_STATE/DECISIONS were read as working rules, not represented as merged or edited.

[Start](identity-start.json), [end](identity-end.json), [startupHTTP](http-start.json), [fresh attempt02HTTP](http-attempt02-start.json), [endHTTP](http-end.json): source/servedHTML SHA256 `b29927ed84a7110f3546ee03f526b70f63f4e21032b69ce7565d71e772d3d7b8`. Read-only post-run verification of **93captured original root responses** also matches ([trace audit](http-trace-identity.json)). Initial opportunistic8765fetch failed between original fixtures; not counted as a test or successful identity collection. Actual independent startup identity was verified on9865 before business actions.

Linux Python3.12.14, Nodev24.19.0 (different from recommended22), Playwright1.58.2, genuine Chromium154.0.8037.57. Cloud runtime/network readiness inspected without exposing credentials. No GitHubActions triggered. Fresh fictional SQLite/PDF/quotes only; no old database/backup imported. Exact1979/6940/7064 expected values are the required synthetic fixture, not enterprise information.

## Targeted seven: whole original current-SHA tests completed

| ID | Exact original test name | Targeted | Full |
|---|---|---|---|
| TARGET-01 | 05 PDF matching, manual correction, refresh and scoped supplier ZIP / 图纸询价包 | PASS | PASS |
| TARGET-02 | 07 real service disconnect and stale-tab 409 halt autosave / 自动保存失败 | PASS | PASS |
| TARGET-03 | 13 compact laptop item table after import / 1366首屏物料可见 | PASS | PASS |
| TARGET-04 | UX pending-only: filtered pagination and award state / 待决定筛选真实分页 | PASS | PASS |
| TARGET-05 | UX manual-only: buyer-approved amount distinct from suggested totals / 人工定标金额独立显示 | PASS | PASS |
| TARGET-06 | UX09 exact 1366 comparison density and first-row reachability / 比价紧凑性复验 | PASS | PASS |
| TARGET-07 | B3 tied-lowest manual award semantics and persistence / 并列最低定标与决策状态 | PASS | PASS |

No Codex changes to original tests/assertions. All previously unreachable business paths completed: reload→Materials→search/PDF/isolated supplierZIP; real409/offline/restart/manualsave; full first material row; pending pagination; actual3price-button manual amount; ties/higher-reason and persistence. Independent PASS never overwrites an originalFAIL. [Raw cases](targeted-seven-results.json), [every automated case](automation-cases.csv).

## UX09 previous P3 resolved on this SHA

With12fresh material lines,3suppliers and confirmed multi-round quotes,1366×768,scrollY=0: **top=663.21875px, bottom=705px, height=41.78125px, maximum ordinary priced-row height=41.78125px, viewport=768**. Price/detail centers both683.609375. Whole first selectable quotation row fits above768, height≤44. [Unaltered viewport screenshot](attempt-02/evidence/UX09-1366-real-priced-first-screen.png), [rawDOM](attempt-02/evidence/UX09-independent-before-awards.json).

Details genuinely expand without silently awarding; explicit price-button selections remain valid. All prices/tiers/terms and suggested/manual amounts remain available. The original exactUX09 completes geometry/alignment/disclosure in both runs. Boundary observation:1024 firstquote top841.21875/bottom883 requires vertical scrolling;1600 top858.390625/bottom900.171875 slightly crosses the viewport bottom. The complete-first-screen criterion is specifically1366 in this task; other sizes pass scroll reachability/no container clipping/no horizontal overflow, not whole-first-row visibility. Further cross-breakpoint vertical compaction is an improvement suggestion, not an unreported three-size first-screenPASS.

Twenty-one real layouts (7pages×1024×768/1366×768/1600×900) have documentWidth=viewport, no global horizontal overflow. Long material text uses approved ellipsis with completehover; full columns/details controls and actualEnter navigation work without changing DB/PDF. Actual pending/conflict/status/details tested at3sizes. [1024](attempt-02/evidence/UX-1024-quotes.png), [1366](attempt-02/evidence/UX-1366-quotes.png), [1600](attempt-02/evidence/UX-1600-quotes.png), [layout metrics](attempt-02/evidence/three-size-layouts.json). No claim for every font/resolution/accessibility case.

## Full original automation

| Command | Actual outcome | Raw evidence |
|---|---|---|
| `python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'` |44PASS,exit0|[stderr](automation/phase2/python-backend/stderr.log)|
| `npm ci` |exit0,task-local writable cache|[command](automation/phase2/npm-ci/command.json)|
| `npm test` |10PASS,exit0|[stdout](automation/phase2/node-business/stdout.log)|
| `npm run test:e2e` |56PASS/0FAIL,exit0,0skip/retry|[stdout](automation/phase2/chromium-e2e/stdout.log)|

Targeted7 first, then fullPython/npmci/Node/Chromium. Independent browser starts only after secondnpmci to avoid module replacement races; separate ports/data from fullsuite. Actual runtimes/durations/exitcodes retained; no timeout/workers/retries/CI alteration. Independent buyer flows supplement original automation rather than replacing them. [Summary](automation-summary.json).

## Independent buyer business

[Itemized results](results.csv): allUX01–09 PASS for this currentSHA. Truthful single save state/diagnostics, meaningful names/stable IDs, exclusive navigation/permanent first Project stage, separate management/reread cancel, compact material/drawing/allocation and real52-line paging; comparison as above.

RealExcel preview/commit12items, same-code different-spec stable identities. PDF1/2/0candidates, preview without writes, manual explicit match and original viewer bytes. A/B12relations,C2; additive/dedup/remove/bothviews and52-row preview50+2/final52/filter/page selections preserve relationships.

File/paste/manual quotes; A R1V1→V2→R2V1,5confirmed submissions/50history rows,V1 immutable/locked,9explicit carries,tier118/2.25 based on true quantities. Non-destructive refresh/mode switch keeps drafts; dangerous file/carry preview refresh refused withoutSQLite changes. Pending10+2, actual last-page120price selection removes correct row;75/75ties need no false reason;82vs20needs real reason,blank/cancel does not commit; no-quote/cannot-supply are not0.

Manual3items **1979.00**, theoretical **6940.00**, suggested mixed **7064.00** remain distinct and persisted. Own-scopeA6420/B7185/C990, common10A6420/B6665. Actual supplier/nestedZIP/CSV/XLSX downloads pass **46content/CRC/quantity/price/math/scope/originalPDF/internal-data-separation checks**. No competitor/internalJSON/reason leakage.

Secondfresh52-lineRFQ isolated; RFQswitch/F5/real server restart preserve all4tables/everyrow/history/PDF. Held realPUT keeps DB unchanged, status truthful and backup disabled at3sizes; canceled reread keeps draft; actual200persists; real two-tab409 preserves winner and stale unsaved name, F5 returns winner. [Exports](attempt-02/evidence/export-checks.json), [restartDB](attempt-02/evidence/CORE07-after-service-restart.json), [real409](attempt-02/evidence/CORE08-conflict-http.json).

## Current-version S4 safety genuinely rerun

ActualUI full ZIP download;11checks validateCRC/manifestDBSHA/SQLite integrity/all4tables/allrows/3PDF hashes, source unchanged. One same-lengthPDFtext byte changed; filenames/order/manifest expectedSHA unchanged, all other entries identical; allZIP_STORED andcorrect rebuiltCRC, 13preflight checks. Real empty-targetUI400 **RESTORE_PDF_HASH_MISMATCH**, supportedNodeHTTP realbody400`RESTORE_REJECTED`/samehasherror, notDEFLATED/UNSUPPORTED_ARCHIVE. No CDPPageResponse.json.

Both refusals preserve target semantic rows/PDF, persistent file hashes and directory lists, no workspace/asset publication. SQLiteWAL/SHM separately recorded volatile, not falsely byte-stable. Same target then accepts original validZIP200, bothRFQs/history/PDF/manual1979 identical; nonemptyUIrefusal andactual409`RESTORE_TARGET_NOT_EMPTY` preserve all data. [Tamper preflight](attempt-02/evidence/S4-tamper-preflight.json), [raw backend audit](attempt-02/evidence/S4-audited-backend-rejection.json), [before target](attempt-02/evidence/S4-empty-target-before.json), [restored](attempt-02/evidence/S4-positive-control-restored.json), [nonempty](attempt-02/evidence/S4-nonempty-backend.json). No transfer of old-SHA S4PASS to this run.

## One fixture omission, raw records and limitations

First independent attempt completes core01–05/three-sizeUI, creates actual exports and passes24file checks, then missing `fixtures/business-expected.json` raisesFileNotFound beforeCSV/math validation. **Test fixture precondition error**, not product export defect. Raw error/trace/screenshots/partialresults/inputsnapshot preserved. Added the required numericA/B oracle, changing no product/original tests/validator assertions. Copy-only46check preflight is notUAT. Fresh emptyattempt02 rebuilds all buyer flows and completes S4. One documented fixture correction; [record](driver-fixture-correction-01.json), [path-only driverdiff](correction-paths.diff), [originalerror](independent/evidence/raw-first-error.json), [failedtrace](independent/evidence/trace-first-attempt.zip). Do not mix this correction with olderSHA runs or erase originalFAIL.

[Completed independent trace](attempt-02/evidence/independent-trace.zip). 117unaltered independent screenshots; all available original traces/HTMLreport/browser/server logs losslessly archived and hash-revalidated. [Extraction](README-raw-evidence.md), [SHA256](SHA256SUMS). No failed attempt discarded or copy-only preflight counted as extra businessPASS.

**NOT TESTED3:** nativeWindows Python3.13,Node22,PowerShell/BAT/local-launch safety. Linux/Node24does not substitute; officialActionsNOT RUN. Old synthetic migration excludedD024; desktopExcel/fullrealERP semantics/otherbrowsers/fonts/exhaustive load/fault/accessibility outside coverage. No confirmedP1/P2/P3 on testedcurrentSHA; absence of observations is not proof for untested scope.

Hand toChatGPT: cloud remediation scope **READY**, six original tests andUX09 genuinely closed; **M1merge gate NOT READY** until nativeWindows and separate owner authorization underD022. Only new directory on existingDraftPR50 appended; no newPR/Issue, product/originaltest/CI/protectedbranch/canonicalmemory edit, merge or close.
