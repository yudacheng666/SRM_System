from pathlib import Path
import subprocess,os,json,time,datetime,shutil
R=Path('/workspace/uat795');P=Path('/tmp/srm795-product');sha='795f663933f6883bc6e05d30b4ebbc2623a3301c'
assert(R/'phase1/automated-results.json').exists()
commands=[('python-backend',['python','-m','unittest','discover','-v','-s','prototype/m1-lite/backend','-p','test_*.py']),('npm-ci',['npm','ci']),('node-business',['npm','test']),('chromium-e2e',['npm','run','test:e2e'])]
for name,cmd in commands:
 if name=='npm-ci':
  print('WAIT_INDEPENDENT_IDLE_BEFORE_NPM_CI',flush=True)
  while not(R/'independent-pause.ready').exists():time.sleep(.25)
 d=R/'phase2'/name;d.mkdir(parents=True);start=time.time();print('START phase2/'+name,flush=True)
 with(d/'stdout.log').open('w')as o,(d/'stderr.log').open('w')as e:p=subprocess.run(cmd,cwd=P,env={**os.environ,'npm_config_cache':str(R/'npm-cache'),'SRM_CHROMIUM_PATH':'/usr/bin/chromium','SRM_DATA_DIR':str(R/'automation-isolated-phase2'),'CI':'1'},stdout=o,stderr=e)
 (d/'command.json').write_text(json.dumps({'productSHA':sha,'command':cmd,'cwd':str(P),'startUTC':datetime.datetime.fromtimestamp(start,datetime.timezone.utc).isoformat(),'durationSeconds':round(time.time()-start,3),'exitCode':p.returncode,'originalTestsUnmodified':True,'note':'Only original commands; targeted phase complete with no confirmed P1/P2 product safety defect; npm ci waited for independent driver idle to avoid module replacement race'},indent=2));print('END phase2/'+name,p.returncode,flush=True)
 if name=='npm-ci'and p.returncode:raise SystemExit(p.returncode)
for n in ['test-results','playwright-report']:
 if(P/n).exists():shutil.move(str(P/n),str(R/'phase2'/n))
print('PHASE2_FINISHED',flush=True)
