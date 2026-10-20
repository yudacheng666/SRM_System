# PR38 independent acceptance / TEST-ONLY

**PASS within this targeted fix and listed regression scope. Recommend PR38 merging into its development target `feat/20261019-srm-ui-v3-integration`, subject to the owner's decision. This does not accept the whole product or approve a main release. No merge was performed.**

PR36's first supplier export and view-only false warning both pass through real reproduction paths. Genuine unsaved edits retain export/New RFQ/S4 protections. No new confirmed product P1/P2/P3. One initial diagnostic observation assertion remains false and explained; not all raw assertions are described as passing.

## Version and CI gate / 版本门槛

- Product SHA: `9633c03948b1763f99dfa8c2f2f5edc5aa87ba70`. Direct checkout, not a synthetic PR merge. PR38 HEAD unchanged at start/end, Draft/open/unmerged.
- Tree: `33688a7d740816f3082606c87e00ee367ff575ea`; served `/` SHA256 `bc4288bf60f8971f8549dac3bdb4015617a23eeb4ce383ed103c66908f00cb6b` equals checked-out M1-Lite index.
- [UI Unified #54 /39389547065](https://github.com/yudacheng666/SRM_System/actions/runs/39389547065): Linux118517460442 and Windows118517460797 SUCCESS.
- [S3/S4 #157 /39389547071](https://github.com/yudacheng666/SRM_System/actions/runs/39389547071): Linux118517460648 and Windows118517460793 SUCCESS.
- Linux logs show46/46Chromium tests passed; artifact quota warnings retained as a CI evidence limitation. CI is a gate, not this independent test conclusion. No CI reruns were used.
- [Gate/comments/jobs](evidence/github-gate.json), [final PR identity](evidence/github-final.json), [HTTP identity](evidence/runtime-identity.json), [UI CI log](evidence/ci-ui-linux.txt), [S3/S4 CI log](evidence/ci-s3s4-linux.txt), [protected refs before](evidence/protected-refs-before.txt)/[after](evidence/protected-refs-after.txt).

## Independent method

Main browserUTC2026-10-20 08:18:22–08:23:45 (Beijing16:18:22–16:23:45). Real Chromium154.0.8037.57 / Playwright1.58.2 against official M1-Lite, not PR23's concept mockup. Fresh isolated SQLite directories `/tmp/r38/data`, `restore`, `restore-final`, `fault-data`, `fault-data-r2`; ports9380–9384. Original observation and corrected fresh run use different directories. All five owned services were stopped by exact serve.py/port match, no data deleted or existing business accessed.

Fictional RFQ `RFQ-1792484313429-8IMKQH` and a blank RFQ; four lines (two specifications sharing one code, quantities10/25, unquoted4, true higher-price item6), three fictional suppliers, valid592-byte PDF. Independent purchaser operations reuse earlier Codex-authored methods and add real round2 and unsaved-state negatives. Existing CI tests were not rerun as the acceptance substitute; original tests remain unchanged. Only evidence and independent method TXT files are committed.

## Results

| ID | Result | Scope / 范围 | Evidence / 证据 |
|---|---|---|---|
|G01|PASS|唯一SHA及两项CI Windows/Linux；HTTP产品字节与checkout一致 / Exact SHA, CI and HTTP byte identity|[evidence](evidence/runtime-identity.json)|
|P2|PASS|重走原分配→生成询价单→选A→首次下载，无重试即成功 / Original first supplier ZIP path, no retry|[evidence](evidence/P2-original-path-result.json)|
|P3|PASS|只读分配视角/供应商导航不误报未保存，完整前后快照相同 / No false dirty warning after view-only navigation|[evidence](evidence/P3-original-path-result.json)|
|S01|PASS|真实新物料未保存时：导出拒绝、新建丢弃警告、S4禁用/邻近原因可见 / Real unsaved edit protects export, New RFQ, S4|[evidence](evidence/safety-retest/dirty-safety-results.json)|
|S02|PASS|真实PUT进行中及受控500后保护；真保存后清除提示并允许导出 / In-flight PUT/controlled500 preserve protection, true save clears|[evidence](evidence/safety-retest/final-fault-results.json)|
|S03|PASS|双浏览器真实后端409和实际断服，数据不覆盖，重载/真保存恢复 / Actual backend409 and service outage safety|[evidence](evidence/safety-retest/final-fault-results.json)|
|B01|PASS|真实XLSX物料/供应商、同编码两规格、追加多对多分配、既有报价防解除 / Imports and additive assignments/history guard|[evidence](evidence/02-supplier-multi-allocation.png)|
|B02|PASS|图纸唯一/多候选/未匹配预览、人工确认、重启后原生PDF显示 / Drawing preview, match confirmation and PDF|[evidence](evidence/PDF-real-preview-after-restart.png)|
|B03|PASS|同轮V1/V2锁定、草稿不生效、历史不变及差异展示 / Quote version history and effective-state rules|[evidence](evidence/V04-V2-confirmed-diff.png)|
|B04|PASS|20/20并列单项/键盘/批量定标；8/12高价理由，重开/清除待核对 / Tied-lowest and higher-price awards/review lifecycle|[evidence](evidence/T09-reconfirmed-C-no-pending.png)|
|B05|PASS|真实第2轮7/19/7录入、确认、定标、金额587/717、历史和F5保持 / Real round2 and persisted decisions/history|[evidence](evidence/R2-final-decision.png)|
|B06|PASS|实际CSV/XLSX/单家和三家嵌套ZIP内容/隐私/PDF校验 / Actual exports, scope, blank prices and PDFs|[evidence](evidence/extra-file-validation.json)|
|D01|PASS|保存/F5/跨RFQ/实际主服务重启；非法取消预览不改业务 / Save, refresh, RFQ switch, restart and invalid preview safety|[evidence](evidence/19-final.json)|
|D02|PASS|24次RFQ返回/顶部管理/S4快速下载，24成功0失败0超时 / 24 rapid S4 downloads after RFQ switch|[evidence](evidence/obs-attempts.csv)|
|D03|PASS|25本轮新S4，CRC、manifest、SQLite当前/历史全行及PDF /25new archives with complete DB and PDF validation|[evidence](evidence/archive-validation.json)|
|D04|PASS|两个空目录恢复、两个非空拒绝且数据不变 / Two empty restores, two nonempty refusals|[evidence](evidence/history-final-restored.json)|
|U01|PASS|1024×768/1366×768/1600×900导航布局、V01–V04/禁用按钮提示 / Three viewport layout and disabled-control checks|[evidence](SCREENSHOTS.md)|
|OBS|FAIL assertion; product PASS / 观察断言失败，产品保护有证据|初次安全诊断误读折叠状态innerText为空；原trace已有正确拒绝，独立观察修正后复验31/31 / Initial observer failure preserved, corrected fresh run31/31|[evidence](evidence/RAW-first-safety-classification.json)|
|N01|NOT TESTED|Windows本机、桌面Excel重算/打印、物理磁盘满/断电及长期负载 / Native Windows, desktop Excel and physical failures/long load|[evidence](REPORT.en.md)|
|N02|NOT TESTED|完整PR23像素一致性、所有业务组合/阶梯价/所有模板填充重导入 / Full design parity, all tier-price/import combinations|[evidence](REPORT.en.md)|

## Original defects independently retested

**P2 PASS:** saved RFQ → allocation → generate RFQ → chooseA → first download produces `supplier-A.zip` once with no timeout/retry/manual-save workaround. B and the all-supplier package subsequently download. All persisted business is unchanged. Actual workbooks have assigned lines, RFQ IDs, blank requested prices, no private ERP extras/competitor data, and byte-identical assigned PDFs. Nested all-supplier ZIPs checked independently: C gets its one assigned row, no unassigned PDF. [Exact result](evidence/P2-original-path-result.json), [archive](downloads/supplier-A.zip), [post-operation screenshot](evidence/P2-first-supplier-exports-pass.png). Screenshot is after B/all-package actions; first A event order is in JSONL/trace.

**P3 PASS:** saved/restarted RFQ → supplier-first view → chooseB → New RFQ produces the normal blank-RFQ confirmation, with no unsaved-discard message. Complete before/after snapshots equal; cancellation preserves full DB/PDF. Native dialog text is evidenced in events/trace, screenshot explicitly after dismissal. [Exact snapshots/dialog](evidence/P3-original-path-result.json). PR36 old-SHA failures remain unchanged; this candidate's PASS comes from fresh operations, not inherited conclusions.

## Genuine unsaved protection and retained diagnostic failure

Fresh safety RFQ: actually add `PR38-TRUE-DIRTY` in memory; DB still lacks it. Hold a real autosave PUT solely to observe order, without mutating product state/guard. Supplier export explicitly refuses unsaved changes; New RFQ warns before discarding, dismissal keeps the workspace; S4 disabled with adjacent red reason visible after collapsed project panel/scroll and no backup request. Real PUT in-flight remains protected. Controlled network-layer500 retains notice/unchanged DB. Actual manual save commits the new line, clears the obsolete notice and permits export.

Actual backend409: hold stale browser PUT, save from a second real browser, release the stale PUT to receive server409. Notice remains, no backup API, winning DB untouched; safe reload clears it. Actual service stop via SIGTERM yields network save failure; notice and disabled backup persist, DB unchanged. Restart and actual save clears the notice. Controlled500, real409 and physical process outage are explicitly distinguished.

**Initial observer failure retained:** initial `fault-data` run2checks/1true/1false stopped at export-message assertion. Trace already proves correct product refusal: visible `pilotReportHint` text and locator-resolved `pilotSaveStatus` text are expected. Reading collapsed-details `innerText` yielded empty. Only this new independent outside-repo observer changed to `textContent`, then full sequence31/31 in fresh `fault-data-r2`. Product/original tests/CI untouched. Original raw false, error, trace, DB-before/after equality are all archived. It is not a confirmed product-safety failure. [Classification](evidence/RAW-first-safety-classification.json), [original refusal trace events](evidence/RAW-first-safety-message-trace.json), [original trace](evidence/conflict-recheck-trace.zip), [fresh complete trace](evidence/safety-retest/conflict-recheck-trace.zip).

Safety-only RFQ has no PDF: its permitted post-save supplier export is XLSX. Driver originally stored bytes under `after-genuine-save-supplier-A.zip`; original retained, exact-byte `.xlsx` convenience alias added with provenance. This harness naming error is not a product ZIP failure or counted S4 archive. [Actual format](evidence/safety-export-format.json).

## Purchasing, files and restore regression

Additive assignments keep previous relationships; confirmed history prevents unlinking. A round1V1=10 → V2=9, draft not effective, original V1 preserved. A/B20 ties single/keyboard/bulk need no exception reason; genuine8vs12 rejects blank reasons. NewC20 keeps chosenB20; B21 reopens review, persists through F5, selectingC20 resolves it.

Actual round2 A imports7/19/cannot/7 on all four expected RFQ lines. Draft still uses prior9; confirmation uses7/19, locks editing and leaves every prior confirmed submission unchanged. Explicit A choices clear obsolete higher-price reasons and all pending/review counts; save/F5 preserves. CSV/business/report workbook checks validate history, quantity and scope:10×7+25×19+6×7=587 vsB717. Earlier638/692 and638/717 files checked too. Unquoted is blank, never zero. Formula text is verified; desktop Excel recalculation is not claimed.

Save/F5/cross-RFQ/actual server restart retain full data/PDF. Invalid/cancelled preview does not change revisions/line IDs/business. Native PDF visibly renders fictional text after restart and closes normally.

24rapid RFQ-switch-return/admin/S4 downloads:24success/0failure/0timeout,128–426ms admin-to-backup click. First20 have read-only CDP clean guard logpoints; final4 disable the logpoint and still succeed. No product script modified. ActualPOST201/GET200 and download events retained. One earlier backup makes25new archives, no historical input counted.293file/event assertions validate CRC/manifestSHA/SQLite integrity/every current and history row/PDF bytes against the proper phase. First/latest backups restored into two independent empty directories; two nonempty attempts refuse without overwrite. Restoration is not based merely on a quiet page.

Raw accounting: main207/207; fresh complete safety31/31; initial observer2checks with1false retained; archive/event293/293; business files37/37; extra files/paths40/40. Distinct assertion layers are not summed as business-case counts. No main/safety pageerrors; three main console404/icon requests retained.

## NOT TESTED and recommendation

Native Windows, desktop Excel recalculation/printing, physical disk-full/power failure, production/long-duration load, complete PR23 pixel parity, every tier-price/template reimport combination remain NOT TESTED. Safety S4 live view tested1366×768; three-size page and disabled quote hints rerun, but every save-failure timing at all sizes is not exhausted. S4 SQLite/PDF does not claim original emails/screenshots included.

**Recommend PR38 entering its target development integration branch within the demonstrated scope.** No unresolved newly confirmed product P1/P2/P3 blocks this recommendation; retained observer failure has original-trace classification and fresh independent verification. This does not establish PR24 whole-product acceptance or main release readiness. TEST-ONLY: no product/original-test/CI/development/main mutations, no PR merges/closures.

[106screenshots](SCREENSHOTS.md), [main trace](evidence/independent-v31-browser-trace.zip), [browser](evidence/browser.jsonl), [S4attemptCSV](evidence/obs-attempts.csv), [S4events](evidence/obs-browser.jsonl), [fresh safety browser](evidence/safety-retest/conflict-recheck-browser.jsonl), [main server](evidence/server.log), [safety initial server](evidence/safety-retest/fault-server.log), [safety restarted server](evidence/safety-retest/feedback-server.log), [restore1](evidence/restore-server.log)/[restore2](evidence/final-restore-server.log), [full archive validation](evidence/archive-validation.json), [structured results](results.json), [SHA256](SHA256SUMS.txt).
