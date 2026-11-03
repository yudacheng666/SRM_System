# WIN-03 下一阶段 TEST-ONLY：沿已证实 Edge/CDP 控制，修复独立截图等待并直接做原生采购员 UAT

**这是下一轮完整 GitHub 交接指令；尚未执行。** 上一轮实际[原生CDP报告与原始证据](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6515539794)已充分证明：真实Windows11 + Edge156 + Node24内置WebSocket可启动新空profile、仅127.0.0.1监听随机CDP端口、导航本机SRM、读取应用DOM并保存真正PNG。**不要再以没有Playwright/CUA为理由复查同样的“无法控制浏览器”前置，不要求安装Playwright或新软件。**

## 状态/唯一源码

- **产品/原测试唯一冻结SHA：`2aaa478c8f1966e41b9372d9d989c383dbaa1972`**，现有Draft PR #46。每次运行前后核验HEAD、完整146个原文件blobs和实际HTTP HTML SHA256 `bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3`；不能换main、旧M1、合成merge ref，也不得因测试驱动失败修改产品、原测试或CI。
- **既有不可变PASS:** Linux云端 112/112；WIN-01 真实Windows Python3.15 44/44；WIN-02 真实Windows Node24 10/10。**禁止重跑**或将这些测试算入WIN-03。旧Windows BAT跨路径、SQLite/HTTP、S4 API恢复与409负例已部分PASS；不做新一轮API-only重复验收。
- **唯一缺口** WIN-03：上一轮 `cdp.cjs` 的 `send()` 对所有CDP命令写死12,000ms，真实应用 `Page.captureScreenshot` 第一次12,075ms响应（比期限晚75ms）使独立`act.cjs` exit1；catch中的取证截图125ms返回并保存 `01-load.failure.png`。原始trace中 **Input.* 实际0次**。这只证明独立截图客户端等待过短，**长尾截图根因仍未知，不能宣称产品故障或已完成输入/采购验收**。

## 第一步：有界修正 TEST-ONLY 独立驱动，直接验证输入链

- 从上轮PR #50证据里的 `cdp.cjs`、`act.cjs`、preflight/真实事件trace理解原代码；**历史证据保持只读，不覆盖其失败**。在**新的WIN-03续验专用证据目录**建立新版本驱动，只允许改善独立 CDP 请求的等待/事件关联/记录逻辑，绝不修改PR #46代码、现有原测试、原断言、CI。
- 把截图命令设置**独立、明确有界**的客户端等待（建议30,000ms），保持一般交互/业务断言自身的原有超时与真实失败标准，不用任意加sleep、force click、静默重试绕过失效控件。记录每次CDP请求ID/session、发出与返回时刻、实际耗时、错误和原始截图片。**超时请求不得和后续截图混作同一成功请求**；晚到的响应要原样归档。30s仍超时，登记真实DRIVER/BROWSER BLOCKED并保存stack，不冒充PASS。
- 用现有 Edge+Node24 的**真实Windows原生CDP**、独立临时浏览器profile和本轮全新虚构 `SRM_DATA_DIR`，启动准确SHA BAT服务；仅绑定回环地址随机调试端口，核对任务所有者PID，不碰已有SRM服务、业务文件或用户默认浏览器profile。先做**真实 `Input.dispatchMouseEvent` 点击**及**`Input.insertText` 输入**的最小可见UI操作（例如新建一个完全虚构RFQ并填写名称）：操作前后用DOM/可见状态/截图证明值、选择、保存确实变化，不能只靠`Runtime.evaluate`直接设置业务状态或用API代替人工动作。首次截图不是业务操作前置的硬性阻断；可先完成输入链验证再按需取证，但最终截图必须真实归档。
- 若点击/输入链不成立，具体记录坐标、命中目标、CDP Input 请求/响应、DOM状态和截图/超时证据，按**WIN-03 BLOCKED**停止，不要盲目连续重试同一故障，也不要修改产品以掩盖未知原因。

## 第二步：仅输入链实际通过后，同一次有效Windows验收推进采购员完整业务

用真实Edge页面UI走完整测试，不要以单独REST API插入业务记录替代GUI点击：
1. 建立并保存两个虚构RFQ，导入虚构物料/供应商、完成询价分配；使用**有效可渲染的PDF**上传/关联到RFQ Line ID、真实预览。不要把旧68字节假PDF API测试算入。
2. 实际UI完成报价导入/多轮修订/版本锁定、阶梯价及可比报价口径，高于最低价定标需原因；非报价不当0比较。导出不同供应商询价ZIP，核对文件名、真实PDF二进制和供应商范围隔离、排除内部关联.json。
3. 浏览器真实F5/关闭重开及自己新启动的服务安全重启，确认保存历史/报价/PDF持久化；仅暂停**自己的测试服务**时验证断线保存失败提示不会误报成功，再恢复正常保存。
4. 通过UI导出全量S4 ZIP，在**另一个全新空 `SRM_DATA_DIR`**真实恢复并检查数据/PDF，再对恢复后的非空目标验证409拒绝以及所有原数据/文件字节不变；不得接触真实用户本地SRM目录。检查1366×768首条报价整行可见和960布局（仅当实际原生页面观察到才记PASS）。
5. 对真实下载产物可用文件字节/哈希/API只读进行独立交叉检查，但**采购员动作本身必须有CDP Input/DOM/截图/事件链，不能靠API补写模拟通过**。未完成的范围写NOT TESTED，部分完成不判整组PASS。

## 证据与安全/结论

- 新建**本轮独立版本化WIN03目录**上传到现有Draft PR #50：准确SHA+完整原文件前后身份、真实Windows/Node24/Edge版本、原生CDP端口/PID、页面导航、**输入指令与可见状态**、截图与来源、下载文件和PDF/ZIP哈希、S4恢复/409、完整真实命令退出码、错误原文及CDP事件trace。旧失败原样保留，超时不允许从日志/结果中删除。回评PR #46。
- **本轮只对WIN-03判断：** 全部真实Windows采购员GUI业务范围完成且证据完整才 **PASS**；若截图/真实输入或业务遇阻，如实报告 **BLOCKED/FAIL**（明确是产品缺陷、驱动失效还是环境权限），不得把部分PASS写整组通过。第一次阻断需现场留证、优先定位，不为刷绿无限重复。
- 启停与审计：仅关闭自己启动的Edge/服务PID，核实端口释放；不读取用户正常Chrome/Edge profile、现有业务SQLite/PDF、会话cookie/token；禁止新软件安装/下载、修改系统设置、访问局域网/真实公司数据。
- 依旧**TEST-ONLY**，不修改PR46产品/原测试/CI、main/M1，不触发收费Actions，不合并或关闭PR。即使WIN-03通过，也不是正式Actions成功；后续由ChatGPT复核准确SHA/目标M1/PR45/分支保护，且须**用户另行明确批准**才可合并。

**任务已在GitHub发布不等于已经运行。继续只用真实Windows原生Edge + Node24 CDP，不再重复WIN-01/02/Linux。**
