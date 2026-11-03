const fs=require('node:fs'),path=require('node:path');
const {CDP}=require('./cdp.cjs');
const root=__dirname;
function store(name,value){fs.writeFileSync(path.join(root,name),JSON.stringify(value,null,2));}
async function main(){
 const p=JSON.parse(fs.readFileSync(path.join(root,'preflight.json')));
 const action=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 const c=await new CDP(p.browserWebSocket,path.join(root,'cdp-trace.jsonl')).connect();
 const mark=value=>fs.appendFileSync(path.join(root,'driver-events.jsonl'),JSON.stringify({time:new Date().toISOString(),action:action.name,targetId:p.targetId,sessionId:c.session,...value})+'\n');
 async function waitEvent(method,from,timeout=8000){const start=Date.now();while(Date.now()-start<timeout){const event=c.events.slice(from).find(e=>e.method===method&&e.sessionId===c.session);if(event)return event;await new Promise(r=>setTimeout(r,50));}throw Error('Expected same-session event absent: '+method);}
 async function key(key){const codes={Enter:13,Home:36,ArrowDown:40,ArrowUp:38,F5:116,Escape:27,Tab:9};for(const type of ['keyDown','keyUp'])await c.send('Input.dispatchKeyEvent',{type,key,code:key,windowsVirtualKeyCode:codes[key]||0},c.session);}
 async function dialogClick(s){
  const from=c.events.length;mark({stage:'dialog-prearmed',selector:s.selector,expectedMessage:s.message,expectedType:s.dialogType});
  const clicked=c.click(s.selector);clicked.catch(()=>{});
  const opened=await waitEvent('Page.javascriptDialogOpening',from);mark({stage:'dialog-opening-observed',event:opened});
  if(s.dialogType&&opened.params.type!==s.dialogType)throw Error('Unexpected dialog type '+opened.params.type);
  if(!s.message||!opened.params.message.includes(s.message))throw Error('Unexpected dialog message '+opened.params.message);
  mark({stage:'same-session-ack-issued'});await c.send('Page.handleJavaScriptDialog',{accept:s.accept,promptText:s.text},c.session);
  const closed=await waitEvent('Page.javascriptDialogClosed',from);mark({stage:'dialog-closed-observed',event:closed});
  await clicked;mark({stage:'mouse-release-promise-resolved'});
 }
 async function read(route){if(!route.startsWith('/api/'))throw Error('Read-only route required');const r=await fetch('http://127.0.0.1:8765'+route,{signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Read-only HTTP '+r.status);return r.json();}
 try{
  await c.page(p.targetId);mark({stage:'Page-enabled-and-events-subscribed'});
  const viewport=action.viewport||[1366,768];await c.send('Emulation.setDeviceMetricsOverride',{width:viewport[0],height:viewport[1],deviceScaleFactor:1,mobile:false},c.session);
  for(const s of action.steps||[]){
   mark({stage:'step-start',step:s});
   if(s.type==='navigate')await c.send('Page.navigate',{url:s.url},c.session);
   else if(s.type==='click')await c.click(s.selector);
   else if(s.type==='dialogClick')await dialogClick(s);
   else if(s.type==='fill')await c.fill(s.selector,s.text);
   else if(s.type==='key')await key(s.key);
   else if(s.type==='wait')await c.wait(s.expression,s.timeout||8000);
   else if(s.type==='checkpoint')store(action.name+'-'+s.label+'.dom.json',await c.dom());
   else if(s.type==='file'){const doc=await c.send('DOM.getDocument',{depth:0},c.session);const el=await c.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:s.selector},c.session);await c.send('DOM.setFileInputFiles',{nodeId:el.nodeId,files:s.files},c.session);}
   else if(s.type==='select'){const options=await c.eval('Array.from(document.querySelector('+JSON.stringify(s.selector)+').options).map(o=>o.value)');const i=options.indexOf(s.value);if(i<0)throw Error('Option absent '+s.value);await c.click(s.selector);await key('Home');for(let j=0;j<i;j++)await key('ArrowDown');await key('Enter');await c.wait('document.querySelector('+JSON.stringify(s.selector)+').value==='+JSON.stringify(s.value));}
   else if(s.type==='baseline'){const data=await read('/api/active');if(!data.workspace||data.workspace.state.projectName!==s.projectName)throw Error('Wrong RFQ binding');store('workspace-binding.json',{workspaceId:data.workspace.workspaceId,revision:data.workspace.revision,projectName:data.workspace.state.projectName});store(action.name+'-baseline.api.json',data);}
   else if(s.type==='watchSave'){
    const timeline=[];const start=Date.now();let pending=false,passed=false;
    while(Date.now()-start<8000){const v=await c.eval(`({status:document.querySelector('#srmUxWorkspaceSaveSummary')?.textContent.trim(),kind:document.querySelector('#srmUxWorkspaceSaveSummary')?.dataset.srmUxSave,raw:document.querySelector('#pilotAutosaveStatus')?.textContent,items:document.querySelector('#itemCount')?.textContent})`);timeline.push({time:new Date().toISOString(),...v});if(v.kind==='pending'||v.status==='有未保存修改')pending=true;if(v.kind==='error')throw Error('Actual save error '+v.raw);if(v.status==='已保存'&&pending){passed=true;break;}await new Promise(r=>setTimeout(r,100));}
    store(action.name+'-save-timeline.json',{timeline,pendingObserved:pending,savedAfterPending:passed,mode:'automatic-no-manual-save-click'});if(!passed)throw Error('Pending-to-saved transition not observed within original8s');
   }
   else if(s.type==='verifySQLite'){const binding=JSON.parse(fs.readFileSync(path.join(root,'workspace-binding.json')));const data=await read('/api/workspaces/'+encodeURIComponent(binding.workspaceId));const ws=data.workspace;store(action.name+'-sqlite.api.json',data);if(ws.workspaceId!==binding.workspaceId||ws.state.items.length!==s.count||ws.revision<=binding.revision)throw Error('Actual persisted revision/items mismatch');const ids=ws.state.items.map(i=>i.lineId);if(ids.some(id=>!id)||new Set(ids).size!==s.count)throw Error('RFQ Line ID integrity mismatch');}
   else if(s.type==='readOnly')store(action.name+'-'+s.label+'.api.json',await read(s.route));
   else if(s.type==='reload')await key('F5');
   else throw Error('Unsupported action '+s.type);
   mark({stage:'step-complete',type:s.type});
  }
  const dom=await c.dom();store(action.name+'.dom.json',dom);await c.screenshot(path.join(root,action.name+'.png'));store(action.name+'.result.json',{status:'PASS',exitCode:0,time:new Date().toISOString()});console.log(JSON.stringify(dom,null,2));
 }catch(e){mark({stage:'failure',stack:e.stack});fs.writeFileSync(path.join(root,action.name+'.error.log'),e.stack);try{store(action.name+'.failure.dom.json',await c.dom());}catch{}if(!String(e.message).includes('Page.captureScreenshot')){try{await c.screenshot(path.join(root,action.name+'.failure.png'));}catch(e2){fs.writeFileSync(path.join(root,action.name+'.failure-screenshot.error.log'),e2.stack);}}store(action.name+'.result.json',{status:'BLOCKED',exitCode:1,error:e.message});throw e;}
 finally{c.close();}
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
