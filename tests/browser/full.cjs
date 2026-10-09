// 中文：用 Chromium 真正执行 100 条物料、10 家供应商、两轮报价的 M0 全流程。
// English: Run the full M0 workflow in Chromium: 100 items, ten suppliers and two quote rounds.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const entry=pathToFileURL(path.resolve(__dirname,'../../prototype/m0/index.html')).href;
const dir=path.resolve(__dirname,'../fixtures/generated');
const results=path.resolve('test-results');
fs.mkdirSync(results,{recursive:true});
const notes=[],errors=[],dialogs=[];
function log(name,detail){notes.push({name,detail});console.log('PASS browser workflow: '+name+' '+(detail||''))}
const codeOf=i=>'SIM-'+String(i+1).padStart(5,'0');
const supOf=i=>'SUP-'+String(i+1).padStart(3,'0');
const catOf=i=>'类别'+String.fromCharCode(65+i%5);
const assigned=(sid)=>Array.from({length:100},(_,i)=>i).filter(i=>new Set([sid%5,(sid+1)%5,(sid+3)%5]).has(i%5));
(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
  page.setDefaultTimeout(20000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',async d=>{dialogs.push({type:d.type(),message:d.message()});await d.accept(d.type()==='prompt'?'虚构验收：供货稳定与交期更优':undefined)});
  const tab=async id=>page.locator('.tab[data-tab="'+id+'"]').click();
  try{
    await page.goto(entry);
    await page.locator('#itemBody tr').first().waitFor();
    await page.locator('#toggleItemIntake').click();
    await page.locator('#importFile').setInputFiles(path.join(dir,'m0_100_物料.csv'));
    await page.locator('#confirmImportRows').waitFor({state:'visible'});
    assert.match(await page.locator('#importPreview').innerText(),/100 行/);
    await page.locator('#confirmImportRows').click();
    const count=await page.evaluate(()=>items.length);
    assert.equal(count,1300);
    log('real file chooser imports 100 synthetic items',String(count));

    await tab('assign');
    await page.locator('.modebtn[data-mode="supplierFirst"]').click();
    for(let sid=0;sid<10;sid++){
      const supplierId=supOf(sid);
      const row=page.locator('[data-sf-s="'+supplierId+'"]');
      await row.click();
      await page.locator('#sfItemSearch').fill('SIM-');
      for(const c of [sid%5,(sid+1)%5,(sid+3)%5]){
        await page.locator('#sfCatFilter').selectOption({label:catOf(c)});
        await page.locator('#runSfSearch').click();
        const rows=await page.locator('#sfItemBody tr').count();
        assert.equal(rows,20);
        await page.locator('#sfLinkFiltered').click();
      }
      const actual=await page.evaluate(id=>items.filter(it=>it.id.startsWith('SIM-')&&getSet(it.lineId).has(id)).length,supplierId);
      assert.equal(actual,60,'supplier '+supplierId+' assignment count');
    }
    const distribution=await page.evaluate(()=>items.filter(x=>x.id.startsWith('SIM-')).map(it=>getSet(it.lineId).size));
    assert.equal(distribution.length,100);
    assert.ok(distribution.every(n=>n>=5));
    log('real UI applies distinct 10 supplier assignment scopes','600 supplier-item links');

    await page.locator('#previewBtn').click();
    assert.match(await page.locator('#rfqPreviewContent').innerText(),/供应商/);
    await page.locator('#closeRfqPreview').click();
    const stats=await page.evaluate(()=>coverage());
    assert.ok(stats.covered>=100);
    log('supplier RFQ package preview opens and closes');

    await tab('quoteImport');
    for(let sid=0;sid<10;sid++){
      const supplierId=supOf(sid);
      await page.locator('#quoteImportSupplier').selectOption(supplierId);
      await page.locator('#quoteImportFile').setInputFiles(path.join(dir,'m0_'+supplierId+'_第1轮报价.csv'));
      await page.locator('#quoteImportPreviewBody tr').first().waitFor();
      const errorsInPreview=await page.locator('#quoteImportPreviewBody tr .dangertext').count();
      if(errorsInPreview)console.log('First-round preview potentially nonstandard row',supplierId,errorsInPreview);
      await page.locator('#commitQuoteImport').click();
      await page.locator('#quoteRoundBody tr').first().waitFor();
      const before=await page.evaluate(id=>quoteRounds.find(r=>r.supplierId===id&&r.roundNo===1)?.lines.length,supplierId);
      assert.ok(before>0&&before<=60);
      await page.locator('#confirmQuoteRound').click();
      const isConfirmed=await page.evaluate(id=>quoteRounds.find(r=>r.supplierId===id&&r.roundNo===1)?.status==='confirmed',supplierId);
      assert.equal(isConfirmed,true,'round one '+supplierId);
    }
    const first=await page.evaluate(()=>quoteRounds.filter(r=>r.roundNo===1&&r.status==='confirmed').length);
    assert.equal(first,10);
    log('actual CSV files return first-round quotes across ten suppliers','10 confirmed rounds');

    await tab('quotes');
    assert.match(await page.locator('#quoteModeNotice').innerText(),/仅已确认/);
    const offered=await page.evaluate(()=>comparisonItems().filter(it=>it.id.startsWith('SIM-')&&comparisonSuppliers().some(s=>quoteMetaFor(it,s)?.price!=null)).length);
    assert.equal(offered,100);
    log('quotation comparison includes actual first-round prices',String(offered)+' synthetic materials with offers');

    await tab('quoteImport');
    for(let sid=0;sid<10;sid++){
      const supplierId=supOf(sid);
      await page.locator('#quoteImportSupplier').selectOption(supplierId);
      await page.locator('#newQuoteRound').click();
      await page.locator('#editRoundScope').click();
      await page.locator('#scopeClearAll').click();
      const group=assigned(sid).filter((i,idx)=>idx%3===0);
      for(const i of group){
        const lineId=await page.evaluate(code=>items.find(it=>it.id===code)?.lineId,codeOf(i));
        assert.ok(lineId);
        await page.locator('#quoteScopeList [data-scope-line="'+lineId+'"]').check();
      }
      await page.locator('#saveRoundScope').click();
      const expected=await page.evaluate(id=>quoteRounds.find(r=>r.supplierId===id&&r.roundNo===2)?.expectedLineIds.length,supplierId);
      assert.equal(expected,group.length);
      await page.locator('#quoteImportFile').setInputFiles(path.join(dir,'m0_'+supplierId+'_第2轮报价.csv'));
      await page.locator('#quoteImportPreviewBody tr').first().waitFor();
      await page.locator('#commitQuoteImport').click();
      await page.locator('#confirmQuoteRound').click();
      const second=await page.evaluate(id=>quoteRounds.find(r=>r.supplierId===id&&r.roundNo===2&&r.status==='confirmed')?.lines.length||0,supplierId);
      assert.ok(second>0&&second<=group.length);
    }
    await page.screenshot({path:path.join(results,'full-round-two.png'),fullPage:true});
    const secondCount=await page.evaluate(()=>quoteRounds.filter(r=>r.roundNo===2&&r.status==='confirmed').length);
    assert.equal(secondCount,10);
    log('actual second-round partial scope editing and quotation returns','10 confirmed second rounds');

    await tab('quotes');
    const details=await page.evaluate(()=>{
      const its=comparisonItems(),sups=comparisonSuppliers();
      return{supplierCount:sups.length,items:its.length,withPrices:its.filter(x=>x.id.startsWith('SIM-')&&sups.some(s=>quoteMetaFor(x,s)?.price!=null)).length,rounds:quoteRounds.filter(r=>r.status==='confirmed').length};
    });
    assert.equal(details.supplierCount,10);
    assert.equal(details.rounds,20);
    assert.ok(details.withPrices>=80);
    // 中文：实际勾选两家比较，第三家没有共同物料时显示不可比较，不能把空范围算作 0 元。
    // English: Select actual supplier checkboxes; a third supplier can shrink the shared scope to zero without inventing zero prices.
    const summary=page.locator('#comparisonGroupSummary');
    assert.match(await summary.innerText(),/至少勾选 2 家/);
    assert.equal(await page.locator('[data-compare-supplier]:checked').count(),0);
    await page.locator('[data-compare-supplier="SUP-001"]').check();
    assert.match(await summary.innerText(),/至少勾选 2 家/);
    await page.locator('[data-compare-supplier="SUP-002"]').check();
    assert.match(await summary.innerText(),/共同有效报价物料/);
    const firstPair=await page.evaluate(()=>{
      const r=computeSelectedGroupComparison(selectedComparisonSuppliers);
      return{count:r.common.length,a:r.groupTotals.get('SUP-001'),b:r.groupTotals.get('SUP-002'),own:r.own[0].total};
    });
    assert.ok(firstPair.count>0&&firstPair.a>0&&firstPair.b>0);
    assert.match(await page.locator('#quoteAnalysis').innerText(),/比较组同范围总额/);
    await page.locator('[data-compare-supplier="SUP-003"]').check();
    const three=await page.evaluate(()=>{
      const r=computeSelectedGroupComparison(selectedComparisonSuppliers);
      return{count:r.common.length,group:r.group.length,own:r.own[0].total};
    });
    assert.equal(three.group,3);
    assert.equal(three.count,0);
    assert.equal(three.own,firstPair.own);
    assert.match(await summary.innerText(),/不可比较/);
    const totals=await page.locator('#quoteAnalysis .analysisTable tbody tr').allInnerTexts();
    assert.ok(totals.slice(0,3).every(text=>text.includes('—')));
    await page.locator('[data-compare-supplier="SUP-003"]').uncheck();
    assert.equal(await page.evaluate(()=>computeSelectedGroupComparison(selectedComparisonSuppliers).common.length),firstPair.count);
    await tab('quoteImport');await tab('quotes');
    assert.equal(await page.locator('[data-compare-supplier]:checked').count(),2);
    await page.locator('#clearGroupComparison').click();
    assert.equal(await page.locator('[data-compare-supplier]:checked').count(),0);
    assert.match(await summary.innerText(),/至少勾选 2 家/);
    log('buyer-selected like-for-like supplier group totals and zero-common exclusion','2 suppliers -> '+firstPair.count+' shared lines, 3 suppliers -> none');
    const finalItemCount=details.items,pages=Math.ceil(finalItemCount/10);
    await page.locator('#quotePager [data-pg="'+(pages-1)+'"]').click();
    const manualChoice=await page.evaluate(()=>{
      const its=comparisonItems(),sups=comparisonSuppliers();
      for(let i=Math.max(0,its.length-10);i<its.length;i++){
        const it=its[i];
        if(!it.id.startsWith('SIM-'))continue;
        const offers=sups.map(s=>({sid:s.id,price:quoteMetaFor(it,s,i,sups.indexOf(s))?.price})).filter(x=>x.price!=null).sort((a,b)=>a.price-b.price);
        if(offers.length>=2&&offers[1].price>offers[0].price)return{lineId:it.lineId,sid:offers[1].sid};
      }
      return null;
    });
    assert.ok(manualChoice,'need two distinct comparable supplier offers on the final page');
    await page.locator('[data-award="'+manualChoice.lineId+'|'+manualChoice.sid+'"]').click();
    await page.locator('#awardReasonModal.open').waitFor();
    await page.locator('#awardReasonInput').fill('虚构验收：交期稳定及质量保证');
    await page.locator('#awardReasonConfirm').click();
    const awarded=await page.evaluate(id=>({id:awards.get(id),reason:awardReasons.get(id),manual:manualAwards.has(id)}),manualChoice.lineId);
    assert.equal(awarded.id,manualChoice.sid);
    assert.ok(awarded.reason&&awarded.manual);
    await page.screenshot({path:path.join(results,'full-comparison.png'),fullPage:true});
    log('comparison total and justified non-lowest supplier decision','20 confirmed rounds');

    assert.deepEqual(errors,[]);
    log('no uncaught browser JavaScript exceptions');
    fs.writeFileSync(path.join(results,'full-business-summary.json'),JSON.stringify({ok:true,details,firstRound:first,secondRound:secondCount,notes,dialogCount:dialogs.length},null,2),'utf8');
  }catch(e){
    console.error('FULL WORKFLOW FAILED',e.stack||e);
    console.error('recent dialogs',JSON.stringify(dialogs.slice(-10)));
    console.error('pageErrors',JSON.stringify(errors));
    fs.writeFileSync(path.join(results,'full-business-summary.json'),JSON.stringify({ok:false,error:String(e),notes,dialogs:dialogs.slice(-15),pageErrors:errors},null,2),'utf8');
    await page.screenshot({path:path.join(results,'full-failure.png'),fullPage:true}).catch(()=>{});
    process.exitCode=1;
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
