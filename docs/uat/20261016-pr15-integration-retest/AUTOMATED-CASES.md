# 自动化逐项结果 / Automated cases

所有用例在最终合并SHA本轮真实执行，原有测试/断言未改。

|编号|源文件|用例|结果|
|---|---|---|---|
|1|acceptance.spec.cjs|01 startup, demo isolation, autosave, navigation and restart / 启动与隔离|PASS|
|2|acceptance.spec.cjs|02 XLSX 12/100, duplicates and invalid format / 物料|PASS|
|3|acceptance.spec.cjs|03 suppliers and bidirectional additive allocation / 供应商与分配|PASS|
|4|acceptance.spec.cjs|04 real quote imports, rounds, tiers, immutable confirmation and comparison XLSX / 报价比价|PASS|
|5|acceptance.spec.cjs|05 PDF matching, manual correction, refresh and scoped supplier ZIP / 图纸询价包|PASS|
|6|acceptance.spec.cjs|06 full backup restore: actual imported quotes, history, PDFs, overwrite refusal / 完整恢复|PASS|
|7|acceptance.spec.cjs|07 real service disconnect and stale-tab 409 halt autosave / 自动保存失败|PASS|
|8|acceptance.spec.cjs|08 bad PDF and damaged ZIP never contaminate saved data / 异常回归|PASS|
|9|acceptance.spec.cjs|09 UI V1 navigation, drawers and RFQ state do not mutate data / 工作台操作|PASS|
|10|acceptance.spec.cjs|10 buyer continuous allocation to items and drawing select without reload / 跨步骤实时同步|PASS|
|11|acceptance.spec.cjs|11 formal RFQ identity in missing-quote CSV and working export shortcut / 单据追溯|PASS|
|12|acceptance.spec.cjs|12 supplier status and report context reset on RFQ change / 保存提示与跨询价报告隔离|PASS|
|13|acceptance.spec.cjs|13 compact laptop item table after import / 1366首屏物料可见|PASS|
|14|erp-core-alignment.spec.cjs|ERP01: canonical aliases, optional original columns and conflicting identities are explicit|PASS|
|15|erp-core-alignment.spec.cjs|ERP02: real XLSX keeps metadata, separates same code with different specs, and survives SQLite refresh|PASS|
|16|erp-core-alignment.spec.cjs|ERP03: equal specifications merge quantity; conflicting canonical and alias header blocks commit|PASS|
|17|erp-core-alignment.spec.cjs|ERP05: wide 220-column ERP source survives native XLSX importer and remains internal metadata|PASS|
|18|erp-core-alignment.spec.cjs|ERP04: new ERP fields are searchable/editable, internal-vs-supplier export boundaries hold|PASS|
|19|erp-core-alignment.spec.cjs|ERP06: repeated internal XLSX export and UI import keep current/source RFQ IDs distinct|PASS|
|20|erp-core-alignment.spec.cjs|ERP07: specifications visibly distinguish drawing candidates and supplier allocation|PASS|
|21|erp-core-alignment.spec.cjs|ERP08: confirmed cannot supply remains visible in comparison, not a zero-priced offer|PASS|
|22|erp-core-alignment.spec.cjs|ERP09: second-round scope shows specification and preserves selected line identities|PASS|
|23|erp-core-alignment.spec.cjs|ERP10: settings provide three correct XLSX import templates and one header-aware CSV template|PASS|
|24|erp-core-alignment.spec.cjs|ERP11: rejected and canceled material previews do not alter line sequence or saved workspace|PASS|
|25|uat-13-fixes.spec.cjs|UAT-01 categories follow active imported RFQ in both allocation views|PASS|
|26|uat-13-fixes.spec.cjs|UAT-02 manual, pasted and CSV file quotation sources remain distinct in stored state|PASS|
|27|uat-13-fixes.spec.cjs|UAT-03 refused restore is visible within current backup section while project drawer collapsed|PASS|
|28|uat-13-fixes.spec.cjs|UAT-04 item editor Escape, dirty cancel and keyboard focus confinement|PASS|
|29|uat-13-fixes.spec.cjs|UAT-07 drawing guidance reflects currently selected formal RFQ material|PASS|
|30|ui-v2-b1.spec.cjs|UI V2 B1 real workspace and visual layout 1366x768|PASS|
|31|ui-v2-b1.spec.cjs|UI V2 B1 real workspace and visual layout 1600x900|PASS|
|32|ui-v2-b2.spec.cjs|B2 allocation real-browser 1366x768|PASS|
|33|ui-v2-b2.spec.cjs|B2 allocation real-browser 1600x900|PASS|
|34|ui-v2-b3.spec.cjs|B3 quote and comparison with real SQLite 1366x768|PASS|
|35|ui-v2-b3.spec.cjs|B3 quote and comparison with real SQLite 1600x900|PASS|
|36|ui-v2-exploratory.spec.cjs|EXPLORATORY: desktop stages, control visibility and geometry 1024x768|PASS|
|37|ui-v2-exploratory.spec.cjs|EXPLORATORY: desktop stages, control visibility and geometry 1366x768|PASS|
|38|ui-v2-exploratory.spec.cjs|EXPLORATORY: desktop stages, control visibility and geometry 1600x900|PASS|
