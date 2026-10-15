// 中文：仅验收用户已确认的独立 UI V2 B 原型，不启动或修改正式业务程序。
// English: Verify only the accepted standalone UI V2 B concept, never start or modify the SRM application.
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// 中文：通过 file:// 打开真实的 HTML 文件，测试浏览器实际布局，而不是比对静态源码。
// English: Render the real HTML file in Chromium and inspect actual layout and interaction.
const prototypeURL = pathToFileURL(path.resolve(__dirname, '../concept-b-refined.html')).href;
const viewportCases = [{ width: 1366, height: 768 }, { width: 1600, height: 900 }];
const stages = [
  { id: 'items', label: '物料与图纸' },
  { id: 'assign', label: '供应商与分配' },
  { id: 'import', label: '报价回收' },
  { id: 'compare', label: '比价议价' },
];

// 中文：在两个目标桌面尺寸逐页截屏，确认文字、主导航、表格可见且页面不产生横向溢出。
// English: Capture each stage at both desktop sizes; verify legibility-critical regions and document overflow.
for (const viewport of viewportCases) {
  test(`B refined: real Chromium visual acceptance ${viewport.width}x${viewport.height} / 四步桌面视觉验收`, async ({ page }, testInfo) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(String(error)));
    await page.setViewportSize(viewport);
    await page.goto(prototypeURL, { waitUntil: 'load' });

    await expect(page.locator('.shell')).toBeVisible();
    await expect(page.locator('.worknav [data-step]')).toHaveCount(4);
    await expect(page.locator('.stats .stat')).toHaveCount(4);
    await expect(page.locator('#tbody tr')).toHaveCount(7);
    await expect(page.locator('.previewflag')).toContainText('静态视觉原型');

    const screenshotsDir = testInfo.outputPath('ui-v2-screens');
    fs.mkdirSync(screenshotsDir, { recursive: true });
    const report = [];

    for (let index = 0; index < stages.length; index++) {
      const stage = stages[index];
      await page.locator('.worknav [data-step]').nth(index).click();
      await expect(page.locator('.worknav [data-step]').nth(index)).toHaveClass(/active/);
      const expected = index === 0 ? page.locator('section.surface:not(.panel-screen)') : page.locator('#screen-' + stage.id);
      await expect(expected).toBeVisible();
      await expect(expected.locator('table').first()).toBeVisible();

      const layout = await page.evaluate(() => {
        const box = selector => {
          const r = document.querySelector(selector)?.getBoundingClientRect();
          if (!r) return null;
          return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), width: +r.width.toFixed(1), height: +r.height.toFixed(1), bottom: +r.bottom.toFixed(1) };
        };
        const visiblePanel = [...document.querySelectorAll('section.surface')].find(el => getComputedStyle(el).display !== 'none');
        const table = visiblePanel?.querySelector('table');
        return {
          screen: { width: innerWidth, height: innerHeight },
          documentWidth: document.documentElement.scrollWidth,
          top: box('.top'),
          heading: box('.heading h1'),
          navigation: box('.worknav'),
          panel: visiblePanel ? (() => { const r = visiblePanel.getBoundingClientRect(); return { y: +r.y.toFixed(1), bottom: +r.bottom.toFixed(1) }; })() : null,
          table: table ? (() => { const r = table.getBoundingClientRect(); return { y: +r.y.toFixed(1), width: +r.width.toFixed(1) }; })() : null,
          visiblePrimaryButtons: [...document.querySelectorAll('.btn.primary')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).map(el => el.textContent.trim()),
        };
      });

      expect(layout.documentWidth, 'Whole page should not horizontally overflow; wide data tables may scroll within their own region').toBeLessThanOrEqual(viewport.width + 2);
      expect(layout.heading, 'A visible screen heading should exist').not.toBeNull();
      expect(layout.table, 'A visible data table should exist').not.toBeNull();
      expect(layout.navigation.bottom, 'Navigation should remain in the viewport on initial presentation').toBeLessThan(viewport.height);
      expect(layout.table.y, 'The first part of the table should enter the initial desktop viewport').toBeLessThan(viewport.height);
      expect(layout.visiblePrimaryButtons.length).toBeGreaterThanOrEqual(1);
      const imagePath = path.join(screenshotsDir, `${viewport.width}x${viewport.height}-0${index+1}-${stage.id}.png`);
      await page.screenshot({ path: imagePath, fullPage: true });
      await testInfo.attach(`ui-v2-${viewport.width}-${stage.id}`, { path: imagePath, contentType: 'image/png' });
      report.push({ stage: stage.label, ...layout });
      console.log('UI_V2_VISUAL_METRIC=' + JSON.stringify({ viewport: viewport.width + 'x' + viewport.height, stage: stage.label, ...layout }));
    }

    await page.locator('.worknav [data-step]').first().click();
    await page.locator('#q').fill('MT-2048-A');
    await page.locator('#find').click();
    await expect(page.locator('#count')).toContainText('1 条');
    const shown = await page.locator('#tbody tr:visible').count();
    expect(shown).toBe(1);
    await page.locator('#tbody tr:visible .pick').check();
    await expect(page.locator('#selection')).toHaveClass(/on/);
    await expect(page.locator('#chosen')).toContainText('1 项');
    await expect(page.locator('section.surface:not(.panel-screen)')).toBeVisible();
    expect(pageErrors, 'No uncaught browser JS exceptions').toEqual([]);

    const metricsFile = testInfo.outputPath(`metrics-${viewport.width}x${viewport.height}.json`);
    fs.writeFileSync(metricsFile, JSON.stringify({ renderedFrom: 'design/ui-v2/concept-b-refined.html', viewport, stages: report, pageErrors }, null, 2));
    await testInfo.attach(`ui-v2-metrics-${viewport.width}`, { path: metricsFile, contentType: 'application/json' });
  });
}
