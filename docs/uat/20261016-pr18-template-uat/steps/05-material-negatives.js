global.q=await c.newPage();bind(q);await q.goto('http://127.0.0.1:8892');await q.getByRole('button',{name:'新建空白正式工作',exact:true}).click();await saveUI(q);
await q.getByRole('button',{name:'+ 添加询价物料',exact:true}).click();await q.locator('#importFile').setInputFiles('/tmp/srm-pr18-fixtures/materials-filled.xlsx');await q.getByRole('button',{name:'确认加入本次询价（全部 2 行）',exact:true}).click();await saveUI(q);await tell('negative probe baseline',await q.locator('#itemBody tr').allTextContents());
global.negativeResults=[];
for(const file of ['wrong-header.xlsx','missing-unit.xlsx','duplicate-heading.xlsx','other-sheet.xlsx','ambiguous-multisheet.xlsx','corrupt.xlsx','zero-byte.xlsx','blank-workbook.xlsx']){
 if(!await q.locator('#importFile').isVisible())await q.getByRole('button',{name:'+ 添加询价物料',exact:true}).click();
 const before=await q.locator('#itemBody tr').allTextContents();await q.locator('#importFile').setInputFiles('/tmp/srm-pr18-fixtures/'+file);await q.waitForTimeout(250);
 const btn=q.getByRole('button',{name:/确认加入本次询价/});const enabled=await btn.count()?await btn.first().isEnabled():false;
 const result={file,feedback:await q.locator('#itemFileFeedback').innerText(),canConfirm:enabled,preview:await q.locator('#itemIntake').innerText()};
 if(enabled){await btn.first().click();await q.waitForTimeout(200);}
 result.rowsAfter=await q.locator('#itemBody tr').allTextContents();result.businessRowsUnchanged=JSON.stringify(before)===JSON.stringify(result.rowsAfter);negativeResults.push(result);await tell('material negative '+file,result);await q.locator('#importFile').scrollIntoViewIfNeeded();await shot('negative-'+file.replace('.xlsx',''),q);
}
fs.writeFileSync('/tmp/srm-pr18-evidence/material-negative-results.json',JSON.stringify(negativeResults,null,2));await saveUI(q);
