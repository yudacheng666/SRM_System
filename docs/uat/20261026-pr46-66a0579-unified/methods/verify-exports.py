from pathlib import Path
import json,zipfile,hashlib,xml.etree.ElementTree as X,io,csv
r=Path('/tmp/uat66');e=r/'attempt-03/evidence';ws=json.load(open(e/'final-workspace.json'));items=ws['state']['items'];ids=[i['lineId']for i in items];qty=[i['qty']for i in items];checks=[]
def ck(n,a,b):
 ok=a==b;checks.append({'label':n,'actual':a,'expected':b,'pass':ok});(e/'export-checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2));print('PASS'if ok else'FAIL',n,flush=True);assert ok,n
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def sheet(raw,num=1):
 with zipfile.ZipFile(io.BytesIO(raw))as z:
  tree=X.fromstring(z.read('xl/worksheets/sheet'+str(num)+'.xml'));out=[]
  for row in tree.findall('.//s:row',ns):
   cells={}
   for c in row:
    ref=c.get('r');col=0
    for char in ref:
     if char.isalpha():col=col*26+ord(char)-64
    cells[col-1]=''.join(c.itertext())if c.get('t')=='inlineStr'else c.findtext('s:v','',ns)
   out.append([cells.get(i,'')for i in range(max(cells,default=-1)+1)])
  width=len(out[0]);return [x+['']*(width-len(x))for x in out]
for sid in ['U66-A','U66-B','U66-C']:
 with zipfile.ZipFile(r/f'attempt-03/downloads/supplier-{sid}.zip')as z:
  ck(sid+' ZIP CRC',z.testzip(),None);names=z.namelist();ck(sid+' no internal JSON',any(n.endswith('.json')for n in names),False);xls=next(n for n in names if n.endswith('.xlsx'));rows=sheet(z.read(xls));want=[0,4]if sid=='U66-C'else list(range(12));ck(sid+' exact assigned RFQ lines',[x[0]for x in rows[1:]],[ids[i]for i in want]);ck(sid+' exact quantities',[float(x[3])for x in rows[1:]],[qty[i]for i in want]);ck(sid+' quote prices remain blank',[x[5]for x in rows[1:]],['']*len(want));ck(sid+' no competitor IDs',any(other in str(rows)for other in ['U66-A','U66-B','U66-C']if other!=sid),False);ck(sid+' no internal reason', '保障更适合' in str(rows),False);actual={Path(n).name:hashlib.sha256(z.read(n)).hexdigest()for n in names if n.endswith('.pdf')};expected={}if sid=='U66-C'else{n:hashlib.sha256((r/'fixtures'/n).read_bytes()).hexdigest()for n in ['UF26-003_A.pdf','UF26-DUP_A.pdf','UF26-unmatched.pdf']};ck(sid+' exact scoped original PDF bytes',actual,expected)
expected=json.load(open(r/'fixtures/business-expected.json'));shared=[i for i in range(12)if expected['A'][i]is not None];csvrows=list(csv.reader((r/'attempt-03/downloads/independent-common-scope.csv').read_text(encoding='utf-8-sig').splitlines()));ck('CSV exact10 common lines',[x[1]for x in csvrows[1:-1]],[ids[i]for i in shared]);ck('CSV true RFQ identity',list(set(x[0]for x in csvrows[1:])),[ws['workspaceId']]);ck('CSV independently calculated totals',[float(csvrows[-1][7]),float(csvrows[-1][9])],[sum(qty[i]*expected[s][i]for i in shared)for s in ['A','B']]);ck('CSV every amount equals quantity times applicable price',all(round(float(x[4])*float(x[6]),2)==float(x[7])and round(float(x[4])*float(x[8]),2)==float(x[9])for x in csvrows[1:-1]),True)
rows=sheet((r/'attempt-03/downloads/comparison.xlsx').read_bytes());h=rows[0];row2=next(x for x in rows[1:]if x[0]==ids[1]);row12=next(x for x in rows[1:]if x[0]==ids[11]);ck('comparison second-page selection remains true120',float(row12[h.index('选择供应商适用单价')]),120);ck('comparison high-price reason persists',row2[h.index('非最低价选择原因')],'完全虚构统一26：乙方交期与保障更适合本询价');ck('comparison actual high selected unit82',float(row2[h.index('选择供应商适用单价')]),82);ck('comparison stable12 RFQ lines',[x[0]for x in rows[1:13]],ids)
print('ALL_EXPORT_CHECKS_PASS',len(checks))

with zipfile.ZipFile(r/'attempt-03/downloads/all-suppliers.zip')as outer:
 ck('all suppliers outer CRC',outer.testzip(),None);ck('all suppliers exact nested names',sorted(outer.namelist()),['RFQ_U66-A.zip','RFQ_U66-B.zip','RFQ_U66-C.zip'])
 for sid in ['U66-A','U66-B','U66-C']:
  with zipfile.ZipFile(io.BytesIO(outer.read('RFQ_'+sid+'.zip')))as z:
   ck(sid+' nested CRC',z.testzip(),None);rows=sheet(z.read(next(n for n in z.namelist()if n.endswith('.xlsx'))));wanted=[ids[0],ids[4]]if sid=='U66-C'else ids;ck(sid+' nested assigned lines',[x[0]for x in rows[1:]],wanted);ck(sid+' nested blank supplier prices',[x[5]for x in rows[1:]],['']*len(wanted));actual={Path(n).name:hashlib.sha256(z.read(n)).hexdigest()for n in z.namelist()if n.endswith('.pdf')};expected={}if sid=='U66-C'else{n:hashlib.sha256((r/'fixtures'/n).read_bytes()).hexdigest()for n in ['UF26-003_A.pdf','UF26-DUP_A.pdf','UF26-unmatched.pdf']};ck(sid+' nested exact PDF scope/bytes',actual,expected)
