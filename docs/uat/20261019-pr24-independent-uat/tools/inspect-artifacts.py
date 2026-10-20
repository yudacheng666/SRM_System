from pathlib import Path
from io import StringIO
from decimal import Decimal
from openpyxl import load_workbook
import json,csv,zipfile,hashlib,sqlite3,re,subprocess
r=Path('/tmp/p24');out={}
s=json.loads((r/'evidence/11-two-RFQ-final.json').read_text());wid=next(k for k,v in s['workspaces'].items()if len(v['snapshot']['state']['items'])==3);state=s['workspaces'][wid]['snapshot']['state']
assert len(state['suppliers'])==2 and len(state['quoteRounds'])==3
assert all(x['status']=='confirmed'for x in state['quoteRounds']);assert len(state['awardReasons'])==1
raw=(r/'downloads/common-scope.csv').read_bytes();assert raw[:3]==b'\xef\xbb\xbf';rows=list(csv.reader(StringIO(raw.decode('utf-8-sig'),newline='')));assert rows[0][:2]==['RFQ编号','RFQ Line ID'];assert all(x[0]==wid for x in rows[1:]);assert rows[-1][7]=='590.00'and rows[-1][9]=='570.00';assert len(rows)==4
for col in [7,9]:assert sum(Decimal(x[col])for x in rows[1:-1])==Decimal(rows[-1][col])
for x in rows[1:-1]:
 for p,a in [(6,7),(8,9)]:assert Decimal(x[4])*Decimal(x[p])==Decimal(x[a])
out['CSV']={'PASS':True,'rows':rows,'BOM':'efbbbf','sha256':hashlib.sha256(raw).hexdigest()}
w=load_workbook(r/'downloads/business.xlsx',data_only=False);assert w.sheetnames==['询价物料','供应商','报价明细'];assert w['询价物料'].max_row==4 and w['供应商'].max_row==3 and w['报价明细'].max_row==10;assert [x[-1]for x in list(w['询价物料'].values)[1:]]==['ANON-ERP-01','ANON-ERP-02','ANON-ERP-03'];out['business']={s.title:list(s.values)for s in w}
w=load_workbook(r/'downloads/comparison-report.xlsx',data_only=False);assert w.sheetnames==['比价汇总','报价议价明细'];sht=w['比价汇总'];rows=list(sht.values);h=rows[0];assert len(h)==len(set(h));assert rows[1][h.index('选择供应商适用单价')]==12 and rows[2][h.index('选择供应商适用单价')]==18;assert rows[1][h.index('非最低价选择原因')]=='虚构采购决策：乙方4天交付满足测试项目期限';assert rows[3][h.index('最低适用单价')]is None and rows[3][h.index('选择供应商适用单价')]is None
for row in [2,3]:
 assert sht[f'R{row}'].value==f'=ROUND(Q{row}*C{row},2)'and sht[f'U{row}'].value==f'=ROUND(T{row}*C{row},2)'
assert sht['R5'].value=='=SUMIF(K2:K4,"是",R2:R4)'and sht['U5'].value=='=SUMIF(K2:K4,"是",U2:U4)';assert sum(Decimal(str(sht[f'Q{x}'].value))*Decimal(str(sht[f'C{x}'].value))for x in [2,3])==590;assert sum(Decimal(str(sht[f'T{x}'].value))*Decimal(str(sht[f'C{x}'].value))for x in [2,3])==570;assert sum(Decimal(str(sht[f'L{x}'].value))*Decimal(str(sht[f'C{x}'].value))for x in [2,3])==540
out['comparison']={'PASS':True,'sheets':{s.title:list(s.values)for s in w},'independent_totals':{'A':590,'B':570,'lowest':540,'awarded':570},'native_Excel_recalculation':'NOT TESTED; formulas and input arithmetic inspected'}
w=load_workbook(r/'downloads/material-template.xlsx');assert len(w.sheetnames)==1 and w.active.max_row==1;assert list(w.active.values)[0]==('存货编码','存货名称','规格型号','所属类别','参考编码1','参考编码2','采购常用单位','询价数量','询价单位','图号');out['template']={'PASS':True,'header':list(w.active.values)[0],'note':'Download/header check only; full template round-trip was not repeated this task.'}
with zipfile.ZipFile(r/'downloads/full-S4.zip')as z:
 assert z.testzip()is None;p=r/'backup-inspection.sqlite3';p.write_bytes(z.read('database/srm.sqlite3'));c=sqlite3.connect(f'file:{p}?mode=ro',uri=True);assert c.execute('pragma integrity_check').fetchone()[0]=='ok';assert c.execute('select count(*)from workspaces').fetchone()[0]==2;c.close();pdf=[x for x in z.namelist()if x.endswith('.pdf')];assert len(pdf)==1 and z.read(pdf[0])==(r/'fixtures/U24-D16_A.pdf').read_bytes();out['backup']={'PASS':True,'files':z.namelist(),'sqlite_integrity':'ok','RFQ_count':2,'pdf_byte_equality':True}
checks={}
for phase in ['12-after-backup','13-real-restart','14-restored','15-restore-refused','16-invalid-preview','17-preview-cancelled','18-final','20-main-after-PDF']:
 p=r/'evidence'/(phase+'.json')
 if p.exists():assert json.loads(p.read_text())==s;checks[phase]=True
for p in (r/'evidence').glob('*.json'):
 if p.name.endswith('-original.json'):continue
 d=json.loads(p.read_text())
 if not isinstance(d,dict)or 'workspaces'not in d:continue
 for k,v in d['workspaces'].items():assert hashlib.sha256((p.parent/(p.stem+'-'+k+'-original.json')).read_bytes()).hexdigest()==v['sha256']
out['state_equality']=checks
(r/'evidence/artifact-inspection.json').write_text(json.dumps(out,ensure_ascii=False,indent=2,default=str));print('ARTIFACT_INSPECTION_PASS: CSV, 3-sheet workbook, comparison formulas/awards, template, SQLite/PDF backup, raw snapshot hashes and state equality')
repo='/tmp/srm-pr24';base='457edcf4214220deacb4288b372ea78f144e5333';head='67b1a7625db229e36ef4054127539e830d12079f'
def git(*args):return subprocess.check_output(['git','-C',repo,*args],text=True)
html=Path(repo+'/prototype/m1-lite/index.html').read_text();block=re.findall(r'<style id="ui-v3-integration-styles">(.*?)</style>',html,re.S);assert len(block)==1 and '@import'not in block[0] and 'url('not in block[0]
changed=git('diff','--name-only',base,head).splitlines();assert not any(x.startswith('prototype/m1-lite/backend/')or x in ['package.json','package-lock.json']for x in changed)
(r/'evidence/source-integration-audit.json').write_text(json.dumps({'head':head,'base':base,'changed_files':changed,'embedded_V3_style_blocks':1,'new_V3_external_URL_or_import':False,'backend_and_routes_unchanged':True,'dependency_manifests_unchanged':True,'existing_runtime_payload_not_replaced':True,'browser_loaded_style_rules':84,'basis':'git diff plus runtime DOM/computed style and captured network requests; supplements GUI, not a substitute.'},indent=2))
print('SOURCE_RUNTIME_INTEGRATION_AUDIT_PASS')
