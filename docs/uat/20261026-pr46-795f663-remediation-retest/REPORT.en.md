# PR #46 remediation independent retest — TEST-ONLY

**Verdict: NOT READY. Product SHA `795f663933f6883bc6e05d30b4ebbc2623a3301c` only.** Targeted16: **12 PASS /4 FAIL** (old AF15:12/3; new UX09:FAIL). Full original110: **103 PASS /7 FAIL**: Python44/44, Node10/10, Chromium49/56, zero skips/retries. Independent buyer UX: **8 PASS /1 FAIL**; core business: **12 PASS**; native Windows: **3 NOT TESTED**. These overlapping sets must not be added together. Historical66a0579 evidence94/15 andUX7/1/1 remains unchanged.

## Authority and exact identity

[Full task](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6414197317) and PR46 remediation handoff read, plus AGENTS/PROJECT_STATE/DECISIONS from unmerged PR48 HEAD92ba152. Targeted phase preceded full original suites after no confirmed P1/P2 product safety failure; the valid STORED negative followed full suites. Real M1 Lite detached checkout, localhost Chromium and new isolated fictional SQLite/PDFs; no old DB/archive imported. PR46 exact HEAD verified at start/mid/end, still Draft/unmerged. [Identity start](identity-start.json), [end](identity-end.json), [HTTP start](http-start.json), [fresh attempt03 HTTP](http-attempt03-start.json), [HTTP end](http-end.json) match checkout HTMLSHA256 `7ee6b0c38e39ad70b122b7003477357905998cfcaeaa3044c31443fcbc1b2176`.

Linux Python3.12.14, Node24.19.0 (different from recommended22), Playwright1.58.2, genuine Chromium154.0.8037.57. No GitHub Actions triggered or claimed successful. No product, original tests, CI, canonical memory or protected branches changed; no PR created/merged/closed. Only the authorized new directory on existing DraftPR50 is appended, parent369e2b7.

## Original failures: exact targeted and full outcomes

| Old ID | Exact original test | Targeted | Full |
|---|---|---|---|
| AF-01 | 01 startup, demo isolation, autosave, navigation and restart / 启动与隔离 | PASS | PASS |
| AF-02 | 05 PDF matching, manual correction, refresh and scoped supplier ZIP / 图纸询价包 | FAIL | FAIL |
| AF-03 | 06 full backup restore: actual imported quotes, history, PDFs, overwrite refusal / 完整恢复 | PASS | PASS |
| AF-04 | 07 real service disconnect and stale-tab 409 halt autosave / 自动保存失败 | FAIL | FAIL |
| AF-05 | 12 supplier status and report context reset on RFQ change / 保存提示与跨询价报告隔离 | PASS | PASS |
| AF-06 | 13 compact laptop item table after import / 1366首屏物料可见 | FAIL | FAIL |
| AF-07 | 44 S4 blocked-download reason stays visible beside the action / 备份阻止原因始终可见 | PASS | PASS |
| AF-08 | 46 P3-NAV-01 view navigation versus actual unsaved edit / 只读导航与真实脏数据区分 | PASS | PASS |
| AF-09 | ERP09: second-round scope shows specification and preserves selected line identities | PASS | PASS |
| AF-10 | UX project title: Chinese label, rename, history and reload / 询价名称真实保存 | PASS | PASS |
| AF-11 | UX project page: first workflow stage, visible controls, stage switching / 询价项目独立首页 | PASS | PASS |
| AF-12 | UX admin: backup page separate from RFQ, concise labels / 独立备份页与简短项目按钮 | PASS | PASS |
| AF-13 | UX item rows: single-line drawing badge and compact row / 物料行高及缺图纸标识 | PASS | PASS |
| AF-14 | B3 quote and comparison with real SQLite 1366x768 | PASS | PASS |
| AF-15 | B3 quote and comparison with real SQLite 1600x900 | PASS | PASS |

Twelve repaired tests ran completely, including both B3 sizes and previously unreached assertions. Three remain **P2-TEST-01 coverage/test adaptation defects**, not confirmed product data defects:

- **AF02 acceptance05:** old badge now passes, then line239 fills hidden`#itemSearch` after reload on Project without entering Materials. Later PDF/ZIP assertions **NOT REACHED**.
- **AF04 acceptance07:** badge and genuine409/stop-retry checks pass; after stopping the service, line313 fills hidden supplier code`CP-OFFLINE` on the Materials page. Remaining offline/restart/manual-save assertions **NOT REACHED**. Targeted timeout also caused ZIP central-directory failure during trace finalization; no trace attachment for that case. Screenshots/context/server logs preserved. Full-run original trace exists and proves the last waiting selector; finalizer failure root cause is unknown.
- **AF06 acceptance13:** initial project check passes; after reload line486 still expects the intentionally permanent project details closed. Later first-row assertion **NOT REACHED**.

[Classification and raw errors](automation/AF-remediation-classification.json), [read-only original trace action](AF04-waiting-action-readonly.json), per-phase failures and [all cases](automation-cases.csv). Independent business success never rewrites the original FAILs.

### Three additional full-suite failures

These are outside the old15 and were not erased: UX pending-only line171 expects11pending but has12; UX manual-only line203 expects191/3manual but has63/1; B3 tied-lowest line196 expects1manual but has0. Original whole-cell center clicks now land on inline detail disclosures, visible expanded in original screenshots/traces. The independent explicit .quotePrice button path passed pending, ties, higher reasons, manual1979 and persistence; these are classified as test interaction/coverage mismatches, not confirmed arithmetic defects. Later original assertions remain NOT REACHED. Together with AF02/04/06 there are **six failed interaction/assertion tests**, plus the confirmed densityFAIL. [Classification](automation/full-run-extra-classification.json), [original trace actions](full-run-extra-three-readonly.json). No original test was fixed or rerun.

## Confirmed P3-UX09-01 remains

Real ordinary comparison row height is **44.4375px**, above the new exact≤44 assertion; improved from58–62px but not rounded to PASS. More significantly, at1366×768, top scroll, first actual quotation row is at **y843.96875**, below the first screen. Reproduce with fresh12-line/3supplier fixtures and real confirmed quotes; open Comparison and scroll top. [Screenshot](attempt-03/evidence/UX09-1366-real-priced-first-screen.png), [DOM measurements](attempt-03/evidence/UX09-independent-before-awards.json).

Price and detail centers align exactly; detail disclosure does not silently award, explicit price button selection remains correct. Original UX09 stops at height before its first-screen/alignment assertions; independent actual-data checks separately record first-screenFAIL/alignmentPASS. Buyer impact: scrolling is required before reaching the central quote matrix. ChatGPT should review the space above the matrix and density while preserving fields and controls. No confirmed P1/P2 product data/safety defect observed; untested/unknown does not prove absence.

## Full original automation

| Command | Actual result | Evidence |
|---|---|---|
| `python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'` |44PASS, exit0|[stderr](automation/phase2/python-backend/stderr.log)|
| `npm ci` |exit0 with writable task cache|[command](automation/phase2/npm-ci/command.json)|
| `npm test` |10PASS, exit0|[stdout](automation/phase2/node-business/stdout.log)|
| `npm run test:e2e` |49PASS/7FAIL,56executed,exit1,0skips/retries|[stdout](automation/phase2/chromium-e2e/stdout.log)|

Exact commands/times/durations/exit codes retained. npm ci waited for independent attempt02 to stop before replacing modules; fresh attempt03 started after install. Targeted duplicates are not added to full totals. Failed original tests were never edited or selectively retried to obtain PASS.

## Independent buyer UAT

[Itemized bilingual CSV](results.csv). UX01–08 freshly verified: truthful single save state and technical details, meaningful project names/stable IDs, unique navigation, first permanent Project page, separate administration/guards, compact item/drawing/allocation lists and real52-row paging. UX09FAIL as above.

Fresh12material lines include same-code distinct-spec identities;3suppliers;3valid multi-page PDFs. Matching1/2/0 candidates, safe preview/manual confirmation, real PDF viewer/original bytes. A R1V1→R1V2→R2V1,5confirmed submissions/50historical lines, explicit9-line carry, immutable prior versions, applicable tier118/2.25. Allocation is additive/deduplicated in both views, relation removal preserves others; actual52-row preview50+2, final list/paging/filter selection preserved.

Pending10+2;75/75tie accepts either;82vs20requires a real higher-price reason, cancel/blank does not commit; absent/cannot-supply quotes are not0. Manual3items **1979.00**, theoretical **6940.00**, suggested mixed **7064.00** remain distinct. Own-scopeA6420/B7185/C990, common10itemsA6420/B6665. Actual ZIP/CSV/XLSX exports passed46 independent content/CRC/quantity/math/supplier-separation/PDF-byte checks.

Second52-line RFQ isolated; switching/F5/real service restart preserve every row/history/PDF. Held realPUT does not change SQLite or falsely show saved across3sizes; actualACK200 persists; canceled reread retains draft; genuine stale-tab409 preserves committed winner and stale in-memory unsaved name, F5 reads winning state.

## S4 valid ZIP_STORED tampering gap genuinely closed

Actual UI downloads current full ZIP;11integrity checks validateCRC,manifest DB SHA,SQLite integrity,all4tables/allrows and3PDF hashes; source unchanged. [Tamper preflight](attempt-03/evidence/S4-tamper-preflight.json): every entrySTORED, names/order and manifest bytes unchanged; exactly1PDF byte`Remediation795`R→T changed, same length, remainingPDF structure intact (post-run read-only pdfinfo exit0,2pages; raw output archived), correct rebuiltZIPCRC, all other contents identical. Expected manifestPDFSHA stays original while actualPDFSHA differs. This is **not DEFLATED / UNSUPPORTED_ARCHIVE rejection**.

Actual browser restore into fresh empty target returns400 and visible **RESTORE_PDF_HASH_MISMATCH**. Supported NodeHTTP capture independently submits the identical bytes and records real400 body`error=RESTORE_REJECTED`, `message=RESTORE_PDF_HASH_MISMATCH`. [Audit](attempt-03/evidence/S4-audited-backend-rejection.json) includes timestamps/requesthash/headers/rawbody/UI feedback. No PageResponse.json/CDP cache-body access.

Before/after both refusals: all semantic rows/PDFs, persistent file byte hashes and directory lists unchanged; no published/staging workspaces/assets. SQLiteWAL/SHM are separately recorded volatile runtime files, not misrepresented as byte-stable. **Same target positive control** then restores original valid archive200, matching bothRFQs/allhistory/PDF/manual1979. NonemptyUI refusal plus realHTTP409`RESTORE_TARGET_NOT_EMPTY` leaves complete restored state unchanged. UX05 andCORE09D only now PASS for this newSHA; historicalBLOCKED stays untouched.

## Driver records and limits

Both allowed corrections retained; no third correction. Attempt01 whole-cell center hit new detail disclosure instead of price; exact`.quotePrice` target fixed with all business assertions retained, fresh empty attempt02. Attempt02 export validator used stale attempt03 path and failed before content checks; explicit actualroot argument fixed with all46assertions retained. Copy-only validator preflight is not counted as UAT; new empty attempt03 reran complete flows and ended without a new error. [Raw error register](raw-error-register.json), original failed traces/screenshots, method snapshots and diffs retained.

Twenty-one page layouts (7pages×3sizes) match document/screen width; real pending/conflict/details controls and keyboard evidence retained. [1024](attempt-03/evidence/UX-1024-quotes.png), [1366](attempt-03/evidence/UX-1366-quotes.png), [1600](attempt-03/evidence/UX-1600-quotes.png). All available original runner/HTML report bytes losslessly archived and hash-revalidated; phase1AF04 missing trace is explicitly disclosed. [Extraction](README-raw-evidence.md), [SHA256SUMS](SHA256SUMS).

**NOT TESTED:** nativeWindows Python3.13,Node22,PowerShell/BAT/local-launch safety3groups; no nativeWindows. Old synthetic migration excluded byD024, desktopExcel/fullrealERP semantics, other browsers/exhaustive load/fault/accessibility not covered. Unreached original assertions remain unreached despite related independent PASS.

ChatGPT should resolve the6remaining original-test interaction/assertion adaptations and P3comparison first-screen/density, review evidence, then request exact-new-SHA retest. Current result is **not a completed development acceptance/merge gate**, officialCI success, Windows equivalence or release approval.
