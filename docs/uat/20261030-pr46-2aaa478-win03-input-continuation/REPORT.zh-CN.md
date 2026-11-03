# WIN-03 原生CDP续验：真实输入/双RFQ已完成，物料确认提示后BLOCKED

**本轮WIN-03 BLOCKED；整体NOT READY。** 实际推进至真实Input链、两笔虚构RFQ创建/命名/保存及12行XLSX预览，未完成全采购员流程。WIN-01、WIN-02及Linux原PASS均未重跑，历史失败不改。

依据[本轮完整任务](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6515644304)，只在新证据目录复制/修正独立驱动，产品/原测试/CI无变化；唯一准确SHA仍为 **2aaa478c8f1966e41b9372d9d989c383dbaa1972**。

## 驱动修正及实际输入证据

- 保留原cdp.cjs等历史文件只读。新版本**仅Page.captureScreenshot客户端期限改12000→30000ms**；普通CDP交互仍12000ms，DOM/业务等待仍8000ms，无force click、任意sleep或静默重试。
- 增加connectionId、每请求id/session/发出/返回/期限/超时记录；截图响应按连接与请求ID分别存PNG。迟到响应不合并为新请求。真实原始事件和请求时间表均保留。
- 只为执行真实UI流程增加DOM检查点、原生键盘select及已知dialog事件处理；不直接设置业务状态，不用REST插入任何业务记录。旧驱动diff及新源文件归档。
- 最初把移除bootstrap截图的注释改成单行注释，意外吞掉原单行函数余部，导致**启动前SyntaxError/exit1**；浏览器未执行。保存失败版本和错误记录，改为块注释并先node --check后才启动。此为独立驱动编写错误，不是产品FAIL；没有掩盖或重跑原测试。
- 真实Windows11专业版x64 Build26200.9711、现有Node24.22.1、Python3.15、Edge156.0.4314.50。唯一新空profile，EdgePID **30436**，随机CDP端口 **57842** 原生检查仅监听127.0.0.1。准确源码原始BAT服务PID **30956**，新SRM_DATA_DIR=data-origin。BROWSER进程hook只路由本任务新profile，不触及个人profile。
- 原生CDP **Input.dispatchMouseEvent 26次、Input.dispatchKeyEvent 14次、Input.insertText 2次**。两次文字输入均是真实RFQ命名。鼠标实际点击新建、改名、名称输入及保存，第二次新建触发的真实确认框通过已观察dialog事件确认。

**真实输入链PASS；两笔RFQ UI创建/保存子项PASS。** A/B名称实际变更，动态#srmUxWorkspaceSaveSummary已保存且保存按钮可用的条件通过。A初始截图曾抓到保存进行中，最初宽泛body文本检查包含静态“已保存”字样，不能作为ACK；后续01b独立严格动态控件检查和截图确认已保存，原始早期快照保留，不倒改。只读服务端记录最终交叉确认两笔已保存名称，非API补写。

- A：虚构 WIN03 原生询价 A，workspaceId RFQ-1793338054653-SHGNMB，最终持久化revision1。
- B：虚构 WIN03 原生询价 B，workspaceId RFQ-1793338156769-NLYGXV，最终持久化revision2。
- 新截图实际耗时分别**109ms、14045ms、161ms**，均在30000ms内返回；14.045秒这一张明确证明本轮新截图等待机制能接受超过旧12秒的真实响应。原始PNG未编辑。
- 截图尺寸如实记录：01-input-chain.png为1366×768；01b-save-ack.png和02-second-rfq.png为756×488（分段连接的viewport覆盖没有跨会话保留），不冒称全部1366×768。B截图因真实滚动显示项目页下部，其名称/保存ACK另由实际DOM事件链与只读持久化记录证明。首有价行及960布局尚未执行。

## 第一个业务阻断与后续有界诊断

切回A通过真实选择控件和打开历史询价UI完成。通过DOM文件控件选入本轮实际items12.xlsx，真实解析预览显示**12行、0冲突、0错误**，全部TST-001至TST-012行及表头记录保留。点击“确认加入本次询价”仅一次，没有重放导入。

**13:29:56.769 +08:00**（trace UTC05:29:56.769Z）浏览器真实发出Page.javascriptDialogOpening：

> 新增 12 行；自动合并 0 行；冲突确认分行 0 行。合并前原始需求行已留存。

本轮动作脚本没有为这个成功alert预先安排事件确认，原Input.dispatchMouseEvent释放请求在12000ms期限超时。错误取证Page.captureScreenshot随后也在30000ms期限超时，原始stack和原始事件均留存。

现场优先定位到这个真实提示框，未重复点击或导入。一次有界确认尝试返回**CDP -32602: No dialog is showing**；不将其误记为成功确认。随后唯一一次当前页面核验在Page.enable12000ms超时，catch中的取证截图又达到30000ms。至此按任务明确停止，不再延长期限、重启重放或反复重试同一路径。

**四个协议超时均保留：**

| 方法 | 发出时间（UTC） | 客户端期限 |
|---|---|---:|
| Input.dispatchMouseEvent |05:29:56.752Z|12000ms|
| Page.captureScreenshot（第一次错误取证）|05:30:08.769Z|30000ms|
| Page.enable（当前状态核验）|05:31:08.712Z|12000ms|
| Page.captureScreenshot（第二次错误取证）|05:31:20.721Z|30000ms|

首个障碍已知为驱动未处理成功alert；后续dialog生命周期和Page.enable/截图阻塞的更深根因**未确定**，不能声称是已证实产品问题，也不能假设控制已恢复。没有在超时后重写产品或放宽业务断言。

## 结果边界及最终数据

只读/api/workspaces最终确认A、B两笔记录；只读/api/active显示A仍**items=[]、suppliers=[]、quoteRounds=[]**。因此成功alert并不等于物料已保存，**物料导入整体记PARTIAL/BLOCKED，不判PASS**。没有通过REST补写、恢复或模拟“成功”。原始最终记录与预览DOM一并交付。

后续本轮均NOT TESTED：供应商导入/分配、有效PDF上传/行关联/预览、供应商ZIP下载及文件隔离、多轮修订/阶梯价/高价原因/缺报口径、F5/关闭重开/服务重启/断线失败提示、UI完整S4备份/另空目录恢复及非空409无损拒绝、1366首报价整行和960布局。没有生成的这些下载产物，也不使用旧API/Python/Linux证据替代。

本轮确认产品FAIL **0**；独立驱动错误/控制阻塞单列。部分子项PASS不构成WIN-03整组通过。

## 精确版本、运行隔离和清理

PR46开始/结束HEAD均为2aaa478c8f1966e41b9372d9d989c383dbaa1972。完整不可变GitHub blob清单的146原文件在本轮前后重新计算Git blob SHA-1及SHA256，**0变化**，包括原测试和CI。源码为完整原始API tree/blob物化树，非git checkout、非main/M1/merge ref。

实际本机HTTP HTML SHA256 **bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3**。原始HTTP HTML保留本机，上传identity记录而非重复产品文件。测试fixture是原fixtures.py生成的虚构XLSX和有效PDF；只items12.xlsx曾进入文件控件，PDF未上传或查看，不冒称PDF验收。

本轮所有SRM_DATA_DIR、profile、temp及生成资料均位于新隔离根。没有读取/附加用户普通Edge/Chrome profile、既有业务SQLite/PDF、cookie/token；未安装软件或改系统PATH。只有本任务服务对本任务UI产生的PUT保存，最后交叉检查仅GET读。

服务Ctrl+C至自己的exec会话，包装exit1如实保留；Browser.close exit0。原生CIM证实PID30956/30436均退出，含本任务profile路径的Edge0个；独占绑定确认8765、57842均空闲。没有杀未知PID，隔离虚构资料保留复核。

## 证据归档和不变门槛

追加现有Draft PR50新目录docs/uat/20261030-pr46-2aaa478-win03-input-continuation/，旧失败/已通过证据不动，回评PR46。原CDP trace完整保留本机；上传文本仅脱敏隔离路径/用户名，完整脱敏协议trace以gzip无损归档，解压后的SHA与trace-manifest校验一致。所有超时、错误、Input、dialog和晚到响应都保留；PNG另存原字节，二进制base64字段仅在文本trace中以标记代替，不冒充Playwright trace。原件/上传副本校验清单分别记录。

没有产品、原测试、CI、main/M1、PR48修改；没有WIN01/02/Linux套件重跑、收费Actions、软件安装、合并或关闭。证据提交[skip ci]，最终提交和workflow_runs查询见PR回评。

**最终：WIN01历史PASS；WIN02历史PASS；本轮输入链/两RFQ子项PASS，但WIN03 BLOCKED，整体NOT READY。**
