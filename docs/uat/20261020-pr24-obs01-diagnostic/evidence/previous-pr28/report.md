# PR #24 并列最低价与待核对状态独立复验 / Independent tied-lowest retest

**准确产品 HEAD / Product:** `0cd1278468d0471b862e16ca4ffcac41aead5e6d`  
**日期 / Executed:** 2026-10-20 UTC，Codex Cloud，TEST-ONLY。  
**分支 / Evidence branch:** `test/20261020-pr24-tied-lowest-retest`  
仅新增匿名报告与证据。产品、原测试、CI、开发分支、main未修改，未合并。Documentation/evidence only; no code/test/workflow changes or merge.

## 独立结论 / Independent verdict

**本轮视觉目标：PASS；本轮业务目标：PASS；保存/刷新/进程重启/S4恢复：PASS。**  
**Targeted visual acceptance: PASS. Targeted business acceptance: PASS. Persistence/restart/S4: PASS.**

PR #27 的 **P2-B01、P3-U01 已独立验证消除，V05 可以就本轮明确验收条件关闭**。V01–V04与原P3也在当前SHA重新通过。没有发现新的已确认P0/P1/P2/P3产品缺陷。报告不宣称全产品逐像素一致或所有长尾情景完成；保留两项概念页目标缺口、外部环境与一次下载超时的限制。

The original tied-lowest justification error and stale outstanding-tie counter are fixed in real GUI operations, saved state and downloaded reports. V05's specified closure criteria pass, alongside fresh V01–V04 and original P3 regression. No new confirmed product defect was established. This is bounded acceptance, not exhaustive or pixel-perfect certification. Keep the development PR Draft pending the owner's decision; this report does not merge or authorize merging.

| 报告案例组 / Report case group | PASS | FAIL | NOT TESTED |
|---|---:|---:|---:|
| V01–V05 + 原P3 / Visual regression targets | 6 | 0 | 0 |
| T01–T14 并列/人工/更新状态 / Award targets | 14 | 0 | 0 |
| G01–G12 业务抽测 / Business sampling | 11 | 0 | 1 |
| 概念项目/设置深度一致性 / Concept-only parity | 0 | 0 | 2 |
| Windows桌面、原生Excel、真实运营 / External environments | 0 | 0 | 3 |

案例组有交叉，不能相加作为独立缺陷或自动化用例数。原始执行不是无异常：两个driver timeout与一次文件检查预期更正均保留，下文说明。Case counts overlap and are not the CI or raw assertion count.

## 前置门槛与来源 / Gate and sources

已读取 [最新交接](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6280251683)、[完整业务复验要求](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6279737514)、[PR #27 原报告](https://github.com/yudacheng666/SRM_System/pull/27) 和[本HEAD视觉清单](evidence/parity-checklist.md)。[评论原始快照](evidence/github-handoff.json)；[最终HEAD/CI核对](evidence/github-final.json)。

| 准确HEAD的CI / Exact-head CI | 核实结果 / Result | 原始Linux日志 |
|---|---|---|
| [UI Unified #47 / 39346586222](https://github.com/yudacheng666/SRM_System/actions/runs/39346586222) | completed/success；Linux与Windows均success | [118380538680](evidence/ci-118380538680.txt) |
| [S3/S4 #134 / 39346586231](https://github.com/yudacheng666/SRM_System/actions/runs/39346586231) | completed/success；Linux与Windows均success | [118380539241](evidence/ci-118380539241.txt) |

两套全成功后才启动本轮独立GUI。两套CI均43 Playwright passed，CI checkout合成merge `cb12f223793da964ff64ab6bdfc4649d4bb85aaa`（本候选+开发基线）；本轮真实程序直接checkout候选0cd12784。两套CI的附件上传仍受artifact配额限制，不能冒称CI截图已上传；本分支保存独立截图与trace。前一候选76fa5d23的失败不是本候选通过证据，原测试43条未作为独立验收替代。

Both CI gates were successful before independent operations. CI's synthetic merge and this retest's direct product SHA are explicitly distinguished. Artifact quota errors are separate from test success; our independently captured evidence is archived here.

## 环境与虚构业务 / Environment and fictional RFQ

Linux Codex Cloud；真实Chromium `154.0.8037.57`，Playwright `1.58.2`，正式M1-Lite Python/SQLite服务，无产品改动。独立worktree `/tmp/srm-r0cd`。`SRM_DATA_DIR=/tmp/r0cd/data`、恢复目录 `/tmp/r0cd/restore`、61行辅助目录 `/tmp/r0cd/aux` 均全新隔离；端口8980/8981/8983。PR23原型在8982仅作视觉参考，未用来验证业务。

主询价 `RFQ-1792459298134-26MAFU`；另建空RFQ核对切换。所有供应商、物料、ERP字段、PDF、理由均虚构。SQLite只读核对revision、原始snapshot JSON SHA256及PDF哈希，浏览器只经真实按钮/输入修改状态，不注入业务数据。[指纹方法](evidence/fingerprint-method.txt)。

| RFQ行 | 数量 | 甲A报价 | 乙B报价 | 目的 / Purpose |
|---|---:|---|---|---|
| L00001 同码M16/220mm | 10 | V1=10 → V2=9 | 12 | 同轮修订与历史 / Revision history |
| L00002 同码M20/350mm | 25 | 20 | V1=20 → 后续V2=21 | 并列与重新复核 / Tie and later review |
| L00003 底座 | 4 | 不供货 | 明确未报价 | 不报价非0 / Unpriced not zero |
| L00004 M8/60mm | 6 | 8 | 12 | 真正高价理由 / Genuine higher offer |

丙方只关联L00002，先无报价，后确认20元；使B从20涨到21时仍有A/C两个最低20元，能真实检查“**并列且需重新复核**”重新出现。三家supplier IDs为 `U24-A`、`U24-B`、`U24-CP-C`；第三家fixture的编码列与最初driver假设不同，后按实际导入ID继续，无产品改动。Fictional fixtures: [files](fixtures/materials.xlsx), [supplier import](fixtures/suppliers.xlsx), [A](fixtures/quote-A.xlsx), [B](fixtures/quote-B.xlsx), [C](fixtures/quote-C.xlsx).

## P2/P3/V05关闭证据 / Closure evidence

| 问题 / Target | 结果 | 独立观察 / Observed result |
|---|---|---|
| P2-B01 同价被当高价 / Tied supplier misclassified | **PASS** | 真实20/20点击A、键盘Enter选择B均无理由弹窗；单选/批量B的理由仅覆盖真正高价行；SQLite与下载报表的并列项reason为空。[同价B](evidence/T01-tied-B-no-reason.png)、[批选](evidence/T04-bulk-B-tie-has-no-exception.png)、[baseline state](evidence/05-awarded.json)、[report](downloads/comparison-report.xlsx) |
| P3-U01 完成后仍待核对 / Resolved tie remains outstanding | **PASS** | 初始1→明确同价选择0；人工3/待决定0/并列0；F5、终止重启与S4后保持0。[三尺寸](SCREENSHOTS.md)、[重启](evidence/11-real-restart-awards.png)、[S4](evidence/12-restored-awards.png) |
| 新报价后的待复核 / Review after new offers | **PASS** | C20不会误判B20；B21确认后A/C20仍并列，待核对重新为1，F5不丢；选C20无需理由后归0。[C无误报](evidence/T06-new-equal-C-no-false-review.png)、[重新出现](evidence/T07-new-quote-review-reappears.png)、[F5](evidence/T08-pending-review-after-F5.png)、[重选归零](evidence/T09-reconfirmed-C-no-pending.png) |
| V05 建议与人工层级 / Suggestion vs human decision | **PASS** | 初始人工0，自动建议不冒充人工；明确选择后计数与来源、并列状态、理由和金额一致。并列双方均有最低标识。[初始](evidence/V05-before-any-human-choice.png)、[最终概览](evidence/prod-1366-quotes.png) |

真高价8/12：空白/空格理由无法确认且不修改选择，取消批量无变化，填写虚构商务理由后保存；并列20不写非最低原因。[空理由阻止](evidence/T02-true-higher-empty-reason.png)。Higher-price protection remains effective; accepting equal-lowest offers does not weaken it.

## V01–V04及原P3持续回归 / Previously passing visual regression

| 目标 | 结果 | 当前SHA证据 / Fresh evidence |
|---|---|---|
| V01 物料标题 | PASS | 1024/1366/1600标题真实可见且高度>0。[1024](evidence/prod-1024-items.png)、[1366](evidence/prod-1366-items.png)、[1600](evidence/prod-1600-items.png) |
| V02 抽屉收起高度 | PASS | 三种尺寸分别打开项目、供应商、数据抽屉，其余收起只比summary多2px。[1024](evidence/V02-1024-uiDataTools.png)、[1366](evidence/V02-1366-uiSupplierTools.png)、[1600](evidence/V02-1600-uiProjectDetails.png) |
| V03 分配布局/状态 | PASS | 三尺寸右宽双栏，真实数量/全部关联方；双向追加、61项Shift跨页、确认后关联保护通过。[分配](evidence/prod-1366-assign.png)、[跨页](evidence/aux-shift-pagination.png)、[保护](evidence/V03-confirmed-history-protection.png) |
| V04 同轮版本差异 | PASS | 导入V1=10，实际编辑V2=9；上版10、现9、−1/−10%；草稿不进入比价，原V1对象不变且UI只读。[差异](evidence/V04-V2-confirmed-diff.png)、[原V1](evidence/V04-original-V1-read-only.png) |
| 原P3 禁用确认 | PASS | 三尺寸及重启后灰rgb(232,237,243)、disabled、cursor=not-allowed，锁定提示可见。[1024](evidence/P3-fixed-1024.png)、[1366](evidence/P3-fixed-1366.png)、[1600](evidence/P3-fixed-1600.png)、[重启后](evidence/P3-after-restart.png) |

三尺寸无文档级横向溢出或侧栏遮挡；宽业务表保留内部水平滚动。[几何](evidence/product-geometry.json)。实际背景#F6F8FB，不检查旧值。PR23精确SHA `67a3a7ca02465306c514da5fc2ac61409495a3ae` 本轮重新拍摄六页三尺寸，共18对产品/参考截图：[SCREENSHOTS.md](SCREENSHOTS.md)。

Layout follows the approved design direction while retaining production fields, Excel/PDF tooling and safeguards. Quote entry and global saved-state controls are denser than the simplified prototype. The prototype's project dashboard/settings placeholders do not establish complete production parity; those two deep-parity targets are NOT TESTED. No pixel-perfect claim.

## 独立业务案例 / Independent business cases

| ID | 实际操作 / Executed operation | 结果 |
|---|---|---|
| T01 | 同价20点击A，无非最低弹窗 / Equal-lowest A click | PASS |
| T02 | 同价20以键盘Enter选B，无弹窗 / Equal-lowest B keyboard | PASS |
| T03 | SQLite及XLSX中并列B理由为空 / Tied award reason absent in state/report | PASS |
| T04 | 初始并列1，人工决定后0 / Outstanding count 1→0 | PASS |
| T05 | 8/12真高价空白理由拒绝，填写后保存 / Genuine higher justification | PASS |
| T06 | 批量B仅统计真正高价2行；空理由及取消不提交 / Bulk exception scope and cancel | PASS |
| T07 | 批量A含并列项，无理由且清除旧例外 / Bulk lowest offers | PASS |
| T08 | 批量B并列项不写例外，其余高价保留 / Bulk selective exception persistence | PASS |
| T09 | F5保留选择/理由/计数、快照版本和PDF / Refresh exact persisted state | PASS |
| T10 | 真正终止PID2469并重启后选择与并列0保持 / Actual process restart | PASS |
| T11 | S4空目录恢复精确，选择B/并列0保持 / Restore resolved decision | PASS |
| T12 | 新确认C20，B20仍最低，不误待复核 / Additional equal offer | PASS |
| T13 | B变21，A/C仍20并列，待复核1且F5保留 / Changed quote reopens review | PASS |
| T14 | 重选C20无理由、归0，B原V1仍保留 / Reconfirm tie and retain history | PASS |
| G01 | 全新RFQ导入4物料、同编码两规格 / Material import and distinct line IDs | PASS |
| G02 | 供应商Excel、A/B追加关联及第三家限定1行 / Supplier import and additive allocation | PASS |
| G03 | 辅助61行Shift、两页5项各保留A+B / Shift/pagination regression | PASS |
| G04 | 已确认报价后撤销关联受保护、快照不变 / History link protection | PASS |
| G05 | 图纸唯一/多候选/未匹配预览无落盘，仅确认唯一 / Drawing matching safety | PASS |
| G06 | 重启后Chromium内置PDF真实渲染 / Native PDF preview | PASS |
| G07 | A10→9同轮前版/差值和不可变历史 / Revision regression | PASS |
| G08 | CSV、业务Excel、比价报告、供应商ZIP实文件 / Download content validation | PASS |
| G09 | 第二空RFQ清空供应商视角，返回原RFQ不变 / Cross-RFQ isolation | PASS |
| G10 | 非法预览与取消不改revision/行号/数据 / Invalid preview no autosave | PASS |
| G11 | S4 SQLite integrity、精确快照、非空目录拒绝覆盖 / Backup integrity and restore refusal | PASS |
| G12 | 首次下载超时的确定原因/长期可靠性 / Initial timeout root cause & reliability | **NOT TESTED** |

主流程：导入物料→图纸匹配→供应商关联→报价确认→同轮修订→逐项/批量人工定标→实际CSV/XLSX→保存/跨RFQ/重启/S4→新报价复核。不是阅读代码或重跑既有测试代替操作。All state-changing actions use real GUI, with read-only snapshot verification afterwards.

## 实际文件和金额 / Downloaded content and arithmetic

[文件核对结果](evidence/file-validation.json)：43/43最终检查通过，包括实际CSV编码/行号/数量×价格、Excel表头与公式引用、历史、理由、隐私字段、供应商包空白报价、PDF原字节、三份SQLite备份的integrity与精确快照。[检查源码记录](evidence/file-validation-source.txt)。

| 阶段 / Phase | A同范围 | B同范围 | 理论最低 | 人工组合 |
|---|---:|---:|---:|---:|
| 同价B20，A V2=9 | 638 | 692 | 638 | 662（A首行+B并列+B高价） |
| B并列行改21后重选C20 | 638 | 717 | 638 | 662（A首行+C并列+B高价） |

A=9×10+20×25+8×6；B初始=12×10+20×25+12×6；B后续将20×25改为21×25。无报价底座不当作0参与金额；C只有一项自身范围500，不能与A/B整单直接排名。One unquoted material is excluded rather than priced at zero.

- [初始CSV](downloads/common-scope.csv) / [更新后CSV](downloads/common-scope-after-review.csv)；均有RFQ追溯，3条共同有效行。
- [业务3表](downloads/business.xlsx)：4物料、3供应商、12条报价历史（A两版+B一版）。
- [初始比价报告](downloads/comparison-report.xlsx)：并列B的非最低原因空，真正高价理由非空。
- [更新后比价报告](downloads/comparison-after-review.xlsx)：并列选择C、原因仍空，A/B比较组历史16行（C不在选定比较组）。
- [A包](downloads/supplier-A.zip) / [B包](downloads/supplier-B.zip)：4条询价、价格空白、无ERP私有字段/竞争对手ID，PDF哈希一致。
- [首次完整S4](downloads/full-S4.zip) / [新报价复核后S4](downloads/full-S4-after-review.zip) / [重复S4](downloads/full-S4-repeat.zip)：2个RFQ，SQLite integrity=ok，各自与对应阶段原快照revision/hash一致。

Formula references and independent arithmetic were checked; native Microsoft Excel recalculation was NOT TESTED.

## 异常记录与限制 / Execution observations and limits

**OBS-01：首次S4下载等待超时，根因未定 / One initial backup-download timeout, cause not established.**  
跨RFQ返回后首次点击下载，20秒未收到download事件；无对应备份API请求或业务HTTP错误。保留[当时界面](evidence/backup-download-first-attempt.png)、[日志](evidence/browser.jsonl)与trace。正常重试成功，实际进程重启后又连续下载两份成功，备份均精确且状态不变。不能仅凭重试成功断言首次操作可靠，G12标NOT TESTED；也没有足够证据把它定为已确认产品P3。建议后续采集点击时保存/忙碌状态，核对跨RFQ返回至下载的时序。

A single initial download wait expired before a backup API call appeared. The ordinary retry and two later downloads succeeded and all archives verified. The cause was not established; this is an unresolved reliability observation, not erased, not proof of a confirmed business defect, and not an unqualified download-reliability PASS.

**测试工具记录更正 / Harness corrections retained:**
- 初始化driver按`U24-C`定位第三家超时；实际Excel将该家供应商编码写为`U24-CP-C`。通过正常UI使用真实导入ID继续；未重写产品/数据库。This was a fixture/driver selector mismatch, not failed supplier import.
- 初次独立文件检查把更新后报表明细预期为18行，错误计入未选比较组C；实际只有A/B，共16条历史+表头=17行。检查选组后修正预期并新增组内供应商集合核对，最终43项通过。[初次结果](evidence/file-validation-initial.json)、[初次源码](evidence/file-validation-initial-source.txt)、[初次输出](evidence/file-validation-initial-execution.txt)均保留。The product file was not edited.

[执行汇总](evidence/execution-summary.json)：主浏览器179条检查全部true，辅助5条true；两个driver timeout如上。没有pageerror、requestfailed或业务http-error事件。两个console404为浏览器favicon（见server日志）。最终文件43条true，初次文件检查1条false仍归档。Raw history is not an all-green-only presentation.

其余NOT TESTED / Other limits：
1. PR23概念项目总览与设置深度一致性没有完整可执行目标（2项）；已拍参考/正式页面，不伪造原型占位功能。
2. Windows桌面人工操作与安装/原生文件对话框（云端Linux）；Windows CI通过不冒充人工验证。
3. 原生Excel重算/打印；已验证xlsx结构、公式和独立算术。
4. 真实企业数据/生产部署/并发试用，禁止真实业务资料。完整多轮阶梯价与全部导入异常组合也不能从本次抽测外推通过。

## 证据索引与下一步 / Evidence and recommendation

[三分辨率逐页配对](SCREENSHOTS.md) / [主trace](evidence/independent-v31-browser-trace.zip) / [61行trace](evidence/aux-shift-pagination-trace.zip) / [主原始日志](evidence/browser.jsonl) / [辅助日志](evidence/aux-browser.jsonl) / [指纹](evidence/19-final.json) / [哈希清单](SHA256SUMS.txt)。主日志step/command包含独立执行源码记录；未提交可执行测试程序。

[历史PR27对照来源](evidence/previous-pr27/provenance.json)：旧失败截图来自证据提交a610fb3f、产品10d35fa6，仅为历史对照，**本轮没有重跑旧版**。Current observations are newly captured on 0cd12784, not inherited from previous PASS results.

**建议 / Recommendation:** 可以关闭本轮P2-B01/P3-U01/V05定向问题，进入有限范围、有人指导的虚构采购员试用；继续跟踪OBS-01，完整视觉细节/概念页目标由设计负责人确认。是否合入开发基线由负责人另行决定；main、开发分支保持不变，无任何自动合并。Targeted acceptance supports a supervised pilot within the tested scope, not unrestricted production or automatic merge.
