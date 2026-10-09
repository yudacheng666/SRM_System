// 中文：比较组金额必须按至少两家被选供应商的共同有效报价范围计算。
 // English: Selected-group comparisons require at least two chosen suppliers and a valid common quoted scope.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../prototype/m0/index.html'),'utf8');
function extract(name){
 const start=source.indexOf('function '+name+'(');assert.ok(start>=0,'missing '+name);
 const pos=source.indexOf('{',start);let d=0,q='',escaped=false;
 for(let i=pos;i<source.length;i++){
   const c=source[i];
   if(q){if(escaped){escaped=false;continue}if(c==='\\'){escaped=true;continue}if(c===q)q='';continue}
   if(c==='"'||c==="'"||c==='\x60'){q=c;continue}
   if(c==='{')d++;
   if(c==='}'&&--d===0)return source.slice(start,i+1);
 }
 throw Error('unbalanced '+name);
}
const sups=[{id:'A'},{id:'B'},{id:'C'},{id:'D'}];
const items=[{lineId:'1',qty:2},{lineId:'2',qty:3},{lineId:'3',qty:5},{lineId:'4',qty:10}];
const price={
 A:{'1':10,'2':20,'3':30},
 B:{'1':12,'2':18},
 C:{'2':7,'3':50,'4':12},
 D:{'4':9}
};
const lookup=(it,sp)=>price[sp.id][it.lineId]==null?null:{price:price[sp.id][it.lineId]};
const fn=new Function('return ('+extract('computeSelectedGroupComparison')+');')();
const compute=ids=>fn(new Set(ids),sups,items,lookup);
let total=0;
function pass(label,ok){assert.equal(ok,true,label);total++;process.stdout.write('PASS group: '+label+'\n')}
const empty=compute([]);
pass('no preselected suppliers on initial view',!empty.ready&&empty.common.length===0&&empty.groupTotals.size===0);
const one=compute(['A']);
pass('one supplier is not enough',!one.ready&&one.common.length===0&&one.groupTotals.size===0);
const pair=compute(['A','B']);
pass('two suppliers share exactly material 1 and 2',pair.ready&&pair.common.map(x=>x.lineId).join(',')==='1,2');
pass('A shared group amount is 80',pair.groupTotals.get('A')===80);
pass('B shared group amount is 78',pair.groupTotals.get('B')===78);
pass('A own amount remains 230 (distinct from common amount)',pair.own[0].total===230&&pair.own[0].count===3);
pass('B own amount remains 78 and only two priced rows',pair.own[1].total===78&&pair.own[1].count===2);
const other=compute(['A','C']);
pass('switching selected group changes common scope',other.common.map(x=>x.lineId).join(',')==='2,3');
pass('A/C group totals reflect same items and quantities',other.groupTotals.get('A')===210&&other.groupTotals.get('C')===271);
const three=compute(['A','B','C']);
pass('third supplier reduces shared range to item 2 only',three.common.length===1&&three.common[0].lineId==='2');
pass('three selected group totals use identical one-item scope',three.groupTotals.get('A')===60&&three.groupTotals.get('B')===54&&three.groupTotals.get('C')===21);
const noCommon=compute(['A','D']);
pass('zero shared items produces no monetary group totals',noCommon.ready&&noCommon.common.length===0&&noCommon.groupTotals.size===0);
const reordered=compute(['A','B','C','D']);
pass('additional unquoted supplier is not converted to zero',reordered.common.length===0&&reordered.groupTotals.size===0);
const invalid=fn(new Set(['A','B']),sups,items,(it,sp)=>it.lineId==='1'&&sp.id==='A'?{price:NaN}:lookup(it,sp));
pass('invalid numeric quotation excluded from intersection',invalid.common.length===1&&invalid.common[0].lineId==='2');
pass('unselected suppliers cannot shrink the chosen comparison scope',pair.common.length===2&&pair.group.length===2);
pass('UI demands explicit group selection and shows not-comparable hint',source.includes('data-compare-supplier=')&&source.includes('至少勾选 2 家')&&source.includes('不可比较'));
pass('own and selected group totals have distinct headings',source.includes('自身报价范围总额（不同范围不可横比）')&&source.includes('比较组同范围总额'));
pass('all script remains valid JavaScript',(()=>{new Function(source.split('<script>')[1].split('</script>')[0]);return true})());
process.stdout.write('PASS '+total+'/'+total+' group comparison tests\n');
