from pathlib import Path
import io,zipfile,hashlib,json,openpyxl
r=Path('/tmp/srm-pr15-downloads');fixtures=Path('/tmp/srm-pr15-fixtures');out=[]
for p in r.glob('*.zip'):
 if not p.name.startswith(('A-partial','C-missing','CLOUD-')):continue
 with zipfile.ZipFile(p) as z:
  info={'file':p.name,'members':z.namelist(),'pdfs':{},'sheets':[],'checks':{}}
  for n in z.namelist():
   if n.endswith('.pdf'):
    data=z.read(n);info['pdfs'][n]=hashlib.sha256(data).hexdigest();assert data==(fixtures/Path(n).name).read_bytes()
   if n.endswith('.xlsx'):
    w=openpyxl.load_workbook(io.BytesIO(z.read(n)),data_only=False)
    for s in w:
     rows=list(s.values);head=list(rows[0]);info['sheets'].append({'name':s.title,'rows':rows});vals=' '.join(str(v) for row in rows for v in row if v is not None)
     assert '规格型号' in head
     for forbidden in ['参考编码1','参考编码2','ERP批次属性','R-100','R-101','内部标签A','内部标签B','报价轮次','最终选择供应商']:assert forbidden not in vals,(p.name,forbidden)
     for h in ['报价单价','报价状态']:
      idx=head.index(h);assert all(row[idx] is None for row in rows[1:]),(p.name,h)
     ids={row[head.index('RFQ Line ID')] for row in rows[1:]};expected={'RFQ-L00003','RFQ-L00004'} if p.name.startswith(('CLOUD-C','C-')) else {'RFQ-L00001','RFQ-L00004'};assert ids==expected,(p.name,ids)
  expected_pdfs={'TEST-002_A.pdf'} if p.name.startswith(('CLOUD-C','C-','A-partial')) else {'TEST-001_B.pdf','TEST-002_A.pdf'}
  assert set(info['pdfs'])==expected_pdfs,(p.name,info['pdfs'])
  info['checks']={'scope':'PASS','confidential_fields_absent':'PASS','quote_cells_blank':'PASS','pdf_identity_and_hash':'PASS'};out.append(info)
Path('/tmp/srm-pr15-evidence/supplier-package-checks.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print('Packages independently validated:',len(out))
