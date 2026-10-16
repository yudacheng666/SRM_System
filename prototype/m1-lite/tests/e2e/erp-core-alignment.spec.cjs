// 中文：ERP 核心字段映射、原始列保留、同码不同规格保护及 XLSX 往返，全部使用隔离虚构数据。
// English: End-to-end ERP mapping, bounded raw data, collision-safe RFQ lines and XLSX roundtrips.
const {test:base,expect}=require('@playwright/test');
const {spawn,execFileSync}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const PORT=8792,URL='http://127.0.0.1:'+PORT;
const test=base.extend({
 app:async({page},use,info)=>{
   const root=fs.mkdtempSync(path.join(os.tmpdir(),'srm-erp-core-'));
   const fixture=path.join(root,'fixtures');
   execFileSync('python',[path.join(__dirname,'fixtures.py'),fixture]);
   const logs=[],child=spawn('python',[path.join(__dirname,'serve.py'),String(PORT)],{
     env:{...process.env,SRM_DATA_DIR:path.join(root,'data'),PYTHONUNBUFFERED:'1'},stdio:['ignore','pipe','pipe']
   });
   child.stdout.on('data',v=>logs.push(String(v)));child.stderr.on('data',v=>logs.push(String(v)));
   page.on('dialog',d=>d.accept());
   try{
     await expect.poll(async()=>{try{return(await page.request.get(URL+'/api/health')).status()}catch{return 0}},{timeout:30000}).toBe(200);
     await page.goto(URL);
     await expect(page.locator('#pilotNewWorkspace')).toBeEnabled();
     await use({fixture});
   }finally{
     const file=info.outputPath('erp-test-server.log');fs.writeFileSync(file,logs.join(''));
     await info.attach('erp-server-log',{path:file,contentType:'text/plain'});
     if(child.exitCode===null&&child.signalCode===null){
       await new Promise(resolve=>{const t=setTimeout(()=>child.kill('SIGKILL'),5000);child.once('exit',()=>{clearTimeout(t);resolve()});child.kill('SIGTERM')});
     }
     fs.rmSync(root,{recursive:true,force:true});
   }
 }
});
const snap=page=>page.evaluate(()=>window.SRMPilot.snapshot());
async function open(page,id){const e=page.locator(id);if(!await e.evaluate(x=>x.open))await e.locator('summary').click()}
async function createBuyer(page){
  await open(page,'#uiProjectDetails');
  await page.locator('#pilotNewWorkspace').click();
  await expect(page.locator('#pilotModeBadge')).not.toContainText('演示');
  await page.locator('#toggleItemIntake').click();
}
test('ERP01: canonical aliases, optional original columns and conflicting identities are explicit',async({page,app})=>{
  const result=await page.evaluate(()=>{
    const a=parseItemRows('存货编码,存货名称,规格型号,参考编码1,参考编码2,采购常用单位,询价数量,询价单位,未映射原始列\nERP-T1,虚构螺母,M16,REF-1,REF-2,盒,12,件,ERP值');
    const b=parseItemRows('存货编码,物料编码,存货名称,询价数量,询价单位\nA,B,虚构,1,件');
    const old=parseItemRows('物料编码,物料名称,规格,数量,单位\nLEG-T1,虚构件,旧规格,2,套');
    return {item:a[0],errors:b[0]._errors,legacy:old[0]};
  });
  expect(result.item.id).toBe('ERP-T1');
  expect(result.item.spec).toBe('M16');
  expect(result.item.ref1).toBe('REF-1');
  expect(result.item.ref2).toBe('REF-2');
  expect(result.item.purchaseUnit).toBe('盒');
  expect(result.item.unit).toBe('件'); // No implicit unit substitution.
  expect(result.item.erpExtra['未映射原始列']).toBe('ERP值');
  expect(result.errors.join(' ')).toContain('存货编码');
  expect(result.legacy.spec).toBe('旧规格');
});
test('ERP02: real XLSX keeps metadata, separates same code with different specs, and survives SQLite refresh',async({page,app},info)=>{
  await page.setViewportSize({width:1366,height:768});
  await createBuyer(page);
  await page.locator('#importFile').setInputFiles(path.join(app.fixture,'erp_items.xlsx'));
  await expect(page.locator('#confirmImportRows')).toBeEnabled();
  await expect(page.locator('#importPreview')).toContainText('规格型号');
  await expect(page.locator('#importPreview')).toContainText('ERP 原始字段');
  await expect(page.locator('#importPreview')).toContainText('规格型号不一致');
  await page.locator('#confirmImportRows').click();
  await expect(page.locator('#itemCount')).toContainText('3');
  let data=await snap(page);
  expect(data.state.items.map(i=>i.id)).toEqual(['ERP-A1','ERP-A1','ERP-B2']);
  expect(data.state.items.map(i=>i.spec)).toEqual(['120W','220W','M16']);
  expect(data.state.items[0].erpExtra['ERP批次属性']).toBe('内部批次A');
  expect(new Set(data.state.items.map(i=>i.lineId)).size).toBe(3);
  // 中文：等待真实 SQLite 回执，不以浏览器内存存在当作保存成功。
  // English: Assert database commit, not merely in-memory UI state.
  await expect.poll(async()=>{
    const ws=await snap(page),res=await page.request.get(URL+'/api/workspaces/'+ws.workspaceId);
    if(!res.ok())return false;
    const saved=(await res.json()).workspace;
    return saved.revision>0&&saved.state.items.length===3&&JSON.stringify(saved.state)===JSON.stringify(ws.state);
  },{timeout:30000}).toBe(true);
  await page.reload();
  await expect.poll(async()=>(await snap(page)).state.items.length).toBe(3);
  data=await snap(page);
  expect(data.state.items[1].spec).toBe('220W');
  expect(data.state.items[2].erpExtra['ERP批次属性']).toBe('内部批次B');
  const screenshot=info.outputPath('erp-items.png');
  await page.screenshot({path:screenshot,fullPage:true});
  await info.attach('erp-items',{path:screenshot,contentType:'image/png'});
});
test('ERP03: equal specifications merge quantity; conflicting canonical and alias header blocks commit',async({page,app})=>{
  await createBuyer(page);
  await page.locator('#pasteItems').fill(
    '存货编码,存货名称,规格型号,参考编码1,询价数量,询价单位,ERP批次属性\n'+
    'ERP-C3,虚构传动轴,20x30,OLD-C,2,件,工艺A\n'+
    'ERP-C3,虚构传动轴,20x30,OLD-C,3,件,工艺A');
  await page.locator('#parsePaste').click();
  await expect(page.locator('#importPreview')).toContainText('自动合并 1 行');
  await page.locator('#confirmImportRows').click();
  let data=await snap(page);
  expect(data.state.items).toHaveLength(1);
  expect(data.state.items[0].qty).toBe(5);
  expect(data.state.items[0].sources.length).toBe(2);
  await page.locator('#toggleItemIntake').click();
  await page.locator('#importFile').setInputFiles(path.join(app.fixture,'erp_alias_conflict.xlsx'));
  await expect(page.locator('#confirmImportRows')).toBeDisabled();
  await expect(page.locator('#importPreview')).toContainText('多个表头值不一致');
  data=await snap(page);
  expect(data.state.items).toHaveLength(1);
});

test('ERP05: wide 220-column ERP source survives native XLSX importer and remains internal metadata',async({page,app})=>{
  await createBuyer(page);
  // 中文：从页面原生 XLSX 生成器生成 229 列虚构源数据，验证超出原 80 列上限的正式导入。
  // English: Generate a synthetic 229-column XLSX with the same native workbook layout.
  const base=['存货编码','存货名称','规格型号','所属类别','询价数量','询价单位','参考编码1','参考编码2','采购常用单位'];
  const extra=Array.from({length:220},(_,i)=>'ERP原始字段'+String(i+1).padStart(3,'0'));
  const values=await page.evaluate(({base,extra})=>new Promise(async(resolve,reject)=>{
    try{
      const headers=[...base,...extra],row=['ERP-WIDE','虚构宽表部件','S1','测试类别','5','件','RC1','RC2','件',...extra.map((_,i)=>'E'+i)];
      const blob=SRMExcel.create([{name:'ERP宽表',rows:[headers,row]}]);
      resolve(Array.from(new Uint8Array(await blob.arrayBuffer())));
    }catch(e){reject(e.message)}
  }),{base,extra});
  await page.locator('#importFile').setInputFiles({name:'erp-229cols.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(values)});
  await expect(page.locator('#confirmImportRows')).toBeEnabled();
  await expect(page.locator('#importPreview')).toContainText('220 项');
  await page.locator('#confirmImportRows').click();
  const current=await snap(page);
  expect(current.state.items).toHaveLength(1);
  expect(Object.keys(current.state.items[0].erpExtra)).toHaveLength(220);
  expect(current.state.items[0].erpExtra.ERP原始字段220).toBe('E219');
});

test('ERP04: new ERP fields are searchable/editable, internal-vs-supplier export boundaries hold',async({page,app})=>{
  await createBuyer(page);
  await page.locator('#importFile').setInputFiles(path.join(app.fixture,'erp_items.xlsx'));
  await expect(page.locator('#confirmImportRows')).toBeEnabled();
  await page.locator('#confirmImportRows').click();
  await page.locator('#itemSearch').fill('OLD-B');
  await page.locator('#runItemSearch').click();
  await expect(page.locator('#itemCount')).toContainText('1 项');
  await expect(page.locator('#itemBody')).toContainText('ERP-B2');
  await page.locator('#clearItemSearch').click();
  const third=page.locator('#itemBody tr[data-edit-line]').filter({hasText:'ERP-B2'});
  await third.dblclick();
  await expect(page.locator('#itemEditSpec')).toHaveValue('M16');
  await expect(page.locator('#itemEditErpExtra')).toBeVisible();
  await expect(page.locator('#itemEditErpExtraPreview')).toContainText('内部批次B');
  await page.locator('#itemEditSpec').fill('M18');
  await page.locator('#itemEditSave').click();
  await expect.poll(async()=>{const ws=await snap(page);return ws.state.items.find(it=>it.id==='ERP-B2')?.spec}).toBe('M18');
  await open(page,'#uiSupplierTools');
  await page.locator('#pilotSupplierExcel').setInputFiles(path.join(app.fixture,'suppliers.xlsx'));
  await expect(page.locator('#pilotImportSupplierConfirm')).toBeEnabled();
  await page.locator('#pilotImportSupplierConfirm').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="assign"]').click();
  await page.locator('#selectAssignAll').click();
  await page.locator('[data-add="SUP-A"]').click();
  await page.locator('[data-add="SUP-B"]').click();
  const reports=await page.evaluate(()=>{
    const w=window.SRMPilot.snapshot();
    return {rfq:window.SRMReports.rfq(w,'SUP-A'),
      internal:window.SRMReports.comparison(w,['SUP-A','SUP-B'])};
  });
  const rfqHeaders=reports.rfq.sheets[0].rows[0];
  expect(rfqHeaders).toContain('规格型号');
  expect(rfqHeaders).not.toContain('参考编码1');
  expect(rfqHeaders).not.toContain('ERP批次属性');
  const specIndex=rfqHeaders.indexOf('规格型号');
  expect(reports.rfq.sheets[0].rows.some(row=>row[specIndex]==='M18')).toBe(true);
  expect(reports.internal.sheets[0].rows[0]).toContain('参考编码1');
  expect(reports.internal.sheets[0].rows[0]).toContain('采购常用单位');
  expect(reports.internal.sheets[1].rows[0]).toContain('规格型号');
  // 中文：物料身份字段改动绝不触发隐式单位换算或报价填值。
  // English: ERP-alignment only; no RFQ unit conversions or phantom price entries.
  const priceCol=rfqHeaders.indexOf('报价单价');
  expect(reports.rfq.sheets[0].rows.slice(1).every(row=>row[priceCol]==='')).toBe(true);
  // 中文：下载真实内部 XLSX，并重新用 SRM 原生读取器验证原始字段列仍在，而非只存在 JSON。
  // English: Verify actual internal XLSX bytes retain original extra headings, not merely the JSON snapshot.
  await expect.poll(async()=>{
    const ws=await snap(page),res=await page.request.get(URL+'/api/workspaces/'+ws.workspaceId);
    if(!res.ok())return false;
    const saved=(await res.json()).workspace;
    return saved.revision>0&&JSON.stringify(saved.state)===JSON.stringify(ws.state);
  },{timeout:30000}).toBe(true);
  await open(page,'#uiDataTools');
  await expect(page.locator('#pilotExportExcel')).toBeEnabled();
  const downloadEvent=page.waitForEvent('download');
  await page.locator('#pilotExportExcel').click();
  const downloaded=await downloadEvent;
  const bytes=fs.readFileSync(await downloaded.path());
  const internalWorkbook=await page.evaluate(async arr=>{
    // 中文：用只出现在内部物料表的 ERP 原始列识别正确工作表，避免跨表同名 RFQ 主键歧义。
    // English: Select the internal material worksheet by its exclusive ERP heading, not RFQ Line ID shared by multiple sheets.
    const wb=await SRMExcel.read(Uint8Array.from(arr).buffer,['ERP批次属性']);
    return{headers:wb.rows[0],rows:wb.rows.slice(1)};
  },Array.from(bytes));
  expect(internalWorkbook.headers).toContain('ERP批次属性');
  expect(internalWorkbook.headers).toContain('参考编码1');
  const j=internalWorkbook.headers.indexOf('ERP批次属性');
  expect(internalWorkbook.rows.some(row=>row[j]==='内部批次B')).toBe(true);

});


// PR15 F1: UI-exported material tab must remain re-importable repeatedly with unique identity headings.
test('ERP06: repeated internal XLSX export and UI import keep current/source RFQ IDs distinct',async({page,app})=>{
  await createBuyer(page);
  await page.locator('#importFile').setInputFiles(path.join(app.fixture,'erp_items.xlsx'));
  await expect(page.locator('#confirmImportRows')).toBeEnabled();
  await page.locator('#confirmImportRows').click();
  const first=await snap(page);
  expect(first.state.items).toHaveLength(3);
  const initialIds=first.state.items.map(x=>x.lineId);
  async function roundtrip(){
    await expect.poll(async()=>{
      const ws=await snap(page),res=await page.request.get(URL+'/api/workspaces/'+ws.workspaceId);
      return res.ok()&&(await res.json()).workspace.revision>0;
    }).toBe(true);
    await open(page,'#uiDataTools');
    await expect(page.locator('#pilotExportExcel')).toBeEnabled();
    const download=page.waitForEvent('download');
    await page.locator('#pilotExportExcel').click();
    const raw=fs.readFileSync(await(await download).path());
    return page.evaluate(async data=>{
      const workbook=await SRMExcel.read(Uint8Array.from(data).buffer,['ERP批次属性']);
      const headers=workbook.rows[0],rows=workbook.rows.slice(1);
      const blob=SRMExcel.create([{name:'询价物料',rows:workbook.rows}]);
      return{headers,rows,bytes:Array.from(new Uint8Array(await blob.arrayBuffer()))};
    },Array.from(raw));
  }
  let exported=await roundtrip();
  expect(exported.headers.filter(h=>h==='RFQ Line ID')).toHaveLength(1);
  expect(exported.headers).not.toContain('来源 RFQ Line ID');
  for(let i=0;i<2;i++){
    await open(page,'#uiProjectDetails');
    await page.locator('#pilotNewWorkspace').click();
    await page.locator('.srm-v2-sideitem[data-srm-v2-tab="items"]').click();
    if(!await page.locator('#itemIntake').isVisible())await page.locator('#toggleItemIntake').click();
    await page.locator('#importFile').setInputFiles({name:'roundtrip-'+i+'.xlsx',
      mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(exported.bytes)});
    await expect(page.locator('#confirmImportRows')).toBeEnabled();
    await page.locator('#confirmImportRows').click();
    const fresh=await snap(page);
    expect(fresh.state.items).toHaveLength(3);
    expect(fresh.state.items.every(it=>!!it.erpExtra['来源 RFQ Line ID'])).toBe(true);
    expect(fresh.state.items.map(it=>it.erpExtra['ERP批次属性'])).toEqual(['内部批次A','内部批次A','内部批次B']);
    exported=await roundtrip();
    expect(exported.headers.filter(h=>h==='RFQ Line ID')).toHaveLength(1);
    expect(exported.headers.filter(h=>h==='来源 RFQ Line ID')).toHaveLength(1);
    expect(new Set(exported.headers).size).toBe(exported.headers.length);
    expect(exported.rows.map(row=>row[exported.headers.indexOf('来源 RFQ Line ID')])).toEqual(initialIds);
    expect(exported.rows.map(row=>row[exported.headers.indexOf('RFQ Line ID')])).toEqual(fresh.state.items.map(it=>it.lineId));
  }
});

// PR15 F2: same-code/different-spec RFQ rows must be identifiable at every decision surface.
test('ERP07: specifications visibly distinguish drawing candidates and supplier allocation',async({page,app},info)=>{
  await page.setViewportSize({width:1024,height:768});
  await createBuyer(page);
  await page.locator('#importFile').setInputFiles(path.join(app.fixture,'erp_items.xlsx'));
  await page.locator('#confirmImportRows').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="assign"]').click();
  await expect(page.locator('#assignItemBody')).toContainText('120W');
  await expect(page.locator('#assignItemBody')).toContainText('220W');
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="items"]').click();
  if(!await page.locator('#uiDrawingTools').evaluate(x=>x.open))
    await page.locator('#uiOpenDrawings').click();
  const pdf=fs.readFileSync(path.join(app.fixture,'TST-001_A.pdf'));
  await page.locator('#pilotBatchDrawingFiles').setInputFiles({name:'ERP-A1_A.pdf',mimeType:'application/pdf',buffer:pdf});
  await page.locator('#pilotBatchDrawingAnalyze').click();
  await expect(page.locator('#pilotBatchDrawingPreview')).toContainText('120W');
  await expect(page.locator('#pilotBatchDrawingPreview')).toContainText('220W');
  const labels=await page.locator('#pilotBatchDrawingPreview option').allTextContents();
  expect(labels.some(t=>t.includes('ERP-A1')&&t.includes('120W'))).toBe(true);
  expect(labels.some(t=>t.includes('ERP-A1')&&t.includes('220W'))).toBe(true);
  const manual=await page.locator('#pilotBatchDrawingManualLine option').allTextContents();
  expect(manual.some(t=>t.includes('120W'))).toBe(true);
  expect(manual.some(t=>t.includes('220W'))).toBe(true);
  const shot=info.outputPath('pr15-spec-decisions-1024.png');
  await page.screenshot({path:shot,fullPage:true});
  await info.attach('pr15-spec-decisions',{path:shot,contentType:'image/png'});
});

// PR15 F3: missing price must not flatten an explicit confirmed cannot-supply into "unquoted".
test('ERP08: confirmed cannot supply remains visible in comparison, not a zero-priced offer',async({page,app})=>{
  await createBuyer(page);
  await page.locator('#importFile').setInputFiles(path.join(app.fixture,'erp_items.xlsx'));
  await page.locator('#confirmImportRows').click();
  await open(page,'#uiSupplierTools');
  await page.locator('#pilotSupplierExcel').setInputFiles(path.join(app.fixture,'suppliers.xlsx'));
  await expect(page.locator('#pilotImportSupplierConfirm')).toBeEnabled();
  await page.locator('#pilotImportSupplierConfirm').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="assign"]').click();
  await page.locator('#selectAssignAll').click();
  await page.locator('[data-add="SUP-A"]').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quoteImport"]').click();
  await page.locator('#quoteImportSupplier').selectOption('SUP-A');
  const ids=(await snap(page)).state.items.map(it=>it.lineId);
  await page.locator('#quoteManualItem').fill(ids[0]);
  await page.locator('#quoteManualStatus').selectOption('cannot');
  await page.locator('#quoteManualPrice').fill('');
  await page.locator('#quoteManualAdd').click();
  await page.locator('#commitQuoteImport').click();
  await page.locator('#quoteManualItem').fill(ids[1]);
  await page.locator('#quoteManualStatus').selectOption('noquote');
  await page.locator('#quoteManualAdd').click();
  await page.locator('#commitQuoteImport').click();
  await expect(page.locator('#qcCannot')).toHaveText('1');
  await expect(page.locator('#qcNoquote')).toHaveText('1');
  await page.locator('#confirmQuoteRound').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quotes"]').click();
  const rows=page.locator('#quoteTable tbody tr');
  await expect(rows.nth(0)).toContainText('不供货');
  await expect(rows.nth(1)).toContainText('明确未报价');
  await expect(rows.nth(2)).toContainText('未报价');
  await expect(rows.nth(0)).not.toContainText('¥0.00');
  await expect.poll(async()=>{
    const ws=await snap(page),res=await page.request.get(URL+'/api/workspaces/'+ws.workspaceId);
    return res.ok()&&JSON.stringify((await res.json()).workspace.state)===JSON.stringify(ws.state);
  }).toBe(true);
  await page.reload();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quotes"]').click();
  await expect(page.locator('#quoteTable tbody tr').nth(0)).toContainText('不供货');
  const stored=await snap(page);
  const q=stored.state.quoteRounds.find(x=>x.supplierId==='SUP-A'&&x.status==='confirmed');
  expect(q.lines.find(x=>x.lineId===ids[0]).status).toBe('cannot');
  expect(q.lines.find(x=>x.lineId===ids[1]).status).toBe('noquote');
});


// PR16 F2-R: negotiation-scope and carry-forward options must identify same-code distinct-spec lines.
test('ERP09: second-round scope shows specification and preserves selected line identities',async({page,app},info)=>{
  await page.setViewportSize({width:1024,height:768});
  await createBuyer(page);
  await page.locator('#importFile').setInputFiles(path.join(app.fixture,'erp_items.xlsx'));
  await expect(page.locator('#confirmImportRows')).toBeEnabled();
  await page.locator('#confirmImportRows').click();
  const original=(await snap(page)).state.items;
  const m120=original.find(x=>x.id==='ERP-A1'&&x.spec==='120W');
  const m220=original.find(x=>x.id==='ERP-A1'&&x.spec==='220W');
  expect(m120?.lineId).toBeTruthy();
  expect(m220?.lineId).toBeTruthy();
  expect(m120.lineId).not.toBe(m220.lineId);
  await open(page,'#uiSupplierTools');
  await page.locator('#pilotSupplierExcel').setInputFiles(path.join(app.fixture,'suppliers.xlsx'));
  await expect(page.locator('#pilotImportSupplierConfirm')).toBeEnabled();
  await page.locator('#pilotImportSupplierConfirm').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="assign"]').click();
  await page.locator('#selectAssignAll').click();
  await page.locator('[data-add="SUP-A"]').click();
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quoteImport"]').click();
  await page.locator('#quoteImportSupplier').selectOption('SUP-A');
  // English: Use immutable line IDs for both identical-code items.
  const firstQuotes='RFQ Line ID,报价单价,交期,MOQ,报价状态\n'+
    m120.lineId+',9,3,1,正常报价\n'+m220.lineId+',11,3,1,正常报价';
  await page.locator('#quotePaste').fill(firstQuotes);
  await page.locator('#quoteParsePaste').click();
  await expect(page.locator('#commitQuoteImport')).toBeEnabled();
  await page.locator('#commitQuoteImport').click();
  await page.locator('#confirmQuoteRound').click();
  await page.locator('#newQuoteRound').click();
  await page.locator('#editRoundScope').click();
  const selector=page.locator('#quoteScopeList');
  await expect(selector).toBeVisible();
  const row120=selector.locator('label.scopeRow').filter({has:page.locator('input[data-scope-line="'+m120.lineId+'"]')});
  const row220=selector.locator('label.scopeRow').filter({has:page.locator('input[data-scope-line="'+m220.lineId+'"]')});
  await expect(row120).toContainText('规格：120W');
  await expect(row220).toContainText('规格：220W');
  await expect(row120).toContainText(m120.lineId);
  await expect(row220).toContainText(m220.lineId);
  await expect(row220.locator('[title]')).toHaveAttribute('title','规格型号：220W');
  const shot=info.outputPath('pr16-negotiation-scope-1024.png');
  await page.screenshot({path:shot,fullPage:true});
  await info.attach('pr16-negotiation-scope',{path:shot,contentType:'image/png'});
  // 只保留220W，不能误影响同编码120W的上一轮报价。
  // Keep only the 220W line in round two, without losing round-one 120W quote.
  await page.locator('#scopeClearAll').click();
  await row220.locator('input[data-scope-line]').check();
  await page.locator('#saveRoundScope').click();
  const newDraft=(await snap(page)).state.quoteRounds.find(r=>r.supplierId==='SUP-A'&&r.roundNo===2);
  expect(newDraft.expectedLineIds).toEqual([m220.lineId]);
  await page.locator('#carryForwardMissing').click();
  await expect(page.locator('#carryForwardPreview')).toContainText('规格：220W');
  await expect(page.locator('#carryForwardPreview')).not.toContainText('规格：120W');
  await page.locator('#cancelCarryPreview').click();
  const revised='RFQ Line ID,报价单价,交期,MOQ,报价状态\n'+m220.lineId+',10,4,1,正常报价';
  await page.locator('#quotePaste').fill(revised);
  await page.locator('#quoteParsePaste').click();
  await expect(page.locator('#commitQuoteImport')).toBeEnabled();
  await page.locator('#commitQuoteImport').click();
  await page.locator('#confirmQuoteRound').click();
  const saved=(await snap(page)).state.quoteRounds.filter(r=>r.supplierId==='SUP-A'&&r.status==='confirmed');
  expect(saved.find(r=>r.roundNo===1)?.lines.map(x=>x.lineId).sort()).toEqual([m120.lineId,m220.lineId].sort());
  expect(saved.find(r=>r.roundNo===2)?.lines.map(x=>x.lineId)).toEqual([m220.lineId]);
  await page.locator('.srm-v2-sideitem[data-srm-v2-tab="quotes"]').click();
  await expect(page.locator('#quoteTable')).toContainText('规格：120W');
  await expect(page.locator('#quoteTable')).toContainText('规格：220W');
  await expect(page.locator('#quoteTable')).toContainText('¥9.00');
  await expect(page.locator('#quoteTable')).toContainText('¥10.00');
});
