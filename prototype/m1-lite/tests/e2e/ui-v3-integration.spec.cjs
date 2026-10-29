// 中文：检查 V3 视觉层已接入正式 M1-Lite 页面，且导航与工作区响应布局保持可用。
// English: Verify the V3 visual layer is loaded by M1-Lite and workflow navigation remains usable.
const {test:base,expect}=require('@playwright/test');
const {spawn,execFileSync}=require('node:child_process');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const PORT=8793;
const ROOT_URL='http://127.0.0.1:'+PORT;
const test=base.extend({
  app:async({page},use,info)=>{
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'srm-v3-ui-'));
    const logs=[];
    const child=spawn('python',[path.join(__dirname,'serve.py'),String(PORT)],{
      env:{...process.env,SRM_DATA_DIR:path.join(root,'data'),PYTHONUNBUFFERED:'1'},
      stdio:['ignore','pipe','pipe']
    });
    child.stdout.on('data',x=>logs.push(x.toString()));
    child.stderr.on('data',x=>logs.push(x.toString()));
    try{
      await expect.poll(async()=>{try{return(await page.request.get(ROOT_URL+'/api/health')).status()}catch{return 0}},{timeout:30000}).toBe(200);
      await page.goto(ROOT_URL,{waitUntil:'load'});
      await expect(page.locator('#pilotNewWorkspace')).toBeEnabled();
      await use();
    }finally{
      const logfile=info.outputPath('srm-v3-ui-server.log');
      fs.writeFileSync(logfile,logs.join(''));
      await info.attach('srm-v3-ui-server-log',{path:logfile,contentType:'text/plain'});
      if(child.exitCode===null&&child.signalCode===null){
        await new Promise(resolve=>{
          const timer=setTimeout(()=>child.kill('SIGKILL'),5000);
          child.once('exit',()=>{clearTimeout(timer);resolve()});
          child.kill('SIGTERM');
        });
      }
      fs.rmSync(root,{recursive:true,force:true});
    }
  }
});
const sizes=[
  {width:1024,height:768},
  {width:1366,height:768},
  {width:1600,height:900}
];
test('UI V3 integration: theme, active navigation and responsive workspace / 视觉与导航回归',async({page,app})=>{
  void app;
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const stylePresent=await page.locator('#ui-v3-integration-styles').count();
  expect(stylePresent).toBe(1);
  expect(await page.locator('#ui-v3-integration-styles').textContent()).toContain('Apply the approved V3.1 visual hierarchy');
  const theme=await page.evaluate(()=>{
    const primary=document.querySelector('#pilotSaveWorkspace');
    return{
      title:document.title,
      bodyBackground:getComputedStyle(document.body).backgroundColor,
      bodyFont:getComputedStyle(document.body).fontFamily,
      primaryBackground:getComputedStyle(primary).backgroundColor,
      stylesheet:!!document.querySelector('#ui-v3-integration-styles')
    };
  });
  expect(theme.title).toBe('SRM Lite · 采购询价工作台');
  // 中文：V3.1 的浅灰背景来自已确认的结构层，而非旧版 V3 首批色值。
  // English: Expect the approved V3.1 workspace token, not the earlier transitional theme.
  expect(theme.bodyBackground).toBe('rgb(246, 248, 251)');
  expect(theme.bodyFont).toContain('Segoe UI');
  expect(theme.stylesheet).toBeTruthy();
  // 中文：保证所有正式业务面板具有 V3.1 层级，而不是仅修改导航颜色。
  // English: Verify stage-level structure on real panels, not merely themed sidebar colors.
  for(const stage of ['items','assign','quoteImport','quotes','settings']){
    const nav=page.locator('.srm-v2-sideitem[data-srm-v2-tab="'+stage+'"]');
    await nav.click();
    const intro=page.locator('#srmV3PageStage-'+stage);
    await expect(intro).toBeVisible();
    await expect(intro.locator('h2')).not.toBeEmpty();
    expect(await intro.locator('.srm-v3-pageKicker').textContent()).toMatch(/\d\d|ADMIN/);
  }
  await expect(page.locator('.srm-v3-flow-label')).toContainText('采购业务流程');
  await expect(page.locator('#srmV3QuoteLockHint')).toHaveCount(1);
  expect(await page.locator('#ui-v3-integration-styles').textContent()).toContain('STRUCTURAL PARITY');
  for(const size of sizes){
    await page.setViewportSize(size);
    for(const stage of ['items','assign','quoteImport','quotes','settings']){
      const nav=page.locator('.srm-v2-sideitem[data-srm-v2-tab="'+stage+'"]');
      await nav.click();
      await expect(page.locator('#'+stage)).toHaveClass(/active/);
      await expect(nav).toHaveAttribute('aria-current','page');
      const m=await page.evaluate(()=>{
        const app=document.querySelector('.app');
        const sidebar=document.querySelector('.srm-v2-sidebar');
        const panel=document.querySelector('.panel.active');
        return{
          width:innerWidth,
          documentWidth:document.documentElement.scrollWidth,
          appContentLeft:app.getBoundingClientRect().left+parseFloat(getComputedStyle(app).paddingLeft),
          sidebarRight:sidebar.getBoundingClientRect().right,
          panelWidth:panel.getBoundingClientRect().width
        };
      });
      expect(m.documentWidth,stage+' document overflow at '+size.width).toBeLessThanOrEqual(size.width+2);
      expect(m.appContentLeft,stage+' content must not sit underneath sidebar').toBeGreaterThanOrEqual(m.sidebarRight-1);
      expect(m.panelWidth,stage+' workspace should remain visible').toBeGreaterThan(420);
    }
  }
  expect(errors).toEqual([]);
});


// 中文：PR #26 五项 P2 中可由自动化验证的真实 UI 结构，必须进入买方正式询价再检查。
// English: Check actual buyer-mode geometry instead of only asserting the default demo shell.
test('UI V3.1 P2 buyer layout and semantic controls / 正式 RFQ 标题、抽屉、分配与决策',async({page,app})=>{
  void app;
  page.on('dialog',d=>d.accept());
  await page.locator('#pilotNewWorkspace').click();
  await expect(page.locator('body')).toHaveClass(/ui-buyer-mode/);
  for(const size of sizes){
    await page.setViewportSize(size);
    await page.locator('.srm-v2-sideitem[data-srm-v2-tab="items"]').click();
    await expect(page.locator('#srmV3PageStage-items')).toBeVisible();
    await expect(page.locator('#srmV3PageStage-items h2')).toContainText('物料与图纸');
    const closed=await page.evaluate(()=>[...document.querySelectorAll('#pilotControls>.cardbody>details:not([open])')].map(x=>({
      actual:x.getBoundingClientRect().height,summary:x.querySelector('summary').getBoundingClientRect().height
    })));
    for(const item of closed)expect(item.actual,'closed drawer must match summary height').toBeLessThanOrEqual(item.summary+3);
    await page.locator('.srm-v2-sideitem[data-srm-v2-tab="assign"]').click();
    await expect(page.locator('#assign')).toHaveClass(/active/);
    // 中文：实际分配视角可跨导航保留；先明确切到“按物料”，再验证双栏。
    // English: Explicitly switch to item-first before testing geometry; navigation need not reset persisted mode.
    await page.locator('#assign .modebtn[data-mode="itemFirst"]').click();
    await expect(page.locator('#itemFirstView')).toBeVisible();
    const dimensions=await page.evaluate(()=>{
      const a=document.querySelector('#itemFirstView'),cells=[...a.children].map(n=>n.getBoundingClientRect());
      return {material:cells[0]?.width||0,suppliers:cells[1]?.width||0,columns:getComputedStyle(a).gridTemplateColumns};
    });
    expect(dimensions.material,'material pane must be wider').toBeGreaterThan(dimensions.suppliers);
    await page.locator('#assign .modebtn[data-mode="supplierFirst"]').click();
    await expect(page.locator('#supplierFirstView')).toBeVisible();
    const supplierColumns=await page.evaluate(()=>{
      const cards=[...document.querySelector('#supplierFirstView').children].map(n=>n.getBoundingClientRect());
      return {navigation:cards[0].width,items:cards[1].width};
    });
    expect(supplierColumns.items,'supplier-first items must be wider than navigation').toBeGreaterThan(supplierColumns.navigation);
    await expect(page.locator('#sfItemBody').locator('..').locator('thead')).toContainText('全部关联方');
    await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quoteImport"]').click();
    await expect(page.locator('#srmV31RevisionDiff')).toHaveCount(1);
    await expect(page.locator('#srmV31PreviousPriceHeading')).toHaveCount(1);
    await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quotes"]').click();
    await expect(page.locator('#srmV31DecisionBoard')).toBeVisible();
    await expect(page.locator('#srmV31DecisionBoard')).toContainText('待人工决定');
    await expect(page.locator('#quoteTable')).toContainText('系统建议 / 人工决定');
  }
});
