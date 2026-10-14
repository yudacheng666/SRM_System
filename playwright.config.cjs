const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './prototype/m1-lite/tests/e2e',
  timeout: 90000, expect: { timeout: 15000 }, workers: 1, retries: 0,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 },
    trace: 'on', screenshot: 'only-on-failure',
    launchOptions: process.env.SRM_CHROMIUM_PATH ? { executablePath: process.env.SRM_CHROMIUM_PATH } : {} },
});
