global.ensureOpen=async(id,page=p)=>{if(!await page.locator(id).evaluate(e=>e.open))await page.locator(id+' summary').click()};
global.saveUI=async(page=p)=>{await ensureOpen('#uiProjectDetails',page);await page.getByRole('button',{name:'保存到本机',exact:true}).click();await page.waitForFunction(()=>document.getElementById('pilotSaveStatus')?.textContent.startsWith('SQLite 手动保存成功'))};
global.exportBiz=async(name,page=p)=>{await saveUI(page);await ensureOpen('#uiDataTools',page);await download(name,page.getByRole('button',{name:'导出业务数据 Excel（3 Sheet）',exact:true}),page)};
global.templates=[['materials','下载询价物料模板 .xlsx','xlsx'],['suppliers','下载供应商模板 .xlsx','xlsx'],['quotes','下载供应商报价模板 .xlsx','xlsx'],['update','下载匹配更新模板 .csv','csv']];
global.demoBefore=await p.locator('#itemBody tr').allTextContents();
for(const [name,label,ext] of templates)await download('demo-'+name+'.'+ext,p.getByRole('button',{name:label,exact:true}));
await check('demo download preserves displayed material rows',await p.locator('#itemBody tr').allTextContents(),demoBefore);
await shot('02-demo-download-feedback');
