# ERP 核心字段与兼容规则
# ERP Core Field Mapping and Compatibility Rules

> 当前 M1 Lite 正式字段映射和未完成边界，核实于 2026-11-03。
> Active M1 Lite mapping and outstanding boundaries, verified on 2026-11-03.

## 已核实范围 / Verified scope

目前 M1 Lite 支持以下 ERP 核心字段及兼容表头，不代表全部 220 项 ERP 字段已经完成逐项核验。正式 ERP 字段定义应最终以原始存货档案、往来单位模板或 ERP 接口字典为准。
M1 Lite supports the mapped ERP core fields and legacy headers below; this is not a field-by-field verification of all 220 ERP columns. The authoritative dictionary must be reconciled against the original inventory/counterparty templates or ERP API schema.

## 字段映射 / Field Mapping

| 原表头 / Source Header | 兼容旧表头 / Legacy Header | SRM 内部属性 / Internal Key | 规则 / Rule |
|---|---|---|---|
| 存货编码 | 物料编码 | `items[].id` | 业务编码，可在 RFQ 中重复 / Business code, not unique per RFQ |
| 存货名称 | 物料名称、名称 | `items[].name` | 正式展示名 / Canonical display label |
| 规格型号 | 规格 | `items[].spec` | 影响自动合并判定 / Blocks incompatible automatic merges |
| 所属类别 | 分类、物料分类 | `items[].cat` | 支持分类筛选 / Enables category filters |
| 参考编码1 | — | `items[].ref1` | 辅助属性，不自动重写存货编码 / Metadata; never rewrite item IDs |
| 参考编码2 | — | `items[].ref2` | 辅助属性，不作为唯一匹配证明 / Metadata, not a unique identity proof |
| 采购常用单位 | — | `items[].purchaseUnit` | 仅记录，不自动换算数量或报价 / Preserved with no automatic conversion |
| 询价数量 | 数量 | `items[].qty` | SRM 业务必填，正数 / Required positive RFQ quantity |
| 询价单位 | 单位 | `items[].unit` | SRM 业务必填 / Required RFQ unit |
| RFQ Line ID | — | `items[].lineId` | 唯一稳定身份，报价、图纸、历史关联不变 / Stable RFQ line key |

供应商仍以独立的往来单位编码、供应商编码和往来单位名称记录；禁止自动合并两类代码。
Suppliers retain separate counterparty code, supplier code and counterparty name; identities are not silently collapsed.

## 原始 ERP 附加字段 / Unmapped Original ERP Columns

导入时未映射的非空 ERP 原始列以原始列名和值存入 `items[].erpExtra`；不自动参与报价、供应商选择、参考编码转主键或单位换算。
Nonempty unmapped ERP columns are retained verbatim in `items[].erpExtra`; they never infer prices, supplier decisions, identity conversion or unit changes.

每行最多保留 220 项附加非空列，每列标题不超过 100 字符、值不超过 1,000 字符，附加字段合计不超过 16,000 字符；超限拒绝该行并提示，而不是静默截断。
At most 220 nonempty extra columns are retained per row, with a 100-character heading, 1,000-character value and 16,000-character aggregate limit. Oversized data fails validation rather than being silently truncated.

XLSX 读取和生成的单工作表列宽上限由 80 列提升到 256 列，以容纳核心字段与最多 220 个其他原始字段；其他大小与行数上限继续生效。
Native XLSX parsing and writing now support up to 256 columns per worksheet instead of 80, while existing byte/row limits still apply.

不相同的附加原始信息阻止同编码物料自动合并，采购员应人工核查；不能把原始 ERP 附加字段当作已完成语义映射。
Different retained raw ERP values prevent automatic same-code aggregation and require buyer review; raw retention is not a claim of semantic field mapping.

## 保存、导出与安全边界 / Persistence, Export and Safety

`RFQ Line ID`、供应商分配键、报价轮次、报价历史、`schemaVersion:1` 和 SQLite 存储接口均不改动；旧业务快照允许缺少这些新增字段。
RFQ identity, assignments, quote history, schemaVersion 1 and the SQLite API remain unchanged. Older workspaces can omit every new field.

物料预览、搜索、单条输入、编辑、批量更新、唯一匹配更新及内部 Excel 均可处理核心字段；同一字段的新旧表头值冲突时该行禁止提交。
Preview, search, manual input, editing, bulk/matched updates and internal XLSX support core fields; conflicting canonical/legacy values reject the row.

供应商专用询价单可带规格型号，但不会带 ERP 参考编码、未识别原始列、其他供应商或历史报价。
Supplier-facing RFQs can include specifications, but exclude ERP reference codes, raw unmapped metadata, other suppliers and quotation history.

采购员内部业务明细 XLSX 的“询价物料”工作表保留已识别核心列及存在过值的 ERP 原始附加列，便于核对。
The internal business-detail workbook retains core columns and populated raw ERP headings within the material sheet for later reconciliation.

## 已有测试范围与未完成事项 / Tests and outstanding items

使用虚构 ERP 表头测试 XLSX/CSV 导入、同编码同规格合并、不同规格冲突、别名值冲突、搜索、编辑、SQLite 保存恢复及报表；不将任何真实业务数据写入 GitHub。
Use synthetic ERP headers to test XLSX/CSV ingestion, merge/conflict behavior, alias rejection, search/edit, SQLite restore and reports. Never commit actual business records.

全部 220 项原始字典的准确字段名、字段类型、选择项、ERP 代码转换、采购单位换算，以及主数据自动补齐尚未经过原始模板核实，因此不在本次完成范围内。
Accurate 220-column definitions, types, enumerations, ERP code conversion, purchase-unit conversions and master-data autofill are not verified from the original templates and remain outside this delivery.

当前字段映射已随 M1 Lite 进入 `main`。ERP API 主数据同步、停用编码与编码映射冲突处理以及供应商/物料未命中时的临时录入策略均未实施或未获业务确认。
This mapping is part of the current M1 Lite `main`. ERP API synchronization, inactive-code and mapping-conflict handling, and provisional item/supplier entry rules are not yet implemented or approved.
