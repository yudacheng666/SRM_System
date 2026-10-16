from pathlib import Path
import openpyxl,sys,json
name=sys.argv[1];src=Path('/tmp/srm-pr16-downloads')/(name+'.xlsx');w=openpyxl.load_workbook(src);s=w['询价物料'];rows=list(s.values);out=Path('/tmp/srm-pr16-fixtures')/(name+'-single.xlsx');n=openpyxl.Workbook();ss=n.active;ss.title='询价物料'
for row in rows:ss.append(row)
n.save(out)
info={'workbook':src.name,'single_sheet':out.name,'headings':list(rows[0]),'columns':len(rows[0]),'rows':len(rows)-1,'identity_columns':{str(i+1):h for i,h in enumerate(rows[0]) if h and 'RFQ Line ID' in h},'identities':[[row[i] for i,h in enumerate(rows[0]) if h and 'RFQ Line ID' in h] for row in rows[1:]],'duplicate_headings':[h for h in rows[0] if rows[0].count(h)>1]};Path('/tmp/srm-pr16-evidence',name+'-inspection.json').write_text(json.dumps(info,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in info.items() if k!='headings'},ensure_ascii=False))
