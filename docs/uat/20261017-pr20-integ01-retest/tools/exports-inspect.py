from pathlib import Path
from openpyxl import load_workbook
import csv,json,io
r=Path('/tmp/srm-pr20-downloads');out={}
for vendor in ['A','B']:
 p=r/('supplier-RET-'+vendor+'.xlsx');w=load_workbook(p,data_only=False);rows=list(w.active.values);h=rows[0];txt=str(rows);assert all(x not in txt for x in ['PRIVATE-','RAW-SECRET-',('虚构复验乙'if vendor=='A'else'@虚构复验甲'),'carryFrom','原始来源']);assert [row[h.index('RFQ Line ID')]for row in rows[1:]]==['RFQ-L00001','RFQ-L00002','RFQ-L00003'];price=[i for i,x in enumerate(h)if x and('报价单价'in str(x)or str(x)=='单价')];assert price;assert all(row[i]in [None,'']for row in rows[1:]for i in price);assert not any(c.data_type=='f'for s in w for row in s for c in row);out[p.name]={'headers':h,'rows':rows,'price_blank':True,'private_data_absent':True,'no_formula_cells':True}
w=load_workbook(r/'internal-business.xlsx',data_only=True);out['internal-business.xlsx']={s.title:list(s.values)for s in w};rows=out['internal-business.xlsx']['询价物料'];h=rows[0];assert len(h)==len(set(h));assert [row[h.index('虚构ERP扩展')]for row in rows[1:]]==['RAW-SECRET-2','RAW-SECRET-3','RAW-SECRET-4']
raw=(r/'missing-P1-R2.csv').read_bytes();assert raw[:3]==b'\xef\xbb\xbf';rows=list(csv.reader(io.StringIO(raw.decode('utf-8-sig'),newline='')));h=rows[0];assert h[0]=='RFQ编号';assert rows[1][0]=='RFQ-1792167523958-FXPI8N';assert rows[1][h.index('RFQ Line ID')]=='RFQ-L00002';assert rows[1][h.index('报价轮次')]=='2';out['missing-P1-R2.csv']={'rows':rows,'formal_id_present':True}
Path('/tmp/srm-pr20-evidence/related-exports-inspection.json').write_text(json.dumps(out,ensure_ascii=False,indent=2,default=str));print('RELATED_EXPORTS_PASS; private ERP isolated; blank vendor prices; XLSX no formulas; missing CSV formal ID preserved')
