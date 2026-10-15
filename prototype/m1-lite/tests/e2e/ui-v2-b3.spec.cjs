// 中文：使用真实 M1-Lite 本机服务，在虚构数据上验收报价回收与比价 UI B3。
// English: Real localhost SQLite acceptance of quote-intake and comparison UI, synthetic data only.
const {test:base,expect}=require('@playwright/test');
const {spawn,execFileSync}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const URL='http://127.0.0.1:8787';
const test=base.extend({
 app:async({page},use,info)=>{
   const root=fs.mkdtempSync(path.join(os.tmpdir(),'srm-v2-b3-'));
   const fixtures=path.join(root,'fixtures');
   execFileSync('python',[path.join(__dirname,'fixtures.py'),fixtures]);
   const logs=[];
   const child=spawn('python',[path.join(__dirname,'serve.py'),'8787'],{
     env:{...process.env,SRM_DATA_DIR:path.join(root,'data'),PYTHONUNBUFFERED:'1'},
     stdio:['ignore','pipe','pipe'],
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
     const logfile=info.outputPath('b3-server.log');fs.writeFileSync(logfile,logs.join(''));
     await info.attach('server-log',{path:logfile,contentType:'text/plain'});
     if(child.exitCode===null&&child.signalCode===null){
       await new Promise(resolve=>{const t=setTimeout(()=>child.kill('SIGKILL'),5000);child.once('exit',()=>{clearTimeout(t);resolve()});child.kill('SIGTERM')});
     }
     fs.rmSync(root,{recursive:true,force:true});
   }
 }
});
const snap=page=>page.evaluate(()=>window.SRMPilot.snapshot());
async function open(page,id){
 const d=page.locator(id);
 if(!await d.evaluate(n=>n.open))await d.locator('summary').click();
 await expect(d).toHaveAttribute('open','');
}
async function close(page,id){
 const d=page.locator(id);
 if(await d.evaluate(n=>n.open))await d.locator('summary').click();
}
for (const viewport of [{width:1366,height:768},{width:1600,height:900}]){
test('B3 quote and comparison with real SQLite '+viewport.width+'x'+viewport.height,async({page,app},info)=>{
 const errors=[];page.on('pageerror',x=>errors.push(x.message));
 await page.setViewportSize(viewport);
 await open(page,'#uiProjectDetails');
 await page.locator('#pilotNewWorkspace').click();
 await page.locator('#toggleItemIntake').click();
 await page.locator('#importFile').setInputFiles(path.join(app.fixtures,'items12.xlsx'));
 await expect(page.locator('#confirmImportRows')).toBeEnabled();
 await page.locator('#confirmImportRows').click();
 await expect(page.locator('#itemCount')).toContainText('12');
 await open(page,'#uiSupplierTools');
 await page.locator('#pilotSupplierExcel').setInputFiles(path.join(app.fixtures,'suppliers.xlsx'));
 await expect(page.locator('#pilotImportSupplierConfirm')).toBeEnabled();
 await page.locator('#pilotImportSupplierConfirm').click();
 await expect.poll(async()=>(await snap(page)).state.suppliers.length).toBe(2);
 await close(page,'#uiSupplierTools');
 await page.locator('.srm-v2-sideitem[data-srm-v2-tab="assign"]').click();
 await page.locator('#selectAssignAll').click();
 await page.locator('[data-add="SUP-A"]').click();
 await page.locator('[data-add="SUP-B"]').click();
 await expect.poll(async()=>(await snap(page)).state.assignments.filter(x=>x.values.length===2).length).toBe(12);

 await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quoteImport"]').click();
 await expect(page.locator('#quoteImport')).toHaveClass(/active/);
 await expect(page.locator('#quoteImport .srm-v2-quote-section-label')).toHaveCount(3);
 await page.locator('#quoteImportSupplier').selectOption('SUP-A');
 await page.locator('#quotePaste').fill('存货编码,报价单价,交期,MOQ,报价状态\nTST-001,17.25,7,1,正常报价\nTST-002,23.75,9,1,正常报价');
 await page.locator('#quoteParsePaste').click();
 await expect(page.locator('#quoteImportPreviewBody')).toContainText('17.25');
 await page.locator('#commitQuoteImport').click();
 await expect(page.locator('#qcQuoted')).toHaveText('2');
 await expect(page.locator('#qcMissing')).toHaveText('10');
 // 中文：确认报价保持不可静默改写，轮次新增采用已有真实处理器。
 // English: Confirmed quotes remain locked; subsequent round uses existing application handlers.
 await page.locator('#confirmQuoteRound').click();
 await expect(page.locator('#confirmQuoteRound')).toBeDisabled();
 await page.locator('#newQuoteRound').click();
 await expect(page.locator('#confirmQuoteRound')).toBeEnabled();
 await page.locator('#quoteManualItem').fill('TST-001');
 await page.locator('#quoteManualPrice').fill('16.75');
 await page.locator('#quoteManualLead').fill('5');
 await page.locator('#quoteManualMoq').fill('1');
 await page.locator('#quoteManualAdd').click();
 await page.locator('#commitQuoteImport').click();
 await expect(page.locator('#qcQuoted')).toHaveText('1');
 await page.locator('#confirmQuoteRound').click();
 await expect.poll(async()=>(await snap(page)).state.quoteRounds.filter(r=>r.supplierId==='SUP-A').length).toBe(2);
 await close(page,'#uiProjectDetails');
 await close(page,'#uiSupplierTools');
 await page.evaluate(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
 await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0);
 const quoteMetrics=await page.evaluate(()=>({
   viewport:{width:innerWidth,height:innerHeight},documentWidth:document.documentElement.scrollWidth,
   roundTop:document.querySelector('#quoteRoundBody')?.getBoundingClientRect().top,
   coverageTop:document.querySelector('#quoteCoverageSummary')?.getBoundingClientRect().top,
   firstImportTop:document.querySelector('#quoteImport .quoteImportGrid')?.getBoundingClientRect().top,
   primaryVisible:[...document.querySelectorAll('#quoteImport .btn.primary')].filter(x=>x.getClientRects().length).map(x=>x.id)
 }));
 console.log('SRM_UI_V2_B3_QUOTE_METRIC='+JSON.stringify(quoteMetrics));
 expect(quoteMetrics.documentWidth).toBeLessThanOrEqual(viewport.width+2);
 await page.screenshot({path:info.outputPath('b3-quote-'+viewport.width+'.png'),fullPage:true});
 await info.attach('b3-quote-'+viewport.width,{path:info.outputPath('b3-quote-'+viewport.width+'.png'),contentType:'image/png'});
 await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quotes"]').click();
 await expect(page.locator('#quotes')).toHaveClass(/active/);
 await expect(page.locator('#quoteTable')).toBeVisible();
 await expect(page.locator('#commonScopePicker')).toBeVisible();
 await expect(page.locator('#quoteAnalysis')).toBeVisible();
 await expect(page.locator('#quoteModeNotice')).toBeVisible();
 await page.evaluate(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
 const compareMetrics=await page.evaluate(()=>({
    width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,
    tableTop:document.querySelector('#quoteTable')?.getBoundingClientRect().top,
    comparableScopeTop:document.querySelector('#commonScopePicker')?.getBoundingClientRect().top,
 }));
 console.log('SRM_UI_V2_B3_COMPARE_METRIC='+JSON.stringify(compareMetrics));
 expect(compareMetrics.documentWidth).toBeLessThanOrEqual(viewport.width+2);
 await page.screenshot({path:info.outputPath('b3-comparison-'+viewport.width+'.png'),fullPage:true});
 await info.attach('b3-comparison-'+viewport.width,{path:info.outputPath('b3-comparison-'+viewport.width+'.png'),contentType:'image/png'});
 await expect.poll(async()=>{
   const current=await snap(page);
   const response=await page.request.get(URL+'/api/workspaces/'+current.workspaceId);
   if(!response.ok())return false;
   const stored=(await response.json()).workspace;
   return stored.revision>0&&JSON.stringify(stored.state)===JSON.stringify(current.state);
 },{timeout:30000}).toBe(true);
 expect(errors).toEqual([]);
});
}
