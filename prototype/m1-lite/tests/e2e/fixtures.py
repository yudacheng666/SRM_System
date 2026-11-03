"""中文：只生成确定性的虚构 XLSX 与有效多页 PDF。
English: Generate deterministic synthetic XLSX and valid multipage PDFs only.
"""
import sys, zipfile
from pathlib import Path
from xml.sax.saxutils import escape
root = Path(sys.argv[1]); root.mkdir(parents=True, exist_ok=True)
def xlsx(name, rows):
    cells = ''.join('<row r="%s">%s</row>' % (i, ''.join('<c r="%s%s" t="inlineStr"><is><t>%s</t></is></c>' % (chr(65+j), i, escape(str(v))) for j,v in enumerate(row))) for i,row in enumerate(rows,1))
    with zipfile.ZipFile(root/name,'w',zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>')
        z.writestr('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        z.writestr('xl/workbook.xml','<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Synthetic" sheetId="1" r:id="rId1"/></sheets></workbook>')
        z.writestr('xl/_rels/workbook.xml.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>')
        z.writestr('xl/worksheets/sheet1.xml','<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+cells+'</sheetData></worksheet>')
header=['存货编码','存货名称','所属类别','询价数量','询价单位']
rows=[[f'TST-{i:03}',f'虚构物料{i}','虚构类别',i+1,'件'] for i in range(1,13)]
xlsx('items12.xlsx',[header]+rows)
xlsx('items100.xlsx',[header]+[[f'BIG-{i:03}',f'虚构批量物料{i}','虚构类别',2,'件'] for i in range(1,101)])
xlsx('duplicates.xlsx',[header,rows[0],rows[0]])
xlsx('invalid.xlsx',[header,['BAD-001','虚构异常','虚构类别','not-a-number','件']])
xlsx('suppliers.xlsx',[['往来单位编码','供应商编码','往来单位名称'],['CP-A','SUP-A','虚构供应商A'],['CP-B','SUP-B','虚构供应商B']])
# 中文：ERP 核心及原始附加列仅使用虚构编码，验证不丢字段和同码不同规格不合并。
# English: Synthetic ERP source columns test core mapping, raw retention and collision-safe merging.
erp_header=['存货编码','存货名称','规格型号','所属类别','参考编码1','参考编码2','采购常用单位','询价数量','询价单位','ERP批次属性']
xlsx('erp_items.xlsx',[erp_header,
 ['ERP-A1','虚构电机','120W','机加工','OLD-A','ALT-A','套',10,'件','内部批次A'],
 ['ERP-A1','虚构电机','220W','机加工','OLD-A','ALT-A','套',3,'件','内部批次A'],
 ['ERP-B2','虚构轴套','M16','标准件','OLD-B','ALT-B','个',2,'个','内部批次B']])
xlsx('erp_alias_conflict.xlsx',[['存货编码','物料编码','存货名称','询价数量','询价单位'],
 ['ERP-A1','CONFLICT-ID','虚构冲突物料',1,'件']])

xlsx('quotes.xlsx',[['存货编码','报价单价','交期','MOQ','报价状态','物料备注'],['TST-001','1-9:17.25|10+:16.5',7,1,'正常报价','虚构阶梯报价'],['TST-002','23.75',9,1,'正常报价','虚构报价'],['UNKNOWN','1',1,1,'正常报价','拒绝多报']])
def pdf(name, label):
    objs=[b'<< /Type /Catalog /Pages 2 0 R >>',b'<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>']
    for page in (1,2):
        stream=f'BT /F1 12 Tf 30 100 Td ({label} page {page}) Tj ET'.encode()
        content=4 if page==1 else 6
        objs += [f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << /Font << /F1 7 0 R >> >> /Contents {content} 0 R >>'.encode(), b'<< /Length '+str(len(stream)).encode()+b' >>\nstream\n'+stream+b'\nendstream']
    objs.append(b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
    raw=b'%PDF-1.4\n'; offsets=[0]
    for i,obj in enumerate(objs,1): offsets.append(len(raw)); raw+=f'{i} 0 obj\n'.encode()+obj+b'\nendobj\n'
    start=len(raw); raw+=b'xref\n0 8\n0000000000 65535 f \n'+b''.join(f'{o:010} 00000 n \n'.encode() for o in offsets[1:])+f'trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n{start}\n%%EOF\n'.encode()
    (root/name).write_bytes(raw)
pdf('TST-001_A.pdf','Synthetic A'); pdf('unmatched.pdf','Synthetic B')
(root/'bad.pdf').write_bytes(b'invalid PDF')
(root/'broken.zip').write_bytes(b'invalid ZIP')
