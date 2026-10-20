# PR #30 independent acceptance — TEST-ONLY

Date: 2026-10-20. Raw timestamps are UTC. **Exact product SHA: `69f660cb2944e278a1e12b4824d8532b0fe6c7c3`.**

## Verdict

**Original OBS-01 trigger: PASS in 24/24 rapid repeat attempts. Procurement and data safety: PASS within the executed scope. Visibility of the blocked-backup explanation: FAIL, one residual P3. Overall PR #30 independent acceptance: FAIL against the explicit visible-feedback requirement.** No new confirmed P0/P1/P2 defect, corruption or incorrect purchasing total was found. This is not permission to merge or certification of the entire product.

The known admin-navigation dirty regression did not recur. This finding is bounded to the observed sequence and timing. A separate conditional feedback problem remains when the project drawer is collapsed and the header is above the viewport. It does not establish that admin still incorrectly dirties the workspace.

## Identity, CI and environment

Read PR30 description/diff/all current comments and PR24 handoff. The old 8d073e80 target in [initial task](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6282227958) was superseded by [version update](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6282392319), then [PR30 final CI handoff](https://github.com/yudacheng666/SRM_System/pull/30#issuecomment-6282605340) and [PR24 handoff](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6282605828).

[Push run #135](https://github.com/yudacheng666/SRM_System/actions/runs/39362505327), at the exact candidate HEAD, passed Windows SQLite/S4 and Linux Chromium. [PR run #136](https://github.com/yudacheng666/SRM_System/actions/runs/39362512675) also passed both jobs, on synthetic merge `55a05aa0287630ec52987cb9994d9ae4946551c9`. These are two triggers of the full S3/S4 workflow, not two different UI Unified workflows. Both Linux logs contain 43 browser passes. Our independent checkout and runtime used the direct candidate, never that merge or PR23's static prototype.

HEAD was unchanged at start and end; PR30 remained open/Draft/unmerged. Independent branch `test/20261020-pr30-obs01-fix-uat` started at the candidate and targets the fix branch. [Runtime identity](evidence/runtime-identity.json) proves the actual HTTP-served index bytes match the tracked candidate index SHA256 `4cc01c4734277eecfc7fd56df05b352eef83e1c028b5bc73461cb484b57d5e5e`. [Before](evidence/protected-refs-before.txt)/[after](evidence/protected-refs-after.txt) protected refs are identical; [GitHub snapshots](evidence/github-initial.json) / [final](evidence/github-final.json) preserve the gate and tasks.

Real Linux Chromium 154.0.8037.57 / Playwright 1.58.2, production M1-Lite with its Python/SQLite backend; new isolated data directories `/tmp/r69/data`, `/tmp/r69/restore`, `/tmp/r69/restore-final`, `/tmp/r69/feedback-data`. All materials, suppliers, quotes and PDFs are fictional. Four owned services were stopped afterward. No existing user data, product, existing tests, CI, development branches or main were edited; no PR was merged/closed.

## Execution and denominators

The full existing suite ran first: **Python 43 PASS, Node 10 PASS, Playwright 43 PASS, no skipped/flaky/unexpected cases**. [Suite results](evidence/existing-suite-results.json), [Python](evidence/existing-python.txt), [Node](evidence/existing-node.txt), [browser text](evidence/existing-playwright.txt), [browser JSON](evidence/existing-playwright-results.json). Independent GUI operations followed, rather than treating these tests as acceptance.

Inputs, imports/previews/confirmations, drawing decisions, quote versions, single/bulk awards, saves and downloads used actual browser controls. Read-only snapshots validated persisted state. O01–O20 had a read-only CDP logpoint whose condition returns false, logging guard state without changing the product or flags; O21–O24 ran with that gate probe disabled. Passive DOM/network observers remained. B01 held one genuine autosave PUT at the browser route layer, then released it unchanged, to avoid pretending a completed save was still in progress.

| Recorded series | Actual result and interpretation |
|---|---|
| O01–O24 | **24/24 downloaded**, 0 unexpected timeout. Each RFQ B→A switch followed by top admin→immediate S4. Delay after RFQ return alternated 0/100/350/650ms; no fixed wait after admin. Trusted admin-to-backup click intervals **252–368.1ms**, below the old 750ms polling interval. Every sample: POST201→GET200→one download event, valid saved ZIP. |
| N01 | Expected protection of a real unsaved edit: **no backup API or file**. The 1.2s download observation expired as expected. Safety PASS; visible explanation FAIL in the collapsed-drawer condition. |
| N02 | Intended in-flight-save control missed its window despite a 3s route delay: actual click was after save, with dirty=false/busy=false. **Legitimate successful download**, not a safety bypass and not an in-flight protection PASS. Two original false assertions remain in the logs. B01 re-executed the target correctly. |
| N03 | Actual autosave had just completed; immediate admin→S4 downloaded successfully. New rows were saved, other RFQ unchanged. |
| F01 / B01 | Two supplemental physical clicks: **both safely blocked, no backup API/download**. F01 is a real unsaved edit, B01 a genuinely pending held PUT with native button disabled. With project drawer open, left-side status is visible; only the header indicator is above the viewport. |

Thus the directed log contains **29 physical clicks: 26 successful downloads + 3 legitimate guarded clicks, 0 unexpected positive-path timeout**. One raw wait expiry is an expected negative-control observation, not a failed positive download. Supplemental controls do not wait for downloads. A separate first full-S4 business-flow download also passed: across the entire session **30 S4 clicks / 27 actual S4 ZIPs**. Do not count blocked clicks as downloaded files.

[29-row CSV](evidence/all-backup-attempts.csv), [raw attempts](evidence/obs-attempts.json), [enriched attempts](evidence/obs-attempts-enriched.json), [supplemental controls](evidence/feedback-controls.json), [summary](evidence/obs-summary.json). Main browser assertions: **194 total, 191 true, 3 false**. One false is the conditional UI defect; two are N02's invalid timing expectations. Raw failures were preserved and classified in [independent-checks](evidence/independent-checks.json); no claim that all independent assertions passed.

## Acceptance groups: 21 PASS / 1 FAIL / 5 NOT TESTED

| ID | Scope and actual outcome | Result |
|---|---|---|
| C01 | Exact HEAD/runtime bytes/CI gate/start and end refs | PASS |
| C02 | Full existing Python/Node/Chromium regression first | PASS |
| C03 | 24 RFQ-return/top-admin/immediate S4 repeats | PASS |
| C04 | Admin did not incorrectly dirty: 20 instrumented repeat entries, four probe-free downloads; 22 actual clean positive entries including N02/N03 | PASS |
| C05 | Real unsaved edit safely blocked, no backup request, later genuinely saved | PASS |
| C06 | Clear currently visible protection reason including collapsed project drawer | **FAIL — P3-S4-01** |
| C07 | Genuine in-flight autosave disabled backup; completed after gate release | PASS |
| C08 | Immediate backup after actual save completion | PASS |
| C09 | All 27 ZIP CRC/manifest hashes/SQLite integrity/full current and historical rows/PDF bytes | PASS |
| C10 | First and latest S4 restore into two empty directories; current/history/PDF exact | PASS |
| C11 | Both nonempty restored targets refused overwrite without changing data | PASS |
| C12 | Single tied-lowest selection A/B20 including keyboard, later A/C20, without exception reason | PASS |
| C13 | Bulk tied-lowest needs no exception; genuine higher rows do; cancel unchanged | PASS |
| C14 | Real8/12 non-lowest: whitespace rejected, accepted reason persists/exports | PASS |
| C15 | Three manual selections clear pending/tie review; unquoted not zero | PASS |
| C16 | New C20 preserves chosen B20; B21 reopens review, survives F5, choosing C20 clears it | PASS |
| C17 | Same-round A10→9 revision/diff, draft does not replace confirmed price, locked V1 retained | PASS |
| C18 | Save/F5/cross-RFQ/real server process restart preserve data and decisions | PASS |
| C19 | Real Excel materials; unmatched/multiple drawing preview side-effect free, unique confirm, native PDF after restart | PASS |
| C20 | Actual CSV/XLSX/supplier ZIP totals, formulas, scope, blank quotes and anonymized content | PASS |
| C21 | Invalid import and canceled valid preview leave SQLite revisions/line IDs/content unchanged | PASS |
| C22 | Simple additive bidirectional assignment, supplier context isolation, three-resolution V01–V04/original disabled-button P3 checks | PASS |
| C23 | Native Windows manual install/path/browser use | NOT TESTED |
| C24 | Desktop Excel recalculation/printing/paper layout | NOT TESTED |
| C25 | Production multiuser conflicts, power/disk failures, long concurrency, offline-service guards | NOT TESTED |
| C26 | Full renewed pixel comparison against PR23 design | NOT TESTED |
| C27 | New exhaustive large61-row independent matrix and every quote-entry method | NOT TESTED |

These are 27 grouped acceptance targets, separate from suite/assertion/attempt denominators. Current product screenshots exist at three widths; no fresh paired PR23 references are claimed. Windows CI success is distinct from a Windows manual test. Existing suite coverage does not convert unexecuted independent exploration into PASS.

## Confirmed issue P3-S4-01

**Category:** UI/interaction feedback. **Page:** Data & backup,1366×768. **Impact:** in the collapsed project-drawer/scrolled state, a previously enabled backup button turns disabled without a file or currently visible explanation; a buyer may believe backup is broken. Data protection still works; no corruption or purchasing error was observed.

Reproduce N01 using the main synthetic RFQ:
1. Save the RFQ; collapse Project operations, leave backup/report tools open.
2. Add fictional `PR30-DIRTY-N01`, quantity2, confirm the real material preview; before autosave, click top Data & backup and scroll normally to S4.
3. Physically click the still-enabled button. Read-only entry evidence: s4Available=true,busy=false,dirty=true,blocked=false,disabled=false.
4. No backup request/file is produced; disabled becomes true. The DOM receives the correct blocked-backup explanation.
5. The header live indicator is outside the viewport, rect top=-151.65625,bottom=-124.265625, and the project status fields are inside the collapsed drawer. [Actual N01 viewport](evidence/OBS-N01-after.png) shows no pause explanation.

Expected: the reason and next action should be visible at the backup control, in a reliable visible notification, or through revealing the status area. Actual: the user needs to scroll/reopen another area to see the generated message. This is a conditional visible-feedback failure, not proof that no message exists in the DOM.

Important control: F01 with the project drawer **open** does show the left-side red explanation [before scroll](evidence/SUP-F01-before-scroll.png), and the header becomes visible [after scroll](evidence/SUP-F01-after-scroll.png). B01 similarly shows saving text on the left. A header outside the viewport alone is not sufficient to label those controls failed; N01's collapsed drawer plus screenshot establishes the specific failure.

Suggested developer direction: keep guard explanations near the backup button or ensure they remain visible across scrolling/collapse. No product fix was attempted. The observed layout condition is established; untested resolutions and guard branches are not inferred to fail.

## Procurement, integrity and evidence

Four original materials include same-code different-spec lines M16/220 qty10 and M20/350 qty25, an unquoted/cannot-supply line qty4, and a higher-price reason line qty6. A/B20 are tied; A first-line revision10→9 and high line8/12 exercise real lower/higher decisions. New C20 does not falsely invalidate B20; B's later21 reopens review while the original V1 remains intact. Final chosen A/C/B, exception reason only for the high row, manual=3,pending=0,tie review=0,new-quote review=0. Two additional safety rows are unassigned and do not enter these comparison totals.

Independently calculated comparable totals: original A/B **638/692**, after B update **638/717**, theoretical minimum638, manual selection662. Actual CSV validates quantity×price, BOM and RFQ line IDs; real workbooks validate selection/reasons/blank unquoted values/ROUND and SUMIF formulas/history. Selected A/B group history excludes C, while global manual choice may correctly be C. Supplier ZIPs retain the PDF, blank price cells and omit competitors/private ERP notes. [All37 file checks](evidence/business-file-validation.json) pass.

Each S4 ZIP was CRC-tested, manifest database/PDF hashes checked, SQLite opened read-only with integrity_check=ok, **all columns and rows of workspaces and workspace_versions** compared against the correct phase. O repeats match pre-repeat history, N02/N03 match final saved history, first full-S4 matches its earlier history. Latest restore also matches full current/historical rows and PDF bytes. [292-check validator](evidence/obs-file-validation.json) contains291 true and the same N01 visibility false; all file/database integrity checks passed. [Raw execution](evidence/obs-validation-execution.txt) retained.

Use [screenshot index](SCREENSHOTS.md), [main trace](evidence/independent-v31-browser-trace.zip), [control trace](evidence/feedback-control-trace.zip), [browser](evidence/browser.jsonl), [OBS log](evidence/obs-browser.jsonl), [control log](evidence/feedback-browser.jsonl), [server](evidence/server.log), [restore1](evidence/restore-server.log), [restore2](evidence/final-restore-server.log), [control server](evidence/feedback-server.log). Three origin-start console404s correspond to favicon requests; no pageerror or driver-error was recorded. All failures/successes retained. Trace archives open in Playwright trace viewer; viewport PNGs are separate. [Method source text](method) and [SHA256 manifest](SHA256SUMS.txt) support review without modifying existing tests.

Remaining risk: finite cloud single-user timing samples cannot eliminate every race; P3-S4-01 leaves the clear-feedback requirement unmet. No native Windows test was required/performed. Actual successful retries or CI do not establish total product acceptance. Developer follow-up and a focused visibility retest are recommended; this report does not approve a merge.
