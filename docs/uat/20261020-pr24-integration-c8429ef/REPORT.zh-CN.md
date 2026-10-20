# PR24 c8429ef 独立集成验收停止报告 / TEST-ONLY

**NOT-READY：首次操作失败后依指令停止，集成业务验收未完成。失败分类为测试前置条件／操作路径错误，未确认新的产品P1/P2/P3；也不能据此宣布产品没有缺陷或整个软件通过。报告须由ChatGPT审核。**

本轮不是重跑PR39的P2/P3和24次S4套件。优先设计真实模板填写重导入、CSV安全更新、图纸人工匹配、后续议价范围/阶梯/明确沿用及集成保存恢复。仅前两步实际开始；首个非预期失败在图纸人工选择处，之后没有继续任何业务操作、没有修正独立驱动后重跑、没有补验其他模块。

## Version and CI / 版本与门槛

唯一产品 / only product: `c8429ef51731da570c7a556d7cdce89e7123e739`. PR24 HEAD exact at start/end; direct checkout, not synthetic merge. Official `prototype/m1-lite` HTTP bytes equal checkout SHA256 `bc4288bf60f8971f8549dac3bdb4015617a23eeb4ce383ed103c66908f00cb6b`. Real Chromium154.0.8037.57 / Playwright1.58.2, independent temporary SQLite `/tmp/c842/data`; no existing business data accessed.

- [UI Unified #55 /39394554901](https://github.com/yudacheng666/SRM_System/actions/runs/39394554901): Linux118533929283 / Windows118533929739 SUCCESS.
- [S3/S4 #158 /39394554892](https://github.com/yudacheng666/SRM_System/actions/runs/39394554892): Linux118533929189 / Windows118533929525 SUCCESS.
- [PR comments, gate and jobs](evidence/github-gate.json), [final HEAD](evidence/github-final.json), [runtime identity](evidence/runtime-identity.json), [protected refs before](evidence/protected-refs-before.txt)/[after](evidence/protected-refs-after.txt). Main/development/fix refs unchanged. CI was a gate, not a replacement for independent testing; existing suites were not rerun.

## 实际执行与通过范围

主浏览器UTC2026-10-20 09:00:38–09:02:34（北京时间17:00:38–17:02:34），1366×768。虚构RFQ `RFQ-1792486851958-G8BW1Z`：4行物料，同编码轴件M16/M20分别10/25件，底座4件和另一物料6件；使用虚构PDF与供应商/报价准备资料，无真实企业信息。

在正式UI下载三份XLSX物料/供应商/报价模板及一份匹配更新CSV。实际文件核对单工作表、纯表头、原生字段名及CSV UTF8 BOM。复制原下载模板填入虚构数据：物料真实导入成功并核对四个RFQ行/编码/数量；供应商和报价填充文件仅准备，**未导入，不标为端到端PASS**。

下载CSV模板填入歧义同码键时正确阻止确认，取消后不变；填入唯一底座键时预览不写入，确认后仅RFQ-L00003类别更新。三份PDF预览实际显示唯一候选、多候选、未匹配，未自行建立正式关系；多候选及未匹配无自动目标、数据库/PDF在预览前后相同。

| ID | Result | Scope / 范围 | Evidence / 证据 |
|---|---|---|---|
|GATE|PASS|PR24准确HEAD及两项CI全部Windows/Linux作业 / Exact HEAD and both CI workflows|[evidence](evidence/github-gate.json)|
|C01|PASS|4个真实模板下载，XLSX/CSV表头与格式，下载不改工作区 / Actual template files and non-mutating downloads|[evidence](evidence/template-file-checks.json)|
|C02a|PASS|填写真实物料模板后正式导入，4行/同编码不同规格/数量准确 / Filled downloaded material template imports real4lines|[evidence](evidence/01-filled-material-template-preview.png)|
|C02b|PASS|CSV歧义更新阻止/取消不变，唯一匹配预览不写入、确认只更新目标行 / Ambiguous and unique matched-update safety|[evidence](evidence/01-valid-preview-no-write.json)|
|C03a|PASS|图纸唯一/多候选/未匹配预览、无自动目标、预览不改业务 / Three matching states and non-mutating preview|[evidence](evidence/03-three-drawing-match-states.png)|
|C03b|FAIL operation; TEST PRECONDITION|未匹配文件行内下拉不存在RFQ-L00003，selectOption20秒超时 / Attempting nonexistent candidate option times out|[evidence](FAILURE-C03-UNMATCHED-SELECT.md)|
|C03c|NOT TESTED|多候选/未匹配实际人工指定、确认保存、真实PDF预览 / Actual manual override, committed association and PDF viewer|[evidence](REPORT.en.md)|
|C04|NOT TESTED|供应商模板填充导入、多对多分配/追加/删除/视角 / Supplier import and assignment integration|[evidence](TEST-SCOPE.md)|
|C05|NOT TESTED|完整多轮报价、同轮修订、阶梯、范围、明确沿用、历史与定标 / Multiround, revisions, tiers, scope, carry and awards|[evidence](TEST-SCOPE.md)|
|C06|NOT TESTED|实际供应商询价包、业务Excel/比价CSV及数量金额核对 / Supplier package/business workbook/comparison output|[evidence](TEST-SCOPE.md)|
|C07|NOT TESTED|跨RFQ/F5/真实服务重启一致性 / Cross-RFQ, refresh and restart persistence|[evidence](TEST-SCOPE.md)|
|C08|NOT TESTED|单次S4冒烟及空目录/非空恢复 / One S4 smoke and empty/nonempty restore|[evidence](TEST-SCOPE.md)|
|C09|NOT TESTED|完整三尺寸UI V3兼容和P2/P3合并后冒烟 / Three-size V3 compatibility and P2/P3 smoke|[evidence](TEST-SCOPE.md)|

## 首失败与分类

独立驱动先在多候选行选择RFQ-L00002并勾选（仅暂存UI），接着错误尝试：

`page.locator('[data-batch-target="2"]').selectOption('RFQ-L00003')`

第3个未匹配文件没有候选项；该行下拉并不含RFQ-L00003。Playwright在同一个动作内等待选项20秒后超时，UTC09:02:34.135写入`failure-stop.json`并停止，原错误/调用日志/截图/完整trace保留。没有执行“确认建立选中关联”，没有写入图纸/PDF。截图中多候选已暂选第2行，未匹配仍“尚未指定”。

**分类：测试前置条件／错误操作路径，不是已确认产品缺陷，也没有环境故障证据。** 截图清楚显示全局“手工指定到”及每行“指定此文件”；只读源码证明行内下拉仅生成候选，人工覆盖通过先聚焦文件，再选全局RFQ行，点击“指定给选中文件”后才追加人工选项。本轮未走该路径，不能将其功能判PASS。

[详细失败说明](FAILURE-C03-UNMATCHED-SELECT.md) · [原停止标记](evidence/failure-stop.json) · [原失败截图](evidence/FAIL-first-observed.png) · [失败页面文字](evidence/FAIL-first-observed.txt) · [完整trace](evidence/independent-browser-trace.zip) · [分类JSON](evidence/FAIL-classification.json) · [只读源码](evidence/FAIL-readonly-source.txt)。

停止后仅只读核对现有证据、版本/引用、已保存SQLite当前快照/PDF和捕获内存：三者与预览前一致，物料仍4行、类别修改保留，图纸未提交。归档停止时完整历史可供审核，但没有预览前完整历史行快照，不冒称已完成全历史恢复校验。停止后没有新浏览器操作、没有重启主服务来测试业务、没有另开业务测试。

## 数量与证据边界

13条浏览器断言13true/0false，另有1次实际操作超时，不能称本轮“全部通过”。11条模板文件检查通过；4个模板实际下载，5张实际截图，1份trace（CRC有效）。0次S4完整下载/恢复，没有供应商报价包/业务比较文件证据，因为相关步骤未执行。浏览器无pageerror；1条图标404保留，未见其导致选项不存在。

UI仅物料/设置/图纸当前1366尺寸有观察，不能扩大为三尺寸UI V3兼容。PR39/PR36旧SHA结果不继承为本SHA PASS；即便产品文件相同也不推断采购/恢复通过。已有P2/P3/S4整套未重跑，原计划必要冒烟因停止也未执行。

## NOT TESTED与后续建议

未匹配人工指定及多候选关联正式确认、供应商导入分配、完整多轮/修订/阶梯/明确沿用与定标、实际询价包/比价金额导出、跨RFQ/F5/真实服务重启、空白/非空恢复、三尺寸UI兼容均NOT TESTED。Windows本机、桌面Excel重算打印、物理磁盘/断电/长期负载、全部组合仍NOT TESTED。

建议ChatGPT先审核失败分类和原证据；下一轮明确使用已有人工指定入口重新从图纸阶段开始，再完成C04–C09。没有证据要求修改产品代码来解决本次操作路径错误。**本轮不足以批准PR24合入开发基线，更不能宣布整软件完成验收。** 不请求或执行合并。

严格TEST-ONLY：只新增报告/匿名证据及执行过的独立方法TXT。产品、原有测试、CI、开发/main未修改，未合并/关闭PR。两个本轮自建临时服务（含未访问的空恢复服务9421）已停止，未删除任何数据。

## 证据索引

[截图](SCREENSHOTS.md) · [原浏览器/请求/错误](evidence/browser.jsonl) · [服务日志](evidence/server.log) · [原trace](evidence/independent-browser-trace.zip) · [完整停止时历史](evidence/history-at-stop.json) · [机器结果](results.json) · [范围/停止规则](TEST-SCOPE.md) · [SHA256](SHA256SUMS.txt)。
