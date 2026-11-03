// 中文：UI V2 第一批必须通过真实 M1-Lite + SQLite 服务验证，不使用静态假页面。
// English: Verify UI V2 batch one against real M1-Lite server/SQLite, never a mock HTML page.
const { test, expect } = require('@playwright/test');
const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// 中文：使用独立端口与临时数据库，确保不接触用户正式 SRM 数据。
// English: A separate port and temporary database isolate tests from any real user data.
const baseURL = 'http://127.0.0.1:8785';
const e2eRoot = __dirname;
const uiTest = test.extend({
  app: async ({ page }, use, info) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'srm-ui-v2-'));
    const fixtures = path.join(root, 'fixtures');
    execFileSync('python', [path.join(e2eRoot, 'fixtures.py'), fixtures]);
    const child = spawn('python', [path.join(e2eRoot, 'serve.py'), '8785'], {
      env: {...process.env, SRM_DATA_DIR: path.join(root, 'data'), PYTHONUNBUFFERED: '1'},
      stdio: ['ignore','pipe','pipe'],
    });
    page.on('dialog', dialog => dialog.accept());
    const logs = [];
    child.stdout.on('data', x => logs.push(x.toString()));
    child.stderr.on('data', x => logs.push(x.toString()));
    try {
      await expect.poll(async () => {
        try { return (await page.request.get(baseURL+'/api/health')).status(); }
        catch { return 0; }
      }, { timeout: 30000 }).toBe(200);
      await page.goto(baseURL, { waitUntil:'load' });
      await expect(page.locator('#pilotNewWorkspace')).toBeEnabled();
      await use({root,fixtures});
    } finally {
      const logPath=info.outputPath('ui-v2-server.log');
      fs.writeFileSync(logPath,logs.join(''));
      await info.attach('ui-v2-server-log',{path:logPath,contentType:'text/plain'});
      if(child.exitCode===null&&child.signalCode===null){
        await new Promise(resolve=>{
          const timer=setTimeout(()=>child.kill('SIGKILL'),5000);
          child.once('exit',()=>{clearTimeout(timer);resolve()});
          child.kill('SIGTERM');
        });
      }
      fs.rmSync(root,{recursive:true,force:true});
    }
  },
});

// 中文：四步真实导航复用原 data-tab，保证新侧边栏不改变业务面板逻辑。
// English: Sidebar must delegate to pre-existing data-tab handlers.
for (const viewport of [{width:1366,height:768},{width:1600,height:900}]) {
  uiTest('UI V2 B1 real workspace and visual layout '+viewport.width+'x'+viewport.height, async ({page,app},info)=>{
    const jsErrors=[];
    page.on('pageerror', err=>jsErrors.push(err.message));
    await page.setViewportSize(viewport);
    await expect(page.locator('body')).toHaveClass(/srm-v2/);
    await expect(page.locator('.srm-v2-sidebar')).toBeVisible();
    await expect(page.locator('.srm-v2-sideitem[data-srm-v2-tab]')).toHaveCount(6);
    await expect(page.locator('#pilotModeBadge')).toContainText('演示');
    const selectors=[
      ['assign','#assign'],
      ['quoteImport','#quoteImport'],
      ['quotes','#quotes'],
      ['items','#items'],
    ];
    for(const [tab,selector] of selectors){
      await page.locator('.srm-v2-sideitem[data-srm-v2-tab="'+tab+'"]').click();
      await expect(page.locator(selector)).toHaveClass(/active/);
      await expect(page.locator('.srm-v2-sideitem[data-srm-v2-tab="'+tab+'"]')).toHaveAttribute('aria-current','page');
      await expect(page.locator('.ui-workNav .tab[data-tab="'+tab+'"]')).toHaveClass(/active/);
    }

    // 中文：新建和导入真实虚构工作区，不能把视觉演示当作完成。
    // English: Create a genuine isolated workspace and import synthetic XLSX through the real UI.
    // 中文：只在未展开时打开项目操作，避免反向折叠已展开的面板。
    // English: Open only when collapsed, never close the already-open project action drawer.
    await page.locator('.ui-workNav .tab[data-tab="project"]').click();
    await expect(page.locator('#uiProjectDetails')).toHaveAttribute('open','');
    await expect(page.locator('#pilotNewWorkspace')).toBeVisible();
    await page.locator('#pilotNewWorkspace').click();
    await expect(page.locator('#pilotModeBadge')).not.toContainText('演示');
    await page.locator('.ui-workNav .tab[data-tab="items"]').click();
    // 中文：项目面板收起后，状态摘要仍然可见，详细状态节点继续保留。
    // English: After project drawer collapses, summary remains visible and detailed status IDs remain mounted.
    await expect(page.locator('#pilotSaveStatus')).toHaveCount(1);
    // 中文：只有当前 RFQ 摘要常驻显示真实保存状态；技术详情仍在原节点中。
    // English: Exactly one persistent summary stays visible; raw storage diagnostics remain mounted.
    await expect(page.locator('#srmUxWorkspaceSaveSummary')).toBeVisible();
    await expect(page.locator('#srmV2LiveStatus')).toHaveCount(0);
    await expect(page.locator('#pilotAutosaveStatus')).toHaveCount(1);
    await page.locator('#toggleItemIntake').click();
    await page.locator('#importFile').setInputFiles(path.join(app.fixtures,'items12.xlsx'));
    await expect(page.locator('#confirmImportRows')).toBeEnabled();
    await page.locator('#confirmImportRows').click();
    await expect(page.locator('#itemCount')).toContainText('12');
    await expect(page.locator('#itemBody tr').first()).toBeVisible();

    const originalIds=['itemBody','itemHead','itemPager','pilotSaveStatus','pilotAutosaveStatus','pilotAutoBackupStatus','pilotDrawingPanel','itemSearch','toggleItemIntake'];
    for(const id of originalIds)await expect(page.locator('#'+id),'original DOM hook '+id).toHaveCount(1);

    // 中文：真实前端状态必须与 SQLite 持久化结果一致。
    // English: Compare the real UI snapshot with the SQLite-backed API state.
    await expect.poll(async ()=>{
      const snap=await page.evaluate(()=>window.SRMPilot.snapshot());
      const res=await page.request.get(baseURL+'/api/workspaces/'+snap.workspaceId);
      if(!res.ok())return false;
      const stored=(await res.json()).workspace;
      return stored.revision>0 && JSON.stringify(stored.state)===JSON.stringify(snap.state);
    },{timeout:20000}).toBe(true);

    await expect(page.locator('#srmUxWorkspaceSaveSummary')).toHaveText('已保存');
    await expect(page.locator('#pilotAutosaveStatus')).toContainText(/已自动保存|已手动保存/);
    await page.locator('#itemSearch').fill('TST-001');
    await page.locator('#runItemSearch').click();
    await expect(page.locator('#itemBody')).toContainText('TST-001');
    await page.locator('#clearItemSearch').click();
    await expect(page.locator('#itemCount')).toContainText('12');
    // 中文：恢复首屏原点后再测量，防止 Playwright 自动滚动导致虚假的首屏合格。
    // English: Reset to the top before measuring; auto-scroll must never mask an offscreen first row.
    await page.evaluate(() => window.scrollTo({top:0,left:0,behavior:'instant'}));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    const layout=await page.evaluate(()=>{
      const first=document.querySelector('#itemBody tr')?.getBoundingClientRect();
      const nav=document.querySelector('.srm-v2-sidebar')?.getBoundingClientRect();
      const table=document.querySelector('#items .tablewrap')?.getBoundingClientRect();
      return{
        viewport:{width:innerWidth,height:innerHeight},
        documentWidth:document.documentElement.scrollWidth,
        scrollY:window.scrollY,
        sidebar:{width:nav?.width,height:nav?.height},
        tableTop:table?.top,firstRowTop:first?.top,firstRowBottom:first?.bottom,
        bodyFont:getComputedStyle(document.body).fontSize,
        tableFont:getComputedStyle(document.querySelector('#items .table')).fontSize,
      };
    });
    console.log('SRM_UI_V2_B1_METRIC='+JSON.stringify(layout));
    expect(layout.scrollY).toBe(0);
    expect(layout.documentWidth).toBeLessThanOrEqual(viewport.width+2);
    expect(layout.firstRowTop).toBeLessThan(viewport.height);
    expect(layout.firstRowBottom).toBeLessThanOrEqual(viewport.height);
    expect(layout.bodyFont).toBe('14.5px');

    const file=info.outputPath('srm-ui-v2-b1-'+viewport.width+'x'+viewport.height+'-items.png');
    await page.screenshot({path:file,fullPage:true});
    await info.attach('SRM-V2-B1-'+viewport.width+'-items',{path:file,contentType:'image/png'});

    // 中文：确认真实标签导航仍可操作，并且回到物料页后记录未丢失。
    // English: Existing real navigation must remain functional and must not erase imported data.
    await page.locator('[data-tab="assign"]').click();
    await expect(page.locator('#assign')).toHaveClass(/active/);
    await page.locator('.srm-v2-sideitem[data-srm-v2-tab="items"]').click();
    await expect(page.locator('#itemCount')).toContainText('12');
    expect(jsErrors).toEqual([]);
  });
}
