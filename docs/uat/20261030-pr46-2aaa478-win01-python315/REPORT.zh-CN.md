# WIN-01 · 原生 Windows Python 3.15 完整后端验收

**WIN-01 PASS：44 PASS / 0 FAIL / 0 ERROR / 0 SKIPPED，真实退出码 0。整体仍 NOT READY。**

按 [2026-10-30最新授权任务](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6514275508) / D-032，仅将WIN-01运行门槛由旧Python3.13改为当前已安装Python3.15；不修改或覆盖先前Windows证据，不变更官方CI矩阵。WIN-02 Node22保持NOT TESTED，WIN-03原生浏览器采购员流程保持BLOCKED。本次未执行浏览器、Node或Linux套件。

## 本次实际执行

- OS：原生 **Microsoft Windows 11 专业版 x64**。CIM版本10.0.26200；CMD ver为10.0.26200.9711。Python识别os.name=nt、platform.system()=Windows、release=11、machine=AMD64；无WSL环境变量。
- PowerShell 7.6.5；Windows PowerShell 5.1.26100.9711。
- 已安装Python **3.15.0**，sys.version为3.15.0 (tags/v3.15.0:d220409, Oct 9 2026, 11:55:56) [MSC v.1951 64 bit (AMD64)]；SQLite **3.53.4**。
- 使用明确的原生已安装python.exe，并仅在本次命令进程的PATH前置其目录；where.exe python首项即该目录，WindowsApps别名仍列为后续项。python --version、where.exe python、CMD ver均退出0。未安装、降级或修改系统PATH，也未再要求py -3.13。
- 从完整准确SHA源码的**仓库根目录**实际执行原始命令：

```text
python -m unittest discover -v -s prototype/m1-lite/backend -p "test_*.py"
```

通过Start-Process启动上述明确的python.exe及原始参数，分别重定向完整stdout/stderr，不注入测试包装器、不改变发现规则或断言。实际运行脚本、路径、PID、环境、命令及退出码全部留证。

- Asia/Shanghai：**2026-10-30 11:34:15.226 +08:00 → 11:34:25.926 +08:00**。
- 进程PID **17552**；外层墙钟10.700秒；unittest自身报告 **Ran 44 tests in 9.552s / OK**。
- stdout为**0字节**（原始unittest结果写stderr）；stderr为**12582字节**，完整保留。stdout空文件也作为证据上传，不拼接或重写成伪输出。

## 原始测试逐模块结果

| 原测试模块 | 实际通过 | 失败/错误/跳过 |
|---|---:|---:|
| test_auto_backup | 10 | 0 |
| test_s3_regression | 8 | 0 |
| test_s4_backup | 8 | 0 |
| test_s4_server | 4 | 0 |
| test_server | 7 | 0 |
| test_store | 7 | 0 |
| **合计** | **44** | **0** |

逐项结果见results.csv；44个原始测试身份、各自ok、Ran44、末尾OK与进程exit0相互核对。未跳过/放宽/重写任何测试，无失败重跑或驱动修正。本轮未发现可由该套件确认的Python3.15兼容性问题，不据此声称任何未覆盖功能安全。

已查看SQLite/PDF/ZIP/S4相关真实结果：包括两询价历史版本及PDF字节完整ZIP往返、非空目标拒绝覆盖、PDF/数据库哈希篡改拒绝、缺失/多余条目拒绝、错误/缺失清单与SQLite有效性校验、自动备份变更检测和保留策略，以及实际HTTP备份下载/空目标恢复/第二次409拒绝。原始日志的HTTP403/400/404/409是对应负向用例的预期响应，其测试最终ok，不是本轮失败。

## 准确源码与隔离

产品和原测试唯一SHA：**2aaa478c8f1966e41b9372d9d989c383dbaa1972**。PR46 HEAD在开始和结束查询均未变化。

复用上一轮已完整获取的准确SHA源码目录，不使用旧candidate目录或业务数据。本轮重新从GitHub读取该SHA完整递归树，再对磁盘全部**146个原始文件**逐一计算Git blob SHA-1并匹配，包括全部6个backend/test_*.py。运行前/后均保留每文件blob和SHA256；后验无任何原文件变化。这是完整GitHub API树/原始blob物化源码，**不是git checkout**，来源如实记录，未仅凭HTML哈希断言测试身份。

HTML SHA256仍为 **bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3**。本轮不启动HTTP页面，旧HTTP哈希不冒充新请求。

本轮新建独立运行根，并将SRM_DATA_DIR、TEMP、TMP及PYTHONPYCACHEPREFIX指向其下全新目录；PYTHONIOENCODING=utf-8仅用于真实命令输出编码。原测试各自使用TemporaryDirectory，运行的SQLite/PDF/ZIP均为原始虚构fixture。未访问/恢复/覆盖实际LOCALAPPDATA/SRM-Lite、旧询价或其他业务目录。

原始测试自行清理临时fixture；结束temp目录0项、data目录0项，测试PID已退出。pycache仅保留于本轮新目录供复核。未启动BAT/浏览器服务，无本轮需另行停止的业务服务。

## 回传与边界

新增独立版本化证据目录docs/uat/20261030-pr46-2aaa478-win01-python315/到现有Draft PR50。原始文件保留本机；上传副本只将本机用户名、源码根和本轮根路径替换为占位符，测试业务值、状态、HTTP响应及退出码不变。checksums.json同时记录本机原件与上传副本SHA256，空stdout也在清单内。

产品、原测试、CI、main/M1和所有历史证据保持原样。本次只运行一次Windows Python3.15原始完整套件；不重跑Linux或Node，不触发Actions，不合并/关闭任何PR。证据提交使用[skip ci]并核对工作流条件及提交后的运行记录；具体提交/最终查询见PR回评。

**当前门槛：WIN-01 PASS（本次3.15授权范围）；WIN-02 NOT TESTED；WIN-03 BLOCKED；整体NOT READY，不能据此合并。**
