from pathlib import Path
import json,shutil,re,csv,hashlib,zipfile,collections,subprocess
R=Path('/workspace/uatd7');E=Path('/workspace/srmf8-evidence');D=E/'docs/uat/20261029-pr46-d7c4c88-tooltip-restore-retest';SHA='d7c4c88abd354ebdc5d3bfedfc9199e278c48483';PARENT='5c179854188f01ea7614d019c0f4c31f7f90ca8e'
def wr(n,x):(D/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
ignore=shutil.ignore_patterns('__pycache__','*.pyc')
for n in ['methods','methods-attempt02','fixtures','fixtures-attempt02','attempt-01-fixtures']:shutil.copytree(R/n,D/n,ignore=ignore)
for a in ['independent','attempt-02']:
 for n in ['evidence','downloads']:
  if(R/a/n).exists():shutil.copytree(R/a/n,D/a/n,ignore=ignore)
for n in ['identity-start.json','identity-end.json','http-start.json','http-attempt02-start.json','http-end.json','http-trace-identity.json','protected-refs-start.txt','protected-refs-end.txt','independent-preflight.json','independent-timeout-observation.json','runtime-observation.json','prepare-independent.py','prepare-second-attempt.py','run-automation.py','automation-runner.log','archive-automation.py','archive-automation.log','verify-http-traces.py','finalize-facts.py','prior-failure-current-status.json','candidate-original-test-diff.patch','original-supplier-dialog-events.json','github-task-and-version.json']:shutil.copy2(R/n,D/n)
x=json.loads((D/'automation/automated-results.json').read_text());bad=[c for c in x['cases']if c['status']!='expected'];classified=[]
for i,c in enumerate(bad,1):
 raw='\n'.join(e.get('message','')for r in c['results']for e in r['errors']);clean=re.sub(r'\x1b\[[0-9;]*m','',raw)
 if c['title'].startswith('08 '):kind='STALE_RESTORE_WORDING';cause='Original test still requires 未成功; actual Chinese refusal says 完整备份恢复未完成. Independent malformed ZIP400 and unchanged target PASS.'
 elif c['title'].startswith(('15 ','45 ','46 ')):kind='AMBIGUOUS_PARENT_ROW_CLICK';cause='Original parent-row center click hits nested 移出本次询价 button, confirmed by actual trace confirm dialogs and independent elementFromPoint at same x415.57,y828.95. Name selection and assigned export work; original later business assertions NOT REACHED.'
 elif c['title'].startswith('UI V3 integration:'):kind='THEME_EXPECTATION_MISMATCH';cause='Expected #F6F8FB; actual #F5F7F9 from current UI. Treat as unresolved design/test expectation mismatch, not an established purchasing logic defect.'
 else:raise AssertionError(c['title'])
 classified.append({'id':f'AF-{i:02}','severity':'P3 test/expectation maintenance; not confirmed product severity','classification':kind,'title':c['title'],'file':c['file'],'line':c['line'],'status':'FAIL','interpretation':cause,'cleanError':clean,'laterAssertions':'NOT REACHED after original failure; independent PASS does not overwrite original FAIL','evidence':f'automation/failures/FAIL-{i:02}/failure.json'})
wr('automation/failure-classification.json',classified)
py=(D/'automation/python-backend/stderr.log').read_text();pyNames=re.findall(r'^(test_\S+ \([^\n]+?\))',py,re.M);pyCount=int(re.search(r'Ran (\d+) tests?',py).group(1));assert len(pyNames)==pyCount and py.rstrip().endswith('OK')
node=(D/'automation/node-business/stdout.log').read_text();nodeNames=[s[2:].split(' (',1)[0]for s in node.splitlines()if s.startswith('✔ ')];assert len(nodeNames)==int(re.search(r'ℹ pass (\d+)',node).group(1))
summary={'productSHA':SHA,'platform':'Linux supplemental; not native Windows','PythonPASS':pyCount,'NodePASS':len(nodeNames),'Chromium':x['stats'],'fullPASS':pyCount+len(nodeNames)+x['stats']['expected'],'fullFAIL':x['stats']['unexpected'],'total':pyCount+len(nodeNames)+len(x['cases']),'failureGroups':dict(collections.Counter(c['classification']for c in classified)),'GitHubActions':'NOT RUN; not claimed green','originalTestsAndCIUnmodified':True};wr('automation-summary.json',summary)
with(D/'automation-cases.csv').open('w',newline='')as f:
 w=csv.writer(f,lineterminator='\n');w.writerow(['id','platform','status','name','productSHA','evidence'])
 for pref,names,ev in [('PY',pyNames,'python-backend/stderr.log'),('NODE',nodeNames,'node-business/stdout.log')]:
  for i,n in enumerate(names,1):w.writerow([f'{pref}-{i:02}','Linux','PASS',n,SHA,'automation/'+ev])
 for i,c in enumerate(x['cases'],1):w.writerow([f'E2E-{i:02}','Linux/Chromium','PASS'if c['status']=='expected'else'FAIL',c['title'],SHA,'automation/automated-results.json#'+c['id']])
prior=json.loads((R/'prior-failure-current-status.json').read_text());priorSummary={}
for group,overflow in [('prior17',False),('prior6overflow',True)]:
 z=[q for q in prior if(q['prior']=='CONFIRMED_HORIZONTAL_OVERFLOW')==overflow];priorSummary[group]={'PASS':sum(q['status']=='expected'for q in z),'FAIL':sum(q['status']!='expected'for q in z),'total':len(z)}
wr('prior-case-retest-summary.json',{'soleCurrentResultSHA':SHA,'priorReference':'f8a67d7 is used only to identify previous failed case names, never as current PASS evidence','summary':priorSummary,'cases':prior,'patchAudit':{'filesChangedByDeveloper':5,'businessChecksKept':['real PUT200 acknowledgment','saved state equality','restore refusal400/409','quote/history checks'],'scope':'candidate-original-test-diff.patch; Codex did not change these files','remainingGaps':'Five whole cases remain FAIL at subsequent assertions; cannot close original17 as a set'}})
A=D/'attempt-02/evidence';events=[json.loads(l)for l in(A/'browser.jsonl').read_text().splitlines()];failed=[q for q in events if q.get('pass')is False or q['kind']=='unanticipated-error'];assert not failed
checks=[q for q in events if q['kind']in ['check','acceptance-observation']];tips=json.loads((A/'tooltip-retest.json').read_text());layout=json.loads((A/'layout-overflow.json').read_text());copy=json.loads((A/'copy-audit.json').read_text());assert all(not q['hits']for q in copy)
assert len(layout)==18 and all(q['pageWidth']<=q['viewport']['width']+2 for q in layout)
assert all(0<=b['left']and b['right']<=t['width']+1 and 0<=b['top']and b['bottom']<=t['height']+1 and b['documentWidth']<=t['width']+1 for t in tips for b in [t['pointer'],t['keyboard']])
assert all(t['pointerEscHidden']and t['hoveredAfterEscape']and t['keyboardEscHidden']and t['focusedAfterEscape']and t['pinnedVisible']and t['awayHidden']for t in tips)
first=json.loads((A/'UX09-independent-before-awards.json').read_text())['rows'][0];assert first['bottom']<=768 and first['height']<=44 and first['scrollY']==0
contentCounts={}
for n in ['backup-class-checks.json','export-checks.json','s4-checks.json']:
 q=json.loads((A/n).read_text());assert all(y['pass']for y in q);contentCounts[n]=len(q)
wr('independent-summary.json',{'productSHA':SHA,'attempt02CheckRecords':len(checks),'allAttempt02ChecksPASS':True,'tooltipInstances':len(tips),'tooltipCountsByWidth':dict(collections.Counter(t['width']for t in tips)),'tooltipCountsByPageAndViewport':dict(collections.Counter(str(t['width'])+'-'+t['tab']for t in tips)),'layoutPages':len(layout),'layoutFAIL':0,'copyStates':len(copy),'copyTermHits':0,'fileContentChecks':contentCounts,'firstActualPricedRow':first,'scopeComplete':[q for q in events if q['kind']=='scope-complete'],'firstAttempt':'1 original actionability timeout preserved separately; ROOT CAUSE UNKNOWN. Later sequential PASS is not a fix claim.'})
rows=[]
def add(i,s,n,e,notes='',platform='Linux/Chromium'):rows.append({'id':i,'platform':platform,'status':s,'name':n,'evidence':e,'notes':notes,'productSHA':SHA})
add('HEAD','PASS','Exact checkout, PR HEAD and actual served HTML','http-trace-identity.json','86 captured actual root responses match the current checkout')
add('AUTO-PY','PASS','Complete original Python backend suite','automation/python-backend/stderr.log',f'{pyCount} PASS','Linux/Python3.12')
add('AUTO-NODE','PASS','Complete original Node business suite','automation/node-business/stdout.log',f'{len(nodeNames)} PASS','Linux/Node24')
add('AUTO-E2E','FAIL','Complete original Chromium E2E suite','automation/failure-classification.json','53 PASS /5 FAIL /0 skip /0 retry; original failures retained')
add('OLD-17','FAIL','Seventeen previously blocked/outdated whole cases','prior-case-retest-summary.json','12 PASS /5 FAIL at subsequent assertions; preserved actual state assertions')
add('OVERFLOW-6','PASS','Six original horizontal-overflow cases','prior-case-retest-summary.json','6/6 current-SHA PASS, subset of E2E58')
add('LAYOUT-18','PASS','Six actual pages across all three viewports','attempt-02/evidence/layout-overflow.json','18 page measurements; no whole-document overflow')
for i,n in [('TIP-BOUNDS','Pointer and keyboard popup bounds'),('TIP-TAB','Real Tab opens the popup and focus stays on trigger'),('TIP-ESC','Escape dismisses with pointer/focus retained'),('TIP-PIN','Pinned popup and click-away dismissal')]:add(i,'PASS',n,'attempt-02/evidence/tooltip-retest.json','83 actual visible instances;1024x768/1366x768/1600x900; stored state/history/PDF unchanged')
for i,n,e,notes in [
 ('RESTORE-MALFORMED','Malformed ZIP rejected with Chinese guidance','BACKUP-malformed-zip-friendly-rejection.png','Real HTTP400; empty target unchanged; independently covers business assertion later blocked by old 未成功 wording'),
 ('RESTORE-ARCHIVE','Actual inquiry/drawing package rejected as full restore','archive-rejection-real-backend.json','UI+backend400; actionable Chinese, no raw RESTORE_*; exact target unchanged'),
 ('RESTORE-HASH','Legal STORED ZIP with wrong PDF hash rejected','S4-audited-backend-rejection.json','One changed byte, same length, fresh valid CRC, unchanged manifest;400 RESTORE_PDF_HASH_MISMATCH; target files and semantic data unchanged'),
 ('RESTORE-EMPTY','Correct complete archive restores into empty target','S4-positive-control-restored.json','Two RFQs; all tables,50 confirmed-history lines, quote versions, manual decisions and3PDF hashes match source'),
 ('RESTORE-NONEMPTY','Nonempty target refuses overwrite','S4-nonempty-backend.json','UI refusal and actual409 RESTORE_TARGET_NOT_EMPTY; restored database/history/PDF unchanged'),
 ('ZIP-CONTENT','Downloaded backup classes and ZIP/SQLite/PDF integrity','s4-checks.json','30 class checks +11 full integrity checks; original mail/chat explicitly excluded'),
 ('SAVE-STATE','Actual pending save and acknowledged success','CORE08-while-held.json','Real held PUT; no false saved state, backup blocked at all3sizes; real200 required before saved'),
 ('SAVE-CONFLICT','Real stale-tab SQLite revision conflict','CORE08-conflict-http.json','Actual409, visible save failure/details; winning data and all history/PDF retained'),
 ('SAVE-OUTAGE','Actual service outage and saved-data protection','offline-after-manual-save.json','Failure truthful; persisted DB unchanged before restart, manual200 andF5; quote/history preserved'),
 ('HISTORY','Locked revisions and saved/restored quote history','Q04-all-confirmed.json','5 confirmed revisions/50 history lines, V1 immutable, explicit9 carry lines and tiers118/2.25'),
 ('CORE01','Actual material XLSX import and duplicate-code line identities','CORE01-real-excel-preview.png','12 new synthetic lines, preview does not save'),
 ('CORE02','Real PDF matching, ambiguous/unmatched and original download bytes','CORE02-clicked-correct-real-PDF.png','Actual3PDFs; unique/ambiguous/unmatched; preview does not persist'),
 ('CORE03','Supplier multi-assignment, duplicate append, remove and filter','UX08-item-first-multiple-suppliers.png','Independent fresh UD7-A/B/C; existing links retained'),
 ('CORE04','XLSX/paste/manual quotes, rounds/versions and preview safety','Q03-same-round-version-difference.png','Real file refresh refusal and carry preview preservation; no history replacement'),
 ('CORE05','Ties, higher-price reasons, paging and separate totals','C05-scoped-amounts-and-decisions.png','Manual3/1979 vs theory6940 vs mixed7064; pending9; tied-lowest no reason'),
 ('CORE06','Actual supplier ZIP/CSV/comparison XLSX contents','export-checks.json','46 file-content checks; per-supplier PDF scope and values'),
 ('CORE07','RFQ switch,F5 and real service restart persistence','CORE07-after-service-restart.json','Separate52-line second RFQ; all source rows/history/PDF hashes stable'),
 ('FIRST-ROW','Entire first actual priced row at1366x768','UX09-independent-before-awards.json',f"top={first['top']},bottom={first['bottom']},height={first['height']},scrollY={first['scrollY']}"),
 ('TRIAGE-NAME','Supplier label selection avoids nested remove action','original-failure-center-hit.json','At1440x1000 original container center really hits 移出本次询价; label click selects supplier and keeps all saved rows'),
 ('TRIAGE-EXPORT','Actual assigned-supplier export through visible action','original-failure-triage-export.json','Real ZIP withXLSX/PDF,no privateJSON; source data unchanged')]:add(i,'PASS',n,'attempt-02/evidence/'+e,notes)
add('COPY','PASS','Six-page rendered buyer copy and real error states','attempt-02/evidence/copy-audit.json',f'{len(copy)} visible states; no S4/M0-M9/SQLite matches in rendered text/visible attributes')
for i,n in enumerate(['Native Windows Python3.13 backend','Native Windows Node22 business suite','Native Windows isolated program/data directory, CMD/BAT/Edge UI and restore safety'],1):add(f'WIN-{i:02}','NOT TESTED',n,'identity-start.json','Only Linux execution environment available; not substituted by Linux results','Native Windows')
with(D/'results.csv').open('w',newline='')as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(rows)
wr('results.json',rows);counts=collections.Counter(q['status']for q in rows)
wr('execution-summary.json',{'productSHA':SHA,'verdict':'NOT READY: original full E2E not green; not whole-product acceptance','requirementRows':dict(counts),'automation':summary,'overlappingCounts':'Requirement rows, prior17/prior6 and83 tooltip samples overlap suite/business scope; do not add them as independent test totals','confirmedNewProductIssues':{'P1':0,'P2':0,'P3':0},'originalTestFailures':5,'originalIndependentTimeouts':1,'firstTimeoutRootCause':'UNKNOWN','Windows':'3 NOT TESTED','ActionsTriggered':False,'mergedOrClosed':False,'historicalResultsTransferred':False})
wr('issues.json',{'confirmedNewProductDefects':[],'previousProductFindings':[
 {'id':'P3-UI-01','status':'PASS on sole current SHA within tested scope','evidence':'attempt-02/evidence/tooltip-retest.json','scope':'83 popup instances/18 page layouts/6 original overflow cases; no claim about untested devices'},
 {'id':'P3-COPY-02','status':'PASS on sole current SHA within tested scope','evidence':'attempt-02/evidence/S4-audited-backend-rejection.json','scope':'Wrong package, valid-PDF hash mismatch and nonempty refusals translated; raw codes remain only backend/diagnostic logs'}],
 'testMaintenance':[{'id':'P3-TEST-01','severity':'P3, test maintenance','problem':'Damaged ZIP still expects obsolete 未成功 token','repro':'Run unmodified complete E2E; acceptance.spec.cjs:365','expected':'Verify actual refusal and target unchanged using supported UI feedback','actual':'Raw suite FAIL although independent400/unchanged-target checks PASS','evidence':'automation/failures/FAIL-01','suggestion':'Developer update only the obsolete copy expectation while keeping refusal/data assertions'},
 {'id':'P3-TEST-02','severity':'P3, test driver','problem':'Supplier parent-row center click invokes nested removal, not supplier selection','repro':'At1440x1000 run acceptance15,45,46. Selector [data-sf-s] center lies on data-pool-remove button. Existing handler accepts for15/45 and dismisses for46.','expected':'Intended supplier selection should target the supplier label/selection area and assert no deletion dialog','actual':'15/45 remove an intended supplier;46 sees extra confirm. Later intended checks not reached.','evidence':['original-supplier-dialog-events.json','attempt-02/evidence/original-failure-center-hit.json','attempt-02/evidence/TRIAGE-real-supplier-name-selection.png'],'suggestion':'ChatGPT repair precise original test locators; keep all isolation/export/dirty and history assertions. Codex did not edit original tests.'},
 {'id':'P3-TEST-03','severity':'P3, visual expectation mismatch','problem':'UI integration still requires background#F6F8FB while actual currentUI renders#F5F7F9','repro':'Run original ui-v3-integration.spec.cjs:65','expected':'One approved current design token shared by product and test','actual':'Original test FAIL; no purchasing calculation or data corruption established','evidence':'automation/failures/FAIL-05','suggestion':'ChatGPT confirm approved theme token, then align product or test as appropriate; no silent relaxation by tester'}],
 'unknown':[{'id':'OBS-D7-01','status':'ROOT CAUSE UNKNOWN','problem':'First independent #runAssignSearch click timed out waiting actionability; screenshot shows visible control','evidence':['independent/evidence/raw-first-error.json','independent/evidence/trace-first-attempt.zip','independent-timeout-observation.json','runtime-observation.json'],'facts':'Full automatic suite was concurrent; exec-server pong_timeout also observed; no OOM kill. Fresh sequential same-method run completed.','notEstablished':'No evidence establishes product, driver or environment as root cause; later PASS does not demonstrate a fix.'}]})
wr('raw-error-register.json',{'originalSuiteFailures':classified,'independentFirstAttempt':{'status':'FAIL preserved','raw':'independent/evidence/raw-first-error.json','trace':'independent/evidence/trace-first-attempt.zip','rootCause':'UNKNOWN','sequentialRepeat':'New fresh data/browser, unchanged business methods except absolute runtime paths and current generated fixture bytes; no force, fixed-delay workaround, timeout increase or assertion weakening','notAFixClaim':True},'attempt02':{'strictCheckAndObservationFAIL':0,'scope':'All recorded scope-complete methods in independent-summary.json','trace':'attempt-02/evidence/independent-complete-trace.zip'},'expectedSafetyErrors':'400 malformed/archive/hash,409 nonempty/stale revision, intentional service outage are expected negative controls, not discarded product failures'})
traces=[]
for phase in ['independent','attempt-02']:
 for p in(D/phase/'evidence').glob('*trace*.zip'):
  with zipfile.ZipFile(p)as z:bad=z.testzip()
  assert bad is None;traces.append({'path':str(p.relative_to(D)),'CRCvalid':True,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
wr('independent-trace-integrity.json',traces)
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=E,text=True).strip()==PARENT
assert not subprocess.check_output(['git','status','--porcelain'],cwd='/workspace/srmd7-product',text=True)
assert(R/'protected-refs-start.txt').read_bytes()==(R/'protected-refs-end.txt').read_bytes()
wr('preservation.json',{'evidenceParentCommit':PARENT,'onlyNewDirectory':str(D.relative_to(E)),'existingProductTestsCIAndCanonicalMemoryUnchanged':True,'oldEvidenceUntouched':True,'protectedRefsIdenticalBeforeEvidencePush':True,'noActionsTriggered':True,'PR46And50RemainDraftOpen':True,'commands':'original automation command.json files and unchanged independent source methods are included'})
print(json.dumps({'requirements':dict(counts),'automation':summary,'prior':priorSummary,'independentChecks':len(checks),'tips':len(tips),'fileChecks':contentCounts,'independentTraces':len(traces)},ensure_ascii=False))
