# PR #46 最终收口独立复验（TEST-ONLY，2026-10-26）

**本轮云端整改/业务验收：PASS，READY for scoped cloud review。** 唯一产品 SHA：`f4bfcda8efdf3998c833ed25c3193a056fdde451`。

**M1开发基线合并门槛：NOT READY（仍缺原生Windows三组及用户单独合并批准；本轮没有正式Actions）。** 这是对本准确SHA云端已测范围的通过，不是整个软件发布/合并授权，也不是GitHub Actions SUCCESS。

| 真实执行范围 | PASS | FAIL | NOT TESTED | BLOCKED |
|---|---:|---:|---:|---:|
| 定向剩余6项 + UX09 |7|0|0|0|
| 完整Python |44|0|0|0|
| 完整Node |10|0|0|0|
| 完整Chromium |56|0|0|0|
| 独立UX01–09 |9|0|0|0|
| 独立核心业务子组 |12|0|0|0|
| 原生Windows |0|0|3|0|

完整原自动化合计 **110 PASS / 0 FAIL（110项）**，0skip/0retry。定向与完整、独立业务有重叠，不加总为虚增覆盖。另单列 **1次独立夹具错误 + 1次有记录的补全**，原始FAIL未删除；后续全新attempt02完成本轮独立验收。旧795f663的103/7、UX8/1以及更早证据不改一字。

## 1. 任务、准确版本与环境

[完整GitHub任务](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6415440257)、[开发整改](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6415422410)已完整读取。产品分支`feat/20261022-srm-ui-ux-structural`，开始/中途/结束PR46 HEAD一致、Draft、未合并；detached `/workspace/srmf4-product` 正式M1Lite，既非PR23原型亦非合成合并版本。产品分支自身没有AGENTS/主记忆入口，补读仓库PR48最新未合并HEAD `6b4e43de5fb523d852601734f8516b28b16bcdc3` 的AGENTS、PROJECT_STATE、DECISIONS，明确其未合并身份；本轮不更新主记忆。

[起点身份](identity-start.json)、[终点身份](identity-end.json)、[首次HTTP](http-start.json)、[全新attempt02 HTTP](http-attempt02-start.json)、[结束HTTP](http-end.json)均对应源码HTML SHA256 `b29927ed84a7110f3546ee03f526b70f63f4e21032b69ce7565d71e772d3d7b8`。另事后只读复核原始trace捕获的 **93份根HTML响应**，[全部匹配](http-trace-identity.json)；这是对真实响应原文核验，不用代码阅读替代浏览器测试。开始时曾在原测试服务切换间隙读取8765失败，该只读采集没有业务断言，正式独立测试在9865启动并核对HTTP身份后才操作，未冒称那次采集成功。

环境：Linux、Python3.12.14、Nodev24.19.0（与建议22不同）、Playwright1.58.2、真实Chromium154.0.8037.57。按云环境技能核查网络/凭据准备状态，不输出凭据；没有安装/调用付费GitHubActions。数据库、PDF、报价均在任务全新隔离目录，第一次夹具遗漏后第二次从新空目录重建；没有旧数据库/ZIP迁移输入。数值1979/6940/7064是任务明确要求的相同模拟报价口径，非真实业务资料。

## 2. 定向7项：全部完整通过

| ID | 原准确测试名称 | 定向 | 完整 |
|---|---|---|---|
| TARGET-01 | 05 PDF matching, manual correction, refresh and scoped supplier ZIP / 图纸询价包 | PASS | PASS |
| TARGET-02 | 07 real service disconnect and stale-tab 409 halt autosave / 自动保存失败 | PASS | PASS |
| TARGET-03 | 13 compact laptop item table after import / 1366首屏物料可见 | PASS | PASS |
| TARGET-04 | UX pending-only: filtered pagination and award state / 待决定筛选真实分页 | PASS | PASS |
| TARGET-05 | UX manual-only: buyer-approved amount distinct from suggested totals / 人工定标金额独立显示 | PASS | PASS |
| TARGET-06 | UX09 exact 1366 comparison density and first-row reachability / 比价紧凑性复验 | PASS | PASS |
| TARGET-07 | B3 tied-lowest manual award semantics and persistence / 并列最低定标与决策状态 | PASS | PASS |

本SHA自带原测试完全未改，以上7条均完整完成，不再停在旧失败点；包括刷新后的物料搜索/原PDF/双供应商ZIP、真实409及断线重启手动保存、1366首条物料完整可见、待决定分页、3个真实按钮人工金额，以及并列/高价理由和持久化。并不是单项独立PASS覆盖原套件FAIL。[原case及堆栈/附件](targeted-seven-results.json)、[全部逐例CSV](automation-cases.csv)。

## 3. UX09 P3实测：本SHA已消除既有失败

独立全新12物料、3供应商、确认多轮报价，1366×768进入比价、scrollY=0，普通可选真实报价首行：

| DOM指标 | 实测 | 验收 |
|---|---:|---|
| top |663.21875px|≥0|
| bottom |705px|≤768|
| height / 普通可报价行最大height |41.78125 / 41.78125px|≤44|
| viewport |768px|768|
| scrollY |0|0|
| 价格与详情中心Y |683.609375 / 683.609375|同排，偏差≤10|

**首条报价整行完整显示，不只是顶部进入首屏。** [原始首屏截图](attempt-02/evidence/UX09-1366-real-priced-first-screen.png)、[DOM测量](attempt-02/evidence/UX09-independent-before-awards.json)。真实详情仍可展开，展开不误定标，明确点击价格按钮仍有效；商条、阶梯价、价格与人工/建议金额没有删掉或截断。原UX09测试在定向和完整中均走完所有几何/详情断言。

边界观察（非三尺寸首屏通用PASS）：1024×768报价首行top=841.21875、bottom=883，须垂直滚动；1600×900首行top=858.390625、bottom=900.171875，底边略过900。此轮“整行首屏”严格门槛只针对1366×768；其他两尺寸验证正常滚动可达、无容器裁切/整体水平溢出，不谎称三尺寸首屏都完整。建议后续继续统一不同断点的纵向密度。

1024×768、1366×768、1600×900各7主要页面实操，共21布局，documentWidth均等于viewport，无整体横向溢出；长物料身份按需求省略并提供完整hover，完整列/详情入口可操作，键盘Enter导航实际有效，页面视图操作不改变SQLite/PDF。三尺寸下单一常驻保存状态、真实pending/409及技术详情也实测。截图：[1024比价](attempt-02/evidence/UX-1024-quotes.png)、[1366比价](attempt-02/evidence/UX-1366-quotes.png)、[1600比价](attempt-02/evidence/UX-1600-quotes.png)，原始[21布局](attempt-02/evidence/three-size-layouts.json)、[行高汇总](row-density-summary.json)。不把有限场景扩展为所有字体/分辨率/无障碍都通过。

## 4. 完整原自动化

| 原命令 | 实际结果 | 日志 |
|---|---|---|
| `python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'` |44PASS，exit0|[stderr](automation/phase2/python-backend/stderr.log)|
| `npm ci`，任务可写cache |exit0|[command](automation/phase2/npm-ci/command.json)|
| `npm test` |10PASS，exit0|[stdout](automation/phase2/node-business/stdout.log)|
| `npm run test:e2e` |56PASS/0FAIL，exit0，0skip/0retry|[stdout](automation/phase2/chromium-e2e/stdout.log)|

先完整执行定向7项，再Python/npmci/Node/完整Chromium；独立浏览器在第二次npmci结束后启动，避免依赖替换竞争。完整与独立分用端口/数据目录，保留实际耗时，未改变timeout/workers/retries或CI。不是重复跑CI冒充独立UAT；既执行任务规定原自动化，也另用采购员真实流程和独立文件/数据库核验。[命令/退出码汇总](automation-summary.json)。

## 5. 九组UX与核心业务实际证据

[逐项结果](results.csv)：UX01–09全部PASS。本SHA新数据验证通俗中文、唯一且真实的保存状态/技术详情；中文项目名、内部稳定身份；独占导航；常驻第一项目页；独立数据管理/重读取消；紧凑物料/图纸/供应商横排及52行分页；本节与第3节比价布局。

从真实Excel预览/确认12项开始，同码不同规格不合并身份；图纸1/2/0候选、确认前不写入、人工匹配到明确行并打开原件PDF逐字节相同。甲乙各12分配、丙2，追加/重复/移除关系和两种视角不会覆盖其他供应商；52项预览50+2、确认全52，正式分页/筛选跨页选择保持。

报价真实文件/粘贴/手工，甲R1V1→V2→R2V1，总5份确认/50历史行，V1不变、锁定确认，缺报须9项明确沿用；当前数量阶梯价118及2.25真实适用。刷新/切换模式保持草稿，文件与沿用预览危险刷新被拒绝且数据库不变。真实待决定10+2，末页有效120选价移出，75/75并列无需错误理由；82对20高价理由必须真实填写，空白/取消不提交；不供货/未报价不等于0。

人工3项 **¥1,979.00**、理论 **¥6,940.00**、建议组合 **¥7,064.00**分开显示并持久化。自身范围甲6420/乙7185/丙990，甲乙共同10项6420/6665，不跨范围乱排名。实际下载供应商ZIP、全部嵌套ZIP、CSV及Excel，完成 **46项内容/CRC/数量/单价/金额/报价范围/PDF字节/内部字段隔离核验**，无竞争方或内部JSON/原因外泄。

新第二项目52项隔离，跨项目来回、F5、真实服务重启后四表每行/历史/PDF哈希相同。真实PUT暂挂，ACK前数据库不变、三尺寸不假报已保存、S4不可下载；取消重读保留草稿，200后真正持久化；真实两标签409拒绝旧版本、保留成功方所有数据及旧页未保存内容，F5回到成功版本。[实际导出核验](attempt-02/evidence/export-checks.json)、[持久化](attempt-02/evidence/CORE07-after-service-restart.json)、[真实409](attempt-02/evidence/CORE08-conflict-http.json)。

## 6. 当前版S4安全回归：完整通过

真实UI下载本版完整包，11项核验ZIPCRC、manifest数据库SHA、SQLite integrity、四表全部行字段和三PDF哈希；源数据不变。只改一份PDF的1字节文本C→T替换、长度不变，保留manifest/文件名/顺序，其余文件逐字节一致，全entry为 **ZIP_STORED**，重新计算正确ZIPCRC，13项构造预审通过，manifest期望SHA与实际改后PDF不符。

空目标实际UI拒绝400 **RESTORE_PDF_HASH_MISMATCH**；另用支持的Node HTTP捕获真实原body400 `RESTORE_REJECTED` / `RESTORE_PDF_HASH_MISMATCH`，不使用CDP Page Response.json；目标语义表/PDF、持久文件SHA、目录列表在两次拒绝后均不变，无资产/工作区发布，WAL/SHM易变文件另记不假称其字节稳定。这不是DEFLATED格式拒绝。

同一目标接着接受原合法ZIP200，所有两RFQ/历史/PDF与人工1979一致；非空UI拒绝及后端409 `RESTORE_TARGET_NOT_EMPTY` 后数据保持。[篡改预审](attempt-02/evidence/S4-tamper-preflight.json)、[真实拒绝审计](attempt-02/evidence/S4-audited-backend-rejection.json)、[目标前后](attempt-02/evidence/S4-empty-target-before.json)、[合法恢复](attempt-02/evidence/S4-positive-control-restored.json)、[非空拒绝](attempt-02/evidence/S4-nonempty-backend.json)。之前SHA的S4 PASS没有直接迁移为本次PASS。

## 7. 一个夹具遗漏、原始证据与边界

第一次独立尝试的7个已执行scope真实通过到三尺寸UI；导出实物已生成、前24项检查通过后，validator读取未生成的 `fixtures/business-expected.json` 抛FileNotFound。是**测试夹具前置遗漏**，不是产品导出错误。原错误、部分结果、trace/截图和当时输入夹具均保留，未写回假PASS。补充任务指定A/B期望价数组（不改任何产品/原测试/validator断言）；只在文件副本上预审46项通过（不计UAT）。然后新空attempt02从头重建全部独立采购与S4流程并完成。仅1次记录的夹具补全，[登记](driver-fixture-correction-01.json)、[路径差异](correction-paths.diff)、[原始错误](independent/evidence/raw-first-error.json)、[原trace](independent/evidence/trace-first-attempt.zip)。这次错误不能与旧SHA两次修正混算/抹掉。

完整成功trace：[attempt02](attempt-02/evidence/independent-trace.zip)。共117张原始独立截图，全部可获取原套件trace/服务/浏览器日志与HTML报告无损归档，文件SHA回验，见[原始证据解包](README-raw-evidence.md)、[校验和](SHA256SUMS)。没有删掉失败尝试，也不将副本validator预审算成新增业务PASS。

**NOT TESTED 3组**：原生Windows Python3.13、Node22、PowerShell/BAT/本机启动安全。Linux及Node24不代替这些；GitHubActions本轮NOT RUN。旧模拟数据迁移按D024排除，桌面Excel/真实ERP所有语义、其他浏览器/字体/穷举负载/故障/无障碍未覆盖。未发现本准确SHA下已确认P1/P2/P3；结论仅限列出路径。

交ChatGPT审核：六条原测试及UX09已在当前SHA真实收口，云端范围READY；按D022，原生Windows与用户单独合并授权仍缺，因此 **M1合并门槛NOT READY**。本轮只追加现有PR50新目录，不创建新PR/Issue，不修改产品、既有测试、CI、开发/main/M1分支或主记忆，不合并/关闭任何PR。
