# 独立复现说明 / Reproduction

两隔离worktree旧420d2af、新dec5e48；真实server.main，数据目录均新建，不使用上轮业务目录。

```bash
SRM_DATA_DIR=/tmp/srm-pr20-old-data python prototype/m1-lite/tests/e2e/serve.py 8940
SRM_DATA_DIR=/tmp/srm-pr20-data python prototype/m1-lite/tests/e2e/serve.py 8941
node /tmp/srm-pr20-console.cjs
```

console run读取/tmp/srm-pr20-steps并将完整源码记录到browser-actions.jsonl。原始文件均保留，**不能把所有步骤当作无中断脚本盲跑**；实际失败/继续顺序在原始command/result与REPORT中说明。6次驱动修正没有改产品。旧版公式输入被拒绝后，最终相同文本类型XLSX分别用UI导入两版；同样物料/供应商/报价与GUI确认流程得到old-original和new-P1-R1对照。

新候选先做demo检查、P1R1，尝试确认行图纸操作被禁用后按保护不再继续；随后P1R2/明确沿用及缺报、P2完整项目、F5/切回、相关XLSX/漏报CSV。04b完成打印CLOSED_FOR_ACTUAL_RESTART并返回RESULT后，才终止匹配自身`^python prototype/m1-lite/tests/e2e/serve.py 8941$`的进程，按相同SRM_DATA_DIR/候选worktree重新启动；05新开Chromium页比较完整保存态，再逐项目下载并结束主trace。

每次共同CSV导出前后均等保存窗口并用fingerprint.py以mode=ro读SQLite，保存原始snapshot_json及摘要。parse.py以标准csv.reader/StringIO(newline='')解析真正下载文件，保留多行字段，复核BOM、名称、全体身份/金额/安全转义；exports-inspect.py只读其他真实XLSX/CSV。没有使用业务API、页面应用状态注入或直接SQLite写入。

主trace发现新建RFQ的pageerror后，用cross-probe.cjs新浏览器对旧/新各做同一路径独立探针，产生单独trace、before/after、截图与完整堆栈。探针会真实新建额外空白RFQ，已有工作记录逐一保持；不覆盖主导出无副作用快照。刷新截图证明旧标题消失。

工具中的绝对路径为本轮实际路径。复跑应新建临时目录/空闲端口并调整Playwright安装位置。task.md为原任务。GitHub Actions已只读核查，不修改、取消或重跑。所有本轮服务/浏览器最终停止。
