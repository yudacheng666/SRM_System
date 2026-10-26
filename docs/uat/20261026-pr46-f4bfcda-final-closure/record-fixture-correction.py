from pathlib import Path
import json,shutil,datetime,subprocess,hashlib,difflib
R=Path('/workspace/uatf4');F=R/'fixtures';M=R/'methods';N=R/'methods-attempt02';shutil.copytree(F,R/'attempt-01-fixtures')
expected={'A':[118,20,30,None,75,None,2.25,80,90,100,110,120],'B':[119,82,32,40,75,60,2.35,82,92,102,112,122]};(F/'business-expected.json').write_text(json.dumps(expected)+'\n')
# Preserve every raw first-attempt byte; validate copied actual files without browser/product requests.
for part in ['evidence','downloads']:shutil.copytree(R/'independent'/part,R/'validator-preflight'/part)
e=R/'validator-preflight/evidence'
r=subprocess.run(['python',str(M/'verify-exports.py'),str(e)],capture_output=True,text=True);(R/'validator-preflight/stdout.log').write_text(r.stdout);(R/'validator-preflight/stderr.log').write_text(r.stderr);assert r.returncode==0
checks=json.loads((e/'export-checks.json').read_text());assert all(x['pass']for x in checks);print('CORRECTED_ORACLE_ONLY_PREFLIGHT_PASS',len(checks))
N.mkdir()
for p in M.iterdir():
 s=p.read_text().replace('/workspace/uatf4/independent/','/workspace/uatf4/attempt-02/').replace('/workspace/uatf4/methods/','/workspace/uatf4/methods-attempt02/');(N/p.name).write_text(s)
(R/'attempt-02/evidence').mkdir(parents=True);(R/'attempt-02/downloads').mkdir()
for p in N.glob('*.js'):subprocess.run(['node','-e',"new (require('vm').Script)('(async()=>{'+require('fs').readFileSync(process.argv[1],'utf8')+'})()')",str(p)],check=True)
subprocess.run(['node','--check',str(N/'driver.cjs')],check=True)
(R/'driver-fixture-correction-01.json').write_text(json.dumps({'timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'classification':'TEST_FIXTURE_ORACLE_MISSING','originalError':'FileNotFoundError /workspace/uatf4/fixtures/business-expected.json','originalRaw':'independent/evidence/raw-first-error.json','originalTrace':'independent/evidence/trace-first-attempt.zip','checksPassedBeforeError':24,'correction':'Add explicitly required A/B numeric oracle fixture. All46 validation assertions and original test code unchanged. Fresh empty attempt02 repeats independent flow; paths alone changed in new driver copy.','newFixtureSHA256':hashlib.sha256((F/'business-expected.json').read_bytes()).hexdigest(),'copyOnlyPreflightChecksPASS':len(checks),'preflightNotCountedAsUAT':True,'productOriginalTestsCIUnchanged':True,'priorAttemptInputsAndEvidenceRetained':True},ensure_ascii=False,indent=2)+'\n')
(R/'correction-paths.diff').write_text(''.join(''.join(difflib.unified_diff((M/p.name).read_text().splitlines(True),p.read_text().splitlines(True),fromfile='methods/'+p.name,tofile='methods-attempt02/'+p.name))for p in sorted(N.iterdir())))
