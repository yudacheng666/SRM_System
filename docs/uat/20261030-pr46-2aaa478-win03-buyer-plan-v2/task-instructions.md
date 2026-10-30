# NEXT TASK · WIN-03 买家完整可执行计划/fixtures 先行，禁止直接Windows重跑 (TEST-ONLY)

**执行范围：准备“能运行的完整买家动作计划”，不再重复开发已经完成的弹窗静态预检。** 当前 [PRE-FLIGHT V1已实际落入PR #50](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6518992778)，测试证据 commit `af8d185e5f2cd80ecb9c8edeb824d306ab5c43b2`：**新增 Node 84/84 PASS、CJS语法9/9 PASS、38步合同静态通过、普通click缺confirm在启动浏览器前预期拒绝exit2、未知JSON拒绝、零浏览器/CDP/业务HTTP/业务写入**。这些是测试工具测试，**不是WIN-03业务实操通过**；不要把58/20/6处源码调用出现次数和84条Node单测混为一谈。

## 固定约束
- 冻结产品/原测试 SHA `2aaa478c8f1966e41b9372d9d989c383dbaa1972`，不变；仅沿用PR50新测试工具 `docs/uat/20261030-pr46-2aaa478-dialog-preflight-v1/`，优先复用 `schema.cjs`、`dialog-policy.json`、`guarded-driver.cjs`、`cdp-adapter.cjs`、`preflight.cjs`。历史证据不覆盖，禁止另建与V1并行的第二套未经授权驱动/重复造轮子。
- TEST-ONLY；不改PR46产品代码、现有原测试、CI、main/M1，不触发任何Actions，不合并或关闭PR；不接触真实业务数据或用户默认浏览器profile；不安装任何软件。
- **本阶段仅准备和静态验证计划/fixture，不启动真实浏览器/服务/CDP，不进行业务HTTP或写入。** WIN01 Python44、WIN02 Node10、Linux112已PASS不重测。

## 1. 先补齐V1的已知缺口
- V1 `28 operations (27 reviewed, 1 needs-review)` 及 `38-step contract-test` **不是可执行buyer-plan**。先独立审核未完成的报价部分提交分支具体fixture、图纸上传/版本/哈希冲突、报价手动录入/多轮/阶梯价/覆盖异常、S4非空拒绝如何从GUI观察；逐项从冻结源 `prototype/m1-lite/index.html`、已有API/测试固定快照核对，不猜测选择器、文件格式、提示文案及默认prompt值。未能证实的分支留 **NEEDS REVIEW** 并停止计划执行授权，不能静默删除、硬编码跳过或宽松匹配。
- 为所有计划动作建立检查表：实际DOM selector/operation、branch条件、`dialog:none/expected`、弹窗原文/受控参数、确认/取消、动作后UI可见状态、精确workspace SQLite revision/data、PDF/ZIP字节与哈希、恢复隔离与拒绝无损条件。
- 确认异常反馈是JS原生alert/confirm/prompt还是DOM文案/API 409，不能把二者混淆。

## 2. 真正可执行的WIN03采购员流程
- **准备专用新版本化 TEST-ONLY 目录**，在PR50已有V1的基础上提供多个实际 `purpose=buyer-plan` 动作文件（不是 `purpose=contract-test`），**全清单在启动前整体静态预检**。UI流程从已通过的虚构A/12行/2供应商快照开始：若旧临时工作目录已清理，只允许用新完全隔离的 `SRM_DATA_DIR`、真实UI重建相同虚构fixture；不能用API写业务。
- 先对SUP-A和SUP-B用显式 `dialogClick` 做真实分配，**分别验证12行关系，总计24条**、动态pending→saved、本次修订号、F5后保持；匹配准确的全文确认框，不能使用旧普通click。
- 随后用GUI真实上传**可渲染PDF**并关联到指定RFQ Line ID/版本，UI预览和保留原始PDF哈希；导出单家/全部供应商包并验证ZIP隔离、文件名、PDF原字节与无内部关联json。
- 真实GUI录入报价、多轮修改/阶梯价、漏报不当0、部分提交/锁定/沿用、非最低价定标原因及历史不可变；下载比价议价结果；不能用独立API写入模拟采购员操作。
- 完成浏览器F5、任务专属服务重启/断线未保存提示、业务持久化；S4实际UI下载、在**另一全新空目录**恢复并检查全部RFQ/PDF与修订，非空409拒绝且原数据字节不变；1366×768首条报价和960布局实际可见性。
- 每个动作添加可追溯CDP Input/session/dialog/DOM/截图/下载哈希/只读API或SQLite交叉验证的后置断言。无后置断言、不完整fixture、不在源码绑定范围内的selector不能进真实执行。

## 3. 本阶段必须提供的静态证据
- 新增完整计划/fixture、source-to-action覆盖表、PASS/NEEDS REVIEW/NOT TESTED追踪矩阵；记录冻结SHA以及本轮新增文件SHA；运行现有新V1严格静态预检与本阶段新增纯Node静态/模拟正负测试，证明 **完整 buyer-plan 文件，而非38条contract样例**都在浏览器连接之前通过。含一条后置计划无效时零启动/零HTTP证明。
- 若完整采购动作还不能安全预编译，真实标为 `PLAN BLOCKED: NEEDS REVIEW`，列出具体操作/字段/selector/期望文案，不运行Windows，也不继续循环一个个修script。
- 追加新的双语报告/结果与完整原始Node执行/退出码至PR50，回评PR46；PR48状态由ChatGPT审核后更新。**禁止本任务自动进入真实Windows验收**；等完整计划准备就绪、静态预检全部通过，才另一次明确安排原生Edge+Node24 CDP WIN03。

当前正式状态：Linux112 PASS，WIN01 44PASS，WIN02 10PASS，WIN03 PARTIAL/BLOCKED，**M1 NOT READY**，PR46产品SHA不变、无产品FAIL确认。
