// 中文：Windows 人工反馈驱动的报价/比价结构 UI 回归，真实浏览器 + 隔离 SQLite。
// English: UX structural regression from Windows UAT, using actual Chromium and isolated SQLite.
const {test:base,expect}=require('@playwright/test');
const {spawn,execFileSync}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const PORT=8798,URL='http://127.0.0.1:'+PORT;
const test=base.extend({
  app:async({page},use,info)=>{
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'srm-ux-structural-'));
    const fixtures=path.join(root,'fixtures');
    execFileSync('python',[path.join(__dirname,'fixtures.py'),fixtures]);
    const logs=[];
    const child=spawn('python',[path.join(__dirname,'serve.py'),String(PORT)],{
      env:{...process.env,SRM_DATA_DIR:path.join(root,'data'),PYTHONUNBUFFERED:'1'},
      stdio:['ignore','pipe','pipe']
    });
    child.stdout.on('data',x=>logs.push(x.toString()));
    child.stderr.on('data',x=>logs.push(x.toString()));
    page.on('dialog',d=>d.accept());
    try{
      await expect.poll(async()=>{try{return(await page.request.get(URL+'/api/health')).status()}catch{return 0}},{timeout:30000}).toBe(200);
      await page.goto(URL);
      await expect(page.locator('#pilotNewWorkspace')).toBeEnabled();
      await use({root,fixtures});
    }finally{
      const file=info.outputPath('ux-structural-server.log');
      fs.writeFileSync(file,logs.join(''));
      await info.attach('ux-structural-server-log',{path:file,contentType:'text/plain'});
      if(child.exitCode===null&&child.signalCode===null)await new Promise(resolve=>{
        const timeout=setTimeout(()=>child.kill('SIGKILL'),5000);
        child.once('exit',()=>{clearTimeout(timeout);resolve()});
        child.kill('SIGTERM');
      });
      fs.rmSync(root,{recursive:true,force:true});
    }
  }
});
const snapshot=page=>page.evaluate(()=>window.SRMPilot.snapshot());
async function open(page,id){
  const drawer=page.locator(id);
  if(!await drawer.evaluate(node=>node.open))await drawer.locator(':scope > summary').click();
  await expect(drawer).toHaveAttribute('open','');
}
async function prepare(page,app){
  await open(page,'#uiProjectDetails');
  await page.locator('#pilotNewWorkspace').click();
  await page.locator('#toggleItemIntake').click();
  await page.locator('#importFile').setInputFiles(path.join(app.fixtures,'items12.xlsx'));
  await expect(page.locator('#confirmImportRows')).toBeEnabled();
  await page.locator('#confirmImportRows').click();
  await expect.poll(async()=>(await snapshot(page)).state.items.length).toBe(12);
  await open(page,'#uiSupplierTools');
  await page.locator('#pilotSupplierExcel').setInputFiles(path.join(app.fixtures,'suppliers.xlsx'));
  await expect(page.locator('#pilotImportSupplierConfirm')).toBeEnabled();
  await page.locator('#pilotImportSupplierConfirm').click();
  await expect.poll(async()=>(await snapshot(page)).state.suppliers.length).toBe(2);
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="assign"]').click();
  await page.locator('#selectAssignAll').click();
  await page.locator('[data-add="SUP-A"]').click();
  await page.locator('[data-add="SUP-B"]').click();
  await expect.poll(async()=>(await snapshot(page)).state.assignments.filter(a=>a.values.length===2).length).toBe(12);
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quoteImport"]').click();
  await page.locator('#quoteImportSupplier').selectOption('SUP-A');
}
test('UX quote: focused intake, non-destructive refresh, compact rows and details / 报价回收安全刷新',async({page,app})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1366,height:768});
  await prepare(page,app);
  const modes=page.locator('[data-srm-ux-input-mode]');
  await expect(modes).toHaveCount(4);
  await page.locator('[data-srm-ux-input-mode="file"]').click();
  await expect(page.locator('#quoteImportFile')).toBeVisible();
  await expect(page.locator('#quoteManualItem')).toBeHidden();
  await page.locator('[data-srm-ux-input-mode="all"]').click();
  await expect(page.locator('#quoteManualItem')).toBeVisible();

  await page.locator('#quotePaste').fill('存货编码,报价单价,交期,MOQ,报价状态\nTST-001,17.25,7,1,正常报价\nTST-002,23.75,9,1,正常报价');
  await page.locator('#quoteParsePaste').click();
  await expect(page.locator('#quoteImportPreviewBody')).toContainText('17.25');
  const beforePreview=await snapshot(page);
  await page.locator('#srmUxRefreshQuote').click();
  await expect(page.locator('#quoteRoundHint')).toContainText('刷新未执行');
  await expect(page.locator('#quoteImportPreviewBody')).toContainText('17.25');
  expect((await snapshot(page)).state).toEqual(beforePreview.state);
  await page.locator('#commitQuoteImport').click();
  await expect(page.locator('#quoteRoundBody tr')).toHaveCount(2);
  const beforeRefresh=await snapshot(page);
  await page.locator('#srmUxRefreshQuote').click();
  await expect(page.locator('#quoteRoundHint')).toContainText('未修改本轮报价');
  expect((await snapshot(page)).state).toEqual(beforeRefresh.state);
  await page.locator('#quoteRoundBody [data-srm-ux-line-detail="0"]').click();
  await expect(page.locator('#srmUxQuoteLineDetail')).toBeVisible();
  await expect(page.locator('#srmUxQuoteLineDetail')).toContainText('RFQ Line ID');
  const col=page.locator('#srmUxQuoteRoundTable thead th').nth(3);
  await expect(col).toBeHidden();
  await page.locator('#srmUxQuoteDensity').click();
  await expect(col).toBeVisible();
  await page.locator('#srmUxQuoteDensity').click();
  await expect(col).toBeHidden();
  expect((await snapshot(page)).state).toEqual(beforeRefresh.state);
  expect(errors).toEqual([]);
});
test('UX comparison: decision-first disclosure, priced details and workspace status / 比价与状态层级',async({page,app})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await prepare(page,app);
  await page.locator('#quotePaste').fill('存货编码,报价单价,交期,MOQ,报价状态\nTST-001,17.25,7,1,正常报价');
  await page.locator('#quoteParsePaste').click();
  await page.locator('#commitQuoteImport').click();
  await page.locator('#confirmQuoteRound').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quotes"]').click();
  await expect(page.locator('#srmV31DecisionBoard')).toBeVisible();
  await expect(page.locator('#srmUxComparisonRules')).toHaveCount(1);
  await expect(page.locator('#srmUxComparisonRules')).not.toHaveAttribute('open','');
  await expect(page.locator('#commonScopePicker')).toBeVisible();
  await expect(page.locator('#quoteAnalysis')).toBeVisible();
  const before=await snapshot(page);
  await page.locator('#srmUxPendingOnly').check();
  await expect(page.locator('#quotes')).toHaveClass(/srm-ux-pending-only/);
  await page.locator('#srmUxPendingOnly').uncheck();
  await expect(page.locator('#quotes')).not.toHaveClass(/srm-ux-pending-only/);
  await expect(page.locator('body')).toHaveClass(/ui-buyer-mode/);
  await expect(page.locator('#quoteTable thead th').nth(1)).toBeHidden();
  const priceCell=page.locator('#quoteTable td.awardSelectable').first();
  await expect(priceCell.locator('.quotePrice')).toBeVisible();
  await expect(priceCell.locator('.srm-ux-bid-details')).toHaveCount(1);
  await priceCell.locator('.srm-ux-bid-details summary').click();
  await expect(priceCell.locator('.srm-ux-bid-details')).toHaveAttribute('open','');
  expect((await snapshot(page)).state).toEqual(before.state);
  const indicator=page.locator('#srmUxWorkspaceSaveSummary');
  await expect(indicator).toBeVisible();
  await open(page,'#uiProjectDetails');
  await expect(page.locator('#srmUxStatusDetails')).toHaveCount(1);
  await open(page,'#srmUxStatusDetails');
  await expect(page.locator('#pilotAutosaveStatus')).toBeVisible();
  await open(page,'#uiDataTools');
  await expect(page.locator('.srm-ux-report-actions #pilotReportOpen')).toHaveCount(1);
  await expect(page.locator('.srm-ux-admin-title')).toHaveCount(2);
  expect(errors).toEqual([]);
});


// 中文：真实 12 行有效报价中，待决定筛选必须参与分页、保留原始报价行序号和全量概览。
// English: Pending-only filtering must paginate real quotable lines without changing source prices or all-line analytics.
test('UX pending-only: filtered pagination and award state / 待决定筛选真实分页',async({page,app})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await prepare(page,app);
  const ws=await snapshot(page);
  const lines=['RFQ Line ID,报价单价,交期,MOQ,报价状态',
    ...ws.state.items.map((it,i)=>[it.lineId,(20+i).toFixed(2),7,1,'正常报价'].join(','))].join('\n');
  await page.locator('#quotePaste').fill(lines);
  await page.locator('#quoteParsePaste').click();
  await expect(page.locator('#quoteImportPreviewBody tr')).toHaveCount(12);
  await page.locator('#commitQuoteImport').click();
  await expect(page.locator('#quoteRoundBody tr')).toHaveCount(12);
  await page.locator('#confirmQuoteRound').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quotes"]').click();
  const before=await snapshot(page);
  await page.locator('#srmUxPendingOnly').check();
  await expect(page.locator('#quoteCount')).toContainText('待决定 12 项（全部 12 项）');
  await expect(page.locator('#quoteTable tbody tr')).toHaveCount(10);
  await page.locator('#quotePager [data-pg="1"]').click();
  await expect(page.locator('#quoteTable tbody tr')).toHaveCount(2);
  await expect(page.locator('#quoteTable tbody tr').first()).toContainText('TST-011');
  await page.locator('#quotePager [data-pg="0"]').click();
  expect((await snapshot(page)).state).toEqual(before.state);
  await page.locator('#quoteTable td.awardSelectable').first().click();
  await expect(page.locator('#quoteCount')).toContainText('待决定 11 项（全部 12 项）');
  await expect(page.locator('#quoteTable tbody tr')).toHaveCount(10);
  await expect(page.locator('#quoteTable tbody tr').first()).toContainText('TST-002');
  await expect(page.locator('#srmV31DecisionBoard')).toContainText('有效报价物料');
  await page.locator('#srmUxPendingOnly').uncheck();
  await expect(page.locator('#quoteCount')).toContainText('共 12 项');
  expect(errors).toEqual([]);
});
