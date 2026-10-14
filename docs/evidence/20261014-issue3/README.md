# 虚构验收证据
# Synthetic acceptance evidence

完整 Playwright 8/8 通过；最后新增纯筛选和 PDF 第二页断言后，定向 01/05 重跑 2/2 通过。
The full Playwright run passed 8/8; after adding filter and PDF-page-two assertions, targeted 01/05 reruns passed 2/2.

full-run-results.json 与 detail-run-results.json 是原始 Playwright JSON；summary.json 摘录结果并记录最终测试源码哈希。
full-run-results.json and detail-run-results.json are raw Playwright JSON; summary.json records results and final source hashes.

restore-trace.zip 与 autosave-trace.zip 来自完整通过运行；startup.png 与 pdf-preview.png 是真实浏览器截图。其余完整 trace 在云端 /tmp/srm-complete-run/test-results/ 与 CI 上传产物中。
restore-trace.zip and autosave-trace.zip come from the passing full run; startup.png and pdf-preview.png are real screenshots. Other complete traces remain in cloud /tmp/srm-complete-run/test-results/ and CI artifacts.

server-01 至 server-08 为完整运行真实服务日志；detail-server 日志对应最后定向重跑。下载的 XLSX/ZIP 都是匿名虚构输入的真实产物。
server-01 through server-08 are real server logs from the full run; detail-server logs correspond to the final targeted reruns. Downloaded XLSX/ZIP files are actual artifacts from anonymous synthetic input.

SHA256SUMS 用于校验这些证据文件；不含任何用户正式业务资料。
SHA256SUMS verifies these evidence files; none contains actual user business data.

```sh
npx playwright show-trace docs/evidence/20261014-issue3/restore-trace.zip
npx playwright show-trace docs/evidence/20261014-issue3/autosave-trace.zip
```
