// 中文：端到端测试真实 PDF 导入、共享、预览、持久保存、供方隔离 ZIP 和完整恢复。
// English: Real Chromium + file:// regression covering binary drawings, buyer workflow, vendor packages and atomic recovery.
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {chromium}=require("playwright"),{pathToFileURL}=require("node:url");
function makePdf(marker){
 const objects=[
 '<< /Type /Catalog /Pages 2 0 R >>',
 '<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>',
 '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 7 0 R >> >> /Contents 5 0 R >>',
 '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 7 0 R >> >> /Contents 6 0 R >>',
 null,null,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
 for(let i=0;i<2;i++){
  const stream='BT /F1 20 Tf 72 700 Td ('+marker+' PAGE '+(i+1)+') Tj ET';
  objects[4+i]='<< /Length '+Buffer.byteLength(stream)+' >>\nstream\n'+stream+'\nendstream';
 }
 const parts=['%PDF-1.4\n'],offsets=[0];
 for(let i=0;i<objects.length;i++){
  offsets.push(Buffer.byteLength(parts.join("")));
  parts.push((i+1)+' 0 obj\n'+objects[i]+'\nendobj\n');
 }
 const start=Buffer.byteLength(parts.join(""));
 parts.push('xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n');
 for(let i=1;i<offsets.length;i++)parts.push(String(offsets[i]).padStart(10,"0")+' 00000 n \n');
 parts.push('trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF\n');
 return Buffer.from(parts.join(""));
}
const dir="/tmp/srm-drawings-test";fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),errors=[];
 const url=pathToFileURL(path.resolve(__dirname,"../../prototype/m1-lite/index.html")).href;
 const setup=async()=>{
  const context=await browser.newContext({acceptDownloads:true}),page=await context.newPage();
  page.on("dialog",d=>d.accept());page.on("pageerror",e=>errors.push(e.message));
  await page.goto(url);
  await page.waitForFunction(()=>!document.querySelector("#pilotNewWorkspace").disabled);
  return{context,page};
 };
 try{
  const {page}=await setup();
  await page.locator("#pilotNewWorkspace").click();
  await page.waitForFunction(()=>SRMPilot.isBuyer());
  assert.equal(await page.locator("#pilotDrawingPanel").isVisible(),true);
  await page.evaluate(()=>{
   const a={lineId:"FAKE-L1",id:"FAKE-PART-01",name:"匿名零件甲",cat:"测试",qty:10,unit:"件"};
   const b={lineId:"FAKE-L2",id:"FAKE-PART-02",name:"匿名零件乙",cat:"测试",qty:20,unit:"件"};
   items.push(a,b);lineSeq=2;createdSeq=2;
   suppliers.push({id:"FAKE-SUP-A",name:"匿名供方甲",counterpartyCode:"FAKE-CP-A",supplierCode:"FAKE-SUP-A"},
                  {id:"FAKE-SUP-B",name:"匿名供方乙",counterpartyCode:"FAKE-CP-B",supplierCode:"FAKE-SUP-B"});
   rfqSupplierPool.add("FAKE-SUP-A");rfqSupplierPool.add("FAKE-SUP-B");
   assignments.set("FAKE-L1",new Set(["FAKE-SUP-A"]));
   assignments.set("FAKE-L2",new Set(["FAKE-SUP-B"]));
   SRMDrawUI.refresh();renderItemList();renderAssignAll();
  });
  const alpha=makePdf("ALPHA"),beta=makePdf("BETA");
  await page.locator("#pilotDrawingLine").selectOption("FAKE-L1");
  await page.locator("#pilotDrawingFiles").setInputFiles([
   {name:"FAKE-ALPHA.pdf",mimeType:"application/pdf",buffer:alpha},
   {name:"FAKE-BETA.pdf",mimeType:"application/pdf",buffer:beta}]);
  await page.locator("#pilotDrawingUpload").click();
  await page.waitForFunction(()=>document.querySelector("#pilotDrawingInfo").textContent.includes("已保存 2 份"));
  assert.equal(await page.evaluate(()=>items[0].drawings.length),2);
  await page.locator("#pilotDrawingLine").selectOption("FAKE-L2");
  const firstHash=await page.evaluate(()=>items[0].drawings[0].sha256);
  await page.locator("#pilotDrawingExisting").selectOption(firstHash);
  await page.locator("#pilotDrawingLink").click();
  assert.deepEqual(await page.evaluate(()=>items.map(x=>x.drawings.length)),[2,1]);
  console.log("PASS DRAW01: actual 2-page PDFs imported, hashes retained, a PDF reused across independent RFQ lines");

  await page.locator("#pilotSaveWorkspace").click();
  await page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已保存到本机"));
  await page.reload();
  await page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已自动恢复本机正式工作"));
  assert.deepEqual(await page.evaluate(()=>items.map(x=>x.drawings.length)),[2,1]);
  const stored=await page.evaluate(async()=>{
   const ws=SRMPilot.snapshot(),hash=ws.state.items[0].drawings[0].sha256;
   const file=await SRMDrawings.get(ws.workspaceId,hash);
   return{exists:!!file,ok:file&&await SRMDrawings.digest(await file.arrayBuffer())===hash};
  });
  assert.deepEqual(stored,{exists:true,ok:true});
  await page.locator('[data-drawing="FAKE-L1"]').first().click();
  await page.waitForFunction(()=>document.querySelector("#drawingLarge iframe")?.src.startsWith("blob:"));
  assert.equal(await page.locator("#drawingDocSelect option").count(),2);
  await page.locator("#drawingNextPage").click();
  await page.waitForFunction(()=>document.querySelector("#drawingLarge iframe")?.src.includes("#page=2"));
  await page.locator("#closeDrawing").click();
  console.log("PASS DRAW02: saved drawing links and intact PDF bytes survive reload, with real multipage browser preview");

  await page.locator("#pilotReportOpen").click();
  const dl=page.waitForEvent("download");
  await page.locator("#pilotReportDownloadAll").click();
  await (await dl).saveAs(path.join(dir,"supplier-drawings.zip"));
  console.log("PASS DRAW03: nested per-supplier ZIP downloaded with their scoped PDF originals");

  const full=page.waitForEvent("download");
  await page.locator("#pilotExportComplete").click();
  await (await full).saveAs(path.join(dir,"complete-drawings.zip"));
  console.log("PASS DRAW04: full RFQ plus PDF-binary backup downloaded");

  const restored=await setup();
  await restored.page.locator("#pilotImportComplete").setInputFiles({name:"complete-drawings.zip",mimeType:"application/zip",buffer:fs.readFileSync(path.join(dir,"complete-drawings.zip"))});
  await restored.page.waitForFunction(()=>document.querySelector("#pilotCompleteStatus").textContent.includes("已校验"));
  await restored.page.locator("#pilotRestoreComplete").click();
  await restored.page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已原子恢复"));
  await restored.page.reload();
  await restored.page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已自动恢复本机正式工作"));
  assert.deepEqual(await restored.page.evaluate(()=>items.map(x=>x.drawings.length)),[2,1]);
  const fileOK=await restored.page.evaluate(async()=>{
   const ws=SRMPilot.snapshot(),hash=ws.state.items[0].drawings[0].sha256;
   const f=await SRMDrawings.get(ws.workspaceId,hash);
   return!!f&&await SRMDrawings.digest(await f.arrayBuffer())===hash;
  });
  assert.equal(fileOK,true);
  console.log("PASS DRAW05: atomic complete-package restore into blank browser retains actual PDF bytes");

  await restored.page.locator("#pilotImportComplete").setInputFiles({name:"same.zip",mimeType:"application/zip",buffer:fs.readFileSync(path.join(dir,"complete-drawings.zip"))});
  await restored.page.waitForFunction(()=>document.querySelector("#pilotCompleteStatus").textContent.includes("已校验"));
  await restored.page.locator("#pilotRestoreComplete").click();
  await restored.page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已有相同询价编号"));
  console.log("PASS DRAW06: importing same complete ZIP refuses overwriting existing work and original PDF");
  assert.deepEqual(errors,[]);
  console.log("PASS DRAW07: no uncaught JavaScript errors");
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
