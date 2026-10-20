# PR #20 INTEG-01 独立定向复验 / Independent retest

**INTEG-01 CSV主问题：PASS。整体交付：PARTIAL，当前不建议直接合并。**

- 候选独立业务矩阵：**17 PASS / 1 FAIL（BASE-01，旧版亦存在）/ 4 NOT TESTED**。
- 旧版原问题本轮重新复现：**CONTROL FAIL（预期重现）**，不计入修复版CSV失败。
- **GitHub Actions：两个工作流均completed/failure**。各Linux完整浏览器38 PASS / 新增14号1 FAIL；Windows后端安全检查success。不可将本轮独立业务PASS写成CI已通过。

建议开发者先处理/核查CI红灯，并另行跟踪BASE-01；CI转绿并完成必要复核后由用户决定是否合入开发基线。没有修改产品、既有测试或CI，没有自行合并。

## 任务与准确版本 / Task and locked versions

任务：[PR20最新独立任务](https://github.com/yudacheng666/SRM_System/pull/20#issuecomment-6219512595)。只测试；全为虚构物料、供应商、来源、价格、ERP属性和图纸输入，不访问用户现有业务数据。

|项目|值|
|---|---|
|旧版 / Original|`420d2af326a3f59c1c6015d6b0fe44db23fe0fc6`|
|候选 / Candidate|**`dec5e480cf87441972da05f1074dfa3589285b30`**，执行前/结束复核一致|
|PR20|Draft，未合并；`fix/20261016-common-scope-csv-rfq-id` → `draft/20261013-m1-storage-ui-audit`|
|开发基线 / Development|`420d2af326a3f59c1c6015d6b0fe44db23fe0fc6`，未变|
|main|`f330de510f97c552629052ff1841d7223194e7f8`，未变|
|证据分支|`test/20261016-pr20-integ01-retest`，从候选新建；证据PR面向候选分支，只新增本目录|
|环境|Codex Cloud Linux，Chromium154.0.8037.57、Playwright1.58.2；Python/Node版本见environment.json|
|服务|真实M1-Lite `tests/e2e/serve.py` → server.main / SQLite；旧8940、新8941；独立新目录`/tmp/srm-pr20-old-data`、`/tmp/srm-pr20-data`|
|操作时间|2026-10-17 00:11–00:28 Asia/Shanghai（原始UTC 2026-10-16 16:11–16:28）|

主复验只经真实Chromium页面创建RFQ、上传、双向分配、报价确认、切换和下载；SQLite只用`mode=ro`读取，CSV用Python标准csv/UTF-8解码，XLSX用openpyxl只读检查。不通过API/JS/数据库写入替代采购业务操作。DOM脚本仅读取/等待/滚动，没有修改应用函数。没有重跑或修改仓库既有自动用例来替代独立走查。

[初始版本](evidence/version-initial.json)、[结束版本及CI](evidence/version-and-ci-final.json)、[远端refs](evidence/final-remote-refs.txt)、[候选原始变更范围](evidence/candidate-change-scope.txt)。

## GitHub Actions先行核查 / CI checked first

|工作流|最终结果|Linux浏览器|Windows后端/安全|
|---|---|---|---|
|[S3/S4 38928752765](https://github.com/yudacheng666/SRM_System/actions/runs/38928752765)|**failure**|38 passed，新增14号超时失败|success|
|[UI V2 38928752772](https://github.com/yudacheng666/SRM_System/actions/runs/38928752772)|**failure**|38 passed，新增14号超时失败|success|

独立读取job/step及失败日志，两个失败都在`acceptance.spec.cjs:477`的`#commonScopePicker input:not(:checked)`动态定位集合勾选，90秒超时，尚未执行CSV身份/金额断言。日志显示locator随选中状态从SUP-A重解析为SUP-B，疑似集合变化导致定位不稳定；本轮用稳定供应商UI标识逐家勾选可完成产品导出，**不据此把CI失败改记PASS**。应由开发者核查并修复/运行CI，Codex没有修改测试或重试Actions。

[完整状态/步骤](evidence/ci-status.json)、[S3失败原始日志片段](evidence/ci-failure-117066985218.txt)、[UI失败原始日志片段](evidence/ci-failure-117066984529.txt)。完整CI日志/附件见上述Actions链接；这些是开发者CI，本轮独立验收另列。

## 原版重现与同输入修复对照 / Original reproduction and identical-input comparison

本轮旧版真实流程：新建/保存正式RFQ → 上传同码M16/M20及支架 → 物料视角分配甲/供应商视角分配乙 → 两家实际XLSX报价回收 → 来源说明与R1确认 → 比价选比较组 → 实际下载。

- 旧版实际项目`RFQ-1792167327031-WUS2BS`，浏览器文件名仍`RFQ-DEMO-001_指定供应商组同范围报价.csv`，文件无该真实RFQ编号。两条共同报价ID为00001/00002，甲340、乙370。**本轮重新复现，并非仅引用PR19。**
- 候选P1使用**相同输入文件和相同业务数值**，实际项目`RFQ-1792167523958-FXPI8N`。文件名为该真实编号+后缀；第一列表头`RFQ编号`，所有明细和合计行都为该编号。删除新增的RFQ编号列后，候选P1R1文件的其余**完整表头/文本/单价/行额/总额**与本轮旧文件逐格相等。
- [旧版截图](evidence/old-original-actual-export.png)、[候选首次截图](evidence/new-P1-R1-actual-export.png)、[原文件](downloads/old-original.csv)、[候选文件](downloads/new-P1-R1.csv)、[所有逐行解析](evidence/independent-csv-parsed.json)。

## 候选逐项矩阵 / Candidate matrix

|编号|场景 / Scenario|结果|实际验证与证据|
|---|---|---|---|
|T01|正式CSV文件名 / Formal filename|PASS|P1、P2及切回/重启后的实际文件名均为当前workspaceId+固定后缀 · [证据](DOWNLOADS.md)|
|T02|UTF-8 BOM及表头布局 / BOM and headers|PASS|10列唯一表头，第一列RFQ编号；原Line ID列保留，所有行宽一致 · [证据](evidence/independent-csv-parsed.json)|
|T03|明细/合计身份 / Detail and total identity|PASS|每条明细与最后合计行均当前RFQ；明细ID00001/00002不变 · [证据](evidence/independent-csv-parsed.json)|
|T04|旧新版金额对照 / Original-versus-fixed amounts|PASS|新P1R1删除新增身份列后与旧文件全部表头/文本/金额完全相等，340/370 · [证据](evidence/independent-csv-parsed.json)|
|T05|跨RFQ行号重叠隔离 / Overlapping line IDs|PASS|两项目都有RFQ-L00001/00002，但身份列及文件名各自独立，无另一项目ID混入 · [证据](evidence/new-P2-first-actual-export.png)|
|T06|正式项目切回再导出 / Switch and re-export|PASS|P2→P1切回金额100/90，项目号回到P1，未沿用P2号 · [证据](evidence/new-P1-switched-back-actual-export.png)|
|T07|两项目F5 / Refresh both RFQs|PASS|两项目分别刷新，真实下载身份/数据保持；P2重启后再F5也通过 · [证据](DOWNLOADS.md)|
|T08|实际进程重启后两项目 / Actual process restart|PASS|关闭页面、终止/重启8941同目录，再分别切换导出两项目及切回P1 · [证据](evidence/new-P1-restart-return-actual-export.png)|
|T09|导出无保存副作用 / Export is readonly|PASS|10次候选正式导出逐次比较完整保存态；revision/lineSeq/createdSeq/items/assignments/quotes/SHA均不变 · [证据](STATE-COMPARISON.json)|
|T10|R1/R2确认历史与来源 / Confirmed history and provenance|PASS|所有R1记录在R2后逐字段不变；甲明确沿用保存原轮次/版本/供应商确认依据 · [证据](evidence/history-and-source-check.json)|
|T11|同码规格、未报价/不供货/缺报 / Specifications and missing statuses|PASS|M16/M20独立行身份；支架A不供货、B明确未报价，B R2 M20缺报，未当零元 · [证据](evidence/14-R2-comparison.txt)|
|T12|共同范围价格/行额/总额 / Shared-scope arithmetic|PASS|P1R1 340/370，R2共同M16 100/90；P2 53/54，逐行qty×price与汇总一致 · [证据](evidence/independent-csv-parsed.json)|
|T13|原漏报CSV追溯 / Existing missing-quote CSV|PASS|实际名称含P1/RET-B/R2；内容RFQ编号、RFQ-L00002及轮次2正确 · [证据](evidence/related-exports-inspection.json)|
|T14|内部Excel保留ERP / Internal workbook|PASS|原始ERP/参考字段保留，3 Sheet可解析，无重复物料表头 · [证据](evidence/related-exports-inspection.json)|
|T15|供应商外发隔离 / Supplier confidentiality|PASS|两份实际询价XLSX价格空白，不含另一供应商、内部参考码/原始ERP/确认来源；无公式单元格 · [证据](evidence/related-exports-inspection.json)|
|T16|演示下载身份 / Demo identity|PASS|GUI选SUP001/003有共同报价后下载，名称/所有行明确RFQ-DEMO-001；不创建正式数据库记录 · [证据](evidence/new-demo-labelled-export.png)|
|T17|CSV文本安全与中文 / CSV escaping and Unicode|PASS|实际=、+、-起始物料文本/@起始供方表头加单引号，逗号/双引号/嵌入换行完整解析，无乱码 · [证据](evidence/independent-csv-parsed.json)|
|T18|跨RFQ新建页面异常 / New-RFQ page exception|FAIL|BASE-01/P2：供应商视角选中RET-B后新建空白工作，旧/新均undefined.name及残留旧标题，见下文 · [证据](evidence/cross-project-error-probe.json)|
|NT01|无法确定当前workspace身份的异常分支|NOT TESTED|真实GUI没有可安全移除当前工作区身份的入口；未用JS猴子补丁/伪造状态触发，不以代码中的保护判断冒充GUI验证。|
|NT02|Windows GUI / Computer Use / BAT|NOT TESTED|本轮仅云端Linux；Windows后端Actions通过不等于人工GUI。|
|NT03|Windows原生Excel打开/重算/打印|NOT TESTED|CSV解析/安全前缀/XLSX结构检查不等于原生Excel人工操作。|
|NT04|真实采购员生产使用|NOT TESTED|全为虚构数据和模拟采购员流程。|

## 跨项目、真实重启、金额和保存态 / Cross-RFQ, restart and persistence

- P1：`RFQ-1792167523958-FXPI8N`，3行，lineSeq3/createdSeq3。P2：`RFQ-1792167713120-0B86XJ`，2行，lineSeq2/createdSeq2。两者都含RFQ-L00001/00002。
- P1 R1：数量10/20，甲价10/12、乙11/13，金额340/370。支架甲不供货、乙明确未报价，均不进入共同有效报价。
- P1 R2：甲仅M16范围并凭明确依据沿用R1=10；乙范围M16/M20，只回M16=9，缺报M20=1，采购员确认警告后锁定。共同范围只有M16，100/90；自身范围甲340/乙90，逐项最低330。全部R1提交、原始来源说明和carry原轮/原版本保持。
- P2：数量3/4，甲7/8、乙6/9，行额21/32与18/36，总额53/54。没有P1身份或价格混入。
- 每次实际下载前先等自动保存完成（4.4秒），只读完整SQLite快照作为before，再下载/等待4.2秒/只读after。**10次候选正式导出均完整相等**，无revision、序列、物料、关联或报价变化。
- P2首次/F5 → 切回P1/F5 → 关闭页面 → 真正终止8941 Python进程 → 相同候选worktree与SRM_DATA_DIR重启 → P1导出 → 切P2导出/F5 → 再切P1导出。四个重启后文件身份及金额均正确。不是把F5说成进程重启。
- 主复验最终：P1 revision8，snapshot SHA`21a2eaf4b4c3cb392457264a49fbd8518597b614aacbf6a271cf2951bd467ace`；P2 revision6，SHA`caf49b2917cdf3c24539bb5f6bb6d609ad0a1cc289e21a6dd9b70feb520cc1db`。`before-real-restart`、`after-real-restart`、`final-saved-state`完全相等。SHA为数据库保存的完整snapshot_json原文UTF-8 SHA，不是SQLite物理文件SHA。
- 实际共下载12份共同范围CSV：旧1、演示1、候选正式10。所有正式明细/合计行、列数/表头唯一性、金额乘积/合计、跨项目不混入及BOM均由独立Python csv解析。[下载索引](DOWNLOADS.md)、[逐次状态](STATE-COMPARISON.json)。

## BASE-01 / P2 — 供应商视角新建RFQ异常（原版已有）

**类型：跨页面/跨项目操作体验与页面渲染异常；不是本轮CSV修复新引入的回归。**

1. 打开已有正式RFQ，进入②供应商与分配，切「按供应商」，选择RET-B。
2. 打开项目操作，点「新建另一笔空白询价」并确认。
3. 预期新空白RFQ清除上一项目供应商上下文，页面无异常。
4. **实际：** 新RFQ已建立/自动保存，但`renderSfItems`抛出`Cannot read properties of undefined (reading 'name')`，新RFQ供应商列表为空，右侧仍残留旧的“虚构复验乙：选择物料”标题。

本轮主流程捕获2条pageerror（新建时、随后导入渲染时）。之后追加**独立相同步骤探针**，旧版420d2af和候选dec5e48各重新复现1条，堆栈均指向`renderSfItems → renderAssignAll → resetUI → applyWorkspace → beginBuyer`。旧/新版renderSfItems代码不属于CSV修复差异。

[两版异常及堆栈](evidence/cross-project-error-probe.json)、[旧版截图](evidence/old-cross-probe-error.png)、[候选截图](evidence/new-cross-probe-error.png)、[独立探针trace](evidence/cross-project-error-probe-trace.zip)。刷新后旧标题消失。只读before/after证实**所有已有RFQ记录保持原值**；探针会按真实新建操作多保存一个空白RFQ，单独留档，不与“导出无修改”结果混算。主CSV验收前后两项目完全相同的结论来自探针之前的独立快照。

建议开发者单独修复新建/切换工作时的供应商选择上下文清理及空对象渲染保护，补齐真实供应商视角跨RFQ回归。没有自行修复或删除探针数据。未观察到原有报价/关联丢失，但页面上下文错误需跟踪。

## 文本安全、相关导出和测试边界 / Text safety, related exports and limits

- 真正CSV文本包含`+RET-AXLE`、`-P2-CODE`、`=1+1,虚构"轴"\n第二行`和`@虚构复验甲`表头；实际导出按原规则加单引号防公式解释，逗号/双引号/嵌入换行通过标准csv解析，中文没有替换字符。未在Windows原生Excel执行公式。
- 演示初选SUP001/002无交集，UI明确“共同有效报价0项，不显示¥0”，没有下载按钮；换为真实GUI选择SUP001/003后成功下载，文件名及全部身份列均为RFQ-DEMO-001，SQLite正式记录仍为空。
- 两份供应商实际外发XLSX报价列空白，无另一供应商、内部ERP原始列/参考码/来源信息。内部3 Sheet保留原始ERP。漏报CSV仍包含P1、RET-B、R2和RFQ-L00002身份。[独立XLSX/漏报检查](evidence/related-exports-inspection.json)。
- 尝试在已确认报价行设置图纸版本时控件为disabled，未绕过保护或上传。**本轮没有重新验收PDF上传/备份恢复全套**，不把以前的PASS搬来；准备的虚构PDF未作为成功上传证据。

原始记录保留**6次独立驱动中止/修正**：①openpyxl初次把=开头文本生成了真正公式单元格，应用正确拒绝，随后输入文件明确改为文本类型；②录入区已展开时错误再次切换致隐藏确认；③演示零共同范围时错误等待下载；④已确认行的图纸控件正确禁用而驱动误填；⑤复用驱动保存函数漏传page参数；⑥项目切换保留供应商视角，驱动误找物料视角checkbox。均补以正确GUI顺序继续，未修改产品或既有测试，所有正式CSV结论来自最终完成的操作和独立解析。首次公式文件、所有原始步骤与错误均归档，没有抹去未完成尝试。旧版准备阶段留下额外空白RFQ，属隔离测试数据，未用于CSV对照。

主trace原始底层check18个均满足预期；这不包括以事件记录的BASE-01页面异常，故业务矩阵仍有1 FAIL。2条console为两origin favicon404；没有应用HTTP/网络失败。BASE-01事件在主trace2条、独立两版探针各1条，均单列报告。

## 证据与停止点 / Evidence and stopping point

- [24张原生截图索引](EVIDENCE.md)、[独立主trace](evidence/pr20-independent-retest-trace.zip)、[实际Viewer载入截图](evidence/trace-viewer-validation.png)、[完整主操作/对话框/步骤源码/错误](evidence/browser-actions.jsonl)。
- [所有实际下载及名称](DOWNLOADS.md)、[所有CSV逐行解析](evidence/independent-csv-parsed.json)、[保存态汇总](STATE-COMPARISON.json)、[复现说明](REPRODUCTION.md)、[SHA256清单](SHA256SUMS.txt)。
- 只新增脱敏报告、证据和独立测试驱动存档；不改产品、既有业务测试/CI或数据库结构。没有合并PR20/证据PR/开发基线/main；服务及浏览器已停止。最终用户另行决定，不自动推进。

## English summary

**INTEG-01 functional retest PASS on exact candidate `dec5e480cf87441972da05f1074dfa3589285b30`; overall PARTIAL — do not merge yet.** Both required Actions remain failed: each Linux run has38 passing cases and the new14th case timing out during dynamic checkbox selection; Windows backend safety succeeds. Independent UI results are separate: **17 PASS / 1 pre-existing cross-RFQ FAIL / 4 NOT TESTED**.

The old420d2af defect was freshly reproduced. On the candidate, two real synthetic RFQs with overlapping RFQ-L00001/00002 identities export actual workspace IDs in filenames, every detail and total row. Ten formal downloads across switching, refresh and a real service restart preserve saved revisions/counters/full snapshots. Independent CSV parsing verifies UTF-8 BOM, unique aligned headers, current/source identities, unchanged old-versus-new R1 totals340/370, R2 common100/90 and second-RFQ53/54, quoting/newlines/Unicode and formula-safe text. Confirmed R1 history, R2 scope/carry provenance, missing/noquote/cannot statuses, existing missing-quote CSV and internal-versus-vendor workbook isolation remain correct.

**BASE-01/P2:** selecting a supplier in supplier-first view and creating a new RFQ raises undefined.name and leaves the previous supplier title. Fresh probes reproduce it on both original and candidate; existing saved business records remain unchanged. This is not attributed to the CSV patch. CI red and this existing issue are reported without fixes. Unknown-workspace identity fault injection, Windows GUI, native Excel and production-buyer use remain untested. Raw driver corrections are disclosed. Evidence only, no product/test/CI changes or merges; recommend developer CI resolution and user review before merging.
