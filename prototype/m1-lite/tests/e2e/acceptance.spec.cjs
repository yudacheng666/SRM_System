// 中文：业务数据只通过真实页面输入；读取 API/快照用于独立断言。
// English: Enter business data through the real UI; read API/snapshots for independent assertions.
const { test: base, expect } = require('@playwright/test');
const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const baseURL = 'http://127.0.0.1:8765';
const test = base.extend({
  app: async ({ page }, use, info) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'srm-e2e-'));
    const fixtures = path.join(root, 'fixtures');
    execFileSync('python', [path.join(__dirname, 'fixtures.py'), fixtures]);
    const processes = [], logs = [];
    async function start(port = 8765, data = path.join(root, 'source')) {
      const child = spawn('python', [path.join(__dirname, 'serve.py'), String(port)], {
        env: { ...process.env, SRM_DATA_DIR: data, PYTHONUNBUFFERED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
      processes.push(child);
      child.stdout.on('data', x => logs.push(x.toString())); child.stderr.on('data', x => logs.push(x.toString()));
      const url = `http://127.0.0.1:${port}`;
      await expect.poll(async () => { try { return (await fetch(url + '/api/health')).status; } catch { return 0; } }).toBe(200);
      return child;
    }
    async function stop(child) {
      if (child.exitCode !== null || child.signalCode !== null) return;
      await new Promise(resolve => {
        const timer=setTimeout(()=>child.kill('SIGKILL'),5000);
        child.once('exit',()=>{clearTimeout(timer);resolve();}); child.kill('SIGTERM');
      });
    }
    page.on('dialog', async dialog => await dialog.accept());
    const child = await start();
    await page.goto(baseURL); await expect(page.locator('#pilotNewWorkspace')).toBeEnabled();
    try { await use({ root, fixtures, start, stop, child }); }
    finally {
      await Promise.all(processes.map(stop));
      const log = info.outputPath('server.log'); fs.writeFileSync(log, logs.join(''));
      await info.attach('server-log', { path: log, contentType: 'text/plain' });
      fs.rmSync(root, { recursive: true, force: true });
    }
  },
});
const snapshot = page => page.evaluate(() => window.SRMPilot.snapshot());
const tab = (page, name) => page.locator(`[data-tab="${name}"]`).click();
// 中文：真实操作展开 UI V1 工具区，不以脚本强制绕过页面折叠状态。
// English: Expand new UI drawers as a buyer would, never force visibility by script.
async function openTools(page, id) {
  const details=page.locator(id);
  if (!await details.evaluate(node => node.open)) await details.locator('summary').click();
  await expect(details).toHaveAttribute('open', '');
}
async function saved(page) {
  await expect.poll(async () => {
    const current = await snapshot(page);
    const response = await page.request.get(new URL('/api/workspaces/'+current.workspaceId, page.url()).href);
    if (!response.ok()) return false;
    const stored = (await response.json()).workspace;
    return stored.revision > 0 && JSON.stringify(stored.state) === JSON.stringify(current.state);
  }).toBe(true);
}
async function openProject(page) { await openTools(page,'#uiProjectDetails'); }
async function fresh(page) { await openProject(page); await page.locator('#pilotNewWorkspace').click(); await saved(page); }
async function save(page) {
  await openProject(page);
  const done=page.waitForResponse(r=>r.request().method()==='PUT'&&r.url().includes('/api/workspaces/'));
  await page.locator('#pilotSaveWorkspace').click(); expect((await done).status()).toBe(200); await saved(page);
  await expect(page.locator('#pilotAutosaveStatus')).toContainText('已手动保存第');
}
async function items(page, app, file = 'items12.xlsx', count = 12) {
  await tab(page,'items'); if (!await page.locator('#itemIntake').isVisible()) await page.locator('#toggleItemIntake').click();
  await page.locator('#importFile').setInputFiles(path.join(app.fixtures,file));
  await expect(page.locator('#confirmImportRows')).toBeEnabled(); await page.locator('#confirmImportRows').click();
  await expect.poll(async () => (await snapshot(page)).state.items.length).toBe(count);
}
async function suppliers(page, app) {
  await openTools(page,'#uiSupplierTools');
  await page.locator('#pilotSupplierExcel').setInputFiles(path.join(app.fixtures,'suppliers.xlsx'));
  await expect(page.locator('#pilotImportSupplierConfirm')).toBeEnabled(); await page.locator('#pilotImportSupplierConfirm').click();
  await expect.poll(async () => (await snapshot(page)).state.suppliers.length).toBe(2);
}
async function allocated(page, app) {
  await fresh(page); await items(page,app); await suppliers(page,app); await tab(page,'assign');
  await page.locator('#selectAssignAll').click(); await page.locator('[data-add="SUP-A"]').click();
  await page.locator('[data-add="SUP-B"]').click();
  await expect.poll(async () => (await snapshot(page)).state.assignments.filter(x => x.values.length===2).length).toBe(12);
  await save(page);
}
async function quotes(page, app) {
  await tab(page,'quoteImport'); await page.locator('#quoteImportSupplier').selectOption('SUP-A');
  await page.locator('#quoteImportFile').setInputFiles(path.join(app.fixtures,'quotes.xlsx'));
  await expect(page.locator('#quoteImportPreviewBody')).toContainText('17.25');
  await page.locator('#commitQuoteImport').click();
  await expect(page.locator('#qcQuoted')).toHaveText('2'); await expect(page.locator('#qcMissing')).toHaveText('10');
  await page.locator('#confirmQuoteRound').click();
  await expect(page.locator('#confirmQuoteRound')).toBeDisabled();
  await page.locator('#newQuoteRound').click();
  await page.locator('#quoteManualItem').fill('TST-001'); await page.locator('#quoteManualPrice').fill('15.125');
  await page.locator('#quoteManualLead').fill('5'); await page.locator('#quoteManualMoq').fill('1');
  await page.locator('#quoteManualAdd').click(); await page.locator('#commitQuoteImport').click();
  await page.locator('#confirmQuoteRound').click();
  await page.locator('#newQuoteRevision').click();
  await expect.poll(async () => (await snapshot(page)).state.quoteRounds.filter(r=>r.supplierId==='SUP-A').length).toBe(3);
  await page.locator('#quoteImportSupplier').selectOption('SUP-B');
  await page.locator('#quotePaste').fill('存货编码,报价单价,交期,MOQ,报价状态\nTST-001,16.75,6,1,正常报价\nTST-002,22.25,8,1,正常报价');
  await page.locator('#quoteParsePaste').click(); await page.locator('#commitQuoteImport').click(); await page.locator('#confirmQuoteRound').click();
  await save(page);
}
async function drawings(page,app) {
  await tab(page,'items');
  // 中文：图纸面板默认折叠，必须按采购员操作真实展开。
  // English: The drawing tools start collapsed; open them through the real UI.
  if(!await page.locator('#uiDrawingTools').evaluate(node=>node.open))
    await page.locator('#uiOpenDrawings').click();
  await page.locator('#pilotBatchDrawingFiles').setInputFiles(['TST-001_A.pdf','unmatched.pdf'].map(f=>path.join(app.fixtures,f)));
  await page.locator('#pilotBatchDrawingAnalyze').click();
  await expect(page.locator('#pilotBatchDrawingPreview')).toContainText('单候选匹配');
  const ws = await snapshot(page), target = ws.state.items.find(x=>x.id==='TST-002').lineId;
  await page.locator('[data-batch-focus="1"]').click(); await page.locator('#pilotBatchDrawingManualLine').selectOption(target);
  await page.locator('#pilotBatchDrawingManualAssign').click(); await page.locator('[data-batch-check="1"]').check();
  await page.locator('#pilotBatchDrawingConfirm').click();
  await expect.poll(async () => (await snapshot(page)).state.items.filter(x=>x.drawings?.length).length).toBe(2);
  await save(page);
}
async function download(page, selector, info, name) {
  const waiting=page.waitForEvent('download', {timeout:15000}); await page.locator(selector).click(); const file=await waiting;
  const target=info.outputPath(name); await file.saveAs(target); await info.attach(name,{path:target,contentType:'application/zip'}); return target;
}
function inspectZip(file) {
  return JSON.parse(execFileSync('python',['-c',`import zipfile,json,sys,hashlib
with zipfile.ZipFile(sys.argv[1]) as z:
 print(json.dumps({n: {'sha256':hashlib.sha256(z.read(n)).hexdigest(),'text':z.read(n).decode('utf8') if n.endswith('.xml') else ''} for n in z.namelist()}))`,file],{encoding:'utf8'}));
}

test('01 startup, demo isolation, autosave, navigation and restart / 启动与隔离', async ({page, app},info)=>{
  await expect(page.locator('#pilotModeBadge')).toContainText('演示');
  expect((await (await fetch(baseURL+'/api/workspaces')).json()).workspaces).toHaveLength(0);
  await fresh(page); const first=await snapshot(page); expect(first.state.items).toHaveLength(0);
  await items(page,app); await saved(page); const stored=await snapshot(page);
  await page.reload(); await expect(page.locator('#itemCount')).toContainText('12');
  await expect.poll(async () => (await (await fetch(baseURL+'/api/backups/auto/status')).json()).retained).toBe(1);
  const revision=(await snapshot(page)).revision;
  await page.locator('#itemSearch').fill('TST-001'); await page.locator('#runItemSearch').click();
  await tab(page,'assign'); await page.locator('#assignStateFilter').selectOption({index:1});
  await page.locator('#runAssignSearch').click(); await tab(page,'items');
  // 中文：负向断言需要跨越完整自动保存窗口。
  // English: Observe a full autosave window for the negative revision assertion.
  await page.waitForTimeout(5000); expect((await snapshot(page)).revision).toBe(revision);
  await app.stop(app.child); await app.start(); await page.reload();
  await expect(page.locator('#itemCount')).toContainText('12'); expect((await snapshot(page)).state).toEqual(stored.state);
  await page.screenshot({path:info.outputPath('startup.png'),fullPage:true}); await info.attach('startup',{path:info.outputPath('startup.png'),contentType:'image/png'});
});

test('02 XLSX 12/100, duplicates and invalid format / 物料', async ({page,app})=>{
  await fresh(page); await items(page,app); await save(page);
  // 中文：导入成功后录入面板自动收起；再次导入时从按钮重新打开。
  // English: Open the buyer intake panel for an additional import after it auto-collapses.
  await page.locator('#toggleItemIntake').click();
  await page.locator('#importFile').setInputFiles(path.join(app.fixtures,'duplicates.xlsx'));
  await expect(page.locator('#importPreview')).toContainText(/合并|冲突/);
  await page.locator('#confirmImportRows').click(); expect((await snapshot(page)).state.items).toHaveLength(12);
  await page.locator('#toggleItemIntake').click();
  await page.locator('#importFile').setInputFiles(path.join(app.fixtures,'invalid.xlsx'));
  await expect(page.locator('#confirmImportRows')).toBeDisabled(); expect((await snapshot(page)).state.items).toHaveLength(12);
  await page.locator('#importFile').setInputFiles({name:'broken.xlsx',mimeType:'application/octet-stream',buffer:Buffer.from('broken')});
  await expect(page.locator('#itemFileFeedback')).toContainText('读取失败');
  await openProject(page); await page.locator('#pilotNewWorkspace').click(); await saved(page); await items(page,app,'items100.xlsx',100); await save(page);
  await page.reload(); await expect(page.locator('#itemCount')).toContainText('100');
});

test('03 suppliers and bidirectional additive allocation / 供应商与分配', async ({page,app})=>{
  await allocated(page,app);
  await page.locator('#pilotSupplierExcel').setInputFiles(path.join(app.fixtures,'suppliers.xlsx'));
  await expect(page.locator('#pilotSupplierExcelStatus')).toContainText('重复'); await expect(page.locator('#pilotImportSupplierConfirm')).toBeDisabled();
  await page.locator('[data-rem="SUP-B"]').click();
  await expect.poll(async () => (await snapshot(page)).state.assignments.every(x=>!x.values.includes('SUP-B'))).toBe(true);
  await page.locator('[data-mode="supplierFirst"]').click(); await page.locator('[data-sf-s="SUP-B"]').click();
  await page.locator('#sfItemBody input[data-sfi]').first().check(); await save(page); const state=(await snapshot(page)).state;
  await openProject(page); await page.locator('#pilotNewWorkspace').click(); await saved(page);
  await openProject(page);
  await page.locator('#pilotHistoryWorkspace').selectOption({index:1}); await page.locator('#pilotSwitchWorkspace').click();
  await expect.poll(async () => (await snapshot(page)).state.assignments).toEqual(state.assignments);
  expect((await snapshot(page)).state.suppliers).toEqual(state.suppliers);
});

test('04 real quote imports, rounds, tiers, immutable confirmation and comparison XLSX / 报价比价', async ({page,app},info)=>{
  await allocated(page,app); await quotes(page,app); const ws=await snapshot(page);
  expect(ws.state.quoteRounds.filter(r=>r.status==='confirmed')).toHaveLength(3);
  expect(ws.state.quoteRounds.find(r=>r.supplierId==='SUP-A'&&r.roundNo===1).lines).toHaveLength(2);
  await tab(page,'quotes'); await expect(page.locator('#quoteAnalysis')).toContainText('理论最低价');
  for (const box of await page.locator('#commonScopePicker input').all()) await box.check();
  await expect(page.locator('#quoteAnalysis')).toContainText('共同有效报价 1 项');
  await expect(page.locator('#quoteAnalysis')).toContainText('97.00');
  await expect(page.locator('#quoteAnalysis')).toContainText('30.25');
  await expect(page.locator('#quoteAnalysis')).toContainText('33.50');
  await saved(page);
  await openTools(page,'#uiDataTools'); await page.locator('#pilotReportOpen').click(); await page.locator('#pilotReportType').selectOption('comparison');
  for(const check of await page.locator('[data-report-supplier]').all()) await check.check();
  const file=await download(page,'#pilotReportDownload',info,'comparison.xlsx');
  const z=inspectZip(file); expect(z['[Content_Types].xml']).toBeTruthy();
  const xml=Object.values(z).map(v=>v.text).join(''); expect(xml).toContain('TST-001'); expect(xml).toContain('15.125');
  expect(xml).toContain('ROUND('); expect(xml).toContain('SUMIF(');
  const rows=JSON.parse(execFileSync('python',['-c',`import sys,zipfile,json,xml.etree.ElementTree as E
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(sys.argv[1]) as z:
 root=E.fromstring(z.read('xl/worksheets/sheet1.xml'))
 result=[]
 for row in root.findall('.//s:row',ns):
  cells={}
  for c in row:
   col=0
   for char in c.get('r'):
    if char.isalpha(): col=col*26+ord(char)-64
   cells[col-1]=''.join(c.itertext()) if c.get('t')=='inlineStr' else c.findtext('s:v',default='',namespaces=ns)
  result.append([cells.get(i,'') for i in range(max(cells,default=-1)+1)])
 width=len(result[0]);print(json.dumps([r+['']*(width-len(r)) for r in result]))`,file],{encoding:'utf8'}));
  const header=rows[0], qty=header.indexOf('询价数量'), a=header.findIndex(x=>x.includes('SUP-A')&&x.includes('适用单价')), b=header.findIndex(x=>x.includes('SUP-B')&&x.includes('适用单价'));
  expect(qty).toBeGreaterThanOrEqual(0); expect(a).toBeGreaterThanOrEqual(0); expect(b).toBeGreaterThanOrEqual(0);
  const common=rows.slice(1,-1).filter(row=>row[a]!==''&&row[b]!==''); expect(common).toHaveLength(1);
  expect(common.reduce((sum,row)=>sum+Math.round(Number(row[qty])*Number(row[a])*100),0)).toBe(3025);
  expect(common.reduce((sum,row)=>sum+Math.round(Number(row[qty])*Number(row[b])*100),0)).toBe(3350);
  // 中文：真实 API 对已确认轮次的篡改必须拒绝，且不能产生修订。
  // English: The real API must reject tampering with confirmed rounds without a new revision.
  await saved(page); const latest=await snapshot(page);
  const changed=structuredClone(latest); changed.revision++;
  changed.state.quoteRounds.find(r=>r.status==='confirmed').lines[0].remark='tampered';
  const res=await page.evaluate(async ({changed,latest})=>{const r=await fetch('/api/workspaces/'+latest.workspaceId,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspace:changed,expectedRevision:latest.revision,expectedActive:latest.workspaceId})});return r.status;},{changed,latest});
  expect(res).toBe(400); expect((await (await fetch(baseURL+'/api/workspaces/'+latest.workspaceId)).json()).workspace.revision).toBe(latest.revision);
});

test('05 PDF matching, manual correction, refresh and scoped supplier ZIP / 图纸询价包', async ({page,app},info)=>{
  await allocated(page,app); await drawings(page,app); await page.reload();
  await expect(page.locator('#pilotModeBadge')).toContainText('正式');
  await page.locator('#itemSearch').fill('TST-001'); await page.locator('#runItemSearch').click();
  await page.locator('#itemBody [data-drawing]').filter({hasText:'PDF'}).first().click();
  await expect(page.locator('#drawingLarge iframe')).toBeVisible();
  await page.locator('#drawingNextPage').click();
  await expect(page.locator('#drawingLarge iframe')).toHaveAttribute('src', /#page=2&/);
  await page.screenshot({path:info.outputPath('pdf-preview.png')});
  await info.attach('pdf-preview',{path:info.outputPath('pdf-preview.png'),contentType:'image/png'});
  await page.locator('#closeDrawing').click();
  await tab(page,'assign'); await page.locator('#selectAssignAll').click(); await page.locator('[data-rem="SUP-B"]').click();
  await page.locator('[data-mode="supplierFirst"]').click(); await page.locator('[data-sf-s="SUP-B"]').click();
  const ws=await snapshot(page), line=ws.state.items.find(x=>x.id==='TST-002').lineId;
  await page.locator(`[data-sfi="${line}"]`).check(); await save(page);
  await openTools(page,'#uiDataTools'); await page.locator('#pilotReportOpen').click();
  const crypto=require('node:crypto');
  for(const sid of ['SUP-A','SUP-B']) {
    await page.locator('#pilotReportSupplier').selectOption(sid); const file=await download(page,'#pilotReportDownload',info,sid+'.zip'); const z=inspectZip(file);
    expect(Object.keys(z).filter(n=>n.endsWith('.xlsx'))).toHaveLength(1); expect(Object.keys(z).some(n=>n.endsWith('.json'))).toBe(false);
    const expected=sid==='SUP-A'?['TST-001_A.pdf','unmatched.pdf']:['unmatched.pdf'];
    expect(Object.keys(z).filter(n=>n.endsWith('.pdf')).map(n=>path.basename(n)).sort()).toEqual(expected.sort());
    for(const name of expected) expect(Object.values(z).some(v=>v.sha256===crypto.createHash('sha256').update(fs.readFileSync(path.join(app.fixtures,name))).digest('hex'))).toBe(true);
    const excel=Object.keys(z).find(n=>n.endsWith('.xlsx'));
    expect(excel).toContain(sid);
    const extracted=info.outputPath(sid+'.xlsx');execFileSync('python',['-c','import zipfile,sys;open(sys.argv[3],"wb").write(zipfile.ZipFile(sys.argv[1]).read(sys.argv[2]))',file,excel,extracted]);
    const xml=Object.values(inspectZip(extracted)).map(v=>v.text).join(''); expect(xml).not.toContain(sid==='SUP-A'?'SUP-B':'SUP-A');
    if(sid==='SUP-B'){expect(xml).toContain('TST-002');expect(xml).not.toContain('TST-001');}
  }
});

test('06 full backup restore: actual imported quotes, history, PDFs, overwrite refusal / 完整恢复', async ({page,app,browser},info)=>{
  await allocated(page,app); await drawings(page,app); await quotes(page,app); const ws=await snapshot(page);
  await openProject(page); await page.locator('#pilotNewWorkspace').click(); await saved(page); await save(page);
  const index=(await (await fetch(baseURL+'/api/workspaces')).json()).workspaces;
  const originals={}; for(const row of index) {const w=(await (await fetch(baseURL+'/api/workspaces/'+row.workspaceId)).json()).workspace; originals[row.workspaceId]=[];
    for(let r=1;r<=w.revision;r++) originals[row.workspaceId].push((await (await fetch(baseURL+'/api/workspaces/'+row.workspaceId+'?revision='+r)).json()).workspace);
  }
  await openTools(page,'#uiDataTools');
  const file=await download(page,'#pilotS4DownloadFull',info,'full-backup.zip'); const z=inspectZip(file); expect(z['database/srm.sqlite3']).toBeTruthy();
  await app.start(8766,path.join(app.root,'restored')); const other=await browser.newPage(); other.on('dialog',d=>d.accept());
  try {
    await other.goto('http://127.0.0.1:8766'); await expect(other.locator('#pilotNewWorkspace')).toBeEnabled();
    await openTools(other,'#uiDataTools');
    await other.locator('#pilotS4BackupFile').setInputFiles(file); await other.locator('#pilotS4RestoreFull').click();
    await expect(other.locator('#pilotModeBadge')).toContainText('正式');
    expect((await (await fetch('http://127.0.0.1:8766/api/workspaces')).json()).workspaces).toEqual(index);
    for(const [id,versions] of Object.entries(originals)) for(const w of versions) expect((await (await fetch('http://127.0.0.1:8766/api/workspaces/'+id+'?revision='+w.revision)).json()).workspace).toEqual(w);
    for(const item of ws.state.items) for(const pdf of item.drawings||[]) {
      const from=Buffer.from(await (await fetch(baseURL+'/api/assets/'+ws.workspaceId+'/'+pdf.sha256)).arrayBuffer());
      const to=Buffer.from(await (await fetch('http://127.0.0.1:8766/api/assets/'+ws.workspaceId+'/'+pdf.sha256)).arrayBuffer());expect(to).toEqual(from);
    }
    await openProject(other);
    await other.locator('#pilotHistoryWorkspace').selectOption(ws.workspaceId);await other.locator('#pilotSwitchWorkspace').click();
    await expect.poll(async()=> (await snapshot(other)).state.quoteRounds).toEqual(ws.state.quoteRounds);
    // 中文：恢复触发页面重载，数据工具区会恢复折叠；必须按真实 UI 再次展开。
    // English: Restore reloads the page and closes the drawer; reopen it through normal UI before retrying.
    await openTools(other,'#uiDataTools');
    await other.locator('#pilotS4BackupFile').setInputFiles(file);await other.locator('#pilotS4RestoreFull').click();await expect(other.locator('#pilotSaveStatus')).toContainText('禁止');
    const refusal=await other.evaluate(async()=>{const r=await fetch('/api/backups/full/restore',{method:'POST',headers:{'Content-Type':'application/zip'},body:new Uint8Array([1])});return r.status;}); expect(refusal).toBe(409);
  } finally {await other.close();}
});

test('07 real service disconnect and stale-tab 409 halt autosave / 自动保存失败', async ({page,app,browser})=>{
  await fresh(page); const stale=await browser.newPage();stale.on('dialog',d=>d.accept());
  try {
    await stale.goto(baseURL);await expect(stale.locator('#pilotModeBadge')).toContainText('正式');
    await openTools(stale,'#uiSupplierTools'); await openTools(page,'#uiSupplierTools');
    await items(page,app);await save(page);const good=await snapshot(page);
    await stale.locator('#pilotCounterpartyCode').fill('CP-STALE');await stale.locator('#pilotSupplierName').fill('虚构旧标签');await stale.locator('#pilotAddSupplier').click();
    await expect(stale.locator('#pilotAutosaveStatus')).toContainText('HTTP 409');await expect(stale.locator('#pilotAutosaveStatus')).toContainText('停止自动重试');
    expect((await (await fetch(baseURL+'/api/workspaces/'+good.workspaceId)).json()).workspace).toEqual(good);
    await app.stop(app.child);
    await page.locator('#pilotCounterpartyCode').fill('CP-OFFLINE');await page.locator('#pilotSupplierName').fill('虚构断线');await page.locator('#pilotAddSupplier').click();
    await expect(page.locator('#pilotAutosaveStatus')).toContainText('保存失败');
    await app.start();await openProject(page);await page.locator('#pilotSaveWorkspace').click();await expect(page.locator('#pilotAutosaveStatus')).toContainText('已手动保存第');
    await page.reload();await expect.poll(async()=> (await snapshot(page)).state.suppliers.length).toBe(1);
  } finally {await stale.close();}
});

test('08 bad PDF and damaged ZIP never contaminate saved data / 异常回归', async ({page,app})=>{
  await fresh(page);await items(page,app);await save(page);const good=await snapshot(page);
  await tab(page,'items'); await page.locator('#uiOpenDrawings').click();
  await page.locator('#pilotDrawingLine').focus();
  await page.locator('#pilotDrawingLine').selectOption(good.state.items[0].lineId);
  await page.locator('#pilotDrawingFiles').setInputFiles(path.join(app.fixtures,'bad.pdf'));await page.locator('#pilotDrawingUpload').click();
  await expect(page.locator('#pilotDrawingInfo')).toContainText('导入未完成');expect((await snapshot(page)).state.items).toEqual(good.state.items);
  await app.start(8766,path.join(app.root,'negative'));const other=await page.context().newPage();other.on('dialog',d=>d.accept());
  try {await other.goto('http://127.0.0.1:8766');await expect(other.locator('#pilotNewWorkspace')).toBeEnabled();
    await openTools(other,'#uiDataTools');
    await other.locator('#pilotS4BackupFile').setInputFiles(path.join(app.fixtures,'broken.zip'));await other.locator('#pilotS4RestoreFull').click();
    await expect(other.locator('#pilotSaveStatus')).toContainText('未成功');expect((await (await fetch('http://127.0.0.1:8766/api/workspaces')).json()).workspaces).toHaveLength(0);
  } finally {await other.close();}
});

test('09 UI V1 navigation, drawers and RFQ state do not mutate data / 工作台操作', async ({page, app})=>{
  // 中文：显式请求 app fixture，确保先启动真实服务并导航到页面。
  // English: Request the app fixture to start and navigate the real server before UI assertions.
  // 中文：确认四步导航与管理入口均实际可点，导航本身不能增加业务修订。
  // English: Validate real buyer navigation and drawers without altering business revisions.
  await expect(page.locator('.ui-workNav .tab')).toHaveCount(4);
  await expect(page.locator('#uiCurrentRfq')).toContainText('演示');
  await expect(page.locator('#uiDataTools')).not.toHaveAttribute('open', '');
  await fresh(page);
  const initial=(await snapshot(page)).revision;
  await expect(page.locator('#uiCurrentRfq')).toContainText('RFQ-');
  await page.locator('#uiFieldSettings').click();
  await expect(page.locator('#settings')).toBeVisible();
  await tab(page,'assign');
  await expect(page.locator('#uiOpenSupplierTools')).toBeVisible();
  await page.locator('#uiOpenSupplierTools').click();
  await expect(page.locator('#uiSupplierTools')).toHaveAttribute('open', '');
  await tab(page,'items');
  await expect(page.locator('#pilotDrawingPanel')).not.toBeVisible();
  await page.locator('#uiOpenDrawings').click();
  await expect(page.locator('#pilotDrawingPanel')).toBeVisible();
  await page.locator('#uiAdminToggle').click();
  await expect(page.locator('#uiDataTools')).toHaveAttribute('open', '');
  await page.locator('#uiProjectJump').click();
  await page.waitForTimeout(5000);
  expect((await snapshot(page)).revision).toBe(initial);
});


test('10 buyer continuous allocation to items and drawing select without reload / 跨步骤实时同步',async ({page,app})=>{
  // 中文：不允许靠 F5 掩盖跨页面未同步；测试使用真实导入和分配按钮。
  // English: Verify dependent views without F5 after real item/supplier import and allocation.
  await fresh(page);await items(page,app);await suppliers(page,app);
  await tab(page,'assign');
  const current=await snapshot(page);
  const first=current.state.items.find(it=>it.id==='TST-001');
  const second=current.state.items.find(it=>it.id==='TST-002');
  await page.locator('[data-ai="'+first.lineId+'"]').check();
  await page.locator('[data-ai="'+second.lineId+'"]').check();
  await page.locator('[data-add="SUP-A"]').click();
  await page.locator('[data-add="SUP-B"]').click();
  await tab(page,'items');
  // 中文：按字段标题定位分配数量；ERP 新增规格列不应破坏既有业务验收。
  // English: Find allocation count by semantic header, not a fragile numeric column offset.
  const itemHeaders=await page.locator('#itemHead tr').first().locator('th').allTextContents();
  const allocatedColumn=itemHeaders.findIndex(text=>text.includes('已分配供应商'));
  expect(allocatedColumn).toBeGreaterThan(0);
  await expect(page.locator('[data-edit-line="'+first.lineId+'"] td').nth(allocatedColumn)).toHaveText('2');
  await expect(page.locator('[data-edit-line="'+second.lineId+'"] td').nth(allocatedColumn)).toHaveText('2');
  await page.locator('#uiOpenDrawings').click();
  await expect(page.locator('#pilotDrawingLine option')).toHaveCount(12);
  await expect(page.locator('#pilotDrawingLine')).toBeEnabled();
});

test('11 formal RFQ identity in missing-quote CSV and working export shortcut / 单据追溯',async ({page,app},info)=>{
  // 中文：在正式 RFQ 连续操作，漏报 CSV 行及文件名绝不可沿用演示编号。
  // English: Verify real project identity in missing-quote CSV and the operative export route.
  await allocated(page,app);
  const ws=await snapshot(page);
  await page.locator('#generateBtn').click();
  await expect(page.locator('#uiDataTools')).toHaveAttribute('open','');
  await expect(page.locator('#pilotReportPanel')).toBeVisible();
  await expect(page.locator('#pilotReportType')).toHaveValue('rfq');
  await tab(page,'quoteImport');
  await page.locator('#quoteImportSupplier').selectOption('SUP-B');
  await page.locator('#quotePaste').fill('存货编码,报价单价,交期,MOQ,报价状态\nTST-001,19,5,1,正常报价');
  await page.locator('#quoteParsePaste').click();
  await page.locator('#commitQuoteImport').click();
  await expect(page.locator('#qcMissing')).toHaveText('11');
  const filePromise=page.waitForEvent('download');
  await page.locator('#exportQuoteMissing').click();
  const file=await filePromise;
  expect(file.suggestedFilename()).toContain(ws.workspaceId);
  const target=info.outputPath('missing-rfq-identity.csv');
  await file.saveAs(target);
  const data=fs.readFileSync(target,'utf8');
  expect(data).toContain(ws.workspaceId);
  expect(data).not.toContain('RFQ-DEMO-001');
  await tab(page,'quotes');
  await openTools(page,'#uiDataTools');
  if(!await page.locator('#pilotReportPanel').isVisible())await page.locator('#pilotReportOpen').click();
  await page.locator('#pilotReportType').selectOption('comparison');
  await expect(page.locator('#pilotReportDownload')).toContainText('内部比价议价单');
});


test('12 supplier status and report context reset on RFQ change / 保存提示与跨询价报告隔离',async ({page,app})=>{
  // 中文：真实 UI 导入并自动保存后，旧提示不得残留；新 RFQ 不得显示旧供应商及导出成功消息。
  // English: Confirm autosave feedback and clear stale report participants after switching RFQs.
  await fresh(page);
  await items(page,app);
  await suppliers(page,app);
  await saved(page);
  await expect(page.locator('#pilotSupplierExcelStatus')).toContainText('供应商已保存到当前询价');
  await tab(page,'assign');
  await page.locator('#selectAssignAll').click();
  await page.locator('[data-add="SUP-A"]').click();
  await saved(page);
  await openTools(page,'#uiDataTools');
  await page.locator('#pilotReportOpen').click();
  await expect(page.locator('#pilotReportSupplier option')).toHaveCount(1);
  const downloadWait=page.waitForEvent('download');
  await page.locator('#pilotReportDownload').click();
  await downloadWait;
  await expect(page.locator('#pilotReportHint')).toContainText('已发起供应商询价');
  await fresh(page);
  await expect(page.locator('#pilotReportPanel')).toBeVisible();
  await expect(page.locator('#pilotReportSupplier option')).toHaveCount(0);
  await expect(page.locator('#pilotReportSupplierGroup')).toBeEmpty();
  await expect(page.locator('#pilotReportHint')).not.toContainText('已发起');
  await expect(page.locator('#pilotSupplierExcelStatus')).toContainText('仅针对当前询价');
  await expect(page.locator('#uiProjectDetails')).not.toHaveAttribute('open','');
  await page.locator('#uiProjectJump').click();
  await expect(page.locator('#uiProjectDetails')).toHaveAttribute('open','');
});

test('13 compact laptop item table after import / 1366首屏物料可见',async ({page,app})=>{
  // 中文：按 Codex U7 复现条件检查真正首屏：回到 scrollY=0，第一行上下边均在视口内，并再次刷新。
  // English: Reproduce the reported layout failure at scrollY=0, checking the FULL row both after import and reload.
  await page.setViewportSize({width:1366,height:768});
  await fresh(page);
  await items(page,app);
  await expect(page.locator('#uiProjectDetails')).not.toHaveAttribute('open','');
  await expect(page.locator('#itemIntake')).not.toBeVisible();
  async function checkFirstRow(label) {
    await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
    await expect.poll(()=>page.evaluate(()=>window.scrollY),{message:label+' starts at page top'}).toBe(0);
    const row=page.locator('#itemBody tr').first();
    await expect(row).toContainText('TST-012');
    const geometry=await row.evaluate(el=>({
      top:el.getBoundingClientRect().top,
      bottom:el.getBoundingClientRect().bottom,
      height:window.innerHeight,
      scrollY:window.scrollY
    }));
    expect(geometry.top,label+' first item top: '+JSON.stringify(geometry)).toBeGreaterThanOrEqual(0);
    expect(geometry.bottom,label+' FULL first item must fit: '+JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.height);
  }
  await checkFirstRow('After import');
  await saved(page);
  await page.reload();
  await expect(page.locator('#uiCurrentRfq')).toContainText('RFQ-');
  await expect(page.locator('#uiProjectDetails')).not.toHaveAttribute('open','');
  await checkFirstRow('Fresh page reload');
});
