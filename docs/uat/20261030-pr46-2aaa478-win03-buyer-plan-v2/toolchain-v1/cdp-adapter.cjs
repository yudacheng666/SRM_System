'use strict';
// Target-bound native Node24 CDP adapter for the guarded entry point. This module
// has no top-level connections and never launches Edge or a business service.
const {EventEmitter}=require('node:events');
const fs=require('node:fs'),path=require('node:path');
const {executePlan}=require('./guarded-driver.cjs');
class BoundCDP extends EventEmitter {
 constructor(url,targetId,root,record){super();const u=new URL(url);
  if(u.protocol!=='ws:'||u.hostname!=='127.0.0.1'||!u.port||u.username||u.password||u.search||u.hash||!/^\/devtools\/browser\/[a-zA-Z0-9-]+$/.test(u.pathname))throw Error('Own loopback browser websocket required');
  if(!/^[A-Fa-f0-9]{16,64}$/.test(targetId))throw Error('Explicit targetId required');
  this.url=url;this.targetId=targetId;this.root=path.resolve(root);this.record=record;this.seq=0;this.pending=new Map();this.stopped=false;
 }
 async connect(){
  this.ws=new WebSocket(this.url);
  this.ws.addEventListener('message',e=>{let m;try{m=JSON.parse(e.data);}catch{this.stop(Error('Invalid CDP message'));return;}
   this.record({stage:'cdp-in',message:m});
   if(m.id){const p=this.pending.get(m.id);if(p){this.pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}
   else this.emit('message',m);
  });
  this.ws.addEventListener('close',()=>this.stop(Error('CDP socket closed')));
  this.ws.addEventListener('error',()=>this.stop(Error('CDP websocket error')));
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('CDP connect timeout')),5000);
   this.ws.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});
   this.ws.addEventListener('error',()=>{clearTimeout(timer);reject(Error('CDP websocket error'));},{once:true});
  });
  const attached=await this.send('Target.attachToTarget',{targetId:this.targetId,flatten:true});this.sessionId=attached.sessionId;
  if(typeof this.sessionId!=='string'||!this.sessionId)throw Error('No target session');return this;
 }
 send(method,params={},sessionId){
  if(this.stopped)return Promise.reject(Error('CDP stopped'));
  const message={id:++this.seq,method,params,...(sessionId?{sessionId}:{})};this.record({stage:'cdp-out',message});
  return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(message.id);reject(Error('CDP timeout '+method));},12000);
   this.pending.set(message.id,{resolve,reject,timer});try{this.ws.send(JSON.stringify(message));}catch(e){clearTimeout(timer);this.pending.delete(message.id);reject(e);}
  });
 }
 async evaluate(expression){const r=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},this.sessionId);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
 async click(selector){
  const b=await this.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)throw Error('Missing/disabled control');e.scrollIntoView({block:'center'});const b=e.getBoundingClientRect();if(!b.width||!b.height)throw Error('Invisible control');return {x:b.x+b.width/2,y:b.y+b.height/2}})()`);
  for(const type of ['mousePressed','mouseReleased'])await this.send('Input.dispatchMouseEvent',{type,x:b.x,y:b.y,button:'left',clickCount:1},this.sessionId);
 }
 async fill(selector,text){await this.click(selector);for(const type of ['keyDown','keyUp'])await this.send('Input.dispatchKeyEvent',{type,key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65},this.sessionId);await this.send('Input.insertText',{text},this.sessionId);}
 async key(selector,key){await this.click(selector);const codes={Enter:13,Escape:27,Tab:9};for(const type of ['keyDown','keyUp'])await this.send('Input.dispatchKeyEvent',{type,key,code:key,windowsVirtualKeyCode:codes[key]},this.sessionId);}
 async file(selector,files){
  const paths=files.map(file=>{const p=path.resolve(this.root,file);if(!p.startsWith(this.root+path.sep))throw Error('Fixture path escaped');if(!fs.statSync(p).isFile())throw Error('Fixture missing');return p;});
  const doc=await this.send('DOM.getDocument',{depth:0},this.sessionId);const node=await this.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector},this.sessionId);if(!node.nodeId)throw Error('File control missing');await this.send('DOM.setFileInputFiles',{nodeId:node.nodeId,files:paths},this.sessionId);
 }
 async checkpoint(label){const value=await this.evaluate('({url:location.href,text:document.body.innerText})');this.record({stage:'checkpoint',label,value});}
 stop(error){if(this.stopped)return;this.stopped=true;this.record({stage:'transport-stopped',message:error.message});for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(error);}this.pending.clear();this.ws?.close();}
 async close(){this.stop(Error('Guarded driver closed'));}
}
async function runPreparedPlan({policy,files,sourceBytes,browserWebSocket,targetId,artifactRoot,record=()=>{}}){
 // Crucial ordering: executePlan validates ALL files/source before invoking this
 // factory. No old act-alert.cjs entry point is used or silently patched.
 return executePlan({policy,files,sourceBytes,record,launch:async()=>{
  const c=new BoundCDP(browserWebSocket,targetId,artifactRoot,record);try{return await c.connect();}catch(e){await c.close();throw e;}
 }});
}
module.exports={runPreparedPlan};
