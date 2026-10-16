from pathlib import Path
import openpyxl,zipfile,io,json,hashlib,re
from decimal import Decimal,ROUND_HALF_UP
r=Path('/tmp/srm-pr16-downloads');out={'vendor':[],'financial':{},'legacy':{}}
for f in ['CLOUD-A-candidate.zip','CLOUD-B-candidate.zip','CLOUD-C-candidate.zip','roundtrip-supplier-package.zip']:
 p=r/f;z=zipfile.ZipFile(p);names=z.namelist();pdf={}
 if 'xl/workbook.xml' in names:books=[openpyxl.load_workbook(p.open('rb'))];typ='XLSX (original .xlsx download retained unchanged)'
 else:
  books=[openpyxl.load_workbook(io.BytesIO(z.read(n))) for n in names if n.endswith('.xlsx')];typ='ZIP'
  pdf={n:hashlib.sha256(z.read(n)).hexdigest() for n in names if n.endswith('.pdf')}
 info={'file':f,'actual_type':typ,'members':names if typ=='ZIP' else ['OOXML package'],'pdf_sha256':pdf,'sheets':[]}
 for w in books:
  for s in w:
   rs=list(s.values);h=list(rs[0]);alltext=' '.join(str(v) for row in rs for v in row if v is not None)
   assert '规格型号' in h
   for private in ['来源 RFQ Line ID','参考编码1','参考编码2','采购常用单位','ERP批次属性','未映射ERP列','内部标签','R-100','仅内部REF','最终选择','凭证说明','报价轮次']:assert private not in alltext,(f,private)
   for col in ['报价单价','报价状态']:assert all(row[h.index(col)] is None for row in rs[1:]),(f,col)
   ids={row[h.index('RFQ Line ID')] for row in rs[1:]};expected={'RFQ-L00001','RFQ-L00004'} if f.startswith(('CLOUD-A','CLOUD-B')) else ({'RFQ-L00001','RFQ-L00003','RFQ-L00004','RFQ-L00005'} if f.startswith('CLOUD-C') else {'RFQ-L00001','RFQ-L00002','RFQ-L00003','RFQ-L00004'});assert ids==expected,(f,ids);info['sheets'].append({'name':s.title,'headings':h,'rows':rs[1:]})
 if f.startswith('roundtrip'):
  hs={hashlib.sha256((Path('/tmp/srm-pr16-fixtures')/n).read_bytes()).hexdigest() for n in ['TEST-001_A.pdf','TEST-002_A.pdf']};assert set(pdf.values())==hs
 info['result']='PASS';out['vendor'].append(info)
w=openpyxl.load_workbook(r/'new-final-comparison.xlsx');s=w['比价汇总'];expected={'R2':90,'U2':105,'R3':180,'U3':192};calc={}
for cell,result in expected.items():
 formula=s[cell].value;m=re.fullmatch(r'=ROUND\(([A-Z]+[0-9]+)\*([A-Z]+[0-9]+),2\)',formula);assert m
 val=(Decimal(str(s[m[1]].value))*Decimal(str(s[m[2]].value))).quantize(Decimal('.01'),rounding=ROUND_HALF_UP);assert float(val)==result;calc[cell]={'formula':formula,'independent_value':float(val)}
assert s['R4'].value=='=SUMIF(K2:K3,"是",R2:R3)' and s['U4'].value=='=SUMIF(K2:K3,"是",U2:U3)'
assert s['K2'].value==s['K3'].value=='是';assert s['M2'].value=='虚构供应乙' and s['N2'].value==21;assert s['N3'].value==30
out['financial']={'cell_checks':calc,'A':90+180,'B':105+192,'selected':21*5+30*6,'minimum':18*5+30*6,'nonlowest_delta':(21-18)*5,'A_B_common_items':2,'quote_history_rows':w['报价议价明细'].max_row-1}
a=openpyxl.load_workbook(r/'new-three-status-audit.xlsx')['比价汇总'];rs=list(a.values);h=list(rs[0]);m20=next(row for row in rs[1:] if row[h.index('RFQ Line ID')]=='RFQ-L00003');
assert all(row[h.index('是否共同有效报价')]=='否' for row in rs[1:-1]);out['financial']['all_three_common_items']=0
for i,v in enumerate(m20):
 if h[i] and ('适用单价' in h[i] or '行金额' in h[i]):assert v is None,(h[i],v)
out['financial']['M20_unpriced_cells_blank']=True
out['legacy']['original']=json.loads(Path('/tmp/srm-pr16-evidence/legacy-original-snapshot.json').read_text())['state']['items'][1]['erpExtra'];assert out['legacy']['original']['RFQ Line ID']=='RFQ-L00003'
out['result']='PASS';Path('/tmp/srm-pr16-evidence/independent-artifact-checks.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print('PASS: 4 vendor artifacts, PDF bytes, 270/297/285/270/15, blank nonprices, legacy raw source')
