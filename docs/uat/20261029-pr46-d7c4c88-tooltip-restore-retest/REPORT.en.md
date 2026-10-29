# PR46 · d7c4c88 independent repair verification / TEST-ONLY

**Verdict: NOT READY.** The scoped independent purchasing, tooltip, overflow and backup/restore checks pass on this exact SHA. The complete unmodified Chromium suite still has **5 FAIL**. This is neither whole-product acceptance nor an official GitHub Actions pass. No new P1/P2/P3 product defect is confirmed; five original test failures and one independent actionability timeout of unknown cause remain visible. Native Windows: **3 NOT TESTED**.

## Version and execution

Only product commit **`d7c4c88abd354ebdc5d3bfedfc9199e278c48483`** was executed, detached in `/workspace/srmd7-product`; PR46 HEAD matched at start and finish. Task: [developer handoff](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6490856709) plus the current user instructions. [Task/version record](github-task-and-version.json). Date2026-10-29; raw logsUTC, user-facing dateAsia/Shanghai. Generated `2026-10-29T08:45:16.375591+00:00`.

Linux, Python3.12.14, Node24.19.0, Playwright1.58.2, actual Chromium154.0.8037.57. No native Windows/cmd.exe/PowerShell is connected. The real M1-Lite HTML and actual backend are served through the repository's `tests/e2e/serve.py` using fresh isolated SQLite directories; no static concept prototype or mocked business API substitutes for the product. Automated run, first independent attempt, sequential repeat and empty restore targets use separate controlled directories. All12 materials,3 suppliers,3PDFs, prices, projects and sample attachments are fictional and newly generated. No user business directory or old-demo migration was used.

[Start](identity-start.json), [end](identity-end.json) and [actual HTTP identity](http-trace-identity.json): **86 captured HTTP200 root-page responses** across58 original traces and2 independent traces match exact-checkout HTML SHA256 `9e67e39b3e67683bb5d174569e0223a7e1103b7edabf45e2952f78b6e0958d23`; no missing body records. The product tracked tree stayed clean. Protected branch refs were identical before evidence submission. Evidence is appended only to a new directory on existing DraftPR50, parent evidence commit `5c179854188f01ea7614d019c0f4c31f7f90ca8e`; previous reports are immutable and not reused as current passes.

## Complete original suites

|Suite|PASS|FAIL|Exit|
|---|---:|---:|---:|
|Python backend unittest discovery|44|0|0|
|Node business `npm test`|10|0|0|
|Complete Chromium `npm run test:e2e`|53|5|1|
|Total|107|5|—|

`npm ci` succeeded. E2E used1worker,0retries,0skips,0flaky results. Exact commands, SHA, timestamps, working directories and exit codes are in each `automation/*/command.json`; [112 case rows](automation-cases.csv), [runner log](automation-runner.log), [failure classification](automation/failure-classification.json). No original test, assertion threshold, retry policy, product or workflow was changed. No Actions were triggered or claimed green.

### Previous17 and previous6

The previous17 whole cases are now **12 PASS /5 FAIL**; all previous6 overflow cases **PASS** on this current execution. These are overlapping subsets of58, not additional tests. [Candidate's five-file test diff](candidate-original-test-diff.patch) preserves actual PUT200, saved-state equality and business safety checks while changing wording/font/title expectations. Passing the former blocking line does not mean the rest of a case passed. [Exact mapping](prior-case-retest-summary.json), [appendix](PRIOR-CASES.md).

|Original FAIL|Observed facts and classification|Follow-up|
|---|---|---|
|08 badPDF/damagedZIP; acceptance:365|Still expects 未成功; actual refusal says 完整备份恢复未完成. Independent real400 and unchanged-target check pass. P3 stale test wording.|ChatGPT update obsolete wording while retaining refusal/data assertions.|
|15 supplier isolation; acceptance:599|Parent supplier-row center targets nested remove button; default dialog acceptance removes the intended supplier. P3 driver locator.|Target the supplier label/selection area; keep all isolation assertions.|
|45 first assigned package; acceptance:694|Same center-click removal; report panel remains hidden afterwards. P3 driver locator.|Fix intended selection; retain real export/content/dirty checks.|
|46 navigation; acceptance:733|Same nested removal action creates an extra dismissed confirmation. P3 driver locator.|Assert intended view selection has no deletion dialog; retain safety checks.|
|UIV3 integration; ui-v3-integration:65|Expected#F6F8FB, actual#F5F7F9. P3 unresolved design/test expectation mismatch.|ChatGPT confirm approved current color before aligning the correct side.|

Original trace dialogs and an independent [elementFromPoint measurement](attempt-02/evidence/original-failure-center-hit.json) confirm the locator issue: at1440×1000, row center `(415.57,828.95)` hits BUTTON“移出本次询价”. Clicking the actual supplier name selects it correctly; the real assigned-export action opens backup/report UI and downloads an XLSX/PDF ZIP without changing stored rows/history/PDFs. This supplementary PASS **does not replace any of the3 original FAILs**. Later assertions after their original stopping point are NOT REACHED. None establishes a purchasing-logic defect.

## Requirement results and independent evidence

Grouped requirement rows: **30PASS /2FAIL /3NOT TESTED /0BLOCKED**. The2FAIL rows are the full E2E suite and overlapping previous17 set. The sequential independent run logged1077 passing checks/observations; these are not1077 independent cases and do not cancel the first failed attempt.

| ID | Result | Scope | Evidence / notes |
|---|---|---|---|
| HEAD | PASS | Exact checkout, PR HEAD and actual served HTML | [http-trace-identity.json](http-trace-identity.json) — 86 captured actual root responses match the current checkout |
| AUTO-PY | PASS | Complete original Python backend suite | [stderr.log](automation/python-backend/stderr.log) — 44 PASS |
| AUTO-NODE | PASS | Complete original Node business suite | [stdout.log](automation/node-business/stdout.log) — 10 PASS |
| AUTO-E2E | FAIL | Complete original Chromium E2E suite | [failure-classification.json](automation/failure-classification.json) — 53 PASS /5 FAIL /0 skip /0 retry; original failures retained |
| OLD-17 | FAIL | Seventeen previously blocked/outdated whole cases | [prior-case-retest-summary.json](prior-case-retest-summary.json) — 12 PASS /5 FAIL at subsequent assertions; preserved actual state assertions |
| OVERFLOW-6 | PASS | Six original horizontal-overflow cases | [prior-case-retest-summary.json](prior-case-retest-summary.json) — 6/6 current-SHA PASS, subset of E2E58 |
| LAYOUT-18 | PASS | Six actual pages across all three viewports | [layout-overflow.json](attempt-02/evidence/layout-overflow.json) — 18 page measurements; no whole-document overflow |
| TIP-BOUNDS | PASS | Pointer and keyboard popup bounds | [tooltip-retest.json](attempt-02/evidence/tooltip-retest.json) — 83 actual visible instances;1024x768/1366x768/1600x900; stored state/history/PDF unchanged |
| TIP-TAB | PASS | Real Tab opens the popup and focus stays on trigger | [tooltip-retest.json](attempt-02/evidence/tooltip-retest.json) — 83 actual visible instances;1024x768/1366x768/1600x900; stored state/history/PDF unchanged |
| TIP-ESC | PASS | Escape dismisses with pointer/focus retained | [tooltip-retest.json](attempt-02/evidence/tooltip-retest.json) — 83 actual visible instances;1024x768/1366x768/1600x900; stored state/history/PDF unchanged |
| TIP-PIN | PASS | Pinned popup and click-away dismissal | [tooltip-retest.json](attempt-02/evidence/tooltip-retest.json) — 83 actual visible instances;1024x768/1366x768/1600x900; stored state/history/PDF unchanged |
| RESTORE-MALFORMED | PASS | Malformed ZIP rejected with Chinese guidance | [BACKUP-malformed-zip-friendly-rejection.png](attempt-02/evidence/BACKUP-malformed-zip-friendly-rejection.png) — Real HTTP400; empty target unchanged; independently covers business assertion later blocked by old 未成功 wording |
| RESTORE-ARCHIVE | PASS | Actual inquiry/drawing package rejected as full restore | [archive-rejection-real-backend.json](attempt-02/evidence/archive-rejection-real-backend.json) — UI+backend400; actionable Chinese, no raw RESTORE_*; exact target unchanged |
| RESTORE-HASH | PASS | Legal STORED ZIP with wrong PDF hash rejected | [S4-audited-backend-rejection.json](attempt-02/evidence/S4-audited-backend-rejection.json) — One changed byte, same length, fresh valid CRC, unchanged manifest;400 RESTORE_PDF_HASH_MISMATCH; target files and semantic data unchanged |
| RESTORE-EMPTY | PASS | Correct complete archive restores into empty target | [S4-positive-control-restored.json](attempt-02/evidence/S4-positive-control-restored.json) — Two RFQs; all tables,50 confirmed-history lines, quote versions, manual decisions and3PDF hashes match source |
| RESTORE-NONEMPTY | PASS | Nonempty target refuses overwrite | [S4-nonempty-backend.json](attempt-02/evidence/S4-nonempty-backend.json) — UI refusal and actual409 RESTORE_TARGET_NOT_EMPTY; restored database/history/PDF unchanged |
| ZIP-CONTENT | PASS | Downloaded backup classes and ZIP/SQLite/PDF integrity | [s4-checks.json](attempt-02/evidence/s4-checks.json) — 30 class checks +11 full integrity checks; original mail/chat explicitly excluded |
| SAVE-STATE | PASS | Actual pending save and acknowledged success | [CORE08-while-held.json](attempt-02/evidence/CORE08-while-held.json) — Real held PUT; no false saved state, backup blocked at all3sizes; real200 required before saved |
| SAVE-CONFLICT | PASS | Real stale-tab SQLite revision conflict | [CORE08-conflict-http.json](attempt-02/evidence/CORE08-conflict-http.json) — Actual409, visible save failure/details; winning data and all history/PDF retained |
| SAVE-OUTAGE | PASS | Actual service outage and saved-data protection | [offline-after-manual-save.json](attempt-02/evidence/offline-after-manual-save.json) — Failure truthful; persisted DB unchanged before restart, manual200 andF5; quote/history preserved |
| HISTORY | PASS | Locked revisions and saved/restored quote history | [Q04-all-confirmed.json](attempt-02/evidence/Q04-all-confirmed.json) — 5 confirmed revisions/50 history lines, V1 immutable, explicit9 carry lines and tiers118/2.25 |
| CORE01 | PASS | Actual material XLSX import and duplicate-code line identities | [CORE01-real-excel-preview.png](attempt-02/evidence/CORE01-real-excel-preview.png) — 12 new synthetic lines, preview does not save |
| CORE02 | PASS | Real PDF matching, ambiguous/unmatched and original download bytes | [CORE02-clicked-correct-real-PDF.png](attempt-02/evidence/CORE02-clicked-correct-real-PDF.png) — Actual3PDFs; unique/ambiguous/unmatched; preview does not persist |
| CORE03 | PASS | Supplier multi-assignment, duplicate append, remove and filter | [UX08-item-first-multiple-suppliers.png](attempt-02/evidence/UX08-item-first-multiple-suppliers.png) — Independent fresh UD7-A/B/C; existing links retained |
| CORE04 | PASS | XLSX/paste/manual quotes, rounds/versions and preview safety | [Q03-same-round-version-difference.png](attempt-02/evidence/Q03-same-round-version-difference.png) — Real file refresh refusal and carry preview preservation; no history replacement |
| CORE05 | PASS | Ties, higher-price reasons, paging and separate totals | [C05-scoped-amounts-and-decisions.png](attempt-02/evidence/C05-scoped-amounts-and-decisions.png) — Manual3/1979 vs theory6940 vs mixed7064; pending9; tied-lowest no reason |
| CORE06 | PASS | Actual supplier ZIP/CSV/comparison XLSX contents | [export-checks.json](attempt-02/evidence/export-checks.json) — 46 file-content checks; per-supplier PDF scope and values |
| CORE07 | PASS | RFQ switch,F5 and real service restart persistence | [CORE07-after-service-restart.json](attempt-02/evidence/CORE07-after-service-restart.json) — Separate52-line second RFQ; all source rows/history/PDF hashes stable |
| FIRST-ROW | PASS | Entire first actual priced row at1366x768 | [UX09-independent-before-awards.json](attempt-02/evidence/UX09-independent-before-awards.json) — top=701.140625,bottom=742.921875,height=41.78125,scrollY=0 |
| TRIAGE-NAME | PASS | Supplier label selection avoids nested remove action | [original-failure-center-hit.json](attempt-02/evidence/original-failure-center-hit.json) — At1440x1000 original container center really hits 移出本次询价; label click selects supplier and keeps all saved rows |
| TRIAGE-EXPORT | PASS | Actual assigned-supplier export through visible action | [original-failure-triage-export.json](attempt-02/evidence/original-failure-triage-export.json) — Real ZIP withXLSX/PDF,no privateJSON; source data unchanged |
| COPY | PASS | Six-page rendered buyer copy and real error states | [copy-audit.json](attempt-02/evidence/copy-audit.json) — 40 visible states; no S4/M0-M9/SQLite matches in rendered text/visible attributes |
| WIN-01 | NOT TESTED | Native Windows Python3.13 backend | [identity-start.json](identity-start.json) — Only Linux execution environment available; not substituted by Linux results |
| WIN-02 | NOT TESTED | Native Windows Node22 business suite | [identity-start.json](identity-start.json) — Only Linux execution environment available; not substituted by Linux results |
| WIN-03 | NOT TESTED | Native Windows isolated program/data directory, CMD/BAT/Edge UI and restore safety | [identity-start.json](identity-start.json) — Only Linux execution environment available; not substituted by Linux results |

### Tooltips and quote-row geometry

All18 page/viewport measurements (six pages at1024×768,1366×768,1600×900) fit the document width. Independent inspection covered **83 actually visible tooltip instances**:28/27/28 at the respective widths, as dynamic visible controls vary. Each received real hover, four-edge/document-width measurement, actual Tab navigation from its preceding focusable control, Escape while focus remains, Escape while hover remains, pinning and click-away. All pass; stored data/history/PDFs remain identical. Screenshots were visually inspected for readable in-viewport text.

| Viewport | Quote-input help | Backup help |
|---|---|---|
|1024×768|[Screenshot](attempt-02/evidence/TOOLTIP-1024-quoteImport-srm-hint-33.png)|[Screenshot](attempt-02/evidence/TOOLTIP-1024-backup-srm-hint-46.png)|
|1366×768|[Screenshot](attempt-02/evidence/TOOLTIP-1366-quoteImport-srm-hint-33.png)|[Screenshot](attempt-02/evidence/TOOLTIP-1366-backup-srm-hint-46.png)|
|1600×900|[Screenshot](attempt-02/evidence/TOOLTIP-1600-quoteImport-srm-hint-33.png)|[Screenshot](attempt-02/evidence/TOOLTIP-1600-backup-srm-hint-46.png)|


At1366×768 and scrollY0, the first **actual priced** row is fully visible: top701.140625,bottom742.921875,height41.78125px. Price and disclosure are aligned. [Screenshot](attempt-02/evidence/UX09-1366-real-priced-first-screen.png), [geometry](attempt-02/evidence/UX09-independent-before-awards.json). This is fresh current-SHA evidence, not an empty table or old screenshot.

### Purchasing, files and restore safety

The real project exercises duplicate codes/distinct specifications and line IDs, unique/ambiguous/unmatched drawings, additive many-to-many allocation, XLSX/paste/manual quotation, same-round revisions, another round, preview refresh refusal and explicit carry. Five confirmed revisions/50history lines remain; V1 is immutable,9lines explicitly carried, effective tier prices118/2.25. Manual3 awards/¥1979 are distinguished from theory¥6940 and suggested combination¥7064, with9pending. Ties need no higher-price reason; actual higher offers require one.

Actual supplierZIP/CSV/comparisonXLSX values and PDF scope were checked46times; backup categories/content30times; fullZIP/SQLite integrity and3PDF hashes11times. A second52-line project covers50+2pagination, additive relationships and isolation. RFQ switches,F5 and actual service restart preserve all saved data/history/PDFs.

- Real downloaded archive-as-full-restore: UI/backend400, actionable Chinese (not a full backup / download complete backup), unchanged empty target. The same target then restores the proper archive with200. [Evidence](attempt-02/evidence/archive-rejection-real-backend.json).
- [Valid STORED tamper fixture](attempt-02/evidence/S4-tamper-preflight.json): onePDF byte changes at the same892byte length; manifest, other entries, names and ordering unchanged; all ZIP_STORED with valid recomputedCRC. Both browser and audited actual backend return400/RESTORE_PDF_HASH_MISMATCH. [Buyer UI](attempt-02/evidence/S4-STORED-hash-mismatch-real-UI.png) contains Chinese guidance, not raw codes. Target semantic rows, persistent file bytes and directory set stay equal; volatile SQLite files are separately documented.
- Proper full restore returns200 and reproduces both RFQs, quote history, versions, manual decisions and3PDF hashes. [Positive control](attempt-02/evidence/S4-valid-positive-control-restored.png). Nonempty target then returns409/RESTORE_TARGET_NOT_EMPTY, with ChineseUI and no target changes. [Evidence](attempt-02/evidence/S4-nonempty-backend.json).
- A genuinely heldPUT verifies honest pending/saving state and blocked backup at3sizes; saved requires real200. A real stale-tab409 and actual service outage show save failure without losing stored quote/PDF/history data. Restart/manual200/F5 succeed; technical diagnostics remain accessible.

Previous P3-UI-01 and P3-COPY-02 are **PASS within this exact-SHA tested scope**, not closed using historical results or extended to every device/condition.

## First attempt, facts versus unknowns

The first independent attempt timed out after15seconds waiting actionability for visible `#runAssignSearch`. [Original error](independent/evidence/raw-first-error.json), [trace](independent/evidence/trace-first-attempt.zip), [screenshot](independent/evidence/FAIL-page0.png). **ROOT CAUSE UNKNOWN**: product, driver and environment have not been conclusively distinguished.

The full automated suite was concurrent, and the cloud exec server separately reported pong_timeout. [Runtime observations](runtime-observation.json) show2core quota, memory-max events, and0OOM/0OOM-kill. These are observations, not proven causes. After automation ended, unchanged business methods were executed sequentially in a fresh data directory/browser (runtime paths and regenerated fixture bytes only). No force, fixed-delay workaround, timeout increase or weakened assertion was introduced. The complete repeat passed; this **does not establish that the first timeout was fixed**. Its FAIL remains separate, not erased.

Native Windows3groups remain NOT TESTED, including Windows3.13/Node22, launcher/CMD/BAT/Edge and native filesystem/file-lock behavior. Old demo migration, enterprise data, other devices/zoom and later unreached original assertions are not inferred to pass. The approved background-color baseline still needs a developer decision.

## Delivery and next step

[Index](README.md), [caseCSV](results.csv), [issues](issues.json), [raw error register](raw-error-register.json). All469 original artifacts are losslessly archived in11parts≤32MiB, with every original file hash revalidated after extraction. All archived ZIP CRC checks pass.58 original test traces and2 independent traces are retained, including failures; [integrity](independent-trace-integrity.json).

ChatGPT should address the remaining original-test/design mismatches and assess the initial timeout evidence before a new exact-SHA retest. Do not declare full-suite or whole-product acceptance/merge readiness. Only this evidence directory is appended to existing DraftPR50. Product, existing tests, CI, canonical project memory, development branches and main are unchanged; no new PR/Issue, merge, closure or Actions dispatch. Final review remains with ChatGPT and the project owner.
