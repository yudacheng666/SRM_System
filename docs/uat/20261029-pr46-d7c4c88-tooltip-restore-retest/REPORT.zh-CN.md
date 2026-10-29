# PR46 · d7c4c88 独立整改复验 / TEST-ONLY

**结论：NOT READY。** 本 SHA 的独立浮层、横向溢出、采购业务与备份恢复范围通过；原完整 Chromium 套件仍有 **5 FAIL**，不能宣布全套整改或整个产品验收通过。没有新确认的产品 P1/P2/P3 缺陷；5 项原套件失败及一次根因未知的独立点击超时均保留。原生 Windows 三组 **NOT TESTED**。

- 唯一实际产品 SHA：`d7c4c88abd354ebdc5d3bfedfc9199e278c48483`。开始、结束 checkout 及 PR46 HEAD 一致；没有运行 GitHub 的合成 merge SHA。
- GitHub 任务：[PR46 开发交接](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6490856709) 和用户本轮指令；完整任务与版本元数据见 [github-task-and-version.json](github-task-and-version.json)。
- 日期：2026-10-29；日志为 UTC，面向用户日期为 Asia/Shanghai。报告生成：`2026-10-29T08:45:16.375591+00:00`。
- 独立证据追加到现有 Draft PR50；父证据提交 `5c179854188f01ea7614d019c0f4c31f7f90ca8e`。只新增本目录，不覆盖任何旧 SHA 报告，不把旧结果转为本次 PASS。
- Linux / Python3.12.14 / Node24.19.0 / Playwright1.58.2 / 真实 Chromium154.0.8037.57。无真实 Windows、cmd.exe 或 PowerShell，因此未伪装执行 Windows 测试。

## 真实执行与隔离

产品目录 `/workspace/srmd7-product` detached checkout 固定 SHA；原 Python、Node、E2E 测试均原样执行。浏览器访问正式 `prototype/m1-lite/index.html`，使用仓库 `tests/e2e/serve.py` 提供真实产品与实际后端/SQLite API；不是 PR23 原型、静态概念页面或模拟业务 API。

全自动套件用全新临时数据。独立业务首轮、顺序复验、空恢复目标各有独立 `/workspace/uatd7/...` 数据目录。全部物料、供应商、项目、报价、PDF、假邮件/图片均为新生成虚构数据；不读取用户业务目录、不测试旧模拟数据迁移。预先核查实际标签、details 打开状态、异步按钮、真实保存 ACK 与存储一致性；独立方法和 fixture 均归档。

[起始身份](identity-start.json)、[结束身份](identity-end.json)、[HTTP 身份](http-trace-identity.json)：58 份原套件 trace 和2份独立 trace中共 **86 个实际根页面 HTTP200 响应**均与当前 checkout HTML SHA256 相同（`9e67e39b3e67683bb5d174569e0223a7e1103b7edabf45e2952f78b6e0958d23`），无缺失响应体记录。产品 tracked 状态始终干净；[受保护 refs](preservation.json)在提交证据前完全不变。

## 完整自动化：107 PASS / 5 FAIL

| Suite | PASS | FAIL | NOT TESTED | Exit |
|---|---:|---:|---:|---:|
|Python 后端 `python -m unittest discover -v -s prototype/m1-lite/backend -p test_*.py`|44|0|0|0|
|Node 业务 `npm test`|10|0|0|0|
|完整 Chromium `npm run test:e2e`|53|5|0|1|
|自动化合计|107|5|0|—|
|原生 Windows 三组（独立统计）|0|0|3|未执行|

`npm ci` 成功。E2E workers1、retries0、skip0、flaky0；没有删测、改阈值、强制点击或把失败用例单独重跑后覆盖首轮结果。[112项逐项 CSV](automation-cases.csv)、[运行日志](automation-runner.log)、[原始失败分类](automation/failure-classification.json)；每个套件的 command.json 记录准确命令、路径、SHA、时间和退出码。本轮没有触发 GitHub Actions，也不等于 Actions 正式通过。

### 原17项与原6项

原17项在本 SHA **12 PASS / 5 FAIL**；原6项横向溢出 **6 PASS / 0 FAIL**，均为本次58项原 E2E的子集，不能重复计入总数。开发者对5个原测试文件的补丁见 [只读差异](candidate-original-test-diff.patch)：保存文案调整保留真实 PUT200、saved() 和业务断言，拒绝覆盖/字体/标题断言亦已修改，未删除溢出检查。**改掉原阻塞点不等于整条用例通过**，这次更深的旧断言和定位错误仍暴露出来。逐项对照见 [prior-case-retest-summary.json](prior-case-retest-summary.json) 及 [附录](PRIOR-CASES.md)。

| 原套件 FAIL | 实测事实 / 类型 | 后续处理方向 |
|---|---|---|
|08 异常回归，acceptance:365|仍要求“未成功”；实际显示“完整备份恢复未完成……”；独立操作真实400且目标未变。P3 测试文案维护。|由 ChatGPT 更新过时断言，保留拒绝及数据不变核验。|
|15 供应商隔离，acceptance:599|`[data-sf-s]` 点击中心落在嵌套“移出本次询价”按钮；默认确认导致供应商被移出。P3 驱动定位。|定位供应商名称/选择区域，并保留跨询价完整断言。|
|45 首次询价包，acceptance:694|同类容器点击触发移出供应商，随后导出面板未显示。P3 驱动定位。|修正选择目标，保留真实下载/内容及dirty保护。|
|46 纯导航，acceptance:733|同类容器点击触发额外移出确认（被dismiss），dialog计数2而非1。P3 驱动定位。|选择供应商时断言没有删除确认，不删除安全断言。|
|UI V3，ui-v3-integration:65|要求背景#F6F8FB，实际#F5F7F9。P3 设计/测试期望不一致，尚需确定批准色值。|ChatGPT核对当前设计规范后对齐正确一侧，验收员不擅自放宽。|

三项定位问题有原 trace 的真实移出确认，以及独立 [命中测试](attempt-02/evidence/original-failure-center-hit.json)支持：1440×1000下供应商行中心 `(415.57,828.95)` 实际是 BUTTON“移出本次询价”。[按名称选择](attempt-02/evidence/TRIAGE-real-supplier-name-selection.png)和点击“导出已分配询价单”后真实下载 XLSX/PDF 包均通过，数据库/历史/图纸未改变。这是独立补充证据，**原3项仍 FAIL，后续未到达断言仍 NOT REACHED**；不把它们误报为已确认的产品业务缺陷。

## 独立业务与界面逐项结果

需求归并行统计 **30 PASS / 2 FAIL / 3 NOT TESTED / 0 BLOCKED**。2 FAIL为完整E2E和原17集合；与自动化总数及下列抽样统计有重叠，不相加。顺序独立运行记录1077条检查/观察全部PASS；这不是1077个独立用例，也不抵消首次超时。

| ID | Result | Scope | Evidence / notes |
|---|---|---|---|
| HEAD | PASS | Exact checkout, PR HEAD and actual served HTML | [http-trace-identity.json](http-trace-identity.json) — 86 captured actual root responses match the current checkout |
| AUTO-PY | PASS | Complete original Python backend suite | [stderr.log](automation/python-backend/stderr.log) — 44 PASS |
| AUTO-NODE | PASS | Complete original Node business suite | [stdout.log](automation/node-business/stdout.log) — 10 PASS |
| AUTO-E2E | FAIL | Complete original Chromium E2E suite | [failure-classification.json](automation/failure-classification.json) — 53 PASS /5 FAIL /0 skip /0 retry; original failures retained |
| OLD-17 | FAIL | Seventeen previously blocked/outdated whole cases | [prior-case-retest-summary.json](prior-case-retest-summary.json) — 12 PASS /5 FAIL at subsequent assertions; preserved actual state assertions |
| OVERFLOW-6 | PASS | Six original horizontal-overflow cases | [prior-case-retest-summary.json](prior-case-retest-summary.json) — 6/6 current-SHA PASS, subset of E2E58 |
| LAYOUT-18 | PASS | Six actual pages across all three viewports | [layout-overflow.json](attempt-02/evidence/layout-overflow.json) — 18 page measurements; no whole-document overflow |
| TIP-BOUNDS | PASS | Pointer and keyboard popup bounds | [tooltip-retest.json](attempt-02/evidence/tooltip-retest.json) — 83 actual visible instances;1024x768/1366x768/1600x900; stored state/history/PDF unchanged |
| TIP-TAB | PASS | Real Tab opens the popup and focus stays on trigger | [tooltip-retest.json](attempt-02/evidence/tooltip-retest.json) — 83 actual visible instances;1024x768/1366x768/1600x900; stored state/history/PDF unchanged |
| TIP-ESC | PASS | Escape dismisses with pointer/focus retained | [tooltip-retest.json](attempt-02/evidence/tooltip-retest.json) — 83 actual visible instances;1024x768/1366x768/1600x900; stored state/history/PDF unchanged |
| TIP-PIN | PASS | Pinned popup and click-away dismissal | [tooltip-retest.json](attempt-02/evidence/tooltip-retest.json) — 83 actual visible instances;1024x768/1366x768/1600x900; stored state/history/PDF unchanged |
| RESTORE-MALFORMED | PASS | Malformed ZIP rejected with Chinese guidance | [BACKUP-malformed-zip-friendly-rejection.png](attempt-02/evidence/BACKUP-malformed-zip-friendly-rejection.png) — Real HTTP400; empty target unchanged; independently covers business assertion later blocked by old 未成功 wording |
| RESTORE-ARCHIVE | PASS | Actual inquiry/drawing package rejected as full restore | [archive-rejection-real-backend.json](attempt-02/evidence/archive-rejection-real-backend.json) — UI+backend400; actionable Chinese, no raw RESTORE_*; exact target unchanged |
| RESTORE-HASH | PASS | Legal STORED ZIP with wrong PDF hash rejected | [S4-audited-backend-rejection.json](attempt-02/evidence/S4-audited-backend-rejection.json) — One changed byte, same length, fresh valid CRC, unchanged manifest;400 RESTORE_PDF_HASH_MISMATCH; target files and semantic data unchanged |
| RESTORE-EMPTY | PASS | Correct complete archive restores into empty target | [S4-positive-control-restored.json](attempt-02/evidence/S4-positive-control-restored.json) — Two RFQs; all tables,50 confirmed-history lines, quote versions, manual decisions and3PDF hashes match source |
| RESTORE-NONEMPTY | PASS | Nonempty target refuses overwrite | [S4-nonempty-backend.json](attempt-02/evidence/S4-nonempty-backend.json) — UI refusal and actual409 RESTORE_TARGET_NOT_EMPTY; restored database/history/PDF unchanged |
| ZIP-CONTENT | PASS | Downloaded backup classes and ZIP/SQLite/PDF integrity | [s4-checks.json](attempt-02/evidence/s4-checks.json) — 30 class checks +11 full integrity checks; original mail/chat explicitly excluded |
| SAVE-STATE | PASS | Actual pending save and acknowledged success | [CORE08-while-held.json](attempt-02/evidence/CORE08-while-held.json) — Real held PUT; no false saved state, backup blocked at all3sizes; real200 required before saved |
| SAVE-CONFLICT | PASS | Real stale-tab SQLite revision conflict | [CORE08-conflict-http.json](attempt-02/evidence/CORE08-conflict-http.json) — Actual409, visible save failure/details; winning data and all history/PDF retained |
| SAVE-OUTAGE | PASS | Actual service outage and saved-data protection | [offline-after-manual-save.json](attempt-02/evidence/offline-after-manual-save.json) — Failure truthful; persisted DB unchanged before restart, manual200 andF5; quote/history preserved |
| HISTORY | PASS | Locked revisions and saved/restored quote history | [Q04-all-confirmed.json](attempt-02/evidence/Q04-all-confirmed.json) — 5 confirmed revisions/50 history lines, V1 immutable, explicit9 carry lines and tiers118/2.25 |
| CORE01 | PASS | Actual material XLSX import and duplicate-code line identities | [CORE01-real-excel-preview.png](attempt-02/evidence/CORE01-real-excel-preview.png) — 12 new synthetic lines, preview does not save |
| CORE02 | PASS | Real PDF matching, ambiguous/unmatched and original download bytes | [CORE02-clicked-correct-real-PDF.png](attempt-02/evidence/CORE02-clicked-correct-real-PDF.png) — Actual3PDFs; unique/ambiguous/unmatched; preview does not persist |
| CORE03 | PASS | Supplier multi-assignment, duplicate append, remove and filter | [UX08-item-first-multiple-suppliers.png](attempt-02/evidence/UX08-item-first-multiple-suppliers.png) — Independent fresh UD7-A/B/C; existing links retained |
| CORE04 | PASS | XLSX/paste/manual quotes, rounds/versions and preview safety | [Q03-same-round-version-difference.png](attempt-02/evidence/Q03-same-round-version-difference.png) — Real file refresh refusal and carry preview preservation; no history replacement |
| CORE05 | PASS | Ties, higher-price reasons, paging and separate totals | [C05-scoped-amounts-and-decisions.png](attempt-02/evidence/C05-scoped-amounts-and-decisions.png) — Manual3/1979 vs theory6940 vs mixed7064; pending9; tied-lowest no reason |
| CORE06 | PASS | Actual supplier ZIP/CSV/comparison XLSX contents | [export-checks.json](attempt-02/evidence/export-checks.json) — 46 file-content checks; per-supplier PDF scope and values |
| CORE07 | PASS | RFQ switch,F5 and real service restart persistence | [CORE07-after-service-restart.json](attempt-02/evidence/CORE07-after-service-restart.json) — Separate52-line second RFQ; all source rows/history/PDF hashes stable |
| FIRST-ROW | PASS | Entire first actual priced row at1366x768 | [UX09-independent-before-awards.json](attempt-02/evidence/UX09-independent-before-awards.json) — top=701.140625,bottom=742.921875,height=41.78125,scrollY=0 |
| TRIAGE-NAME | PASS | Supplier label selection avoids nested remove action | [original-failure-center-hit.json](attempt-02/evidence/original-failure-center-hit.json) — At1440x1000 original container center really hits 移出本次询价; label click selects supplier and keeps all saved rows |
| TRIAGE-EXPORT | PASS | Actual assigned-supplier export through visible action | [original-failure-triage-export.json](attempt-02/evidence/original-failure-triage-export.json) — Real ZIP withXLSX/PDF,no privateJSON; source data unchanged |
| COPY | PASS | Six-page rendered buyer copy and real error states | [copy-audit.json](attempt-02/evidence/copy-audit.json) — 40 visible states; no S4/M0-M9/SQLite matches in rendered text/visible attributes |
| WIN-01 | NOT TESTED | Native Windows Python3.13 backend | [identity-start.json](identity-start.json) — Only Linux execution environment available; not substituted by Linux results |
| WIN-02 | NOT TESTED | Native Windows Node22 business suite | [identity-start.json](identity-start.json) — Only Linux execution environment available; not substituted by Linux results |
| WIN-03 | NOT TESTED | Native Windows isolated program/data directory, CMD/BAT/Edge UI and restore safety | [identity-start.json](identity-start.json) — Only Linux execution environment available; not substituted by Linux results |

### 浮层、页面与1366首行

- 1024×768、1366×768、1600×900的六页面共18次整页测量无横向溢出；原6项溢出用例亦全部通过。
- 扫描各页面当时实际可见的提示按钮：**83个样本**（1024:28、1366:27、1600:28；动态可见控件数量随状态变化）。逐个实测鼠标悬停、边界、真实Tab进入（先聚焦前一个可用控件再按Tab）、Esc保持焦点关闭、Esc保持悬停关闭、点击固定和点击外部关闭；全PASS。两种打开方式均检查四边与document.scrollWidth；所有操作前后保存数据/报价历史/PDF相同。实际截图还进行了人工目视检查，提示文本在视口内可读。
- [1366×768首屏](attempt-02/evidence/UX09-1366-real-priced-first-screen.png)：实际报价首行 top701.140625、bottom742.921875、高41.78125px、scrollY0；首行完整可见，价格和详情入口同一水平线。不是空表或旧SHA截图。

| Viewport | Quote-input help | Backup help |
|---|---|---|
|1024×768|[Screenshot](attempt-02/evidence/TOOLTIP-1024-quoteImport-srm-hint-33.png)|[Screenshot](attempt-02/evidence/TOOLTIP-1024-backup-srm-hint-46.png)|
|1366×768|[Screenshot](attempt-02/evidence/TOOLTIP-1366-quoteImport-srm-hint-33.png)|[Screenshot](attempt-02/evidence/TOOLTIP-1366-backup-srm-hint-46.png)|
|1600×900|[Screenshot](attempt-02/evidence/TOOLTIP-1600-quoteImport-srm-hint-33.png)|[Screenshot](attempt-02/evidence/TOOLTIP-1600-backup-srm-hint-46.png)|


### 业务、实际文件与恢复安全

新建12行、3供应商、3PDF的完整虚构询价，包含重复物料编码但不同规格/RFQ行号。Excel、粘贴、手工输入、同轮修订与下一轮沿用均实际操作；保存5个确认报价版本、50行确认历史，V1保持不变；9行显式沿用，阶梯有效单价118/2.25。人工定标3项 **¥1,979.00**，与理论 **¥6,940.00**、建议组合 **¥7,064.00**区分，剩余9项待定；同价无须非最低理由，高价必须填理由。

核验真实供应商ZIP、CSV、比价XLSX的值/行号/图纸范围（46检查）；区分仅数据备份、询价与图纸资料包、完整备份，验证不含原邮件/聊天凭证（30检查）；完整ZIP/SQLite `integrity_check`、版本/资产/3PDF哈希（11检查）。第二个真实询价含52行，分页50+2及追加关联；跨RFQ、F5及真实服务重启后全部持久化行和PDF哈希一致。

- [资料包误恢复](attempt-02/evidence/BACKUP-archive-restore-refused.png)：真实下载资料包喂入完整恢复，UI和后端400，中文说明“不是完整备份/下载完整备份”，目标未变；随后同一空目标用正确完整备份200恢复。
- [合法内容篡改](attempt-02/evidence/S4-tamper-preflight.json)：所有成员ZIP_STORED、CRC合法、manifest和非目标成员不变，单PDF只改1字节且长度仍892；**不是ZIP损坏或文件大小不同**。真实浏览器和附加后端审计均400/`RESTORE_PDF_HASH_MISMATCH`；[中文UI](attempt-02/evidence/S4-STORED-hash-mismatch-real-UI.png)不显示原错误码。目标所有语义行、持久文件字节、目录集合不变（SQLite易变文件另列，不掩盖其区别）。
- [正确恢复](attempt-02/evidence/S4-valid-positive-control-restored.png)：原正确ZIP恢复200，2RFQ全部数据/版本/报价历史/图纸与来源一致，定标金额仍¥1979；随后[非空拒绝](attempt-02/evidence/S4-nonempty-UI-refusal.png)实际409，目标不变。
- 真实暂扣PUT验证三尺寸未保存/保存中状态和备份阻止；释放后实际200才能显示已保存。真实旧标签409、服务退出引起保存失败都保留已存报价与图纸；重启手动保存200+F5成功。技术详情可查看，未伪造保存成功。

原P3-UI-01和P3-COPY-02在**上述本SHA实测范围内 PASS**，不是凭历史结果关闭，也不是整个软件无缺陷的保证。

## 首次独立异常与未知事项

第一轮独立浏览器在 `#runAssignSearch.click()` 等待visible/enabled/stable时15秒超时，截图中按钮可见。保留 [原始错误](independent/evidence/raw-first-error.json)、[原trace](independent/evidence/trace-first-attempt.zip)、[现场截图](independent/evidence/FAIL-page0.png) 和完整日志。分类：**未能确定为产品、驱动或环境；ROOT CAUSE UNKNOWN**。

当时完整自动化并行运行，云端exec-server还出现pong_timeout；[运行观察](runtime-observation.json)记录2核CPU限制、内存max事件但oom/oom_kill均0。这些只是事实，**不是因果证据**。等待完整套件结束后，在新数据目录/新浏览器用相同独立业务脚本重跑（仅绝对运行目录和新fixture字节变化），没有force、固定延时、放大timeout或放松业务断言，全部要求完成。重测成功不能证明首次超时已修复，首轮FAIL仍单列。

Windows三组未执行；Windows打包启动、CMD/BAT/Edge及文件锁语义均不推断通过；旧模拟数据迁移、真实企业资料和其他设备/缩放未测。背景色批准基准仍需ChatGPT确认；原5条失败之后的断言不能由本报告推断全部通过。

## 证据与处理建议

[Evidence index](README.md)、[逐项结果CSV](results.csv)、[问题分类](issues.json)、[原始异常登记](raw-error-register.json)、[原套件日志/截图/报告清单](automation/original-file-manifest.json)。469个原始文件按内容去重无损归档为11个≤32MiB分片；全部原文件SHA256解包复核，所有ZIP的CRC检查通过。58份原始测试trace和2份独立trace均保留；[独立trace校验](independent-trace-integrity.json)。没有只保留成功样本。

建议ChatGPT先处理剩余测试/设计期望问题，并调查必要的首轮点击证据；修正后在新准确SHA复验。当前不建议据此宣布全套通过或合并，Windows空缺继续保留。验收员未修改产品、原测试、CI、项目主记忆或开发/main分支；没有触发Actions、合并、关闭或新建PR/Issue。证据仅追加到现有Draft PR50，最终决定交由ChatGPT与项目所有者审核。
