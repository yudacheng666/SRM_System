## [Codex Cloud INDEPENDENT RETEST TASK] INTEG-01 同范围报价 CSV 询价身份（仅测试）

**身份：Codex Cloud 独立验收员。不得修改业务程序、测试代码或 CI，不得合并 PR、不得改开发基线/main。** 此任务专门验收 ChatGPT 已提交的 P2 修复。

### 版本和参考
- 原整合 UAT 报告：[PR #15 评论](https://github.com/yudacheng666/SRM_System/pull/15#issuecomment-6219265271)；[独立证据 Draft PR #19](https://github.com/yudacheng666/SRM_System/pull/19)，仅为证据，不合并。
- **原版：** `draft/20261013-m1-storage-ui-audit@420d2af326a3f59c1c6015d6b0fe44db23fe0fc6`；INTEG-01 真实测试案例项目 `RFQ-1792164809694-HAWAB4`，CSV 被错误命名 `RFQ-DEMO-001_指定供应商组同范围报价.csv` 且内容没有 RFQ 编号；重启后复现。
- **新候选：** Draft **PR #20** `fix/20261016-common-scope-csv-rfq-id` → `draft/20261013-m1-storage-ui-audit`；候选 **HEAD `dec5e480cf87441972da05f1074dfa3589285b30`**，执行前/结束时确认 SHA。仅变更 `prototype/m1-lite/index.html` 同范围 CSV 身份，以及 `prototype/m1-lite/tests/e2e/acceptance.spec.cjs` 新增定向回归。
- 自动工作流地址：[S3/S4](https://github.com/yudacheng666/SRM_System/actions/runs/38928752765)、[UI V2](https://github.com/yudacheng666/SRM_System/actions/runs/38928752772)。**开发者 CI 结果不可冒充第三方独立业务验收；须核对最终状态。**
- Linux Codex Cloud 独立服务/SQLite/browser 新目录，全部合成数据与匿名证据。Windows GUI、Windows 原生 Excel、真实采购员生产使用继续 NOT TESTED。

### 独立测试要求
1. **旧版重现**：通过采购员真实浏览器创建虚构正式 RFQ、导入物料与两家供应商、双向分配并通过真实 UI 确认双方有效报价。进入「比价议价 → 报价金额分析 → 指定供应商组 → 导出本比较组全部共同项目 CSV」，实际下载。核对原文件名误用 `RFQ-DEMO-001`、文件内容无真实 RFQ 编号；如果只引用之前证据，必须如实说明未在本轮重跑旧版。
2. **候选修复**：在新 SHA 用完全同样的 UI 流程下载文件，文件名必须是 **`<当前真实workspaceId>_指定供应商组同范围报价.csv`**；解码真实 UTF-8 BOM CSV，表头第一列必须是 `RFQ编号`，每条共同报价明细行、最后同范围合计行的该列必须写本项目真实 RFQ 工作区编号，原 `RFQ Line ID` 列仍保存不可变物料行身份；无重复/错位列。
3. **跨项目隔离**：新建第二笔不同正式 RFQ，至少让两个项目都存在各自有效共同报价与实际下载。即使各 RFQ 内部物料行号从 RFQ-L00001 重复开始，两份文件及所有行也必须保留**各自 RFQ 工作区编号**。通过正式项目切换回来再次导出，确认无旧项目污染。
4. **持久化**：F5、真实进程终止/启动后的两项目再次导出，名称和 CSV 身份列仍正确。下载前后 SQLite 已保存版本和业务快照不改变；不因导出写入新业务版本。
5. **金额与原业务保护**：检查共同有效报价的单位价格、行金额、总额与此前原版/真实报价计算一致；缺报/不供货无零元冒充；报价 R1/R2/确认历史、真实来源、同编码不同规格 M16/M20、原有漏报 CSV 身份、内部 Excel 与供应商外发信息隔离均不受影响。
6. **特殊与异常**：演示模式如允许下载必须明确保留演示身份，不将其写成正式编号；当前工作区身份无法确定时不得以虚构正式编号静默导出；CSV 文本按原安全规则防止公式注入/非 UTF-8 乱码。
7. 给出旧版证据 + 候选 **INTEG-01 PASS / FAIL / NOT TESTED**、准确 SHA、浏览器/服务版本、实际操作记录、文件名/表头/逐行身份/金额独立解析、跨项目和重启截图、trace、只读数据库记录及剩余未测项。选择性复核此前 **25 PASS** 影响区域，勿声称 Windows 通过。

### 交付
在 **PR #20 顶层评论**发表中英结论，说明是否建议用户将 PR #20 合并至开发基线。大量证据如需保存，只允许新建独立 `test/` 证据分支 + Draft 证据 PR，不得修改产品源文件、既有测试/CI 或业务库。**绝不自行合并、绝不推进 main。** 完成后停止等待用户下一步指示。
