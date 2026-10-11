// 中文：本测试验证真正打开的离线 HTML 不再将 Excel 上传替换为虚构数据；不使用真实采购信息。
// English: Chromium verifies unsupported XLSX/XLS fail closed without fabricated RFQ or quote rows.
"use strict";
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const {chromium}=require("playwright");
(async()=>{
  const browser=await chromium.launch({headless:true});
  const ctx=await browser.newContext(),page=await ctx.newPage();
  const messages=[],errors=[];
  page.on("dialog",async d=>{messages.push(d.message());await d.accept()});
  page.on("pageerror",e=>errors.push(e.message));
  try{
    await page.goto(pathToFileURL(path.resolve(__dirname,"../../prototype/m1-lite/index.html")).href);
    assert.match(await page.title(),/未实现保存/);
    assert.match(await page.locator(".notice").first().innerText(),/刷新后会丢失/);
    assert.equal(await page.locator("#importFile").getAttribute("accept"),".csv,.txt");
    assert.equal(await page.locator("#quoteImportFile").getAttribute("accept"),".csv,.txt");
    console.log("PASS SAFE01 demo/no-save warning visible and file chooser reflects actual supported formats");
    await page.locator("#toggleItemIntake").click();
    await page.locator("#importFile").setInputFiles({name:"供应商模拟.xlsx",mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",buffer:Buffer.from("fake-data")});
    assert.match(await page.locator("#itemFileFeedback").innerText(),/没有导入任何数据/);
    assert.equal(await page.locator("#importPreview").isVisible(),false);
    assert.equal(await page.locator("#importFile").inputValue(),"");
    assert.ok(messages.some(x=>x.includes("只接受 CSV/TXT")));
    console.log("PASS SAFE02 XLSX item upload explicitly rejected with zero fabricated preview rows");
    await page.locator("#importFile").setInputFiles({name:"采购记录.csv",mimeType:"text/csv",buffer:Buffer.from("物料编码,物料名称,分类,数量,单位\nTEST-ITEM-001,虚构测试物料,类别A,3,件\n")});
    await page.waitForFunction(()=>document.getElementById("importPreview").style.display!=="none");
    assert.match(await page.locator("#importPreview").innerText(),/TEST-ITEM-001/);
    assert.doesNotMatch(await page.locator("#importPreview").innerText(),/XLS-DEMO-101/);
    console.log("PASS SAFE03 real CSV items are previewed from uploaded file contents");
    await page.locator("#importFile").setInputFiles({name:"覆盖旧预览.xls",mimeType:"application/vnd.ms-excel",buffer:Buffer.from("not real Excel")});
    assert.equal(await page.locator("#importPreview").isVisible(),false);
    assert.match(await page.locator("#itemFileFeedback").innerText(),/没有导入任何数据/);
    console.log("PASS SAFE04 an unsupported XLS upload clears the previous valid item preview");
    await page.locator("[data-tab='quoteImport']").click();
    await page.locator("#quoteImportFile").setInputFiles({name:"供应商报价.xlsx",mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",buffer:Buffer.from("fake XLSX")});
    assert.match(await page.locator("#quoteFileFeedback").innerText(),/没有导入任何报价/);
    assert.equal(await page.locator("#quoteImportPreview").isVisible(),false);
    assert.equal(await page.locator("#quoteImportFile").inputValue(),"");
    assert.ok(messages.some(x=>x.includes("没有导入任何报价")));
    console.log("PASS SAFE05 XLSX quote upload rejected, no fake quote preview or imported price");
    await page.reload();
    assert.match(await page.locator(".notice").first().innerText(),/尚待下一步/);
    assert.deepEqual(errors,[]);
    console.log("PASS SAFE06 refresh remains explicit about data loss, no page exceptions");
  }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
