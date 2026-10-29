# PR #46 文案、备份与业务独立验收 / TEST-ONLY（2026-10-29）

**结论：NOT READY。唯一产品 SHA `f8a67d72a3f798289067384a827e871ba16bca45`。**

**本报告实际运行平台为 Linux，不是 Windows。** 用户要求的独立Windows程序目录、数据目录及原生Windows运行环境未提供，3组Windows专项均 **NOT TESTED**。没有在用户Windows电脑、LOCALAPPDATA或任何既有业务目录执行。以下Linux/Chromium实测是补充证据，不能冒充Windows通过或正式Actions通过。

| 范围 | PASS | FAIL | NOT TESTED |
|---|---:|---:|---:|
| 原Python后端（Linux） |44|0|0|
| 原Node业务（Linux） |10|0|0|
| 完整原Chromium（Linux，57项） |34|23|0|
| 本轮独立任务分项 |25|2|3|

完整自动化 **88 PASS /23 FAIL，111项，0skip/0retry**。独立分项与自动化重叠，不能加总。另保留2次阻断性独立驱动错误/2次记录处理，以及1次不阻断的虚构名称预期错误；不把这些冒充产品缺陷或抹掉FAIL。旧f4bfcda110PASS及其他历史SHA结果没有转移到本SHA。

## 1. 准确身份、隔离与权限

开始/结束PR46为指定SHA，Draft、未合并；正式M1Lite detached `/workspace/srmf8-product`。虚构物料/供应商/报价/3份多页PDF，新数据目录 `/workspace/uatf8/attempt-02/data`；恢复另用classification-restore-target和restore-target。continuation只重连本任务刚生成的同SHA数据，不是旧模拟资料迁移。无原生Windows、cmd.exe或pwsh；不以Linux目录假装独立Windows目录。

[起点](identity-start.json)、[终点](identity-end.json)、[首轮HTTP](http-start.json)、[新空目录HTTP](http-attempt02-start.json)、[结束HTTP](http-end.json)：实际HTML SHA256 **7e76ec5aa0d9b660b95ca66554c61f6c6e38fc7d182d0ece299ef1bcbcb5b055**。另外从未改动原始trace只读核验 **78份根页面响应** 全部匹配、0缺失响应体，[核验](http-trace-identity.json)。无静态概念原型、其他开发版本或未经确认合并版本。

环境：Linux/Python3.12.14/Node24.19.0/Playwright1.58.2/真实Chromium154.0.8037.57；Node24不等同原生WindowsNode22。读取PR46当前[开发交接](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6489416166)和PR48未合并HEAD `f0f42a61acb223675b5112940d56e1eb9b602ced`的AGENTS/PROJECT_STATE/DECISIONS；本轮不修改主记忆。只追加现有Draft PR50的新目录，旧证据不变。不修改产品、既有测试、CI、开发/main/M1分支，不合并/关闭PR，不触发Actions。

## 2. 六页用户文案：指定术语通过，异常反馈仍有缺陷

实操六页：询价项目、物料与图纸、供应商分配、报价回收、比价议价、数据与备份。分别检查新建前和有真实业务数据后，采集实际渲染body文字、可见控件title/placeholder/aria-label，并**真正悬浮54个提示实例**（包括静态与运行时生成提示）。另记录pending、409、离线、下载、拒绝/成功恢复等状态；共 **24份状态采样**。

这些已访问可见内容中 **S4/M0/M5/SQLite及其他M数字阶段标识命中0**。[原始采样](copy-summary.json)、[提示原文与坐标](attempt-02/evidence/tooltip-audit.json)。不把隐藏DOMID、代码注释、后台manifest机器格式当作用户文案；也不据此宣称未访问的所有设置、编辑弹窗/导入映射分支都没有问题。六页默认界面可见文案为PASS；异常路径下面单独FAIL。

**P3-COPY-02：恢复错误仍直接向采购员显示内部标识（文案/异常体验）。**

复现：用本SHA真实下载“询价与图纸资料包” → 本SHA另一个空白数据目录 → 数据与备份 → 在完整恢复入口选择该ZIP并确认。实际真实HTTP400，UI显示 **“完整恢复未成功：RESTORE_INVALID_ARCHIVE_ENTRIES（HTTP 400）”**；合法ZIP_STORED内容篡改场景还显示`RESTORE_PDF_HASH_MISMATCH`。这些不是前述四个被清理的词，但仍是内部实现标识，采购员难以据此纠正文件选择。

预期：用通俗中文说明“选择的是资料包，不能用于完整恢复，请使用‘下载完整备份’生成的文件”等，技术码放日志/详细诊断；实际安全拒绝应继续保留。这里**恢复保护正确、目标未变**，FAIL指反馈语言，并非覆盖恢复成功或损坏。[失败界面](attempt-02/evidence/BACKUP-archive-restore-refused.png)、[真实请求/响应](attempt-02/evidence/archive-rejection-real-backend.json)、[校验错误界面](attempt-02/evidence/S4-STORED-hash-mismatch-real-UI.png)。交ChatGPT修复，不在测试分支修产品。

补充观察（不增列确认缺陷）：实际仅数据JSON建议文件名仍为“SRM_单笔结构化测试导出.json”“SRM_全部询价结构化测试导出.json”，与按钮的“备份”命名不完全一致；可后续统一。该观察不是文件内容丢失结论。

## 3. P3-UI-01：提示浮层裁切，并使整页横向溢出

这是确认的UI/操作体验缺陷，与23条自动失败中的6条真实几何失败相互支持，不能全部解释成过时断言。

| 独立实测页面 | viewport宽 | 默认document宽 |
|---|---:|---:|
| 报价回收 |1366|1512|
| 数据与备份 |1366|1646|
| 报价回收 |1600|1746|
| 数据与备份 |1600|1880|
| 比价议价 |1024|1074|
| 数据与备份 |1024|1315|

Escape、失焦、移开鼠标后，越界节点仍是`visibility:hidden`的提示浮层，页面几何已被撑宽。1366×768悬浮备份安全图标，弹层left1286/right1646，右侧被截断；报价回收提示right1512也越界。54次悬浮中7个实例越过视口边界（跨初始/有数据状态重复采样，不是7个独立缺陷）。常驻备份风险警告仍可见，因此未确认数据安全损坏。

预期：隐藏帮助不应增宽整页，展开后全文应在视口内可读；建议采用碰撞检测、翻转/平移和隐藏态布局隔离，保留键盘可访问性，不要仅放宽测试阈值或把溢出强行裁掉。[备份提示截图](attempt-02/evidence/TIP-17-populated-backup.png)、[报价页截图](attempt-02/evidence/LAYOUT-1366-quoteImport.png)、[布局原始值](attempt-02/evidence/layout-overflow.json)。用户不必先导入真实资料，空白/演示状态同样可复现提示问题。

**1366×768首条有效报价整行可见：PASS。** 12物料/3供应商真实确认报价，scrollY=0，top **701.140625**、bottom **742.921875**、height **41.78125px**，viewport768；价格与详情同行，实际展开不误定标，点击真实价格按钮有效。它与上述横向溢出是不同检查，不能相互覆盖。[首屏图](attempt-02/evidence/UX09-1366-real-priced-first-screen.png)、[DOM](attempt-02/evidence/UX09-independent-before-awards.json)。这是Linux实际字体环境的结果，Windows首行仍未验证。

## 4. 备份分类、文件限制与恢复安全：功能检查通过

真实按钮分别为“备份当前询价（仅数据）”“备份全部询价（仅数据）”“导出询价与图纸资料包”“下载完整备份（询价数据 + 图纸）”。常驻警告明确原始邮件/聊天截图凭证不包含、仅数据备份无图纸、已有数据拒绝覆盖。4个不支持的旧恢复控件确实隐藏，没有因保留DOMID而仍留给采购员。[分类及风险界面](attempt-02/evidence/BACKUP-visible-categories-and-risk.png)。

实际下载四类文件并完成 **30项内容核验**：[明细](attempt-02/evidence/backup-class-checks.json)。两份JSON保留下载时完整已保存业务状态/报价历史且attachmentsIncluded=false；资料包含询价JSON/图纸索引/3份原PDF，**没有SQLite恢复数据库**；完整包包含manifest、SQLite和3份原PDF。已在本任务隔离目录放入纯虚构邮件/聊天文件标记，包不包含这些未登记原始凭证；未把这当作“支持真实邮件导入”。分类文件在第一笔RFQ时下载，后面的主完整备份在两RFQ时下载，按各自下载时快照比较，没有混淆时点。

资料包真实提交完整恢复入口，被UI/后端400拒绝，目标四表/PDF不变；同一个空目标随后接受正确完整备份200，恢复全部真实历史和PDF。后续两RFQ完整备份另做11项CRC/manifestDBSHA/SQLite integrity/四表全部行/3PDF哈希校验。

内容篡改负向使用当前版本**合法ZIP_STORED**，原manifest与文件名保持，只更改PDF同长1字节并正确重算ZIPCRC。UI与受支持Node HTTP均400 `RESTORE_PDF_HASH_MISMATCH`，目标全部语义行/PDF、持久文件SHA和目录列表不变，WAL/SHM单独记录为易变文件。[构造](attempt-02/evidence/S4-tamper-preflight.json)、[真实审计](attempt-02/evidence/S4-audited-backend-rejection.json)。不是DEFLATED格式先行拒绝。

原合法包空目录恢复200，2RFQ全部版本/图纸/人工1979相同。非空目录UI明确拒绝，补充场景真实后端409 `RESTORE_TARGET_NOT_EMPTY`，全部数据未变：[UI](continuation/evidence/NONEMPTY-real-UI-refusal.png)、[后端](continuation/evidence/nonempty-real-backend.json)。原驱动的旧文字FAIL仍保留，见第7节，不因补充PASS删改原记录。

## 5. 保存状态、报价历史及业务回归

实际PUT暂挂时，页面不假报已保存，数据库不变，完整备份按钮被禁用，取消重读保留草稿；放行真实200才完成保存。两个真实标签发生409后旧页不能覆盖成功方，报价/图纸/全部已保存行保持，F5读取真正成功版本。另真实停止9865服务、修改名称，UI明确保存异常、SQLite不变；重启后手动保存ACK200，F5保持新名称，原报价轮次与每一条旧保存修订保留。[离线失败图](continuation/evidence/SAVE-real-service-offline.png)、[恢复图](continuation/evidence/SAVE-offline-restart-recovered.png)、[旧修订检查](continuation/evidence/offline-after-manual-save.json)。

本SHA新建12物料、3供应商、3PDF，从Excel预览/正式确认、1/2/0图纸候选/手工匹配、双向供应商追加/重复/删除，执行到文件/粘贴/手工报价。5份确认/50条历史，V1不可覆盖，9项显式沿用；阶梯价118/2.25按实际数量适用。75/75并列不误要求理由，82vs20高价必须理由，空白/取消不保存。人工3项**1979**、理论**6940**、建议**7064**分开显示并保存。另46项实际供应商ZIP/CSV/XLSX核验通过，包含原PDF字节、金额和供应商隔离。[文件核验](attempt-02/evidence/export-checks.json)。

第二个52物料RFQ预览50+2、确认全52、分页/筛选选择保持；RFQ切换、F5和真实服务重启后全部业务行/历史/PDF相同。所有数据均虚构，未复用旧SHA数据库或备份。

## 6. 完整原自动化：88 PASS /23 FAIL，不改断言

| 命令 | 实际结果 | 原始日志 |
|---|---|---|
| Python unittest discover |44PASS，exit0|[stderr](automation/python-backend/stderr.log)|
| npm ci，独立可写cache |exit0|[command](automation/npm-ci/command.json)|
| npm test |10PASS，exit0|[stdout](automation/node-business/stdout.log)|
| npm run test:e2e |34PASS/23FAIL，57项，exit1，0skip/0retry|[stdout](automation/chromium-e2e/stdout.log)|

13条仍期待“已手动/自动保存第…版”，1条期待旧非空拒绝文案，2条期待旧14px字体，1条要求标题含内部“UI V3”：共17条测试适配/覆盖缺口；其失败后的业务断言 **NOT REACHED**，不能因独立功能PASS改成原测试PASS。另6条是真实横向溢出（六页新视觉1、B3两尺寸2、探索三尺寸3），对应P3-UI-01。[逐条分类/原始堆栈](automation/failure-classification.json)、[111项CSV](automation-cases.csv)。

建议ChatGPT适配批准的新文案/样式并保持真实保存ACK/数据保护断言，修复溢出后再对新准确SHA运行。**测试方未改任何原套件、timeout、worker、retry或CI，也没有重跑失败用例筛选成功样本。**

## 7. 驱动、证据与未测边界

- DRIVER01：新建前正式快照合法为null，初始提示审计直接读state抛错；原错误/trace保留，增加新驱动的演示态null保护，在全新attempt02重跑，正式业务对象比较未放松。
- DRIVER02：非空UI已正确拒绝，但独立旧断言只认“禁止”，当前文案是“不能直接覆盖恢复”，故停止。保留原FAIL不改；新单独continuation场景重连**本轮同SHA刚创建**的隔离数据，完成UI语义拒绝/真实后端409/数据不变以及真实断服务检查。不使用历史版本数据，不把旧失败方法冒称PASS。
- 一个不阻断观察断言误期待不存在的虚构名称“虚构验收验收部件”，实际夹具名为“虚构采购验收部件”。该FAIL保留、未第三次修正/重试。事后只读DOM记录实际名称、15px/nowrap横排，属于独立夹具预期错误，不是产品名称损坏。[登记](raw-error-register.json)。

3份独立trace、76张独立截图及所有原套件可获取trace/HTML报告/服务/浏览器日志均归档。原自动化446个文件，8个32MiB以内归档分片，逐原路径字节SHA回验；所有已有trace CRC有效。[解包](README-raw-evidence.md)、[校验和](SHA256SUMS)、[独立trace完整性](independent-trace-integrity.json)。

**NOT TESTED**：原生Windows Python3.13、Node22、CMD/PowerShell/BAT/Edge的独立源目录/数据目录启动及安全3组；Windows字体/100%缩放布局不能由Linux推断。未穷举全部设置、编辑/导入映射/触屏等未访问路径；旧模拟数据迁移按D024排除。后续须由ChatGPT处理两项P3、原测试适配，并在可用的真实Windows隔离环境执行本SHA或后续冻结SHA；不自动合并。
