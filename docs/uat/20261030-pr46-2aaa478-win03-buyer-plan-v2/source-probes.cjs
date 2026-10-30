'use strict';
// PURE frozen-source evaluation. No DOM, browser, service, network or database.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const {SOURCE_SHA256}=require('./toolchain-v1/schema.cjs');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function between(s,a,b){const start=s.indexOf(a),end=s.indexOf(b,start+a.length);if(start<0||end<0)throw Error('Frozen source boundary missing: '+a);return s.slice(start,end);}
function load(source){
 const bytes=fs.readFileSync(source);if(digest(bytes)!==SOURCE_SHA256)throw Error('SOURCE WRONG');const s=bytes.toString();
 const fragments=[
  between(s,'function parseOptionalNumber(', '/**\n * 按表头解析'),
  between(s,'function parseHeaderTable(', '/** 中文：SRM 核心表头'),
  between(s,'function resolveQuoteItem(', '/**\n * 报价使用表头'),
  between(s,'function parseQuoteRows(', '/** 显示中文业务状态'),
  between(s,'function parseTierPrice(', 'function tierText('),
  between(s,'function effectivePriceForLine(', 'function expectedIdsForRound('),
  between(s,'function validateQuotePreview(', '/** 区分已报价'),
  between(s,'function planQuoteImportCommit(', 'commitQuoteImport.onclick=')
 ];
 const items=Array.from({length:12},(_,i)=>({id:'TST-'+String(i+1).padStart(3,'0'),lineId:'RFQ-L'+String(i+1).padStart(5,'0'),name:'虚构物料'+(i+1),spec:'',qty:i+2,unit:'件',cat:'虚构类别'}));
 const round={supplierId:'SUP-A',roundNo:1,revisionNo:1,status:'draft',lines:[],expectedLineIds:items.map(x=>x.lineId)};
 const context=vm.createContext({items,round,ensureFirstRound(){},currentQuoteRound:()=>round,expectedIdsForRound:r=>r.expectedLineIds,getSet:()=>new Set(['SUP-A','SUP-B'])});
 vm.runInContext(fragments.join('\n'),context,{timeout:1000});
 return {s,items,round,context,fragments:fragments.map(code=>({sha256:digest(code),startLine:s.slice(0,s.indexOf(code)).split('\n').length,endLine:s.slice(0,s.indexOf(code)+code.length).split('\n').length,code})),run(code){return JSON.parse(JSON.stringify(vm.runInContext(code,context,{timeout:1000})));}};
}
function audit(source){
 const p=load(source);
 const partial='RFQ Line ID,报价单价,交期,MOQ,报价状态,物料备注\nRFQ-L00001,10,5,1,quoted,\nBAD,,,,noquote,\n';
 p.context.fixtureText=partial;
 const rows=p.run('parseQuoteRows(fixtureText)'),plan=p.run('planQuoteImportCommit(parseQuoteRows(fixtureText))');
 const details=plan.skipped.slice(0,8).map(x=>String(x._rowNo||'手工')+' 行 '+String(x.itemRef||'')+'：'+(x.errors.join('；')||x.coverageCheck)).join('\n');
 const message='本次共 '+plan.total+' 行，可提交 '+plan.valid.length+' 行，拒绝/待检查 '+plan.skipped.length+' 行。\n以下错误行不会保存，完整清单留在预览中：\n'+details+'\n是否只提交 '+plan.valid.length+' 行？';
 const result={kind:'PURE FROZEN-SOURCE SIMULATION, NOT BUSINESS EXECUTION',productSha:require('./toolchain-v1/schema.cjs').PRODUCT_SHA,sourceSha256:digest(Buffer.from(p.s)),partial:{fixtureText:partial,parsed:rows,validCount:plan.valid.length,skippedCount:plan.skipped.length,details,message},tier:p.run("parseTierPrice('1-9:9|10+:8')"),effectiveForQty2:p.run("effectivePriceForLine({status:'quoted',...parseTierPrice('1-9:9|10+:8')},2)"),overlap:p.run("parseTierPrice('1-9:9|9+:8')"),promptDefaults:['10','5','1','quoted',''],fragments:p.fragments};
 if(result.partial.details!=='3 行 BAD：多报'||result.partial.validCount!==1||result.partial.skippedCount!==1)throw Error('Partial fixture disagrees with frozen source');
 return result;
}
module.exports={load,audit,digest};
if(require.main===module)console.log(JSON.stringify(audit(process.argv[2]),null,2));
