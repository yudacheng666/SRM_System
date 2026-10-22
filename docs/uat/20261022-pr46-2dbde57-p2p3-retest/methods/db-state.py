from pathlib import Path
import sys,sqlite3,json,hashlib
root=Path(sys.argv[1]);out=Path(sys.argv[2]);d={'tables':{},'pdf':{}};c=sqlite3.connect('file:'+str(root/'srm.sqlite3')+'?mode=ro',uri=True)
for t in ['app_state','workspaces','workspace_versions','assets']:
 cols=[x[1]for x in c.execute('pragma table_info('+t+')')];rows=list(c.execute('select * from '+t));rows.sort(key=lambda r:json.dumps(r,ensure_ascii=False));d['tables'][t]={'columns':cols,'rows':rows}
for p in sorted(root.rglob('*.pdf')):d['pdf'][str(p.relative_to(root))]=hashlib.sha256(p.read_bytes()).hexdigest()
out.write_text(json.dumps(d,ensure_ascii=False,indent=2))
