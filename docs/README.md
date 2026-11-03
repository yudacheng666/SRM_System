# SRM 文档索引 / Documentation index

本目录只保留当前有效的产品基线、架构说明、ERP 字段边界和长期记忆。历史过程记录、重复验收报告及临时截图不作为当前文档维护。
This directory keeps the active product baseline, architecture, ERP field scope and durable memory. Historical work logs, duplicate test reports and temporary screenshots are not maintained as current documentation.

## 当前产品基线 / Product baseline

- [01 产品需求 PRD](01_产品需求PRD.md)：已确认的产品范围、交互要求和演进需求。
- [02 业务规则](02_业务规则.md)：RFQ、物料、供应商、报价、图纸、比价及历史数据不变量。
- [architecture 当前架构](architecture.md)：M1 Lite 本机运行、SQLite、PDF 资产、备份和安全边界。
- [ERP 核心字段映射](20261016_SRM_ERP核心字段统一与兼容范围_V1.md)：已对齐字段、未知列保留方式及未完成的完整 ERP 字典范围。

## 项目记忆 / Project memory

- [AGENTS.md](../AGENTS.md)：协作、测试、分支和文档维护规则。
- [PROJECT_STATE.md](ai-memory/PROJECT_STATE.md)：当前准确版本、测试证据、未完成事项。
- [DECISIONS.md](ai-memory/DECISIONS.md)：长期有效决策及其证据。
- [sessions](ai-memory/sessions/)：少量重要里程碑交接，不存放逐轮聊天记录。

## 运行与测试 / Runtime and testing

- [M1 Lite 本机运行与测试](../prototype/m1-lite/backend/README.md)
- [Playwright E2E 测试](../prototype/m1-lite/tests/e2e/README.md)
- [匿名测试数据说明](../tests/fixtures/README.md)
- [M0 旧原型说明](../prototype/m0/README.md)：仅用于历史交互参考，不是当前运行入口。

## 证据保存原则 / Evidence policy

当前验收结论以 GitHub PR、准确 SHA 的 Actions 运行及其保留的测试产物为准。不要把同一份截图、日志或逐次测试报告复制进主分支；确有新缺陷时，只保留能复现该缺陷的最小匿名证据。
Acceptance conclusions belong in GitHub PRs, exact-SHA Actions runs and their retained artifacts. Do not copy duplicate screenshots, logs or per-run reports into the main branch; retain only the minimal synthetic evidence needed to reproduce a new defect.

旧文档从当前目录删除后，仍可通过 Git 历史追溯；删除不等于改写历史。
Removed documents remain recoverable through Git history; cleanup does not rewrite project history.
