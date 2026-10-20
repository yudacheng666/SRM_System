# PR24 C06–C09 independent acceptance: stopped / TEST-ONLY

**NOT-READY. C06/C07 pass; single S4 archive contents pass. After empty-restore HTTP200, the independent driver's response-body read hits a browser protocol error and immediately stops. Nonempty refusal and C09 are NOT TESTED. Classified as test-observer navigation/lifetime assumption, not a confirmed product restore defect or new P1/P2/P3. No whole-software acceptance/merge approval; ChatGPT review required.**

Runs [latest review task](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6288365279). PR40/41 untouched.14scripts/helpers pre-reviewed and frozen before testing; visible/enabled/options and toggle state checked. All hashes unchanged during run; no repair/retry after failure.

## Exact product and gate / 准确版本与门槛

Product`c8429ef51731da570c7a556d7cdce89e7123e739`; PR24 HEAD exact at start/end, Draft/open/unmerged. Direct checkout; official M1-Lite served bytes equal checked-out SHA256`bc4288bf60f8971f8549dac3bdb4015617a23eeb4ce383ed103c66908f00cb6b`. Real Chromium154.0.8037.57 / Playwright1.58.2.

- [UI Unified #55 /39394554901](https://github.com/yudacheng666/SRM_System/actions/runs/39394554901): Linux118533929283 / Windows118533929739 SUCCESS.
- [S3/S4 #158 /39394554892](https://github.com/yudacheng666/SRM_System/actions/runs/39394554892): Linux118533929189 / Windows118533929525 SUCCESS.
- [Gate/comments/jobs](evidence/github-gate.json), [final HEAD](evidence/github-final.json), [runtime identity](evidence/runtime-identity.json), [protected refs before](evidence/protected-refs-before.txt)/[after](evidence/protected-refs-after.txt). CI not rerun as independent conclusion, prior evidence not rewritten.

## Setup and actual results

BrowserUTC2026-10-20 10:42:36–10:46:11 (Beijing18:42:36–18:46:11),1366×768. New SQLite `/tmp/c06/data` and blank `/tmp/c06/restore`, services9460/9461. Fictional RFQ `RFQ-20261020-C06-INDEPENDENT-R3`:4items,3suppliers,3synthetic PDFs,15quote-history lines, same-round revisions/round2tiers/carry/3manual awards.

Minimal synthetic fixture from PR41 is given a new workspace ID/revision, created through official guarded local API, PDFs uploaded/relations committed. No direct SQLite/product modification. This is SETUP ONLY, not a rerun/PASS of C03–C05. Setup produces two snapshot versions; later actual UI-created blank RFQ yields2workspaces/3versions/3asset links. All acceptance actions/downloads use real Chromium. [Provenance](evidence/setup-provenance.json), [API setup](evidence/setup-api-log.json), [frozen preflight](evidence/preflight-frozen.json), [unchanged hashes](evidence/frozen-scripts-after-run.json).

| Scope | Result | Details / 细节 | Evidence / 证据 |
|---|---|---|---|
|GATE|PASS|唯一HEAD/真实HTTP字节/两套CI所有Windows/Linux作业 / Exact version and CI gates|[evidence](evidence/runtime-identity.json)|
|SETUP|SETUP ONLY|正式API装入最小虚构状态，未重复C03–C05完整验收 / Official API fixture only|[evidence](evidence/setup-provenance.json)|
|C06 Excel|PASS|比价/业务Excel实际下载，RFQ行数量/阶梯/历史/来源/共同范围 / Real XLSX contents and quote history|[evidence](evidence/C06-workbooks-checks.json)|
|C06 packages/CSV|PASS|单家/总包行数量/PDF/隔离及CSV金额 / Actual supplier/nested archives and CSV amounts|[evidence](evidence/C06-supplier-checks.json)|
|C07|PASS|跨RFQ/F5/真实进程重启，当前/全历史/附件登记/PDF一致 / Actual persistence and process restart|[evidence](evidence/C07-history-after-restart.json)|
|C08 file|PASS|1份新S4，CRC/SQLite当前历史/资产表/manifest/PDF / Single complete ZIP/DB/PDF integrity|[evidence](evidence/C08-file-checks.json)|
|C08 restore action|HTTP200 observed; verification INTERRUPTED|空目录恢复API200，驱动读取响应体时CDP错误 / Empty restore200, observer protocol failure|[evidence](FAILURE-C08-RESPONSE-BODY.md)|
|C08 readonly evidence|POST-STOP FACT, not original assertion PASS|恢复后只读数据与预期完全相同；原验证链未完成 / Readonly recovered data matches, original chain incomplete|[evidence](evidence/C08-poststop-readonly-observations.json)|
|C08 nonempty|NOT TESTED|首失败后未尝试非空拒绝 / No nonempty refusal attempted|[evidence](TEST-SCOPE.md)|
|C09|NOT TESTED|三尺寸UI关键兼容未运行 / Three-size compatibility not executed|[evidence](TEST-SCOPE.md)|
|P2/P3 smoke|PASS limited|首次A包成功、纯导航新建无假未保存警告 / First supplier and clean navigation smoke only|[evidence](evidence/browser.jsonl)|

## Completed C06

Comparison/business Excel downloaded first with17content checks, then individualA/B, all-supplier ZIP and common CSV with45checks. Closed picker is opened once, already-visible picker never toggled; dependent type/options/party controls checked.

Exact RFQIDs/quantities10/25/4/6; common rangeL1/L2/L4, unquotedL3blank not zero. Qty10 selects10+ tier7, carriedL2=20, L4=7; common totalsA612/B692, CSV each quantity×price verified. Report workbook has effective7/20/7, common flags and ROUND/SUMIF formulas; history retains A1|1/1|2/2|1 with10/9/7 and carry source. Business export4items/3suppliers/15history lines and raw tiers. Formula text/numeric exports checked, not desktop Excel recalculation.

Individual/nested archives: assigned RFQIDs, quantities, blank requested prices, no competitor/internal award or reason fields; A/B4lines+3PDF, Cjustline2/qty25/its1PDF, original bytes identical. No business mutation. FirstA success is limited P2smoke, not full old-suite rerun. [Workbook checks](evidence/C06-workbooks-checks.json), [supplier/CSV checks](evidence/C06-supplier-checks.json).

## Completed C07

F5 keeps exact data/PDF; clean supplier-view navigation produces no false unsaved New RFQ warning (P3smoke). New RFQ empty, previous supplier context reset, return original exact. Actually SIGTERM old9460process and start a new process, reopen page, compare both current snapshots/every historical row/asset registrations/PDF: equal. Buyer3/pending0/review0. [Real process record](evidence/C07-actual-service-restart.json), [history](evidence/C07-history-after-restart.json), [UI](evidence/C07-actual-service-restart-decisions.png). Actual restart, not just reload.

## C08 partial and first failure

One S4 file10checks pass: CRC/manifestDBSHA/SQLite integrity/every current/history row/all asset rows/PDF bytes and manifest hashes; main data unchanged. Actual empty-destination restore POST returns200, checked.

Then `await restoreResponse.json()` raises`Protocol error (Network.getResponseBody): No resource with given identifier found`. AtUTC10:46:11.095 first unexpected failure, raw evidence/trace/state saved and browser closed immediately. No retry or driver correction/continuation. Product success handler immediately calls location.reload; server showsPOST200thenGETpage, trace retains200but no body resource. **TEST PRECONDITION: observer assumes response body survives automatic navigation.** Exact Chrome retention mechanism not independently isolated; no product pageerror/backend4xx5xx proves a restore defect. Neither failed read nor200alone verifies unobserved`verified/restored`payload.

[Failure](FAILURE-C08-RESPONSE-BODY.md), [stop](evidence/failure-stop.json), [trace](evidence/independent-browser-trace.zip), [protocol/network excerpts](evidence/FAIL-response-json-trace-excerpts.json), [missing body](evidence/C08-original-response-trace-evidence.json), [read-only reload source](evidence/FAIL-readonly-reload-source.txt).

Post-stop readonly current/history/asset/PDF data in restore folder matches pre-backup2workspaces/3versions/3assets exactly; main unchanged. These are classification facts, not completed original assertions. No browser reopening/second restore. Payload verification/restored UI checks/nonempty refusal were never reached. Failure PNG shows the **main9460workspace at stop**, not the restored9461page; no fake restore screenshot. [Readonly facts](evidence/C08-poststop-readonly-observations.json), [restored history](evidence/C08-poststop-restored-history.json).

## Accounting, NOT TESTED, review

25browser assertions25true/0false plus1separate protocol driver error, not all-pass. File checks17+45+10 pass but are not independent business-case counts.7downloads/7actual1366screenshots/1CRC-valid trace;1S4download/1emptyPOST/0nonempty attempts/0C09viewports. No pageerrors, two icon404retained. No repeat C03–C05/24S4/fault/CI/fullP2P3suites.

Nonempty restore refusal, C09critical1024×768/1366×768/1600×900 UI compatibility, original restore payload/reloaded UI verification remain NOT TESTED/incomplete. Existing1366screenshots do not certify C09. Native Windows/desktop Excel/physical faults/long load/full pixel parity/all business combinations untested.

ChatGPT should review observer error and readonly successful data facts. A future independent run should avoid depending on Response.json after immediate reload, verify original status/restored DB/reloaded actual UI, then finish nonempty refusal/C09. No product restore fix justified by this driver error. **Still NOT-READY; no PR24/main merge/whole-software approval.** Only independent report/evidence/method TXT added, protected refs unchanged, PR40/41untouched, no merge/close. Both owned services stopped without data deletion.

[Screenshots](SCREENSHOTS.md), [browser](evidence/browser.jsonl), [main server](evidence/server.log), [restore server](evidence/restore-server.log), [results](results.json), [scope](TEST-SCOPE.md), [SHA256](SHA256SUMS.txt).
