# SRM_System PROJECT_STATE / 项目当前有效状态

> Snapshot / 核实日期：2026-10-22（GitHub refs / PR metadata / exact-SHA Actions；不是持续实时监控）
> This file is proposed on a documentation branch until its PR is merged. Revalidate GitHub facts at each new task.
> 本文件在文档 PR 合并前仅属于候选分支；新任务先重新核实。

## Goal & scope / 目标与边界

- Lightweight offline local RFQ and supplier comparison workflow: RFQ items → many-to-many supplier allocation → supplier-specific Excel/PDF package → quote import and multi-round negotiations → common-scope/line price analysis and award → persistent history and secure backup. Source: docs/01_产品需求PRD.md; docs/02_业务规则.md.
  轻量离线询比价闭环；供应商不登录。长期可交 IT 服务器部署；当前不做多用户、ERP API 或正式生产发布。
- Current M1 Lite uses a localhost browser UI, local service, SQLite history, PDF assets and on-demand S4 ZIP restore checks. Source: docs/20261013_SRM_离线持久化与UI改造边界_V1.md; docs/20261014_SRM_S4完整备份恢复开发记录_V1.md; #33/#34.
  仍需 Windows 实机及采购员业务试用，不能将云端模拟测试说成已上线。

## Branch truth / 分支事实（准确 SHA）

| Layer / 层级 | Ref | As checked / 核实状态 |
| --- | --- | --- |
| Formal main / 正式主线 | main @ f330de510f97c552629052ff1841d7223194e7f8 | M0 prototype + selected-supplier common-scope comparison; merged #2 on 2026-10-09; **not M1** |
| Active M1 development / M1 开发基线 | draft/20261013-m1-storage-ui-audit @ f117cf3ca512a4ca7e1eec505b5e28744159343f | M1 Lite code, SQLite/S3/S4, ERP/import templates, V3.1 integration; development only, not main |
| Integrated V3 evidence / V3 已入开发基线 | #24 merged to M1 dev at c8429ef; #38 merged to #24 head at 9633c03 | Exact-chain fixes of false dirty/navigation and UI; product PRs were merged to their development targets |
| UX approved design candidate / UI 设计 | #44 Draft @ 8e643520 | Design/acceptance matrix only; not runtime |
| Parallel UI candidate A / UI 候选 A | #45 Draft @ 4480482c | Two CI workflows SUCCESS on that SHA; NOT merged; no independent scoped acceptance verified |
| Latest UI candidate B / 最新 UI 候选 B | #46 Draft @ c157040a39e929f062273f6bbb242f6d38fbb3b5 | Developed but **both CI workflows FAILURE** on exact head; no validated independent UAT; NOT merged |

Evidence / 证据：[main commit](https://github.com/yudacheng666/SRM_System/commit/f330de510f97c552629052ff1841d7223194e7f8) · [M1 HEAD](https://github.com/yudacheng666/SRM_System/commit/f117cf3ca512a4ca7e1eec505b5e28744159343f) · #24 · #38 · #44 · #45 · #46.

## Implemented and tested / 已实现与测试证据

- main/M0: synthetic interaction prototype, RFQ, allocations, quote comparison, shared-scope CSV; initial Playwright accepted via #2. No M1 persistence release to main.
  main 的 M0 仅原型能力，不能作为日常正式采购系统。
- M1 dev: real XLSX/CSV imports and vendor RFQ/internal comparison outputs, core ERP semantic mapping with unmapped-column retention, settings import templates, common-scope CSV actual RFQ identity (#15/#16/#18/#20 merged into their respective development lineage). Original ERP 220-field semantics **not fully verified**.
  以上为开发基线能力；原始 ERP 全字段语义映射待现场核实。
- M1 dev: local SQLite snapshots/versions, PDF line association, supplier-limited package, saved quote revisions, S4 full on-demand ZIP with empty-target-only restoration, and autosave/dirty-guard behavior in later implementation. Older 2026-10-14 design notes describing manual-save-only are historical, not proof about later HEAD.
  旧设计日志不能覆盖后来代码/验收的事实。
- Cloud TEST-ONLY evidence: #33 (S4 P3 visibility PASS, 19 PASS/0 FAIL/4 NOT TESTED); #34 (S4/recovery scope RELEASE-READY for the *development merge gate*, 21 PASS/0 FAIL/4 NOT TESTED); #39 (P2 first export, P3 navigation and documented safety regression PASS at 9633c03); #43 (C08/C09 11 PASS/0 FAIL/0 NOT TESTED at c8429ef).
  这些是对应准确 SHA 的范围内 PASS；证据 PR 未合并，不代表主线或全软件上线。
- #24 merged into M1 dev after its exact-head C03-C09 evidence, documented by development commit f117cf3. No Windows physical machine/Excel desktop/production load certification.
  开发基线通过了云端范围测试，但 Windows 本机全链路仍有门槛。

## Active work, pending acceptance & blockers / 当前工作、待验收、阻塞

1. **P1 gate / CI blocker:** PR #46 exact SHA c157040a: both SRM S3/S4 Regression and UI V2 Unified Candidate Acceptance concluded FAILURE ([run 39738425452](https://github.com/yudacheng666/SRM_System/actions/runs/39738425452), [run 39738425462](https://github.com/yudacheng666/SRM_System/actions/runs/39738425462)). Logs could not be retrieved on 2026-10-22; root cause **UNVERIFIED**. Do not classify as product bug or quota-only failure yet.
   PR #46 禁止在 CI 未全绿前交独立 Codex 验收，也不能合并。
2. PR #45 has separate green runs ([39729243554](https://github.com/yudacheng666/SRM_System/actions/runs/39729243554), [39729243552](https://github.com/yudacheng666/SRM_System/actions/runs/39729243552)), but remains Draft. PR #45/#46 overlap; choose one integration path and reconcile actual changes, do not merge both blindly.
   两条 UI 并行候选需明确取舍，不能重复叠加。
3. GitHub artifact storage quota was reported exhausted in #24; artifact upload was made best-effort, while business CI remained gating. User indicated preference to wait until November to resume quota-limited work; billing reset timing/causation for PR #46 failures requires new verification.
   用户决定暂待十一月额度周期；不能据此证明本次失败根因。
4. Windows on-site buyer UAT, Excel desktop recalculation/printing, exhaustive accessibility/browsers, production filesystem failure/load, and complete real ERP field dictionary are NOT TESTED/NOT VERIFIED. Original supplier email/chat/PDF quotation evidence capture is not yet proven part of S4 ZIP (#14 S4 record).
   缺少采购员完整实机验收，不宣称正式交付。
5. Document-only memory initialization is proposed in a separate Draft PR; this PR must not alter product, existing tests or CI. Unmerged files are not on the development or main branch.
   记忆规则生效以实际读取分支为准。

## Next execution / 下一步

1. Complete review/approval of memory-only PR. Confirm the canonical memory content; merge only with explicit owner approval into M1 development branch. If main is ever to receive memory files, plan a separate explicitly approved docs sync.
   先审核本次纯文档 PR，不擅自合并。
2. When CI capacity permits, inspect PR #46 failed job reason, repair confirmed product/test cause in a separately authorized task (not this initialization), rerun both exact-head workflows; do not reuse #45 green as #46 proof.
   核查 CI 原因，恢复准确 SHA 全绿。
3. Only after #46 CI green: one targeted independent Codex Cloud TEST-ONLY browser/UAT evidence, focused on intake, comparison, unsaved-preview safety and PDF/report navigation. Keep product PR Draft before approval.
   之后做一次定向独立验收。
4. Resolve PR #45 vs #46 redundancy, collect Windows buyer pilot findings, and request explicit approval for any development merge or later main release.
   最终开发合并及正式发布均需用户批准。

## Decision requests / 需人工决策

- Whether to approve/merge the docs-only memory PR to the development baseline.
- Whether #46 supersedes #45 after evidence review; no conclusion without checking.
- Windows buyer pilot and any future promotion of M1 to main.
