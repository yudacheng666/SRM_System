## Codex Cloud — TEST-ONLY independent review task / 独立验收任务

**Target candidate HEAD:** `67b1a7625db229e36ef4054127539e830d12079f`  
**Current required Actions:** [UI V2 Unified Acceptance #36](https://github.com/yudacheng666/SRM_System/actions/runs/39228203050) · [S3/S4 Regression #123](https://github.com/yudacheng666/SRM_System/actions/runs/39228203069)  
**Start only after both Actions finish successfully on this exact HEAD.** Do not edit source code, tests, workflows or this PR.

1. Confirm both Actions' final conclusions are success and the tested HEAD matches exactly. Record the run URLs and results.
2. Use a fresh cloud Chromium session and isolated temporary `SRM_DATA_DIR`. Start the real local Python/SQLite backend from this branch, not the static concept prototype.
3. Review `1024×768`, `1366×768`, and `1600×900` screenshots for visual hierarchy, typography, spacing, table readability, clipped controls, document overflow, sidebar overlap and navigation discoverability.
4. Click through items/drawings → supplier allocation → quote intake/revision → comparison/award → settings. Check that active sidebar and workflow tabs remain synchronized and existing controls are visible/reachable.
5. Run one synthetic business path with temporary data: create RFQ, import synthetic items/suppliers, allocate items, confirm a quote round, compare/record an award, save/reload, and inspect backup/restore controls. Confirm no real user data or main branch changes.
6. Explicitly check that the V3 CSS is embedded in `index.html`, with no new static-server route or external dependency. Capture screenshots, console/page errors and traces. Report concrete P1/P2/P3 issues honestly.
7. Write the bilingual report and evidence to a separate anonymous evidence branch and Draft evidence PR; comment here with PASS/FAIL/NOT TESTED, exact SHA and artifact links. **TEST ONLY: no product changes, no merges, no main changes.**

Existing business functions and data safety take precedence over visual polish. If a visual change breaks an old workflow, report it as a failure rather than adapting the test to fit.
