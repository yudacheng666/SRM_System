# 实际命令和独立复现 / Commands and reproduction

基线worktree `/tmp/srm-integration-uat`，精确SHA420d2af326a3f59c1c6015d6b0fe44db23fe0fc6。Node依赖从同版本1.58.2已安装依赖复用，未修改package/lockfile。命令详见REPORT及原始日志，各记录退出码0。

```bash
python -m unittest discover -v -s prototype/m1-lite/backend -p 'test_*.py'
npm test
SRM_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
SRM_DATA_DIR=/tmp/srm-integration-data python prototype/m1-lite/tests/e2e/serve.py 8920
SRM_DATA_DIR=/tmp/srm-integration-restore-data python prototype/m1-lite/tests/e2e/serve.py 8921
node /tmp/srm-integration-console.cjs
```

所有GUI业务修改经浏览器。console的run读取steps并记录源码；依次01、02、03、04、04b（业务状态词被拒绝后GUI修订更正）、05、06、06b（真实收起工具补拍）、07。步骤07完成并打印CLOSED_FOR_ACTUAL_RESTART后才终止8920；用相同SRM_DATA_DIR和worktree重新启动真实进程；再执行08比较两个RFQ、导出第二个问题CSV并对8921空目录GUI恢复/再次拒绝覆盖；09补拍收起状态并导出漏报CSV，比较最终状态后保存trace并关闭浏览器。浏览器原始日志中全部run已完成；无驱动中止或代码修正。

readonly fingerprint连接file:.../srm.sqlite3?mode=ro，业务变更await完成后等待保存窗口再读，记录完整snapshot原文和SHA；不使用GUI“保存”来干预预览取消的严格比较。正式确认后使用GUI保存以锁定业务结果。

复现INTEG-01只需新建正式RFQ、两供应商有同一物料有效报价，④比价勾选两家→分析→导出全部共同项目CSV；观察浏览器download.suggestedFilename及内容。此操作不会修改数据。本轮两次下载的内容相同，第二次在真正服务重启后完成。

独立trace用tools/check-trace.cjs实际启动Viewer载入验证；所有38个自动trace ZIP完整性校验。重跑请改用新的临时目录与空闲端口，并按实际安装位置调整工具中的Playwright绝对路径，禁止指向用户现有业务数据库。
