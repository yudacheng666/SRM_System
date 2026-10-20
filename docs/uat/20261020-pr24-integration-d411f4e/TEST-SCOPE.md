# PR24 integrated regression scope / 集成回归范围

Only product d411f4e17a0ab8e75412e5c91a91ccba6abbbc0e. Evidence directory/report prefix: 20261020-pr24-integration-d411f4e. Reports: REPORT.zh-CN.md, REPORT.en.md; trace/log paths retain case/state names and precise SHA is in runtime-identity.json.

Gate: both SRM UI V2 Unified Candidate Acceptance and SRM S3/S4 Regression must finish SUCCESS, with unchanged PR24 HEAD. No independent browser starts before this gate.

Sequential cases, no parallel independent expansion:

1. REG-01: three resolutions1366×768/1024×768/1600×900; collapsed project drawer, scrolled action, real unsaved edits; visible adjacent reason/no backup API; real autosave clears warning, subsequent actual S4 download.
2. REG-02: held genuine PUT, controlled HTTP500/409/connectionfailed, actual two-window backend409 and actual isolated-service stop/restart; protect data and retain warning until safe success/reload.
3. REG-03: new fictional RFQ, material/supplier XLSX, same code/different specs, additive bidirectional assignments, drawing unique/multiple/unmatched preview and explicit unique confirmation.
4. REG-04: actual confirmed quotes, draft versus confirmed effective prices, same-round10→9 revision, locked immutable V1/history.
5. REG-05: single/keyboard and bulk ties20/20, higher8/12 whitespace refusal/reasons, manual/pending counts.
6. REG-06: three-resolution navigation/layout and prior UI V01–V04/disabled-confirm controls.
7. REG-07: real comparable CSV, business XLSX, comparison workbook, no export side effects.
8. REG-08: save/F5/RFQ switch/context, first S4 ZIP; actual service process restart.
9. REG-09: first ZIP restore into empty directory; nonempty refusal without overwrite.
10. REG-10: C20 does not falsely invalidate B20; B21 reopens review, F5 persistence, C20 selection clears; updated actual totals/exports.
11. REG-11:24 RFQ-return/admin/immediate-backup repetitions, timing, requests/responses/events, read-only guard probes and probe-free samples.
12. REG-12:latest ZIP restore into another empty directory, full SQLite history/PDF equality, nonempty refusal.
13. REG-13:supplier packages/native PDF, invalid and canceled preview, final persisted fingerprint.
14. REG-14:every downloaded S4 ZIP CRC/manifest SHA/read-only SQLite current+history/PDF; actual CSV/workbook/supplier exports business calculations.

Failure boundary / 失败后边界:

- First failed CI or newly observed P1/P2/P3: STOP EXPANSION. Failed assertion also pauses automatically pending classification.
- Allowed only for the same failing case: screenshot/body/state, request/response/server log, trace finalization, read-only persisted-data check, at most one minimal necessary reproduction to confirm/clarify it. No unrelated case, alternate SHA, test-skipping, repair or branch merge.
- Later cases become NOT TESTED. An injected negative response is an expected control, not a product failure when the protection invariant passes. CI best-effort upload quota warning is documented separately from blocking tests.
- Preserve every false, timeout and driver incident. Do not fix product/original tests/CI; do not silently turn failed expectations into PASS. If the harness rather than product is at fault, explain evidence and limits explicitly.

Outside this cloud scope / 未测扩展范围: native Windows manual use, desktop Excel recalculation/printing, physical production disk/power/full-load long-term stress, exhaustive design pixel parity/every business combination. CI coverage does not make these independent PASS.
