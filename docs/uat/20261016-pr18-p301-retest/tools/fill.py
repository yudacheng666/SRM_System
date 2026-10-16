from openpyxl import load_workbook
from pathlib import Path
import json,csv
r=Path('/tmp/srm-p301-downloads');f=Path('/tmp/srm-p301-fixtures');out={}
for name in ['material','supplier','quote']:
 w=load_workbook(r/(name+'.xlsx'));out[name]={'sheets':w.sheetnames,'headers':[c.value for c in w.active[1]],'zip':(r/(name+'.xlsx')).read_bytes()[:4].hex()}
b=(r/'match.csv').read_bytes();out['match']={'bom':b[:3].hex(),'text':b.decode('utf-8-sig')}
Path('/tmp/srm-p301-evidence/template-structure.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
def material(name,rows):
 w=load_workbook(r/'material.xlsx');s=w.active;s.delete_rows(2,s.max_row)
 for code,spec,qty,batch in rows:s.append([code,'虚构验收轴',spec,'测试类别',batch,'','件',qty,'件',''])
 w.save(f/name)
material('material-merge.xlsx',[('AXLE-MERGE','M16',2,'ERP-BATCH-A'),('AXLE-MERGE','M16',3,'ERP-BATCH-A')])
material('material-split.xlsx',[('AXLE-SPLIT','M16',2,'ERP-BATCH-B'),('AXLE-SPLIT','M20',3,'ERP-BATCH-C')])
(f/'valid-material.csv').write_text('存货编码,存货名称,规格型号,询价数量,询价单位\r\nCSV-PREVIEW,虚构CSV预览,M10,2,件\r\n',encoding='utf-8-sig')
w=load_workbook(r/'supplier.xlsx');s=w.active;s.delete_rows(2,s.max_row);s.append(['TEST-CP-A','P301-A','虚构供应商甲']);s.append(['TEST-CP-B','P301-B','虚构供应商乙']);w.save(f/'suppliers-filled.xlsx')
print(json.dumps(out,ensure_ascii=False,indent=2))
