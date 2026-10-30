# WIN-03 静态弹窗审计 V1（冻结产品SHA）— Windows重跑前置门槛

**本评论是静态审计结果与驱动整改规范，不是Windows验收报告。** 只审查冻结产品 `2aaa478c8f1966e41b9372d9d989c383dbaa1972` 的 `prototype/m1-lite/index.html` 和PR50现有独立动作驱动。没有启动浏览器或业务服务，没有运行Windows采购流程。

## 1. 已从冻结源码确认的弹窗业务路径

| 计划业务动作 | 产品函数/位置 | 原生弹窗 | 可确认策略/文案 | 后置条件/证据 |
|---|---|---|---|---|
| 物料导入确认 | `addRowsToRfq` L4087–4117 | 成功 `alert`；冲突时另有条件 `confirm` | 成功提示前缀“新增”；冲突确认全文含“是否明确保留为独立 RFQ 询价行？”；冲突场景必须单独fixture，不能误接收 | UI行数、pending→saved、精确workspace SQLite items/revision、F5 |
| 供应商批量分配 | `applySupplierBulkChange` L5013 | `confirm` | 文案前缀“即将变更”，含物料数、供应商名、隐藏筛选项警告；只对预先声明的SUP-A/SUP-B接受 | 分配关系按每行/供应商只读核验；保存ACK/revision；F5 |
| 物料原位编辑 | `saveItemEdit` L3774 | `confirm` | “保存此询价行修改？RFQ Line ID 和已分配供应商保持不变。” | 字段变更，Line ID/供应商关联不变，保存与刷新 |
| 图纸解除关联 | unlink handler L5522 | `confirm` | “解除当前物料与这份图纸的关联？” | 当前行关系移除、原PDF仍存在、其他行关联不变、保存 |
| 图纸批量关联 | batch drawing accept L5689 | `confirm` | “确认将…份 PDF 关联到…条 RFQ 物料？” | 每个PDF哈希、Line ID、版本关系准确；保存ACK、重载与包内容 |
| 报价行编辑 | `editQuoteLine` L4609–4611 | **连续5个 `prompt`** | 单价/阶梯价、交期、MOQ、状态、备注；每个prompt按顺序分别核对默认值/输入；取消任一个必须安全取消整次编辑 | 该轮该行字段准确更新、报价历史版本/状态不被静默覆盖、保存/F5 |
| 报价轮次确认/锁定 | quote-round confirm handler L4653 | 条件 `confirm` | 仅当漏报/多报/重复存在时触发；动态文案以实际覆盖计数精确匹配 | 轮次状态confirmed、覆盖统计准确、历史不可变、保存/F5 |
| 报价导入部分提交 | quote import L4696 | 条件 `confirm` | 仅有skipped行时触发；“是否只提交 N 行？”且错误行留在预览 | 仅valid行写入，skipped仍在预览；保存/F5 |
| 报价沿用 | carry-forward handler L4749 | `confirm` + 成功后 `alert` | “确定按原轮次和原条件沿用…”；后续成功alert“已按供应商确认依据沿用…” | 仅选定行加入新轮次，漏报状态不变，依据留存，保存/F5 |
| 供应商移出询价 | supplier remove handler L4929 | `confirm` | “将…移出本次询价？” | 关联删除范围准确；有历史/报价保护时不应触发确认；保存/F5 |
| S4完整恢复 | `restoreS4Full` L6381 | `confirm` | “确定将完整备份恢复到当前空白数据目录？” | 只允许全新空目录；restore成功计数、重载后工作区/图纸校验；非空409拒绝且原数据不变 |
| 导出全部供应商包 | export-all L6720 | **条件 `confirm`** | 缺图/版本待确认时询问是否只导出已完成部分；动态缺图/待确认计数必须精确 | ZIP真实下载、供应商隔离、PDF原字节、文件名与内部清单 |
| 导出单家供应商包 | export-one L6755 | **条件 `confirm`** | 仅withDrawing且missing/pending非零时询问是否导出已完成部分 | 下载ZIP/Excel，供应商范围与PDF字节准确 |
| 新建/恢复/切换历史询价 | `beginBuyer` L6061–6062、`recover` L6070、`switchArchived` L6084 | 条件 `confirm` | 有未保存修改时分别确认放弃；新建空白询价也会确认 | 当前数据按选择保留/放弃，不误覆盖历史；workspace身份和revision正确 |

### 仍需在动作JSON定稿前逐项确认（NEEDS REVIEW）

- 图纸上传/版本确认、图纸关联预览的具体触发控件与条件分支；已确认L5689关联最终confirm，但上传错误/哈希冲突会走异常提示。
- 报价手工添加/粘贴导入、阶梯价、漏报/多报覆盖的具体fixture是否必然进入上述confirm/prompt分支；没有触发条件的步骤应声明 `dialog:none`，不能凭源码存在就预设弹窗。
- S4非空目录拒绝是产品UI的阻止提示还是服务端409反馈，必须分别核对；不能把服务端409当成原生dialog。
- 静态扫描58 alert/20 confirm/6 prompt是源代码调用表达式总数，很多是校验/异常分支；不把总数伪装成58/20/6个正常业务弹窗。

## 2. 本轮暴露的驱动架构缺口

现有 `act-alert.cjs` 仅在动作JSON显式写 `type:"dialogClick"` 时，才先监听 `Page.javascriptDialogOpening`、同session执行 `Page.handleJavaScriptDialog`、等待 `javascriptDialogClosed`，最后await原click Promise。普通 `click` 不具备该保护。当前动作脚本 `06-assign-all.json` 将两个已知confirm选择器写成普通click；修正提案 `06-assignment-proposed-NOT-RUN.json` 虽然正确，但没有执行。

**因此不能只靠人写“请记得dialogClick”。必须有浏览器启动前的动作静态预检。**

## 3. 必须实现的 TEST-ONLY preflight 规则（待Codex实现和测试）

1. 建立版本化 `dialog-policy.json`，以产品SHA、动作名称、selector/业务操作、允许dialog type、精确/受控文案匹配、accept/cancel、触发条件、持久化后置条件为字段；不允许泛化的“accept any dialog”。
2. 所有动作JSON先通过严格schema：未知step type、缺少selector、dialogClick缺type/message/accept、prompt缺promptText策略、未知selector、未声明dialog策略均拒绝。每个会触发页面状态变更的click必须明确声明 `dialog:"none"` 或 `dialog:"expected"`；不能默认none。
3. 对静态已知会触发dialog的selector/function，普通click必须**在启动Edge/连接CDP之前**被拒绝。例：`#supplierList [data-add='SUP-A']`、SUP-B必须是confirm；不能只运行后再发现。
4. 预期弹窗必须先监听同target/session事件，点击Promise先启动，出现后严格核对type+message，再同session handle；等待DialogClosed和原click完成。prompt必须显式传入预定文本；不接受不匹配或未知弹窗。
5. 普通click声明dialog:none但运行时收到dialogOpening：不自动accept/deny，立即记录完整事件和原文、标记UNDECLARED_DIALOG并安全停止；避免再等待12s才发现。不能为继续测试而盲目处理未知confirm/prompt。
6. 正向/负向单测必须覆盖：已知confirm+普通click拒绝；已知confirm+匹配dialogClick通过；type不匹配拒绝；message不匹配拒绝；prompt未声明输入拒绝；未知selector/step拒绝；dialog:none遇运行时dialog安全停止；同session opening→ack→closed→原click Promise完成顺序；动态文案用显式受控模板匹配而非忽略文案。
7. preflight失败时必须保证零浏览器启动、零HTTP业务请求、零业务数据写入。输出机器可读报告，列出动作文件、step索引、selector、期望策略、实际策略及失败原因。

## 4. 执行边界与当前结论

- 先在PR50新增版本化静态审计/驱动/preflight文件与Node内置 `node:test` 的纯静态正反向测试；这些文件只能在PR50测试证据目录，不碰产品、原始测试、CI。使用冻结产品SHA的源码副本/引用，不修改原件。
- 只有静态预检所有动作PASS、负向测试能证明错误动作被浏览器启动前拦截后，才允许另行授权的真实Windows WIN03继续；本评论**不授权本轮Windows执行**。
- 当前WIN03：物料alert+12行SQLite自动保存/F5 PASS；供应商导入2家PASS；供应商分配 BLOCKED（普通click漏处理confirm）；PDF/ZIP/报价/S4等 NOT TESTED。整组NOT READY。
- Linux112、WIN01 Python3.15 44、WIN02 Node24 10不重跑；产品SHA `2aaa478c8f1966e41b9372d9d989c383dbaa1972`不变；不修改产品/原测试/CI，不触发Actions、不合并/关闭PR。
