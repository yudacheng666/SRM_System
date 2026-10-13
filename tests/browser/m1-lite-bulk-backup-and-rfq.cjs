// 中文：真实 Chromium 测试完整询价 JSON 备份、选择恢复、冲突拒绝及逐供应商 ZIP。
 // English: Chromium end-to-end test for bulk backup/restore, collisions and supplier-confidential XLSX ZIP.
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {pathToFileURL}=require("node:url"),{chromium}=require("playwright");
globalThis.M1WorkspaceCore=require("../../src/m1-lite/workspace-core.js");
const backup=require("../../src/m1-lite/portable-backup.js");
const {fixture}=require("../m1-lite-report-model.cjs");
const directory="/tmp/srm-lite-bulk-tests";
fs.mkdirSync(directory,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),errors=[];
 const url=pathToFileURL(path.resolve(__dirname,"../../prototype/m1-lite/index.html")).href;
 const newPage=async()=>{
  const context=await browser.newContext({acceptDownloads:true}),page=await context.newPage();
  page.on("dialog",async d=>d.accept());
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(url);
  await page.waitForFunction(()=>!document.querySelector("#pilotImportBackup").disabled);
  return{context,page};
 };
 try{
  const {page}=await newPage();
  const ws=fixture();
  await page.locator("#pilotImportBackup").setInputFiles({name:"synthetic-single.json",mimeType:"application/json",buffer:Buffer.from(backup.create(ws))});
  await page.waitForFunction(()=>document.querySelector("#pilotBackupPreview").textContent.includes("RFQ-FAKE-TEST"));
  await page.locator("#pilotRestoreBackup").click();
  await page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("结构化数据已恢复到本机"));
  console.log("PASS BULK-BROWSER01: existing single JSON restore remains operational");

  await page.locator("#pilotReportOpen").click();
  await page.locator("#pilotReportSinglePicker").waitFor({state:"visible"});
  assert.equal(await page.locator("#pilotReportDownloadAll").isVisible(),true);
  await page.locator('[data-report-group="rfq"][data-report-field="category"]').uncheck();
  const waitZip=page.waitForEvent("download");
  await page.locator("#pilotReportDownloadAll").click();
  const zip=await waitZip;
  assert.match(zip.suggestedFilename(),/全部供应商询价单.*\.zip$/);
  await zip.saveAs(path.join(directory,"suppliers.zip"));
  assert.match(await page.locator("#pilotReportHint").innerText(),/2 家供应商/);
  console.log("PASS BULK-BROWSER02: two independently scoped supplier XLSX files downloaded as one offline ZIP");

  await page.locator("#pilotNewWorkspace").click();
  await page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已开始空白正式工作"));
  await page.locator("#pilotSaveWorkspace").click();
  await page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已保存到本机"));
  assert.equal(await page.locator("#pilotHistoryWorkspace option").count(),2);
  const download=page.waitForEvent("download");
  await page.locator("#pilotExportBackupAll").click();
  const d=await download;
  await d.saveAs(path.join(directory,"all-workspaces.json"));
  const json=fs.readFileSync(path.join(directory,"all-workspaces.json"),"utf8");
  const multi=backup.parseAll(json);
  assert.equal(multi.workspaces.length,2);
  assert(multi.workspaces.some(w=>w.workspaceId==="RFQ-FAKE-TEST"));
  assert(multi.workspaces.some(w=>w.state.items.length===0));
  console.log("PASS BULK-BROWSER03: both current and archived RFQs are included in the full committed JSON backup");

  const partial=await newPage();
  await partial.page.locator("#pilotImportBackup").setInputFiles({name:"all.json",mimeType:"application/json",buffer:Buffer.from(json)});
  await partial.page.waitForFunction(()=>document.querySelector("#pilotBackupPreview").textContent.includes("2 笔询价"));
  assert.equal(await partial.page.locator("#pilotBulkRestoreOptions").isVisible(),true);
  await partial.page.locator("#pilotBulkRestoreScope").selectOption("single");
  await partial.page.locator("#pilotBulkRestoreSelection").selectOption("RFQ-FAKE-TEST");
  await partial.page.locator("#pilotRestoreBackup").click();
  await partial.page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已成功恢复 1 笔询价"));
  assert.equal(await partial.page.evaluate(()=>window.SRMPilot.snapshot().workspaceId),"RFQ-FAKE-TEST");
  assert.equal(await partial.page.locator("#pilotHistoryWorkspace option").count(),1);
  console.log("PASS BULK-BROWSER04: selecting one RFQ from a two-RFQ backup restores only that RFQ");

  const complete=await newPage();
  await complete.page.locator("#pilotImportBackup").setInputFiles({name:"all.json",mimeType:"application/json",buffer:Buffer.from(json)});
  await complete.page.waitForFunction(()=>document.querySelector("#pilotBackupPreview").textContent.includes("2 笔询价"));
  await complete.page.locator("#pilotRestoreBackup").click();
  await complete.page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已成功恢复 2 笔询价"));
  assert.equal(await complete.page.locator("#pilotHistoryWorkspace option").count(),2);
  const activeId=await complete.page.evaluate(()=>window.SRMPilot.snapshot().workspaceId);
  assert.equal(activeId,multi.workspaces[0].workspaceId);
  await complete.page.reload();
  await complete.page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已自动恢复本机正式工作"));
  assert.equal(await complete.page.locator("#pilotHistoryWorkspace option").count(),2);
  console.log("PASS BULK-BROWSER05: all RFQs restored atomically and persist after browser reload");

  const countBefore=await complete.page.locator("#pilotHistoryWorkspace option").count();
  await complete.page.locator("#pilotImportBackup").setInputFiles({name:"duplicate.json",mimeType:"application/json",buffer:Buffer.from(json)});
  await complete.page.waitForFunction(()=>document.querySelector("#pilotBackupPreview").textContent.includes("2 笔询价"));
  await complete.page.locator("#pilotRestoreBackup").click();
  await complete.page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("编号冲突"));
  assert.equal(await complete.page.locator("#pilotHistoryWorkspace option").count(),countBefore);
  assert.equal(await complete.page.evaluate(()=>window.SRMPilot.snapshot().workspaceId),activeId);
  console.log("PASS BULK-BROWSER06: importing duplicate backup refuses the entire batch without overwriting local records");

  assert.deepEqual(errors,[]);
  console.log("PASS BULK-BROWSER07: no uncaught browser errors");
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
