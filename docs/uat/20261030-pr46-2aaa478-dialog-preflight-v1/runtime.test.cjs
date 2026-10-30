'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const fs=require('node:fs'),path=require('node:path');
const {executePlan}=require('./guarded-driver.cjs');
const {PRODUCT_SHA}=require('./schema.cjs');
const policy=JSON.parse(fs.readFileSync(path.join(__dirname,'dialog-policy.json')));
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'actions/reviewed-contracts.json')));
const sourceBytes=fs.readFileSync(process.env.SRM_FROZEN_SOURCE);
const mockLog=path.join(__dirname,'runtime-mock-events.jsonl');fs.writeFileSync(mockLog,'');
function step(id,scenario){return structuredClone(corpus.steps.find(s=>s.operation===id&&(!scenario||s.scenario===scenario)));}
function defer(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
class MockCDP extends EventEmitter {
 constructor(dialogs=[],options={}){super();this.dialogs=structuredClone(dialogs);this.options=options;this.sessionId='SAME-SESSION';this.targetId='SAME-TARGET';this.calls=[];this.index=0;this.stops=0;this.closes=0;}
 emitOpening(){const d=this.dialogs[this.index];if(d)this.emit('message',{method:'Page.javascriptDialogOpening',sessionId:this.options.wrongSession?'FOREIGN':this.sessionId,targetId:this.options.wrongTarget?'FOREIGN':this.targetId,params:{type:d.type,message:d.message,...(d.type==='prompt'?{defaultPrompt:d.defaultPrompt}:{})}});}
 send(method,params,session){
  this.calls.push({method,params,session});
  if(method==='Page.enable'){assert.equal(session,this.sessionId);if(this.options.beforeAction)queueMicrotask(()=>this.emitOpening());return Promise.resolve({});}
  assert.equal(method,'Page.handleJavaScriptDialog');assert.equal(session,this.sessionId);
  if(this.options.ackFail)return Promise.reject(Error('simulated ack failure'));
  if(this.options.noClosed)return Promise.resolve({});
  return new Promise(resolve=>queueMicrotask(()=>{
   this.emit('message',{method:'Page.javascriptDialogClosed',sessionId:this.options.wrongClose?'OTHER':this.sessionId,params:{result:this.options.wrongResult?!params.accept:params.accept,...(this.dialogs[this.index]?.type==='prompt'?{userInput:params.promptText??''}:{})}});
   this.index++;
   // Next prompt BEFORE prior ACK response is an intentional race regression.
   if(this.index<this.dialogs.length)this.emitOpening();
   else if(this.options.extraDialog)this.emit('message',{method:'Page.javascriptDialogOpening',sessionId:this.sessionId,params:{type:'confirm',message:'UNEXPECTED EXTRA'}});
   else this.clickPending?.resolve();
   resolve({});
  }));
 }
 click(selector){this.calls.push({method:'mousePressed',selector});this.calls.push({method:'mouseReleased',selector});this.clickPending=defer();
  if(this.options.clickFail)this.clickPending.reject(Error('simulated click failure'));
  else if(this.dialogs.length&&!this.options.neverOpens)queueMicrotask(()=>this.emitOpening());else if(!this.options.neverOpens)this.clickPending.resolve();return this.clickPending.promise;
 }
 fill(selector,text){this.calls.push({method:'fill',selector,text});return Promise.resolve();}
 file(selector,files){this.calls.push({method:'file',selector,files});return Promise.resolve();}
 key(selector,key){this.calls.push({method:'key',selector,key});return Promise.resolve();}
 checkpoint(label){this.calls.push({method:'checkpoint',label});return Promise.resolve();}
 stop(e){this.stops++;this.clickPending?.reject(e);}
 close(){this.closes++;return Promise.resolve();}
}
function run(s,m,extra={}){const events=[];const options={policy,sourceBytes,files:[{name:'mock-only.json',action:{schemaVersion:1,productSha:PRODUCT_SHA,name:'mock-only',purpose:'buyer-plan',steps:Array.isArray(s)?s:[s]}}],launch:async()=>m,record:e=>{events.push(e);fs.appendFileSync(mockLog,JSON.stringify({mock:true,time:new Date().toISOString(),...e})+'\n');},timeoutMs:100,...extra};return {events,promise:executePlan(options)};}
test('same-session opening→ack→closed→original click completion; listener armed first',async()=>{const s=step('supplier.add.SUP-A'),m=new MockCDP(s.expect);const r=run(s,m);assert.equal((await r.promise).status,'PASS');
 const stages=r.events.map(e=>e.stage);for(const [a,b] of [['step-prearmed','dialog-event'],['dialog-event','ack-issued'],['ack-issued','closed-observed'],['closed-observed','original-operation-response'],['original-operation-response','step-complete']])assert.ok(stages.indexOf(a)<stages.indexOf(b),a+' precedes '+b);
 assert.equal(m.calls.filter(c=>c.method==='Page.handleJavaScriptDialog')[0].session,'SAME-SESSION');assert.equal(m.stops,0);assert.equal(m.closes,1);assert.equal(m.listenerCount('message'),0);
});
for(const type of ['alert','confirm','prompt'])test('dialog:none runtime '+type+' stops immediately; no accept/deny',async()=>{const s=step('nav.items');const m=new MockCDP([{type,message:'UNKNOWN RAW '+type,defaultPrompt:'secret-fictional'}]);const r=run(s,m);await assert.rejects(r.promise,e=>e.code==='UNDECLARED_DIALOG');assert.equal(m.calls.filter(c=>c.method==='Page.handleJavaScriptDialog').length,0);assert.equal(m.stops,1);assert.equal(m.closes,1);assert.equal(r.events.find(e=>e.stage==='SAFE_STOP').event.params.message,'UNKNOWN RAW '+type);});
for(const [name,change] of [['type',d=>d.type='alert'],['message',d=>d.message+=' mismatch'],['prompt default',d=>d.defaultPrompt='unexpected']])test('runtime mismatched '+name+' never ACKed',async()=>{const s=step(name==='prompt default'?'quote.line.edit':'supplier.add.SUP-A');const dialogs=structuredClone(s.expect);change(dialogs[0]);const m=new MockCDP(dialogs),r=run(s,m);await assert.rejects(r.promise,e=>e.code==='DIALOG_MISMATCH');assert.equal(m.calls.filter(c=>c.method==='Page.handleJavaScriptDialog').length,0);});
for(const option of ['wrongSession','wrongTarget','wrongClose'])test(option+' fails closed with no foreign-session ACK',async()=>{const s=step('supplier.add.SUP-A'),m=new MockCDP(s.expect,{[option]:true}),r=run(s,m);await assert.rejects(r.promise,e=>e.code==='SESSION_MISMATCH');assert.ok(m.calls.filter(c=>c.method==='Page.handleJavaScriptDialog').every(c=>c.session==='SAME-SESSION'));if(option!=='wrongClose')assert.equal(m.calls.filter(c=>c.method==='Page.handleJavaScriptDialog').length,0);});
test('five sequential prompts accept exact explicit texts even if next opens before ACK response',async()=>{const s=step('quote.line.edit');s.expect.forEach((d,i)=>d.promptText.value=['11','6','2','quoted','虚构备注'][i]);const m=new MockCDP(s.expect),r=run(s,m);await r.promise;const calls=m.calls.filter(c=>c.method==='Page.handleJavaScriptDialog');assert.equal(calls.length,5);assert.deepEqual(calls.map(c=>c.params.promptText),['11','6','2','quoted','虚构备注']);assert.equal(r.events.filter(e=>e.stage==='closed-observed').length,5);});
for(let i=0;i<5;i++)test('prompt cancel at '+i+' sends accept:false, no text, no later prompt',async()=>{const s=step('quote.line.edit');s.expect=s.expect.slice(0,i+1);s.expect[i].accept=false;s.expect[i].promptText={mode:'cancel'};const m=new MockCDP(s.expect),r=run(s,m);await r.promise;const calls=m.calls.filter(c=>c.method==='Page.handleJavaScriptDialog');assert.equal(calls.length,i+1);assert.deepEqual(calls.at(-1).params,{accept:false});});
test('confirm cancel no automatic following success alert',async()=>{const s=step('quote.carry.confirm');s.expect=s.expect.slice(0,1);s.expect[0].accept=false;const m=new MockCDP(s.expect),r=run(s,m);await r.promise;assert.deepEqual(m.calls.at(-1).params,{accept:false});});
test('confirm→success alert ordered and exact',async()=>{const s=step('quote.carry.confirm'),m=new MockCDP(s.expect),r=run(s,m);await r.promise;assert.equal(m.calls.filter(c=>c.method==='Page.handleJavaScriptDialog').length,2);});
test('extra unplanned dialog safely stops with no extra ACK',async()=>{const s=step('supplier.add.SUP-A'),m=new MockCDP(s.expect,{extraDialog:true}),r=run(s,m);await assert.rejects(r.promise,e=>e.code==='UNDECLARED_DIALOG');assert.equal(m.calls.filter(c=>c.method==='Page.handleJavaScriptDialog').length,1);});
test('dialog while enabling Page stops before first click',async()=>{const s=step('nav.items'),m=new MockCDP([{type:'alert',message:'unexpected on enable'}],{beforeAction:true}),r=run(s,m);await assert.rejects(r.promise,e=>e.code==='UNDECLARED_DIALOG');assert.equal(m.calls.filter(c=>c.method==='mousePressed').length,0);assert.equal(m.calls.filter(c=>c.method==='Page.handleJavaScriptDialog').length,0);});
for(const [option,code] of [['neverOpens','DIALOG_TIMEOUT'],['noClosed','DIALOG_TIMEOUT'],['ackFail','ACK_FAILED'],['clickFail','ACTION_FAILED'],['wrongResult','DIALOG_CLOSE_MISMATCH']])test('bounded failure '+option+' cleans up without late/foreign ACK',async()=>{const s=step('supplier.add.SUP-A'),m=new MockCDP(s.expect,{[option]:true}),r=run(s,m,{timeoutMs:25});await assert.rejects(r.promise,e=>e.code===code);assert.equal(m.stops,1);assert.equal(m.closes,1);assert.equal(m.listenerCount('message'),0);});
test('compiled snapshot cannot be changed by launch callback',async()=>{const s=step('supplier.add.SUP-A'),m=new MockCDP(s.expect);const r=run(s,m,{launch:async()=>{s.selector='#bad';s.expect[0].accept=false;return m;}});await r.promise;assert.equal(m.calls.find(c=>c.method==='mousePressed').selector,"#supplierList [data-add='SUP-A']");assert.equal(m.calls.find(c=>c.method==='Page.handleJavaScriptDialog').params.accept,true);});
test('unknown dialog stops entire plan before subsequent action',async()=>{const m=new MockCDP([{type:'confirm',message:'unknown'}]);const r=run([step('nav.items'),step('nav.assign')],m);await assert.rejects(r.promise,e=>e.code==='UNDECLARED_DIALOG');assert.equal(m.calls.filter(c=>c.method==='mousePressed').length,1);assert.equal(r.events.filter(e=>e.stage==='SAFE_STOP').length,1);assert.ok(!r.events.some(e=>e.code==='DIALOG_TIMEOUT'));});
test('invalid adapter binding is closed; original error preserved if close fails',async()=>{let closed=0;const m={close(){closed++;throw Error('secondary close error');}};const r=run(step('nav.items'),m);await assert.rejects(r.promise,/Bound target\/session/);assert.equal(closed,1);assert.ok(r.events.find(e=>e.stage==='close-error'));});
