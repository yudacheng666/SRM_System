"""Independent Windows checkpoints; synthetic data only, not buyer UI acceptance."""
import hashlib, http.client, json, pathlib, sqlite3, sys, urllib.parse, zipfile

ROOT = pathlib.Path(__file__).resolve().parent
EV = ROOT / 'retry-evidence'
EV.mkdir(exist_ok=True)
MODE = sys.argv[1]
BASE = 'http://127.0.0.1:8765'

def call(method, route, body=None, media=None, extra=None):
    headers = {'Origin': BASE}
    if isinstance(body, dict):
        body = json.dumps(body, ensure_ascii=False).encode('utf-8')
        media = 'application/json'
    if media: headers['Content-Type'] = media
    if extra: headers.update(extra)
    conn = http.client.HTTPConnection('127.0.0.1', 8765, timeout=10)
    conn.request(method, route, body, headers)
    response = conn.getresponse()
    raw = response.read()
    code = response.status
    out = json.loads(raw) if response.getheader('Content-Type','').startswith('application/json') else raw
    conn.close()
    print(json.dumps({'method':method,'route':route,'status':code,'response':out if not isinstance(out,bytes) else {'bytes':len(out),'sha256':hashlib.sha256(out).hexdigest()}},ensure_ascii=False),flush=True)
    return code,out

def saved(name, value):
    (EV/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')

def snapshot():
    code, listing = call('GET','/api/workspaces')
    assert code == 200
    records = {}
    for row in listing['workspaces']:
        wid = row['workspaceId']
        code, data = call('GET','/api/workspaces/'+wid)
        assert code == 200
        records[wid] = data
    code, active = call('GET','/api/active')
    assert code == 200
    return {'listing':listing,'records':records,'active':active}

if MODE == 'assets':
    current = snapshot()
    assert len(current['records']) == 2
    assets=[]
    for tag,(identity,record) in zip(('A','B'),sorted(current['records'].items())):
        active=call('GET','/api/active')[1]['activeId']
        assert call('POST','/api/active/select',{'workspaceId':identity,'expectedActive':active})[0] == 200
        raw=('%PDF-1.4\n% SYNTHETIC WINDOWS CHECKPOINT '+tag+'\n1 0 obj <<>> endobj\n%%EOF\n').encode('ascii')
        sha=hashlib.sha256(raw).hexdigest()
        route='/api/assets/'+identity+'/'+sha
        assert call('PUT',route,raw,'application/pdf',{'X-SRM-Filename':urllib.parse.quote('虚构 drawing '+tag+'.pdf')})[0] == 200
        assert call('GET',route) == (200,raw)
        other=next(k for k in current['records'] if k!=identity)
        assert call('GET','/api/assets/'+other+'/'+sha)[0] == 404
        assets.append({'workspaceId':identity,'sha256':sha,'hex':raw.hex(),'route':route})
    saved('expected-assets.json',assets)
    saved('expected-snapshot.json',snapshot())
elif MODE == 'seed':
    initial = snapshot()
    assert len(initial['records']) == 1
    wid = next(iter(initial['records']))
    a = initial['records'][wid]['workspace']
    assert a['state']['projectName'] == '虚构 Windows 专项 A'
    assert a['state']['items'] == []
    a['revision'] += 1
    a['state']['items'] = [{'id':'SYN-ITEM-A','lineId':'SYN-LINE-A','name':'虚构零件 A'}]
    a['state']['suppliers'] = [{'id':'SYN-SUP-A','name':'虚构供应商 A'}]
    a['state']['assignments'] = [{'key':'SYN-LINE-A','values':['SYN-SUP-A']}]
    a['state']['quoteRounds'] = [{'supplierId':'SYN-SUP-A','roundNo':1,'revisionNo':1,'status':'confirmed','lines':[{'lineId':'SYN-LINE-A','price':100}],'expectedLineIds':['SYN-LINE-A']}]
    code, ack = call('PUT','/api/workspaces/'+wid,{'workspace':a,'expectedRevision':a['revision']-1})
    assert code == 200
    b = json.loads(json.dumps(a))
    b['workspaceId'] = 'RFQ-SYNTHETIC-WIN-RETRY-B'
    b['revision'] = 1
    b['state']['projectName'] = '虚构 Windows 专项 B（API补充）'
    b['state']['items'] = [{'id':'SYN-ITEM-B','lineId':'SYN-LINE-B','name':'虚构零件 B'}]
    b['state']['suppliers'] = []
    b['state']['assignments'] = []
    b['state']['quoteRounds'] = []
    assert call('PUT','/api/workspaces/'+b['workspaceId'],{'workspace':b,'expectedRevision':None})[0] == 200
    assets=[]
    for identity, tag in [(wid,'A'),(b['workspaceId'],'B')]:
        raw = ('%PDF-1.4\n% SYNTHETIC WINDOWS CHECKPOINT '+tag+'\n1 0 obj <<>> endobj\n%%EOF\n').encode('ascii')
        sha = hashlib.sha256(raw).hexdigest()
        route = '/api/assets/'+identity+'/'+sha
        assert call('PUT',route,raw,'application/pdf',{'X-SRM-Filename':urllib.parse.quote('虚构 drawing '+tag+'.pdf')})[0] == 200
        assert call('GET',route) == (200,raw)
        other = b['workspaceId'] if identity == wid else wid
        assert call('GET','/api/assets/'+other+'/'+sha)[0] == 404
        assets.append({'workspaceId':identity,'sha256':sha,'hex':raw.hex(),'route':route})
    saved('expected-assets.json',assets)
    saved('expected-snapshot.json',snapshot())
elif MODE in ('verify','backup'):
    assert snapshot() == json.loads((EV/'expected-snapshot.json').read_text(encoding='utf-8'))
    for asset in json.loads((EV/'expected-assets.json').read_text(encoding='utf-8')):
        assert call('GET',asset['route']) == (200,bytes.fromhex(asset['hex']))
    if MODE == 'backup':
        code, result = call('POST','/api/backups/full',{})
        assert code == 201 and result['backup']['verified']
        assert result['backup']['workspaceCount'] == 2 and result['backup']['pdfCount'] == 2
        code, raw = call('GET',result['downloadUrl'])
        assert code == 200
        (EV/'synthetic-full-backup.zip').write_bytes(raw)
        with zipfile.ZipFile(EV/'synthetic-full-backup.zip') as z:
            saved('backup-manifest.json',json.loads(z.read('manifest.json')))
            saved('backup-entries.json',[{'name':name,'sha256':hashlib.sha256(z.read(name)).hexdigest()} for name in z.namelist()])
elif MODE == 'restore':
    assert call('GET','/api/workspaces')[1]['workspaces'] == []
    raw = (EV/'synthetic-full-backup.zip').read_bytes()
    code, result = call('POST','/api/backups/full/restore',raw,'application/zip')
    assert code == 200 and result['restored'] and result['verified']
    expected=json.loads((EV/'expected-snapshot.json').read_text(encoding='utf-8'))
    assert snapshot() == expected
    assets=json.loads((EV/'expected-assets.json').read_text(encoding='utf-8'))
    for asset in assets: assert call('GET',asset['route']) == (200,bytes.fromhex(asset['hex']))
    data_dir=pathlib.Path((ROOT/'restore-dir.txt').read_text(encoding='utf-8').strip())
    def fingerprint():
        connection=sqlite3.connect((data_dir/'srm.sqlite3').as_uri()+'?mode=ro',uri=True)
        dump='\n'.join(connection.iterdump()).encode('utf-8')
        connection.close()
        return {'sqliteLogicalDumpSHA256':hashlib.sha256(dump).hexdigest(),'pdfs':{str(p.relative_to(data_dir)):hashlib.sha256(p.read_bytes()).hexdigest() for p in (data_dir/'assets').rglob('*.pdf')}}
    before=fingerprint()
    code, rejection=call('POST','/api/backups/full/restore',raw,'application/zip')
    assert code == 409 and 'RESTORE_TARGET_NOT_EMPTY' in rejection['message']
    assert snapshot() == expected
    after=fingerprint()
    assert before == after
    saved('restore-rejection-integrity.json',{'before':before,'after':after,'unchanged':True,'response':rejection})
else: raise ValueError(MODE)
print('CHECKPOINT PASS '+MODE,flush=True)
