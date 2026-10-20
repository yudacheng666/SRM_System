import sqlite3,json,hashlib,sys
from pathlib import Path
r=Path(sys.argv[1]);out=Path(sys.argv[2]);d={'workspaces':{},'pdf':{}}
c=sqlite3.connect(f'file:{r}/srm.sqlite3?mode=ro',uri=True)
for wid,rev,s in c.execute('select workspace_id,revision,snapshot_json from workspaces order by workspace_id'):
 d['workspaces'][wid]={'revision':rev,'sha256':hashlib.sha256(s.encode()).hexdigest(),'snapshot':json.loads(s)};(out.parent/(out.stem+'-'+wid+'-original.json')).write_text(s)
for p in r.rglob('*.pdf'):d['pdf'][str(p.relative_to(r))]=hashlib.sha256(p.read_bytes()).hexdigest()
out.write_text(json.dumps(d,ensure_ascii=False,indent=2))
