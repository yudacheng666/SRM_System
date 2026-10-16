from pathlib import Path
import openpyxl,csv,io,shutil,json
r=Path('/tmp/srm-pr18-fixtures');d=Path('/tmp/srm-pr18-downloads')
def filled(kind,name,rows,extra=None):
 w=openpyxl.load_workbook(d/('formal-'+kind+'.xlsx'));s=w.active
 if extra:s.cell(1,s.max_column+1,extra)
 for row in rows:s.append(row)
 w.save(r/name)
filled('materials','materials-filled.xlsx',[
 ['TPL-001','虚构模板轴','M16','机械件','TPL-REF1','TPL-REF2','盒',5,'件','DRAW-TPL-A','内部批次A'],
 ['TPL-001','虚构模板轴','M20','机械件','TPL-REF1','TPL-REF2','盒',4,'件','DRAW-TPL-B','内部批次B']], 'ERP批次属性')
filled('suppliers','suppliers-filled.xlsx', [['CP-TPL-A','TPL-A','虚构模板甲'],['CP-TPL-B','','虚构模板乙']])
filled('quotes','A-quotes-filled.xlsx', [['RFQ-L00001','TPL-001',12.5,3,1,'正常报价','虚构M16含税12.5元'],['RFQ-L00002','TPL-001',None,None,None,'不供货','虚构M20暂停供货']])
filled('quotes','B-quotes-filled.xlsx', [['RFQ-L00001','TPL-001',14,5,1,'正常报价','虚构乙M16十四元'],['RFQ-L00002','TPL-001',22,6,1,'正常报价','虚构乙M20二十二元']])
filled('quotes','quote-code-only-ambiguous.xlsx', [['','TPL-001',1,1,1,'正常报价','虚构不得猜测规格']])
filled('suppliers','supplier-duplicate-existing.xlsx', [['CP-TPL-A','TPL-A','虚构模板甲']])
filled('suppliers','supplier-missing-required.xlsx', [['','','虚构缺编码供应商']])
filled('suppliers','supplier-duplicate-file.xlsx', [['DUP-CP','DUP-SUP','虚构重复一'],['DUP-CP','DUP-SUP','虚构重复二']])
# Fill the real CSV template while retaining its BOM and standard first row.
head=list(csv.reader(io.StringIO((d/'formal-update.csv').read_bytes().decode('utf-8-sig'))))[0]
for name,rows,usehead in [('update-filled.csv',[['M16','TPL-NEW16'],['M20','TPL-NEW20']],True),('update-headerless.csv',[['M16','TPL-LEGACY16'],['M20','TPL-LEGACY20']],False)]:
 with (r/name).open('w',encoding='utf-8-sig',newline='') as f:csv.writer(f).writerows(([head] if usehead else [])+rows)
def book(name,sheets):
 w=openpyxl.Workbook();w.remove(w.active)
 for title,rows in sheets:
  s=w.create_sheet(title)
  for row in rows:s.append(row)
 w.save(r/name)
book('wrong-header.xlsx',[('错误表',[['完全无关列','备注'],['虚构值','不得导入']])])
book('missing-unit.xlsx',[('询价物料',[['存货编码','询价数量'],['BAD-NO-UNIT',1]])])
book('duplicate-heading.xlsx',[('询价物料',[['存货编码','存货编码','询价数量','询价单位'],['A','B',1,'件']])])
book('other-sheet.xlsx',[('说明',[['说明','备注'],['这里是虚构说明页','没有业务表']])])
rows=[['存货编码','询价数量','询价单位'],['BAD-MULTI',1,'件']]
book('ambiguous-multisheet.xlsx',[('数据甲',rows),('数据乙',rows)])
book('blank-workbook.xlsx',[('空表',[])])
(r/'corrupt.xlsx').write_bytes(b'SYNTHETIC NOT AN XLSX ZIP');(r/'zero-byte.xlsx').write_bytes(b'')
book('supplier-wrong-headers.xlsx',[('供应商',[['错误编码','错误名称'],['虚构','不能导入']])])
book('quotes-wrong-headers.xlsx',[('供应商报价',[['错行号','错单价'],['RFQ-L00001',999]])])
print('Actual downloaded templates filled; negative fixtures prepared')
