// 中文：仅用虚构记录验证结构化备份格式与拒绝损坏文件，不操作本地业务数据库。
// English: Pure offline backup format and invalid-file rejection tests with synthetic records.
"use strict";
const assert=require("node:assert/strict");
globalThis.M1WorkspaceCore=require("../src/m1-lite/workspace-core.js");
const backup=require("../src/m1-lite/portable-backup.js"),model=globalThis.M1WorkspaceCore;
function fixture(){
  const ws=model.createEmptyWorkspace("TEST-RFQ-101");
  ws.state.items.push({id:"0001",lineId:"RFQ-L00001",name:"虚构物料",qty:10,unit:"件"});
  ws.state.suppliers.push({id:"VEND-01",name:"虚构供应商",counterpartyCode:"CP-01",supplierCode:"VEND-01",roles:["customer","supplier"]});
  ws.state.supplierPool.push("VEND-01");ws.state.assignments.push({key:"RFQ-L00001",values:["VEND-01"]});
  ws.state.quoteRounds.push({supplierId:"VEND-01",roundNo:1,revisionNo:1,status:"confirmed",expectedLineIds:["RFQ-L00001"],lines:[{lineId:"RFQ-L00001",status:"quoted",price:12.5,tiers:[{min:1,price:12.5}]}]});
  ws.state.awards.push({key:"RFQ-L00001",value:"VEND-01"});
  ws.state.awardReasons.push({key:"RFQ-L00001",value:"交期更稳定"});
  ws.revision=5;model.validate(ws);return ws;
}
let num=0;
function pass(label){console.log("PASS BACKUP"+String(++num).padStart(2,"0")+" "+label)}
const ws=fixture(),json=backup.create(ws,"2026-10-11T00:00:00Z"),decoded=backup.parse(json);
assert.deepEqual(decoded.workspace,ws);assert.equal(decoded.workspace.state.quoteRounds[0].lines[0].price,12.5);
pass("full structured data preserves RFQ, supplier, awards, price tiers and revision");
const info=backup.preview(decoded);assert.equal(info.itemCount,1);assert.equal(info.confirmedRounds,1);
assert.equal(info.attachmentsIncluded,false);
pass("preview shows verified record counts and excludes evidence binaries");
const wrap=JSON.parse(json);assert.equal(wrap.recordCounts.quoteRounds,1);assert.equal(wrap.exportedAt,"2026-10-11T00:00:00Z");
pass("versioned portable metadata is present");
assert.throws(()=>backup.parse("{broken"),/BACKUP_INVALID_JSON/);
pass("malformed JSON rejected");
assert.throws(()=>backup.parse(JSON.stringify({...wrap,format:"unknown"})),/BACKUP_FORMAT/);
pass("unknown backup type rejected");
assert.throws(()=>backup.parse(JSON.stringify({...wrap,backupFormatVersion:500})),/BACKUP_BACKUP_VERSION/);
pass("unsupported backup version rejected");
assert.throws(()=>backup.parse(JSON.stringify({...wrap,attachmentsIncluded:true})),/BACKUP_ATTACHMENT_FLAG/);
pass("incorrect evidence-binary claim rejected");
assert.throws(()=>backup.parse(JSON.stringify({...wrap,recordCounts:{...wrap.recordCounts,items:99}})),/BACKUP_COUNT_items/);
pass("altered record counts rejected");
const noSupplier=JSON.parse(json);noSupplier.workspace.state.suppliers=[];
noSupplier.recordCounts.suppliers=0;
assert.throws(()=>backup.parse(JSON.stringify(noSupplier)),/M1_MODEL_FOREIGN_SUPPLIER_/);
pass("orphan supplier references rejected");
const demo=JSON.parse(json);demo.workspace.origin="demo";demo.workspace.state.quoteComparisonMode="demo";
assert.throws(()=>backup.parse(JSON.stringify(demo)),/BACKUP_DEMO_NOT_ALLOWED/);
pass("demo seed cannot masquerade as a buyer backup");
assert.throws(()=>backup.parse("a".repeat(backup.MAX_BYTES+1)),/BACKUP_SIZE/);
pass("oversized backup rejected");
console.log("PASS "+num+"/"+num+" M1 portable backup pure-function tests");
