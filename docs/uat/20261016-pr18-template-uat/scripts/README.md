# 独立验收工具 / Independent evidence tools

全部是本轮新增临时测试/证据工具，不是产品、既有测试或CI修改。

- interactive-browser.cjs：真实Chromium交互控制台；run(name)读取steps目录执行采购员操作，完整执行源码与结果写入browser-actions.jsonl。
- steps目录：实际下载、上传、确认、取消、键盘、截图及最小负例复现。步骤06/07第一次在错误状态下运行受阻，修正后的有效重跑均记录原执行源码；报告解释驱动错误，不承诺一键无条件重放。
- fill-downloaded-templates.py：复制实际下载模板、只填虚构数据；生成独立错误输入。
- inspect-actual-templates.py：zipfile/openpyxl/CSV只读校验13份下载物，含表头、唯一Sheet/无数据、BOM、泄露标记及SHA。
- check-saved-business.py：只读保存态/真实业务Excel独立核对，含跨供应商历史不变、ERP/图号/更新值和F1往返。
- read-only-fingerprints.py：SQLite以mode=ro打开，不写数据库。
- check-trace.cjs：真实Playwright Trace Viewer载入验证。

临时绝对路径保留为审计记录；复用须调整依赖、fixtures/downloads/evidence路径。业务写入均经真实UI，不做JS/app-state、API或SQLite注入。下载物与输入原字节由SHA清单审计。CSV原BOM/CRLF、页面文本空格均原样保留，不为格式检查改动证据字节。
