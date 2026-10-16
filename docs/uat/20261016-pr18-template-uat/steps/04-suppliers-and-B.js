await ensureOpen('#uiSupplierTools');
for(const file of ['supplier-duplicate-existing.xlsx','supplier-missing-required.xlsx','supplier-duplicate-file.xlsx','supplier-wrong-headers.xlsx']){
 await p.locator('#pilotSupplierExcel').setInputFiles('/tmp/srm-pr18-fixtures/'+file);await p.waitForTimeout(350);
 const enabled=await p.getByRole('button',{name:'确认导入供应商',exact:true}).isEnabled();
 await tell('supplier negative '+file,{status:await p.locator('#pilotSupplierExcelStatus').innerText(),preview:await p.locator('#pilotSupplierExcelPreview').textContent(),canConfirm:enabled});
 if(enabled){await p.getByRole('button',{name:'确认导入供应商',exact:true}).click();await p.waitForTimeout(250);await tell('supplier negative confirmed result '+file,await p.locator('#pilotSupplierExcelStatus').innerText());}
 await p.locator('#pilotSupplierExcelStatus').scrollIntoViewIfNeeded();await shot('supplier-negative-'+file.replace('.xlsx',''));
}
await p.getByRole('tab',{name:'② 供应商与分配',exact:true}).click();await p.getByRole('button',{name:'按物料分配供应商',exact:true}).click();
for(const id of ['RFQ-L00001','RFQ-L00002'])await p.locator('#assignItemBody tr').filter({hasText:id}).getByRole('checkbox').check();
for(const i of [0,1])await p.getByRole('button',{name:'给所选物料添加此供应商',exact:true}).nth(i).click();
await saveUI();await p.getByRole('tab',{name:'③ 报价回收',exact:true}).click();await tell('actual supplier fallback options',await p.locator('#quoteImportSupplier option').allTextContents());
await p.locator('#quoteImportSupplier').selectOption({label:'虚构模板乙 (CP-TPL-B)'});await p.locator('#quoteEvidenceType').selectOption('manual_other');await p.locator('#quoteEvidenceNote').fill('虚构乙通过标准模板回填，无真实业务附件');
await p.locator('#quoteImportFile').setInputFiles('/tmp/srm-pr18-fixtures/B-quotes-filled.xlsx');await p.waitForTimeout(250);await p.locator('#quoteImportPreviewBody').scrollIntoViewIfNeeded();await shot('11-B-downloaded-quote-template-preview');await tell('B actual template preview',await p.locator('#quoteImportPreviewBody').innerText());
await p.getByRole('button',{name:'写入当前报价轮次',exact:true}).click();await p.getByRole('button',{name:'确认本次提交',exact:true}).click();await saveUI();await p.locator('#quoteRoundBody').scrollIntoViewIfNeeded();await shot('12-B-two-prices-confirmed');
