from pathlib import Path
import sys,sqlite3,json,hashlib
root=Path(sys.argv[1]);outpath=Path(sys.argv[2]);c=sqlite3.connect(f'file:{root}/srm.sqlite3?mode=ro',uri=True);out={'workspaces':{},'pdf':{}}
for i,rev,s in c.execute('select workspace_id,revision,snapshot_json from workspaces order by workspace_id'):
 d=json.loads(s);state=d['state'];out['workspaces'][i]={'revision':rev,'lineSeq':state.get('lineSeq'),'createdSeq':state.get('createdSeq'),'item_count':len(state['items']),'assignments':state['assignments'],'sha256':hashlib.sha256(s.encode()).hexdigest(),'state':state};(outpath.parent/(outpath.stem+'-'+i+'-original.json')).write_text(s)
for p in root.rglob('*.pdf'):out['pdf'][str(p.relative_to(root))]=hashlib.sha256(p.read_bytes()).hexdigest()
outpath.write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps({i:{k:v[k] for k in ['revision','lineSeq','createdSeq','item_count','sha256']} for i,v in out['workspaces'].items()},ensure_ascii=False))
