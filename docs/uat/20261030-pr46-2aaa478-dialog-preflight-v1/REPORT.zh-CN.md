# PR50 测试体系整改 V1：静态预检与新增 Node 测试 PASS

执行 [ChatGPT 静态审计及预检要求](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6518106279)。本报告只记录 TEST-ONLY 驱动整改，**不是 WIN-03 原生采购员验收**。

## 实际结果

| 检查 | 实际结果 |
|---|---|
| 新增 Node 内置 node:test | **84/84 PASS，FAIL0，SKIP0** |
| 新增 CJS 语法检查 | **9/9 PASS** |
| 正向动作静态预检 | **2 文件/38 个交互合同样例 PASS** |
| SUP-A/SUP-B 普通 click 负向预检 | **预期拒绝，exit2，stepIndex1/2 均为 KNOWN_DIALOG_PLAIN_CLICK** |
| 非法 JSON 负向预检 | **预期拒绝，exit2，输出机器可读 JSON_PARSE** |
| 冻结产品及原测试146文件 | 前后 Git blob SHA1/SHA256 全匹配，无变化 |
| 真实浏览器启动/CDP连接/业务HTTP请求/业务写入 | **全部0**；运行时仅 EventEmitter/FakeWebSocket |
| Linux/WIN01/WIN02/原套件 | **未执行** |

实际环境为现有原生 Windows Node **24.22.1 / win32 / x64**；没有安装软件或 npm 依赖。产品及原测试 SHA 始终为 **2aaa478c8f1966e41b9372d9d989c383dbaa1972**。index.html 原始 SHA256 为 **bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3**。

## 整改内容及证据

1. `schema.cjs` 实现封闭动作 schema：未知 step/selector/operation/字段/条件分支、缺少 dialog 声明、缺少 type/message/boolean accept、prompt 无输入或取消策略等均拒绝。已知弹窗操作不能写普通 click。整套动作及冻结源码在 launch 回调之前验证，编译后的计划深度冻结，防止预检后更改。
2. `dialog-policy.json` 登记28个操作（27 reviewed、1 needs-review），包含产品SHA、selector、函数/源码范围/锚点、触发条件、允许的type、全文/受控模板、accept/cancel及保存后置条件。动态计数有范围，供应商/物料范围用有限枚举；最终匹配完整文案，不忽略提示。新条件、未登记 selector 或待审 fixture 不会被默认为安全。
3. `guarded-driver.cjs`/`cdp-adapter.cjs` 是新入口：整套预检通过后才允许实例化连接；同 session 监听先于 Page.enable/输入，点击Promise先启动；观察并精确匹配opening后，才同session ACK，等待closed、ACK响应及原始输入完成。连续5个prompt（含任一步取消）及confirm→alert有专门测试，覆盖“下一prompt先于上一ACK响应”的竞态。
4. dialog:none 收到原生弹窗、文案/type/default不匹配、外来session/target、额外弹窗等立即记录完整事件并停止。未知弹窗**不发送accept或cancel**；终止待决命令/关闭本驱动连接，不进入截图或补确认重试。`runtime-mock-events.jsonl`/`adapter-mock-events.jsonl` 全部是明确标识的mock记录，不冒充真实CDP运行证据。
5. 启动前零副作用有两层负向证明：多文件计划前一文件有效、后一文件错误时launch及模拟业务HTTP/写入计数全0；真实适配入口在错误计划下连FakeWebSocket构造函数也不会调用。适配层正向组合仍使用FakeWebSocket，没有真实socket。
6. `negative/assignment-plain-click.json` 在新schema下重现上轮两个普通click遗漏；`preflight-reject-assignment.json` 给出文件、step索引、selector、预期策略、实际策略和失败原因。旧证据目录未改。非法JSON也生成拒绝报告。

原始运行记录见 `commands.json`、各命令 stdout/stderr、`tests-final.stdout.log`、`static-summary.json`、两个源文件校验清单。首次开发测试71/71、补充后77/77的原日志一并保留；最终以84/84为准，不累计成多个验收套件。

## 尚未授权或未完成的范围

正向38步是静态交互合同案例，含互斥场景，**不是可运行的完整采购员动作计划**。它们明确标为contract-test，执行入口会在连接前拒绝将其作为buyer-plan运行。保存/SQLite/F5/PDF/ZIP/S4等后置条件是未来取证要求，本轮没有执行或宣称通过。

报价部分提交的具体错误fixture仍needs-review，已硬性拒绝执行；图纸上传/版本/哈希冲突、进一步报价输入/覆盖fixture仍需审核。未登记的供应商批量移除/反转/复制等 selector 一律拒绝，未审旧wait/expression等类型同样拒绝。此处没有把不完整业务动作集伪装为“所有采购计划均已就绪”。

本轮只追加 PR50 新版本目录，不修改 PR46 产品、原测试、CI或历史证据；不启动浏览器/服务，不重复任何已通过旧套件，不合并/关闭PR，不调用Actions执行接口。证据提交使用[skip ci]，发布前核对现有workflow事件过滤，发布后另核查Actions记录。**WIN-03 历史状态仍 BLOCKED / NOT READY**；物料12行持久化及供应商导入的既有PASS保持，未重跑。
