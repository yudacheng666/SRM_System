from pathlib import Path
import json,hashlib,zipfile,re,subprocess
p=Path('/tmp/srm-pr20-uat/docs/uat/20261017-pr20-integ01-retest');e=p/'evidence'
parsed=json.loads((e/'independent-csv-parsed.json').read_text());assert len(parsed)==12;assert len([x for x in parsed if x['formal']and x['tag']!='old-original'])==10
for x in parsed:
 f=p/'downloads'/(x['tag']+'.csv');assert hashlib.sha256(f.read_bytes()).hexdigest()==x['sha256']
 if x['tag']!='old-original':assert all(r[0]==x['id']for r in x['rows'][1:])
for m in parsed:
 if m['tag']=='new-demo':assert json.loads((e/'new-demo-before.json').read_text())==json.loads((e/'new-demo-after.json').read_text())
 else:assert json.loads((e/(m['tag']+'-before.json')).read_text())==json.loads((e/(m['tag']+'-after.json')).read_text())
base=json.loads((e/'before-real-restart.json').read_text())
for name in ['after-real-restart','final-saved-state']:assert json.loads((e/(name+'.json')).read_text())==base
for label in ['old','new']:
 a=json.loads((e/(label+'-cross-probe-before.json')).read_text());b=json.loads((e/(label+'-cross-probe-after.json')).read_text());assert all(b['workspaces'].get(k)==v for k,v in a['workspaces'].items());assert len(set(b['workspaces'])-set(a['workspaces']))==1
for f in e.glob('*.json'):
 d=json.loads(f.read_text())
 if isinstance(d,dict)and'workspaces'in d:
  for wid,w in d['workspaces'].items():assert hashlib.sha256((e/(f.stem+'-'+wid+'-original.json')).read_bytes()).hexdigest()==w['sha256']
for f in e.glob('*.zip'):assert zipfile.ZipFile(f).testzip()is None
assert len(list(e.glob('*.png')))==24
logs=[json.loads(x)for x in(e/'browser-actions.jsonl').read_text().splitlines()];assert sum(x['kind']=='check'for x in logs)==18;assert all(x['pass']for x in logs if x['kind']=='check');assert sum(x['kind']=='driver-error'for x in logs)==6;assert sum(x['kind']=='pageerror'for x in logs)==2
probe=json.loads((e/'cross-project-error-probe.json').read_text());assert len(probe)==2 and all(len(x['errors'])==1 for x in probe)
final=json.loads((e/'version-and-ci-final.json').read_text());assert final['head']=='dec5e480cf87441972da05f1074dfa3589285b30';assert all(x['status']=='completed'and x['conclusion']=='failure'for x in final['ci']['workflow_runs'])
refs=(e/'final-remote-refs.txt').read_text();assert '420d2af326a3f59c1c6015d6b0fe44db23fe0fc6\trefs/heads/draft/'in refs;assert 'f330de510f97c552629052ff1841d7223194e7f8\trefs/heads/main'in refs
r=(p/'REPORT.md').read_text();assert len(re.findall(r'^\|T\d+\|.*?\|PASS\|',r,re.M))==17;assert len(re.findall(r'^\|T\d+\|.*?\|FAIL\|',r,re.M))==1;assert len(re.findall(r'^\|NT\d+\|.*?\|NOT TESTED\|',r,re.M))==4
(p/'SHA256SUMS.txt').touch()
for f in p.glob('*.md'):
 for x in re.findall(r'\]\(([^)]+)\)',f.read_text()):
  if not x.startswith('https://'):assert (f.parent/x).exists(),(f.name,x)
assert subprocess.call(['git','diff','--quiet'],cwd='/tmp/srm-pr20-uat')==0
(p/'ARTIFACT-VALIDATION.json').write_text(json.dumps({'artifact_audit':'PASS','csv_files':12,'candidate_formal_exports':10,'candidate_case_pass':17,'candidate_case_fail_existing_baseline_bug':1,'not_tested':4,'screenshots':24,'main_checks_pass':18,'driver_errors_disclosed':6,'main_product_pageerrors_disclosed':2,'old_and_new_separate_probes_reproduce_BASE01':True,'original_business_records_preserved_in_probes':True,'all_export_before_after_equal':True,'restart_snapshots_equal':True,'all_recorded_snapshot_and_csv_hashes_verified':True,'all_trace_zips_valid':True,'ci_runs_remain_failed':True,'product_existing_tests_ci_unchanged':True,'local_markdown_links_valid':True},indent=2))
(p/'SHA256SUMS.txt').write_text(''.join(f'{hashlib.sha256(f.read_bytes()).hexdigest()}  {f.relative_to(p)}\n'for f in sorted(p.rglob('*'))if f.is_file()and f.name!='SHA256SUMS.txt'))
print('PR20_ARTIFACT_AUDIT_PASS')
