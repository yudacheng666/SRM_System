# PR24 independent continuation from C03 / TEST-ONLY

**NOT-READY. Fresh C03/C04/C05 pass; the first unexpected C06 operation timeout stops all expansion. Remaining C06 and C07–C09 are NOT TESTED. Classification: test-precondition/report-toggle-state error; no new confirmed product P1/P2/P3 or environment failure. ChatGPT review remains required; no whole-product acceptance or merge approval.**

Runs [new task comment](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6287590146). PR40 evidence remains unchanged. Read its failure/source and prepared correct manual override route before interaction. Minimum synthetic RFQ/material/PDF setup in a fresh SQLite directory is not recounted as C01/C02 acceptance.

## Exact version and CI / 准确版本与CI

Product: `c8429ef51731da570c7a556d7cdce89e7123e739`. PR24 exact HEAD before/after; Draft/open/unmerged. Direct checkout, real official M1-Lite (`prototype/m1-lite`), real Chromium154.0.8037.57 / Playwright1.58.2. Served HTML equals checkout SHA256 `bc4288bf60f8971f8549dac3bdb4015617a23eeb4ce383ed103c66908f00cb6b`. New isolated SQLite `/tmp/c842r2/data`, service9430.

- [UI Unified #55 /39394554901](https://github.com/yudacheng666/SRM_System/actions/runs/39394554901): Linux118533929283 / Windows118533929739 SUCCESS.
- [S3/S4 #158 /39394554892](https://github.com/yudacheng666/SRM_System/actions/runs/39394554892): Linux118533929189 / Windows118533929525 SUCCESS.
- [Task/comments/gate/jobs](evidence/github-gate.json), [final HEAD](evidence/github-final.json), [runtime identity](evidence/runtime-identity.json), [protected refs before](evidence/protected-refs-before.txt)/[after](evidence/protected-refs-after.txt). No CI reruns as independent evidence, no prior-SHA PASS inherited.

## Method and results

Main browserUTC2026-10-20 09:16:52–09:21:24 (Beijing17:16:52–17:21:24),1366×768, fictional RFQ `RFQ-1792487839576-POZOBQ`, four lines (same-code M16/M20 at10/25pieces, unquoted base4, another item6), three fictional PDFs/suppliers. No real enterprise information or old business data. Only own9430service started/stopped; no9431restore service/browser started, no data deleted.

| Scope | Result | Detail / 细节 | Evidence / 证据 |
|---|---|---|---|
|SETUP|SETUP ONLY|重建4物料及虚构PDF，非重新验收C01/C02 / Minimum synthetic RFQ only|[evidence](method/00-minimum-setup-C03.js.txt)|
|C03|PASS|两份人工指定、确认前不写入、保存关系/三PDF哈希、真实PDF查看器 / Manual overrides, save and PDF bytes/viewer|[evidence](evidence/C03-unmatched-now-real-PDF-viewer.png)|
|C04|PASS|新下载供应商模板填写导入、追加多对多与视角保持关系 / Native supplier template import and additive relationships|[evidence](evidence/05-additive-supplier-allocation.png)|
|C05|PASS|同轮修订/历史、第二轮限制范围、阶梯、明确沿用、比较与定标 / Revisions, restricted round2, tiers, carry and awards|[evidence](evidence/09-round2-decisions.png)|
|C06 downloads|PARTIAL PASS|A/B询价ZIP、三家总ZIP及共同范围CSV实际下载；首次A成功 / Actual package/CSV downloads, first A success|[evidence](evidence/C06-first-supplier-A-export.png)|
|C06 export picker|FAIL operation: TEST PRECONDITION|误将已打开报表面板切为关闭，选择隐藏类型20s超时 / Toggling an open panel closed then selecting hidden type|[evidence](FAILURE-C06-REPORT-PANEL.md)|
|C06 full content|NOT TESTED|单家/总包完整行数量金额及隔离校验、比较/业务Excel实际导出 / Full output/content/isolation checks and report/business XLSX|[evidence](TEST-SCOPE.md)|
|C07|NOT TESTED|跨RFQ、F5及真实服务重启数据一致性 / Cross-RFQ, refresh and actual restart|[evidence](TEST-SCOPE.md)|
|C08|NOT TESTED|单份S4/内容校验、空目录恢复和非空拒绝 / Single S4 and empty/nonempty restore|[evidence](TEST-SCOPE.md)|
|C09|NOT TESTED|三尺寸关键V3兼容和P3冒烟 / Three-size V3 compatibility and P3 smoke|[evidence](TEST-SCOPE.md)|

## Completed C03

Preview and staged manual targets leave persisted business/PDF unchanged. For both multiple-candidate and unmatched files use row focus → global manual RFQ selector → Assign to selected file, inspect target/check state, then explicitly confirm/save. Saved relationships: L1→U24-D16_A.pdf, L2→UAT24-SHAFT_A.pdf, L3→NO-MATCH_U24.pdf, L4none. Physical PDFSHA values equal upload bytes. Actual native viewer visibly renders`V31 FICTIONAL UNMATCHED`, page1/1, closes normally. This is fresh browser/state/byte evidence, not source-only inference. [Staging](evidence/C03-both-manual-targets-staged.png), [saved](evidence/C03-confirmed-saved-relations.png), [real viewer](evidence/C03-unmatched-now-real-PDF-viewer.png). One earlier manual log caption used an inaccurate fixture label; an explicit correction preserves original log and correct pixel text without changing assertions/results.

## Completed C04/C05

New native supplier template downloaded, filled and imported:3parties. A/B assigned all4lines, C assigned line2; additive relationships survive view/supplier selection. Actual round1 A/B XLSX confirmed/locked; A same-roundV1=10→V2=9 leaves old object intact and draft ineffective, UI difference-1/-10%. Tied20/20 selection has no exception reason; true higher12vs8 gets an explicit fictional reason.

Round2 A scope restricted toL1/L2/L4 with specifications/immutable IDs. PasteL1tiers`1-9:8|10+:7` andL4=7. Only missing eligibleL2 offered for carry, default unchecked; explicit source note/verified statement permit carrying20. Draft retains prior9; confirmation uses qty10 tier7, carried20, locks round2 and preserves every previous confirmed submission. Explicit A awards clear old higher-price reasons, manual3/pending0/tie0/review0. Saved snapshot and UI analysis showA612/B692, theoretical/manual612=10×7+25×20+6×7. Unquoted is not a zero line price. This does not certify unexecuted report exports. [Tier/missing preview](evidence/07-round2-tier-and-missing-preview.png), [explicit carry](evidence/08-round2-explicit-carry-and-tier.png), [final decision](evidence/09-round2-decisions.png), [saved business](evidence/06-round2-business-final.json).

## C06 first failure, no retry

FirstA package directly downloads, thenB, all-supplier ZIP and common-scope CSV. Driver enters management and unconditionally clicks an export entry **without checking that report picker is already open**. This entry toggles; click closes it, then `pilotReportType` selection waits20s on a hidden element. AtUTC09:21:24.648 first timeout, driver immediately saves raw failure/state/trace and closes browser. No retry or failed-driver repair/continuation.

Trace shows`pilotReportPanel display:block→none`; screenshot shows outer entry but no inner picker; read-only source proves toggle behavior. Classified **TEST PRECONDITION / panel state assumption**, not confirmed product or environment failure. A reviewed next run should inspect visibility before using the entry; no workaround was executed here. [Details](FAILURE-C06-REPORT-PANEL.md), [stop](evidence/failure-stop.json), [screenshot](evidence/FAIL-first-observed.png), [trace states](evidence/FAIL-report-panel-trace-excerpts.json), [source](evidence/FAIL-readonly-source.txt), [classification](evidence/FAIL-classification.json).

Comparison/business XLSX not downloaded and planned C06 rows/quantities/amounts/isolation assertions were not executed. Post-stop inventory checks readability/CRC/SHA/members of existing evidence only, not functional content PASS. Prepared validator archived clearly as NOT-EXECUTED, no C06-file-checks.json exists. Current persisted business/PDF equals C05end, captured memory equals saved; full stop-time history archived without claiming restart/restore acceptance.

## Accounting, NOT TESTED and next step

61raw checks/61true/0false include setup/navigation; one separate operation timeout. Not61business cases all pass.17actual1366screenshots, one CRC-valid trace,5downloads (1template/3ZIP/1CSV),0fullS4/0restore. No pageerrors, one icon404 retained. No complete CI/P2/P3/24S4/fault suite rerun.

C06 complete content/isolation/report XLSX, C07cross-RFQ/F5/actual restart, C08oneS4/empty/nonempty restore, C09three-size UI/P3smoke NOT TESTED. P2 firstA download is just an incidental limited smoke PASS. Native Windows, desktop Excel recalculation/printing, disk/power/long-load/all combinations remain untested.

ChatGPT should review completedC03–C05 and the new operation-state error, then separately schedule remainingC06 onward. No evidence calls for product-code changes for this driver assumption. **Still NOT-READY, no PR24/main merge or whole-product acceptance.** Only independent reports/evidence/method TXT; product/original tests/CI/development/main unchanged, no PR merged/closed.

[17screenshots](SCREENSHOTS.md), [trace](evidence/independent-browser-trace.zip), [browser](evidence/browser.jsonl), [server](evidence/server.log), [stop-time full DB history](evidence/history-at-stop.json), [results](results.json), [scope/preparation](TEST-SCOPE.md), [SHA256](SHA256SUMS.txt).
