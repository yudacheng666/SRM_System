from pathlib import Path
import subprocess,os,json,time,datetime,platform,hashlib,shutil
R=Path('/workspace/uatd7');P=Path('/workspace/srmd7-product');sha='d7c4c88abd354ebdc5d3bfedfc9199e278c48483';assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=P,text=True).strip()==sha
(R/'identity-start.json').write_text(json.dumps({'productSHA':sha,'htmlSHA256':hashlib.sha256((P/'prototype/m1-lite/index.html').read_bytes()).hexdigest(),'runtime':{'OS':platform.platform(),'python':platform.python_version(),'node':subprocess.check_output(['node','--version'],text=True).strip(),'chromium':subprocess.check_output(['/usr/bin/chromium','--version'],text=True).strip()},'nativeWindows':False,'cmdExeAvailable':shutil.which('cmd.exe'),'pwshAvailable':shutil.which('pwsh'),'evidenceParent':'5c179854188f01ea7614d019c0f4c31f7f90ca8e','scope':'Linux supplemental evidence only; Windows requirements NOT TESTED'},indent=2)+'\n')
for name,cmd in [('python-backend',['python','-m','unittest','discover','-v','-s','prototype/m1-lite/backend','-p','test_*.py']),('npm-ci',['npm','ci']),('node-business',['npm','test']),('chromium-e2e',['npm','run','test:e2e'])]:
 d=R/'automation'/name;d.mkdir(parents=True);start=time.time();print('START',name,flush=True)
 with(d/'stdout.log').open('w')as o,(d/'stderr.log').open('w')as e:r=subprocess.run(cmd,cwd=P,env={**os.environ,'npm_config_cache':str(R/'npm-cache'),'SRM_CHROMIUM_PATH':'/usr/bin/chromium','SRM_DATA_DIR':str(R/'automatic-data-isolated'),'CI':'1'},stdout=o,stderr=e)
 (d/'command.json').write_text(json.dumps({'productSHA':sha,'command':cmd,'cwd':str(P),'startUTC':datetime.datetime.fromtimestamp(start,datetime.timezone.utc).isoformat(),'durationSeconds':round(time.time()-start,3),'exitCode':r.returncode,'originalTestsUnmodified':True,'WindowsEvidence':False},indent=2)+'\n');print('END',name,r.returncode,flush=True)
 if name=='npm-ci':
  if r.returncode:raise SystemExit(r.returncode)
  (R/'npm-ready').write_text('Ready for separate independent browser\n')
for n in ['test-results','playwright-report']:
 if(P/n).exists():shutil.move(str(P/n),str(R/'automation'/n))
print('AUTOMATION_FINISHED',flush=True)
