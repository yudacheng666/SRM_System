from pathlib import Path
import zipfile,sqlite3,hashlib,json
r=Path('/tmp/pr46-cont');e=r/'attempt-01/evidence';expected=json.load(open(e/'W04-before-backup.json'));checks=[]
def ck(n,a,b):
 ok=a==b;checks.append({'label':n,'actual':a,'expected':b,'pass':ok});(e/'s4-checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2));print('PASS'if ok else'FAIL',n,flush=True);assert ok,n
with zipfile.ZipFile(r/'attempt-01/downloads/independent-S4-full.zip')as z:
 ck('S4 ZIP CRC',z.testzip(),None);m=json.loads(z.read('manifest.json'));b=z.read(m['database']['path']);ck('S4 manifest DB hash',hashlib.sha256(b).hexdigest(),m['database']['sha256']);p=r/'extracted-S4.sqlite3';p.write_bytes(b);c=sqlite3.connect('file:'+str(p)+'?mode=ro',uri=True);ck('S4 SQLite integrity',c.execute('pragma integrity_check').fetchone()[0],'ok')
 for t,v in expected['tables'].items():
  rows=[list(x)for x in c.execute('select * from '+t)];rows.sort(key=lambda x:json.dumps(x,ensure_ascii=False));ck('S4 every '+t+' row/field',rows,v['rows'])
 pdf={x['path']:hashlib.sha256(z.read(x['path'])).hexdigest()for x in m['assets']};ck('S4 all physical PDFs exact',pdf,expected['pdf'])
 for a in m['assets']:ck('S4 asset manifest '+a['path'],pdf[a['path']],a['sha256'])
print('ALL_S4_CHECKS_PASS',len(checks))
