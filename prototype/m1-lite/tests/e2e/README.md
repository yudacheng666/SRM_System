# Playwright 云端验收
# Playwright cloud acceptance

所有输入由生成器创建，为虚构物料、供应商和价格；每个测试使用独立临时 SRM_DATA_DIR，恢复使用另一空白目录。
All inputs are generated synthetic items, suppliers and prices; each test uses a temporary SRM_DATA_DIR, with a separate empty restore root.

在仓库根目录使用 Python 3.10+、Node 20+ 执行：
Run from the repository root with Python 3.10+ and Node 20+:

```sh
npm ci
npx playwright install --with-deps chromium
python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'
npm test
npm run test:e2e
```

云端预装 Chromium 时，可设置 SRM_CHROMIUM_PATH=/usr/bin/chromium；CI 使用 Playwright 配套浏览器。
When Chromium is preinstalled, set SRM_CHROMIUM_PATH=/usr/bin/chromium; CI uses the matching Playwright browser.

测试启动真实 server.main()、SQLite 和后台备份线程，仅禁用自动打开浏览器。端口 8765/8766 必须空闲；禁止指向已有数据库。
Tests start the real server.main(), SQLite and backup thread, disabling only browser auto-launch. Ports 8765/8766 must be free; never point at existing databases.

业务准备通过页面点击、输入、文件选择和确认；API 读取用于核对持久化与历史，恶意写入用于服务端保护断言。
Business setup uses UI clicks, input, file selection and confirmation; API reads verify persistence/history, and malicious writes test backend protections.

失败保留截图、trace、服务器日志；下载样本和 HTML/JSON 报告位于 test-results/ 与 playwright-report/。CI 无论成功失败均上传证据 14 天。
Failures retain screenshots, traces and server logs; downloads and HTML/JSON reports live in test-results/ and playwright-report/. CI uploads evidence for 14 days on success or failure.

```sh
npx playwright show-report
npx playwright show-trace path/to/trace.zip
```

定期备份的 24 小时节流、变化检测和 7 份保留由 test_auto_backup.py 的隔离时间测试覆盖；浏览器测试验证真实 main 进程首次自动备份。
Isolated time tests in test_auto_backup.py cover the 24-hour throttle, change detection and seven-copy retention; browser tests check the real main process's first automatic backup.

浏览器自动化不能代替原生 Windows 文件对话框、Excel 操作及长期运行试用；准确 SHA 的测试记录以 GitHub Actions 为准，当前阶段状态见 `docs/ai-memory/PROJECT_STATE.md`。
Browser automation does not replace native Windows file dialogs, Excel operations or long-running user trials; exact-SHA evidence lives in GitHub Actions, with the current state in `docs/ai-memory/PROJECT_STATE.md`.
