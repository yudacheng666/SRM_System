from pathlib import Path
import subprocess,os,json,re,time,datetime,shutil
R=Path('/workspace/uat795');P=Path('/tmp/srm795-product');sha='795f663933f6883bc6e05d30b4ebbc2623a3301c'
def run(name,cmd):
 d=R/name;d.mkdir(exist_ok=True,parents=True);start=time.time();print('START',name,flush=True)
 with(d/'stdout.log').open('w')as o,(d/'stderr.log').open('w')as e:p=subprocess.run(cmd,cwd=P,env={**os.environ,'npm_config_cache':str(R/'npm-cache'),'SRM_CHROMIUM_PATH':'/usr/bin/chromium','SRM_DATA_DIR':str(R/'automation-isolated'),'CI':'1'},stdout=o,stderr=e)
 (d/'command.json').write_text(json.dumps({'productSHA':sha,'command':cmd,'cwd':str(P),'startUTC':datetime.datetime.fromtimestamp(start,datetime.timezone.utc).isoformat(),'durationSeconds':round(time.time()-start,3),'exitCode':p.returncode,'originalTestsUnmodified':True,'cache':str(R/'npm-cache')},ensure_ascii=False,indent=2));print('END',name,p.returncode,flush=True);return p.returncode
if run('bootstrap/npm-ci',['npm','ci']):raise SystemExit(1)
old=Path('/tmp/srm66-evidence/docs/uat/20261026-pr46-66a0579-unified/automation/failure-classification.json');oldcases=json.loads(old.read_text());titles=[x['title']for x in oldcases]+['UX09 exact 1366 comparison density and first-row reachability / 比价紧凑性复验'];regex='|'.join(re.escape(x)for x in titles)
(R/'phase1/selected-tests.json').write_text(json.dumps({'originalAFs':[{'id':x['id'],'title':x['title']}for x in oldcases],'newDensityTest':titles[-1],'expectedCount':16,'grep':regex},ensure_ascii=False,indent=2))
run('phase1/list',['npm','run','test:e2e','--','--list','--grep',regex])
code=run('phase1/run',['npm','run','test:e2e','--','--grep',regex])
for n in ['test-results','playwright-report']:
 if(P/n).exists():shutil.move(str(P/n),str(R/'phase1'/n))
print('PHASE1_FINISHED',code,flush=True)
