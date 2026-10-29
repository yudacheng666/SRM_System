# Itemized current-SHA results / 逐项验收结果

Product `fbb98944a4bcee439e4e81ebfe3ef710bee4a3d0`. Requirement rows overlap;2FAIL rows refer to the same original UI case. Original harness errors remain in raw-error-register.json,not replaced by supplemental PASS.

|ID|Result|Scope|Evidence/notes|
|---|---|---|---|
|HEAD|PASS|Exact detached checkout/PR HEAD/actual HTTP|[http-trace-identity.json](http-trace-identity.json) 87 actual root-page responses match exact source HTML|
|PY|PASS|Full original Python backend suite|[stderr.log](automation/python-backend/stderr.log) 44PASS|
|NODE|PASS|Full original Node business suite|[stdout.log](automation/node-business/stdout.log) 10PASS|
|E2E|FAIL|Complete unmodified Chromium suite|[failure-classification.json](automation/failure-classification.json) 57PASS/1FAIL/0skip/0retry; exit1|
|FOCUS-1|PASS|08 bad PDF and damaged ZIP never contaminate saved data / 异常回归|[case.json](focus-original-five/CASE-01/case.json) Original case completed with all downstream assertions; no early stopping at prior failure point|
|FOCUS-2|PASS|15 new RFQ clears stale supplier-first context without corrupting saved RFQs / 供应商跨询价隔离|[case.json](focus-original-five/CASE-02/case.json) Original case completed with all downstream assertions; no early stopping at prior failure point|
|FOCUS-3|PASS|45 P2-EXPORT-01 first supplier package export after view-only choices / 首次供应商包正常导出|[case.json](focus-original-five/CASE-03/case.json) Original case completed with all downstream assertions; no early stopping at prior failure point|
|FOCUS-4|PASS|46 P3-NAV-01 view navigation versus actual unsaved edit / 只读导航与真实脏数据区分|[case.json](focus-original-five/CASE-04/case.json) Original case completed with all downstream assertions; no early stopping at prior failure point|
|FOCUS-5|FAIL|UI V3 integration: theme, active navigation and responsive workspace / 视觉与导航回归|[case.json](focus-original-five/CASE-05/case.json) Approved#F6F8FB background PASS; later system-settings kicker assertion FAIL|
|V31-BG|PASS|Approved V3.1#F6F8FB background on6pages×3sizes|[layout-overflow.json](independent/evidence/layout-overflow.json) Specific previous background failure point passes; whole UI case still FAIL later|
|UI-VISUAL|PASS|Six-page actual visual review and18screens|[visual-review.json](visual-review.json) Shared fonts/color/navigation, no major first-screen overlap; not whole-product perfection|
|UI-OVERFLOW|PASS|Six pages×3sizes document width|[layout-overflow.json](independent/evidence/layout-overflow.json) 18current measurements, document width within viewport; table scrolling remains allowed|
|TIP-MOUSE|PASS|Mouse hover popup bounds|[tooltip-retest.json](independent/evidence/tooltip-retest.json) 83 actual visible instances across1024/1366/1600; data/history/PDF unchanged|
|TIP-TAB|PASS|Actual keyboard Tab opens popup with in-viewport bounds|[tooltip-retest.json](independent/evidence/tooltip-retest.json) 83 actual visible instances across1024/1366/1600; data/history/PDF unchanged|
|TIP-ESC|PASS|Escape closes even with hover/focus retained|[tooltip-retest.json](independent/evidence/tooltip-retest.json) 83 actual visible instances across1024/1366/1600; data/history/PDF unchanged|
|TIP-PIN|PASS|Click-to-pin and click-away close|[tooltip-retest.json](independent/evidence/tooltip-retest.json) 83 actual visible instances across1024/1366/1600; data/history/PDF unchanged|
|FIRST-ROW|PASS|1366x768 complete first actual quoted row|[UX09-independent-before-awards.json](independent/evidence/UX09-independent-before-awards.json) top701.140625,bottom742.921875,height41.78125,scrollY0|
|SEARCH-FIRST|PASS|First normal assignment search click delivered|[assign-search-first-result.json](independent/evidence/assign-search-first-result.json) NOT REPRODUCED; ROOT CAUSE UNKNOWN;1click,19samples/17rAF,original15s timeout,no force/retry|
|BAD-ZIP|PASS|Malformed ZIP refusal,no raw error code,target unchanged|[BACKUP-malformed-zip-friendly-rejection.png](independent/evidence/BACKUP-malformed-zip-friendly-rejection.png) Real400 and unchanged target|
|WRONG-KIND|PASS|Inquiry/drawing archive rejected as full restore|[archive-rejection-real-backend.json](independent/evidence/archive-rejection-real-backend.json) Real400; actionable Chinese; target unchanged|
|HASH|PASS|Valid STORED PDF hash tamper rejected|[S4-audited-backend-rejection.json](completion/evidence/S4-audited-backend-rejection.json) Same-length one-byte change,validCRC,unchangedmanifest;400RESTORE_PDF_HASH_MISMATCH; target byte/semantic/directory equality|
|RESTORE-EMPTY|PASS|Correct full archive restores empty target|[S4-positive-control-restored.json](completion/evidence/S4-positive-control-restored.json) Real200;2RFQ/allstored tables/quotehistory/PDF equal source|
|RESTORE-NONEMPTY|PASS|Nonempty target refuses overwrite|[S4-nonempty-backend.json](completion/evidence/S4-nonempty-backend.json) Actual409; friendlyUI; entire restored data unchanged|
|ZIP-CONTENT|PASS|Actual backup ZIP/SQLite/PDF contents|[s4-checks.json](completion/evidence/s4-checks.json) 11full integrity checks;30backup-class checks separately|
|SUPPLIER-ISOLATION|PASS|Additive relations and cross-RFQ supplier isolation|[CORE07-after-service-restart.json](continuation/evidence/CORE07-after-service-restart.json) 12line original+52line secondRFQ; no supplier/quote/PDF leakage|
|HISTORY|PASS|Confirmed quotation versions/rounds immutable|[Q04-all-confirmed.json](independent/evidence/Q04-all-confirmed.json) 5confirmed revisions/50history lines;V1 retained;explicit9carry andtiers118/2.25|
|AWARD|PASS|Ties,non-lowest reasons and manual totals|[C05-scoped-amounts-and-decisions.png](independent/evidence/C05-scoped-amounts-and-decisions.png) Manual3/1979 distinct from theory6940/mixed7064;pending9|
|SAVE-PENDING|PASS|Honest in-flight save and backup guard at3sizes|[CORE08-while-held.json](completion/evidence/CORE08-while-held.json) Real heldPUT; no falseSaved; real200 before committedSaved; interrupted prior harness preserved|
|SAVE-CONFLICT|PASS|Actual SQLite stale-tab409 protection|[CORE08-conflict-http.json](completion/evidence/CORE08-conflict-http.json) Winner data/history/PDF preserved; stale draft retained; details visible|
|SAVE-OFFLINE|PASS|Actual service-down error and restart/manual save|[offline-after-manual-save.json](completion/evidence/offline-after-manual-save.json) Truthful failure;old persisted revisions andquote rounds retained;200+F5|
|EXPORT|PASS|Actual downloaded supplierZIP/CSV/XLSX contents|[export-checks.json](continuation/evidence/export-checks.json) 46PASS on byte-identical original current-SHA downloads; first verifier path error retained|
|PERSIST|PASS|Cross-RFQ,F5 and real service restart|[CORE07-after-service-restart.json](continuation/evidence/CORE07-after-service-restart.json) All stored rows and3PDF hashes remain equal|
|MATERIAL-PDF|PASS|Actual import and unique/ambiguous/unmatched drawing match|[CORE02-clicked-correct-real-PDF.png](independent/evidence/CORE02-clicked-correct-real-PDF.png) Fresh XLSX12lines;3actualPDFs;preview does not save;download original bytes|
|NAME-EXPORT|PASS|Actual supplier-name selection and assigned export intent|[original-failure-triage-export.json](completion/evidence/original-failure-triage-export.json) XLSX/PDF ZIP/no privateJSON; no saved data mutation|
|WIN-1|NOT TESTED|Native Windows Python3.13 backend|[identity-start.json](identity-start.json) No native Windows connected; Linux is not substituted|
|WIN-2|NOT TESTED|Native Windows Node22 business|[identity-start.json](identity-start.json) No native Windows connected; Linux is not substituted|
|WIN-3|NOT TESTED|Native Windows isolated installation/data,CMD/BAT/Edge and filesystem/restore safety|[identity-start.json](identity-start.json) No native Windows connected; Linux is not substituted|
