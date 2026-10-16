# 独立验收工具 / Independent evidence tools

仅本轮新建临时工具，不是既有业务代码或测试修改。

- interactive-browser.cjs：真实Chromium控制台。已执行命令、结果、观察和异常在browser-actions.jsonl；trace含动作/DOM/网络。非一键回放套件，长命令截断及误预期解释见REPORT。
- read-only-fingerprints.py：SQLite使用mode=ro读取，输出对象及SHA指纹，不写入数据库。
- check-trace.cjs：真实Playwright Trace Viewer载入验证。

openpyxl仅解析下载物和原样抽取单物料Sheet，未修改业务值。物料/报价及关联写入均经真实UI，不做JS/SQLite/API注入。归档脚本保留当时临时路径，重用需调整依赖、fixtures/downloads/evidence路径。输入XLSX及下载物原字节由SHA清单审计。
