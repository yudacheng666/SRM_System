// 中文：在真实 M0 页面读取其运行态，再测试 B1 规范模型和演示隔离，不改动 M0 页面。
 // English: Inspect actual M0 runtime state through Chromium, without changing the accepted application.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const {chromium}=require("playwright");
(async()=>{
 const root=path.resolve(__dirname,"../..");
 const html=path.join(root,"prototype/m0/index.html");
 const core=path.join(root,"src/m1-lite/workspace-core.js");
 assert.ok(fs.existsSync(html)&&fs.existsSync(core));
 const browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext(),page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 try{
  await page.goto(pathToFileURL(html).href);
  await page.addScriptTag({path:core});
  const base=await page.evaluate(()=>{
    const model=window.M1WorkspaceCore;
    return model.captureM0({
      workspaceId:"DEMO-RFQ-001",origin:"demo",sourceDataKind:"demo",
      state:{items,suppliers,assignments,quoteRounds,awards,awardReasons,manualAwards,awardReviewIds,
        supplierPool:rfqSupplierPool,selectedCompareSuppliers,customFields,lineSeq,createdSeq,quoteComparisonMode}
    });
  });
  assert.equal(base.origin,"demo");
  assert.equal(base.state.items.length,1200);
  assert.equal(base.state.suppliers.length,24);
  assert.ok(base.state.assignments.length>200);
  assert.equal(base.state.quoteComparisonMode,"demo");
  console.log("PASS M1-B1: actual M0 1200 items/24 suppliers captured with Map/Set identity intact");
  const count=await page.evaluate(()=>{
    const m=window.M1WorkspaceCore;
    const captured=m.captureM0({
      workspaceId:"DEMO-RFQ-002",origin:"demo",sourceDataKind:"demo",
      state:{items,suppliers,assignments,quoteRounds,awards,awardReasons,manualAwards,awardReviewIds,
        supplierPool:rfqSupplierPool,selectedCompareSuppliers,customFields,lineSeq,createdSeq,quoteComparisonMode}
    });
    const hydrated=m.hydrate(m.parse(m.stringify(captured)));
    return{links:hydrated.state.assignments.size,nonempty:[...hydrated.state.assignments.values()].filter(x=>x.size>0).length,supplierPool:hydrated.state.supplierPool.size,first:hydrated.state.items[0].id,
      map:hydrated.state.assignments.get("RFQ-L00001") instanceof Set};
  });
  assert.ok(count.links>=300); // Existing M0 rendering also materializes empty assignment Sets.
  assert.equal(count.nonempty,300);
  assert.ok(count.supplierPool>0);
  assert.equal(count.first,"ITEM-00001");
  assert.equal(count.map,true);
  console.log("PASS M1-B1: in-browser actual M0 data round-trips into fresh Maps/Sets");
  const isolated=await page.evaluate(()=>{
    const m=window.M1WorkspaceCore;
    const fresh=m.createEmptyWorkspace("BUYER-RFQ-001");
    const guard=m.parse;
    let blocked=false;
    try{
      m.captureM0({workspaceId:fresh.workspaceId,origin:"buyer",sourceDataKind:"demo",
        state:{items,suppliers,assignments,quoteRounds,awards,awardReasons,manualAwards,awardReviewIds,
          supplierPool:rfqSupplierPool,selectedCompareSuppliers,customFields,lineSeq,createdSeq,quoteComparisonMode}});
    }catch(e){blocked=String(e.message).includes("DEMO_TO_BUYER")}
    return{noSeed:fresh.state.items.length===0&&fresh.state.suppliers.length===0,blocked,
      buyerMode:fresh.state.quoteComparisonMode,valid:m.validate(fresh)};
  });
  assert.equal(isolated.noSeed,true);
  assert.equal(isolated.blocked,true);
  assert.equal(isolated.valid,true);
  assert.equal(isolated.buyerMode,"returned");
  console.log("PASS M1-B1: fresh buyer workspace has zero seeded records and rejects M0 demo capture");
  assert.deepEqual(errors,[]);
  console.log("PASS M1-B1: no JavaScript runtime errors");
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
