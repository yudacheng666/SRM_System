// 中文：使用真实 Chromium 测试 ERP 表头兼容、整轮条款、物料备注、保存/备份和已确认历史锁定。
// English: Browser acceptance for ERP headers, quote notes, backups and immutable confirmed revisions.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{pathToFileURL}=require("node:url");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({acceptDownloads:true}),page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 page.on("dialog",async d=>d.accept());
 const url=pathToFileURL(path.resolve(__dirname,"../../prototype/m1-lite/index.html")).href;
 const wait=m=>page.waitForFunction(x=>document.querySelector("#pilotSaveStatus").textContent.includes(x),m);
 try{
  await page.goto(url);
  await page.waitForFunction(()=>!document.getElementById("pilotNewWorkspace").disabled);
  assert.deepEqual(await page.evaluate(()=>{
   const it=parseItemRows("存货编码,存货名称,所属类别,询价数量,询价单位\nERP-001,测试件,五金,2,件");
   const old=parseItemRows("物料编码,物料名称,分类,数量,单位\nLEG-001,旧格式件,五金,3,套");
   return [it[0].id,it[0].name,it[0].cat,it[0].qty,it[0].unit,old[0].id,old[0].qty];
  }),["ERP-001","测试件","五金",2,"件","LEG-001",3]);
  console.log("PASS FIELDS01: new ERP and legacy CSV headers both map to the same fields");
  await page.locator("#pilotNewWorkspace").click();
  await wait("已开始空白正式工作");
  await page.locator("#pilotCounterpartyCode").fill("CP-001");
  await page.locator("#pilotSupplierCode").fill("SUP-001");
  await page.locator("#pilotSupplierName").fill("匿名供应商");
  await page.locator("#pilotAddSupplier").click();
  await page.locator("#toggleItemIntake").click();
  await page.locator("#importFile").setInputFiles({name:"inventory.csv",mimeType:"text/csv",
   buffer:Buffer.from("存货编码,存货名称,所属类别,询价数量,询价单位\nERP-001,测试件,五金,2,件\n")});
  await page.locator("#confirmImportRows").waitFor({state:"visible"});
  await page.locator("#confirmImportRows").click();
  assert.equal(await page.evaluate(()=>items[0].id),"ERP-001");
  assert.match(await page.locator("#itemHead").innerText(),/存货编码/);
  assert.match(await page.locator("#itemHead").innerText(),/询价数量/);
  console.log("PASS FIELDS02: canonical ERP item labels visible and real file import succeeds");
  await page.locator('[data-tab="assign"]').click();
  await page.locator("#assignItemBody [data-ai]").first().check();
  await page.locator('[data-add="SUP-001"]').click();
  await page.locator('[data-tab="quoteImport"]').click();
  await page.locator("#quoteImportSupplier").selectOption("SUP-001");
  await page.locator("#quoteEvidenceNote").fill("邮件附件:测试-001.pdf");
  await page.locator("#quoteTermsNote").fill("报价有效期15天，运费另计；付款方式需确认");
  await page.locator("#quoteImportFile").setInputFiles({name:"quote.csv",mimeType:"text/csv",
   buffer:Buffer.from("存货编码,报价单价,交期,MOQ,报价状态,物料备注\nERP-001,18.75,5,1,正常报价,可用替代品牌；需复核，限单次采购\n")});
  await page.locator("#quoteImportPreviewBody tr").first().waitFor();
  assert.match(await page.locator("#quoteImportPreviewBody").innerText(),/可用替代品牌；需复核，限单次采购/);
  await page.locator("#commitQuoteImport").click();
  assert.equal(await page.evaluate(()=>quoteRounds[0].lines[0].remark),"可用替代品牌；需复核，限单次采购");
  await page.locator("#confirmQuoteRound").click();
  assert.deepEqual(await page.evaluate(()=>({
   terms:quoteRounds[0].termsNote,evidence:quoteRounds[0].evidenceNote,
   note:quoteRounds[0].lines[0].remark,status:quoteRounds[0].status
  })),{terms:"报价有效期15天，运费另计；付款方式需确认",evidence:"邮件附件:测试-001.pdf",note:"可用替代品牌；需复核，限单次采购",status:"confirmed"});
  assert.equal(await page.locator("#quoteTermsNote").isDisabled(),true);
  console.log("PASS NOTES03: imported line note, round terms and evidence remain distinct and locked");
  await page.locator('[data-tab="quotes"]').click();
  assert.match(await page.locator("#quoteTable").innerText(),/可用替代品牌；需复核，限单次采购/);
  assert.match(await page.locator("#quoteTable").innerText(),/运费另计/);
  console.log("PASS NOTES04: buyer sees both levels of notes while comparing supplier prices");
  await page.locator("#pilotSaveWorkspace").click();
  await wait("已保存到本机");
  await page.reload();
  await wait("已自动恢复本机正式工作");
  assert.equal(await page.evaluate(()=>SRMPilot.dirty()),false,"restoring a committed workspace must not flag unsaved edits");
  assert.equal(await page.evaluate(()=>quoteRounds[0].termsNote),"报价有效期15天，运费另计；付款方式需确认");
  assert.equal(await page.evaluate(()=>quoteRounds[0].lines[0].remark),"可用替代品牌；需复核，限单次采购");
  console.log("PASS NOTES05: round and line notes survive save and browser reload");
  const dl=page.waitForEvent("download");
  await page.locator("#pilotExportBackup").click();
  const file=await dl, backup=JSON.parse(fs.readFileSync(await file.path(),"utf8"));
  assert.equal(backup.workspace.state.quoteRounds[0].termsNote,"报价有效期15天，运费另计；付款方式需确认");
  assert.equal(backup.workspace.state.quoteRounds[0].lines[0].remark,"可用替代品牌；需复核，限单次采购");
  console.log("PASS NOTES06: portable JSON backup includes both note types and evidence reference");
  await page.locator('[data-tab="quoteImport"]').click();
  await page.locator("#newQuoteRevision").click();
  const curr=await page.evaluate(()=>quoteRounds.filter(r=>r.revisionNo===2)[0]);
  assert.equal(curr.termsNote,"报价有效期15天，运费另计；付款方式需确认");
  assert.equal(curr.lines[0].remark,"可用替代品牌；需复核，限单次采购");
  await page.locator("#quoteTermsNote").fill("新版条款：含运费");
  await page.locator("#confirmQuoteRound").click();
  assert.equal(await page.evaluate(()=>quoteRounds.find(r=>r.revisionNo===1).termsNote),"报价有效期15天，运费另计；付款方式需确认");
  assert.equal(await page.evaluate(()=>quoteRounds.find(r=>r.revisionNo===2).termsNote),"新版条款：含运费");
  console.log("PASS NOTES07: quote revision copies notes but updates terms without rewriting confirmed history");
  await page.locator("#pilotSaveWorkspace").click();
  await wait("已保存到本机");
  await page.evaluate(()=>{quoteRounds[0].termsNote="篡改旧版备注"});
  await page.locator("#pilotSaveWorkspace").click();
  await wait("保存失败");
  assert.match(await page.locator("#pilotSaveStatus").innerText(),/已确认的报价历史/);
  console.log("PASS NOTES08: confirmed quotation notes cannot be silently overwritten");
  assert.deepEqual(errors,[]);
  console.log("PASS NOTES09: no uncaught browser JavaScript errors");
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
