// 中文：UI V3 独立设计原型测试，不修改 M1-Lite 正式验收配置。
// English: Self-contained visual review spec; never affects production acceptance tests.
const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'./tests',timeout:60000,workers:1,retries:0,
  reporter:[['list'],['html',{open:'never',outputFolder:'ui-v3-playwright-report'}]],
  use:{browserName:'chromium',viewport:{width:1366,height:768},trace:'on',screenshot:'on'},
  outputDir:'ui-v3-test-results'
});