from pathlib import Path
import sqlite3,json,hashlib
r=Path('/tmp/srm-pr18-evidence');ident='RFQ-1792144021470-FB2S8V';c=sqlite3.connect('file:/tmp/srm-pr18-probe-data/srm.sqlite3?mode=ro',uri=True)
rs=list(c.execute('select revision,snapshot_json from workspace_versions where workspace_id=? order by revision',(ident,)));assert [x[0] for x in rs]==[1,2]
a,b=[json.loads(s) for _,s in rs];diff={k:[a['state'][k],b['state'][k]] for k in a['state'] if a['state'][k]!=b['state'][k]};assert diff=={'lineSeq':[0,1]};assert a['state']['items']==b['state']['items']==[] and a['state']['quoteRounds']==b['state']['quoteRounds']==[]
for rev,s in rs:(r/f'invalid-preview-rev{rev}-original.json').write_text(s)
out={'rfq':ident,'before_revision':1,'after_revision':2,'before_items':0,'after_items':0,'state_differences':diff,'original_snapshot_sha256':{str(rev):hashlib.sha256(s.encode()).hexdigest() for rev,s in rs},'result':'FAIL: invalid preview changes saved lineSeq/revision without confirmed import'};(r/'invalid-preview-state-comparison.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(out)
