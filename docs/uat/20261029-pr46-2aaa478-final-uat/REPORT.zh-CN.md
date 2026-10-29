# PR46 · 2aaa478 独立验收 / TEST-ONLY

**本轮云端测试范围：PASS / READY（仅限已测Linux范围）。** 完整原Python44 + Node10 + Chromium58 = **112 PASS、0 FAIL**；另先完成原UI V3定向用例1PASS（同一用例在全套中再次执行，不计为113个不同用例）。新隔离数据下的独立业务/UI/保存/恢复均通过，未发现新的已确认产品P1/P2/P3缺陷。

**完整M1开发合并门槛：NOT READY。** 原生Windows三组仍NOT TESTED，仍需ChatGPT审核和用户单独决定；本报告不授权合并，不等于整个软件/Windows验收或GitHub Actions成功。首次搜索超时本轮 **NOT REPRODUCED; ROOT CAUSE UNKNOWN**，不宣称根因已修复。

唯一产品SHA：**`2aaa478c8f1966e41b9372d9d989c383dbaa1972`**。任务：[PR50完整指令](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6501279793)。任务日期2026-10-29（客户端Asia/Shanghai）；日志使用实际UTC，报告生成UTC`2026-10-29T16:16:24.461611+00:00`。[任务/版本原文](github-task-version.json)。

## 准确版本、环境及隔离

在`/workspace/srm2aaa-product` detached checkout固定SHA，开始/结束核对PR46 HEAD；使用真实M1-Lite后端、SQLite、Chromium，仓库`tests/e2e/serve.py`提供正式`prototype/m1-lite/index.html`与实际API，不用静态设计原型。全部采购、报价、PDF、邮件/图片均为新生成的虚构输入，自动化/定向/独立运行使用隔离测试目录，不读用户真实业务目录、不导入旧SHA数据库或ZIP、不测试旧模拟数据迁移。

Linux / Python3.12.14 / Node24.19.0 / Playwright1.58.2 / Chromium154.0.8037.57。没有原生Windows、cmd.exe或PowerShell环境。[起始身份](identity-start.json)、[结束身份](identity-end.json)、[HTTP证明](http-trace-identity.json)。本提交只改1个原测试文件，产品HTML字节与上轮相同；**HTML哈希单独不能区分提交**。本报告结合真实checkout、当前测试源码哈希、命令时间、全新RFQ/SQLite及trace，证明是本SHA重新执行，未沿用旧PASS。共110个实际根页面HTTP200响应体匹配当前HTML，缺失0。

## 定向UI完整用例及旧76行之后的证据

纠正启动命令后的主序列为：`npm ci` → **原UI V3完整定向用例** → Python → Node → 完整Chromium。定向用例原样执行，退出0，1PASS/0FAIL/0SKIP/0RETRY，非独立查询kicker即判通过。

对原Playwright trace中的真实Test.expect before/after事件做只读审计：[定向证明](focused-assertion-audit.json)、[全套中同一用例证明](full-ui-assertion-audit.json)。两次均完整执行 **100条用例正文断言**，其中旧失败循环之后 **79条**：流程标识、报价锁定提示、结构样式标识，5页面×3尺寸的active导航/aria-current/宽度/侧栏遮挡/工作区可见性，以及末尾`errors=[]`。15组页面/尺寸均有实际事件，最后第109行断言也完成。当前中文“系统设置”和两位业务步骤编号要求均通过；没有修改原测试或放宽断言。

上轮五条完整用例在本SHA全套中 **5/5 PASS**：[当前逐项原结果](prior-five-current-results.json)。原fbb9894的1FAIL仍留在旧目录，不被重写；旧P3测试期望问题的关闭依据是本次完整新执行。

## 全套实际结果及计数边界

| 范围 | PASS | FAIL | SKIP | 退出码 |
|---|---:|---:|---:|---:|
|先行原UI V3完整定向用例（重复执行项）|1|0|0|0|
|完整Python后端|44|0|0|0|
|完整Node业务|10|0|0|0|
|完整Chromium E2E|58|0|0|0|
|三套主套件独立用例总数|112|0|0|—|

最终完整E2E workers1、retry0、flaky0，全部58项执行，无删测、阈值放宽、force click或用成功重试覆盖产品失败。[112项CSV](automation-cases.csv)、[实际命令及退出码](COMMANDS.md)、[完整日志](automation/chromium-e2e/stdout.log)。**没有触发GitHub Actions**，不把云端执行写成Actions正式通过。

归并需求行[RESULTS.md](RESULTS.md)/[CSV](results.csv)：**27PASS/0FAIL/3NOT TESTED**，这些行与自动化/抽样有重叠，不能相加。独立浏览器单个非交互运行退出0、业务驱动错误0；1122条底层检查/观察记录全部PASS，它们不是1122个独立用例。

## 独立采购员操作、数据与实际文件

- **新建与导航/状态 PASS**：真实新建中文项目，跨六页导航与唯一选中状态，真实保存后状态一致。实际暂扣PUT时三尺寸不虚报已保存且备份被阻止，真实200后才显示已保存；真实旧标签409保护赢方数据，技术详情可见；实际停服务触发保存失败，重启手动200+F5恢复，旧历史/PDF不变。
- **采购与报价 PASS**：12新物料、3供应商、3PDF，重复编码不同规格保留不同RFQ行身份，唯一/多候选/未匹配图纸通过真实界面确认/打开并核对原字节；追加多对多分配保留已有关系。Excel/粘贴/手工、多轮及修订、预览保护、确认锁定、9行显式沿用及阶梯价均操作。5确认版本/50历史行保留；人工3项¥1979与理论¥6940/组合¥7064区分，待决定9；并列最低无需高价理由，真正高价须给理由。
- **实际导出/持久化 PASS**：46项供应商ZIP/CSV/比价XLSX内容、30项备份分类/排除邮件聊天凭证、11项完整ZIP/SQLite/PDF检查；第二52行RFQ、50+2分页及跨RFQ/F5/真实服务重启后，全表保存数据、历史和3PDF哈希一致。所有下载均为本SHA实际操作产生。
- **恢复安全 PASS**：损坏ZIP和资料包误当完整备份真实400拒绝、中文提示且无原RESTORE码、目标未变。合法ZIP_STORED负例只改一份PDF的1字节且长度不变，manifest和其他成员不变、CRC合法；真实浏览器与审计后端400/RESTORE_PDF_HASH_MISMATCH，目标语义行、持久文件字节及目录集合均不变。原正确完整备份200恢复2RFQ全部数据/报价/历史/图纸，非空目标随后409拒绝且数据不变。[构造证明](independent/evidence/S4-tamper-preflight.json)、[真实拒绝](independent/evidence/S4-audited-backend-rejection.json)、[正确恢复](independent/evidence/S4-valid-positive-control-restored.png)、[非空拒绝](independent/evidence/S4-nonempty-backend.json)。

## 三尺寸真实UI与首次点击

六页×三尺寸18张新截图已目视检查；#F6F8FB背景、14.5px字体、中文层级和导航按钮风格一致，没有重大首屏遮挡或整页横向溢出。1024宽表使用表内滚动，不等同整页溢出。**83个浮层样本**（28/27/28）实际测试悬停、真实Tab、边界、保持焦点/悬停时Esc、固定及外部关闭，全PASS，数据/历史/PDF不变。

1366×768真实报价首行top701.140625、bottom742.921875、高41.78125px、scrollY0，整行可见。[首屏截图](independent/evidence/UX09-1366-real-priced-first-screen.png)、[测量](independent/evidence/UX09-independent-before-awards.json)。1600大屏首行下缘跨过首屏，但正常滚轮可完整看到，列作非阻塞效率建议，不混作1366目标失败。[观测](independent/evidence/optional-fold-observation.json)。

| 页面 / Page |1024×768|1366×768|1600×900|
|---|---|---|---|
|project|[Screenshot](independent/evidence/VISUAL-1024-project.png)|[Screenshot](independent/evidence/VISUAL-1366-project.png)|[Screenshot](independent/evidence/VISUAL-1600-project.png)|
|items|[Screenshot](independent/evidence/VISUAL-1024-items.png)|[Screenshot](independent/evidence/VISUAL-1366-items.png)|[Screenshot](independent/evidence/VISUAL-1600-items.png)|
|assign|[Screenshot](independent/evidence/VISUAL-1024-assign.png)|[Screenshot](independent/evidence/VISUAL-1366-assign.png)|[Screenshot](independent/evidence/VISUAL-1600-assign.png)|
|quoteImport|[Screenshot](independent/evidence/VISUAL-1024-quoteImport.png)|[Screenshot](independent/evidence/VISUAL-1366-quoteImport.png)|[Screenshot](independent/evidence/VISUAL-1600-quoteImport.png)|
|quotes|[Screenshot](independent/evidence/VISUAL-1024-quotes.png)|[Screenshot](independent/evidence/VISUAL-1366-quotes.png)|[Screenshot](independent/evidence/VISUAL-1600-quotes.png)|
|backup|[Screenshot](independent/evidence/VISUAL-1024-backup.png)|[Screenshot](independent/evidence/VISUAL-1366-backup.png)|[Screenshot](independent/evidence/VISUAL-1600-backup.png)|

首次`#runAssignSearch`只调用1次普通click，未force、增大原15秒超时、固定延时绕过或重试；正常触发可信点击并筛出预期1行。保存 **20个连续样本/18rAF**，位置/尺寸稳定，中心命中始终为按钮；computed styles、活跃动画、祖先、滚动、焦点/悬停及elementFromPoint命中栈全保留。结论 **NOT REPRODUCED; ROOT CAUSE UNKNOWN**，不能称ROOT CAUSE FIXED；未出现的失败态不能推断已验证。[原始rAF](independent/evidence/assign-search-first-frames.jsonl)、[摘要](independent/evidence/assign-search-diagnostic-summary.json)、[trace](independent/evidence/independent-complete-trace.zip)。

## 启动和证据方法错误：全部保留

1. 最初定向命令`--grep '^UI V3 integration:'`未匹配含文件前缀的完整标题，退出1、实际0用例，**不是PASS**。新建运行器错误地提前继续了扩展套件。发现后SIGINT停止，该阶段13完成/45未执行（框架标SKIPPED）、0unexpected，作为 **INCOMPLETE/BLOCKED** 原样保留，不用于主验收。纠正选择表达式后重新按完整定向→三套测试顺序执行；最终完整58项0SKIP。不存在用新PASS覆盖当时产品断言失败。[原始选择错误](selection-order-error.json)、[首次无匹配](initial-selection-no-tests)、[提前中断套件](initial-interrupted-suite)、[原启动方法](launch-attempt/run-automation.py)。
2. 只读trace审计器最初把fixture的expect.poll内部瞬态探测也当作用例正文，随后按当前源码正文45..109行计数；输入trace未变，全部100正文及79后续断言仍逐条完成。[方法记录](audit-method-correction.json)。这不是修改原测试或放弃正文失败。
3. 归档器的变量名碰撞导致初次输出路径错误，尚未创建归档即退出。已改为独立archiveLabel并将所有原文件解包校验；原输出未改、没有重跑浏览器。[方法记录](packaging-method-correction.json)、[原错误日志](archive-focused.initial-error.log)。

[异常登记](raw-error-register.json)区分启动错误、被中断的非验收阶段、证据工具修正与真正产品测试。新独立业务运行没有异常或重试，初始和最终记录均未覆盖。

## 未测范围、就绪边界与交付

Windows三组 **NOT TESTED**：原生Python3.13、Node22、隔离Windows程序/数据目录、PowerShell/BAT/Edge启动及本机文件锁/恢复安全；不能用Linux替代。旧模拟数据迁移、真实企业信息、其他设备/缩放未测；原搜索异常时序未复现。**本轮云端范围通过，完整M1合并门槛仍NOT READY，交ChatGPT核查并由用户决定后续，不自动合并。**

只新增现有DraftPR50的本目录，父证据提交`243e5052fa4f56b6ba72771d73998d61f91ff6f4`；旧版本失败报告保留。产品、原测试、CI、主记忆、开发分支/main均未修改；无Actions、merge、close或新建PR。所有用例结果、截图、SQLite/PDF/下载检查均来自本SHA新执行。

完整主套件原输出457文件、定向24文件、无匹配阶段3文件、中断阶段118文件，全部无损归档并逐文件复核SHA256；不只留成功样本。原58主测试trace、1定向trace、1独立trace及中断阶段13份trace均保留。[证据索引](README.md)、[原文件清单](automation/original-file-manifest.json)、[校验清单](SHA256SUMS.txt)。
