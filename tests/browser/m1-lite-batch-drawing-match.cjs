// 中文：Chromium 真正操作批量匹配、人工指定、确认、保存及重开；测试数据全部虚构。
 // English: Real-browser batch PDF preview, ambiguous manual override, commit and persistence test.
"use strict";
const assert=require("node:assert/strict"),path=require("node:path");
const {pathToFileURL}=require("node:url"),{chromium}=require("playwright");
function pdf(message){
 const objects=[
 "<< /Type /Catalog /Pages 2 0 R >>",
 "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
 "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
 null,
 "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
 ];
 const code="BT /F1 18 Tf 70 700 Td ("+message+") Tj ET";
 objects[3]="<< /Length "+Buffer.byteLength(code)+" >>\nstream\n"+code+"\nendstream";
 const parts=["%PDF-1.4\n"],offsets=[0];
 for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(parts.join("")));
  parts.push((i+1)+" 0 obj\n"+objects[i]+"\nendobj\n")}
 const start=Buffer.byteLength(parts.join(""));
 parts.push("xref\n0 "+(objects.length+1)+"\n0000000000 65535 f \n");
 for(let i=1;i<offsets.length;i++)parts.push(String(offsets[i]).padStart(10,"0")+" 00000 n \n");
 parts.push("trailer\n<< /Size "+(objects.length+1)+" /Root 1 0 R >>\nstartxref\n"+start+"\n%%EOF\n");
 return Buffer.from(parts.join(""));
}
(async()=>{
 const browser=await chromium.launch({headless:true}),errors=[];
 const context=await browser.newContext({acceptDownloads:true}),page=await context.newPage();
 page.on("dialog",d=>d.accept());page.on("pageerror",e=>errors.push(e.message));
 try{
  const url=pathToFileURL(path.resolve(__dirname,"../../prototype/m1-lite/index.html")).href;
  await page.goto(url);
  await page.waitForFunction(()=>!document.querySelector("#pilotNewWorkspace").disabled);
  await page.locator("#pilotNewWorkspace").click();
  await page.waitForFunction(()=>SRMPilot.isBuyer());
  await page.evaluate(()=>{
   const list=[
    {lineId:"BATCH-L1",id:"P-001",drawingNo:"D-101",name:"匿名物料一",cat:"示例",qty:4,unit:"件"},
    {lineId:"BATCH-L2",id:"P-002",drawingNo:"D-102",name:"匿名物料二",cat:"示例",qty:5,unit:"件"},
    {lineId:"BATCH-L3",id:"P-002",drawingNo:"D-103",name:"匿名物料三",cat:"示例",qty:6,unit:"件"},
    {lineId:"BATCH-L4",id:"P-004",drawingNo:"D-104",name:"匿名物料四",cat:"示例",qty:7,unit:"件"}
   ];
   items.push(...list);lineSeq=4;createdSeq=4;
   SRMDrawUI.refresh();renderItemList();
  });
  const incoming=[
   {name:"P-001_RevB.pdf",mimeType:"application/pdf",buffer:pdf("ONE")},
   {name:"D-102_A.pdf",mimeType:"application/pdf",buffer:pdf("TWO")},
   {name:"P-002_RevC.pdf",mimeType:"application/pdf",buffer:pdf("THREE")},
   {name:"X-999.pdf",mimeType:"application/pdf",buffer:pdf("FOUR")}
  ];
  await page.locator("#pilotBatchDrawingFiles").setInputFiles(incoming);
  await page.locator("#pilotBatchDrawingAnalyze").click();
  await page.waitForFunction(()=>document.querySelectorAll("[data-batch-row]").length===4);
  assert.match(await page.locator("#pilotBatchDrawingSummary").innerText(),/唯一候选 2/);
  assert.match(await page.locator("#pilotBatchDrawingSummary").innerText(),/多候选 1/);
  assert.equal(await page.locator('[data-batch-check="0"]').isChecked(),true);
  assert.equal(await page.locator('[data-batch-check="1"]').isChecked(),true);
  assert.equal(await page.locator('[data-batch-check="2"]').isChecked(),false);
  assert.equal(await page.locator('[data-batch-check="3"]').isChecked(),false);
  assert.deepEqual(await page.evaluate(()=>items.map(x=>(x.drawings||[]).length)),[0,0,0,0]);
  assert.equal(await page.locator('[data-batch-version="0"]').inputValue(),"B");
  console.log("PASS BATCH-BROWSER01: match preview identifies unique, ambiguous and unrecognized PDFs without mutating RFQs");

  await page.locator('[data-batch-focus="2"]').click();
  await page.locator("#pilotBatchDrawingManualLine").selectOption("BATCH-L3");
  await page.locator("#pilotBatchDrawingManualAssign").click();
  assert.equal(await page.locator('[data-batch-check="2"]').isChecked(),true);
  assert.equal(await page.locator('[data-batch-target="2"]').inputValue(),"BATCH-L3");
  await page.locator('[data-batch-focus="3"]').click();
  assert.match(await page.locator("#pilotBatchDrawingFocus").innerText(),/X-999.pdf/);
  await page.locator("#pilotBatchDrawingConfirm").click();
  await page.waitForFunction(()=>document.querySelector("#pilotBatchDrawingSummary").textContent.includes("已确认 3 份 PDF"));
  assert.deepEqual(await page.evaluate(()=>items.map(x=>(x.drawings||[]).length)),[1,1,1,0]);
  assert.equal(await page.evaluate(()=>items[0].drawings[0].revision),"B");
  assert.equal(await page.evaluate(()=>items[2].drawings[0].revision),"C");
  console.log("PASS BATCH-BROWSER02: buyer manually resolves duplicate-code RFQ line, unmatched PDF stays unlinked");

  await page.locator("#pilotSaveWorkspace").click();
  await page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已保存到本机"));
  await page.reload();
  await page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已自动恢复本机正式工作"));
  assert.deepEqual(await page.evaluate(()=>items.map(x=>(x.drawings||[]).length)),[1,1,1,0]);
  const hashes=await page.evaluate(async()=>{
   const ws=SRMPilot.snapshot(),output=[];
   for(const it of ws.state.items)for(const drawing of it.drawings||[]){
    const bytes=await SRMDrawings.get(ws.workspaceId,drawing.sha256);
    output.push(bytes&&await SRMDrawings.digest(await bytes.arrayBuffer())===drawing.sha256);
   }
   return output;
  });
  assert.deepEqual(hashes,[true,true,true]);
  console.log("PASS BATCH-BROWSER03: confirmed links and original PDF bytes persist after save and browser reload");

  await page.locator("#pilotBatchDrawingFiles").setInputFiles([
    {name:"P-001_RevB.pdf",mimeType:"application/pdf",buffer:pdf("DIFFERENT")}]);
  await page.locator("#pilotBatchDrawingAnalyze").click();
  await page.waitForFunction(()=>document.querySelectorAll("[data-batch-row]").length===1);
  await page.locator("#pilotBatchDrawingConfirm").click();
  await page.waitForFunction(()=>document.querySelector("#pilotBatchDrawingSummary").textContent.includes("同名同版本"));
  assert.equal(await page.evaluate(()=>items[0].drawings.length),1);
  console.log("PASS BATCH-BROWSER04: conflicting same-name/same-revision drawing content cannot silently replace prior version");

  await page.locator("#pilotBatchDrawingClear").click();
  assert.equal(await page.locator("[data-batch-row]").count(),0);
  assert.deepEqual(errors,[]);
  console.log("PASS BATCH-BROWSER05: staging can be cleared and no page errors occur");
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
