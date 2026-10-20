from pathlib import Path
import csv,json,io,hashlib
r=Path('/tmp/srm-pr20-downloads');e=Path('/tmp/srm-pr20-evidence');meta=[json.loads(x)for x in(e/'actual-downloads.jsonl').read_text().splitlines()];out=[]
for m in meta:
 p=r/(m['tag']+'.csv');raw=p.read_bytes();assert raw[:3]==b'\xef\xbb\xbf';rows=list(csv.reader(io.StringIO(raw.decode('utf-8-sig'),newline='')));h=rows[0];assert len(h)==len(set(h));assert all(len(row)==len(h)for row in rows)
 if m['tag']=='old-original':assert m['filename']=='RFQ-DEMO-001_指定供应商组同范围报价.csv'and h[0]=='RFQ Line ID'and not any(m['id']in str(row)for row in rows)
 else:
  assert m['filename']==m['id']+'_指定供应商组同范围报价.csv';assert h[:6]==['RFQ编号','RFQ Line ID','存货编码','存货名称','询价数量','询价单位'];assert all(row[0]==m['id']for row in rows[1:]);assert rows[-1][1]=='同范围合计'
  if m['formal']:
   assert all(row[1].startswith('RFQ-L')for row in rows[1:-1]);assert rows[1][2][0]=="'"and rows[1][3][0]=="'";assert rows[0][6].startswith("'@");assert '\ufffd'not in str(rows)
  expected=None
  if m['tag'].startswith('new-P1'):expected=['100.00','90.00']if any(x in m['tag']for x in ['R2','switched','F5','restart'])else['340.00','370.00']
  if m['tag'].startswith('new-P2'):expected=['53.00','54.00']
  if expected:assert [rows[-1][7],rows[-1][9]]==expected,(m,rows[-1]);assert all(float(x[7])==round(float(x[4])*float(x[6]),2)and float(x[9])==round(float(x[4])*float(x[8]),2)for x in rows[1:-1]);assert round(sum(float(x[7])for x in rows[1:-1]),2)==float(rows[-1][7]);assert round(sum(float(x[9])for x in rows[1:-1]),2)==float(rows[-1][9])
 out.append({**m,'bom':raw[:3].hex(),'sha256':hashlib.sha256(raw).hexdigest(),'rows':rows,'parse':'PASS'})
by={x['tag']:x for x in out}
if 'new-P1-R1'in by:assert by['old-original']['rows']==[row[1:]for row in by['new-P1-R1']['rows']]
if 'new-P2-first'in by:
 id1=by['new-P1-R1']['id'];id2=by['new-P2-first']['id'];assert id1!=id2
 for x in out:
  if x['formal']and x['tag']!='old-original':assert (id2 if x['id']==id1 else id1)not in str(x['rows'])
(e/'independent-csv-parsed.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print('ACTUAL_CSV_PARSE_PASS',len(out),'downloads; original reproduced; candidate headers/IDs/amounts/safety checked')
