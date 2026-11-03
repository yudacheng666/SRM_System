# Prior failure-name mapping / 原失败名称逐项复验

All statuses below come from the current d7c4c88 execution only. This is an overlapping subset of58 E2E cases. Old reports are used solely as a name inventory.

| Prior group | Current result | Case |
|---|---|---|
| OUTDATED_SAVE_WORDING | PASS | 02 XLSX 12/100, duplicates and invalid format / 物料 |
| OUTDATED_SAVE_WORDING | PASS | 03 suppliers and bidirectional additive allocation / 供应商与分配 |
| OUTDATED_SAVE_WORDING | PASS | 04 real quote imports, rounds, tiers, immutable confirmation and comparison XLSX / 报价比价 |
| OUTDATED_SAVE_WORDING | PASS | 05 PDF matching, manual correction, refresh and scoped supplier ZIP / 图纸询价包 |
| OUTDATED_SAVE_WORDING | PASS | 06 full backup restore: actual imported quotes, history, PDFs, overwrite refusal / 完整恢复 |
| OUTDATED_SAVE_WORDING | PASS | 07 real service disconnect and stale-tab 409 halt autosave / 自动保存失败 |
| OUTDATED_SAVE_WORDING | FAIL | 08 bad PDF and damaged ZIP never contaminate saved data / 异常回归 |
| OUTDATED_SAVE_WORDING | PASS | 11 formal RFQ identity in missing-quote CSV and working export shortcut / 单据追溯 |
| OUTDATED_SAVE_WORDING | PASS | 14 common-scope CSV uses the real RFQ ID across two workspaces and restart / 同范围报价追溯 |
| OUTDATED_SAVE_WORDING | FAIL | 15 new RFQ clears stale supplier-first context without corrupting saved RFQs / 供应商跨询价隔离 |
| OUTDATED_SAVE_WORDING | PASS | 44 S4 blocked-download reason stays visible beside the action / 备份阻止原因始终可见 |
| OUTDATED_SAVE_WORDING | FAIL | 45 P2-EXPORT-01 first supplier package export after view-only choices / 首次供应商包正常导出 |
| OUTDATED_SAVE_WORDING | FAIL | 46 P3-NAV-01 view navigation versus actual unsaved edit / 只读导航与真实脏数据区分 |
| OUTDATED_REFUSAL_WORDING | PASS | UAT-03 refused restore is visible within current backup section while project drawer collapsed |
| CONFIRMED_HORIZONTAL_OVERFLOW | PASS | UX visual system: shared six-page design and SVG navigation / 六页统一视觉回归 |
| OUTDATED_FONT_ASSERTION | PASS | UI V2 B1 real workspace and visual layout 1366x768 |
| OUTDATED_FONT_ASSERTION | PASS | UI V2 B1 real workspace and visual layout 1600x900 |
| CONFIRMED_HORIZONTAL_OVERFLOW | PASS | B3 quote and comparison with real SQLite 1366x768 |
| CONFIRMED_HORIZONTAL_OVERFLOW | PASS | B3 quote and comparison with real SQLite 1600x900 |
| CONFIRMED_HORIZONTAL_OVERFLOW | PASS | EXPLORATORY: desktop stages, control visibility and geometry 1024x768 |
| CONFIRMED_HORIZONTAL_OVERFLOW | PASS | EXPLORATORY: desktop stages, control visibility and geometry 1366x768 |
| CONFIRMED_HORIZONTAL_OVERFLOW | PASS | EXPLORATORY: desktop stages, control visibility and geometry 1600x900 |
| OUTDATED_INTERNAL_TITLE_ASSERTION | FAIL | UI V3 integration: theme, active navigation and responsive workspace / 视觉与导航回归 |
