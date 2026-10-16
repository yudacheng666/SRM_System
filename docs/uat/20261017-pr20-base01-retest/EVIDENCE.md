# 证据索引 / Evidence index

全部为本轮独立实测，上一轮原版 CSV 证据仅通过 REPORT.md 中的 PR #21 链接引用。

- [原始任务](evidence/task.md)、[报告](REPORT.md)、[状态比较](STATE-COMPARISON.json)。
- [旧版实操截图](evidence/old-BASE01-reproduced.png)、[完整旧页面文字](evidence/old-BASE01-reproduced.txt)。
- [新版空白询价及 P3 提示](evidence/03-new-BASE01-cleared.png)、[F5](evidence/04-empty-P2-F5.png)、[实际重启](evidence/05-empty-P2-real-restart.png)。
- [反向切回](evidence/06-return-P1-unselected.png)、[活动供应商移出](evidence/07-active-B-removed-reset.png)、[历史保护](evidence/08-confirmed-B-removal-refused.png)。
- [规格与 PDF](evidence/09-P1-distinct-spec-PDFs.png)、[报价金额/不供货](evidence/10-P1-F3-comparison.png)。
- [S4 恢复](evidence/11-S4-restored-unselected.png)、[恢复后比价](evidence/12-S4-restored-F3-prices.png)、[F1 当前/来源身份](evidence/13-F1-current-source-distinct.png)。
- [完整浏览器行为、dialog、console/pageerror 和检查原值 JSONL](evidence/browser-actions.jsonl)。其中 step-source 记录每次实际执行的独立脚本，包括原始失败及后续恢复。
- [Playwright trace ZIP](evidence/BASE01-INTEG01-independent-trace.zip)、[Trace Viewer 实际加载证明](evidence/trace-viewer-validation.png)。下载 ZIP 后通过 Playwright Trace Viewer 打开。
- [CSV 原字节解析结果](evidence/csv-parsed.json)、[供应商 ZIP/PDF 与内部 ERP](evidence/xlsx-pdf-inspection.json)、[F1 身份](evidence/F1-inspection.json)。
- [S4 语义比较](evidence/S4-semantic-comparison.json)、[初次文件检查错误](evidence/file-inspector-original.log)、[按表头检查结果](evidence/file-inspector-corrected.log)。
- [下载文件清单](DOWNLOADS.md)，含实际建议下载名、磁盘归档名与哈希。
- [tools](tools) 是本轮新增独立测试工具；未改动仓库既有测试。绝对路径依赖本轮环境；原脚本不重写历史，恢复步骤独立保留。

`evidence/*-original.json` 是以只读方式获取的 SQLite 原始 snapshot_json；同名 phase JSON 含 revision、lineSeq、assignments、完整 state、raw snapshot SHA 和 PDF 哈希。`SHA256SUMS` 覆盖本归档所有其他文件，可从当前目录执行 `sha256sum -c SHA256SUMS`。
