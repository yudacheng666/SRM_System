// 中文：真实 Chromium 文件下载/上传测试，全部使用匿名虚构物料和供应商。
 // English: Real Chromium JSON download/restore tests with synthetic buyer records only.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {pathToFileURL}=require("node:url"),{chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 const entry=pathToFileURL(path.resolve(__dirname,"../../prototype/m1-lite/index.html")).href;
 const errors=[],dialogs=[];
 const hook=p=>{
   p.on("pageerror",e=>errors.push(e.message));
   p.on("dialog",async d=>{dialogs.push(d.message());await d.accept()});
 };
 const wait=(p,phrase)=>p.waitForFunction(x=>document.querySelector("#pilotSaveStatus").textContent.includes(x),phrase);
 try{
   const c1=await browser.newContext({acceptDownloads:true}),a=await c1.newPage();hook(a);
   await a.goto(entry);
   await a.waitForFunction(()=>!document.getElementById("pilotNewWorkspace").disabled);
   await a.locator("#pilotNewWorkspace").click();
   await wait(a,"已开始空白正式工作");
   await a.locator("#pilotCounterpartyCode").fill("CP-001");
   await a.locator("#pilotSupplierCode").fill("S-001");
   await a.locator("#pilotSupplierName").fill("虚构甲供应商");
   await a.locator("#pilotAddSupplier").click();
   await a.locator("#toggleItemIntake").click();
   await a.locator("#importFile").setInputFiles({name:"anonymous-items.csv",mimeType:"text/csv",
     buffer:Buffer.from("物料编码,物料名称,分类,数量,单位\nITEM-001,虚构测试物料,类别A,10,件\n")});
   await a.locator("#confirmImportRows").waitFor({state:"visible"});
   await a.locator("#confirmImportRows").click();
   await a.locator('[data-tab="assign"]').click();
   await a.locator("#assignItemBody [data-ai]").first().check();
   await a.locator('[data-add="S-001"]').click();
   await a.locator('[data-tab="quoteImport"]').click();
   await a.locator("#quoteImportSupplier").selectOption("S-001");
   await a.locator("#quoteImportFile").setInputFiles({name:"anonymous-quotes.csv",mimeType:"text/csv",
     buffer:Buffer.from("物料编码,单价,交期,MOQ,报价状态\nITEM-001,15.75,7,1,正常报价\n")});
   await a.locator("#quoteImportPreviewBody tr").first().waitFor();
   await a.locator("#commitQuoteImport").click();
   await a.locator("#confirmQuoteRound").click();
   await a.locator("#pilotSaveWorkspace").click();
   await wait(a,"已保存到本机");
   assert.equal(await a.evaluate(()=>SRMPilot.revision()),1);
   console.log("PASS BACKUP01: saved synthetic buyer RFQ, supplier, assignment and confirmed quote");

   const promised=a.waitForEvent("download");
   await a.locator("#pilotExportBackup").click();
   const download=await promised;
   assert.match(download.suggestedFilename(),/^\d{8}_SRM_RFQ-\d+_v1\.json$/);
   const exported=fs.readFileSync(await download.path(),"utf8");
   const pack=JSON.parse(exported);
   assert.equal(pack.format,"srm-lite-json-backup");
   assert.equal(pack.backupVersion,1);
   assert.equal(pack.attachmentsIncluded,false);
   assert.equal(pack.workspace.state.items.length,1);
   assert.equal(pack.workspace.state.suppliers[0].supplierCode,"S-001");
   assert.equal(pack.workspace.state.quoteRounds[0].lines[0].price,15.75);
   assert.equal(pack.workspace.state.quoteRounds[0].status,"confirmed");
   assert.match(await a.locator("#pilotSaveStatus").innerText(),/已发起备份文件下载/);
   console.log("PASS BACKUP02: actual JSON file downloads, retains full structured quote and excludes evidence binaries");

   const c2=await browser.newContext({acceptDownloads:true}),b=await c2.newPage();hook(b);
   await b.goto(entry);
   await b.waitForFunction(()=>!document.getElementById("pilotRestoreFile").disabled);
   assert.equal(await b.evaluate(()=>SRMPilot.isBuyer()),false);
   await b.locator("#pilotRestoreFile").setInputFiles({name:"archive.json",mimeType:"application/json",buffer:Buffer.from(exported)});
   await b.locator("#pilotRestorePreview").waitFor({state:"visible"});
   assert.match(await b.locator("#pilotRestoreDetail").innerText(),/待恢复工作/);
   assert.match(await b.locator("#pilotRestoreDetail").innerText(),/不含邮件、聊天截图、PDF/);
   assert.equal(await b.evaluate(()=>SRMPilot.isBuyer()),false);
   console.log("PASS BACKUP03: backup preview in separate empty browser does not mutate its database");
   await b.locator("#pilotConfirmRestore").click();
   await wait(b,"已从文件恢复");
   assert.equal(await b.evaluate(()=>SRMPilot.isBuyer()),true);
   assert.equal(await b.evaluate(()=>quoteRounds[0].lines[0].price),15.75);
   await b.reload();await wait(b,"已自动恢复本机正式工作");
   const verified=await b.evaluate(()=>({
     items:items.map(x=>x.id),supplier:suppliers.map(x=>x.counterpartyCode+"|"+x.supplierCode),
     assignment:getSet(items[0].lineId).has("S-001"),
     quote:quoteRounds.map(x=>({status:x.status,price:x.lines[0].price}))
   }));
   assert.deepEqual(verified,{items:["ITEM-001"],supplier:["CP-001|S-001"],assignment:true,
     quote:[{status:"confirmed",price:15.75}]});
   console.log("PASS BACKUP04: restore across isolated browser contexts and reload preserves supplier and quote history");

   await b.locator("#pilotRestoreFile").setInputFiles({name:"broken.json",mimeType:"application/json",
     buffer:Buffer.from('{"not":"valid"')});
   await b.waitForTimeout(300);
   console.log("DEBUG invalid backup",JSON.stringify({status:await b.locator("#pilotSaveStatus").innerText(),enabled:await b.locator("#pilotRestoreFile").isEnabled(),errors:errors.slice(-3)}));
   await wait(b,"恢复预览失败");
   assert.equal(await b.locator("#pilotRestorePreview").isVisible(),false);
   assert.equal(await b.evaluate(()=>quoteRounds[0].lines[0].price),15.75);
   const bad=JSON.parse(exported);
   bad.workspace.state.assignments[0].values=["NO-SUPPLIER"];
   await b.locator("#pilotRestoreFile").setInputFiles({name:"broken-relation.json",mimeType:"application/json",
     buffer:Buffer.from(JSON.stringify(bad))});
   await wait(b,"恢复预览失败");
   assert.equal(await b.locator("#pilotRestorePreview").isVisible(),false);
   assert.equal(await b.evaluate(()=>quoteRounds[0].lines[0].price),15.75);
   console.log("PASS BACKUP05: malformed and broken-reference JSON rejected without replacing existing data");

   await b.locator("#pilotSaveWorkspace").click();await wait(b,"已保存到本机");
   assert.equal(await b.evaluate(()=>SRMPilot.revision()),2);
   await b.locator("#pilotRestoreFile").setInputFiles({name:"restore-old-v1.json",mimeType:"application/json",
     buffer:Buffer.from(exported)});
   await b.locator("#pilotRestorePreview").waitFor({state:"visible"});
   assert.match(await b.locator("#pilotRestoreDetail").innerText(),/当前本机/);
   await b.locator("#pilotConfirmRestore").click();await wait(b,"已从文件恢复");
   assert.equal(await b.evaluate(()=>SRMPilot.revision()),1);
   await b.locator("#pilotUndoRestore").click();await wait(b,"已撤销最近一次文件恢复");
   assert.equal(await b.evaluate(()=>SRMPilot.revision()),2);
   console.log("PASS BACKUP06: explicit replace retains atomic rollback and one-step undo");

   const stale=await c2.newPage();hook(stale);
   await stale.goto(entry);await wait(stale,"已自动恢复本机正式工作");
   await b.locator("#pilotRestoreFile").setInputFiles({name:"preview-then-concurrent.json",mimeType:"application/json",
     buffer:Buffer.from(exported)});
   await b.locator("#pilotRestorePreview").waitFor({state:"visible"});
   await stale.locator("#pilotSaveWorkspace").click();await wait(stale,"已保存到本机");
   assert.equal(await stale.evaluate(()=>SRMPilot.revision()),3);
   await b.locator("#pilotConfirmRestore").click();await wait(b,"恢复失败");
   assert.match(await b.locator("#pilotSaveStatus").innerText(),/本机记录已发生变化/);
   await stale.reload();await wait(stale,"已自动恢复本机正式工作");
   assert.equal(await stale.evaluate(()=>SRMPilot.revision()),3);
   console.log("PASS BACKUP07: stale preview cannot overwrite another tab's newer saved state");
   assert.equal(errors.length,0,errors.join("\n"));
   console.log("PASS BACKUP08: no uncaught browser exceptions");
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
