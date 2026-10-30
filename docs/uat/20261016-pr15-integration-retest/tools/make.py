from pathlib import Path
from openpyxl import load_workbook
from reportlab.pdfgen import canvas
import json
r=Path('/tmp/srm-integration-downloads');f=Path('/tmp/srm-integration-fixtures');out={}
for name in ['material','supplier','quote']:
 w=load_workbook(r/(name+'.xlsx'));assert len(w.worksheets)==1 and w.active.max_row==1;h=[c.value for c in w.active[1]];assert len(h)==len(set(h));out[name]={'sheets':w.sheetnames,'headers':h,'header_only':True,'zip':(r/(name+'.xlsx')).read_bytes()[:4].hex()}
assert (r/'match.csv').read_bytes()==b'\xef\xbb\xbf'+('匹配值,新值\r\n').encode();out['match']={'BOM':'efbbbf','headers':['匹配值','新值']};Path('/tmp/srm-integration-evidence/template-headers.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
w=load_workbook(r/'material.xlsx');s=w.active;s.append(['INTEG-AXLE','虚构集成轴','M16','测试类别','INTERNAL-REF16','PRIVATE-16','盒',10,'件','D16']);s.append(['INTEG-AXLE','虚构集成轴','M20','测试类别','INTERNAL-REF20','PRIVATE-20','盒',20,'件','D20']);s.append(['INTEG-BRACKET','虚构支架','M24','测试类别','INTERNAL-REF24','PRIVATE-24','箱',5,'件','D24']);s.cell(1,11,'虚构ERP扩展');s.cell(2,11,'RAW-ERP-16');s.cell(3,11,'RAW-ERP-20');s.cell(4,11,'RAW-ERP-24');w.save(f/'materials.xlsx')
w=load_workbook(r/'supplier.xlsx');s=w.active;s.append(['I-CP-A','I-SUP-A','虚构集成甲']);s.append(['I-CP-B','I-SUP-B','虚构集成乙']);w.save(f/'suppliers.xlsx')
for key,rows in [('A',[['RFQ-L00001','INTEG-AXLE',10,7,1,'正常报价','虚构M16'],['RFQ-L00002','INTEG-AXLE',12,8,1,'正常报价','虚构M20'],['RFQ-L00003','INTEG-BRACKET',None,None,None,'不供货','虚构M24不供货']]),('B',[['RFQ-L00001','INTEG-AXLE',11,9,1,'正常报价','虚构M16乙'],['RFQ-L00002','INTEG-AXLE',None,None,None,'明确未报价','虚构M20明确未报价']])]:
 w=load_workbook(r/'quote.xlsx');s=w.active
 for row in rows:s.append(row)
 w.save(f/('quote-'+key+'.xlsx'))
(f/'match-filled.csv').write_bytes((r/'match.csv').read_bytes()+b'RFQ-L00001,UPDATED-16\r\nRFQ-L00002,UPDATED-20\r\n')
w=load_workbook(r/'material.xlsx');s=w.active;s.append(['BAD-INTEG','虚构非法导入','M0','','','','',1,'','']);w.save(f/'invalid.xlsx')
(f/'valid.csv').write_text('存货编码,存货名称,询价数量,询价单位\r\nCANCEL-CSV,虚构取消,2,件\r\n',encoding='utf-8-sig')
for name,txt in [('D16_A.pdf','INDEPENDENT SYNTHETIC DRAWING M16'),('D20_B.pdf','INDEPENDENT SYNTHETIC DRAWING M20 REV B')]:
 c=canvas.Canvas(str(f/name),pagesize=(360,240));c.drawString(20,180,txt);c.drawString(20,150,'FICTIONAL TEST DATA ONLY');c.save()
print('FICTITIOUS_FIXTURES_CREATED; ACTUAL_TEMPLATE_STRUCTURE_VERIFIED')
