# SRM_System PROJECT_STATE / 项目当前有效状态

> 核实日期 / Checked: 2026-10-22. Snapshot from actual GitHub refs, exact-commit Actions and user-provided GitHub annotation; not continuous monitoring.
> 此文件由已合并的 PR #47 初始化到 M1 开发基线；本次续开发状态更新在单独的 Draft 文档 PR 中，合并前不属于开发基线。

## Goal / 产品目标

- 本地轻量 SRM：物料 → 多供应商询价分配 → Excel/PDF 询价包 → 回收报价/多轮议价 → 同范围比价与定标 → SQLite 历史和 S4 安全备份。
- Lightweight local RFQ lifecycle with supplier-specific documents, revisions, traceable price comparison and backup; suppliers do not log in.
- 当前为 Windows localhost + SQLite 采购员试用开发版，不是正式部署的 ERP/多用户系统。
- No real enterprise data in GitHub, even in private repos; only synthetic fixtures.

## Branch truth / 当前分支和版本

| Layer / 层级 | Verified ref / 准确版本 | Status / 状态 |
| --- | --- | --- |
| 正式主线 / Main | main @ \`f330de510f97c552629052ff1841d7223194e7f8\` | M0 prototype and comparison only; **not M1**, no new release |
| M1 开发基线 / Development | draft/20261013-m1-storage-ui-audit @ \`b0629a06a7ab2880fc86427e26a953d722487a57\` | M1 Lite, SQLite, ERP core fields, V3.1, S4 and merged #47 memory |
| 已批准 UI 设计 / Design | [#44](https://github.com/yudacheng666/SRM_System/pull/44) Draft @ \`8e643520\` | Architecture and acceptance matrix only, not product code |
| 并行历史候选 / Alternate | [#45](https://github.com/yudacheng666/SRM_System/pull/45) Draft @ \`4480482c5bbb280257c06aa44889706705663280\` | Two CI SUCCESS on that SHA, **not** evidence for #46 |
| 当前 UI 产品候选 / Active UI | [#46](https://github.com/yudacheng666/SRM_System/pull/46) Draft @ \`c2737f0221a7b529114da2df363e062e75c7544c\` | New filtered pagination; **not tested in real browser on this SHA**, not merged |
| 项目记忆 / Memory | [#47](https://github.com/yudacheng666/SRM_System/pull/47), merged 2026-10-22 | AGENTS.md + PROJECT_STATE + DECISIONS + original session now on M1 dev, not main |

## Validated development history / 已核实开发和证据

- M1 development has local SQLite persistence/round history, imported XLSX/CSV, RFQ supplier assignment, quote-tier applicable pricing, line-level awards, original PDF per RFQ line, supplier-isolated ZIP exports and safe empty-target-only S4 restore.
  这些能力属于 M1 开发基线，不代表完整采购员现场实机验收。
- ERP Chinese core fields and unknown-column retention were integrated; semantics of the complete historical ERP field dictionary remain unverified.
  ERP 全字段语义与现场源数据尚未完成核验。
- Scope-specific TEST-ONLY evidence: #33 S4 feedback, #34 S4 restore, #39 export/navigation at \`9633c03\`, and #43 C08/C09 at \`c8429ef\`. These are exact-SHA limited acceptance reports, not blanket approval of future UI code.
  不把历史 PASS 迁移为新提交 PASS。
- PR #45 CI: [UI 39729243552](https://github.com/yudacheng666/SRM_System/actions/runs/39729243552) SUCCESS, [S3/S4 39729243554](https://github.com/yudacheng666/SRM_System/actions/runs/39729243554) SUCCESS. It remains a separate unmerged UI candidate.

## Most recent development / 最新续开发

- [Commit c2737f0](https://github.com/yudacheng666/SRM_System/commit/c2737f0221a7b529114da2df363e062e75c7544c) on PR #46 edits only \`prototype/m1-lite/index.html\` and \`prototype/m1-lite/tests/e2e/ui-ux-structural.spec.cjs\`.
- Fixes quote comparison's “仅显示待人工决定”: filter **valid quotable lines before pagination**, respect original full-list item index for pricing, preserve unfiltered totals/decision overview, reset pager and show accurate filtered count.
  解决以前“只隐藏当前页行，导致空白页和统计不符”的静态可确认逻辑问题。
- Added isolated synthetic 12-line Chromium+SQLite E2E covering two pages (10+2), read-only filter, real award selection and full-scope counts.
  8 个页面内嵌 JS 和新增测试源码 V8 语法解析 PASS；**不是 E2E 执行成功**。

## CI blocker / 自动化阻断

- Exact PR #46 HEAD \`c2737f0\` triggered [S3/S4 run 39743002740](https://github.com/yudacheng666/SRM_System/actions/runs/39743002740) and [UI run 39743002722](https://github.com/yudacheng666/SRM_System/actions/runs/39743002722); both concluded FAILURE **before test execution**.
- 4 jobs: \`steps=[]\`, blank runner assignment, ~2–3 s duration. User's prior Actions annotation explicitly says: "The job was not started because recent account payments have failed or your spending limit needs to be increased."
- The account-side blocker is established, but **which payment/budget subcondition** caused it remains UNVERIFIED. No product assertion has run on the latest SHA; never call the implementation PASS or FAIL.
  按用户决定：不充值，等待十一月检查额度/账户状态；不能保证账户问题会自动恢复，暂不手动反复重跑。
- The PR stays Draft. **Temporary exception authorized 2026-10-22:** Codex Cloud may run *pre-CI TEST-ONLY* on exact SHA as evidence, but this cannot replace green GitHub CI, the formal independent release gate or user approval for any merge. [Task Issue #49](https://github.com/yudacheng666/SRM_System/issues/49) has full instructions. The [PR #46 @codex dispatch](https://github.com/yudacheng666/SRM_System/pull/46#issuecomment-6335844250) was **BLOCKED**: Codex bot explicitly requested a cloud environment for this repo. **No Codex test began**; user must configure environment before re-triggering the same task.

## Open gates / 后续门槛

1. Windows 本地隔离模拟数据体验 PR #46：报价导入、待决定筛选/分页、人工定标、工作区状态、PDF 与报表。Do not touch real purchasing records.
2. In November, first check GitHub Actions billing/spending-limit account state; rerun exact HEAD UI + S3/S4 only when runner allocation works.
3. First configure a Codex Cloud Environment for this private repo; then re-trigger **Issue #49** once as temporary pre-CI TEST-ONLY, recording actual results on a Draft evidence PR. ChatGPT fixes confirmed issues. Formal exact-SHA GitHub Actions green and final independent gate still required before merges.
4. Reconcile #45/#46 duplication, collect buyer feedback, and ask owner for explicit permission before any merge to M1/main. Main stays M0 until approved.
5. Update canonical memory after each substantial new code/CI/UAT/decision milestone through authorized docs-only PRs; do not overwrite this unmerged checkpoint concurrently.

## Decisions / 需要用户决定

- Review current PR #46 UX in isolated buyer pilot.
- Whether #46 supersedes #45 **after** CI and independent acceptance.
- Promotion of M1 to main is a separate explicit owner decision.

Detailed durable business decisions remain in \`docs/ai-memory/DECISIONS.md\`; historical original evidence remains in earlier session files.
