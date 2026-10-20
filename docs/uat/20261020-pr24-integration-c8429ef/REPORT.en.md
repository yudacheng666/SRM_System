# PR24 c8429ef independent integration acceptance: stopped / TEST-ONLY

**NOT-READY: integration coverage incomplete after the first operation failure. Classification is a test-precondition/wrong UI-path error, not a confirmed product P1/P2/P3 or demonstrated environment fault. This neither establishes a defect-free product nor whole-software acceptance. ChatGPT review is required.**

This run prioritized template fill/reimport, CSV update safety and manual drawing matching, with multiround scope/tier/carry integration and persistence/restore planned next. Existing full P2/P3/S4 suites were not repeated. Only the first two steps started. No script correction/retry or further business-module expansion followed failure.

## Version and CI / 版本与门槛

唯一产品 / only product: `c8429ef51731da570c7a556d7cdce89e7123e739`. PR24 HEAD exact at start/end; direct checkout, not synthetic merge. Official `prototype/m1-lite` HTTP bytes equal checkout SHA256 `bc4288bf60f8971f8549dac3bdb4015617a23eeb4ce383ed103c66908f00cb6b`. Real Chromium154.0.8037.57 / Playwright1.58.2, independent temporary SQLite `/tmp/c842/data`; no existing business data accessed.

- [UI Unified #55 /39394554901](https://github.com/yudacheng666/SRM_System/actions/runs/39394554901): Linux118533929283 / Windows118533929739 SUCCESS.
- [S3/S4 #158 /39394554892](https://github.com/yudacheng666/SRM_System/actions/runs/39394554892): Linux118533929189 / Windows118533929525 SUCCESS.
- [PR comments, gate and jobs](evidence/github-gate.json), [final HEAD](evidence/github-final.json), [runtime identity](evidence/runtime-identity.json), [protected refs before](evidence/protected-refs-before.txt)/[after](evidence/protected-refs-after.txt). Main/development/fix refs unchanged. CI was a gate, not a replacement for independent testing; existing suites were not rerun.

## Executed scope

BrowserUTC2026-10-20 09:00:38–09:02:34 (Beijing17:00:38–17:02:34),1366×768. Fictional RFQ `RFQ-1792486851958-G8BW1Z`, four lines including same-code M16/M20 at10/25pieces, base4 and another item6, fictional valid PDFs and prepared supplier/quote data. No real enterprise information.

Three actual native XLSX templates and one CSV template downloaded in the UI. Files checked for single sheet/header-only canonical fields and CSV UTF8 BOM. Filled copies preserve downloaded headers. Material workbook truly imported and checked all RFQ IDs/codes/quantities. Supplier and quotation filled workbooks are merely prepared, not imported or labeled end-to-end PASS.

Ambiguous same-code CSV match correctly blocks confirmation; cancel leaves data unchanged. Unique base match preview performs no write; explicit confirmation changes only that line's category. PDF preview shows unique/multiple/unmatched states without committing relationships. Multiple and unmatched have no automatic target; persisted workspace/PDF unchanged.

| ID | Result | Scope / 范围 | Evidence / 证据 |
|---|---|---|---|
|GATE|PASS|PR24准确HEAD及两项CI全部Windows/Linux作业 / Exact HEAD and both CI workflows|[evidence](evidence/github-gate.json)|
|C01|PASS|4个真实模板下载，XLSX/CSV表头与格式，下载不改工作区 / Actual template files and non-mutating downloads|[evidence](evidence/template-file-checks.json)|
|C02a|PASS|填写真实物料模板后正式导入，4行/同编码不同规格/数量准确 / Filled downloaded material template imports real4lines|[evidence](evidence/01-filled-material-template-preview.png)|
|C02b|PASS|CSV歧义更新阻止/取消不变，唯一匹配预览不写入、确认只更新目标行 / Ambiguous and unique matched-update safety|[evidence](evidence/01-valid-preview-no-write.json)|
|C03a|PASS|图纸唯一/多候选/未匹配预览、无自动目标、预览不改业务 / Three matching states and non-mutating preview|[evidence](evidence/03-three-drawing-match-states.png)|
|C03b|FAIL operation; TEST PRECONDITION|未匹配文件行内下拉不存在RFQ-L00003，selectOption20秒超时 / Attempting nonexistent candidate option times out|[evidence](FAILURE-C03-UNMATCHED-SELECT.md)|
|C03c|NOT TESTED|多候选/未匹配实际人工指定、确认保存、真实PDF预览 / Actual manual override, committed association and PDF viewer|[evidence](REPORT.en.md)|
|C04|NOT TESTED|供应商模板填充导入、多对多分配/追加/删除/视角 / Supplier import and assignment integration|[evidence](TEST-SCOPE.md)|
|C05|NOT TESTED|完整多轮报价、同轮修订、阶梯、范围、明确沿用、历史与定标 / Multiround, revisions, tiers, scope, carry and awards|[evidence](TEST-SCOPE.md)|
|C06|NOT TESTED|实际供应商询价包、业务Excel/比价CSV及数量金额核对 / Supplier package/business workbook/comparison output|[evidence](TEST-SCOPE.md)|
|C07|NOT TESTED|跨RFQ/F5/真实服务重启一致性 / Cross-RFQ, refresh and restart persistence|[evidence](TEST-SCOPE.md)|
|C08|NOT TESTED|单次S4冒烟及空目录/非空恢复 / One S4 smoke and empty/nonempty restore|[evidence](TEST-SCOPE.md)|
|C09|NOT TESTED|完整三尺寸UI V3兼容和P2/P3合并后冒烟 / Three-size V3 compatibility and P2/P3 smoke|[evidence](TEST-SCOPE.md)|

## First failure and stop

After staging the multiple-candidate row toRFQ-L00002, the independent driver incorrectly asks unmatched row dropdown `[data-batch-target="2"]` to selectRFQ-L00003. This candidate-only dropdown contains no such option. The same Playwright action waits20seconds and times out. `failure-stop.json` recordsUTC09:02:34.135. Driver immediately captures evidence, closes trace/browser and prevents further expansion. Batch association confirmation was never reached; no PDFs/relationships committed.

**TEST PRECONDITION / wrong operation path.** Existing screenshot exposes per-file focus buttons and global manual-target selector. Read-only source shows candidate-only options; intended unmatched override uses focus file → global RFQ line → Assign to selected file, after which a manual option is added. This path was not operated or validated here, so manual association remains NOT TESTED. No evidence indicates a product regression or environment outage.

[Failure explanation](FAILURE-C03-UNMATCHED-SELECT.md), [raw stop](evidence/failure-stop.json), [failure screenshot](evidence/FAIL-first-observed.png), [page text](evidence/FAIL-first-observed.txt), [trace](evidence/independent-browser-trace.zip), [classification](evidence/FAIL-classification.json), [read-only source](evidence/FAIL-readonly-source.txt).

After stop only passive evidence/version/ref/database reads occur. Persisted current snapshot and PDFs equal pre-preview; captured memory equals saved state. Four material lines and category update remain, no drawing commitment. Full stop-time history is archived, but a pre-preview complete-history snapshot was not captured; no full-history restore comparison is claimed. No further browser action or business restart was run.

## Raw accounting and evidence limits

Browser13assertions/13true/0false plus1real operation timeout; not an all-pass run. Native template-file checks11/11. Four template downloads, five actual screenshots, one CRC-valid trace; zeroS4downloads/restores and zero supplier/comparison business export files. No pageerrors, one icon404 preserved, no causal evidence linking it to the nonexistent option.

Only current materials/settings/drawing interactions at1366 were observed, not three-size V3 compatibility. Prior PR39/PR36 old-SHA findings are references only; identical file bytes cannot establish this candidate's business/restore PASS. Planned P2/P3/S4 smoke was not reached; complete previous suites were not repeated.

## NOT TESTED and next step

Manual unmatched override and committed drawing association; supplier import/distribution; full multiround/revision/tier/explicit-carry/award chain; supplier packages and amount exports; cross-RFQ/F5/real restart; empty/nonempty restore; three-size UI compatibility are NOT TESTED. Native Windows, desktop Excel recalculation/printing, physical disk/power failures, long loads and all combinations remain untested too.

ChatGPT should review classification/raw evidence, then authorize a next run using the existing manual-target route from the drawing stage and completeC04–C09. This operation-path failure provides no basis for product-code changes. **This incomplete run must not approve PR24's development-baseline merge or whole-software acceptance.** No merge requested/performed.

Only reports/anonymous evidence/executed independent method TXT added. Product/original tests/CI/development/main unchanged, no PR merged/closed. Two owned temporary servers (including unused empty restore server9421) stopped without deleting data.

[Screenshots](SCREENSHOTS.md), [browser/requests/errors](evidence/browser.jsonl), [server](evidence/server.log), [trace](evidence/independent-browser-trace.zip), [complete stop-time DB history](evidence/history-at-stop.json), [structured results](results.json), [scope](TEST-SCOPE.md), [SHA256](SHA256SUMS.txt).
