# WIN-03 ONLY · 物料确认 alert / CDP Dialog 生命周期专项纠偏 + 真实采购员续验 (TEST-ONLY)

**这是一条新测试交接，尚未执行。** [上轮完整证据](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6516034954) 和 [独立驱动目录](https://github.com/yudacheng666/SRM_System/tree/35be9ae3c37d8483e7c3ea76ec35c33c2f992a78/docs/uat/20261030-pr46-2aaa478-win03-input-continuation) 已核对。产品/原测试唯一 SHA **`2aaa478c8f1966e41b9372d9d989c383dbaa1972`** 必须保持，PR46 HEAD 前后校验。

## 根因假设与代码对照（优先验证，不提前判产品FAIL）

1. 产品源码准确 SHA 的 `addRowsToRfq(rows)`：**先把12行物料添加到前端 `items` 数组，再通过同步 `alert("新增 12 行...")` 提示**。这句提示没有声称SQLite已保存；S4自动保存是后续异步/空闲逻辑（规则`IDLE_MS=2500`），浏览器JS modal阻塞时不能依据alert就判持久化成功。
2. 上轮 `03-import-materials.json` 对 `#confirmImportRows` 使用 **普通 `{"type":"click"}`**，而 `act.cjs` **已有 `dialogClick` 分支**。实际 `Input.dispatchMouseEvent(mousePressed)` 在13:29:56.749→.752+08:00真实返回；`mouseReleased` 在13:29:56.752发出；`Page.javascriptDialogOpening` 的 **alert** 于13:29:56.769出现（17ms后），但驱动仍在 **await mouseReleased的响应**，所以12秒超时；随后两次30s截图与`Page.enable`也超时。同期最终只读服务快照 **A.items=[]**，只是未完成的UI保存状态，当前不能证明SRM有产品数据丢失缺陷。
3. 事后跨新CDP session补发 `Page.handleJavaScriptDialog` 返回 **-32602 No dialog is showing**，只证明那一刻该session未看到可处理dialog，不能当作已确认原alert或已完成保存。**首要排查是测试驱动未在 click 中及时处理预期原生alert，不能继续机械增加12/30s超时**。截图大概率受原生对话框/页面阻塞连带影响，最终需现场分辨。
4. 上轮已真实验证 **Node24+原生Windows Edge CDP鼠标26次、键盘14次、文字2次、两笔虚构RFQ UI动态保存确认，以及14.045s截图成功**；这些独立子项保留为PASS，不再复跑旧Linux112/WIN01 Python44/WIN02 Node10。上轮存证提交 `35be9ae3c37d8483e7c3ea76ec35c33c2f992a78`，历史原日志/失败不得覆盖。

## 本轮只需修正独立 DRIVER，开始做真实业务（产品保持只读）

**阶段A：新隔离数据下复现导入并证明Dialog链路（允许重新创建虚构A/B作为本轮真实GUI前置，不算重复验收历史套件）。**

- 在新的TEST-ONLY证据目录复制上轮`cdp.cjs`/`act.cjs`；仅修改/改进测试驱动与动作脚本，不能修改产品、原E2E/单测断言、任何现有旧证据文件或CI。用原生Windows11、已有Edge156+Node24、全新一次性空 profile、localhost-only随机CDP端口、隔离 `SRM_DATA_DIR`，准确SHA源码。本任务不需要安装Playwright/npm/新软件。
- 在绑定**正确target/session**、确认`Page.enable`与dialog事件订阅完成后，把确认物料动作改成**预先监听、明确匹配预期文案的 `dialogClick`**。必须保证**对话框出现后，用原来同一浏览器 session 的`Page.handleJavaScriptDialog({accept:true})`及时确认，之后再等待`Input.dispatchMouseEvent(mouseReleased)`的未完成Promise**（禁止先await释放鼠标导致和alert相互等待）；为弹窗打开/关闭、原请求处理、dialog/session/message和click结果留下CDP原始事件时序。
- 如果预期alert未出现、文案不符、无法确认或无法观察dialog关闭，只允许本次有界诊断，保存stack/event与真实页面状态，STOP并标 **DRIVER/BROWSER BLOCKED**；不得盲重试、重复点击导入、自动确认未知风险对话框、隐藏失败或者长时间卡在截图。**不要用`Runtime.evaluate`直接调用`addRowsToRfq`、替换原生`alert`、注入业务对象或用API创建物料**。普通CDP Input交互的原超时12s及截图原30s保留；核心是 dialog时序修正。
- 成功关闭弹窗后：观察**UI物料表真实出现12行**、保存状态必须走真实pending→saved的动态ACK（不能匹配旧的常驻“已保存”），然后只读GET确认同一**准确workspaceId**的SQLite确有12行、`revision`增加、物料RFQ Line ID完整；实际F5后仍有12行，之后继续操作。必要时用真实UI按“保存”按钮并验证ACK，须标注手动保存而非声称自动保存成功。若弹窗被确认、UI与后端保存状态矛盾，再记录**真实产品缺陷候选**，收集源码/网络/状态证据，不因没有保存就一概归咎驱动。
- 记录 `Page.javascriptDialogOpening` / `Page.javascriptDialogClosed`、Input mousePressed/released响应、DOM数据、保存状态时间线、SQLite只读revision与items行数、真实屏幕截图及可能的全部超时。新的测试不能以仅弹窗文案宣称导入成功。

**阶段B：若且仅若阶段A真实成功，在同一可用Windows GUI会话推进剩余WIN03**

- 通过真实CDP输入/文件选择/UI按钮完成供应商配置和分配、**有效可渲染PDF**行关联及预览、供应商分包ZIP（逐字节及文件名隔离，排除私有JSON）、报价多轮/阶梯价/不按0比较/高价定标理由、历史版本保护、F5/重启/断线保存提示、UI的S4完整备份至另一个**真正空**的隔离目录恢复及409非空目标拒绝与无损核对；1366×768有价首行、960宽度真实浏览器操作/布局。当每步遇到首个不可排除异常，立即保全现场和原始日志，辨别产品FAIL/独立驱动BLOCKED/未执行，**不要为刷绿循环复测或跳过步骤**。
- 原始产品`run_local.bat`/SQLite API只能作为运行服务与**只读验证**；不允许用API写入代替采购员界面操作。真实UI完成才记WIN03子项PASS，未覆盖项仍NOT TESTED。

## 交付和不可变边界

- 在同一现有 Draft PR #50 追加**新的WIN03版本化独立证据目录**：真实Windows/Edge/Node身份、准确 `2aaa478c8f1966e41b9372d9d989c383dbaa1972` SHA及146原文件前后校验、原生CDP dialog/session/ack时序、导入前后UI/保存状态/服务只读行数、原始stdout/stderr/timing/error、截图和下载PDF/ZIP哈希、 S4完整结果、异常和清理证据。历史超时（mouseReleased12s及截图30s）保留，旧PR50证据目录只读；回评PR46。
- 任务结束只关闭**自己**创建的Edge/服务PID，确认127.0.0.1:8765和CDP端口空闲；不接入用户现有Edge/Chrome profile或`%LOCALAPPDATA%\SRM-Lite`、不读取真实采购数据、不中断未知服务、不调整系统设置。
- **WIN-03 目前仍为BLOCKED，正式合并门槛仍NOT READY。** 即使这次全部WIN03通过，后续仍需ChatGPT核对PR46准确SHA、M1 base/PR45与分支保护并获得用户**另行明确批准**。Codex **TEST-ONLY**，不改PR46产品/原测试/CI/main/M1，不触发GitHub Actions、不合并/关闭PR。

**本轮唯一根因验证聚焦：`#confirmImportRows` 的同步 `alert` 对 `mouseReleased` 与 screenshot 的阻塞。先解决Dialog事件/点击应答顺序，再验证实际保存。**
