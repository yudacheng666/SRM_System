global.historyBefore=(await snap()).state.quoteRounds;await nav('quoteImport');await p.locator('#quoteImportSupplier').selectOption('U46-B');
await (await ready('#newQuoteRevision')).click();await p.locator('[data-srm-ux-input-mode="paste"]').click();
await p.locator('#quotePaste').fill('RFQ Line ID,报价单价,交期,MOQ,报价状态\n'+ids[1]+',83,9,1,正常报价');await p.locator('#quoteParsePaste').click();
await expect(p.locator('#quoteImportPreviewBody tr')).toHaveCount(1);await (await ready('#commitQuoteImport')).click();await (await ready('#confirmQuoteRound')).click();await saved();await nav('quotes');
await check('P2 new higher quote makes only selected L2 pending review',(await snap()).state.awardReviewIds,[ids[1]]);
await expect(p.locator('#srmUxManualAwardSummary')).toContainText('¥1815.00');await expect(p.locator('#srmUxManualAwardSummary')).toContainText('2 项');
await check('P2 confirmed prior quotes immutable',(await snap()).state.quoteRounds.slice(0,historyBefore.length),historyBefore);
await p.locator('#srmUxManualAwardSummary').scrollIntoViewIfNeeded();await shot('P2-excludes-pending-review-1815-2-lines');
await p.reload();await saved();await nav('quotes');await expect(p.locator('#srmUxManualAwardSummary')).toContainText('¥1815.00');log('case-complete',{id:'P2-04',status:'PASS'});
