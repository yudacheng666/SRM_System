// 中文：真实 Chromium 原型烟雾验收及不同分辨率截图，全部为虚构数据。
// English: Real Chromium walkthrough and screenshots with fictional data only.
const {test,expect}=require('@playwright/test');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
const screens=[
  {width:1366,height:768,name:'1366x768-laptop'},
  {width:1600,height:900,name:'1600x900-desktop'},
  {width:1024,height:768,name:'1024x768-compact'}
];
test('UI V3: guided buyer walkthrough and business state / 独立场景',async({page},testInfo)=>{
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto(url);
  await expect(page.locator('#compare h1')).toContainText('比价与议价');
  await expect(page.locator('[data-view="compare"]')).toHaveAttribute('aria-current','page');
  await expect(page.locator('#analysisInsight')).toContainText('并列最低');
  await expect(page.locator('#compareBody')).toContainText('并列最低');
  await page.screenshot({path:testInfo.outputPath('00-initial-comparison.png'),fullPage:true});

  // 中文：用户不必自行准备数据；一键切换到报价修订并强调变化行。
  // English: A reviewer can launch a prepared quote revision in one click.
  await page.locator('#guidedTour').click();
  await expect(page.locator('#modal')).toBeVisible();
  await page.locator('[data-guide="revision"]').click();
  await expect(page.locator('#quotes')).toBeVisible();
  await expect(page.locator('#quoteVersion')).toHaveValue('SUP-A|1|2');
  await expect(page.locator('#quoteBody')).toContainText('已调整');
  await expect(page.locator('#quoteVersionStatus')).toContainText('草稿');
  await page.screenshot({path:testInfo.outputPath('01-quote-revision.png'),fullPage:true});
  await page.locator('#confirmVersion').click();
  await expect(page.locator('#modal')).toContainText('确认并锁定');
  await page.locator('#modalFooter .btn-primary').click();
  await expect(page.locator('#quoteVersionStatus')).toContainText('已确认');
  await expect(page.locator('#confirmVersion')).toBeDisabled();

  // 中文：跨页分配预选 4 项，可追加且不覆盖既有供应商。
  // English: Multi-page selection remains visible after navigating to another page.
  await page.locator('#guidedTour').click();
  await page.locator('[data-guide="allocation"]').click();
  await expect(page.locator('#assign')).toBeVisible();
  await expect(page.locator('#selectedCount')).toContainText('已选 4 项');
  await expect(page.locator('#pageNo')).toContainText('2 / 2');
  await expect(page.locator('#bulkLink')).toBeEnabled();
  await page.locator('#bulkLink').click();
  await page.screenshot({path:testInfo.outputPath('02-supplier-allocation.png'),fullPage:true});
  await page.locator('[data-density="comfortable"]').click();
  await expect(page.locator('body')).toHaveClass(/density-comfortable/);
  await page.locator('[data-density="compact"]').click();

  // 中文：并列最低必须人工选择并写理由，不能靠供应商顺序直接成交。
  // English: Tie awards require manual selection plus non-empty reason.
  await page.locator('#guidedTour').click();
  await page.locator('[data-guide="tie"]').click();
  await expect(page.locator('#compare')).toBeVisible();
  await expect(page.locator('#compareBody')).toContainText('并列最低');
  const tied=page.locator('#compareBody [data-award]').first();await tied.click();
  await expect(page.locator('#modal')).toContainText('存在并列最低价');
  await page.locator('#modalFooter .btn-primary').click();
  await expect(page.locator('#awardError')).toContainText('理由');
  await page.locator('#awardSupplier').selectOption('SUP-B');
  await page.locator('#awardReason').fill('并列最低，交付能力经人工确认');
  await page.locator('#modalFooter .btn-primary').click();
  await expect(page.locator('#compareBody')).toContainText('已选定');
  await page.screenshot({path:testInfo.outputPath('03-awarded-tie.png'),fullPage:true});
  expect(errors).toEqual([]);
});
for(const screen of screens){
  test('UI V3: '+screen.name+' visual capture / 响应布局',async({page},testInfo)=>{
    const errors=[];page.on('pageerror',err=>errors.push(err.message));
    await page.setViewportSize({width:screen.width,height:screen.height});
    await page.goto(url);
    for(const [tab,name] of [['compare','comparison'],['assign','allocation'],['quotes','quotation']]){
      await page.locator('[data-view="'+tab+'"]').click();
      await expect(page.locator('#'+tab)).toBeVisible();
      const table=page.locator('#'+tab+' .data-table').first();
      await expect(table).toBeVisible();
      const box=await table.boundingBox();
      expect(box.width).toBeGreaterThan(450);
      await page.screenshot({path:testInfo.outputPath(screen.name+'-'+name+'.png'),fullPage:true});
    }
    expect(errors).toEqual([]);
  });
}
