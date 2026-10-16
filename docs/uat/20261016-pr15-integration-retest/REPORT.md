# PR #15 最终合并开发基线独立验收 / Merged-baseline independent integration UAT

**总体结论：PARTIAL。全套自动回归 83 PASS / 0 FAIL / 0 SKIP（Python43、Node2、Playwright38）；独立GUI业务矩阵 25 PASS / 1 FAIL / 3 NOT TESTED。**

发现1项 **P2 / INTEG-01**：正式询价的同范围报价CSV仍以演示RFQ编号命名，文件内也没有实际RFQ编号。报价计算与保存未受影响，但正式归档追溯存在风险。不得把自动38项通过写成独立业务全通过。

建议进入**受控 Windows 实机人工验证**，先记录该问题并使用当前询价号人工标识导出的同范围CSV；不建议将该CSV直接当作可追溯的正式归档凭证。正式发布前应由开发者处理后独立复验。未发现P0/P1数据损坏或阻断全部试用的缺陷。本报告不授权合并main。

## 任务、版本与合并审计 / Task, versions and merge audit

任务：[PR #15 最新 MERGE AUDIT + CODEX CLOUD INTEGRATION RETEST](https://github.com/yudacheng666/SRM_System/pull/15#issuecomment-6217141855)。本轮仅测试、记录问题、提交匿名证据；不修改产品、既有测试、CI、数据库结构，不合并。

|项目|实测/核验值|
|---|---|
|被测开发基线|`draft/20261013-m1-storage-ui-audit@420d2af326a3f59c1c6015d6b0fe44db23fe0fc6`|
|独立证据分支|`test/20261016-pr15-integration-retest`，直接从上述SHA新建|
|PR18合并|`8af8bd119e476bdb16a20bbe5fd629db3212cccc` → `54a9c476e21cb351e670c22512de9c774623f5df`|
|PR16合并|`54a9c476…` → `a8f44509228fde9cf609f2ca0ed3c9753cb5808c`|
|PR15合并|`a8f44509…` → `420d2af326a3f59c1c6015d6b0fe44db23fe0fc6`|
|main（前后不变）|`f330de510f97c552629052ff1841d7223194e7f8`|
|环境|Codex Cloud Linux Debian13，Python3.12.14、Nodev24.19.0、Playwright1.58.2、真实Chromium154.0.8037.57|
|时间|2026-10-16 23:32–23:43 Asia/Shanghai（原始UTC 15:32–15:43；证据归档与提交在之后）|
|GUI数据隔离|`/tmp/srm-integration-data`、`/tmp/srm-integration-restore-data`，全新目录；8920/8921真实HTTP服务|

Git父链与祖先关系均核验，PR15/16/18均closed+merged。最终合并tree与已测PR18候选相同，但**本轮仍在最终SHA重新执行所有套件与GUI**，没有引用旧PASS代替新执行。见[祖先/tree核对](evidence/merge-ancestry.json)、[最终PR状态](evidence/merge-final-pr-states.json)、[远端基线/main核对](evidence/final-remote-refs.txt)。

所有物料、供应商、ERP批次、报价、来源说明和PDF均虚构。独立GUI业务准备全部经页面上传、输入、点击；SQLite以`mode=ro`读取，openpyxl/ZIP/SQLite integrity仅检查证据。自动回归原有服务端负例包含API保护测试和隔离SQLite写入，均由既有测试在其自建临时目录执行；没有对用户已有目录或数据执行写入。

## 本轮实际执行的全套自动回归 / Fresh complete automated regression

|命令（仓库原样）|通过|失败|跳过|原始证据|
|---|---:|---:|---:|---|
|`python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'`|43|0|0|[Python原始日志](evidence/python-regression.log)|
|`npm test`|2|0|0|[Node原始日志](evidence/node-regression.log)|
|`SRM_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`|38|0|0|[Playwright原始日志](evidence/playwright-regression.log)、[JSON逐项结果](automated/test-results/results.json)|

以上对应仓库统一UI V2及S3/S4工作流的Linux完整命令，工作文件/测试/断言未改，无retry、无skip、无过滤spec。38项耗时11.1分钟、flaky0。服务各自生成临时目录并清理，没有指向本轮GUI或用户数据库。本轮执行于Codex Cloud，**不是声称新GitHub Actions通过**。此前候选CI不用于本轮计数。

完整自动化产物已归档：[test-results（38份trace、所有截图、下载与服务器日志）](automated/test-results/)、[HTML报告](automated/playwright-report/index.html)、[统计](AUTOMATED-SUMMARY.json)。HTML报告下载后可本地打开或使用Playwright show-report。所有trace ZIP完整性已检查。

## 独立GUI逐项结果 / Independent GUI matrix

|编号|场景 / Scenario|结果|实际验证及证据|
|---|---|---|---|
|G01|四类标准模板实际下载 / Download four templates|PASS|3个真实XLSX单Sheet、唯一表头且无业务数据；CSV BOM及匹配值,新值 · [证据](evidence/template-headers.json)|
|G02|非法导入预览零副作用 / Invalid preview|PASS|空单位明确错误、确认disabled；6.5s预览+清空均快照不变 · [证据](evidence/04-invalid-cancel.json)|
|G03|有效CSV预览取消 / CSV preview cancel|PASS|实际CSV上传，确认可用但不确认；预览及取消不改变保存态 · [证据](evidence/04-csv-cancel-cancel.json)|
|G04|有效XLSX预览取消 / XLSX preview cancel|PASS|真实下载模板回填；同码不同规格预览/取消无行号和关联副作用 · [证据](evidence/04-xlsx-cancel-cancel.json)|
|G05|ERP正式导入 / ERP import|PASS|三行M16/M20/M24独立ID；数量10/20/5，询价单位件、采购单位盒/箱不换算，原始扩展列保持 · [证据](evidence/05-materials-confirmed.json)|
|G06|匹配CSV回填 / Matched CSV update|PASS|ID唯一匹配2行，参考编码2改为UPDATED-16/20，第三行保持PRIVATE-24 · [证据](evidence/09-rich-before-preview.json)|
|G07|同码不同PDF身份 / Separate PDFs|PASS|M16/M20各关联不同SHA的真实虚构PDF，包内文件字节等于输入 · [证据](evidence/actual-export-inspection.json)|
|G08|供应商模板导入 / Supplier template|PASS|2家独立counterparty/supplier代码，实际下载模板回填导入成功 · [证据](evidence/06-assigned.json)|
|G09|双向追加/重复选择 / Additive bidirectional assignment|PASS|甲先2行，反向追加第三行；乙反向2行，重复甲选择保持共5关系 · [证据](evidence/06-assigned.json)|
|G10|非全覆盖独立发包 / Partial coverage export|PASS|仅2/3物料覆盖仍导出甲2行/乙1行；未分配支架不混入 · [证据](evidence/05-partial-coverage-bidirectional.txt)|
|G11|外发隔离与PDF范围 / Outbound isolation|PASS|4个实际ZIP按各自范围/PDF检查；报价列为空，其他供应商/内部ERP参考码不泄漏 · [证据](evidence/actual-export-inspection.json)|
|G12|R1实际模板报价状态 / R1 template import|PASS|正常、noquote、cannot正确保存并锁定；首次未知词被拒绝后另建修订正式录入 · [证据](evidence/07b-R1-confirmed-explicit.json)|
|G13|已确认版本及轮次历史 / Immutable history|PASS|乙R1V1保留，R1V2明确未报价；新建R2后全部R1逐字段不变 · [证据](evidence/08-R2-confirmed.json)|
|G14|R2单规格议价范围 / R2 single-line scope|PASS|甲仅RFQ-L00001/M16；乙范围M16/M20；规格和身份显示完整 · [证据](evidence/10-R2-A-single-spec-scope.png)|
|G15|明确沿用与来源 / Explicit carry forward|PASS|甲仅1候选，选择+依据+声明+对话框确认；保存原轮次1/原版本1/说明 · [证据](evidence/11-R2-A-carry-confirmed.txt)|
|G16|R2缺报确认及状态 / R2 missing quote|PASS|乙R2只报M16=9，M20覆盖缺报1；明确警告后锁定，不静默回填旧报价 · [证据](evidence/13-R2-B-missing-M20-confirmed.txt)|
|G17|自身范围与逐项最低 / Own-scope and minima|PASS|甲340、乙90，逐物料最低/已选330，只有2条可计价；不供货不按0 · [证据](evidence/14-R2-comparison.txt)|
|G18|共同范围金额与CSV数据 / Common scope calculation|PASS|甲乙交集仅M16，100/90；CSV行单价10/9、数量10、合计100/90一致 · [证据](downloads/common-scope.csv)|
|G19|同范围CSV询价追溯 / Common CSV RFQ identity|FAIL|INTEG-01/P2：文件名仍RFQ-DEMO-001，内容也无当前RFQ编号；重启后再次下载相同 · [证据](evidence/19-INTEG-01-common-export-formal-RFQ.png)|
|G20|内部Excel及原始ERP无损 / Internal ERP export|PASS|内部业务3 Sheet、表头唯一，扩展RAW-ERP-16/20/24及参考字段保留；内部比价XLSX真实可解析 · [证据](evidence/actual-export-inspection.json)|
|G21|新建、保存、切换询价 / RFQ isolation and switching|PASS|第二笔为空、lineSeq0，原询价state不变；GUI切回原项目后报价完整 · [证据](evidence/14-switched-back.json)|
|G22|F5及已有业务取消保护 / Refresh and cancellation|PASS|完整业务非法/有效冲突预览取消无变化；F5后全部状态/PDF保持 · [证据](evidence/12-refreshed.json)|
|G23|实际进程重启 / Actual server restart|PASS|关闭页面，终止并重新启动8920，同目录；两RFQ、所有快照SHA及PDF哈希完全一致 · [证据](evidence/16-after-real-restart.json)|
|G24|S4全量备份空目录恢复 / Clean full S4 restore|PASS|真实下载ZIP，PRAGMA integrity_check=ok；8921全新目录GUI恢复，全体指纹一致 · [证据](evidence/17-restored.json)|
|G25|非空恢复拒绝 / Reject overwrite|PASS|GUI再恢复明确提示拒绝；只读指纹证明原有数据未变化 · [证据](evidence/18-restore-refused.json)|
|G26|三尺寸、焦点与可操作性 / Three viewport sizes|PASS|1024×768、1366×768、1600×900，业务/设置截图及明细；document无横向溢出，Tab可见2px焦点；工具展开有体验建议OBS-01 · [证据](EVIDENCE.md)|
|NT01|Windows本机GUI / Computer Use / BAT启动|NOT TESTED|按任务不执行，仅建议用户下一阶段人工验证。|
|NT02|Windows原生Excel打开/重算/打印|NOT TESTED|云端真实XLSX/ZIP检查不等同于原生Excel验证。|
|NT03|真实采购员生产UAT与真实ERP完整字典|NOT TESTED|仅虚构业务；未获得真实220字段定义及真实业务使用。|

## INTEG-01 — P2 同范围CSV缺少真实询价标识 / Common-scope CSV lacks RFQ identity

- **类型：业务单据追溯/导出错误**；页面：④比价议价 → 勾选甲乙 → 报价金额分析 →「导出本比较组全部共同项目 CSV」。
- 实测项目：`RFQ-1792164809694-HAWAB4`。M16数量10、甲沿用价10、乙R2价9，共同金额100/90。
- **复现：** 新建保存正式RFQ并完成两供应商报价；选中比较组；点击上述导出按钮，记录浏览器download事件实际文件名。关闭页面、重启真实服务、重新打开同一RFQ，再次导出。
- **预期：** 导出文件名及可独立归档的内容带真实RFQ编号；不能固定使用演示标识。
- **实际：** 两次浏览器下载名均为`RFQ-DEMO-001_指定供应商组同范围报价.csv`，CSV只有行级ID和金额，**没有RFQ编号列/元数据**。两次内容字节相同，数值本身正确。RFQ Line ID在不同询价均可从00001开始，不能替代项目编号。
- **影响：** 多项目CSV离开应用后难以证明来源，且文件名误称演示项目；人工重命名之前不宜作为正式采购归档依据。没有发现由此覆盖SQLite或更改价格。
- **证据：** [浏览器原始事件和失败断言](evidence/browser-actions.jsonl)（检索`INTEG-01`和`common-scope.csv`）、[界面截图](evidence/19-INTEG-01-common-export-formal-RFQ.png)、[首次实际文件](downloads/common-scope.csv)、[重启后再次导出](downloads/common-scope-second.csv)、[相同字节检查](evidence/backup-and-csv-inspection.json)。完整trace中可回放两次点击及实际响应。
- **建议修复方向：** 开发者统一使用当前正式workspaceId构建文件名，并在CSV提供RFQ编号/比较组信息及必要来源；保留正确的100/90金额。加入多RFQ真实下载回归。**本轮没有修改或修复。**

## P3 体验建议 / Nonblocking usability observations

**OBS-01：展开的项目/供应商/备份/图纸工具会保留并挤占业务首屏。** 从供应商导入、图纸关联或导出返回报价/物料页时，1366/1024首屏可全被工具占据。见[展开状态1366](evidence/layout-1366x768-materials.png)、[展开图纸1024](evidence/business-layout-1024x768-materials.png)。采购员可手工收起后正常工作，[1024收起状态](evidence/22-collapsed-material-firstscreen-1024x768.png)三条物料可见，首行y513；1366/1600首行y583。建议提供明显的“回到业务/收起工具”动作或切页提示；本轮按可手工收起且无阻断操作列为G26 PASS附建议，不当成隐藏的全局布局通过。

**OBS-02：报价模板缺少状态示例，业务用词易误填。** 本轮初填“明确未报价”被正确拒绝为无法识别，使用“未报价”后保存`noquote`成功；界面业务概念为明确未报价。建议下载处给出接受值示例（正常报价/未报价/不供货）或统一可用词。原拒绝记录和部分提交均保留；之后通过GUI创建乙R1V2更正，未修改已确认V1，不把首次拒绝写成成功。

## 保存、恢复和内外发隔离的实证 / Persistence, restore and confidentiality

- 空白正式RFQ保存后revision1/lineSeq0/createdSeq0；模板下载、非法预览、CSV/XLSX取消在6.5秒空闲及4.2秒取消等待后均原文SHA不变。
- 正式3行导入后各ID为00001/00002/00003，ERP扩展保留，采购单位盒/箱没有自动转换询价件数。匹配CSV只修改目标参考字段。
- 丰富业务基线revision15/lineSeq3/createdSeq3，3物料、2供应商、5关系、5个已确认轮次/修订提交、2份不同PDF。再次非法/有效冲突预览取消，**完整snapshot_json和PDF哈希不变**；UI手动保存后revision16为最终保存基线。
- 新建第二笔空RFQ后，原revision16快照保持；GUI切回原工作，实际关闭浏览器页、终止并重新启动8920进程，同目录读取两笔RFQ完整指纹。`15-before-restart`、`16-after-real-restart`、`17-restored`、`18-restore-refused`、`19-final`全相等。
- 主RFQ最终snapshot SHA：`26fabf4252edae4134ca0c844e96347329a8c9dc59cbdcdfb893972361415815`；第二RFQ SHA：`5d597cf81e7347a0613a90cba81896d539e866b408537b30bf9ee5f5b9e23a00`。这里是数据库保存的**snapshot_json原文UTF-8 SHA256**，不是SQLite物理文件SHA。
- [S4 ZIP](downloads/s4-full.zip)实际下载、SQLite `integrity_check=ok`；空目录恢复全量状态/PDF一致，第二次恢复拒绝且指纹不变。见[状态摘要](STATE-COMPARISON.json)和[ZIP检查](evidence/backup-and-csv-inspection.json)。
- 部分覆盖的乙包只含M20及其D20 PDF；甲包含M16/M20及两PDF。最终乙仍只有其两行，甲含三行但第三行缺图先明确提示并确认。四包报价单价空白，均不含对方供应商、内部参考码或RAW-ERP字段；PDF字节哈希等于各自输入。内部业务Excel则保留全部ERP值。见[实际Excel/ZIP逐字段检查](evidence/actual-export-inspection.json)。
- 同范围CSV错误不影响正常漏报CSV：后者实际文件名含当前RFQ、供应商及R2，内容带RFQ编号；[对照文件](downloads/missing-quote.csv)。

## 完整证据、复现与边界 / Evidence, reproduction and limitations

- [截图索引](EVIDENCE.md)：70张独立证据（69业务/布局、1实际Trace Viewer验证），另有自动化全量截图。
- [独立trace](evidence/independent-integration-trace.zip)、[实际Viewer载入截图](evidence/23-trace-viewer-validation.png)、[浏览器完整事件/步骤源码/断言](evidence/browser-actions.jsonl)。
- [原始模板与实际导出](downloads/)、[虚构输入](fixtures/)、[独立驱动/只读检查工具](tools/)、[命令和真实重启说明](REPRODUCTION.md)、[SHA256清单](SHA256SUMS.txt)。
- 独立驱动26项底层check为25满足/1产品标识失败，driver-error与pageerror均0；2条console为两个origin favicon404，未隐藏异常。自动套件控制台的NO_COLOR警告和npm更新提示不代表测试失败。
- 三尺寸图像经实际查看；表格在窄屏使用内部水平滚动，未把所有列都在首屏当作要求。展开/收起状态均原样保存，不能只用document宽度无溢出认定界面体验完美。
- 未修改既有测试或修复发现的问题，未触发Windows Computer Use。所有测试服务和浏览器已停止。main和开发基线的远端SHA保持原值；证据PR仅供审阅，不自动合并。

## English summary

**PARTIAL on exact merged development SHA `420d2af326a3f59c1c6015d6b0fe44db23fe0fc6`.** Fresh full Linux regression: **43 Python + 2 Node + 38 real Chromium tests PASS**, no failures/skips/flakes. Independent GUI matrix: **25 PASS / 1 FAIL / 3 NOT TESTED**.

The merge ancestry and unchanged main were verified. A new synthetic RFQ exercised downloaded templates, ERP metadata, same-code M16/M20 identities with different real PDFs, bidirectional additive supplier allocation, partial-coverage packages, normal/noquote/cannot statuses, immutable revisions, R1/R2 scopes and explicitly evidenced carry-forward. Calculations matched A340/B90, common A100/B90 and minimum330. Saved snapshots and PDF hashes survived cancellations, RFQ switching, refresh, a real process restart and clean S4 restore; nonempty restore was refused. Supplier-facing workbooks contained blank prices and no private ERP/other-supplier data. Three screen sizes and keyboard focus were inspected.

**INTEG-01 / P2:** common-scope CSV downloads use `RFQ-DEMO-001` in the filename and omit the actual RFQ ID in their content. Reproduced twice across a server restart; numerical data is correct. Expanded tools and missing status examples are additional P3 usability recommendations. No product fixes were made.

Recommend controlled Windows manual validation with this traceability issue tracked and exported CSVs manually identified; do not treat the current CSV as a self-contained formal archive or this report as authorization for main. Windows GUI/native Excel/real production buyer trials remain untested. All 38 automated traces, full results/logs/screenshots and independent evidence are archived. Only new reports/evidence/tools were committed; no product, test, CI or schema changes, and no merges.
