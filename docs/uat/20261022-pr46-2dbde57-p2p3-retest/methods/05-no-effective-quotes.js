await open('#uiProjectDetails');await (await ready('#pilotNewWorkspace')).click();await saved();global.scratchId=(await snap()).workspaceId;
await nav('items');if(!await p.locator('#itemIntake').isVisible())await p.locator('#toggleItemIntake').click();
await p.locator('#importFile').setInputFiles('/tmp/pr46-retest/fixtures/independent-items.xlsx');await ready('#confirmImportRows');await expect(p.locator('#importPreview tbody tr')).toHaveCount(12);await p.locator('#confirmImportRows').click();await saved();await nav('quotes');
await check('P2 real twelve materials without valid quotation',(await snap()).state.items.length===12&&(await snap()).state.quoteRounds.length===0,true);
await expect(p.locator('#srmUxManualAwardSummary')).toContainText('尚无人工确认的有效定标（0 项');
await check('P2 no-bid manual aggregate never claims priced zero',!(await p.locator('#srmUxManualAwardSummary').innerText()).includes('¥0.00'),true);
await p.locator('#srmUxManualAwardSummary').scrollIntoViewIfNeeded();await shot('P2-no-effective-quotation-zero-manual');log('case-complete',{id:'P2-05',status:'PASS'});
