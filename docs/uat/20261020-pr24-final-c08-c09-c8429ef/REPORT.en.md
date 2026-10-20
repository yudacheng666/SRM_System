# PR24 final independent C08/C09 integration acceptance

**C08 PASS; C09 PASS. In-scope cases:11 PASS /0 FAIL /0 NOT TESTED. This completes the remaining assigned scope; it does not certify the entire product. ChatGPT review is still required. No merge.**

Sole product SHA:`c8429ef51731da570c7a556d7cdce89e7123e739`. Actual browser session2026-10-20 12:21:15–12:21:59 UTC. PR24 HEAD matched at start and finish and remained Draft. Authority:[consolidated task6290574455](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6290574455). [Full Chinese report/screenshots](REPORT.zh-CN.md).

## Identity, isolation and preflight

Formal M1 Lite HTML and backend `server.main()`, using the unchanged existing serve.py wrapper solely for a local port and suppressing OS browser auto-open. This was not PR23's concept UI or a synthesized merge. HTTP bytes matched checkout; tree `33688a7d740816f3082606c87e00ee367ff575ea`, indexSHA256 `bc4288bf60f8971f8549dac3bdb4015617a23eeb4ce383ed103c66908f00cb6b`. [Identity](evidence/product-identity.json).

Real Chromium154.0.8037.57, Playwright1.58.2, cloud Linux. New worktree `/tmp/srm-final24`; empty isolated SQLite roots `/tmp/final24/data` and `/tmp/final24/restore`, ports9480/9481. No user business data accessed. Minimal guarded official-API SETUP ONLY:1 fictional RFQ,4 lines,3 suppliers,4 confirmed submissions/15 quote-history lines,3 manual awards,3 PDFs;2 persisted revision-history rows and3 asset records. Seed is the prior same-SHA synthetic fixture; setup is not renewed C03–C07 acceptance. All restore/UI acceptance used the actual browser. Database comparisons were read-only.

Both CI workflows and all four Windows/Linux jobs were successful, verified rather than rerun:[UI39394554901](https://github.com/yudacheng666/SRM_System/actions/runs/39394554901),[S3/S4 39394554892](https://github.com/yudacheng666/SRM_System/actions/runs/39394554892). [GitHub snapshots](evidence/github-verification.json).

Reviewed automatic restore reload, guards, actual dropdown options, native confirmations, every drawer and report toggle before freezing independent scripts. All10 frozen files remained hash-identical. No unexpected driver error, no correction and no rerun;0 of1 allowed correction used. Old PR40–42 evidence remains unchanged, including PR42's stale-CDP-body error; this new real restore is a separate successful execution.

## Cases and evidence

| Case | Result | Actual checks | Evidence |
|---|---|---|---|
| C08-01 | PASS | S4 actual ZIP download and all manifest/SQLite/PDF bytes | [raw](evidence/C08-file-checks.json) |
| C08-02 | PASS | Empty actual UI restore POST200 followed by product reload | [raw](evidence/C08-restored.json) |
| C08-03 | PASS | Reloaded buyer decisions, locked quote histories and all database rows | [raw](evidence/C08-restored-history.json) |
| C08-04 | PASS | Nonempty UI refuses overwrite, sends no restore POST, data unchanged | [raw](evidence/C08-after-UI-refusal.json) |
| C08-05 | PASS | Nonempty backend actual409 RESTORE_TARGET_NOT_EMPTY, all data unchanged | [raw](evidence/C08-after-backend409.json) |
| C09-01 | PASS | 1024x768 five pages, four drawers, tables, controls, keyboard/search | [raw](evidence/C09-1024-overview.png) |
| C09-02 | PASS | 1366x768 five pages, four drawers, tables, controls, keyboard/search | [raw](evidence/C09-1366-overview.png) |
| C09-03 | PASS | 1600x900 five pages, four drawers, tables, controls, keyboard/search | [raw](evidence/C09-1600-overview.png) |
| C09-04 | PASS | P2 first supplier actual RFQ ZIP/Excel/PDF contents smoke | [raw](evidence/C06-supplier-smoke-checks.json) |
| C09-05 | PASS | P3 pure supplier navigation then new-project confirmation dismissed | [raw](evidence/C09-P3-clean-navigation-dismissed.png) |
| C09-06 | PASS | Full data/history/assets/PDF unchanged after all UI navigation | [raw](evidence/C09-final-history.json) |

11 business/UI cases differ from159 passing browser checks,10 archive checks and8 supplier-file checks. Assertion counts are not extra business coverage. [Case CSV](results.csv).

## C08 business and restore safety:PASS

Exactly one actual UI S4 download:[original ZIP](downloads/C08-single-full-backup.zip). Checked ZIP CRC, manifest DB SHA256, SQLite integrity=ok, every field of all workspaces/history/assets rows and every physical PDF against source and manifest. Source business state unchanged by download.

Actual empty-target UI restore returned POST200 and the product reloaded. The driver intentionally never read the old Playwright Response body after navigation. Reloaded RFQ snapshot matched source exactly; full SQLite current/history/assets and PDF bytes matched. Restored UI showed3 manual awards,0 pending,0 review; A's confirmed round1V1,round1V2,round2V1 were individually opened, retained effective prices10/9/7 and locking, with carried line price20. Full-row equality also covers stored terms, evidence sources and award fields. [Before](evidence/SETUP-baseline-history.json),[restored](evidence/C08-restored-history.json),[trace](evidence/independent-browser-trace.zip).

Nonempty target UI refused and sent no new restore POST; reason appeared beside the button. A separate real HTTP POST to the same isolated fictional nonempty target then returned409, JSON `error=RESTORE_REJECTED`, `message=RESTORE_TARGET_NOT_EMPTY`. [Raw409](evidence/C08-backend-nonempty-response.json). Current/history/asset fields and all PDFs remained identical after both refusals. Expected409 is a passed safety check, not a product failure.

## C09 visual and interaction:PASS within scope

At1024×768,1366×768,1600×900, visited five critical pages and four drawers; checked headings, selected navigation, identity/save state, document overflow, locally scrollable wide tables, reachable controls, filter+Enter+clear, keyboard sidebar Enter and visible2px focus outline. Confirmed quotation action was disabled with an adjacent visible lock explanation. All15 critical page layouts had no document horizontal overflow; screenshots were also visually inspected. [Visual observations](visual-review.json).

1024 uses an icon sidebar and requires local horizontal table scrolling plus vertical access to lower controls. Expanded management drawers occupy one of three columns with adjacent blank columns; widening the active drawer is a possible future usability improvement, with no blocked action or newly confirmed severity defect demonstrated. This is not full PR23 pixel-parity certification.

One first supplier-A package download smoke validated ZIP/Excel line identities, quantities10/25/4/6, blank supplier-price cells, absence of competitors/internal awards and exact3PDF bytes. Pure supplier-view navigation plus selecting B led to the normal saved-data new-project confirmation, without a false unsaved warning; confirmation was explicitly dismissed, no new RFQ created. Entire database/history/assets/PDF set remained identical after UI operations.

| Page/control | 1024×768 | 1366×768 | 1600×900 |
|---|---|---|---|
| 物料 / Items | [1024](evidence/C09-1024-items.png) | [1366](evidence/C09-1366-items.png) | [1600](evidence/C09-1600-items.png) |
| 分配 / Allocation | [1024](evidence/C09-1024-assign.png) | [1366](evidence/C09-1366-assign.png) | [1600](evidence/C09-1600-assign.png) |
| 报价回收 / Intake | [1024](evidence/C09-1024-quoteImport.png) | [1366](evidence/C09-1366-quoteImport.png) | [1600](evidence/C09-1600-quoteImport.png) |
| 比价 / Comparison | [1024](evidence/C09-1024-quotes.png) | [1366](evidence/C09-1366-quotes.png) | [1600](evidence/C09-1600-quotes.png) |
| 设置 / Settings | [1024](evidence/C09-1024-settings.png) | [1366](evidence/C09-1366-settings.png) | [1600](evidence/C09-1600-settings.png) |
| 数据抽屉 / Data drawer | [1024](evidence/C09-1024-data-drawer.png) | [1366](evidence/C09-1366-data-drawer.png) | [1600](evidence/C09-1600-data-drawer.png) |
| 项目抽屉 / Project drawer | [1024](evidence/C09-1024-project-drawer.png) | [1366](evidence/C09-1366-project-drawer.png) | [1600](evidence/C09-1600-project-drawer.png) |
| 供应商抽屉 / Supplier drawer | [1024](evidence/C09-1024-supplier-drawer.png) | [1366](evidence/C09-1366-supplier-drawer.png) | [1600](evidence/C09-1600-supplier-drawer.png) |
| 图纸抽屉 / Drawing drawer | [1024](evidence/C09-1024-drawing-drawer.png) | [1366](evidence/C09-1366-drawing-drawer.png) | [1600](evidence/C09-1600-drawing-drawer.png) |
| 锁定提示 / Lock hint | [1024](evidence/C09-1024-quote-lock.png) | [1366](evidence/C09-1366-quote-lock.png) | [1600](evidence/C09-1600-quote-lock.png) |

43 original screenshots plus3 derived contact sheets. Originals are preserved. [1024 overview](evidence/C09-1024-overview.png),[1366](evidence/C09-1366-overview.png),[1600](evidence/C09-1600-overview.png).


A read-only post-run evidence audit additionally compared every app_state row in the actual backup DB, final source DB and final restored DB; all matched. [Record](evidence/app-state-audit.json). This is backup-versus-final evidence, not an additional UI rerun or an intermediate snapshot claim.

## Failure classification and limits

New confirmed product P1/P2/P3 defects:0. Unexpected product failures0; driver errors/corrections0; blocking environment incidents0; pageerror0; requestfailed0. Both original console404 entries were retained and correlate with `/favicon.ico` in server logs, with no business API failure. Expected backend409 is separately identified. [Raw error register](raw-error-register.json),[execution summary](evidence/execution-summary.json). No failing sample was discarded.

In-scope mandatory C08/C09 items are complete. **NOT TESTED, outside scope,4 groups:**

1. Native Windows launch/browser/manual operation; successful Windows CI is external evidence only.
2. Full PR23 pixel parity, all keyboard/accessibility paths, every browser/resolution; only critical UI at3 sizes passed.
3. Complete C03–C07 rerun; prior same-SHA acceptance is retained. This run only set up fixtures and newly tested restoration/history/awards plus necessary P2/P3 smoke.
4. Full20/24-download OBS01 stress, corruption/fault injection, interrupted/power-loss restore, concurrent real-save and large-data restoration. This scope used one normal full backup and required refusal checks.

Recommend ChatGPT review combined same-SHA C03–C09 evidence before deciding next-stage use/development-baseline merge. Do not infer whole-product acceptance or RELEASE-READY from this report.

## Raw delivery and permissions

[Browser trace](evidence/independent-browser-trace.zip),[raw browser JSONL](evidence/browser.jsonl),[main server](evidence/server-main.log),[restore server](evidence/server-restore.log),[original downloads](downloads),[fixtures](fixtures),[independent frozen method texts](methods),[hash manifest](SHA256SUMS.txt). Fictional data only. Owned browsers/services stopped; no business files deleted.

Only this new evidence directory is added on `test/20261020-pr24-final-c08-c09`. Product, original tests and CI unchanged; protected remote refs were byte-identical before/after. PR24 remains Draft; no PR merged/closed and no main/development/old-evidence branch changed.
