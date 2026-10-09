# M0 100 物料 × 10 供应商多轮报价测试数据
# M0 Synthetic Fixture Guide — 100 Items × 10 Suppliers

所有数据完全虚构，不包含公司、供应商、个人、产品或历史真实价格。
All data is synthetic; it contains no real companies, suppliers, people, product identities or historical prices.

## 生成与下载
## Generate and retrieve

在 GitHub Actions 的 `M0 P0 P1 P2 Regression` 成功执行记录中，下载名为 `m0-100x10-synthetic-csv` 的测试数据附件。
Download the `m0-100x10-synthetic-csv` artifact from a successful `M0 P0 P1 P2 Regression` GitHub Actions run.

每次运行由 `node tests/generate-m0-fixtures.cjs` 稳定生成相同内容；全部是带表头及 UTF-8 BOM 的 CSV 文件，符合当前 M0 剪贴板/CSV 导入规则。
The deterministic `node tests/generate-m0-fixtures.cjs` command regenerates identical CSV files with exact M0 headers and UTF-8 BOM.

数据包包含 1 份 100 行拟询价物料清单、1 份 10 家供应商参考清单、20 份报价回收文件（每家供应商各两轮）和 1 份供应商/轮次应报价范围参考表，共 23 个 CSV。
The package contains one 100-item list, one 10-supplier reference, 20 quotation files (two rounds per supplier), and one supplier/round expected-scope guide, totaling 23 CSV files.

## 实际 M0 操作顺序
## M0 hands-on sequence

1. 在 `prototype/m0/index.html` 的物料页面导入 `m0_100_物料.csv`，检查预览后确认，物料编码为唯一 `SIM-00001` 至 `SIM-00100`。
1. Import `m0_100_物料.csv` into the M0 item view and confirm the preview; codes run uniquely from `SIM-00001` to `SIM-00100`.

2. `m0_10_供应商参考.csv` **仅供核对**，当前 M0 未实现真实供应商主数据导入；供应商 `SUP-001` 至 `SUP-010` 已存在于当前虚构 M0 供应商清单。
2. `m0_10_供应商参考.csv` is **reference-only**; M0 does not yet import production supplier masters, and `SUP-001` through `SUP-010` are already in the synthetic demo supplier catalog.

3. **在确认任何供应商报价前**，先使用 `m0_供应商分配与轮次范围参考.csv` 对 100 个新物料完成全部 10 家供应商的分配，否则已确认报价的历史保护规则会阻止后续偷偷改变已报价物料关联。
3. **Before confirming any supplier quote**, establish all ten supplier assignment ranges using `m0_供应商分配与轮次范围参考.csv`; the confirmed-history guard intentionally prevents later silent link changes.

4. 进入“报价回收导入”后，按供应商逐个导入 `m0_SUP-001_第1轮报价.csv` 等第 1 轮文件；报价第一列使用精确标题“物料编码”，仅当该编码在本 RFQ 内唯一时允许匹配。
4. In Quotation Return, import each supplier's Round 1 file; the exact “物料编码” header works only for codes uniquely mapped within this RFQ.

5. 部分供应商故意漏报、明确未报价或不供货；对未报状态逐项复核，再决定是否确认当前报价，不得把漏报按 0 计价。
5. Some suppliers intentionally omit, decline or cannot supply certain items; review these distinct states before confirming and never treat omissions as zero prices.

6. 新增第 2 轮，按照参考表中相应供应商第 2 轮清单设置本轮议价范围，再导入 `m0_SUP-001_第2轮报价.csv` 等文件，验证分轮覆盖、漏报与议价比价。
6. Create Round 2 and set each supplier's Round 2 scope from the reference CSV before importing its second-round quote file; validate per-round coverage, omissions and comparisons.

CSV 是当前 M0 能真实读取的格式；正式 Excel 解析、真实 ERP 数据和完整历史迁移不属于本轮测试，不能宣称已经实现。
CSV is directly readable by M0. Production Excel parsing, ERP integration and full history migration are not covered and must not be claimed as implemented.

## 下一步
## Next action

第三批 P2 累计逻辑测试通过后，以 GitHub-hosted Playwright 等方式进行真实浏览器鼠标/键盘及下载验证，再由采购员完成人工端到端验收。
After cumulative P2 logic tests pass, run actual browser interaction/download tests through GitHub-hosted Playwright or an equivalent browser runner, followed by buyer end-to-end acceptance.
