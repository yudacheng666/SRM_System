# PR #24 最后一轮 C08/C09 独立集成验收

**结论：C08 PASS；C09 PASS。本轮必测用例 11 PASS / 0 FAIL / 0 NOT TESTED。仅限本轮范围，不代表整个软件验收完成。等待 ChatGPT 审核，不自动合并。**

产品唯一 SHA：`c8429ef51731da570c7a556d7cdce89e7123e739`。2026-10-20 UTC；实际浏览器操作 12:21:15–12:21:59。PR #24 开始/结束 HEAD 均一致且 Draft。测试依据：[最新一次性评论6290574455](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6290574455)。

## 版本、环境与权限

正式 `prototype/m1-lite/index.html` + 正式 `backend/server.main()`，通过未修改的既有 serve.py 只指定端口并禁止自动弹出系统浏览器；不是 PR23 概念原型或合成合并版本。tree `33688a7d740816f3082606c87e00ee367ff575ea`；HTTP 页面与 checkout 文件逐字节相同，SHA256 `bc4288bf60f8971f8549dac3bdb4015617a23eeb4ce383ed103c66908f00cb6b`。[版本证据](evidence/product-identity.json)。

真实 Chromium154.0.8037.57 / Playwright1.58.2，Linux云端。新独立工作区 `/tmp/srm-final24`；数据分别 `/tmp/final24/data` 与 `/tmp/final24/restore`，端口9480/9481；从空目录开始，未访问用户业务目录。只通过正式受保护本地API进行 SETUP ONLY，数据库读取使用mode=ro。服务与浏览器执行后已停止，虚构数据未清理或覆盖。[启动/停止日志](evidence/owned-runtime-stop.json)。

两套已完成 CI 均成功，Linux及Windows四个作业全部成功，本轮未重复执行CI作为独立结论：[UI Unified39394554901](https://github.com/yudacheng666/SRM_System/actions/runs/39394554901)、[S3/S4 39394554892](https://github.com/yudacheng666/SRM_System/actions/runs/39394554892)。[GitHub核对原始记录](evidence/github-verification.json)。

## 预审、数据与错误规则

执行前审查restore的`location.reload()`、非空拒绝、真实DOM/轮次/供应商选项、全部抽屉及报表toggle；冻结独立驱动与操作计划。[冻结记录](evidence/preflight-frozen.json)。所有10个驱动/校验文件执行后hash一致。没有运行中脚本修正，没有重跑；新规则允许的一次修正额度使用 **0次**。[执行摘要](evidence/execution-summary.json)。

仅重建必要的虚构1笔RFQ、4条物料、3家供应商、4份已确认报价提交共15行、3个人工定标、3个PDF；同一物料编码有不同规格，缺报/不供货保留。SQLite2条workspace_versions快照、3条assets。源是前轮同SHA合成数据fixture，不把它标为本轮C03–C07通过；本轮实际恢复与UI为新浏览器操作。PDF和fixture见[fixtures](fixtures)，[SETUP API日志](evidence/setup-api-log.json)。

此前PR40/41/42证据不改：[PR40](https://github.com/yudacheng666/SRM_System/pull/40)、[PR41](https://github.com/yudacheng666/SRM_System/pull/41)、[PR42](https://github.com/yudacheng666/SRM_System/pull/42)。尤其PR42恢复后的旧Response.json/CDP错误没有被删除或改成历史PASS；本轮按新规则避开该观察器错误，以新的实际操作完成C08。

## 用例结果

| 用例 | 结果 | 实际检查 | 证据 |
|---|---|---|---|
| C08-01 | PASS | S4 actual ZIP download and all manifest/SQLite/PDF bytes | [raw](evidence/C08-file-checks.json) |
| C08-02 | PASS | Empty actual UI restore POST200 followed by product reload | [raw](evidence/C08-restored.json) |
| C08-03 | PASS | Reloaded buyer decisions, locked quote histories and all database rows | [raw](evidence/C08-restored-history.json) |
| C08-04 | PASS | Nonempty UI refuses overwrite, sends no restore POST, data unchanged | [raw](evidence/C08-after-UI-refusal.json) |
| C08-05 | PASS | Nonempty backend actual409 RESTORE_TARGET_NOT_EMPTY, all data unchanged | [raw](evidence/C08-after-backend409.json) |
| C09-01 | PASS | 1024x768 five pages, four drawers, tables, controls, keyboard/search | [raw](evidence/C09-1024-overview.png) |
| C09-02 | PASS | 1366x768 five pages, four drawers, tables, controls, keyboard/search | [raw](evidence/C09-1366-overview.png) |
| C09-03 | PASS | 1600x900 five pages, four drawers, tables, controls, keyboard/search | [raw](evidence/C09-1600-overview.png) |
| C09-04 | PASS | P2 first supplier actual RFQ ZIP/Excel/PDF contents smoke | [raw](evidence/C06-supplier-smoke-checks.json) |
| C09-05 | PASS | P3 pure supplier navigation then new-project confirmation dismissed | [raw](evidence/C09-P3-clean-navigation-dismissed.png) |
| C09-06 | PASS | Full data/history/assets/PDF unchanged after all UI navigation | [raw](evidence/C09-final-history.json) |

用例计数11与159项浏览器检查、10项ZIP内容检查、8项供应商文件检查是不同概念；没有用断言数量扩大业务覆盖。[逐例CSV](results.csv)。

### C08 业务与安全：PASS

通过按钮实际下载 **1份** [S4 ZIP](downloads/C08-single-full-backup.zip)。核验CRC、manifest数据库SHA256、SQLite integrity_check=ok、workspaces/workspace_versions/assets全部行字段、3个PDF的实际字节与manifest哈希。源当前RFQ/报价/定标没有被备份动作改写。

空白目标由真实界面选择ZIP并确认，原始浏览器POST记录200，产品自动刷新后重新加载RFQ；未读取跨刷新的Playwright响应体。[浏览器完整日志](evidence/browser.jsonl)、[恢复服务日志](evidence/server-restore.log)、[恢复后当前/历史/资产/PDF](evidence/C08-restored-history.json)与[源基线](evidence/SETUP-baseline-history.json)全部相等。UI实际检查3个人工已选、0待人工决定、0新报价待复核；逐个打开甲方第1轮V1、第1轮V2、第2轮V1确认历史适用价10/9/7、已确认版本锁定、沿用行20；截图见下表及[C08历史](evidence/C08-history-2-1.png)。SQLite中的全部报价条款、来源、定标字段通过整行相等核验，无需重新执行C03–C07。

在已恢复的非空目标再次操作，**UI禁止覆盖且未发出第二次恢复POST**，提示就在恢复按钮附近：[截图](evidence/C08-nonempty-UI-refusal.png)。再用独立客户端向同一虚构非空目标实际POST原ZIP，得到 **HTTP409**，JSON `error=RESTORE_REJECTED`、`message=RESTORE_TARGET_NOT_EMPTY`：[原始响应](evidence/C08-backend-nonempty-response.json)。拒绝前后所有当前记录、历史、资产关联、PDF字节完全相同。此409是预期安全用例PASS，不计产品错误。

### C09 视觉及交互：PASS（限定范围）

三个尺寸均实际走过物料/分配/报价回收/比价/设置5页及项目/供应商/数据/图纸4种抽屉；导航当前状态、页标题、项目身份、保存状态可辨识。全部15页无文档横向溢出；宽表由局部容器提供横向滚动，不要求全部列挤入首屏。三尺寸输入搜索后回车仅显示目标物料，清除恢复4行；键盘Enter侧栏导航正确，焦点2px轮廓可见；已确认报价按钮禁用且相邻锁定解释可见。实际截图已目视复核，[视觉观察](visual-review.json)。

1024×768侧栏显示图标，报价明细及管理操作需局部横滚/页面纵滚；实际控件可达。展开管理抽屉仍占三栏之一、旁边关闭栏有留白；可考虑未来将活动抽屉加宽，属于本轮观察建议，未证明操作阻断或新P级缺陷。**未作PR23完整逐像素视觉认证。**

必要P2冒烟：本轮首次供应商甲询价包真实下载，ZIP/Excel4行身份和数量10/25/4/6、空白请求报价、无其他供应商或内部定标数据、3份PDF原字节均核验。[供应商ZIP](downloads/C09-first-supplier-A.zip)。P3冒烟：切换到按供应商视角并选择乙方后打开新建，获得正常“原来已保存的数据仍保存在SQLite”确认，无未保存修改误报；明确取消确认，没有新建RFQ。所有UI操作后完整当前/历史/资产/PDF与源基线相等。

| 页面/操作 | 1024×768 | 1366×768 | 1600×900 |
|---|---|---|---|
| 物料 / Items | [1024](evidence/C09-1024-items.png) | [1366](evidence/C09-1366-items.png) | [1600](evidence/C09-1600-items.png) |
| 分配 / Allocation | [1024](evidence/C09-1024-assign.png) | [1366](evidence/C09-1366-assign.png) | [1600](evidence/C09-1600-assign.png) |
| 报价回收 / Intake | [1024](evidence/C09-1024-quoteImport.png) | [1366](evidence/C09-1366-quoteImport.png) | [1600](evidence/C09-1600-quoteImport.png) |
| 比价 / Comparison | [1024](evidence/C09-1024-quotes.png) | [1366](evidence/C09-1366-quotes.png) | [1600](evidence/C09-1600-quotes.png) |
| 设置 / Settings | [1024](evidence/C09-1024-settings.png) | [1366](evidence/C09-1366-settings.png) | [1600](evidence/C09-1600-settings.png) |
| 数据抽屉 / Data drawer | [1024](evidence/C09-1024-data-drawer.png) | [1366](evidence/C09-1366-data-drawer.png) | [1600](evidence/C09-1600-data-drawer.png) |
| 项目抽屉 / Project drawer | [1024](evidence/C09-1024-project-drawer.png) | [1366](evidence/C09-1366-project-drawer.png) | [1600](evidence/C09-1600-project-drawer.png) |
| 供应商抽屉 / Supplier drawer | [1024](evidence/C09-1024-supplier-drawer.png) | [1366](evidence/C09-1366-supplier-drawer.png) | [1600](evidence/C09-1600-supplier-drawer.png) |
| 图纸抽屉 / Drawing drawer | [1024](evidence/C09-1024-drawing-drawer.png) | [1366](evidence/C09-1366-drawing-drawer.png) | [1600](evidence/C09-1600-drawing-drawer.png) |
| 锁定提示 / Lock hint | [1024](evidence/C09-1024-quote-lock.png) | [1366](evidence/C09-1366-quote-lock.png) | [1600](evidence/C09-1600-quote-lock.png) |

原始截图共43张，另有3张汇总图；汇总图仅缩略拼接用于浏览，原始PNG未替换。[1024总览](evidence/C09-1024-overview.png) · [1366总览](evidence/C09-1366-overview.png) · [1600总览](evidence/C09-1600-overview.png)。

## 缺陷、驱动与环境分类

本轮新确认产品P1/P2/P3：**0**；非预期产品失败0；驱动失败0、修正0；阻断环境故障0；pageerror0、requestfailed0。两条console error原样保留，服务日志对应`/favicon.ico`404，无业务API故障。预期非空409单独记录。没有删除失败样本：[完整原始错误登记](raw-error-register.json)。

159项浏览器检查均通过；这只说明记录中的检查通过，不能证明未测行为。未发现新的需优先修复的产品缺陷，也没有据此宣告旧范围外缺陷全部不存在。


另在浏览器完成后的只读证据审核中核对第四张表app_state：实际备份数据库、源最终数据库、恢复后最终数据库的全部行一致（当前RFQ身份）。[记录](evidence/app-state-audit.json)。这不是另一次界面重测，也不冒充中间时点的快照。

## NOT TESTED 与后续建议

本轮C08/C09约定必测项无未完成；下列**范围外项目 NOT TESTED（4组）**，不计入11条本轮用例分母：

1. Windows本机启动/原生浏览器/人工操作；云端Linux结论不能替代，Windows CI成功仅作外部记录。
2. PR23全页面完整像素一致性、全键盘/辅助技术、所有浏览器和分辨率；仅三尺寸关键UI操作通过。
3. C03–C07完整流程重跑；按交接保留同SHA前轮独立证据，本轮fixture是SETUP ONLY；只有恢复相关历史/定标及P2/P3必要冒烟实际新验。
4. OBS01的20/24次压力、故障注入、非法/损坏ZIP、断电/中途恢复、真实保存中并发及大数据恢复；本轮只做1份正常完整备份和规定安全拒绝。

建议ChatGPT结合前轮同SHA证据审核C03–C09整体，决定后续试用/是否可合开发基线。本报告仅把剩余C08/C09交付为PASS，**不自行宣布整个软件验收完成或RELEASE-READY**。

## 原始证据与权限

[Trace ZIP](evidence/independent-browser-trace.zip)含完整浏览器DOM/网络轨迹；[浏览器日志](evidence/browser.jsonl)、[主服务日志](evidence/server-main.log)、[恢复服务日志](evidence/server-restore.log)、[下载原件](downloads)、[前后数据](evidence)、[冻结独立方法文本](methods)、[文件SHA清单](SHA256SUMS.txt)。仅虚构业务资料；不含真实企业信息。

所有提交只在独立证据分支 `test/20261020-pr24-final-c08-c09` 新增本目录。产品、原测试、CI无修改。受保护远端引用[开始](evidence/protected-refs-start.txt)与[结束](evidence/protected-refs-end.txt)完全一致；main、开发分支、旧证据PR未修改，PR24保持Draft，未合并或关闭任何PR。
