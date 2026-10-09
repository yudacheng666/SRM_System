// 中文：真实 Chromium 测试采购员手动选供应商、同范围金额、0 共同项和 CSV 实际下载。
// English: Real Chromium checks buyer-selected groups, shared-scope totals, empty intersections and actual CSV download.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const url=pathToFileURL(path.resolve(__dirname,'../../prototype/m0/index.html')).href;
const dir=path.resolve('test-results/common-scope');
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({acceptDownloads:true,viewport:{width:1500,height:1000}});
 const errors=[],steps=[];
 page.on('pageerror',e=>errors.push(e.message));
 const ok=label=>{steps.push(label);console.log('PASS shared-scope browser: '+label)};
 try{
  await page.goto(url);
  await page.locator('.tab[data-tab="quotes"]').click();
  assert.match(await page.locator('#quoteAnalysis').innerText(),/请先勾选至少两家供应商/);
  assert.equal(await page.locator('#commonScopePicker input:checked').count(),0);
  ok('empty default group is explicitly invalid; full supplier pool is never auto-selected');

  // 中文：通过真正 M0 数据结构建立确定性虚构报价，UI 仍使用真实点击。
  // English: Seed deterministic synthetic quote records in real app state, then exercise genuine UI clicks.
  await page.evaluate(()=>{
    const rows=[{id:'COMPARE-A',lineId:'RFQ-COM-A',name:'虚构共同比价 A',cat:'类别A',qty:2,unit:'件'},
                {id:'COMPARE-B',lineId:'RFQ-COM-B',name:'虚构共同比价 B',cat:'类别A',qty:3,unit:'件'},
                {id:'COMPARE-C',lineId:'RFQ-COM-C',name:'虚构阶梯比价 C',cat:'类别A',qty:10,unit:'件'}];
    rows.forEach(it=>{items.push({...it,custom:{},_createdOrder:++createdSeq});['SUP-001','SUP-002','SUP-003'].forEach(sid=>{getSet(it.lineId).add(sid);rfqSupplierPool.add(sid)})});
    const offers=[
      [{lineId:'RFQ-COM-A',price:10},{lineId:'RFQ-COM-B',price:5},
       {lineId:'RFQ-COM-C',price:null,tiers:[{min:1,max:9,price:8},{min:10,max:null,price:6}]}],
      [{lineId:'RFQ-COM-A',price:12},{lineId:'RFQ-COM-B',status:'noquote',price:null},{lineId:'RFQ-COM-C',price:7}],
      [{lineId:'RFQ-COM-A',status:'cannot',price:null},{lineId:'RFQ-COM-B',price:7},{lineId:'RFQ-COM-C',price:6}]
    ];
    ['SUP-001','SUP-002','SUP-003'].forEach((sid,j)=>quoteRounds.push({
      supplierId:sid,roundNo:1,revisionNo:1,status:'confirmed',expectedLineIds:rows.map(it=>it.lineId),
      lines:offers[j].map(q=>({...q,status:q.status||'quoted',tiers:q.tiers||[],lead:7,moq:1,source:'synthetic'})),
      evidenceType:'manual_other',evidenceNote:'synthetic browser fixture'
    }));
    enterReturnedQuoteMode();renderQuotes();
  });
  await page.locator('#commonScopePicker [data-common-supplier="SUP-001"]').check();
  assert.match(await page.locator('#quoteAnalysis').innerText(),/请先勾选至少两家供应商/);
  await page.locator('#commonScopePicker [data-common-supplier="SUP-002"]').check();
  const two=await page.evaluate(()=>{const p=planSelectedCommonScope();return{lines:p.items.map(x=>x.it.lineId),totals:[...p.totals.values()]};});
  assert.deepEqual(two.lines,['RFQ-COM-A','RFQ-COM-C']);
  assert.deepEqual(two.totals,[8000,9400]);
  assert.match(await page.locator('#quoteAnalysis').innerText(),/共同有效报价 2 项/);
  assert.match(await page.locator('#quoteAnalysis').innerText(),/80\.00/);
  assert.match(await page.locator('#quoteAnalysis').innerText(),/94\.00/);
  ok('two suppliers use only their shared valid material lines, including quantity-tier pricing');

  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportSelectedCommonScope').click()]);
  const csv=fs.readFileSync(await download.path(),'utf8');
  assert.ok(csv.startsWith('\uFEFF'));
  assert.match(download.suggestedFilename(),/指定供应商组同范围报价/);
  assert.match(csv,/RFQ-COM-A/);assert.match(csv,/RFQ-COM-C/);
  assert.doesNotMatch(csv,/RFQ-COM-B/);
  assert.match(csv,/"80\.00"/);assert.match(csv,/"94\.00"/);
  ok('downloaded UTF-8 CSV shows exactly the compared item IDs and totals');

  await page.locator('#commonScopePicker [data-common-supplier="SUP-003"]').check();
  const three=await page.evaluate(()=>{const p=planSelectedCommonScope();return{lines:p.items.map(x=>x.it.lineId),totals:[...p.totals.values()]};});
  assert.deepEqual(three.lines,['RFQ-COM-C']);
  assert.deepEqual(three.totals,[6000,7000,6000]);
  ok('adding third supplier changes the intersection without influencing nonselected suppliers');

  await page.locator('#commonScopePicker [data-common-supplier="SUP-002"]').uncheck();
  const other=await page.evaluate(()=>{const p=planSelectedCommonScope();return{lines:p.items.map(x=>x.it.lineId),totals:[...p.totals.values()]};});
  assert.deepEqual(other.lines,['RFQ-COM-B','RFQ-COM-C']);
  assert.deepEqual(other.totals,[7500,8100]);
  ok('replacing compare supplier yields a different but auditable shared scope');

  await page.locator('#commonScopePicker [data-common-supplier="SUP-002"]').check();
  await page.evaluate(()=>{
    // 中文：在真实业务里所有候选物料都被其中一家明确拒绝时，显示无可比项目。
    // English: Exclude every candidate when one group supplier expressly declines all rows.
    const line=quoteRounds.find(r=>r.supplierId==='SUP-002');
    line.lines.forEach(x=>{x.status='noquote';x.price=null;x.tiers=[]});
    renderQuotes();
  });
  assert.match(await page.locator('#quoteAnalysis').innerText(),/共同有效报价 0 项/);
  assert.equal(await page.locator('#exportSelectedCommonScope').count(),0);
  assert.doesNotMatch(await page.locator('#quoteAnalysis').innerText(),/同范围报价总额（元）/);
  ok('no common items are shown as a warning, never as an imaginary zero-price total');

  await page.locator('#clearCommonSupplierGroup').click();
  assert.equal(await page.locator('#commonScopePicker input:checked').count(),0);
  assert.match(await page.locator('#quoteAnalysis').innerText(),/请先勾选至少两家/);
  assert.deepEqual(errors,[]);
  ok('clear group returns to neutral state without uncaught JavaScript errors');
  await page.screenshot({path:path.join(dir,'shared-scope-passed.png'),fullPage:true});
  fs.writeFileSync(path.join(dir,'browser-results.json'),JSON.stringify({passed:steps,errors},null,2));
 }catch(e){
  console.error('COMMON SCOPE BROWSER FAILED',e.stack||e);
  console.error('Browser errors:',errors);
  await page.screenshot({path:path.join(dir,'shared-scope-failed.png'),fullPage:true}).catch(()=>{});
  throw e;
 }finally{await browser.close()}
})().catch(e=>{console.error('Browser test exit:',e.message);process.exitCode=1});