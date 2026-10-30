'use strict';
// No browser/process/network dependencies. A future transport must implement this
// injected, target-bound contract. This round executes only the mock transport.
const {preflight}=require('./schema.cjs');
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});promise.catch(()=>{});return {promise,resolve,reject};}
class DialogGuard {
 constructor(adapter,{timeoutMs=8000,record=()=>{}}={}){
  if(!adapter.sessionId||!adapter.targetId)throw Error('Bound target/session required');
  if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>8000)throw Error('Bounded timeout required');
  this.adapter=adapter;this.session=adapter.sessionId;this.target=adapter.targetId;this.timeoutMs=timeoutMs;this.record=record;this.fatal=null;this.abort=deferred();this.active=null;this.timers=new Set();
  this.listener=e=>this.event(e);adapter.on('message',this.listener);
 }
 log(stage,data={}){this.record({stage,sessionId:this.session,targetId:this.target,...data});}
 stop(code,message,event){
  if(this.fatal)return;const e=Error(message);e.code=code;this.fatal=e;
  this.log('SAFE_STOP',{code,message,event});this.abort.reject(e);
  // Explicitly no handleJavaScriptDialog accept OR cancel on unknown dialogs.
  try{this.adapter.stop(e);}catch(stopError){this.log('transport-stop-error',{message:stopError.message});}
 }
 check(){if(this.fatal)throw this.fatal;}
 async race(task){this.check();return Promise.race([Promise.resolve(task),this.abort.promise]);}
 async bounded(task,label){
  let timer;const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{this.timers.delete(timer);this.stop('DIALOG_TIMEOUT','Bounded wait expired: '+label);reject(this.fatal);},this.timeoutMs);this.timers.add(timer);});
  try{return await this.race(Promise.race([task,timeout]));}finally{clearTimeout(timer);this.timers.delete(timer);}
 }
 event(event){
  if(!['Page.javascriptDialogOpening','Page.javascriptDialogClosed'].includes(event?.method)||this.fatal)return;
  this.log('dialog-event',{event});
  if(event.sessionId!==this.session||(event.targetId!==undefined&&event.targetId!==this.target)){this.stop('SESSION_MISMATCH','Dialog from wrong target/session',event);return;}
  const a=this.active;
  if(event.method==='Page.javascriptDialogOpening'){
   const i=a?.records.length??0,expected=a?.expect?.[i];
   if(!expected){this.stop('UNDECLARED_DIALOG','No declared dialog at this action/sequence position',event);return;}
   if(a.records.some(r=>!r.closed)){this.stop('DIALOG_ORDER','New opening before prior dialog closed',event);return;}
   const p=event.params||{};
   if(p.type!==expected.type||p.message!==expected.message||(p.type==='prompt'&&p.defaultPrompt!==expected.defaultPrompt)){
    this.stop('DIALOG_MISMATCH','Runtime dialog type/message/default differs from preflight policy',event);return;
   }
   const rec={expected,closed:false,closedWait:deferred(),ack:null};a.records.push(rec);
   const params={accept:expected.accept};if(expected.type==='prompt'&&expected.accept)params.promptText=expected.promptText.value;
   this.log('ack-issued',{index:i,method:'Page.handleJavaScriptDialog',params});
   // Event listener is already attached. Sending the ACK can itself deliver the
   // close and next prompt before the transport response Promise resolves.
   try{rec.ack=Promise.resolve(this.adapter.send('Page.handleJavaScriptDialog',params,this.session));}
   catch(e){rec.ack=Promise.reject(e);}
   rec.ack=rec.ack.then(v=>{this.log('ack-response',{index:i});return v;},e=>{this.stop('ACK_FAILED',e.message,event);throw e;});rec.ack.catch(()=>{});
   if(a.records.length===a.expect.length)a.allOpened.resolve();
  }else{
   const rec=a?.records.find(r=>!r.closed);
   if(!rec){this.stop('UNDECLARED_DIALOG_CLOSED','No matching opening',event);return;}
   const p=event.params||{};
   if(p.result!==rec.expected.accept||(rec.expected.type==='prompt'&&rec.expected.accept&&p.userInput!==rec.expected.promptText.value)){
    this.stop('DIALOG_CLOSE_MISMATCH','Dialog close result/input differs from declared decision',event);return;
   }
   rec.closed=true;this.log('closed-observed',{index:a.records.indexOf(rec),event});rec.closedWait.resolve();
  }
 }
 async step(step){
  this.check();const a={expect:step.expect||[],records:[],allOpened:deferred()};this.active=a;this.log('step-prearmed',{step});
  let work;
  try{
   if(step.type==='click'||step.type==='dialogClick')work=this.adapter.click(step.selector);
   else if(step.type==='fill')work=this.adapter.fill(step.selector,step.text);
   else if(step.type==='file')work=this.adapter.file(step.selector,step.files);
   else if(step.type==='key')work=this.adapter.key(step.selector,step.key);
   else if(step.type==='checkpoint')work=this.adapter.checkpoint(step.label);
   else throw Error('Uncompiled step type');
  }catch(e){work=Promise.reject(e);}
  const clicked=Promise.resolve(work).then(v=>{this.log('original-operation-response');return v;});clicked.catch(()=>{});
  try{
   const waits=[clicked];
   if(a.expect.length)waits.push(a.allOpened.promise.then(()=>Promise.all(a.records.map(r=>Promise.all([r.ack,r.closedWait.promise])))));
   await this.bounded(Promise.all(waits),'action/dialog lifecycle');this.check();
   this.log('step-complete');
   // Keep listener globally active: late openings between steps are undeclared.
   this.active=null;
  }catch(e){if(!this.fatal)this.stop('ACTION_FAILED',e.message);throw this.fatal||e;}
 }
 dispose(){this.adapter.off('message',this.listener);for(const t of this.timers)clearTimeout(t);this.timers.clear();}
}
async function executePlan({policy,files,sourceBytes,launch,record=()=>{},timeoutMs=8000}){
 const result=preflight({policy,files,sourceBytes});record({stage:'preflight',report:result.report});
 if(!result.plan){const e=Error('Preflight rejected; launch never called');e.code='PREFLIGHT_REJECTED';e.report=result.report;throw e;}
 if(result.plan.some(a=>a.purpose!=='buyer-plan')){const e=Error('Contract fixtures are not an executable buyer plan; launch never called');e.code='CONTRACT_ONLY';throw e;}
 // Immutable compiled snapshot prevents launch callback/action mutation from
 // changing the already checked selectors, sequence or decision strategy.
 const adapter=await launch();let guard,primary;
 try{
  guard=new DialogGuard(adapter,{record,timeoutMs});
  await guard.bounded(adapter.send('Page.enable',{},adapter.sessionId),'Page.enable');guard.check();
  for(const action of result.plan)for(const step of action.steps)await guard.step(step);
  return {status:'PASS',preflight:result.report};
 }catch(e){primary=e;throw e;}finally{
  guard?.dispose();try{await adapter.close();}catch(e){record({stage:'close-error',message:e.message});if(!primary)throw e;}
 }
}
module.exports={DialogGuard,executePlan};
