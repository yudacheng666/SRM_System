# WIN-03 买家计划 V2：PLAN BLOCKED: NEEDS REVIEW

任务：[PR50 / 6520453902](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6520453902)。日期：2026-10-30。冻结产品/原测试 SHA：**2aaa478c8f1966e41b9372d9d989c383dbaa1972**。

**本轮没有完成可交给 Windows 直接执行的完整买家脚本。** 已实际准备全流程候选动作、模拟文件、弹窗策略与保存/恢复断言合同，并执行静态检查。完整执行预检仍拒绝授权，按任务规定报告 **PLAN BLOCKED: NEEDS REVIEW**，没有自动进入 Windows。

## 实际结果

| 本轮范围 | PASS | FAIL | 结果与边界 |
|---|---:|---:|---|
| 原 V1 工具测试，字节不变的副本 |84|0|Node 静态/模拟测试，不是 Windows 业务复测|
| 新增全计划/夹具/源码正负测试 |40|0|含后置文件非法时零启动/连接/业务请求/写入|
| CJS 语法检查 |14|0|9个V1文件 +5个新文件|
| 模拟文件结构/哈希 |14|0|4 XLSX、6 CSV、4 PDF；PDF仅结构检查，不是渲染PASS|
| 全部买家候选文件 |—|—|9文件/219步，源码锚点及元数据检查通过；**完整执行BLOCKED**|
| V1能理解的原生输入投影 |108|0|8文件中的输入schema PASS，不是219步/整个业务通过|
| 其余控制/断言步骤 |—|—|111步 /7类能力 **NEEDS REVIEW**|
| 真实WIN-03 /全部业务步骤 |0|0|**NOT TESTED**：本轮禁止真实执行|

最终工具用例 **124 PASS /0 FAIL /0 SKIP**，不是124个采购业务用例。语法/夹具/投影与工具测试重叠，不能再相加。中间编写/检查器错误和失败日志全部保留，见[原始错误登记](raw-error-register.json)。

## 已落地的候选计划和资料

[完整清单](buyer-manifest.json)依次列出九份 purpose=buyer-plan 文件，不是原38步contract-test：

1. [新隔离目录UI重建A/12行/2供应商](actions/00-baseline-rebuild.json)；
2. [SUP-A/B显式完整confirm、12+12关联、保存/F5合同](actions/01-supplier-allocation.json)；
3. [PDF上传、指定Line ID/版本、同名同版本异哈希拒绝、版本B](actions/02-drawing-upload-version.json)；
4. [单家/全部供应商ZIP及PDF字节隔离](actions/03-supplier-packages.json)；
5. [部分报价提交取消/接受、五prompt取消、重叠阶梯拒绝、R1/V2/R2/沿用/手动修订](actions/04-quotes.json)；
6. [最低价、非最低价DOM理由、人工2项¥63、比价下载](actions/05-comparison.json)；
7. [F5、专属BAT重启/离线保存、独立B项目、切换/持久化](actions/06-persistence-offline.json)；
8. [完整备份下载、另一空目录恢复、非空UI阻止及独立409路径](actions/07-backup-restore.json)；
9. [1366×768首条真实报价、960布局](actions/08-layout.json)。

每步保留selector/操作、分支、弹窗策略、冻结源码范围、UI/数据/revision/证据合同。[覆盖表JSON](source-to-action.json) / [CSV](source-to-action.csv) / [逐项结果](results.csv)。这些合同**不是已经实现或执行成功的后置断言**；机器报告明确写 SPECIFIED ONLY。

[14份模拟文件及哈希](fixture-manifest.json)：物料/供应商XLSX复用旧证据的同一虚构fixture，重新校验其内容及哈希，**没有导入旧SQLite或转移旧PASS**。计划选择全新目录经UI重建，不复用已关闭的旧Windows目录/PID。物料TST-001…012、RFQ-L00001…012、数量2…13；供应商SUP-A/B。其他报价CSV/XLSX及四份具有正确xref/stream长度的PDF本轮生成；PDF真正渲染、上传及下载均 NOT TESTED。

## 源码审核实际确认的细节

- 用冻结源码的真实parseQuoteRows、validateQuotePreview、planQuoteImportCommit，在无DOM/网络/数据库的隔离VM中计算：部分提交有效1行、拒绝1行，明细为 **“3 行 BAD：多报”**，不是旧V1假设的“2 行”。[源码片段、行号、哈希及计算](source-review/quote-fixture-evaluation.json)。全文confirm的取消和接受分别显式列出；旧V1不改。
- 重叠阶梯触发原生alert：“没有可写入的有效报价；全部 1 行仍在预览中供修改。”；明确未报价的适用价格是null，不是0。五prompt默认值及逐位置取消策略明确保留。
- 同名同版本PDF异内容错误来自DOM的pilotDrawingInfo，不是原生alert。service.store先于UI冲突检查，可能留下**未引用原件**：要求关联/历史不变并单独盘点原件，不能错误要求全部asset字节/数量不变。3条PDF关联也不代表只有3个登记asset；完整备份必须核对全部登记原件。
- 普通非空恢复由buyerMode分支提前返回，**零restore请求、没有confirm、没有HTTP409**。后端409是另一条路径，必须有经审核的“旧空页面 +另一GUI session填入目标”专门fixture。此项仍 NEEDS REVIEW，不能用DOM提示或历史API证据补记409通过。
- 实际备份入口是uiAdminToggle，不存在workspace侧边tab；F5后需重新核查页面/选择状态。初次候选错误和修正源均保留，没有拿Windows试错。

VM结果只是纯源码/夹具模拟，**不是正式程序端到端业务PASS**。

## 阻止完整计划执行的七类缺口

[机器清单（精确file/stepIndex/selector例子）](needs-review.json) / [能力清单](capabilities.json) / [全量预检](preflight-final.json)：

1. **view-controls**：V1没有select、幂等checked、ensure-open、具名异步等待及PDF文件动作执行器。例如pilotDrawingLine选RFQ-L00001、pilotDrawingFiles选PDF，不能靠V1仅接受XLSX的file规则执行，也不能换成未检查checkpoint。
2. **save-sqlite-oracle**：V1把pending→saved、SQLite revision/data、F5存为文字；尚无预先监听、真实PUT200/事件revision对应、read-only SQLite、历史/PDF一致性的可执行断言。初始revision须动态捕获，不能用旧运行1/2/3。
3. **download-oracle**：无真实下载事件、完成文件定位/哈希、嵌套ZIP/XLSX/PDF内容核验执行器。模拟fixture不能冒充下载。
4. **pdf-preview**：独立PDF target/session与渲染检查未接入V1；不得绕过外来session保护盲目ACK。
5. **windows-lifecycle**：无经审核的专属BAT父子PID/端口所有权、中文空格工作目录、离线/重启、空目录切换执行器；不得复用旧PID/目录或停止未知服务。
6. **nonempty-409-race**：普通非空GUI不会发请求，需要另定双session真实GUI填充/旧页面fixture及准确对话框、目标身份、前后字节条件。当前仅候选，没有执行授权。
7. **layout-observer**：无视口设置、首行实际裁剪/遮挡/截图断言执行器；静态CSS/坐标期望不代表真实1366/960可见。

这是**独立测试工具/计划未完成**，不是确认产品缺陷。本轮未满足“完整可执行buyer-plan所有动作PASS”的目标；不能安排下一次WIN03实跑。没有删除、跳过或宽松接受111步。

## 复核方法与原始记录

V1的9个CJS源、策略及原合同/负向文件，以**14个字节相同文件**放在[toolchain-v1](toolchain-v1)，[来源/哈希](v1-provenance.json)固定为af8d185e5f2cd80ecb9c8edeb824d306ab5c43b2。只在新目录副本执行会写mock日志的单测；旧V1证据只读。新代码只有生成器、只读审核、全清单预检和静态测试，**没有另写可绕过V1的浏览器驱动**。

实际命令/退出码：[commands.json](commands.json)，首轮列表另保留[commands-initial.json](commands-initial.json)。设置SRM_PRODUCT_ROOT及SRM_FROZEN_SOURCE指向准确冻结源码后：

~~~text
node --test --test-isolation=none --test-reporter=tap toolchain-v1/schema.test.cjs toolchain-v1/runtime.test.cjs toolchain-v1/adapter.test.cjs
node --test --test-isolation=none --test-reporter=tap buyer-plan.test.cjs
node fixture-audit.cjs
node buyer-preflight.cjs <fixed-product-root> preflight-final.json
~~~

前两命令退出0，逐例TAP：[84项](logs/v1-84-final.stdout.log) / [40项](logs/buyer-static-final.stdout.log)。最后命令**退出2/BLOCKED**，219步全部审查，0结构/绑定错误，111待审；不是只看前一个文件。[后置文件非法时模拟launch/connect/HTTP/write全0](logs/late-file-zero-effects.json)。

原V1 CLI直接接收9份候选也退出2：[完整拒绝证据](v1-whole-buyer-rejected.json)。108输入投影只覆盖8文件，供应商包文件全是新控制动作，省略项已披露。**原38合同PASS、108输入投影PASS都不代表完整计划PASS。**

所有编写/工具错误保留：首次不存在的导航selector、检查器双编译、PDF只读auditor索引、Node默认隔离只报文件级结果、一次诊断遗漏环境变量，以及选择状态审查前的记录。修正仅涉及新证据工具；产品/原测试/旧V1不改。最终84/40使用现有Linux Node24.19.0的test-isolation=none提供逐例结果，不替代Windows Node24.22.1结果；没有安装软件。

## 版本、安全与未测

[146个冻结产品/原测试/CI文件](source-verification-final.json)全部Git blob/SHA256匹配，detached HEAD准确，产品工作区干净。HTML SHA256：**bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3**。本轮无HTTP服务、**无实际HTTP页面身份、无Windows截图/trace**，不伪造；EventEmitter/FakeWebSocket日志是mock证据。

真实浏览器/CDP/业务HTTP/业务数据写入**均0**。未重跑Linux112、WIN01 Python44、WIN02 Node10；GitHub既有PASS仅为背景。本轮无确认产品P1/P2/P3缺陷。WIN03保持此前 **PARTIAL/BLOCKED**；后续真实Windows范围仍 NOT TESTED；**M1 NOT READY**。

只新增本轮目录；不改产品、原测试、CI、项目主记忆、开发分支/main/M1或旧报告，不安装软件、不触发Actions、不合并/关闭PR。PR48由ChatGPT审核更新，本轮不改。必须先完成七类执行能力及全清单预检，再另行明确授权真实Windows。
