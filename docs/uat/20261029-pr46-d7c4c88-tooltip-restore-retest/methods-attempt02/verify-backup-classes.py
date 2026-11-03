from pathlib import Path
import sys,json,zipfile,sqlite3,hashlib
E=Path(sys.argv[1]);D=E.parent/'downloads';ws=json.load(open(E/'class-workspace.json'));db=json.load(open(E/'class-before-database.json'));out=[]
def ck(n,a,b):
 ok=a==b;out.append({'label':n,'actual':a,'expected':b,'pass':ok});(E/'backup-class-checks.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));assert ok,n
for n in ['current-data.json','all-data.json']:
 x=json.load(open(D/n));ck(n+' attachment flag',x['attachmentsIncluded'],False);records=x['workspaces']if 'workspaces'in x else[x];ck(n+' correct RFQ',[r['workspace']['workspaceId']for r in records],[ws['workspaceId']]);ck(n+' exact saved state',records[0]['workspace']['state'],ws['state']);ck(n+' no binary source evidence','FOR_UAT_ONLY_FAKE_EMAIL_20261029'in json.dumps(x),False)
with zipfile.ZipFile(D/'inquiry-drawing-archive.zip')as z:
 ck('archive CRC',z.testzip(),None);names=z.namelist();ck('archive data JSON present','全部询价结构化数据.json'in names,True);ck('archive drawing index present','图纸文件索引.json'in names,True);ck('archive is not SQLite restore package','database/srm.sqlite3'in names,False);index=json.loads(z.read('图纸文件索引.json'));ck('archive all3 physicalPDFs',len(index['files']),3)
 for f in index['files']:ck('archive PDF exact original '+f['name'],hashlib.sha256(z.read(f['file'])).hexdigest(),f['sha256'])
 ck('archive excludes mail/chat names',any(n.lower().endswith(('.eml','.msg','.png','.jpg'))for n in names),False);ck('archive excludes fake mail bytes',any(b'FOR_UAT_ONLY_FAKE_EMAIL_20261029'in z.read(n)for n in names),False)
with zipfile.ZipFile(D/'classification-full.zip')as z:
 ck('full ZIP CRC',z.testzip(),None);m=json.loads(z.read('manifest.json'));b=z.read(m['database']['path']);ck('full manifest DB hash',hashlib.sha256(b).hexdigest(),m['database']['sha256']);p=E/'class-extracted.sqlite3';p.write_bytes(b);c=sqlite3.connect('file:'+str(p)+'?mode=ro',uri=True);ck('full SQLite integrity',c.execute('pragma integrity_check').fetchone()[0],'ok')
 for t,v in db['tables'].items():
  rows=[list(r)for r in c.execute('select * from '+t)];rows.sort(key=lambda x:json.dumps(x,ensure_ascii=False));ck('full every '+t+' row',rows,v['rows'])
 ck('full all3 registered drawings',len(m['assets']),3)
 for a in m['assets']:ck('full originalPDF '+a['path'],hashlib.sha256(z.read(a['path'])).hexdigest(),a['sha256'])
 ck('full excludes mail/chat file types',any(n.lower().endswith(('.eml','.msg','.png','.jpg'))for n in z.namelist()),False)
print('BACKUP_CLASS_CONTENT_PASS',len(out))
