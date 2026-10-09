# 01 产品需求 PRD

> 文档状态：SRM V1 当前需求基线  
> 更新日期：2026-10-08  
> 适用阶段：M0 → V1  
> 本文档整合项目对话中已经确认的需求、采购反馈和 M0 复盘结论。后续确认的产品变更应更新本文档；讨论过程保留在对话/PR，本文档只保留当前有效结论。

## 1. 产品目标

建设一个轻量、可离线使用的采购询比价 SRM 工具，聚焦：

```text
RFQ → 询价物料 → 供应商分配 → 供应商询价包
→ 报价回收 → 报价校验/议价轮次 → 比价/总价分析
→ 最终选择 → OA 比价报告 → 历史沉淀
```

V1 不复制完整 ERP，不要求供应商登录 SRM。

## 2. V1 边界

### 2.1 V1 必须覆盖

- 供应商主数据、物料主数据
- RFQ 创建、状态与修订版本
- 多种方式导入本次询价物料
- 物料与供应商多对多分配
- 询价覆盖率检查
- PDF 图纸/技术资料关联与多页预览
- 按供应商生成询价 Excel + 对应 PDF 图纸的询价包
- 多种方式回收报价
- 报价原始证据链
- 报价覆盖检查
- 报价轮次、同轮修订、阶梯价
- 逐物料比价、总价/同范围总价分析
- 最终供应商选择与非最低价原因
- OA 比价报告
- 历史报价/采购价分析
- 上线前历史询价、报价、订单数据迁移
- 本地备份/恢复

### 2.2 V1 暂不做

- 供应商门户/在线登录报价
- 在线竞价/拍卖
- 复杂审批引擎
- 合同、付款、库存、仓储
- 完整 ERP API
- 高级供应商评分
- 多人权限体系
- AI 自动决策
- 单物料多供应商数量拆分

## 3. 核心数据身份

### 3.1 RFQ

RFQ 使用独立编号，例如：

`RFQ-YYYYMMDD-001`

RFQ 可关联项目/设备/需求单，但不强制。

### 3.2 RFQ Revision

已生成/发出的 RFQ 后，如果询价范围、数量、技术条件、图纸等发生实质变化，应形成新的 RFQ Revision。

旧 Revision 不覆盖。

示例：

- RFQ-001 Rev.0
- RFQ-001 Rev.1

历史报价必须能追溯到供应商实际收到的 RFQ Revision。

### 3.3 RFQ Line ID

每一条 RFQ 明细必须有稳定的内部 `RFQ Line ID`。

RFQ Line ID 与 ERP 物料编码分离：

- 物料编码：业务字段，可重复出现在不同 RFQ 行
- RFQ Line ID：当前 RFQ 行的唯一身份，用于报价回导、覆盖检查和历史追溯

报价导入优先按 RFQ Line ID 匹配；物料编码只能作为辅助/兼容线索。询价行的合并与原始需求来源另见第27节。
Quotation return matching prioritizes RFQ Line ID; item codes are fallback identifiers only. See section 27 for inquiry-line consolidation and source traceability.

## 4. 本次询价物料录入

支持：

1. 单条输入
2. 剪贴板批量粘贴
3. Excel / CSV / TXT 文件导入

三种方式必须进入同一预览和校验流程。

### 4.1 剪贴板规则（以下第27节为最新规则）

字段分隔：

- 英文逗号 `,`
- 中文逗号 `，`
- Tab

记录分隔：

- 英文分号 `;`
- 中文分号 `；`
- 换行

普通空格绝不作为字段分隔符，避免拆坏 `304 不锈钢` 等字段。

空白字段必须保留位置，不能删除空单元格后导致后续列左移。

### 4.2 数值校验

数量、价格、MOQ、交期等不得使用“解析失败自动变 0/1”的兜底逻辑。

规则：

- 非法数字 → 明确错误
- 空值 → 按字段是否允许为空判断
- 0 → 按业务规则判断是否合法
- 错误数据不得静默写入

## 5. 清单通用交互

### 5.1 搜索

搜索采用两层状态：

- Draft：用户正在输入的条件
- Applied：用户点击“搜索”后实际生效的条件

输入过程中不得因为分页、勾选、重绘而提前应用未确认条件。

支持：

- 全字段模糊搜索
- 每字段独立模糊搜索
- 多字段 AND
- 新增自定义字段自动继承搜索能力

### 5.2 多选

多选清单统一支持：

- 全选：当前筛选结果全部
- 本页全选
- 反选：当前筛选结果全部反转
- 本页反选
- Shift 连选

### 5.3 分页

统一支持：

- 上一页 / 下一页
- 数字页码
- 当前页高亮
- 大页数省略
- 翻页保持已应用搜索条件和选择状态

## 6. 字段与系统设置

M0 演示字段不是生产字段。

正式字段应由：

- ERP 字段
- 采购业务字段
- 报价字段
- 图纸/附件字段
- 可配置扩展字段

共同确定。

系统设置负责：

- 新增/删除自定义字段
- 名称、类型、校验
- ERP 映射
- 显示/编辑/搜索属性
- 核心字段保护

业务页面只处理字段值。

字段值批量更新支持：

1. 对选中记录统一写入一个值
2. 导入“关键字段 + 目标值”表格按关键字段匹配更新

所有批量更新先预览，区分匹配、未匹配、重复、格式错误。

## 7. 询价分配中心

物料与供应商是多对多关系。

### 7.1 供应商池

当前 RFQ 使用采购员主动维护的候选供应商池，不直接展示完整供应商主数据。

支持：

- 搜索供应商
- 添加到当前 RFQ
- 从当前 RFQ 移出
- 历史采购/报价/分类作为推荐线索

推荐只辅助，不自动做最终决定。

### 7.2 两种分配方式

#### 按物料分配供应商

选一批物料，对其追加一个或多个供应商。

新增关系默认是“追加”，绝不覆盖已有供应商。

#### 按供应商分配物料

勾选框本身直接表示关系：

- 勾选 = 已关联
- 未勾 = 未关联

不再增加第二层“临时选择状态”。

### 7.3 降低重复操作

支持：

- 复制另一供应商的物料范围作为起点
- 再增加/取消差异物料
- 批量关联/取消当前筛选范围

### 7.4 Coverage

显示：

- 总询价物料
- 至少分配 1 家
- 仅 1 家
- 未分配

Coverage 低于 100% 仍允许生成询价包。

只生成已分配部分，未分配物料继续留在 RFQ 中。

## 8. PDF 图纸 / 技术资料

PDF 已进入 V1 主流程。

### 8.1 数据模型

支持：

- 一物料多个 PDF
- 多页 PDF
- PDF 类型/名称
- 版本/修订
- 当前有效/已替代状态
- 一个 PDF 被多个物料共享

### 8.2 预览

列表小预览建议显示：

- 第一页缩略
- PDF 标识
- 页数
- 多文件数量

大预览支持：

- 文件切换
- 上一页 / 下一页
- 当前页 / 总页数
- 放大/缩小
- 适应页面/适应宽度

### 8.3 询价包附件

生成供应商询价包时，系统按该供应商实际分配物料自动汇总对应 PDF。

生成前检查：

- 应有 PDF
- 已找到 PDF
- 缺图纸物料
- 共享/重复 PDF

不得悄悄遗漏。

已发 RFQ 应保存当时附件快照；后续图纸升级不得改写历史 RFQ。

## 9. 供应商询价包

输出单位不是单一 Excel，而是“供应商询价包”。

典型结构：

```text
RFQ_xxx_供应商/
├─ RFQ_xxx_供应商.xlsx
└─ 图纸/
   ├─ xxx.pdf
   └─ ...
```

可进一步生成 ZIP，便于邮件/聊天工具发送。

询价 Excel 至少包含：

- RFQ / Revision
- Supplier
- RFQ Line ID
- 物料编码
- 名称/规格
- 数量
- 单位
- 供应商填写的单价、交期、MOQ 等字段

## 10. 报价证据链

供应商不登录 SRM。

报价真实性/来源证据按实际来源保存：

1. 有邮件：原始邮件 + 原始附件
2. 无邮件：聊天截图、单独 PDF/文件等
3. 系统无法可靠识别：采购员手工录入，但仍应关联可用的原始凭证/说明

结构化 Excel 用于数据处理；原始凭证用于证明报价来源、内容和时间。

每次报价提交/修订应记录：

- 来源类型
- 原始证据引用
- 导入/录入时间
- 采购员
- 原始值
- 标准化值

## 11. 报价导入

支持：

- 单条手工输入
- 剪贴板批量粘贴
- CSV/TXT
- Excel

正式 Excel 支持字段映射和映射模板。

报价单可能包含：

- 普通单价
- 阶梯价
- 交期
- MOQ
- 品牌/型号
- 技术备注
- 未报价/不供货状态

导入后允许在“草稿提交”内修正。

已确认提交不能覆盖修改。

## 12. 报价轮次与修订

必须分成两层：

### 12.1 Round

表示议价阶段：

- 第 1 轮：首次报价
- 第 2 轮：二次谈价
- 第 3 轮及以后：继续议价

### 12.2 Revision / Submission

表示同一轮内供应商更正或重新提交。

示例：

```text
Round 1
  Revision 1
  Revision 2（更正）

Round 2
  Revision 1
```

Revision 不能被覆盖删除。

已确认 Revision 锁定；需要更正时创建新 Revision。

## 13. 每轮应报价范围

每个 Round 必须保存“本轮应报价 RFQ Line ID 范围”快照。

- Round 1 默认 = 该供应商实际收到的询价范围
- Round 2+ 可以只针对部分物料谈判
- 后轮范围允许采购员明确调整

覆盖检查只能与“本轮范围”比较，不能简单与整份 RFQ 比较。

## 14. 报价覆盖检查

至少区分：

- 已报价
- 明确未报价
- 不供货
- 漏报：本轮应报但完全缺失
- 多报：不在本轮范围
- 重复
- 数据错误

“明确未报价”与“漏报”必须区分。

多报、重复、格式错误不能直接进入有效报价。

确认提交前显示异常清单。

如果允许带异常确认，必须保留异常状态供后续审计。

## 15. 沿用上轮

后轮缺失项目绝不自动视为价格不变。

只有采购员确认供应商明确维持原条件时，才写入：

`明确沿用上轮`

沿用规则：

- 只作用于本轮应报价范围
- 不能跨过“不供货/未报价”状态去翻更早历史价格
- 必须记录来源轮次/修订
- 同价重新正式提交也应保存为新轮次记录，降幅为 0

## 16. 阶梯价格

阶梯价属于报价行的可选价格结构，不另建一套流程。

示例：

`1-99:100 | 100-499:90 | 500+:80`

必须保存完整阶梯。

校验：

- 数量区间有效
- min <= max
- 阶梯不能重叠
- 价格必须有效
- RFQ 数量必须实际落入某一档，否则显示“无适用阶梯价”，不得猜最近档

比价和轮次变化均按同一 RFQ 数量对应的适用档位计算。

## 17. 报价有效性和历史

每次确认的报价提交永久保留。

保存：

- Round / Revision
- 原始值
- 标准化值
- 阶梯结构
- 未报价/不供货
- 覆盖异常
- 明确沿用
- 手工修正审计
- 日期
- RFQ / Revision
- Supplier
- RFQ Line ID

历史记录不可物理删除。

如果物料/供应商已经产生报价历史，业务范围删除应改为作废/取消参与，而不是直接清除历史数据。

## 18. 比价

逐物料至少展示：

- 当前有效报价
- 最低价
- 第二低价
- 上次采购价
- 交期
- MOQ
- 阶梯价标记及完整阶梯
- 当前轮次/修订
- 报价覆盖状态

默认选择最低有效报价。

采购员可以改选非最低价，但必须填写原因。

## 19. 总价分析

不得把不同报价范围的总价直接当成公平比较。

至少支持：

### 19.1 供应商自身报价范围总额

`有效适用单价 × RFQ 数量` 的总和。

只描述供应商自身报价规模。

### 19.2 同物料范围总价

对参与比较的供应商先求“共同有效报价物料集合”，再用同一集合比较总额。

必须显示共同物料数量/范围。

### 19.3 指定范围总价

采购员自行选择一批物料，在相同范围比较供应商。

缺报价不得按 0。

### 19.4 理论最低总额

每颗物料取当前最低有效报价后的理论总额。

### 19.5 最终选择总额

按采购员最终选择计算，并与理论最低/历史采购金额比较。

### 19.6 可比性

正式版必须处理/提示：

- 币种
- 含税/未税
- 单位
- 数量口径

不可比时不得静默相加。

## 20. OA 比价报告

M6 正式设计并生成。

至少包含：

- RFQ / Revision
- 参与供应商
- 询价物料
- 各轮/各修订报价
- 阶梯价及本次适用价
- 报价覆盖情况
- 上次采购价
- 轮次降价金额/比例
- 总价/同范围总价分析
- 最终选择
- 非最低价原因
- 二次谈价未降价项目
- 异常说明

V1 只需导出报告，不要求直接接 OA API。

## 21. 历史分析

M5 起开始永久保存历史，M7 负责查询/分析体验。

至少支持：

- 单物料历史采购价
- 单物料历史报价
- 物料 × 供应商历次报价
- 各轮议价变化
- 多供应商历史价差
- 供应商参与/覆盖历史
- 价格趋势

## 22. 上线前历史补录

上线前历史迁移遵循：

> 有什么证据，就导入什么层级；不补造无法证明的历史事件。

### 22.1 只有 ERP 订单

导入为历史订单/采购价格，不虚构 RFQ 或供应商报价。

### 22.2 有历史询价/报价证据

按证据导入：

- 历史 RFQ/询价标识
- 供应商
- 物料
- 日期
- 价格/阶梯价
- 交期/MOQ
- 轮次（仅在可确定时）
- 原始证据引用

不知道轮次时标记 `legacy / 未知轮次`。

### 22.3 迁移审计

保存：

- legacy 标记
- 来源类型
- 原文件/证据
- 迁移批次
- 导入时间
- 原始值
- 标准化结果
- 未匹配/重复/错误日志

## 23. 技术原则

M0 可以继续使用单 HTML + 浏览器内虚构数据验证交互。

进入 M1 前必须完成正式本地运行架构决策，重点验证：

- 本地数据库的可靠持久化
- PDF/附件文件访问与目录打包
- 备份恢复
- 断网运行
- 数据升级/迁移
- 浏览器 file:// / IndexedDB 限制

正式 V1 不应把“浏览器临时存储”作为唯一业务数据保障。

## 24. 数据完整性原则

- 任何导入先预览再提交
- 任何非法值不静默纠正
- 已确认历史不覆盖
- 删除涉及历史时改为作废/取消
- RFQ、报价、附件都要版本/快照可追溯
- 总价比较必须在可比口径下
- 缺报价不是 0
- 后轮漏报不是自动沿用
- 所有业务对象使用稳定内部 ID，不依赖显示文本或行顺序

## 25. M0 通过标准

M0 通过不是“页面看起来完整”，而是证明核心业务交互和数据语义不会明显误导采购员。

必须满足：

1. 物料三种录入方式可用，空字段不移位，非法数字不静默兜底
2. 搜索 Draft/Applied 分离
3. 多选/分页/Shift 行为一致
4. 多对多分配追加不覆盖
5. 供应商询价范围预览准确
6. 多页 PDF 式预览和附件缺失检查可验证
7. 报价多方式导入进入统一模型
8. RFQ Line ID 参与报价匹配
9. 报价覆盖状态正确
10. Round 与 Revision 分离
11. 后轮议价范围可设置
12. 已确认报价不能直接覆盖
13. 沿用上轮不跨过未报价/不供货
14. 阶梯价越界/重叠/非法值不会产生猜测价格
15. 比价不受固定前 N 个物料/供应商限制
16. 至少验证自身报价总额、同物料范围总额、理论最低和最终选择总额
17. 删除/移除不能产生孤儿报价历史
18. 核心页面 JavaScript 无语法错误和重复 ID
19. 最后由真实采购员不依赖开发者解释走完整模拟流程

## 26. 仓库与数据安全

仓库内所有：

- 示例
- 测试数据
- 截图说明
- 文档
- 代码注释

必须使用虚构/匿名信息，不得出现真实公司、个人、客户、供应商、产品或内部敏感数据。

开发修改默认进入草稿分支。只有用户明确确认后才能合并主线。

## 27. M0 第三轮体验反馈与需求修订（2026-10-08）
## 27. M0 third-round UX review and requirement amendments (2026-10-08)

### 27.1 主数据自动补齐
### 27.1 Master-data autofill

在 M1 确定主数据模型和唯一查找键，在 M2/M3 接入物料、供应商及其他录入对象的自动补齐；命中唯一结果时带出名称、单位、规格等主数据属性，未命中或多候选必须提示，不能猜测。
Define master-data models and unique lookup keys in M1, then integrate autofill for items, suppliers and other entry objects during M2/M3; populate attributes only for a unique match, and flag unknown or ambiguous matches rather than guessing.

主数据补齐不覆盖用户已经手工修改的 RFQ 专属字段；物料主数据与询价数量、交付要求等交易字段严格分离。
Master-data autofill must not overwrite user-edited RFQ transaction fields; keep item master attributes separate from inquiry quantities and delivery terms.

### 27.2 表格列、排序与搜索
### 27.2 Table columns, sorting, and searching

列表中 RFQ Line ID、物料编码、图纸各占独立表格列且表头与数据严格对齐。
RFQ Line ID, item code and drawing preview must occupy separate aligned table columns.

默认按新增时间/先后序号倒序，最新新增排最前；允许对适合字段进行升序、降序、多字段优先级排序，排序在筛选后的全量结果生效，分页不改变排序。
Default to newest-first insertion order; allow ascending, descending and priority-ordered multi-column sorting over the entire filtered result, independent of pagination.

所有搜索区均提供明确的执行搜索和清空条件操作，支持 Enter 执行，始终区分输入中条件与已应用条件。
All search areas provide explicit Search and Clear actions and Enter-to-search, while separating draft criteria from applied criteria.

所有多选列表提供清空选择操作，仅清除临时勾选，不得清除已经确认建立的供应商分配关系。
Every multi-select list needs a Clear Selection action that clears temporary selection only, never established supplier assignments.

### 27.3 首行标题映射导入（替代位置固定格式）
### 27.3 Header-mapped imports (supersedes positional parsing)

剪贴板及 CSV/TXT 第一行必须是列标题，第二行开始才是数据；列顺序可自由调整，可省略非必需列，禁止无表头的纯数据直接导入。
The first row of pasted or CSV/TXT input must contain column headers and data starts on row two; columns may be reordered and optional columns omitted, but headerless data must be rejected.

物料导入必须精确包含“物料编码”标题；不以标题别名或第一列位置替代。数量和单位为本次询价的必填数据字段，名称等主数据属性在当前 M0 可留空等待未来主数据补齐。
Item imports require the exact header “物料编码”; do not infer it from an alias or column position. Quantity and unit remain required RFQ data; other item-master attributes may be omitted in M0 pending master-data enrichment.

报价导入要求包含“RFQ Line ID”或“物料编码”其中至少一个精确列标题；两者同时存在时优先使用非空 RFQ Line ID，缺少 Line ID 时仅在物料编码唯一匹配时回退；多匹配必须报错。
Quotation imports require at least one exact key header, “RFQ Line ID” or “物料编码”; prefer nonempty Line ID if both exist, and fall back to item code only for a unique match; ambiguous codes are errors.

支持 Excel 复制的 Tab+换行以及 CSV 逗号+换行；正确处理引号转义、字段内空格与空值。文本中无标题、重复标题、缺必需标题、重复/未识别字段须逐行/逐列提示，预览确认后方可写入。
Support tab/newline data from Excel and comma/newline CSV, quoted values, spaces and empty cells. Missing/duplicate headers and unknown mappings must produce explicit diagnostics; writes require preview and confirmation.

为了兼容既有操作，可以解析分号记录，但必须先识别标题行且不破坏引号内文本；普通空格永不拆字段。
Semicolon records may remain as a compatibility option, but still require a header and must respect quoted fields; never split ordinary spaces.

报价状态明确显示为“正常报价 / 明确未报价 / 不供货 / 待检查”；有效单价且未提供状态列时默认“正常报价”，价格与状态都没有时标记待检查；不得将错误解析成 null 或已报价。
Show quotation statuses as “Quoted / Explicitly no quotation / Cannot supply / Needs review”; if no status column exists and a valid price is given, treat as quoted, but missing both price and status requires review; never surface null or silently assume quoted after a parsing error.

### 27.4 同物料编码合并及来源追溯
### 27.4 Compatible same-code consolidation and source traceability

对同一物料编码且单位、名称、分类、技术版本、交货条件及其他影响报价的属性兼容的原始需求行，允许合并形成一条 RFQ 询价行、数量累加；保留每一来源需求行及原始数量。
Compatible original demand rows with the same item code and matching unit, name, category, technical revision, delivery terms and other price-relevant attributes may be consolidated into one RFQ line with summed quantity, while preserving every source row and original quantity.

不兼容或无法确定兼容性时禁止自动合并，展示冲突和差异，交由采购员确认保留独立询价行或取消导入；绝不静默合并。
When compatibility is unknown or conflicting, never auto-merge; show differences and require the buyer to choose separate RFQ lines or cancel import.

合并操作必须保护已分配供应商、已生成询价包或已确认报价历史，不得静默修改已发报价的数量与阶梯价判断依据；必要时走 RFQ 新修订版。
Consolidation must protect assignments, generated RFQ packages and confirmed quotations; never silently change quantities or tier-price bases after issue, and create an RFQ revision where necessary.

### 27.5 报价轮次、漏报导出
### 27.5 Quotation version labels and omission export

界面将同一轮内修订显示为“第1版 / 第2版”，不使用“修订1”直译；内部保留 revisionNo 和不可覆盖历史。
Show within-round submissions as “Version 1 / Version 2”, not the ambiguous literal revision label; retain revisionNo and immutable history internally.

支持按供应商及当前报价轮次导出漏报明细（CSV，正式版可扩展 Excel），包含 RFQ 编号、供应商、轮次、RFQ Line ID、物料编码、名称、数量、单位，文件内容不得包含不相关供应商信息。
Export omission lists per supplier and quotation round (CSV for M0, Excel may follow), with RFQ, supplier, round, RFQ Line ID, item code, name, quantity and unit, excluding unrelated suppliers.

### 27.6 双语文档及代码解释
### 27.6 Bilingual documentation and code explanations

从本轮开始，新增或实质更新的正式文档按中文一行、对应英文一行书写；界面仍以中文为主，历史旧文档保留历史属性，后续改版逐步统一。
From this iteration forward, new or materially updated official documentation uses paired Chinese and English lines; the application UI remains Chinese-first and historical documents can be migrated progressively.

代码采用中英双语的模块说明、函数注释和重要业务判断注释；不为每一个赋值或括号强制单独加注释。
Code uses bilingual module, function and critical-business-rule comments, without mandatory comments on every assignment or closing brace.

### 27.7 M0 回归验收
### 27.7 M0 regression acceptance

新增回归：字段标题重排/缺失、带引号/空列、物料编码合并与冲突、排序多字段稳定性、搜索确认按钮、清空选择不影响关联、报价状态显示、漏报 CSV 内容以及原有轮次/阶梯价回归。
Expand regression tests to cover reordered/missing headers, quoted/empty cells, compatible merge vs conflicts, stable multi-sort, explicit searches, selection clearing without relationship loss, status labels, omission CSV and previous quotation/tier cases.
