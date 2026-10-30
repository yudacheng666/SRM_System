# SRM UI V2 独立采购员验收 / Independent buyer UAT

## 结论 / Decision

**有条件进入下一轮受控试用；先处理 P2。不是生产上线批准。 / Conditional next-stage pilot after P2 fixes; not production approval.**

真实采购主流程已从空白项目执行到供应商询价包及内部比价议价 Excel。没有观察到 P0/P1、数据丢失或金额计算错误；已确认 **4 项 P2、3 项 P3**。P2 涉及分类筛选、报价来源追溯、隐藏的恢复反馈和弹窗键盘焦点。键盘独立操作存在障碍，报价来源不宜直接用于正式审计；这些限制应先修复再扩大采购员试用。鼠标操作及本轮虚构项目没有被完全阻断。

The real workflow reached supplier inquiry packages and an internal comparison workbook. No P0/P1, data loss, or arithmetic error was observed in this sample. **Four P2 and three P3 findings** remain: category filtering, provenance accuracy, hidden restore feedback, and modal keyboard focus. Fix P2 before expanding the pilot. Keyboard-only use and reliable provenance auditing are affected; the tested mouse-driven fictional workflow remained completable.

| 独立验收任务 / Exploratory missions | PASS | FAIL | NOT TESTED |
|---|---:|---:|---:|
| 40（下表为唯一统计口径 / sole counting unit below） | **29** | **5** | **6** |

FAIL 是任务中发现缺陷，不代表该任务内全部功能失效；7 个问题映射到 5 个 FAIL 任务。没有将既有 22 项自动测试加入此统计。 / A FAIL mission contains a defect, not a claim that every subfeature failed. Seven findings map to five failed missions. Existing automated tests are excluded from these counts.

## 基线、隔离与方法 / Baseline, isolation, method

- Repository: `yudacheng666/SRM_System`.
- Base: `draft/20261013-m1-storage-ui-audit`.
- 实测程序完整 SHA / tested application SHA: **`49cd430b5b695f281e7f81931d174cbc1fb32cb5`**.
- 验证远端基线恰为该提交，且 `git merge-base --is-ancestor 49cd430b HEAD` 返回 0。 / Remote base was exactly this commit; ancestry verification exited 0.
- Independent branch: `test/20261015-ui-v2-codex-uat`, created in `/tmp/srm-ui-v2-uat` from that SHA. No application, existing tests, CI, schema, main, or development-base edits; no merge.
- 执行日期 / execution: 2026-10-15, raw logs in UTC (cloud browser clocks also UTC). Shanghai is UTC+08:00.
- Real backend `server.main()` and its backup thread, launched with existing `tests/e2e/serve.py`, port 8825; recovery server port 8826.
- **Only** `/tmp/srm-v2-data` and `/tmp/srm-v2-restore` SQLite/PDF roots were used. No user business data was opened. All published projects, prices, companies, PDFs and XLSX inputs are synthetic.
- Actual Chromium **154.0.8037.57**, Playwright **1.58.2**, Python **3.12.14**, Node **24.19.0**, Linux cloud environment. Real headless Chromium screenshots, not a static prototype.
- Viewports: **1024×768, 1366×768, 1600×900**. Materials and all three subsequent business pages were captured at all sizes.
- 独立设计组合操作：同编码异规格与图纸多候选、重复追加与双向分配、覆盖不足时导出、Excel 异常后粘贴和手工补录、第二轮局部范围及版本修订、非最低价原因、跨项目恢复、断网保存及键盘焦点。没有运行既有自动测试来替代探索。 / Independently composed scenarios combined conflicting codes/PDF candidates, repeated and reverse allocation, partial coverage exports, mixed quote input methods, scoped negotiation and revisions, award reasons, project switching, recovery, offline saving, and keyboard focus. Existing suites were not rerun as a substitute.
- 浏览器操作为主要证据；只读 OOXML 和 SQLite 检查补充验证保存结果与导出内容，没有直接写 API 或数据库造出结果。 / UI operations are primary evidence; read-only OOXML/SQLite inspection corroborates saved state and exports. No API/database writes were used to manufacture outcomes.

Existing CI baseline (read only): [run 38732490714](https://github.com/yudacheng666/SRM_System/actions/runs/38732490714), exact tested SHA, success. Logs report Python 43, Node 10, Playwright 22 passed. [Windows job](https://github.com/yudacheng666/SRM_System/actions/runs/38732490714/job/116413432220), [Linux job](https://github.com/yudacheng666/SRM_System/actions/runs/38732490714/job/116413432761). CI success does not resolve the findings below and is not Windows manual UAT.

## 虚构项目与计算核对 / Fictional projects and arithmetic

Main project: `RFQ-1792067805618-H0OZ0C`. Import 12 items; change TST-001 quantity 2→10; paste PASTE-001 (6); manually add SINGLE-001; retain a conflicting TST-001 as a distinct line after confirmation. Resolve two PDFs explicitly. Delete the temporary SINGLE-001 and conflicting line after exercising them: **13 retained items**. Second project `RFQ-1792068854556-3X4X4E` exercises 100-item paging, searching, sorting, selection, and identical-demand merging.

Suppliers: `UAT-A / 虚构精工甲`, `UAT-B / 虚构机件乙`, `UAT-C / 虚构备选丙`. Allocation A=001/002/003; B=001/002/004; C=003/005. Repeated A addition is idempotent, B addition retains A, reverse-view removal/re-addition of C005 retains A's three relations. Partial export occurred at **5/15 coverage**, before removal of the two temporary items.

| 核对项 / Check | 独立计算 / Independent calculation | 页面/导出结果 / Observed |
|---|---|---|
| A001 tier at qty 10 | `1–9:20, 10+:18` → 18 | 18 |
| A001 negotiation history | R1/V1 tier18 → R2/V1 17 → R2/V2 16.5 | All three retained, confirmed; latest applies |
| A own valid scope | `16.5×10 + 30×3 + 40×4` | ¥415 |
| B own valid scope | `19×10 + 28×3 + 50×5` | ¥524 |
| A/B common scope 001,002 | A=`165+90`; B=`190+84` | ¥255 / ¥274 |
| Lowest combination, 4 items | `165+84+160+250` | ¥659 |
| Choose higher B001 with reason | `190+84+160+250` | ¥684, reason required |
| No quote for 005 / later C explicit noquote,cannot | No valid amount; not a zero-price award | Excluded from quoted-item totals |

[Calculation/environment evidence](evidence/environment-and-checks.json), [export cells/formulas](evidence/export-cell-inspection.json), [comparison screenshot](evidence/15-comparison-verified.png), [export workbook](evidence/final-comparison.xlsx). Workbook was exported at the ¥684 decision point, before bulk/default reset, offline PASTE-001 edit, and C's later explicit noquote/cannot entries; differences from final saved state are intentional timeline differences. The supplier inquiry package was initially saved by the harness under a `.xlsx` scratch name; it is a ZIP containing XLSX + two PDFs and is archived with its correct extension as [partial-A-inquiry-package.zip](evidence/partial-A-inquiry-package.zip).

## 独立验收矩阵 / Mission matrix

| ID | 任务与实际结果 / Mission and observed result | Status | Evidence / finding |
|---|---|---|---|
| E01 | 新建空白正式项目，隔离数据根 / New formal project in isolated root | PASS | actions.jsonl, environment-and-checks.json |
| E02 | 真实 XLSX 导入12行，确认后才入表 / 12 XLSX rows committed after preview | PASS | 04–06-formal-items screenshots |
| E03 | 粘贴与单条物料录入，分别新增 / Paste and manual material entry | PASS | actions.jsonl; final-business-state.json |
| E04 | 同属性重复需求合并为一行、数量4 / Identical duplicate demand merged, qty4 | PASS | 31-duplicate-demand-merge.png |
| E05 | 同编码异属性显式确认分行，独立 RFQ ID / Conflicting code split by confirmation | PASS | 08-drawing-ambiguous.txt; dialogs |
| E06 | 双击修改数量10，行ID和关联保持 / Edit quantity with stable identity | PASS | 16-refresh-persisted.txt; saved state |
| E07 | 100行、50/页、本页选择/反选、搜索、编码排序 / Paging, selection, search and sort | PASS | 19-page-sort-search.png; action outputs |
| E08 | 删除有确认，取消后13行保留；接受后临时两行删除 / Delete confirmation/cancel and actual deletion | PASS | browser.jsonl; actions.jsonl |
| E09 | 单候选匹配需最终确认；非法PDF被识别 / Unique candidate and invalid PDF preview | PASS | 30-unique-invalid-drawing.png/.txt |
| E10 | 多候选、未匹配人工指定正确行并持久化 / Ambiguous/unmatched PDFs explicitly linked | PASS | 08; restore-verification.json |
| E11 | 三供应商Excel预览、确认后进入当前RFQ / Supplier XLSX import | PASS | actions.jsonl; final-business-state.json |
| E12 | 重复追加不重复、不覆盖其他供应商 / Idempotent additive many-to-many allocation | PASS | 09-allocation-additive.png/.txt |
| E13 | 双向切换、C005取消/重选，A三项不变 / Reverse allocation and remove/re-add preserve A | PASS | actions.jsonl A_CHECKED; saved state |
| E14 | 导入分类不能出现在分类筛选 / Imported categories absent from filter | **FAIL** | UAT-01 |
| E15 | 供应商编码搜索只返回乙 / Supplier-code search returns B only | PASS | actions.jsonl SUPPLIER_SEARCH |
| E16 | 5/15覆盖仍导出甲3项及2 PDF，缺图提示 / Partial coverage export and missing-PDF warning | PASS | 11; partial-A-inquiry-package.zip |
| E17 | Excel多报拒绝，合法3行单独提交 / Extra Excel quote rejected; 3 valid rows committed | PASS | 12-extra-quote-rejected.txt |
| E18 | 重复两行均拒绝；粘贴去重补002、手工补004 / Duplicate rejection and mixed-method correction | PASS | 13; 24; actions.jsonl |
| E19 | 手工录入来源被记为导入 / Manual provenance mislabeled as import | **FAIL** | UAT-02 |
| E20 | 确认后禁止改写，新版本修改后重新确认，旧版本保留 / Lock, new revision and history | PASS | 14; LOCKED_MODIFY outputs; export sheet2 |
| E21 | 第二轮仅001范围，不抹去002/003前轮有效价 / Scoped round preserves previous applicable quotes | PASS | 15; saved state; export |
| E22 | 数量10落在第二阶梯 / Tier boundary resolves to ¥18 | PASS | 12; environment-and-checks.json |
| E23 | 空报价禁止确认，漏报计数，显式未报价/不供货 / Empty confirmation guard, missing counters, explicit statuses | PASS | browser.jsonl; 28-explicit-noquote-cannot.txt |
| E24 | 自身/共同/最低组合金额与独立计算一致 / Distinct scopes and independent arithmetic agree | PASS | 15; calculation table above |
| E25 | 非最低选择空原因不能提交，填写后684 / Higher price requires reason, then total684 | PASS | 15; final-comparison.xlsx |
| E26 | 批量选乙也要求原因，恢复默认回659 / Bulk selection reason and default reset | PASS | actions.jsonl BULK_MODAL; 16 |
| E27 | 导出汇总、轮次历史、条款、凭证及公式 / Workbook content/history/terms/formula text | PASS | final-comparison.xlsx; export-cell-inspection.json |
| E28 | 保存、刷新、两个项目来回打开后状态保持 / Save, refresh and project reopen | PASS | 16; REOPEN_TOTAL; final-business-state.json |
| E29 | 完整ZIP恢复空白根；两项目快照/修订号及两PDF哈希一致 / Full restore exact snapshots and assets | PASS | 22; restore-verification.json; synthetic-s4-backup.zip |
| E30 | 非空恢复阻止覆盖；损坏ZIP400，仍可随后正常恢复 / Nonempty/invalid guards and subsequent recovery | PASS | 21; 23; restore-server.log |
| E31 | 恢复错误隐藏在折叠项目区；正式图纸页提示仍称未进入 / Hidden/stale operation feedback | **FAIL** | UAT-03, UAT-07 |
| E32 | 浏览器断网保存失败、不假报成功；联网手动保存刷新后数量8 / Offline failure and online retry persistence | PASS | 25-offline-save-failure.png/.txt; RECOVERED_PASTE |
| E33 | 全4业务页三种尺寸可操作，但首屏与横向核价效率不足 / All pages/sizes usable, information hierarchy issues | **FAIL** | UAT-05, UAT-06; layout-* |
| E34 | 弹窗自动聚焦、Tab可用，但焦点逃出且Esc不关闭 / Modal focus escapes, Escape does not dismiss | **FAIL** | UAT-04; 07; 29 |
| E35 | Windows BAT启动、权限、中文路径、资源管理器下载 / Windows startup and filesystem integration | NOT TESTED | Linux cloud only |
| E36 | 内置PDF真实内容、多页、缩放视觉 / Native PDF page pixels and zoom | NOT TESTED | Headless viewer black; 26; page2 request only |
| E37 | Windows Excel公式实际重算、打印、分页 / Desktop Excel recalculation and print | NOT TESTED | OOXML read does not prove desktop behavior |
| E38 | 系统剪贴板权限、真实文件选择器及邮件/截图原件归档 / OS clipboard, native file chooser, source-attachment archival | NOT TESTED | Text filled/file chooser bypassed by Playwright; notes only for evidence source |
| E39 | 磁盘满、只读目录、断电写入等故障 / Disk-full/read-only/crash durability | NOT TESTED | Only browser-network interruption injected; no disk faults |
| E40 | 跨日自动备份轮换与长时间耐久 / Daily backup rotation and long-duration soak | NOT TESTED | One-day session; observed initial automatic backup, not multi-day rotation |

Evidence names in the table are relative to [evidence/](evidence/). See [EVIDENCE.md](EVIDENCE.md) for a complete clickable gallery and replay notes. PASS is limited to the specific data and actions above; it does not certify every permutation (e.g. nonempty incomplete quote confirmation, concurrent buyers, or every tier gap).

## 问题 / Findings

### UAT-01 — P2 — 导入分类无法筛选 / Imported categories cannot be filtered

**类型 / Type:** 功能错误、业务逻辑 / Functional, business workflow. **页面 / Page:** 供应商与分配，两种视角 / Supplier allocation, both views.

**步骤及数据 / Repro:** 导入 `items12.xlsx`（分类“虚构类别”）及异规格行（“另一类别”），进入分配页，展开“全部分类”，切到按供应商视角再检查。 / Import the material fixtures with categories 虚构类别 and 另一类别; inspect the category selector in both allocation views.

**预期 / Expected:** 可选择本项目实际分类，并据此批量选择。 / Actual project categories are selectable for scoped allocation.

**实际及影响 / Actual and impact:** 选项只有“类别A–F”；两个实际分类都不存在。选类别A得到0项。采购员无法用导入分类划分批量分配范围，需要搜索或手工选。未发现既有关联被覆盖。 / Only demo categories A–F appear; actual categories are absent. Selecting A yields zero rows. Buyers must fall back to search/manual selection; no allocation overwrite observed.

**证据 / Evidence:** [截图](evidence/10-category-filter-missing.png), [页面文本](evidence/10-category-filter-missing.txt), `actions.jsonl` contains the visible `assignCatFilter` options.

**建议 / Direction:** 从当前项目物料生成去重分类选项，两视角一致，刷新/导入后更新。 / Derive categories from current project materials and update both views after import/refresh.

### UAT-02 — P2 — 手工报价来源被误标 / Manual quote provenance mislabeled

**类型 / Type:** 功能错误、数据/追溯风险 / Functional, data provenance risk. **页面 / Page:** 报价回收、内部导出 / Quote recovery and internal workbook.

**步骤及数据 / Repro:** 为乙导入 `quoteB.xlsx`，重复002行拒绝后粘贴补002；通过“单条输入”填 TST-004、50元、6天、MOQ1，加入预览并写入，确认本轮，导出内部单。 / Import B quotes, correct duplicate 002 via paste, then manually enter TST-004 at 50, lead6, MOQ1; preview, write, confirm and export.

**预期 / Expected:** 004的操作来源应能区分为手工录入；供应商商务凭证类型与录入方法不混淆。 / Entry method should distinguish manual input from file import, independently of commercial evidence type.

**实际及影响 / Actual and impact:** SQLite该行 `source:"import"`，导出“报价来源说明”为 `import`；第二轮甲手工17元也标为import，而随后“修改”操作会标manual。价格正确，但采购员及审计无法可信区分原文件导入与人工补录。 / Saved B004 and manually entered A round2 price17 carry source=import; later prompt-edit carries manual. Prices are correct, but the input-method audit trail is inaccurate.

**证据 / Evidence:** [最终保存状态](evidence/final-business-state.json), [导出逐格检查](evidence/export-cell-inspection.json), [工作簿](evidence/final-comparison.xlsx), [UI行文本](evidence/24-manual-source-mislabeled.txt), `actions.jsonl` records manual field fills. The PNG at that point shows left columns; provenance is verified by the text/export/state, not inferred from invisible screenshot columns.

**建议 / Direction:** 按实际入口记录手工、粘贴、文件来源，保存原文件/行来源并与凭证类型分开。 / Track the actual input method and original file/row independently of evidence type.

### UAT-03 — P2 — 恢复失败反馈隐藏 / Restore refusal feedback is hidden

**类型 / Type:** 操作体验、异常处理 / UX, error handling. **页面 / Page:** 数据与备份 / Data and backup.

**步骤及数据 / Repro:** 有正式项目时保持“项目操作”折叠；打开“数据与备份”，选 `synthetic-s4-backup.zip`，点恢复；观察当前区域，再手动展开“项目操作”。 / In formal work, keep Project operations collapsed; open Data/backup, select full ZIP and restore, then expand Project operations.

**预期 / Expected:** 当前操作区立即显示拒绝覆盖原因。 / Refusal appears next to the restore action immediately.

**实际及影响 / Actual and impact:** 正确阻止恢复，但红色错误写入折叠区域。当前区域无反馈，展开项目操作后才可见“当前电脑已有询价，禁止直接恢复覆盖…”。采购员容易重复点击或误判未响应。数据保护通过，反馈可见性失败。 / Restore is correctly blocked; its red message is inside the collapsed Project section. The action appears unresponsive until that unrelated section is opened. Protection passes; feedback visibility fails.

**证据 / Evidence:** [操作后仍隐藏](evidence/20-nonempty-restore-refused.png), [展开后可见](evidence/23-restore-error-revealed.png), `actions.jsonl`: `HIDDEN_ERROR false` means the exact error locator was **not visible** before expansion.

**建议 / Direction:** 在恢复区域显示持久结果并用可访问的状态/错误通知；必要时自动展开错误所在区。 / Show persistent, accessible feedback in the restore area.

### UAT-04 — P2 — 弹窗焦点逃逸 / Modal keyboard focus escapes

**类型 / Type:** 操作体验、可访问性 / UX, accessibility. **页面 / Page:** 物料编辑弹窗 / Material edit modal.

**步骤及数据 / Repro:** 1024×768，双击 PASTE-001；自动聚焦编码后按Esc，再连续Tab12次。1366尺寸也检查Esc。 / Open PASTE-001 editor at 1024×768, press Escape, then Tab twelve times; Escape also checked at 1366.

**预期 / Expected:** aria-modal弹窗内循环焦点，关闭/取消后返回触发位置；支持Esc取消无改动弹窗。 / Keep focus inside the modal and return it after closing; Escape should dismiss the unchanged editor.

**实际及影响 / Actual and impact:** 初始焦点与可见焦点环正常；Esc不关闭。Tab经过保存按钮后到BODY，再到背景导航（截图显示报价回收图标聚焦），弹窗仍在。键盘采购员会失去上下文，可能操作背景。 / Initial focus and focus ring work. Escape does nothing; Tab after Save reaches BODY and background navigation while modal remains visible. Keyboard users lose context and can target background actions.

**证据 / Evidence:** [背景导航已聚焦](evidence/29-modal-focus.png), [初始Tab焦点](evidence/07-modal-keyboard.png), `actions.jsonl` `FOCUS_TRAIL`, `ESC_DIALOG_STILL_VISIBLE true`.

**建议 / Direction:** 实施焦点循环/背景inert、Esc关闭及返回焦点，保留显式未保存变更提示。 / Add focus containment, inert background, Escape handling and focus restoration with dirty-change protection.

### UAT-05 — P3 — 首屏优先级偏向重复框架 / First-screen priorities favor repeated framing

**类型 / Type:** UI视觉、操作体验 / Visual hierarchy, UX. **页面 / Page:** 报价回收、比价 / Quotes and comparison.

**步骤及数据 / Repro:** 在三种尺寸打开已有确认报价的项目，从页面顶端查看。 / Open confirmed quotes/comparison at each viewport and inspect the first screen.

**预期 / Expected:** 首屏能识别当前供应商/轮次状态、待处理异常或当前比价结果，非必要帮助可折叠。 / Prioritize supplier/round status, pending issues and current business results; collapse secondary help.

**实际及影响 / Actual and impact:** 标题、项目ID卡、黄色说明、管理入口、阶段导航层层占据上部空间（1366宽业务标题约y370）；已确认报价仍首先展示三种录入面板，汇总/明细在下方。1600×900时完整确认状态也接近底部。反复滚动核验，阶段切换效率下降。未发现按钮遮挡或整页水平溢出。 / Repeated framing consumes substantial height; even confirmed quotes prioritize three input panels above verification and detail. Repeated scrolling slows review; no blocked button or whole-page horizontal overflow was observed.

**证据 / Evidence:** [1024报价](evidence/layout-quotes-1024.png), [1366报价](evidence/layout-quotes-1366.png), [1600报价](evidence/layout-quotes-1600.png), [1366比价](evidence/layout-comparison-1366.png).

**建议 / Direction:** 收紧项目摘要，把“待处理/已确认/报价覆盖”提前；已确认状态折叠录入区，固定关键业务操作。 / Compact the project header, move status/coverage forward, collapse entry panels for confirmed submissions.

### UAT-06 — P3 — 宽表滚动丢失物料身份 / Wide quote tables lose row identity

**类型 / Type:** UI视觉、操作体验 / Visual, UX. **页面 / Page:** 报价明细（窄屏比价也需横滚） / Quote detail; narrow comparison also scrolls.

**步骤及数据 / Repro:** 1366宽的第二轮第二版，点击右侧“修改”，完成原生连续输入框；观察当前表格滚动位置。 / At 1366, edit R2/V2 via the far-right Modify button and inspect the resulting table scroll position.

**预期 / Expected:** 核对来源、备注、修改时仍能看到编码/RFQ行ID。 / Preserve code/line identity while inspecting right-side fields.

**实际及影响 / Actual and impact:** 横向滚动到操作列后，左侧编码与数量离开可视区；截图14从“上轮单价”开始。多行核价需要来回滚动确认，增加串行风险。本轮没有实际串行写错。 / Scrolling to actions removes code/quantity from view; screenshot14 starts at previous-round price. Buyers must scroll back to verify identity; no actual wrong-row write observed.

**证据 / Evidence:** [14-round2-revision2.png](evidence/14-round2-revision2.png), [1024比价横向范围](evidence/layout-comparison-1024.png).

**建议 / Direction:** 固定编码/RFQ身份列，精简默认列并提供列配置；行编辑使用含身份的单一表单。 / Freeze identity columns, offer compact column choices, and edit in one clearly identified form.

### UAT-07 — P3 — 正式图纸页保留错误引导 / Stale drawing guidance in formal work

**类型 / Type:** 操作反馈、业务文案 / UX, state messaging. **页面 / Page:** 图纸匹配与管理 / Drawing management.

**步骤及数据 / Repro:** 已保存正式项目含13条物料、2个PDF；打开图纸管理并进行匹配预览。 / Open drawing management on the saved formal project with 13 items and 2 PDFs; run a preview.

**预期 / Expected:** 提示说明当前行的图纸状态或下一步。 / Guidance reflects current project/row status.

**实际及影响 / Actual and impact:** 有正式项目和RFQ下拉选项，仍显示“请先进入正式工作并添加物料。”采购员会怀疑当前项目或保存状态，尽管图纸关联本身成功。 / Guidance still asks to enter formal work and add materials despite the real project/options. It casts doubt on project/save status; linking itself works.

**证据 / Evidence:** [08图纸面板](evidence/08-drawing-ambiguous.png), [30正式页文本](evidence/30-unique-invalid-drawing.txt).

**建议 / Direction:** 按真实项目及当前行更新提示，并与自动保存状态一致。 / Derive guidance from actual project/row state and align it with saving status.

## Windows 人工验证与放行边界 / Windows manual validation and release boundaries

先修复 UAT-01–04，针对同样的合成数据复验，再邀请少量采购员受控试用。没有发现阻止所有鼠标试用的 P0/P1，但不得将此结论扩大为生产数据安全、键盘无障碍或来源审计认证。 / Fix UAT-01–04, retest with the same synthetic inputs, then proceed with a small supervised buyer pilot. The absence of an observed P0/P1 is not a production-data, accessibility, or audit certification.

Windows仍需验证：`run_local.bat` / `run_ui_v2_pilot.bat`启动与停止、中文/空格路径及文件权限；Edge/Chrome真实PDF的两页内容与缩放/切换；真实剪贴板权限及文件选择器；Excel公式重算、金额、打印分页；备份迁移到全新目录及系统重启后再打开。跨日备份轮换、磁盘满/只读/断电恢复和原始邮件/截图附件归档仍为覆盖缺口。现有Windows CI不替代这些人工任务。 / Remaining Windows work covers BAT lifecycle, non-ASCII/spaced paths and permissions, visible PDF content/navigation/zoom, native clipboard/file dialogs, Excel recalculation/printing, clean-directory migration and reopening after restart. Daily rotation, disk/crash faults and original attachment archival remain gaps; Windows CI is not a replacement.

未自动修复任何问题、未合并任何分支。仅交付报告、合成输入、日志、截图、追踪及独立控制台脚本。 / No fixes or merges were performed. Deliverables are limited to reports, synthetic fixtures, logs, screenshots, traces and an independent console harness.
