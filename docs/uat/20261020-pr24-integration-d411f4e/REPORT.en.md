# PR #24 independent integration regression — NOT-READY / TEST-ONLY

Date:20 October2026,Asia/Shanghai; raw evidence UTC. **Only tested product SHA: `d411f4e17a0ab8e75412e5c91a91ccba6abbbc0e`.**

## Verdict

**NOT-READY: this round's independent integrated business regression is incomplete.** Both required CI workflows passed. Notice/clearing and part of save protection passed. The first false SAVE500 assertion automatically stopped expansion. Only one explicitly bounded same-case evidence run followed; no procurement/comparison/restore/repeat cases resumed.

Initial raw checks:31 total,30true/1false. Trace proves autosave had already failed before the attempted backup click: native S4 disabled, local notice never established. This false cannot establish that an existing warning was wrongly cleared. The single same-case follow-up explicitly establishes a visible notice before releasing a controlled500 response and passes retention/disabled/no-backup/database-unchanged invariants. The original false remains unchanged.

No new P1/P2/P3 product defect is confirmed by this evidence. A save-failure visibility observation is left for the owner to assess. NOT-READY means incomplete independent coverage and an interrupted original run, not proof the merge introduced a product regression. Prior-version passes are not inherited.

## Identity and CI gate

PR24 description/relevant comments were read. HEAD stayed d411f4e at start/end, Draft/open/unmerged; base draft/20261013-m1-storage-ui-audit at457edcf4214220deacb4288b372ea78f144e5333. [Gate](evidence/github-gate.json)/[final](evidence/github-final.json).

[UI Unified#48/run39379118995](https://github.com/yudacheng666/SRM_System/actions/runs/39379118995): Windows118483896372/Linux118483896234 SUCCESS. [S3/S4#148/run39379119121](https://github.com/yudacheng666/SRM_System/actions/runs/39379119121): Windows118483896719/Linux118483896945 SUCCESS. Each Linux log has Python43/Node10/Chromium44 passes. Both workflows completed before any independent browser started. CI checkout used synthetic3d50a90…; independent checkout/served application directly used d411f4e, verified HTTP bytes equal tracked index SHA2566ab488c8eb0e246e8776187a2222adec07a754b1a83cd5488ae73886812e9ec3. [Runtime](evidence/runtime-identity.json). No other product/prototype tested.

Artifact quota errors are separately retained: existing workflow policy makes uploads best-effort while business tests remain blocking. No failed blocking check was bypassed, and no CI artifact availability is claimed. Independent evidence is committed separately.

## Plan, names and stop boundary

Pre-execution [TEST-SCOPE](TEST-SCOPE.md) lists REG01–REG14 and failure limits. Directory prefix20261020-pr24-integration-d411f4e; REPORT.zh-CN.md/REPORT.en.md; FAILURE-REG02-SAVE500.md; bounded evidence prefixFAIL-REG02-SAVE500-*. Original automatic failure image retains its original name.

Serial execution, immediate pause on any failed assertion/CI or newly confirmedP1/P2/P3. Only same-case screenshots/state/network/server logs/trace finalization/read-only database comparison and at most one necessary minimal replay permitted. No other module/SHA, repair or skipped check to continue. This was enforced: first false at14:23:59Beijing, then exactly one same-case follow-up completed14:26:48. **No main purchasing browser or restore service was started; REG03–REG14 never ran.**

Real M1-Lite Python/SQLite,Chromium154.0.8037.57/Playwright1.58.2,only new isolated9073 service with /tmp/d4/feedback-data and fictional materials. Other prepared directories remained unstarted. Initial workbook import was merely setup for feedback cases, not acceptance of full REG03 purchasing flow.

## Passed scope

REG01 at1366×768/1024×768/1600×900: project drawer collapsed,page scrolled,real unsaved edit,physical click on enabled S4. Adjacent full notice rectangle visible,no backup API,native action disabled. ActualPUT200/revision advancement then clears notice/empty text,enables action,and each case downloads an actual ZIP. [Results](evidence/feedback-results.json)/[screens](SCREENSHOTS.md).

REG02-BUSY holds a genuine unchanged PUT. Existing warning remains,backup disabled,physical click emits no backup API. Releasing the real successful save clears it. Five checks pass; trace records state through revision5.

Three downloaded ZIPs are feedback-case evidence with no PDF scenario. Only evidence readability/CRC/SHA were checked after the stop, **not REG14 full SQLite/PDF business validation and no restore**. Their existence is not full backup/restore PASS.

## Original failure and one same-case follow-up

Original assertion `SAVE500 warning not incorrectly cleared` expected notice.hidden=false,actualtrue. AtUTC06:23:50.508 a fictional row was confirmed. ActualautosavePUT06:23:54.656 was intercepted with controlledHTTP500,received06:23:54.720. Tracecall@332 before the physical backup click already records revision5,buttonDisabled=true,notice.hidden=true/empty text,autosave failure. The later click cannot invoke a disabled native handler; call@342/348 still have no local notice. Global error status was above the viewport(top-165,bottom-106.828),project drawer collapsed. At06:23:59.072 assertion false,then stop06:23:59.073.

[Stop marker](evidence/failure-stop.json),[original image](evidence/FAIL-current-case-SAVE500.png),[decoded states](evidence/FAIL-REG02-SAVE500-trace-states.json),[classification](evidence/FAIL-REG02-SAVE500-classification.json). This is an unmet notice-establishment precondition,not proof of notice clearing. Actual observed state—save already failed,backup disabled,no local reason in current viewport—is recorded for owner assessment without inventing a new P3 rating. Read-only database comparison proves this failed save changed no current/history/PDF data.

Exactly one same-case follow-up uses the same SHA/directory,new fictional D411-SAVE500-ONE-CONTROL. Prepare UI,confirm row,click still-enabled S4,record visible notice,hold the actual pending PUT,then release as controlled500. Existing warning remains in viewport,buttondisabled,no backup request,full database unchanged. No successful save retry/other fault/restore/comparison followed. [Result](evidence/FAIL-REG02-SAVE500-minimal-result.json),[before response](evidence/FAIL-REG02-SAVE500-minimal-before-response.png),[after failure](evidence/FAIL-REG02-SAVE500-minimal-after-response.png),[trace](evidence/FAIL-REG02-SAVE500-minimal-trace.zip).

This supports retention under that explicitly controlled failure only. It does not erase the initial false or complete REG02, and expansion did not resume.

## Actual case status

|ID|Target|Status|
|---|---|---|
|CI-UI|UI Unified Candidate Acceptance|PASS|
|CI-S4|S3/S4 Regression|PASS|
|REG-01|三尺寸折叠/滚动警告、真实autosave清除、随后实际下载 / Three-size notice,clean-save clearing,actual downloads|PASS|
|REG-02-BUSY|真实PUT进行中保持既有警告、禁用备份 / Genuine pending PUT protection|PASS|
|REG-02-SAVE500-ORIGINAL|原警告保留断言false；点击前已失败/禁用，警告未建立 / Original assertion false,precondition unmet|FAIL (assertion; product verdict INCONCLUSIVE)|
|REG-02-SAVE500-MINIMAL|仅一次同例补验，先建立警告再500，保持警告/禁用/无备份请求/DB不变 / One same-case controlled recheck|PASS (limited evidence)|
|REG-02-REMAINDER|网络/409/真实双窗口/实际断服及成功重试 / Remaining failure modes and recovery|NOT TESTED|
|REG-03|完整物料/供应商/多对多/图纸 / Full material,supplier,assignment,drawing flow|NOT TESTED|
|REG-04|确认报价、同轮修订、锁定历史 / Confirmed quote/revision/locked history|NOT TESTED|
|REG-05|并列最低、高价理由、批量和人工状态 / Ties,higher-price reasons,bulk/manual awards|NOT TESTED|
|REG-06|逐页三尺寸布局、导航、旧UI兼容 / Page layout/navigation/prior UI compatibility|NOT TESTED|
|REG-07|采购CSV/Excel/比较单实际金额 / Actual purchasing exports and totals|NOT TESTED|
|REG-08|跨RFQ、F5、真实主服务重启 / RFQ/F5/main-service restart|NOT TESTED|
|REG-09|空目录S4恢复与非空拒绝 / First empty restore/nonempty refusal|NOT TESTED|
|REG-10|新报价复核、刷新、重新选择 / New-quote review persistence/reselection|NOT TESTED|
|REG-11|OBS快速重复24次 /24 rapid OBS repeats|NOT TESTED|
|REG-12|最新ZIP完整历史恢复与安全 / Latest full-history restore|NOT TESTED|
|REG-13|供应商包/原生PDF/非法取消预览 / Supplier package,PDF,invalid/canceled preview|NOT TESTED|
|REG-14|全部S4 ZIP/SQLite/PDF业务完整性 / Full S4 archive/database/PDF validation|NOT TESTED|

Remaining REG02 modes/actual conflicts/outage/recovery and REG03–REG14 are NOT TESTED. No priorCI/PR34 pass is transferred to this unique-candidate independent result. Other NOT TESTED limits: native Windows,desktop Excel recalculation/printing,physical production failure/long load,full pixels/all business combinations. Three-size backup interaction is not whole-application UI acceptance.

## Evidence, recommendation and boundary

10 actual anonymous screenshots,complete initial feedback trace and sole follow-up trace,browser/network/server logs,31 initial checks,stop marker,read-only before/after database snapshots and3 already-downloaded ZIPs. No main purchasing trace exists because that browser never started; no invented quote/restore screenshots. [Screenshots](SCREENSHOTS.md),[execution summary](evidence/execution-summary.json),[SHA256](SHA256SUMS.txt).

Recommend reviewing the unmet-precondition failure and save-first-failure visibility observation,then explicitly scheduling remaining REG02 andREG03–REG14 with recorded timing preconditions. Current evidence does not justify changing procurement algorithms/database,or declaring this candidate accepted from old passes/a retry/hidden assertions.

TEST-ONLY:new evidence branch/docs only; product/original tests/CI/main/development refs unchanged,noPR merge/closure,no user data cleanup. Only owned9073 was stopped. Recommendations are not actions performed.
