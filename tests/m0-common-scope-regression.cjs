// 中文：使用当前 M0 真正的比价计划函数，检查明确选组、交集、阶梯适用价和缺报排除。
// English: Test the actual M0 plan with explicit groups, intersections, tiers and missing quotes.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../prototype/m0/index.html'),'utf8');
function extract(name){
  const start=source.indexOf('function '+name+'(');
  assert.ok(start>=0,'missing '+name);
  const b=source.indexOf('{',start);let level=0,quoted='',escaped=false;
  for(let i=b;i<source.length;i++){
    const ch=source[i];
    if(quoted){if(escaped){escaped=false;continue}if(ch==='\\'){escaped=true;continue}if(ch===quoted)quoted='';continue}
    if(ch==='"'||ch==="'"||ch==='\x60'){quoted=ch;continue}
    if(ch==='{')level++;
    if(ch==='}'&&--level===0)return source.slice(start,i+1);
  }
  throw Error('unbalanced '+name);
}
const env=[
'const its=[{id:"A",lineId:"A",qty:5},{id:"B",lineId:"B",qty:2},{id:"C",lineId:"C",qty:8},{id:"D",lineId:"D",qty:2}];',
'const sups=[{id:"S1"},{id:"S2"},{id:"S3"}];',
'const prices={A:{S1:10,S2:12,S3:null},B:{S1:2,S2:null,S3:5},C:{S1:8,S2:6,S3:7},D:{S1:0,S2:2,S3:1}};',
'const comparisonItems=()=>its,comparisonSuppliers=()=>sups;',
'const quoteMetaFor=(it,s,i,si)=>prices[it.id][s.id]==null?null:{price:prices[it.id][s.id]};',
'const selectedCompareSuppliers=new Set();'
].join('\n');
const {plan:getPlan,prices}=new Function(env+'\n'+extract('planSelectedCommonScope')+'\nreturn {plan:planSelectedCommonScope,prices};')();
const money=(p,id)=>p.totals.get(id)/100;
let passes=0;
function check(name,value){assert.equal(value,true,name);passes++;process.stdout.write('PASS shared-scope: '+name+'\n')}
check('default group is empty and invalid',!getPlan().valid&&getPlan().selected.length===0);
check('one selected supplier cannot generate comparable amount',!getPlan(['S1']).valid);
check('S1 S2 intersection uses the same eligible line IDs',getPlan(['S1','S2']).items.map(x=>x.it.id).join(',')==='A,C,D');
check('S1 S2 totals use same quantities and explicit zero quote',money(getPlan(['S1','S2']),'S1')===114&&money(getPlan(['S1','S2']),'S2')===112);
check('adding S3 narrows the common scope',getPlan(['S1','S2','S3']).items.map(x=>x.it.id).join(',')==='C,D');
check('S1 S3 pair has a different common scope',getPlan(['S1','S3']).items.map(x=>x.it.id).join(',')==='B,C,D');
check('duplicate supplier IDs do not bypass two supplier minimum',!getPlan(['S1','S1']).valid);
check('nonexistent supplier does not count toward group size',!getPlan(['S1','NOT_REAL']).valid);
check('no common supplier prices yield valid but empty comparison',(()=>{
  const old=prices.A.S2,oldC=prices.C.S2,oldD=prices.D.S2;
  prices.A.S2=prices.C.S2=prices.D.S2=null;
  const x=getPlan(['S1','S2']);prices.A.S2=old;prices.C.S2=oldC;prices.D.S2=oldD;
  return x.valid&&x.items.length===0&&x.reason.includes('无共同有效报价');
})());
check('no imputed zero for non-quoting supplier',getPlan(['S1','S2']).items.every(x=>x.values.every(v=>v.price!==null)));
check('totals are represented as integer cents',Array.from(getPlan(['S1','S2']).totals.values()).every(Number.isInteger));
check('document includes source-safe CSV export',source.includes('function exportSelectedCommonScopeCsv')&&source.includes('RFQ Line ID'));
check('no duplicate HTML IDs',(()=>{const ids=[...source.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]);return ids.length===new Set(ids).size})());
check('current inline HTML script parses',(()=>{new Function(source.split('<script>')[1].split('</script>')[0]);return true})());
process.stdout.write('PASS '+passes+'/'+passes+' shared-scope logic checks\n');