from pathlib import Path
from io import StringIO,BytesIO
from decimal import Decimal
from openpyxl import load_workbook
import json,csv,hashlib,zipfile
r=Path('/tmp/srm-r2-downloads');e=Path('/tmp/srm-r2-evidence');f=Path('/tmp/srm-r2-fixtures');out=[]
for m in [json.loads(x)for x in(e/'actual-downloads.jsonl').read_text().splitlines()]:
 raw=(r/(m['tag']+'.csv')).read_bytes();assert raw[:3]==b'\xef\xbb\xbf';rows=list(csv.reader(StringIO(raw.decode('utf-8-sig'),newline='')));h=rows[0];assert h[:6]==['RFQ编号','RFQ Line ID','存货编码','存货名称','询价数量','询价单位'];assert len(h)==len(set(h));assert all(len(x)==len(h)for x in rows);assert all(x[0]==m['id']for x in rows[1:]);assert rows[-1][1]=='同范围合计';assert m['filename']==m['id']+'_指定供应商组同范围报价.csv'
 if not m['demo']:
  assert [x[1]for x in rows[1:-1]]==['RFQ-L00001','RFQ-L00002'];assert rows[1][2].startswith("'")and rows[1][3].startswith("'")and h[6].startswith("'@");expected=['340.00','370.00']if m['tag'].startswith('P1')else['53.00','54.00'];assert [rows[-1][7],rows[-1][9]]==expected
  for x in rows[1:-1]:assert Decimal(x[4])*Decimal(x[6])==Decimal(x[7])and Decimal(x[4])*Decimal(x[8])==Decimal(x[9])
  for col in [7,9]:assert sum(Decimal(x[col])for x in rows[1:-1])==Decimal(rows[-1][col])
 out.append({**m,'sha256':hashlib.sha256(raw).hexdigest(),'bom':'efbbbf','rows':rows})
(e/'csv-parsed.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print('CSV_PARSE_PASS',len(out))
books={}
for vendor in ['A','B']:
 z=zipfile.ZipFile(r/('supplier-RET-'+vendor+'.zip'));assert z.testzip()is None;pdfs=[n for n in z.namelist()if n.endswith('.pdf')];assert sorted(Path(n).name for n in pdfs)==['D16_A.pdf','D20_B.pdf']
 for n in pdfs:assert hashlib.sha256(z.read(n)).digest()==hashlib.sha256((f/Path(n).name).read_bytes()).digest()
 w=load_workbook(BytesIO(z.read(next(n for n in z.namelist()if n.endswith('.xlsx')))),data_only=False);rows=list(w.active.values);h=rows[0];assert all(x not in str(rows)for x in ['PRIVATE-','RAW-SECRET-',('虚构复验乙'if vendor=='A'else'@虚构复验甲'),'来源凭证说明']);col=[i for i,x in enumerate(h)if '报价单价'in str(x)];assert col and all(row[i]in [None,'']for row in rows[1:]for i in col);assert not any(c.data_type=='f'for s in w for row in s for c in row);books[vendor]={'files':z.namelist(),'rows':rows,'privacy_blank_price_pdf_hashes':'PASS'}
w=load_workbook(r/'internal-P1.xlsx',data_only=True);books['internal-P1.xlsx']={s.title:list(s.values)for s in w};rows=books['internal-P1.xlsx']['询价物料'];h=rows[0];assert [x[h.index('虚构ERP扩展')]for x in rows[1:]]==['RAW-SECRET-2','RAW-SECRET-3','RAW-SECRET-4'];(e/'xlsx-pdf-inspection.json').write_text(json.dumps(books,ensure_ascii=False,indent=2,default=str));print('XLSX_PRIVACY_AND_REAL_PDF_HASHES_PASS')
if (r/'F1-business.xlsx').exists():
 w=load_workbook(r/'F1-business.xlsx',data_only=True);rows=list(w['询价物料'].values);h=rows[0];assert len(h)==len(set(h))and h[0]=='RFQ Line ID'and h[-1]=='来源 RFQ Line ID';assert [x[0]for x in rows[2:]]==['RFQ-L00002','RFQ-L00003','RFQ-L00004'];assert [x[-1]for x in rows[2:]]==['RFQ-L00001','RFQ-L00002','RFQ-L00003'];assert [x[h.index('虚构ERP扩展')]for x in rows[2:]]==['RAW-SECRET-2','RAW-SECRET-3','RAW-SECRET-4'];(e/'F1-inspection.json').write_text(json.dumps({'PASS':True,'rows':rows},ensure_ascii=False,indent=2,default=str));print('F1_DISTINCT_CURRENT_SOURCE_IDS_PASS')
