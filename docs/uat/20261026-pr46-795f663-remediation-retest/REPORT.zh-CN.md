# PR #46 整改独立复验 / TEST-ONLY

**结论：NOT READY。** 唯一产品 SHA：`795f663933f6883bc6e05d30b4ebbc2623a3301c`。本轮保留全部失败，未修改产品、原测试、CI、开发分支、main/M1或主记忆，未合并/关闭PR，未触发GitHub Actions。

定向16项 **12 PASS /4 FAIL**：原AF15项 **12 PASS /3 FAIL**，新UX09 **FAIL**。随后完整110项 **103 PASS /7 FAIL**（Python44、Node10、Chromium49/56）；0跳过/0重试。独立UX九组 **8 PASS /1 FAIL**，核心业务 **12 PASS**，原生Windows **3 NOT TESTED**。这些集合有重叠，不能相加当成独立总覆盖。原66a0579报告94/15及7/1/1完全保留。

## 1. 授权、版本与执行环境

[完整任务](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6414197317)及PR46整改评论已读；按阶段先定向、无确认P1/P2产品安全失败后完整套件、最后S4合法内容篡改补测。补读PR48未合并记忆HEAD `92ba152de443efda536b97468d40d32dfc23f9c1`的AGENTS/PROJECT_STATE/DECISIONS，仅作为工作规则，不修改或宣布已合并。

正式M1 Lite detached checkout `/tmp/srm795-product`；PR46开始/中途/结束HEAD均为上述SHA、Draft、未合并。[开始身份](identity-start.json)、[结束身份](identity-end.json)、[HTTP开始](http-start.json)、[attempt03 HTTP](http-attempt03-start.json)、[HTTP结束](http-end.json)：实际静态页面SHA256均为 `7ee6b0c38e39ad70b122b7003477357905998cfcaeaa3044c31443fcbc1b2176`，与该checkout一致。没有运行PR23静态原型或合成合并提交。

Linux Python3.12.14、Node24.19.0（不是建议Node22）、Playwright1.58.2、真实Chromium154.0.8037.57。使用任务独立目录/端口/SQLite/虚构RFQ与PDF，每次独立驱动修正后从全新空目录重启；未用旧SHA数据库/ZIP作输入。官方GitHub Actions未运行，本轮不能称其成功，也未完成Windows/用户合并审批门槛。

## 2. 原15项与新密度测试

| 原失败ID | 原测试准确名称 | Phase1 | Phase2 |
|---|---|---|---|
| AF-01 | 01 startup, demo isolation, autosave, navigation and restart / 启动与隔离 | PASS | PASS |
| AF-02 | 05 PDF matching, manual correction, refresh and scoped supplier ZIP / 图纸询价包 | FAIL | FAIL |
| AF-03 | 06 full backup restore: actual imported quotes, history, PDFs, overwrite refusal / 完整恢复 | PASS | PASS |
| AF-04 | 07 real service disconnect and stale-tab 409 halt autosave / 自动保存失败 | FAIL | FAIL |
| AF-05 | 12 supplier status and report context reset on RFQ change / 保存提示与跨询价报告隔离 | PASS | PASS |
| AF-06 | 13 compact laptop item table after import / 1366首屏物料可见 | FAIL | FAIL |
| AF-07 | 44 S4 blocked-download reason stays visible beside the action / 备份阻止原因始终可见 | PASS | PASS |
| AF-08 | 46 P3-NAV-01 view navigation versus actual unsaved edit / 只读导航与真实脏数据区分 | PASS | PASS |
| AF-09 | ERP09: second-round scope shows specification and preserves selected line identities | PASS | PASS |
| AF-10 | UX project title: Chinese label, rename, history and reload / 询价名称真实保存 | PASS | PASS |
| AF-11 | UX project page: first workflow stage, visible controls, stage switching / 询价项目独立首页 | PASS | PASS |
| AF-12 | UX admin: backup page separate from RFQ, concise labels / 独立备份页与简短项目按钮 | PASS | PASS |
| AF-13 | UX item rows: single-line drawing badge and compact row / 物料行高及缺图纸标识 | PASS | PASS |
| AF-14 | B3 quote and comparison with real SQLite 1366x768 | PASS | PASS |
| AF-15 | B3 quote and comparison with real SQLite 1600x900 | PASS | PASS |

通过的12项已走完整原测试，包括B3两个分辨率以及此前未到达的断言。失败三项不是先前失败点原封不动：旧badge/首个项目抽屉断言已走通，但后续仍有适配缺口：

- **AF-02 / acceptance05**：reload后当前项目页，239行直接fill隐藏`#itemSearch`，未进入物料页。后面的PDF/询价ZIP断言仍 **NOT REACHED**。
- **AF-04 / acceptance07**：旧标签和真实409/停止重试断言通过；停服务后313行在物料页fill隐藏`#pilotCounterpartyCode`（CP-OFFLINE），超时。后续断线/重启手工保存断言仍 **NOT REACHED**。Phase1还发生trace结束时ZIP central-directory错误，该项没有生成trace附件；原截图/context/server log均保留。Phase2原trace真实存在并确认上述等待动作，未用重写测试掩盖错误。trace-finalization内部根因未知。
- **AF-06 / acceptance13**：初始项目页检查已通过；reload后486行仍要求常驻项目details关闭，实际open。后面的首行检查 **NOT REACHED**。

保留 **P2-TEST-01（测试适配/覆盖缺口，共6条失败）**，不冒充已确认产品业务故障；独立补测通过不覆盖这些FAIL。详细原始错误、准确行号、每阶段截图、trace位置见[分类](automation/AF-remediation-classification.json)、[只读trace动作](AF04-waiting-action-readonly.json)、`automation/phase*/failures/`。原套件一字未改。

**P3-UX09-01 仍FAIL（产品视觉/操作体验）**：普通真实报价行 **44.4375px**，新原测试精确要求≤44px，因此仍失败；比上轮58–62px改善，但不舍入为通过。更主要是1366×768页面滚至顶部，首个实际报价行top **843.96875px**，首屏依旧没有报价。12行/3供应商独立实测截图和坐标支持该结论。价格/详情中心完全同行，展开不误定标，显式价格按钮选择、理由、金额均通过。

复现：导入`fixtures/buyer-items.xlsx`12项及三家供应商，按独立methods01–05建立真实多轮报价；1366×768进入“比价议价”，滚至顶；首行在768px以下。新原UX09测试在44.4375断言即失败，因此其后首屏/对齐断言未执行；本轮独立路径另测后两者，分别FAIL/PASS。影响是采购员需要先滚动才能进入核心报价矩阵。建议ChatGPT压缩矩阵上方重复说明/范围区，保留真实字段/详情/点击目标；测试方不修复。

证据：[真实首屏](attempt-03/evidence/UX09-1366-real-priced-first-screen.png)、[原始坐标](attempt-03/evidence/UX09-independent-before-awards.json)、[展开详情](attempt-03/evidence/UX09-expanded-price-details.png)。没有确认P1/P2产品数据或安全缺陷；未知/未测不等于没有缺陷。

### 完整套件额外三条FAIL（不是原15项的重复计数）

完整套件还发现三条此前通过的原测试失败，均点击整报价单元格中心，新布局该位置是详情入口；原截图/trace显示详情展开、没有执行预期的价格按钮定标：

| 测试 | 实际失败 |
|---|---|
| UX pending-only，171行 | 预期待决定11，实际12；第一行详情已展开 |
| UX manual-only，203行 | 预期人工191/3项，实际63/1项；部分整格点击只展开详情 |
| B3 tied-lowest，196行 | 预期人工1，实际0；同价乙方详情展开，未完成价格按钮选择 |

原始FAIL保留，后续断言NOT REACHED；不能因同类独立业务通过而删去这三条。分类为**测试点击目标与新布局不一致/覆盖缺口**；独立精确价格按钮已实际验证同价、高价理由、待决定分页、人工1979和持久化，暂未确认这些数值差异是产品计算缺陷。证据：[三条分类](automation/full-run-extra-classification.json)、[只读原trace动作](full-run-extra-three-readonly.json)及完整失败截图。ChatGPT应适配真实按钮目标并重新运行原测试，Codex不修。

## 3. 完整原自动化

| 命令 | 结果 | 原始记录 |
|---|---|---|
| Python unittest discover（任务原命令） |44 PASS，exit0|[日志](automation/phase2/python-backend/stderr.log)|
| `npm ci`（独立可写cache） |exit0|[命令](automation/phase2/npm-ci/command.json)|
| `npm test` |10 PASS，exit0|[日志](automation/phase2/node-business/stdout.log)|
| `npm run test:e2e` |49 PASS /7 FAIL，56实际执行，exit1；0skip/0retry|[日志](automation/phase2/chromium-e2e/stdout.log)|

定向与完整分别报告，不加总重复用例；所有case见[automation-cases.csv](automation-cases.csv)。每条命令准确版本、开始时间、耗时、退出码均在对应command.json。npm ci为避免替换正在用的模块，等待第二次独立尝试停止后才执行；独立第三轮在安装完毕后启动。没有通过反复跑失败用例筛选成功样本。

## 4. 独立采购业务和九组UX

[逐项结果](results.csv)。UX01–08在当前SHA均有新数据和实际界面证据：一个真实常驻保存状态/详情、中文名与稳定ID、唯一导航高亮、独立第一项目页、管理与保存保护、紧凑物料/图纸/分配和52行分页。UX09因上述密度/首屏FAIL。

真实业务：12项同码不同规格物料、3家虚构供应商、3份多页PDF；1/2/0候选预览、确认前数据库不变、手工匹配及原件字节核验。甲R1V1→V2→R2V1，5份确认/50条报价历史，9项显式沿用、历史锁定和118/2.25阶梯适用价保持。物料/供应商双向追加、重复、删除关系、52行预览50+2和正式分页/筛选选择保持。

比价真实待决定10+2；并列75/75允许任一，82对20高价理由空白/取消不提交；未报价/不供货不算零；人工3项 **¥1,979.00**、理论 **¥6,940.00**、建议组合 **¥7,064.00**严格区分。自身范围甲6420/乙7185/丙990，共同10项甲6420/乙6665。实际ZIP/CSV/Excel下载完成 **46项内容核验**，数量/报价/供应商范围/PDF原字节/内部字段隔离通过。

另一个52项询价隔离无泄漏；跨询价、F5、真实服务重启后四表全行及PDF相同。真实业务修改PUT暂挂，200前数据库不变且三尺寸不假报已保存；取消重读保留草稿；真实并发409保留成功方全部数据及旧页未保存草稿，刷新只回读成功版本。

## 5. S4 合法ZIP_STORED内容篡改：真正完成原缺口

全新当前源数据真实UI下载`current-S4-full.zip`；11项完整性核验：CRC、manifest数据库SHA、SQLite integrity、四表全部行字段、三份PDFSHA。备份不修改源数据。

[构造预审](attempt-03/evidence/S4-tamper-preflight.json)：全部entry是ZIP_STORED；保留文件名/顺序和manifest原字节/hash；只把PDF中`Remediation795`的首字节R改T，**仅1字节、长度不变**，PDF结构及页仍有效（事后只读pdfinfo退出0、2页，原结果一并归档）；ZIP重新计算正确CRC，testzip通过，所有其他文件原字节不变。manifest继续要求原PDFSHA，实际改后SHA不同。**不是ZIP_DEFLATED，不是RESTORE_UNSUPPORTED_ARCHIVE。**

空目标真实浏览器上传并恢复，HTTP400，按钮附近明确 **RESTORE_PDF_HASH_MISMATCH**。再用Node原生HTTP客户端捕获同一包的真实后端body：`error=RESTORE_REJECTED`, `message=RESTORE_PDF_HASH_MISMATCH`，HTTP400；[审计](attempt-03/evidence/S4-audited-backend-rejection.json)包含时间/请求hash/响应body/UI原文。未使用会触发CDP缓存问题的Page Response.json。

UI与HTTP两次拒绝前后，目标四表每行、PDF、持久文件字节SHA及目录列表均相同；SQLite WAL/SHM单独记录为易变运行文件，不据此谎称所有瞬时字节不变。拒绝未发布资产/工作区，空目标保持空。紧接着**同一个目标**接受原合法包HTTP200，恢复两询价全部历史/PDF/人工1979；再做非空UI拒绝与后端409 `RESTORE_TARGET_NOT_EMPTY`，目标全量数据保持。UX05和CORE09D这次才按实测改为当前SHA的PASS，旧BLOCKED报告不修改。

## 6. 驱动错误、原始证据和未测边界

两次允许的驱动修正均完整保留，额度已用完；没有第三次修正。

1. attempt01错误点击整报价单元格中心，命中新布局详情入口，未执行定标；改为精确`.quotePrice`按钮，原业务断言保留，新空目录attempt02。
2. attempt02实际导出已下载，但独立validator残留另一次attempt03路径，内容断言前FileNotFound。明确传入真实root并保留全部46断言。先对副本做validator-only预审（不计为UAT通过），随后从新空目录attempt03全部重跑。

第三次独立尝试完整结束，无新驱动故障。先前两次原始错误、trace、截图、方法快照、diff保留，[错误登记](raw-error-register.json)。原Phase1 AF04 trace缺口如第2节如实说明，不能宣称每条都有trace；其他所有可获取原始trace、runner与HTML报告均无损归档，并逐文件hash回验。[解包说明](README-raw-evidence.md)、[SHA256](SHA256SUMS)。

三个尺寸1024×768、1366×768、1600×900，各7页实际操作，21布局文档宽度与屏宽相符；保存中/409/技术详情、报价详情和金额均有截图。主要图：[1024](attempt-03/evidence/UX-1024-quotes.png)、[1366](attempt-03/evidence/UX-1366-quotes.png)、[1600](attempt-03/evidence/UX-1600-quotes.png)。

**NOT TESTED**：原生Windows Python3.13、Node22、PowerShell/BAT/本机启动安全3组；没有真实Windows。未覆盖旧模拟数据迁移（D024明确排除）、桌面Excel/真实ERP全语义、多浏览器、穷举故障/负载/无障碍。原AF02/04/06停止点以后的原断言未到达，不能由独立补测推断其原测试通过。

下一步：ChatGPT处理剩余六条原测试交互/断言适配和P3比价首屏/密度，审核本轮证据；新SHA需重新复验。**不建议把当前结果认定为完整开发验收或合并门槛完成。** 本轮只追加PR50新目录，所有旧证据、产品、测试、CI、主记忆和保护分支保留不变。
