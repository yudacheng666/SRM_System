# 独立复现说明 / Reproduction notes

本轮实际使用新隔离worktree和数据目录，不改变原仓库工作文件。所有业务修改必须经UI。工具中 `/tmp` 路径是本轮实际环境；重跑应改用全新临时目录并把Playwright require路径调整到安装位置。保存的脚本是本轮原始驱动及修正步骤，未将历史错误重写为干净通过。

启动每个精确SHA的实际服务：

```bash
SRM_DATA_DIR=/tmp/srm-p301-old-data python prototype/m1-lite/tests/e2e/serve.py 8901
SRM_DATA_DIR=/tmp/srm-p301-data python prototype/m1-lite/tests/e2e/serve.py 8902
SRM_DATA_DIR=/tmp/srm-p301-restore-data python prototype/m1-lite/tests/e2e/serve.py 8903
SRM_DATA_DIR=/tmp/srm-p301-aux-data python prototype/m1-lite/tests/e2e/serve.py 8904
node /tmp/srm-p301-console.cjs
```

每个服务在对应版本worktree启动。console默认打开旧版8901；`run('步骤文件.js')`执行真实Playwright动作。`browser-actions.jsonl`包含实际执行顺序及源码，不能盲目重跑所有文件：01曾中止于错误选择器；实际继续02；06确认合并后中止于隐藏确认，改07；08 PDF成功后等待文案不匹配，改08b；09使用非法交期尝试，10才是数字交期的正式成功导入。具体修正在REPORT.md完整说明。

只读fingerprint脚本连接 `file:.../srm.sqlite3?mode=ro`。按每次UI操作await完成并等待4.2–6.5秒后读取；保存原始snapshot_json及其UTF-8 SHA256。预览不调用“保存到本机”来人为改变元数据。

两次真正8902进程重启按以下实际顺序进行，均非仅F5：

1. `05-repeat.js`结束打印NEW_PAGE_CLOSED_FOR_REAL_RESTART；readonly `new-10-before-empty-restart`已保存。
2. 终止匹配自身命令 `^python prototype/m1-lite/tests/e2e/serve.py 8902$` 的进程，重新以同一SRM_DATA_DIR/同一候选worktree启动8902。
3. `06-confirm.js`新开页面，读取`new-11-after-empty-restart`，与最初空白snapshot完全一致，再开始正式导入。
4. `11-backup-restart.js`完成rich F5、S4下载，打印RICH_PAGE_CLOSED_FOR_REAL_RESTART；其结果已完成后才终止8902。
5. 再以相同目录及候选启动8902，`12-restore-F1.js`新开页面，`new-29-after-rich-restart`与rich基线完全一致。

8903为空目录，只通过UI上传真实下载S4 ZIP恢复；比较完整状态后再在此恢复副本做R2显示抽测。8904单独新建RFQ做F1来源ID往返，未修改8902主状态。所有本轮服务、浏览器最终停止。

检查 `tools/inspect.py` 为只读导出/S4 ZIP/历史报价检查；模板填充工具只写脱敏输入文件。Trace使用Playwright1.58.2 Viewer实际载入通过，截图29与载入文本已归档。
