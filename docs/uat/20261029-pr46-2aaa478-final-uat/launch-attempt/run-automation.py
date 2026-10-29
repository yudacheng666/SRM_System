from pathlib import Path
import subprocess,os,json,time,datetime,platform,hashlib,shutil
R=Path('/workspace/uat2aaa');P=Path('/workspace/srm2aaa-product');SHA='2aaa478c8f1966e41b9372d9d989c383dbaa1972'
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=P,text=True).strip()==SHA
(R/'identity-start.json').write_text(json.dumps({'productSHA':SHA,'htmlSHA256':hashlib.sha256((P/'prototype/m1-lite/index.html').read_bytes()).hexdigest(),'runtime':{'OS':platform.platform(),'python':platform.python_version(),'node':subprocess.check_output(['node','--version'],text=True).strip(),'chromium':subprocess.check_output(['/usr/bin/chromium','--version'],text=True).strip()},'nativeWindows':False,'cmdExeAvailable':shutil.which('cmd.exe'),'pwshAvailable':shutil.which('pwsh'),'evidenceParent':'243e5052fa4f56b6ba72771d73998d61f91ff6f4','scope':'Fresh exact-SHA Linux evidence; native Windows3 NOT TESTED'},indent=2)+'\n')
env={**os.environ,'npm_config_cache':str(R/'npm-cache'),'SRM_CHROMIUM_PATH':'/usr/bin/chromium','SRM_DATA_DIR':str(R/'automatic-data-isolated'),'CI':'1'}
def execute(phase,name,cmd):
 d=R/phase/name;d.mkdir(parents=True);start=time.time();print('START',phase,name,flush=True)
 with(d/'stdout.log').open('w')as o,(d/'stderr.log').open('w')as e:q=subprocess.run(cmd,cwd=P,env=env,stdout=o,stderr=e)
 (d/'command.json').write_text(json.dumps({'productSHA':SHA,'command':cmd,'cwd':str(P),'startUTC':datetime.datetime.fromtimestamp(start,datetime.timezone.utc).isoformat(),'durationSeconds':round(time.time()-start,3),'exitCode':q.returncode,'originalTestsUnmodified':True,'retries':0,'WindowsEvidence':False},indent=2)+'\n');print('END',phase,name,q.returncode,flush=True);return q.returncode
def preserve(phase):
 for n in ['test-results','playwright-report']:
  if(P/n).exists():shutil.move(str(P/n),str(R/phase/n))
if execute('setup','npm-ci',['npm','ci']):raise SystemExit('npm ci blocked')
(R/'npm-ready').write_text('Installed from current lockfile\n')
execute('focused','ui-v3',['npx','--no-install','playwright','test','prototype/m1-lite/tests/e2e/ui-v3-integration.spec.cjs','--grep','^UI V3 integration:'])
preserve('focused');(R/'focused-finished').write_text('Original focused case completed; result in focused/test-results/results.json\n')
for name,cmd in [('python-backend',['python','-m','unittest','discover','-v','-s','prototype/m1-lite/backend','-p','test_*.py']),('node-business',['npm','test']),('chromium-e2e',['npm','run','test:e2e'])]:execute('automation',name,cmd)
preserve('automation');print('AUTOMATION_FINISHED',flush=True)
