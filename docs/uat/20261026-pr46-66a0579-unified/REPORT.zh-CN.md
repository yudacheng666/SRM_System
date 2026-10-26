# PR #46 最终统一独立验收（TEST-ONLY）

**结论：NOT READY（仅当前开发验收范围）。** 唯一产品 SHA：`66a0579d88177143737b109efb3a8790c6cce053`。

完整自动化实际执行 **94 PASS /15 FAIL**（Python44/44、Node10/10、Chromium40/55）；Chromium无跳过/重试。独立 UX 九组 **7 PASS /1 FAIL /1 BLOCKED**；独立核心子用例 **11 PASS /1 BLOCKED**。Windows原生3组 **NOT TESTED**。不能宣称正式Actions成功、完整开发合并门槛完成或产品发布通过。

## 1. 授权、准确版本与环境

[完整任务](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6409929850)。开始/中途/结束核对PR #46均为上述SHA、Draft、未合并。正式M1从独立detached `/tmp/srm66-product`启动；证据从PR #50现有分支父提交 `17fbf6bbb72b8f536cb50fc55bf466c8e3000a82` 只追加本目录。三个旧SHA证据目录和项目主记忆均不改。

已完整读取PR #48未合并记忆提案的AGENTS/PROJECT_STATE/DECISIONS（`760406cf9cf1af3e140b5196531a439579d57500`）、当前差异和PR #50此前报告；D-022仅允许临时云端开发证据，D-024不以旧模拟资料迁移兼容作门槛。没有导入任何旧SHA数据库/ZIP。每轮独立尝试均新建隔离SQLite和全新合成RFQ，夹具由当前版本生成并添加虚构采购资料。

运行环境：Linux、Python3.12.14、Node24.19.0（与建议Node22不同）、Playwright1.58.2、实际Chromium154.0.8037.57 `/usr/bin/chromium`，使用仓库支持的 `SRM_CHROMIUM_PATH`。浏览器已安装，无需另行安装；没有用mock或静态原型。云端运行/网络按cloud-environment-runtime核查，未调用GitHub Actions runner。

[身份起点](identity-start.json)、[终点](identity-end.json)、[HTTP原始trace核验](http-product-identity.json)：所有10份实际记录的根页面HTML响应（包含首个/末个及恢复服务）均与checkout SHA256 `c62731be8c936205c75feefecba40d7a81d42ba4d840b92b17445dd10a3d284b` 相符。HTTP响应hash是在结束后从未改动trace原文复核，未伪称全部在启动前打印；Git SHA在前/中/后分别核对。测试期间源未移动，main/M1/产品refs前后相同。

## 2. 完整自动化真实结果

| 命令 | 结果 | 原始证据 |
|---|---|---|
| `python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'` |44 PASS、退出0|[stderr](automation/python-backend/stderr.log)|
| `npm ci` 首次 |退出254，环境缓存路径失败|[stderr](automation/npm-ci/stderr.log)|
| 同一 `npm ci`，仅设任务临时缓存 |退出0，锁定安装成功|[命令](automation/npm-ci-cache-retry/command.json)|
| `npm test` |10 PASS、退出0|[stdout](automation/node-business/stdout.log)|
| `npm run test:e2e` |40 PASS/15 FAIL，55项均执行，退出1，0跳过/0重试|[stdout](automation/chromium-e2e/stdout.log)|

首次npm缓存 `/home/agent/.npm/_cacache` 不可写/创建失败，完整错误保留；改用 `npm_config_cache=/tmp/uat66/npm-cache` 后成功。没有改产品、package-lock、原测试/断言或CI，未为了通过重跑失败的Playwright用例。新SHA的真实总数为109项，不沿用旧103。详见 [automation-summary.json](automation-summary.json)、[逐例CSV](automation-cases.csv)。

### P2-TEST-01：15项原测试适配/前置缺陷（测试覆盖缺口，不冒充产品业务BUG）

全部15项失败的原始堆栈、准确源码行、截图和trace位置见 [分类清单](automation/failure-classification.json) 与 `automation/failures/AF-01..AF-15/`。重现命令即上述原样完整E2E，不能以独立用例通过覆盖这些FAIL。

| 原测试 | 实际失败点及分类 |
|---|---|
| acceptance 01（147行） |重启后当前项目页，仍fill隐藏的物料搜索框；路径未进入物料页|
| acceptance 05/06/07（237/284/305行） |断言旧“正式”字样，实际批准文案为“本机工作模式”|
| acceptance 12（442行） |新建切到项目页，仍要求管理页报表面板可见|
| acceptance 13（458行） |仍要求旧项目抽屉收起，而新要求为独立常驻项目页|
| acceptance 44（612行） |点击新界面刻意隐藏的旧项目summary|
| acceptance 46（699行） |在其他页操作隐藏的供应商物料勾选框|
| ERP09（402行） |要求旧“规格：120W”字面前缀，实际横排仍明确含120W/220W及对应价格/行ID|
| UX project title/project page/admin（217/257/286起） |测试未请求app fixture，也未自行启动/goto应用，页面无应用DOM；3项前置错误|
| UX item rows（326行） |认定首行TST-001；当前明确默认倒序，实际首行TST-012，行高等先前断言已通过|
| B3 1366/1600（46/97行） |旧close helper点击隐藏的项目summary，超时|

这些是依据未改动原始错误和实际新UI作出的分类；已在独立路径验证大量相应业务，但原测试失败后尚未执行的断言仍是 **NOT REACHED**，不推断全通过。建议由ChatGPT修改测试的实际导航、fixture启动和语义断言，再对新准确SHA运行完整集合；本轮不修。

## 3. 九组采购员UX结果

| 组 | 结果 | 实测依据 |
|---|---|---|
| UX-01 |PASS|三尺寸顶栏通俗中文、无突出S4/SQLite/Current RFQ/PURCHASING WORKSPACE；实际保存等待与409不假报；管理详情可读内部ID/版本等|
| UX-02 |PASS|新建、中文改名、当前标题/其他历史名；实际SQLite保存、切换、F5、服务重启；内部workspaceId及报价/PDF全关联不变|
| UX-03 |PASS|侧边、顶部项目/管理、五步切换均只保留一个aria-current高亮，三尺寸复核|
| UX-04 |PASS|独立常驻第①项目页，五步顺序正确；新建/保存/历史不需展开全局抽屉；下一步确实进入物料页|
| UX-05 |BLOCKED|管理归属、简短按钮、取消重读保护、正常S4备份恢复/非空拒绝均通过；附加非法/内容篡改拒绝证据链中断，按保守组汇总标BLOCKED，不是已确认产品恢复失败|
| UX-06 |PASS|物料实际31–32px，三尺寸均≤40；真实12行及52行导入预览/正式列表50+2、滚动、分页和筛选选择保持|
| UX-07 |PASS|缺必需图纸只在原按钮写缺图纸；3份关联PDF仍为PDF且打开原字节；无需图纸独立，无重复第二行占高|
| UX-08 |PASS|物料/供应商视角共用状态，编码·名称·规格横排nowrap并有完整hover；多对多追加/重复/移除/搜索及52行跨页准确|
| UX-09 |FAIL|P3视觉密度仍不一致：物料/分配31–32px，报价回收39–40px，比价58.375–62px；1366首屏无实际报价行；价格/阶梯/理由/详情/键盘未发现被裁切删除|

21个主要布局（7页面×3尺寸）无整体水平溢出，真实详情/完整列/键盘操作均有证据。上述PASS仅限实际路径；8行独立数据集未另建，主要覆盖12行及更大的52行，不伪称8行专门场景已执行。

## 4. 独立核心业务与S4结果

在每轮新目录中从零建立：12个虚构物料（同码不同规格保持独立lineId）、3家供应商、3份有效多页PDF。甲乙各12行，丙2行；预览1/2/0候选，确认前无提交，手工关联到正确行并验证原件。报价包含真实XLSX、粘贴、手工、甲R1V1/R1V2/R2V1、明确9行沿用，最终5份确认提交/50条历史行，锁定历史未覆盖，阶梯适用价118/2.25与询价数量一致。

实际待决定10+2，第12行选择后移出；并列75/75任选不要求错误理由；高价82对20须真实理由、空白/取消不保存；漏报/不供货不是零。人工3项 **1979.00**、理论 **6940.00**、建议混合 **7064.00**分别显示并保存。自身金额甲6420/乙7185/丙990不跨范围直接排名；甲乙共同10行6420/6665。实际下载供应商单独/全部ZIP、CSV、内部Excel完成 **46项**内容核验，无其他供应商/内部JSON/理由外泄，PDF原名字节相同。

第二个新项目真实导入52行，先验证预览50+2及确认全部52，再验证正式列表50+2、跨页选择/筛选保留、全选追加两个供应商不漏行。两个中文项目来回切换，实际F5和服务重启后全部业务行/历史/PDF字节相同。真实名称编辑产生pending PUT，放行前数据库不变、S4按钮禁用；取消“重新读取”保留草稿；放行后真实200。两个标签页真正发生SQLite旧版本409，保存者不被覆盖、旧页未保存名称保留内存，F5只读回真正成功的状态。

| 核心子组 | 结果 |
|---|---|
| CORE-01..CORE-08：导入/PDF/分配/轮次/定标/实际下载/跨项目持久化/真实等待和409 |8 PASS|
| CORE-09A：本版S4 CRC/manifest DB哈希/SQLite integrity/四表全行字段/3PDF哈希 |PASS，11项归档核验|
| CORE-09B：真正空目录UI恢复 |PASS，HTTP200，两RFQ全部版本/PDF/人工金额一致|
| CORE-09C：非空拒绝 |PASS，UI禁止+真实HTTP409 RESTORE_TARGET_NOT_EMPTY，全部数据不变|
| CORE-09D：附加内容篡改拒绝 |BLOCKED，见下述第三次运行错误和夹具前置缺口|

第三次错误发生在读取额外非法包响应体时：`response.json: Protocol error (Network.getResponseBody): Request content was evicted from inspector cache`。为何被逐出的触发原因未确定。此时正常恢复、非空拒绝的实际数据核对已完成，不能把后续错误抹成产品故障或整个S4通过。

原日志和失败截图可观察HTTP400，UI为 **RESTORE_UNSUPPORTED_ARCHIVE**。停止后只读检查发现附加夹具用ZIP_DEFLATED重写，而当前S4只接收ZIP_STORED；因此它在格式检查已被拒绝，**未到期望的PDF内容SHA篡改拒绝环节**。只读目标快照仍为空且与请求前相同，但没有以此绕过原错误并升级该用例PASS；未改夹具、未重新发请求。

## 5. 已确认产品视觉问题

**P3-UX09-01（视觉/操作体验，非数据缺陷）**：比价列表仍比其他业务列表疏，且1366×768首屏无报价数据行。

重现：用本目录全新12行/3供应商XLSX及报价夹具建立项目，完成报价确认与3行人工定标；1366×768打开“比价议价”，页面滚到顶。当前首个实际报价行y≈**884.97**，超出768px首屏；向下查看，普通报价行高 **58.375–62px**。同一轮数据的物料/分配 **31–32px**，报价回收 **39–40px**。三个尺寸均测量，非仅看CSS代码。

预期：按第9组达到一致的紧凑阅读体验，主要报价矩阵更易到达，详情仍可展开。实际：价格按钮、详情/决定等保留堆叠，和其他列表密度差异明显，采购员需更多滚动才能看到同一批物料。并非宣称每个业务表都必须机械等高，行高数值是实测事实，“紧凑一致性未达到”属于采购员式设计判断，交ChatGPT审核。

证据：[1366真实首屏](attempt-03/evidence/UX-1366-quotes.png)、[实际报价行及金额](attempt-03/evidence/UX09-1366-separate-award-totals.png)、[跨尺寸行高汇总](row-density-summary.json)、原始browser.jsonl的row-density事件。建议将价格与详情入口尽量同行、明确决定/理由详情层级，压缩非主要说明/筛选占高，保留所有字段和操作；测试方不修产品。

没有已确认P1/P2产品数据/安全缺陷；P2-TEST-01是原套件适配/覆盖问题。阻断及未测不等于产品无缺陷。

## 6. 两次修正与第三次停止

1. DRIVER-01：误把预览分页50行当作应同时显示52。保留原trace/error；修正为真实预览50+2、确认全部52和正式列表52/分页/选择校验，在全新attempt02重跑。
2. DRIVER-02：误以为历史下拉应含当前项目；源码明确只列其他项目。改为当前标题+其他历史选项分别校验，完整ID/状态比较保留；全新attempt03从零重跑。
3. DRIVER-03：上述响应体缓存错误。**两次修正额度已用完，受影响附加负向路径停止，未再修改驱动、未第四轮浏览器运行**。最后只读收集日志/目标快照、分析夹具和归档，不冒称完成该路径。

原始未分类错误文件保持原样，最终分类另记 [raw-error-register.json](raw-error-register.json)；修正 [01](driver-correction-01.json)/[diff](driver-correction-01.diff)、[02](driver-correction-02.json)/[diff](driver-correction-02.diff)。前两轮通过记录不作为新独立额外用例数量。原套件15FAIL也未被改写或使用修正后的独立驱动顶替。

## 7. 截图、trace与边界

| 尺寸 | 项目页 | 物料页 | 供应商视角 | 报价页 | 比价首屏 |
|---|---|---|---|---|---|
|1024×768|[图](attempt-03/evidence/UX-1024-project.png)|[图](attempt-03/evidence/UX-1024-items.png)|[图](attempt-03/evidence/UX08-1024-supplier-first.png)|[图](attempt-03/evidence/UX-1024-quoteImport.png)|[图](attempt-03/evidence/UX-1024-quotes.png)|
|1366×768|[图](attempt-03/evidence/UX-1366-project.png)|[图](attempt-03/evidence/UX-1366-items.png)|[图](attempt-03/evidence/UX08-1366-supplier-first.png)|[图](attempt-03/evidence/UX-1366-quoteImport.png)|[图](attempt-03/evidence/UX-1366-quotes.png)|
|1600×900|[图](attempt-03/evidence/UX-1600-project.png)|[图](attempt-03/evidence/UX-1600-items.png)|[图](attempt-03/evidence/UX08-1600-supplier-first.png)|[图](attempt-03/evidence/UX-1600-quoteImport.png)|[图](attempt-03/evidence/UX-1600-quotes.png)|

三次独立trace均为真实异常终止现场，未伪装成无错误完整运行：[第一次](independent/evidence/trace-first-attempt.zip)、[第二次](attempt-02/evidence/trace-first-attempt.zip)、[第三次](attempt-03/evidence/trace-first-attempt.zip)。共168张独立原始截图，完整浏览器/服务日志和所有成功/失败/中断记录保留。55项原套件trace及全部441个runner/HTML报告原文件无损分片归档（相同副本用标准tar硬链接去重，原路径字节hash全回验）。见 [解包说明](README-raw-evidence.md) 与 [SHA256](SHA256SUMS)。

NOT TESTED：原生Windows Python3.13、Node22、PowerShell/BAT/实际本机启动3组；没有真实Windows环境。也未验收旧模拟资料迁移（D-024明确排除）、完整真实ERP语义/桌面Excel、多浏览器、穷举负载/故障/可访问性；未把Linux等同Windows。当前内容SHA篡改拒绝链路仍BLOCKED。

下一步交ChatGPT处理15项原测试适配/前置缺陷和P3密度问题，并审核如何补齐受阻的附加校验。新的产品/测试提交必须另按准确SHA复验；本轮不自行修复、不合并/关闭PR，不修改main/M1或主记忆。正式Actions、Windows原生和用户单独合并审批门槛仍在。
