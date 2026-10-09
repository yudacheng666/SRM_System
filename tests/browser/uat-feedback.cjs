// 中文：回归人工 UAT 反馈：物料双击编辑、供应商排序、报价表头/单位、非最低价页面内确认、首轮新分配。
 // English: Browser regression of buyer feedback: double-click editing, supplier sorting, quote headers/units, in-page non-lowest awards and late assignments.
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const out=path.resolve('test-results/uat');
fs.mkdirSync(out,{recursive:true});
const entry=pathToFileURL(path.resolve(__dirname,'../../prototype/m0/index.html')).href;
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:950},acceptDownloads:true});
 const errors=[],dialogs=[],checks=[];
 page.setDefaultTimeout(18000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('dialog',async d=>{dialogs.push(d.message());await d.accept()});
 const tab=async id=>page.locator('.tab[data-tab="'+id+'"]').click();
 const check=(name)=>{checks.push(name);console.log('PASS UAT browser: '+name)};
 try{
  await page.goto(entry);
  await page.locator('#itemBody tr').first().waitFor();
  const first=page.locator('#itemBody tr[data-edit-line="RFQ-L01200"]');
  await first.dblclick();
  await page.locator('#itemEditModal.open').waitFor();
  assert.equal(await page.locator('#itemEditCode').inputValue(),'ITEM-01200');
  await page.locator('#itemEditCode').fill('UAT-EDIT-01200');
  await page.locator('#itemEditQty').fill('-3');
  await page.locator('#itemEditSave').click();
  assert.match(await page.locator('#itemEditError').innerText(),/数量/);
  await page.locator('#itemEditQty').fill('12');
  await page.locator('#itemEditSave').click();
  assert.equal(await page.evaluate(()=>items.find(x=>x.lineId==='RFQ-L01200')?.id),'UAT-EDIT-01200');
  assert.equal(await page.evaluate(()=>items.find(x=>x.lineId==='RFQ-L01200')?.qty),12);
  assert.equal(await page.evaluate(()=>items.find(x=>x.lineId==='RFQ-L01200')?.unit),'个');
  check('double-click edit validates quantity, preserves RFQ Line ID and original other fields');

  await tab('quotes');
  const candidate=await page.evaluate(()=>{
   const list=comparisonItems(),sups=comparisonSuppliers();
   for(let i=0;i<Math.min(list.length,10);i++){
    const it=list[i];
    const vals=sups.map((s,j)=>({sid:s.id,price:quoteMetaFor(it,s,i,j)?.price??null})).filter(x=>x.price!==null).sort((a,b)=>a.price-b.price);
    if(vals.length>1&&vals[1].price>vals[0].price)return{lineId:it.lineId,sid:vals[1].sid};
   }
   return null;
  });
  assert.ok(candidate,'need a genuine non-lowest quote');
  await page.locator('#quoteTable td[data-award="'+candidate.lineId+'|'+candidate.sid+'"]').click();
  await page.locator('#awardReasonModal.open').waitFor();
  await page.locator('#awardReasonConfirm').click();
  assert.match(await page.locator('#awardReasonValidation').innerText(),/填写/);
  await page.locator('#awardReasonInput').fill('虚构：交期有保障');
  await page.locator('#awardReasonConfirm').click();
  assert.equal(await page.evaluate(id=>awards.get(id),candidate.lineId),candidate.sid);
  assert.equal(await page.evaluate(id=>awardReasons.get(id),candidate.lineId),'虚构：交期有保障');
  check('entire quote cell opens reason modal and confirms a non-lowest award without native prompt');

  await tab('quoteImport');
  const ordered=await page.locator('#quoteImportSupplier option').evaluateAll(els=>els.map(e=>e.value));
  const sorted=[...ordered].sort((a,b)=>a.localeCompare(b,'zh-CN',{numeric:true}));
  assert.deepEqual(ordered,sorted);
  assert.ok(ordered.length>=6);
  for(const [input,label] of [['quoteManualPrice','单价'],['quoteManualLead','交期（天）'],['quoteManualMoq','MOQ']]){
   assert.match(await page.locator('label:has(#'+input+')').innerText(),new RegExp(label));
  }
  const headers=await page.locator('#quoteImportPreview thead th').allInnerTexts();
  assert.ok(headers.includes('物料编码')&&headers.includes('RFQ Line ID')&&headers.includes('报价状态'));
  assert.ok(headers.some(x=>x.includes('交期（天）')));
  const detailHeaders=await page.locator('#quoteRoundBody').evaluate(el=>[...el.closest('table').querySelectorAll('thead th')].map(th=>th.textContent));
  assert.ok(detailHeaders.some(x=>x.includes('报价状态'))&&detailHeaders.some(x=>x.includes('物料编码')));
  check('supplier options ordered, all input units visible, preview and detail names aligned');

  await page.locator('#quoteImportSupplier').selectOption('SUP-001');
  assert.equal(await page.evaluate(()=>quoteRounds.find(x=>x.supplierId==='SUP-001'&&x.roundNo===1)?.lines.length),0);
  await tab('assign');
  await page.locator('.modebtn[data-mode="supplierFirst"]').click();
  await page.locator('[data-sf-s="SUP-001"]').click();
  await page.locator('#sfItemSearch').fill('ITEM-01199');
  await page.locator('#runSfSearch').click();
  await page.locator('#sfItemBody [data-sfi="RFQ-L01199"]').check();
  assert.equal(await page.evaluate(()=>getSet('RFQ-L01199').has('SUP-001')),true);
  await tab('quoteImport');
  await page.locator('#quoteImportSupplier').selectOption('SUP-001');
  await page.locator('#quoteManualItem').fill('ITEM-01199');
  await page.locator('#quoteManualPrice').fill('89');
  await page.locator('#quoteManualLead').fill('10');
  await page.locator('#quoteManualMoq').fill('1');
  await page.locator('#quoteManualAdd').click();
  assert.match(await page.locator('#quoteImportPreviewBody').innerText(),/已报价/);
  assert.doesNotMatch(await page.locator('#quoteImportPreviewBody').innerText(),/多报/);
  await page.locator('#commitQuoteImport').click();
  await page.locator('#confirmQuoteRound').click();
  assert.equal(await page.evaluate(()=>hasConfirmedItemHistory('RFQ-L01199')),true);
  await tab('items');
  await page.locator('#itemSearch').fill('ITEM-01199');await page.locator('#runItemSearch').click();
  await page.locator('#itemBody tr[data-edit-line="RFQ-L01199"]').dblclick();
  assert.equal(await page.locator('#itemEditSave').isDisabled(),true);
  assert.match(await page.locator('#itemEditHint').innerText(),/报价历史/);
  check('late supplier assignment joins untouched Round 1; confirmed line editor is read-only');

  assert.deepEqual(errors,[]);
  check('no uncaught browser JavaScript errors');
  await page.screenshot({path:path.join(out,'uat-passed.png'),fullPage:true});
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:checks,dialogs,pageErrors:errors},null,2));
 }catch(e){
  console.error('UAT browser FAILED:',e.stack||e);
  console.error('Browser errors:',errors);
  await page.screenshot({path:path.join(out,'uat-failed.png'),fullPage:true}).catch(()=>{});
  throw e;
 }finally{await browser.close()}
})().catch(e=>{console.error('UAT browser exit:',e.message);process.exitCode=1});
