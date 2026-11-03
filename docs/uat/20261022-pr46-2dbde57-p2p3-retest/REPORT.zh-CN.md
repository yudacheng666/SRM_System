# PR #46 P2/P3 独立修复复验（TEST-ONLY）

**本轮范围结论：PASS。P2/C05 PASS，P3/V01 PASS。** 唯一产品 SHA：`2dbde578165de720fed290cddbfef0a34e99f032`。

新 SHA 的完整本地云端套件为 **Python43 / Node10 / Chromium50，共103 PASS、0 FAIL、0 SKIP、0 RETRY**；独立业务复验 **8 PASS / 0 FAIL / 0 BLOCKED / 0 NOT TESTED**；另有原生 Windows **3 NOT TESTED**。没有新确认产品缺陷，没有本轮驱动错误或修正。

这不是 GitHub Actions 正式通过，也不是整个软件发布/合并批准。正式 CI、Windows 专项和所有者审核门槛仍保留。原 c2737f0 的102项及12PASS/2FAIL报告不改写、不挪用为本 SHA 通过。

## 1. 任务、版本与隔离

[完整交接](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6338965924)。已核对 PR #46 Draft HEAD 与准确 checkout 一致；程序在独立 detached `/tmp/srm46-retest-product` 运行，实际 HTTP HTML 与 checkout SHA256 均为 `8f83160fb81b3d0626743e419a8f6882abce668aa5d2867f8ad8fbd27667e040`，不是概念原型/未确认合成合并版。[身份起点](identity-start.json)、[HTTP 身份](http-product-identity.json)、[终点](identity-end.json)。

读取当前 M1 的 AGENTS/PROJECT_STATE/DECISIONS，并以 GitHub 当前 refs 和新授权为事实；不更新主记忆。最新用户明确允许云端替代受限 Actions 的开发套件，且禁止修改主记忆，这两项优先于旧文档通用门槛。使用 cloud-environment-runtime 核对网络环境；没有使用 Actions 或付费 runner。

云端 Linux、Python3.12.14、Node24.19.0、Playwright1.58.2、真实 Chromium154.0.8037.57。使用既有且与本提交 package-lock 字节一致的依赖安装；仅临时链接 node_modules，结束已移除。原测试、断言、CI均未修改。所有数据仅来自虚构材料，SQLite目录 `/tmp/pr46-retest/independent/data` 为全新；各自动化也使用自己的临时数据。没有访问现有用户业务数据。

独立复验先将上轮实际虚构 S4 ZIP 通过新版本真实恢复界面导入空目录，逐字段核对4表/历史/3份PDF与原快照一致，作为同一匿名案例的前置数据；后续重置、重选、报价修订及异常操作全部来自实际 UI。恢复旧数据不被当作新 SHA 业务已通过；新页面、计算、保存及导出均重新验证。独立 driver 已预审动态 visible/enabled、面板open状态与真实异步条件，没有重复 toggle 错误。方法及冻结哈希见 [preflight-methods.json](preflight-methods.json)。

## 2. 完整自动化实际执行

| 命令（未修改原命令/测试） | 结果 | 原始证据 |
|---|---|---|
| `python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'` | 43 PASS，退出0 | [stderr](automation/python-backend/stderr.log) / [命令](automation/python-backend/command.json) |
| `npm test` | 10 PASS，退出0 | [stdout](automation/node-business/stdout.log) / [命令](automation/node-business/command.json) |
| `npm run test:e2e` | 50 PASS，退出0；单worker、零重试/跳过 | [stdout](automation/chromium-e2e/stdout.log) / [命令](automation/chromium-e2e/command.json) |

仓库支持的 `SRM_CHROMIUM_PATH=/usr/bin/chromium` 指向实际浏览器，没有改配置或替换业务断言。新用例 `UX manual-only: buyer-approved amount distinct from suggested totals / 人工定标金额独立显示` 已真实执行并通过。本轮103是新SHA的执行事实，不是旧102的复制。逐个自动化结果见 [automation-cases.csv](automation-cases.csv) / [runner 摘要](automation/automated-results.json)。所有原 runner JSON、50份trace、服务器日志和HTML报告无损归档，见[解包说明](README-raw-evidence.md)。

## 3. P2/C05 定向业务复验

| ID | 结果 | 实测事实 |
|---|---|---|
| P2-01 | PASS | 人工L2乙82×2、L5乙75×5、L12甲120×12，**3项/¥1979.00**单列；理论**¥6940.00**、建议混合**¥7064.00（含自动建议）**及标签不变 |
| P2-02 | PASS | 新版真实下载 CSV、内部比价Excel、3家单独及全部供应商ZIP，46项数值/身份/隔离/PDF字节检查通过；导出不改数据库 |
| P2-03 | PASS | 点击恢复默认最低价后人工0项，提示尚无有效人工定标、不误报人工¥0报价；真实重新选择3行并保存、F5后仍为1979 |
| P2-04 | PASS | 乙同轮新版本将L2真实改为83并确认，L2被标记待复核；人工汇总只计L5/L12：**2项/¥1815.00**；旧确认报价不变，F5后仍排除 |
| P2-05 | PASS | 新建正式询价并真实导入12行、没有有效报价；人工汇总为明确0项无已确认定标，不显示误导的人工零价金额 |

1979 =164+375+1440；1815 =375+1440。未操作状态集合伪造结果；通过真实重置、报价新版本和UI确认触发。独立文件核验再次确认甲自身10项6420、乙12项7185、丙2项990，甲乙共同10项6420/6665；缺报不作零，适用阶梯单价不变。内部Excel第12行120、第2行82及高价理由正确，RFQ身份与全部12行一致。

[三金额同屏截图](independent/evidence/P2-3-manual-1979-theory6940-mixed7064.png) · [重置0项](independent/evidence/P2-zero-after-reset.png) · [待复核排除](independent/evidence/P2-excludes-pending-review-1815-2-lines.png) · [无有效报价](independent/evidence/P2-no-effective-quotation-zero-manual.png) · [实际文件46项核验](independent/evidence/export-checks.json)。

## 4. P3/V01 三尺寸与真实状态

| ID | 结果 | 实测事实 |
|---|---|---|
| P3-01 | PASS | 1024×768 /1366×768 /1600×900，在物料/分配/报价回收/比价/设置5页面共15布局，项目与诊断收起后仅一个常驻保存提示；旧镜像节点不存在；保存摘要和实际API/SQLite状态相同。三尺寸都展开读取原3个诊断节点，保留版本/时间/备份信息 |
| P3-02 | PASS | 新增虚构供应商形成真实未保存数据；仅暂缓真实PUT再继续，不伪造响应。三个尺寸显示pending，未误显已保存；请求未放行前整个DB历史/PDF不变；放行后真实200保存，新供应商实际持久化 |
| P3-03 | PASS | 两个真实标签页使用同SQLite旧版本：先保存者成功，旧页提交实际HTTP409。三尺寸唯一摘要显示“保存异常·查看详情”，详情HTTP409/停止自动重试。旧页未保存供应商仍留内存，但从未被假确认；全部已保存DB行/PDF与先保存者一致，F5后保留先保存者结果 |

未保存时实际摘要文字是 **“保存状态待确认”**（pending样式），详情显示 **“正在自动保存……”**；没有误显已保存。本轮按“真实且不虚假报成功”通过；可用性建议是将保存中的摘要文案进一步细化，这是观察建议，不作为已确认新缺陷。异常为真实SQLite版本冲突，不是截断请求或假造409。

| 尺寸 | 保存成功 | 真实待保存/保存中 | 真实409异常 | 异常原始详情 |
|---|---|---|---|---|
| 1024×768 | [截图](independent/evidence/P3-saved-1024-quotes.png) | [截图](independent/evidence/P3-pending-1024.png) | [截图](independent/evidence/P3-conflict-1024.png) | [详情](independent/evidence/P3-conflict-diagnostics-1024.png) |
| 1366×768 | [截图](independent/evidence/P3-saved-1366-quotes.png) | [截图](independent/evidence/P3-pending-1366.png) | [截图](independent/evidence/P3-conflict-1366.png) | [详情](independent/evidence/P3-conflict-diagnostics-1366.png) |
| 1600×900 | [截图](independent/evidence/P3-saved-1600-quotes.png) | [截图](independent/evidence/P3-pending-1600.png) | [截图](independent/evidence/P3-conflict-1600.png) | [详情](independent/evidence/P3-conflict-diagnostics-1600.png) |

[HTTP409原证](independent/evidence/P3-conflict-http.json) · [SQLite前后快照与浏览器/服务端日志](independent/evidence) · [独立trace](independent/evidence/independent-trace.zip)。详情中额外诊断和项目摘要是主动展开内容，不计作第二个常驻状态；没有隐藏异常来获得单状态结论。

## 5. 错误、环境与未测范围

本轮独立8组、117条显式业务/状态检查通过（不与103个套件用例混计），另有46条文件检查。没有本轮驱动错误/修正、pageerror或失败传输；真实409是预期安全拒绝，console日志原样保留。Node/Playwright NO_COLOR/FORCE_COLOR警告为非致命环境信息；所有命令退出0。[原始错误登记](raw-error-register.json)、[执行摘要](independent/execution-summary.json)。

准确SHA的 [UI Actions 39766115997](https://github.com/yudacheng666/SRM_System/actions/runs/39766115997) / [S3S4 Actions 39766115887](https://github.com/yudacheng666/SRM_System/actions/runs/39766115887) 均为failure；查询4个job没有返回执行步骤（steps=null）。[原始运行](actions.json) / [UI job](actions-jobs-ui.json) / [S3S4 job](actions-jobs-s4.json)。交接说明账户额度/计费阻止启动；job空步骤本身不独立证明计费根因。本轮云端103PASS不能转换成官方Actions成功，正式CI门槛未解除。

**NOT TESTED**：原生Windows Python3.13、Windows Node、PowerShell/批处理本机启动3组；没有真实Windows环境。其他未纳入本轮的范围：穷举故障/负载、多浏览器、全可访问性与像素一致性、真实企业数据/真实Excel桌面。没有用Linux推断Windows或全软件通过。

## 6. 归档与建议

新证据只追加到现有Draft PR #50 的 `docs/uat/20261022-pr46-2dbde57-p2p3-retest/`；原两个c2737f0目录/报告不改。证据分支历史HEAD不是本次运行产品SHA；本报告及独立worktree才明确锁定2dbde57。完整原始归档按标准tar硬链接无损去重相同副本、32MiB分片，所有原文件hash回验通过；共34张独立原始截图、1份独立trace及50份套件trace。

建议 ChatGPT 审核本轮证据后认定两项指定整改已通过范围复验，再处理正式CI/Windows及所有者审批门槛。**不合并证据PR或产品PR，不宣布整个产品release-ready。** 产品、原测试、CI、主记忆、main/M1/产品分支均未改，没有关闭任何PR。
