# PR #18 P3-01 独立云端定向复验 / Independent Cloud Retest

**结论：P3-01 PASS。候选业务矩阵：24 PASS / 0 FAIL / 3 NOT TESTED。旧版对照另记1个 FAIL（成功重新重现原缺陷，不计入候选失败数）。**

任务：[最新 P3-01 评论](https://github.com/yudacheng666/SRM_System/pull/18#issuecomment-6213219286)。本轮重新运行真实业务UI，不运行仓库现有自动套件或ERP11来代替验收。新建独立测试分支 `test/20261016-pr18-p301-retest`，仅新增本目录报告、证据和独立驱动；不改产品、既有测试、CI、数据库结构，不合并或改变任何PR状态/基线。

## 版本、环境与隔离 / Versions and isolation

|项目|精确值|
|---|---|
|旧版 / Original|`5424e57cf6648cef4382bd715f00993b1b5f4165`|
|本轮候选 / Candidate|`8af8bd119e476bdb16a20bbe5fd629db3212cccc`|
|PR #18 head|`feat/20261016-settings-import-templates`|
|PR #18 base|`fix/20261016-pr15-uat-f1-f3` · `9406973f0e99bd33f9f4140c89b9df5d7c58d443`|
|开发基线 / Development|`8baac18195da9829333dd65433edaa2ba89cb623`|
|main|`f330de510f97c552629052ff1841d7223194e7f8`|
|浏览器 / Browser|真实 Chromium `154.0.8037.57`，Playwright `1.58.2`，Linux Debian 13，1366×768|
|操作时间 / Session|2026-10-16 19:24–19:38 Asia/Shanghai（原始日志使用UTC 11:24–11:38）|
|真实服务 / Servers|仓库 `prototype/m1-lite/tests/e2e/serve.py` 启动 M1-Lite HTTP应用；旧8901、新8902、恢复8903、F1辅助8904|
|隔离目录 / Fresh data|`/tmp/srm-p301-old-data`、`/tmp/srm-p301-data`、`/tmp/srm-p301-restore-data`、`/tmp/srm-p301-aux-data`；均本轮新建|

全部物料、供应商、ERP批次、报价、条款及PDF为虚构；未读取或覆盖用户业务数据。业务写入全部通过 Chromium 页面上传/填表/点击进行。SQLite仅以 `mode=ro` 独立读取；openpyxl仅制作脱敏输入、检查真实下载；未用API、页面JS或直接数据库写入替代操作。页面JS仅用于读取DOM/等待UI状态。

验收前及发布前核对PR HEAD均为上述候选；仍为 Draft、未合并，base未变。见[版本核对](evidence/github-version-lock.json)。

## 原缺陷实测对照 / Old-versus-new evidence

同一字节文件 [invalid-empty-unit.xlsx](fixtures/invalid-empty-unit.xlsx)：单Sheet，表头`存货编码/存货名称/询价数量/询价单位`，一行`BAD-P301 / 虚构非法预览 / 1 / 空单位`。新建正式空白RFQ并UI保存→添加物料→上传→清晰错误且确认禁用→**不确认**，等待6.5秒→只读SQLite核对→F5。修复版另做清空、真正服务重启。

|保存态 / Persisted field|旧空白|旧非法预览后及F5|新空白|新非法预览/清空/F5/重启|
|---|---:|---:|---:|---:|
|revision|1|**2**|1|**1**|
|lineSeq|0|**1**|0|**0**|
|createdSeq|0|0|0|0|
|items|0|0|0|0|
|assignments|[]|[]|[]|[]|
|完整 snapshot_json SHA|A|**B（变化）**|C|**C（不变）**|

- A：`6ff6370055ef4a210b2867956e2c37e0eb01fc76416ff69baf449c7032cf5889`
- B：`9514946f7a0a53027eec4c4f42f61dd6b644287f60da4f675e14a05597c62539`
- C：`78f25ca6cb8f0fa7d330fae0a6925f7e70b7bc8c95a3dc8ea6f33161c87798ca`

旧版业务验收 **FAIL / P3 数据与保存元数据副作用**：没有正式导入却耗用行号并保存新版本；与原问题一致，本轮实测而非引用旧报告。新候选 **PASS**。截图：[旧版可见错误与禁用确认](evidence/25-old-error-visible-disabled-confirmation.png)、[新候选同输入](evidence/26-new-error-visible-disabled-confirmation.png)、[空白实际重启](evidence/07-empty-after-real-restart.png)。旧版25号截图为同输入的第二次复现，版本继续增加；首次1→2的精确指纹在[old-01](evidence/old-01-empty.json)/[old-02](evidence/old-02-invalid.json)/[old-03 F5](evidence/old-03-refreshed.json)，未被第二次操作覆盖。

快照SHA针对数据库真实保存的完整 `snapshot_json` 原文UTF-8计算，**不是SQLite文件二进制SHA**；同时完整比较state、关联及PDF字节哈希。每次读取保留原始JSON与摘要；汇总见 [STATE-COMPARISON.json](STATE-COMPARISON.json)。

## 候选逐项矩阵 / Candidate matrix

|编号|场景 / Scenario|结果|实际验证及证据 / Observed evidence|
|---|---|---|---|
|N01|非法 XLSX 错误预览 / Invalid XLSX preview|PASS|空单位错误明确、确认 disabled，等待6.5s；版本/序列/物料/关联/SHA全不变 · [证据](evidence/new-02-invalid.json)|
|N02|非法预览清空 / Clear invalid preview|PASS|清空并等待4.2s，全保存态不变 · [证据](evidence/new-03-cancel.json)|
|N03|空白询价 F5 / Empty RFQ refresh|PASS|仍为空白，revision1/lineSeq0/createdSeq0 · [证据](evidence/new-04-refreshed.json)|
|N04|空白询价实际服务重启 / Real empty-state restart|PASS|关闭页面、终止并重启8902服务，相同SQLite目录；快照完全一致 · [证据](evidence/new-11-after-empty-restart.json)|
|N05|有效 CSV 预览取消 / Valid CSV cancel|PASS|真实CSV，确认可用，预览/清空后均不保存、不占号 · [证据](evidence/new-06-csv-cancel.json)|
|N06|有效 XLSX 预览取消 / Valid XLSX cancel|PASS|本轮实际下载模板回填2+3，预览/清空后均不保存、不占号 · [证据](evidence/new-06-xlsx-cancel.json)|
|N07|粘贴预览取消 / Pasted preview cancel|PASS|TSV真实输入，仅解析；清空后进入手动录入仍为原始快照 · [证据](evidence/new-07-paste-preview.json)|
|N08|手动单条预览取消 / Manual preview cancel|PASS|填入代码/名称/M14/4件，加入预览后再清空，完整快照不变 · [证据](evidence/new-08-manual-cancel.json)|
|N09|重复预览、筛选、翻页、仅看错误 / Repeated previews and filters|PASS|86行XLSX，两轮下一页/仅错误/全部/搜索清空；不占号、不产生关联 · [证据](evidence/new-09-repeat-1.json)|
|N10|正式合并确认 / Confirm merged demand|PASS|两来源2+3；预览自动合并1；确认后1行qty5、sources2，lineSeq2/createdSeq1 · [证据](evidence/new-13-merge-confirmed.json)|
|N11|取消规格冲突确认 / Dismiss conflict confirmation|PASS|同码M16/M20点确认后dismiss冲突对话框，保存态和SHA与合并后完全一致 · [证据](evidence/new-14-conflict-dismissed.json)|
|N12|接受规格冲突拆行 / Accept separate specifications|PASS|M16/M20保留独立身份；总3行，RFQ-L00001/00003/00004唯一 · [证据](evidence/new-15-split-confirmed.json)|
|N13|四类模板实际下载 / Four real template downloads|PASS|3真实ZIP/XLSX、单Sheet、仅表头、精确且唯一；CSV为BOM+匹配值,新值；下载不改快照 · [证据](evidence/template-structure-verified.json)|
|N14|匹配 CSV 正式回填 / CSV matching update|PASS|RFQ-L00003/00004唯一匹配2行、0未匹配；参考编码2分别CHECK16/CHECK20 · [证据](evidence/new-16-csv-applied.json)|
|N15|供应商模板及关联 / Supplier import and assignments|PASS|真实下载模板填2家；甲关联3行，乙仅2规格行，共5条有效关系，无串行 · [证据](evidence/new-22-rich-baseline.json)|
|N16|报价模板与版本历史 / Quote import and immutable revisions|PASS|数字交期正常导入；乙R1V1两报价、甲R1V2三状态；甲已锁定V1逐字段保留 · [证据](evidence/quote-history-preservation.json)|
|N17|已有业务非法预览取消 / Invalid preview on populated RFQ|PASS|3物料/2供应商/5关联/3已确认提交/PDF1，6.5s预览+清空均完整SHA不变 · [证据](evidence/new-24-rich-invalid-cancel.json)|
|N18|已有业务有效冲突预览取消 / Valid conflict preview on populated RFQ|PASS|已有分配/报价的同码输入只预览后取消，完整快照及PDF哈希不变 · [证据](evidence/new-26-rich-valid-cancel.json)|
|N19|正式导入后 F5 / Populated refresh|PASS|物料、价格10/12/13/20及不供货仍在，完整快照不变 · [证据](evidence/new-27-rich-refreshed.json)|
|N20|正式导入后实际服务重启 / Populated real restart|PASS|关闭页面、终止并重启真实8902服务；完整快照及PDF哈希不变 · [证据](evidence/new-29-after-rich-restart.json)|
|N21|S4 完整备份与空目录恢复 / Full S4 backup and restore|PASS|真实下载ZIP，ZIP完整性与SQLite/PDF成员验证；8903新目录GUI恢复，所有指纹完全相同 · [证据](evidence/restore-01-full.json)|
|N22|F1 当前/来源身份往返 / F1 identity round trip|PASS|导出单物料Sheet经GUI导入另一RFQ再导出；当前ID1/2/3、来源ID1/3/4；表头唯一，ERP字段保留，无供应商/报价/PDF泄漏 · [证据](evidence/F1-roundtrip-inspection.json)|
|N23|F2 规格与身份抽测 / F2 specification smoke|PASS|分配/图纸选择/报价预览与确认/比价/R2范围/沿用均显示规格+ID；M20不供货不进入沿用候选 · [证据](evidence/28-F2-carry-identities.txt)|
|N24|F3 不供货及金额 / F3 cannot-supply and totals|PASS|甲M20为不供货、无0元选择；甲自身74、乙自身86，逐项最低及选择金额134；刷新/重启/恢复保留 · [证据](evidence/22-rich-after-real-restart.txt)|
|NT01|Windows Computer Use / 本机GUI/BAT|NOT TESTED|本轮只使用云端Linux，按任务不执行Windows本机验收。|
|NT02|Windows 原生 Excel 人工打开/重算/打印|NOT TESTED|真实XLSX结构已由openpyxl/ZIP验证，不等同于原生Excel人工验收。|
|NT03|真实采购员及真实业务试用|NOT TESTED|本轮为独立模拟采购员，全部使用虚构业务信息。|

## 正式导入与已有业务的核对 / Committed imports and protected history

- 两来源2+3确认前仍revision1/lineSeq0；确认后revision2/lineSeq2/createdSeq1，真实保留行`RFQ-L00001`、数量5、`sources`长度2。正式规则按两条来源消耗两个序列值，合并行不会重用`RFQ-L00002`；随后M16/M20正式确认为`RFQ-L00003/00004`。**要求是预览不占号，未声称正式导入行号连续无间隔。**
- 取消规格冲突对话框保持合并后完整快照；接受后revision3/lineSeq4/createdSeq3、三条物料。两规格的参考编码2、分配、PDF和报价均依各自RFQ ID独立保存。
- 已有业务最终保护基线revision14/lineSeq4/createdSeq3，3物料、2供应商、5有效供应商关系、3个已确认提交（甲R1V1历史、甲R1V2、乙R1V1）、1份PDF。SHA为 `66e71fd7b9f42561b49296c6d215528fde2f6cf3cba7b494974cf92552d24179`。非法、有效冲突预览及取消、F5、真实进程重启、S4恢复，均与该快照和PDF哈希完全相同。最终新候选再次非法预览也不变。
- 正常报价：甲10×5+12×2=74；乙13×2+20×3=86；最低组合50+24+60=134。甲M20“不供货”没有价格，不计为0。未执行阶梯价/跨币种/全部旧UAT，不延伸此结论。
- S4 ZIP通过文件完整性检查；UI恢复到全新8903目录后逐字段和原文SHA相等。之后只在**恢复副本**创建R2，检查范围及沿用选项；该副本随后出现草稿是主动抽测，不是恢复不一致。主8902基线一直不变。
- F1：内部业务Excel的物料Sheet单独回导，再导出；当前ID列为1/2/3，来源ID列保留1/3/4，两列标题唯一，ERP批次/参考编码2保持；无供应商、报价和PDF串入新项目。

## 异常、测试驱动修正与覆盖边界 / Exceptions and limits

原始日志完整保留，未抹掉未通过的驱动尝试：

1. 三次驱动定位/等待错误：误把`#itemIntake`当作details；正式导入自动收起后点击隐藏确认；PDF成功提示实际为“已保存…并关联”，原等待词“已关联”不匹配。分别按可见按钮与真实成功提示继续，未修改产品。
2. 一个底层check误读`sources`为`sourceRows`，记录`[1,5,null]`失败；随后读取实际`sources`确认`[1,5,2]`并PASS，原失败保留。这是驱动字段假设错误，不是产品缺少来源。
3. 首次报价测试数据把交期写成“7天/8天”，导入器正确提示格式错误并拒绝这些行；甲仅“不供货”行曾被明确确认。随后使用数字7/8重新填写实际模板，乙正常确认，甲通过**UI创建R1V2**再确认完整报价；原已确认V1保持不变。`*-quotes-filled.xlsx`及同名截图是这次拒绝/部分提交尝试，尤其`14-confirmed-B-quotes-filled.xlsx.png`文件名仅代表“尝试确认”，**不表示乙曾成功确认**。正式成功证据使用`*-quotes-numeric-lead.xlsx`及对应截图、`main-business-final.xlsx`和`new-22`以后指纹。
4. 浏览器日志无pageerror、无应用请求失败记录；四个origin各有favicon 404控制台日志，服务日志可对应，不作为业务回归。原始底层check为44满足预期/1驱动字段错误，**不等同于上面的业务场景计数**。

本轮没有新增候选产品缺陷；仅证明P3-01及所列关联流程。先前23 PASS的必要模板/身份/规格/状态回归在本轮重新实际操作，未宣称将所有旧范围、22项自动测试或Windows重新验收。未自行修复问题或改变任何开发分支。

## 证据与复现 / Evidence and reproduction

- [全部截图索引](EVIDENCE.md)（36张：35张业务操作与1张Trace Viewer）
- [完整 Playwright trace](evidence/p301-independent-retest-trace.zip)、[实际Viewer载入截图](evidence/29-trace-viewer-validation.png)、[Viewer文本](evidence/trace-viewer-validation.txt)
- [浏览器动作、对话框、原始逐步源码、断言及驱动异常](evidence/browser-actions.jsonl)
- [原始下载](downloads/)、[脱敏输入](fixtures/)、[只读状态比较](STATE-COMPARISON.json)、[独立工具](tools/)、[SHA256清单](SHA256SUMS.txt)
- [启动/重启与复现说明](REPRODUCTION.md)、[本轮任务原文](evidence/task.md)

候选既有CI查询均completed/success，仅作背景，**本轮没有触发或重复运行**：

- [UI V2 Unified Candidate Acceptance](https://github.com/yudacheng666/SRM_System/actions/runs/38885078080)
- [S3/S4 Regression](https://github.com/yudacheng666/SRM_System/actions/runs/38885078099)

**建议：P3-01可视为本轮独立复验通过，可以交给用户进行合并审核；本范围未发现阻止继续模拟试用的缺陷。没有合并PR #18/#16/#15、开发基线或main，PR #18保留Draft。**

## English summary

**P3-01 PASS — candidate: 24 PASS / 0 FAIL / 3 NOT TESTED.** The original `5424e57c…` was independently reproduced: an invalid material preview, with no commit, persisted revision1→2 and lineSeq0→1 across refresh. On exact candidate `8af8bd119e476bdb16a20bbe5fd629db3212cccc`, invalid and cancelled XLSX/CSV/paste/manual previews, repeated paging/filtering and conflict dismissal left the complete saved snapshot unchanged. This was checked in readonly SQLite after idle windows, refresh and real server restarts.

Confirmed 2+3 merging, separate M16/M20 identities, real template download/fill/import, five supplier associations, confirmed quote revision history and a real synthetic PDF all worked. Populated-state preview cancellation, refresh, process restart and clean S4 restore preserved the exact snapshot/PDF hashes. F1 current/source identity round trip, F2 scope/carry specification display and F3 cannot-supply/amount checks passed (A74, B86, minimum134; no zero-price treatment).

The report discloses three driver locator/wait corrections, one corrected source-field assertion and initially invalid lead-time fixture entries; all raw evidence remains archived. No existing automated suite was used as a substitute. Windows Computer Use, native Excel and real-buyer production trials remain NOT TESTED. Only synthetic reports/evidence/independent tools were added to a test branch; no product edits or merges. Recommend user merge review within this tested scope.
