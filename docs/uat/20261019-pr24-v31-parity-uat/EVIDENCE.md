# 证据索引 / Evidence index

- [双语报告](REPORT.md)、[分维度结果](RESULTS.json)、[逐页配对截图](COMPARISON.md)。
- [任务文档](evidence/parity-task.md)、[说明/全部评论/CI初始状态](evidence/github-initial.json)、[最终版本与CI](evidence/github-final.json)、[远端refs](evidence/remote-refs.txt)。
- [完整主路径操作、dialog、请求、快照检查 JSONL](evidence/browser.jsonl)，其中 step 含实际执行操作源文本，非事后补写断言。
- [主 Playwright trace](evidence/independent-v31-browser-trace.zip)、[真实PDF新会话trace](evidence/PDF-fresh-session-trace.zip)、[主trace实际加载证明](evidence/trace-viewer-validation.png)。
- [隐藏物料标题与版本列 probe](evidence/visual-probe.json)、[产品三尺寸几何](evidence/product-geometry.json)、[参考三尺寸几何](evidence/reference-geometry.json)。
- [匹配候选实拍](evidence/03-drawing-match-candidates.png)、[明确关联结果](evidence/03-drawing-confirmed.png)、[真实PDF已显示](evidence/PDF-fresh-session-20s.png)。
- [P3灰阶/说明](evidence/P3-fixed-1366.png)、[原V1](evidence/history-original-V1.png)、[人工原因必填](evidence/06-award-reason-required.png)。
- [进程重启](evidence/11-real-restart-awards.png)、[S4完整恢复](evidence/12-restored-awards.png)、[非空拒绝覆盖](evidence/13-nonempty-restore-refused.png)。
- [下载清单](DOWNLOADS.md)、[金额/报表/备份/快照审计](evidence/artifact-inspection.json)、[供应商隐私/空价格/PDF审计](evidence/supplier-export-inspection.json)。
- [UI原始CI日志](evidence/ci-ui.txt)、[S3/S4原始CI日志](evidence/ci-s3s4.txt)、[正式服务日志](evidence/server.log)、[恢复服务](evidence/restore-server.log)、[参考静态服务](evidence/reference-server.log)。

PNG及同名TXT是实拍与原始页面文字，未编辑；`*-original.json`是SQLite原始snapshot_json；各phase JSON含revision、raw SHA、完整snapshot和PDF哈希。fixtures仅虚构输入，downloads是实际业务下载。没有把PR23概念原型或上一轮业务证据冒充新候选实测。没有提交产品或测试程序修改。SHA256SUMS覆盖其余全部归档文件。
