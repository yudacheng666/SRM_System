# PR #20 INTEG-01 + BASE-01 独立云端复验 / Independent cloud retest

**结论：BASE-01 与 INTEG-01 在本候选均 PASS。候选业务验收 22 PASS / 1 FAIL（非阻断 P3 提示问题）/ 3 NOT TESTED。两套 Actions 均成功。建议用户将 PR #20 合入开发基线；本次没有执行任何合并。**

任务：[最新 Codex 指令](https://github.com/yudacheng666/SRM_System/pull/20#issuecomment-6220909793)。本轮执行于 2026-10-17 01:30–01:42（Asia/Shanghai；原始日志为 2026-10-16 UTC）。报告统计按下列独立业务检查项计算，不把 CI、截图或辅助断言当作额外业务用例。

## 版本与环境 / Versions and environment

| 对象 | 精确值 |
|---|---|
| 当前候选、测试工作树起点 | `244dc7c9088cee2e1f0e9488156c249dfbb59ac3` |
| 本轮旧版 BASE-01 对照 | `dec5e480cf87441972da05f1074dfa3589285b30` |
| 开发基线（未修改） | `420d2af326a3f59c1c6015d6b0fe44db23fe0fc6` |
| main（未修改） | `f330de510f97c552629052ff1841d7223194e7f8` |
| 证据分支 | `test/20261017-pr20-base01-retest` |
| 浏览器 | 真实 Chromium `154.0.8037.57` + Playwright `1.58.2`，1366×768 |
| 应用 | 仓库真实 M1-Lite `tests/e2e/serve.py`，S4 SQLite + PDF 模式 |
| 隔离 | 全新 `/tmp/srm-r2-old-data`、`srm-r2-data`、`srm-r2-restore-data`、`srm-r2-f1-data`；端口 8945–8948 |

全部材料、供应商、凭证、图纸和报价为虚构。通过浏览器页面新建、导入、分配、录价、确认、切换、下载和恢复；数据库只以 SQLite `mode=ro` 读取做独立核对。没有 API 灌入业务数据，没有改动产品、既有测试、CI 或 schema。本轮没有重新运行仓库现有测试，以真实 GUI 新场景加实际下载文件校验独立判断。服务在空白项目和完整报价项目阶段各实际终止并重启一次，使用相同候选和同一临时数据目录；启动记录见 [服务器日志](evidence/new-server.log)。完成后关闭本轮浏览器与测试服务。

开始、结束时确认 PR #20 HEAD 均为上述候选且仍 Draft/未合并；[最终 GitHub 元数据](evidence/ci-final.json) 与 [refs](evidence/remote-refs.txt) 保留核对结果。

## 原版与修复版对照 / Defect controls

| 缺陷 | 原版实证 | 当前候选 |
|---|---|---|
| BASE-01 供应商身份跨 RFQ 残留 | **本轮重新复现**于 dec5e48：正式项目导入 3 物料/2 供应商、双向分配，供应商视角选 RET-B，直接新建另一空白 RFQ。抛出 `Cannot read properties of undefined (reading 'name')`，文本仍含旧 B 标题。原项目快照未变。[截图](evidence/old-BASE01-reproduced.png)、[页面文字](evidence/old-BASE01-reproduced.txt)、[原始浏览器日志](evidence/browser-actions.jsonl)和 trace。 | **PASS**：新 RFQ 列表空、标题“选择左侧供应商”，供应商/物料/关联均空；自动保存、F5、真实重启仍正确；反向切回及已确认报价后切换也不串数据。新版各页面 **0 pageerror**。 |
| INTEG-01 CSV 缺少真实 RFQ 身份 | 原集成版 420d2af3 的 CSV 缺少身份已在**上一轮**真实重现，见 [上一轮报告](https://github.com/yudacheng666/SRM_System/pull/20#issuecomment-6220094085) 与 [证据 PR #21](https://github.com/yudacheng666/SRM_System/pull/21)。**本轮没有重新运行 420d2af3 CSV 原版对照**，不冒充新复现。 | **PASS**：本轮两正式 RFQ、8 份实际 CSV + 1 演示 CSV，逐个检查原始字节、完整表头、各明细及合计行、金额和保存快照；刷新/真实重启后再次下载验证。 |

新建前后截图：[新建空白](evidence/03-new-BASE01-cleared.png)、[F5](evidence/04-empty-P2-F5.png)、[首次实际重启](evidence/05-empty-P2-real-restart.png)、[切回](evidence/06-return-P1-unselected.png)、[移出活动 B](evidence/07-active-B-removed-reset.png)、[有历史时拒绝移出](evidence/08-confirmed-B-removal-refused.png)。旧版截图为当时操作视口，完整旧标题与异常以同一时刻的页面文字和 trace 为证。

## 独立业务检查 / Independent business checks

| ID | 结果 | 实操与实际结果 / Evidence |
|---|---|---|
| B01 | PASS | B 已选时新建 RFQ：供应商列表空，标题重置，无新版 JS 异常。03 截图 + `new-P2-empty.json`。 |
| B02 | PASS | 等待自动保存，新 RFQ 物料/供应商/关联全空；旧 P1 revision、raw snapshot SHA 不变。`new-empty-P2-checked.json`。 |
| B03 | PASS | 空白 P2 F5 后仍空、标题未选择，完整持久化快照不变。04 截图。 |
| B04 | PASS | 终止并重启服务，空白 P2 无旧关联，P1 也完整保留。05 截图及 `new-empty-P2-restarted.json`。 |
| B05 | PASS | 在 P2 真正导入 2 物料/2 供应商并分配，选 A 再打开 P1；标题重置，两个 RFQ 快照相同且隔离。06 截图。 |
| B06 | PASS | P2 中选 B 后移出 B；标题回退未选择，B 关联清除而 A 的两条关联保留。07 截图。 |
| B07 | PASS | 经 GUI 将 B 重新加入并录入、确认 R1；再次移出被报价历史保护拦截，快照和 B 参与关系不变。08 截图。 |
| B08 | PASS | 两 RFQ 均有已确认 R1 后，P1/B → P2/A → P1，均重置视图且报价/关系/版本/快照不变。`after-quoted-cross-switch.json`。 |
| I01 | PASS | 两正式 RFQ 实际 CSV 建议文件名、首列表头“RFQ编号”及每条明细/合计行均带本项目 workspaceId。 |
| I02 | PASS | P1/P2 都使用 RFQ-L00001、RFQ-L00002，依然由 workspaceId 清楚区分；原 RFQ Line ID 列保留。 |
| I03 | PASS | 9 份 CSV 均 UTF-8 BOM；中文、逗号、双引号、换行可解析；`+/-/=/@` 开头字符串加安全前缀，不改变数值计算。 |
| I04 | PASS | P1 A/B 同范围金额 340/370，逐行 10×10+20×12 与 10×11+20×13；P2 A/B 53/54，3×7+4×8 与 3×6+4×9。明细及合计按 Decimal 独立重算。 |
| I05 | PASS | 两 RFQ F5 后实际下载文件仍各带正确身份、金额及行号。 |
| I06 | PASS | 完整报价后第二次实际服务重启，P1 → P2 → P1 三次下载一致，各自 RFQ 身份未串。 |
| I07 | PASS | 每一次 CSV 导出前后，全体工作区 revision、raw snapshot SHA、业务状态和 PDF 哈希相同；演示导出无正式工作区副作用。 |
| I08 | PASS | 演示文件名及行身份明确为演示 RFQ，未冒充正式 RFQ。见 `new-demo.csv`。 |
| R01 | PASS | F1：第三独立 RFQ 先建占位行，再导入 P1 ERP 材料；当前行号 00002/3/4，来源行号 00001/2/3，两列独立且唯一。ERP 扩展完整，无供应商/报价/PDF 泄漏。实际再导出的 `F1-business.xlsx` 已按列名检查。 |
| R02 | PASS | F2：同编码同名称但 M16/M20 独立显示、分配；多对多追加保留双方关系；两真实不同 PDF 与各行匹配。09 截图与供应商实际 ZIP。 |
| R03 | PASS | F3：P1 支架 A=不供货、B=明确未报价，未作为零元；各供应商有效范围仅两项；两 RFQ 共 4 份已确认 R1 记录在切换/刷新/重启/恢复后保留。10/12 截图、快照。未声称覆盖所有 F3 多轮边界。 |
| R04 | PASS | 真实下载 A/B 各自供应商询价 ZIP：3 物料、仅各自范围、报价空白、无另一供应商和 ERP 私有扩展，2 PDF 原始字节哈希一致；缺图支架有明确提示后才导出部分。内部业务 Excel 仍保留 ERP 字段。 |
| R05 | PASS | S4 GUI 下载完整备份再恢复至另一个空白数据目录，2 RFQ、全部状态/已确认 R1/2 PDF/原始快照 SHA 完全相等；备份 SQLite 只读 integrity_check=ok。11/12 截图与语义对比。 |
| R06 | PASS | 同一已恢复且非空数据库再次请求恢复，未执行第二次 restore POST；业务数据/版本/PDF 均不变。保留原始操作、服务器日志与 `restore-overwrite-refused.json`。 |
| UX01 | **FAIL P3** | 新建空白 RFQ 后旧“成功变更 3 条实际关联”操作提示仍显示；见下一节。 |
| NT01 | NOT TESTED | Windows 本机 GUI：本任务云端 Linux，无 Windows 桌面。 |
| NT02 | NOT TESTED | Windows 原生 Excel 打开/安全警告：只做实际文件字节及 openpyxl 检验。 |
| NT03 | NOT TESTED | 真实采购员生产 UAT：本轮独立模拟且全部虚构数据。 |

数据：P1 `RFQ-1792171936958-2NMR1M`，3 物料、2 供应商、6 关联；P2 `RFQ-1792171949667-DXNBVT`，2 物料、2 供应商、4 关联（移出 B 时为 2，重新加入后为 4）。详见 [文件检验](evidence/csv-parsed.json)、[F1 检验](evidence/F1-inspection.json)、[外发隔离及 PDF 哈希](evidence/xlsx-pdf-inspection.json)、[独立状态比较](STATE-COMPARISON.json)。

## 非阻断问题 / Non-blocking finding

**UX01 / P3 / 操作体验问题 / 供应商与分配。**

复现：在 P1 按物料选择全部 3 行，为 A 添加关联，再在供应商视角选 B；直接新建空白 P2。预期：清除属于 P1 的成功提示，或显示当前空白项目状态。实际：[03 截图](evidence/03-new-BASE01-cleared.png)及[原始文字第 59 行附近](evidence/03-new-BASE01-cleared.txt)仍显示“为选中物料添加供应商：成功变更 3 条实际关联”，与此同时当前 RFQ 是新 P2，统计和持久化关系均为 0。影响：采购员可能误以为新询价已有分配。F5 后提示消失（04），不存在实际数据串写。建议切换/新建 RFQ 时同步清除项目级操作反馈。没有自行修复。

该 P3 不否定两个目标缺陷的消除，不阻止继续开发基线试用；本轮未发现新增 P0/P1 或保存丢失风险。

## CI 原始结果 / Exact-head CI

| 工作流 | 状态 | 原始日志中的实际测试数 |
|---|---|---|
| [S3/S4 38938757220](https://github.com/yudacheng666/SRM_System/actions/runs/38938757220) | completed/success | Linux Playwright **40 passed / 0 failed / 0 skipped**；#14 18.0s、#15 13.0s；Python 43，Node 10 pass；Windows smoke job success。 |
| [UI V2 38938757239](https://github.com/yudacheng666/SRM_System/actions/runs/38938757239) | completed/success | Linux Playwright **40 passed / 0 failed / 0 skipped**；#14 20.8s、#15 15.3s；Python 43，Node 10 pass；Windows smoke job success。 |

两套运行针对同一完整候选 SHA；不是 80 个不同场景。日志摘要：[S3/S4](evidence/ci-job-117100815272-summary.txt)、[UI V2](evidence/ci-job-117100815642-summary.txt)，含原始时间戳与计数；[初始 jobs](evidence/ci-initial.json)及[结束状态](evidence/ci-final.json)。上一候选 #14 定位器超时不是本轮状态；当前 #14/#15 都成功。独立 GUI 另行确认真实产品行为，未编辑任何回归定位器。

## 原始异常与校正 / Raw evidence qualifications

- 浏览器原始 43 个辅助 check：41 true、2 false。两次 false 都来自 S4 的 `JSON.stringify` 键插入顺序比较；逐字段相等，原始 revision、snapshot SHA 以及 PDF 哈希也一致。保留原始 false，不改写；[语义对比](evidence/S4-semantic-comparison.json)及日志中的 `S4 semantic equality correction` 均为 true。
- 第二次实际服务重启后首次 `page.goto` 超过驱动 15 秒等待；同一页面随后完成 API 加载，健康检查成功，继续原页面执行并核对全状态和三份 CSV。1 条原始 driver-error 完整保留，不冒充首次导航成功。
- F1 初版文件检查器错误假定“来源 RFQ Line ID”必须是末列，报 AssertionError；实际来源列正确但之后还有 ERP 扩展。以**列名**重新读取通过，原/更正脚本与两份输出均归档。这是测试假设纠正，没有修改产品或 XLSX。
- 新版 8946/7/8 均 **0 pageerror**；旧版 8945 有 1 个预期 BASE-01 异常。四个 origin 各有一条 favicon.ico 404 console 噪声，服务器日志可定位；未将其隐去或声称所有 console 绝对为空。
- 浏览器 trace 已实际通过 Playwright Trace Viewer 打开，见 [验证截图](evidence/trace-viewer-validation.png)和[文字](evidence/trace-viewer-validation.txt)。独立脚本路径为本轮临时环境路径，复跑需修改环境路径/数据根；不是产品测试套件。

## English summary

**BASE-01 and INTEG-01 PASS on exact candidate `244dc7c9088cee2e1f0e9488156c249dfbb59ac3`. Independent candidate cases: 22 PASS, 1 non-blocking P3 FAIL, 3 NOT TESTED.** BASE-01 was freshly reproduced on dec5e48 this round. The original 420d2af3 CSV failure is explicitly cited from the previous independently captured evidence, not claimed as rerun here.

Real Chromium operated the real SQLite application using fresh, synthetic-only directories. Empty/new and populated RFQ flows were tested across selection, reverse switching, removing the active supplier, confirmed-history protection, F5 and two actual service restarts. Nine actual CSV downloads (eight formal, one demo) passed workspace identity, every detail/total row, local line IDs, BOM/escaping, amount arithmetic and revision/snapshot immutability checks. F1 current/source ERP identities, F2 conflicting specs and real PDFs, F3 cannot-supply/explicit no-quote and confirmed histories, supplier export isolation, and full S4 restore were checked.

UX01 is a stale previous-RFQ allocation success message after creating an empty RFQ. It clears on F5; actual new-RFQ relations remain empty. Clear project-scoped feedback on creation/switch. This P3 does not block development-baseline trial. Both exact-head Actions workflows completed successfully, each with 40 Playwright passes (including 14/15), zero failures/skips. Windows CI smoke success does not imply Windows GUI/native Excel acceptance.

Raw evidence retains one navigation timeout, two order-sensitive S4 false comparisons and a corrected header-position inspector assumption; subsequent semantic/file checks passed without product changes. Windows GUI, native Excel and real production buyer UAT remain NOT TESTED. **Recommend the user merge PR #20 into the development baseline after review; no merge or main/development-branch modification was performed. Stop after publication.**
