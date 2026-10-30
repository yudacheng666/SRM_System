# WIN-03 · 原生 Windows Edge/CDP 一次有界预检与中止记录

**WIN-03 BLOCKED；完整采购员UAT未执行。WIN-01、WIN-02原PASS保持不变，未重复。整体NOT READY。**

按[本次任务](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6514777349)仅尝试一次原生控制预检，不安装软件、不反复调用失效CUA。与此前检查相比，有实质新事实：**现有原生Windows Edge可使用新profile+Node24内置WebSocket建立CDP，应用真实导航/DOM/截图也已获得**。本轮并非“无浏览器或无CDP能力”；中断点为独立驱动的截图等待12秒期限。不得将这个驱动错误记为产品FAIL。

## 单次预检真实过程

- Windows11专业版x64，Build26200.9711；PowerShell7.6.5，现有Node24.22.1（platform=win32）、Python3.15.0、原生Edge156.0.4314.50。没有运行任何已完成Python/Node业务套件。
- 使用现有C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe，**唯一一次**启动，headless=new；新建完全独立fresh-browser-profile目录，无已有profile附加或迁移。参数含remote-debugging-port=0、remote-debugging-address=127.0.0.1、no-first-run、no-default-browser-check、disable-background-networking；没有关闭sandbox或web安全。
- 原生Edge主PID **14724**，系统分配调试端口 **61109**。原生Get-NetTCPConnection验证实际仅监听**127.0.0.1:61109**，归属PID14724；未暴露0.0.0.0或局域网。
- Node24现有内置WebSocket/fetch连接CDP，Browser.getVersion实际返回Edg/156.0.4314.50，User-Agent含Windows NT10.0/Win64/x64。创建本任务about:blank目标并取得真实空白页截图。preflight.cjs exit0，preflight.json的controlReady=true**仅代表bootstrap连接/空白页成功，不代表完整Phase1交互或WIN03 PASS**。
- 检查8765空闲后，从准确源码仓库根目录实际运行原始run_local.bat，SRM_DATA_DIR指向本轮新data-origin目录，Python PATH前置只影响此进程。服务PID **31636**。
- 原服务会自动webbrowser.open；为避免打开个人浏览器，会话级BROWSER变量仅路由到本任务browser-open.cjs，经既有CDP在本任务新profile中创建目标。该hook只处理浏览器选择，不更改产品代码、保存/恢复处理器或原断言；失败会记录日志并正常退出以防回退个人profile。
- 本任务服务/api/health真实返回SQLite/S4，实际HTTP HTML SHA256符合准确版本。生成原始fixtures.py的全虚构XLSX及有效双页PDF作为预备资料；**仅生成fixture，不运行E2E套件，也没有上传/导入这些资料**。
- 目标页面设置1366×768，CDP真实导航http://127.0.0.1:8765/，读取到页面标题“SRM Lite · 采购询价工作台”、可见正文及真实button/select状态（新建可用、演示模式保存禁用）。DOM与Network事件均保留。

## 中断事实：驱动截图等待，不是永久不可用

act.cjs在首个应用截图Page.captureScreenshot的独立客户端**12000ms**等待上限触发Error: CDP TIMEOUT Page.captureScreenshot，原生命令exit1。未改超时后重跑，未启动第二次浏览器或第二轮预检。

原始协议trace时间如下（UTC；本地为Asia/Shanghai +8）：

| 请求 | 发出 | 返回 | 实际响应耗时 |
|---|---|---|---:|
| 首个应用截图 id11 |05:01:53.769Z|05:02:05.844Z|12075ms|
| 错误处理取证截图 id12 |05:02:05.780Z|05:02:05.905Z|125ms|

因此第一个响应仅比客户端期限晚约75ms；被客户端判为超时后，catch中**一次错误取证截图**成功写入01-load.failure.png（1366×768，原始PNG未编辑）。这不是伪造截图，也不是第二轮浏览器启动/完整预检重跑；同时不能隐藏已经发生的exit1或把失败重标为WIN03 PASS。取证图经视觉检查，确为本次全新原生Edge的初始SRM演示页，不包含用户业务内容。

**CDP trace中实际Input.*命令数为0。** 本轮没有验证点击/输入链路，更没有完成采购员业务。因此不能以真实截图、可见DOM或后端健康替代完整WIN03。按单次有界控制预检的失败停止规则终止后续路径。原始失败stack、动作脚本、完整协议事件和截图全部留证。未来若安排新的独立续验，已知可用路径是原生Edge+现有Node24 CDP，不应再把“缺Playwright或无CUA”视为EXE/CDP绝对不可用；是否修正独立驱动等待并新开验收范围须另行明确，不在本次偷偷重跑。

## 未执行范围

下列本轮全部NOT TESTED：两笔虚构RFQ的真实UI新建/保存，物料/供应商导入与分配，有效PDF上传/行关联/可视预览，供应商ZIP下载/字节/JSON隔离，多轮/修订报价和高价定标理由，建议/人工总额与缺报不归零，F5/重开/重启/断线保存提示，UI完整S4下载/空目录恢复/非空409无损拒绝，首个有价行1366×768及960布局。仅1366×768初始演示页被实际看到，不将之计为这些业务或布局验收PASS。既有BAT/API/S4已接受范围没有单独复跑用于增加通过数。

本轮确认产品故障数0；一次独立驱动等待错误。未完成不代表产品安全或不安全。没有采购员操作trace被伪称执行；交付cdp-trace.jsonl是本轮实际协议事件，截图base64字段以占位符替代，实际PNG单独保留，不是Playwright trace。

## 精确源码与隔离

产品/原测试唯一SHA **2aaa478c8f1966e41b9372d9d989c383dbaa1972**。PR46开始/结束HEAD均一致。完整准确SHA源码来自此前真实获取的GitHub API不可变tree/raw-blob清单；本轮尝试重新获取树遇一次传输错误，不隐藏该事实。无需下载或切换其他SHA，本轮对已有准确清单的**146个原始文件**在运行前后重新计算Git blob SHA-1和SHA256，全部一致，0变更，包含原测试和CI；该源码是完整物化树，非git checkout。

本轮磁盘与实际本机HTTP HTML SHA256均为 **bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3**。完整HTTP HTML保留本机；上传http-identity.json及源码身份清单记录哈希，避免重复提交产品内容。

新源码执行的运行文件、data-origin、temp、fresh-browser-profile、下载预备fixture均在本轮独立根中。没有接入/指定既有用户Edge/Chrome profile或真实SRM业务目录，未迁移或覆盖业务资料。profile本体、浏览器缓存和SQLite不上传；仅明确挑选的匿名日志/协议/截图/fixture校验清单归档。截图为演示初始页，无真实公司/客户信息。

## 清理与交付

自己的BAT会话Ctrl+C停止，包装退出码1如实记录；自己的新profile经Browser.close正常关闭，清理命令exit0。原生CIM检查服务PID31636与EdgePID14724均不存在，包含本任务profile路径的Edge进程0个。独占绑定确认**8765、61109均已空闲**，未终止任何未知PID。临时隔离目录保留供复核，不自动清理用户目录。

仅在现有Draft PR50分支追加新目录docs/uat/20261030-pr46-2aaa478-win03-native-cdp/。旧Windows/Linux证据全部保留。上传文本只脱敏本机用户名和隔离路径，原错误、响应和结果不改；PNG字节不改。checksums.json记录原件及上传副本校验。

不修改产品、原测试、CI、main/M1或PR48，不重跑WIN01/WIN02/Linux套件，不安装/下载/更新任何软件，不触发Actions，不合并/关闭PR。证据提交使用[skip ci]，最终工作流查询与回评附在PR中。

**状态：WIN01历史PASS；WIN02历史PASS；WIN03 BLOCKED（原生CDP/页面/截图证据已有，输入链路及完整采购员实操未完成）；整体NOT READY。**
