// 中文：JSON 格式及业务关联一致性回归，全部测试数据均为虚构。
// English: Portable backup contract checks with invented records only.
"use strict";
const assert=require("node:assert/strict");
const model=require("../src/m1-lite/workspace-core.js");
const backup=require("../src/m1-lite/portable-backup.js");
let n=0;
function test(name,fn){fn();console.log("PASS BACKUP-UNIT "+(++n)+" "+name)}
const make=()=>{
 const ws=model.createEmptyWorkspace("RFQ-TEST-001");
 ws.state.items.push({lineId:"RFQ-L00001",id:"ITEM-001",name:"虚构",qty:1,unit:"件"});
 ws.state.suppliers.push({id:"SUP-001",name:"虚构供应商",counterpartyCode:"CP-001",supplierCode:"SUP-001"});
 ws.state.assignments.push({key:"RFQ-L00001",values:["SUP-001"]});
 ws.state.quoteRounds.push({supplierId:"SUP-001",roundNo:1,revisionNo:1,status:"confirmed",
   expectedLineIds:["RFQ-L00001"],lines:[{lineId:"RFQ-L00001",price:15.25}]});
 model.validate(ws);return ws;
};
test("complete round-trip",()=>{
 const p=backup.create(make(),"2026-10-11T00:00:00Z");
 const parsed=backup.parse(JSON.stringify(p));
 assert.deepEqual(parsed,p);
 assert.equal(backup.summarize(parsed).confirmed,1);
});
test("binary evidence excluded",()=>{
 const p=backup.create(make());assert.equal(p.attachmentsIncluded,false);
});
test("demo backup prohibited",()=>{
 const ws=make();ws.origin="demo";ws.state.quoteComparisonMode="demo";
 assert.throws(()=>backup.create(ws),/演示/);
});
test("bad JSON and unsupported versions prohibited",()=>{
 assert.throws(()=>backup.parse("{oops"),/有效 JSON/);
 const p=backup.create(make());p.backupVersion=99;
 assert.throws(()=>backup.parse(JSON.stringify(p)),/格式或版本/);
});
test("broken foreign supplier reference prohibited",()=>{
 const p=backup.create(make());p.workspace.state.assignments[0].values=["SUP-NONE"];
 assert.throws(()=>backup.parse(JSON.stringify(p)),/业务数据校验/);
});
test("truncated large input prohibited",()=>{
 assert.throws(()=>backup.parse(" ".repeat(backup.MAX_BYTES+1)),/20 MB/);
});
test("correct export date format",()=>{
 const p=backup.create(make());assert.ok(Number.isFinite(Date.parse(p.exportedAt)));
});
console.log("PASS "+n+"/"+7+" portable backup unit checks");
