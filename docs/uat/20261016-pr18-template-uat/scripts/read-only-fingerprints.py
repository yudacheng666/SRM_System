from pathlib import Path
import sqlite3,json,hashlib,sys
base=Path(sys.argv[1]);c=sqlite3.connect(f'file:{base}/srm.sqlite3?mode=ro',uri=True);out={'workspaces':{},'pdf':{}}
for ident,rev,s in c.execute('select workspace_id,revision,snapshot_json from workspaces'):
 d=json.loads(s);state=d['state'];out['workspaces'][ident]={'revision':rev,'sha256':hashlib.sha256(s.encode()).hexdigest(),'item_count':len(state['items']),'assignments':state['assignments'],'rounds':state['quoteRounds'],'items':state['items'],'awards':state['awards'],'reasons':state['awardReasons']}
for p in base.rglob('*.pdf'):out['pdf'][str(p.relative_to(base))]=hashlib.sha256(p.read_bytes()).hexdigest()
Path(sys.argv[2]).write_text(json.dumps(out,ensure_ascii=False,indent=2));print({i:{'revision':x['revision'],'items':x['item_count'],'rounds':len(x['rounds'])} for i,x in out['workspaces'].items()},'pdfs',len(out['pdf']))
