// 中文：使用真正的 Chromium 鼠标、键盘、文件读取、对话框和下载验收 M0。
// English: Exercise M0 in real Chromium using clicks, input, files, dialogs and downloads.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const entry=pathToFileURL(path.resolve(__dirname,'../../prototype/m0/index.html')).href;
const shots=path.resolve('test-results/screenshots');
fs.mkdirSync(shots,{recursive:true});
const note=(msg)=>process.stdout.write('PASS browser basic: '+msg+'\n');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({acceptDownloads:true,viewport:{width:1440,height:950}});
 const pageErrors=[],dialogs=[];
 let acceptDialog=true;
 page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('dialog',async d=>{dialogs.push({type:d.type(),message:d.message()});if(acceptDialog)await d.accept();else await d.dismiss()});
 const tab=async id=>page.locator('.tab[data-tab="'+id+'"]').click();
 try{
   await page.goto(entry);
   await page.locator('#itemBody tr').first().waitFor();
   assert.match(await page.locator('#itemCount').innerText(),/1200/);
   await tab('assign');await page.locator('#stTotal').waitFor();
   await tab('quotes');assert.match(await page.locator('#quoteModeNotice').innerText(),/纯模拟/);
   await tab('items');note('opens HTML, tab switching, demo baseline');

   await page.locator('#toggleItemIntake').click();
   const header='物料编码,物料名称,分类,数量,单位';
   const makeRows=(wrong)=>Array.from({length:65},(_,i)=>['BASIC-'+String(i+1).padStart(3,'0'),'虚构测试零件'+i,'类别A',wrong&&i===62?'abc':i+1,'件'].join(','));
   await page.locator('#pasteItems').fill(header+'\n'+makeRows(true).join('\n'));
   await page.locator('#parsePaste').click();
   assert.match(await page.locator('#importPreview').innerText(),/错误 1 行/);
   assert.equal(await page.locator('#confirmImportRows').isDisabled(),true);
   await page.locator('#itemImportPager [data-pg="1"]').click();
   assert.match(await page.locator('#importPreview').innerText(),/BASIC-063/);
   await page.locator('#toggleImportProblems').click();
   assert.match(await page.locator('#importPreview').innerText(),/BASIC-063/);
   assert.equal(await page.locator('#importPreview tbody tr').count(),1);
   await page.locator('#clearPastePreview').click();
   await page.locator('#pasteItems').fill(header+'\n'+makeRows(false).join('\n'));
   await page.locator('#parsePaste').click();
   await page.locator('#confirmImportRows').click();
   assert.equal(await page.evaluate(()=>items.length),1265);
   await page.locator('#itemSearch').fill('BASIC-065');await page.locator('#runItemSearch').click();
   assert.match(await page.locator('#itemBody').innerText(),/BASIC-065/);
   note('validates late-row errors, pagination, error filter, confirmation and 65 new rows');

   await tab('assign');
   await page.locator('.modebtn[data-mode="supplierFirst"]').click();
   await page.locator('[data-sf-s="SUP-001"]').click();
   await page.locator('#sfItemSearch').fill('BASIC-002');await page.locator('#runSfSearch').click();
   assert.equal(await page.locator('#sfItemBody [data-sfi]').count(),1);
   acceptDialog=false;
   await page.locator('#sfLinkFiltered').click();
   assert.equal(await page.evaluate(()=>getSet(items.find(x=>x.id==='BASIC-002').lineId).has('SUP-001')),false);
   acceptDialog=true;
   await page.locator('#sfLinkFiltered').click();
   assert.equal(await page.evaluate(()=>getSet(items.find(x=>x.id==='BASIC-002').lineId).has('SUP-001')),true);
   assert.ok(dialogs.some(x=>x.message.includes('即将变更 1 条')));
   note('checks real supplier assignment and dialog cancellation/approval');

   await tab('quoteImport');
   assert.equal(await page.evaluate(()=>quoteComparisonMode),'returned');
   await page.locator('#quoteImportSupplier').selectOption('SUP-001');
   await page.locator('#quotePaste').fill('物料编码,单价,状态\nITEM-00001,50,正常报价\nITEM-00002,abc,正常报价');
   await page.locator('#quoteParsePaste').click();
   assert.equal(await page.locator('#quoteImportPreviewBody tr').count(),2);
   await page.locator('#commitQuoteImport').click();
   assert.match(await page.locator('#quoteImportFeedback').innerText(),/已明确提交 1 行；剩余 1 行/);
   assert.ok(dialogs.some(x=>x.message.includes('是否只提交 1 行')));
   assert.match(await page.locator('#quoteRoundBody').innerText(),/ITEM-00001/);
   const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportQuoteMissing').click()]);
   const content=fs.readFileSync(await download.path(),'utf8');
   assert.ok(content.startsWith('\uFEFF'));
   assert.match(content,/RFQ Line ID,?|RFQ-L/);
   note('runs partial quote commit with actual confirmation and downloads BOM CSV');

   await page.locator('#confirmQuoteRound').click();
   assert.match(await page.locator('#quoteRoundSummary').innerText(),/已确认/);
   await page.locator('#newQuoteRound').click();
   await page.locator('#carryForwardMissing').click();
   await page.locator('#carryForwardPreview [data-carry-line="RFQ-L00001"]').check();
   await page.locator('#carryEvidenceNote').fill('虚构邮件确认沿用原价');
   await page.locator('#carryConfirmSource').check();
   await page.locator('#confirmCarrySelection').click();
   assert.match(await page.locator('#quoteRoundBody').innerText(),/明确沿用上轮/);
   note('tests confirmed rounds and selective evidenced carry-forward');

   await tab('assign');
   await page.locator('.modebtn[data-mode="itemFirst"]').click();
   await page.locator('#assignItemSearch').fill('ITEM-00001');
   await page.locator('#runAssignSearch').click();
   await page.locator('#assignItemBody [data-ai="RFQ-L00001"]').check();
   await page.locator('#supplierList [data-rem="SUP-001"]').click();
   assert.equal(await page.evaluate(()=>getSet('RFQ-L00001').has('SUP-001')),true);
   assert.ok(dialogs.some(x=>x.message.includes('已有已确认报价')));
   note('protects confirmed quotation relationships via actual UI action');

   assert.deepEqual(pageErrors,[]);
   note('no uncaught page JavaScript exceptions');
 }catch(e){await page.screenshot({path:path.join(shots,'basic-failure.png'),fullPage:true}).catch(()=>{});console.error('BASIC FAILED',e.stack||e);console.error('dialogs:',JSON.stringify(dialogs.slice(-8)));console.error('page errors:',pageErrors);process.exitCode=1}
 finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
