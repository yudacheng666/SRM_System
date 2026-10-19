from openpyxl import Workbook
from pathlib import Path
p=Path('/tmp/p24/fixtures')
def book(n,rows):
 w=Workbook();s=w.active
 for row in rows:s.append(row)
 for row in s:
  for c in row:
   if isinstance(c.value,str):c.data_type='s'
 w.save(p/n)
book('materials.xlsx',[['存货编码','存货名称','规格型号','询价数量','询价单位','所属类别','图号','虚构ERP备注'],['UAT24-SHAFT','虚构采购轴：同编码规格区分','M16 / 220 mm',10,'件','机加工','U24-D16','ANON-ERP-01'],['UAT24-SHAFT','虚构采购轴：同编码规格区分','M20 / 350 mm',25,'件','机加工','U24-D20','ANON-ERP-02'],['UAT24-BASE','虚构不供货底座','L型 90×120',4,'件','钣金','U24-BASE','ANON-ERP-03']])
book('suppliers.xlsx',[['供应商编码','往来单位编码','往来单位名称'],['U24-A','U24-CP-A','虚构甲方精密制造有限公司'],['U24-B','U24-CP-B','虚构乙方，快速交付测试供应商']])
for vendor,prices in [('A',[10,20,None]),('B',[12,18,None])]:
 book('quote-'+vendor+'.xlsx',[['RFQ Line ID','报价单价','交期','MOQ','报价状态','物料备注']]+[[f'RFQ-L{i+1:05}',v,10 if vendor=='A'else 4,1,'正常报价'if v is not None else('不供货'if vendor=='A'else'未报价'),'虚构报价凭证']for i,v in enumerate(prices)])
objs=[b'<< /Type /Catalog /Pages 2 0 R >>',b'<< /Type /Pages /Count 1 /Kids [3 0 R] >>',b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',b'<< /Length 43 >>\nstream\nBT /F1 12 Tf 20 100 Td (FICTIONAL U24) Tj ET\nendstream']
raw=b'%PDF-1.4\n';offsets=[0]
for i,obj in enumerate(objs,1):offsets.append(len(raw));raw+=f'{i} 0 obj\n'.encode()+obj+b'\nendobj\n'
o=len(raw);raw+=b'xref\n0 6\n0000000000 65535 f \n'+b''.join(f'{x:010} 00000 n \n'.encode()for x in offsets[1:])+f'trailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n{o}\n%%EOF\n'.encode();(p/'U24-D16_A.pdf').write_bytes(raw)
