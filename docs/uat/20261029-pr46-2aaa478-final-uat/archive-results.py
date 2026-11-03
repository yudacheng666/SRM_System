from pathlib import Path
import json,hashlib,tarfile,shutil,sys,zipfile
R=Path('/workspace/uat2aaa');phase=sys.argv[1];archiveLabel=sys.argv[2]if len(sys.argv)>2 else phase;S=R/phase;D=Path('/workspace/srmf8-evidence/docs/uat/20261029-pr46-2aaa478-final-uat')/archiveLabel
D.mkdir(parents=True,exist_ok=True)
for p in S.iterdir():
 if p.name in ['test-results','playwright-report']:continue
 if p.is_dir():shutil.copytree(p,D/p.name,dirs_exist_ok=True)
 else:shutil.copy2(p,D/p.name)
raw=[];zipChecks=[]
for n in ['test-results','playwright-report']:
 for p in sorted((S/n).rglob('*')):
  if not p.is_file():continue
  h=hashlib.sha256(p.read_bytes()).hexdigest();name=str(p.relative_to(S));raw.append((p,name,h))
  if p.suffix=='.zip':
   try:
    with zipfile.ZipFile(p)as z:bad=z.testzip()
    zipChecks.append({'path':name,'validCRC':bad is None,'badMember':bad})
   except Exception as e:zipChecks.append({'path':name,'validCRC':False,'error':str(e),'preservedUnchanged':True})
archive=R/(archiveLabel+'-all-original.tar.gz');seen={};manifest=[]
with tarfile.open(archive,'w:gz',compresslevel=5)as t:
 for p,n,h in raw:
  info=t.gettarinfo(str(p),arcname=n)
  if h in seen:info.type=tarfile.LNKTYPE;info.linkname=seen[h];info.size=0;t.addfile(info)
  else:
   with p.open('rb')as f:t.addfile(info,f)
   seen[h]=n
  manifest.append({'path':n,'bytes':p.stat().st_size,'sha256':h})
expected={x['path']:x['sha256']for x in manifest};checked={}
with tarfile.open(archive,'r|gz')as t:
 for m in t:
  h=checked[m.linkname]if m.islnk()else hashlib.sha256(t.extractfile(m).read()).hexdigest();assert h==expected[m.name],m.name;checked[m.name]=h
assert checked==expected
V=D/'raw-parts';V.mkdir();parts=[]
with archive.open('rb')as f:
 i=0
 while b:=f.read(32*1024*1024):
  name=f'all-original.tar.gz.part{i:03}';(V/name).write_bytes(b);parts.append({'file':name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()});i+=1
(D/'original-file-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
(D/'archive.json').write_text(json.dumps({'originalFiles':len(raw),'uniqueContents':len(seen),'allOriginalHashesRevalidated':True,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'parts':parts,'extract':'cat raw-parts/all-original.tar.gz.part* | tar -xz -f -','traceIntegrity':'See trace-integrity.json; damaged originals are retained, never repaired'},indent=2)+'\n')
(D/'trace-integrity.json').write_text(json.dumps(zipChecks,indent=2)+'\n')
# Direct evidence for failed tests, including original screenshots/errors/logs.
x=json.loads((S/'test-results/results.json').read_text());cases=[]
def walk(ss):
 for s in ss:
  for spec in s.get('specs',[]):
   for c in spec['tests']:cases.append({'id':spec['id'],'title':spec['title'],'file':spec['file'],'line':spec['line'],'status':c['status'],'results':c['results']})
  walk(s.get('suites',[]))
walk(x['suites']);(D/'automated-results.json').write_text(json.dumps({'stats':x['stats'],'cases':cases},ensure_ascii=False,indent=2)+'\n')
for i,c in enumerate([c for c in cases if c['status']=='unexpected'],1):
 F=D/'failures'/f'FAIL-{i:02}';F.mkdir(parents=True);(F/'failure.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
 for r in c['results']:
  for a in r.get('attachments',[]):
   q=Path(a.get('path',''));rel=Path(*q.parts[q.parts.index('test-results')+1:])if 'test-results'in q.parts else None
   if rel and(S/'test-results'/rel).is_file()and q.suffix in ['.png','.md','.log']:shutil.copy2(S/'test-results'/rel,F/q.name)
print(json.dumps({'phase':phase,'stats':x['stats'],'rawFiles':len(raw),'parts':len(parts),'bytes':archive.stat().st_size,'badTraceCopies':sum(not t['validCRC']for t in zipChecks)}),flush=True)
