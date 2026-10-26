from pathlib import Path
import json,hashlib,shutil,re
D=Path('/tmp/srm66-evidence/docs/uat/20261026-pr46-f4bfcda-final-closure');R=Path('/workspace/uatf4');s=json.loads((D/'automation-summary.json').read_text());e=json.loads((D/'execution-summary.json').read_text());a=json.loads((D/'targeted-seven-results.json').read_text());m=json.loads((D/'attempt-02/evidence/UX09-independent-before-awards.json').read_text());first=m['rows'][0];hi=max(x['height']for x in m['rows']);sha=s['productSHA'];identity=json.loads((D/'identity-start.json').read_text());h=identity['htmlSHA256'];p2=s['phase2'];p1=s['phase1'];table='\n'.join(f"| {x['id']} | {x['title']} | {x['targeted']} | {x['full']} |"for x in a);http=json.loads((D/'http-trace-identity.json').read_text());ex=json.loads((D/'attempt-02/evidence/export-checks.json').read_text());tamper=json.loads((D/'attempt-02/evidence/S4-tamper-preflight.json').read_text());assert all(x['pass']for x in ex)and all(x['pass']for x in tamper['checks']);log=[json.loads(l)for l in(D/'attempt-02/evidence/browser.jsonl').read_text().splitlines()];screens=len(list(D.glob('*/evidence/*.png')))
zh=f'''# PR #46 最终收口独立复验（TEST-ONLY，2026-10-26）

**本轮云端整改/业务验收：PASS，READY for scoped cloud review。** 唯一产品 SHA：`{sha}`。

**M1开发基线合并门槛：NOT READY（仍缺原生Windows三组及用户单独合并批准；本轮没有正式Actions）。** 这是对本准确SHA云端已测范围的通过，不是整个软件发布/合并授权，也不是GitHub Actions SUCCESS。

| 真实执行范围 | PASS | FAIL | NOT TESTED | BLOCKED |
|---|---:|---:|---:|---:|
| 定向剩余6项 + UX09 |{p1['expected']}|{p1['unexpected']}|0|0|
| 完整Python |{p2['PythonPASS']}|0|0|0|
| 完整Node |{p2['NodePASS']}|0|0|0|
| 完整Chromium |{p2['Chromium']['expected']}|{p2['Chromium']['unexpected']}|0|0|
| 独立UX01–09 |9|0|0|0|
| 独立核心业务子组 |12|0|0|0|
| 原生Windows |0|0|3|0|

完整原自动化合计 **{p2['fullPASS']} PASS / {p2['fullFAIL']} FAIL（{p2['total']}项）**，0skip/0retry。定向与完整、独立业务有重叠，不加总为虚增覆盖。另单列 **1次独立夹具错误 + 1次有记录的补全**，原始FAIL未删除；后续全新attempt02完成本轮独立验收。旧795f663的103/7、UX8/1以及更早证据不改一字。

## 1. 任务、准确版本与环境

[完整GitHub任务](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6415440257)、[开发整改](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6415422410)已完整读取。产品分支`feat/20261022-srm-ui-ux-structural`，开始/中途/结束PR46 HEAD一致、Draft、未合并；detached `/workspace/srmf4-product` 正式M1Lite，既非PR23原型亦非合成合并版本。产品分支自身没有AGENTS/主记忆入口，补读仓库PR48最新未合并HEAD `6b4e43de5fb523d852601734f8516b28b16bcdc3` 的AGENTS、PROJECT_STATE、DECISIONS，明确其未合并身份；本轮不更新主记忆。

[起点身份](identity-start.json)、[终点身份](identity-end.json)、[首次HTTP](http-start.json)、[全新attempt02 HTTP](http-attempt02-start.json)、[结束HTTP](http-end.json)均对应源码HTML SHA256 `{h}`。另事后只读复核原始trace捕获的 **{http['capturedRootResponses']}份根HTML响应**，[全部匹配](http-trace-identity.json)；这是对真实响应原文核验，不用代码阅读替代浏览器测试。开始时曾在原测试服务切换间隙读取8765失败，该只读采集没有业务断言，正式独立测试在9865启动并核对HTTP身份后才操作，未冒称那次采集成功。

环境：Linux、Python{identity['runtime']['python']}、Node{identity['runtime']['node']}（与建议22不同）、Playwright1.58.2、真实Chromium154.0.8037.57。按云环境技能核查网络/凭据准备状态，不输出凭据；没有安装/调用付费GitHubActions。数据库、PDF、报价均在任务全新隔离目录，第一次夹具遗漏后第二次从新空目录重建；没有旧数据库/ZIP迁移输入。数值1979/6940/7064是任务明确要求的相同模拟报价口径，非真实业务资料。

## 2. 定向7项：全部完整通过

| ID | 原准确测试名称 | 定向 | 完整 |
|---|---|---|---|
{table}

本SHA自带原测试完全未改，以上7条均完整完成，不再停在旧失败点；包括刷新后的物料搜索/原PDF/双供应商ZIP、真实409及断线重启手动保存、1366首条物料完整可见、待决定分页、3个真实按钮人工金额，以及并列/高价理由和持久化。并不是单项独立PASS覆盖原套件FAIL。[原case及堆栈/附件](targeted-seven-results.json)、[全部逐例CSV](automation-cases.csv)。

## 3. UX09 P3实测：本SHA已消除既有失败

独立全新12物料、3供应商、确认多轮报价，1366×768进入比价、scrollY=0，普通可选真实报价首行：

| DOM指标 | 实测 | 验收 |
|---|---:|---|
| top |{first['top']}px|≥0|
| bottom |{first['bottom']}px|≤768|
| height / 普通可报价行最大height |{first['height']} / {hi}px|≤44|
| viewport |{first['viewport']}px|768|
| scrollY |{first['scrollY']}|0|
| 价格与详情中心Y |{first['priceCenter']} / {first['detailCenter']}|同排，偏差≤10|

**首条报价整行完整显示，不只是顶部进入首屏。** [原始首屏截图](attempt-02/evidence/UX09-1366-real-priced-first-screen.png)、[DOM测量](attempt-02/evidence/UX09-independent-before-awards.json)。真实详情仍可展开，展开不误定标，明确点击价格按钮仍有效；商条、阶梯价、价格与人工/建议金额没有删掉或截断。原UX09测试在定向和完整中均走完所有几何/详情断言。

边界观察（非三尺寸首屏通用PASS）：1024×768报价首行top=841.21875、bottom=883，须垂直滚动；1600×900首行top=858.390625、bottom=900.171875，底边略过900。此轮“整行首屏”严格门槛只针对1366×768；其他两尺寸验证正常滚动可达、无容器裁切/整体水平溢出，不谎称三尺寸首屏都完整。建议后续继续统一不同断点的纵向密度。

1024×768、1366×768、1600×900各7主要页面实操，共21布局，documentWidth均等于viewport，无整体横向溢出；长物料身份按需求省略并提供完整hover，完整列/详情入口可操作，键盘Enter导航实际有效，页面视图操作不改变SQLite/PDF。三尺寸下单一常驻保存状态、真实pending/409及技术详情也实测。截图：[1024比价](attempt-02/evidence/UX-1024-quotes.png)、[1366比价](attempt-02/evidence/UX-1366-quotes.png)、[1600比价](attempt-02/evidence/UX-1600-quotes.png)，原始[21布局](attempt-02/evidence/three-size-layouts.json)、[行高汇总](row-density-summary.json)。不把有限场景扩展为所有字体/分辨率/无障碍都通过。

## 4. 完整原自动化

| 原命令 | 实际结果 | 日志 |
|---|---|---|
| `python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'` |{p2['PythonPASS']}PASS，exit0|[stderr](automation/phase2/python-backend/stderr.log)|
| `npm ci`，任务可写cache |exit0|[command](automation/phase2/npm-ci/command.json)|
| `npm test` |{p2['NodePASS']}PASS，exit0|[stdout](automation/phase2/node-business/stdout.log)|
| `npm run test:e2e` |{p2['Chromium']['expected']}PASS/{p2['Chromium']['unexpected']}FAIL，exit0，0skip/0retry|[stdout](automation/phase2/chromium-e2e/stdout.log)|

先完整执行定向7项，再Python/npmci/Node/完整Chromium；独立浏览器在第二次npmci结束后启动，避免依赖替换竞争。完整与独立分用端口/数据目录，保留实际耗时，未改变timeout/workers/retries或CI。不是重复跑CI冒充独立UAT；既执行任务规定原自动化，也另用采购员真实流程和独立文件/数据库核验。[命令/退出码汇总](automation-summary.json)。

## 5. 九组UX与核心业务实际证据

[逐项结果](results.csv)：UX01–09全部PASS。本SHA新数据验证通俗中文、唯一且真实的保存状态/技术详情；中文项目名、内部稳定身份；独占导航；常驻第一项目页；独立数据管理/重读取消；紧凑物料/图纸/供应商横排及52行分页；本节与第3节比价布局。

从真实Excel预览/确认12项开始，同码不同规格不合并身份；图纸1/2/0候选、确认前不写入、人工匹配到明确行并打开原件PDF逐字节相同。甲乙各12分配、丙2，追加/重复/移除关系和两种视角不会覆盖其他供应商；52项预览50+2、确认全52，正式分页/筛选跨页选择保持。

报价真实文件/粘贴/手工，甲R1V1→V2→R2V1，总5份确认/50历史行，V1不变、锁定确认，缺报须9项明确沿用；当前数量阶梯价118及2.25真实适用。刷新/切换模式保持草稿，文件与沿用预览危险刷新被拒绝且数据库不变。真实待决定10+2，末页有效120选价移出，75/75并列无需错误理由；82对20高价理由必须真实填写，空白/取消不提交；不供货/未报价不等于0。

人工3项 **¥1,979.00**、理论 **¥6,940.00**、建议组合 **¥7,064.00**分开显示并持久化。自身范围甲6420/乙7185/丙990，甲乙共同10项6420/6665，不跨范围乱排名。实际下载供应商ZIP、全部嵌套ZIP、CSV及Excel，完成 **{len(ex)}项内容/CRC/数量/单价/金额/报价范围/PDF字节/内部字段隔离核验**，无竞争方或内部JSON/原因外泄。

新第二项目52项隔离，跨项目来回、F5、真实服务重启后四表每行/历史/PDF哈希相同。真实PUT暂挂，ACK前数据库不变、三尺寸不假报已保存、S4不可下载；取消重读保留草稿，200后真正持久化；真实两标签409拒绝旧版本、保留成功方所有数据及旧页未保存内容，F5回到成功版本。[实际导出核验](attempt-02/evidence/export-checks.json)、[持久化](attempt-02/evidence/CORE07-after-service-restart.json)、[真实409](attempt-02/evidence/CORE08-conflict-http.json)。

## 6. 当前版S4安全回归：完整通过

真实UI下载本版完整包，11项核验ZIPCRC、manifest数据库SHA、SQLite integrity、四表全部行字段和三PDF哈希；源数据不变。只改一份PDF的1字节文本C→T替换、长度不变，保留manifest/文件名/顺序，其余文件逐字节一致，全entry为 **ZIP_STORED**，重新计算正确ZIPCRC，{tamper['checksPASS']}项构造预审通过，manifest期望SHA与实际改后PDF不符。

空目标实际UI拒绝400 **RESTORE_PDF_HASH_MISMATCH**；另用支持的Node HTTP捕获真实原body400 `RESTORE_REJECTED` / `RESTORE_PDF_HASH_MISMATCH`，不使用CDP Page Response.json；目标语义表/PDF、持久文件SHA、目录列表在两次拒绝后均不变，无资产/工作区发布，WAL/SHM易变文件另记不假称其字节稳定。这不是DEFLATED格式拒绝。

同一目标接着接受原合法ZIP200，所有两RFQ/历史/PDF与人工1979一致；非空UI拒绝及后端409 `RESTORE_TARGET_NOT_EMPTY` 后数据保持。[篡改预审](attempt-02/evidence/S4-tamper-preflight.json)、[真实拒绝审计](attempt-02/evidence/S4-audited-backend-rejection.json)、[目标前后](attempt-02/evidence/S4-empty-target-before.json)、[合法恢复](attempt-02/evidence/S4-positive-control-restored.json)、[非空拒绝](attempt-02/evidence/S4-nonempty-backend.json)。之前SHA的S4 PASS没有直接迁移为本次PASS。

## 7. 一个夹具遗漏、原始证据与边界

第一次独立尝试的7个已执行scope真实通过到三尺寸UI；导出实物已生成、前24项检查通过后，validator读取未生成的 `fixtures/business-expected.json` 抛FileNotFound。是**测试夹具前置遗漏**，不是产品导出错误。原错误、部分结果、trace/截图和当时输入夹具均保留，未写回假PASS。补充任务指定A/B期望价数组（不改任何产品/原测试/validator断言）；只在文件副本上预审46项通过（不计UAT）。然后新空attempt02从头重建全部独立采购与S4流程并完成。仅1次记录的夹具补全，[登记](driver-fixture-correction-01.json)、[路径差异](correction-paths.diff)、[原始错误](independent/evidence/raw-first-error.json)、[原trace](independent/evidence/trace-first-attempt.zip)。这次错误不能与旧SHA两次修正混算/抹掉。

完整成功trace：[attempt02](attempt-02/evidence/independent-trace.zip)。共{screens}张原始独立截图，全部可获取原套件trace/服务/浏览器日志与HTML报告无损归档，文件SHA回验，见[原始证据解包](README-raw-evidence.md)、[校验和](SHA256SUMS)。没有删掉失败尝试，也不将副本validator预审算成新增业务PASS。

**NOT TESTED 3组**：原生Windows Python3.13、Node22、PowerShell/BAT/本机启动安全。Linux及Node24不代替这些；GitHubActions本轮NOT RUN。旧模拟数据迁移按D024排除，桌面Excel/真实ERP所有语义、其他浏览器/字体/穷举负载/故障/无障碍未覆盖。未发现本准确SHA下已确认P1/P2/P3；结论仅限列出路径。

交ChatGPT审核：六条原测试及UX09已在当前SHA真实收口，云端范围READY；按D022，原生Windows与用户单独合并授权仍缺，因此 **M1合并门槛NOT READY**。本轮只追加现有PR50新目录，不创建新PR/Issue，不修改产品、既有测试、CI、开发/main/M1分支或主记忆，不合并/关闭任何PR。
'''
(D/'REPORT.zh-CN.md').write_text(zh)
en=f'''# PR #46 final-closure independent retest — TEST-ONLY

**Cloud scope: PASS / READY for scoped cloud review. Exact product SHA `{sha}` only.**

**Development-baseline merge gate: NOT READY**: native Windows3 untested, no officialActions run, and separate owner merge approval remains required. This scoped cloud success is not whole-product/release approval, Windows equivalence or GitHubActions SUCCESS.

| Actual executed scope | PASS | FAIL | NOT TESTED | BLOCKED |
|---|---:|---:|---:|---:|
| Targeted remaining6 +UX09 |{p1['expected']}|{p1['unexpected']}|0|0|
| Full Python |{p2['PythonPASS']}|0|0|0|
| Full Node |{p2['NodePASS']}|0|0|0|
| Full Chromium |{p2['Chromium']['expected']}|{p2['Chromium']['unexpected']}|0|0|
| Independent UX01–09 |9|0|0|0|
| Independent core subgroups |12|0|0|0|
| NativeWindows |0|0|3|0|

Full automation **{p2['fullPASS']}PASS/{p2['fullFAIL']}FAIL, {p2['total']}cases, zero skips/retries**. Overlapping targeted/full/independent sets are not added together. One independent fixture error and one documented correction remain explicitly recorded; fresh attempt02 then completes the buyerUAT. Historical795f663103/7 andUX8/1 evidence remains unchanged.

## Exact identity and authority

[Full task](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6415440257), [developer handoff](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6415422410) fully read. PR46 start/mid/end exact HEAD remains Draft/unmerged; detached `/workspace/srmf4-product` serves actual M1Lite. No concept prototype or synthetic merge target. This product branch lacks AGENTS/canonical memory files; repository PR48 unmerged HEAD6b4e43d AGENTS/PROJECT_STATE/DECISIONS were read as working rules, not represented as merged or edited.

[Start](identity-start.json), [end](identity-end.json), [startupHTTP](http-start.json), [fresh attempt02HTTP](http-attempt02-start.json), [endHTTP](http-end.json): source/servedHTML SHA256 `{h}`. Read-only post-run verification of **{http['capturedRootResponses']}captured original root responses** also matches ([trace audit](http-trace-identity.json)). Initial opportunistic8765fetch failed between original fixtures; not counted as a test or successful identity collection. Actual independent startup identity was verified on9865 before business actions.

Linux Python{identity['runtime']['python']}, Node{identity['runtime']['node']} (different from recommended22), Playwright1.58.2, genuine Chromium154.0.8037.57. Cloud runtime/network readiness inspected without exposing credentials. No GitHubActions triggered. Fresh fictional SQLite/PDF/quotes only; no old database/backup imported. Exact1979/6940/7064 expected values are the required synthetic fixture, not enterprise information.

## Targeted seven: whole original current-SHA tests completed

| ID | Exact original test name | Targeted | Full |
|---|---|---|---|
{table}

No Codex changes to original tests/assertions. All previously unreachable business paths completed: reload→Materials→search/PDF/isolated supplierZIP; real409/offline/restart/manualsave; full first material row; pending pagination; actual3price-button manual amount; ties/higher-reason and persistence. Independent PASS never overwrites an originalFAIL. [Raw cases](targeted-seven-results.json), [every automated case](automation-cases.csv).

## UX09 previous P3 resolved on this SHA

With12fresh material lines,3suppliers and confirmed multi-round quotes,1366×768,scrollY=0: **top={first['top']}px, bottom={first['bottom']}px, height={first['height']}px, maximum ordinary priced-row height={hi}px, viewport={first['viewport']}**. Price/detail centers both{first['priceCenter']}. Whole first selectable quotation row fits above768, height≤44. [Unaltered viewport screenshot](attempt-02/evidence/UX09-1366-real-priced-first-screen.png), [rawDOM](attempt-02/evidence/UX09-independent-before-awards.json).

Details genuinely expand without silently awarding; explicit price-button selections remain valid. All prices/tiers/terms and suggested/manual amounts remain available. The original exactUX09 completes geometry/alignment/disclosure in both runs. Boundary observation:1024 firstquote top841.21875/bottom883 requires vertical scrolling;1600 top858.390625/bottom900.171875 slightly crosses the viewport bottom. The complete-first-screen criterion is specifically1366 in this task; other sizes pass scroll reachability/no container clipping/no horizontal overflow, not whole-first-row visibility. Further cross-breakpoint vertical compaction is an improvement suggestion, not an unreported three-size first-screenPASS.

Twenty-one real layouts (7pages×1024×768/1366×768/1600×900) have documentWidth=viewport, no global horizontal overflow. Long material text uses approved ellipsis with completehover; full columns/details controls and actualEnter navigation work without changing DB/PDF. Actual pending/conflict/status/details tested at3sizes. [1024](attempt-02/evidence/UX-1024-quotes.png), [1366](attempt-02/evidence/UX-1366-quotes.png), [1600](attempt-02/evidence/UX-1600-quotes.png), [layout metrics](attempt-02/evidence/three-size-layouts.json). No claim for every font/resolution/accessibility case.

## Full original automation

| Command | Actual outcome | Raw evidence |
|---|---|---|
| `python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'` |{p2['PythonPASS']}PASS,exit0|[stderr](automation/phase2/python-backend/stderr.log)|
| `npm ci` |exit0,task-local writable cache|[command](automation/phase2/npm-ci/command.json)|
| `npm test` |{p2['NodePASS']}PASS,exit0|[stdout](automation/phase2/node-business/stdout.log)|
| `npm run test:e2e` |{p2['Chromium']['expected']}PASS/{p2['Chromium']['unexpected']}FAIL,exit0,0skip/retry|[stdout](automation/phase2/chromium-e2e/stdout.log)|

Targeted7 first, then fullPython/npmci/Node/Chromium. Independent browser starts only after secondnpmci to avoid module replacement races; separate ports/data from fullsuite. Actual runtimes/durations/exitcodes retained; no timeout/workers/retries/CI alteration. Independent buyer flows supplement original automation rather than replacing them. [Summary](automation-summary.json).

## Independent buyer business

[Itemized results](results.csv): allUX01–09 PASS for this currentSHA. Truthful single save state/diagnostics, meaningful names/stable IDs, exclusive navigation/permanent first Project stage, separate management/reread cancel, compact material/drawing/allocation and real52-line paging; comparison as above.

RealExcel preview/commit12items, same-code different-spec stable identities. PDF1/2/0candidates, preview without writes, manual explicit match and original viewer bytes. A/B12relations,C2; additive/dedup/remove/bothviews and52-row preview50+2/final52/filter/page selections preserve relationships.

File/paste/manual quotes; A R1V1→V2→R2V1,5confirmed submissions/50history rows,V1 immutable/locked,9explicit carries,tier118/2.25 based on true quantities. Non-destructive refresh/mode switch keeps drafts; dangerous file/carry preview refresh refused withoutSQLite changes. Pending10+2, actual last-page120price selection removes correct row;75/75ties need no false reason;82vs20needs real reason,blank/cancel does not commit; no-quote/cannot-supply are not0.

Manual3items **1979.00**, theoretical **6940.00**, suggested mixed **7064.00** remain distinct and persisted. Own-scopeA6420/B7185/C990, common10A6420/B6665. Actual supplier/nestedZIP/CSV/XLSX downloads pass **{len(ex)}content/CRC/quantity/price/math/scope/originalPDF/internal-data-separation checks**. No competitor/internalJSON/reason leakage.

Secondfresh52-lineRFQ isolated; RFQswitch/F5/real server restart preserve all4tables/everyrow/history/PDF. Held realPUT keeps DB unchanged, status truthful and backup disabled at3sizes; canceled reread keeps draft; actual200persists; real two-tab409 preserves winner and stale unsaved name, F5 returns winner. [Exports](attempt-02/evidence/export-checks.json), [restartDB](attempt-02/evidence/CORE07-after-service-restart.json), [real409](attempt-02/evidence/CORE08-conflict-http.json).

## Current-version S4 safety genuinely rerun

ActualUI full ZIP download;11checks validateCRC/manifestDBSHA/SQLite integrity/all4tables/allrows/3PDF hashes, source unchanged. One same-lengthPDFtext byte changed; filenames/order/manifest expectedSHA unchanged, all other entries identical; allZIP_STORED andcorrect rebuiltCRC, {tamper['checksPASS']}preflight checks. Real empty-targetUI400 **RESTORE_PDF_HASH_MISMATCH**, supportedNodeHTTP realbody400`RESTORE_REJECTED`/samehasherror, notDEFLATED/UNSUPPORTED_ARCHIVE. No CDPPageResponse.json.

Both refusals preserve target semantic rows/PDF, persistent file hashes and directory lists, no workspace/asset publication. SQLiteWAL/SHM separately recorded volatile, not falsely byte-stable. Same target then accepts original validZIP200, bothRFQs/history/PDF/manual1979 identical; nonemptyUIrefusal andactual409`RESTORE_TARGET_NOT_EMPTY` preserve all data. [Tamper preflight](attempt-02/evidence/S4-tamper-preflight.json), [raw backend audit](attempt-02/evidence/S4-audited-backend-rejection.json), [before target](attempt-02/evidence/S4-empty-target-before.json), [restored](attempt-02/evidence/S4-positive-control-restored.json), [nonempty](attempt-02/evidence/S4-nonempty-backend.json). No transfer of old-SHA S4PASS to this run.

## One fixture omission, raw records and limitations

First independent attempt completes core01–05/three-sizeUI, creates actual exports and passes24file checks, then missing `fixtures/business-expected.json` raisesFileNotFound beforeCSV/math validation. **Test fixture precondition error**, not product export defect. Raw error/trace/screenshots/partialresults/inputsnapshot preserved. Added the required numericA/B oracle, changing no product/original tests/validator assertions. Copy-only46check preflight is notUAT. Fresh emptyattempt02 rebuilds all buyer flows and completes S4. One documented fixture correction; [record](driver-fixture-correction-01.json), [path-only driverdiff](correction-paths.diff), [originalerror](independent/evidence/raw-first-error.json), [failedtrace](independent/evidence/trace-first-attempt.zip). Do not mix this correction with olderSHA runs or erase originalFAIL.

[Completed independent trace](attempt-02/evidence/independent-trace.zip). {screens}unaltered independent screenshots; all available original traces/HTMLreport/browser/server logs losslessly archived and hash-revalidated. [Extraction](README-raw-evidence.md), [SHA256](SHA256SUMS). No failed attempt discarded or copy-only preflight counted as extra businessPASS.

**NOT TESTED3:** nativeWindows Python3.13,Node22,PowerShell/BAT/local-launch safety. Linux/Node24does not substitute; officialActionsNOT RUN. Old synthetic migration excludedD024; desktopExcel/fullrealERP semantics/otherbrowsers/fonts/exhaustive load/fault/accessibility outside coverage. No confirmedP1/P2/P3 on testedcurrentSHA; absence of observations is not proof for untested scope.

Hand toChatGPT: cloud remediation scope **READY**, six original tests andUX09 genuinely closed; **M1merge gate NOT READY** until nativeWindows and separate owner authorization underD022. Only new directory on existingDraftPR50 appended; no newPR/Issue, product/originaltest/CI/protectedbranch/canonicalmemory edit, merge or close.
'''
(D/'REPORT.en.md').write_text(en)
(D/'README-raw-evidence.md').write_text('''# Raw evidence / 原始证据\n\nOnly this new directory appended to existing Draft PR50; every historical directory unchanged. reports/results.csv separate overlapping automation and independent sets.\n\nEach automation/phase1 or phase2 holds command logs, original results JSON, complete HTML report and all original runner files as lossless standard tar/gzip with content-deduplicated hardlinks. To reconstruct within that phase:\n\n```bash\ncat raw-parts/all-original.tar.gz.part* | tar -xz -f -\n```\n\nValidate archive.json/original-file-manifest.json. Original attachment runtime paths are mapped to the matching extracted phase. Use `npx playwright show-trace test-results/<case>/trace.zip` or `npx playwright show-report playwright-report`. trace-integrity.json inventories files actually present, without claiming missing traces exist.\n\nindependent/ is the preserved first attempt ending in missing oracle fixture. attempt-01-fixtures/ retains its inputs. methods/ is its standalone driver source. methods-attempt02/ changes runtime paths only; attempt-02/ is the fresh complete run. driver-fixture-correction-01.json records the sole correction. Copy-only validator preflight is not counted as UAT; all real final46checks live in attempt-02/evidence/export-checks.json.\n\nAll material/supplier/pricing/PDFs are fictitious, all SQLite is task-local. No old business data/ZIP used as input. Standalone helpers have absolute runtime paths as execution provenance; preflight before reproduction in a new isolated folder. They do not modify original product tests. Validate delivered files with `sha256sum -c SHA256SUMS`; inventory excludes itself.\n''')
shutil.copy2(R/'write-reports.py',D/'write-reports.py')
files=sorted(p for p in D.rglob('*')if p.is_file()and p.name!='SHA256SUMS');(D/'SHA256SUMS').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+str(p.relative_to(D))+'\n'for p in files));print('REPORTS_COMPLETE',len(files),'files')
