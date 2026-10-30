# Updated TEST-ONLY handoff — WIN-02 use existing **native Node.js 24**, no npm prerequisite (D-033)

**Status: assigned on GitHub, NOT YET EXECUTED.** This is the **latest user-approved override of the Node22/npm requirement** in the [prior WIN-02/03 task](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6514418888). WIN-01 Windows Python3.15 **44/44 PASS** is already done and should NOT be rerun. Product SHA is unchanged.

## Exact scope and source identity

- Repository `yudacheng666/SRM_System`; product existing Draft PR #46. **Frozen exact product + original-test SHA `2aaa478c8f1966e41b9372d9d989c383dbaa1972`**. Read [D-033 / PR #48](https://github.com/yudacheng666/SRM_System/pull/48). Do not use default/main/old M1/synthetic-merge source.
- The original [`package.json`](https://github.com/yudacheng666/SRM_System/blob/2aaa478c8f1966e41b9372d9d989c383dbaa1972/package.json) has `"test": "node --test prototype/m1-lite/tests/*.test.cjs"`. The two original files are `autosave_rules.test.cjs` and `supplier_package.test.cjs`, using built-in `node:test` and native stdlib. **Use available Node24.x** on genuine **native Windows 10/11**; do not install/downgrade to Node22. **Missing npm alone is NOT a blocker to this Node-only business unit suite.** Do not claim `npm ci`/dependency install or full browser Playwright was validated.
- Verify genuine OS, `node --version`, `where.exe node`, actual `process.execPath`, accurate 146-file source identity including the original two Node tests, and isolate synthetic temp/test data away from actual user files.

## Run full ORIGINAL Node business suite, not new look-alike assertions

From complete exact repository root, use the existing native Node executable to run **both original test files** directly so no Windows shell wildcard expansion is needed:

```text
node --test prototype/m1-lite/tests/autosave_rules.test.cjs prototype/m1-lite/tests/supplier_package.test.cjs
```

This invokes the same two original files as the existing `npm test` script without requiring the npm wrapper. **WIN-02 may be called PASS iff the real native Windows Node24 run completes all 10 original cases as 10 PASS /0 FAIL /0 SKIP with exit code 0**, no modified product/old tests/assertions/timeouts, and raw proof for exact source SHA, full output, real exit code, environment, integrity and sanitized test evidence. If node24 runtime itself absent/unusable, report BLOCKED/NOT TESTED, not a fictional PASS. No installation without explicit user approval.

## WIN-03 remains independent

Current native Windows WIN-03 status is **BLOCKED**: prior actual BAT cross-dir, SQLite/HTTP, S4 empty-restore and nonempty409 API checks were PASS, but **real user-visible purchaser browser workflow** (RFQ, material/PDF, supplier ZIP, quotations, F5/offline save and backup/restore) has NOT been completed in Windows browser. If native Windows browser control/real Playwright executable actually becomes available, execute **only** remaining genuine UI scope with isolated wholly synthetic `SRM_DATA_DIR`, preserve trace and screenshots. Do not represent API calls or Linux Chromium as native Windows GUI. If no real native browser control, keep WIN-03 BLOCKED and do not repeatedly retry a broken connector.

## Reporting / unchanged safety gates

- Append a **new independently versioned evidence directory** inside existing Draft PR #50; capture exact product SHA before/after, full command/exit, actual environment Node version/path, original 10-case stdout/stderr, PASS/FAIL/BLOCKED/NOT TESTED; preserve previous evidence and PR #50 history. Comment results on PR #46.
- Codex is **TEST-ONLY**: no product/original-test/CI modifications; no Actions/paid runners; no merge/close PR; no main/M1 writes or local user-data access. WIN-01 PASS is immutable, old Node22 NOT TESTED remains historical, official Actions workflow still uses its existing matrix. New user-approved D-033 changes **only the temporary Windows WIN-02 acceptance**, not the CI workflow.
- M1 final merge remains **NOT READY** until WIN-02 and WIN-03 both genuinely PASS and ChatGPT checks final SHA/target M1/PR #45/branch protection and user expressly authorizes any merge.

GitHub comment is an instruction, not an execution report.
