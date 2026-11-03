// 中文：验证 B2 在真实页面完成多对多供应商追加，截图只使用虚构数据。
// English: Verify real many-to-many append assignment; screenshots use synthetic data only.
const {test:base,expect}=require('@playwright/test');
const {spawn,execFileSync}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const PORT=8786, URL='http://127.0.0.1:'+PORT;
const test=base.extend({
  app:async({page},use,info)=>{
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'srm-v2-b2-'));
    const fixture=path.join(root,'fixtures');
    execFileSync('python',[path.join(__dirname,'fixtures.py'),fixture]);
    const logs=[];
    const child=spawn('python',[path.join(__dirname,'serve.py'),String(PORT)],{
      env:{...process.env,SRM_DATA_DIR:path.join(root,'data'),PYTHONUNBUFFERED:'1'},
      stdio:['ignore','pipe','pipe'],
    });
    child.stdout.on('data',x=>logs.push(x.toString()));child.stderr.on('data',x=>logs.push(x.toString()));
    page.on('dialog',async d=>d.accept());
    try{
      await expect.poll(async()=>{try{return(await page.request.get(URL+'/api/health')).status()}catch{return 0}},{timeout:30000}).toBe(200);
      await page.goto(URL);
      await expect(page.locator('#pilotNewWorkspace')).toBeEnabled();
      await use({fixture});
    }finally{
      const logfile=info.outputPath('server.log');fs.writeFileSync(logfile,logs.join(''));
      await info.attach('server-log',{path:logfile,contentType:'text/plain'});
      if(child.exitCode===null&&child.signalCode===null){
        await new Promise(resolve=>{const t=setTimeout(()=>child.kill('SIGKILL'),5000);child.once('exit',()=>{clearTimeout(t);resolve()});child.kill('SIGTERM')});
      }
      fs.rmSync(root,{recursive:true,force:true});
    }
  },
});
const status=page=>page.evaluate(()=>window.SRMPilot.snapshot());
const open=async(page,id)=>{
  const el=page.locator(id);
  if(!await el.evaluate(n=>n.open))await el.locator(':scope > summary').click();
  await expect(el).toHaveAttribute('open','');
};
for(const viewport of [{width:1366,height:768},{width:1600,height:900}]){
test('B2 allocation real-browser '+viewport.width+'x'+viewport.height,async({page,app},info)=>{
  const errors=[];page.on('pageerror',x=>errors.push(x.message));
  await page.setViewportSize(viewport);
  await open(page,'#uiProjectDetails');
  await page.locator('#pilotNewWorkspace').click();
  await expect(page.locator('#pilotModeBadge')).not.toContainText('演示');
  await page.locator('#toggleItemIntake').click();
  await page.locator('#importFile').setInputFiles(path.join(app.fixture,'items12.xlsx'));
  await expect(page.locator('#confirmImportRows')).toBeEnabled();
  await page.locator('#confirmImportRows').click();
  await expect(page.locator('#itemCount')).toContainText('12');
  await open(page,'#uiSupplierTools');
  await page.locator('#pilotSupplierExcel').setInputFiles(path.join(app.fixture,'suppliers.xlsx'));
  await expect(page.locator('#pilotImportSupplierConfirm')).toBeEnabled();
  await page.locator('#pilotImportSupplierConfirm').click();
  await expect.poll(async()=>(await status(page)).state.suppliers.length).toBe(2);
  // 中文：完成导入后关闭供应商工具区，再测量正常业务工作台首屏。
  // English: Close supplier intake after use to measure the normal working viewport.
  if(await page.locator('#uiSupplierTools').evaluate(n=>n.open))
    await page.locator('#uiSupplierTools > summary').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="assign"]').click();
  await expect(page.locator('#assign')).toHaveClass(/active/);
  await expect(page.locator('#stTotal')).toHaveText('12');
  await expect(page.locator('#itemFirstView')).toBeVisible();
  await expect(page.locator('#supplierList')).toContainText('虚构供应商');
  await page.locator('#selectAssignAll').click();
  await expect(page.locator('#assignSelectedCount')).toHaveText('12');
  await page.locator('[data-add="SUP-A"]').click();
  await page.locator('[data-add="SUP-B"]').click();
  await expect.poll(async()=>{const snap=await status(page);return snap.state.assignments.filter(a=>a.values.length===2).length}).toBe(12);
  await expect(page.locator('#stCovered')).toHaveText('12');
  await expect(page.locator('#stNone')).toHaveText('0');
  // 中文：保留原按供应商→按物料双向模式；切换模式不清空先前追加的关联。
  // English: Switching between two allocation modes must not replace existing supplier relationships.
  await page.locator('.modebtn[data-mode="supplierFirst"]').click();
  await expect(page.locator('#supplierFirstView')).toBeVisible();
  await expect(page.locator('#supplierFirstList')).toContainText('虚构供应商');
  const supplierShot=info.outputPath('srm-ui-v2-b2-'+viewport.width+'-supplier-first.png');
  await page.screenshot({path:supplierShot,fullPage:true});
  await info.attach('supplier-first-'+viewport.width,{path:supplierShot,contentType:'image/png'});
  await page.locator('.modebtn[data-mode="itemFirst"]').click();
  await expect(page.locator('#itemFirstView')).toBeVisible();
  // 中文：记录未经滚动的真实首屏物料行位置；防止截图把自动滚动误报成设计优化。
  // English: Record unscrolled desktop first-row geometry, never trust auto-scroll screenshots.
  await page.evaluate(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0);
  const geometry=await page.evaluate(()=>{
    const row=document.querySelector('#assignItemBody tr')?.getBoundingClientRect();
    const nav=document.querySelector('.ui-workNav')?.getBoundingClientRect();
    return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,scrollY,navBottom:nav?.bottom,rowTop:row?.top,rowBottom:row?.bottom};
  });
  console.log('SRM_UI_V2_B2_METRIC='+JSON.stringify(geometry));
  expect(geometry.documentWidth).toBeLessThanOrEqual(viewport.width+2);
  expect(geometry.rowTop).toBeLessThan(viewport.height);
  const itemsShot=info.outputPath('srm-ui-v2-b2-'+viewport.width+'-item-first.png');
  await page.screenshot({path:itemsShot,fullPage:true});
  await info.attach('item-first-'+viewport.width,{path:itemsShot,contentType:'image/png'});
  await expect.poll(async()=>{
    const snap=await status(page);const res=await page.request.get(URL+'/api/workspaces/'+snap.workspaceId);
    if(!res.ok())return false;
    const stored=(await res.json()).workspace;
    return stored.revision>0 && JSON.stringify(stored.state)===JSON.stringify(snap.state);
  }).toBe(true);
  expect(errors).toEqual([]);
});
}
