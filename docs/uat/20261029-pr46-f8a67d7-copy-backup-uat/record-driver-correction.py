from pathlib import Path
import shutil,json,datetime,difflib,subprocess
R=Path('/workspace/uatf8');A=R/'methods';B=R/'methods-attempt02';B.mkdir()
for p in A.iterdir():
 if not p.is_file():continue
 s=p.read_text()
 if p.name=='00-audit-helpers.js':s=s.replace('(await snap(page)).state','((await snap(page))?.state??null)')
 s=s.replace('/workspace/uatf8/independent/','/workspace/uatf8/attempt-02/').replace('/workspace/uatf8/methods/','/workspace/uatf8/methods-attempt02/');(B/p.name).write_text(s)
(R/'attempt-02/evidence').mkdir(parents=True);(R/'attempt-02/downloads').mkdir()
for p in B.glob('*.js'):subprocess.run(['node','-e',"new (require('vm').Script)('(async()=>{'+require('fs').readFileSync(process.argv[1],'utf8')+'})()')",str(p)],check=True)
subprocess.run(['node','--check',str(B/'driver.cjs')],check=True)
(R/'driver-correction-01.json').write_text(json.dumps({'timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'classification':'INDEPENDENT_DRIVER_NULL_PRECONDITION','actual':'Before New, formal SRMPilot.snapshot() is legitimately null in demo mode. Optional initial tooltip-state audit dereferenced .state.','raw':'independent/evidence/raw-first-error.json','trace':'independent/evidence/trace-first-attempt.zip','fix':'Record null before/after initial demo-only hints; after formal RFQ creation, full state-object comparison remains unchanged. Original product/tests/CI untouched. New empty attempt02.','businessAssertionsWeakened':False,'newDataDirectory':str(R/'attempt-02/data')},ensure_ascii=False,indent=2)+'\n')
(R/'driver-correction-01.diff').write_text(''.join(''.join(difflib.unified_diff((A/p.name).read_text().splitlines(True),p.read_text().splitlines(True),fromfile='methods/'+p.name,tofile='methods-attempt02/'+p.name))for p in sorted(B.iterdir())if p.is_file()))
print('RECORDED_NULL_DEMO_PRECONDITION_CORRECTION')
