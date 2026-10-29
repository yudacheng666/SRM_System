from pathlib import Path
import json,shutil,datetime,runpy,sys,subprocess,time,os
R=Path('/workspace/uatd7');A=R/'methods';B=R/'methods-attempt02';F=R/'fixtures-attempt02';B.mkdir();shutil.copytree(R/'fixtures',R/'attempt-01-fixtures')
# Fresh synthetic workbook/PDF generation on the same current SHA, never reuse a DB/backup.
s=(R/'prepare-independent.py').read_text();fixturePart=s.split("for p in Path('/workspace/uatf8/methods-attempt02').iterdir():")[0];fixturePart=fixturePart.replace("M=R/'methods';M.mkdir();","M=R/'unused-methods';").replace("F=R/'fixtures'","F=R/'fixtures-attempt02'");exec(compile(fixturePart,'fresh-current-fixtures','exec'))
for p in A.iterdir():
 if not p.is_file()or p.suffix not in ['.js','.cjs','.py']:continue
 v=p.read_text().replace('/workspace/uatd7/independent/','/workspace/uatd7/attempt-02/').replace('/workspace/uatd7/methods/','/workspace/uatd7/methods-attempt02/').replace('/workspace/uatd7/fixtures/','/workspace/uatd7/fixtures-attempt02/').replace("r/'fixtures'","r/'fixtures-attempt02'");(B/p.name).write_text(v)
(R/'attempt-02/evidence').mkdir(parents=True);(R/'attempt-02/downloads').mkdir()
for p in B.glob('*.js'):subprocess.run(['node','-e',"new (require('vm').Script)('(async()=>{'+require('fs').readFileSync(process.argv[1],'utf8')+'})()')",str(p)],check=True)
subprocess.run(['node','--check',str(B/'driver.cjs')],check=True)
(R/'independent-timeout-observation.json').write_text(json.dumps({'timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'productSHA':'d7c4c88abd354ebdc5d3bfedfc9199e278c48483','firstStatus':'FAIL preserved; actionability timeout on visible #runAssignSearch','rootCause':'UNKNOWN','originalError':'independent/evidence/raw-first-error.json','originalTrace':'independent/evidence/trace-first-attempt.zip','runtimeObservation':'runtime-observation.json; CPU quota2,memory max events,exec-server pong_timeout observed. These do not establish causation.','followup':'After complete original suite ends, run same independent business scripts in a fresh browser/data directory. Only runtime paths change; same normal click/no force/no new fixed delay/no timeout increase/no assertion relaxation.','notAFixClaim':'A later PASS cannot prove the first timeout fixed; report separately','originalProductTestsCIUnmodified':True},indent=2)+'\n')
print('WAITING_FOR_COMPLETE_ORIGINAL_SUITE_BEFORE_ISOLATED_RERUN',flush=True)
while 'AUTOMATION_FINISHED'not in(R/'automation-runner.log').read_text():time.sleep(1)
print('ORIGINAL_SUITE_DONE_START_FRESH_BROWSER',flush=True);os.execvp('node',['node',str(B/'driver.cjs')])
