# PR #46 independent business continuation (TEST-ONLY)

Conclusion: **NOT READY**. All 14 authorized independent groups actually ran: **12 PASS / 2 FAIL / 0 BLOCKED / 0 NOT TESTED**. Three additional native Windows groups remain **NOT TESTED**. The failures are reproducible design/usability gaps. No confirmed corruption, supplier leakage or unsafe overwrite restore was found. Passing calculations and persistence does not mean whole-product acceptance.

## 1. Version, authorization and environment

- The sole product SHA was **`c2737f0221a7b529114da2df363e062e75c7544c`**, PR #46 / `feat/20261022-srm-ui-ux-structural`, checked at start and finish. The actual application ran from detached `/tmp/srm46-product`, not a concept prototype or synthetic merge.
- [Continuation authorization](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6337193999). Current M1 AGENTS, PROJECT_STATE, DECISIONS, PR #44 design/matrix, unmerged PR #48 memory proposal, and PR #50 report/methods/both historical driver errors were read. The unmerged memory proposal was not treated as merged authority, and canonical memory was not edited.
- This directory only appends to existing Draft PR #50. Original evidence at `75a06ab23a5e2d93c169651f511ccbedb035e468`, including its 0 PASS / 1 BLOCKED / 13 NOT TESTED independent outcome, is preserved without retroactive changes.
- Previous Python43 + Node10 + Chromium49 = **102 PASS is historical evidence; none was rerun**. This is not GitHub Actions PASS. No Actions/paid hosted runner was used; Linux does not imply Windows acceptance.
- Cloud Linux, Python3.12.14, Node24.19.0, Playwright1.58.2, real Chromium154.0.8037.57. The existing serve.py launched the formal M1 frontend/backend. Three fresh isolated SQLite sources and a separate restore target contained exclusively fictional data and PDFs.
- Actual execution was principally 2026-10-22 09:24–09:37 UTC (17:24–17:37 UTC+8); raw timestamps are UTC. Served HTML matched checkout SHA256: [identity](identity-start.json). Protected branch refs and the original evidence-tree listing matched before/after.

## 2. Method, data and execution boundary

Markup, dynamic buttons, disclosure states and parser readiness were preflighted. The actual label `多个候选·需确认` was used; asynchronous import controls waited for visible/enabled state and real preview rows. Already-open disclosures were not blindly toggled. Real browser operations performed business changes; API/SQLite independently verified outcomes.

Twelve fictional lines included two identical item codes with distinct specifications and immutable RFQ Line IDs. Suppliers A/B each received12 lines; C received only lines1/5. Three real synthetic PDFs produced1/2/0 candidates: unique→line3, ambiguous explicitly→line2, unmatched explicitly→line4. No preview commit; confirmed identities and original bytes were verified.

A R1V1→R1V2→R2V1, B one revision, C manual two-line submission covered actual XLSX/paste/manual input, round-two three-line selection plus nine explicit carries, evidence/terms drafts, immutable confirmed history and quantity-applicable tiers. Five confirmed submissions contained50 historical quote lines. No-quote/cannot-supply was never zero.

Two driver-only corrections were recorded under this new authorization, preserving originals and using fresh isolated restarts/retests. No product, existing tests, CI, development branch, main or canonical memory changes occurred. There was no third driver error. The noncritical presentation findings did not establish data/security harm, so independent safe checks continued without bypassing a critical product failure.

## 3. Per-group results

| ID | Result | Actual evidence-backed outcome |
|---|---|---|
| Q01 | PASS | Real round-two XLSX three-line import plus nine explicit carries;12 confirmed identities correct |
| Q02 | PASS | Uncommitted import/carry/draft refresh guards retain work without premature DB changes; eventual save ACK matches actual server/SQLite |
| Q03 | PASS | Same-round V1/V2 differences and immutable confirmed rounds; revision changes do not overwrite history |
| Q04 | PASS | Compact7→full12→compact7 columns and real details; view changes leave SQLite unchanged |
| C01 | PASS | Genuine pending-only10+2, original L11/L12 on page2; awarding L12 removes it; final3 manual/9 pending,12 overall |
| C02 | PASS | A cannot supply L4/no quote L6, B valid; L1 qty5 uses118, L7 qty100 uses2.25, no false zero minimum |
| C03 | PASS | A/B75 tied on L5, B accepted without higher-price reason; disclosures do not award, tie pending clears |
| C04 | PASS | B82 vs A20 on L2: cancel/blank blocked; actual justification persists through refresh/restart/restore |
| C05 | FAIL | Own/shared/theoretical amounts and actual CSV/XLSX numerically PASS; separate manual-only1979 total missing (P2 UX-01) |
| W01 | PASS | Two RFQs, F5, service restart, real save ACK, all DB/history/PDF identities retained; duplicate status is V01 |
| W02 | PASS | PDF1/2/0 candidate counts, explicit correct links, no preconfirmation commit, exact names/bytes/SQLite identities |
| W03 | PASS | Individual/all supplier ZIPs: A/B12 rows+3PDFs, C2 rows/0PDF; blank requested prices, no internal JSON or other supplier leakage |
| W04 | PASS | Full S4 integrity and actual empty-target200 restore; nonempty UI refusal plus HTTP409 without any data/byte changes |
| V01 | FAIL | Three-size geometry/navigation/keyboard/scroll PASS; duplicated technical save mirror violates concise authoritative status design (P3 UX-02) |

[results.csv](results.csv) contains the complete machine-readable mapping. Native Windows Python3.13, Node, and PowerShell/batch pilot launch groups are separately **NOT TESTED** because no actual Windows runtime was available.

## 4. Confirmed findings

### P2 UX-01: no separate manually confirmed award amount (C05, business presentation/usability)

Page: Comparison & Award → Amount Analysis. PR #44 design §5.1 explicitly requires separately named theoretical, common-scope and manually confirmed totals; pending items must not masquerade as awards.

Reproduce using the fixture: award L12 to A at120×12, L5 to B at75×5, L2 to B at82×2 with the fictional higher-price reason. Open analysis. Three manual lines total **1440+375+164=1979**, with nine lines still pending.

Expected: a distinct “3 manually confirmed / ¥1979” aggregate. Actual: theoretical **¥6940** and **“current suggested/selected combination ¥7064 (12 lines, including automatic suggestions)”**, with no manual-only1979 total. The7064 number is correctly calculated and honestly labeled; this is not algorithm corruption. Buyers cannot directly read committed spend independently of suggestions.

Evidence: [actual line amounts and analysis text](manual-amount-proof.json), [native analysis screenshot](attempt-02/evidence/OBS-manual-amount-not-separated.png), [1600 analysis](attempt-03/evidence/V01-1600-comparison-analysis.png). Suggested ChatGPT fix: separate manual-only count/amount excluding pending-review decisions, preserving correctly scoped suggestion totals. No implementation was changed here.

### P3 UX-02: old technical save status duplicates the new concise status (V01, UI/usability)

Pages: quote intake/comparison header, visible across all three sizes. PR #44 UX-W01/UX-W02 requires one readable authoritative context and technical versions/times on demand.

Reproduce after an actual successful save, with technical details closed: open quote intake/comparison. Expected one concise saved state; technical details inside disclosure. Actual: alongside the new “已保存”, old `#srmV2LiveStatus` still mirrors a complete technical message such as “自动保存：已同步第10版；无待保存修改”. Although canonical diagnostics nodes moved under details, this mirror remains in the header and adds duplication/noise.

Evidence: [1366 native screenshot](attempt-03/evidence/V01-1366-quotes.png), [1024 native screenshot](attempt-03/evidence/V01-1024-quotes.png). Actual save acknowledgement passed; this is not a false-saved/data-loss claim. Suggested fix: one authoritative concise state, with mirrored version/time diagnostics only in disclosure.

No confirmed P0/P1, pricing corruption, unsafe overwrite restore or supplier leakage was found. P2 here is a design acceptance gap, not a critical data-security failure.

## 5. Real amounts, downloads and restore

Own scopes: A10 lines **6420**, B12 **7185**, C2 **990**, never directly ranked across incompatible scopes. A/B shared10 lines: A **6420**, B **6665**. Actual CSV verified all10 IDs/quantities/applicable prices/line sums. Theoretical12-line minimum **6940**, mixed suggested/selected12-line **7064**, actual manual3-line **1979**. Actual comparison XLSX verified12 lines, page-two selected price120, higher price82 and justification. [46 file checks](attempt-02/evidence/export-checks.json) passed; those are not extra UAT-group counts.

[11 S4 archive checks](attempt-03/evidence/s4-checks.json) passed: CRC, manifest DB SHA256, SQLite integrity_check=ok, every row/field of app_state/workspaces/workspace_versions/assets, and every original PDF SHA256. Actual empty-target UI restore returned200 and reloaded; both RFQs, histories, three manual decisions and originals matched. Nonempty UI clearly refused without a new restore POST. Additional same-origin HTTP check returned [409 RESTORE_TARGET_NOT_EMPTY](attempt-03/evidence/nonempty-restore-response.json); all DB/history/PDF bytes remained unchanged. Attempt03 source was primed through an actual UI restore of attempt02's fictional ZIP as setup only; a newly downloaded S4 was then verified/restored into another truly empty target.

## 6. Three-size UI

At1024×768,1366×768,1600×900 the buyer actually navigated five pages (items/allocation/intake/comparison/data-and-backup),15 major layouts, compact/full/details, matrix horizontal scroll, pending filter and S4 controls. No document-level horizontal overflow. At1024 the table requires local scrolling; sticky RFQ identity, detail/action access worked. Keyboard Enter navigation/visible focus passed; all business/history/PDF data stayed unchanged.

| Size | Native intake | Native comparison | Derived review contact sheet |
|---|---|---|---|
| 1024×768 | [Image](attempt-03/evidence/V01-1024-quote-compact.png) | [Image](attempt-03/evidence/V01-1024-quotes.png) | [Overview](visual-overview-1024.png) |
| 1366×768 | [Image](attempt-03/evidence/V01-1366-quote-compact.png) | [Image](attempt-03/evidence/V01-1366-quotes.png) | [Overview](visual-overview-1366.png) |
| 1600×900 | [Image](attempt-03/evidence/V01-1600-quote-compact.png) | [Image](attempt-03/evidence/V01-1600-quotes.png) | [Overview](visual-overview-1600.png) |

[visual-metrics.json](visual-metrics.json) records actual measurements: two-line RFQ identity rows about54.69px, main text13px. The40–44px design target permits wrapping exceptions; height alone is not reported as another defect. This is not pixel-perfect/all-accessibility certification. Duplicate technical status still makes V01 design acceptance FAIL.

## 7. Two new driver errors and corrective retests

1. CONT-DRIVER-01: initial async waitForFunction save helper returned before normal idle autosave, then compared uncommitted SQLite with a memory draft. Refresh protection passed and no corresponding save request preceded the assertion: no product save failure established. Preserve [raw error](attempt-01/evidence/raw-first-error.json), [installed polling implementation](attempt-01/evidence/playwright-predicate-implementation.txt), [trace](attempt-01/evidence/trace-first-attempt.zip). Driver-only correction used Node expect.poll for real snapshot/API/UI ACK, retained original deep equality, and passed from a fresh attempt02 directory. [Record](correction-01.json), [diff](correction-01.diff).
2. CONT-DRIVER-02: S4 validator compared physical `assets/xx/hash.pdf` keys with intentionally flattened archive `assets/hash.pdf`. All three hashes, four tables, CRC, manifest and integrity already matched. It was a validator path-key error, not lost PDFs. Preserve [raw checks](attempt-02/evidence/s4-checks.json), stderr and [trace](attempt-02/evidence/trace-first-attempt.zip). Normalize basename according to existing product archive contract while retaining scope/count/hash/manifest/full DB equality. Fresh attempt03 source and empty destination retested affected W04:11 checks PASS, then remaining V01 ran. [Record](correction-02.json), [diff](correction-02.diff).

Both corrections affect only new independent drivers/validators, not existing tests. Raw browser checks per attempt were31PASS/1FAIL,89PASS,56PASS; those are not suite or UAT-group totals. C05/V01 raw PASS markers cover numerical/geometry subchecks only; final independent design review remains FAIL, without rewriting logs. Frozen prefixes W04=drawings and W02=save status are mapped to final authorized W02=drawings/W01=persistence/W04-S4=backup; see [raw-error-register.json](raw-error-register.json).

## 8. Evidence and next steps

This directory preserves57 original operation/error screenshots,3 original traces,3 derived contact sheets, every attempt's browser/server logs, raw failures, actual downloaded ZIP/CSV/XLSX, fictional fixtures and frozen driver versions. `methods-final` archives the final independent method; per-attempt copies retain actual earlier sources, including earlier validator paths. Open traces with Playwright trace viewer. Verify artifacts using `sha256sum -c SHA256SUMS`.

Still not tested: three native Windows groups, exhaustive disk/network failure matrix, complete accessibility/pixel fidelity and official Actions execution. No inferred passes fill those gaps. ChatGPT should review/fix the P2/P3 design gaps, followed by affected-scope retests. Accurate-final-SHA CI and owner approval remain required for release. PR #46/#50 remain Draft/unmerged; this report does not declare whole-product acceptance.
