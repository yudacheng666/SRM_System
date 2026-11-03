# M0 交互原型 / M0 interaction prototype

> 历史原型，仅用于交互参考和对应回归；当前主线运行入口是 `prototype/m1-lite/`。
> Historical prototype for interaction reference and its regression tests; the current mainline application is under `prototype/m1-lite/`.

M0 使用虚构数据验证物料导入、供应商分配、报价轮次和比价交互，不提供 M1 Lite 的 SQLite 持久化、S4 完整备份或正式本机服务。
M0 uses synthetic data to validate item imports, supplier allocation, quotation rounds and comparison interactions. It does not provide M1 Lite SQLite persistence, S4 full backup or the production-like local service.

如需打开原型，可在现代浏览器中打开 `prototype/m0/index.html`。不要用它保存真实采购记录。
To inspect the prototype, open `prototype/m0/index.html` in a modern browser. Do not use it for real purchasing records.

## 原型覆盖 / Prototype scope

- 物料单条录入、剪贴板/CSV 导入、搜索、排序和选择。
- Manual item entry, clipboard/CSV import, search, sorting and selection.
- 物料与供应商多对多分配及供应商询价范围预览。
- Many-to-many item/supplier allocation and supplier RFQ-scope preview.
- 报价导入、报价轮次、阶梯价、覆盖检查和比价交互。
- Quotation import, rounds, tier prices, coverage checks and comparison interactions.

当前有效业务要求以 [产品需求 PRD](../../docs/01_产品需求PRD.md) 和 [业务规则](../../docs/02_业务规则.md) 为准。
The current requirements are defined by the [product PRD](../../docs/01_产品需求PRD.md) and [business rules](../../docs/02_业务规则.md).
