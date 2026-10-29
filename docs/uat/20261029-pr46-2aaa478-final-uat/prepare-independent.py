from pathlib import Path
import sys,runpy,json,hashlib,subprocess
R=Path('/workspace/uat2aaa');P=Path('/workspace/srm2aaa-product');M=R/'methods';F=R/'fixtures';M.mkdir();(R/'independent/evidence').mkdir(parents=True);(R/'independent/downloads').mkdir()
sys.argv=['fixtures.py',str(F)];g=runpy.run_path(str(P/'prototype/m1-lite/tests/e2e/fixtures.py'));xlsx=g['xlsx'];pdf=g['pdf'];qty=[5,2,3,4,5,6,100,8,9,10,11,12];header=['存货编码','存货名称','规格型号','所属类别','询价数量','询价单位']
xlsx('buyer-items.xlsx',[header]+[['UAA-DUP'if j<2 else f'UAA-{j+1:03}',f'虚构采购验收部件{j+1}',f'长规格-{j+1}-测试型','虚构机加工类',q,'件']for j,q in enumerate(qty)])
xlsx('buyer-suppliers.xlsx',[['往来单位编码','供应商编码','往来单位名称'],['CP-UAA-A','UAA-A','虚构复验甲方制造'],['CP-UAA-B','UAA-B','虚构复验乙方精工'],['CP-UAA-C','UAA-C','虚构复验丙方零件']])
xlsx('paging52.xlsx',[header]+[[f'PGAA-{j:03}',f'虚构分页复验物料{j}',f'规格{j}','虚构分页类',1,'件']for j in range(1,53)])
for n in ['UAA-003_A.pdf','UAA-DUP_A.pdf','UAA-unmatched.pdf']:pdf(n,'FreshAA '+n)
(F/'business-expected.json').write_text(json.dumps({'A':[118,20,30,None,75,None,2.25,80,90,100,110,120],'B':[119,82,32,40,75,60,2.35,82,92,102,112,122]})+'\n')
for p in Path('/workspace/uatfbb/methods-completion').iterdir():
 if not p.is_file()or p.suffix not in ['.js','.cjs','.py']:continue
 s=p.read_text()
 for a,b in [('/workspace/uatfbb/methods-completion/','/workspace/uat2aaa/methods/'),('/workspace/uatfbb/completion/','/workspace/uat2aaa/independent/'),('/workspace/uatfbb','/workspace/uat2aaa'),('/workspace/srmfbb-product','/workspace/srm2aaa-product'),('fbb98944a4bcee439e4e81ebfe3ef710bee4a3d0','2aaa478c8f1966e41b9372d9d989c383dbaa1972'),('UFB','UAA'),('PGFB','PGAA'),('FreshFB','FreshAA'),('最终独立验收','新提交独立验收')]:s=s.replace(a,b)
 (M/p.name).write_text(s)
source=(M/'driver.cjs').read_text();prefix=source[:source.index('(async()=>{global.server=')]
old="if(!fs.existsSync(data))throw Error('Authorized current-run isolated data missing');";assert old in prefix;prefix=prefix.replace(old,"if(fs.existsSync(data))throw Error('Fresh isolated data directory already exists');")
main=r'''
(async()=>{
 const start=Date.now();let failure=null,traceStarted=false,tracePath=null;
 try{
  if(!fs.existsSync('/workspace/uat2aaa/focused-finished'))throw Error('Focused original UI case must run first');
  global.server=await startServer(data,9865,'main-server');global.browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});global.context=await browser.newContext({viewport:{width:1366,height:768},acceptDownloads:true});await context.tracing.start({snapshots:true,screenshots:false});traceStarted=true;global.p=await context.newPage();bind(p);await p.goto(base);
  const response=await fetch(base+'/'),bytes=Buffer.from(await response.arrayBuffer());const proof={timeUTC:new Date().toISOString(),productSHA:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),httpStatus:response.status,httpHTMLSHA256:require('crypto').createHash('sha256').update(bytes).digest('hex'),sourceHTMLSHA256:require('crypto').createHash('sha256').update(fs.readFileSync(repo+'/prototype/m1-lite/index.html')).digest('hex')};await check('Exact new checkout SHA',proof.productSHA,'2aaa478c8f1966e41b9372d9d989c383dbaa1972');await check('Actual served HTML matches checkout',proof.httpHTMLSHA256,proof.sourceHTMLSHA256);await check('All viewport config loaded',sizes,[[1024,768],[1366,768],[1600,900]]);fs.writeFileSync('/workspace/uat2aaa/http-start.json',JSON.stringify(proof,null,2));
  await run('00-audit-helpers.js');await run('00-click-diagnostics.js');
  for(const method of ['01-project-import.js','02-drawings.js','03-allocation.js','04-quotes.js','04b-ux09-independent.js','05-comparison.js'])await run(method);
  await auditPages('populated',false);await run('09-layout-evidence.js');await run('09b-tooltip-keyboard.js');await p.setViewportSize({width:1366,height:768});
  for(const method of ['06-backup-classification.js','07-export.js','08-project-paging-persistence.js','10-save-reload-conflict.js','11-offline-save.js','12-stored-s4-negative.js','13-original-failure-triage.js','14-layout-observation.js'])await run(method);
  await scanView('final-backup');db('FINAL-all-data');const endResponse=await fetch(base+'/'),endBytes=Buffer.from(await endResponse.arrayBuffer());const end={timeUTC:new Date().toISOString(),productSHA:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),httpStatus:endResponse.status,httpHTMLSHA256:require('crypto').createHash('sha256').update(endBytes).digest('hex'),sourceHTMLSHA256:require('crypto').createHash('sha256').update(fs.readFileSync(repo+'/prototype/m1-lite/index.html')).digest('hex')};await check('Final HTTP source identity',end.httpHTMLSHA256,end.sourceHTMLSHA256);fs.writeFileSync('/workspace/uat2aaa/http-end.json',JSON.stringify(end,null,2));
  const records=fs.readFileSync(root+'browser.jsonl','utf8').trim().split('\n').map(l=>JSON.parse(l));if(records.some(x=>x.pass===false))throw Error('Nonblocking acceptance observation FAIL retained');
 }catch(e){failure=e;log('unanticipated-error',{message:e.message,stack:e.stack});fs.writeFileSync(root+'raw-first-error.json',JSON.stringify({timeUTC:new Date().toISOString(),activeStep:global.activeStep,message:e.message,stack:e.stack,classification:'UNCLASSIFIED pending evidence review; no automatic retry'},null,2));if(global.context)for(const[i,page]of context.pages().entries())try{await shot('FAIL-page'+i,page)}catch{}try{db('FAIL-database')}catch{}}
 finally{
  if(traceStarted)try{tracePath=root+(failure?'trace-first-failure.zip':'independent-complete-trace.zip');await context.tracing.stop({path:tracePath})}catch(e){log('trace-export-error',{message:e.message})}
  if(global.browser)await browser.close();for(const child of [global.restoreServer,global.classServer,global.server])await stopServer(child);
  const result={productSHA:'2aaa478c8f1966e41b9372d9d989c383dbaa1972',command:['node','/workspace/uat2aaa/methods/run-independent.cjs'],cwd:process.cwd(),startUTC:new Date(start).toISOString(),durationSeconds:(Date.now()-start)/1000,exitCode:failure?1:0,status:failure?'FAIL':'PASS',activeStep:global.activeStep,error:failure?.message||null,trace:tracePath,noninteractive:true,automaticRetries:0,originalTestsProductAndCIUnmodified:true};fs.writeFileSync(root+'command.json',JSON.stringify(result,null,2));console.log('INDEPENDENT_FINISHED',JSON.stringify(result));process.exitCode=failure?1:0;
 }
})();
'''
# Source string contains a literal JS newline separator, not backslash+n as a splitter.
main=main.replace("split('\\\\n')","split('\\n')")
(M/'run-independent.cjs').write_text(prefix+main)
for p in M.glob('*.js'):subprocess.run(['node','-e',"new (require('vm').Script)('(async()=>{'+require('fs').readFileSync(process.argv[1],'utf8')+'})()')",str(p)],check=True)
subprocess.run(['node','--check',str(M/'run-independent.cjs')],check=True)
assert all('fixtures-attempt02'not in p.read_text()and'/workspace/uatfbb'not in p.read_text()for p in M.iterdir()if p.is_file());assert(F/'business-expected.json').exists()
(R/'independent-preflight.json').write_text(json.dumps({'productSHA':'2aaa478c8f1966e41b9372d9d989c383dbaa1972','freshInputsAndData':True,'oldDBOrZIPImported':False,'runMode':'Single noninteractive runner with viewport globals preinitialized; first focused original UI case must finish before independent start','syntaxChecks':'All new methods parse','verifierFixturePaths':'Canonical current /workspace/uat2aaa/fixtures; both old mistaken paths removed before execution','firstSearch':'One ordinary click plus read-only rAF/hit/style/animation/scroll/focus observation; no force/no timeout increase/no retry','methodSHA256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in M.iterdir()if p.is_file()},'fixtureSHA256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in F.iterdir()if p.is_file()}},indent=2)+'\n');print('CURRENT_SHA_INDEPENDENT_PREFLIGHT_PASS')
