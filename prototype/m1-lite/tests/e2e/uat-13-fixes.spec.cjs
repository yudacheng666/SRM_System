// 中文：以 Codex 独立验收 PR #13 的六项实际发现为回归标准，全部使用虚构数据与独立 SQLite。
// English: Verify UAT-01/02/03/04/06/07 against the real browser, isolated synthetic SQLite only.
const {test:base,expect}=require('@playwright/test');
const {spawn,execFileSync}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const PORT=8791,ORIGIN='http://127.0.0.1:'+PORT;
const test=base.extend({
  app:async({page},use,info)=>{
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'srm-uat-fix-'));
    const fixtures=path.join(root,'fixtures');execFileSync('python',[path.join(__dirname,'fixtures.py'),fixtures]);
    const logs=[],child=spawn('python',[path.join(__dirname,'serve.py'),String(PORT)],{
      env:{...process.env,SRM_DATA_DIR:path.join(root,'data'),PYTHONUNBUFFERED:'1'},
      stdio:['ignore','pipe','pipe']
    });
    child.stdout.on('data',x=>logs.push(String(x)));
    child.stderr.on('data',x=>logs.push(String(x)));
    page.on('dialog',d=>d.accept());
    try{
      await expect.poll(async()=>{try{return(await page.request.get(ORIGIN+'/api/health')).status()}catch{return 0}},{timeout:30000}).toBe(200);
      await page.goto(ORIGIN,{waitUntil:'load'});
      await expect(page.locator('#pilotNewWorkspace')).toBeEnabled();
      await use({fixtures});
    }finally{
      const logfile=info.outputPath('uat-fixes-server.log');
      fs.writeFileSync(logfile,logs.join(''));
      await info.attach('uat-fixes-server',{path:logfile,contentType:'text/plain'});
      if(child.exitCode===null&&child.signalCode===null){
        await new Promise(resolve=>{const t=setTimeout(()=>child.kill('SIGKILL'),5000);child.once('exit',()=>{clearTimeout(t);resolve()});child.kill('SIGTERM')});
      }
      fs.rmSync(root,{recursive:true,force:true});
    }
  }
});
const snapshot=page=>page.evaluate(()=>window.SRMPilot.snapshot());
async function ensureOpen(page,id){
  const el=page.locator(id);
  if(!await el.evaluate(n=>n.open))await el.locator(':scope > summary').click();
  await expect(el).toHaveAttribute('open','');
}
async function start(page,app,{suppliers=false}={}){
  await ensureOpen(page,'#uiProjectDetails');
  await page.locator('#pilotNewWorkspace').click();
  await page.locator('#toggleItemIntake').click();
  await page.locator('#importFile').setInputFiles(path.join(app.fixtures,'items12.xlsx'));
  await expect(page.locator('#confirmImportRows')).toBeEnabled();
  await page.locator('#confirmImportRows').click();
  await expect(page.locator('#itemCount')).toContainText('12');
  if(suppliers){
    await ensureOpen(page,'#uiSupplierTools');
    await page.locator('#pilotSupplierExcel').setInputFiles(path.join(app.fixtures,'suppliers.xlsx'));
    await expect(page.locator('#pilotImportSupplierConfirm')).toBeEnabled();
    await page.locator('#pilotImportSupplierConfirm').click();
    await expect.poll(async()=>(await snapshot(page)).state.suppliers.length).toBe(2);
    await page.locator('.srm-v2-sideitem[data-srm-v2-tab="assign"]').click();
    await page.locator('#selectAssignAll').click();
    await page.locator('[data-add="SUP-A"]').click();
    await expect.poll(async()=>(await snapshot(page)).state.assignments.filter(a=>a.values.includes('SUP-A')).length).toBe(12);
  }
}
test('UAT-01 categories follow active imported RFQ in both allocation views',async({page,app})=>{
  await page.setViewportSize({width:1366,height:768});
  await start(page,app);
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="assign"]').click();
  const a=page.locator('#assignCatFilter'),b=page.locator('#sfCatFilter');
  await expect(a.locator('option')).toHaveCount(2);
  await expect(a.locator('option[value="虚构类别"]')).toHaveCount(1);
  await expect(b.locator('option[value="虚构类别"]')).toHaveCount(1);
  await expect(a.locator('option[value="类别A"]')).toHaveCount(0);
  await a.selectOption('虚构类别');
  await page.locator('#runAssignSearch').click();
  await expect(page.locator('#assignItemCount')).toContainText('12');
  await page.locator('.modebtn[data-mode="supplierFirst"]').click();
  await b.selectOption('虚构类别');
  await page.locator('#runSfSearch').click();
  await expect(b).toHaveValue('虚构类别');
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="items"]').click();
  await page.locator('#itemBody tr[data-edit-line]').first().dblclick();
  await expect(page.locator('#itemEditModal')).toHaveClass(/open/);
  await page.locator('#itemEditCat').fill('新类别');
  await page.locator('#itemEditSave').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="assign"]').click();
  await expect(a.locator('option[value="新类别"]')).toHaveCount(1);
  await expect(b.locator('option[value="新类别"]')).toHaveCount(1);
});
test('UAT-02 manual, pasted and CSV file quotation sources remain distinct in stored state',async({page,app})=>{
  await start(page,app,{suppliers:true});
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quoteImport"]').click();
  await page.locator('#quoteImportSupplier').selectOption('SUP-A');
  await page.locator('#quotePaste').fill('存货编码,报价单价,交期,MOQ,报价状态\nTST-001,17,7,1,正常报价');
  await page.locator('#quoteParsePaste').click();
  await page.locator('#commitQuoteImport').click();
  await page.locator('#quoteManualItem').fill('TST-002');
  await page.locator('#quoteManualPrice').fill('24');
  await page.locator('#quoteManualLead').fill('6');
  await page.locator('#quoteManualMoq').fill('1');
  await page.locator('#quoteManualAdd').click();
  await expect(page.locator('#quoteImportFeedback')).toContainText('单条手工录入');
  await page.locator('#commitQuoteImport').click();
  await page.locator('#quoteImportFile').setInputFiles({name:'fictional.csv',mimeType:'text/csv',buffer:Buffer.from('存货编码,报价单价,交期,MOQ,报价状态\nTST-003,32,6,1,正常报价')});
  await expect(page.locator('#quoteImportFeedback')).toContainText('文件导入');
  await page.locator('#commitQuoteImport').click();
  const find=async()=>{const ws=await snapshot(page),r=ws.state.quoteRounds.find(x=>x.supplierId==='SUP-A'&&x.roundNo===1);return r?.lines.map(x=>({id:x.itemId,source:x.source}))};
  await expect.poll(find).toEqual([
    {id:'TST-001',source:'paste'},{id:'TST-002',source:'manual'},{id:'TST-003',source:'file'}
  ]);
  await expect(page.locator('#quoteRoundBody')).toContainText('表格粘贴');
  await expect(page.locator('#quoteRoundBody')).toContainText('手工录入/修正');
  await expect(page.locator('#quoteRoundBody')).toContainText('文件导入');
  await page.locator('#quoteEvidenceType').selectOption('chat_screenshot');
  await page.locator('#confirmQuoteRound').click();
  await expect.poll(async()=>{
    const ws=await snapshot(page);
    const res=await page.request.get(ORIGIN+'/api/workspaces/'+ws.workspaceId);
    if(!res.ok())return null;
    const state=(await res.json()).workspace?.state;
    return state?.quoteRounds?.find(r=>r.supplierId==='SUP-A'&&r.roundNo===1&&r.status==='confirmed')?.lines?.map(x=>x.source)||null;
  },{timeout:30000}).toEqual(['paste','manual','file']);
  const ws=await snapshot(page);
  expect(ws.state.quoteRounds.find(r=>r.supplierId==='SUP-A').evidenceType).toBe('chat_screenshot');
  // 中文：右滚后编码/RFQ 身份列仍位于可视区左端。
  // English: Source/edit columns can scroll without losing stable line identity.
  const rect=await page.evaluate(()=>{
    const body=document.getElementById('quoteRoundBody');
    const wrap=body.closest('.tablewrap');
    wrap.scrollLeft=wrap.scrollWidth;
    const cell=body.querySelector('tr td:first-child'),r=cell.getBoundingClientRect(),w=wrap.getBoundingClientRect();
    return{position:getComputedStyle(cell).position,cellLeft:r.left,wrapLeft:w.left,code:cell.textContent};
  });
  expect(rect.position).toBe('sticky');
  expect(rect.cellLeft).toBeGreaterThanOrEqual(rect.wrapLeft-2);
  expect(rect.cellLeft).toBeLessThanOrEqual(rect.wrapLeft+5);
  expect(rect.code).toContain('TST-001');
});
test('UAT-03 refused restore is visible within current backup section while project drawer collapsed',async({page,app})=>{
  await start(page,app);
  await ensureOpen(page,'#uiDataTools');
  await expect(page.locator('#uiProjectDetails')).not.toHaveAttribute('open','');
  await page.locator('#pilotS4BackupFile').setInputFiles(path.join(app.fixtures,'broken.zip'));
  await page.locator('#pilotS4RestoreFull').click();
  const message=page.locator('#uiDataTools #pilotS4RestoreFeedback');
  await expect(message).toBeVisible();
  await expect(message).toContainText('禁止直接恢复覆盖');
  await expect(message).toHaveAttribute('role','alert');
  await expect(page.locator('#uiProjectDetails')).not.toHaveAttribute('open','');
});
test('UAT-04 item editor Escape, dirty cancel and keyboard focus confinement',async({page,app})=>{
  await page.setViewportSize({width:1024,height:768});
  await start(page,app);
  const row=page.locator('#itemBody tr[data-edit-line]').first();
  await row.dblclick();
  const modal=page.locator('#itemEditModal');
  await expect(modal).toHaveClass(/open/);
  for(let i=0;i<16;i++){
    await page.keyboard.press('Tab');
    const inside=await page.evaluate(()=>document.querySelector('#itemEditModal').contains(document.activeElement));
    expect(inside,'Tab must never focus app navigation behind modal').toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(modal).not.toHaveClass(/open/);
  await row.dblclick();
  await page.locator('#itemEditName').fill('临时未保存名称');
  page.removeAllListeners('dialog');
  page.on('dialog',async d=>d.message().includes('放弃修改')?d.dismiss():d.accept());
  await page.keyboard.press('Escape');
  await expect(modal).toHaveClass(/open/);
  page.removeAllListeners('dialog');
  page.on('dialog',d=>d.accept());
  await page.keyboard.press('Escape');
  await expect(modal).not.toHaveClass(/open/);
  const ws=await snapshot(page);
  expect(ws.state.items.some(it=>it.name==='临时未保存名称')).toBe(false);
});
test('UAT-07 drawing guidance reflects currently selected formal RFQ material',async({page,app})=>{
  await start(page,app);
  await page.locator('#uiOpenDrawings').click();
  const info=page.locator('#pilotDrawingInfo');
  await expect(info).toContainText('当前物料');
  await expect(info).toContainText('TST-');
  await expect(info).not.toContainText('请先进入正式工作');
});
