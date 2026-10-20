# PR24 合并候选独立续验 / TEST-ONLY

**结论：NOT-READY。采购定标、报价历史及本轮备份恢复场景通过；确认1项P2导出误阻止和1项P3只读导航误提示。不能宣布整个软件验收完成。没有新确认P1；没有观察到数据损坏，但这不等于证明所有数据安全场景。**

本轮按用户更新后的继续验收指令，在新隔离环境执行，补齐PR35停止后未测范围。PR35的原始31检查/30true/1false及有限同例补验证据保持原样，不撤回、不改成PASS。本轮失败后保留现场、分类，再继续不依赖失败导出的业务/恢复检查；没有修改产品或通过跳过原测试消除失败。

## Version and CI / 版本与门槛

- 唯一产品 / Only product: `d411f4e17a0ab8e75412e5c91a91ccba6abbbc0e`; checkout directly at this SHA, not CI synthetic merge `3d50a902...`.
- Tree: `80b2f45b37771b278fb663ebc55f7bf08fedc8ae`. Served `/` bytes equal checked-out `prototype/m1-lite/index.html`, SHA256 `6ab488c8eb0e246e8776187a2222adec07a754b1a83cd5488ae73886812e9ec3`.
- [UI Unified #48 /39379118995](https://github.com/yudacheng666/SRM_System/actions/runs/39379118995): Windows118483896372 + Linux118483896234 SUCCESS.
- [S3/S4 #148 /39379119121](https://github.com/yudacheng666/SRM_System/actions/runs/39379119121): Windows118483896719 + Linux118483896945 SUCCESS.
- Each Linux log reports43Python /10Node /44Chromium passes. Artifact-upload quota warnings remain separate best-effort CI limitations. Independent evidence is archived here; CI does not establish whole-product acceptance.
- [Gate snapshot](evidence/github-gate.json), [final PR state](evidence/github-final.json), [identity](evidence/runtime-identity.json), [before refs](evidence/protected-refs-before.txt), [after refs](evidence/protected-refs-after.txt). PR24 remained Draft/open/unmerged and exact HEAD throughout browser tests; main/development/fix refs unchanged.

## 方法与数据

2026-10-20 UTC06:37:52–06:46:18（北京时间14:37:52–14:46:18）主浏览器；另有独立真实409/断服浏览器记录。Linux真实Chromium154.0.8037.57、Playwright1.58.2，运行正式M1-Lite服务和临时SQLite。新目录`/tmp/r4/data`、`restore`、`restore-final`、`fault-data`，服务9090–9093。只读SQLite完整快照和PDF哈希核对业务状态；未访问已有业务数据。

虚构RFQ `RFQ-1792478290303-FO4WEZ`和第二空RFQ；4行物料（同编码M16/M20、10/25件；不供货4件；8/12元理由项6件），A/B/C三家虚构供应商。真实XLSX导入、唯一/多候选/未匹配图纸预览、592字节有效PDF、报价A10→9、A/B20并列、B12高于A8。新增C20保留B20人工决定，B修订21后重新核对，改选C20清除。A/B共同范围合计638/692，B修订后638/717；理论最低638、人工选择662；不报价保持空值，不当零。

未仅重复CI44例；新浏览器步骤、真实点击/键盘、弹窗、下载、服务进程重启、两次恢复以及真实并发409均有独立证据。[执行步骤与驱动](method/console.cjs.txt)，实际执行步骤可在浏览器日志`kind=step`核对。只归档独立方法为TXT，不改现有测试；下载异常后的06b为继续剩余步骤，原06失败仍完整保留。

## 结果

| ID | Result | Scope / 范围 | Evidence / 证据 |
|---|---|---|---|
| GATE | PASS | 准确产品SHA、两项Windows/Linux CI及HTTP文件字节 / Exact product, CI gate and served bytes | [evidence](evidence/runtime-identity.json) |
| B01 | PASS | 真实XLSX物料/供应商导入、同编码不同规格、追加多对多关联 / Real XLSX imports and additive relationships | [evidence](evidence/02-supplier-multi-allocation.png) |
| B02 | PASS | 图纸唯一/多候选/未匹配预览、确认、重启后真实PDF / Drawing matching and native PDF after restart | [evidence](evidence/PDF-real-preview-after-restart.png) |
| B03 | PASS | 报价V1锁定、同轮V2草稿不生效、确认后差异及V1保留 / Quote history, locks and effective revision | [evidence](evidence/V04-V2-confirmed-diff.png) |
| B04 | PASS | 20/20单行键盘及批量定标不需理由；8/12真正高价拒绝空白理由 / Tied-lowest vs genuine higher-price reasons | [evidence](evidence/T04-bulk-B-tie-has-no-exception.png) |
| B05 | PASS | 人工选择清除待核对；C20不误重开，B21重开，F5保留，改选C20清除 / Review lifecycle with new confirmed prices | [evidence](evidence/T09-reconfirmed-C-no-pending.png) |
| B06 | PASS | CSV实际数量金额/共同范围、报价报表/业务Excel内容 / CSV and business/comparison workbook contents | [evidence](evidence/business-file-validation.json) |
| B07 | PASS | 手动保存、F5、跨RFQ、真实服务重启、非法/取消预览不变更业务 / Save, refresh, RFQ switch, service restart and invalid preview safety | [evidence](evidence/19-final.json) |
| S01 | PASS | 24次RFQ切换+顶部管理入口立即S4下载：24成功、0失败、0超时 / 24 rapid S4 downloads after RFQ switch | [evidence](evidence/obs-attempts.csv) |
| S02 | PASS | 本轮25份新S4及3份PR35同SHA历史输入，完整ZIP/SQLite历史/PDF校验 / 25 new plus3 historical archive content checks | [evidence](evidence/archive-validation.json) |
| S03 | PASS | 两份不同阶段备份恢复到两个空目录；两个非空拒绝且不覆盖 / Two empty restores and two nonempty refusals | [evidence](evidence/history-final-restored.json) |
| S04 | PASS | 真实后端409及实际断服保持警告/不备份/数据不覆盖，重载或真保存后清除 / Actual409 and service outage safety | [evidence](evidence/final-fault-results.json) |
| U01 | PASS | 三尺寸页面、导航、V01–V04、禁用报价按钮和解释提示 / Three-size layout and disabled quote controls | [evidence](evidence/prod-1024-items.png) |
| F01 | FAIL P2 | 供应商A首轮询价包导出被“未保存”误阻止，20秒无下载 / First supplier RFQ export falsely refused | [evidence](ISSUE-P2-EXPORT-01.md) |
| F02 | FAIL P3 | 只读界面切换后新建RFQ误报未保存，快照相同 / View-only navigation falsely warns of unsaved edits | [evidence](ISSUE-P3-NAV-01.md) |
| H01 | PASS prior / 原有证据 | PR35同SHA三尺寸S4邻近原因/自动保存清除、BUSY及有限500补验；本轮不重算原31断言 / Prior bounded same-SHA evidence only | [evidence](https://github.com/yudacheng666/SRM_System/blob/f3274a8f0e25b02b8108bfdbb597d839750ab3eb/docs/uat/20261020-pr24-integration-d411f4e/REPORT.en.md) |
| N01 | NOT TESTED | Windows本机、桌面Excel重算打印、生产物理故障/长期负载 / Native Windows, desktop Excel and physical/long-duration failures | [evidence](REPORT.en.md) |
| N02 | NOT TESTED | PR23完整像素一致性、所有业务组合/多轮阶梯价/全部模板重新填充导入 / Full design pixel parity and every business/import combination | [evidence](REPORT.en.md) |
| N03 | NOT TESTED this continuation | 受控HTTP500与route.abort不在本轮重跑；500仅引用PR35有限补验 / Controlled500 and route.abort not rerun | [evidence](REPORT.en.md) |

## 失败、不确定性与优先级

1. **P2-EXPORT-01：功能/操作体验。** 进入供应商分配→生成询价单→选择A→下载，首轮20秒无下载。界面明确“不能导出：有未保存的修改”，同时自动保存声称“已同步第10版；无待保存修改”。按钮仍可用。后续只读内存快照与保存快照完全相同，持久化全量指纹不变。未做业务编辑或手动保存的单次A重试成功，B和全部打包也下载。重试文件故意命名`retry-supplier-A.zip`；首次失败不是文件成功、也不是后续成功证明已修复。[详细复现/证据/建议](ISSUE-P2-EXPORT-01.md)。
2. **P3-NAV-01：操作体验。** 从已保存RFQ仅切换分配视角/选择B，快照完全一致，点击新建却弹“尚有未保存修改”。取消后业务未变。[详细说明](ISSUE-P3-NAV-01.md)。

两项可能同属“界面事件误设dirty”的相关症状，不声称两个独立根因，也没有基准对照证明由d411合并新引入。源码只读显示全局input/click倾向设置dirty，而导出guard拒绝dirty；首次导出点击时内部dirty转换未直接采样。事实是错误业务阻止及互相矛盾的保存反馈；具体应修改哪个事件由ChatGPT修复者确认。

原始主日志189检查188true/1false（导航警告），另有1个真实导出等待超时driver-error（不在189布尔检查分母中）；真实409/断服15/15。文件/事件校验311/311、业务导出内容37/37。这些是不同层级断言，不相加伪称“552业务用例全过”。没有pageerror；3条主浏览器console404/图标请求保留，不升级为采购逻辑缺陷。

## S4与恢复证据边界

24次RFQ切换返回后顶部管理入口→S4：24成功、0失败/超时，管理入口到备份点击约85–796ms；20次只读CDP条件日志记录dirty/busy/blocked均false，最后4次关闭guard日志仍成功；不修改产品脚本或内部guard。每次HTTP201→200和真实下载事件均记录。本轮另有首份完整备份，共25新文件。3份PR35同SHA历史ZIP明确标注来源，不冒充本轮28次新下载。

对28归档分别核对CRC、manifest数据库/PDF SHA、SQLite integrity_check、全部workspaces与workspace_versions逐行字段、对应阶段PDF字节；不是只检查文件存在。两份不同阶段新ZIP恢复两个空目录，当前/完整历史/PDF逐字段一致；两个非空目标均拒绝，数据不变。[逐次结果](evidence/obs-attempts.csv)、[文件校验](evidence/archive-validation.json)、[恢复历史](evidence/history-final-restored.json)。

真实保存故障使用独立数据：暂扣实际PUT，让第二浏览器真保存，释放陈旧PUT取得后端409；已建立S4原因在视口保持、未发备份API、胜出数据不覆盖，安全重载清除旧提示。实际停止该故障服务产生网络失败，保持警告/禁用/数据，重启后真实保存清除。与route.fulfill伪409不同。受控500、三尺寸S4邻近提示和BUSY本轮引用PR35同SHA限定证据，不计作重新执行；PR35原前置失败不撤回。

## 未测与下一步

Windows本机、桌面Excel公式重算/打印、实际磁盘满/断电、生产数据/长时间负载、PR23完整像素级对照、全部业务组合（多轮阶梯价、所有模板再次填充导入等）NOT TESTED。当前覆盖不是完整产品认证。备份代码注明原始邮件/截图尚未纳入，不能把SQLite+PDF称为所有采购凭证完整归档。

优先由ChatGPT修复P2导出错误阻止，并联合检查P3导航假dirty；保留真实未保存/保存中/409保护。修复后对新SHA跑CI并独立复验两条原路径、真正未保存导出保护及S4/恢复/采购核心。此次不建议据部分通过宣称PR24整体验收完成；不合并任何PR。只新增本目录报告/匿名证据，未修改产品、原测试、CI或开发分支。

## 证据导航

[98张真实截图索引](SCREENSHOTS.md) · [主trace](evidence/independent-v31-browser-trace.zip) · [故障trace](evidence/conflict-recheck-trace.zip) · [主浏览器日志](evidence/browser.jsonl) · [OBS网络与guard](evidence/obs-browser.jsonl) · [故障浏览器](evidence/conflict-recheck-browser.jsonl) · [主服务日志](evidence/server.log) · [故障首次服务日志](evidence/fault-server.log) · [故障重启日志](evidence/feedback-server.log) · [首次恢复日志](evidence/restore-server.log) · [最终恢复日志](evidence/final-restore-server.log) · [机器状态表](results.json) · [SHA256清单](SHA256SUMS.txt)。
