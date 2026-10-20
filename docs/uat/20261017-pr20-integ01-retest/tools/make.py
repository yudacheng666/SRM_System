from pathlib import Path
from openpyxl import load_workbook
from reportlab.pdfgen import canvas
r=Path('/tmp/srm-integration-downloads');f=Path('/tmp/srm-pr20-fixtures')
for project in [1,2]:
 w=load_workbook(r/'material.xlsx');s=w.active
 rows=[['+RET-AXLE','=1+1,虚构"轴"\n第二行','M16','测试','PRIVATE-REF16','PRIVATE-16','盒',10,'件','D16'],['+RET-AXLE','=1+1,虚构"轴"\n第二行','M20','测试','PRIVATE-REF20','PRIVATE-20','盒',20,'件','D20'],['RET-BRACKET','虚构不供货支架','M24','测试','PRIVATE-REF24','PRIVATE-24','箱',5,'件','D24']]if project==1 else [['-P2-CODE','+第二项目,中文"测试"','M16','测试','P2-PRIVATE16','','盒',3,'件',''],['-P2-CODE','+第二项目,中文"测试"','M20','测试','P2-PRIVATE20','','盒',4,'件','']]
 for row in rows:s.append(row)
 s.cell(1,11,'虚构ERP扩展')
 for i in range(2,s.max_row+1):s.cell(i,11,'RAW-SECRET-'+str(i))
 w.save(f/('P'+str(project)+'-materials.xlsx'))
 w=load_workbook(r/'supplier.xlsx');s=w.active;s.append(['RET-CP-A','RET-A','@虚构复验甲']);s.append(['RET-CP-B','RET-B','虚构复验乙']);w.save(f/'suppliers.xlsx')
 for vendor in ['A','B']:
  w=load_workbook(r/'quote.xlsx');s=w.active
  prices=([10,12,None]if vendor=='A'else[11,13,None])if project==1 else([7,8]if vendor=='A'else[6,9])
  for i,price in enumerate(prices,1):s.append(['RFQ-L'+str(i).zfill(5),rows[i-1][0],price,7 if price is not None else None,1 if price is not None else None,'正常报价'if price is not None else('不供货'if vendor=='A'else'未报价'),'虚构报价'+vendor])
  w.save(f/('P'+str(project)+'-quote-'+vendor+'.xlsx'))
for name in ['D16_A.pdf','D20_B.pdf']:
 c=canvas.Canvas(str(f/name),pagesize=(360,240));c.drawString(20,180,'SYNTHETIC PR20 '+name);c.drawString(20,150,'INDEPENDENT RETEST ONLY');c.save()
print('NEW_SYNTHETIC_FIXTURES_READY')
