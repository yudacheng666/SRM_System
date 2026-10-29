from pathlib import Path
import json,shutil,datetime,csv
R=Path('/workspace/uatfbb');D=Path('/workspace/srmf8-evidence/docs/uat/20261029-pr46-fbb9894-final-uat');SHA='fbb98944a4bcee439e4e81ebfe3ef710bee4a3d0'
summary=json.loads((D/'execution-summary.json').read_text());ind=json.loads((D/'independent-summary.json').read_text());rows=json.loads((D/'results.json').read_text());archive=json.loads((D/'automation/archive.json').read_text());now=datetime.datetime.now(datetime.timezone.utc).isoformat()
focus='| Current original case | Whole-case result | Evidence |\n|---|---|---|\n'+'\n'.join('| '+x['title']+' | '+x['wholeCaseStatus']+' | [case/trace]('+x['evidence']+') |'for x in json.loads((D/'focus-five-results.json').read_text())['cases'])
gallery='| Page | 1024×768 | 1366×768 | 1600×900 |\n|---|---|---|---|\n'+'\n'.join('| '+t+' | '+' | '.join('[Screenshot](independent/evidence/VISUAL-'+str(w)+'-'+t+'.png)'for w in [1024,1366,1600])+' |'for t in ['project','items','assign','quoteImport','quotes','backup'])
zh=f'''# PR46 · fbb9894 最新版本独立验收（TEST-ONLY）

**结论：NOT READY。** 完整原套件为 **111 PASS /1 FAIL**；独立采购业务、三尺寸界面、保存与恢复的最终补充证据通过，但原UI集成用例仍在后续旧断言处失败，原生Windows三组未测。没有新确认产品P1/P2/P3缺陷；1项P3测试维护问题及3次本轮独立驱动异常均单独保留，不把它们混报为产品缺陷或隐去。

唯一产品SHA：**`{SHA}`**。报告日期2026-10-29（Asia/Shanghai）；原始运行日志UTC，报告生成UTC `{now}`。任务：[PR46最新交接](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6492833285)、[PR50任务](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6492834238)及本轮用户指令。[任务/版本原文](github-task-version.json)。

## 版本、真实程序与环境

固定SHA在 `/workspace/srmfbb-product` detached checkout；开始/结束核对PR46产品分支一致，未使用合成merge版本。真实Chromium访问正式M1-Lite `prototype/m1-lite/index.html`，仓库 `tests/e2e/serve.py`启动实际后端/SQLite API，不是静态概念页或模拟业务服务。全自动和独立业务均以新的隔离目录、虚构物料/供应商/报价/PDF开始，不读用户本机真实资料、不导入旧SHA数据库/ZIP、不测旧模拟数据迁移。

Linux / Python3.12.14 / Node24.19.0 / Playwright1.58.2 / Chromium154.0.8037.57。Windows、cmd.exe、PowerShell不可用，Linux结果不替代Windows。中断后只续用**本轮固定SHA新建的自有测试数据库**，先核对已提交检查点不变；每个续验的日志、下载和trace有独立目录。

[起始身份](identity-start.json)、[结束身份检查](identity-after-suites.json)、[HTTP身份](http-trace-identity.json)：58份原测试trace和3份独立trace中共 **87个实际HTTP200根页面响应**，全部SHA256等于当前源码HTML：`bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3`，缺失响应体0。产品tracked工作区干净；[保护记录](preservation.json)证明main/开发基线/产品分支未变。只向既有DraftPR50追加本目录，父证据提交`0c4e08a82ac5835d088c93cb9d82424bd3065bcd`，旧报告原样保留。

## 完整自动化与上轮五项

| 原完整套件 | PASS | FAIL | 退出码 |
|---|---:|---:|---:|
|Python后端 unittest discover|44|0|0|
|Node业务 npm test|10|0|0|
|Chromium完整 npm run test:e2e|57|1|1|
|合计|111|1|—|

`npm ci`成功；E2E workers1、retry0、skip0、flaky0。完整执行全部原测试，没有删用例、改原测试、放宽断言或以重跑覆盖失败。[全部112项CSV](automation-cases.csv)、[运行命令/退出码](COMMANDS.md)、各套件`automation/*/command.json`、[原始完整日志](automation/chromium-e2e/stdout.log)。没有触发GitHub Actions，也不宣称正式Actions通过。

{focus}

**五个旧失败点本身都已走过**：损坏ZIP文案/无内部码/空目标，以及三项名称选择及其后续全部业务断言通过；批准背景色#F6F8FB在原case及独立18个页面状态下通过。但是五条**完整用例**是4PASS/1FAIL，不能写成5PASS。

唯一原套件失败：`ui-v3-integration.spec.cjs:76`，要求`.srm-v3-pageKicker`匹配`/\\d\\d|ADMIN/`，实测“系统设置”。背景色检查已在此前通过，继续执行才暴露这条旧英文标识断言。分类 **P3-TEST-01：测试期望过时/中文路由标题不一致**，不是已确认采购功能错误。复现：在固定SHA运行原完整E2E；详情见 [原错误/截图/trace](automation/failures/FAIL-01) 与 [分类](automation/failure-classification.json)。建议ChatGPT核对当前批准的中文标题后修正测试语义，保留其后全部导航/布局/业务状态断言；验收员未改。**第76行之后未执行的断言仍NOT REACHED**，不由独立六页测试代为认定通过。

## 独立验收逐项结果

[逐项明细](RESULTS.md) / [CSV](results.csv)：归并需求行 **32PASS /2FAIL /3NOT TESTED /0最终BLOCKED**。2FAIL分别是完整套件和其中的完整UI用例，指向同一原始失败，有重叠。1130条底层检查/观察日志亦有重复和子断言，不能当作1130个独立用例。原驱动中断及当时BLOCKED保留在异常表，没有被最终补充PASS覆盖。

- **六页与浮层 PASS**：18张真实页面截图均已目视检查；共用#F6F8FB背景、14.5px字体、中文层级、侧栏/按钮风格，无重大首屏遮挡或整页横向溢出。1024的宽表仍使用表内横向滚动，不误报为整页溢出。83个实际可见说明浮层（28/27/28）逐一检查悬停、四边界、真实Tab进入、焦点/悬停保持时Esc关闭、点击固定和外部关闭，全PASS，业务/历史/PDF未变。[浮层JSON](independent/evidence/tooltip-retest.json)、[视觉评审](visual-review.json)。
- **1366首行 PASS**：[真实报价截图](independent/evidence/UX09-1366-real-priced-first-screen.png)，scrollY0，首行top701.140625、bottom742.921875、高41.78125px，整行完整可见，价格/详情同一水平线。
- **采购与历史 PASS**：新12行/3供应商/3PDF项目，重复编码不同规格、图纸唯一/多候选/未匹配、追加多对多分配、Excel/粘贴/手工、多轮及同轮修订、预览保护均实际操作。5个确认版本/50行历史保留，V1不变、9行显式沿用、有效阶梯价118/2.25。人工3项¥1979与理论¥6940/建议组合¥7064区分，剩余待定9；同价无需高价理由，真高价必须给理由。
- **真实文件与持久化 PASS**：46项供应商ZIP/CSV/比价XLSX内容检查；30项备份分类/排除原邮件聊天凭证检查；第二项目52行/50+2分页及追加关联；跨RFQ、F5和真实服务重启后，全部保存行、报价历史及3PDF哈希一致。源数据库在实际导出前后不变。
- **保存安全 PASS**：真实暂扣PUT，三尺寸不虚报已保存且备份被阻止；真实200后才显示已保存。实际旧标签409拒绝覆盖、保留赢方数据；实际停服务显示保存异常/失败，重启手动200与F5恢复。旧报价版本/图纸不丢失。[保存证据](completion/evidence)。
- **恢复安全 PASS**：损坏ZIP、真实资料包误当完整恢复均HTTP400，中文可操作提示且无RESTORE码、目标不变。合法ZIP_STORED负例只改一份PDF的1字节、长度不变，manifest/其他成员不变且CRC正确；真实浏览器及审计后端均400/RESTORE_PDF_HASH_MISMATCH，目标语义数据、持久文件字节、目录集合不变。原正确完整备份200恢复2RFQ全部数据/报价/历史/3PDF，之后非空目录409拒绝且数据不变。[篡改构造](completion/evidence/S4-tamper-preflight.json)、[真实拒绝](completion/evidence/S4-audited-backend-rejection.json)、[非空拒绝](completion/evidence/S4-nonempty-backend.json)。

{gallery}

可选体验建议（不作为未满足1366要求的缺陷）：1600×900大屏模式首行top868.875、bottom910.65625，下缘略出首屏；正常滚轮240px后整行可见，无无法访问或整页溢出。可考虑让大屏也受益于紧凑决策区。[实测/截图](completion/evidence/optional-fold-observation.json)。

## 首次搜索点击专项：NOT REPRODUCED; ROOT CAUSE UNKNOWN

本轮独立首次`#runAssignSearch`仅调用一次普通`locator.click()`，原15秒超时，未force、盲目加时、固定延时绕过或重试。与完整E2E并行期间，实测点击成功并筛到预期单行，记录到真实trusted click目标runAssignSearch。19个连续样本含17个rAF；按钮box始终x849.03125/y488.703125/w45/h32.25，中心elementFromPoint在全部19样本均命中按钮。6个rAF有其他活跃动画，但没有因此建立原超时因果关系。

已保留[rAF原始坐标/完整样式/动画/祖先/滚动/焦点悬停/命中栈](independent/evidence/assign-search-first-frames.jsonl)、[摘要](independent/evidence/assign-search-diagnostic-summary.json)、[结果](independent/evidence/assign-search-first-result.json)、前后截图和对应原始trace。**未复现，原根因仍未知**；未发生的异常分支不推断为已验证，不能宣布ROOT CAUSE FIXED，也不能排除其他时序复发。后续续验没有重跑该首次点击。

## 本轮驱动异常，逐一保留

| 记录 | 实际问题 | 处理及边界 |
|---|---|---|
|H-01启动|漏开TTY导致stdin关闭，0业务操作/0搜索点击。|保留启动日志，终止自有进程，改TTY用新空目录。关闭通道后无法导出启动trace，明确NOT AVAILABLE，不补造。|
|H-02导出校验器|新建独立脚本仍引用不存在的fixtures-attempt02目录，Python退出1；此前内容断言无FAIL。|原始错误、stderr、下载和失败trace保留；新methods-continuation仅改独立fixture路径，按SHA256复制本SHA已下载原文件并完成46内容检查，没有重新导出替换样本。|
|H-03续验配置|恢复驱动漏载sizes数组，保存用例在视口循环前ReferenceError。|原trace/错误保留；新completion显式初始化全部上下文并先核对数据库仍等于原提交检查点，只重测受影响保存场景并完成余项。没有重跑搜索/已通过初始业务。|

[异常登记](raw-error-register.json)、[路径修正](export-verifier-correction.diff)、[上下文修正](resume-context-correction.json)及各原目录均保留。修正只涉及**本轮新建独立证据驱动**，不修改产品、既有测试或CI；没有把驱动退出0当作业务PASS，捕获错误的原驱动即使最终退出0仍单列失败/阻塞。

## 遗留与交付

Windows三组 **NOT TESTED**：原生Python3.13、Node22、独立Windows程序/数据目录、PowerShell/BAT/Edge启动及本机文件锁/恢复安全。Linux不能代替。旧模拟数据迁移、真实企业资料及其他设备/缩放未测；原UI用例失败后未到达部分不能推断通过。

**下一步：由ChatGPT处理P3-TEST-01并核查报告，随后在新准确SHA复验；Windows专项仍需真实环境。当前不建议据此宣布整套验收通过或合并门槛完备。** 未修改产品、原测试、CI、主记忆、开发分支或main；无Actions、merge、close或新建PR。只追加现有DraftPR50。

461个原自动化输出文件无损归档为11个≤32MiB分片，逐文件解包复核SHA256，原输出ZIP校验通过；故意损坏的输入fixture作为负例原样保留。[全部证据索引](README.md)、[原输出清单](automation/original-file-manifest.json)、[trace完整性](independent-trace-integrity.json)、[校验清单](SHA256SUMS.txt)。原58测试trace与3份独立trace均可获取，没有只保存成功样本。
'''
en=f'''# PR46 · fbb9894 independent acceptance / TEST-ONLY

**Verdict: NOT READY.** Complete original suites: **111 PASS /1 FAIL**. Final supplemental independent purchasing/UI/save/restore checks pass, but the original UI integration case still fails at a later obsolete assertion, and3 native Windows groups are NOT TESTED. No new P1/P2/P3 product defect is confirmed. One P3 test-maintenance issue and3 independent-harness errors are retained separately rather than erased or mislabeled as product defects.

Only product SHA **`{SHA}`** was tested. Date2026-10-29,Asia/Shanghai; raw timestampsUTC; report generated `{now}`. [PR46 handoff](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6492833285), [PR50 task](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6492834238), [saved task/version](github-task-version.json).

## Exact product, isolation and original suites

Detached checkout `/workspace/srmfbb-product`; actual PR46 HEAD matched at start/end, without a synthetic merge commit. Real Chromium uses M1-Lite `prototype/m1-lite/index.html` and the repository's `tests/e2e/serve.py` with its actual backend and SQLite APIs. No static concept prototype or mocked business backend. Automation and independent business start with fresh isolated directories and fictional materials,suppliers,prices,projects andPDFs. No user business directory, old-SHA database/ZIP or legacy-demo migration is accessed. Resumption uses only this run's own newly created current-SHA data, with committed checkpoint equality verified; each evidence phase is separate.

Linux/Python3.12.14/Node24.19.0/Playwright1.58.2/Chromium154.0.8037.57; no native Windows/cmd.exe/PowerShell. [Identity](identity-start.json) and [actual HTTP proof](http-trace-identity.json):87 captured HTTP200 root responses across58 original and3 independent traces match source HTML SHA256 `bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3`,0missing bodies. Product tracked tree is clean. Protected refs stay unchanged before evidence push. This new directory only is appended to existing DraftPR50,parent `0c4e08a82ac5835d088c93cb9d82424bd3065bcd`; old evidence remains immutable.

|Original full suite|PASS|FAIL|Exit|
|---|---:|---:|---:|
|Python backend unittest discovery|44|0|0|
|Node business npm test|10|0|0|
|Complete Chromium npm run test:e2e|57|1|1|
|Total|111|1|—|

npm ci succeeded.1worker,0retries,0skips,0flaky. No original test edits,deletions,threshold relaxation or replacement rerun. [All112 cases](automation-cases.csv), [commands/exits](COMMANDS.md), `automation/*/command.json`, [full log](automation/chromium-e2e/stdout.log). No Actions triggered or declared green.

## Previous five, independently recorded

{focus}

All five former stopping points are traversed: malformed-ZIP copy/no-code/empty-target checks,3name selections and all downstream business assertions in those3cases, and approved#F6F8FB background. **Whole cases are4PASS/1FAIL, not5PASS.** The UI case now reaches line76 and still requires `.srm-v3-pageKicker` to match `/\\d\\d|ADMIN/`; actual Chinese text is“系统设置”. Background passed earlier and is separately verified in18 independent page states.

**P3-TEST-01: stale language/route-caption assertion.** Reproduce with the unmodified full suite on this SHA; [raw failure,screenshot,trace](automation/failures/FAIL-01), [classification](automation/failure-classification.json). No purchasing failure or data corruption is established. ChatGPT should verify the approved Chinese caption and align test semantics while retaining every later navigation/layout/state assertion. Codex did not change it. Assertions after76 are **NOT REACHED**, not silently passed by the six-page independent audit.

## Independent requirement results

[Full itemized table](RESULTS.md) / [CSV](results.csv):32PASS/2FAIL/3NOT TESTED/0currentlyBLOCKED. Both FAIL rows refer to the same original UI failure (whole-suite plus focused-case views); counts overlap.1130 low-level check/observation records include repeated/subordinate checks and are not1130 independent test cases. Original harness interruptions remain separately failed/blocked at the time, despite completed supplemental scope.

- **Six-page UI/tooltips PASS:**18 actual screenshots were visually inspected. Shared#F6F8FB canvas,14.5px body,Chinese heading hierarchy and coherent navigation/buttons; no major first-screen overlap or whole-document horizontal overflow. Wide1024 tables retain internal scrolling.83 actually visible tooltip instances (28/27/28) pass hover/four-edge bounds,realTab,Escape while focus/hover remains,pinning and click-away; saved data/history/PDFs unchanged. [TooltipJSON](independent/evidence/tooltip-retest.json), [visual review](visual-review.json).
- **1366first row PASS:**[fresh priced screenshot](independent/evidence/UX09-1366-real-priced-first-screen.png);scrollY0,top701.140625,bottom742.921875,height41.78125.Entire row visible;price/disclosure aligned.
- **Purchasing/history PASS:**fresh12lines/3suppliers/3PDFs,duplicate codes/distinct specifications,line identity,unique/ambiguous/unmatched drawing matches,additive allocations,Excel/paste/manual quotes,rounds/revisions and preview safety.5confirmed versions/50history lines preserved,V1 immutable,9explicit carries,effective tiers118/2.25. Manual3/¥1979 remains distinct from theory¥6940/mixed¥7064,9pending;ties require no higher-price reason,actual higher bids do.
- **Real files/persistence PASS:**46supplierZIP/CSV/comparisonXLSX content checks;30backup-class/excluded mail/chat checks.Second52-line RFQ with50+2pagination and additive relations;RFQ switch,F5 and actual service restart preserve all saved rows/history/3PDF hashes. Original exports do not mutate stored data.
- **Save safety PASS:**genuinely heldPUT at3sizes prevents falseSaved and blocks backup;actual200 required beforeSaved.Real stale-tab409 preserves winning data;actual service outage shows failure,restart/manual200/F5 recover while retaining old quote/history/PDFs. [Evidence](completion/evidence).
- **Restore safety PASS:**malformedZIP and real inquiry/drawing-archive-as-full-restore return400 with actionable Chinese/no rawRESTOREcode and unchanged target.ValidZIP_STORED tamper changes exactly1PDF byte at the same length;manifest/other entries unchanged and recomputedCRC valid.Browser and audited backend return400/RESTORE_PDF_HASH_MISMATCH;target semantic rows,persistent bytes,directory set unchanged.Original fullZIP restores both RFQs/allstored tables/quotehistory/3PDFs with200;nonempty target then409 with no changes. [Fixture proof](completion/evidence/S4-tamper-preflight.json), [actual rejection](completion/evidence/S4-audited-backend-rejection.json), [nonempty refusal](completion/evidence/S4-nonempty-backend.json).

{gallery}

Optional efficiency observation,not a failed1366requirement:at1600×900 the first row is868.875..910.65625,slightly across the fold;normal240px wheel exposes628.875..670.65625.No inaccessible control or horizontal page overflow established.Consider compact comparison chrome at larger sizes after owner review.[Measured evidence](completion/evidence/optional-fold-observation.json).

## First-search diagnostic: NOT REPRODUCED; ROOT CAUSE UNKNOWN

Exactly one ordinary `#runAssignSearch` locator.click with the original15second timeout,no force,retry,fixed-delay workaround or timeout increase. During concurrent fullE2E,the actual trusted click targeted runAssignSearch and produced the expected single filtered line.19continuous samples include17rAF;button box remains x849.03125/y488.703125/w45/h32.25.All19center hits return the button.SixrAFs include active animations elsewhere;this does not establish causation for the prior timeout.

[Raw consecutive-frame boxes,computed styles,animations,ancestors,scroll,focus/hover,elementFromPoint/hit stacks](independent/evidence/assign-search-first-frames.jsonl), [summary](independent/evidence/assign-search-diagnostic-summary.json), [result](independent/evidence/assign-search-first-result.json),before/after screenshots and original trace retained.The abnormal timeout branch did not occur and cannot be claimed verified.**NOT REPRODUCED; ROOT CAUSE UNKNOWN**,not ROOT CAUSE FIXED.No later continuation repeats this first click.

## Harness errors and recorded corrections

|Record|Actual failure|Preservation and correction|
|---|---|---|
|H-01startup|TTY omitted,stdinclosed;0business actions/0searchclicks.|Startup logs retained,ownprocess tree terminated,TTYlaunch innewemptydirectory.No completed startup trace export was available:explicitlyNOTAVAILABLE.|
|H-02new export verifier|Stale fixtures-attempt02 path;Pythonexit1 before all content checks,no content assertion failed before missingfile.|Original error/stderr/downloads/failedtrace retained.New standalone verifier fixes only itsfixturepath;byte-identical original current-SHA downloads copied with hashes,46checksPASS.No replacement export before recheck.|
|H-03resume config|sizes undefined;save method stops before viewportloop.|Original trace/error retained.Completion launcher initializes allglobals,checks committed checkpoint unchanged,then reexecutes only affected save scenario and remaining scopes.No search/initial purchasing replay.|

[Raw register](raw-error-register.json), [path correction](export-verifier-correction.diff), [context correction](resume-context-correction.json),all original phase directories preserved.Corrections touch only this run's newly authored independent evidence methods/launcher,never product/existingtests/CI.Driver exit0 after catching an error is **not** used as aPASS;the original interrupted records remain failed/blocked.

## Remaining scope and delivery

Native Windows3groups NOTTESTED:Python3.13,Node22,and isolated Windows program/data launch,PowerShell/BAT/Edge,filesystem/file-lock/restore behavior.Linux is not a substitute.Old-demo migration,real enterprise data,other devices/zoom and original assertions after the failed line are not inferred to pass.

**ChatGPT should resolve P3-TEST-01 and review this report,then retest a new exact SHA;Windows still needs actual execution.Full-suite acceptance and merge readiness remain incomplete.** Product,originaltests,CI,canonicalmemory,development/main unchanged.NoActions,merge,closure,newPR/Issue;only append to existingDraftPR50.

All461 original automated outputfiles are losslessly archived in11parts≤32MiB,every originalfileSHA256 revalidated after extraction,and originaloutputZIPCRCchecks pass.Intentionally broken inputfixtures remain negative inputs unchanged.[Index](README.md), [original manifest](automation/original-file-manifest.json), [trace integrity](independent-trace-integrity.json), [checksum inventory](SHA256SUMS.txt).58originaltesttraces and3independenttraces retained,including failures.
'''
zh=zh.replace(chr(92)*2+'d',chr(92)+'d');en=en.replace(chr(92)*2+'d',chr(92)+'d')
(D/'REPORT.zh-CN.md').write_text(zh);(D/'REPORT.en.md').write_text(en)
(D/'RESULTS.md').write_text('# Itemized current-SHA results / 逐项验收结果\n\nProduct `'+SHA+'`. Requirement rows overlap;2FAIL rows refer to the same original UI case. Original harness errors remain in raw-error-register.json,not replaced by supplemental PASS.\n\n|ID|Result|Scope|Evidence/notes|\n|---|---|---|---|\n'+'\n'.join('|'+r['id']+'|'+r['status']+'|'+r['scope'].replace('|','/')+'|['+Path(r['evidence']).name+']('+r['evidence']+') '+r['notes'].replace('|','/')+'|'for r in rows)+'\n')
commands=['# Actual commands and exits / 实际命令与退出码','',f'Product `{SHA}`;no officialActions.Original tests/config unchanged.','', '|Command / phase|Exit/status|Evidence|','|---|---|---|']
for n in ['python-backend','npm-ci','node-business','chromium-e2e']:
 q=json.loads((D/'automation'/n/'command.json').read_text());commands.append('|`'+' '.join(q['command'])+'`|'+str(q['exitCode'])+'|[command.json](automation/'+n+'/command.json),startUTC'+q['startUTC']+',duration'+str(q['durationSeconds'])+'s|')
commands+=['','Original commands run from `/workspace/srmfbb-product` with `SRM_CHROMIUM_PATH=/usr/bin/chromium`, `CI=1`,task-local npmcache and fresh SRM_DATA_DIR.Original Playwright config:workers1,retries0.','', '|Independent command|Exit/status|Evidence|','|---|---|---|', '|`node /workspace/uatfbb/methods/driver.cjs` nonTTY bootstrap|BLOCKED stdinclosed;own processes stopped bySIGTERM,numeric exit not captured;0businessactions|bootstrap-launch-error.json|','|`node /workspace/uatfbb/methods/driver.cjs` TTY|Node later exits0 after catching verifier failure;NOT a testPASS|independent/evidence/raw-first-error.json|','|`python /workspace/uatfbb/methods/verify-exports.py /workspace/uatfbb/independent/evidence/`|1,FileNotFoundError|independent/evidence/export-validation.stderr|','|`python /workspace/uatfbb/methods-continuation/verify-exports.py /workspace/uatfbb/continuation/evidence/`|0,46checksPASS on original current downloads|continuation/evidence/export-validation.log|','|`node /workspace/uatfbb/methods-continuation/driver.cjs`|Node later exits0 after caught ReferenceError;NOT a testPASS|continuation/evidence/raw-first-error.json|','|`node /workspace/uatfbb/methods-completion/driver.cjs`|0,remaining checks complete with no caught error|completion/evidence/browser.jsonl|','|`python /workspace/uatfbb/methods-completion/verify-s4.py /workspace/uatfbb/completion/evidence/ /workspace/uatfbb/completion/downloads/current-S4-full.zip`|0,11checksPASS|completion/evidence/S4-integrity.stdout.log|','|`python /workspace/uatfbb/methods-completion/build-stored-tamper.py /workspace/uatfbb/completion/downloads/current-S4-full.zip /workspace/uatfbb/completion/downloads/tampered-STORED-S4.zip /workspace/uatfbb/completion/evidence/S4-tamper-preflight.json`|0,13preflightchecksPASS|completion/evidence/S4-tamper-preflight.json|','', 'Absolute paths and exact inputs are retained in step/command records inside each browser.jsonl.These are actual executions,not instructions to modify the product.Windowscommands were NOTRUN.']
(D/'COMMANDS.md').write_text('\n'.join(commands)+'\n')
(D/'README.md').write_text('''# fbb9894 TEST-ONLY append to existing DraftPR50

Product `fbb98944a4bcee439e4e81ebfe3ef710bee4a3d0`. **NOT READY:Python44PASS,Node10PASS,Chromium57PASS/1FAIL;Windows3NOTTESTED.**

- [中文报告](REPORT.zh-CN.md) / [English report](REPORT.en.md)
- [逐项结果](RESULTS.md) / [CSV](results.csv) / [112 original automation cases](automation-cases.csv)
- [Current original five cases,4PASS/1FAIL](focus-original-five) / [focus summary](focus-five-results.json)
- [One raw automated failure](automation/failures/FAIL-01) / [classification](automation/failure-classification.json)
- [Actual commands/exits](COMMANDS.md)
- [First-click full rAF diagnostics](independent/evidence/assign-search-first-frames.jsonl) / [NOT REPRODUCED summary](independent/evidence/assign-search-diagnostic-summary.json)
- [18page screenshots,83tooltips,first attempt,backup class evidence](independent/evidence)
- [Original current-SHA real downloads](independent/downloads)
- [Corrected original-file verification,persistence and retained second error](continuation/evidence)
- [Completed save/conflict/outage/STOREDtamper/fullrestore/nonempty/supplier checks](completion/evidence) / [actual final downloads](completion/downloads)
- [All raw harness failures/corrections](raw-error-register.json) / [bootstrap logs](bootstrap-stdin-closed/evidence)
- [HTTP/source identity](http-trace-identity.json) / [preservation](preservation.json) / [checksums](SHA256SUMS.txt)
- [Standalone original independent methods](methods), [verifier correction methods](methods-continuation), [completion methods](methods-completion), [fresh fictional fixture recipe/inputs](fixtures)

## Reassemble the complete original automated report

All461original files in test-results/playwright-report are retained byte-for-byte,including58traces,screenshots,logs and downloads.Deduplication uses internal tar hardlinks only;every original fileSHA256 was revalidated after extraction.

```bash
mkdir extracted
cat automation/raw-parts/all-original.tar.gz.part* | tar -xz -C extracted -f -
python -m http.server 8099 --directory extracted/playwright-report
```

Use the local Playwright trace viewer for extracted `test-results/*/trace.zip` or direct focused/independent traceZIPs.Existing negative inputs are intentionally malformed;output ZIP CRC checks are documented separately in automation/trace-integrity.json.Full original hashes and archive parts are in automation/original-file-manifest.json and automation/archive.json.

All3executed independent phases have valid retained traces;the0-action stdinclosed bootstrap could not export a completed trace and is explicitlyNOTAVAILABLE.No successes-only filtering,no historical PASS transfer,no product/originaltests/CI/main/memory changes,noActions,no merge/closure.
''')
shutil.copy2(R/'write-reports.py',D/'write-reports.py')
print('Bilingual reports/index/results/commands written',len(zh),len(en))
