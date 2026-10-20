# PR #32 independent targeted UAT — TEST-ONLY

Date:2026-10-20; raw timestamps UTC. **Exact product SHA: `a0edd9a753733c738360fc437d0a3ee4a29144e4`.**

## Verdict

**P3-S4-01 visual/interaction: PASS. Backup and procurement behavior: PASS within the explicitly executed scope.** All three viewports reproduced the collapsed-project/scrolled/real-unsaved-edit condition. The reason appeared beside S4 entirely inside the viewport, no backup request was issued, and a real successful SQLite autosave cleared the old notice and enabled a subsequent real download. Existing warnings survived pending/failed saves, an actual stopped service, and an actual backend409 until a successful save or safe reload resolved the state.

Grouped outcome: **19 PASS /0 FAIL /4 NOT TESTED**. No new confirmed product defect. This does not certify all product behavior or authorize a merge. One raw assertion with an unmet timing precondition and two driver preparation/observer errors are preserved and explained rather than hidden.

## Gate and identity

Read the [latest PR32 task](https://github.com/yudacheng666/SRM_System/pull/32#issuecomment-6283410152), all current comments, [PR31 report and original N01 screenshot](https://github.com/yudacheng666/SRM_System/pull/31). PR31's69f660cb screenshot shows the reason hidden in a collapsed drawer/offscreen header. The old product was not re-executed this round; its published evidence defined the candidate retest.

[Push39369245980](https://github.com/yudacheng666/SRM_System/actions/runs/39369245980) and [PR39369250226](https://github.com/yudacheng666/SRM_System/actions/runs/39369250226) both finished with Windows/Linux SUCCESS before independent UAT. Each Linux log contains Python43,Node10,Chromium44 passes. These are two triggers of the same S3/S4 workflow, not different suites. PR CI checked synthetic merge c8da9d5…; independent checkout ran the direct candidate. The complete44-case suite was not rerun locally this round; it is the CI baseline, separate from the independent GUI tests below.

Both CI logs still report artifact storage quota errors despite final job SUCCESS. No downloadable CI screenshots/traces are claimed. Independent evidence is committed separately in Git.

PR32 HEAD remained unchanged, open/Draft/unmerged at start and finish. [Runtime identity](evidence/runtime-identity.json) proves actual served index bytes equal the tracked candidate, SHA256 `6ab488c8eb0e246e8776187a2222adec07a754b1a83cd5488ae73886812e9ec3`. [Initial GitHub gate](evidence/github-initial.json)/[final](evidence/github-final.json), protected refs [before](evidence/protected-refs-before.txt)/[after](evidence/protected-refs-after.txt). Evidence branch `test/20261020-pr32-feedback-a0-uat` started directly at the product SHA and targets its fix branch, not main.

## Environment and method

Real Chromium154.0.8037.57/Playwright1.58.2, formal M1-Lite with Python/SQLite. Fresh isolated directories `/tmp/a0/data`, `/tmp/a0/restore`, `/tmp/a0/restore-final`, `/tmp/a0/feedback-data`; no preexisting business database copied. All workbooks, suppliers, quotes and drawings are fictional. Actual UI operated files, previews, confirmations, assignments, quote revisions, awards, saves, exports, RFQ selection and restore. Snapshots/SQLite were read-only verification, not injected business state. Four owned services9030–9033 were stopped after testing; existing user data untouched.

## P3 reproduction and clearing

Save an initial RFQ; collapse Project operations; expand backup/report tools. Add real UI materials P32-REAL-DIRTY-1366/1024/1600, quantity2. Click top admin, scroll normally to S4, physically click the still-enabled button before autosave. No forced DOM click or dirty-state override.

|Viewport|ScrollY before click|Notice top/bottom after click|Outcome|
|---|---:|---:|---|
|1366×768|172|164.844/220.844|Entire notice visible beside action|
|1024×768|185|165.344/239.344|Entire notice visible|
|1600×900|191|169.375/225.375|Entire notice visible|

Each case retained projectOpen=false, enabled-before/disabled-after, no backup API. The red reason explained unsaved changes and waiting for autosave or explicitly saving before redownloading. Whole bounding rectangles and actual PNGs were inspected, not merely DOM text.

After real PUT200 and revision advancement, the status acknowledged an actual autosave, notice.hidden=true and textContent empty, button enabled. Each case then downloaded a real S4 ZIP. All three feedback ZIPs match their phase's full current/history rows; this feedback-only RFQ has no PDFs, correctly reflected by a zero-PDF manifest. [Results](evidence/feedback-results.json), [1366 blocked](evidence/P3-1366-blocked-visible.png)/[saved](evidence/P3-1366-saved-cleared.png), [all screenshots](SCREENSHOTS.md).

## Safety and failures

- **BUSY:** held one genuine autosave PUT unchanged at the browser route. Previously established notice persisted and native S4 was disabled. A physical click issued no backup API. Releasing the actual request and completing the save cleared the notice.
- **SAVE500/OFFLINE/CONFLICT409:** injected500,connectionfailed,409 into real UI-generated save requests. These are disclosed browser network controls, not claims of physical disk failures or real server conflicts. Warning persisted, S4 stayed disabled, no backup API, and full current/history rows stayed unchanged. Removing injection and genuinely saving through UI cleared it.
- **REAL409-BARRIER:** first establish a warning, hold that window's genuine PUT, let another UI window commit a new material to real SQLite, then release the stale request. The **real backend returned409**, retained the winner's full database state and kept the original warning in the viewport. Explicitly reloading the saved record obtained the new revision and cleared obsolete feedback. The barrier only arranged ordering; it did not synthesize409.
- **REAL-SERVICE-DOWN:** after establishing the warning, actually SIGTERM the owned9033 service. Real network save failure left the database and warning unchanged, backup disabled. Restart the same service/data and save through UI successfully, then the notice cleared.

[Control log](evidence/feedback-browser.jsonl), [real faults](evidence/real-fault-browser.jsonl), [real conflict barrier](evidence/conflict-recheck-browser.jsonl). These bounded schedules do not establish every possible production conflict/fault behavior.

## OBS, files and restore

**24/24 actual rapid OBS downloads, zero unexpected timeout.** Switch RFQ B→A, alternate0/100/350/650ms after return, then top admin→S4 without a fixed post-admin wait. Trusted click intervals86.2–364.9ms. Every sample POST201→GET200→one browser download event, actual file saved. O01–O20 read-only entry logpoint observed dirty/busy/blocked=false; O21–O24 disabled that probe and still passed with passive events retained. No guard condition or business variable was changed. Navigation/repeats preserved SQLite revisions/current data/PDF.

[24-row CSV](evidence/obs-attempts.csv), [raw attempts](evidence/obs-attempts.json), [events](evidence/obs-browser.jsonl), [summary](evidence/summary.json). Total actual S4 ZIPs **28**: one initial purchasing backup,24 rapid repeats,3 post-autosave feedback downloads. The25 main-project ZIPs have two RFQs/one PDF; first backup8 historical rows, repeated backups11. Each ZIP CRC, manifest database/PDF hash, SQLite integrity_check and **all columns/rows of workspaces and workspace_versions** matched the appropriate phase. All311 integrity/event checks passed. Three zero-PDF feedback ZIPs matched their own phases. [Validation](evidence/archive-validation.json).

Initial and latestO24 ZIPs restored into two empty directories. Real UI showed exact decisions/reasons/PDF; latest full history equaled the source. Both nonempty targets refused repeated restore without changing current/history/PDF state. See14/15/34/35 snapshots and history-final-restored.

## Procurement regression

Same-code/different-spec M16/220 qty10, M20/350 qty25; unquoted qty4; higher-price-reason qty6, fictional suppliersA/B/C. Real additive bidirectional assignment, unique/multiple/unmatched drawing preview, explicit unique confirmation, native PDF after real process restart.

A same-round10→9: draft not effective, lockedV1 unchanged, real delta-1/-10%. A/B20 ties accepted either including keyboard; bulk tied prices no exception; real8/12 higher award rejects whitespace and persists/exports a valid reason. Three manual selections clear pending/tie review. NewC20 does not invalidateB20; B21 reopens review, survivesF5, choosingC20 clears it with original history intact.

Independent actual file totals: A/B638/692, then638/717 afterB revision; theoretical638/manual662. Unquoted is not zero. CSV and workbooks validate quantities×prices, RFQ IDs, selection/reasons, ROUND/SUMIF formulas and group history. A/B group excludesC. Supplier packages retain exact PDF bytes, blank prices and omit competitors/private ERP fields. All37 [business file checks](evidence/business-file-validation.json) passed; no desktop Excel recalculation performed.

Save/F5/cross-RFQ supplier context/actual server restart persisted state. Invalid and canceled imports left revisions/line IDs/content unchanged. Current UI screenshots at three resolutions and prior V01–V04/disabled-control checks showed no regression; full PR23 pixel parity is not claimed.

## Grouped results

|ID|Target|Result|
|---|---|---|
|C01|准确版本、HTTP字节、两条CI / Identity and both CI gates|PASS|
|C02|P3原1366折叠滚动提示 / Original collapsed-scrolled1366 notice|PASS|
|C03|1024/1600提示在视口 / Additional viewport notice visibility|PASS|
|C04|真实自动保存后清除并能下载 / Clear after committed autosave then download|PASS|
|C05|真实保存进行中保护与警告保留 / Genuine busy-save protection|PASS|
|C06|保存HTTP500失败不清除 / Save500 failure retains warning|PASS|
|C07|网络失败及真实服务停止不清除 / Aborted request and real service outage|PASS|
|C08|真实双窗口409保留警告与数据 / Real two-window409 safety and warning|PASS|
|C09|OBS快速下载24次 /24 rapid OBS repeats|PASS|
|C10|28ZIP全量SQLite历史与PDF校验 /28 actual archives full history/PDF integrity|PASS|
|C11|两次空目录恢复 / Two empty-directory restores|PASS|
|C12|两次非空拒绝覆盖 / Two nonempty overwrite refusals|PASS|
|C13|并列最低单项选择 / Single tied-lowest awards|PASS|
|C14|批量定标与真正高价理由 / Bulk awards and genuine higher-price reasons|PASS|
|C15|人工待核对与新报价复核 / Manual pending and new-quote review|PASS|
|C16|同轮修订、草稿与锁定历史 / Same-round revision, draft and locked history|PASS|
|C17|保存、刷新、切RFQ与真实服务重启 / Save,F5,RFQ switch and real restart|PASS|
|C18|图纸、实际导出金额和取消预览 / Drawings,actual export totals,invalid/canceled previews|PASS|
|C19|三尺寸原V01–V04与禁用按钮回归 / Three-resolution prior UI/disabled-control regression|PASS|
|C20|Windows本机人工操作 / Native Windows manual use|NOT TESTED|
|C21|桌面Excel重算打印 / Desktop Excel recalculation/printing|NOT TESTED|
|C22|生产磁盘断电、全负载并发 / Production disk/power/full-load concurrency|NOT TESTED|
|C23|PR23完整逐像素重认证与所有业务组合 / Full PR23 pixel recertification/every business combination|NOT TESTED|

## Preserved raw failures and limits

Main browser184/184, feedback50/50, real-fault13 checks with12true/1false, conflict barrier8/8: **255 raw checks,254true/1false**. Original REAL409 visibility false had button already disabled and no notice established before the click. It is an unmet precondition for warning retention, not proof a notice was wrongly cleared. Actual409 data safety passed. The barrier recheck explicitly established the warning before the pending PUT and then passed all8 checks. The raw false was never deleted or changed to true.

Two driver errors also remain: preparation tried to click manual Save in a hidden drawer; observer setup searched the old guard string. The former was corrected by opening the drawer through UI, the latter recovered via07b without duplicate network listeners. Only new independent drivers changed. Logs/old source text/preparation trace are preserved in [summary classifications](evidence/summary.json), [checks](evidence/independent-checks.json), method. No pageerror; three main-origin favicon404s and expected injected/real outage HTTP/network errors are retained.

NOT TESTED: native Windows manual use; desktop Excel recalculation/printing; physical production disk/power/full-load concurrency; full PR23 pixel certification/every business combination. CI and local sample passes do not substitute for those. Finite timing samples do not eliminate every race.

[110 anonymous screenshots](SCREENSHOTS.md), [main trace](evidence/independent-v31-browser-trace.zip), [feedback trace](evidence/feedback-browser-trace.zip), [real fault trace](evidence/real-fault-browser-trace.zip), [conflict recheck trace](evidence/conflict-recheck-trace.zip), [preparation timeout trace](evidence/feedback-preparation-trace.zip), all browser/network/server logs in evidence, actual archives/exports in downloads. Traces open in Playwright trace viewer; viewport PNGs are separate. [SHA256 manifest](SHA256SUMS.txt).

Only new docs/evidence, synthetic inputs/downloads and review-only method TXT are committed. No product/original tests/CI/development/main edits, no PR merge/closure. Tested P3 and business scope pass with the above limits; next-stage decisions remain with maintainers.
