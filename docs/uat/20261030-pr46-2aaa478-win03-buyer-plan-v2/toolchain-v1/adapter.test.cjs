'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {runPreparedPlan}=require('./cdp-adapter.cjs');
const {PRODUCT_SHA}=require('./schema.cjs');
const policy=JSON.parse(fs.readFileSync(path.join(__dirname,'dialog-policy.json')));
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'actions/reviewed-contracts.json')));
const sourceBytes=fs.readFileSync(process.env.SRM_FROZEN_SOURCE);
const mockLog=path.join(__dirname,'adapter-mock-events.jsonl');fs.writeFileSync(mockLog,'');
function file(step){return {name:'adapter-mock.json',action:{schemaVersion:1,productSha:PRODUCT_SHA,name:'adapter-mock',purpose:'buyer-plan',steps:[step]}};}
class FakeWebSocket {
 static calls=[];static created=0;static expected;static unknown=false;static closed=0;
 constructor(){FakeWebSocket.created++;this.listeners=new Map();queueMicrotask(()=>this.emit('open',{}));}
 addEventListener(name,fn){if(!this.listeners.has(name))this.listeners.set(name,[]);this.listeners.get(name).push(fn);}
 emit(name,data){for(const fn of this.listeners.get(name)||[])fn(data);}
 incoming(message){this.emit('message',{data:JSON.stringify(message)});}
 response(request,result={}){this.incoming({id:request.id,result,...(request.sessionId?{sessionId:request.sessionId}:{})});}
 send(raw){const m=JSON.parse(raw);FakeWebSocket.calls.push(m);queueMicrotask(()=>{
  if(m.method==='Target.attachToTarget')this.response(m,{sessionId:'NATIVE-ADAPTER-MOCK-SESSION'});
  else if(m.method==='Runtime.evaluate')this.response(m,{result:{value:{x:11,y:22}}});
  else if(m.method==='Input.dispatchMouseEvent'&&m.params.type==='mouseReleased'){
   this.mouseReleased=m;const d=FakeWebSocket.expected;this.incoming({method:'Page.javascriptDialogOpening',sessionId:m.sessionId,params:{type:d.type,message:FakeWebSocket.unknown?'UNKNOWN RAW ALERT':d.message}});
  }else if(m.method==='Page.handleJavaScriptDialog'){
   this.incoming({method:'Page.javascriptDialogClosed',sessionId:m.sessionId,params:{result:m.params.accept}});this.response(m);this.response(this.mouseReleased);
  }else this.response(m);
 });}
 close(){FakeWebSocket.closed++;this.emit('close',{});}
}
function reset(){FakeWebSocket.calls=[];FakeWebSocket.created=0;FakeWebSocket.closed=0;FakeWebSocket.unknown=false;}
const options={policy,sourceBytes,browserWebSocket:'ws://127.0.0.1:64031/devtools/browser/mock-test-only',targetId:'FA1F5D7F2DB48652C7D5C3CFC695517A',artifactRoot:__dirname};
test('real adapter entry rejects bad plan before WebSocket constructor or connection',async()=>{
 reset();const native=globalThis.WebSocket;globalThis.WebSocket=FakeWebSocket;
 try{const s=structuredClone(corpus.steps.find(s=>s.operation==='supplier.add.SUP-A'));s.type='click';s.dialog='none';delete s.expect;
  await assert.rejects(runPreparedPlan({...options,files:[file(s)]}),e=>e.code==='PREFLIGHT_REJECTED');assert.equal(FakeWebSocket.created,0);assert.equal(FakeWebSocket.calls.length,0);
 }finally{globalThis.WebSocket=native;}
});
test('real adapter entry rejects contract-only corpus before WebSocket',async()=>{
 reset();const native=globalThis.WebSocket;globalThis.WebSocket=FakeWebSocket;
 try{await assert.rejects(runPreparedPlan({...options,files:[{name:'contracts.json',action:corpus}]}),e=>e.code==='CONTRACT_ONLY');assert.equal(FakeWebSocket.created,0);}finally{globalThis.WebSocket=native;}
});
test('native adapter + guard pipeline works with fully fake WebSocket; zero real sockets',async()=>{
 reset();const native=globalThis.WebSocket;globalThis.WebSocket=FakeWebSocket;const events=[];
 try{const s=structuredClone(corpus.steps.find(s=>s.operation==='supplier.add.SUP-A'));FakeWebSocket.expected=s.expect[0];
  const r=await runPreparedPlan({...options,files:[file(s)],record:e=>{events.push(e);fs.appendFileSync(mockLog,JSON.stringify({mock:true,time:new Date().toISOString(),...e})+'\n');}});assert.equal(r.status,'PASS');
  assert.equal(FakeWebSocket.created,1);assert.equal(FakeWebSocket.closed,1);
  const ack=FakeWebSocket.calls.filter(m=>m.method==='Page.handleJavaScriptDialog');assert.equal(ack.length,1);assert.equal(ack[0].sessionId,'NATIVE-ADAPTER-MOCK-SESSION');assert.deepEqual(ack[0].params,{accept:true});
  assert.equal(FakeWebSocket.calls.filter(m=>m.method==='Input.dispatchMouseEvent').length,2);
  assert.ok(events.find(e=>e.stage==='preflight').report.status==='PASS');assert.ok(events.find(e=>e.stage==='closed-observed'));
 }finally{globalThis.WebSocket=native;}
});
test('adapter unexpected dialog aborts pending mouse request without ACK or screenshot retry',async()=>{
 reset();const native=globalThis.WebSocket;globalThis.WebSocket=FakeWebSocket;
 try{const s=structuredClone(corpus.steps.find(s=>s.operation==='supplier.add.SUP-A'));FakeWebSocket.expected=s.expect[0];FakeWebSocket.unknown=true;
  await assert.rejects(runPreparedPlan({...options,files:[file(s)]}),e=>e.code==='DIALOG_MISMATCH');
  assert.equal(FakeWebSocket.calls.filter(m=>m.method==='Page.handleJavaScriptDialog'||m.method==='Page.captureScreenshot').length,0);assert.equal(FakeWebSocket.closed,1);
 }finally{globalThis.WebSocket=native;}
});
