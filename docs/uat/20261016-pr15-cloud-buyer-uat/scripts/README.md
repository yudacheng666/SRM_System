# 独立验收工具 / Independent evidence tools

这些是本次新建的临时测试工具，不是现有产品或自动测试修改。/ These new scratch tools do not change product or existing tests.

- `browser-console.cjs`: 启动真实Chromium并记录交互式命令、页面异常、下载和截图；完整已执行命令与后续观察保留于 `../evidence/browser-actions.jsonl`，trace包含完整动作。并非承诺一键重放的回归套件。所有业务写入来自真实UI。
- `check-packages.py`: 独立openpyxl/ZIP校验8份实际下载供应商包的范围、敏感列、空报价及PDF原字节。临时绝对路径保留为审计记录；重跑需调整到归档fixtures/downloads目录。
- `make-fixtures.py`: 本轮初始虚构输入生成器。宽表221、抽取单Sheet、后续输入按动作日志继续生成；归档fixtures及SHA清单才是最终实际输入，不应把再次运行生成器等同完整重放。
- `check-trace.cjs`: 本次trace已在真实Playwright Trace Viewer载入；临时路径/依赖路径为原环境记录。

Read-only XLSX and SQLite crosschecks are archived as JSON. No direct database writes or application-state injection were used. Negative inputs and test-owned HTTP logs intentionally retain failures; see REPORT limitations for their interpretation.
