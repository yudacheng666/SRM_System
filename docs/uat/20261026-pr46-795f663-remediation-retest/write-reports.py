from pathlib import Path
import json,hashlib
D=Path('/tmp/srm66-evidence/docs/uat/20261026-pr46-795f663-remediation-retest');s=json.loads((D/'automation-summary.json').read_text());a=json.loads((D/'automation/AF-remediation-classification.json').read_text());sha=s['productSHA'];c=s['phase2']['chromium'];n=s['phase2']['fullTotal'];u=json.loads((D/'execution-summary.json').read_text())
target='https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6414197317'
table='\n'.join('| '+x['id']+' | '+x['title']+' | '+x['phase1']+' | '+x['phase2']+' |'for x in a)
zh=f'''# PR #46 整改独立复验 / TEST-ONLY

**结论：NOT READY。** 唯一产品 SHA：`{sha}`。本轮保留全部失败，未修改产品、原测试、CI、开发分支、main/M1或主记忆，未合并/关闭PR，未触发GitHub Actions。

定向16项 **12 PASS /4 FAIL**：原AF15项 **12 PASS /3 FAIL**，新UX09 **FAIL**。随后完整110项 **{n['PASS']} PASS /{n['FAIL']} FAIL**（Python44、Node10、Chromium{c['PASS']}/{56}）；0跳过/0重试。独立UX九组 **8 PASS /1 FAIL**，核心业务 **12 PASS**，原生Windows **3 NOT TESTED**。这些集合有重叠，不能相加当成独立总覆盖。原66a0579报告94/15及7/1/1完全保留。

## 1. 授权、版本与执行环境

[完整任务]({target})及PR46整改评论已读；按阶段先定向、无确认P1/P2产品安全失败后完整套件、最后S4合法内容篡改补测。补读PR48未合并记忆HEAD `92ba152de443efda536b97468d40d32dfc23f9c1`的AGENTS/PROJECT_STATE/DECISIONS，仅作为工作规则，不修改或宣布已合并。

正式M1 Lite detached checkout `/tmp/srm795-product`；PR46开始/中途/结束HEAD均为上述SHA、Draft、未合并。[开始身份](identity-start.json)、[结束身份](identity-end.json)、[HTTP开始](http-start.json)、[attempt03 HTTP](http-attempt03-start.json)、[HTTP结束](http-end.json)：实际静态页面SHA256均为 `7ee6b0c38e39ad70b122b7003477357905998cfcaeaa3044c31443fcbc1b2176`，与该checkout一致。没有运行PR23静态原型或合成合并提交。

Linux Python3.12.14、Node24.19.0（不是建议Node22）、Playwright1.58.2、真实Chromium154.0.8037.57。使用任务独立目录/端口/SQLite/虚构RFQ与PDF，每次独立驱动修正后从全新空目录重启；未用旧SHA数据库/ZIP作输入。官方GitHub Actions未运行，本轮不能称其成功，也未完成Windows/用户合并审批门槛。

## 2. 原15项与新密度测试

| 原失败ID | 原测试准确名称 | Phase1 | Phase2 |
|---|---|---|---|
{table}

通过的12项已走完整原测试，包括B3两个分辨率以及此前未到达的断言。失败三项不是先前失败点原封不动：旧badge/首个项目抽屉断言已走通，但后续仍有适配缺口：

- **AF-02 / acceptance05**：reload后当前项目页，239行直接fill隐藏`#itemSearch`，未进入物料页。后面的PDF/询价ZIP断言仍 **NOT REACHED**。
- **AF-04 / acceptance07**：旧标签和真实409/停止重试断言通过；停服务后313行在物料页fill隐藏`#pilotCounterpartyCode`（CP-OFFLINE），超时。后续断线/重启手工保存断言仍 **NOT REACHED**。Phase1还发生trace结束时ZIP central-directory错误，该项没有生成trace附件；原截图/context/server log均保留。Phase2原trace真实存在并确认上述等待动作，未用重写测试掩盖错误。trace-finalization内部根因未知。
- **AF-06 / acceptance13**：初始项目页检查已通过；reload后486行仍要求常驻项目details关闭，实际open。后面的首行检查 **NOT REACHED**。

保留 **P2-TEST-01（测试适配/覆盖缺口）**，不冒充已确认产品业务故障；独立补测通过不覆盖这些FAIL。详细原始错误、准确行号、每阶段截图、trace位置见[分类](automation/AF-remediation-classification.json)、[只读trace动作](AF04-waiting-action-readonly.json)、`automation/phase*/failures/`。原套件一字未改。

**P3-UX09-01 仍FAIL（产品视觉/操作体验）**：普通真实报价行 **44.4375px**，新原测试精确要求≤44px，因此仍失败；比上轮58–62px改善，但不舍入为通过。更主要是1366×768页面滚至顶部，首个实际报价行top **843.96875px**，首屏依旧没有报价。12行/3供应商独立实测截图和坐标支持该结论。价格/详情中心完全同行，展开不误定标，显式价格按钮选择、理由、金额均通过。

复现：导入`fixtures/buyer-items.xlsx`12项及三家供应商，按独立methods01–05建立真实多轮报价；1366×768进入“比价议价”，滚至顶；首行在768px以下。新原UX09测试在44.4375断言即失败，因此其后首屏/对齐断言未执行；本轮独立路径另测后两者，分别FAIL/PASS。影响是采购员需要先滚动才能进入核心报价矩阵。建议ChatGPT压缩矩阵上方重复说明/范围区，保留真实字段/详情/点击目标；测试方不修复。

证据：[真实首屏](attempt-03/evidence/UX09-1366-real-priced-first-screen.png)、[原始坐标](attempt-03/evidence/UX09-independent-before-awards.json)、[展开详情](attempt-03/evidence/UX09-expanded-price-details.png)。没有确认P1/P2产品数据或安全缺陷；未知/未测不等于没有缺陷。

## 3. 完整原自动化

| 命令 | 结果 | 原始记录 |
|---|---|---|
| Python unittest discover（任务原命令） |44 PASS，exit0|[日志](automation/phase2/python-backend/stderr.log)|
| `npm ci`（独立可写cache） |exit0|[命令](automation/phase2/npm-ci/command.json)|
| `npm test` |10 PASS，exit0|[日志](automation/phase2/node-business/stdout.log)|
| `npm run test:e2e` |{c['PASS']} PASS /{c['FAIL']} FAIL，56实际执行，exit1；0skip/0retry|[日志](automation/phase2/chromium-e2e/stdout.log)|

定向与完整分别报告，不加总重复用例；所有case见[automation-cases.csv](automation-cases.csv)。每条命令准确版本、开始时间、耗时、退出码均在对应command.json。npm ci为避免替换正在用的模块，等待第二次独立尝试停止后才执行；独立第三轮在安装完毕后启动。没有通过反复跑失败用例筛选成功样本。

## 4. 独立采购业务和九组UX

[逐项结果](results.csv)。UX01–08在当前SHA均有新数据和实际界面证据：一个真实常驻保存状态/详情、中文名与稳定ID、唯一导航高亮、独立第一项目页、管理与保存保护、紧凑物料/图纸/分配和52行分页。UX09因上述密度/首屏FAIL。

真实业务：12项同码不同规格物料、3家虚构供应商、3份多页PDF；1/2/0候选预览、确认前数据库不变、手工匹配及原件字节核验。甲R1V1→V2→R2V1，5份确认/50条报价历史，9项显式沿用、历史锁定和118/2.25阶梯适用价保持。物料/供应商双向追加、重复、删除关系、52行预览50+2和正式分页/筛选选择保持。

比价真实待决定10+2；并列75/75允许任一，82对20高价理由空白/取消不提交；未报价/不供货不算零；人工3项 **¥1,979.00**、理论 **¥6,940.00**、建议组合 **¥7,064.00**严格区分。自身范围甲6420/乙7185/丙990，共同10项甲6420/乙6665。实际ZIP/CSV/Excel下载完成 **46项内容核验**，数量/报价/供应商范围/PDF原字节/内部字段隔离通过。

另一个52项询价隔离无泄漏；跨询价、F5、真实服务重启后四表全行及PDF相同。真实业务修改PUT暂挂，200前数据库不变且三尺寸不假报已保存；取消重读保留草稿；真实并发409保留成功方全部数据及旧页未保存草稿，刷新只回读成功版本。

## 5. S4 合法ZIP_STORED内容篡改：真正完成原缺口

全新当前源数据真实UI下载`current-S4-full.zip`；11项完整性核验：CRC、manifest数据库SHA、SQLite integrity、四表全部行字段、三份PDFSHA。备份不修改源数据。

[构造预审](attempt-03/evidence/S4-tamper-preflight.json)：全部entry是ZIP_STORED；保留文件名/顺序和manifest原字节/hash；只把PDF中`Remediation795`的首字节R改T，**仅1字节、长度不变**，PDF结构及页仍有效；ZIP重新计算正确CRC，testzip通过，所有其他文件原字节不变。manifest继续要求原PDFSHA，实际改后SHA不同。**不是ZIP_DEFLATED，不是RESTORE_UNSUPPORTED_ARCHIVE。**

空目标真实浏览器上传并恢复，HTTP400，按钮附近明确 **RESTORE_PDF_HASH_MISMATCH**。再用Node原生HTTP客户端捕获同一包的真实后端body：`error=RESTORE_REJECTED`, `message=RESTORE_PDF_HASH_MISMATCH`，HTTP400；[审计](attempt-03/evidence/S4-audited-backend-rejection.json)包含时间/请求hash/响应body/UI原文。未使用会触发CDP缓存问题的Page Response.json。

UI与HTTP两次拒绝前后，目标四表每行、PDF、持久文件字节SHA及目录列表均相同；SQLite WAL/SHM单独记录为易变运行文件，不据此谎称所有瞬时字节不变。拒绝未发布资产/工作区，空目标保持空。紧接着**同一个目标**接受原合法包HTTP200，恢复两询价全部历史/PDF/人工1979；再做非空UI拒绝与后端409 `RESTORE_TARGET_NOT_EMPTY`，目标全量数据保持。UX05和CORE09D这次才按实测改为当前SHA的PASS，旧BLOCKED报告不修改。

## 6. 驱动错误、原始证据和未测边界

两次允许的驱动修正均完整保留，额度已用完；没有第三次修正。

1. attempt01错误点击整报价单元格中心，命中新布局详情入口，未执行定标；改为精确`.quotePrice`按钮，原业务断言保留，新空目录attempt02。
2. attempt02实际导出已下载，但独立validator残留另一次attempt03路径，内容断言前FileNotFound。明确传入真实root并保留全部46断言。先对副本做validator-only预审（不计为UAT通过），随后从新空目录attempt03全部重跑。

第三次独立尝试完整结束，无新驱动故障。先前两次原始错误、trace、截图、方法快照、diff保留，[错误登记](raw-error-register.json)。原Phase1 AF04 trace缺口如第2节如实说明，不能宣称每条都有trace；其他所有可获取原始trace、runner与HTML报告均无损归档，并逐文件hash回验。[解包说明](README-raw-evidence.md)、[SHA256](SHA256SUMS)。

三个尺寸1024×768、1366×768、1600×900，各7页实际操作，21布局文档宽度与屏宽相符；保存中/409/技术详情、报价详情和金额均有截图。主要图：[1024](attempt-03/evidence/UX-1024-quotes.png)、[1366](attempt-03/evidence/UX-1366-quotes.png)、[1600](attempt-03/evidence/UX-1600-quotes.png)。

**NOT TESTED**：原生Windows Python3.13、Node22、PowerShell/BAT/本机启动安全3组；没有真实Windows。未覆盖旧模拟数据迁移（D024明确排除）、桌面Excel/真实ERP全语义、多浏览器、穷举故障/负载/无障碍。原AF02/04/06停止点以后的原断言未到达，不能由独立补测推断其原测试通过。

下一步：ChatGPT处理剩余三条原测试适配和P3比价首屏/密度，审核本轮证据；新SHA需重新复验。**不建议把当前结果认定为完整开发验收或合并门槛完成。** 本轮只追加PR50新目录，所有旧证据、产品、测试、CI、主记忆和保护分支保留不变。
'''
(D/'REPORT.zh-CN.md').write_text(zh)
en=f'''# PR #46 remediation independent retest — TEST-ONLY

**Verdict: NOT READY. Product SHA `{sha}` only.** Targeted16: **12 PASS /4 FAIL** (old AF15:12/3; new UX09:FAIL). Full original110: **{n['PASS']} PASS /{n['FAIL']} FAIL**: Python44/44, Node10/10, Chromium{c['PASS']}/56, zero skips/retries. Independent buyer UX: **8 PASS /1 FAIL**; core business: **12 PASS**; native Windows: **3 NOT TESTED**. These overlapping sets must not be added together. Historical66a0579 evidence94/15 andUX7/1/1 remains unchanged.

## Authority and exact identity

[Full task]({target}) and PR46 remediation handoff read, plus AGENTS/PROJECT_STATE/DECISIONS from unmerged PR48 HEAD92ba152. Targeted phase preceded full original suites after no confirmed P1/P2 product safety failure; the valid STORED negative followed full suites. Real M1 Lite detached checkout, localhost Chromium and new isolated fictional SQLite/PDFs; no old DB/archive imported. PR46 exact HEAD verified at start/mid/end, still Draft/unmerged. [Identity start](identity-start.json), [end](identity-end.json), [HTTP start](http-start.json), [fresh attempt03 HTTP](http-attempt03-start.json), [HTTP end](http-end.json) match checkout HTMLSHA256 `7ee6b0c38e39ad70b122b7003477357905998cfcaeaa3044c31443fcbc1b2176`.

Linux Python3.12.14, Node24.19.0 (different from recommended22), Playwright1.58.2, genuine Chromium154.0.8037.57. No GitHub Actions triggered or claimed successful. No product, original tests, CI, canonical memory or protected branches changed; no PR created/merged/closed. Only the authorized new directory on existing DraftPR50 is appended, parent369e2b7.

## Original failures: exact targeted and full outcomes

| Old ID | Exact original test | Targeted | Full |
|---|---|---|---|
{table}

Twelve repaired tests ran completely, including both B3 sizes and previously unreached assertions. Three remain **P2-TEST-01 coverage/test adaptation defects**, not confirmed product data defects:

- **AF02 acceptance05:** old badge now passes, then line239 fills hidden`#itemSearch` after reload on Project without entering Materials. Later PDF/ZIP assertions **NOT REACHED**.
- **AF04 acceptance07:** badge and genuine409/stop-retry checks pass; after stopping the service, line313 fills hidden supplier code`CP-OFFLINE` on the Materials page. Remaining offline/restart/manual-save assertions **NOT REACHED**. Targeted timeout also caused ZIP central-directory failure during trace finalization; no trace attachment for that case. Screenshots/context/server logs preserved. Full-run original trace exists and proves the last waiting selector; finalizer failure root cause is unknown.
- **AF06 acceptance13:** initial project check passes; after reload line486 still expects the intentionally permanent project details closed. Later first-row assertion **NOT REACHED**.

[Classification and raw errors](automation/AF-remediation-classification.json), [read-only original trace action](AF04-waiting-action-readonly.json), per-phase failures and [all cases](automation-cases.csv). Independent business success never rewrites the original FAILs.

## Confirmed P3-UX09-01 remains

Real ordinary comparison row height is **44.4375px**, above the new exact≤44 assertion; improved from58–62px but not rounded to PASS. More significantly, at1366×768, top scroll, first actual quotation row is at **y843.96875**, below the first screen. Reproduce with fresh12-line/3supplier fixtures and real confirmed quotes; open Comparison and scroll top. [Screenshot](attempt-03/evidence/UX09-1366-real-priced-first-screen.png), [DOM measurements](attempt-03/evidence/UX09-independent-before-awards.json).

Price and detail centers align exactly; detail disclosure does not silently award, explicit price button selection remains correct. Original UX09 stops at height before its first-screen/alignment assertions; independent actual-data checks separately record first-screenFAIL/alignmentPASS. Buyer impact: scrolling is required before reaching the central quote matrix. ChatGPT should review the space above the matrix and density while preserving fields and controls. No confirmed P1/P2 product data/safety defect observed; untested/unknown does not prove absence.

## Full original automation

| Command | Actual result | Evidence |
|---|---|---|
| `python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'` |44PASS, exit0|[stderr](automation/phase2/python-backend/stderr.log)|
| `npm ci` |exit0 with writable task cache|[command](automation/phase2/npm-ci/command.json)|
| `npm test` |10PASS, exit0|[stdout](automation/phase2/node-business/stdout.log)|
| `npm run test:e2e` |{c['PASS']}PASS/{c['FAIL']}FAIL,56executed,exit1,0skips/retries|[stdout](automation/phase2/chromium-e2e/stdout.log)|

Exact commands/times/durations/exit codes retained. npm ci waited for independent attempt02 to stop before replacing modules; fresh attempt03 started after install. Targeted duplicates are not added to full totals. Failed original tests were never edited or selectively retried to obtain PASS.

## Independent buyer UAT

[Itemized bilingual CSV](results.csv). UX01–08 freshly verified: truthful single save state and technical details, meaningful project names/stable IDs, unique navigation, first permanent Project page, separate administration/guards, compact item/drawing/allocation lists and real52-row paging. UX09FAIL as above.

Fresh12material lines include same-code distinct-spec identities;3suppliers;3valid multi-page PDFs. Matching1/2/0 candidates, safe preview/manual confirmation, real PDF viewer/original bytes. A R1V1→R1V2→R2V1,5confirmed submissions/50historical lines, explicit9-line carry, immutable prior versions, applicable tier118/2.25. Allocation is additive/deduplicated in both views, relation removal preserves others; actual52-row preview50+2, final list/paging/filter selection preserved.

Pending10+2;75/75tie accepts either;82vs20requires a real higher-price reason, cancel/blank does not commit; absent/cannot-supply quotes are not0. Manual3items **1979.00**, theoretical **6940.00**, suggested mixed **7064.00** remain distinct. Own-scopeA6420/B7185/C990, common10itemsA6420/B6665. Actual ZIP/CSV/XLSX exports passed46 independent content/CRC/quantity/math/supplier-separation/PDF-byte checks.

Second52-line RFQ isolated; switching/F5/real service restart preserve every row/history/PDF. Held realPUT does not change SQLite or falsely show saved across3sizes; actualACK200 persists; canceled reread retains draft; genuine stale-tab409 preserves committed winner and stale in-memory unsaved name, F5 reads winning state.

## S4 valid ZIP_STORED tampering gap genuinely closed

Actual UI downloads current full ZIP;11integrity checks validateCRC,manifest DB SHA,SQLite integrity,all4tables/allrows and3PDF hashes; source unchanged. [Tamper preflight](attempt-03/evidence/S4-tamper-preflight.json): every entrySTORED, names/order and manifest bytes unchanged; exactly1PDF byte`Remediation795`R→T changed, same length, remainingPDF structure intact, correct rebuiltZIPCRC, all other contents identical. Expected manifestPDFSHA stays original while actualPDFSHA differs. This is **not DEFLATED / UNSUPPORTED_ARCHIVE rejection**.

Actual browser restore into fresh empty target returns400 and visible **RESTORE_PDF_HASH_MISMATCH**. Supported NodeHTTP capture independently submits the identical bytes and records real400 body`error=RESTORE_REJECTED`, `message=RESTORE_PDF_HASH_MISMATCH`. [Audit](attempt-03/evidence/S4-audited-backend-rejection.json) includes timestamps/requesthash/headers/rawbody/UI feedback. No PageResponse.json/CDP cache-body access.

Before/after both refusals: all semantic rows/PDFs, persistent file byte hashes and directory lists unchanged; no published/staging workspaces/assets. SQLiteWAL/SHM are separately recorded volatile runtime files, not misrepresented as byte-stable. **Same target positive control** then restores original valid archive200, matching bothRFQs/allhistory/PDF/manual1979. NonemptyUI refusal plus realHTTP409`RESTORE_TARGET_NOT_EMPTY` leaves complete restored state unchanged. UX05 andCORE09D only now PASS for this newSHA; historicalBLOCKED stays untouched.

## Driver records and limits

Both allowed corrections retained; no third correction. Attempt01 whole-cell center hit new detail disclosure instead of price; exact`.quotePrice` target fixed with all business assertions retained, fresh empty attempt02. Attempt02 export validator used stale attempt03 path and failed before content checks; explicit actualroot argument fixed with all46assertions retained. Copy-only validator preflight is not counted as UAT; new empty attempt03 reran complete flows and ended without a new error. [Raw error register](raw-error-register.json), original failed traces/screenshots, method snapshots and diffs retained.

Twenty-one page layouts (7pages×3sizes) match document/screen width; real pending/conflict/details controls and keyboard evidence retained. [1024](attempt-03/evidence/UX-1024-quotes.png), [1366](attempt-03/evidence/UX-1366-quotes.png), [1600](attempt-03/evidence/UX-1600-quotes.png). All available original runner/HTML report bytes losslessly archived and hash-revalidated; phase1AF04 missing trace is explicitly disclosed. [Extraction](README-raw-evidence.md), [SHA256SUMS](SHA256SUMS).

**NOT TESTED:** nativeWindows Python3.13,Node22,PowerShell/BAT/local-launch safety3groups; no nativeWindows. Old synthetic migration excluded byD024, desktopExcel/fullrealERP semantics, other browsers/exhaustive load/fault/accessibility not covered. Unreached original assertions remain unreached despite related independent PASS.

ChatGPT should resolve the3remaining original-test adaptations and P3comparison first-screen/density, review evidence, then request exact-new-SHA retest. Current result is **not a completed development acceptance/merge gate**, officialCI success, Windows equivalence or release approval.
'''
(D/'REPORT.en.md').write_text(en)
(D/'README-raw-evidence.md').write_text('''# Raw evidence / 原始证据\n\nOnly this new directory appended to existing Draft PR50; historical reports unchanged. See bilingual reports and results.csv.\n\nAutomation files for BOTH runs are retained with original path/bytes/hash, including HTML report duplicate paths (standard tar hardlinks deduplicate content). Original attachment paths reference runtime /tmp/srm795-product; use the corresponding phase extraction.\n\nFor each automation/phase1 or phase2, download raw-parts/all-original.tar.gz.part* in numeric order into a local copy, then:\n\n```bash\ncat raw-parts/all-original.tar.gz.part* | tar -xz -f -\n```\n\nValidate archive.json and original-file-manifest.json SHA256. Use local `npx playwright show-trace test-results/<case>/trace.zip` for available original traces, or `npx playwright show-report playwright-report` for the HTML report. Phase1 AF04 has no trace attachment after a trace-finalization ZIP error; screenshots/context/server logs remain. trace-integrity.json validates the files that actually exist, not nonexistent attachments.\n\nIndependent successful attempt03 includes independent-trace.zip and screenshots/browser.jsonl/server logs/downloads. Failed attempts independent/ and attempt-02/ remain unchanged. methods/ contains NEW independent drivers only; product/original tests/CI were never edited. Driver helper absolute runtime paths are provenance, not portable entrypoints; review before reproducing in a fresh isolated folder. No production data is included.\n\nValidate all delivered files using `sha256sum -c SHA256SUMS` from this directory. SHA256SUMS intentionally excludes itself.\n''')
for name in ['task-read.md','AF04-waiting-action-readonly.json','finalize-new.py','write-reports.py']:
 import shutil;shutil.copy2(Path('/workspace/uat795')/name,D/name)
files=sorted(p for p in D.rglob('*')if p.is_file()and p.name!='SHA256SUMS')
(D/'SHA256SUMS').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+str(p.relative_to(D))+'\n'for p in files))
print('REPORTS_COMPLETE',len(files),'files',flush=True)
