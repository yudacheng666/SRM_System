from pathlib import Path
import zipfile,json,hashlib,urllib.parse
R=Path('/workspace/uat2aaa');P=Path('/workspace/srm2aaa-product');expected=hashlib.sha256((P/'prototype/m1-lite/index.html').read_bytes()).hexdigest();records=[];missing=[];traces=[]
for phase in ['focused','automation','selection-order-attempt/automation']:
 traces +=[(phase,str(p.relative_to(R)),p)for p in(R/phase/'test-results').glob('*/trace.zip')]
traces +=[('independent',str(p.relative_to(R)),p)for p in(R/'independent/evidence').glob('*trace*.zip')]
for phase,label,path in traces:
 try:
  with zipfile.ZipFile(path)as z:
   for n in z.namelist():
    if not n.endswith('.network'):continue
    for line in z.read(n).splitlines():
     item=json.loads(line).get('snapshot',{});url=item.get('request',{}).get('url','');u=urllib.parse.urlsplit(url);response=item.get('response',{});body=response.get('content',{}).get('_sha1')
     if u.hostname!='127.0.0.1'or u.path!='/'or response.get('status')!=200:continue
     if not body or'resources/'+body not in z.namelist():missing.append({'trace':label,'url':url,'reason':'No captured root body'});continue
     b=z.read('resources/'+body);h=hashlib.sha256(b).hexdigest();records.append({'phase':phase,'trace':label,'networkMember':n,'url':url,'bytes':len(b),'HTMLSHA256':h,'matchesCheckout':h==expected})
 except Exception as e:missing.append({'trace':label,'reason':str(e),'retainedUnmodified':True})
assert records and all(v['matchesCheckout']for v in records)
(R/'http-trace-identity.json').write_text(json.dumps({'productSHA':'2aaa478c8f1966e41b9372d9d989c383dbaa1972','sourceHTMLSHA256':expected,'capturedRootResponses':len(records),'allCapturedRootResponsesMatch':True,'responses':records,'missing':missing,'qualification':'HTML source is unchanged from prior candidate because this commit changes only one test file. Exact checkout/test-source/command provenance, fresh data and timestamps establish this run; HTML hash alone is not a unique commit identifier. Interrupted early phase is version provenance only,not acceptance PASS.'},indent=2)+'\n');print('CURRENT_HTTP_PROOF',len(records),'responses;',len(missing),'missing')
