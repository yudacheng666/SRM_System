## [MERGE AUDIT + CODEX CLOUD INTEGRATION RETEST] 已按用户批准完成开发基线合并

### 合并记录（2026-10-16） / Merge order
依用户明确批准，采用 `merge` 保留历史、逐项以被测 HEAD SHA 约束合并：
1. [PR #18](https://github.com/yudacheng666/SRM_System/pull/18) → `fix/20261016-pr15-uat-f1-f3`；原候选 `8af8bd119e476bdb16a20bbe5fd629db3212cccc`，合并 SHA `54a9c476e21cb351e670c22512de9c774623f5df`。
2. [PR #16](https://github.com/yudacheng666/SRM_System/pull/16) → `feat/20261016-erp-core-field-alignment`；合并头 `54a9c476...`，合并 SHA `a8f44509228fde9cf609f2ca0ed3c9753cb5808c`。
3. [PR #15](https://github.com/yudacheng666/SRM_System/pull/15) → `draft/20261013-m1-storage-ui-audit`；合并头 `a8f44509...`，**最终开发基线 SHA `420d2af326a3f59c1c6015d6b0fe44db23fe0fc6`**。
已核验 PR #15/#16/#18 全部 `closed + merged=true`，开发基线与该 SHA **identical（ahead=0, behind=0）**；`main` 与原 `f330de510f97c552629052ff1841d7223194e7f8` **identical**，没有被修改。原测试、截图、历史验收评论均保留。

### 验收边界 / Scope of confirmed testing
- PR #16 独立 F1–F3/P2 与 F2-R：PASS。
- PR #18 标准模板与 P3-01：24 PASS / 0 FAIL / 3 NOT TESTED，独立测试锁定 `8af8bd11...`；该 SHA 的 UI V2 与 S3/S4 GitHub Actions 均 SUCCESS。
- **此前验收针对各个功能候选 SHA；合并生成了新 SHA `420d2af3...`，尚无该合并 SHA 的新一轮独立整体验收或 GitHub Actions 运行记录。不可将以前的 PASS 冒充为对这个最终合并提交的重新执行。**
- Windows GUI、原生 Excel 打开重算打印、真实采购员 UAT 继续 NOT TESTED；`main` 继续冻结。

### [Codex Cloud TEST-ONLY TASK] 最终合并开发基线整体验收（下一步，可由用户单独启动）
**Codex 仅担任独立测试，不改产品代码/现有测试/CI、不得合并或将开发基线推向 `main`。**
1. 锁定并验证 `draft/20261013-m1-storage-ui-audit@420d2af326a3f59c1c6015d6b0fe44db23fe0fc6`；若 SHA 已变化，报告实际被测 SHA，不复用旧结论。
2. 使用新隔离的 Codex Cloud Linux SQLite 目录、真实 Chromium 浏览器、全部虚构/匿名物料、供应商、报价与图纸。重新运行现有 Python/Node/Playwright 全套自动回归（非仅引用旧 CI），记录命令、通过/失败/跳过。
3. 真实 GUI 执行主线业务走查：新建/保存/切换 RFQ；ERP 字段导入及附加列无损；同编码 M16/M20 与不同 PDF 的身份关联；双向分配/供应商独立发包；R1/R2 报价及来源状态（明确未报价、不供货、缺报）、比价金额/议价范围/沿用历史；系统设置 3 XLSX + 1 CSV 标准模板实际下载、回填上传、校验；异常/取消导入不改变 `revision/lineSeq/createdSeq` 或 SQLite 快照；F5、实际进程重启、S4 全量备份/空目录恢复、内外发隔离。
4. 对 1024×768、1366×768、1600×900 真实 Chromium 截图核对界面。**不进行 Windows Computer Use**、不宣称 Windows 原生 Excel 已验证。
5. 提供逐条 PASS/FAIL/NOT TESTED、准确 SHA、自动测试原始日志、截图、trace、XLSX 表头、数据库/ZIP 恢复证据。大型证据可独立 `test/` 分支及 Draft 证据 PR 保存；只允许新增匿名验收材料。
6. 将独立中文报告（附英文摘要）作为此 PR #15 的新顶层评论交付，明确「最终整合版是否建议进入 Windows 实机人工验证」，有问题只报告，不自行修复。完成后停止等用户批准。

**本评论是验收准备，不代表 Codex 已被启动或最终合并 SHA 已通过新一轮测试。**
