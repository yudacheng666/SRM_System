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
  if(id==='#uiProjectDetails')await page.locator('.ui-workNav .tab[data-tab="project"]').click();
  if(id==='#uiDataTools'||id==='#srmUxStatusDetails')await page.locator('#uiAdminToggle').click();
  if(id==='#uiSupplierTools')await page.locator('.ui-workNav .tab[data-tab="assign"]').click();
  const drawer=page.locator(id);
  if(!await drawer.evaluate(node=>node.open))await drawer.locator(':scope > summary').click();
  await expect(drawer).toHaveAttribute('open','');
}
async function prepare(page,app){
  await open(page,'#uiProjectDetails');
  await page.locator('#pilotNewWorkspace').click();
  await page.locator('.ui-workNav .tab[data-tab="items"]').click();
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
  // 中文：真实可点击目标是价格按钮，单元格中心可能命中可展开的商务明细。
  // English: Select the bid via its explicit price button, not the disclosure target.
  await page.locator('#quoteTable td.awardSelectable .quotePrice').first().click();
  await expect(page.locator('#quoteCount')).toContainText('待决定 11 项（全部 12 项）');
  await expect(page.locator('#quoteTable tbody tr')).toHaveCount(10);
  await expect(page.locator('#quoteTable tbody tr').first()).toContainText('TST-002');
  await expect(page.locator('#srmV31DecisionBoard')).toContainText('有效报价物料');
  await page.locator('#srmUxPendingOnly').uncheck();
  await expect(page.locator('#quoteCount')).toContainText('共 12 项');
  expect(errors).toEqual([]);
});


// 中文：采购员已确认金额必须只汇总有效人工选择，不混入默认建议；重置后不将空集显示为 ¥0。
// English: Buyer-approved subtotal counts only valid manual awards and clearly separates defaults and empty scope.
test('UX manual-only: buyer-approved amount distinct from suggested totals / 人工定标金额独立显示',async({page,app})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await prepare(page,app);
  const st=(await snapshot(page)).state,lines=st.items;
  const input=['RFQ Line ID,报价单价,交期,MOQ,报价状态',
    ...lines.map((it,i)=>[it.lineId,20+i,7,1,'正常报价'].join(','))].join('\n');
  await page.locator('#quotePaste').fill(input);
  await page.locator('#quoteParsePaste').click();
  await expect(page.locator('#quoteImportPreviewBody tr')).toHaveCount(12);
  await page.locator('#commitQuoteImport').click();
  await page.locator('#confirmQuoteRound').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quotes"]').click();
  const summary=page.locator('#srmUxManualAwardSummary');
  await expect(summary).toContainText('尚无人工确认的有效定标（0 项');
  await expect(page.locator('#quoteAnalysis')).toContainText('当前建议/已选组合');
  const totalCents=lines.slice(0,3).reduce((sum,it,i)=>sum+Math.round((20+i)*it.qty*100),0);
  for(const it of lines.slice(0,3)){
    await page.locator('#quoteTable td[data-award="'+it.lineId+'|SUP-A"] .quotePrice').click();
  }
  await expect(summary).toContainText('采购员已确认金额：');
  await expect(summary).toContainText('¥'+(totalCents/100).toFixed(2));
  await expect(summary).toContainText('（3 项，排除自动建议和待复核项）');
  await expect(page.locator('#srmV31DecisionBoard')).toContainText('人工已选');
  expect((await snapshot(page)).state.manualAwards).toHaveLength(3);
  await page.locator('#resetAwards').click();
  await expect(summary).toContainText('尚无人工确认的有效定标（0 项');
  await expect(summary).not.toContainText('¥0.00');
  expect((await snapshot(page)).state.manualAwards).toHaveLength(0);
  expect(errors).toEqual([]);
});


// 中文：编辑可读询价名称须真实保存、切换及重载后保留；底层工作空间身份不得改变。
// English: Renaming a buyer RFQ persists to SQLite and history without mutating the immutable key.
test('UX project title: Chinese label, rename, history and reload / 询价名称真实保存',async({page,app})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await open(page,'#uiProjectDetails');
  await page.locator('#pilotNewWorkspace').click();
  const before=await snapshot(page);
  await expect(page.locator('#uiCurrentRfq')).toContainText('未命名询价');
  await expect(page.locator('#uiRenameRfqBtn')).toBeVisible();
  await expect(page.locator('.ui-eyebrow')).toHaveText('询价与比价');
  await expect(page.locator('.ui-context small').first()).toHaveText('当前询价项目');
  await expect(page.locator('#pilotSubtitle')).toContainText('自动保存到本机');
  await page.locator('#uiRenameRfqBtn').click();
  await page.locator('#uiRfqNameInput').fill('虚构测试零件询价（第二批）');
  await page.locator('#uiRfqNameInput').press('Enter');
  await expect(page.locator('#uiCurrentRfq')).toHaveText('虚构测试零件询价（第二批）');
  await expect.poll(async()=>{
    const data=await page.request.get(URL+'/api/workspaces/'+before.workspaceId);
    if(!data.ok())return false;
    const saved=(await data.json()).workspace;
    return saved.state.projectName==='虚构测试零件询价（第二批）'&&saved.workspaceId===before.workspaceId;
  },{timeout:20000}).toBe(true);
  await page.reload();
  await expect(page.locator('#uiCurrentRfq')).toHaveText('虚构测试零件询价（第二批）');
  await open(page,'#uiProjectDetails');
  await open(page,'#srmUxStatusDetails');
  await expect(page.locator('#srmUxInternalWorkspaceId')).toHaveText(before.workspaceId);
  await open(page,'#uiProjectDetails');
  await page.locator('#pilotNewWorkspace').click();
  await expect.poll(async()=>{const current=await snapshot(page);return current.workspaceId!==before.workspaceId}).toBe(true);
  await open(page,'#uiProjectDetails');
  await expect(page.locator('#pilotHistoryWorkspace')).toContainText('虚构测试零件询价（第二批）');
  await page.locator('#pilotHistoryWorkspace').selectOption(before.workspaceId);
  await page.locator('#pilotSwitchWorkspace').click();
  await expect(page.locator('#uiCurrentRfq')).toHaveText('虚构测试零件询价（第二批）');
  expect((await snapshot(page)).workspaceId).toBe(before.workspaceId);
  expect(errors).toEqual([]);
});


// 中文：项目必须是与物料/分配并列的采购第一步，非跨页面折叠工具条；不触碰业务数据。
// English: Project is the permanent first workflow panel, with original controls and correct navigation.
test('UX project page: first workflow stage, visible controls, stage switching / 询价项目独立首页',async({page,app})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const stages=page.locator('.ui-workNav .tab');
  await expect(stages).toHaveCount(5);
  await expect(stages.first()).toHaveText('① 询价项目');
  await expect(page.locator('#project')).toHaveClass(/active/);
  await expect(page.locator('.srm-v2-sideitem[data-srm-v2-tab="project"]')).toHaveAttribute('aria-current','page');
  await expect(page.locator('#uiProjectDetails')).toHaveAttribute('open','');
  await expect(page.locator('#pilotNewWorkspace')).toBeVisible();
  await expect(page.locator('#uiProjectDetails > summary')).toBeHidden();
  await page.locator('#pilotNewWorkspace').click();
  await expect(page.locator('#pilotSaveWorkspace')).toBeVisible();
  const original=await snapshot(page);
  await page.locator('#uiProjectNextItems').click();
  await expect(page.locator('#items')).toHaveClass(/active/);
  await expect(page.locator('#project')).not.toBeVisible();
  await expect(page.locator('.srm-v2-sideitem[data-srm-v2-tab="items"]')).toHaveAttribute('aria-current','page');
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="project"]').click();
  await expect(page.locator('#project')).toHaveClass(/active/);
  await expect(page.locator('#pilotNewWorkspace')).toBeVisible();
  await expect(page.locator('#uiProjectDetails')).toHaveAttribute('open','');
  await expect(page.locator('#pilotHistoryWorkspace')).toBeVisible();
  expect((await snapshot(page)).workspaceId).toBe(original.workspaceId);
  expect(errors).toEqual([]);
});


// 中文：备份功能必须归独立管理页，项目首页只有新建/保存/切换等业务入口。
// English: Backup and technical reload are in a separate admin panel, never beneath RFQ creation.
test('UX admin: backup page separate from RFQ, concise labels / 独立备份页与简短项目按钮',async({page,app})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await expect(page.locator('#project')).toHaveClass(/active/);
  await expect(page.locator('#pilotNewWorkspace')).toHaveText('新建');
  await expect(page.locator('#pilotSaveWorkspace')).toHaveText('保存');
  await expect(page.locator('#project #pilotS4DownloadFull')).toHaveCount(0);
  await expect(page.locator('#project #pilotResumeWorkspace')).toHaveCount(0);
  await page.locator('#uiAdminToggle').click();
  await expect(page.locator('#backup')).toBeVisible();
  await expect(page.locator('#project')).not.toBeVisible();
  await expect(page.locator('#uiDataTools')).toHaveAttribute('open','');
  await expect(page.locator('#backup #pilotS4DownloadFull')).toBeVisible();
  await expect(page.locator('#backup #pilotResumeWorkspace')).toHaveText('重新读取已保存数据');
  await expect(page.locator('#backup #srmUxStatusDetails')).toHaveCount(1);
  await expect(page.locator('[data-srm-v2-action="admin"]')).toHaveAttribute('aria-current','page');
  await expect(page.locator('[data-srm-v2-tab="project"]')).not.toHaveAttribute('aria-current','page');
  await page.locator('[data-srm-v2-tab="project"]').click();
  await expect(page.locator('#project')).toBeVisible();
  await expect(page.locator('#backup')).not.toBeVisible();
  await expect(page.locator('[data-srm-v2-tab="project"]')).toHaveAttribute('aria-current','page');
  expect(errors).toEqual([]);
});


// 中文：物料明细需接近导入预览的紧凑行距，缺图纸直接写在原按钮中，不重复占一整行。
// English: Detail rows are compact, and missing drawings replace PDF in the original action itself.
test('UX item rows: single-line drawing badge and compact row / 物料行高及缺图纸标识',async({page,app})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await prepare(page,app);
  await page.locator('.ui-workNav .tab[data-tab="items"]').click();
  const rows=page.locator('#itemBody tr[data-edit-line]');
  await expect(rows).toHaveCount(12);
  const missing=page.locator('#itemBody .drawingThumb--missing');
  await expect(missing).toHaveCount(12);
  await expect(missing.first()).toHaveText('缺图纸');
  await expect(missing.first()).toHaveAttribute('data-drawing',/^RFQ-L/);
  await expect(missing.first()).toHaveAttribute('title',/缺图纸/);
  await expect(page.locator('#itemBody .pdfMeta')).toHaveCount(0);
  const height=await rows.first().evaluate(el=>el.getBoundingClientRect().height);
  expect(height).toBeLessThanOrEqual(40);
  // 中文：默认最新行排序，断言存在指定物料，不依赖固定第一行。
  // English: Check material presence without assuming the first item is TST-001.
  await expect(page.locator('#itemBody')).toContainText('TST-001');
  await missing.first().click();
  await expect(page.locator('#drawingModal')).toHaveClass(/open/);
  expect(errors).toEqual([]);
});


// 中文：供应商分配/供应商视角等列表与物料明细行高一致，缺图纸不用 PDF 占位，信息应横排。
// English: Reuse compact item-table density and in-place missing-drawing badges in allocation.
test('UX allocation: shared compact material list and missing drawing / 供应商物料列表紧凑布局',async({page,app})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1366,height:768});
  await prepare(page,app);
  await page.locator('.ui-workNav .tab[data-tab="assign"]').click();
  const rows=page.locator('#assignItemBody tr');
  await expect(rows).toHaveCount(12);
  await expect(page.locator('#assignItemBody .srm-ux-inlineMaterial')).toHaveCount(12);
  const missing=page.locator('#assignItemBody .drawingThumb--missing');
  await expect(missing).toHaveCount(12);
  await expect(missing.first()).toHaveText('缺图纸');
  await expect(missing.first()).not.toHaveText('PDF');
  await expect(missing.first()).toHaveAttribute('data-drawing',/^RFQ-L/);
  await expect(page.locator('#assignItemBody .pdfMeta')).toHaveCount(0);
  await expect(rows.first().locator('.srm-ux-materialSummary')).toHaveAttribute('title',/TST-001/);
  const density=await rows.first().evaluate(row=>{
    const info=row.querySelector('.srm-ux-materialSummary');
    const button=row.querySelector('.drawingThumb');
    const css=getComputedStyle(info);
    return {row:row.getBoundingClientRect().height,
      whiteSpace:css.whiteSpace,overflow:css.overflow,
      button:button.getBoundingClientRect().height,
      cellPadding:getComputedStyle(row.cells[1]).paddingTop};
  });
  expect(density.row).toBeLessThanOrEqual(40);
  expect(density.whiteSpace).toBe('nowrap');
  expect(density.overflow).toBe('hidden');
  expect(density.button).toBeLessThanOrEqual(26);
  expect(parseFloat(density.cellPadding)).toBeLessThanOrEqual(4);
  await missing.first().click();
  await expect(page.locator('#drawingModal')).toHaveClass(/open/);
  expect(errors).toEqual([]);
});


// 中文：回归P3-UX09-01：真实报价列表价格/详情同行，保留展开的商务信息，首屏可达。
 // English: Measure the actual quote matrix density, not just CSS declarations.
test('UX09 exact 1366 comparison density and first-row reachability / 比价紧凑性复验',async({page,app})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1366,height:768});
  await prepare(page,app);
  await page.locator('#quotePaste').fill('存货编码,报价单价,交期,MOQ,报价状态\nTST-001,17.25,7,1,正常报价\nTST-002,23.75,9,1,正常报价');
  await page.locator('#quoteParsePaste').click();
  await expect(page.locator('#commitQuoteImport')).toBeEnabled();
  await page.locator('#commitQuoteImport').click();
  await page.locator('#confirmQuoteRound').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quotes"]').click();
  // 中文：固定12行里只有2项有确认报价，先按真实待决定过滤，避免抽查未报价行。
  // English: Scope to the two genuinely quotable lines rather than an unpriced first page.
  await page.locator('#srmUxPendingOnly').check();
  await expect(page.locator('#quoteTable tbody tr').first()).toBeVisible();
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  const cells=page.locator('#quoteTable td.awardSelectable');
  await expect(cells.first().locator('.quotePrice')).toBeVisible();
  const row=page.locator('#quoteTable tbody tr').first();
  const measure=await row.evaluate(el=>{
    const cell=el.querySelector('td.awardSelectable');
    const price=cell.querySelector('.quotePrice').getBoundingClientRect();
    const detail=cell.querySelector('.srm-ux-bid-details summary').getBoundingClientRect();
    const bounds=el.getBoundingClientRect();
    return {height:bounds.height,top:bounds.top,viewport:window.innerHeight,
      priceCenter:(price.top+price.bottom)/2,detailCenter:(detail.top+detail.bottom)/2};
  });
  expect(measure.height).toBeLessThanOrEqual(44);
  expect(measure.top).toBeLessThan(measure.viewport);
  expect(Math.abs(measure.priceCenter-measure.detailCenter)).toBeLessThanOrEqual(10);
  await cells.first().locator('.srm-ux-bid-details summary').click();
  await expect(cells.first().locator('.srm-ux-bid-details')).toHaveAttribute('open','');
  await expect(cells.first().locator('.srm-ux-bid-details')).toContainText('数量');
  expect(errors).toEqual([]);
});
