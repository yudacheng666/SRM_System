# PR #15 独立云端采购员验收 / Independent cloud buyer acceptance

**结论 / Verdict: HOLD — 建议先修 F1–F3 并定向复验，再考虑纳入开发基线。** 没有观察到 P0/P1、金额错误、外发资料泄露或持久化数据丢失；仍有3项P2业务风险及2项P3体验问题。本报告仅给云端业务结论，不代表Windows试用通过。

**34 PASS / 5 FAIL / 7 NOT TESTED，合计46项。** 统计单位为本报告独立业务验收项，不是既有32个E2E或底层helper断言；FAIL对应F1–F5各一项。未修复任何产品代码，未修改现有测试/CI/结构，未合并分支；PR #15仍为Draft。

English: The buyer workflow, financial checks, supplier confidentiality and restart/restore integrity passed. Three P2 findings need targeted fixes and independent retesting before an unconditional development-baseline recommendation. Two P3 usability issues remain. No observed P0/P1; this is a Linux cloud conclusion only.

## 版本、环境与方法 / Version, environment and method

- 任务 / Task: [最新Cloud评论](https://github.com/yudacheng666/SRM_System/pull/15#issuecomment-6208750074)，[完整任务存档](evidence/task.md)。
- 被测 / Tested SHA: `f571f6643d96f1e826011b878fa0d579925cd08a`，`feat/20261016-erp-core-field-alignment`。
- 开发基线 / Base: `draft/20261013-m1-storage-ui-audit`，`8baac18195da9829333dd65433edaa2ba89cb623`，已核对为候选祖先。
- `main`: `f330de510f97c552629052ff1841d7223194e7f8`；未改。独立证据分支 / Evidence branch: `test/20261016-pr15-cloud-buyer-uat`。
- Environment = **Codex Cloud / Linux**，真实Chromium **154.0.8037.57 headless** + Playwright **1.58.2**；Python **3.12.14** / Node **24.19.0**；没有Xvfb，不能声称headed/Windows GUI。
- 业务操作时间 / Buyer actions: **2026-10-16 13:31–14:03 Asia/Shanghai**；原始JSONL为UTC。后续仅整理证据/只读检查。
- 真实应用 / Real app: `prototype/m1-lite/tests/e2e/serve.py`启动实际后端；8841=`/tmp/srm-pr15-main-data`，8842=`/tmp/srm-pr15-restore-data`，8843=`/tmp/srm-pr15-corrupt-data`。全新临时SQLite/PDF目录，未访问用户业务库。
- 浏览器输入、真实按钮/导入/下载/F5/服务进程重启完成业务；没有直接JS/SQLite写入或注入业务状态。SQLite只读快照、openpyxl、ZIP/SHA256为独立交叉证据。
- 未重跑既有自动化套件。现有CI仅背景：[UI及后端](https://github.com/yudacheng666/SRM_System/actions/runs/38829721714)、[S3/S4](https://github.com/yudacheng666/SRM_System/actions/runs/38829722243)，exact SHA成功。
- 所有物料、供应商、价格、条款、PDF均为临时生成虚构内容。只归档本次隔离服务HTTP日志，不上传用户目录或完整主机日志。

## 完整采购闭环 / End-to-end buyer journey

主项目 `RFQ-1792128679531-71B0KB`：任务原始4行XLSX→3询价行（L1 M16=5件、L3 M20=4件、L4支架=6件）；人工确认同编码不同规格，不静默合并。参考搜索、编辑和批量恢复后，A/B分L1+L4，C分L3+L4。三家分别导出询价包，图纸手动纠错、多版本选择与缺图告警均实际操作。

A第一轮XLSX的M16阶梯价 `1-4:22|5+:20`，数量5适用20；支架30。B粘贴重复行被拒，补录L1=19及L4=32；C的M20不供货、支架明确未报价均无价格。A第二轮仅L1，V1=18.5、V2=18，旧轮支架30保留。B后续V2提价21，引发旧中选待复核；重新说明交期原因后最终选择B的M16+ A的支架。

| 核对 / Calculation | 独立预期与实际 / Expected = actual |
|---|---|
| A最终有效范围 | 18×5+30×6=270 |
| B最终有效范围 | 21×5+32×6=297 |
| 逐项最低组合 | 18×5+30×6=270，两项 |
| 最终非最低选择 | 21×5+30×6=285，多15元，有原因 |
| B旧选择待复核时 | 仅支架30×6=180，待复核1项不计入 |
| C/M20 | 空价/不供货，不能作为0元中选；显示缺陷另见F3 |

第二完整项目 `RFQ-1792129785629-2TN8N8` 有4项（含WIDE-221）、D供应商仅宽表一项、2.75确认报价、商务/行备注与两页PDF。F5、项目切换与实际8841进程重启后主项目285及第二项目2.75均保留。完整备份还包含两个导入探针项目，总共4笔，快照revision为18/2/10/2；恢复到空目录后4个快照SHA256、revision及5个登记PDF哈希逐项一致。

English: The primary RFQ exercised mixed quote entry, tier pricing, scoped second rounds, revisions, locked history, nonlowest award reasons and automatic review after a selected quote changed. A second rich RFQ independently exercised persistence. Exact snapshot and original-PDF fingerprints survived a real server restart and a clean full-backup restore.

## 独立验收矩阵 / Independent acceptance matrix

下表每项均适用上述候选SHA、环境和虚构数据。操作/预期列同时给出实际核对结果；FAIL的完整复现另列。 / Every case uses the locked candidate and synthetic data above. Each row records the action, expected invariant and observed result.

| ID | Result | 测试项 / Case | 操作、预期及实际 / Action, expectation and observation | Evidence |
|---|---|---|---|---|
| T01 | PASS | 版本/隔离 · Version/isolation | 固定 f571f664；3 个全新 SRM_DATA_DIR、独立端口；未运行既有自动套件。 | [task.md](evidence/task.md) |
| T02 | PASS | XLSX 4→3 | 真实上传 task-materials.xlsx，预览确认；M16=5、M20=4、TEST-002=6，规格不同保留独立行。 | [02-imported-three-lines.png](evidence/02-imported-three-lines.png) |
| T03 | PASS | CSV/粘贴与自动保存 · Paste/autosave | 全新空白项目粘贴同四行，确认后等待6秒；自动保存3行成功，刷新保留。 | [24-clean-duplicate-autosave-control.png](evidence/24-clean-duplicate-autosave-control.png) |
| T04 | PASS | 搜索/分类/排序 · Search/filter/sort | R-101 搜索得到1项；钣金类别筛选1项；排序与清空后恢复，行身份未混淆。 | [browser-actions.jsonl](evidence/browser-actions.jsonl) |
| T05 | PASS | 编辑/批量更新/恢复 · Edit/bulk/revert | TEST-002 规格改为板厚4-复核；M16/M20 参考码批量改临时值再恢复R-200，保存刷新仍为3项。 | [07-bulk-edit-restored.png](evidence/07-bulk-edit-restored.png) |
| T06 | PASS | 独立单位 · Independent units | 采购常用单位盒、询价单位件原样保留；数量5/4，无换算或自动报价。 | [03-erp-editor.png](evidence/03-erp-editor.png) |
| T07 | PASS | 别名冲突 · Alias conflict | 同一行存货编码TEST-A/物料编码TEST-B，预览拒绝且提交不可用，已有3项不变。 | [08-conflicting-alias-rejected.png](evidence/08-conflicting-alias-rejected.png) |
| T08 | PASS | ERP原值差异 · Raw ERP conflict | 同TEST-002及修订规格，但ERP批次属性改C；明确冲突提示后取消，3项不变。 | [09-raw-erp-conflict-preview.png](evidence/09-raw-erp-conflict-preview.png) |
| T09 | PASS | 221列原值留存 · Wide raw retention | WIDE-221：9核心+212附加列；内部导出222列（含系统ID），原221列值一致；抽取单物料表UI导回后212原值仍一致。 | [single-sheet-roundtrip-check.json](evidence/single-sheet-roundtrip-check.json) |
| T10 | FAIL | 往返唯一表头 · Unique round-trip headers | 再次内部导出223列，RFQ Line ID在第1/223列重复且部分值不同；二次单表UI导入被拒绝。F1。 | [duplicate-identity-export.json](evidence/duplicate-identity-export.json) |
| T11 | PASS | 256与超限保护 · Capacity guards | 233/256列能解析但附加字段超过220则禁止提交；257列由解析器拒绝，未静默截断写入。并非256列全部获准导入。 | [27-over256-parser-rejection.png](evidence/27-over256-parser-rejection.png) |
| T12 | FAIL | 容量错误可理解性 · Capacity error clarity | 220原始字段容量被触发时仅报“过大或不安全ERP字段”，无明确计数/容量解释。F5。 | [26-wide256-metadata-cap-rejection.png](evidence/26-wide256-metadata-cap-rejection.png) |
| T13 | PASS | 三供应商双向分配 · Three-vendor allocation | A/B=L1,L4；C=L3,L4；追加、重复选择、C取消再选与反向视角，均保留其他供应商关系。 | [14-partial-additive-allocation.png](evidence/14-partial-additive-allocation.png) |
| T14 | PASS | 部分覆盖/缺图询价包 · Partial RFQ packages | A仅覆盖2/3仍允许导出；待确认图纸/缺图有提示，未确认PDF未混入。 | [15-partial-pending-export.png](evidence/15-partial-pending-export.png) |
| T15 | PASS | 报价前外发隔离 · Prequote confidentiality | 逐供应商解包核对2个指定RFQ行、规格及空白报价区；无内部参考码/ERP附加值/其他供应商信息。 | [supplier-package-checks.json](evidence/supplier-package-checks.json) |
| T16 | PASS | 外发PDF身份/版本 · Package PDF identity | 最终A/B仅TEST-001_B+TEST-002_A；C仅TEST-002_A；各字节与原文件SHA256一致，无解除关联版本。 | [supplier-package-checks.json](evidence/supplier-package-checks.json) |
| T17 | PASS | 三种报价入口/来源 · Quote entry/source | A真实XLSX；B粘贴+手工补行；C手工状态；来源、商务条款和逐行备注保存且内部导出可查。 | [export-inspection-main.json](evidence/export-inspection-main.json) |
| T18 | PASS | 漏报/多报/重复/状态 · Quote exceptions | A未知行拒绝；B重复L1两条均拒绝、L4保留，漏报CSV仅L1；C明确未报价/不供货空价，空轮确认受阻。 | [17-duplicate-quote-preview.png](evidence/17-duplicate-quote-preview.png) |
| T19 | PASS | 锁定/两轮/修订 · Locked rounds/versions | A R1两项；R2只L1，V1=18.5、V2=18；确认后修改锁定，L4沿用R1=30，历史不被覆盖。 | [19-round2-version2-confirmed.png](evidence/19-round2-version2-confirmed.png) |
| T20 | PASS | 阶梯/范围/金额 · Tier/scope/totals | A R1数量5适用20；最终A=270、B=297、最低270；A/B共同2项，三家共同0；M20无价为空非0。 | [formula-and-unquoted-checks.json](evidence/formula-and-unquoted-checks.json) |
| T21 | PASS | 非最低选用/待复核 · Nonlowest/review | B19需原因，选用总275；B修订21后旧选择待复核并排除，总180；重新给原因后285，较最低多15。 | [22-final-selected-285.png](evidence/22-final-selected-285.png) |
| T22 | PASS | 内部比价XLSX · Internal comparison | 已实现两表结构，来源/轮次/备注/历史存在；独立ROUND/SUMIF核对90+180=270、105+192=297。 | [export-inspection-main.json](evidence/export-inspection-main.json) |
| T23 | PASS | 报价后外发隔离 · Postquote confidentiality | 最终报价/中选之后重新下载A/B/C包，仍只各自范围、空报价区，无历史及内部选择泄露；8份独立包全部校验。 | [supplier-package-checks.json](evidence/supplier-package-checks.json) |
| T24 | PASS | PDF歧义/人工纠错 · Ambiguous PDF matching | 合法2页PDF；TEST001候选L1/L3，TEST002唯一L4，无匹配文件不猜测；手选错L3改L1；过期预览拒绝，重预览成功。 | [12-fresh-batch-confirm-result.png](evidence/12-fresh-batch-confirm-result.png) |
| T25 | PASS | PDF版本/解除/缺图 · PDF lifecycle | L1加B版，预览选择B，解除A只剩B；L3解除后缺图提示，设无需图纸后取消该缺图要求。 | [browser-actions.jsonl](evidence/browser-actions.jsonl) |
| T26 | FAIL | 同编码规格可辨识 · Spec identification | 图纸候选/分配/报价比价的身份区不显示M16/M20，需跨页查RFQ ID。F2。 | [10-drawing-candidates.png](evidence/10-drawing-candidates.png) |
| T27 | FAIL | 不供货显示 · Cannot-supply presentation | C已确认L3不供货，报价页/导出保留状态，比价单元格却显示未报价。金额仍正确排除。F3。 | [43-compare-cannot-shown-unquoted.txt](evidence/43-compare-cannot-shown-unquoted.txt) |
| T28 | PASS | 两笔完整项目/F5 · Two rich RFQs | 主项目三家多轮；宽表项目D=2.75、商务/逐行备注、PDF；往返切换/F5后均保存。 | [31-second-project-business.png](evidence/31-second-project-business.png) |
| T29 | PASS | 实际服务重启 · Actual process restart | 停止本次8841进程后以同一隔离目录重启；4项目快照+revision及5PDF哈希逐项不变；UI主285/宽表2.75。 | [process-restart-integrity.json](evidence/process-restart-integrity.json) |
| T30 | PASS | 离线保存失败/重试 · Failed save/retry | 浏览器离线编辑宽表名称，保存显示Failed to fetch且不假成功；联网重试保存，刷新保留名称。 | [30-offline-save-error.png](evidence/30-offline-save-error.png) |
| T31 | PASS | 空库完整恢复 · Clean restore | UI下载S4完整ZIP，8842空目录UI恢复；4个快照+修订号、5个PDF原始哈希与源一致，主项目285。 | [restore-integrity-checks.json](evidence/restore-integrity-checks.json) |
| T32 | PASS | 损坏ZIP/PDF哈希 · Corruption guards | 8843空目录先坏ZIP再篡改PDF的ZIP；均拒绝，后者RESTORE_PDF_HASH_MISMATCH HTTP400；当时0项目0PDF未改变。 | [36-pdf-hash-restore-rejected.png](evidence/36-pdf-hash-restore-rejected.png) |
| T33 | PASS | 非空恢复保护 · Nonempty restore guard | 主库和恢复库分别再次尝试恢复，明确拒绝且原内容保持。 | [40-restored-nonempty-refusal.png](evidence/40-restored-nonempty-refusal.png) |
| T34 | PASS | 三尺寸四页/滚动 · Responsive/sticky | 1024×768、1366×768、1600×900共12屏；document不超视口；1024比价真实横滚后身份列仍固定。 | [23-narrow-sticky-comparison.png](evidence/23-narrow-sticky-comparison.png) |
| T35 | PASS | 键盘/焦点/脏字段 · Focus/Escape/dirty edits | 只读编辑器12次Tab/Shift+Tab留在弹窗，Esc关闭；规格/采购单位未保存修改Esc保留并提示放弃确认。 | [29-dirty-itemEditSpec.png](evidence/29-dirty-itemEditSpec.png) |
| T36 | FAIL | 历史UAT-05密度 · Existing density issue | 项目/帮助/导入区占据首屏；报价已锁定仍有三入口与旧输入，覆盖/状态/明细需下滚。F4，视觉体验非新增阻断。 | [layout-quotes-1024.png](evidence/layout-quotes-1024.png) |
| T37 | PASS | 多表输入拒绝保护 · Multisheet ambiguity guard | 3Sheet内部业务XLSX直接回导被拒绝匹配歧义，0行不变；UI说明单表输入，独立抽取物料表才用于往返验证。 | [32-multisheet-direct-import-rejected.png](evidence/32-multisheet-direct-import-rejected.png) |
| T38 | PASS | 备份内容边界 · Backup content boundaries | 完整包保留SQLite+5个登记PDF（含已解除的原资产）；源凭证仅文字描述，不把邮件/聊天原件说成已归档。 | [restore-integrity-checks.json](evidence/restore-integrity-checks.json) |
| T39 | PASS | 分配后编辑保关系 · Edit preserves assignments | TEST-002分配3家后改名称为虚构支架-采购复核；A/B/C各关系仍在，刷新/重启/恢复均保留。 | [pre-restart-fingerprints.json](evidence/pre-restart-fingerprints.json) |
| N01 | NOT TESTED | 原生PDF页面像素/翻页/缩放 · Native PDF rendering | 真实headless Chromium打开查看器、版本选择与文件下载可测；截图13内嵌PDF为黑，不能证明页面视觉渲染。 | [限制 / limits](#limits) |
| N02 | NOT TESTED | Windows BAT双击 · Windows BAT | 按用户要求不执行Windows本机测试。 | [限制 / limits](#limits) |
| N03 | NOT TESTED | Windows原生Excel重算/打印 · Native Excel | 只解析OOXML及独立计算公式；未使用Windows Excel。 | [限制 / limits](#limits) |
| N04 | NOT TESTED | Windows Computer Use | 按用户要求暂停，不调用。 | [限制 / limits](#limits) |
| N05 | NOT TESTED | 邮件/聊天原件归档 · Original quote evidence | NOT SUPPORTED：当前仅来源类型及文字说明，本次没有原邮件/聊天附件持久化入口；PDF图纸另已测。 | [限制 / limits](#limits) |
| N06 | NOT TESTED | 比价Excel V2 · Future comparison Excel V2 | NOT SUPPORTED：另行设计尚未集成；仅现有两表导出已实测。 | [限制 / limits](#limits) |
| N07 | NOT TESTED | 真实ERP约220字段语义映射 · Real ERP dictionary | 未提供真实模板/字典；只测虚构221列原列名原值留存，不代表逐字段语义映射。 | [限制 / limits](#limits) |

## 缺陷与修复建议 / Findings and proposed follow-up tasks

### F1 · P2 · 功能错误/数据身份风险 / Export round-trip identity defect

**页面 / Page:** 内部业务数据Excel导出、物料文件导入。**影响 / Impact:** 自身导出的物料表经一次回导后会生成重复身份表头，采购员无法可靠判断哪个ID属于当前工作，二次导入失败。未发现212个原ERP值丢失。

**复现 / Reproduce:**

1. 在宽表项目导出 [内部业务数据](downloads/wide221-business.xlsx)，含3Sheet。按UI只支持单物料表的要求，用openpyxl原样抽出物料Sheet为 [单表输入](fixtures/roundtrip-material-sheet.xlsx)，不改列名/值。
2. 新建空白RFQ，从真实UI上传单表、预览、确认4项，再导出 [再次业务数据](downloads/roundtrip-wide-business.xlsx)。
3. 查看物料Sheet：第1列及第223列均为 `RFQ Line ID`。M20分别是新ID `RFQ-L00002`、旧ID `RFQ-L00003`；WIDE-221为新4、旧6。
4. 再将该物料Sheet原样抽为 [二次输入](fixtures/second-roundtrip-material.xlsx)，真实UI预览报 `XLSX: 存在重复列标题`，不能导入。

**预期 / Expected:** 系统保留当前询价行身份且导出表头唯一；若留存来源ID，应以明确来源字段区分。**实际 / Actual:** 导入把原RFQ ID当ERP附加字段，导出重复系统列，形成自身无法继续读取的表。**建议 / Suggested fix:** 明确保留字段策略；来源ID使用独立命名，不覆盖当前不可变身份，确保重复导出/导入表头唯一。此处仅建议，未实现修复。

**证据 / Evidence:** [精确列位置与ID值](evidence/duplicate-identity-export.json)、[212原值仍一致](evidence/single-sheet-roundtrip-check.json)、[抽取说明](evidence/roundtrip-extraction.json)、[二次拒绝页面文本](evidence/41-duplicate-header-second-import.txt)、[真实操作trace](evidence/cloud-buyer-trace.zip)。截图41首屏保留旧恢复提示，重复表头错误位于下方，以同一时刻完整页面文本和原XLSX作为直接证据，不能把旧恢复提示当本缺陷。

English: Reimporting the unchanged material sheet treats its old RFQ Line ID as raw ERP metadata. The next export has two identically named columns with different current/source IDs; its material sheet is then rejected by the real importer. Preserve provenance under a distinct reserved heading and keep current row identity unambiguous.

### F2 · P2 · 操作体验/业务识别风险 / Missing specification in decision surfaces

**页面 / Page:** 图纸候选/人工选择、供应商分配、报价/比价身份区。**影响 / Impact:** TEST-001的M16与M20同编码同名称，只显示编码/名称/RFQ ID，采购员必须跨页查规格才敢选图纸或判断报价，容易关联错误。

**复现 / Reproduce:** 导入任务四行保留M16/M20 → 上传TEST-001_A.pdf查看两个候选 → 切分配与报价/比价，比较L1/L3标识。**预期 / Expected:** 每个影响分配/图纸/报价决策的行及选项显示规格。**实际 / Actual:** 关键身份区没有M16/M20；物料编辑器、供应商XLSX和内部XLSX的规格本身正确，不是误合并。**建议 / Suggested fix:** 在相关选项和固定身份列加规格及单位，长规格可展开，保留RFQ ID。

**证据 / Evidence:** [图纸候选](evidence/10-drawing-candidates.png)、[分配1600](evidence/layout-allocation-1600.png)、[报价身份](evidence/42-confirmed-C-cannot.png)、[比价页面文本](evidence/43-compare-cannot-shown-unquoted.txt)。

English: Same-code M16/M20 items remain separate and exports retain specifications, but several decision surfaces omit specifications. This creates avoidable cross-page lookup and misassignment risk. Display specifications beside the code and immutable RFQ line ID.

### F3 · P2 · 功能呈现/业务状态问题 / Cannot-supply flattened into unquoted

**页面 / Page:** 比价议价。**复现 / Reproduce:** C供应商第一轮L3手工选择“不供货”、不填价、填写备注并确认 → 切比价查看同一行C列。**预期 / Expected:** 明确显示“不供货”，区别于“明确未报价/漏报”。**实际 / Actual:** 报价页和存储/内部历史仍为“不供货”，比价却只显示“未报价”。采购员可能继续催已经明确不供货的供应商。金额正确排除该项，未把它作为0元。

**证据 / Evidence:** [报价页确认不供货](evidence/42-confirmed-C-cannot.png)、[比价完整文本](evidence/43-compare-cannot-shown-unquoted.txt)、[导出历史与原状态](evidence/export-inspection-main.json)、[空金额校验](evidence/formula-and-unquoted-checks.json)。**建议 / Suggested fix:** 比价保留报价状态及原因，不把各类无有效价统一为未报价。

English: The confirmed cannot-supply status is preserved in history but rendered as unquoted in comparison. Keep the business status visible while continuing to exclude it from pricing calculations.

### F4 · P3 · UI视觉/操作体验 / Historical UAT-05 density

**页面 / Page:** 四主页面，尤以报价回收为甚。**复现 / Reproduce:** 1024×768进入已确认报价，保持页面默认展开状态；再对照1366/1600首屏。**预期 / Expected:** 当前采购阶段、待办、确认状态和明细优先可见。**实际 / Actual:** 项目帮助/全局工具占高，已锁定轮次仍有三大录入面板和先前输入，关键状态/明细需多次滚动。未观察到document越界遮挡；此项为原UAT-05继续待优化，不混为新增功能阻断。**建议 / Suggested fix:** 已确认轮次折叠/只读化入口，减少重复说明，优先展示覆盖率、异常与明细。

**证据 / Evidence:** [1024报价](evidence/layout-quotes-1024.png)、[1366报价](evidence/layout-quotes-1366.png)、[1600报价](evidence/layout-quotes-1600.png)、[全部12屏](EVIDENCE.md)。

English: Persistent top-level controls and three entry panels dominate the first viewport even for a locked round. Prioritize the current decision and collapse inactive input/help areas. This remains a usability improvement, not a newly demonstrated data failure.

### F5 · P3 · 异常提示体验 / ERP capacity error wording

**页面 / Page:** 物料XLSX预览。**复现 / Reproduce:** 上传短文本虚构 [233列](fixtures/wide-233.xlsx)（224附加）或 [256列](fixtures/wide-256.xlsx)（247附加），触发220附加字段上限。**预期 / Expected:** 告诉用户原字段数量、允许上限及可行处理；安全与容量原因分开。**实际 / Actual:** “过大或不安全ERP字段”并罗列列名，不明确220字段限制，让正常ERP列看似有安全问题。保护确实阻止导入，未静默截断。

**证据 / Evidence:** [233列提示](evidence/25-wide233-preview.png)、[256列提示](evidence/26-wide256-metadata-cap-rejection.png)、[完整错误文本](evidence/26-wide256-metadata-cap-rejection.txt)。**建议 / Suggested fix:** 展示总列数/附加数/容量，分别说明字段长度、字段数与危险字段错误。

English: The guard works, but harmless short fields beyond the metadata-count limit are described as oversized or unsafe. State the actual count and the supported maximum, with distinct error reasons.

<a id="limits"></a>
## 限制、日志解释与结论边界 / Limits and log interpretation

- 没有Windows本机访问，也未要求用户追加Windows测试；BAT/原生Excel/Computer Use严格NOT TESTED。OOXML解析和独立公式计算不等于Excel桌面重算通过。
- 多页PDF格式、版本选择、下载原字节、包内关联、重启/恢复哈希通过；原生嵌入查看器截图13黑屏，页面像素/翻页/缩放NOT TESTED。没有将其标为PASS或凭实现推断渲染正常。
- 221有效输入列（212原附加字段）确实成功往返原值；233/256列的附加数量超220被拒，257超解析边界被拒。带空表头的256物理列探针另因空列名被拒，不作为256列成功证据。未宣称真实ERP约220字段语义映射通过。
- 3Sheet业务Excel直接输入存在多表歧义、被拒；产品提示只支持单物料表，本报告通过独立抽取原Sheet验证往返，不宣称直接3Sheet回读通过。F1发生在实际支持的单表通道，独立成立。
- 邮件/聊天来源选项和说明文本可保存，但没有原邮件/聊天图片归档能力。备份5个原PDF不包括未登记的邮件/聊天原件；解除关联的PDF原资产保留在完整备份符合完整归档，不会混入外发包。
- 原始日志保留全部失败探索。早期导入后曾出现一次 `M_MODEL_FOREIGN_LINE_ASSIGN` 自动保存提示；手动保存/刷新正常，独立干净CSV控制自动保存3项成功，未复现持续失败，列观察而非已确认P1。多标签切换导致409“Active RFQ has changed”是保护；按单页切换继续后保存正常。
- 过期图纸预览被保护拒绝，重预览成功；这不是最终导图失败。驱动层7次错误（错误保存状态选择器、不可用/隐藏按钮或等待下载等）全部保留，不当成产品失败；29个底层check均满足预期，业务缺陷另由独立观察/文件证据确认。
- 8843先做损坏恢复，验证0项目/0PDF；之后才在该空目录新建二次导入探针。不能用后来的探针误读为坏备份写入数据。
- [截图目录](EVIDENCE.md)是原生Playwright PNG；对应txt为页面完整文本，包含折叠/滚动之外的文字，不能替代像素布局证据。Trace保留DOM/动作/网络，未录制逐帧screencast，配合独立PNG查阅；Trace Viewer实测载入成功。

**处置建议 / Recommendation:** 无观察到阻止受控云端探索的P0/P1；有数据身份往返、同编码规格辨识及不供货显示的P2风险。建议修F1–F3后做各自最小复现及受影响闭环定向复验，F4/F5独立体验优化。当前给出HOLD，暂不建议无条件纳入开发基线。本任务止于报告，不自行修复、不改变PR状态、不合并。

English: Controlled cloud exploration can continue with awareness of these limitations, but baseline acceptance should wait for F1–F3 fixes and targeted independent verification. No product fixes or merges were performed.

## 证据导航 / Evidence navigation

- [全部原生截图 / Screenshot gallery](EVIDENCE.md)
- [完整浏览器操作、观察、console与网络异常 / Browser transcript](evidence/browser-actions.jsonl)
- [可载入Playwright trace / Trace](evidence/cloud-buyer-trace.zip)，下载后用 `playwright show-trace`；[Viewer验证截图](evidence/44-trace-viewer-validation.png)。
- [供应商包真实内容校验 / Vendor package checks](evidence/supplier-package-checks.json)
- [比价公式与空报价校验 / Formula and unquoted checks](evidence/formula-and-unquoted-checks.json)
- [重启 / Restart](evidence/process-restart-integrity.json)、[恢复 / Restore](evidence/restore-integrity-checks.json)
- [内部最终比价 / Final comparison](downloads/final-comparison-A-B.xlsx)、[三家状态审计 / All-three audit](downloads/all-three-status-audit.xlsx)、[主业务导出 / Main business](downloads/main-business-data.xlsx)
- [全量虚构测试备份 / Synthetic full backup](downloads/full-cloud-backup.zip)、[哈希清单 / SHA256 manifest](SHA256SUMS.txt)
- [独立驱动说明 / Independent driver notes](scripts/README.md)
