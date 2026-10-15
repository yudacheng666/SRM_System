// 中文：SRM UI V2 探索式浏览器审计：真实 UI、真实 SQLite、仅临时虚构数据。
// English: Exploratory browser audit uses the real SRM UI and SQLite, isolated synthetic data only.
const {test:base,expect}=require('@playwright/test');
const {spawn,execFileSync}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const PORT=8788, ROOT_URL='http://127.0.0.1:'+PORT;
const test=base.extend({
  app:async({page},use,info)=>{
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'srm-v2-explore-'));
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
      await expect.poll(async()=>{try{return(await page.request.get(ROOT_URL+'/api/health')).status()}catch{return 0}},{timeout:30000}).toBe(200);
      await page.goto(ROOT_URL,{waitUntil:'load'});
      await expect(page.locator('#pilotNewWorkspace')).toBeEnabled();
      await use({fixtures});
    }finally{
      const logfile=info.outputPath('isolated-server.log');
      fs.writeFileSync(logfile,logs.join(''));
      await info.attach('isolated-server-log',{path:logfile,contentType:'text/plain'});
      if(child.exitCode===null&&child.signalCode===null){
        await new Promise(resolve=>{
          const t=setTimeout(()=>child.kill('SIGKILL'),5000);
          child.once('exit',()=>{clearTimeout(t);resolve()});
          child.kill('SIGTERM');
        });
      }
      fs.rmSync(root,{recursive:true,force:true});
    }
  }
});
async function ensureOpen(page,id){
  const drawer=page.locator(id);
  if(!await drawer.evaluate(el=>el.open))await drawer.locator('summary').click();
}
async function ensureClosed(page,id){
  const drawer=page.locator(id);
  if(await drawer.evaluate(el=>el.open))await drawer.locator('summary').click();
}
async function seed(page,app){
  await ensureOpen(page,'#uiProjectDetails');
  await page.locator('#pilotNewWorkspace').click();
  await page.locator('#toggleItemIntake').click();
  await page.locator('#importFile').setInputFiles(path.join(app.fixtures,'items12.xlsx'));
  await expect(page.locator('#confirmImportRows')).toBeEnabled();
  await page.locator('#confirmImportRows').click();
  await expect(page.locator('#itemCount')).toContainText('12');
  await ensureOpen(page,'#uiSupplierTools');
  await page.locator('#pilotSupplierExcel').setInputFiles(path.join(app.fixtures,'suppliers.xlsx'));
  await expect(page.locator('#pilotImportSupplierConfirm')).toBeEnabled();
  await page.locator('#pilotImportSupplierConfirm').click();
  await expect.poll(async()=>page.evaluate(()=>window.SRMPilot.snapshot().state.suppliers.length)).toBe(2);
  await ensureClosed(page,'#uiSupplierTools');
  await ensureClosed(page,'#uiProjectDetails');
}
async function snapshotFile(page,info,label){
  const f=info.outputPath('explore-'+label+'.png');
  await page.screenshot({path:f,fullPage:true});
  await info.attach('explore-'+label,{path:f,contentType:'image/png'});
}
const stages=[
  ['items','#items'],
  ['assign','#assign'],
  ['quoteImport','#quoteImport'],
  ['quotes','#quotes'],
  ['settings','#settings']
];
for(const size of [{width:1024,height:768},{width:1366,height:768},{width:1600,height:900}]){
test('EXPLORATORY: desktop stages, control visibility and geometry '+size.width+'x'+size.height,async({page,app},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize(size);
  await seed(page,app);
  const measurements=[];
  for(const [stage,selector] of stages){
    await page.locator('.srm-v2-sideitem[data-srm-v2-tab="'+stage+'"]').click();
    await expect(page.locator(selector)).toHaveClass(/active/);
    await expect(page.locator('.srm-v2-sideitem[data-srm-v2-tab="'+stage+'"]')).toHaveAttribute('aria-current','page');
    await page.evaluate(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
    await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0);
    const m=await page.evaluate(({stage,selector})=>{
      const visible=el=>!!(el&&el.getClientRects().length);
      const rect=el=>el?(()=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}})():null;
      const sidebar=document.querySelector('.srm-v2-sidebar');
      const content=document.querySelector('.app');
      const panel=document.querySelector(selector);
      const table=panel.querySelector('.tablewrap table');
      const tablewrap=table?.closest('.tablewrap');
      const actionable=[...panel.querySelectorAll('button:not(:disabled),input,select')].filter(visible);
      // 中文：位于可横向滚动的数据表格中的控件是允许的，不将其误判成整页裁切。
      // English: Actions inside intentionally horizontally scrollable tables are reachable by local scrolling.
      const inScrollableTable=el=>el.closest('.tablewrap');
      const outOfViewport=actionable.filter(el=>{
        if(inScrollableTable(el))return false;
        const b=el.getBoundingClientRect();
        return b.width===0||b.height===0||b.right>innerWidth+2||b.left<-2;
      }).map(el=>el.id||el.textContent?.trim().slice(0,24)).slice(0,25);
      return{
        stage,width:innerWidth,height:innerHeight,scrollY:window.scrollY,
        documentWidth:document.documentElement.scrollWidth,
        sidebar:rect(sidebar),app:rect(content),appContentLeft:content.getBoundingClientRect().x+parseFloat(getComputedStyle(content).paddingLeft),panel:rect(panel),
        table:rect(table),tablewrap:rect(tablewrap),
        tableScrollable:!!tablewrap&&tablewrap.scrollWidth>tablewrap.clientWidth+2,
        panelButtons:actionable.length,
        hiddenOffscreenControls:outOfViewport,
        saveMessage:document.getElementById('srmV2LiveStatus')?.textContent?.trim()
      };
    },{stage,selector});
    measurements.push(m);
    console.log('SRM_V2_EXPLORE_METRIC='+JSON.stringify(m));
    expect(m.documentWidth,'No whole-page horizontal overflow for '+stage).toBeLessThanOrEqual(size.width+2);
    expect(m.appContentLeft,'Visible main content must not be under sidebar').toBeGreaterThanOrEqual(m.sidebar.right-1);
    expect(m.panel.width,'A substantial content workspace must remain').toBeGreaterThan(420);
    expect(m.panelButtons,'Functional controls must remain mounted').toBeGreaterThan(0);
    expect(m.hiddenOffscreenControls,'No visible action should be horizontally clipped').toEqual([]);
    await snapshotFile(page,info,size.width+'-'+stage);
  }
  // 中文：键盘 Enter 应复用原导航业务处理器，焦点态必须可见。
  // English: Keyboard Enter delegates to the original stage handler with visible focus styling.
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="items"]').focus();
  await expect(page.locator('.srm-v2-sideitem[data-srm-v2-tab="items"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#items')).toHaveClass(/active/);
  const outline=await page.locator('.srm-v2-sideitem[data-srm-v2-tab="items"]').evaluate(el=>getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe('none');
  // 中文：项目/备份入口应打开原有工具抽屉，不能隐藏业务入口。
  // English: Project and backup sidebar actions must reveal original management controls.
  await page.locator('[data-srm-v2-action="project"]').click();
  await expect(page.locator('#uiProjectDetails')).toHaveAttribute('open','');
  await page.locator('[data-srm-v2-action="admin"]').click();
  await expect(page.locator('#uiDataTools')).toHaveAttribute('open','');
  expect(errors).toEqual([]);
  const report=info.outputPath('exploratory-layout-'+size.width+'.json');
  fs.writeFileSync(report,JSON.stringify({viewport:size,measurements,errors},null,2));
  await info.attach('metrics-'+size.width,{path:report,contentType:'application/json'});
});
}
