# WIN-03 · 原生物料alert纠偏成功；供应商分配confirm遗漏导致本轮BLOCKED

**阶段A PASS：同session物料alert及时确认/关闭，12行真实写入SQLite、动态pending→saved、F5后12行完整保留。** 阶段B供应商导入也已通过，但批量分配按钮又触发原生confirm，**本轮动作脚本在该按钮仍漏用了普通click**，控制链阻塞。完整WIN-03仍 **BLOCKED / NOT READY**，不记为产品失败。WIN01、WIN02和Linux已通过套件均未重跑。

依据[本轮最新任务](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6516086544)。产品/原测试唯一SHA **2aaa478c8f1966e41b9372d9d989c383dbaa1972**，PR46开始和结束HEAD不变。

## 阶段A：真实链路已执行并通过

1. 真实Windows11专业版x64 Build26200.9711，已有Node24.22.1/Python3.15/Edge156.0.4314.50；新空profile，EdgePID36608，随机64031端口实际仅127.0.0.1监听。新SRM_DATA_DIR=data-origin，原始BAT服务PID22828。只用本任务profile及新数据，BROWSER进程hook避免落入个人默认profile。
2. 新驱动act-alert.cjs基于上轮机制预先订阅Page事件。**先启动click Promise，等待匹配文案的alert，在原session handleJavaScriptDialog，观察DialogClosed，之后再await鼠标释放Promise**。原普通12s、截图30s、DOM/业务8s保持；没有加长时间刷绿、任意sleep、force click或未知对话框自动确认。轮询仅用于明确事件/状态条件。超时现在将真实Error.stack直接写入协议日志。
3. 通过真实Input新建、命名、UI保存“虚构 WIN03 Alert 验收 A”，建立只读workspace绑定：**RFQ-1793340543627-NJTJR9，baseline revision1**。未用REST插入业务记录。
4. 用文件控件选择本轮原fixtures.py生成的items12.xlsx，实际UI预览12行/0冲突/0错误。点击#confirmImportRows前已记录预期type=alert及完整“新增12行…”文案；只点击一次。
5. 正确session **E1D1C43EA06AA9502E26C26A33778737**，target **FA1F5D7F2DB48652C7D5C3CFC695517A**，事件/驱动观测如下（UTC，本地+8）：

| 阶段 | 实际观测时间 |
|---|---|
| 预置监听与预期文案 |06:09:16.349Z|
| 观察实际DialogOpening alert |06:09:16.414Z|
| 同session确认并观察DialogClosed result=true |06:09:16.417Z|
| 原mouseReleased Promise正常完成 |06:09:16.424Z|

原协议事件、请求/响应ID、same-session ack、关闭事件及鼠标响应皆保留，不把跨新session命令当本次确认。

6. 自动保存时间线明确观察到pending及saved。开始短暂保留上一版本“已手动保存”的旧状态，驱动**未据它判断新数据成功**；继续等到“有未保存修改/检测到业务数据修改/正在自动保存”，再到**06:09:20.479Z“已自动保存；无待保存修改”**。本次物料提交**没有手动点保存**，确认为自动保存，而非仅匹配静态已保存文案。
7. 精确workspace的只读SQLite API快照：**revision1→2，items=12**，RFQ-L00001至RFQ-L00012全部唯一非空，TST-001至TST-012数据完整。前端itemBody真实12行，itemCount为“筛选结果12项，第1/1页”，不是旧空快照，也不是只有alert声称新增。
8. 用**Input F5（windowsVirtualKeyCode116）**真实刷新；页面重新从本机后端恢复，UI仍12项；再次只读同一workspace确认 **revision2/items12/相同LineID**。阶段A动作脚本及原生命令均exit0，有实际1366×768截图。

**结论范围：本次证明正确处理物料同步alert后，UI、动态保存ACK、SQLite及F5持久化一致，支持上轮“普通click未处理alert使JS/后续保存未完成”的驱动归因；不能由上轮items=[]直接认定产品丢数据。本结论不等于其余未测业务安全或WIN03整组PASS。**

## 阶段B实际进展及新阻断

- 实际UI导航到供应商管理，通过真实文件控件导入suppliers.xlsx，观察预览后确认，界面显示虚构供应商A/SUP-A、B/SUP-B；动态保存后只读记录 **revision3 / items12 / suppliers2**。此子项PASS。
- 接着UI全选12行，准备把供应商A/B添加到物料。本轮06-assign-all.json在#supplierList [data-add='SUP-A']用了普通click，**没有使用已经具备的dialogClick**。
- 准确产品源码applySupplierBulkChange()本来就要求confirm（即将变更12条物料与“虚构供应商A”的关联，确认后立即生效）。这是正常保护提示，脚本调用方式遗漏，不能归为产品故障。
- 真实Page.javascriptDialogOpening(confirm)出现，mouseReleased等待超时。错误取证Runtime.evaluate及截图分别达到原12s/30s。唯一一次有界当前状态检查也在Page.enable12s超时。没有事后盲确认、再次点击添加、重复导入、重启刷绿或API补写，随即停止。

本轮阶段B四个真实超时（完整stack现在均保留在CDP日志及主/截图错误文件）：

| 方法 | 发出UTC | 期限 |
|---|---|---:|
| Input.dispatchMouseEvent |06:12:07.559Z|12000ms|
| Runtime.evaluate（失败现场DOM取证）|06:12:19.565Z|12000ms|
| Page.captureScreenshot（失败取证）|06:12:31.572Z|30000ms|
| Page.enable（唯一当前状态诊断）|06:14:20.475Z|12000ms|

只读最终快照仍为 **同一RFQ revision3、12物料、2供应商、12个assignment行但values全部为空，实际关联数0**。因此分配并未完成，不写PASS，不因尚未确认的guard而指称产品未保存/丢数。新阻断主要是独立动作脚本漏处理另一个原生confirm；进一步浏览器会话阻塞机理未另行证实。确认产品FAIL0。

已附06-assignment-proposed-NOT-RUN.json供后续review：用明确匹配预期confirm的dialogClick替代普通click；**本轮没有执行这个建议脚本**。没有通过修正提案倒改本轮失败或再开隐藏测试。

## 未完成与历史不变

本轮只有新建A作为前置，B未创建。物料导入/F5和供应商导入子项通过；实际分配BLOCKED。有效PDF行关联/预览、供应商ZIP及二进制隔离、多轮/阶梯/修订报价/高价理由/缺报口径、报价/PDF重开重启/断线保存提示、UI完整备份/空目标恢复/409无损拒绝、1366×768有价首行及960布局，均NOT TESTED。未产生这些下载产物，不用原API/Win01/Win02/Linux结果替代。

原来Linux112/WIN01 Python44/WIN02 Node10及旧Windows子项/失败保持不可变；本次没有跑这些套件。原fixtures.py只生成虚构资料，不是执行E2E套件。

## 身份、隔离与清理

146个原始产品/原测试/CI文件在本轮前后逐一计算Git blob SHA-1及SHA256，0变化；完整准确SHA源码为既有GitHub不可变raw-blob物化树，非git checkout、非main/M1/merge ref。实际HTTP HTML SHA256仍为 **bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3**。

所有运行文件/profile/SRM_DATA_DIR均为本轮新根。业务创建/导入均由真实页面Input/文件控件/按钮触发；Node最终API仅GET验证，没有REST写入物料/供应商/分配。未安装软件、改系统PATH、访问既有个人profile/业务SQLite/PDF或会话cookie/token。

自己的服务Ctrl+C停止（exec包装exit1）；自己profile Browser.close exit0。原生CIM检查PID22828/36608均不存在，task-profile Edge0个，独占绑定确认8765和64031空闲；未杀未知PID。

新版本证据仅追加docs/uat/20261030-pr46-2aaa478-win03-alert-dialog/到现有Draft PR50，旧目录不改。完整CDP与driver事件原文保留本机；上传仅脱敏本机路径/用户名并gzip无损压缩，PNG另存原字节，校验清单记录原件/副本和解压SHA。截图base64字段以标记替代，独立响应PNG仍保留，不冒称Playwright trace。

产品、原测试、CI、main/M1、PR48均未修改；不触发Actions、不合并/关闭PR。提交[skip ci]及最终运行查询见PR回评。**阶段A已真实PASS，但本轮WIN03整组仍BLOCKED，整体NOT READY。**
