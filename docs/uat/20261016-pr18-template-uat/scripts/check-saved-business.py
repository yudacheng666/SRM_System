from pathlib import Path
import json,openpyxl,hashlib
r=Path('/tmp/srm-pr18-evidence');before=next(iter(json.loads((r/'B-before-A.json').read_text())['workspaces'].values()));after=next(iter(json.loads((r/'primary-final-state.json').read_text())['workspaces'].values()));b0=next(x for x in before['rounds'] if x['supplierId']=='CP-TPL-B');b1=next(x for x in after['rounds'] if x['supplierId']=='CP-TPL-B');assert b0==b1
items={x['spec']:x for x in after['items']};assert len(items)==2 and items['M16']['qty']==5 and items['M20']['qty']==4
assert items['M16']['erpExtra']['ERP批次属性']=='内部批次A' and items['M20']['erpExtra']['ERP批次属性']=='内部批次B';assert items['M16']['ref2']=='TPL-LEGACY16' and items['M20']['ref2']=='TPL-LEGACY20';assert items['M16']['drawingNo']=='DRAW-TPL-A' and items['M20']['drawingNo']=='DRAW-TPL-B'
a=next(x for x in after['rounds'] if x['supplierId']=='TPL-A' and x['roundNo']==1);assert a['status']=='confirmed';ls={x['lineId']:x for x in a['lines']};assert ls['RFQ-L00001']['price']==12.5 and ls['RFQ-L00001']['status']=='quoted';assert ls['RFQ-L00002']['price'] is None and ls['RFQ-L00002']['status']=='cannot'
assert len(after['items'])==2;sup={s['id']:s for s in json.loads((r/'primary-final-state.json').read_text())['workspaces'][next(iter(json.loads((r/'primary-final-state.json').read_text())['workspaces']))].get('suppliers',[])}
# fingerprint records focus on quotes/items; supplier details read from the actual exported workbook.
w=openpyxl.load_workbook('/tmp/srm-pr18-downloads/main-final-business.xlsx');ss=list(w['供应商'].values);assert ss[1:]==[('CP-TPL-A','TPL-A','虚构模板甲'),('CP-TPL-B','CP-TPL-B','虚构模板乙')];print('Supplier export',ss)
f=openpyxl.load_workbook('/tmp/srm-pr18-downloads/F1-roundtrip-business.xlsx');s=f['询价物料'];rows=list(s.values);h=list(rows[0]);assert len(h)==len(set(h));assert h.count('RFQ Line ID')==h.count('来源 RFQ Line ID')==1
original=list(w['询价物料'].values);oh=list(original[0]);
for x,y in zip(original[1:],rows[1:]):
 for name in oh:assert x[oh.index(name)]==y[h.index(name)],name
assert f['报价明细'].max_row==1 and f['供应商'].max_row==1
out={'result':'PASS','business_rows':2,'item_ids':{k:v['lineId'] for k,v in items.items()},'B_confirmed_history_exactly_unchanged':True,'A_quoted_line':ls['RFQ-L00001'],'A_cannot_line':ls['RFQ-L00002'],'ERP_extra_and_drawing_numbers_preserved':True,'CSV_final_ref2':{k:v['ref2'] for k,v in items.items()},'B_supplied_prices':[x['price'] for x in b1['lines']],'suppliers_export_rows':ss,'expected_A_total':12.5*5,'expected_B_total':14*5+22*4,'expected_lowest_total':12.5*5+22*4,'F1':{'columns':len(h),'current_column':h.index('RFQ Line ID')+1,'source_column':h.index('来源 RFQ Line ID')+1,'headings_unique':True,'all_exported_material_values_retained':True,'new_RFQ_quotes':0,'new_RFQ_suppliers':0}}
(r/'independent-business-checks.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print('Business XLSX/SQLite independent checks PASS',out['F1'])
