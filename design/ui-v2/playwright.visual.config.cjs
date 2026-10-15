// 中文：仅针对 UI V2 独立视觉原型的配置，不改动原业务 e2e 测试配置。
// English: Isolated visual-concept configuration; no changes to the existing SRM business e2e config.
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 90000,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'test-results/ui-v2-html', open: 'never' }], ['json', { outputFile: 'test-results/ui-v2-results.json' }]],
  use: { browserName: 'chromium', trace: 'on', screenshot: 'only-on-failure' },
});
