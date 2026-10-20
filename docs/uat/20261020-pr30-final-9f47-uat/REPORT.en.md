# PR #30 final independent pre-merge report — TEST-ONLY

Date:20 October2026, Asia/Shanghai. Raw evidence uses UTC. **Actual product SHA: `9f47a238bc9b3015f713c4e075977d98c1cb9ca1`.**

## Verdict: RELEASE-READY

The agreed cloud pre-merge gate is satisfied **for PR30 integration into `feat/20261019-srm-ui-v3-integration` at `0cd1278468d0471b862e16ca4ffcac41aead5e6d`**. This is a testing recommendation, not an executed merge or main/production deployment decision.

Visual/interaction PASS; backup/data safety and key procurement PASS. **21 PASS/0 FAIL/4 NOT TESTED** grouped targets. This final run recorded249/249 independent checks,311/311 archive/event checks and37/37 business file checks, with no driver/page error. No unresolved confirmed P1/P2/P3 in the reviewed scope, unfinished mandatory target or missing mandatory independent evidence. [Release audit](evidence/release-audit.json). Finite sampling does not establish a defect-free repository.

## Version, integration and CI

Read PR30 description/all current comments, especially [integration handoff](https://github.com/yudacheng666/SRM_System/pull/30#issuecomment-6284314866), [PR31 failure](https://github.com/yudacheng666/SRM_System/pull/31) and [PR33 acceptance/limits](https://github.com/yudacheng666/SRM_System/pull/33). [Historical audit](evidence/historical-evidence-audit.json) reads results from their exact published evidence commits and keeps them separate from new tests.

9f47a238 is the merge of69f660cb and a0edd9a. Its **entire Git tree equals PR33's tested a0edd9a**, tree80b2f45b37771b278fb663ebc55f7bf08fedc8ae, no diff. New browser tests still ran directly at the final SHA. [Checkout](evidence/checkout.json), [fix inclusion](evidence/fix-inclusion.json), [product patch](evidence/final-product-patch.txt) confirm admin exclusion from dirty heuristics, adjacent alert/scroll visibility, and clearing only after a successful clean SQLite save are all present.

Actual HTTP index bytes equal the tracked candidate SHA2566ab488c8eb0e246e8776187a2222adec07a754b1a83cd5488ae73886812e9ec3. [Runtime identity](evidence/runtime-identity.json). No PR23 static prototype or CI synthetic merge was used independently.

[Push39376374837](https://github.com/yudacheng666/SRM_System/actions/runs/39376374837) and [PR39376379481](https://github.com/yudacheng666/SRM_System/actions/runs/39376379481) both completed Windows/Linux SUCCESS before UAT. Each Linux log: Python43/Node10/Chromium44 passed. They are two triggers of one S3/S4 workflow. PR CI used synthetic75a65c6…; our direct product was9f47a238. Complete existing44 tests were not rerun locally this round; independent UI is separate from that baseline.

CI logs still contain artifact quota errors despite final job SUCCESS. No CI screenshot/trace availability is claimed. New independent evidence is archived in Git instead; existing artifacts/workflows were not altered.

## Isolated environment and actual tests

Real Chromium154.0.8037.57/Playwright1.58.2, formal Python/SQLite M1-Lite, new `/tmp/f9/data`, `/tmp/f9/restore`, `/tmp/f9/restore-final`, `/tmp/f9/feedback-data`. Only fictional files, materials, suppliers, quotes and PDFs. Actual UI performs imports/previews/confirmation, assignment, quotes/awards, saves, RFQ switching, export and restore; read-only SQLite snapshots validate persisted business state. Only four owned9050–9053 services were stopped, data retained.

**P3 at1366×768,1024×768,1600×900:** saved RFQ, project drawer collapsed, backup/report area open, real new material confirmed, top admin then normal scroll/physical click on an enabled S4 action. No backup API, action disabled, entire adjacent reason rectangle inside the viewport, verified in screenshots. After real PUT200/revision advancement/autosave acknowledgment, notice.hidden=true and empty text, action enabled, and each case downloads an actual S4 ZIP. [Feedback results](evidence/feedback-results.json), [screenshots](SCREENSHOTS.md).

A held genuine pending autosave keeps the existing warning and disables backup. Explicit browser-request500/409/connectionfailed controls leave complete current/history rows unchanged and retain the warning; removing faults and actually saving clears it. These injections are not physical disk failures.

A real two-window race holds a stale genuine PUT, lets another GUI window commit, then releases it to an **actual backend409**. Winner data remains exact and the already-established warning stays visible. Explicit saved-record reload resolves it. Actually SIGTERM the owned9053 service after establishing a warning: real network save failure keeps data/warning; restarting the same service/data and genuinely saving clears it. No dirty/guard flags were overridden.

**OBS24/24 downloads,0 unexpected timeout.** RFQ B→A, alternate0/100/350/650ms after return, then top admin→S4 with no fixed post-admin wait. Trusted click intervals83.1–462.6ms. Every samplePOST201→GET200→one real download event/file. O01–20 read-only logpoint dirty/busy/blocked=false; O21–24 disable that probe and still pass. Navigation/backups preserve current state/revisions/PDF. [CSV](evidence/obs-attempts.csv), [raw](evidence/obs-attempts.json), [event log](evidence/obs-browser.jsonl).

**28 actual S4 ZIPs:** one initial procurement backup+24 repeats+three post-save feedback downloads. CRC,manifest DB/PDF hashes,SQLite integrity_check and all rows/columns in workspaces/workspace_versions match their respective phases. Main25 ZIPs contain twoRFQs/onePDF,initial8/latest11 historical rows; feedback3 contain noPDF, matching their actual workspace. All311 archive/event validations pass. [Archive checks](evidence/archive-validation.json).

Initial and latestO24 backups restore into two empty directories; UI decisions/reasons/PDF and full history match. Both nonempty targets refuse overwrite without changing current/history/PDF. A real main-service process restart preserves data and native PDF access.

**Procurement:** import four fictional rows including same-code/different-spec materials, additive bidirectional assignments, unique/multiple/unmatched drawing preview/manual confirm, real quote spreadsheets and same-round revisions through actual comparison exports. A/B20 single/keyboard/bulk ties require no exception; real8/12 higher choice rejects whitespace, persists/exports a valid reason. Manual3 clears pending/tie review. NewC20 does not invalidateB20; B21 reopens review, persists throughF5, choosingC20 clears it. A10→9 draft does not replace confirmedV1; immutableV1 and true-1/-10% revision retained.

Actual A/B totals638/692→638/717, theoretical638/manual662; unquoted not zero. CSV quantities/prices/line IDs,workbook ROUND/SUMIF/awards/reasons/group history,supplier blank prices/no competitor/privateERP/exactPDF all pass37 file checks. No desktop Excel recalculation performed. Save/F5/cross-RFQ context/actual restart persist correctly; invalid/canceled preview leaves revision/line IDs/content unchanged. Prior V01–V04 and disabled-control checks at three widths pass, without claiming full PR23 pixel recertification.

## Defects, mandatory targets and limitations

|Known issue|Evidence chain|Final disposition|
|---|---|---|
|P2-OBS01|Original diagnosis;PR31 path pass|PASS24 actual repeats/clean observed entries|
|P3-S4-01|PR31 FAIL at69f660cb;PR33 PASS ata0edd9a|PASS final three-size notice/clean-clear/failure-retention tests|
|P2-B01|Tied-lowest alternate supplier incorrectly treated higher|PASS A/B20,A/C20 single/bulk choices and persistence|
|P3-U01/V05|Resolved manual choices still pending|PASS manual3,pending0,new quote reopens then reconfirm clears|

Unfinished mandatory targets=0; mandatory independent evidence gaps=0; no unresolved confirmed P1/P2/P3 in this scope. PR33's historical invalid-precondition assertion and driver errors remain in its evidence; they are neither erased nor counted as new final tests. This final run has no failed check or driver error.

Nonblocking: CI artifact quota remains an infrastructure limitation, covered here by independent Git evidence. PR30 description retains obsolete pre-CI wording; actual exact-candidate CI/current report provide the final status. We did not edit the description/CI or label these as new purchasing product defects.

|ID|Target|Result|
|---|---|---|
|R01|准确HEAD、运行字节、结束未变化 / Exact identity and unchanged HEAD|PASS|
|R02|最终CI Windows/Linux / Final Windows/Linux CI gate|PASS|
|R03|OBS与PR32修复均包含、tree一致 / Fix inclusion and identical reviewed tree|PASS|
|R04|折叠滚动未保存提示三尺寸 / Collapsed-scrolled dirty warning at3 resolutions|PASS|
|R05|真实保存成功清除并可下载 / Clear after actual successful save,then download|PASS|
|R06|保存中及受控500/网络/409保护 / Pending-save and injected-failure safety|PASS|
|R07|真实SQLite双窗口409 / Actual two-window SQLite409|PASS|
|R08|真实独立服务停止及安全恢复 / Actual owned-service outage and recovery|PASS|
|R09|原OBS快速重复24次 /24 original-path rapid repeats|PASS|
|R10|28ZIP SQLite全部历史/PDF /28ZIP full SQLite history/PDF integrity|PASS|
|R11|两次空目录恢复 / Two empty-target restores|PASS|
|R12|两次非空安全拒绝 / Two nonempty overwrite refusals|PASS|
|R13|并列最低价单项及键盘 / Single/keyboard tied-lowest choice|PASS|
|R14|批量同价与真正高价理由 / Bulk ties and genuine higher-price reasons|PASS|
|R15|人工待核对及新报价复核 / Manual/tie and new-quote review state|PASS|
|R16|报价草稿、修订及历史锁定 / Drafts,revisions and locked quote history|PASS|
|R17|保存/F5/RFQ切换/真实进程重启 / Persistence,F5,RFQ switch,actual restart|PASS|
|R18|图纸匹配/原生PDF及追加分配 / Drawing/native PDF/additive allocation|PASS|
|R19|CSV/XLSX/供应商包金额与安全 / Actual export amounts and supplier package safety|PASS|
|R20|非法/取消预览及三尺寸旧UI回归 / Invalid/canceled previews and prior UI checks|PASS|
|R21|必测证据、历史缺陷闭环及权限审计 / Mandatory evidence,defect closure,boundary audit|PASS|
|N01|Windows本机人工使用 / Native Windows manual use|NOT TESTED|
|N02|桌面Excel重算打印 / Desktop Excel recalculation/printing|NOT TESTED|
|N03|生产磁盘/断电/长期全负载并发 / Physical production failure/long full-load concurrency|NOT TESTED|
|N04|完整PR23逐像素重认证及全部业务组合 / Full PR23 pixel recertification/every business combination|NOT TESTED|

NOT TESTED explicitly: native Windows manual use (not required in this cloud handoff),desktop Excel recalculation/printing,physical production disk/power/long load,full PR23 pixel/all business combinations. These extra limits are outside the agreed pre-merge gate, not silently passed. RELEASE-READY is limited to the specified PR30→development-base integration and does not assert main production release completion.

## Evidence and boundary

[109 anonymous screenshots](SCREENSHOTS.md), [main trace](evidence/independent-v31-browser-trace.zip), [feedback/fault trace](evidence/feedback-browser-trace.zip), [actual conflict+outage trace](evidence/conflict-recheck-trace.zip), complete browser/network/server logs and all samples in evidence,actual ZIPs/exports in downloads,[SHA256](SHA256SUMS.txt). Traces open in Playwright trace viewer, viewport PNGs separate.

Protected main/development/fix refs [before](evidence/protected-refs-before.txt)/[after](evidence/protected-refs-after.txt) are identical; PR30 remains Draft/unmerged, base unchanged. Only a new independent evidence branch was created; no product/original tests/CI/existing-branch edits, no PR merge/closure, no existing data cleanup. Evidence is archival, not a product fix. Maintainers decide any subsequent merge.
