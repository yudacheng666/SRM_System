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
  expect(theme.title).toContain('UI V3');
  expect(theme.bodyBackground).toBe('rgb(243, 246, 250)');
  expect(theme.bodyFont).toContain('Segoe UI');
  expect(theme.stylesheet).toBeTruthy();
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
