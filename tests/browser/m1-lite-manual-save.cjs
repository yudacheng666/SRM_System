// 中文：用浏览器真实操作验证正式工作、供应商录入、保存、关闭重开和历史防覆盖。
// English: Test buyer workspace creation, real supplier/quote flow, persistence and conflict protection.
"use strict";
const assert=require("node:assert/strict"),path=require("node:path"),{pathToFileURL}=require("node:url");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext();
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 page.on("dialog",async d=>d.accept());
 const url=pathToFileURL(path.resolve(__dirname,"../../prototype/m1-lite/index.html")).href;
 const wait=async(match)=>{await page.waitForFunction(m=>document.querySelector("#pilotSaveStatus").textContent.includes(m),match)};
 try{
  await page.goto(url);
  await page.locator("#pilotNewWorkspace").waitFor({state:"visible"});
  await page.waitForFunction(()=>!document.querySelector("#pilotNewWorkspace").disabled);
  assert.equal(await page.evaluate(()=>window.SRMPilot.isBuyer()),false);
  assert.equal(await page.evaluate(()=>items.length),1200);
  console.log("PASS PILOT01: original demo remains clearly isolated");
  await page.locator("#pilotNewWorkspace").click();
  await wait("已开始空白正式工作");
  assert.deepEqual(await page.evaluate(()=>({buyer:SRMPilot.isBuyer(),items:items.length,suppliers:suppliers.length,mode:quoteComparisonMode})),
    {buyer:true,items:0,suppliers:0,mode:"returned"});
  assert.equal(await page.locator("#demoQuoteExcel").isDisabled(),true);
  console.log("PASS PILOT02: empty buyer workspace; synthetic seed and demo quotation disabled");
  await page.locator("#pilotCounterpartyCode").fill("CP-001");
  await page.locator("#pilotSupplierCode").fill("SUP-100");
  await page.locator("#pilotSupplierName").fill("虚构验收供应商");
  await page.locator("#pilotAddSupplier").click();
  assert.equal(await page.evaluate(()=>suppliers[0].counterpartyCode),"CP-001");
  assert.equal(await page.evaluate(()=>suppliers[0].supplierCode),"SUP-100");
  assert.equal(await page.evaluate(()=>rfqSupplierPool.has("SUP-100")),true);
  await page.locator("#toggleItemIntake").click();
  await page.locator("#importFile").setInputFiles({name:"synthetic.csv",mimeType:"text/csv",buffer:Buffer.from("物料编码,物料名称,分类,数量,单位\nPART-001,虚构验收螺钉,类别A,10,件\n")});
  await page.locator("#confirmImportRows").waitFor({state:"visible"});
  await page.locator("#confirmImportRows").click();
  assert.equal(await page.evaluate(()=>items.length),1);
  assert.equal(await page.evaluate(()=>items[0].id),"PART-001");
  console.log("PASS PILOT03: add genuine user-entered supplier and import synthetic CSV into blank workspace");
  await page.locator('[data-tab="assign"]').click();
  await page.locator("#assignItemBody [data-ai]").first().check();
  await page.locator('[data-add="SUP-100"]').click();
  assert.equal(await page.evaluate(()=>getSet(items[0].lineId).has("SUP-100")),true);
  console.log("PASS PILOT04: buyer assigns a supplier through actual RFQ interface");
  await page.locator('[data-tab="quoteImport"]').click();
  await page.locator("#quoteImportSupplier").selectOption("SUP-100");
  await page.locator("#quoteImportFile").setInputFiles({name:"quote.csv",mimeType:"text/csv",buffer:Buffer.from("物料编码,单价,交期,MOQ,报价状态\nPART-001,38.5,7,1,正常报价\n")});
  await page.locator("#quoteImportPreviewBody tr").first().waitFor();
  await page.locator("#commitQuoteImport").click();
  await page.locator("#confirmQuoteRound").click();
  assert.equal(await page.evaluate(()=>quoteRounds[0].status),"confirmed");
  assert.equal(await page.evaluate(()=>quoteRounds[0].lines[0].price),38.5);
  console.log("PASS PILOT05: real first-round quotation confirmed without fake price");
  await page.locator("#pilotSaveWorkspace").click();
  await wait("已保存到本机");
  assert.equal(await page.evaluate(()=>SRMPilot.revision()),1);
  assert.equal(await page.evaluate(()=>SRMPilot.dirty()),false);
  console.log("PASS PILOT06: manual save acknowledged only after committed IndexedDB write");
  await page.reload();
  await wait("已自动恢复本机正式工作");
  const result=await page.evaluate(()=>({
    buyer:SRMPilot.isBuyer(),items:items.map(x=>x.id),suppliers:suppliers.map(x=>[x.counterpartyCode,x.supplierCode]),
    rounds:quoteRounds.map(x=>({status:x.status,price:x.lines[0]?.price})),assigned:getSet(items[0].lineId).has("SUP-100"),rev:SRMPilot.revision()
  }));
  assert.deepEqual(result,{buyer:true,items:["PART-001"],suppliers:[["CP-001","SUP-100"]],rounds:[{status:"confirmed",price:38.5}],assigned:true,rev:1});
  console.log("PASS PILOT07: refreshed same file recovers real RFQ, assignment, supplier and confirmed price");
  // 中文：模拟非法改写已确认历史，旧记录必须保留；不得承认保存成功。
  // English: Inject a forbidden mutation and verify old confirmed quotation cannot be overwritten.
  await page.evaluate(()=>{quoteRounds[0].lines[0].price=99});
  await page.locator("#pilotSaveWorkspace").click();
  await wait("保存失败");
  assert.match(await page.locator("#pilotSaveStatus").innerText(),/已确认的报价历史/);
  await page.locator("#pilotResumeWorkspace").click();
  await wait("已从本机恢复");
  assert.equal(await page.evaluate(()=>quoteRounds[0].lines[0].price),38.5);
  console.log("PASS PILOT08: saving modified confirmed history is rejected and old data restored");
  const p2=await context.newPage();
  p2.on("dialog",async d=>d.accept());
  await p2.goto(url);
  await p2.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已自动恢复本机正式工作"));
  await p2.locator("#pilotSaveWorkspace").click();
  await p2.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已保存到本机"));
  assert.equal(await p2.evaluate(()=>SRMPilot.revision()),2);
  await page.locator("#pilotSaveWorkspace").click();
  await wait("保存失败");
  assert.match(await page.locator("#pilotSaveStatus").innerText(),/其他窗口更新/);
  console.log("PASS PILOT09: stale tab rejected instead of silently overwriting newer local save");
  assert.deepEqual(errors,[]);
  console.log("PASS PILOT10: browser has no uncaught JS errors");
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
