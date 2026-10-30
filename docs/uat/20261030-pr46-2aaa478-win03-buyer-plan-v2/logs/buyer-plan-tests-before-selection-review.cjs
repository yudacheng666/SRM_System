'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {audit,load,requireReady}=require('./buyer-preflight.cjs');
const {load:sourceProbe,audit:quoteAudit}=require('./source-probes.cjs');
const fixtureAudit=require('./fixture-audit.cjs');
if(!process.env.SRM_PRODUCT_ROOT)throw Error('SRM_PRODUCT_ROOT exact product root required');
const source=path.join(process.env.SRM_PRODUCT_ROOT,'prototype/m1-lite/index.html');
function inputs(){return load(__dirname,process.env.SRM_PRODUCT_ROOT);}
const firstNative=i=>i.files.flatMap(f=>f.action.steps).find(s=>s.kind==='native');
function hasCode(r,code){assert.ok(r.errors.some(e=>e.code===code),JSON.stringify(r.errors.map(e=>e.code)));}
test('all nine complete buyer candidate files/218 steps scanned; NO full-plan PASS',()=>{
 const r=audit(inputs());assert.equal(r.actionFiles,9);assert.equal(r.totalSteps,218);assert.equal(r.syntaxAndSourceAudit,'PASS');assert.equal(r.errors.length,0);assert.equal(r.conclusion,'PLAN BLOCKED: NEEDS REVIEW');assert.equal(r.status,'BLOCKED');assert.equal(r.needsReview.length,111);assert.equal(r.runtimeAuthorization,false);
 assert.equal(r.nativeProjection.stepCount,107);assert.equal(r.nativeProjection.actionFiles,8);assert.deepEqual(r.nativeProjectionOmittedFiles,['actions/03-supplier-packages.json']);
 assert.equal(r.steps.length,218);assert.ok(r.steps.every(s=>s.postconditions!=='PASS'));assert.equal(r.realBusinessStatus,'NOT TESTED');
});
test('no contract-test corpus substituted for actual buyer files',()=>{const i=inputs();i.files[0].action.purpose='contract-test';hasCode(audit(i),'ACTION_SCHEMA');});
test('late invalid file still rejected before ANY injected launch/CDP/HTTP/write',async()=>{
 const i=inputs(),s=i.files.at(-1).action.steps.at(-1);s.kind='arbitrary-script';
 const calls={launch:0,connect:0,http:0,write:0};const effects=Object.fromEntries(Object.keys(calls).map(k=>[k,()=>{calls[k]++;}]));
 await assert.rejects(requireReady(i,effects),e=>e.code==='PLAN_BLOCKED'&&e.report.errors.some(x=>x.file===i.files.at(-1).name&&x.code==='UNKNOWN_STEP'));
 assert.deepEqual(calls,{launch:0,connect:0,http:0,write:0});
 fs.writeFileSync(path.join(__dirname,'logs/late-file-zero-effects.json'),JSON.stringify({kind:'MOCK effect counters, NOT real browser run',calls,error:'PLAN_BLOCKED',lastFile:i.files.at(-1).name},null,2)+'\n');
});
test('valid syntax but unsupported full plan is blocked before launch too',async()=>{let n=0;await assert.rejects(requireReady(inputs(),{launch:()=>n++}),e=>e.code==='PLAN_BLOCKED'&&e.report.errors.length===0);assert.equal(n,0);});
for(const sid of ['SUP-A','SUP-B'])test('known '+sid+' plain click rejected with real file/step index',()=>{
 const i=inputs(),f=i.files[1],s=f.action.steps.find(s=>s.input?.operation==='supplier.add.'+sid);s.input.type='click';s.input.dialog='none';delete s.input.expect;
 const r=audit(i);const e=r.errors.find(e=>e.code==='KNOWN_DIALOG_PLAIN_CLICK');assert.ok(e);assert.equal(e.file,f.name);assert.equal(e.stepIndex,f.action.steps.indexOf(s));assert.equal(e.selector,s.input.selector);
});
for(const [name,mutate,code]of [
 ['missing postconditions',s=>s.postconditions=[],'POSTCONDITION_REQUIRED'],
 ['unknown field',s=>s.force=true,'SCHEMA'],
 ['wrong source range',s=>s.source.lines=[1,1],'SOURCE_ANCHOR'],
 ['source hash wrong',s=>s.source.sha256='0'.repeat(64),'SOURCE_HASH'],
 ['unknown native selector',s=>s.input.selector='#guessed-selector','UNKNOWN_SELECTOR'],
 ['checkpoint cannot bypass',s=>s.input={type:'checkpoint',label:'accept anything'},'CHECKPOINT_BYPASS'],
 ['native unknown input',s=>s.input.type='evaluate-business-code','UNKNOWN_STEP'],
 ['native dialog policy missing',s=>delete s.input.dialog,'SCHEMA'],
 ['native capability substitution',s=>s.capability='view-controls','CAPABILITY']
])test(name,()=>{const i=inputs();mutate(firstNative(i));hasCode(audit(i),code);});
test('manifest omission/order difference rejected',()=>{const i=inputs();i.manifest.actionFiles.reverse();hasCode(audit(i),'MANIFEST');});
test('whole frozen source mismatch rejected',()=>{const i=inputs();i.sourceBytes=Buffer.from('not product');hasCode(audit(i),'SOURCE_IDENTITY');});
test('fixture file content changed rejected before runtime',()=>{const i=inputs();i.readFixture=()=>Buffer.from('changed');hasCode(audit(i),'FIXTURE_HASH');});
test('fixture path traversal rejected',()=>{const i=inputs();i.fixtureManifest.files[0].path='fixtures/../../real.pdf';hasCode(audit(i),'FIXTURE_PATH');});
test('unregistered file rejected',()=>{const i=inputs();i.files[2].action.steps.find(s=>s.kind==='file').args.files=['C:/REAL-COMPANY.pdf'];hasCode(audit(i),'FIXTURE_MISSING');});
test('unknown postcondition kind rejected, not treated as successful no-op',()=>{const i=inputs();firstNative(i).postconditions=[{kind:'evaluate',script:'writeToDB()'}];hasCode(audit(i),'POSTCONDITION_SCHEMA');});
test('aux cannot hide native confirm inside dialog expected',()=>{const i=inputs();i.files[1].action.steps.find(s=>s.kind==='duplicate-assignment').dialog='expected';hasCode(audit(i),'DIALOG_POLICY');});
test('missing source/selector fields not silently skipped',()=>{const i=inputs();delete i.files[2].action.steps.find(s=>s.kind==='file').selector;hasCode(audit(i),'SCHEMA');});
test('duplicate step identity rejected',()=>{const i=inputs();i.files[1].action.steps[0].id=i.files[0].action.steps[0].id;hasCode(audit(i),'DUPLICATE_STEP');});
test('arbitrary viewport not admitted',()=>{const i=inputs();i.files.at(-1).action.steps.find(s=>s.kind==='viewport').args.width=1;hasCode(audit(i),'ARGS');});
test('closed unknown native text/JS field rejected',()=>{const i=inputs();firstNative(i).input.expression='fetch(write)';hasCode(audit(i),'SCHEMA');});
test('partial quote fixture evaluated by unchanged frozen parser uses row THREE not old guessed2',()=>{
 const q=quoteAudit(source);assert.equal(q.partial.validCount,1);assert.equal(q.partial.skippedCount,1);assert.equal(q.partial.details,'3 行 BAD：多报');assert.ok(q.partial.message.endsWith('是否只提交 1 行？'));
 const i=inputs(),ss=i.files[4].action.steps.filter(s=>s.input?.operation==='quote.import.commit'&&s.input.scenario==='partial-fixture');assert.equal(ss.length,2);assert.equal(ss[0].input.expect[0].accept,false);assert.equal(ss[1].input.expect[0].accept,true);assert.equal(ss[1].input.expect[0].message,q.partial.message);
});
test('cancel decision does not mutate pure source round; valid/invalid partition exact',()=>{const p=sourceProbe(source);p.context.fixtureText=quoteAudit(source).partial.fixtureText;const before=JSON.stringify(p.round);const result=p.run('planQuoteImportCommit(parseQuoteRows(fixtureText))');assert.equal(JSON.stringify(p.round),before);assert.equal(result.valid[0].lineId,'RFQ-L00001');assert.equal(result.valid[0].priceParsed.price,10);assert.equal(result.skipped[0].coverageCheck,'多报');});
test('tier fixture resolves actual qty2 to9, overlapping9 rejected by frozen parser',()=>{const q=quoteAudit(source);assert.equal(q.effectiveForQty2,9);assert.ok(q.overlap.errors.includes('阶梯区间重叠'));});
test('frozen quote validator preserves noquote as null price, not zero',()=>{const p=sourceProbe(source);const r=p.run('validateQuotePreview([{itemRef:"RFQ-L00001",price:"",status:"noquote",lead:"",moq:"",remark:""}])');assert.equal(r[0].coverageCheck,'明确未报价');assert.equal(r[0].effectivePrice,null);});
test('frozen quote validator detects actual duplicate identity',()=>{const p=sourceProbe(source);const r=p.run('validateQuotePreview([{itemRef:"RFQ-L00001",price:"10",status:"quoted"},{itemRef:"RFQ-L00001",price:"11",status:"quoted"}])');assert.ok(r.every(x=>x.coverageCheck==='重复'));});
test('actual fixture ZIP CRCs and workbook rows/headers are valid',()=>{
 const a=fixtureAudit.audit(__dirname);assert.equal(a.files.length,14);
 const items=a.files.find(f=>f.path==='fixtures/items12.xlsx');assert.equal(items.rows.length,13);assert.ok(items.rows[0].includes('存货编码'));
 const cols=items.rows[0];assert.deepEqual(items.rows.slice(1).map(r=>r[cols.indexOf('询价数量')]),Array.from({length:12},(_,i)=>String(i+2)));
 const suppliers=a.files.find(f=>f.path==='fixtures/suppliers.xlsx');assert.equal(suppliers.rows.length,3);
 const qa=a.files.find(f=>f.path==='fixtures/A-R1.xlsx');assert.equal(qa.rows.length,13);assert.equal(qa.rows[0][0],'RFQ Line ID');assert.equal(qa.rows[1][0],'RFQ-L00001');assert.equal(qa.rows[1][1],'10');
});
test('all four PDF fixtures have internally correct xref and lengths; NOT rendering PASS',()=>{const r=fixtureAudit.audit(__dirname).files.filter(f=>f.path.endsWith('.pdf'));assert.equal(r.length,4);assert.ok(r.every(f=>f.structuralStatus==='PASS'&&f.rendering.startsWith('NOT TESTED')));assert.notEqual(r[0].sha256,r[1].sha256);});
test('invalid PDF fixture rejected by static parser',()=>assert.throws(()=>fixtureAudit.pdf(Buffer.from('%PDF-1.4\nbroken'))));
test('corrupt actual XLSX fixture CRC rejected',()=>{const b=Buffer.from(fs.readFileSync(path.join(__dirname,'fixtures/A-R1.xlsx')));const off=30+b.readUInt16LE(26)+b.readUInt16LE(28);b[off]^=1;assert.throws(()=>fixtureAudit.zip(b));});
test('S4 ordinary nonempty GUI plan explicitly expects ZERO restore requests, not409',()=>{
 const s=inputs().files[7].action.steps.find(s=>s.kind==='nonempty-ui-refusal');assert.equal(s.args.restoreRequests,0);assert.equal(s.dialog,'none');assert.ok(s.branch.includes('not409'));
 const r=audit(inputs());assert.ok(r.needsReview.some(s=>s.operation==='nonempty-server-race'));
});
test('hash-conflict plan does not falsely require uploaded orphan asset absent',()=>{
 const s=inputs().files[2].action.steps.find(s=>s.postconditions.some(p=>p.kind==='workspace'&&p.oracle.includes('unreferenced asset')));
 assert.ok(s);assert.ok(s.postconditions.some(p=>p.kind==='evidence'&&p.require.includes('asset inventory before/after')));
});
test('all five prompt cancellations retain explicit exact default and stop sequence',()=>{
 const s=inputs().files[4].action.steps.filter(s=>s.input?.operation==='quote.line.edit');assert.equal(s.length,6);
 for(let n=0;n<5;n++){assert.equal(s[n].input.expect.length,n+1);assert.equal(s[n].input.expect.at(-1).accept,false);assert.equal(s[n].input.expect.at(-1).promptText.mode,'cancel');}
});
test('full-plan gate cannot be opened by changing JSON capability registry or metadata',()=>{
 const i=inputs();i.manifest.executionStatus='PASS';const r=audit(i);assert.equal(r.status,'BLOCKED');assert.equal(r.runtimeAuthorization,false);
});
test('V1 imported schema/guard/CDP adapter files still exact prior evidence bytes',()=>{
 const p=JSON.parse(fs.readFileSync(path.join(__dirname,'v1-provenance.json')));for(const f of p)assert.equal(require('./source-probes.cjs').digest(fs.readFileSync(path.join(__dirname,'toolchain-v1',f.path))),f.sha256);
});
