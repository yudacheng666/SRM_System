// 中文：单据生成器业务逻辑测试，使用纯虚构数据验证保密隔离与共同范围金额。
 // English: Pure model tests for confidential RFQs, historical revisions and comparable totals.
"use strict";
const assert=require("node:assert/strict");
globalThis.M1WorkspaceCore=require("../src/m1-lite/workspace-core.js");
const model=globalThis.M1WorkspaceCore,reports=require("../src/m1-lite/report-exports.js");
function fixture(){
 const w=model.createEmptyWorkspace("RFQ-FAKE-TEST");
 const st=w.state;
 st.items=[
  {lineId:"RFQ-L00001",id:"0001",name:"虚构齿轮",cat:"部件",qty:10,unit:"件"},
  {lineId:"RFQ-L00002",id:"0002",name:"虚构端盖",cat:"部件",qty:5,unit:"件"},
  {lineId:"RFQ-L00003",id:"0003",name:"虚构罩壳",cat:"辅材",qty:2,unit:"套"}
 ];
 st.lineSeq=3;st.createdSeq=3;
 st.suppliers=[
  {id:"SUP-A",name:"匿名供方甲",counterpartyCode:"CP-A",supplierCode:"SUP-A",roles:["supplier"]},
  {id:"SUP-B",name:"匿名供方乙",counterpartyCode:"CP-B",supplierCode:"SUP-B",roles:["supplier"]}
 ];
 st.supplierPool=["SUP-A","SUP-B"];
 st.assignments=[
  {key:"RFQ-L00001",values:["SUP-A","SUP-B"]},
  {key:"RFQ-L00002",values:["SUP-A","SUP-B"]},
  {key:"RFQ-L00003",values:["SUP-A"]}
 ];
 function line(id,price,status="quoted",note=""){
   return{lineId:id,itemId:st.items.find(x=>x.lineId===id).id,price,tiers:[],lead:7,moq:1,status,remark:note,source:"import"};
 }
 st.quoteRounds=[
  {supplierId:"SUP-A",roundNo:1,revisionNo:1,status:"confirmed",expectedLineIds:["RFQ-L00001","RFQ-L00002","RFQ-L00003"],
   termsNote:"甲供应商商务条款",evidenceType:"email_attachment",evidenceNote:"甲原件.pdf",lines:[line("RFQ-L00001",20),line("RFQ-L00002",5),line("RFQ-L00003",2)]},
  {supplierId:"SUP-A",roundNo:2,revisionNo:1,status:"confirmed",expectedLineIds:["RFQ-L00001"],
   termsNote:"甲第2轮特别条款",evidenceType:"chat_screenshot",evidenceNote:"甲聊天记录.png",lines:[line("RFQ-L00001",18,"quoted","甲可提供替代工艺")]},
  {supplierId:"SUP-B",roundNo:1,revisionNo:1,status:"confirmed",expectedLineIds:["RFQ-L00001","RFQ-L00002"],
   termsNote:"乙报价含运费",evidenceType:"email_attachment",evidenceNote:"乙原件.pdf",lines:[line("RFQ-L00001",30),line("RFQ-L00002",null,"noquote","缺货")]},
  {supplierId:"SUP-B",roundNo:1,revisionNo:2,status:"draft",expectedLineIds:["RFQ-L00001","RFQ-L00002"],
   termsNote:"乙未确认新版本",evidenceType:"manual_other",evidenceNote:"未确认",lines:[line("RFQ-L00001",1)]}
 ];
 st.awards=[{key:"RFQ-L00001",value:"SUP-A"}];
 st.awardReasons=[];st.manualAwards=["RFQ-L00001"];st.awardReviewIds=[];
 model.validate(w);return w;
}
const w=fixture();
const a=reports.rfq(w,"SUP-A");
const b=reports.rfq(w,"SUP-B",["lead"]);
assert.equal(a.sheets.length,1);
assert.equal(a.sheets[0].rows.length,4);
assert.deepEqual(b.sheets[0].rows[0],["RFQ Line ID","存货编码","存货名称","询价数量","询价单位","报价单价","报价状态","交期"]);
assert.equal(b.sheets[0].rows.length,3);
assert.equal(b.sheets[0].rows[1][1],"0001");
assert.equal(b.sheets[0].rows[1][5],"");
assert.equal(b.sheets[0].rows.flat().some(x=>String(x).includes("匿名供方甲")||String(x).includes("甲原件")||String(x).includes("甲供应商商务条款")),false);
console.log("PASS REPORT01: RFQ sheet contains only assigned supplier material lines with empty price fields");
console.log("PASS REPORT02: export field choice retains mandatory import identifiers and prevents other-supplier leaks");
const x=reports.comparison(w,["SUP-A","SUP-B"]);
assert.equal(x.sheets.length,2);
assert.equal(x.commonCount,1);
assert.equal(x.totalItems,3);
const summary=x.sheets[0].rows,hdr=summary[0],row1=summary[1],row2=summary[2],row3=summary[3];
const offset=hdr.findIndex(h=>String(h).includes("匿名供方甲")&&h.includes("适用单价"));
assert.equal(row1[offset],18);
assert.equal(row1[offset+3],30);
assert.equal(row2[offset],5);
assert.equal(row2[offset+3],"");
assert.equal(row3[offset],2);
assert.equal(row3[offset+3],"");
assert.match(row1[offset+1].formula,/ROUND/);
assert.match(summary[4][offset+1].formula,/SUMIF/);
assert.equal(summary[4][offset+3+1].formula.includes("SUMIF"),true);
console.log("PASS REPORT03: confirmed latest rounds only; declined or missing bids stay blank and commonCount=1");
console.log("PASS REPORT04: per-row formula and common-scope SUMIF totals generated, not mixed-range supplier rankings");
const history=x.sheets[1].rows.map(r=>r.join("|")).join("\n");
assert.match(history,/甲第2轮特别条款/);
assert.match(history,/乙报价含运费/);
assert.match(history,/草稿（不可用作比价）/);
assert.match(history,/甲可提供替代工艺/);
assert.match(history,/甲原件.pdf/);
console.log("PASS REPORT05: detailed negotiation history includes earlier confirmations and explicitly marked drafts");
const c=reports.comparison(w,["SUP-A","SUP-B"],["common"],["terms","note"]);
assert.equal(c.sheets[0].rows[0].includes("存货名称"),false);
assert.equal(c.sheets[0].rows[0].includes("RFQ Line ID"),true);
assert.equal(c.sheets[1].rows[0].includes("整轮商务备注"),true);
assert.equal(c.sheets[1].rows[0].includes("报价单价"),false);
console.log("PASS REPORT06: optional column selection works independently across both sheets");
assert.throws(()=>reports.comparison(w,["SUP-A"]),/至少两家/);
assert.throws(()=>reports.rfq(w,"SUP-UNKNOWN"),/供应商不存在/);
assert.throws(()=>reports.rfq({...w,origin:"demo"},"SUP-A"),/M1_MODEL_|EXPORT:/);
console.log("PASS REPORT07: supplier identity, demo-source and comparison-group guards");
const legacy=JSON.parse(JSON.stringify(w));
legacy.state.quoteRounds[0].lines[0].price=null;
legacy.state.quoteRounds[0].lines[0].tiers=[{min:1,max:9,price:24},{min:10,max:null,price:22}];
model.validate(legacy);
assert.equal(reports.comparison(legacy,["SUP-A","SUP-B"]).commonCount,1);
assert.equal(reports.effectivePrice(legacy.state.quoteRounds[0].lines[0],10),22);
console.log("PASS REPORT08: tiered prices select the actual RFQ quantity and preserve quotation lineage");
console.log("PASS 8/8 M1-Lite selectable RFQ and comparison report checks");
