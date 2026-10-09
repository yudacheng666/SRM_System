// 中文：测试源码真实函数，仅用虚构物料和供应商。
 // English: Test real source functions with synthetic items/suppliers only.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../prototype/m0/index.html'),'utf8');
function extract(name){
  const start=source.indexOf('function '+name+'(');assert.ok(start>=0,'missing '+name);
  const open=source.indexOf('{',start);let d=0,q='',escape=false;
  for(let i=open;i<source.length;i++){const c=source[i];if(q){if(escape){escape=false;continue}if(c==='\\'){escape=true;continue}if(c===q)q='';continue}
    if(c==='"'||c==="'"||c==='\x60'){q=c;continue}
    if(c==='{')d++;if(c==='}'&&--d===0)return source.slice(start,i+1)}
  throw Error('unbalanced '+name)
}
function run(scope,functions,expr){return new Function(scope+'\n'+functions.map(extract).join('\n')+'\nreturn '+expr+';')()}
let total=0;
function check(label,ok){assert.equal(ok,true,label);total++;process.stdout.write('PASS '+label+'\n')}
const parseFns=['parseHeaderTable','findHeaderValue','parsePositiveNumber','parseItemRows'];
const parseEnv='let seq=0;const nextLineId=()=>("L"+(++seq));';
check('AUD04 pad optional trailing cells',run(parseEnv,parseFns,'(()=>{let r=parseItemRows("物料编码,物料名称,数量,单位,备注\\nP-1,304 不锈钢,3,件");return !r._headerErrors&&r[0].qty===3&&r[0].unit==="件"})()'));
check('AUD04 retain required quantity validation',run(parseEnv,parseFns,'parseItemRows("物料编码,数量,单位,备注\\nP-1").at(0)._errors.some(e=>e.includes("数量"))'));
check('AUD04 reject surplus columns',run(parseEnv,parseFns,'parseItemRows("物料编码,数量,单位\\nP-1,3,件,多余")._headerErrors.some(x=>x.includes("超过表头"))'));
check('AUD05 mixed comma and quoted comma',run(parseEnv,parseFns,'(()=>{let r=parseItemRows("物料编码，物料名称,数量，单位,备注\\nP-1，\\"304,不锈钢\\",3，件");return !r._headerErrors&&r[0].name==="304,不锈钢"&&r[0].qty===3})()'));
check('AUD05 tab preserves commas',run(parseEnv,parseFns,'(()=>{let r=parseItemRows("物料编码\\t物料名称\\t数量\\t单位\\nP-1\\t304,不锈钢\\t3\\t件");return r[0].name==="304,不锈钢"})()'));
const qEnv='const items=[{id:"P1",lineId:"L1",qty:2},{id:"P2",lineId:"L2",qty:3}];const round={expectedLineIds:["L1","L2"],supplierId:"S1",status:"draft",roundNo:1,lines:[]};const currentQuoteRound=()=>round;const assignedItemsForSupplier=()=>items;';
const qFns=['parseHeaderTable','findHeaderValue','parseQuoteRows','normalizeQuoteStatus','resolveQuoteItem','parseOptionalNumber','parseTierPrice','effectivePriceForLine','expectedIdsForRound','validateQuotePreview','planQuoteImportCommit'];
check('AUD06 partial valid and rejected counts',run(qEnv,qFns,'(()=>{let a=parseQuoteRows("RFQ Line ID,单价,状态\\nL1,100,正常报价\\nL2,abc,正常报价\\nUNKNOWN,50,正常报价"),p=planQuoteImportCommit(a);return p.total===3&&p.valid.length===1&&p.skipped.length===2})()'));
check('AUD06 duplicate quote rows reject',run(qEnv,qFns,'(()=>{let a=parseQuoteRows("RFQ Line ID,单价\\nL1,100\\nL1,120");return planQuoteImportCommit(a).valid.length===0})()'));
check('AUD06 invalid status is not normalized to valid',run(qEnv,qFns,'(()=>{let a=parseQuoteRows("RFQ Line ID,单价,状态\\nL1,100,unknown");let p=validateQuotePreview(a).map((r,i)=>({...r,_rawInput:a[i]}));return planQuoteImportCommit(p).valid.length===0})()'));
check('AUD06 missing optional quote status inferred from valid price',run(qEnv,qFns,'(()=>{let a=parseQuoteRows("RFQ Line ID,单价,状态,备注\\nL1,100");return planQuoteImportCommit(a).valid[0]?.status==="quoted"})()'));
const aEnv='const it=[{lineId:"L1",qty:1},{lineId:"L2",qty:1}],sups=[{id:"S1"},{id:"S2"}];const comparisonItems=()=>it,comparisonSuppliers=()=>sups;const prices={L1:{S1:100,S2:90},L2:{S1:150,S2:110}};const quoteMetaFor=(it,s)=>prices[it.lineId][s.id]==null?null:{price:prices[it.lineId][s.id]};const awards=new Map([["L1","S1"],["L2","S1"]]),manualAwards=new Set(["L1"]),awardReasons=new Map([["L1","交期保证"]]),awardReviewIds=new Set();';
const aFns=['lowestSupplierForItem','setDefaultLowestAwards','reconcileAwardsAfterQuote'];
check('AUD07 keep manual choice and reason and mark for review',run(aEnv,aFns,'(()=>{reconcileAwardsAfterQuote();return awards.get("L1")==="S1"&&awardReasons.get("L1")==="交期保证"&&awardReviewIds.has("L1")})()'));
check('AUD07 recalculate nonmanual lowest',run(aEnv,aFns,'(()=>{reconcileAwardsAfterQuote();return awards.get("L2")==="S2"})()'));
check('AUD07 mark invalid manual selection pending',run(aEnv,aFns,'(()=>{prices.L1.S1=null;reconcileAwardsAfterQuote();return awards.get("L1")==="S1"&&awardReviewIds.has("L1")})()'));
const cEnv='const items=[{lineId:"L1",id:"P1",qty:8},{lineId:"L2",id:"P2",qty:15},{lineId:"L3",id:"P3",qty:8}];const round={supplierId:"S1",roundNo:2,revisionNo:1,status:"draft",lines:[],expectedLineIds:["L1","L2","L3"]};const assignedItemsForSupplier=()=>items;const priorApplicableLine=(sid,id)=>id==="L1"?{roundNo:1,revisionNo:2,status:"quoted",price:80,tiers:[],lead:7,moq:2}:id==="L2"?{roundNo:1,revisionNo:1,status:"quoted",price:null,tiers:[{min:1,max:10,price:60}],lead:4,moq:1}:null;';
const cFns=['expectedIdsForRound','effectivePriceForLine','planCarryForward','buildCarryForwardLine'];
check('AUD08 eligible candidates only',run(cEnv,cFns,'(()=>{let c=planCarryForward(round);return c.length===1&&c[0].lineId==="L1"})()'));
check('AUD08 carry provenance saved',run(cEnv,cFns,'(()=>{let v=buildCarryForwardLine(planCarryForward(round)[0],"邮件确认");return v.source==="carry"&&v.original.carryFromRevision===2&&v.original.confirmationNote==="邮件确认"})()'));
check('AUD08 quoted current lines never candidates',run(cEnv,cFns,'(()=>{round.lines.push({lineId:"L1"});return planCarryForward(round).length===0})()'));
check('AUD08 confirmed round never candidates',run(cEnv,cFns,'(()=>{round.status="confirmed";return planCarryForward(round).length===0})()'));
check('whole script syntax',(()=>{new Function(source.split('<script>')[1].split('</script>')[0]);return true})());
check('no duplicate HTML IDs',(()=>{let ids=[...source.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);return new Set(ids).size===ids.length})());
process.stdout.write('PASS '+total+'/'+total+' P1 regression checks\n');
