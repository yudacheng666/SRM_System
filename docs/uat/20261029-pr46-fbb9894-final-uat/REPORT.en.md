# PR46 · fbb9894 independent acceptance / TEST-ONLY

**Verdict: NOT READY.** Complete original suites: **111 PASS /1 FAIL**. Final supplemental independent purchasing/UI/save/restore checks pass, but the original UI integration case still fails at a later obsolete assertion, and3 native Windows groups are NOT TESTED. No new P1/P2/P3 product defect is confirmed. One P3 test-maintenance issue and3 independent-harness errors are retained separately rather than erased or mislabeled as product defects.

Only product SHA **`fbb98944a4bcee439e4e81ebfe3ef710bee4a3d0`** was tested. Date2026-10-29,Asia/Shanghai; raw timestampsUTC; report generated `2026-10-29T15:28:24.704123+00:00`. [PR46 handoff](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6492833285), [PR50 task](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6492834238), [saved task/version](github-task-version.json).

## Exact product, isolation and original suites

Detached checkout `/workspace/srmfbb-product`; actual PR46 HEAD matched at start/end, without a synthetic merge commit. Real Chromium uses M1-Lite `prototype/m1-lite/index.html` and the repository's `tests/e2e/serve.py` with its actual backend and SQLite APIs. No static concept prototype or mocked business backend. Automation and independent business start with fresh isolated directories and fictional materials,suppliers,prices,projects andPDFs. No user business directory, old-SHA database/ZIP or legacy-demo migration is accessed. Resumption uses only this run's own newly created current-SHA data, with committed checkpoint equality verified; each evidence phase is separate.

Linux/Python3.12.14/Node24.19.0/Playwright1.58.2/Chromium154.0.8037.57; no native Windows/cmd.exe/PowerShell. [Identity](identity-start.json) and [actual HTTP proof](http-trace-identity.json):87 captured HTTP200 root responses across58 original and3 independent traces match source HTML SHA256 `bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3`,0missing bodies. Product tracked tree is clean. Protected refs stay unchanged before evidence push. This new directory only is appended to existing DraftPR50,parent `0c4e08a82ac5835d088c93cb9d82424bd3065bcd`; old evidence remains immutable.

|Original full suite|PASS|FAIL|Exit|
|---|---:|---:|---:|
|Python backend unittest discovery|44|0|0|
|Node business npm test|10|0|0|
|Complete Chromium npm run test:e2e|57|1|1|
|Total|111|1|—|

npm ci succeeded.1worker,0retries,0skips,0flaky. No original test edits,deletions,threshold relaxation or replacement rerun. [All112 cases](automation-cases.csv), [commands/exits](COMMANDS.md), `automation/*/command.json`, [full log](automation/chromium-e2e/stdout.log). No Actions triggered or declared green.

## Previous five, independently recorded

| Current original case | Whole-case result | Evidence |
|---|---|---|
| 08 bad PDF and damaged ZIP never contaminate saved data / 异常回归 | PASS | [case/trace](focus-original-five/CASE-01) |
| 15 new RFQ clears stale supplier-first context without corrupting saved RFQs / 供应商跨询价隔离 | PASS | [case/trace](focus-original-five/CASE-02) |
| 45 P2-EXPORT-01 first supplier package export after view-only choices / 首次供应商包正常导出 | PASS | [case/trace](focus-original-five/CASE-03) |
| 46 P3-NAV-01 view navigation versus actual unsaved edit / 只读导航与真实脏数据区分 | PASS | [case/trace](focus-original-five/CASE-04) |
| UI V3 integration: theme, active navigation and responsive workspace / 视觉与导航回归 | FAIL | [case/trace](focus-original-five/CASE-05) |

All five former stopping points are traversed: malformed-ZIP copy/no-code/empty-target checks,3name selections and all downstream business assertions in those3cases, and approved#F6F8FB background. **Whole cases are4PASS/1FAIL, not5PASS.** The UI case now reaches line76 and still requires `.srm-v3-pageKicker` to match `/\d\d|ADMIN/`; actual Chinese text is“系统设置”. Background passed earlier and is separately verified in18 independent page states.

**P3-TEST-01: stale language/route-caption assertion.** Reproduce with the unmodified full suite on this SHA; [raw failure,screenshot,trace](automation/failures/FAIL-01), [classification](automation/failure-classification.json). No purchasing failure or data corruption is established. ChatGPT should verify the approved Chinese caption and align test semantics while retaining every later navigation/layout/state assertion. Codex did not change it. Assertions after76 are **NOT REACHED**, not silently passed by the six-page independent audit.

## Independent requirement results

[Full itemized table](RESULTS.md) / [CSV](results.csv):32PASS/2FAIL/3NOT TESTED/0currentlyBLOCKED. Both FAIL rows refer to the same original UI failure (whole-suite plus focused-case views); counts overlap.1130 low-level check/observation records include repeated/subordinate checks and are not1130 independent test cases. Original harness interruptions remain separately failed/blocked at the time, despite completed supplemental scope.

- **Six-page UI/tooltips PASS:**18 actual screenshots were visually inspected. Shared#F6F8FB canvas,14.5px body,Chinese heading hierarchy and coherent navigation/buttons; no major first-screen overlap or whole-document horizontal overflow. Wide1024 tables retain internal scrolling.83 actually visible tooltip instances (28/27/28) pass hover/four-edge bounds,realTab,Escape while focus/hover remains,pinning and click-away; saved data/history/PDFs unchanged. [TooltipJSON](independent/evidence/tooltip-retest.json), [visual review](visual-review.json).
- **1366first row PASS:**[fresh priced screenshot](independent/evidence/UX09-1366-real-priced-first-screen.png);scrollY0,top701.140625,bottom742.921875,height41.78125.Entire row visible;price/disclosure aligned.
- **Purchasing/history PASS:**fresh12lines/3suppliers/3PDFs,duplicate codes/distinct specifications,line identity,unique/ambiguous/unmatched drawing matches,additive allocations,Excel/paste/manual quotes,rounds/revisions and preview safety.5confirmed versions/50history lines preserved,V1 immutable,9explicit carries,effective tiers118/2.25. Manual3/¥1979 remains distinct from theory¥6940/mixed¥7064,9pending;ties require no higher-price reason,actual higher bids do.
- **Real files/persistence PASS:**46supplierZIP/CSV/comparisonXLSX content checks;30backup-class/excluded mail/chat checks.Second52-line RFQ with50+2pagination and additive relations;RFQ switch,F5 and actual service restart preserve all saved rows/history/3PDF hashes. Original exports do not mutate stored data.
- **Save safety PASS:**genuinely heldPUT at3sizes prevents falseSaved and blocks backup;actual200 required beforeSaved.Real stale-tab409 preserves winning data;actual service outage shows failure,restart/manual200/F5 recover while retaining old quote/history/PDFs. [Evidence](completion/evidence).
- **Restore safety PASS:**malformedZIP and real inquiry/drawing-archive-as-full-restore return400 with actionable Chinese/no rawRESTOREcode and unchanged target.ValidZIP_STORED tamper changes exactly1PDF byte at the same length;manifest/other entries unchanged and recomputedCRC valid.Browser and audited backend return400/RESTORE_PDF_HASH_MISMATCH;target semantic rows,persistent bytes,directory set unchanged.Original fullZIP restores both RFQs/allstored tables/quotehistory/3PDFs with200;nonempty target then409 with no changes. [Fixture proof](completion/evidence/S4-tamper-preflight.json), [actual rejection](completion/evidence/S4-audited-backend-rejection.json), [nonempty refusal](completion/evidence/S4-nonempty-backend.json).

| Page | 1024×768 | 1366×768 | 1600×900 |
|---|---|---|---|
| project | [Screenshot](independent/evidence/VISUAL-1024-project.png) | [Screenshot](independent/evidence/VISUAL-1366-project.png) | [Screenshot](independent/evidence/VISUAL-1600-project.png) |
| items | [Screenshot](independent/evidence/VISUAL-1024-items.png) | [Screenshot](independent/evidence/VISUAL-1366-items.png) | [Screenshot](independent/evidence/VISUAL-1600-items.png) |
| assign | [Screenshot](independent/evidence/VISUAL-1024-assign.png) | [Screenshot](independent/evidence/VISUAL-1366-assign.png) | [Screenshot](independent/evidence/VISUAL-1600-assign.png) |
| quoteImport | [Screenshot](independent/evidence/VISUAL-1024-quoteImport.png) | [Screenshot](independent/evidence/VISUAL-1366-quoteImport.png) | [Screenshot](independent/evidence/VISUAL-1600-quoteImport.png) |
| quotes | [Screenshot](independent/evidence/VISUAL-1024-quotes.png) | [Screenshot](independent/evidence/VISUAL-1366-quotes.png) | [Screenshot](independent/evidence/VISUAL-1600-quotes.png) |
| backup | [Screenshot](independent/evidence/VISUAL-1024-backup.png) | [Screenshot](independent/evidence/VISUAL-1366-backup.png) | [Screenshot](independent/evidence/VISUAL-1600-backup.png) |

Optional efficiency observation,not a failed1366requirement:at1600×900 the first row is868.875..910.65625,slightly across the fold;normal240px wheel exposes628.875..670.65625.No inaccessible control or horizontal page overflow established.Consider compact comparison chrome at larger sizes after owner review.[Measured evidence](completion/evidence/optional-fold-observation.json).

## First-search diagnostic: NOT REPRODUCED; ROOT CAUSE UNKNOWN

Exactly one ordinary `#runAssignSearch` locator.click with the original15second timeout,no force,retry,fixed-delay workaround or timeout increase. During concurrent fullE2E,the actual trusted click targeted runAssignSearch and produced the expected single filtered line.19continuous samples include17rAF;button box remains x849.03125/y488.703125/w45/h32.25.All19center hits return the button.SixrAFs include active animations elsewhere;this does not establish causation for the prior timeout.

[Raw consecutive-frame boxes,computed styles,animations,ancestors,scroll,focus/hover,elementFromPoint/hit stacks](independent/evidence/assign-search-first-frames.jsonl), [summary](independent/evidence/assign-search-diagnostic-summary.json), [result](independent/evidence/assign-search-first-result.json),before/after screenshots and original trace retained.The abnormal timeout branch did not occur and cannot be claimed verified.**NOT REPRODUCED; ROOT CAUSE UNKNOWN**,not ROOT CAUSE FIXED.No later continuation repeats this first click.

## Harness errors and recorded corrections

|Record|Actual failure|Preservation and correction|
|---|---|---|
|H-01startup|TTY omitted,stdinclosed;0business actions/0searchclicks.|Startup logs retained,ownprocess tree terminated,TTYlaunch innewemptydirectory.No completed startup trace export was available:explicitlyNOTAVAILABLE.|
|H-02new export verifier|Stale fixtures-attempt02 path;Pythonexit1 before all content checks,no content assertion failed before missingfile.|Original error/stderr/downloads/failedtrace retained.New standalone verifier fixes only itsfixturepath;byte-identical original current-SHA downloads copied with hashes,46checksPASS.No replacement export before recheck.|
|H-03resume config|sizes undefined;save method stops before viewportloop.|Original trace/error retained.Completion launcher initializes allglobals,checks committed checkpoint unchanged,then reexecutes only affected save scenario and remaining scopes.No search/initial purchasing replay.|

[Raw register](raw-error-register.json), [path correction](export-verifier-correction.diff), [context correction](resume-context-correction.json),all original phase directories preserved.Corrections touch only this run's newly authored independent evidence methods/launcher,never product/existingtests/CI.Driver exit0 after catching an error is **not** used as aPASS;the original interrupted records remain failed/blocked.

## Remaining scope and delivery

Native Windows3groups NOTTESTED:Python3.13,Node22,and isolated Windows program/data launch,PowerShell/BAT/Edge,filesystem/file-lock/restore behavior.Linux is not a substitute.Old-demo migration,real enterprise data,other devices/zoom and original assertions after the failed line are not inferred to pass.

**ChatGPT should resolve P3-TEST-01 and review this report,then retest a new exact SHA;Windows still needs actual execution.Full-suite acceptance and merge readiness remain incomplete.** Product,originaltests,CI,canonicalmemory,development/main unchanged.NoActions,merge,closure,newPR/Issue;only append to existingDraftPR50.

All461 original automated outputfiles are losslessly archived in11parts≤32MiB,every originalfileSHA256 revalidated after extraction,and originaloutputZIPCRCchecks pass.Intentionally broken inputfixtures remain negative inputs unchanged.[Index](README.md), [original manifest](automation/original-file-manifest.json), [trace integrity](independent-trace-integrity.json), [checksum inventory](SHA256SUMS.txt).58originaltesttraces and3independenttraces retained,including failures.
