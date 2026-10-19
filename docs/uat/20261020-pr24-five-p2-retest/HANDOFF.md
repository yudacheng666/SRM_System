## PR #26 五项 P2 视觉问题：产品修复已提交 / Five visual P2 remediations landed (2026-10-19)

**当前产品开发候选 HEAD：`7730f5ac4c2ffd4b38fe15e6973406b1dd1b6090`**（`feat/20261019-srm-ui-v3-integration`，PR #24 仍 Draft）。针对 [Codex 独立复验 PR #26](https://github.com/yudacheng666/SRM_System/pull/26) 的视觉 **5×P2 FAIL**（既有业务 23 PASS、原 P3 PASS），由 ChatGPT 在正式 `prototype/m1-lite/index.html` 中完成定向修复：

1. **P2-V01 物料页标题隐藏：** 修正正式买方模式中的旧 CSS 优先级冲突，强制显示真实 V3 标题。
2. **P2-V02 关闭管理抽屉留白：** 所有 closed `details` 按 summary 实际高度收缩，防止被相邻展开的抽屉拉伸。
3. **P2-V03 分配主视角：** 1024/1366/1600 的物料主工作区保持更宽双栏，供应商视角以紧凑名单+较宽物料表显示；增加真实询价数量、全部关联供应商、已关联状态；保留原双向追加与历史保护逻辑。
4. **P2-V04 同轮版本差异：** 使用真实 `quoteRounds` 选取同轮上一**已确认**版本，给出 V1→V2 明细对比及上版价格列；不会修改或覆盖历史、保存格式。
5. **P2-V05 比价决策层级：** 页面顶部增加基于真实报价与 `manualAwards` 的决策概览，明确**系统最低价建议不等于采购员人工定标**；表格标识来源，金额分析注明自动建议口径。

已扩展现有 Chromium 真实工作区结构性测试，并在 [视觉一致性清单](https://github.com/yudacheng666/SRM_System/blob/7730f5ac4c2ffd4b38fe15e6973406b1dd1b6090/docs/ui/20261019-v31-integration-parity.md) 记录每项复验条件。所有 HTML inline JS 已作语法解析；**这不等于浏览器/独立业务验收通过**。

### 新 HEAD 正在进行的阻断性回归
- [UI Unified #39277314549](https://github.com/yudacheng666/SRM_System/actions/runs/39277314549)
- [S3/S4 Regression #39277314445](https://github.com/yudacheng666/SRM_System/actions/runs/39277314445)

发布本说明时，两套回归仍处于 **queued**。若失败，先由 ChatGPT 修复最新准确 HEAD；只有两套全部 SUCCESS 才能启动 Codex Cloud TEST-ONLY。

### Codex Cloud 下一轮独立复验验收要求 / Acceptance after CI
- Checkout **最新通过两套 CI 的 PR #24 HEAD**；在真实 M1-Lite + 独立 SQLite + Chromium 中逐项复验 P2-V01…V05，**逐项给 PASS / FAIL / NOT TESTED，不得用标题存在/测试脚本通过代替实际可视结果**。
- PR #23 V3.1 为设计参考；1024×768、1366×768、1600×900 逐页保留配对截图。注意 M1-Lite 的 Excel/PDF/SQLite/S4 真正业务比概念原型复杂，不能以删除功能换取视觉一致。
- **同轮 V1→V2**：实际导入 V1=10、修订 V2=9，核验同轮前版 ¥10、当前 ¥9、单价变化 -1/−10% 且 V1 不变。
- **自动/人工决定**：仅确认供应商报价时，应显示系统建议、人工确认数 0；明确人工选择 B 后更新标签/数量，非最低价原因必填、金额结果和确认历史保持正确；并列最低提示不得冒充人工定标。
- 继续执行采购全流程主要业务、PDF/图纸、导出、保存、重启和 S4 恢复安全回归；原 P3-01 持续复验。
- **TEST-ONLY**：不能修改产品代码、原测试/CI、开发分支或 `main`；匿名截图/报告写入独立测试分支 + Draft 证据 PR，并将视觉与业务两条独立结论回评 PR #24。不得合并。

**本批仍未取得视觉 PASS**，PR #24 保持 Draft；`main` 不变。

## 7730f5ac CI 已结束：42 项中 1 项新增布局断言失败，现已修正 / Developer CI triage

**上一轮产品候选 `7730f5ac4c2ffd4b38fe15e6973406b1dd1b6090` 两套 Actions 最终 FAIL**，因此 Codex 未启动独立验收是正确的。

- [UI Unified #39277314549](https://github.com/yudacheng666/SRM_System/actions/runs/39277314549)：Windows PASS；Linux Chromium **41 PASS / 1 FAIL**。
- [S3/S4 #39277314445](https://github.com/yudacheng666/SRM_System/actions/runs/39277314445)：Windows SQLite/S4 PASS；Linux Chromium **41 PASS / 1 FAIL**。
- 两套日志都指向新增 `ui-v3-integration.spec.cjs` 的 P2 买方布局测试，断言 `#itemFirstView` 应可见，但测试没有先显式选择“按物料”视角。正式程序保留当前“按物料/按供应商”业务视角，不能依赖默认值。此失败未证明其余 P2 业务异常；测试剩余断言也尚未执行，**五项 P2 仍 NOT TESTED**。
- 仓库 Actions artifact 配额仍满；文件上传失败与真实 Chromium 断言失败分开记录。

**已修复新增测试的前置操作**：进入真实供应商分配页后，点击 `#assign .modebtn[data-mode="itemFirst"]` 才验证物料双栏；然后明确切到 `supplierFirst` 再验证供应商视角。只修改这条验证脚本，未更改产品、持久化、业务分配规则、CI workflow 或 main。

**最新待测开发 HEAD**：`10d35fa6b4935f9376cb50afc298925362612698`；新 CI：
- [UI Unified #39280241912](https://github.com/yudacheng666/SRM_System/actions/runs/39280241912)
- [S3/S4 #39280242140](https://github.com/yudacheng666/SRM_System/actions/runs/39280242140)

**门槛**：上面两套新 HEAD CI 均 SUCCESS 后，Codex Cloud TEST-ONLY 才对照 [PR #26 的五项 P2](https://github.com/yudacheng666/SRM_System/pull/26) 做真实 GUI/视觉独立复验；分别回报 P2-V01…V05 与业务回归、原 P3-01。不得先启动/先判 PASS；报告独立证据分支+Draft PR并回评 PR #24。PR #24 仍 Draft、不合并。

## 最新 CI 门槛已满足 / Codex TEST-ONLY re-review may start

核实准确产品 HEAD：`10d35fa6b4935f9376cb50afc298925362612698`；两套阻断性 GitHub Actions 已全部 **completed / success**：
- [UI Unified #39280241912](https://github.com/yudacheng666/SRM_System/actions/runs/39280241912)
- [S3/S4 #39280242140](https://github.com/yudacheng666/SRM_System/actions/runs/39280242140)

现在允许 Codex Cloud 对这一准确 SHA 开始 **TEST-ONLY** 独立验收。以[五项 P2 的交接要求](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6270799638)和[视觉一致性清单](https://github.com/yudacheng666/SRM_System/blob/10d35fa6b4935f9376cb50afc298925362612698/docs/ui/20261019-v31-integration-parity.md)为准：逐项复验 P2-V01 至 V05、同轮 V1=10→V2=9 的真实差异、自动建议与手工决定语义、P3 锁定态，及主要采购流程与数据安全。使用真实 M1-Lite + 隔离 SQLite + Chromium，对照 PR #23 在 1024×768、1366×768、1600×900 实拍截图；视觉与业务分别判定。证据写入独立 test 分支和 Draft 证据 PR，结论回评 PR #24。禁止改产品/测试/CI/开发分支/main，禁止合并。

**提醒 / Note:** 当前只确认 CI PASS；五项 P2 的独立视觉验收仍未完成，不得宣布整体视觉 PASS。PR #24 仍 Draft。