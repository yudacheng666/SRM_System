from pathlib import Path
import subprocess,os,json,re,time,datetime,shutil,hashlib,platform
R=Path('/workspace/uatf4');P=Path('/workspace/srmf4-product');sha='f4bfcda8efdf3998c833ed25c3193a056fdde451'
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=P,text=True).strip()==sha
(R/'identity-start.json').write_text(json.dumps({'productSHA':sha,'htmlSHA256':hashlib.sha256((P/'prototype/m1-lite/index.html').read_bytes()).hexdigest(),'tree':subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=P,text=True).strip(),'runtime':{'python':platform.python_version(),'node':subprocess.check_output(['node','--version'],text=True).strip(),'chromium':subprocess.check_output(['/usr/bin/chromium','--version'],text=True).strip(),'OS':platform.platform()},'evidenceParent':'5559235254d98fbc4a40560f30726dac78df56e6'},indent=2)+'\n')
def run(name,cmd):
 d=R/name;d.mkdir(parents=True);start=time.time();print('START',name,flush=True)
 with(d/'stdout.log').open('w')as o,(d/'stderr.log').open('w')as e:p=subprocess.run(cmd,cwd=P,env={**os.environ,'npm_config_cache':str(R/'npm-cache'),'SRM_CHROMIUM_PATH':'/usr/bin/chromium','SRM_DATA_DIR':str(R/'automation-isolated'),'CI':'1'},stdout=o,stderr=e)
 (d/'command.json').write_text(json.dumps({'productSHA':sha,'command':cmd,'cwd':str(P),'startUTC':datetime.datetime.fromtimestamp(start,datetime.timezone.utc).isoformat(),'durationSeconds':round(time.time()-start,3),'exitCode':p.returncode,'originalTestsUnmodified':True},ensure_ascii=False,indent=2)+'\n');print('END',name,p.returncode,flush=True);return p.returncode
if run('bootstrap/npm-ci',['npm','ci']):raise SystemExit(1)
old=json.load(open('/workspace/uat795/phase2/test-results/results.json'));titles=[]
def walk(ss):
 for s in ss:
  for spec in s.get('specs',[]):
   if any(t['status']=='unexpected'for t in spec['tests']):titles.append(spec['title'])
  walk(s.get('suites',[]))
walk(old['suites']);assert len(titles)==7;regex='|'.join(re.escape(t)for t in titles)
(R/'phase1').mkdir();(R/'phase1/selected-tests.json').write_text(json.dumps({'exactTitles':titles,'count':7,'grep':regex},ensure_ascii=False,indent=2)+'\n')
run('phase1/list',['npm','run','test:e2e','--','--list','--grep',regex]);run('phase1/run',['npm','run','test:e2e','--','--grep',regex])
for n in ['test-results','playwright-report']:
 if(P/n).exists():shutil.move(str(P/n),str(R/'phase1'/n))
print('PHASE1_FINISHED',flush=True)
for name,cmd in [('python-backend',['python','-m','unittest','discover','-v','-s','prototype/m1-lite/backend','-p','test_*.py']),('npm-ci',['npm','ci']),('node-business',['npm','test']),('chromium-e2e',['npm','run','test:e2e'])]:
 if run('phase2/'+name,cmd)and name=='npm-ci':raise SystemExit(1)
 if name=='npm-ci':(R/'phase2-npm-ready').write_text('Install completed; safe to launch independent driver.\n')
for n in ['test-results','playwright-report']:
 if(P/n).exists():shutil.move(str(P/n),str(R/'phase2'/n))
print('FULL_AUTOMATION_FINISHED',flush=True)
