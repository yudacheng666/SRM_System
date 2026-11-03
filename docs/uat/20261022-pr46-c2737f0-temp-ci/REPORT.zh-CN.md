# PR #46 独立 TEST-ONLY 临时云端测试报告

**结论：自动化开发套件 PASS；定向独立业务预验收 BLOCKED / 未完成。NOT READY。不能宣称 GitHub Actions 正式通过、UI 方案已验收或软件可合并。**

产品唯一 SHA：`c2737f0221a7b529114da2df363e062e75c7544c`；产品分支 `feat/20261022-srm-ui-ux-structural`；PR #46 开始/结束 HEAD 均一致且 Draft。日期2026-10-22，北京时间UTC+8。自动化执行约16:18:53–16:30:47；独立尝试约16:33:57–16:37:30；原始日志使用UTC。

## 1. 授权、规则与版本

读取了[PR46](https://github.com/yudacheng666/SRM_System/pull/46)全部现有评论、[Issue49](https://github.com/yudacheng666/SRM_System/issues/49)及评论、[PR44](https://github.com/yudacheng666/SRM_System/pull/44)设计与实施验收矩阵。按Issue49读取开发基线的AGENTS.md、docs/ai-memory/PROJECT_STATE.md与DECISIONS.md；固定产品SHA上没有这些入口文件。根目录PROJECT_STATE/DECISIONS初次查询404，随后按AGENTS指定规范路径读取；不把查询404算作产品测试失败。

最新用户授权及Issue49允许Actions受限期间提前做临时云端测试，覆盖旧记忆与设计中的“先CI全绿才独立验收”执行顺序；原正式CI、ChatGPT审核和用户合并授权门槛保留。旧记忆仍记c157040a，本轮以真实PR HEAD为准，未修改主记忆。此前Issue49的环境未配置记录已被本次实际云端执行事实更新，但这不意味着全部UAT完成。[GitHub核对原文](evidence/github-context.json)。

独立工作区基于固定SHA创建，tree=`7ced1466195c3968c2791b7b4439569d36b422eb`，产品HTML SHA256=`ba335eb4a2e326e19ec4273a5e35f32dedd2a1d2ef389439a9918337434fc248`。运行正式M1 Lite及server.main()，未使用静态原型或合成合并版本。[运行版本](evidence/runtime-identity.json)。

## 2. 云端自动化实际结果

Linux6.18.55/glibc2.41；Python3.12.14；Node24.19.0/npm11.9.0；Playwright1.58.2；真实系统Chromium154.0.8037.57，`/usr/bin/chromium`。与CI计划的Node22/Python3.13 Windows不完全相同。仓库既有测试为每个浏览器用例创建独立临时SQLite目录；所有数据为虚构。命令逐项记录开始/结束、退出码和耗时，无CI重试或workflow_dispatch。

| 命令 / Command | 结果 / Status | 退出码 / Exit | 耗时 / Duration | 证据 / Evidence |
|---|---|---|---|---|
| `python -m unittest discover -v -s prototype/m1-lite/backend -p test_*.py` | PASS | 0 | 11.083s | [raw](evidence/python-backend/command.json) |
| `npm ci` | PASS | 0 | 2.041s | [raw](evidence/npm-ci/command.json) |
| `npm test` | PASS | 0 | 0.52s | [raw](evidence/node-business/command.json) |
| `npx playwright install --with-deps chromium` | BLOCKED (environment) | 1 | 2.413s | [raw](evidence/playwright-install/command.json) |
| `npm run test:e2e` | PASS | 0 | 630.662s | [raw](evidence/chromium-e2e/command.json) |

`npx playwright install --with-deps chromium` 实际执行后因 `su: Authentication failure` 退出1，分类为环境安装BLOCKED。没有绕过认证或重复安装。使用仓库现有配置支持的 `SRM_CHROMIUM_PATH=/usr/bin/chromium` 完整运行原始49项E2E，未修改测试、跳过用例或放宽断言；这不把安装失败改成PASS。

| 统计层级 | PASS | FAIL | NOT TESTED | BLOCKED |
|---|---:|---:|---:|---:|
| Python后端用例 |43|0|0|0|
| Node业务用例 |10|0|0|0|
| 原有及新增Chromium E2E |49|0|0|0|
| 命令执行（不是额外业务用例） |4|0|0|1|
| 独立UAT组 |0|0|13|1|
| Windows专项组 |0|0|3|0|
| 独立驱动错误记录（不是产品缺陷） |0|2|0|0|

自动化共**102 PASS /0 FAIL**。E2E 49项含新增ui-ux-structural的全部3项，包含真实12条报价10+2分页、人工选择后待决定数量；还有文件/粘贴/手工报价、多轮历史、最低价及理由、SQLite、PDF供应商包、备份恢复与三尺寸既有自动化。49项无重试、无跳过。全部命名结果见[CSV](results.csv)、[原始JSON](evidence/automated-results.json)、[E2E日志](evidence/chromium-e2e/stdout.log)。102项自动化PASS不等于独立UAT PASS。

## 3. 定向业务预验收：BLOCKED

执行前已预审直接子summary、面板toggle、轮次/供应商选项、恢复刷新以及价格/分页操作路径，并冻结独立方法。[初始冻结](evidence/independent-preflight-frozen.json)。仅第一轮SETUP实际走完：通过正式UI新建询价、导入12条物料与3家供应商、A/B关联全部12行、C关联2行并实际保存ACK200。两条同编码不同规格使用不同RFQ Line ID。SETUP不记作Q/C/W整组通过。

**DRIVER-01，16:35:24：** 图纸预览已显示1唯一、1多候选、1未匹配；驱动在表格查找“多候选”，实际标签是“多个候选·需确认”，错误断言终止。实际截图与源标签证明是测试驱动文本识别错误，不是匹配逻辑失败。前后只读SQLite完全相同，资产行/PDF均0，尚未确认写入。[原错误](evidence/independent-attempt1/raw-first-error.json)、[截图](evidence/independent-attempt1/FAIL-page0.png)、[trace](evidence/independent-attempt1/trace-first-attempt.zip)。

使用唯一一次授权修正：保留原始方法/数据/错误，将独立识别改为当前真实标签并增加候选数量1/2/0检查；在全新 `/tmp/pr46-uat-attempt2/data` 重建SETUP并计划重跑受影响用例。未改产品或既有测试断言。[修正记录](evidence/driver-correction-01.json)、[初版驱动](evidence/driver-attempt1)。

**DRIVER-02，16:37:29：** 第二次SETUP中，XLSX解析尚未创建动态按钮时，独立 `waitForFunction` 直接读取空节点 `#confirmImportRows.disabled`，抛出TypeError。随后原始截图已显示正确12行预览；堆栈定位Playwright注入predicate，不是产品JS调用。按“最多一次修正”及已冻结停止规则，未作第二次修正、第三次运行或换路径绕过，停止独立浏览器扩展。[原错误](evidence/independent/raw-first-error.json)、[截图](evidence/independent/FAIL-page0.png)、[trace](evidence/independent/trace-first-attempt.zip)。

以下是未完成的独立范围。与Issue49的Q/C编号及PR44的UX业务主题对应，完整路径方法仅为预审计划，没有实际执行的步骤不得标PASS。

| 独立组 | 结果 | 原计划范围 / Planned scope |
|---|---|---|
| UAT-Q01 | NOT TESTED | Real Round2 XLSX buyer import |
| UAT-Q02 | NOT TESTED | Uncommitted import/carry/note refresh safety |
| UAT-Q03 | NOT TESTED | Confirmed rounds and same-round revision history |
| UAT-Q04 | NOT TESTED | Compact/full and real detail fields |
| UAT-C01 | NOT TESTED | Independent12-line page2 award and full metrics |
| UAT-C02 | NOT TESTED | Missing quotes and tier-price correctness |
| UAT-C03 | NOT TESTED | Tied-lowest and non-awarding disclosure |
| UAT-C04 | NOT TESTED | Non-lowest cancel/blank/accepted reason persistence |
| UAT-C05 | NOT TESTED | Independent scoped totals and actual comparison export |
| UAT-W01 | NOT TESTED | RFQ switching/F5/restart and save ACK |
| UAT-W02 | BLOCKED | Unique/ambiguous/unmatched PDFs through confirmation |
| UAT-W03 | NOT TESTED | Independent supplier isolation and export bytes |
| UAT-W04 | NOT TESTED | Independent full S4/empty restore/nonempty safety |
| UAT-V01 | NOT TESTED | Independent three-size buyer UI usability |

## 4. 产品、体验、环境与测试错误的区分

新确认产品P1/P2/P3缺陷：**0**；这表示现有证据未确认产品缺陷，不证明未测范围无缺陷。两个FAIL均是独立驱动错误；依赖安装BLOCKED是云端root能力限制。第二轮pageerror事件原样保留，但其调用来源为测试predicate，不能归为产品异常。两轮favicon404也保留。[原始错误登记](raw-error-register.json)。

**业务正确性结论：** 自动化套件PASS；采购员式独立预验收BLOCKED，不接受用49项E2E替代后者。**视觉/易用性结论：NOT TESTED（独立三尺寸范围）**。1366图纸预览实际操作截图可用；完整自动化的三尺寸截图也已归档，但未执行独立的三尺寸业务路径，不宣称设计成熟、行高/字号全面达标或PR44完整一致。

未执行的独立计划内金额6940/7064/1979等仅为fixture预期，**不是本轮实际观察到的采购计算结果**，不得以未执行方法文本作为通过证据。102项真实自动化结果有单独原始记录。

## 5. NOT TESTED / BLOCKED 与建议

Windows本机Python3.13、Windows Node及PowerShell/batch启动器专项3组均NOT TESTED：没有真实Windows执行器，未把Linux等同Windows。独立Q01–Q04/C01–C05/W01/W03/W04/V01未执行，W02图纸仅预览事实已有证据、完整关联验收BLOCKED；原C03–C09全套历史人工重验、真实Excel桌面重算、ERP实数、压力/故障注入均范围外，未声称通过。

[UI39743002722](https://github.com/yudacheng666/SRM_System/actions/runs/39743002722)与[S3/S439743002740](https://github.com/yudacheng666/SRM_System/actions/runs/39743002740)的四个GitHub作业仍FAIL；已实际核实四个steps=[]。按交接，注释指向账户付款/支出额度限制，具体子原因未由本轮独立确认。未触发GitHub Actions，也不将云端102PASS改写成官方CI通过。

建议ChatGPT先审核本报告与独立驱动问题，预审异步控件就绪条件；若仍需采购员预验收，需明确后续测试授权及新的驱动执行规则。本轮不再消耗修正额度，不修产品。待正式准确SHA的GitHub CI恢复验证、独立业务范围完成并获得用户合并授权后，才可另行决策。PR46与Issue49保持未合并/未关闭。

## 6. 原始证据与权限核查

完整原有自动化输出（test-results+HTML报告）390个文件按内容无损归档，保留49份原始trace ZIP及所有截图、服务日志和生成文件。为避免GitHub单文件大小限制分成6个≤40MiB分片；tar硬链接仅去重完全相同字节，未删失败样本、改截图或改trace。[归档清单](evidence/archive-manifest.json)、[全部原文件SHA256](evidence/automated-original-files.json)、[解包校验](evidence/archive-verification.json)。两轮独立证据保持可直接浏览。

重建：在本证据目录中执行 `cat evidence/automated-originals.tar.zst.part* > /tmp/srm46-originals.tar.zst`，再 `tar --zstd -xf /tmp/srm46-originals.tar.zst -C <新的证据解压目录>`；按清单验证SHA256。此操作只解包已生成的虚构测试证据，不运行产品或测试。

独立数据目录分别为 `/tmp/pr46-uat/data` 与 `/tmp/pr46-uat-attempt2/data`，原数据保留，无第三轮。测试拥有的浏览器和服务均停止；没有访问用户业务数据、没有修复代码。方法文本明确保留首次与修正版本；03–07未执行，不得以其存在声称覆盖。[方法](methods)。所有提交仅新增Issue49授权的docs/uat目录；[开始引用](evidence/protected-refs-start.txt)与[结束引用](evidence/protected-refs-end.txt)完全一致，main/M1/产品分支、原测试、CI、主记忆均未改。

本报告是**临时CI前证据＋未完成独立UAT的真实阻断报告**，不能改写为整体验收完成。
