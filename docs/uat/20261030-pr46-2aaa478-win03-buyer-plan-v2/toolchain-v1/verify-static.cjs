'use strict';
// Explicitly runs ONLY the new TEST-ONLY tests/static CLI, never original tests.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const {PRODUCT_SHA,SOURCE_SHA256}=require('./schema.cjs');
const source=path.resolve(process.argv[2]||''),manifest=path.resolve(process.argv[3]||'');
if(!process.argv[2]||!process.argv[3])throw Error('Usage: node verify-static.cjs FROZEN/index.html frozen-source-manifest.json');
const root=__dirname,commands=[];
const write=(name,v)=>fs.writeFileSync(path.join(root,name),JSON.stringify(v,null,2)+'\n');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function verifySource(){
 const m=JSON.parse(fs.readFileSync(manifest));if(m.productSHA!==PRODUCT_SHA||m.files.length!==146)throw Error('Expected immutable146 manifest');
 const sourceRoot=path.resolve(path.dirname(source),'../..');
 const files=m.files.map(e=>{const absolute=path.resolve(sourceRoot,e.path);if(!absolute.startsWith(sourceRoot+path.sep))throw Error('Manifest escaped source root');
  const b=fs.readFileSync(absolute);const gitBlobSHA1=crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
  return {path:e.path,sha256:sha(b),gitBlobSHA1,matches:sha(b)===e.sha256&&gitBlobSHA1===e.gitBlobSHA1};});
 if(files.some(f=>!f.matches)||sha(fs.readFileSync(source))!==SOURCE_SHA256)throw Error('Frozen source mismatch');
 return {productSha:PRODUCT_SHA,fileCount:files.length,allMatch:true,files};
}
function command(label,args,expected=0){
 const r=spawnSync(process.execPath,args,{cwd:root,env:{...process.env,SRM_FROZEN_SOURCE:source},encoding:'utf8',timeout:20000,windowsHide:true});
 fs.writeFileSync(path.join(root,label+'.stdout.log'),r.stdout||'');fs.writeFileSync(path.join(root,label+'.stderr.log'),r.stderr||'');
 commands.push({label,executable:'existing-native-node',args:args.map(a=>a===source?'<FROZEN_SOURCE>':a),expectedExit:expected,actualExit:r.status,signal:r.signal,error:r.error?.message??null,stdoutSha256:sha(r.stdout||''),stderrSha256:sha(r.stderr||'')});
 write('commands.json',commands);if(r.status!==expected||r.error)throw Error(label+' failed; see preserved raw stdout/stderr');return r.stdout;
}
const before=verifySource();write('source-verification-before.json',before);
write('environment.json',{time:new Date().toISOString(),platform:process.platform,arch:process.arch,node:process.version,osRelease:require('node:os').release(),actualBrowserStarts:0,actualCDPConnections:0,actualBusinessHTTPRequests:0,actualBusinessWrites:0,scope:'static-only; EventEmitter/FakeWebSocket unit tests; subprocesses are existing node only'});
command('build-policy',['build-policy.cjs']);
const cjs=fs.readdirSync(root).filter(p=>p.endsWith('.cjs')).sort();for(const file of cjs)command('syntax-'+file.replace('.cjs',''),['--check',file]);
const tap=command('tests-final',['--test','--test-reporter=tap','schema.test.cjs','runtime.test.cjs','adapter.test.cjs']);
const value=name=>Number(new RegExp('^# '+name+' (\\d+)$','m').exec(tap)?.[1]??NaN);
if(!Number.isFinite(value('tests'))||value('fail')!==0||value('skipped')!==0||value('pass')!==value('tests'))throw Error('Tests not all passed');
command('preflight-positive',['preflight.cjs',source,'preflight-pass.json','actions/reviewed-contracts.json','actions/assignment-reviewed.json']);
command('preflight-negative-assignment',['preflight.cjs',source,'preflight-reject-assignment.json','negative/assignment-plain-click.json'],2);
const rejected=JSON.parse(fs.readFileSync(path.join(root,'preflight-reject-assignment.json')));
if(rejected.errors.length!==2||rejected.errors.some(e=>e.code!=='KNOWN_DIALOG_PLAIN_CLICK')||rejected.errors[0].stepIndex!==1||rejected.errors[1].stepIndex!==2)throw Error('Old assignment mistake not caught at both actual positions');
command('preflight-negative-json',['preflight.cjs',source,'preflight-reject-json.json','negative/malformed.json'],2);
const workflowDir=path.resolve(path.dirname(source),'../../.github/workflows');
const workflows=fs.readdirSync(workflowDir).filter(p=>/\.ya?ml$/.test(p)).sort().map(file=>{const content=fs.readFileSync(path.join(workflowDir,file),'utf8');return {file,sha256:sha(content),events:content.slice(content.indexOf('\non:')+1).split('\npermissions:')[0]};});
write('workflow-events-readonly.json',{readOnly:true,branch:'test/20261022-pr46-c2737f0-temp-ci',prBase:'feat/20261022-srm-ui-ux-structural',commitSkipCi:true,workflows});
const after=verifySource();write('source-verification-after.json',after);
if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Source changed during static verification');
write('static-summary.json',{status:'PASS',kind:'TEST-ONLY STATIC SYSTEM REMEDIATION; NOT WIN03 GUI ACCEPTANCE',productSha:PRODUCT_SHA,node:process.version,syntaxFiles:cjs.length,unitTests:{tests:value('tests'),pass:value('pass'),fail:value('fail'),skipped:value('skipped')},positivePreflight:JSON.parse(fs.readFileSync(path.join(root,'preflight-pass.json'))),negativeAssignment:{status:'EXPECTED_REJECTION',exit:2,stepIndexes:rejected.errors.map(e=>e.stepIndex),codes:rejected.errors.map(e=>e.code)},frozenSourceFiles:146,sourceUnchanged:true,actualBrowserStarts:0,actualCDPConnections:0,actualBusinessHTTPRequests:0,actualBusinessWrites:0,originalSuitesRun:0,guiAcceptance:'NOT RUN; prior WIN03 remains BLOCKED/NOT READY',needsReview:JSON.parse(fs.readFileSync(path.join(root,'dialog-policy.json'))).needsReview});
console.log(fs.readFileSync(path.join(root,'static-summary.json'),'utf8'));
