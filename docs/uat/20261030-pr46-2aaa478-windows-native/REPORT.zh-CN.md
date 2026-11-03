# Windows 原生专项验收（含一次用户授权重试）

结论：NOT READY。三组为 0 PASS / 0 产品 FAIL / 2 NOT TESTED / 1 BLOCKED。下列补充检查不得替代整组通过，也不是 GitHub Actions。

- 时间：2026-10-30，Asia/Shanghai。原始预检 11:03，补充恢复完成 11:15；具体时间见各原始日志。
- 唯一产品/原测试 SHA：2aaa478c8f1966e41b9372d9d989c383dbaa1972。开始及重试时 PR46 HEAD 一致，结束再次查询见回评。
- 原生 Windows x64，Win32NT，Build 26200.9711；CMD 的 ver 与原生 Python 的 os.name=nt / platform.system()=Windows 一致；无 WSL 环境变量。Windows 注册表 ProductName 保留 Windows 10 Pro 字样、DisplayVersion=25H2；不以该历史字段猜测系统营销名称。
- PowerShell 7.6.5、Windows PowerShell 5.1.26100.9711。初始受限沙箱的 CIM、WindowsApps 别名、DNS/套接字操作部分失败；批准的原生执行环境中 CIM/本机 HTTP 可正常读取。未把沙箱故障当作产品缺陷。
- 全新隔离源码通过已连接 GitHub API 获取指定 SHA 的完整递归树及全部 146 个原始 blob，逐文件计算 Git blob SHA-1 一致；不是 main、merge ref 或旧 candidate 目录。非 git checkout，身份来源和所有文件校验见 source-identity.json。结束再次校验 146 文件，无变化。
- 磁盘及实际 HTTP 的 prototype/m1-lite/index.html SHA256 均为 bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3。

## 三组状态

| 组 | 状态 | 真正执行与限制 |
|---|---|---|
| WIN-01 Python 3.13 | NOT TESTED / prerequisite BLOCKED | CMD 执行 py -3.13 --version，exit 1；WindowsApps py.exe 无法执行。只找到原生 Python 3.15.0， bundled Python3.12。未执行要求的3.13完整 unittest，不拿3.15替代。 |
| WIN-02 Node 22 | NOT TESTED / prerequisite BLOCKED | node --version 为 v24.22.1，where node 指向 bundled runtime，npm --version 找不到命令，组合探测 exit1。未执行 npm ci / npm test，未用Node24套件替代。 |
| WIN-03 BAT/Edge/磁盘安全 | BLOCKED（部分已执行） | BAT根目录与中文/空格其他工作目录实际启动；HTTP/PDF API、重启持久化和S4空目录恢复/非空拒绝完成。Edge采购员完整操作因浏览器控制阻塞及重试时原生浏览器连接缺失而未完成。 |

## 已执行的补充检查（不计入三组 PASS）

1. 原始源码身份与结束146文件不变：PASS。
2. 固定 BAT 从源码根目录、绝对路径跨“其他 工作目录”启动：PASS。两种工作目录均正确运行此源码的 backend/server.py；本进程 PATH 临时前置已安装 Python3.15，未改系统 PATH。服务的 PID 依次为22468、15704、24252，均保存命令行证据。启动前原生绑定确认8765空闲，没有杀掉或复用未知服务。
3. 两笔虚构询价/报价状态、两份PDF测试字节在BAT重启后保持一致：PASS（API层）。最初询价A由Edge新建/命名/保存，第二笔及补充物料、供应商、报价由独立API驱动写入；并非两笔采购员UI导入验收。A原有revision1/2保留，补充为revision3，B为revision1。
4. PDF API原件字节及跨询价读取隔离：PASS。各68字节%PDF测试载荷与上传前SHA256相同，另一询价请求为404；仅验证后端字节存储，不证明可渲染真实PDF、UI行关联或供应商外发ZIP。
5. 当前版本S4完整备份创建/下载/清单：PASS。HTTP201，verified=true，2 workspace / 2 PDF / 2 assetLinks，38558字节。ZIP SHA256 7ebc09c229dde960a94cf0aff44dcb933cd047494bff9b7aa4180a674ff848d0。
6. 另一随机新建空SRM_DATA_DIR恢复，以及非空再次恢复拒绝：PASS。空列表确认后恢复HTTP200；业务快照、报价和两份PDF字节逐一一致；再次恢复HTTP409 RESTORE_TARGET_NOT_EMPTY。拒绝前后全部SQLite逻辑dump哈希与资产PDF哈希一致，详见restore-rejection-integrity.json。SQLite逻辑dump SHA256为cf54b64c63e35add6dafde5863f3b849bcfd6d5b48eb112f7dcaa43bff4dcdd9。

## 未完成 / 不得推断通过

未完成真实采购员物料/供应商导入、真实PDF可视化及行关联、F5/关闭浏览器持久化、供应商外发ZIP范围隔离、断线保存失败提示、Windows锁冲突注入及篡改ZIP恢复；均NOT TESTED。BAT重启与API校验不能替代这些步骤。没有可供本轮交付的真实截图或trace，不伪造。

## 原始故障与修正

- 首次沙箱BAT虽启动但原生浏览器/HTTP不可达；保留日志并停止该会话，改用批准的原生执行环境后健康与HTTP校验成功。
- Edge首次 Page.getFrameTree / Input.dispatchMouseEvent / Emulation.setFocusEmulationEnabled 超时；新建第二笔时页面确实显示确认框。未重复点击未知状态。原生computer-use因无法可靠确认浏览器URL停止，遵守停止要求。
- 用户“重试一次”后，复用浏览器连接报 Browser is not available: 2；重新列举仅有iab与MCP Apps，无原生Edge/Chrome连接。未用其他浏览器环境冒充本机Edge通过。
- 本次独立补充驱动seed exit1：创建B后仍向非当前A上传PDF，产品正确HTTP400 “PDF upload requires the currently active RFQ”。这是驱动错误，不是产品FAIL；原始seed-retry.log完整保留。一次显式驱动修正：上传前通过/api/active/select并带expectedActive选择目标。assets检查exit0，backup检查exit0，restore检查exit0。此次为同一隔离库的检查点续做，不冒充全新独立采购员重跑，不修改产品或原测试断言。

## 隔离、清理与交付

只使用本任务新建根目录下的源码、data-随机目录、restore-empty-随机目录和虚构数据。未读取或覆盖实际LOCALAPPDATA/SRM-Lite及既有采购资料。原始路径保留本机，上传文本仅替换隔离根/用户目录为占位符；未改日志业务值、HTTP响应、异常或结果。历史云端证据不修改。

三次原生服务均向所属exec会话发送Ctrl+C；exec包装退出码为1，未据此声称应用优雅退出0。随后原生CIM确认本任务server.py进程0个，并成功独占绑定127.0.0.1:8765确认端口空闲，见cleanup.json。隔离虚构数据保留以供复核。

只在现有PR50证据分支新增本Windows目录，提交带[skip ci]，不修改产品、原测试、CI、main/M1，不重跑Linux套件，不触发Actions，不合并/关闭任何PR。仍须补齐Python3.13、Node22和可用原生浏览器后才能完成本专项。此报告不授权合并。
