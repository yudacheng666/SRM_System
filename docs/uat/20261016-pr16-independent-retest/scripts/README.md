# 独立工具说明 / Independent evidence tools

本目录全部为本次新增临时验收工具，不是产品或既有测试修改。

- interactive-browser.cjs：真实Chromium交互控制台；已执行命令及结果在browser-actions.jsonl，非承诺一键回放的回归套件。
- extract-material-sheet.py：openpyxl原样抽取下载的物料Sheet，记录表头列号/身份值，不修改内容。
- check-artifacts.py：独立解析真实下载XLSX/ZIP，断言范围、内部字段隔离、空报价区、PDF原字节及实际公式与手算。
- read-only-fingerprints.py：SQLite以mode=ro读取，仅生成指纹证据。
- scope-followup.cjs：独立新RFQ从同码两规格导入、分配、第一轮报价确认到第二轮范围选择，真实UI复现残留。
- check-trace.cjs：真实Playwright Trace Viewer载入主trace的验证。

临时绝对路径为原测试环境记录；归档复用时须调整fixtures/downloads/evidence路径和Playwright依赖路径。没有通过直接写JS app state、API或SQLite注入替代采购员UI流程。输入全部虚构，原文件与下载物不改字节。主驱动错误及修正解释见REPORT。
