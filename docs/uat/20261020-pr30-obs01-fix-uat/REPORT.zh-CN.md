# PR #30 独立验收报告（TEST-ONLY）

日期：2026-10-20；原始日志 UTC，北京时间为 UTC+8。**准确产品 SHA：`69f660cb2944e278a1e12b4824d8532b0fe6c7c3`**。

## 结论

**原 OBS-01 已知触发路径：PASS（本次 24/24 快速重复下载）；业务和数据安全：PASS；阻止备份时提示可见性：FAIL，残留 1 项 P3；PR #30 整体独立验收：FAIL，暂不建议按“全部通过”接收。** 本次未发现 P0/P1/P2 数据安全或采购计算缺陷。未合并、关闭任何 PR，未修改产品、原测试、CI 或受保护分支。

这不是整个产品的无缺陷证明。24 次快速下载没有复现原来的“顶部 admin 误设 dirty、无请求、下载超时”；并且入口探针证实有观测的正向调用都是 clean。新发现的条件性反馈问题不等于原 admin 误置 dirty 缺陷仍然存在。

## 版本与开始门槛

- 已读取 PR #30 说明、diff、全部现有评论及 PR #24 交接。原任务 [6282227958](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6282227958) 的旧 8d073e80 由 [6282392319](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6282392319) 更新为本 SHA；[PR30 CI 最终交接](https://github.com/yudacheng666/SRM_System/pull/30#issuecomment-6282605340) 和 [PR24 CI 最终交接](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6282605828) 确认开始条件。
- [push run #135 / 39362505327](https://github.com/yudacheng666/SRM_System/actions/runs/39362505327)：准确候选 HEAD，Windows SQLite/S4 与 Linux Chromium 均 SUCCESS。
- [PR run #136 / 39362512675](https://github.com/yudacheng666/SRM_System/actions/runs/39362512675)：两个作业均 SUCCESS；PR CI 的合成 merge SHA 为 `55a05aa0287630ec52987cb9994d9ae4946551c9`。独立运行没有使用该合成版本。
- 两条运行是同一完整 S3/S4 工作流的 push/PR 触发，Linux 日志均包括 43 个真实浏览器场景。不把它们写成两套不同的 UI Unified 工作流。
- 测试前、结束时 PR30 HEAD 均未变化，仍 open/Draft、未合并。测试分支直接从候选 SHA 建立：`test/20261020-pr30-obs01-fix-uat`；证据 PR 目标为修复分支，不是 main。
- 正式文件 `prototype/m1-lite/index.html` 由 Python/SQLite 后端提供；HTTP 实际字节 SHA256 与候选 tracked 文件一致：`4cc01c4734277eecfc7fd56df05b352eef83e1c028b5bc73461cb484b57d5e5e`。见 [运行身份](evidence/runtime-identity.json)、[checkout](evidence/checkout.json)、[开始 GitHub 快照](evidence/github-initial.json)、[结束快照](evidence/github-final.json)。没有运行 PR23 概念原型。

## 环境、方法与计数口径

真实 Chromium 154.0.8037.57，Playwright 1.58.2，Linux 云端；主浏览器 1366×768，另采集 1024×768、1600×900 页面及原 P3 禁用按钮证据。独立 SQLite 目录为 `/tmp/r69/data`，初次/最终恢复为 `/tmp/r69/restore`、`/tmp/r69/restore-final`，反馈控制为 `/tmp/r69/feedback-data`，均本次新建。所有数据、报价、PDF、供应商均虚构。结束后只停止四个自建服务，数据和失败证据保留。

先完整执行现有回归，再独立建项目与操作。现有回归：Python 43 PASS、Node 10 PASS、Chromium 43 PASS / 0 skipped / 0 flaky / 0 unexpected。见 [结果](evidence/existing-suite-results.json)、[Python](evidence/existing-python.txt)、[Node](evidence/existing-node.txt)、[Playwright](evidence/existing-playwright.txt)、[JSON](evidence/existing-playwright-results.json)。这些不是独立复验的替代。

独立驱动保存在 method 下的 TXT 和 browser.jsonl 的 step 原文中，没有覆盖现有测试。真实点击、文件选择、Excel 预览/确认、页面输入、单项/批量定标和下载均经浏览器 UI；只读快照用于核对落盘状态。O01–O20 使用条件表达式恒 false 的只读 CDP 入口 logpoint，记录 dirty/busy/blocked，不改保护条件；O21–O24 关闭该探针，保留被动 DOM/网络日志。B01 仅在浏览器网络层暂扣一次真实 autosave PUT，观察期间再释放；不改请求/响应内容、不注入业务状态、不改产品。

- **O01–O24：24 次全部 DOWNLOAD_SUCCESS**，每次 RFQ B→A 后点顶部 admin，再立即点 S4；切回 RFQ 后交替等待 0/100/350/650ms，admin 后不固定延时。可信点击间隔 **252–368.1ms**，均短于旧 750ms 轮询。每次 POST 201 → ZIP GET 200 → 一个浏览器下载事件；全部实际落地和校验。
- **N01：1 次真实未保存修改被正确阻止**，无备份请求/文件；下载监听等待 1.2s 到期是预期负向观察窗口，不是正向下载失败。但提示不可见，见 P3-S4-01。
- **N02：1 次实际合法下载**。本想以 3s 网络延时覆盖“保存进行中”，但导航/工具展开耗时使点击发生于保存完成后；gate 显示 dirty=false、busy=false。因此不能把它算成进行中保护 PASS，亦不能当成产品绕过保护。两条原始失败断言完整保留，B01 用真实请求闸门补验了这个目标。
- **N03：1 次实际 autosave 完成后的立即下载成功**；新增的两条安全测试物料确实落盘，其他 RFQ 未改变。
- **F01 / B01：2 次补充物理点击均安全阻止，无备份 API/下载**。F01 未保存，B01 真正 PUT 进行中且按钮 disabled=true；项目操作区展开时，左侧提示可见，即使顶部状态在视口上方。见 [控制结果](evidence/feedback-controls.json)。
- 定向序列共 **29 次物理点击 = 26 次实际下载 + 3 次安全阻止；正向意外下载超时 0**。主记录中原始监听到期 1 次（N01，预期无下载）；补充控制不设置下载等待器。另有业务回归中的首次 `full-S4.zip` 成功，故全程 S4 点击 **30 次、实际 S4 ZIP 27 份**。不得将 3 次安全阻止写成下载成功。

逐次数据：[29行 CSV](evidence/all-backup-attempts.csv)、[原始27条](evidence/obs-attempts.json)、[带事件/文件校验](evidence/obs-attempts-enriched.json)、[汇总](evidence/obs-summary.json)。原始主浏览器 194 条检查中 191 true、3 false：1 条是本报告 UI 缺陷，另 2 条为 N02 错过时序的无效预期；不得宣称“所有独立断言通过”。[完整检查和分类](evidence/independent-checks.json)。

## 逐项验收（27 个分组：21 PASS / 1 FAIL / 5 NOT TESTED）

| ID | 验收项与已验证状态 | 结果 | 证据 |
|---|---|---|---|
| C01 | HEAD/运行字节/CI 门槛与开始、结束分支核对 | PASS | runtime-identity、github-initial/final、protected-refs-before/after |
| C02 | 完整既有 Python/Node/43 Chromium 回归先运行 | PASS | existing-suite-results / existing-playwright-results |
| C03 | RFQ 切回→顶部数据备份→立即 S4，24 次 | PASS | obs-attempts-enriched，obs-browser |
| C04 | admin 不误设 dirty；20 次探针正常，4 次关闭探针仍下载成功 | PASS | O01–O24；22 个正向入口 clean 包括 N02/N03 |
| C05 | 真实修改未保存时拒绝备份，无备份 API，稍后实际 autosave | PASS | N01、F01、32-after-negative1-autosave |
| C06 | 未保存修改被阻止后必须清楚可见地解释原因，含项目操作区收起状态 | **FAIL** | **P3-S4-01；OBS-N01-after.png** |
| C07 | 真正 autosave PUT 进行中禁止备份，释放后保存完成 | PASS | B01、feedback-browser、SUP-B01-saving-before-scroll |
| C08 | autosave 刚完成可立即备份，不靠后续反复重试 | PASS | N03；N02 实际也在保存后但不算进行中样本 |
| C09 | 27 ZIP CRC、SQLite integrity_check、数据库/PDF manifest SHA、全部当前+历史行一致 | PASS | obs-file-validation；history-first/obs-baseline/final |
| C10 | 初次和最新备份恢复到两个空目录，UI 及完整历史/PDF一致 | PASS | 14-restored、34-final-backup-restored、history-final-restored |
| C11 | 两个已恢复非空目录再次恢复均拒绝，数据/版本/PDF不变 | PASS | 15-restore-refused、35-final-restore-refused |
| C12 | A/B 同20，先A后B（键盘Enter）无例外理由；再A/C同20选择C无理由 | PASS | T01、T09、awards/awardReasons实际保存 |
| C13 | 批量选择同价不索理由，高价项才需要；取消不改变定标 | PASS | T04、browser check 日志 |
| C14 | 真正8/12高价选择：空白拒绝，理由正确落盘及导出 | PASS | T02、05-awarded、comparison工作簿 |
| C15 | 人工定标3项后 pending=0、并列待核对=0，无报价项不当0元 | PASS | T05、OBS-final-decisions |
| C16 | 新增C20不使既选B20误复核；B改21后重开复核，F5保持，重选C20后清零 | PASS | T06–T09、21/22/23快照 |
| C17 | A同轮V1=10→V2=9，草稿不替代已确认价，差异真实；确认锁定且V1完整不变 | PASS | V04-*、V03-confirmed-history-protection、04/23快照 |
| C18 | 保存/F5/跨RFQ/实际服务进程停止重启后，定标、理由、历史与数据保持 | PASS | process-restart、09/13快照、11-real-restart-awards |
| C19 | Excel物料、图纸多候选/未匹配预览不落盘、唯一匹配确认、重启后原生PDF可读 | PASS | 02a/02b/02c、03-drawing-*、PDF-real-preview-after-restart |
| C20 | 实际CSV/业务Excel/比较Excel/供应商ZIP：金额、公式、范围和PDF，空价不补零、不泄露ERP/竞品 | PASS | business-file-validation、downloads |
| C21 | 非法Excel及合法预览取消均不改SQLite版本、RFQ行号和内容 | PASS | 16/17/18/19快照、invalid-import |
| C22 | 简单双向追加分配、供应商上下文隔离；三分辨率V01–V04/原P3禁用按钮回归未见退化 | PASS | 02-supplier-multi-allocation、prod-*、V02-*、P3-fixed-* |
| C23 | Windows本机安装/路径/浏览器人工检查 | NOT TESTED | 本轮仅云端；Windows CI成功不等于本机手工测试 |
| C24 | 原生桌面Excel公式重算、打印及纸面排版 | NOT TESTED | 已解析实际文件和公式，未启动Excel |
| C25 | 真实多用户写冲突、断电/磁盘故障、长时间并发及离线服务的全部保护提示 | NOT TESTED | 本轮没有故障注入或生产负载 |
| C26 | PR23逐像素对照和所有视觉设计细节的重新完整认证 | NOT TESTED | 有当前产品三尺寸截图，未重新采集PR23配对参考 |
| C27 | 全量61行等大型独立矩阵及所有报价录入方式重新逐一探索 | NOT TESTED | 既有43场景已跑；独立场景只覆盖本报告明列范围 |

分组统计：C01–C22 为21 PASS / 1 FAIL，C23–C27 为5 NOT TESTED，共27组；原始断言、重复下载次数与分组数使用不同口径，不相加。

## 新问题 P3-S4-01：保护提示在项目操作区收起且页面滚动时不可见

类型：操作体验 / UI反馈；位置：数据与备份，1366×768。采购影响：用户看到可用备份按钮，点击后按钮变灰、没有文件，也看不到原因，容易再次认为备份失效。**数据保护有效，无数据损坏证据；不是 P1/P2 业务或保存错误。**

复现（N01，2026-10-20 03:45:54–56 UTC；准确时间以逐次JSON为准）：
1. 在本报告主项目已有保存数据后，将“项目操作：新建/切换/手动保存”收起，保持数据与备份区展开及报表区当前布局。
2. 在物料页新增虚构物料 `PR30-DIRTY-N01`，数量2，确认导入；在3秒自动保存前点顶部“数据与备份”，按通常浏览器滚动到 S4 按钮。
3. 不强制点击 DOM，不改 dirty 标志；通过物理鼠标点击尚未 disabled 的 S4 按钮。
4. 入口记录 `s4Available=true,busy=false,dirty=true,blocked=false,disabled=false`；保护正确返回，无 POST/GET/下载。按钮随后 disabled=true。
5. DOM 生成“存在未保存修改，完整备份已暂停”等文本，但顶部 `.srm-v2-live-status` 的 rect 为 top=-151.65625、bottom=-124.265625；项目区收起，`pilotSaveStatus` 和 `pilotAutosaveStatus` 也未展示。当前视口看不到任何暂停解释。

预期：原因应显示在当前可见的备份操作区、可靠可见通知，或主动揭示状态区域，明确下一步。实际：[N01当前视口](evidence/OBS-N01-after.png) 无原因文本。截图、日志与trace共同支持，不凭 textContent 存在判为可见。

对照限定：F01 项目操作区**展开**，左侧红色提示确实可见，[滚动前](evidence/SUP-F01-before-scroll.png) / [滚动后](evidence/SUP-F01-after-scroll.png)；B01进行中左侧同样可见。本问题不是“所有状态都静默”，不能将顶部 indicator 不在视口单独视为所有场景失败。N01 的截图是确认条件性失败的证据。

建议：开发者把阻止原因放在备份按钮附近或确保状态提示在滚动/折叠情况下仍可见。**没有自行修复。** 已证实的是 DOM布局与视觉结果；没有据此推断所有分辨率、所有错误分支都失败。

## 采购业务与文件核验

四条原始物料含同编码的不同规格 M16/220（数量10）、M20/350（25）、无有效报价件（4）和高价理由件（6）；A/B/C 虚构供应商，多对多分配。后续两个安全测试新增件不参与原报价比较。A 第一项同轮10改9，第二项A/B同20；第四项A8/B12。新增C20后B再改21，旧V1保留。最终人工选 A/C/B，非最低理由只对应第四行，manualAwards=3、待决定=0、并列待核对=0、新报价待复核=0。

独立计算原 A/B 同范围合计 **638 / 692**，B更新后 **638 / 717**；理论最低638，最终人工合计662，无报价件不计零。CSV数量×单价、UTF-8 BOM、稳定RFQ行号均核对；实际比较工作簿的选择、理由、无报价空值、SUMIF/ROUND公式和历史明细已解析。A/B组历史导出不混入C；人工定标允许C是全局业务选择，不混淆“同范围”与“各自范围”。供应商包无竞品、无内部ERP备注、报价单价列空白且PDF哈希正确。[37项文件检查](evidence/business-file-validation.json)。

备份读取 ZIP 的 manifest 指向 SQLite，核对SHA后只读解析 `workspaces` 与 `workspace_versions` 的**所有列、所有行**，不是只验证行数或页面无错。O01–O24 对比导航前版本历史，N02/N03 对比已保存新增物料后的最终历史；初次 full-S4 对比当时历史。所有27份都通过文件/SQL/PDF校验，最新版本恢复后的完整历史也相等。CRC与业务结构共292条机器检查中291 PASS，另1条是同一N01可见性失败，非文件完整性失败。原始 [validator执行输出](evidence/obs-validation-execution.txt) 与 [完整核验](evidence/obs-file-validation.json) 均保留。

## 证据导航和限制

- [截图索引](SCREENSHOTS.md)：三尺寸产品页、24个成功样本、N01/N02/N03、补充反馈、恢复、报价历史、PDF和原P3。
- [主浏览器trace](evidence/independent-v31-browser-trace.zip)、[控制trace](evidence/feedback-control-trace.zip)：Playwright trace viewer可打开，真实DOM与网络记录；逐步屏幕截图另存PNG。
- [主浏览器日志](evidence/browser.jsonl)、[OBS网络/dirty/点击日志](evidence/obs-browser.jsonl)、[补充控制日志](evidence/feedback-browser.jsonl)。无pageerror/driver-error；三个新origin的控制台404与服务端 `/favicon.ico` 对应，保留不隐瞒。
- [主服务日志](evidence/server.log)、[第一次恢复](evidence/restore-server.log)、[最终恢复](evidence/final-restore-server.log)、[控制服务](evidence/feedback-server.log)。自动备份由正式程序正常触发，未用其替代手动S4下载验收。
- [方法原文](method/console.cjs.txt)、[逐步驱动](method/steps)、[反馈控制](method/feedback-control.cjs.txt)、[校验源文本](method/validate-obs.py.txt)、[全部文件SHA256](SHA256SUMS.txt)。TXT仅供审阅，不覆盖原测试程序。
- 未改变用户业务目录；未提交松散运行中数据库；ZIP内数据库和JSON仅含虚构本轮数据。全部证据以准确产品SHA为准，证据分支后续commit不是新产品版本。

剩余风险：样本量和云端单用户/有限时序不能证明所有race不存在；新P3使“保护必须清楚可见提示”要求未全部满足。按边界不执行Windows本机测试；不将CI、局部通过或后续重试扩大为整产品通过。建议开发者先处理P3-S4-01，再定向复验；本报告不批准合并。
