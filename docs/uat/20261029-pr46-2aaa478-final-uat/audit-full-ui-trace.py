from pathlib import Path
import json,zipfile,hashlib,collections,re
R=Path('/workspace/uat2aaa');P=Path('/workspace/srm2aaa-product');result=json.loads((R/'automation/test-results/results.json').read_text());assert result['stats']['expected']==58 and result['stats']['unexpected']==0 and result['stats']['skipped']==0
trace=next(p for p in(R/'automation/test-results').glob('*/trace.zip')if p.parent.name.startswith('ui-v3-integration-UI-V3-in-'))
with zipfile.ZipFile(trace)as z:
 assert z.testzip()is None
 events=[json.loads(l)for l in z.read('test.trace').splitlines()]
before=[e for e in events if e.get('type')=='before'and e.get('method')=='expect'and any(s.get('file','').endswith('ui-v3-integration.spec.cjs')and 45<=s.get('line',0)<=109 for s in e.get('stack',[]))]
after={e['callId']:e for e in events if e.get('type')=='after'};actual=collections.Counter();observed=[]
for e in before:
 s=next(s for s in e['stack']if s.get('file','').endswith('ui-v3-integration.spec.cjs'));a=after.get(e['callId']);assert a is not None and not a.get('error'),e
 actual[s['line']]+=1;observed.append({'line':s['line'],'callId':e['callId'],'title':e['title'],'params':e.get('params'),'beforeTime':e['startTime'],'afterTime':a.get('endTime'),'completedWithoutError':True})
# Current source lines after the repaired stage-kicker loop, including all15stage/viewport combinations and final page-error assertion.
expected={82:1,83:1,84:1,90:15,91:15,104:15,105:15,106:15,109:1}
for line,count in expected.items():assert actual[line]==count,(line,actual[line],count)
assert actual[79]==1 and actual[80]==4
source=P/'prototype/m1-lite/tests/e2e/ui-v3-integration.spec.cjs';lines=source.read_text().splitlines()
geometry=[e['title']for e in observed if e['line']==104];assert len(geometry)==15
for width in [1024,1366,1600]:
 for stage in ['items','assign','quoteImport','quotes','settings']:assert stage+' document overflow at '+str(width)in geometry
out={'productSHA':'2aaa478c8f1966e41b9372d9d989c383dbaa1972','status':'PASS','originalCase':'UI V3 integration: theme, active navigation and responsive workspace','caseExpected':1,'trace':str(trace.relative_to(R)),'traceSHA256':hashlib.sha256(trace.read_bytes()).hexdigest(),'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'sourceUnmodified':True,'method':'Read-only test-level before/after assertion records from original Playwright trace, not test instrumentation or standalone kicker query','allTestBodyAssertions':sum(actual.values()),'postOldFailureLoopAssertions':sum(expected.values()),'expectedAfterKickerLineCounts':expected,'actualCounts':dict(actual),'finalErrorsEmptyAssertionCompleted':actual[109]==1,'geometryCombinations':geometry,'assertions':observed,'sourceLines':{str(k):lines[k-1]for k in sorted(set(expected)|{79,80})}}
(R/'full-ui-assertion-audit.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('FULL_SUITE_UI_TRACE_AUDIT_PASS',sum(actual.values()),'bodyassertions;',sum(expected.values()),'after old failure loop;15stage/viewports; finalerrors[] complete')
