'use strict';
// Strict additive FULL-plan audit around the unchanged V1 schema.
// NOT a second browser driver. No browser/network/process dependencies here.
const fs=require('node:fs'),path=require('node:path');
const V1=require('./toolchain-v1/schema.cjs');
const {digest}=require('./source-probes.cjs');
const auxiliary=new Set(['select','checked','ensure-open','file','wait-visible','save-barrier','reload','duplicate-assignment','pdf-preview','download','capture-history','service-restart','service-stop','select-archived-project','offline-save','empty-restore-target','downloaded-file','restore-audit','nonempty-ui-refusal','nonempty-server-race','viewport','layout-check']);
const capabilities=Object.freeze({
 'select':'view-controls','checked':'view-controls','ensure-open':'view-controls','file':'view-controls','wait-visible':'view-controls','duplicate-assignment':'view-controls','select-archived-project':'view-controls','nonempty-ui-refusal':'view-controls',
 'save-barrier':'save-sqlite-oracle','reload':'save-sqlite-oracle','capture-history':'save-sqlite-oracle','offline-save':'save-sqlite-oracle','restore-audit':'save-sqlite-oracle',
 'download':'download-oracle','downloaded-file':'download-oracle','pdf-preview':'pdf-preview',
 'service-restart':'windows-lifecycle','service-stop':'windows-lifecycle','empty-restore-target':'windows-lifecycle','nonempty-server-race':'nonempty-409-race',
 'viewport':'layout-observer','layout-check':'layout-observer'
});
function error(code,message){const e=Error(message);e.code=code;throw e;}
const required=(v,keys,optional=[])=>V1.keys(v,keys,optional);
function nonempty(v){if(typeof v!=='string'||!v.trim())error('SCHEMA','Nonempty string required');}
function postconditions(list){
 if(!Array.isArray(list)||list.length<1)error('POSTCONDITION_REQUIRED','No executable acceptance claim without explicit postcondition contracts');
 for(const p of list){
  if(!p||typeof p!=='object'||Array.isArray(p))error('POSTCONDITION_SCHEMA','Invalid postcondition');
  const keys={dom:[['kind','target','require'],[]],workspace:[['kind','oracle','revision'],[]],evidence:[['kind','require'],[]],save:[['kind','require'],[]],expected:[['kind','value'],[]],download:[['kind','require'],[]]}[p.kind];
  if(!keys)error('POSTCONDITION_SCHEMA','Unknown assertion kind');required(p,...keys);
  if(p.kind==='dom'){if(p.target!==null)nonempty(p.target);nonempty(p.require);}
  if(p.kind==='workspace'){nonempty(p.oracle);nonempty(p.revision);}
  if(p.kind==='save'||p.kind==='download')nonempty(p.require);
  if(p.kind==='evidence'&&(!Array.isArray(p.require)||!p.require.length||p.require.some(x=>typeof x!=='string'||!x)))error('POSTCONDITION_SCHEMA','Evidence list required');
 }
}
function audit({manifest,files,policy,sourceBytes,readSource,fixtureManifest,readFixture}){
 const errors=[],needsReview=[],steps=[],nativeFiles=[];let total=0;
 const bad=(file,index,s,e)=>errors.push({file,stepIndex:index,selector:s?.input?.selector??s?.selector??null,expectedPolicy:policy.operations.find(o=>o.selector===(s?.input?.selector??s?.selector))??null,actualPolicy:s??null,code:e.code||'SCHEMA',reason:e.message});
 try{
  required(manifest,['schemaVersion','productSha','sourceSha256','purpose','entry','actionFiles','requiresSeparateWindowsAuthorization','executionStatus','noApiBusinessWrites']);
  if(manifest.schemaVersion!==1||manifest.productSha!==V1.PRODUCT_SHA||manifest.sourceSha256!==V1.SOURCE_SHA256||manifest.purpose!=='buyer-plan'||manifest.noApiBusinessWrites!==true||manifest.requiresSeparateWindowsAuthorization!==true)error('IDENTITY','Frozen source/buyer restrictions mismatch');
  if(!Array.isArray(files)||!files.length||JSON.stringify(manifest.actionFiles)!==JSON.stringify(files.map(f=>f.name)))error('MANIFEST','Missing, extra or reordered files');
  V1.policyCheck(policy);
  if(digest(sourceBytes)!==V1.SOURCE_SHA256)error('SOURCE_IDENTITY','Wrong frozen HTML');
  if(fixtureManifest.productSha!==V1.PRODUCT_SHA||fixtureManifest.fictional!==true||!Array.isArray(fixtureManifest.files))error('FIXTURE_MANIFEST','Wrong synthetic fixture manifest');
  const unique=new Set();
  for(const f of fixtureManifest.files){
   required(f,['path','bytes','sha256']);
   if(!/^fixtures\/[a-zA-Z0-9_./-]+\.(xlsx|csv|pdf)$/.test(f.path)||f.path.includes('..')||unique.has(f.path))error('FIXTURE_PATH','Unsafe/duplicate fixture path');
   unique.add(f.path);const b=readFixture(f.path);
   if(b.length!==f.bytes||digest(b)!==f.sha256)error('FIXTURE_HASH','Fixture changed '+f.path);
  }
 }catch(e){bad('<manifest/source/fixtures>',null,null,e);}
 const ids=new Set();
 for(const f of files??[]){
  const native=[];
  try{
   required(f,['name','action']);required(f.action,['schemaVersion','productSha','name','purpose','scope','steps']);
   if(f.action.schemaVersion!==1||f.action.productSha!==V1.PRODUCT_SHA||f.action.purpose!=='buyer-plan'||!Array.isArray(f.action.steps)||!f.action.steps.length)error('ACTION_SCHEMA','Actual nonempty buyer-plan required');
   nonempty(f.action.scope);
  }catch(e){bad(f?.name,null,null,e);continue;}
  for(let i=0;i<f.action.steps.length;i++){
   const s=f.action.steps[i];total++;
   try{
    const base=['id','kind','branch','source','postconditions','capability'];
    required(s,base.concat(s?.kind==='native'?['input']:['selector','dialog','args']));
    nonempty(s.id);nonempty(s.branch);if(ids.has(s.id))error('DUPLICATE_STEP','Duplicate step identity');ids.add(s.id);
    postconditions(s.postconditions);
    required(s.source,['path','lines','anchor'],['sha256','function']);
    if(!['prototype/m1-lite/index.html','prototype/m1-lite/run_local.bat'].includes(s.source.path))error('SOURCE_PATH','Unreviewed source path');
    const b=s.source.path==='prototype/m1-lite/index.html'?sourceBytes:readSource(s.source.path),text=b.toString('utf8');
    if(s.source.sha256!==digest(b))error('SOURCE_HASH','Source hash mismatch');
    if(!Array.isArray(s.source.lines)||s.source.lines.length!==2||s.source.lines.some(n=>!Number.isSafeInteger(n)||n<1)||s.source.lines[1]<s.source.lines[0])error('SOURCE_RANGE','Invalid source range');
    if(!text.split('\n').slice(s.source.lines[0]-1,s.source.lines[1]).join('\n').includes(s.source.anchor))error('SOURCE_ANCHOR','Declared source range lacks anchor');
    if(s.kind==='native'){
     if(s.capability!=='V1.native-input')error('CAPABILITY','Native capability substitution');
     if(s.input?.type==='checkpoint')error('CHECKPOINT_BYPASS','Unchecked checkpoint not a buyer business assertion');
     const c=V1.compileStep(s.input,policy);native.push(c);
     if(s.input.type==='file')for(const p of s.input.files)if(!fixtureManifest.files.some(f=>f.path===p))error('FIXTURE_MISSING','Input fixture not declared');
    }else{
     if(!auxiliary.has(s.kind))error('UNKNOWN_STEP','Unregistered auxiliary operation '+s.kind);
     if(s.capability!==capabilities[s.kind])error('CAPABILITY','Operation/capability substitution');
     if(s.dialog!=='none')error('DIALOG_POLICY','Auxiliary step cannot conceal a known native dialog');
     if(s.selector!==null)nonempty(s.selector);
     if(!s.args||typeof s.args!=='object'||Array.isArray(s.args))error('ARGS','Invalid auxiliary args');
     // These operations have NO live implementation in V1. Any fields in them
     // remain unapproved, not a broad allow-list for arbitrary runtime commands.
     if(s.kind==='file'){
      if(!Array.isArray(s.args.files)||!s.args.files.length)error('FIXTURE_MISSING','Explicit files required');
      for(const p of s.args.files)if(!fixtureManifest.files.some(f=>f.path===p))error('FIXTURE_MISSING','Unbound file '+p);
     }
     if(s.kind==='select'&&(typeof s.args.value!=='string'||!s.args.value))error('ARGS','Exact selected value required');
     if(s.kind==='checked'&&typeof s.args.value!=='boolean')error('ARGS','Explicit idempotent checked value required');
     if(s.kind==='viewport'&&![JSON.stringify({width:1366,height:768}),JSON.stringify({width:960,height:768})].includes(JSON.stringify(s.args)))error('ARGS','Unreviewed viewport');
     needsReview.push({file:f.name,stepIndex:i,id:s.id,selector:s.selector,operation:s.kind,capability:s.capability,code:'NEEDS_REVIEW',reason:'No executable implementation in the authorized unmodified V1. This step and all successors are NOT authorized to execute.'});
    }
    steps.push({file:f.name,stepIndex:i,id:s.id,selector:s.input?.selector??s.selector,kind:s.kind,sourceAudit:'PASS',nativeInputSchema:s.kind==='native'?'PASS':'NOT SUPPORTED BY V1',postconditions:'SPECIFIED ONLY; runtime oracle not implemented',executable:s.kind==='native'?'V1 input only; not complete business step':'NEEDS REVIEW'});
   }catch(e){bad(f.name,i,s,e);}
  }
  nativeFiles.push({name:f.name,action:{schemaVersion:1,productSha:V1.PRODUCT_SHA,name:f.action.name,purpose:'buyer-plan',steps:native}});
 }
 // V1 compilation is still run for ALL supported native inputs, across ALL
 // buyer files. This projection is disclosed, never reported as full-plan PASS.
 const projected=V1.preflight({policy,sourceBytes,files:nativeFiles});
 if(projected.report.errors.length)for(const e of projected.report.errors)errors.push({...e,projection:'NATIVE INPUTS ONLY'});
 if(!errors.length&&!needsReview.length)needsReview.push({code:'POSTCONDITION_EXECUTOR_MISSING',reason:'Even native inputs alone are not a full buyer flow: V1 stores persistence postconditions as prose and lacks a checked assertion executor.'});
 return {schemaVersion:1,status:errors.length?'REJECTED':'BLOCKED',conclusion:'PLAN BLOCKED: NEEDS REVIEW',syntaxAndSourceAudit:errors.length?'FAIL':'PASS',productSha:V1.PRODUCT_SHA,actionFiles:files?.length??0,totalSteps:total,nativeProjection:projected.report,nativeProjectionMeaning:'INPUT SCHEMA ONLY; not all plan steps, not business PASS',errors,needsReview,steps,actualBrowserStarts:0,actualCDPConnections:0,actualHttpBusinessRequests:0,actualBusinessWrites:0,realBusinessStatus:'NOT TESTED',runtimeAuthorization:false};
}
function load(root,productRoot){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'buyer-manifest.json')));
 return {manifest,files:manifest.actionFiles.map(name=>({name,action:JSON.parse(fs.readFileSync(path.join(root,name)))})),policy:JSON.parse(fs.readFileSync(path.join(root,'dialog-policy.reviewed.json'))),sourceBytes:fs.readFileSync(path.join(productRoot,'prototype/m1-lite/index.html')),readSource:p=>fs.readFileSync(path.join(productRoot,p)),fixtureManifest:JSON.parse(fs.readFileSync(path.join(root,'fixture-manifest.json'))),readFixture:p=>{const f=path.resolve(root,p);if(!f.startsWith(path.resolve(root)+path.sep))error('FIXTURE_PATH','Escaped fixture root');return fs.readFileSync(f);}};
}
async function requireReady(inputs,{launch=()=>{},connect=()=>{},http=()=>{},write=()=>{}}={}){
 const report=audit(inputs);
 // No fallthrough to legacy driver or checkpoint conversion. Every full-plan
 // path in this version is blocked before invoking ANY injected effect.
 if(report.status!=='PASS'){const e=Error(report.conclusion);e.code='PLAN_BLOCKED';e.report=report;throw e;}
 error('NO_LIVE_ENTRY','This static preparation task does not authorize live execution');
}
module.exports={audit,load,requireReady,postconditions};
if(require.main===module){
 let r;try{r=audit(load(__dirname,path.resolve(process.argv[2])));}catch(e){r={status:'REJECTED',conclusion:'PLAN BLOCKED: NEEDS REVIEW',errors:[{code:e.code||'LOAD',reason:e.message}],actualBrowserStarts:0,actualCDPConnections:0,actualHttpBusinessRequests:0,actualBusinessWrites:0};}
 if(!process.argv[3]){console.error('Usage: node buyer-preflight.cjs FROZEN_PRODUCT_ROOT REPORT.json');process.exitCode=2;}
 else{fs.writeFileSync(process.argv[3],JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({status:r.status,source:r.syntaxAndSourceAudit,files:r.actionFiles,steps:r.totalSteps,errors:r.errors.length,needsReview:r.needsReview?.length??0}));process.exitCode=2;}
}
