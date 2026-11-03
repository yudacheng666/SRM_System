# SRM_System 当前项目状态 / Current project state

> 核实日期：2026-11-03。以 GitHub 当前 refs、PR 和准确 SHA 为准；本文件是核实快照，不是后台实时监控。
> Verified: 2026-11-03. GitHub refs, PRs and exact SHAs are authoritative; this is a snapshot, not background monitoring.

## 1. 产品目标 / Product goal

轻量采购询比价闭环：RFQ → 物料 → 供应商分配 → 询价包 → 多轮报价 → 同范围比价 → 人工定标 → 历史与备份。
A lightweight procurement workflow: RFQ → items → supplier allocation → RFQ packages → multi-round quotations → like-for-like comparison → buyer awards → history and backups.

当前主线是 M1 Lite 本机单用户试用版，不是 ERP 替代系统或已部署的企业多用户服务。
The current mainline is an M1 Lite local single-user pilot, not an ERP replacement or deployed enterprise multi-user service.

## 2. 分支与版本 / Branches and versions

| 层级 | 准确版本 | 当前状态 |
|---|---|---|
| 正式主线 / Main | `main` @ `8686ea7956a8d717bcb0489a7d6b06ffc545547d` | M1 Lite 已于 2026-11-03 通过 PR #52 提升；PR #53 同步项目记忆。 |
| M1 开发分支 / Development | `draft/20261013-m1-storage-ui-audit` @ `cdf25af58736253bbf5343ceccdf543cf1119631` | 与 main 的产品代码树一致；后续功能先在开发分支迭代，再按授权提升。 |
| UI 设计参考 / Design | PR #44 | Draft 设计资料，不是独立可执行产品。 |
| 并行 UI 候选 / Alternate | PR #45 | 仍为 Draft/Open；与已合并 UI 有重叠，不得未经差异审查直接合并。 |

PR #46 已将 UI 结构整改合并到 M1 开发基线；PR #52 将完整 M1 基线合并到 main；PR #53 将当前状态记忆同步到 main。
PR #46 integrated the UI changes into M1 development; PR #52 promoted the full M1 baseline to main; PR #53 synchronized current project memory.

## 3. 已实现范围 / Implemented scope

- Windows 本机启动：Python HTTP 服务，默认访问 `http://127.0.0.1:8765/`。
- Windows local launch through a Python HTTP service at `http://127.0.0.1:8765/`.
- SQLite 工作区持久化、历史修订、保存冲突保护及自动保存。
- SQLite workspace persistence, revision history, write-conflict protection and autosave.
- RFQ 物料导入、供应商导入/选择、物料—供应商多对多分配。
- RFQ item import, supplier import/selection and many-to-many item/supplier allocation.
- PDF 图纸关联、批量匹配预览、供应商范围隔离导出。
- PDF drawing association, batch-match preview and supplier-scoped exports.
- 多轮报价、同轮修订、阶梯价、报价覆盖检查、同范围比价和人工定标。
- Multi-round quotations, same-round revisions, tier pricing, coverage checks, like-for-like comparison and buyer awards.
- SQLite + PDF 完整 S4 备份/恢复、自动完整备份及保留策略。
- Full SQLite + PDF S4 backup/restore, automatic full backups and retention.

## 4. 准确 SHA 测试证据 / Exact-SHA test evidence

- [UI V2 Unified Actions #41587890315](https://github.com/yudacheng666/SRM_System/actions/runs/41587890315)：PR #46 候选源码树验收 SUCCESS；Linux Python 44/44、Node 10/10、Chromium E2E 58/58，Windows 作业 PASS。
- [UI V2 Unified Actions #41587890315](https://github.com/yudacheng666/SRM_System/actions/runs/41587890315): PR #46 candidate source-tree acceptance SUCCESS; Linux Python 44/44, Node 10/10, Chromium E2E 58/58 and Windows job PASS.
- [M1 合并后 S3/S4 Actions #41590629311](https://github.com/yudacheng666/SRM_System/actions/runs/41590629311)：在准确 M1 SHA `cdf25af` 执行，Linux Python/Node/Chromium 与 Windows S3/S4 作业均 SUCCESS。
- [Post-promotion M1 S3/S4 Actions #41590629311](https://github.com/yudacheng666/SRM_System/actions/runs/41590629311): ran on exact M1 SHA `cdf25af`; Linux Python/Node/Chromium and Windows S3/S4 jobs all SUCCESS.
- PR #53 只更新文档；main 当前产品代码与上述已测 M1 源码树一致。文档清理属于后续独立 PR，不得把文档改动说成新产品测试。
- PR #53 changed documentation only; main product code matches the tested M1 source tree. Subsequent documentation cleanup is a separate PR and must not be described as new product testing.

## 5. 尚未完成 / Open items

- Windows 原生采购员完整 GUI 流程 WIN-03 尚未完成独立验收。Windows Actions 的 S3/S4 回归 PASS 不等于原生 Edge/Excel/文件对话框完整 UAT PASS。
- Native Windows buyer GUI flow WIN-03 has not completed independent acceptance. Windows S3/S4 Actions PASS is not equivalent to full Edge/Excel/file-dialog UAT PASS.
- ERP 核心字段兼容已实现，但完整 220 字段字典、代码转换、单位换算及所有字段语义仍待原始 ERP 模板核验。
- ERP core-field compatibility exists, but the complete 220-field dictionary, code conversions, unit conversions and all field semantics still require verification against original ERP templates.
- ERP API 主数据同步尚未实现。物料/供应商是否强制先建主数据、未命中是否允许临时录入、如何处理停用编码和同步冲突，仍待业务决策。
- ERP API master-data sync is not implemented. Whether items/suppliers must be pre-registered, whether unmatched records may be entered temporarily, and how inactive codes/sync conflicts are handled remain open business decisions.
- 原始邮件、聊天截图等报价凭证的文件化存储尚未实现；当前 S4 主要覆盖 SQLite 与登记的 PDF 图纸。
- File-based storage for original quotation emails and chat screenshots is not implemented; current S4 primarily covers SQLite and registered PDF drawings.
- 公司服务器部署、多用户并发、SSO 和企业权限后置，尚未实施。
- Company-server deployment, multi-user concurrency, SSO and enterprise permissions are deferred.

## 6. 核心规则与文档入口 / Canonical rules and docs

- [产品需求 PRD](../01_产品需求PRD.md)；[业务规则](../02_业务规则.md)；[当前架构](../architecture.md)。
- [Product requirements](../01_产品需求PRD.md); [business rules](../02_业务规则.md); [current architecture](../architecture.md).
- [ERP 字段映射范围](../20261016_SRM_ERP核心字段统一与兼容范围_V1.md)。
- [ERP field mapping scope](../20261016_SRM_ERP核心字段统一与兼容范围_V1.md).
- [本机运行与测试说明](../../prototype/m1-lite/backend/README.md)；[文档索引](../README.md)。
- [Local runtime/test guide](../../prototype/m1-lite/backend/README.md); [documentation index](../README.md).

## 7. 协作与验收纪律 / Collaboration and acceptance

先读取 `AGENTS.md`、本文件和 `DECISIONS.md`，核对 GitHub 实际分支、PR、准确 SHA 与已有 Actions 证据。
Read `AGENTS.md`, this file and `DECISIONS.md` first; verify actual GitHub branches, PRs, exact SHAs and existing Actions evidence.

GitHub Actions 是默认自动化验收入口；相同 SHA/环境/用例已有可核验 PASS 时，不重复运行整套测试。Codex 只用于 CI 未覆盖或高风险独立验收。
GitHub Actions is the default automation gate; do not rerun an identical suite when exact-SHA/environment/test evidence already passes. Use Codex only for uncovered CI scope or high-risk independent acceptance.

开发先进入独立分支和 PR；未经用户明确批准不得合并、直写 main 或关闭其他 PR。
Develop on an isolated branch and PR first; never merge, write directly to main or close another PR without explicit user approval.

仓库示例、测试数据和文档只使用虚构/匿名资料；禁止提交真实业务数据。
Repository examples, fixtures and documents must use synthetic/anonymized information only; never commit real business data.
