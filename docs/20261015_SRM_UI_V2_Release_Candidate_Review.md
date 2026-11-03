# 20261015 SRM UI V2 · 统一候选验收与审批清单
# 20261015 SRM UI V2 · Unified Review Candidate and Approval Checklist

## 一、版本定位 / Version and Scope

- 本文对应分支 `release/20261015-ui-v2-review-candidate`。基线：`draft/20261013-m1-storage-ui-audit`。
- This document belongs to `release/20261015-ui-v2-review-candidate`; target baseline is `draft/20261013-m1-storage-ui-audit`.
- 用户已初步认可 B1–B3 真实 Chromium 截图，允许推进统一验收版；尚**未**明确授权合并任何分支或发布。
- The user found the B1–B3 real-browser screenshots acceptable and requested continued preparation; **no permission to merge or release** has been given.
- 内容包括 B1 深色导航及物料、B2 双向供应商分配、B3 多轮报价与比价，以及最后的窄屏/输入区易用性改进。
- Scope covers B1 sidebar/items, B2 bidirectional allocation, B3 quotation/comparison and narrow-screen/input-first usability refinements.
- 此候选版并非 `main`，未经明确确认不得自动合并、覆盖或发布。
- This candidate is not `main`; do not automatically merge, overwrite or release it.

## 二、统一变更范围 / Consolidated Code Changes

| 范围 / Area | 候选变更 / Candidate Changes | 保持不变 / Preserved |
|---|---|---|
| 工作台 / Workspace | 深色侧栏、真实保存状态、统一页头、键盘/鼠标提示 / navy shell, real save status, keyboard/hover labels | 原项目、保存与备份事件 / original workspace and persistence handlers |
| 物料与图纸 / Items and PDF | 更清晰表格、批量选择、首屏内容优先 / clearer tables and contextual selection | 物料 ID、PDF 匹配确认及真实导入 / original import, drawing bytes and matching |
| 供应商分配 / Allocation | 覆盖 KPI、双向切换、三态列表及 1024px 首屏优化 / coverage KPIs, both directions, tri-state status and laptop fold | 多对多追加、分配范围和询价单导出 / additive mapping and export |
| 报价回收 / Quote intake | 先输入后核验再确认，轮次及凭证主次清晰 / intake before validation then confirmation | 轮次锁定、修订、证据和阶梯价 / round locking, versions, evidence, tier prices |
| 比价议价 / Comparison | 逐项比价表优先，金额分析靠后 / actionable line table before secondary analytics | 同范围比较、非最低原因与计算 / comparable-scope and award calculations |
| 测试 / Verification | 4 组独立 E2E 场景及一套统一 CI / four isolated E2E suites and one unified CI | 既有 Python/Node/Playwright 业务测试 / original business tests |

## 三、已获得的证据 / Evidence Already Established

- 最终探索式提交 `cdf033be`：真实 Chromium 3/3 PASS（1024×768、1366×768、1600×900，五个真实页面）。
- Final exploratory commit `cdf033be`: real Chromium exploratory 3/3 PASS across three widths and five actual screens.
- 同提交的完整业务回归：Linux Chromium 22/22 PASS，Windows Python/Node 后台测试 PASS。
- On the same commit: Linux 22/22 Chromium tests PASS and Windows backend/Node checks PASS.
- 1024×768 供应商列表第一行底部约 728px，报价输入区起点约 465px；整页不横向溢出。
- At 1024×768, allocation's first row ends around 728px and quote entry begins around 465px; no document-wide horizontal overflow.
- 前序独立验收记录：`https://github.com/yudacheng666/SRM_System/actions/runs/38726718401`（完整）与 `https://github.com/yudacheng666/SRM_System/actions/runs/38726718263`（探索）。
- Prior evidence includes a complete workflow run and a separate exploratory Chromium run.
- 统一候选版已收敛先前按阶段触发的 6 条独立 CI 工作流为 `.github/workflows/srm-ui-v2-unified-acceptance.yml`；其结果需要另行确认，不能用上面的旧验收代替。
- All 6 temporary per-stage CI workflows have been superseded by one unified candidate workflow; **new candidate run must pass separately**.

## 四、Windows 隔离试用方法 / Isolated Windows Pilot

**注意：试用必须用虚构采购数据，不能把真实业务资料导入试用库。**
**Important: Use synthetic test data only; do not import actual procurement records.**

1. 打开仓库候选分支 `https://github.com/yudacheng666/SRM_System/tree/release/20261015-ui-v2-review-candidate`，在 **Code → Download ZIP** 下载整个候选分支并解压。
1. Open the release candidate branch and download/extract the full repository ZIP.
2. 双击 `prototype/m1-lite/run_ui_v2_pilot.bat`，而不是双击 `index.html` 或旧的 `run_local.bat`。
2. Double-click the dedicated `run_ui_v2_pilot.bat`, **not** `index.html` or the regular launcher.
3. 需要 Windows 已配置 Python 3.10+；自动在浏览器打开 `http://127.0.0.1:8765/`。如果此端口已被其他 SRM 实例占用，应先关闭旧实例。
3. Requires working Python 3.10+; browser opens at the loopback URL. Close any other instance using the same port first.
4. 候选试用 SQLite、PDF 附件和备份隔离保存到 `%LOCALAPPDATA%\SRM-Lite-V2-Review`；不会读取正常程序目录 `%LOCALAPPDATA%\SRM-Lite`。
4. Pilot database, PDFs and backups go to a separate `SRM-Lite-V2-Review` folder, not the normal `SRM-Lite` data directory.
5. 关闭运行服务的命令行窗口即可停止服务，试用数据不会自动删除；需人工确认后再清理试用目录。
5. Close the command window to stop the local server. Review data persists until explicitly cleaned up.
6. 试用此版本不意味着批准合并、正式上线或使用真实供应商数据。
6. Trying this version does not authorize merge, deployment or processing of real supplier data.

## 五、人工验收要点 / Manual Acceptance Gates

- 视觉：物料、供应商、报价回收、比价和字段设置均可识别当前位置、当前 RFQ、保存状态和主要操作。
- Visual: five screens communicate location, current RFQ, real save state and primary actions.
- 物料/图纸：虚构 XLSX 录入、列筛选、批量勾选、PDF 候选匹配与人工确认。
- Items/drawings: synthetic XLSX, column filters, bulk selection, PDF candidate matching and manual confirmation.
- 供应商：同一批物料可以追加多家供应商，从反向视图查看时不丢失历史关联；未覆盖 100% 仍可导出已覆盖询价单。
- Suppliers: append multiple supplier relations without overwriting; partial coverage export remains supported.
- 报价：不同供应商/轮次/修订、缺报或异常、高低报价比较、确认锁定、阶梯价和凭证说明。
- Quotes: supplier/round/revision, missing/extra quotes, confirmed locking, tier pricing and evidence notes.
- 比价：逐项价格、共同有效报价范围、非最低价选择说明、导出 Excel 中的计算与议价过程。
- Comparison: line-level quotes, valid comparable scope, non-lowest selection reasoning and export integrity.
- 保存：刷新或重新打开当前询价、手动保存、自动保存、JSON 与 S4 完整备份恢复均不丢数据。
- Persistence: refresh/reopen, manual/autosave and complete backup restore integrity.
- 边界：正式旧工作区不应被候选试用覆盖，所有测试均使用虚构名称和物料编码。
- Isolation: pilot must never overwrite the ordinary SRM SQLite database; all demo content is fictional.

## 六、合并审批要求 / Merge Approval

- 首先检查统一候选 CI 在 Linux/Windows 的 **新运行结果 PASS**，并查阅截图及失败记录。
- First verify the **new candidate CI run** on Linux and Windows and review screenshots/failures.
- 再完成人工视觉及关键采购操作试用；记录发现的问题并单独修复验证。
- Then complete manual buyer UI and critical workflow review; address any issues in a separate reviewed commit.
- 若要合并到开发基线 `draft/20261013-m1-storage-ui-audit`，须获得明确批准；本步骤与将开发基线合并进 `main` 是两个不同审批。
- Merging to the development baseline needs explicit approval; merging the development baseline into `main` requires **a separate** explicit approval.
- 当前不应把四个旧 Draft PR 与统一 PR 分别都合并；**统一候选版已包含之前所有阶段的累计变更**，否则会重复操作或产生冲突。
- Do **not** merge the four old stacked Draft PRs independently in addition to the unified candidate: it already contains the complete cumulative changes.
