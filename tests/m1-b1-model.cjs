// 中文：M1-B1 纯业务状态回归，验证结构化往返、双重供应商身份、演示隔离和外键。
 // English: Model-only tests for data round trips, identities, demo isolation and references.
"use strict";
const assert=require("node:assert/strict");
const core=require("../src/m1-lite/workspace-core.js");
let passed=0;
function test(name,fn){fn();passed++;console.log("PASS M1-B1 "+String(passed).padStart(2,"0")+" "+name);}
function fixture(){
  const ws=core.createEmptyWorkspace("RFQ-LOCAL-001");
  const s=ws.state;
  s.items=[
    {id:"0001",lineId:"RFQ-L00001",name:"匿名螺钉",cat:"辅材",qty:10,unit:"件",custom:{参考编码1:"OLD-0001"},sources:[]},
    {id:"0001",lineId:"RFQ-L00002",name:"匿名螺钉",cat:"辅材",qty:24,unit:"件",custom:{},sources:[]}
  ];
  s.suppliers=[
    {id:"SUP-001",name:"虚构往来单位甲",counterpartyCode:"CP-001",supplierCode:"SUP-001",roles:["customer","supplier"]},
    {id:"SUP-002",name:"虚构往来单位乙",counterpartyCode:"CP-002",supplierCode:"SUP-002",roles:["supplier"]}
  ];
  s.supplierPool=["SUP-001","SUP-002"];
  s.assignments=[{key:"RFQ-L00001",values:["SUP-001","SUP-002"]},{key:"RFQ-L00002",values:["SUP-001"]}];
  s.quoteRounds=[
    {supplierId:"SUP-001",roundNo:1,revisionNo:1,status:"confirmed",expectedLineIds:["RFQ-L00001","RFQ-L00002"],evidenceType:"email_attachment",
     lines:[{lineId:"RFQ-L00001",status:"quoted",price:32.5,tiers:[{min:1,max:9,price:42},{min:10,max:null,price:32.5}]},
            {lineId:"RFQ-L00002",status:"noquote",price:null,tiers:[]}],confirmedAt:"2026-10-10T00:00:00Z"},
    {supplierId:"SUP-001",roundNo:2,revisionNo:1,status:"draft",expectedLineIds:["RFQ-L00001"],lines:[]}
  ];
  s.awards=[{key:"RFQ-L00001",value:"SUP-001"}];s.awardReasons=[{key:"RFQ-L00001",value:"交期优先"}];
  s.manualAwards=["RFQ-L00001"];s.awardReviewIds=["RFQ-L00001"];
  s.selectedCompareSuppliers=["SUP-001","SUP-002"];
  s.customFields=["备注"];s.lineSeq=2;s.createdSeq=2;
  core.validate(ws);return ws;
}
test("empty buyer workspace contains no synthetic material or supplier",()=>{
 const a=core.createEmptyWorkspace("RFQ-LOCAL-ZERO");
 assert.equal(a.state.items.length,0);assert.equal(a.state.suppliers.length,0);
 assert.equal(a.origin,"buyer");assert.equal(a.state.quoteComparisonMode,"returned");
});
test("one inventory code can represent multiple RFQ lines",()=>{
 const a=fixture();assert.equal(a.state.items[0].id,a.state.items[1].id);
 assert.notEqual(a.state.items[0].lineId,a.state.items[1].lineId);
});
test("JSON round trip conserves quotes, tier pricing, rationale, identities",()=>{
 const a=fixture(),saved=core.stringify(a),back=core.parse(saved,{requireBuyer:true});
 assert.deepEqual(back,a);assert.equal(back.state.quoteRounds[0].lines[1].price,null);
 assert.equal(back.state.awardReasons[0].value,"交期优先");
});
test("hydration reconstructs fresh Map and Set instances",()=>{
 const ws=fixture(),model=core.hydrate(ws);
 assert.ok(model.state.assignments instanceof Map);
 assert.ok(model.state.assignments.get("RFQ-L00001") instanceof Set);
 assert.ok(model.state.assignments.get("RFQ-L00001").has("SUP-002"));
 assert.ok(model.state.awards instanceof Map);
 assert.ok(model.state.manualAwards instanceof Set);
 assert.ok(model.state.selectedCompareSuppliers instanceof Set);
 model.state.assignments.get("RFQ-L00001").delete("SUP-002");
 assert.equal(ws.state.assignments[0].values.includes("SUP-002"),true);
});
test("captureM0 round-trips all maps, sets and quote arrays",()=>{
 const v=core.hydrate(fixture()),m=core.captureM0({
   origin:"buyer",workspaceId:v.workspaceId,revision:5,sourceDataKind:"buyer",
   state:{...v.state}
 });
 assert.equal(m.revision,5);assert.equal(m.state.quoteRounds.length,2);
 assert.equal(m.state.awardReasons[0].value,"交期优先");
 assert.equal(core.parse(core.stringify(m)).state.assignments.length,2);
});
test("refuse demo seed captured as a real buyer workspace",()=>{
 const v=core.hydrate(fixture());
 assert.throws(()=>core.captureM0({origin:"buyer",workspaceId:v.workspaceId,sourceDataKind:"demo",state:v.state}),/DEMO_TO_BUYER/);
});
test("demo-origin workspace cannot be imported with requireBuyer",()=>{
 const v=core.hydrate(fixture());v.state.quoteComparisonMode="demo";
 const demo=core.captureM0({origin:"demo",workspaceId:"DEMO-001",sourceDataKind:"demo",state:v.state});
 assert.equal(demo.origin,"demo");
 assert.throws(()=>core.parse(core.stringify(demo),{requireBuyer:true}),/DEMO_NOT_IMPORTABLE/);
});
test("reject duplicate RFQ line ID",()=>{
 const ws=fixture();ws.state.items[1].lineId=ws.state.items[0].lineId;
 assert.throws(()=>core.validate(ws),/DUP_LINE/);
});
test("reject missing inventory code or invalid quantity",()=>{
 const ws=fixture();ws.state.items[0].id="";
 assert.throws(()=>core.validate(ws),/M1_MODEL_ITEM/);
 ws.state.items[0].id="0001";ws.state.items[0].qty=0;
 assert.throws(()=>core.validate(ws),/M1_MODEL_ITEM/);
});
test("reject missing suppliers referenced by allocation",()=>{
 const ws=fixture();ws.state.assignments[0].values.push("SUP-999");
 assert.throws(()=>core.validate(ws),/FOREIGN_SUPPLIER_ASSIGN/);
});
test("reject nonexistent RFQ line in round scope and quote data",()=>{
 const ws=fixture();ws.state.quoteRounds[0].expectedLineIds.push("RFQ-LOST");
 assert.throws(()=>core.validate(ws),/FOREIGN_LINE_EXPECTED/);
 ws.state.quoteRounds[0].expectedLineIds.pop();
 ws.state.quoteRounds[0].lines[0].lineId="RFQ-LOST";
 assert.throws(()=>core.validate(ws),/FOREIGN_LINE_QUOTE/);
});
test("reject duplicate quote supplier/round/revision identity",()=>{
 const ws=fixture();ws.state.quoteRounds.push(JSON.parse(JSON.stringify(ws.state.quoteRounds[0])));
 assert.throws(()=>core.validate(ws),/DUP_ROUND/);
});
test("reject orphan award and illegal quote price",()=>{
 const ws=fixture();ws.state.awards[0].value="SUP-999";
 assert.throws(()=>core.validate(ws),/FOREIGN_SUPPLIER_AWARD/);
 ws.state.awards[0].value="SUP-001";ws.state.quoteRounds[0].lines[0].price="32.5";
 assert.throws(()=>core.validate(ws),/M1_MODEL_PRICE/);
});
test("validate source and schema version before any future restore",()=>{
 const ws=fixture();ws.schemaVersion=999;
 assert.throws(()=>core.validate(ws),/M1_MODEL_SCHEMA/);
 ws.schemaVersion=1;ws.revision=-1;
 assert.throws(()=>core.validate(ws),/M1_MODEL_REVISION/);
});
test("capture does not write to localStorage or IndexedDB",()=>{
 const v=core.hydrate(fixture()),a=core.captureM0({workspaceId:v.workspaceId,origin:"buyer",sourceDataKind:"buyer",state:v.state});
 assert.equal(a.format,"srm-workspace");
 assert.equal(typeof core.saveToDatabase,"undefined");
});
console.log("PASS "+passed+"/"+15+" M1-B1 model and demo isolation checks");
