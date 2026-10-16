from pathlib import Path
import zipfile,openpyxl,csv,io,json,hashlib
r=Path('/tmp/srm-pr18-downloads');out=[]
expected={'materials':('询价物料',['存货编码','存货名称','规格型号','所属类别','参考编码1','参考编码2','采购常用单位','询价数量','询价单位','图号']),'suppliers':('供应商',['往来单位编码','供应商编码','往来单位名称']),'quotes':('供应商报价',['RFQ Line ID','存货编码','报价单价','交期','MOQ','报价状态','物料备注'])}
for prefix in ['demo','formal','populated']:
 for kind,(sheet,head) in expected.items():
  p=r/(prefix+'-'+kind+'.xlsx')
  if not p.exists():continue
  with zipfile.ZipFile(p) as z:assert z.testzip() is None;assert '[Content_Types].xml' in z.namelist();assert not any('vba' in n.lower() for n in z.namelist())
  w=openpyxl.load_workbook(p);assert w.sheetnames==[sheet];s=w.active;assert s.sheet_state=='visible';assert list(s.values)==[tuple(head)];assert len(head)==len(set(head));assert not w._external_links
  out.append({'file':p.name,'result':'PASS','format':'genuine XLSX / OOXML ZIP','sheets':w.sheetnames,'visible':True,'rows':s.max_row,'headings':head,'hidden_sheets':0,'business_rows':0,'external_links':0,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 p=r/(prefix+'-update.csv')
 if p.exists():
  raw=p.read_bytes();assert raw.startswith(b'\xef\xbb\xbf');rows=list(csv.reader(io.StringIO(raw.decode('utf-8-sig'))));assert rows==[['匹配值','新值']];out.append({'file':p.name,'result':'PASS','format':'UTF-8 BOM CSV','bom':raw[:3].hex(),'rows':rows,'sha256':hashlib.sha256(raw).hexdigest()})
p=r/'keyboard-suppliers.xlsx'
if p.exists():
 w=openpyxl.load_workbook(p);assert w.sheetnames==['供应商'] and list(w.active.values)==[tuple(expected['suppliers'][1])];out.append({'file':p.name,'result':'PASS','format':'genuine XLSX / keyboard Enter download','sheets':w.sheetnames,'rows':1,'headings':expected['suppliers'][1],'business_rows':0,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
for info in out:
 p=r/info['file'];raw=p.read_bytes()
 if p.suffix=='.xlsx':
  with zipfile.ZipFile(p) as z:raw=b' '.join(z.read(n) for n in z.namelist())
 for token in ['TPL-001','虚构模板甲','虚构模板乙','内部批次A','ERP批次属性','TPL-LEGACY16','RFQ-L00001']:
  assert token.encode('utf-8') not in raw,(p.name,token)
 info['confidential_markers_absent']=True
Path('/tmp/srm-pr18-evidence/template-file-checks.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print('Checked actual downloads:',len(out))
