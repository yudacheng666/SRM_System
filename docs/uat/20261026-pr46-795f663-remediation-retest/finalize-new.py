from pathlib import Path
import json,csv,hashlib,shutil,subprocess,re,zipfile,collections
R=Path('/workspace/uat795');E=Path('/tmp/srm66-evidence');P=Path('/tmp/srm795-product');D=E/'docs/uat/20261026-pr46-795f663-remediation-retest';sha='795f663933f6883bc6e05d30b4ebbc2623a3301c';parent='369e2b775c2b8a022521c1b3b3411dec9005e8be'
def write(name,obj):(D/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
for name in ['attempt-03']:
 for part in ['evidence','downloads']:shutil.copytree(R/name/part,D/name/part)
shutil.copytree(R/'methods',D/'methods')
for name in ['identity-end.json','http-end.json','protected-refs-end.txt']:
 shutil.copy2(R/name,D/name)
phase1=json.loads((D/'automation/phase1/automated-results.json').read_text());phase2=json.loads((D/'automation/phase2/automated-results.json').read_text());p1={c['title']:c for c in phase1['cases']};p2={c['title']:c for c in phase2['cases']}
old=json.loads((E/'docs/uat/20261026-pr46-66a0579-unified/automation/failure-classification.json').read_text());af=[]
for c in old:
 a=p1[c['title']];b=p2[c['title']];ok=a['status']==b['status']=='expected'
 if c['id']=='AF-02':reason='Old badge assertion now passes; after reload test fills hidden #itemSearch at acceptance.spec.cjs:239 without navigating to Materials. Later PDF/ZIP assertions NOT REACHED.'
 elif c['id']=='AF-04':reason='Old badge and genuine stale-tab409 assertions now pass; later after stopping server, main page remains Materials and test fills hidden #pilotCounterpartyCode (CP-OFFLINE) at acceptance.spec.cjs:313. Remaining offline/manual recovery assertions NOT REACHED. Phase1 timeout additionally caused trace-finalization ZIP error/no trace attachment; Phase2 usable original trace confirms last waiting action.'
 elif c['id']=='AF-06':reason='Initial project-page assertion now passes; post-reload line486 still expects permanent project details to be closed. Later first-row check NOT REACHED.'
 else:reason='Whole unchanged original test passed on this SHA in both targeted and full runs, including assertions previously not reached.'
 af.append({'id':c['id'],'title':c['title'],'priorSHA':'66a0579d88177143737b109efb3a8790c6cce053','priorStatus':'FAIL','phase1':'PASS'if a['status']=='expected'else'FAIL','phase2':'PASS'if b['status']=='expected'else'FAIL','classification':'PASS'if ok else'TEST_PATH_OR_ASSERTION_DEFECT','assessment':reason,'rawOriginalErrorsPhase1':[e for r in a['results']for e in r['errors']],'rawOriginalErrorsPhase2':[e for r in b['results']for e in r['errors']]})
write('automation/AF-remediation-classification.json',af)
# Original command totals, never add targeted duplicates to full-suite total.
stats=phase2['stats'];fullPass=54+stats['expected'];fullFail=stats['unexpected'];assert len(phase2['cases'])==56
summary={'productSHA':sha,'phase1':{'selected':len(phase1['cases']),'PASS':phase1['stats']['expected'],'FAIL':phase1['stats']['unexpected'],'oldAF15PASS':sum(a['phase1']=='PASS'for a in af),'oldAF15FAIL':sum(a['phase1']=='FAIL'for a in af),'exitCode':1},'phase2':{'python':{'PASS':44,'FAIL':0,'exitCode':0},'node':{'PASS':10,'FAIL':0,'exitCode':0},'chromium':{'PASS':stats['expected'],'FAIL':stats['unexpected'],'skipped':stats['skipped'],'flaky':stats['flaky'],'exitCode':1},'fullTotal':{'PASS':fullPass,'FAIL':fullFail,'total':110},'npmCIExit':0},'officialActions':'NOT RUN; not claimed successful','environment':json.loads((R/'identity-start.json').read_text())['runtime']};write('automation-summary.json',summary)
with(D/'automation-cases.csv').open('w',newline='')as f:
 w=csv.writer(f,lineterminator='\n');w.writerow(['id','phase','status','name','productSHA','evidence'])
 py=(D/'automation/phase2/python-backend/stderr.log').read_text();names=re.findall(r'^(test_\S+ \([^\n]+?\))',py,re.M);assert len(names)==44 and py.rstrip().endswith('OK')
 for i,n in enumerate(names,1):w.writerow([f'PY-{i:02}','full','PASS',n,sha,'automation/phase2/python-backend/stderr.log'])
 no=(D/'automation/phase2/node-business/stdout.log').read_text();names=[x[2:].split(' (',1)[0]for x in no.splitlines()if x.startswith('✔ ')];assert len(names)==10
 for i,n in enumerate(names,1):w.writerow([f'NODE-{i:02}','full','PASS',n,sha,'automation/phase2/node-business/stdout.log'])
 for phase,x in [('phase1',phase1),('phase2',phase2)]:
  for i,c in enumerate(x['cases'],1):w.writerow([f'{phase}-E2E-{i:02}',phase,'PASS'if c['status']=='expected'else'FAIL',c['title'],sha,f'automation/{phase}/automated-results.json#{c["id"]}'])
log=[json.loads(l)for l in (R/'attempt-03/evidence/browser.jsonl').read_text().splitlines()];assert not any(x['kind']=='unanticipated-error'for x in log);assert any(x['kind']=='scope-complete'and x.get('id')=='S4-STORED-NEGATIVE'for x in log)
obs=[x for x in log if x['kind']=='acceptance-observation'];assert sum(not x['pass']for x in obs)==2
ux=[
('UX-01','PASS','中文与真实单一保存状态 / Chinese and truthful single save status','Three sizes, real pending200 and SQLite409; diagnostics remain available','UX01-1366-genuine-SQLite-conflict.png'),
('UX-02','PASS','中文项目名和稳定身份 / Project names and stable IDs','New/rename/other-project history/switch/F5/service restart preserve all rows/history/PDF','UX02-two-named-projects-after-restart.png'),
('UX-03','PASS','唯一导航高亮 / One navigation selection','7 actual pages x3 sizes; sidebar/header/workflow transitions','UX-1366-project.png'),
('UX-04','PASS','常驻项目首页 / Permanent first project stage','Direct project actions and five real workflow stages; no hidden-summary click','UX-1366-project.png'),
('UX-05','PASS','独立管理与恢复安全 / Separate administration and restore safety','Reread cancel/dirty/busy guards; valid current STORED tamper400 genuine PDF hash error + exact empty target unchanged, valid restore200 and nonempty409','S4-audited-backend-rejection.json'),
('UX-06','PASS','紧凑物料与分页 / Compact items and paging','Fresh12 and52 lines; actual preview50+2 and final52; cross-page/filter selections preserved','UX06-real-52-items-second-page.png'),
('UX-07','PASS','真实图纸状态 / Real drawing states','Missing/PDF/not-required labels; original valid multi-page PDF bytes and actual viewer','UX07-three-real-drawing-states.png'),
('UX-08','PASS','供应商分配 / Supplier allocation','Two views share relations; append/duplicate/remove/search, inline identities and52-line cross-page operation','UX08-1366-supplier-first.png'),
('UX-09','FAIL','比价紧凑性 / Comparison density','Same-line price/details PASS; actual row44.4375px exceeds exact44 assertion; first actual row top843.96875 >768. Controls/math/details valid','UX09-independent-before-awards.json')]
core=[
('CORE-01','PASS','Excel预览和确认 / Excel preview and commit','12 fresh lines, same-code distinct-spec identities; preview not persisted','CORE01-after-import-preview.json'),
('CORE-02','PASS','PDF匹配和原件 / PDF matching and originals','1/2/0 candidate states, manual confirmation and exact original viewer bytes','CORE02-clicked-correct-real-PDF.png'),
('CORE-03','PASS','多对多分配 / Many-to-many allocation','A/B12,C2, additive/dedup/removal/two views/search','UX08-item-first-multiple-suppliers.png'),
('CORE-04','PASS','多轮和阶梯报价 / Rounds and tiers','5 confirmed submissions/50 lines; V1 immutable,9 explicit carries, actual tier118/2.25, file/paste/manual source and preview safety','Q04-all-confirmed.json'),
('CORE-05','PASS','比价人工定标 / Manual decisions','Pending10+2, tie75/75, higher82vs20 requires real reason, not-quoted not0; manual3/1979 vs theory6940 vs mixed7064','C05-scoped-amounts-and-decisions.png'),
('CORE-06','PASS','实际文件下载 / Actual file downloads','46 actual export content/CRC/row/PDF/math/separation checks','export-checks.json'),
('CORE-07','PASS','跨项目和持久化 / RFQs and persistence','52-line secondRFQ; twoRFQs F5/service restart preserve complete state/history/PDF','CORE07-after-service-restart.json'),
('CORE-08','PASS','保存等待和冲突 / Pending and conflict','Real heldPUT/ACK200 and two-tab409; all committed rows preserved, truthful header','CORE08-conflict-http.json'),
('CORE-09A','PASS','S4完整性 / S4 integrity','11 ZIP CRC/manifest DB hash/SQLite integrity/4table/PDF checks','s4-checks.json'),
('CORE-09B','PASS','空目标恢复 / Empty-target restore','Real UI200, same target accepts unchanged valid archive; all twoRFQ data/history/PDF and manual1979 intact','S4-positive-control-restored.json'),
('CORE-09C','PASS','非空拒绝 / Nonempty refusal','UI refusal + real409 RESTORE_TARGET_NOT_EMPTY; full restored data unchanged','S4-nonempty-backend.json'),
('CORE-09D','PASS','合法STORED内容篡改拒绝 / Valid STORED content tamper rejection','One same-length PDF byte changed; original manifest/names; validCRC; UI400 + Node audited RESTORE_PDF_HASH_MISMATCH; rows/files/directories unchanged','S4-audited-backend-rejection.json')]
win=[('WIN-01','NOT TESTED','Native Windows Python3.13','No native Windows','identity-end.json'),('WIN-02','NOT TESTED','Native Windows Node22','No native Windows; Linux Node24 is different','identity-end.json'),('WIN-03','NOT TESTED','Native Windows PowerShell/BAT/local safety','No native Windows','identity-end.json')]
with(D/'results.csv').open('w',newline='')as f:
 w=csv.writer(f,lineterminator='\n');w.writerow(['id','category','status','name','observed','evidence','productSHA'])
 for cat,rows in [('buyerUX',ux),('coreBusiness',core),('nativeWindows',win)]:
  for id,status,name,fact,ev in rows:w.writerow([id,cat,status,name,fact,('attempt-03/evidence/'+ev)if not id.startswith('WIN')else ev,sha])
 for a in af:w.writerow([a['id'],'old15-targeted',a['phase1'],a['title'],a['assessment'],'automation/AF-remediation-classification.json',sha])
write('execution-summary.json',{'productSHA':sha,'verdict':'NOT READY','independentUX':{'PASS':8,'FAIL':1,'BLOCKED':0},'coreBusiness':{'PASS':12,'FAIL':0,'BLOCKED':0},'nativeWindows':{'NOT TESTED':3},'driverCorrections':2,'newIndependentAttempt3Completed':True,'ordinaryChecksPASS':sum(x['kind']=='check'and x['pass']for x in log),'acceptanceObservationsFAIL':2,'officialActionsSuccessClaim':False,'protectedBranchesUnchanged':True})
write('raw-error-register.json',{'productSHA':sha,'originalAutomationFailures':'automation/AF-remediation-classification.json; both phase*/failures and automated-results.json retain original FAIL','phase1AF04EvidenceGap':'Timeout also caused End of central directory signature error during trace finalization; no trace attachment was produced for that case. Screenshots/context/server log retained; Phase2 trace exists and confirms hidden offline supplier input. Available archives validated separately.','driverErrors':[json.loads((R/f'driver-correction-0{i}.json').read_text())for i in [1,2]],'remainingCorrections':0,'thirdAttempt':'Complete, no further fault/correction/restart','expectedSafetyResponses':[{'status':409,'meaning':'real stale SQLite revision'},{'status':400,'meaning':'valid ZIP_STORED PDF content hash mismatch; twice, actual UI and Node audit'},{'status':409,'meaning':'nonempty restore target'}],'factsVsUnknown':'Known exact failure points recorded. No inferred root cause for the phase1 trace-finalization failure; no product code diagnosis from inspection alone.'})
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=P,text=True).strip()==sha
assert subprocess.check_output(['git','status','--porcelain'],cwd=P,text=True)==''
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=E,text=True).strip()==parent
assert(R/'protected-refs-start.txt').read_bytes()==(R/'protected-refs-end.txt').read_bytes()
oldTrees=[]
for n in subprocess.check_output(['git','ls-tree','--name-only',parent+':docs/uat'],cwd=E,text=True).splitlines():
 path='docs/uat/'+n;a=subprocess.check_output(['git','ls-tree','-r',parent,'--',path],cwd=E);b=subprocess.check_output(['git','ls-tree','-r','HEAD','--',path],cwd=E);assert a==b;oldTrees.append({'path':path,'treeListingSHA256':hashlib.sha256(a).hexdigest()})
write('original-evidence-preservation.json',{'parentEvidenceCommit':parent,'allOriginalCommittedTreesUnchanged':True,'trees':oldTrees,'onlyAuthorizedNewDirectory':str(D.relative_to(E))})
# Reports authored below; checksums generated after final reports.
print('FINAL_FACTS',summary['phase2']['fullTotal'],len(log),flush=True)
