// 中文：真实 Chromium 验证旧单工作区迁移、重复新建、历史切换和跨窗口防覆盖。
// English: Browser regression for legacy active RFQ, repeated creation, safe archive switching and stale tabs.
"use strict";
const assert=require("node:assert/strict"),path=require("node:path"),{pathToFileURL}=require("node:url");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext();
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 page.on("dialog",async d=>d.accept());
 const url=pathToFileURL(path.resolve(__dirname,"../../prototype/m1-lite/index.html")).href;
 const wait=match=>page.waitForFunction(v=>document.querySelector("#pilotSaveStatus").textContent.includes(v),match);
 const seed=async(label)=>{
  await page.evaluate(label=>{
    const id="MAT-"+label,code="SUP-"+label,lineId="RFQ-L00001";
    items.push({lineId,id,name:"匿名物料"+label,cat:"匿名部件",qty:10,unit:"件"});
    lineSeq=1;createdSeq=1;
    suppliers.push({id:code,name:"匿名供方"+label,counterpartyCode:"CP-"+label,supplierCode:code,roles:["supplier"]});
    rfqSupplierPool.add(code);
    assignments.set(lineId,new Set([code]));
    quoteRounds.push({supplierId:code,roundNo:1,revisionNo:1,status:"confirmed",
      expectedLineIds:[lineId],termsNote:"匿名商务条款"+label,evidenceType:"manual_other",evidenceNote:"匿名凭证",
      lines:[{lineId,itemId:id,price:label==="A"?17:23,tiers:[],lead:7,moq:1,status:"quoted",remark:"匿名报价"+label,source:"manual"}]});
  },label);
  await page.locator("#pilotSaveWorkspace").click();
  await wait("已保存到本机");
 };
 const snapshot=()=>page.evaluate(()=>({id:SRMPilot.snapshot().workspaceId,items:items.map(x=>x.id),
   prices:quoteRounds.map(r=>r.lines.map(x=>x.price)),revision:SRMPilot.revision()}));
 try{
  await page.goto(url);
  await page.waitForFunction(()=>!document.querySelector("#pilotNewWorkspace").disabled);
  await page.locator("#pilotNewWorkspace").click();
  await wait("已开始另一笔空白正式询价");
  await seed("A");
  const first=await snapshot();
  await page.reload();
  await wait("已自动恢复本机正式工作");
  assert.deepEqual(await snapshot(),first);
  assert.equal(await page.locator("#pilotNewWorkspace").isDisabled(),false);
  console.log("PASS MULTI01: saved legacy single workspace loads and new blank action remains enabled");

  await page.locator("#pilotNewWorkspace").click();
  await wait("已开始另一笔空白正式询价");
  assert.equal(await page.evaluate(()=>items.length),0);
  await page.reload();
  await wait("已自动恢复本机正式工作");
  assert.deepEqual(await snapshot(),first);
  console.log("PASS MULTI02: unsaved new workspace never destroys preceding committed RFQ");

  await page.locator("#pilotNewWorkspace").click();
  await wait("已开始另一笔空白正式询价");
  await seed("B");
  const second=await snapshot();
  assert.notEqual(second.id,first.id);
  const choices=await page.locator("#pilotHistoryWorkspace option").allTextContents();
  assert(choices.some(x=>x.includes(first.id)));
  const store=await page.evaluate(()=>new Promise((resolve,reject)=>{
    const req=indexedDB.open("srm-lite-local-v1",1);
    req.onsuccess=()=>{
      const db=req.result,tx=db.transaction("workspaces","readonly");
      tx.objectStore("workspaces").getAllKeys().onsuccess=e=>resolve(e.target.result);
      tx.oncomplete=()=>db.close();tx.onerror=()=>reject(tx.error);
    };
    req.onerror=()=>reject(req.error);
  }));
  assert(store.includes("single")&&store.includes("archive:"+first.id));
  console.log("PASS MULTI03: second RFQ saves independently and atomically archives the old committed record");

  await page.reload();
  await wait("已自动恢复本机正式工作");
  assert.deepEqual(await snapshot(),second);
  await page.locator("#pilotHistoryWorkspace").selectOption(first.id);
  await page.locator("#pilotSwitchWorkspace").click();
  await wait("已切换到历史询价");
  assert.deepEqual(await snapshot(),first);
  console.log("PASS MULTI04: old RFQ, supplier, confirmed quote and revision restored intact");

  await page.locator("#pilotHistoryWorkspace").selectOption(second.id);
  await page.locator("#pilotSwitchWorkspace").click();
  await wait("已切换到历史询价");
  assert.deepEqual(await snapshot(),second);
  console.log("PASS MULTI05: repeated two-way switching preserves both independently saved RFQs");

  const p2=await context.newPage();
  p2.on("dialog",async d=>d.accept());
  await p2.goto(url);
  await p2.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已自动恢复本机正式工作"));
  await page.locator("#pilotHistoryWorkspace").selectOption(first.id);
  await page.locator("#pilotSwitchWorkspace").click();
  await wait("已切换到历史询价");
  await p2.locator("#pilotSaveWorkspace").click();
  await p2.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("保存失败"));
  assert.match(await p2.locator("#pilotSaveStatus").innerText(),/活动询价|其他窗口/);
  assert.deepEqual(await snapshot(),first);
  console.log("PASS MULTI06: stale tab cannot overwrite after another tab switches the active RFQ");

  assert.deepEqual(errors,[]);
  console.log("PASS MULTI07: no uncaught JS browser errors");
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
