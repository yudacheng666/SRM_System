# PR #16 F2-R 独立云端定向复验 / Independent focused cloud retest

**F2-R: PASS。** 在候选 `9406973f0e99bd33f9f4140c89b9df5d7c58d443` 上，第二轮范围及相邻沿用选项都能直接区分M16/M20，并保留各自不可变RFQ行ID；空/长规格和三尺寸检查通过。第二轮只选择M20，只保存该行新价8元；第一轮四行及来源/备注逐项不变，刷新和真实服务进程重启后仍正确。

**独立业务验收：15 PASS / 0 FAIL；Windows能力限制3项 NOT TESTED。** 统计单位是下表业务验收项，不是开发者CI、底层helper数量。F1/F3精简抽测均PASS，未发现本次变更引入额外业务回归。**仅建议用户考虑将PR #16合并至PR #15的ERP候选分支；本任务没有合并、没有修改产品或既有测试。**

English: **F2-R PASS.** Specification and immutable line identity are visible in negotiation scope and carry-forward options. Only M20 is included in round 2, with a new price of 8; all four original confirmed quotes remain exactly unchanged. Refresh, actual server restart and focused F1/F3 regression checks pass. Consider merging PR #16 into the PR #15 ERP candidate, subject to the user's decision. This is Linux cloud acceptance only.

## 版本、任务与方法 / Version, task and method

- [本轮最新任务](https://github.com/yudacheng666/SRM_System/pull/16#issuecomment-6211199179)，[完整任务存档](evidence/task.md)。
- **实际被测SHA / Tested SHA:** `9406973f0e99bd33f9f4140c89b9df5d7c58d443`，`fix/20261016-pr15-uat-f1-f3`。开始及发布前PR HEAD均一致，PR #16仍Draft。
- PR目标 / Target: `feat/20261016-erp-core-field-alignment`（PR #15），`f571f6643d96f1e826011b878fa0d579925cd08a`。开发基线`8baac18195da9829333dd65433edaa2ba89cb623`、main `f330de510f97c552629052ff1841d7223194e7f8`未更改。
- 原版F2-R证据来自**上一轮**旧候选`da406eb55da75971c08881ca96c87d66ba7f5bfa`：[旧截图](https://github.com/yudacheng666/SRM_System/blob/0fabd5fec3c9e9ec0b9c43659f6888faf2ca3e49/docs/uat/20261016-pr16-independent-retest/evidence/new-30-residual-scope-spec-missing.png)、[旧行文本/HTML](https://github.com/yudacheng666/SRM_System/blob/0fabd5fec3c9e9ec0b9c43659f6888faf2ca3e49/docs/uat/20261016-pr16-independent-retest/evidence/scope-followup-rows.json)。**本轮未重新运行旧版，不把旧证据说成本轮操作。** 旧版只显示同码同名及RFQ ID，无M16/M20；新证据均来自当前候选。
- Environment = **Codex Cloud / Linux**，真实Chromium **154.0.8037.57 headless** + Playwright **1.58.2**，Python **3.12.14**、Node **v24.19.0**。[环境记录](evidence/environment.json)。
- 真实采购操作 / Buyer actions: **2026-10-16 17:01–17:09 Asia/Shanghai**，随后补充关闭写入后的精确进程重启核对与证据整理。JSONL原始时间为UTC。
- 实际M1-Lite server.main由仓库已有启动器运行。8871=`/tmp/srm-f2r-data`，8872=`/tmp/srm-f2r-probe-data`，两个全新独立SQLite目录及浏览器页面；没有读取任何用户采购数据，全部物料、报价、供应商、PDF均虚构。
- 浏览器真实点击/输入/上传/预览/确认/下载/F5；实际停止并重启本次8871服务。没有直接JS/SQLite/API业务状态注入。只读SQLite（mode=ro）、openpyxl用于独立保存态/文件核对。
- 独立证据分支`test/20261016-pr16-f2r-retest`，只新增本报告及证据/临时驱动，不改产品代码、旧测试、CI、数据库结构或PR状态。
- 未运行ERP09或原有自动化套件。CI仅背景：任务给出的[UI V2](https://github.com/yudacheng666/SRM_System/actions/runs/38872038877)、[S3/S4](https://github.com/yudacheng666/SRM_System/actions/runs/38872038785)及工具查询的同SHA后续[UI运行](https://github.com/yudacheng666/SRM_System/actions/runs/38872146149)、[S3/S4运行](https://github.com/yudacheng666/SRM_System/actions/runs/38872146119)均completed/success，不能计作本报告独立PASS。

## 输入与真实采购操作 / Input and buyer workflow

主RFQ：**`RFQ-1792141338115-HUQVZV`**，供应商`F2R-A / 虚构复验甲`。真实上传[四条虚构输入XLSX](fixtures/four-items.xlsx)：

| 当前RFQ ID | 编码/名称 | 规格 | 数量 | 第一轮价 | 第二轮范围/价 |
|---|---|---|---:|---:|---|
| RFQ-L00001 | TEST-001 / 虚构轴 | M16 | 5件 | 9 | 不进入R2，保持R1=9 |
| **RFQ-L00002** | TEST-001 / 虚构轴 | **M20** | 4件 | 11 | **唯一进入R2，新价8** |
| RFQ-L00003 | TEST-EMPTY / 虚构空规格 | 空 | 2件 | 3 | 不进入R2，保持R1=3 |
| RFQ-L00004 | TEST-LONG / 虚构长规格 | 长规格，结尾完整末尾Ω | 3件 | 4 | 不进入R2，保持R1=4 |

原输入含ERP批次属性内部A/B/C/D，虚构长规格完整值见[输入文本](fixtures/long-spec.txt)。同码M16/M20保留独立行，没有自动合并。

1. UI将四行分给同一家甲，检查正反向分配的规格与ID。通过真实粘贴录入四条报价，写入并确认R1；保存/下载业务Excel并只读记录R1完整对象。
2. 新增下一轮→设置本轮议价范围。两行同时显示M16/M20及RFQ-L00001/00002；空规格“未填写”；长规格截断显示、title含完整末尾。分别在1024×768、1366×768、1600×900真实截图，document未越出视口。
3. 在全范围尚未报价时打开“选择沿用上轮项目”，四条安全候选显示对应规格、原RFQ ID、R1V1和价格。默认无勾选，勾选/取消后不自动写价；长/空规格同样明确。
4. 关闭沿用，打开范围→全不选→**只勾RFQ-L00002/M20**→保存范围。再次打开沿用时只剩M20候选。未填写依据时确认被拒；填写依据并勾核实后取消最终确认也不写价。独立探针重复验证此保护，实际报价记录数为0。
5. 取消沿用，真实手工录入M20=8，交期2天、MOQ1，来源说明“虚构第二轮人工议价，仅M20新单价8元”，写入并确认R2。R2明细只有一条、修改及来源控件锁定。
6. 只读核对`expectedLineIds == ["RFQ-L00002"]`，R2唯一报价`lineId=RFQ-L00002 / price=8 / source=manual`。R1完整对象（含价格、原始输入、行备注、时间及整轮来源/条款）与事先保存对象**完全相等**。
7. F5及实际进程重启后重新查看R2和比价。M16仍R1V1=9、M20为R2V1=8、空/长规格仍R1=3/4；总额 **9×5+8×4+3×2+4×3=95**，第一轮总额107，差额只来自M20 `(11−8)×4=12`。

English: Confirm four first-round quotes, inspect both new identity surfaces at three viewport sizes, then select only M20 for round 2. Confirm a new M20 price, compare saved expectedLineIds and quote history, refresh and restart the actual server. R1 remains exactly unchanged; effective prices total 95, down 12 exclusively from M20.

## 独立验收矩阵 / Independent acceptance matrix

全部案例使用上述候选、隔离环境和虚构数据。统计为15个业务验收项，不重复加算截图或helper。 / All cases use the locked candidate and synthetic data above.

| ID | Result | 操作、预期及实际 / Action, expected and observed | Evidence |
|---|---|---|---|
| T01 | PASS | 议价范围同时展示M16/M20及不可变L1/L2；直接可辨，无需跨页查规格。 / Distinguishable specifications and IDs. | [05-scope-1366.png](evidence/05-scope-1366.png) |
| T02 | PASS | 范围及沿用入口空规格显示未填写；长规格title完整到末尾Ω。 / Empty and full long specification values. | [06-carry-1366.png](evidence/06-carry-1366.png) |
| T03 | PASS | 1024×768、1366×768、1600×900两入口实际截图，无遮挡/串行及document越界。 / Three viewport checks. | [05-scope-1024.png](evidence/05-scope-1024.png) |
| T04 | PASS | 全不选后仅M20勾选，保存后expectedLineIds只有RFQ-L00002。 / One-line saved scope. | [scope-history-check.json](evidence/scope-history-check.json) |
| T05 | PASS | R2唯一实际报价为M20=8，M16仍9，空/长仍3/4；合计107→95只减12。 / Only M20 changes price. | [09-effective-comparison.png](evidence/09-effective-comparison.png) |
| T06 | PASS | R1四条记录和整轮来源/备注/原始字段对象与R1事先保存态完全相同。 / Exact immutable first-round history. | [scope-history-check.json](evidence/scope-history-check.json) |
| T07 | PASS | F5后R2仍单行8、手工来源、R1历史及四项有效价正确。 / Refresh persistence. | [15-main-after-F5-R2.png](evidence/15-main-after-F5-R2.png) |
| T08 | PASS | 真实服务重启后UI再次确认；关闭写入后精确前后snapshot/revision一致。 / Actual process restart. | [restart-history-check.json](evidence/restart-history-check.json) |
| T09 | PASS | 全范围沿用四候选同时显示对应规格/ID及原轮次价；限定M20后仅M20可沿用。 / Correct carry candidate identity/scope. | [06-carry-1024.png](evidence/06-carry-1024.png) |
| T10 | PASS | 默认不勾选，勾选/取消不自动带价；独立探针确认0实际写入报价。 / No automatic copying on selection/cancel. | [13-carry-guards-no-price-written.png](evidence/13-carry-guards-no-price-written.png) |
| T11 | PASS | 缺确认依据或取消最终确认均保持0实际报价，未绕过已有安全规则。 / Evidence and confirmation guards. | [13-carry-guards-no-price-written.png](evidence/13-carry-guards-no-price-written.png) |
| T12 | PASS | R2已确认后修改/来源控件禁用；最终source=manual，无未授权carry记录。 / Confirmed locking and source integrity. | [08-R2-confirmed-only-M20.png](evidence/08-R2-confirmed-only-M20.png) |
| T13 | PASS | 图纸候选及人工目标、双向分配、报价预览/确认、比价身份区精简抽测均显示正确规格/ID。 / Adjacent identity surfaces. | [10-drawing-identity-smoke.png](evidence/10-drawing-identity-smoke.png) |
| T14 | PASS | F1精简：单物料表经UI导回独立RFQ再导出，当前ID第1列、来源第11列，表头唯一、ERP值保留，新RFQ无供应商/报价串入。 / Provenance round-trip smoke. | [F1-smoke-check.json](evidence/F1-smoke-check.json) |
| T15 | PASS | F3精简：独立未报价行先分给乙、录入不供货空价并确认，比价明确不供货且无中选，内部文件cannot/空价。 / Cannot-supply smoke. | [14-F3-confirmed-cannot-probe.png](evidence/14-F3-confirmed-cannot-probe.png) |

## 保存态与文件核对 / Saved state and export checks

- [R1事先保存态](evidence/R1-saved-state.json)、[R2保存态](evidence/R2-saved-state.json)、[范围/历史断言](evidence/scope-history-check.json)。R2范围只含M20，R1逐项相等，独立预期总额95。
- [实际R2业务Excel](downloads/R2-business.xlsx)、[F5后主项目Excel](downloads/main-final-business.xlsx)。保留4物料及R1/R2历史；本轮不把OOXML解析称作原生Excel验收。
- [精确重启校验](evidence/restart-history-check.json)：关闭浏览器写入后前后revision **10**及snapshot SHA256相同；R1完整对象不变，R2仅M20=8/source=manual。
- [F1原样单Sheet输入](fixtures/single-materials.xlsx)、[实际往返导出](downloads/F1-roundtrip-business.xlsx)、[F1核对](evidence/F1-smoke-check.json)：12个唯一列，当前ID第1、来源第11；全部原物料值及ERP批次属性一致，初始回导RFQ供应商/报价行数均0。本轮是精简一轮抽测，未重跑上轮212列/两次完整往返全套。
- [F3实际业务导出](downloads/probe-F3-business.xlsx)、[F3文件核对](evidence/F3-smoke-check.json)。探针乙仅空规格L3不供货，内部报价状态cannot且价格为空，比价见截图14。没有把先前受保护的追加尝试算作通过证据。

## 日志解释与测试边界 / Logs and limits

原始失败探索保留在[主浏览器记录](evidence/browser-actions.jsonl)，没有删除或把helper失败改成产品PASS：

1. 空报价表有一行“当前无报价记录”占位。初次三个helper错误地期待tr数为0，实际为1；并非已复制价格。独立探针改按实际报价修改按钮/记录计数，缺依据、取消最终确认均为0，截图13也显示空表。
2. 第一次长交互命令受PTY输入长度影响，仅执行到R2确认，后续截图/导出未执行。随后已补齐。一次检查又在手工8元已写入后才期待0行，属于时点错误；再尝试编辑来源因已确认锁定而超时，反而证明锁定有效。以独立探针的正确时点、保存态source=manual及R1相等为结论依据。
3. 曾尝试在已形成历史的主项目M20追加乙供应商，被既有保护拒绝，随后查找不可用勾选控件超时；没有绕过。有效F3精简用另一个隔离RFQ的未报价L3，先分配再确认不供货，保持真实流程。
4. 初次重启前取样revision9发生于最后一次UI保存完成之前，后续为10，严格比较因此不相等；未把它说成数据丢失。等浏览器明确关闭后，又实际停止/重启8871，前后revision10快照完全一致。初步样本也保留，最终使用closed-writers前后文件。
5. 日志共2次驱动超时、4个误设helper预期；均已按上述有效证据重新核验。没有确认新的产品缺陷；不因存在无效helper而降低对实际业务结果的核验。

**NOT TESTED（3项）:** Windows BAT/本机启动、Windows原生Excel打开/重算/打印、Windows Computer Use。按任务暂停，未调用，也不宣称Windows验收完成。

本轮只做F2-R及已列受影响精简回归。旧报告19 PASS项未全套重跑；F4/F5仍保留上轮P3结论，本轮没有证据将其改成已修复。PDF原生渲染/翻页、完整备份恢复、邮件聊天原件归档、真实ERP完整字段语义等不在本轮重跑范围，旧限制继续保留；本轮图纸只测试匹配候选/人工目标的身份文案，不称其为实际图纸归档或PDF视觉通过。沿用正向“最终确认写入”的完整历史链未在本轮重新执行；本轮验证选项、范围、取消及必要确认保护，第二轮实际新价来自手工。

截图为原生Playwright PNG，未编辑；txt为页面完整文本，不能把离屏内容当像素可见证据。Trace含真实动作/DOM/网络，无逐帧screencast；[实际Trace Viewer载入截图](evidence/19-trace-viewer-validation.png)验证可用。只上传本次虚构测试服务HTTP日志，不含用户目录/私有业务资料。

English limitations: Invalid helper assumptions and one premature restart sample are retained and explained; valid UI, independent probe and saved-state checks support the result. Windows capabilities are NOT TESTED. Earlier broad UAT results and existing P3 issues are not rewritten without retesting. Positive final carry-forward execution and unrelated backup/PDF-pixel/ERP-dictionary capabilities are not newly claimed.

## 结论与交付 / Verdict and deliverables

**F2-R PASS，未发现本次补修造成额外业务回归。** 可建议用户考虑将PR #16合并到PR #15 ERP候选分支；决定与合并动作留给用户。不能据此宣称PR #15全阶段或Windows试用通过。本任务没有修产品、没有改原测试/CI、没有合并任何分支。

- [全部22张原生截图](EVIDENCE.md)
- [Playwright trace](evidence/f2r-directed-trace.zip)、[完整交互/异常记录](evidence/browser-actions.jsonl)
- [任务原文](evidence/task.md)、[保存态范围/历史校验](evidence/scope-history-check.json)、[精确重启校验](evidence/restart-history-check.json)
- [SHA256清单](SHA256SUMS.txt)、[独立工具说明](scripts/README.md)
