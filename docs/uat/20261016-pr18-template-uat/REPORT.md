# PR #18 标准导入模板独立验收 / Independent import-template UAT

**整体结论 / Overall: PARTIAL — 四类模板下载与回填导入主流程全部PASS；1项P3非法预览保存副作用未通过。**

独立验收 **23 PASS / 1 FAIL / 2 NOT TESTED**（24个业务验收项，另2项Windows能力限制）。所有实际下载文件格式/表头正确，填入虚构业务数据后可通过相应入口正常导入；未观察到报价错配、跨供应商污染、模板泄露内部数据或下载改变保存版本。但缺必填单位的物料文件**只预览、未确认导入**也推进`lineSeq`并自动保存新版本，不完全满足“错误文件不修改已保存项目”的严格要求。没有新增物料/报价或数据丢失，严重度P3。

**建议：模板主功能可在明确记录该P3后，由用户考虑纳入已验收修复链；若采用“拒绝文件完全不改保存态”的严格门槛，应先处理此P3再定向复验。** 本报告不把PARTIAL写成全PASS，不自行修复或合并。

English: All four actual download/fill/import workflows pass. Overall acceptance is **PARTIAL** because one P3 issue remains: previewing an invalid material file advances the saved line sequence/revision despite no confirmed import. No business rows or quotes are added. Consider accepting the template feature with this issue explicitly tracked, or fix/retest it first if strict no-side-effect rejection is a merge requirement. No product changes or merges were performed.

## 任务、版本与环境 / Task, version and environment

- [最新独立UAT任务](https://github.com/yudacheng666/SRM_System/pull/18#issuecomment-6212501868)，[原文存档](evidence/task.md)。
- **被测HEAD / Tested:** `5424e57cf6648cef4382bd715f00993b1b5f4165`，`feat/20261016-settings-import-templates`。开始与结案前核实一致，PR #18仍Draft、未合并。
- PR目标：`fix/20261016-pr15-uat-f1-f3`，`9406973f0e99bd33f9f4140c89b9df5d7c58d443`；继承的PR #16修复链未擅自合并。
- PR #15 ERP分支`f571f6643d96f1e826011b878fa0d579925cd08a`、开发基线`8baac18195da9829333dd65433edaa2ba89cb623`、main `f330de510f97c552629052ff1841d7223194e7f8`保持原状。
- Environment = **Codex Cloud / Linux**；真实Chromium **154.0.8037.57 headless** + Playwright **1.58.2**；Python **3.12.14**、Node **v24.19.0**。[环境记录](evidence/environment.json)。
- 实际浏览器操作：**2026-10-16 17:35–17:48 Asia/Shanghai**（原始JSONL为UTC），之后只整理证据与独立核对。
- 真实M1-Lite `server.main` 由仓库已有启动器运行；主服务8891=`/tmp/srm-pr18-data`，负例/F1探针8892=`/tmp/srm-pr18-probe-data`。两个全新独立SQLite目录，不访问默认用户库或真实采购信息。
- 真实UI下载、输入、上传、预览、确认、取消、F5、Tab/Enter。没有JS/SQLite/API注入业务状态；下载物用zipfile/openpyxl只读解析，另复制实际模板并写入虚构输入，再由UI导入。数据库指纹使用mode=ro读取。
- 未运行ERP10或原E2E套件；exact SHA已有[UI CI](https://github.com/yudacheng666/SRM_System/actions/runs/38880166854)、[S3/S4 CI](https://github.com/yudacheng666/SRM_System/actions/runs/38880166861)查询均completed/success，**仅作背景**。
- 独立证据分支`test/20261016-pr18-template-uat`只新增报告、匿名证据及本轮临时工具/步骤，不改产品、既有测试、CI或数据库结构，不改变/合并任何PR。

## 实际下载文件 / Actual downloaded files

从侧边栏“字段设置”进入“数据导入模板下载”。演示模式、保存后的空白正式RFQ、已有两家供应商/报价的正式RFQ分别点击四个下载按钮；另以Tab/Enter触发供应商模板下载。**13份最终保留下载模板逐一校验**（其中三组各四份+键盘一份）。[结构、原字节SHA及泄露标记检查](evidence/template-file-checks.json)。

| 模板 / Template | 实际文件名 / Suggested filename | 实际格式/结构 / Verified structure |
|---|---|---|
| 询价物料 | SRM_询价物料导入模板.xlsx | 真OOXML XLSX；唯一可见Sheet「询价物料」；1行、10列，只有表头 |
| 供应商 | SRM_供应商导入模板.xlsx | 真OOXML XLSX；唯一可见Sheet「供应商」；1行、3列，只有表头 |
| 供应商报价 | SRM_供应商报价导入模板.xlsx | 真OOXML XLSX；唯一可见Sheet「供应商报价」；1行、7列，只有表头 |
| 匹配更新 | SRM_批量匹配更新模板.csv | 真CSV；UTF-8 BOM `EF BB BF`，首行`匹配值,新值`加CRLF，没有数据行 |

**准确表头 / Exact headings:**

```text
询价物料:
存货编码,存货名称,规格型号,所属类别,参考编码1,参考编码2,采购常用单位,询价数量,询价单位,图号

供应商:
往来单位编码,供应商编码,往来单位名称

供应商报价:
RFQ Line ID,存货编码,报价单价,交期,MOQ,报价状态,物料备注

匹配更新CSV:
匹配值,新值
```

XLSX ZIP CRC有效、工作表全可见、无隐藏额外Sheet、无重复列/业务行/外部链接/VBA。演示中的虚构样本、已录入的供应商/价格/备注、未知ERP原始字段都没有被带入模板；扫描完整OOXML部件也不含本轮`TPL-001`、供应商名、ERP批次属性、具体RFQ行ID等内部标记。报价模板没有自动编造或填入任何有效RFQ Line ID。

入口说明明确：物料必填存货编码/询价数量/询价单位，其余所列字段可选；供应商必填往来单位编码/名称，供应商编码可回退；报价重复存货编码时须使用真实RFQ行ID；匹配更新只能CSV/TXT，先选匹配字段与更新字段。**匹配更新入口不支持XLSX，本报告没有声称支持。**

演示下载前后数据库均0项目；空白正式工作首次保存后下载仍revision1/0物料。已有报价后的下载及键盘/三尺寸操作前后，完整保存快照SHA与revision相同：[下载无修改核对](evidence/download-no-mutation-check.json)。下载反馈能在页面看到文件名；Tab焦点有outline，Enter产生真实下载。[1024布局](evidence/layout-settings-1024.png)、[键盘焦点](evidence/keyboard-template-focus.png)。

English: Actual artifacts, not button labels alone, were inspected. Three genuine single-sheet/header-only XLSX files and one BOM CSV were downloaded before and after real data existed. Templates remain blank and independent of RFQ data, and downloading does not change the saved snapshot or revision.

## 回填与业务结果 / Fill and import outcomes

### 物料及未知ERP列 / Materials and extra ERP fields

直接复制本轮实际下载物料模板，从第2行填写[materials-filled.xlsx](fixtures/materials-filled.xlsx)，末尾增加未知`ERP批次属性`列：

| ID | 编码/名称 | 规格 | 数量/询价单位 | 采购常用单位 | 图号 | ERP附加值 |
|---|---|---|---|---|---|---|
| RFQ-L00001 | TPL-001 / 虚构模板轴 | M16 | 5件 | 盒 | DRAW-TPL-A | 内部批次A |
| RFQ-L00002 | TPL-001 / 虚构模板轴 | M20 | 4件 | 盒 | DRAW-TPL-B | 内部批次B |

真实文件上传→预览→明确确认同码不同规格分行，最终恰好2行。规格、数量、独立单位、参考码、图号及未知ERP列均在保存态保留。[预览](evidence/04-material-template-filled-preview.png)、[2行结果](evidence/05-two-materials-imported.png)、[独立保存态核对](evidence/independent-business-checks.json)。

### 匹配更新CSV / Matched update CSV

复制实际BOM CSV模板，保留标准首行，填写M16/M20两行；物料页先选**匹配字段=规格型号、目标字段=参考编码2**，上传[update-filled.csv](fixtures/update-filled.csv)。实际预览：**可更新2行、未匹配0行、错误/冲突0行**；表头被跳过，没有被计作未匹配。

第一次点击确认更新时取消二次确认，两个参考码仍TPL-REF2；再次确认后为TPL-NEW16/TPL-NEW20。再上传[无表头UTF-8旧CSV](fixtures/update-headerless.csv)，同样匹配2/未匹配0，最终为TPL-LEGACY16/TPL-LEGACY20，兼容性通过。[标准预览](evidence/06-csv-standard-header-preview.png)、[确认更新](evidence/07-csv-standard-header-applied.png)、[旧无表头结果](evidence/08-headerless-csv-applied.png)。

### 供应商 / Suppliers

实际模板填两行：[suppliers-filled.xlsx](fixtures/suppliers-filled.xlsx)。CP-TPL-A/TPL-A/虚构模板甲；CP-TPL-B/**空供应商编码**/虚构模板乙。UI确认导入后恰好2家，乙供应商编码实际为CP-TPL-B。重复已有编码、文件内重复、空必填编码、错误表头均有用户可见错误并禁确认，没有产生假重复或部分新供应商。[重复错误](evidence/supplier-negative-supplier-duplicate-file.png)、[缺编码错误](evidence/supplier-negative-supplier-missing-required.png)、[实际导出编码](evidence/independent-business-checks.json)。

### 报价及跨供应商隔离 / Quotes and supplier isolation

先为乙选择明确供应商/第一轮，用实际下载模板填入L1=14、L2=22，状态均正常报价，上传预览→写入→确认。[乙预览](evidence/11-B-downloaded-quote-template-preview.png)、[乙确认](evidence/12-B-two-prices-confirmed.png)。记录该确认轮次完整对象，再切甲。

甲上传[A-quotes-filled.xlsx](fixtures/A-quotes-filled.xlsx)：L1正常报价12.5元，L2不供货且价空，各有独立备注；同存货编码依靠**两个当前真实RFQ ID**正确匹配规格。上传预览→写入→确认后，甲两状态/价格均正确，乙确认历史对象与此前**完全相等**。比价L2明确显示“不供货”，不是“未报价”或0元。[甲预览](evidence/13-A-real-template-normal-cannot-preview.png)、[甲确认](evidence/14-A-confirmed-normal-cannot.png)、[比价](evidence/15-F3-comparison-status-and-prices.png)。独立预期A自身有效额62.5、B为158、逐项最低组合150.5；本报告以保存态与实际报价为依据，不靠截图猜价。

另用同一空白报价模板填写重复编码TPL-001但不填行ID，预览明确“物料编码对应多条RFQ行，请使用RFQ Line ID”，尝试写入也拒绝，没有自动任选规格。错误报价表头及损坏XLSX同样不写入。[歧义截图](evidence/quote-negative-quote-code-only-ambiguous.png)。

## 独立验收矩阵 / Independent acceptance matrix

每项均适用上面的被测SHA、Linux隔离环境和虚构数据。24项业务验收中23PASS、1FAIL；表后另列2项环境未测。 / Each case records real actions, expected invariants and observed outcomes.

| ID | Result | 操作、预期及实际 / Action, expectation and actual result | Evidence |
|---|---|---|---|
| T01 | PASS | 侧栏字段设置→模板区域；四个业务入口有名称/格式/必填/限制与下载反馈。 / Clear entry and instructions. | [01-demo-template-entry.png](evidence/01-demo-template-entry.png) |
| T02 | PASS | 演示四模板真实下载；UI演示行不变，SQLite仍0项目。 / Demo download has no persistence. | [after-demo-downloads.json](evidence/after-demo-downloads.json) |
| T03 | PASS | 空白正式询价保存后四模板可下载；仍revision1、0物料。 / Formal empty-state download. | [after-empty-formal-downloads.json](evidence/after-empty-formal-downloads.json) |
| T04 | PASS | 已有供应商/报价后再次下载，前后完整快照及revision完全一致。 / Populated download does not mutate state. | [download-no-mutation-check.json](evidence/download-no-mutation-check.json) |
| T05 | PASS | 物料真XLSX，唯一询价物料Sheet、1行10标准列，无隐藏表/重复列/数据。 / Material artifact structure. | [template-file-checks.json](evidence/template-file-checks.json) |
| T06 | PASS | 供应商真XLSX，唯一Sheet、准确3列、只有表头。 / Supplier artifact structure. | [template-file-checks.json](evidence/template-file-checks.json) |
| T07 | PASS | 报价真XLSX，唯一供应商报价Sheet、准确7列，未填虚假RFQ ID，无数据泄露。 / Generic quote artifact. | [template-file-checks.json](evidence/template-file-checks.json) |
| T08 | PASS | 匹配更新是真UTF-8 BOM CSV，匹配值/新值首行；明确只支持CSV/TXT。 / True BOM CSV. | [template-file-checks.json](evidence/template-file-checks.json) |
| T09 | PASS | 填写真实物料模板M16/M20上传确认得2行，未知ERP列、图号、独立单位都保存。 / Filled material import. | [independent-business-checks.json](evidence/independent-business-checks.json) |
| T10 | PASS | 实际供应商模板导入2家，空供应商码回退往来单位编码，无假重复。 / Supplier import/fallback. | [10-two-suppliers-fallback-code.png](evidence/10-two-suppliers-fallback-code.png) |
| T11 | PASS | 供应商已有重复/文件内重复/缺必填/错误表头均明确拒绝，最终仍2家。 / Supplier validation. | [supplier-negative-supplier-duplicate-existing.png](evidence/supplier-negative-supplier-duplicate-existing.png) |
| T12 | PASS | 乙实际报价模板回填14/22，真实上传/预览/写入/确认2行。 / Supplier B quotes. | [12-B-two-prices-confirmed.png](evidence/12-B-two-prices-confirmed.png) |
| T13 | PASS | 甲实际模板L1=12.5正常、L2不供货空价，各ID/规格/备注正确。 / Supplier A mixed states. | [14-A-confirmed-normal-cannot.png](evidence/14-A-confirmed-normal-cannot.png) |
| T14 | PASS | 甲导入之后乙确认轮完整对象未变，未串供应商。 / Cross-vendor isolation. | [independent-business-checks.json](evidence/independent-business-checks.json) |
| T15 | PASS | 只填重复编码不填ID明确歧义且不能写入，未猜测M16/M20。 / Ambiguous code rejection. | [quote-negative-quote-code-only-ambiguous.png](evidence/quote-negative-quote-code-only-ambiguous.png) |
| T16 | PASS | 报价错误表头/损坏XLSX拒绝，实际写入记录为0。 / Invalid quote files. | [quote-negative-corrupt.png](evidence/quote-negative-corrupt.png) |
| T17 | PASS | 有表头CSV预览2/未匹配0；取消二次确认不改值，确认后两行正确。 / Header CSV and confirmation. | [06-csv-standard-header-preview.png](evidence/06-csv-standard-header-preview.png) |
| T18 | PASS | 无表头旧CSV仍匹配2/未匹配0，实际目标字段更新正确。 / Headerless compatibility. | [08-headerless-csv-applied.png](evidence/08-headerless-csv-applied.png) |
| T19 | PASS | 8种错误物料文件均拒绝/报错，未新增或改动2条业务物料；多业务Sheet不静默合并。 / Negative business-row protection. | [material-negative-results.json](evidence/material-negative-results.json) |
| T20 | FAIL | 缺必填单位文件只预览未确认，0业务行不变，但lineSeq0→1、保存revision1→2。P3-01。 / Invalid preview mutates saved metadata. | [invalid-preview-state-comparison.json](evidence/invalid-preview-state-comparison.json) |
| T21 | PASS | 三尺寸按钮可点、无document越界；Tab焦点可见、Enter真实下载，反馈可见；模板不含现有业务标记。 / Usability and privacy. | [layout-settings-1024.png](evidence/layout-settings-1024.png) |
| T22 | PASS | F1精简：单物料表UI回导再导出，当前第1列/来源第11列、表头唯一，ERP值留存且无供方/报价串入。 / Identity round-trip smoke. | [independent-business-checks.json](evidence/independent-business-checks.json) |
| T23 | PASS | F2精简：双向分配、报价预览/确认/比价及R2范围/沿用候选保留规格和RFQ ID。 / Specification identity smoke. | [17-F2-scope-specifications.png](evidence/17-F2-scope-specifications.png) |
| T24 | PASS | F3精简：模板导入的不供货在比价及F5后仍明确不供货/空价，非零元。 / Cannot-supply smoke. | [22-primary-refresh-persisted-prices-status.png](evidence/22-primary-refresh-persisted-prices-status.png) |

| ID | Result | 未测项目 / Capability | 原因 / Reason |
|---|---|---|---|
| N01 | NOT TESTED | Windows本机GUI / BAT / Computer Use | 按任务使用Linux Cloud，不操作用户Windows。 / Out of this cloud environment. |
| N02 | NOT TESTED | Windows原生Excel人工打开、重算/打印 | 本轮独立OOXML/CSV解析不等于原生Excel人工验收。 / No native Excel access. |

## P3-01：非法物料预览也产生保存版本 / Invalid preview creates saved revision

**类型 / Type:** 数据/保存副作用。**页面 / Page:** 物料与图纸→文件导入。**严重度 / Severity: P3。**

**最小实际复现 / Reproduce on tested SHA:**

1. 在全新隔离目录中新建空白正式询价，点击保存。目标RFQ为`RFQ-1792144021470-FB2S8V`，revision1、0物料、lineSeq0。
2. 上传[missing-unit.xlsx](fixtures/missing-unit.xlsx)：表头`存货编码,询价数量`，一行`BAD-NO-UNIT,1`，缺必填询价单位。
3. 预览明确显示“第2行询价单位不能为空”，确认加入按钮禁用。**不点击导入确认、不编辑任何业务数据。**
4. 等待约4.5秒。
5. 页面显示自动保存第2版；只读数据库前后核对：revision **1→2**、state.lineSeq **0→1**，物料/报价仍为0，其余业务状态不变。

**预期 / Expected:** 被拒文件在未确认导入时，不改变既有保存态/版本或分配正式行号序列。

**实际 / Actual:** 没有错误导入业务行，但预览阶段预留行号触发自动保存，造成虚假的“业务修改”版本及序列空洞。此项不等于“下载模板修改数据”——下载无修改已独立精确通过。

**采购员影响 / Impact:** 取消/失败的导入也会显示已保存新版本，干扰对保存历史与实际业务变动的理解。未观察到数据丢失、错误物料或报价金额变化，因此不是P0/P1/P2业务阻断。

**证据 / Evidence:** [前后精确字段对比](evidence/invalid-preview-state-comparison.json)、[预览后完整页面文本](evidence/19-invalid-preview-advances-save-version.txt)、[自动保存版本截图](evidence/20-invalid-preview-auto-save-status.png)、[原revision1快照](evidence/invalid-preview-rev1-original.json)、[原revision2快照](evidence/invalid-preview-rev2-original.json)、[真实操作trace](evidence/template-independent-uat-trace.zip)。截图19/20主要展示保存版号；单位错误行在同名完整页面文本及trace DOM中，不将离屏文字当截图可见内容。

**建议修复方向 / Suggested follow-up:** 让预览使用临时身份，待用户确认有效导入时再推进正式lineSeq；或确保失败/取消预览不进入持久化状态差异。只建议，不修改代码。本轮没有对旧SHA做同一输入的对照，**不能断言这是PR #18新引入**。

English: A rejected material file never adds business rows, but its preview reserves a line ID and triggers autosave. Keep preview identity outside committed state or allocate permanent IDs only on confirmed valid import. This is an observed P3 on the candidate, not proven to originate in this PR.

## 负例、日志与结论边界 / Negative tests and limits

- 物料8类：无关表头、缺必填单位、重复列标题、说明Sheet无业务列、两张候选业务Sheet歧义、损坏非ZIP、0字节、合法但空白工作簿；均未写入错误物料。T19验证业务数据保护，T20单独验证严格保存态无副作用，二者不同，不能用前者掩盖后者。
- 对多候选Sheet明确拒绝，未默默合并。正式下载模板自身始终单Sheet。F1回导也按既有规则先原样抽取单物料Sheet，不声称3Sheet业务报表可直接导回。
- 供应商重复已有编码、文件内重复、空编码/名称及错误表头全部拒绝，最终导出恰好2家。报价歧义/错误表头/损坏文件均0实际写入；有效模板则按选定供应商/轮次写入。
- 本轮主RFQ `RFQ-1792143383508-HZK8U2` 保留2物料、2供应商、乙R1两条正常报价、甲R1正常/不供货；为F2抽测另建甲R2空草稿并查看范围/沿用，不确认或自动带价。F5后仍使用正确已确认报价。
- 原始日志有**3次驱动错误**：名称“字段设置”在顶部和侧栏重复，改用真实侧栏定位；错误文件清空了报价预览后，不存在“写入”按钮，初次驱动等待超时；因此尚未确认甲R1时误试打开下一轮范围，被已有草稿保护拒绝/禁用。随后依照真实顺序完成报价确认，再完成F2抽测。有效步骤和结果完整留存，15个底层check均满足预期；它们不是本报告24个业务项统计。
- 没有通过调整产品代码、原测试或CI让断言变绿。临时步骤修正只为正确操控真实UI，执行原文和版本在日志及steps目录可审计。
- 本轮只精简抽测F1/F2/F3，不重跑旧完整UAT。旧F4/F5及原Windows/PDF原生像素/完整ERP字段语义等限制没有无依据改写，也不宣称Windows或完整系统通过。
- 原生PNG未编辑；同名txt为完整页面文本，含滚动外内容。Trace有动作/DOM/网络、无逐帧screencast，[真实Viewer载入验证](evidence/23-trace-viewer-validation.png)。仅上传本次临时虚构数据HTTP日志，未上传真实业务/用户目录或主机完整日志。

## 交付及建议 / Deliverables and recommendation

- [全部42张截图](EVIDENCE.md)
- [Playwright trace](evidence/template-independent-uat-trace.zip)、[完整动作/步骤源码/异常日志](evidence/browser-actions.jsonl)
- [13份实际模板检查](evidence/template-file-checks.json)、[业务独立校验](evidence/independent-business-checks.json)
- [下载不改数据](evidence/download-no-mutation-check.json)、[P3保存副作用](evidence/invalid-preview-state-comparison.json)
- [SHA256清单](SHA256SUMS.txt)、[独立工具说明](scripts/README.md)

**模板下载及实际回填导入链可用，23 PASS；严格非法预览无保存副作用1 FAIL/P3，整体PARTIAL。** 建议用户在明确跟踪该P3的前提下考虑纳入修复链，或先修复再定向复验以满足严格门槛。本任务止于报告；PR #18/#16/#15、开发基线及main不修改状态、不自行合并，等待用户下一步决策。
