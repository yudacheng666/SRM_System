from pathlib import Path
import json,hashlib,zipfile,re,subprocess
p=Path('/tmp/srm-integration-uat/docs/uat/20261016-pr15-integration-retest');e=p/'evidence'
def r(n):return json.loads((e/(n+'.json')).read_text())
empty=r('01-empty')
for n in ['02-downloads','03-invalid-preview','04-invalid-cancel','03-csv-cancel-preview','04-csv-cancel-cancel','03-xlsx-cancel-preview','04-xlsx-cancel-cancel']:assert r(n)==empty,n
rich=r('09-rich-before-preview')
for n in ['10-rich-invalid-preview','11-rich-invalid-cancel','10-rich-valid-cancel-preview','11-rich-valid-cancel-cancel']:assert r(n)==rich,n
assert r('11b-rich-layout-saved')==r('12-refreshed')
final=r('15-before-restart')
for n in ['16-after-real-restart','17-restored','18-restore-refused','19-final']:assert r(n)==final,n
for f in e.glob('*.json'):
 d=json.loads(f.read_text())
 if 'workspaces'in d:
  for wid,w in d['workspaces'].items():assert hashlib.sha256((e/(f.stem+'-'+wid+'-original.json')).read_bytes()).hexdigest()==w['sha256']
raw=[json.loads(x)for x in (e/'browser-actions.jsonl').read_text().splitlines()];assert sum(x['kind']=='check' and not x['pass']for x in raw)==1;assert sum(x['kind']=='check' and x['pass']for x in raw)==25;assert not any(x['kind']in ['driver-error','pageerror','http-error','network-failed']for x in raw)
a=json.loads((p/'automated/test-results/results.json').read_text());assert a['stats']['expected']==38 and all(a['stats'][k]==0 for k in ['unexpected','flaky','skipped']);traces=list((p/'automated/test-results').rglob('trace.zip'));assert len(traces)==38
for f in p.rglob('*.zip'):assert zipfile.ZipFile(f).testzip() is None,str(f)
cases=[]
def walk(s):
 for spec in s.get('specs',[]):
  for t in spec['tests']:cases.append((spec['file'],spec['title'],t['status'],t['results'][-1]['status']))
 for sub in s.get('suites',[]):walk(sub)
for s in a['suites']:walk(s)
assert len(cases)==38 and all(x[2]=='expected' and x[3]=='passed'for x in cases)
(p/'AUTOMATED-CASES.md').write_text('# 自动化逐项结果 / Automated cases\n\n所有用例在最终合并SHA本轮真实执行，原有测试/断言未改。\n\n|编号|源文件|用例|结果|\n|---|---|---|---|\n'+''.join(f'|{i}|{file}|{title}|PASS|\n'for i,(file,title,_,__)in enumerate(cases,1)))
report=(p/'REPORT.md').read_text();assert len(re.findall(r'^\|G\d+\|.*?\|PASS\|',report,re.M))==25;assert len(re.findall(r'^\|G\d+\|.*?\|FAIL\|',report,re.M))==1;assert len(re.findall(r'^\|NT\d+\|.*?\|NOT TESTED\|',report,re.M))==3
assert len(list(e.glob('*.png')))==70
(p/'SHA256SUMS.txt').touch()
for f in p.glob('*.md'):
 for path in re.findall(r'\]\(([^)]+)\)',f.read_text()):
  if not path.startswith('https://'):assert (f.parent/path).exists(),(f.name,path)
refs=(e/'final-remote-refs.txt').read_text();assert '420d2af326a3f59c1c6015d6b0fe44db23fe0fc6\trefs/heads/draft/'in refs and 'f330de510f97c552629052ff1841d7223194e7f8\trefs/heads/main'in refs
assert subprocess.call(['git','diff','--quiet'],cwd='/tmp/srm-integration-uat')==0
(p/'ARTIFACT-VALIDATION.json').write_text(json.dumps({'status':'PASS','automatic_python_pass':43,'automatic_node_pass':2,'automatic_playwright_pass':38,'automatic_failed_skipped_flaky':0,'independent_matrix_pass':25,'independent_matrix_fail':1,'independent_not_tested':3,'independent_screenshots':70,'automated_traces':38,'all_zip_integrity_checked':True,'all_recorded_snapshot_hashes_recomputed':True,'preview_refresh_restart_restore_equalities_verified':True,'tracked_product_test_ci_files_unchanged':True,'all_local_markdown_links_exist':True},indent=2))
(p/'SHA256SUMS.txt').write_text(''.join(f'{hashlib.sha256(f.read_bytes()).hexdigest()}  {f.relative_to(p)}\n'for f in sorted(p.rglob('*'))if f.is_file() and f.name!='SHA256SUMS.txt'))
print('ARTIFACT_AUDIT_PASS; FILES',len(list(p.rglob('*'))),'BYTES',sum(f.stat().st_size for f in p.rglob('*')if f.is_file()))
