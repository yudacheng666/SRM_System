# PR #30 — TEST-ONLY independent evidence / 独立验收证据

Product SHA / 产品版本：`69f660cb2944e278a1e12b4824d8532b0fe6c7c3`。

**Original OBS-01 rapid path PASS24/24; business/data safety PASS; overall acceptance FAIL on one residual P3 visible-feedback issue.** 原快速下载路径通过；业务/数据保护通过；收起项目操作区时暂停提示不可见，整体不判通过。

- [中文完整报告](REPORT.zh-CN.md) / [Full English report](REPORT.en.md)
- [截图索引 / Screenshots](SCREENSHOTS.md)
- [29次定向点击CSV / Attempts](evidence/all-backup-attempts.csv)、[汇总 / Summary](evidence/obs-summary.json)
- [原始记录 / Raw attempts](evidence/obs-attempts.json)、[完整检查 / Checks](evidence/independent-checks.json)
- [文件校验 / Archive validation](evidence/obs-file-validation.json)、[业务导出 / Business exports](evidence/business-file-validation.json)
- [主trace / Main trace](evidence/independent-v31-browser-trace.zip)、[补充trace / Control trace](evidence/feedback-control-trace.zip)
- [分组结果 / Grouped results](results.json)、[SHA256](SHA256SUMS.txt)

29次定向点击 =26实际下载+3保护阻止，正向意外超时0；另外首次流程备份1份，全程27个S4ZIP。One expected1.2s negative-control wait expiry is preserved; N02's missed busy timing is explicitly classified, then rechecked correctly in B01. Do not count guarded clicks as downloads or raw failed harness timing expectations as product safety bypasses.

Only new reports, evidence, synthetic fixtures/downloads and non-executable method text. No product/existing test/CI changes; no main/development ref update or PR merge/closure. Evidence Draft PR targets the fix branch and should be retained as evidence rather than merged as a product fix.
