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
test('ERP01: canonical aliases, optional original columns and conflicting identities are explicit',async({page})=>{
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
});
