# PR #16 独立定向复验 / Independent cloud buyer retest

**最终结论 / Final verdict: HOLD — F1 PASS；F2 FAIL（仍有议价范围入口遗漏）；F3 原缺陷 PASS，补充“无适用报价”确认态 NOT TESTED。**

原版F1–F3均在本轮真实浏览器重新触发，未复用前一轮结论。候选版修复了F1、F3及F2任务列出的七处展示，但补查第二轮议价范围发现相同的规格缺失问题仍存在，建议补齐此P2后再独立复验。**暂不建议合并PR #16至ERP候选分支。没有执行合并或任何产品修复。**

English: Original F1–F3 were independently reproduced. Candidate F1 and the original F3 defect pass; the seven named F2 surfaces improved, but the second-round negotiation-scope selector still omits specifications. The overall F2 buyer-identification requirement remains incomplete. HOLD pending a targeted fix and retest. An additional confirmed no-applicable-price state could not be created through the supported UI and is NOT TESTED.

| 统计口径 / Counting unit | PASS | FAIL | NOT TESTED |
|---|---:|---:|---:|
| 原版3项缺陷复现（FAIL表示缺陷重现） / Original defect reproduction | 0 | 3 | 0 |
| 候选3项核心验收 / Candidate core acceptance | 2 | 1 | 0 |
| 独立受影响回归20项 / Affected regression cases | 19 | 1 | 0 |
| 环境/能力/补充分支7项 / Explicit coverage limitations | 0 | 0 | 7 |

核心F2与回归R20是同一残留问题，**不计作两个缺陷**。候选问题：P0=0、P1=0、P2=1（F2残留），既有F4/F5两项P3持续存在，按任务不纳入三项P2修复的统计。上述不是开发者CI用例数，也不是底层浏览器helper数量。

## 任务、版本与环境 / Task, versions and environment

- [最新独立复验任务](https://github.com/yudacheng666/SRM_System/pull/16#issuecomment-6209805697)，[任务完整存档](evidence/task.md)。
- **原版 / Original:** `f571f6643d96f1e826011b878fa0d579925cd08a`，PR #15 ERP分支。
- **候选 / Candidate:** `da406eb55da75971c08881ca96c87d66ba7f5bfa`，`fix/20261016-pr15-uat-f1-f3` → `feat/20261016-erp-core-field-alignment`。开始与发布前HEAD一致，PR #16仍Draft、未合并。
- 开发基线 / Development baseline: `8baac18195da9829333dd65433edaa2ba89cb623`；`main`: `f330de510f97c552629052ff1841d7223194e7f8`。均未改动。
- 独立证据分支 / Evidence-only branch: `test/20261016-pr16-independent-retest`。仅新增本报告、独立测试工具与证据；不改产品、既有测试、CI或数据库结构。
- **Environment = Codex Cloud / Linux**，真实Chromium **154.0.8037.57 headless** + Playwright **1.58.2**；Python **3.12.14**、Node **v24.19.0**。无Xvfb，未使用Windows Computer Use。详情见[环境记录](evidence/environment.json)。
- 主浏览器操作 / Main buyer actions: **2026-10-16 15:28–15:49 Asia/Shanghai**；补查议价范围 / scope follow-up: **15:52–15:54**。原始日志用UTC；报告用Asia/Shanghai。
- 实际M1-Lite后端由仓库已有`tests/e2e/serve.py`调用真实server.main，未运行原E2E套件。原版8851=`/tmp/srm-pr16-old-data`；候选8852=`/tmp/srm-pr16-new-data`；空白恢复8853=`/tmp/srm-pr16-restored-data`；旧快照兼容及补查8854=`/tmp/srm-pr16-legacy-data`；双来源冲突恢复8855=`/tmp/srm-pr16-conflict-data`。全部为本轮新建临时目录。
- 所有写入经真实页面按钮、输入、上传、确认、下载与恢复；没有API/JS/SQLite业务状态注入。只读SQLite、openpyxl、ZIP与SHA256用于交叉核对。旧格式快照和冲突快照也是**原版真实UI生成后下载的S4备份**，没有手改SQLite/快照。
- 原32项套件未重跑。exact候选既有CI只作背景：[UI V2](https://github.com/yudacheng666/SRM_System/actions/runs/38862563551)、[S3/S4](https://github.com/yudacheng666/SRM_System/actions/runs/38862563785)，查询均completed/success。

## F1 · 内部物料表身份往返 / Identity round-trip — PASS

**共同输入 / Shared input:** [buyer-wide.xlsx](fixtures/buyer-wide.xlsx)，任务四条来源需求加WIDE-221，221输入列（9核心、212个原ERP附加字段）。通过预览→确认，完全相同M16两行2+3合成5件，M20保留4件，支架6件，宽表1件；得到4条询价行，当前ID为1/3/4/5。

**原版重现 / Original reproduction:**

1. UI导出三Sheet [old-cycle0.xlsx](downloads/old-cycle0.xlsx)，原样抽取「询价物料」为[单表](fixtures/old-cycle0-single.xlsx)，不改表头/值。
2. UI新建RFQ导入4项，再导出 [old-cycle1.xlsx](downloads/old-cycle1.xlsx)。
3. 原版物料Sheet第**1、223列**同名`RFQ Line ID`；M20的新/旧ID=2/3，宽表=4/5。再次抽出原物料Sheet，经真实UI二次导入，报`XLSX: 存在重复列标题`，不导入。

证据：[精确表头/ID](evidence/old-cycle1-inspection.json)、[真正拒绝截图](evidence/old-02-F1-second-import-rejected.png)、[原版trace及动作日志](evidence/browser-actions.jsonl)。因此原版FAIL已重新触发。

**候选复验 / Candidate verification:** 同一输入，在8852新目录完整执行 **cycle0→新RFQ导回→cycle1→再新RFQ导回→cycle2**，两次连续往返均通过实际UI。

| 候选导出 / Export | 列数 | 当前ID列 / Current ID | 来源列 / Source ID | 表头唯一 / Unique |
|---|---:|---|---|---|
| cycle0 | 222 | 第1列RFQ Line ID | 尚无来源ID | 是 |
| cycle1 | 223 | 第1列RFQ Line ID | 第11列来源 RFQ Line ID | 是 |
| cycle2 | 223 | 第1列RFQ Line ID | 第11列来源 RFQ Line ID | 是 |

M20当前ID=2、原来源ID=3；WIDE当前4、来源5，第二次往返后仍分别保留。当前ID标识新询价行；来源ID是来历，允许与当前ID不同。**212原附加字段逐值无差异，原221列值在宽表探针连续导出中均一致。** 来源/当前身份分离不等于错误冲突。

证据：[cycle1列号和值](evidence/new-cycle1-inspection.json)、[cycle2列号和值](evidence/new-cycle2-inspection.json)、[逐值核对](evidence/wide-values-check.json)、[cycle2原Excel](downloads/new-cycle2.xlsx)。

**兼容与冲突 / Compatibility and conflict:** 原版UI导出的快照真实含`erpExtra["RFQ Line ID"]`（[原快照](evidence/legacy-original-snapshot.json)），以S4备份在候选空目录恢复，导出已改为第11列来源ID、表头唯一，值不丢（[兼容导出](evidence/legacy-old-snapshot-export-inspection.json)）。另用原版真实UI建立双来源附加字段A/B相矛盾的虚构快照，再下载S4、恢复到8855；候选保留两值，内部导出明确报：**“同一物料的两个来源 RFQ Line ID 不一致，拒绝静默覆盖”**，没有生成静默择一的导出。[可见错误](evidence/new-18-conflicting-sources-visible-error.png)、[冲突原快照](evidence/legacy-conflicting-original-snapshot.json)。

外发[来源字段项目供应商包](downloads/roundtrip-supplier-package.zip)只含当前RFQ ID，无来源ID或212个ERP附加字段；真实PDF哈希正确，见[独立校验](evidence/independent-artifact-checks.json)。在回导项目上新增的图纸/分配/报价不会串入原主项目；两个项目均独立保存。

English: Both consecutive UI round-trips preserve current identity separately from provenance, keep all 212 raw ERP fields, and export unique headings. A real old-UI snapshot remains readable; contradictory legacy provenance values block export instead of being silently chosen. Supplier exports exclude provenance and private ERP fields.

## F2 · 同编码不同规格的决策识别 / Specification visibility — FAIL, residual P2

### 已修复的明确入口 / Verified improved surfaces

原版本轮重现：候选及人工图纸目标只有TEST-001+RFQ ID；双向分配、报价预览/已确认轮次、比价固定身份区均无法直接读出M16/M20。[原图纸](evidence/old-03-F2-drawing-targets.png)、[原按物料](evidence/old-04-F2-item-allocation.png)、[原按供应商](evidence/old-05-F2-supplier-allocation.png)、[原预览](evidence/old-06-F2-quote-preview.png)、[原确认轮次](evidence/old-07-F2-F3-confirmed-status.png)、[原比价](evidence/old-08-F3-cannot-flattened.png)。

候选对相同身份的图纸候选、人工目标、双向分配、报价预览、已确认轮次和比价固定身份区，均显示规格和不可变RFQ ID；空规格显示“未填写”，长规格截断处的title保留完整值。输入虚构长规格末尾标记`末尾识别Ω`，DOM读出的title确实完整，不将其伪称为已截图的原生tooltip。三尺寸1024×768、1366×768、1600×900的对应截图均归档，横滚后身份列仍固定。图纸候选规格变更后旧预览明确拒绝；报价后不允许修改原图纸关联，保护未失效。

证据：[候选图纸](evidence/new-03-F2-drawing-identities.png)、[旧预览拒绝](evidence/new-04-stale-drawing-spec-change.png)、[长/空规格分配](evidence/new-05-F2-item-allocation-long-empty-spec.png)、[三尺寸全部截图](EVIDENCE.md)、[横滚截图](evidence/layout-compare-scrolled-1024.png)。

### F2-R · P2残留：第二轮议价范围仍缺规格 / Residual negotiation-scope selector

**页面 / Page:** 报价回收 → 第二轮 → 设置本轮议价范围。**影响 / Impact:** 采购员决定只谈M16还是M20时，面对相同编码同名称，需要再跨页查RFQ ID，仍存在选错议价范围的风险。

**独立实际复现 / Actual reproduction (candidate da406eb):**

1. 在8854候选新建RFQ `RFQ-1792137249164-BHZ7V2`。通过真实粘贴导入：

```csv
存货编码,存货名称,规格型号,询价数量,询价单位
TEST-001,虚构轴,M16,5,件
TEST-001,虚构轴,M20,4,件
```

2. UI导入虚构供应商，给甲供应商分配这两行；确认提示本身已显示规格。
3. 第一轮通过粘贴报价：L1=9、L2=11、交期3天、MOQ1，写入后确认。
4. 点击“+ 新增下一轮”→“设置本轮议价范围”。

**预期 / Expected:** 两个选项各自有M16/M20、RFQ行ID；长/空规格沿用其他业务入口展示规则。

**实际 / Actual:**

```text
TEST-001 · 虚构轴 RFQ-L00001
TEST-001 · 虚构轴 RFQ-L00002
```

均无规格，也没有完整规格title提示。不是因为测试没导入规格：分配确认提示和原物料表都明确M16/M20。这里只说明展示残留，未观察到程序将两行自动合并或错误写价。

**证据 / Evidence:** [直接操作截图](evidence/new-30-residual-scope-spec-missing.png)、[行文本与实际HTML](evidence/scope-followup-rows.json)、[独立补查trace](evidence/scope-followup-trace.zip)、[补查驱动](scripts/scope-followup.cjs)。截图为真实运行软件，不是原型。

**建议 / Suggested direction:** 将统一的规格+不可变RFQ行身份展示覆盖到议价范围选项；保持勾选值、确认轮次和范围逻辑不变。修复后用同编码M16/M20选择单行范围，验证新轮仅该行、旧轮另一行仍有效。**此任务只记录，未实现修复。**

English: The seven explicitly named surfaces pass, but the adjacent negotiation-scope control still has the original buyer-identification weakness. In a new RFQ with same-code M16/M20 items and a confirmed first round, the second-round scope list shows only code/name/opaque line ID, with no specification or tooltip. F2 is therefore not fully resolved across the affected workflow.

## F3 · 不供货显示 / Cannot-supply state — original defect PASS

原版：C供应商M20设置“不供货”、空价、人工来源说明，支架“明确未报价”，L1漏报，宽表7元正常价对照；确认后切比价，M20被显示成“未报价”。[报价确认](evidence/old-07-F2-F3-confirmed-status.png)、[比价重现](evidence/old-08-F3-cannot-flattened.png)。

候选主项目C：M20不供货、支架及宽表明确未报价，M16漏报，均确认且价为空。比价实际文案分别为：

| 情形 / State | 实际显示 / Actual label | 可中选 / Selectable |
|---|---|---|
| C / M20 不供货 | 不供货 | 否 |
| C / 支架、宽表明确不报价 | 明确未报价 | 否 |
| C / M16 确认轮次缺报 | 未报价（UI实际仅这3字，漏报来源由轮次覆盖检查印证） | 否 |
| A/B未分配M20/宽表 | 未分配 | 否 |
| 已确认但没有适用价 | NOT TESTED | 未建立该确认态，不推断 |

证据：[候选状态截图](evidence/new-12-F3-distinct-statuses.png)、[确认C](evidence/new-11-F3-confirmed-cannot-noquote.png)、[真实进程重启后](evidence/new-26-post-process-restart-statuses.png)、[恢复确认态](evidence/new-27-restored-confirmed-C.png)。无价单元格无data-award，内部Excel对应价/金额为空，不以零元参与共同范围或最低价。

**补充限制:** 通过真实UI给数量1的宽表录入`2+:7`阶梯价，预览明确报“RFQ数量没有适用的阶梯价格”。没有用API/快照注入绕过验证来制造确认态，故“无适用报价”的已确认比价显示列N01 NOT TESTED。该分支没有被冒充PASS。[预览负例](evidence/new-10-no-applicable-tier-rejected.png)。

**独立财务回归 / Independent financial check:** 主项目A第一轮数量5适用阶梯20、支架30；A第二轮只M16，V1=18.5、V2=18。B第一轮19/32，V2改21/32；C无有效价。A=18×5+30×6=270；B=21×5+32×6=297；最低=270；最终选B的M16+A支架=285；非最低差额15。选择必须有原因；B修订后旧选择先待复核，排除M16时总额180，再复核为285。

独立openpyxl检查实际公式：R2=ROUND(Q2*C2,2)=90，R3=180，U2=105，U3=192，SUMIF共同两行得到270/297。A/B共同范围2项，加入C后共同范围0项；M20单价/金额均空。内部历史保留A R1V1/R2V1/R2V2、B R1V1/R1V2及来源/备注。见[独立文件校验](evidence/independent-artifact-checks.json)、[原始报表行](evidence/comparison-raw-rows.json)、[最终Excel](downloads/new-final-comparison.xlsx)、[三家审计](downloads/new-three-status-audit.xlsx)。没有用Windows Excel，未声称其重算通过。

English: The original cannot-supply flattening is fixed, including refresh, real restart and restored data. Explicit noquote and confirmed missing rows stay distinct and unselectable. Monetary results and history remain correct. The separately requested confirmed no-applicable-price presentation is NOT TESTED because the real UI rejects the prerequisite invalid tier quote.

## 受影响业务独立回归 / Affected buyer regression

每项适用本报告固定候选SHA、隔离环境与虚构数据；操作、预期/实际和证据如下。 / Each case uses the locked candidate and records actual buyer steps and persisted/file results.

| ID | Result | 操作 / Expected and observed outcome | Evidence |
|---|---|---|---|
| R01 | PASS | 宽表两次UI往返后212原ERP附加列逐值一致；全部表头唯一，当前/来源ID分别保留。 / Two complete round-trips preserve raw values and separate identities. | [wide-values-check.json](evidence/wide-values-check.json) |
| R02 | PASS | 原版UI生成的旧erpExtra RFQ ID快照恢复后可导出，旧ID映射为来源列。 / Genuine legacy snapshot remains readable. | [legacy-old-snapshot-export-inspection.json](evidence/legacy-old-snapshot-export-inspection.json) |
| R03 | PASS | 旧快照两个来源值冲突，候选内部导出明确拒绝，不静默取一个。 / Contradictory legacy provenance blocks export. | [new-18-conflicting-sources-visible-error.png](evidence/new-18-conflicting-sources-visible-error.png) |
| R04 | PASS | 报价后3家外发XLSX和来源项目含图纸ZIP，实际解包：无来源ID/ERP原字段/其他供应商历史/中选结论。 / Vendor confidentiality. | [independent-artifact-checks.json](evidence/independent-artifact-checks.json) |
| R05 | PASS | 5来源行→4询价行；同码M16/M20不误并、盒/件独立、数量5/4。 / Identity and units. | [old-01-four-materials.png](evidence/old-01-four-materials.png) |
| R06 | PASS | 改M16规格后旧图纸预览拒绝；新RFQ刷新后重新匹配可成功关联两份。 / Stale preview rejected, fresh UI matching succeeds. | [new-04-stale-drawing-spec-change.png](evidence/new-04-stale-drawing-spec-change.png) |
| R07 | PASS | 三尺寸关键身份区可读规格/RFQ ID；长规格title完整、空规格标未填写。 / Long/empty specification handling. | [layout-compare-1024.png](evidence/layout-compare-1024.png) |
| R08 | PASS | 三尺寸双向分配、报价预览/确认、图纸与比价截图；document不超视口，横滚固定身份列。 / Seven named surfaces and responsive behavior. | [layout-compare-scrolled-1024.png](evidence/layout-compare-scrolled-1024.png) |
| R09 | PASS | A重复追加不覆盖B，C反向取消再选；名称/规格展示变化不改变1/3/4/5行身份或多对多关系。 / Additive/repeated/reverse allocation. | [new-06-F2-supplier-allocation.png](evidence/new-06-F2-supplier-allocation.png) |
| R10 | PASS | A XLSX、B粘贴、C手工状态，来源/条款/备注保留；A R1/R2V1/V2、B R1V1/V2已确认历史保留。 / Mixed quote entry and immutable history. | [comparison-raw-rows.json](evidence/comparison-raw-rows.json) |
| R11 | PASS | 数量1录入2+:7，预览识别无适用阶梯错误；不作为有效报价参与本轮。 / Invalid tier input caught in UI preview. | [new-10-no-applicable-tier-rejected.png](evidence/new-10-no-applicable-tier-rejected.png) |
| R12 | PASS | C不供货/明确未报价/缺报各有正确来源，单元格不可选、无价金额空、刷新及重启仍在。 / State semantics and unselectable nonprices. | [new-26-post-process-restart-statuses.png](evidence/new-26-post-process-restart-statuses.png) |
| R13 | PASS | 独立解析实际ROUND/SUMIF及手算：270/297/285/270/15。 / Financial calculations. | [independent-artifact-checks.json](evidence/independent-artifact-checks.json) |
| R14 | PASS | 非最低无原因不能提交；B新版本后旧选择待复核，总额180，复核后285。 / Award reason and changed-quote review. | [new-14-selected-quote-review.png](evidence/new-14-selected-quote-review.png) |
| R15 | PASS | A/B共同2项，三家共同0项；M20无单价/金额，不按0元排名。 / Comparable scope excludes nonprices. | [independent-artifact-checks.json](evidence/independent-artifact-checks.json) |
| R16 | PASS | 回导RFQ新关联两PDF，包中原字节SHA256正确；供应商包只各自范围且报价区空。 / Correct PDF identity and file bytes. | [new-21-roundtrip-pdf-result.png](evidence/new-21-roundtrip-pdf-result.png) |
| R17 | PASS | 自动保存、F5及项目切换后报价/来源/关联保持；一次409刷新后恢复，等待切换完成后保存成功（详见日志限制）。 / Persistence with disclosed transient save observation. | [new-22-main-after-switch-refresh.png](evidence/new-22-main-after-switch-refresh.png) |
| R18 | PASS | 实际停止8852服务再启动；关闭浏览器写入后再一次精确重启验证，3快照/修订及2PDF哈希不变。 / Real restart integrity. | [restart-restore-checks.json](evidence/restart-restore-checks.json) |
| R19 | PASS | UI完整ZIP恢复到空8853；3快照/修订和2PDF逐项一致；非空再次恢复明确拒绝。 / Full restore and nonempty guard. | [new-28-nonempty-restore-refused.png](evidence/new-28-nonempty-restore-refused.png) |
| R20 | FAIL | 第二轮设置议价范围，TEST-001/M16与M20两个选项缺规格和title，需跨页查ID。F2-R。 / Scope selector still ambiguous to buyers. | [new-30-residual-scope-spec-missing.png](evidence/new-30-residual-scope-spec-missing.png) |

## 未测范围 / NOT TESTED

| ID | 项目 / Item | 原因 / Reason |
|---|---|---|
| N01 | 已确认“无适用报价”比价单元格 | UI输入验证拒绝无适用阶梯，不通过直接修改快照/DB制造；仅负例预览通过。 / Cannot establish confirmed state via supported UI. |
| N02 | 原生PDF页面像素、翻页、缩放 | 本轮只验实际关联、原文件、包内哈希和恢复；未宣称headless内嵌渲染通过。 / PDF bytes and linkage tested, viewer pixels not tested. |
| N03 | Windows原生Excel打开、重算、打印 | 仅OOXML解析及独立公式计算。 / No native Excel. |
| N04 | Windows启动/BAT双击 | 按任务不做Windows实机。 / Excluded by task. |
| N05 | Windows Computer Use | 按任务不调用。 / Excluded by task. |
| N06 | 邮件/聊天原件归档 | 当前保存来源类型和说明，无原件持久化入口；不把PDF备份说成包含未登记的原邮件。 / Source description is not original evidence archival. |
| N07 | 真实ERP完整字段字典语义 | 只使用虚构宽表原列名/值；不代表真实约220字段语义映射。 / Raw retention is not semantic ERP validation. |

## 原P3与日志边界 / Existing P3 and interpretation of raw evidence

**F4/F5持续存在，未修复且不纳入三P2结果。** 报价首屏仍受帮助/多入口占用：[F4](evidence/new-23-F4-density-still-observed.png)。256列探针触发220附加字段保护，提示仍为“过大或不安全ERP字段”，未清楚解释计数上限：[F5](evidence/new-24-F5-capacity-wording-still-observed.png)。保护阻止导入，没有静默截断；未声称256列全部可导入。

- 三Sheet报表不直接作为已支持输入。所有往返原样抽取单「询价物料」Sheet（[独立抽取工具](scripts/extract-material-sheet.py)），不改列/值、不扩大范围。
- 主项目`RFQ-1792135934514-B47WGC`为1/3/4/5行、3家、多轮报价；回导富项目`RFQ-1792136020536-FU6UZ5`为1/2/3/4行，来源1/3/4/5，含独立甲分配、确认报价及2PDF。第一次回导探针`RFQ-1792135973593-G1YD2R`仅4物料。8854补查项目独立于8852备份，不纳入3项目恢复计数。
- 完整恢复以下载时revision **27/1/8**为参照，3快照SHA及2PDF字节均相等。之后F5容量负例预览使主项目`lineSeq`从5到6、revision27到28，业务items/报价/分配/选择均未变；见[实际差异](evidence/pre-shutdown-revision27-to28-diff.json)。因此首次拿较早备份基线对比重启的严格断言不相等，未隐藏。停止所有浏览器写入后又实际停止/重启8852，立即前后**28/1/8快照及哈希完全一致**：[最终精确校验](evidence/restart-restore-checks.json)。不是声称两个不同时间点revision相同。
- 主流程日志有**1个错误测试预期**：最初把“当前RFQ ID与显式来源ID不同”误当作“两来源字段矛盾”，helper期望禁用而实际允许。当前/来源本来就可不同，这不是产品FAIL。随后通过原版真实UI建立`erpExtra`两来源A/B冲突快照，候选导出明确拒绝，才作为有效冲突验收。
- 主流程4次驱动错误：隐藏导入区等待/滚动、截图超时重拍、保存等待超时。旧版新项目建立期间还记录2次`Cannot read properties of undefined (reading 'name')`，本次没有归为候选修复失败。完整记录保留。
- 一次候选切换项目后立刻保存返回409“Active RFQ has changed in another browser window”；刷新后保存成功，后续等待切换完成再保存正常，未发现持久化数据丢失。此为**未确认观察项**，不凭一次保护提示断言另有P1或已定位原因；原日志及[截图](evidence/new-20-project-switch-save-observation.png)保留。如后续继续出现，应单独复现单窗口切换/保存时序。
- 截图`new-17-batch-pdf-confirmed`名称来自探索时命名，但实际是已有报价历史禁止改图纸的负例，**不能拿它当关联成功证据**；真正成功是无报价回导项目的[new-21](evidence/new-21-roundtrip-pdf-result.png)，文件哈希另已校验。相应首次过期预览、报价后改图受阻均不算PDF成功。
- 补查先试R1“设置范围”发现按钮按设计禁用，随后按真实流程确认R1→新增R2才打开范围编辑；未绕过disabled按钮。最终补查trace保存完整有效复现。
- 57+1张独立PNG来自实际浏览器（最终数量见证据目录）；同名txt为完整页面文本，包含滚动之外的内容，不当作可见像素证据。主trace和补查trace无screencast，含真实动作/DOM/网络；主trace已在真实Trace Viewer载入，截图也归档。原HTTP日志仅来自本轮临时虚构测试服务，不是用户/主机完整日志。

## 交付与后续建议 / Deliverables and next step

- [全部原生截图 / Screenshot gallery](EVIDENCE.md)
- [主流程trace](evidence/independent-retest-trace.zip)、[补查残留trace](evidence/scope-followup-trace.zip)、[Trace Viewer验证](evidence/new-29-trace-viewer-validation.png)
- [完整主流程动作/观察/异常](evidence/browser-actions.jsonl)、[独立XLSX/ZIP/PDF校验](evidence/independent-artifact-checks.json)
- [SHA256清单](SHA256SUMS.txt)、[独立工具说明](scripts/README.md)

**后续最小修复任务建议:** 在议价范围选项显示规格及不可变ID（含长/空规格），用同码M16/M20限定第二轮单行范围后复验报价继承、共同范围和金额；补充能从支持的真实业务入口建立“无适用报价”确认态的路径或明确能力边界。F4/F5保持独立P3。这里只建议，不修改代码。**最终HOLD；PR #16、PR #15、开发基线和main均不合并、不更改状态，等待用户决策。**

English: Keep the PR in Draft. Fix the remaining negotiation-scope identity display, then independently retest a one-item second round and inherited quote scope. Clarify or test the supported path for a confirmed no-applicable-price state. No product, existing test, CI or schema changes were made; no branch was merged.
