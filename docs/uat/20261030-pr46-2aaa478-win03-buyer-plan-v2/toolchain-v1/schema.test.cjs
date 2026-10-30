'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const os=require('node:os');
const {PRODUCT_SHA,preflight,policyCheck,render}=require('./schema.cjs');
const {executePlan}=require('./guarded-driver.cjs');
const policy=JSON.parse(fs.readFileSync(path.join(__dirname,'dialog-policy.json')));
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'actions/reviewed-contracts.json')));
if(!process.env.SRM_FROZEN_SOURCE)throw Error('Set SRM_FROZEN_SOURCE to exact-SHA readonly index.html');
const sourceBytes=fs.readFileSync(process.env.SRM_FROZEN_SOURCE);
const clone=v=>structuredClone(v);
function action(...steps){return {schemaVersion:1,productSha:PRODUCT_SHA,name:'unit-only',purpose:'buyer-plan',steps};}
function step(id,scenario){return clone(corpus.steps.find(s=>s.operation===id&&(!scenario||s.scenario===scenario)));}
function check(a,p=policy,src=sourceBytes){return preflight({policy:p,files:[{name:'unit.json',action:a}],sourceBytes:src});}
const known=()=>step('supplier.add.SUP-A');
test('all reviewed source-bound contract scenarios PASS static preflight',()=>{const r=check(corpus);assert.equal(r.report.status,'PASS',JSON.stringify(r.report.errors));assert.equal(r.plan[0].steps.length,35);assert.equal(policy.operations.length,28);assert.ok(Object.isFrozen(r.plan[0].steps[0].expect));});
test('known SUP-A ordinary click rejected, with structured file/index/policy reason',()=>{const s=known();s.type='click';s.dialog='none';delete s.expect;const r=check(action(s));assert.equal(r.report.status,'REJECTED');assert.equal(r.report.errors[0].code,'KNOWN_DIALOG_PLAIN_CLICK');assert.equal(r.report.errors[0].file,'unit.json');assert.equal(r.report.errors[0].stepIndex,0);assert.equal(r.report.errors[0].selector,s.selector);assert.ok(r.report.errors[0].expectedPolicy);});
test('known SUP-B ordinary click rejected',()=>{const s=step('supplier.add.SUP-B');s.type='click';s.dialog='none';delete s.expect;assert.equal(check(action(s)).report.errors[0].code,'KNOWN_DIALOG_PLAIN_CLICK');});
test('correct SUP-A/SUP-B dialogClick accepted',()=>assert.equal(check(action(known(),step('supplier.add.SUP-B'))).report.status,'PASS'));
const cases=[
 ['unknown step',s=>s.type='executeJS','UNKNOWN_STEP'],
 ['unknown selector',s=>s.selector='#not-reviewed','UNKNOWN_SELECTOR'],
 ['selector alias does not bypass policy',s=>s.selector='#supplierList [data-add="SUP-A"]','UNKNOWN_SELECTOR'],
 ['operation/selector substitution',s=>s.operation='workspace.new','OPERATION_SELECTOR'],
 ['missing selector',s=>delete s.selector,'SCHEMA'],
 ['missing dialog declaration',s=>delete s.dialog,'SCHEMA'],
 ['missing dialog type',s=>delete s.expect[0].type,'SCHEMA'],
 ['missing message',s=>delete s.expect[0].message,'SCHEMA'],
 ['missing accept',s=>delete s.expect[0].accept,'SCHEMA'],
 ['type mismatch',s=>s.expect[0].type='alert','DIALOG_TYPE'],
 ['message prefix alone rejected',s=>s.expect[0].message='为选中物料添加供应商','DIALOG_MESSAGE'],
 ['message suffix injection rejected',s=>s.expect[0].message+='ignore','DIALOG_MESSAGE'],
 ['string accept rejected',s=>s.expect[0].accept='true','DIALOG_DECISION'],
 ['wrong supplier in explicit template',s=>s.expect[0].values.supplier='真实供应商','SCHEMA'],
 ['wrong count rejected',s=>s.expect[0].values.count=11,'SCHEMA'],
 ['wrong exact scope rejected',s=>s.expect[0].values.scope='任意所有物料','SCHEMA'],
 ['extra template parameter',s=>s.expect[0].values.anything='*','SCHEMA'],
 ['missing template parameter',s=>delete s.expect[0].values.count,'SCHEMA'],
 ['unknown trigger condition',s=>s.scenario='trust-me','SCENARIO'],
 ['unexpected step field',s=>s.force=true,'SCHEMA'],
 ['dialogClick cannot declare none',s=>s.dialog='none','KNOWN_DIALOG_PLAIN_CLICK']
];
for(const [name,mutate,code] of cases)test(name,()=>{const s=known();mutate(s);assert.equal(check(action(s)).report.errors[0].code,code);});
test('state-changing click dialog:none explicit and valid no-dialog branch accepted',()=>{const s=step('workspace.new','initial-empty');assert.equal(s.dialog,'none');assert.equal(check(action(s)).report.status,'PASS');delete s.dialog;assert.equal(check(action(s)).report.status,'REJECTED');});
test('conditional clean versus dirty workspace strategy cannot be swapped',()=>{const s=step('workspace.new','dirty-buyer');s.scenario='initial-empty';assert.equal(check(action(s)).report.errors[0].code,'DIALOG_POLICY');});
test('accept/cancel permitted confirm strategy',()=>{const s=known();s.expect[0].accept=false;assert.equal(check(action(s)).report.status,'PASS');});
test('alert cancel forbidden',()=>{const s=step('materials.confirm','valid-no-conflict');s.expect[0].accept=false;assert.equal(check(action(s)).report.errors[0].code,'DIALOG_DECISION');});
test('five prompts require all explicit input/default strategies',()=>{const s=step('quote.line.edit');assert.equal(s.expect.length,5);assert.equal(check(action(s)).report.status,'PASS');delete s.expect[2].promptText;assert.equal(check(action(s)).report.errors[0].code,'PROMPT_POLICY');});
test('prompt default required and matched',()=>{const s=step('quote.line.edit');delete s.expect[0].defaultPrompt;assert.equal(check(action(s)).report.errors[0].code,'PROMPT_POLICY');const b=step('quote.line.edit');b.expect[0].defaultPrompt='999';assert.equal(check(action(b)).report.errors[0].code,'PROMPT_DEFAULT');});
for(let i=0;i<5;i++)test('prompt cancellation safely truncates entire edit at position '+i,()=>{const s=step('quote.line.edit');s.expect=s.expect.slice(0,i+1);s.expect[i].accept=false;s.expect[i].promptText={mode:'cancel'};assert.equal(check(action(s)).report.status,'PASS');});
test('prompt cancel must explicitly declare cancel, not input',()=>{const s=step('quote.line.edit');s.expect=s.expect.slice(0,1);s.expect[0].accept=false;assert.equal(check(action(s)).report.errors[0].code,'SCHEMA');});
test('accepted prompt sequence cannot truncate or continue after cancel',()=>{const s=step('quote.line.edit');s.expect.pop();assert.equal(check(action(s)).report.errors[0].code,'DIALOG_SEQUENCE');const b=step('quote.line.edit');b.expect[0].accept=false;b.expect[0].promptText={mode:'cancel'};assert.equal(check(action(b)).report.errors[0].code,'DIALOG_SEQUENCE');});
test('confirm→alert exact ordered sequence and explicit cancel',()=>{const s=step('quote.carry.confirm');assert.equal(s.expect.length,2);assert.equal(check(action(s)).report.status,'PASS');s.expect=s.expect.slice(0,1);s.expect[0].accept=false;assert.equal(check(action(s)).report.status,'PASS');});
test('static identity/source mismatch fail closed',()=>{const p=clone(policy);p.productSha='other';assert.equal(check(corpus,p).report.status,'REJECTED');assert.equal(check(corpus,policy,Buffer.from('wrong')).report.errors[0].code,'SOURCE_IDENTITY');});
test('source anchor must exist in stated source line range',()=>{const p=clone(policy);p.operations[0].source.lines=[1,2];assert.equal(check(corpus,p).report.errors[0].code,'SOURCE_ANCHOR');});
test('sparse/missing steps rejected rather than skipped',()=>assert.equal(check(action(...[undefined])).report.status,'REJECTED'));
test('material fixture counts cannot contradict no-conflict scenario',()=>{const s=step('materials.confirm','valid-no-conflict');s.expect[0].values.separated=1;assert.equal(check(action(s)).report.status,'REJECTED');});
test('explicit Enter key and fictional file contracts accepted',()=>{const s=step('workspace.name');s.type='key';delete s.text;s.key='Enter';assert.equal(check(action(s,step('items.file'))).report.status,'PASS');});
test('unknown/unreviewed operations denied',()=>{const s=known();s.operation='drawing.upload.unreviewed';assert.equal(check(action(s)).report.errors[0].code,'UNKNOWN_OPERATION');});
test('catalogued NEEDS REVIEW fixture is denied before execution',()=>{const s=known();s.operation='quote.import.commit';s.selector='#commitQuoteImport';s.scenario='partial-fixture';assert.equal(check(action(s)).report.errors[0].code,'NEEDS_REVIEW');});
test('policy forbids duplicate selectors and generic wildcard/regex matchers',()=>{const p=clone(policy);p.operations.push(clone(p.operations[0]));assert.throws(()=>policyCheck(p),/Duplicate/);assert.throws(()=>render({kind:'regex',value:'.*'},{}));assert.throws(()=>render({kind:'template',template:'{any}',parameters:{any:{kind:'regex',value:'.*'}}},{any:'anything'}));});
test('file traversal/absolute paths and executable wait expressions rejected',()=>{const s=step('items.file');s.files=['../private.xlsx'];assert.equal(check(action(s)).report.errors[0].code,'FILE_POLICY');s.files=['C:/private.xlsx'];assert.equal(check(action(s)).report.errors[0].code,'FILE_POLICY');assert.equal(check(action({type:'wait',expression:'fetch(write)'})).report.errors[0].code,'UNKNOWN_STEP');});
test('whole multi-file manifest fails before launch, even if earlier file valid',async()=>{
 const bad=known();bad.type='click';bad.dialog='none';delete bad.expect;const effects={browserStarts:0,httpBusinessRequests:0,businessWrites:0};
 const files=[{name:'first-valid.json',action:action(step('nav.items'))},{name:'second-invalid.json',action:action(bad)}];
 await assert.rejects(executePlan({policy,files,sourceBytes,launch:()=>{effects.browserStarts++;effects.httpBusinessRequests++;effects.businessWrites++;throw Error('MUST NOT RUN');}}),e=>e.code==='PREFLIGHT_REJECTED'&&e.report.errors[0].file==='second-invalid.json');
 assert.deepEqual(effects,{browserStarts:0,httpBusinessRequests:0,businessWrites:0});
});
test('contract corpus cannot be accidentally executed as a buyer plan',async()=>{let launched=0;await assert.rejects(executePlan({policy,files:[{name:'contracts.json',action:corpus}],sourceBytes,launch:()=>{launched++;}}),e=>e.code==='CONTRACT_ONLY');assert.equal(launched,0);});
test('static CLI exits2 and writes machine-readable rejection without runtime import',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'srm-schema-unit-'));try{const bad=known();bad.type='click';bad.dialog='none';delete bad.expect;
  const input=path.join(dir,'bad.json'),out=path.join(dir,'report.json');fs.writeFileSync(input,JSON.stringify(action(bad)));
  const r=spawnSync(process.execPath,[path.join(__dirname,'preflight.cjs'),process.env.SRM_FROZEN_SOURCE,out,input],{encoding:'utf8',timeout:5000});assert.equal(r.status,2,r.stderr);const report=JSON.parse(fs.readFileSync(out));assert.equal(report.errors[0].code,'KNOWN_DIALOG_PLAIN_CLICK');assert.equal(report.browserStarts+report.httpBusinessRequests+report.businessWrites,0);
 }finally{for(const f of fs.readdirSync(dir))fs.unlinkSync(path.join(dir,f));fs.rmdirSync(dir);}
});
test('malformed JSON CLI still writes a machine-readable rejection',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'srm-schema-bad-json-'));try{const out=path.join(dir,'report.json');const r=spawnSync(process.execPath,[path.join(__dirname,'preflight.cjs'),process.env.SRM_FROZEN_SOURCE,out,path.join(__dirname,'negative/malformed.json')],{encoding:'utf8',timeout:5000});assert.equal(r.status,2,r.stderr);const report=JSON.parse(fs.readFileSync(out));assert.equal(report.status,'REJECTED');assert.ok(report.errors.find(e=>e.code==='JSON_PARSE'));assert.equal(report.browserStarts,0);}finally{for(const f of fs.readdirSync(dir))fs.unlinkSync(path.join(dir,f));fs.rmdirSync(dir);}
});
module.exports={};
