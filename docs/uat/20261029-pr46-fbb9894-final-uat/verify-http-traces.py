from pathlib import Path
import zipfile,json,hashlib,urllib.parse
R=Path('/workspace/uatfbb');expected=hashlib.sha256(Path('/workspace/srmfbb-product/prototype/m1-lite/index.html').read_bytes()).hexdigest();seen=[];missing=[]
traces=[]
for phase in ['automation']:
 traces += [(str(p.relative_to(R)),p)for p in (R/phase/'test-results').glob('*/trace.zip')]
for attempt in ['independent','continuation','completion']:
 traces += [(str(p.relative_to(R)),p)for p in (R/attempt/'evidence').glob('*trace*.zip')]
for label,p in traces:
 with zipfile.ZipFile(p)as z:
  for n in z.namelist():
   if not n.endswith('.network'):continue
   for l in z.read(n).splitlines():
    q=json.loads(l).get('snapshot',{});u=q.get('request',{}).get('url','');v=urllib.parse.urlsplit(u);a=q.get('response',{});b=a.get('content',{}).get('_sha1')
    if v.hostname!='127.0.0.1'or v.path!='/'or a.get('status')!=200:continue
    if not b or 'resources/'+b not in z.namelist():missing.append({'trace':label,'url':u,'reason':'no captured response body'});continue
    body=z.read('resources/'+b);h=hashlib.sha256(body).hexdigest();seen.append({'trace':label,'networkMember':n,'url':u,'bytes':len(body),'htmlSHA256':h,'matchesExactCheckout':h==expected})
assert seen and all(q['matchesExactCheckout']for q in seen)
(R/'http-trace-identity.json').write_text(json.dumps({'productSHA':'fbb98944a4bcee439e4e81ebfe3ef710bee4a3d0','expectedHTMLSHA256':expected,'capturedRootResponses':len(seen),'allCapturedRootResponsesMatch':True,'responses':seen,'missingBodyRecords':missing,'method':'Read-only original trace resource hashes after tests, not mocked HTTP or substituted source'},indent=2)+'\n');print('ACTUAL_TRACE_HTTP_IDENTITY_PASS',len(seen),'roots',len(missing),'missing bodies')
