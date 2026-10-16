await p.getByRole('tab',{name:'③ 报价回收',exact:true}).click();await p.locator('#quoteImportSupplier').selectOption({label:'虚构模板甲 (TPL-A)'});
for(const file of ['quote-code-only-ambiguous.xlsx','quotes-wrong-headers.xlsx','corrupt.xlsx']){
 await p.locator('#quoteImportFile').setInputFiles('/tmp/srm-pr18-fixtures/'+file);await p.waitForTimeout(300);
 await tell('quote negative '+file,{fileFeedback:await p.locator('#quoteFileFeedback').innerText(),preview:await p.locator('#quoteImportPreviewBody').innerText(),actualRows:await p.locator('#quoteRoundBody tr button').count()});
 await p.locator('#quoteImportFile').scrollIntoViewIfNeeded();await shot('quote-negative-'+file.replace('.xlsx',''));
 const write=p.getByRole('button',{name:'写入当前报价轮次',exact:true});if(await write.isVisible()&&await write.isEnabled())await write.click();
 await check('quote invalid upload does not write '+file,await p.locator('#quoteRoundBody tr button').count(),0);
}
await p.locator('#quoteEvidenceType').selectOption('manual_other');await p.locator('#quoteEvidenceNote').fill('虚构甲从本轮实际下载的通用报价模板回填');await p.locator('#quoteTermsNote').fill('虚构本轮M16报价、M20不供货');
await p.locator('#quoteImportFile').setInputFiles('/tmp/srm-pr18-fixtures/A-quotes-filled.xlsx');await p.waitForTimeout(300);await p.locator('#quoteImportPreviewBody').scrollIntoViewIfNeeded();await shot('13-A-real-template-normal-cannot-preview');await tell('A actual quote template preview',await p.locator('#quoteImportPreviewBody').innerText());
await p.getByRole('button',{name:'写入当前报价轮次',exact:true}).click();await p.getByRole('button',{name:'确认本次提交',exact:true}).click();await saveUI();await p.locator('#quoteRoundBody').scrollIntoViewIfNeeded();await shot('14-A-confirmed-normal-cannot');
await p.getByRole('tab',{name:'④ 比价议价',exact:true}).click();await p.locator('#quoteTable').scrollIntoViewIfNeeded();await shot('15-F3-comparison-status-and-prices');await tell('actual comparison after template quotes',await p.locator('#quoteTable tbody tr').allTextContents());await exportBiz('main-final-business.xlsx');
