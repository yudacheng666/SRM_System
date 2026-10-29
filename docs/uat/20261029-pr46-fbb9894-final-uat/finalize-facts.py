from pathlib import Path
import json,shutil,csv,re,hashlib,zipfile,collections,subprocess,datetime
R=Path('/workspace/uatfbb');E=Path('/workspace/srmf8-evidence');D=E/'docs/uat/20261029-pr46-fbb9894-final-uat';SHA='fbb98944a4bcee439e4e81ebfe3ef710bee4a3d0';PARENT='0c4e08a82ac5835d088c93cb9d82424bd3065bcd'
def wr(n,x):(D/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
ignore=shutil.ignore_patterns('__pycache__','*.pyc')
for n in ['methods','methods-continuation','methods-completion','fixtures']:shutil.copytree(R/n,D/n,ignore=ignore)
for a in ['bootstrap-stdin-closed','independent','continuation','completion']:
 for n in ['evidence','downloads']:
  if(R/a/n).exists():shutil.copytree(R/a/n,D/a/n,ignore=ignore)
for n in ['identity-start.json','identity-after-suites.json','http-start.json','http-continuation-start.json','http-completion-start.json','http-end.json','http-trace-identity.json','protected-refs-start.txt','protected-refs-end.txt','github-task-version.json','independent-preflight.json','run-automation.py','automation-runner.log','archive-automation.py','archive-automation.log','verify-http-traces.py','candidate-fix-diff.patch','bootstrap-launch-error.json','export-verifier-correction.json','export-verifier-correction.diff','resume-context-correction.json','completion-context-diff.patch','finalize-facts.py']:shutil.copy2(R/n,D/n)
x=json.loads((D/'automation/automated-results.json').read_text());bad=[c for c in x['cases']if c['status']!='expected'];assert len(bad)==1
classified=[]
for j,c in enumerate(bad,1):
 raw='\n'.join(e.get('message','')for rr in c['results']for e in rr.get('errors',[]));clean=re.sub(r'\x1b\[[0-9;]*m','',raw);assert '系统设置'in clean and 'ADMIN'in clean
 classified.append({'id':'P3-TEST-01','severity':'P3 test-maintenance, not a confirmed product defect','status':'FAIL','classification':'STALE_PAGE_KICKER_LANGUAGE_ASSERTION','title':c['title'],'file':c['file'],'assertionLine':76,'cleanError':clean,'repro':'Run unmodified full npm run test:e2e; UI V3 case passes approved background then reaches system-settings kicker.','expectedByOriginalTest':chr(47)+chr(92)+'d'+chr(92)+'d|ADMIN/','actualUI':'系统设置','buyerImpact':'No data loss or failed purchasing action established; current buyer-language UI conflicts with legacy technical-language assertion. Full automation gate remains red.','suggestion':'ChatGPT verify intended Chinese route caption and update the obsolete test semantically, preserving all later navigation/layout/state checks. Codex did not change it.','laterAssertions':'NOT REACHED after line76; independent six-page checks do not imply every later assertion passed','evidence':'automation/failures/FAIL-01/failure.json'})
wr('automation/failure-classification.json',classified)
py=(D/'automation/python-backend/stderr.log').read_text();pyNames=re.findall(r'^(test_\S+ \([^\n]+?\))',py,re.M);pyN=int(re.search(r'Ran (\d+) tests?',py).group(1));assert len(pyNames)==pyN and py.rstrip().endswith('OK')
node=(D/'automation/node-business/stdout.log').read_text();nodeNames=[t[2:].split(' (',1)[0]for t in node.splitlines()if t.startswith('✔ ')];assert len(nodeNames)==int(re.search(r'ℹ pass (\d+)',node).group(1))
summary={'productSHA':SHA,'PythonPASS':pyN,'NodePASS':len(nodeNames),'Chromium':x['stats'],'fullPASS':pyN+len(nodeNames)+x['stats']['expected'],'fullFAIL':x['stats']['unexpected'],'total':pyN+len(nodeNames)+len(x['cases']),'originalSuitesUnmodified':True,'ActionsTriggered':False,'nativeWindows':False};wr('automation-summary.json',summary)
with(D/'automation-cases.csv').open('w',newline='')as f:
 w=csv.writer(f,lineterminator='\n');w.writerow(['id','platform','status','name','productSHA','evidence'])
 for prefix,names,ev in [('PY',pyNames,'python-backend/stderr.log'),('NODE',nodeNames,'node-business/stdout.log')]:
  for j,n in enumerate(names,1):w.writerow([f'{prefix}-{j:02}','Linux','PASS',n,SHA,'automation/'+ev])
 for j,c in enumerate(x['cases'],1):w.writerow([f'E2E-{j:02}','Linux/Chromium','PASS'if c['status']=='expected'else'FAIL',c['title'],SHA,'automation/automated-results.json#'+c['id']])
focus=[c for c in x['cases']if c['title'].startswith(('08 bad PDF','15 new RFQ','45 P2-EXPORT','46 P3-NAV','UI V3 integration:'))];assert len(focus)==5
focusRows=[]
for j,c in enumerate(focus,1):
 F=D/'focus-original-five'/f'CASE-{j:02}';F.mkdir(parents=True);(F/'case.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
 for rr in c['results']:
  for a in rr.get('attachments',[]):
   p=Path(a.get('path',''))
   if 'test-results'in p.parts:
    rel=Path(*p.parts[p.parts.index('test-results')+1:]);q=R/'automation/test-results'/rel
    if q.is_file():shutil.copy2(q,F/q.name)
 focusRows.append({'title':c['title'],'wholeCaseStatus':'PASS'if c['status']=='expected'else'FAIL','evidence':str(F.relative_to(D)),'allOriginalBusinessAssertionsCompleted':c['status']=='expected','note':'Approved#F6F8FB background PASS; later system-settings kicker assertion FAIL'if c['status']!='expected'else'Original case completed with all downstream assertions; no early stopping at prior failure point'})
wr('focus-five-results.json',{'soleCurrentProductSHA':SHA,'wholeCases':{'PASS':4,'FAIL':1},'specificPriorFailurePoints':'Malformed ZIP copy,3supplier selections and approved background all passed; one whole case now fails later at legacy ADMIN caption expectation','historicalResultTransfer':False,'cases':focusRows})
events={}
for a in ['independent','continuation','completion']:events[a]=[json.loads(l)for l in(D/a/'evidence/browser.jsonl').read_text().splitlines()]
assert not any(v.get('pass')is False for q in events.values()for v in q)
assert len([v for v in events['independent']if v['kind']=='unanticipated-error'])==1
assert len([v for v in events['continuation']if v['kind']=='unanticipated-error'])==1
assert not any(v['kind']=='unanticipated-error'for v in events['completion'])
A=D/'independent/evidence';C=D/'continuation/evidence';Z=D/'completion/evidence';tips=json.loads((A/'tooltip-retest.json').read_text());layout=json.loads((A/'layout-overflow.json').read_text());assert len(layout)==18
assert all(q['pageWidth']<=q['viewport']['width']+2 and q['theme']['bodyBackground']=='rgb(246, 248, 251)'and q['theme']['fontSize']=='14.5px'for q in layout)
assert all(0<=b['left']and b['right']<=t['width']+1 and 0<=b['top']and b['bottom']<=t['height']+1 and b['documentWidth']<=t['width']+1 for t in tips for b in [t['pointer'],t['keyboard']])
assert all(t['pointerEscHidden']and t['hoveredAfterEscape']and t['keyboardEscHidden']and t['focusedAfterEscape']and t['pinnedVisible']and t['awayHidden']for t in tips)
first=json.loads((A/'UX09-independent-before-awards.json').read_text())['rows'][0];assert first['bottom']<=768 and first['height']<=44 and first['scrollY']==0
fileChecks={}
for folder,n in [(A,'backup-class-checks.json'),(C,'export-checks.json'),(Z,'s4-checks.json')]:
 q=json.loads((folder/n).read_text());assert all(v['pass']for v in q);fileChecks[n]=len(q)
copy=[]
for folder in [A,C,Z]:
 if(folder/'copy-audit.json').exists():copy+=json.loads((folder/'copy-audit.json').read_text())
assert all(not v['hits']for v in copy)
diagnostic=json.loads((A/'assign-search-diagnostic-summary.json').read_text());assert diagnostic['clickCalls']==1 and diagnostic['outcome']=='NOT REPRODUCED; ROOT CAUSE UNKNOWN'
wr('independent-summary.json',{'productSHA':SHA,'checkRecordsAcrossPhases':sum(sum(v['kind']in ['check','acceptance-observation']for v in q)for q in events.values()),'allRecordedBusinessChecksPASS':True,'notCleanHarnessRun':'Bootstrap stdin error,independent verifier path error,and continuation missing viewport configuration are retained separately; no product/test/CI fix','tooltipInstances':len(tips),'tooltipPerWidth':dict(collections.Counter(t['width']for t in tips)),'layoutCount':len(layout),'approvedBackground':'#F6F8FB','firstPricedRow1366':first,'fileContentChecks':fileChecks,'copyStates':len(copy),'firstClickDiagnostic':diagnostic,'completedScopes':{a:[{'id':v['id'],'status':v['status']}for v in q if v['kind']=='scope-complete']for a,q in events.items()}})
wr('visual-review.json',{'productSHA':SHA,'manualScreenshotReviewCount':18,'manualReviewedFiles':[f'independent/evidence/VISUAL-{w}-{tab}.png'for w in [1024,1366,1600]for tab in ['project','items','assign','quoteImport','quotes','backup']],'observations':['Shared approved#F6F8FB canvas, coherent blue navigation/buttons,14.5px body and Chinese heading hierarchy in all inspected first screens','No major control overlap or whole-document horizontal overflow observed in these18states','At1024 some wide material-table columns require their internal horizontal scrolling; not whole-page overflow','1366 first actual quote row fully visible;1600 first row crosses fold but is accessible by normal vertical scroll, logged as optional efficiency suggestion','Linux fallback glyph rendering is not a native Windows font/pixel-parity guarantee'],'optionalObservation':'completion/evidence/optional-fold-observation.json'})
rows=[]
def add(k,status,name,ev,note='',platform='Linux/Chromium'):rows.append({'id':k,'platform':platform,'status':status,'scope':name,'evidence':ev,'notes':note,'productSHA':SHA})
add('HEAD','PASS','Exact detached checkout/PR HEAD/actual HTTP','http-trace-identity.json','87 actual root-page responses match exact source HTML')
add('PY','PASS','Full original Python backend suite','automation/python-backend/stderr.log','44PASS','Linux/Python3.12')
add('NODE','PASS','Full original Node business suite','automation/node-business/stdout.log','10PASS','Linux/Node24')
add('E2E','FAIL','Complete unmodified Chromium suite','automation/failure-classification.json','57PASS/1FAIL/0skip/0retry; exit1')
for j,q in enumerate(focusRows,1):add('FOCUS-'+str(j),q['wholeCaseStatus'],q['title'],q['evidence']+'/case.json',q['note'])
add('V31-BG','PASS','Approved V3.1#F6F8FB background on6pages×3sizes','independent/evidence/layout-overflow.json','Specific previous background failure point passes; whole UI case still FAIL later')
add('UI-VISUAL','PASS','Six-page actual visual review and18screens','visual-review.json','Shared fonts/color/navigation, no major first-screen overlap; not whole-product perfection')
add('UI-OVERFLOW','PASS','Six pages×3sizes document width','independent/evidence/layout-overflow.json','18current measurements, document width within viewport; table scrolling remains allowed')
for k,n in [('TIP-MOUSE','Mouse hover popup bounds'),('TIP-TAB','Actual keyboard Tab opens popup with in-viewport bounds'),('TIP-ESC','Escape closes even with hover/focus retained'),('TIP-PIN','Click-to-pin and click-away close')]:add(k,'PASS',n,'independent/evidence/tooltip-retest.json',str(len(tips))+' actual visible instances across1024/1366/1600; data/history/PDF unchanged')
add('FIRST-ROW','PASS','1366x768 complete first actual quoted row','independent/evidence/UX09-independent-before-awards.json',f"top{first['top']},bottom{first['bottom']},height{first['height']},scrollY0")
add('SEARCH-FIRST','PASS','First normal assignment search click delivered','independent/evidence/assign-search-first-result.json','NOT REPRODUCED; ROOT CAUSE UNKNOWN;1click,19samples/17rAF,original15s timeout,no force/retry')
for k,n,phase,ev,note in [
 ('BAD-ZIP','Malformed ZIP refusal,no raw error code,target unchanged','independent','BACKUP-malformed-zip-friendly-rejection.png','Real400 and unchanged target'),
 ('WRONG-KIND','Inquiry/drawing archive rejected as full restore','independent','archive-rejection-real-backend.json','Real400; actionable Chinese; target unchanged'),
 ('HASH','Valid STORED PDF hash tamper rejected','completion','S4-audited-backend-rejection.json','Same-length one-byte change,validCRC,unchangedmanifest;400RESTORE_PDF_HASH_MISMATCH; target byte/semantic/directory equality'),
 ('RESTORE-EMPTY','Correct full archive restores empty target','completion','S4-positive-control-restored.json','Real200;2RFQ/allstored tables/quotehistory/PDF equal source'),
 ('RESTORE-NONEMPTY','Nonempty target refuses overwrite','completion','S4-nonempty-backend.json','Actual409; friendlyUI; entire restored data unchanged'),
 ('ZIP-CONTENT','Actual backup ZIP/SQLite/PDF contents','completion','s4-checks.json','11full integrity checks;30backup-class checks separately'),
 ('SUPPLIER-ISOLATION','Additive relations and cross-RFQ supplier isolation','continuation','CORE07-after-service-restart.json','12line original+52line secondRFQ; no supplier/quote/PDF leakage'),
 ('HISTORY','Confirmed quotation versions/rounds immutable','independent','Q04-all-confirmed.json','5confirmed revisions/50history lines;V1 retained;explicit9carry andtiers118/2.25'),
 ('AWARD','Ties,non-lowest reasons and manual totals','independent','C05-scoped-amounts-and-decisions.png','Manual3/1979 distinct from theory6940/mixed7064;pending9'),
 ('SAVE-PENDING','Honest in-flight save and backup guard at3sizes','completion','CORE08-while-held.json','Real heldPUT; no falseSaved; real200 before committedSaved; interrupted prior harness preserved'),
 ('SAVE-CONFLICT','Actual SQLite stale-tab409 protection','completion','CORE08-conflict-http.json','Winner data/history/PDF preserved; stale draft retained; details visible'),
 ('SAVE-OFFLINE','Actual service-down error and restart/manual save','completion','offline-after-manual-save.json','Truthful failure;old persisted revisions andquote rounds retained;200+F5'),
 ('EXPORT','Actual downloaded supplierZIP/CSV/XLSX contents','continuation','export-checks.json','46PASS on byte-identical original current-SHA downloads; first verifier path error retained'),
 ('PERSIST','Cross-RFQ,F5 and real service restart','continuation','CORE07-after-service-restart.json','All stored rows and3PDF hashes remain equal'),
 ('MATERIAL-PDF','Actual import and unique/ambiguous/unmatched drawing match','independent','CORE02-clicked-correct-real-PDF.png','Fresh XLSX12lines;3actualPDFs;preview does not save;download original bytes'),
 ('NAME-EXPORT','Actual supplier-name selection and assigned export intent','completion','original-failure-triage-export.json','XLSX/PDF ZIP/no privateJSON; no saved data mutation')]:add(k,'PASS',n,f'{phase}/evidence/{ev}',note)
for j,n in enumerate(['Native Windows Python3.13 backend','Native Windows Node22 business','Native Windows isolated installation/data,CMD/BAT/Edge and filesystem/restore safety'],1):add('WIN-'+str(j),'NOT TESTED',n,'identity-start.json','No native Windows connected; Linux is not substituted','Native Windows')
with(D/'results.csv').open('w',newline='')as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(rows)
wr('results.json',rows);counts=dict(collections.Counter(q['status']for q in rows))
wr('execution-summary.json',{'productSHA':SHA,'verdict':'NOT READY','reason':'Full original Chromium suite still1FAIL; native Windows3untested. Scoped completed independent business/UI checks pass; no whole-product acceptance or merge approval.','requirementRows':counts,'overlappingCounts':'Requirement rows/focus5/tooltip samples overlap automation/business; never add as separate total','automation':summary,'originalFiveWholeCases':{'PASS':4,'FAIL':1},'firstSearch':'NOT REPRODUCED; ROOT CAUSE UNKNOWN','originalIndependentHarnessErrors':3,'confirmedNewProductIssues':{'P1':0,'P2':0,'P3':0},'testMaintenanceP3':1,'ActionsTriggered':False,'oldResultsTransferred':False,'mergedOrClosed':False})
wr('issues.json',{'confirmedNewProductDefects':[],'testMaintenance':classified,'optionalUISuggestion':{'id':'UX-SUG-01','severity':'Optional suggestion, no failed1366 requirement','observation':'At1600x900 first actual quote row top868.875,bottom910.65625 crosses fold; normal240px wheel exposes row at628.875..670.65625. At1366x768 the explicit first-row requirement passes.','suggestion':'Consider extending compact comparison header treatment to larger desktop viewports after owner visual review; no product edit made.','evidence':'completion/evidence/optional-fold-observation.json'},'unknownClickRootCause':{'status':'NOT REPRODUCED; ROOT CAUSE UNKNOWN','evidence':'independent/evidence/assign-search-diagnostic-summary.json','notClaimed':'No root-cause fix, failure-branch verification or guarantee against recurrence'}})
wr('raw-error-register.json',{'originalFullSuiteFailures':classified,'independentHarnessErrors':[
 {'id':'H-01','type':'STDIN_CLOSED_AT_BOOTSTRAP','status':'BLOCKED startup,0business operations/0search clicks','evidence':'bootstrap-launch-error.json','trace':'NOT AVAILABLE; command channel closed before export, no business trace claimed','retained':'bootstrap-stdin-closed/evidence'},
 {'id':'H-02','type':'WRONG_NEW_VERIFIER_FIXTURE_DIRECTORY','status':'Original command FAIL exit1; no content assertion FAIL before missing file','raw':'independent/evidence/raw-first-error.json','stderr':'independent/evidence/export-validation.stderr','trace':'independent/evidence/trace-first-attempt.zip','correction':'export-verifier-correction.json','supplement':'continuation/evidence/export-checks.json;46PASS using immutable original-download copies'},
 {'id':'H-03','type':'MISSING_RESUME_VIEWPORT_CONFIGURATION','status':'Original save method BLOCKED ReferenceError before viewport loop','raw':'continuation/evidence/raw-first-error.json','trace':'continuation/evidence/trace-first-attempt.zip','correction':'resume-context-correction.json','supplement':'completion/evidence; real save/conflict/outage/restores completed; source checkpoint equality checked before resuming'}],
 'firstSearch':{'calls':1,'status':'NOT REPRODUCED; ROOT CAUSE UNKNOWN','rawFrames':'independent/evidence/assign-search-first-frames.jsonl','noRetry':True},'policy':'Corrections only to newly created independent evidence methods/launcher; originals and all failed traces untouched. No original suite rerun, no force/no timeout increase/no delayed workaround.'})
tr=[]
for phase in ['independent','continuation','completion']:
 for p in(D/phase/'evidence').glob('*trace*.zip'):
  with zipfile.ZipFile(p)as z:bad=z.testzip()
  assert bad is None;tr.append({'path':str(p.relative_to(D)),'CRCvalid':True,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size})
wr('independent-trace-integrity.json',tr)
assert len(tr)==3 and subprocess.check_output(['git','rev-parse','HEAD'],cwd=E,text=True).strip()==PARENT
assert not subprocess.check_output(['git','status','--porcelain'],cwd='/workspace/srmfbb-product',text=True)
assert(R/'protected-refs-start.txt').read_bytes()==(R/'protected-refs-end.txt').read_bytes()
wr('preservation.json',{'evidenceParent':PARENT,'onlyNewDirectory':str(D.relative_to(E)),'oldEvidenceUntouched':True,'productOriginalTestsCIAndMemoryUnchanged':True,'protectedRefsMatchBeforeEvidencePush':True,'noActionsOrMergeOrClosure':True})
print(json.dumps({'requirements':counts,'automation':summary,'focusWholeCases':{'PASS':4,'FAIL':1},'tooltipInstances':len(tips),'fileChecks':fileChecks,'originalIndependentErrorsRetained':3,'independentTraces':len(tr)},ensure_ascii=False))
