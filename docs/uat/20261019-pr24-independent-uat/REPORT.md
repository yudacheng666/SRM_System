# PR #24 独立云端验收 / Independent cloud acceptance

**结论：核心业务与 V3 接入 PASS，附 1 个非阻断 P3 视觉问题。业务检查项 26 PASS / 1 FAIL（P3）/ 3 NOT TESTED；P1=0、P2=0、P3=1。可继续开发基线试用，建议由 ChatGPT 修正 P3。没有执行合并。**

依据：[Codex Cloud — TEST-ONLY independent review task](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6263313787)。已阅读 PR #24 说明、全部 4 条评论和精确候选提交；原始内容见 [GitHub 初始快照](evidence/github-initial.json)。没有仅根据代码或 CI 判断通过；本轮未重跑现有 41 项用例，以新设计的真实采购员操作路径和实际下载文件另行判断。

## 版本、环境与边界 / Versions, environment and boundaries

| 对象 | 精确值 |
|---|---|
| 本轮待测 HEAD | `67b1a7625db229e36ef4054127539e830d12079f` |
| PR 开发分支（未写入） | `feat/20261019-srm-ui-v3-integration` |
| 开发基线（未写入） | `457edcf4214220deacb4288b372ea78f144e5333` |
| main（未写入） | `f330de510f97c552629052ff1841d7223194e7f8` |
| 独立证据分支 | `test/20261019-pr24-independent-uat` |
| 真实浏览器 | Chromium `154.0.8037.57`、Playwright `1.58.2`，云端 Linux |
| 主测试时间 | 2026-10-19 19:49–19:59 Asia/Shanghai；原始日志 11:49–11:59 UTC |
| 应用启动 | 指定候选真实 `prototype/m1-lite/tests/e2e/serve.py`，调用正式 Python/SQLite/S4 启动流程 |
| 隔离数据 | `/tmp/p24/data` :8950；S4 空白恢复 `/tmp/p24/restore` :8951；有效 PDF 补验 `/tmp/p24/pdfdata` :8952 |

全新浏览器会话、全新 SQLite 目录；材料/供应商/商务条款/报价/PDF 全为虚构，不使用现有用户业务数据。通过 GUI 创建、导入、分配、修订、确认、定标、下载、恢复；SQLite 以 `mode=ro` 读取做独立核对，没有 API 灌入状态。主服务真实终止再启动一次，见 [服务器日志](evidence/server.log)。开始/结束 HEAD 一致，PR 仍 Draft、未合并，见 [结束元数据](evidence/github-final.json)及 [refs](evidence/remote-refs.txt)。测试完成后关闭本轮浏览器与三套临时服务。

提交仅包含本目录中的新增报告、原始证据与独立工具。没有修改产品、原有测试、CI、schema、PR 开发分支、开发基线或 main。

## 精确候选的 CI / CI associated with the exact candidate

| 工作流 | 原始结果 |
|---|---|
| [UI V2 #36 / 39228203050](https://github.com/yudacheng666/SRM_System/actions/runs/39228203050) | completed/success；Linux **41 passed / 0 failed / 0 skipped**，包括 UI V3 integration；Python 43、Node 10 pass；Windows business safety job success。 |
| [S3/S4 #123 / 39228203069](https://github.com/yudacheng666/SRM_System/actions/runs/39228203069) | completed/success；Linux **41 passed / 0 failed / 0 skipped**，包括 UI V3 integration；Python 43、Node 10 pass；Windows SQLite/backup/supplier ZIP job success。 |

两套运行关联同一候选 SHA，但原始 checkout 使用 GitHub PR 合成 merge commit `c8b2b5d4070b9243d53f6d36fe8485a91c246391`（将该候选合入上述基线）；本轮云端 GUI 则直接运行候选 `67b1a762…`。这一区别没有省略。两套 41 是同一套场景执行两次，不是 82 个不同业务场景。

**附件上传未成功：两套 Linux 日志均含 Artifact storage quota has been hit。** 工作流通过 `continue-on-error` 将附件上传设为非阻断；真实浏览器/Node/Python 测试均成功。没有声称 GitHub Actions 附件可下载。本次证据通过独立 Git 分支/Draft PR 提交。原始完整日志：[UI V2](evidence/ci-117979576313.txt)、[S3/S4](evidence/ci-117979576609.txt)，原始 jobs/steps 在 GitHub 初始快照。

## 独立检查项 / Independent case results

以下按业务/视觉检查项计数，不把每次导航、截图或 91 个辅助断言都计作新的业务用例。

| ID | 结果 | 检查与实证 / Check and evidence |
|---|---|---|
| T01 | PASS | 候选 HEAD、全部评论、最新 Actions 最终状态核对 / SHA and CI gate。初始/结束 GitHub JSON、原始 CI 日志。 |
| T02 | PASS | 正式 Python/SQLite 应用与隔离临时数据 / Real backend, fresh data。真实服务日志、SQLite 原始快照。 |
| T03 | PASS | V3 样式内嵌并实际加载 / Embedded V3 loaded。DOM 单个 style，84 条 CSS rules、body 14px/21px、深色侧栏 rgb(19,36,58)；无外部 script/stylesheet，无新增 backend 路由/依赖。 |
| T04 | PASS | 1024×768 五页面布局 / Five pages at 1024。页面无整体横向溢出、面板不被 64px 侧栏覆盖；宽表格可滚动。详见矩阵。 |
| T05 | PASS | 1366×768 五页面布局 / Five pages at 1366。字号、层级、间距清楚，面板与 226px 侧栏不重叠。 |
| T06 | PASS | 1600×900 五页面布局 / Five pages at 1600。表格和工具区协调，主内容优先于管理折叠项。 |
| T07 | PASS | 双向导航状态 / Sidebar and original tabs synchronized。物料→分配→报价→比价→设置及反向点击，侧栏 aria-current、tab.active、实际 panel 一致。 |
| T08 | PASS | 键盘焦点与激活 / Keyboard focus and activation。1024 下 Tab 到供应商按钮，2px 可见轮廓，Enter 激活；弹窗 Escape 关闭。 |
| T09 | PASS | 真实 PDF 入口/弹窗与实际渲染 / Real PDF entry and rendering。有效 PDF 独立补验截图显示 VALID FICTIONAL U24，关闭可达；未把最初空白帧当通过。 |
| T10 | PASS | 物料 Excel 导入 / Material import。3 行，同编码 M16/M20 分行、数量 10/25/4，ERP 扩展保留。 |
| T11 | PASS | 供应商及追加分配 / Suppliers and additive allocation。2 供应商；先按物料关联 A，再按供应商关联 B，3 行各 2 家共 6 关联。 |
| T12 | PASS | 真实报价 Excel 回收 / Quote file intake。A/B 均导入；不供货、明确未报价和正常报价区分，凭证/条款保留。 |
| T13 | PASS | 确认锁定的功能 / Functional confirmed lock。确认后按钮和修改项 disabled；没有覆盖原历史。视觉不足另记 P3-01。 |
| T14 | PASS | 修订与历史 / Revision and history。A R1V1=10/20，R1V2 将首行改 9；V2 草稿时比价仍 10，确认后变 9，原 V1 对象完全不变。 |
| T15 | PASS | 同范围比较与金额 / Comparison and arithmetic。有效两项；A590、B570、逐项最低540；不供货/未报价不算零元。 |
| T16 | PASS | 非最低价原因和定标 / Non-lowest reason and award。空原因被阻止，填虚构交付原因才保存；两项选 B，合计570。 |
| T17 | PASS | 实际 CSV / Actual CSV。BOM、真实 RFQ 编号、RFQ Line ID、各明细/合计及数量×价格独立重算正确。 |
| T18 | PASS | 实际内部业务与比价 Excel / Workbooks。3-sheet 业务表含 ERP；2-sheet 比价表含规格、轮次版本、选择原因；ROUND/SUMIF 引用和输入金额核对。未声称 Excel 原生重算通过。 |
| T19 | PASS | 设置入口与模板 / Settings and template。下载真实单工作表空模板，10 表头无业务行；本轮未重复全模块模板 round-trip。 |
| T20 | PASS | 导出无保存副作用 / Exports do not mutate state。CSV、报表、模板、完整备份前后 revision、raw snapshot SHA、业务及 PDF 哈希不变。 |
| T21 | PASS | 保存/F5 / Save and reload。报价三份已确认记录、选择原因、物料、分配和 PDF 全部精确恢复。 |
| T22 | PASS | 跨 RFQ 隔离 / RFQ isolation。已选 B 新建空白第二 RFQ，标题回退“选择左侧供应商”，无旧业务；再打开原项目完整保留。 |
| T23 | PASS | 真实进程重启 / Real server restart。终止再启动同候选、同临时目录，两 RFQ 全状态/版本/原始 SHA/PDF 不变，页面定标可见。 |
| T24 | PASS | 完整 S4 恢复 / Full S4 restore。下载 SQLite+PDF ZIP，至独立空白目录恢复；两 RFQ、三份确认历史、选择原因及 PDF 字节/SHA 精确相等；备份 SQLite integrity_check=ok。 |
| T25 | PASS | 非空恢复保护 / Nonempty restore guard。清楚显示已有询价禁止覆盖，恢复后数据无变化。 |
| T26 | PASS | 非法导入与清空预览 / Invalid preview and cancellation。错误表头 XLSX 有明确提示，等待自动保存及清空后 revision、行号、snapshot SHA、业务均无变化。 |
| P3-01 | **FAIL P3** | 已确认按钮仍有可操作视觉 / Disabled confirmation looks actionable，见下节。 |
| NT01 | NOT TESTED | Windows 本机 GUI / Native Windows desktop，云端 Linux 无该环境。 |
| NT02 | NOT TESTED | Windows 原生 Excel 重算、打印/安全提示 / Native Excel recalculation/printing/security UI，已检查文件内容及公式引用。 |
| NT03 | NOT TESTED | 真实企业采购员生产试用 / Production buyer UAT，严格只用虚构资料。 |

主路径项目 `RFQ-1792410575283-YUKBP3`：3 物料/2 供应商/6 关联/3 份 confirmed R1 版本记录；第二项目 `RFQ-1792410881813-D0F535` 为空白。有效 PDF 补验另用 :8952 独立 RFQ，没有改变前两项目。文件与状态独立检查见 [artifact-inspection.json](evidence/artifact-inspection.json)、[RESULTS.json](RESULTS.json)。

## 三分辨率视觉核对 / Three-resolution visual review

| 页面 / Page | 1024×768 | 1366×768 | 1600×900 |
|---|---|---|---|
| 物料/图纸 Items | [截图](evidence/viewport-1024-items.png) | [截图](evidence/viewport-1366-items.png) | [截图](evidence/viewport-1600-items.png) |
| 供应商分配 Allocation | [截图](evidence/viewport-1024-assign.png) | [截图](evidence/viewport-1366-assign.png) | [截图](evidence/viewport-1600-assign.png) |
| 报价回收 Intake | [截图](evidence/viewport-1024-quoteImport.png) | [截图](evidence/viewport-1366-quoteImport.png) | [截图](evidence/viewport-1600-quoteImport.png) |
| 比价定标 Comparison | [截图](evidence/viewport-1024-quotes.png) | [截图](evidence/viewport-1366-quotes.png) | [截图](evidence/viewport-1600-quotes.png) |
| 设置 Settings | [截图](evidence/viewport-1024-settings.png) | [截图](evidence/viewport-1366-settings.png) | [截图](evidence/viewport-1600-settings.png) |

独立查看全部 15 截图，并记录 [几何尺寸](evidence/responsive-geometry.json)。物料行/规格清楚，主按钮与风险操作可区分，管理区可折叠；1024 图标侧栏仍有 aria-label/title 及焦点提示。宽表格采用本地横向滚动，不能把屏外列误报为丢失；本轮实际滚动到报价右侧修改操作，且首列 RFQ 身份固定：[1024](evidence/table-1024-quote-right.png)、[1366](evidence/table-1366-quote-right.png)、[1600](evidence/table-1600-quote-right.png)。键盘焦点：[截图](evidence/keyboard-focus-1024.png)；1024 非最低价弹窗 520×296，位于视口内：[截图](evidence/14-modal-award-1024.png)。

**首屏观察不替代实际数据：** CI 的 first-row bottom=714.7 仅适用于其夹具。本轮长物料/供应商名称及关联 PDF 下，分配首行 bottom 为 768.69 / 769.03 / 804.03（对应三分辨率）。1024/1366 需要微小纵向滚动才完整看到首行下边缘，1600×900 可完整看到；控件和数据没有丢失。本轮不声称所有真实数据首行一定完全在 768 内。建议后续减少分配页上方状态/筛选区的固定纵向占用；作为布局改进建议，不单独升级为数据或阻断缺陷。

## P3-01：锁定按钮仍表现为可点击 / Locked button still looks enabled

- **等级/类型：P3，UI 视觉与操作体验；页面：报价回收。** 当前候选可复现；本轮未对开发基线另跑对照，不能断言由本 PR 首次引入。
- 复现：导入上述虚构 A 报价→确认 R1V1→新增本轮新版本→将首行改 9 并填写凭证→确认 R1V2→滚动到“03 完成异常核验后确认本轮”。
- 预期：已确认状态的按钮应有明显禁用样式或“已确认/锁定”标签，使用非可点击光标；采购员不用回看上方状态判断。
- 实际：`disabled=true`，但 background=`rgb(36,91,215)`、color=white、opacity=1、cursor=pointer，无 title 解释；仍显示“确认本次提交”。[截图](evidence/17-disabled-confirm-looks-active.png)、原始 browser.jsonl 中 `disabled button visual styles` 与 `lock badge`。
- 影响：采购员可能反复尝试一个实际不可操作的主要动作。**业务锁定本身正确，没有覆盖报价、金额或历史。**
- 建议：统一 `:disabled` 视觉，取消 hover/手形光标，已确认处明确提示需新增版本；交由 ChatGPT 修复。本次未修复。

## 证据可信度与限制 / Evidence qualifications

- [原始浏览器日志](evidence/browser.jsonl)完整保留所有操作、dialog、console、请求、91 个辅助 PASS 和 **5 条 driver-error**。其中：错误地将图纸 summary 当作 button、尝试点击按设计隐藏的 summary、独立脚本一次语法错误、在非物料页关闭不可见图纸抽屉、在新建后未重新展开历史项目抽屉。后续通过实际可见“图纸匹配与管理”和项目入口继续操作；没有 force-click、CSS 注入、DOM 状态伪造、产品修复或删除原始失败。`03a-drawing-entry-unreachable` 文件名仅是当时驱动诊断命名，不是产品不可达结论。
- 三个服务 origin 各一条 favicon.ico 404 console；全部新版页面 **0 pageerror**，无业务请求失败。日志中原生 PDF 的 chrome:// 与 chrome-extension:// 资源来自浏览器自身，不是产品外部依赖。
- 主路径初始自制 PDF 存在 stream-length 警告，初次 1.2 秒预览截图为空，**未标为渲染 PASS**。原件、警告和空白截图未改动。另生成无警告有效 PDF，使用独立目录真实上传，等待原生查看器加载后截图已显示内容：[有效预览](evidence/18-valid-PDF-after-15s.png)。主路径仍只对原 PDF 的上传、关联、持久化和备份恢复字节一致性判 PASS；不将该补验冒充原件渲染。
- [主 trace](evidence/independent-browser-trace.zip)与[有效 PDF 补验 trace](evidence/valid-PDF-supplement-trace.zip)原样归档；主 trace 已实际用 Playwright Trace Viewer 打开：[验证截图](evidence/trace-viewer-validation.png)。
- 源码检查只补充 GUI：V3 是 HTML 内嵌样式；backend 路由、依赖清单未变，浏览器无外部 HTTP 依赖，见 [source-integration-audit.json](evidence/source-integration-audit.json)。PR 自身包含附件上传策略调整，但本次测试没有改动任何工作流。
- 未声称穷尽全部旧业务边界、超大数据性能、所有模板重新导入、全部轮次/阶梯价组合；已按本任务实测上述受影响关键流程。Windows CI smoke 不等于 Windows GUI、原生 Excel 或生产采购员验收。

## English report

**Core business and V3 integration PASS with one non-blocking P3 visual finding: 26 PASS / 1 P3 FAIL / 3 NOT TESTED. No P1 or P2 found.** The reviewed and independently executed candidate is exactly `67b1a7625db229e36ef4054127539e830d12079f`. All four PR comments and its description were read. Both required Actions succeeded, each with 41 Chromium passes, Python 43 and Node 10. Their checkout is the recorded GitHub synthetic merge commit; the independent GUI ran the candidate directly. Artifact uploads in both CI logs failed due to storage quota despite successful business tests; this report supplies separate Git-backed evidence.

Real Chromium operated the real Python/SQLite M1-Lite application using three fresh, isolated, synthetic-only directories. Fifteen page/resolution screenshots cover 1024×768, 1366×768 and 1600×900. The document has no horizontal overflow and active panels do not overlap the sidebar. Wide tables remain locally scrollable; right-side controls and frozen RFQ identity were observed. Sidebar/original-tab navigation, keyboard focus, modal close behavior and a valid real PDF render passed. Embedded V3 CSS was verified in the loaded DOM (84 rules) and computed styles, with no new backend route or dependency manifest change and no external HTTP resource dependency.

The buyer flow imported three materials, including two specs sharing one code; imported two suppliers and additively allocated all six relationships; imported and confirmed both quotes; created and edited an A revision, verified drafts did not affect comparison and the prior confirmed version remained unchanged; required a reason for the higher-price award; saved, refreshed, switched RFQs, restarted the actual server and restored a full S4 backup into a separate empty directory. All corresponding state/revision/raw snapshot hashes/PDF hashes matched. Invalid import and preview cancellation did not change saved state. Actual CSV and two workbooks were inspected: A=590, B=570, theoretical minimum=540, awarded=570. A cannot-supply and B explicit no-quote were not converted to zero.

**P3-01:** the confirmed/locked “确认本次提交” button is disabled functionally but remains saturated blue, opacity 1 and cursor pointer. It looks actionable when scrolled away from the lock badge. Provide clear disabled styling and a locked label/explanation. No history overwrite or data loss occurred; introduction by this PR was not established by a baseline GUI comparison. Recommend continuing development-baseline trial while ChatGPT resolves this visual issue. No merge is performed or implied.

Five independent-driver errors and the initial malformed synthetic PDF/blank early frame are preserved and explained. A separate well-formed PDF was really uploaded and rendered successfully; the original bytes were not edited. Windows desktop GUI, native Excel recalculation/printing/security UI and production buyer UAT remain NOT TESTED. Only new test evidence/documentation/tools are committed; product code, existing tests, CI, development branch, development baseline and main are untouched. No PR was merged.
