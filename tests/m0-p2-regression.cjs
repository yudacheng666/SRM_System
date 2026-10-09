// 中文：P2 检查全部错误预览、供应商关系变更确认、演示价格标识及 100×10 多轮测试样本。
 // English: P2 verifies full import exceptions, supplier-link confirmation, demo price labels and 100×10 multi-round fixtures.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../prototype/m0/index.html'),'utf8');
const fixtureDir=path.join(__dirname,'fixtures','generated');
function extract(name){
  const marker='function '+name+'(',i=source.indexOf(marker);
  assert.ok(i>=0,'missing function '+name);
  const b=source.indexOf('{',i);let depth=0,q='',esc=false;
  for(let k=b;k<source.length;k++){
    const c=source[k];
    if(q){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===q)q='';continue}
    if(c==='"'||c==="'"||c==='\x60'){q=c;continue}
    if(c==='{')depth++;if(c==='}'&&--depth===0)return source.slice(i,k+1);
  }
  throw Error('unbalanced function '+name);
}
function run(prelude,names,expression){return new Function(prelude+'\n'+names.map(extract).join('\n')+'\nreturn ('+expression+');')()}
let total=0;
function check(name,value){assert.equal(value,true,name);total++;process.stdout.write('PASS '+name+'\n')}
const importFns=['itemMergeCheck','planItemImport','itemImportPreviewPlan'];
const importContext=[
'const items=[],assignments=new Map(),quoteRounds=[];',
'const getSet=id=>assignments.get(id)||new Set();',
'const rows=Array.from({length:125},(_,i)=>({id:"P-"+i,lineId:"L-"+i,name:"模拟物料",cat:"A",unit:"件",qty:2,_rowNo:i+2,_errors:i===115?["第 117 行示例错误"]:[]}));'
].join('\n');
check('AUD09 late row exception is never dropped by planning',run(importContext,importFns,
  '(()=>{const x=itemImportPreviewPlan(rows);return x.actions.length===125&&x.problems.length===1&&x.problems[0].row._rowNo===117})()'));
check('AUD09 zero-problem import keeps complete plan',run(importContext,importFns,
  '(()=>{rows[115]._errors=[];const x=itemImportPreviewPlan(rows);return x.actions.length===125&&x.problems.length===0})()'));
// 中文：运行真实预览函数，模拟必要的 DOM 节点；无需网络或浏览器驱动。
 // English: Run the actual preview function against minimal DOM stubs, without a browser driver.
const renderStart=source.indexOf('function renderItemImportPreview(source){');
const renderEnd=source.indexOf('\nfunction setImportPreview(rows,source){',renderStart);
assert.ok(renderStart>0&&renderEnd>renderStart);
const renderCode=source.slice(renderStart,renderEnd);
const domPrelude=importContext.replace('_errors:i===115?','_errors:i===115?')+
  '\nconst pendingImportRows=rows,itemImportPreviewState={page:0,onlyProblems:false};'+
  'const importPreview={innerHTML:""},esc=x=>String(x??"");'+
  'const controls={confirmImportRows:{},toggleImportProblems:{},itemImportPager:{}};'+
  'const document={getElementById:id=>controls[id]};'+
  'const addRowsToRfq=()=>{};let nav=null;'+
  'const renderPageNav=(el,page,total,size,onPage)=>{nav={page,total,size,onPage}};';
function previewTest(expr){return new Function(domPrelude+'\n'+importFns.map(extract).join('\n')+'\n'+renderCode+'\nreturn ('+expr+');')()}
check('AUD09 preview paginates 125 rows rather than only rendering first 50',previewTest(
  '(()=>{renderItemImportPreview("M0 测试");return nav.total===125&&nav.size===50&&importPreview.innerHTML.includes("1–50 / 125")})()'));
check('AUD09 final page and error-only mode expose row 117',previewTest(
  '(()=>{itemImportPreviewState.page=2;renderItemImportPreview("测试");const later=importPreview.innerHTML.includes("117")&&nav.page===2;itemImportPreviewState.onlyProblems=true;renderItemImportPreview("测试");return later&&nav.total===1&&importPreview.innerHTML.includes("117")})()'));
check('AUD09 any error disables importing entire batch',previewTest(
  '(()=>{renderItemImportPreview("测试");return importPreview.innerHTML.includes("confirmImportRows")&&importPreview.innerHTML.includes("disabled")})()'));
const bulkStart=source.indexOf('function applySupplierBulkChange('),bulkEnd=source.indexOf('\nsfLinkFiltered.onclick=',bulkStart);
assert.ok(bulkStart>=0&&bulkEnd>bulkStart);
const bulkCode=source.slice(bulkStart,bulkEnd);
const supplierBase=[
'const suppliers=[{id:"S1",name:"示例供应商"}],assignments=new Map([["L1",new Set()],["L2",new Set()]]);',
'const getSet=id=>assignments.get(id);let dialogs=[],updated=0,lastMessage="";',
'let permission=true,historyAllowed=true;',
'const confirm=msg=>{dialogs.push(msg);return permission};',
'const guardMutableLines=()=>historyAllowed;',
'const changeSupplierRelations=(ids,sid,mode)=>{updated+=ids.length;ids.forEach(id=>getSet(id).add(sid));return ids.length};',
'const flash=msg=>{lastMessage=msg};const renderAssignAll=()=>{};'
].join('\n');
check('AUD10 supplier bulk links do not change on cancelled confirmation',
  new Function(supplierBase+'\n'+bulkCode+'\npermission=false;applySupplierBulkChange(["L1","L2"],"S1","add","批量关联");return updated===0&&dialogs.length===1&&dialogs[0].includes("2 条");')());
check('AUD10 supplier bulk links change exactly confirmed affected records',
  new Function(supplierBase+'\n'+bulkCode+'\napplySupplierBulkChange(["L1","L2"],"S1","add","批量关联");return updated===2&&dialogs[0].includes("确认后立即生效");')());
check('AUD10 protected history blocks without an approval prompt',
  new Function(supplierBase+'\n'+bulkCode+'\nhistoryAllowed=false;applySupplierBulkChange(["L1"],"S1","add","批量关联");return updated===0&&dialogs.length===0;')());
check('AUD10 supplier-view buttons identify true relationship mutations',
  ['关联全部筛选物料','关联本页物料','反转筛选范围关联','反转本页关联','取消全部筛选关联'].every(x=>source.includes(x)));
check('AUD11 synthetic purchase history is prominently labelled',
  source.includes('模拟上次采购价（虚构）')&&source.includes('（虚构）</span>')&&source.includes('上次采购价仍为虚构示例'));
check('P2 whole HTML JavaScript parses',(()=>{new Function(source.split('<script>')[1].split('</script>')[0]);return true})());
check('P2 HTML IDs remain unique',(()=>{const ids=[...source.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);return new Set(ids).size===ids.length})());
const itemCsv=fs.readFileSync(path.join(fixtureDir,'m0_100_物料.csv'),'utf8');
const supplierCsv=fs.readFileSync(path.join(fixtureDir,'m0_10_供应商参考.csv'),'utf8');
const csvFns=['parseHeaderTable','findHeaderValue','parsePositiveNumber','parseItemRows','parseQuoteRows'];
const parsed=run('let lineSeq=1200;const nextLineId=()=>("RFQ-L"+String(++lineSeq).padStart(5,"0"));',
  csvFns,'(()=>({items:parseItemRows('+JSON.stringify(itemCsv)+'),suppliers:parseHeaderTable('+JSON.stringify(supplierCsv)+',["供应商编码"])}))()');
check('AUD12 exactly 100 compatible M0 item rows',parsed.items.length===100&&parsed.items.every(x=>!x._errors.length&&x.id.startsWith('SIM-')&&x.unit));
check('AUD12 exactly 10 suppliers with existing M0 supplier IDs',parsed.suppliers.rows.length===10&&parsed.suppliers.rows.every((x,i)=>x.data['供应商编码']==='SUP-'+String(i+1).padStart(3,'0')));
let allQuoteFiles=true,allCodesValid=true,coverageVaries=false,quotedLines=0,missingRows=0;const coverage=[];
for(let i=1;i<=10;i++){
  const sup='SUP-'+String(i).padStart(3,'0');
  const first=fs.readFileSync(path.join(fixtureDir,'m0_'+sup+'_第1轮报价.csv'),'utf8');
  const second=fs.readFileSync(path.join(fixtureDir,'m0_'+sup+'_第2轮报价.csv'),'utf8');
  const parsedRounds=run('const x='+JSON.stringify(first)+',y='+JSON.stringify(second)+';',csvFns,
    '({first:parseQuoteRows(x),second:parseQuoteRows(y)})');
  for(const r of [parsedRounds.first,parsedRounds.second]){
    if(r._headerErrors?.length)allQuoteFiles=false;
    if(!r.every(x=>parsed.items.some(it=>it.id===x.itemRef)&&['quoted','正常报价','未报价','不供货'].includes(x.status)))allCodesValid=false;
    quotedLines+=r.length;
  }
  coverage.push(parsedRounds.first.length);
  if(parsedRounds.second.length>=parsedRounds.first.length)coverageVaries=false;
  missingRows+=parsedRounds.second.length;
}
check('AUD12 twenty header-compatible quotation files parse',allQuoteFiles&&quotedLines>300);
check('AUD12 quote material keys and statuses are valid',allCodesValid);
check('AUD12 round 2 is deliberately partial',missingRows<coverage.reduce((a,b)=>a+b,0));
check('AUD12 generated supplier coverage varies',new Set(coverage).size>1);
process.stdout.write('PASS '+total+'/'+total+' P2 regression checks\n');
