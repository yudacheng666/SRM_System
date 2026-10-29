# Current-SHA itemized results / 逐项结果

Product `2aaa478c8f1966e41b9372d9d989c383dbaa1972`.27PASS/0FAIL/3NOTTESTED requirement rows overlap suite/sample counts.112unique primary cases plus1repeated focused execution;initial interrupted stage not counted as full acceptance.

|ID|Result|Scope|Evidence/notes|
|---|---|---|---|
|HEAD|PASS|Detached SHA,PR HEAD,actual HTTP|[http-trace-identity.json](http-trace-identity.json) HTML bytes identical to previous candidate by design; git/command/data/trace provenance is current SHA, not reused PASS|
|FOCUS|PASS|Original focused UI V3 case executed first in corrected ordered run|[focused-assertion-audit.json](focused-assertion-audit.json) 1PASS;100body assertions;79after old failure loop;15stage/viewports;finalerrors[] complete|
|PY|PASS|Full original Python backend suite|[stderr.log](automation/python-backend/stderr.log) 44PASS|
|NODE|PASS|Full original Node business suite|[stdout.log](automation/node-business/stdout.log) 10PASS|
|E2E|PASS|Complete original Chromium suite|[automated-results.json](automation/automated-results.json) 58PASS/0FAIL; actual final complete suite skips/retries0|
|PREVIOUS-FIVE|PASS|Previous five whole cases on this SHA|[prior-five-current-results.json](prior-five-current-results.json) MalformedZIP,3supplier cases,and completeUIV3; no historical PASS transfer|
|NAV|PASS|Fresh buyer navigation,project name and unique active selection|[UX01-04-project-real-name.png](independent/evidence/UX01-04-project-real-name.png) Actual create/switch controls and names persist|
|VISUAL|PASS|Six pages×three viewports and approved background|[layout-overflow.json](independent/evidence/layout-overflow.json) 18fresh screenshots visually reviewed;#F6F8FB;no whole-document overflow|
|TOOLTIP|PASS|Hover/realTab/Esc/pin/click-away safety|[tooltip-retest.json](independent/evidence/tooltip-retest.json) 83actual visible samples;data/history/PDF unchanged|
|FIRST-ROW|PASS|1366x768 first actual priced row entirely visible|[UX09-independent-before-awards.json](independent/evidence/UX09-independent-before-awards.json) top701.140625,bottom742.921875,height41.78125,scrollY0|
|MATERIAL-PDF|PASS|Fresh materialXLSX and actual PDF matching/view/download|[CORE02-clicked-correct-real-PDF.png](independent/evidence/CORE02-clicked-correct-real-PDF.png) Unique/ambiguous/unmatched and originalPDF bytes|
|ASSIGN|PASS|Additive supplier allocation and isolation|[CORE07-after-service-restart.json](independent/evidence/CORE07-after-service-restart.json) First12line project and new52line RFQ; no leakage;52paging50+2|
|QUOTES|PASS|Real imports,multiple rounds/revisions,locked history|[Q04-all-confirmed.json](independent/evidence/Q04-all-confirmed.json) 5confirmed versions/50history lines;V1 immutable;explicit9carry;tiers118/2.25|
|AWARD|PASS|Ties,non-lowest reasons and independent manual subtotal|[C05-scoped-amounts-and-decisions.png](independent/evidence/C05-scoped-amounts-and-decisions.png) Manual3/1979 distinct from theory6940/mixed7064;pending9|
|EXPORT|PASS|Actual supplierZIP/CSV/comparisonXLSX content|[export-checks.json](independent/evidence/export-checks.json) 46checks;originalcurrent files and per-supplier PDF scope|
|PERSIST|PASS|RFQ switch,F5,actual service restart|[CORE07-after-service-restart.json](independent/evidence/CORE07-after-service-restart.json) All stored rows/history/PDF hashes equal|
|STATUS|PASS|Real pendingPUT and saved status,backup guard|[CORE08-while-held.json](independent/evidence/CORE08-while-held.json) Three sizes;no falseSaved;real200 required|
|CONFLICT|PASS|Real stale-tab409 protection|[CORE08-conflict-http.json](independent/evidence/CORE08-conflict-http.json) Winner data/history/PDF preserved;stale draft retained;diagnostics visible|
|OFFLINE|PASS|Actual service outage/manual save recovery|[offline-after-manual-save.json](independent/evidence/offline-after-manual-save.json) Truthful failure;old history retained;restart200/F5|
|CLASSES|PASS|Actual data-only/archive/full backup categories|[backup-class-checks.json](independent/evidence/backup-class-checks.json) 30checks;mail/chat explicitly excluded|
|WRONG-ZIP|PASS|MalformedZIP and archive-as-full restore refusal|[archive-rejection-real-backend.json](independent/evidence/archive-rejection-real-backend.json) Real400;buyer-language UI;no rawcodes;target unchanged|
|ZIP-INTEGRITY|PASS|ZIP/SQLite/allPDF integrity|[s4-checks.json](independent/evidence/s4-checks.json) 11checks includingSQLite integrity and every stored table|
|PDF-TAMPER|PASS|LegalZIP_STORED same-length one-byte PDF tamper|[S4-audited-backend-rejection.json](independent/evidence/S4-audited-backend-rejection.json) ValidCRC/unchangedmanifest;400PDFhash mismatch;target bytes/semantics/directories unchanged|
|RESTORE|PASS|Correct full restore into fresh empty directory|[S4-positive-control-restored.json](independent/evidence/S4-positive-control-restored.json) Real200;2RFQs/history/decisions/3PDFs equal source|
|NONEMPTY|PASS|Nonempty restore target refusal|[S4-nonempty-backend.json](independent/evidence/S4-nonempty-backend.json) UIrefusal/actual409;restored data unchanged|
|NAME-EXPORT|PASS|Real supplier-name selection and assigned export intent|[original-failure-triage-export.json](independent/evidence/original-failure-triage-export.json) RealXLSX/PDF ZIP;source rows/history unchanged|
|SEARCH|PASS|First normal assignment search click delivered|[assign-search-first-result.json](independent/evidence/assign-search-first-result.json) NOT REPRODUCED;ROOT CAUSE UNKNOWN;20samples/18rAF;1click,no force/retry|
|WIN-1|NOT TESTED|Native Windows Python3.13|[identity-start.json](identity-start.json) No realWindows environment available;Linux not substituted|
|WIN-2|NOT TESTED|Native Windows Node22|[identity-start.json](identity-start.json) No realWindows environment available;Linux not substituted|
|WIN-3|NOT TESTED|Native Windows isolated program/data,CMD/BAT/PowerShell/Edge and filesystem/restore safety|[identity-start.json](identity-start.json) No realWindows environment available;Linux not substituted|
