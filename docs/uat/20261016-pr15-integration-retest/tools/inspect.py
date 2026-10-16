from pathlib import Path
from io import BytesIO
from openpyxl import load_workbook
import zipfile,json,hashlib,csv
r=Path('/tmp/srm-integration-downloads');e=Path('/tmp/srm-integration-evidence');f=Path('/tmp/srm-integration-fixtures');out={}
for filename,expected,pdfs,other in [('partial-I-SUP-A.zip',['RFQ-L00001','RFQ-L00002'],['D16_A.pdf','D20_B.pdf'],'虚构集成乙'),('partial-I-SUP-B.zip',['RFQ-L00002'],['D20_B.pdf'],'虚构集成甲'),('final-I-SUP-A.zip',['RFQ-L00001','RFQ-L00002','RFQ-L00003'],['D16_A.pdf','D20_B.pdf'],'虚构集成乙'),('final-I-SUP-B.zip',['RFQ-L00001','RFQ-L00002'],['D16_A.pdf','D20_B.pdf'],'虚构集成甲')]:
 z=zipfile.ZipFile(r/filename);assert z.testzip() is None;pn=[n for n in z.namelist() if n.endswith('.pdf')];assert sorted(Path(n).name for n in pn)==sorted(pdfs)
 for n in pn:assert hashlib.sha256(z.read(n)).digest()==hashlib.sha256((f/Path(n).name).read_bytes()).digest()
 names=[n for n in z.namelist()if n.endswith('.xlsx')];assert len(names)==1;w=load_workbook(BytesIO(z.read(names[0])),data_only=True);rows=list(w.active.values);headers=list(rows[0]);ids=[str(row[headers.index('RFQ Line ID')])for row in rows[1:]];assert ids==expected,(filename,ids);alltext=str(rows);assert all(x not in alltext for x in ['INTERNAL-REF','UPDATED-','PRIVATE-','RAW-ERP-',other,'carryFrom','供应商确认依据']);price=[i for i,x in enumerate(headers) if x and ('报价单价' in str(x) or str(x)=='单价')];assert price,(filename,headers)
 for row in rows[1:]:
  for i in price:assert row[i] in [None,''],(filename,row[i])
 out[filename]={'PASS':True,'files':z.namelist(),'headers':headers,'rows':rows,'price_blank':True,'pdf_hashes_valid':True,'private_data_absent':True}
for filename in ['internal-business.xlsx','internal-comparison.xlsx']:
 w=load_workbook(r/filename,data_only=True);out[filename]={s.title:list(s.values)for s in w}
s=out['internal-business.xlsx']['询价物料'];h=s[0];assert '虚构ERP扩展'in h;assert [x[h.index('虚构ERP扩展')]for x in s[1:]]==['RAW-ERP-16','RAW-ERP-20','RAW-ERP-24'];assert [x[h.index('参考编码2')]for x in s[1:]]==['UPDATED-16','UPDATED-20','PRIVATE-24'];assert len(set(h))==len(h)
if (r/'common-scope.csv').exists():out['common-scope.csv']=list(csv.reader((r/'common-scope.csv').read_text(encoding='utf-8-sig').splitlines()))
(e/'actual-export-inspection.json').write_text(json.dumps(out,ensure_ascii=False,indent=2,default=str));print('SUPPLIER_SCOPE_PDF_BYTES_PRIVACY_BLANK_PRICE_AND_INTERNAL_ERP_PASS')
