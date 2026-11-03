'use strict';
const crypto = require('node:crypto');
const PRODUCT_SHA = '2aaa478c8f1966e41b9372d9d989c383dbaa1972';
const SOURCE_SHA256 = 'bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3';
const own = (o,k) => Object.hasOwn(o,k);
function fail(code,message){ const e=new Error(message); e.code=code; throw e; }
function object(v){return v!==null&&typeof v==='object'&&!Array.isArray(v);}
function keys(v,required,optional=[]){
 if(!object(v))fail('SCHEMA','Expected object');
 for(const k of required)if(!own(v,k))fail('SCHEMA','Missing '+k);
 for(const k of Object.keys(v))if(!required.includes(k)&&!optional.includes(k))fail('SCHEMA','Unknown property '+k);
}
function text(v,name,empty=false){if(typeof v!=='string'||(!empty&&!v.length)||v.length>8192)fail('SCHEMA','Invalid '+name);}
function integer(v,min=0,max=10000){if(!Number.isSafeInteger(v)||v<min||v>max)fail('SCHEMA','Invalid integer');}
function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function render(match,values={}){
 if(match.kind==='exact'){keys(match,['kind','value']);text(match.value,'message');keys(values,[]);return match.value;}
 keys(match,['kind','template','parameters']);if(match.kind!=='template')fail('POLICY','No wildcard/regex matcher allowed');
 text(match.template,'template');if(!object(match.parameters))fail('POLICY','Invalid template parameters');
 const tokens=[...match.template.matchAll(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g)].map(m=>m[1]);
 if(!tokens.length||Object.keys(match.parameters).some(k=>!tokens.includes(k)))fail('POLICY','Unbound template parameter');
 keys(values,[...new Set(tokens)]);
 for(const k of tokens){const rule=match.parameters[k];if(!rule)fail('POLICY','Missing template constraint');
  if(rule.kind==='integer'){keys(rule,['kind','min','max']);integer(rule.min);integer(rule.max,rule.min);integer(values[k],rule.min,rule.max);}
  else if(rule.kind==='enum'){keys(rule,['kind','values']);if(!Array.isArray(rule.values)||!rule.values.length||rule.values.some(v=>typeof v!=='string')||!rule.values.includes(values[k]))fail('SCHEMA','Unapproved template value '+k);}
  else fail('POLICY','Uncontrolled template constraint');
 }
 return match.template.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g,(_,k)=>String(values[k]));
}
function policyCheck(p){
 keys(p,['schemaVersion','productSha','source','operations','needsReview']);
 if(p.schemaVersion!==1||p.productSha!==PRODUCT_SHA||p.source.sha256!==SOURCE_SHA256)fail('POLICY','Frozen product identity mismatch');
 keys(p.source,['path','sha256']);if(p.source.path!=='prototype/m1-lite/index.html')fail('POLICY','Wrong source');
 if(!Array.isArray(p.operations)||!p.operations.length)fail('POLICY','Empty operation registry');
 const ids=new Set(),selectors=new Map();
 for(const op of p.operations){
  keys(op,['id','selector','stepTypes','source','scenarios','reviewStatus']);text(op.id,'operation');text(op.selector,'selector');
  if(!['reviewed','needs-review'].includes(op.reviewStatus))fail('POLICY','Explicit review status required');
  if(ids.has(op.id)||selectors.has(op.selector))fail('POLICY','Duplicate operation/selector');ids.add(op.id);selectors.set(op.selector,op);
  if(!Array.isArray(op.stepTypes)||!op.stepTypes.length||op.stepTypes.some(t=>!['click','dialogClick','fill','file','key'].includes(t)))fail('POLICY','Invalid stepTypes');
  keys(op.source,['function','lines','anchor']);text(op.source.anchor,'source anchor');text(op.source.function,'function');
  if(!Array.isArray(op.source.lines)||op.source.lines.length!==2)fail('POLICY','Source lines required');op.source.lines.forEach(n=>integer(n,1));if(op.source.lines[1]<op.source.lines[0])fail('POLICY','Reversed source lines');
  if(!Array.isArray(op.scenarios)||!op.scenarios.length)fail('POLICY','Scenarios required');const seen=new Set();
  for(const s of op.scenarios){keys(s,['id','when','postconditions','dialogs']);text(s.id,'scenario');if(seen.has(s.id))fail('POLICY','Duplicate scenario');seen.add(s.id);
   for(const list of [s.when,s.postconditions])if(!Array.isArray(list)||!list.length||list.some(x=>typeof x!=='string'||!x.length))fail('POLICY','Explicit conditions required');
   if(!Array.isArray(s.dialogs)||s.dialogs.length>8)fail('POLICY','Invalid dialog sequence');
   for(const d of s.dialogs){keys(d,['type','message','decisions'],['defaultPrompt']);if(!['alert','confirm','prompt'].includes(d.type))fail('POLICY','Unknown dialog type');
    if(!Array.isArray(d.decisions)||!d.decisions.length||d.decisions.some(v=>!['accept','cancel'].includes(v))||(d.type==='alert'&&d.decisions.some(v=>v!=='accept')))fail('POLICY','Invalid accept/cancel policy');
    if(d.type==='prompt'){keys(d.defaultPrompt,['kind','values']);if(d.defaultPrompt.kind!=='enum'||!Array.isArray(d.defaultPrompt.values)||d.defaultPrompt.values.some(v=>typeof v!=='string'))fail('POLICY','Prompt defaults required');}
    else if(own(d,'defaultPrompt'))fail('POLICY','Non-prompt default');
    if(d.message.kind==='exact')render(d.message,{});else {keys(d.message,['kind','template','parameters']);if(d.message.kind!=='template')fail('POLICY','Wildcard matcher forbidden');const vals={};for(const [k,v] of Object.entries(d.message.parameters))vals[k]=v.kind==='integer'?v.min:v.values?.[0];render(d.message,vals);}
   }
  }
 }
 if(!Array.isArray(p.needsReview))fail('POLICY','needsReview must be explicit');
 return selectors;
}
function compileStep(s,p){
 if(!object(s))fail('SCHEMA','Step must be object');
 if(!['click','dialogClick','fill','file','key','checkpoint'].includes(s.type))fail('UNKNOWN_STEP','Unknown step type '+s.type);
 if(s.type==='checkpoint'){keys(s,['type','label']);text(s.label,'label');return structuredClone(s);}
 const common=['type','operation','selector','scenario','dialog'];
 const extra=s.type==='dialogClick'?['expect']:s.type==='fill'?['text']:s.type==='file'?['files']:s.type==='key'?['key']:[];
 keys(s,[...common,...extra]);text(s.selector,'selector');
 const op=p.operations.find(o=>o.id===s.operation);if(!op)fail('UNKNOWN_OPERATION','Unknown operation');
 if(op.reviewStatus!=='reviewed')fail('NEEDS_REVIEW','Operation fixture/branch is not approved for an executable plan');
 if(!p.operations.some(o=>o.selector===s.selector))fail('UNKNOWN_SELECTOR','Unknown selector');
 if(op.selector!==s.selector)fail('OPERATION_SELECTOR','Operation/selector mismatch');
 if(!op.stepTypes.includes(s.type))fail('STEP_POLICY','Step type forbidden by operation');
 const scenario=op.scenarios.find(c=>c.id===s.scenario);if(!scenario)fail('SCENARIO','Unknown/unreviewed trigger scenario');
 if(!['none','expected'].includes(s.dialog))fail('DIALOG_POLICY','Explicit dialog:none/expected required');
 if(scenario.dialogs.length){
  if(s.type!=='dialogClick'||s.dialog!=='expected')fail('KNOWN_DIALOG_PLAIN_CLICK','Known dialog requires dialogClick + dialog:expected');
  if(!Array.isArray(s.expect)||!s.expect.length||s.expect.length>scenario.dialogs.length)fail('DIALOG_SEQUENCE','Invalid dialog sequence length');
  for(let i=0;i<s.expect.length;i++){
   const a=s.expect[i],d=scenario.dialogs[i];keys(a,['type','message','values','accept'],d.type==='prompt'?['promptText','defaultPrompt']:[]);
   if(a.type!==d.type)fail('DIALOG_TYPE','Dialog type mismatch');if(typeof a.accept!=='boolean'||!d.decisions.includes(a.accept?'accept':'cancel'))fail('DIALOG_DECISION','Unapproved accept/cancel strategy');
   if(a.message!==render(d.message,a.values))fail('DIALOG_MESSAGE','Message differs from exact controlled policy');
   if(d.type==='prompt'){
    if(!own(a,'promptText')||!own(a,'defaultPrompt'))fail('PROMPT_POLICY','Prompt text/cancel and default policy required');
    if(!d.defaultPrompt.values.includes(a.defaultPrompt))fail('PROMPT_DEFAULT','Unapproved prompt default');
    if(a.accept){keys(a.promptText,['mode','value']);if(a.promptText.mode!=='text')fail('PROMPT_POLICY','Explicit text required');text(a.promptText.value,'prompt text',true);}
    else {keys(a.promptText,['mode']);if(a.promptText.mode!=='cancel')fail('PROMPT_POLICY','Explicit cancel required');}
   }
   if(!a.accept&&i!==s.expect.length-1)fail('DIALOG_SEQUENCE','Cancel must terminate the entire edit/action');
  }
  if(s.expect.length!==scenario.dialogs.length&&s.expect.at(-1).accept)fail('DIALOG_SEQUENCE','Incomplete accepted sequence');
 }else if(s.type==='dialogClick'||s.dialog!=='none')fail('DIALOG_POLICY','Reviewed no-dialog scenario requires dialog:none');
 if(s.type==='fill')text(s.text,'fill',true);
 if(s.type==='file'){if(!Array.isArray(s.files)||s.files.length!==1||s.files.some(f=>typeof f!=='string'||!/^fixtures\/[a-zA-Z0-9_-]+\.xlsx$/.test(f)))fail('FILE_POLICY','Only declared relative fictional fixtures allowed');}
 if(s.type==='key'&&!['Enter','Tab','Escape'].includes(s.key))fail('KEY_POLICY','Unreviewed key');
 return {...structuredClone(s),conditions:scenario.when,postconditions:scenario.postconditions};
}
function preflight({policy,files,sourceBytes}){
 const errors=[],compiled=[];
 const error=(file,index,step,e)=>errors.push({file,stepIndex:index,selector:step?.selector??null,expectedPolicy:policy?.operations?.find?.(o=>o.selector===step?.selector)?.scenarios??null,actualPolicy:step??null,code:e.code||'SCHEMA',reason:e.message});
 try{policyCheck(policy);if(!Buffer.isBuffer(sourceBytes)||crypto.createHash('sha256').update(sourceBytes).digest('hex')!==SOURCE_SHA256)fail('SOURCE_IDENTITY','Frozen source bytes mismatch');
  const lines=sourceBytes.toString('utf8').split('\n');for(const o of policy.operations)if(!lines.slice(o.source.lines[0]-1,o.source.lines[1]).join('\n').includes(o.source.anchor))fail('SOURCE_ANCHOR','Source anchor absent from declared line range: '+o.id);
 }catch(e){error('<policy/source>',null,null,e);}
 if(!Array.isArray(files)||!files.length)error('<manifest>',null,null,Error('No action files'));
 else for(const file of files){try{keys(file,['name','action']);keys(file.action,['schemaVersion','productSha','name','purpose','steps']);
   const a=file.action;if(a.schemaVersion!==1||a.productSha!==PRODUCT_SHA)fail('SCHEMA','Action version/product SHA mismatch');text(a.name,'action name');if(!['contract-test','buyer-plan'].includes(a.purpose))fail('SCHEMA','Explicit action purpose required');if(!Array.isArray(a.steps)||!a.steps.length)fail('SCHEMA','Empty steps');
   const steps=[];for(let i=0;i<a.steps.length;i++){const s=a.steps[i];try{steps.push(compileStep(s,policy));}catch(e){error(file.name,i,s,e);}}compiled.push({file:file.name,name:a.name,purpose:a.purpose,steps});
  }catch(e){error(file?.name??'<invalid>',null,null,e);}}
 const report={schemaVersion:1,status:errors.length?'REJECTED':'PASS',productSha:PRODUCT_SHA,actionFiles:files?.length??0,stepCount:compiled.reduce((n,a)=>n+a.steps.length,0),errors,browserStarts:0,httpBusinessRequests:0,businessWrites:0};
 return {report,plan:errors.length?null:freeze(structuredClone(compiled))};
}
module.exports={PRODUCT_SHA,SOURCE_SHA256,keys,render,policyCheck,compileStep,preflight};
