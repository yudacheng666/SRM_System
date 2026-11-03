# PR #46 独立业务续验报告（TEST-ONLY）

结论：**NOT READY**。本轮指定 14 组已实际执行，**12 PASS / 2 FAIL / 0 BLOCKED / 0 NOT TESTED**；另有原生 Windows 3 组 **NOT TESTED**。失败为两项可复现的设计/体验缺口，未发现已确认的数据破坏、供应商数据泄露或不安全覆盖恢复。计算、持久化和恢复检查通过不等于完整产品验收通过。

## 1. 版本、授权与环境

- 唯一产品 SHA：`c2737f0221a7b529114da2df363e062e75c7544c`，产品 PR #46 / `feat/20261022-srm-ui-ux-structural`，开始/结束均核对；实际程序来自独立 detached checkout `/tmp/srm46-product`，并非原型或合成合并版本。
- [本轮授权](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6337193999)。已读当前 M1 的 AGENTS、PROJECT_STATE、DECISIONS、PR #44 设计及矩阵、PR #48 未合并记忆提案、PR #50 报告和两次历史驱动错误。PR #48 不作为已生效合并内容；不修改项目记忆。
- 新证据只追加到现有 PR #50 的本目录；此前 `75a06ab23a5e2d93c169651f511ccbedb035e468` 下旧报告及原始证据完整保留。旧轮“0 PASS / 1 BLOCKED / 13 NOT TESTED”不追溯改写。
- 旧有 Python43 + Node10 + Chromium49 = **102 PASS 仅引用历史结果，本轮没有重复执行**。本报告不是 GitHub Actions PASS，未使用 Actions/付费托管 runner，也不代表 Windows 等效通过。
- 云端 Linux / Python3.12.14 / Node24.19.0 / Playwright1.58.2 / 实际 Chromium154.0.8037.57。正式 M1 前后端通过仓库现有 serve.py 启动。使用三个全新隔离 SQLite 源目录及独立恢复目标；仅虚构询价、供应商、价格、条款和 PDF。
- 实测主要时间 2026-10-22 09:24–09:37 UTC（17:24–17:37 UTC+8）；原始日志采用 UTC。起始 HTTP HTML 与 checkout SHA256 一致，见 [identity-start.json](identity-start.json)。保护分支起止 refs 相同，旧证据树起止清单相同。

## 2. 方法、数据与执行边界

先预审实际 DOM、动态按钮、面板开闭和异步解析完成条件：使用真实标签“多个候选·需确认”；导入按钮先等待 visible/enabled 与实际预览行，不重复 toggle 隐藏控件。使用真实浏览器操作，API/SQLite 仅用于独立核对结果，不通过 API 构造业务结论。

建立 12 行虚构物料（两行同编码、不同规格和 RFQ Line ID）、3 家供应商：甲乙各分配12行，丙只分配第1/5行。3份虚构 PDF 分别产生1/2/0候选；人工将多候选指向第2行、未匹配指向第4行，唯一匹配第3行。预览前后不产生业务提交；确认后核对 SQLite 身份和 PDF 原名/字节。

甲 R1V1→R1V2→R2V1，乙一轮，丙手动两行；覆盖真实 XLSX、粘贴、手动输入、3行第二轮范围+9行明确带入、来源凭证与条款草稿、锁定历史及适用阶梯价。共5份确认报价、50条历史报价行。未报价/不供货不视作0。

本轮两次驱动修正按新授权记录、冻结方法、保留失败并从新隔离目录重测；没有修改产品、既有测试、CI、开发分支、main 或项目主记忆。没有第三次驱动错误。UI 设计缺口不涉及已证实的数据破坏/安全风险，因此继续其他安全独立检查，未绕过关键产品失败。

## 3. 逐组结果

| ID | 结果 | 实测内容与关键事实 |
|---|---|---|
| Q01 | PASS | 实际第二轮 XLSX 导入3行并明确带入9行；确认后12行身份正确 |
| Q02 | PASS | 未确认文件预览、带入选择及条款/来源草稿刷新保护；无提前提交；最终保存 ACK 与真实 API/SQLite 一致 |
| Q03 | PASS | 同轮 V1/V2 差异、轮次历史锁定；修改经新版本，不覆盖已确认历史 |
| Q04 | PASS | 精简7列→完整12列→精简7列；真实行详情可达，切视图不改业务数据库 |
| C01 | PASS | 12项真实待决定分页10+2，第2页 RFQ-L00011/12；选择第12行后正确移除；最终人工3/待决定9，总体仍12 |
| C02 | PASS | 第4行甲不供货、第6行甲未报价；乙有效；第1行数量5适用118，第7行数量100适用2.25，无零价伪最低 |
| C03 | PASS | 第5行甲乙同报75，选择乙无需高价理由；展开详情不自动授标；并列待核对正确清除 |
| C04 | PASS | 第2行乙82高于甲20：取消不选、空理由不可提交、填写后保留；F5/重启/恢复后理由和人工身份一致 |
| C05 | FAIL | 自身/共同范围、理论总额、实际 CSV/XLSX 全部数值检查通过；缺少独立人工已选金额1979（P2 UX-01） |
| W01 | PASS | 两 RFQ 隔离切换、F5、服务重启、真实保存确认；全部业务行、历史与 PDF 保持；顶部重复状态另列 V01 |
| W02 | PASS | 三 PDF 1/2/0候选、明确行关联、确认前无提交、原名字节与 SQLite 身份一致 |
| W03 | PASS | 单独及全部供应商 ZIP；甲乙12行各3PDF、丙2行0PDF；请求价空白，无内部 JSON/其他供应商泄露；实际下载核验 |
| W04 | PASS | S4 CRC/manifest/SQLite 四表/PDF 完整；实际空目录恢复200且内容完全一致；非空 UI 阻止并由独立 HTTP409验证，数据不变 |
| V01 | FAIL | 三尺寸导航/可达性/滚动/键盘检查通过；顶部旧技术状态重复展示，不符合单一简明保存状态设计（P3 UX-02） |

机器可读逐项结果见 [results.csv](results.csv)。Win01 原生 Python3.13、Win02 原生 Node、Win03 PowerShell/批处理启动均 **NOT TESTED**：没有真实 Windows 环境，不由 Linux 结果推断。

## 4. 已确认问题

### P2 UX-01：没有独立显示人工定标金额（C05，业务展示/操作体验）

页面：比价议价 → 金额分析。设计依据：PR #44 设计 §5.1 和金额口径条款要求理论最低、共同范围、人工确认组合分别命名，未确认项不能冒充定标。

复现：按上述数据录入报价；选第12行甲120×12、第5行乙75×5、第2行乙82×2（填写虚构高价理由）；展开金额分析。人工仅3行、9行待决定，独立计算 **1440+375+164=1979**。

预期：单独显示“人工已确认3项 / ¥1979”，并与理论及建议口径区分。实际：显示理论 **¥6940**、**当前建议/已选组合 ¥7064（12项，含自动建议）**，没有人工1979汇总。7064的标签诚实且数值正确，不是价格算法错误/数据损坏，但采购员难以直接知道已承诺金额。

证据：[实际行金额与分析文本](manual-amount-proof.json)、[完整分析截图](attempt-02/evidence/OBS-manual-amount-not-separated.png)、[1600分析截图](attempt-03/evidence/V01-1600-comparison-analysis.png)。建议 ChatGPT 增加仅纳入有效人工确认且不含待复核项的独立金额/数量；保留已有正确建议口径，不由测试方改代码。

### P3 UX-02：顶部旧技术保存状态与新状态重复（V01，UI/操作体验）

页面：报价回收/比价等工作页顶栏，三尺寸均可观察。设计依据：PR #44 UX-W01/UX-W02，主状态简明可读，版本/时间等诊断按需展开。

复现：完成真实保存，关闭技术详情，进入报价回收或比价。预期：一个权威的简明保存状态；技术版本时间在详情内。实际：新上下文“已保存”旁仍有旧 `#srmV2LiveStatus` 完整技术镜像，例如“自动保存：已同步第10版；无待保存修改”。真正技术节点已移入详情，但镜像仍在头部，形成重复与阅读噪声。

证据：[1366原始截图](attempt-03/evidence/V01-1366-quotes.png)、[1024原始截图](attempt-03/evidence/V01-1024-quotes.png)。真实保存确认检查通过，本问题不等于假保存或丢数据。建议保留一处简明权威状态，将镜像版本/时间放入技术详情。

没有已确认 P0/P1、金额计算破坏、危险恢复覆盖或供应商泄露。上述 P2 是设计验收缺口，不是关键数据安全故障。

## 5. 实际金额、下载与恢复证据

甲自身有效10项 **6420**，乙12项 **7185**，丙2项 **990**，不同范围不直接排名。指定甲乙共同10项：甲 **6420**、乙 **6665**；CSV 实际核对全部10行 ID、数量、适用单价和行金额。理论12项 **6940**；建议/已选12项 **7064**；人工3项 **1979**。内部比价 Excel 实际验证12行、第12行单价120、第2行82与高价理由。共 [46项文件核验](attempt-02/evidence/export-checks.json) 通过，不代替14组计数。

S4 [11项归档核验](attempt-03/evidence/s4-checks.json) 通过：CRC、数据库 manifest SHA256、SQLite integrity_check=ok、app_state/workspaces/workspace_versions/assets 全行全字段及3份 PDF SHA256。实际 UI 空目标恢复返回200并自动重载，2个RFQ、所有历史、3项人工决定和原件一致。已非空目标 UI 清晰拒绝、不发第二次恢复 POST；额外同源 HTTP 验证返回 [409 RESTORE_TARGET_NOT_EMPTY](attempt-03/evidence/nonempty-restore-response.json)，拒绝前后所有业务行与 PDF 字节不变。新 source 通过恢复上一尝试的实际虚构 ZIP 仅重建前置数据；随后重新下载新的 S4 并在另一个真正空目录复验，未把 setup 当恢复验收。

## 6. 三尺寸 UI

在1024×768、1366×768、1600×900各实际操作物料、分配、报价回收、比价、数据与备份五页面（15个主要布局），并操作精简/完整/详情、报价矩阵横向滚动、仅看待决定和 S4 入口。页面无整体横向溢出；1024表格需局部横滚，RFQ身份列保持可见、详情和按钮可达。键盘 Enter 导航及可见焦点通过；操作前后业务历史/PDF不变。

| 尺寸 | 原始报价页 | 原始比价页 | 派生总览（仅便于审阅） |
|---|---|---|---|
| 1024×768 | [截图](attempt-03/evidence/V01-1024-quote-compact.png) | [截图](attempt-03/evidence/V01-1024-quotes.png) | [联系表](visual-overview-1024.png) |
| 1366×768 | [截图](attempt-03/evidence/V01-1366-quote-compact.png) | [截图](attempt-03/evidence/V01-1366-quotes.png) | [联系表](visual-overview-1366.png) |
| 1600×900 | [截图](attempt-03/evidence/V01-1600-quote-compact.png) | [截图](attempt-03/evidence/V01-1600-quotes.png) | [联系表](visual-overview-1600.png) |

见 [visual-metrics.json](visual-metrics.json)。两行RFQ身份行实测约54.69px、主体13px；设计40–44px允许换行例外，本轮不单凭高度另判缺陷。非逐像素/全可访问性认证，P3 重复保存状态仍导致 V01 设计结论 FAIL。

## 7. 本轮两次驱动错误与恢复

1. CONT-DRIVER-01：首次运行的异步 waitForFunction 保存辅助函数在正常空闲自动保存前提前返回，随后把未提交 SQLite 与内存草稿作比较而失败。刷新保护本身通过，断言前没有该草稿保存请求，不能归为产品保存失败。保留 [原始错误](attempt-01/evidence/raw-first-error.json)、[实现证据](attempt-01/evidence/playwright-predicate-implementation.txt)、[trace](attempt-01/evidence/trace-first-attempt.zip)。修正为 Node expect.poll 等待真实快照/API/界面保存状态；原深度等式断言保留；新目录 attempt02 重测通过。[修正记录](correction-01.json) / [diff](correction-01.diff)。
2. CONT-DRIVER-02：S4 校验器将本地 `assets/xx/hash.pdf` 路径直接与归档约定的 `assets/hash.pdf` 比较；三份原件 SHA 已全部相同，四表、CRC、manifest和integrity已通过。属于验证路径键错误，不是丢图纸。保留 [原始失败](attempt-02/evidence/s4-checks.json)、stderr、[trace](attempt-02/evidence/trace-first-attempt.zip)。按既有归档契约规范化 basename，仍校验全部范围/数量/hash/manifest/数据库，未放宽业务断言。新源及新空恢复目录 attempt03 受影响 W04 重测11项通过，再完成 V01。[记录](correction-02.json) / [diff](correction-02.diff)。

两次修正均为独立驱动/校验器，未改已有测试。三次尝试原始浏览器检查分别31通过/1失败、89通过、56通过；这不是套件或UAT组数。C05/V01 原始驱动 PASS 只覆盖数值/几何子检查；最终独立设计审阅仍判 FAIL，未改写原日志。冻结方法旧前缀有 W04=图纸、W02=保存状态，最终分组按任务定义映射到 W02图纸/W01保存/W04-S4，见 [错误登记](raw-error-register.json)。

## 8. 证据与后续

本目录保存57张原始操作/异常截图、3份原始trace、3张派生联系表、每次浏览器日志、服务日志、失败原件、下载ZIP/CSV/XLSX、虚构夹具和各尝试冻结方法。`methods-final` 是最终独立驱动归档；各 attempt 的 methods 保留当时版本，不能把最终路径重绑定误当早先实际代码。可用 Playwright trace viewer 本地打开 ZIP。用 `sha256sum -c SHA256SUMS` 验证证据。

仍未测试：3组原生Windows、系统性网络/磁盘故障矩阵、全部可访问性/像素一致性以及正式GitHub Actions环境。本轮没有通过推断填充这些范围。下一步由 ChatGPT 处理 P2/P3设计缺口、审核本证据；修复后仅针对受影响范围复验。正式发布仍需准确最终SHA的CI和所有者批准。PR #46/#50 保持 Draft、未合并，本报告不宣布整体软件验收完成。
