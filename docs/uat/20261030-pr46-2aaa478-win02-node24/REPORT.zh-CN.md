# WIN-02 · 原生 Windows Node24 原始业务单测

**WIN-02 PASS：10 PASS / 0 FAIL / 0 SKIPPED / 0 CANCELLED / 0 TODO，真实退出码0。整体仍NOT READY。**

按[最新D-033任务](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6514565031)使用现有Node24执行，**不要求安装Node22或npm**。已阅读PR48当前文档分支提交dfbad47d36dfe7df2fac305bc67acac2c5743e0f中的D-033原文。它仅修订本次WIN-02临时验收，不改变官方CI、产品SHA或WIN-03真实浏览器门槛。旧Node22未测事实保持历史原样。

## 实际环境与命令

- 原生 **Microsoft Windows 11 专业版 x64**，CIM Version10.0.26200，CMD ver10.0.26200.9711；PowerShell7.6.5；无WSL环境变量。
- 实际已有Node **v24.22.1**，process.platform=**win32**，process.arch=x64；where.exe node、process.execPath与实际启动的node.exe一致，位于现有Codex运行库。node --version与where.exe均exit0；NODE_OPTIONS未设置。
- 从完整准确源码的**仓库根目录**，原生命令如下，明确列出两文件，无shell通配符歧义：

```text
node --test prototype/m1-lite/tests/autosave_rules.test.cjs prototype/m1-lite/tests/supplier_package.test.cjs
```

实际由PowerShell Start-Process -WindowStyle Hidden调用同一明确node.exe，原参数不变，独立重定向完整stdout/stderr。没有替代断言、测试过滤、跳过、额外超时或重跑。原package.json的npm test对应node --test prototype/m1-lite/tests/*.test.cjs；此目录的两份原文件全部执行，使用Node内置测试器和标准库。

- Asia/Shanghai：**2026-10-30 12:00:08.8249008 +08:00 → 12:00:08.9934417 +08:00**；PID **11820**；外层墙钟0.1685409秒。
- 原生退出码 **0**；Node报告duration_ms **88.8195**。
- **stdout876字节**，含10条实际通过记录和原始统计；**stderr0字节**，空文件也上传。详见execution.json、environment.json及原始日志。

## 完整10项实际结果

| 原测试文件 | PASS | FAIL / SKIP |
|---|---:|---:|
| autosave_rules.test.cjs |4|0|
| supplier_package.test.cjs |6|0|
| **合计** |**10**|**0**|

逐项名称、状态和实际耗时见results.csv。Node原始报告tests10、pass10、fail0、cancelled0、skipped0、todo0；与10个原始通过条目和真实退出码逐项核对。

覆盖原自动保存规则（真实变更/空白初存/忙碌或缺失后端/不变指纹），以及原供应商打包模块（文件名/字节/供应商隔离和无内部JSON、同PDF去重、大小写冲突拒绝、同名独立内容、不安全名/损坏字节拒绝、内部备份保留独立JSON索引）。原测试从真实index.html提取内联模块，在VM和内存虚构PDF/ZIP fixture中执行，未重写一套看似相同的业务断言。**这些是业务单元测试，不是Windows浏览器采购员外发ZIP或真实PDF可视化验收。**

## 源码身份及隔离

唯一产品/原测试SHA **2aaa478c8f1966e41b9372d9d989c383dbaa1972**，PR46开始和结束查询均一致。复用完整准确SHA物化源码；本轮重新读取该SHA完整GitHub递归树，并在运行前后核对全部**146个原始文件**Git blob SHA-1及SHA256，0变化。包括：

- autosave_rules.test.cjs Git blob35cd0e8694f398af804544b6e0a84e55b1a61cc2；SHA256 e4f18e6044b98dd39a5fa2137c529df68c430323c3a5b866531c7aa8fde90944。
- supplier_package.test.cjs Git blob37d8f19c84e4665e9ca3725c6a522b20c17b29c4；SHA256 1e443e691cf5163f9ae4a8e4e7ad5cb7e28c63afb735be9a711c902063b3c453。
- index.html SHA256 **bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3**。

该目录是完整GitHub API tree/raw-blob物化源码，非git checkout；非main、旧candidate或合成merge。没有仅凭HTML哈希声称原测试身份。

运行前新建本轮独立目录并设置SRM_DATA_DIR、TEMP/TMP到其下全新子目录；原测试fixture均为内存虚构资料。未访问或覆盖既有业务目录。测试进程已退出；data/temp均0项。本轮未启动BAT、API服务或浏览器；无安装、系统PATH变更或npm执行。

## WIN-03浏览器条件（仅检查，未执行UI流程）

一次浏览器清单检查只返回**IAB id3与MCP Apps id1**，没有原生Edge/Chrome连接；未重复调用已知失效连接。

只读文件检查找到现有Edge156.0.4314.50、Chrome156.0.8078.48，但**文件存在不等于可用自动化或真实GUI验收**。从准确源码根目录及当前Node所属运行库根两处解析playwright、@playwright/test、playwright-core，均MODULE_NOT_FOUND。此结论限定于这两处明确检查位置，不声称遍查整台电脑。未验证浏览器启动权限，也未下载、安装或启动替代浏览器。

因此**WIN-03保持BLOCKED**。没有本轮UI截图/trace；不伪造。既有BAT/S4 API子项不重复；不以本次Node VM供应商ZIP单测替代真实Windows浏览器采购流程。遵照用户本轮“只执行WIN-02，并检查WIN-03浏览器条件”的范围。

## 回写、历史与门槛

**WIN-01已PASS（先前Python3.15 44/44，本次未重跑）；WIN-02本次Node24 10/10 PASS；WIN-03 BLOCKED；整体NOT READY。** 本次新执行数只有10，不把历史44或Linux套件计成本次新增通过。

在现有Draft PR50证据分支仅追加新目录docs/uat/20261030-pr46-2aaa478-win02-node24/，旧证据不改。原始命令、stdout/stderr、逐项结果、环境/路径、source-before/source-after、浏览器预检和清理记录均归档。上传副本仅替换本机用户名和源码/运行根路径占位符；checksums.json记录原件和副本校验值。

不修改产品、原测试、CI、main/M1或PR48记忆。不执行npm ci/npm test包装器、依赖锁文件安装、Playwright E2E、Python或Linux复测。不触发Actions，不合并/关闭PR；证据提交带[skip ci]，工作流条件和提交后运行记录在回评中核实。本轮WIN-02通过不构成合并授权。
