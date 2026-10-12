// 中文：真实 Chromium file:// 测试无网络的 XLSX 物料、供应商、报价导入导出与错误文件防护。
// English: Real offline Chromium XLSX round-trip and negative-input tests using exclusively synthetic records.
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {pathToFileURL}=require("node:url"),{chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({acceptDownloads:true}),page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 page.on("dialog",async d=>d.accept());
 const url=pathToFileURL(path.resolve(__dirname,"../../prototype/m1-lite/index.html")).href;
 async function wb(rows){
  const bytes=await page.evaluate(input=>{
    const w=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(w,XLSX.utils.aoa_to_sheet(input),"记录");
    return [...new Uint8Array(XLSX.write(w,{bookType:"xlsx",type:"array"}))];
  },rows);
  return Buffer.from(bytes);
 }
 async function upload(selector,rows,name="真实表格.xlsx"){
  await page.locator(selector).setInputFiles({name,mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",buffer:await wb(rows)});
 }
 async function readDownload(button){
  const promise=page.waitForEvent("download");
  await page.locator(button).click();
  const download=await promise;
  const buf=fs.readFileSync(await download.path());
  const data=await page.evaluate(bytes=>{
    const w=XLSX.read(new Uint8Array(bytes),{type:"array"});
    return XLSX.utils.sheet_to_json(w.Sheets[w.SheetNames[0]],{header:1,raw:false,defval:""});
  },[...buf]);
  return{filename:download.suggestedFilename(),headers:data[0],rows:data.slice(1),size:buf.length};
 }
 try{
  await page.goto(url);
  await page.waitForFunction(()=>!document.getElementById("pilotNewWorkspace").disabled);
  assert.equal(await page.evaluate(()=>!!window.XLSX?.read&&!!window.XLSX?.write&&!!window.SRMExcel),true);
  console.log("PASS XLSX01: self-contained file HTML initializes XLSX reader and writer without CDN");
  await page.locator("#pilotNewWorkspace").click();
  await page.waitForFunction(()=>window.SRMPilot?.isBuyer());
  await page.locator("#toggleItemIntake").click();
  await upload("#importFile",[
   ["存货编码","存货名称","所属类别","询价数量","询价单位"],
   ["000001","虚构零件一","五金",2,"件"],
   ["000002","虚构零件二","五金",3,"件"]
  ]);
  await page.waitForFunction(()=>document.querySelector("#importPreview").style.display!=="none");
  assert.match(await page.locator("#importPreview").innerText(),/000001/);
  await page.locator("#confirmImportRows").click();
  assert.deepEqual(await page.evaluate(()=>items.map(it=>[it.id,it.qty])),[["000001",2],["000002",3]]);
  console.log("PASS XLSX02: actual XLSX RFQ items imported with ERP headers and leading-zero codes");
  await upload("#pilotSupplierExcelFile",[
   ["往来单位编码","供应商编码","往来单位名称"],
   ["CP-001","SUP-001","虚构供应商甲"],
   ["CP-002","SUP-002","虚构供应商乙"]
  ]);
  await page.waitForFunction(()=>!document.querySelector("#pilotSupplierExcelConfirm").disabled);
  assert.match(await page.locator("#pilotSupplierExcelPreview").innerText(),/SUP-001/);
  await page.locator("#pilotSupplierExcelConfirm").click();
  assert.equal(await page.evaluate(()=>suppliers.length),2);
  assert.equal(await page.evaluate(()=>suppliers[0].counterpartyCode),"CP-001");
  assert.equal(await page.evaluate(()=>SRMPilot.dirty()),true);
  console.log("PASS XLSX03: supplier XLSX preview and explicit commit keep separate ERP counterparty/supplier codes");
  await upload("#pilotSupplierExcelFile",[
   ["往来单位编码","供应商编码","往来单位名称"],
   ["CP-001","SUP-009","重复往来"],
   ["CP-004","SUP-004","不应部分导入"]
  ],"重复供应商.xlsx");
  await page.waitForFunction(()=>document.querySelector("#pilotExcelStatus").textContent.includes("导入失败")||document.querySelector("#pilotExcelStatus").textContent.includes("未导入"));
  assert.equal(await page.locator("#pilotSupplierExcelConfirm").isDisabled(),true);
  assert.equal(await page.evaluate(()=>suppliers.length),2);
  console.log("PASS XLSX04: duplicate-supplier XLSX aborts atomically without importing other rows");
  await page.locator('[data-tab="assign"]').click();
  await page.locator("#assignItemBody [data-ai]").first().check();
  await page.locator('[data-add="SUP-001"]').click();
  assert.equal(await page.evaluate(()=>items.filter(it=>getSet(it.lineId).has("SUP-001")).length),1);
  await page.locator('[data-tab="quoteImport"]').click();
  await page.locator("#quoteImportSupplier").selectOption("SUP-001");
  await upload("#quoteImportFile",[
   ["供应商编码","报价轮次","报价版本","存货编码","报价单价","交期","MOQ","报价状态","物料备注","整轮商务备注"],
   ["SUP-001",1,1,"000001",55.5,7,1,"正常报价","替代件，需批准；仅试样","不含运费，付款协商"]
  ]);
  await page.waitForFunction(()=>document.querySelector("#quoteImportPreview").style.display!=="none");
  assert.match(await page.locator("#quoteImportPreviewBody").innerText(),/替代件，需批准；仅试样/);
  assert.equal(await page.locator("#quoteTermsNote").inputValue(),"不含运费，付款协商");
  await page.locator("#commitQuoteImport").click();
  assert.equal(await page.evaluate(()=>quoteRounds[0].lines[0].price),55.5);
  assert.equal(await page.evaluate(()=>quoteRounds[0].lines[0].remark),"替代件，需批准；仅试样");
  console.log("PASS XLSX05: supplier quote workbook imported to selected round with line notes and commercial terms");
  await upload("#quoteImportFile",[
   ["供应商编码","存货编码","报价单价"],["SUP-002","000001",99.5]
  ],"错供应商.xlsx");
  await page.waitForFunction(()=>document.querySelector("#quoteFileFeedback").textContent.includes("Excel 未导入"));
  assert.equal(await page.locator("#quoteImportPreview").isVisible(),false);
  assert.equal(await page.evaluate(()=>quoteRounds[0].lines[0].price),55.5);
  console.log("PASS XLSX06: mismatched supplier code refused without overwriting a saved draft price");
  const formulaBytes=await page.evaluate(()=>{
   const ws=XLSX.utils.aoa_to_sheet([["存货编码","存货名称","询价数量","询价单位"],["F-1","测试",1,"件"]]);
   ws.C2={t:"n",f:"1+1",v:2};const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,ws,"数据");
   return [...new Uint8Array(XLSX.write(w,{bookType:"xlsx",type:"array"}))];
  });
  await page.locator('[data-tab="items"]').click();
  await page.locator("#importFile").setInputFiles({name:"公式.xlsx",mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",buffer:Buffer.from(formulaBytes)});
  await page.waitForFunction(()=>document.querySelector("#itemFileFeedback").textContent.includes("Excel 未导入"));
  assert.equal(await page.locator("#importPreview").isVisible(),false);
  assert.equal(await page.evaluate(()=>items.length),2);
  console.log("PASS XLSX07: XLSX cells with formulas rejected; prior RFQ data unchanged");
  await page.locator("#importFile").setInputFiles({name:"损坏.xlsx",mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",buffer:Buffer.from("not a zip")});
  await page.waitForFunction(()=>document.querySelector("#itemFileFeedback").textContent.includes("Excel 未导入"));
  assert.equal(await page.locator("#importPreview").isVisible(),false);
  console.log("PASS XLSX08: corrupt workbook never yields synthetic rows");
  const inv=await readDownload("#pilotExportItemsExcel");
  assert.match(inv.filename,/\.xlsx$/);
  assert.deepEqual(inv.headers,["RFQ Line ID","存货编码","存货名称","所属类别","询价数量","询价单位"]);
  assert.equal(inv.rows.length,2);
  assert.equal(inv.rows[0][1],"000001");
  console.log("PASS XLSX09: actual downloadable inventory XLSX opens and preserves identity and quantities");
  const sp=await readDownload("#pilotExportSuppliersExcel");
  assert.equal(sp.rows.length,2);
  assert.deepEqual(sp.headers,["往来单位编码","供应商编码","往来单位名称"]);
  console.log("PASS XLSX10: actual downloadable supplier XLSX includes ERP codes and names");
  await page.locator('[data-tab="quoteImport"]').click();
  const q=await readDownload("#pilotExportQuoteExcel");
  assert.equal(q.rows.length,1);
  assert.ok(q.headers.includes("整轮商务备注"));
  assert.equal(q.rows[0][q.headers.indexOf("物料备注")],"替代件，需批准；仅试样");
  assert.equal(q.rows[0][q.headers.indexOf("报价单价")],"55.5");
  console.log("PASS XLSX11: real quote Excel export includes unit price, round identifiers and two levels of remarks");
  await page.locator("#confirmQuoteRound").click();
  await page.locator("#pilotSaveWorkspace").click();
  await page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已保存到本机"));
  await page.reload();
  await page.waitForFunction(()=>document.querySelector("#pilotSaveStatus").textContent.includes("已自动恢复本机正式工作"));
  assert.equal(await page.evaluate(()=>quoteRounds[0].lines[0].remark),"替代件，需批准；仅试样");
  assert.equal(await page.evaluate(()=>quoteRounds[0].termsNote),"不含运费，付款协商");
  assert.equal(await page.evaluate(()=>suppliers[1].supplierCode),"SUP-002");
  console.log("PASS XLSX12: XLSX-imported RFQ/suppliers/notes survive local save and browser restart");
  assert.deepEqual(errors,[]);
  console.log("PASS XLSX13: no uncaught browser JS errors");
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
