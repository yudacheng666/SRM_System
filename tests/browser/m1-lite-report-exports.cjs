// 中文：浏览器实际恢复匿名工作并下载两类 Excel；校验字段勾选及安全提示。
 // English: Chromium downloads supplier RFQ and internal comparison with selectable columns.
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {pathToFileURL}=require("node:url"),{chromium}=require("playwright");
const {fixture}=require("../m1-lite-report-model.cjs");
globalThis.M1WorkspaceCore=require("../../src/m1-lite/workspace-core.js");
const backup=require("../../src/m1-lite/portable-backup.js");
(async()=>{
 const browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({acceptDownloads:true}),page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 page.on("dialog",async d=>d.accept());
 const url=pathToFileURL(path.resolve(__dirname,"../../prototype/m1-lite/index.html")).href;
 const dir="/tmp/srm-lite-xlsx-fixtures";
 try{
  const ws=fixture();
  await page.goto(url);
  await page.waitForFunction(()=>!document.getElementById("pilotImportBackup").disabled);
  await page.locator("#pilotImportBackup").setInputFiles({
   name:"anonymous-backup.json",mimeType:"application/json",buffer:Buffer.from(backup.create(ws))
  });
  await page.waitForFunction(()=>document.querySelector("#pilotBackupPreview").textContent.includes("RFQ-FAKE-TEST"));
  await page.locator("#pilotRestoreBackup").click();
  await page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("结构化数据已恢复到本机"));
  await page.locator("#pilotReportOpen").click();
  assert.equal(await page.locator("#pilotReportPanel").isVisible(),true);
  assert.equal(await page.locator("#pilotReportSupplier option").count(),2);
  console.log("PASS DOC01: actual browser enters formal export panel from recovered buyer snapshot");
  await page.locator("#pilotReportSupplier").selectOption("SUP-B");
  await page.locator('[data-report-group="rfq"][data-report-field="category"]').uncheck();
  assert.equal(await page.locator('[data-report-group="rfq"][data-report-field="lineId"]').isDisabled(),true);
  const supplierDl=page.waitForEvent("download");
  await page.locator("#pilotReportDownload").click();
  const f=await supplierDl;
  assert.match(f.suggestedFilename(),/SRM_询价单_SUP-B.*\.xlsx/);
  await f.saveAs(path.join(dir,"supplier-rfq-report.xlsx"));
  assert.equal(await page.evaluate(()=>SRMPilot.dirty()),false,"export download must not dirty saved work");
  console.log("PASS DOC02: real supplier-specific RFQ downloaded without marking saved data dirty");
  await page.locator("#pilotReportType").selectOption("comparison");
  await page.locator('[data-report-supplier="SUP-A"]').check();
  await page.locator("#pilotReportDownload").click();
  await page.waitForTimeout(350);
  const detail=await page.evaluate(()=>({
    hint:document.querySelector("#pilotReportHint").textContent,
    count:document.querySelectorAll('[data-report-supplier]:checked').length,
    type:document.querySelector("#pilotReportType").value,
    dirty:window.SRMPilot.dirty(),
    actionDisabled:document.querySelector("#pilotReportDownload").disabled
  }));
  console.log("REPORT PICKER CHECK",JSON.stringify(detail));
  assert.match(detail.hint,/至少两家/,JSON.stringify(detail));
  console.log("PASS DOC03: single-supplier internal comparison is blocked with actionable message");
  await page.locator('[data-report-supplier="SUP-B"]').check();
  await page.locator('[data-report-group="summary"][data-report-field="name"]').uncheck();
  await page.locator('[data-report-group="history"][data-report-field="price"]').uncheck();
  const compareDl=page.waitForEvent("download");
  await page.locator("#pilotReportDownload").click();
  const x=await compareDl;
  assert.match(x.suggestedFilename(),/SRM_比价议价单_/);
  await x.saveAs(path.join(dir,"comparison-history-report.xlsx"));
  assert.match(await page.locator("#pilotReportHint").innerText(),/共同有效报价 1 项/);
  console.log("PASS DOC04: real two-sheet comparison downloaded with independent summary/history column choices");
  await page.reload();
  await page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已自动恢复本机正式工作"));
  assert.equal(await page.evaluate(()=>SRMPilot.dirty()),false);
  assert.deepEqual(errors,[]);
  console.log("PASS DOC05: no uncaught JS errors and buyer session restores cleanly");
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
