from pathlib import Path
import json,csv,hashlib,shutil,subprocess,tarfile,collections,datetime,re,io,zipfile
S=Path('/tmp/pr46-retest');P=Path('/tmp/srm46-retest-product');E=Path('/tmp/srm-pr46');D=E/'docs/uat/20261022-pr46-2dbde57-p2p3-retest'
assert not D.exists();D.mkdir(parents=True)
sha='2dbde578165de720fed290cddbfef0a34e99f032';parent='8296b853b3de03eb406ccd1f6eca50fdfdfdfa44'
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=P,text=True).strip()==sha
assert subprocess.check_output(['git','status','--porcelain'],cwd=P,text=True)==''
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=E,text=True).strip()==parent
assert (S/'protected-refs-start.txt').read_bytes()==(S/'protected-refs-end.txt').read_bytes()
for n in ['automation','methods','independent','fixtures']:shutil.copytree(S/n,D/n,ignore=shutil.ignore_patterns('data','__pycache__'))
for n in ['identity-start.json','http-product-identity.json','preflight-methods.json','protected-refs-start.txt','protected-refs-end.txt','task.json','actions.json','actions-jobs-ui.json','actions-jobs-s4.json']:shutil.copy2(S/n,D/n)
summary=json.loads((S/'independent/execution-summary.json').read_text());assert len(summary['cases'])==8 and all(x['status']=='PASS' for x in summary['cases']);assert not summary['runtimeErrors'] and not summary['pageErrors']
auto=json.loads((S/'automation/automated-results.json').read_text());assert len(auto['cases'])==50
for n in ['python-backend','node-business','chromium-e2e']:assert json.loads((S/'automation'/n/'command.json').read_text())['exitCode']==0

# Preserve every actual Playwright result/report file, deduplicating identical bytes
# with tar hardlinks so that traces copied into HTML report are not stored twice.
raw=[]
for name in ['test-results','playwright-report']:
 for p in sorted((P/name).rglob('*')):
  if p.is_file():raw.append((p,str(p.relative_to(P)),hashlib.sha256(p.read_bytes()).hexdigest()))
archive=S/'playwright-all-raw.tar.gz';seen={};manifest=[]
with tarfile.open(archive,'w:gz',compresslevel=6) as tar:
 for p,name,h in raw:
  info=tar.gettarinfo(str(p),arcname=name)
  if h in seen:
   info.type=tarfile.LNKTYPE;info.linkname=seen[h];info.size=0;tar.addfile(info)
  else:
   with p.open('rb') as f:tar.addfile(info,f)
   seen[h]=name
  manifest.append({'path':name,'bytes':p.stat().st_size,'sha256':h})
expected={x['path']:x['sha256']for x in manifest};checked={}
with tarfile.open(archive,'r|gz') as tar:
 for member in tar:
  if member.islnk():h=checked[member.linkname]
  else:
   with tar.extractfile(member)as f:h=hashlib.sha256(f.read()).hexdigest()
  assert h==expected[member.name],member.name;checked[member.name]=h
assert checked==expected
(D/'automation/playwright-original-file-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
parts=D/'automation/playwright-raw-parts';parts.mkdir();partmeta=[]
with archive.open('rb') as f:
 index=0
 while True:
  b=f.read(32*1024*1024)
  if not b:break
  name=f'playwright-all-raw.tar.gz.part{index:03d}';(parts/name).write_bytes(b);partmeta.append({'file':name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()});index+=1
archiveMeta={'format':'gzip tar, lossless original paths; content-identical files are standard tar hardlinks','originalFiles':len(raw),'uniqueContents':len(seen),'allOriginalFileHashesRevalidatedAfterArchive':True,'archiveBytes':archive.stat().st_size,'archiveSHA256':hashlib.sha256(archive.read_bytes()).hexdigest(),'parts':partmeta,'restoreCommand':'cat playwright-all-raw.tar.gz.part* | tar -xz -f -'}
(D/'automation/playwright-archive.json').write_text(json.dumps(archiveMeta,indent=2)+'\n')
print('RAW_ARCHIVE_COMPLETE',len(raw),'files',archive.stat().st_size,'bytes',len(partmeta),'parts',flush=True)

cases=[
('P2-01','PASS','人工3项金额与理论/建议区分 / Three manual awards versus theory/suggestions','1979.00 / 3 items;6940.00 theory;7064.00 mixed, independently checked actual UI and saved state','independent/evidence/P2-3-manual-1979-theory6940-mixed7064.png'),
('P2-02','PASS','价格与实际导出不变 / Prices and actual exported files','46 actual CSV/XLSX/supplier ZIP/PDF assertions PASS; no source DB changes','independent/evidence/export-checks.json'),
('P2-03','PASS','零人工、重置、重新选与F5 / Reset, zero-manual, reselection and F5','No manual zero masquerading as quote; real reselection returns1979/3 and persists','independent/evidence/P2-zero-after-reset.png'),
('P2-04','PASS','真实新报价待复核排除 / Exclude real pending-review award','B L2 revised82→83, actual review flag; only2 eligible manual lines1815; original confirmed history unchanged','independent/evidence/P2-excludes-pending-review-1815-2-lines.png'),
('P2-05','PASS','12行无有效报价 / Twelve materials without valid bids','Fresh formal RFQ with12 real imported lines and no quotations: zero manual, explicit no confirmed award','independent/evidence/P2-no-effective-quotation-zero-manual.png'),
('P3-01','PASS','三尺寸已保存与技术详情 / Three-size saved and diagnostics','Five pages × three viewports, one persistent concise indicator; mirror absent; original three diagnostics reachable','independent/evidence/P3-saved-1024-quotes.png'),
('P3-02','PASS','三尺寸真实未保存/保存中 / Three-size genuine pending request','Real PUT held then continued, DB unchanged until actual response; summary pending not saved, eventual real200 ACK','independent/evidence/P3-pending-diagnostics-1366.png'),
('P3-03','PASS','三尺寸真实SQLite冲突 / Three-size actual SQLite conflict','Two actual tabs produce409; sole concise error status, diagnostic409, unsaved memory retained, committed DB untouched','independent/evidence/P3-conflict-http.json'),
('WIN-01','NOT TESTED','原生Windows Python3.13 / Native Windows backend','No native Windows environment; not inferred from Linux','identity-start.json'),
('WIN-02','NOT TESTED','原生Windows Node / Native Windows Node','No native Windows environment','identity-start.json'),
('WIN-03','NOT TESTED','PowerShell/批处理/本机试用 / Native Windows launchers','No actual Windows shell or desktop','identity-start.json')]
with (D/'results.csv').open('w',newline='')as f:
 w=csv.writer(f);w.writerow(['id','status','title_zh_en','actual_result','evidence']);w.writerows(cases)
with (D/'automation-cases.csv').open('w',newline='')as f:
 w=csv.writer(f);w.writerow(['id','suite','status','name','evidence'])
 # Python names from original verbose unittest stderr, retain actual test names.
 py=(S/'automation/python-backend/stderr.log').read_text();names=re.findall(r'^(test_\S+ \([^\n]+?\))',py,re.M);assert len(names)==43 and 'Ran 43 tests' in py and py.rstrip().endswith('OK')
 for i,n in enumerate(names,1):w.writerow([f'PY-{i:02}','Python','PASS',n,'automation/python-backend/stderr.log'])
 node=(S/'automation/node-business/stdout.log').read_text();names=[x[2:].split(' (',1)[0]for x in node.splitlines()if x.startswith('✔ ')];assert len(names)==10
 for i,n in enumerate(names,1):w.writerow([f'NODE-{i:02}','Node','PASS',n,'automation/node-business/stdout.log'])
 for i,x in enumerate(auto['cases'],1):w.writerow([f'E2E-{i:02}','Chromium','PASS',x['title'],'automation/automated-results.json#'+x['id']])

reg={'productSHA':sha,'previousEvidenceCommit':parent,'oldReportsUnmodified':True,'automatedCounts':{'PythonPASS':43,'NodePASS':10,'ChromiumPASS':50,'FAIL':0,'SKIP':0,'RETRY':0},'independentCounts':{'PASS':8,'FAIL':0,'NOT TESTED':0,'BLOCKED':0},'nativeWindowsNOTTESTED':3,'newDriverErrors':[],'driverCorrectionsUsed':0,'confirmedNewProductDefects':[],'expectedNegativeTests':[{'id':'P3-03','status':'PASS','actualHTTP':409,'method':'real stale browser tab, same SQLite version check','evidence':'independent/evidence/P3-conflict-http.json'}],'nonfatalObservations':[{'type':'usability wording','text':'While the actual PUT was pending, the summary read 保存状态待确认 with pending styling, not 已保存. Diagnostics stated actual save in progress. Accurate non-success state; wording can be made more specific, no confirmed false-save defect.'},{'type':'environment warning','text':'Original Node/Playwright logs contain NO_COLOR/FORCE_COLOR warning; commands all exited0.'}],'officialGitHubActions':'Both exact-SHA workflows remain failure with4jobs no execution steps returned; cloud suite PASS is not official Actions PASS. Account restriction explanation originates developer handoff; empty steps alone does not prove billing root cause.','scopeVerdict':'P2/C05 PASS; P3/V01 PASS; scoped cloud retest PASS; not whole-product release approval'}
(D/'raw-error-register.json').write_text(json.dumps(reg,ensure_ascii=False,indent=2)+'\n')
oldProof=[]
for tree in ['docs/uat/20261022-pr46-c2737f0-temp-ci','docs/uat/20261022-pr46-c2737f0-continuation']:
 data=subprocess.check_output(['git','ls-tree','-r',parent,'--',tree],cwd=E);assert data==subprocess.check_output(['git','ls-tree','-r','HEAD','--',tree],cwd=E);oldProof.append({'path':tree,'treeListingSHA256':hashlib.sha256(data).hexdigest()})
(D/'identity-end.json').write_text(json.dumps({'productSHA':sha,'productTrackedAndUntrackedStatus':'clean; runtime-only node_modules symlink removed after suites','htmlSHA256':hashlib.sha256((P/'prototype/m1-lite/index.html').read_bytes()).hexdigest(),'sourceStatus':subprocess.check_output(['git','status','--porcelain'],cwd=P,text=True),'protectedRefsStartEndEqual':True,'previousEvidenceParent':parent,'originalEvidenceTrees':oldProof},indent=2)+'\n')
(D/'README-raw-evidence.md').write_text('''# 原始证据 / Raw evidence

Complete unedited Playwright test-results and HTML report files are losslessly archived in `automation/playwright-raw-parts/`. Identical copies use standard tar hardlinks; all original names and bytes were revalidated against the manifest. No failed sample or trace was discarded.

在空临时目录中按文件名顺序拼接解包 / Reassemble in a new empty directory:

```sh
cat playwright-all-raw.tar.gz.part* | tar -xz -f -
```

`automation/playwright-original-file-manifest.json` lists every original hash; `playwright-archive.json` lists volume/archive hashes. Extracted `test-results/results.json` is the unedited runner JSON; all50 per-case traces and server logs remain available. `playwright-report/index.html` and its data are included. Use Playwright trace viewer to inspect extracted trace ZIPs.

`independent/evidence/` directly contains34 original screenshots, one independent trace and browser/server logs. `methods/` contains new standalone diagnostic drivers, not modifications to existing repository tests. `fixtures/` contains fictional data; presence of extra unused fixtures does not imply their scenarios were executed. The prior actual fictional S4 ZIP is referenced at the immutable old evidence location, with input identity preserved in setup logs.
''')

zh='''# PR #46 P2/P3 独立修复复验（TEST-ONLY）

**本轮范围结论：PASS。P2/C05 PASS，P3/V01 PASS。** 唯一产品 SHA：`2dbde578165de720fed290cddbfef0a34e99f032`。

新 SHA 的完整本地云端套件为 **Python43 / Node10 / Chromium50，共103 PASS、0 FAIL、0 SKIP、0 RETRY**；独立业务复验 **8 PASS / 0 FAIL / 0 BLOCKED / 0 NOT TESTED**；另有原生 Windows **3 NOT TESTED**。没有新确认产品缺陷，没有本轮驱动错误或修正。

这不是 GitHub Actions 正式通过，也不是整个软件发布/合并批准。正式 CI、Windows 专项和所有者审核门槛仍保留。原 c2737f0 的102项及12PASS/2FAIL报告不改写、不挪用为本 SHA 通过。

## 1. 任务、版本与隔离

[完整交接](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6338965924)。已核对 PR #46 Draft HEAD 与准确 checkout 一致；程序在独立 detached `/tmp/srm46-retest-product` 运行，实际 HTTP HTML 与 checkout SHA256 均为 `8f83160fb81b3d0626743e419a8f6882abce668aa5d2867f8ad8fbd27667e040`，不是概念原型/未确认合成合并版。[身份起点](identity-start.json)、[HTTP 身份](http-product-identity.json)、[终点](identity-end.json)。

读取当前 M1 的 AGENTS/PROJECT_STATE/DECISIONS，并以 GitHub 当前 refs 和新授权为事实；不更新主记忆。最新用户明确允许云端替代受限 Actions 的开发套件，且禁止修改主记忆，这两项优先于旧文档通用门槛。使用 cloud-environment-runtime 核对网络环境；没有使用 Actions 或付费 runner。

云端 Linux、Python3.12.14、Node24.19.0、Playwright1.58.2、真实 Chromium154.0.8037.57。使用既有且与本提交 package-lock 字节一致的依赖安装；仅临时链接 node_modules，结束已移除。原测试、断言、CI均未修改。所有数据仅来自虚构材料，SQLite目录 `/tmp/pr46-retest/independent/data` 为全新；各自动化也使用自己的临时数据。没有访问现有用户业务数据。

独立复验先将上轮实际虚构 S4 ZIP 通过新版本真实恢复界面导入空目录，逐字段核对4表/历史/3份PDF与原快照一致，作为同一匿名案例的前置数据；后续重置、重选、报价修订及异常操作全部来自实际 UI。恢复旧数据不被当作新 SHA 业务已通过；新页面、计算、保存及导出均重新验证。独立 driver 已预审动态 visible/enabled、面板open状态与真实异步条件，没有重复 toggle 错误。方法及冻结哈希见 [preflight-methods.json](preflight-methods.json)。

## 2. 完整自动化实际执行

| 命令（未修改原命令/测试） | 结果 | 原始证据 |
|---|---|---|
| `python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'` | 43 PASS，退出0 | [stderr](automation/python-backend/stderr.log) / [命令](automation/python-backend/command.json) |
| `npm test` | 10 PASS，退出0 | [stdout](automation/node-business/stdout.log) / [命令](automation/node-business/command.json) |
| `npm run test:e2e` | 50 PASS，退出0；单worker、零重试/跳过 | [stdout](automation/chromium-e2e/stdout.log) / [命令](automation/chromium-e2e/command.json) |

仓库支持的 `SRM_CHROMIUM_PATH=/usr/bin/chromium` 指向实际浏览器，没有改配置或替换业务断言。新用例 `UX manual-only: buyer-approved amount distinct from suggested totals / 人工定标金额独立显示` 已真实执行并通过。本轮103是新SHA的执行事实，不是旧102的复制。逐个自动化结果见 [automation-cases.csv](automation-cases.csv) / [runner 摘要](automation/automated-results.json)。所有原 runner JSON、50份trace、服务器日志和HTML报告无损归档，见[解包说明](README-raw-evidence.md)。

## 3. P2/C05 定向业务复验

| ID | 结果 | 实测事实 |
|---|---|---|
| P2-01 | PASS | 人工L2乙82×2、L5乙75×5、L12甲120×12，**3项/¥1979.00**单列；理论**¥6940.00**、建议混合**¥7064.00（含自动建议）**及标签不变 |
| P2-02 | PASS | 新版真实下载 CSV、内部比价Excel、3家单独及全部供应商ZIP，46项数值/身份/隔离/PDF字节检查通过；导出不改数据库 |
| P2-03 | PASS | 点击恢复默认最低价后人工0项，提示尚无有效人工定标、不误报人工¥0报价；真实重新选择3行并保存、F5后仍为1979 |
| P2-04 | PASS | 乙同轮新版本将L2真实改为83并确认，L2被标记待复核；人工汇总只计L5/L12：**2项/¥1815.00**；旧确认报价不变，F5后仍排除 |
| P2-05 | PASS | 新建正式询价并真实导入12行、没有有效报价；人工汇总为明确0项无已确认定标，不显示误导的人工零价金额 |

1979 =164+375+1440；1815 =375+1440。未操作状态集合伪造结果；通过真实重置、报价新版本和UI确认触发。独立文件核验再次确认甲自身10项6420、乙12项7185、丙2项990，甲乙共同10项6420/6665；缺报不作零，适用阶梯单价不变。内部Excel第12行120、第2行82及高价理由正确，RFQ身份与全部12行一致。

[三金额同屏截图](independent/evidence/P2-3-manual-1979-theory6940-mixed7064.png) · [重置0项](independent/evidence/P2-zero-after-reset.png) · [待复核排除](independent/evidence/P2-excludes-pending-review-1815-2-lines.png) · [无有效报价](independent/evidence/P2-no-effective-quotation-zero-manual.png) · [实际文件46项核验](independent/evidence/export-checks.json)。

## 4. P3/V01 三尺寸与真实状态

| ID | 结果 | 实测事实 |
|---|---|---|
| P3-01 | PASS | 1024×768 /1366×768 /1600×900，在物料/分配/报价回收/比价/设置5页面共15布局，项目与诊断收起后仅一个常驻保存提示；旧镜像节点不存在；保存摘要和实际API/SQLite状态相同。三尺寸都展开读取原3个诊断节点，保留版本/时间/备份信息 |
| P3-02 | PASS | 新增虚构供应商形成真实未保存数据；仅暂缓真实PUT再继续，不伪造响应。三个尺寸显示pending，未误显已保存；请求未放行前整个DB历史/PDF不变；放行后真实200保存，新供应商实际持久化 |
| P3-03 | PASS | 两个真实标签页使用同SQLite旧版本：先保存者成功，旧页提交实际HTTP409。三尺寸唯一摘要显示“保存异常·查看详情”，详情HTTP409/停止自动重试。旧页未保存供应商仍留内存，但从未被假确认；全部已保存DB行/PDF与先保存者一致，F5后保留先保存者结果 |

未保存时实际摘要文字是 **“保存状态待确认”**（pending样式），详情显示 **“正在自动保存……”**；没有误显已保存。本轮按“真实且不虚假报成功”通过；可用性建议是将保存中的摘要文案进一步细化，这是观察建议，不作为已确认新缺陷。异常为真实SQLite版本冲突，不是截断请求或假造409。

| 尺寸 | 保存成功 | 真实待保存/保存中 | 真实409异常 | 异常原始详情 |
|---|---|---|---|---|
| 1024×768 | [截图](independent/evidence/P3-saved-1024-quotes.png) | [截图](independent/evidence/P3-pending-1024.png) | [截图](independent/evidence/P3-conflict-1024.png) | [详情](independent/evidence/P3-conflict-diagnostics-1024.png) |
| 1366×768 | [截图](independent/evidence/P3-saved-1366-quotes.png) | [截图](independent/evidence/P3-pending-1366.png) | [截图](independent/evidence/P3-conflict-1366.png) | [详情](independent/evidence/P3-conflict-diagnostics-1366.png) |
| 1600×900 | [截图](independent/evidence/P3-saved-1600-quotes.png) | [截图](independent/evidence/P3-pending-1600.png) | [截图](independent/evidence/P3-conflict-1600.png) | [详情](independent/evidence/P3-conflict-diagnostics-1600.png) |

[HTTP409原证](independent/evidence/P3-conflict-http.json) · [SQLite前后快照与浏览器/服务端日志](independent/evidence) · [独立trace](independent/evidence/independent-trace.zip)。详情中额外诊断和项目摘要是主动展开内容，不计作第二个常驻状态；没有隐藏异常来获得单状态结论。

## 5. 错误、环境与未测范围

本轮独立8组、117条显式业务/状态检查通过（不与103个套件用例混计），另有46条文件检查。没有本轮驱动错误/修正、pageerror或失败传输；真实409是预期安全拒绝，console日志原样保留。Node/Playwright NO_COLOR/FORCE_COLOR警告为非致命环境信息；所有命令退出0。[原始错误登记](raw-error-register.json)、[执行摘要](independent/execution-summary.json)。

准确SHA的 [UI Actions 39766115997](https://github.com/yudacheng666/SRM_System/actions/runs/39766115997) / [S3S4 Actions 39766115887](https://github.com/yudacheng666/SRM_System/actions/runs/39766115887) 均为failure；查询4个job没有返回执行步骤（steps=null）。[原始运行](actions.json) / [UI job](actions-jobs-ui.json) / [S3S4 job](actions-jobs-s4.json)。交接说明账户额度/计费阻止启动；job空步骤本身不独立证明计费根因。本轮云端103PASS不能转换成官方Actions成功，正式CI门槛未解除。

**NOT TESTED**：原生Windows Python3.13、Windows Node、PowerShell/批处理本机启动3组；没有真实Windows环境。其他未纳入本轮的范围：穷举故障/负载、多浏览器、全可访问性与像素一致性、真实企业数据/真实Excel桌面。没有用Linux推断Windows或全软件通过。

## 6. 归档与建议

新证据只追加到现有Draft PR #50 的 `docs/uat/20261022-pr46-2dbde57-p2p3-retest/`；原两个c2737f0目录/报告不改。证据分支历史HEAD不是本次运行产品SHA；本报告及独立worktree才明确锁定2dbde57。完整原始归档按标准tar硬链接无损去重相同副本、32MiB分片，所有原文件hash回验通过；共34张独立原始截图、1份独立trace及50份套件trace。

建议 ChatGPT 审核本轮证据后认定两项指定整改已通过范围复验，再处理正式CI/Windows及所有者审批门槛。**不合并证据PR或产品PR，不宣布整个产品release-ready。** 产品、原测试、CI、主记忆、main/M1/产品分支均未改，没有关闭任何PR。
'''
(D/'REPORT.zh-CN.md').write_text(zh)
en='''# PR #46 independent P2/P3 fix retest (TEST-ONLY)

**Scoped verdict: PASS. P2/C05 PASS; P3/V01 PASS.** Sole product SHA: **`2dbde578165de720fed290cddbfef0a34e99f032`**.

New-SHA local cloud automation: **Python43 + Node10 + Chromium50 =103 PASS,0FAIL,0SKIP,0RETRY**. Independent buyer retest: **8PASS /0FAIL /0BLOCKED /0NOT TESTED**. Three additional native Windows groups remain **NOT TESTED**. No new confirmed product defect or new driver error/correction.

This is not official GitHub Actions success or whole-product release/merge approval. Formal CI, native Windows and owner review gates remain. Old c2737f0 reports retain their original102 automation and12PASS/2FAIL independent outcomes; none is relabeled as this SHA.

## 1. Task, version and isolation

[Full handoff](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6338965924). PR #46 Draft HEAD and detached checkout `/tmp/srm46-retest-product` matched the exact SHA. Served HTML matched checkout SHA256 **8f83160fb81b3d0626743e419a8f6882abce668aa5d2867f8ad8fbd27667e040**: [start](identity-start.json), [HTTP proof](http-product-identity.json), [finish](identity-end.json). Actual M1 frontend/backend ran, not a concept prototype or unconfirmed merge.

Current M1 AGENTS/PROJECT_STATE/DECISIONS were read and checked against actual refs. The latest explicit user authorization permits cloud suites despite unavailable Actions and forbids canonical memory changes; it governs over historical generic gates. The cloud-environment-runtime skill checked runtime/network policy. No Actions/paid runner was used.

Cloud Linux, Python3.12.14, Node24.19.0, Playwright1.58.2, real Chromium154.0.8037.57. Existing dependencies matched the new commit's byte-identical package-lock; the runtime-only node_modules link was removed afterward. Product, existing tests/assertions/CI stayed unchanged. All fictional data used new `/tmp/pr46-retest/independent/data`; automated fixtures likewise had isolated temporary roots. No existing user business data was accessed.

To reproduce the same anonymous case, the prior actual fictional S4 ZIP was restored through the new product UI into an empty directory. All four tables/history/PDF bytes matched the original seed. This was setup, not inferred new-SHA acceptance: reset, reselection, quote revision, calculation, save and export were actually rechecked. Drivers preflighted dynamic visible/enabled controls and disclosure state, with no blind toggle. See [method freeze](preflight-methods.json).

## 2. Actual complete automation

| Unmodified original command | Actual result | Raw evidence |
|---|---|---|
| `python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'` |43PASS,exit0|[stderr](automation/python-backend/stderr.log),[command](automation/python-backend/command.json)|
| `npm test` |10PASS,exit0|[stdout](automation/node-business/stdout.log),[command](automation/node-business/command.json)|
| `npm run test:e2e` |50PASS,exit0,single worker,no skip/retry|[stdout](automation/chromium-e2e/stdout.log),[command](automation/chromium-e2e/command.json)|

Supported `SRM_CHROMIUM_PATH=/usr/bin/chromium` selected the real installed browser without editing config/assertions. New `UX manual-only: buyer-approved amount distinct from suggested totals / 人工定标金额独立显示` actually ran and passed. These103 are fresh-SHA executions, not copied historical102. [Every case](automation-cases.csv),[runner summary](automation/automated-results.json). All original runner JSON,50 traces,server logs and HTML report are losslessly archived: [instructions](README-raw-evidence.md).

## 3. P2/C05 independent business retest

| ID | Result | Actual outcome |
|---|---|---|
| P2-01 |PASS|L2 B82×2,L5 B75×5,L12 A120×12: independent manual **3/1979.00**, theoretical **6940.00**, mixed suggestion **7064.00 including suggestions**, original labels preserved|
| P2-02 |PASS|Actual CSV/internal XLSX/individual and all-supplier ZIP downloads:46 numerical/identity/isolation/PDF-byte checks; no DB changes|
| P2-03 |PASS|Reset leaves0 manual with explicit no confirmed award, no misleading priced zero; genuine3-line reselection and save/F5 retain1979|
| P2-04 |PASS|Real B same-round new revision changes L2 from82 to83 and confirms; L2 flagged for review; eligible manual **2/1815.00**, old confirmed quote history unchanged, exclusion persists after F5|
| P2-05 |PASS|New formal RFQ imports12 actual material rows with no valid quotation; explicit0 manual/no confirmed award, no fabricated manual zero-price sum|

1979=164+375+1440;1815=375+1440. No state-set injection manufactured results. Actual own-scope totals remain A10/6420,B12/7185,C2/990; shared A/B10 lines6420/6665. Missing is not zero; applicable tier prices remain correct. Actual XLSX retains all12RFQ identities,selected L12 price120,L2 price82 and higher-price reason.

[Three separate totals](independent/evidence/P2-3-manual-1979-theory6940-mixed7064.png),[reset](independent/evidence/P2-zero-after-reset.png),[review exclusion](independent/evidence/P2-excludes-pending-review-1815-2-lines.png),[no valid bids](independent/evidence/P2-no-effective-quotation-zero-manual.png),[46 actual file checks](independent/evidence/export-checks.json).

## 4. P3/V01 three sizes and real save states

| ID | Result | Actual outcome |
|---|---|---|
| P3-01 |PASS|1024×768,1366×768,1600×900 × five pages (items/allocation/intake/comparison/settings): one persistent concise indicator with drawers closed, old mirror absent; actual server state equals saved snapshot. Original three diagnostics remain reachable with versions/times/backup details|
| P3-02 |PASS|Adding fictional supplier creates actual unsaved state; real PUT is held then continued, never replaced with fake response. All sizes show pending rather than saved; all DB/history/PDF bytes unchanged until release; actual200 then persists supplier|
| P3-03 |PASS|Two real browser tabs yield genuine stale-version SQLite409 after first tab wins. All sizes show sole concise error state; diagnostics retain409/stopped-retry; stale unsaved supplier remains in memory but is never acknowledged, committed DB and PDFs remain exactly winner state, confirmed by reload|

While the real request was pending the actual concise text was **保存状态待确认** with pending styling; diagnostics said **正在自动保存……**. It did not falsely claim saved. Under this task's truthfulness requirement it passes; more specific in-progress wording is a usability suggestion, not a new confirmed false-save defect. Conflict was actual backend revision protection, not a fabricated409.

| Size | Saved | Actual pending | Actual409 | Original error diagnostics |
|---|---|---|---|---|
|1024×768|[image](independent/evidence/P3-saved-1024-quotes.png)|[image](independent/evidence/P3-pending-1024.png)|[image](independent/evidence/P3-conflict-1024.png)|[details](independent/evidence/P3-conflict-diagnostics-1024.png)|
|1366×768|[image](independent/evidence/P3-saved-1366-quotes.png)|[image](independent/evidence/P3-pending-1366.png)|[image](independent/evidence/P3-conflict-1366.png)|[details](independent/evidence/P3-conflict-diagnostics-1366.png)|
|1600×900|[image](independent/evidence/P3-saved-1600-quotes.png)|[image](independent/evidence/P3-pending-1600.png)|[image](independent/evidence/P3-conflict-1600.png)|[details](independent/evidence/P3-conflict-diagnostics-1600.png)|

[Actual409](independent/evidence/P3-conflict-http.json),[SQLite before/after plus browser/server logs](independent/evidence),[independent trace](independent/evidence/independent-trace.zip). Additional diagnostics/context shown only after explicit disclosure are not another persistent indicator; errors were never hidden to manufacture the one-status result.

## 5. Errors, environment and untested boundaries

The eight independent groups include117 explicit business/status checks plus46 file checks, counted separately from103 suite cases. No new driver error/correction,pageerror or failed transport. Expected409 is a passing safety rejection; raw console evidence remains. NO_COLOR/FORCE_COLOR warnings are nonfatal environment messages; all commands exited0. [Register](raw-error-register.json),[execution summary](independent/execution-summary.json).

Exact-SHA [UI Actions39766115997](https://github.com/yudacheng666/SRM_System/actions/runs/39766115997) and[S3/S4 Actions39766115887](https://github.com/yudacheng666/SRM_System/actions/runs/39766115887) remain failure; API returned no execution steps for four jobs (steps=null):[runs](actions.json),[UI jobs](actions-jobs-ui.json),[S4 jobs](actions-jobs-s4.json). Developer handoff attributes non-start to account quota/billing; missing steps alone does not independently prove that root cause. Local103PASS cannot be converted into official Actions success.

**NOT TESTED:** native Windows Python3.13,Windows Node,PowerShell/batch pilot launch (three groups; no actual Windows environment). Exhaustive failure/load matrices,multiple browsers,full accessibility/pixel fidelity,real business data/desktop Excel are outside this scoped run. No inference fills these gaps.

## 6. Evidence and recommendation

Only `docs/uat/20261022-pr46-2dbde57-p2p3-retest/` is appended to existing Draft PR #50. Both original c2737f0 evidence directories/reports remain unchanged. Evidence-branch historical HEAD is not the tested product SHA; the independent exact checkout and report lock2dbde57. Full raw artifacts use lossless standard tar hardlink deduplication and32MiB volumes; every original file hash was revalidated. There are34 independent original screenshots,one independent trace and50 suite traces.

ChatGPT can review the evidence and accept the two targeted fixes as independently retested, while formalCI/Windows/owner gates remain. **Do not merge evidence/product PRs or declare whole-product release-ready.** Product,existing tests,CI,memory,main/M1/product branches were not changed; no PR was closed.
'''
(D/'REPORT.en.md').write_text(en)

for p in D.glob('REPORT.*.md'):
 for link in re.findall(r'\]\(([^)]+)\)',p.read_text()):
  if not link.startswith(('http://','https://')):assert (D/link).exists(),link
for p in D.rglob('*.zip'):
 if p==D/'fixtures/broken.zip':continue
 with zipfile.ZipFile(p)as z:assert z.testzip() is None,p
with (D/'SHA256SUMS').open('w')as f:
 for p in sorted(D.rglob('*')):
  if p.is_file() and p.name!='SHA256SUMS':f.write(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(D)}\n')
print('PACKAGE_COMPLETE',len(list(D.rglob('*'))),'entries',flush=True)
