from pathlib import Path
from openpyxl import Workbook
import csv,hashlib,json
r=Path('/tmp/srm-pr15-fixtures')
head=['存货编码','存货名称','规格型号','所属类别','参考编码1','参考编码2','采购常用单位','询价数量','询价单位','ERP批次属性']
rows=[['TEST-001','虚构轴','M16','机械件','R-100','R-200','盒',2,'件','内部标签A'],['TEST-001','虚构轴','M16','机械件','R-100','R-200','盒',3,'件','内部标签A'],['TEST-001','虚构轴','M20','机械件','R-100','R-200','盒',4,'件','内部标签A'],['TEST-002','虚构支架','板厚4','钣金件','R-101','','件',6,'件','内部标签B']]
def xlsx(name,rs):
 w=Workbook();s=w.active;s.title='云端虚构采购';
 for row in rs:s.append(row)
 w.save(r/name)
def csvfile(name,rs):
 with (r/name).open('w',newline='',encoding='utf-8') as f: csv.writer(f).writerows(rs)
xlsx('task-materials.xlsx',[head]+rows);csvfile('task-materials.csv',[head]+rows)
xlsx('suppliers.xlsx',[['往来单位编码','供应商编码','往来单位名称'],['CLOUD-CP-A','CLOUD-A','虚构供应甲'],['CLOUD-CP-B','CLOUD-B','虚构供应乙'],['CLOUD-CP-C','CLOUD-C','虚构供应丙']])
csvfile('alias-conflict.csv',[['存货编码','物料编码','存货名称','询价数量','询价单位'],['TEST-A','TEST-B','虚构冲突件',1,'件']])
csvfile('extra-conflict.csv',[head,rows[3][:-1]+['内部标签C']])
wide={}
for width in (233,256,257):
 hs=head+[f'未映射ERP列{i:03}' for i in range(1,width-len(head)+1)]
 vals=[f'WIDE-{width}','虚构宽表件',f'W{width}','宽表验证','仅内部REF1','仅内部REF2','箱',1,'件','内部宽表标签']+[f'虚构原值{width}-{i:03},保留Ω' for i in range(1,width-len(head)+1)]
 xlsx(f'wide-{width}.xlsx',[hs,vals]);wide[str(width)]=dict(zip(hs,vals))
(r/'wide-expected.json').write_text(json.dumps(wide,ensure_ascii=False,indent=2))
def pdf(name,label):
 objs=[b'<< /Type /Catalog /Pages 2 0 R >>',b'<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>']
 for pg in (1,2):
  data=f'BT /F1 12 Tf 20 100 Td ({label} Synthetic Page {pg}) Tj ET'.encode()
  content=4 if pg==1 else 6
  objs += [f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 240 180] /Resources << /Font << /F1 7 0 R >> >> /Contents {content} 0 R >>'.encode(),b'<< /Length '+str(len(data)).encode()+b' >>\nstream\n'+data+b'\nendstream']
 objs.append(b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');raw=b'%PDF-1.4\n';offs=[0]
 for i,o in enumerate(objs,1):offs.append(len(raw));raw+=f'{i} 0 obj\n'.encode()+o+b'\nendobj\n'
 start=len(raw);raw+=b'xref\n0 8\n0000000000 65535 f \n'+b''.join(f'{x:010} 00000 n \n'.encode() for x in offs[1:])+f'trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n{start}\n%%EOF\n'.encode();(r/name).write_bytes(raw)
for name,label in [('TEST-001_A.pdf','M16 REV A'),('TEST-001_B.pdf','M16 REV B'),('TEST-002_A.pdf','BRACKET REV A'),('unmatched.pdf','UNMATCHED REQUIRES REVIEW')]:pdf(name,label)
(r/'broken.zip').write_bytes(b'NOT A ZIP SYNTHETIC ONLY')
(r/'input-hashes.json').write_text(json.dumps({p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in r.iterdir() if p.suffix in ['.pdf','.xlsx','.csv']},indent=2))
print('Synthetic fixtures ready')
