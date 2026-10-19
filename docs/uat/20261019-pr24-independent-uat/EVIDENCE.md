# 证据索引 / Evidence index

- [中英报告](REPORT.md)、[逐项统计](RESULTS.json)、[任务](evidence/task.md)、[PR 说明及全部评论](evidence/github-initial.json)、[结束版本](evidence/github-final.json)。
- [实际操作、检查原值、console/pageerror、dialog、请求和驱动失败 JSONL](evidence/browser.jsonl)。step 事件含本次实际执行的源文本，保留原脚本及各恢复步骤。
- [三分辨率几何矩阵](evidence/responsive-geometry.json)，15 张 viewport 图片在报告中按页面对齐链接；每张有同名原始页面文字 .txt。
- [主完整 Playwright trace](evidence/independent-browser-trace.zip)（约 34 MiB）、[有效 PDF 补验 trace](evidence/valid-PDF-supplement-trace.zip)；下载后以 Playwright Trace Viewer 打开。[实际打开证明](evidence/trace-viewer-validation.png)。
- [报价修订草稿](evidence/05-revision-draft.png)、[空原因阻止定标](evidence/06-award-reason-required.png)、[最终比价](evidence/07-comparison-award.png)、[F5 定标](evidence/09-reloaded-awards.png)。
- [新空白 RFQ](evidence/10a-new-empty-supplier-view.png)、[真实重启](evidence/11-real-restart-awards.png)、[完整恢复](evidence/12-restored-awards.png)、[非空恢复保护](evidence/13-nonempty-restore-refused.png)。
- [非法导入](evidence/16-invalid-import.png)、[P3 已禁用却亮蓝的确认按钮](evidence/17-disabled-confirm-looks-active.png)、[有效 PDF 真实渲染](evidence/18-valid-PDF-after-15s.png)。
- [实际下载清单](DOWNLOADS.md)、[文件/金额/公式/SQLite/PDF 只读检验](evidence/artifact-inspection.json)、[检查器输出](evidence/artifact-inspection.log)。
- [V3 源码与运行证据](evidence/source-integration-audit.json)、[服务日志](evidence/server.log)、[恢复服务日志](evidence/restore-server.log)、[PDF 补验日志](evidence/pdf-server.log)。
- [UI CI 原始完整日志](evidence/ci-117979576313.txt)、[S3/S4 原始完整日志](evidence/ci-117979576609.txt)，包含附件配额错误，不删除。

`*-original.json` 是 SQLite 原始 snapshot_json；各 phase JSON 含 revision、raw SHA、完整快照与 PDF 哈希。本归档不含任何真实企业数据。fixtures 是虚构输入，downloads 是未编辑的真实浏览器下载；steps/tools 是新增独立工具，不是仓库原有测试，绝对路径依赖本次环境。SHA256SUMS 覆盖其余全部归档文件，可在本目录执行 `sha256sum -c SHA256SUMS`。
