# SRM System

轻量级采购询价、供应商分配、报价回收与比价工具。
A lightweight procurement RFQ, supplier-allocation, quotation-intake and comparison application.

## 当前版本 / Current status

- `main` 已于 2026-11-03 升级为 M1 Lite：Windows 本机运行、Python HTTP 服务、SQLite 持久化及 PDF 图纸管理。
- `main` was promoted to M1 Lite on 2026-11-03: local Windows runtime, Python HTTP service, SQLite persistence and PDF drawing management.
- 当前是单用户本机试用架构，不是已部署的公司服务器、多用户或 ERP 替代系统。
- This is a single-user local pilot, not a deployed company server, multi-user system or ERP replacement.

## 核心流程 / Core workflow

RFQ 建立 → 物料导入 → 供应商分配 → 询价包生成 → 多轮报价回收 → 同范围比价 → 人工定标 → 历史与备份。
Create RFQ → import items → assign suppliers → generate RFQ packages → collect multi-round quotes → compare like-for-like → record buyer awards → preserve history and backups.

## 启动 / Run locally

Windows 用户请阅读 [M1 Lite 本机运行与测试说明](prototype/m1-lite/backend/README.md)，使用 `prototype/m1-lite/run_local.bat` 启动。
For Windows local use, follow the [M1 Lite runtime and test guide](prototype/m1-lite/backend/README.md) and launch `prototype/m1-lite/run_local.bat`.

## 文档入口 / Documentation

- [产品需求 PRD / Product requirements](docs/01_产品需求PRD.md)
- [业务规则 / Business rules](docs/02_业务规则.md)
- [当前架构 / Current architecture](docs/architecture.md)
- [ERP 核心字段映射边界 / ERP field mapping scope](docs/erp-core-fields.md)
- [当前项目状态 / Project state](docs/ai-memory/PROJECT_STATE.md)
- [长期决策 / Durable decisions](docs/ai-memory/DECISIONS.md)

## 自动化测试 / Automated tests

从仓库根目录执行：
Run from the repository root:

```powershell
npm ci
python -m unittest discover -v -s prototype/m1-lite/backend -p "test_*.py"
npm test
npm run test:e2e
```

GitHub Actions 是准确 SHA 的自动化验收记录入口；每次合并前应核对实际运行结果，不得把旧 SHA 的 PASS 套用到新代码。
GitHub Actions is the evidence source for exact-SHA automation; verify the actual run before merging and never transfer a PASS from an older SHA to new code.

## 数据安全 / Data safety

仓库中的代码示例、测试数据和文档只能使用虚构或匿名信息。禁止提交真实公司、人员、客户、供应商、物料、报价、订单、邮件或可识别截图。
Repository code samples, fixtures and documents must use synthetic or anonymized information only. Never commit identifiable company, people, customers, suppliers, items, quotations, orders, emails or screenshots.
