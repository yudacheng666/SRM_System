# 20261015 SRM UI V2 B · Chromium 实测验收与首屏优化
# 20261015 SRM UI V2 B · Real Chromium Visual Verification

## 1. 结果摘要 / Result Summary
- **自动浏览器验收：PASS（2/2 Playwright tests；共 8 个页面/分辨率组合）**。
- **Automated browser check: PASS (2/2 tests; 8 stage/viewport combinations).**
- 测试对象：`design/ui-v2/concept-b-v2.1.html`，它是独立视觉原型，没有连接真实 SRM 后端。
- Test target: standalone `design/ui-v2/concept-b-v2.1.html`; no SRM business backend.
- Chromium 环境：GitHub Actions ubuntu-latest，Node 22，npm ci 锁定 @playwright/test 1.58.2。
- Environment: GitHub Actions ubuntu-latest; Node 22; pinned @playwright/test 1.58.2.
- 验收运行：<https://github.com/yudacheng666/SRM_System/actions/runs/38701335818>。
- Verified workflow run: <https://github.com/yudacheng666/SRM_System/actions/runs/38701335818>.
- 截图与 JSON 坐标下载：Actions → 此运行 → Artifacts → `srm-ui-v2-b-chromium-visual-evidence`，保留 30 天。
- Screenshots and metric JSON: Actions → run → Artifacts → `srm-ui-v2-b-chromium-visual-evidence`; retention 30 days.
- 隔离 Draft PR：<https://github.com/yudacheng666/SRM_System/pull/6>，目标仅为设计分支，未合并。
- Isolated Draft PR #6 targets only the design branch; not merged.

## 2. 阶段与分辨率验证 / Stage × Viewport Evidence
表格起点及首行底部以浏览器视口上沿计算，单位 px。
Positions in CSS pixels relative to viewport top.

| 浏览器视口 / Viewport | 业务页面 / Stage | 表格 top | 第一行 bottom | 页面横向溢出 / Page overflow | 可见主 CTA 数 / Visible primary CTA |
|---|---|---:|---:|---|---:|
| 1366×768 | 物料与图纸 / Items | 469.7 | 559.7 | 无 / No | 1 |
| 1366×768 | 供应商与分配 / Allocation | 586.7 | 675.0 | 无 / No | 1 |
| 1366×768 | 报价回收 / Quote intake | 586.7 | 675.0 | 无 / No | 1 |
| 1366×768 | 比价议价 / Comparison | 586.7 | 675.0 | 无 / No | 1 |
| 1600×900 | 物料与图纸 / Items | 532.4 | 622.4 | 无 / No | 1 |
| 1600×900 | 供应商与分配 / Allocation | 705.4 | 793.7 | 无 / No | 1 |
| 1600×900 | 报价回收 / Quote intake | 705.4 | 793.7 | 无 / No | 1 |
| 1600×900 | 比价议价 / Comparison | 705.4 | 793.7 | 无 / No | 1 |

- 每个页面首条模拟数据行在初始视口中完整可见（未滚动）。
- First synthetic table row is fully visible without scrolling for every stage and size.
- 页面总宽度与视口一致，不发生整页横向溢出；宽表保留表格内部滚动。
- No whole-page horizontal overflow; broad tables remain internally scrollable.
- 四步导航可切换，物料搜索可筛选为 1 条，选择后批量操作区域可见，未捕获未处理 JS 异常。
- Four tabs switch; item search filters to one row; selection context appears; no uncaught JS exceptions.

## 3. 相对 B 深化初稿的改进 / Changes from Initial B Refinement
- 第一轮测试通过，但 1366×768 的供应商/报价/比价表格从 y≈705 才开始。
- The first run passed but allocation/quote/compare tables began around y≈705 at 1366×768.
- v2.1 将这三页的表格提前至 y≈587，改善首屏可用数据量；单页面统一只保留一个主 CTA。
- V2.1 brings the data table up to y≈587 and enforces one visually primary action per stage.
- 改动仅存在于 `concept-b-v2.1.html` 副本中；用户已确认的 `concept-b-refined.html` 保持不变。
- These adjustments live in a separate standalone file; the originally approved concept remains unchanged.

## 4. 截图视觉抽检与限制 / Screenshot Review and Limitations
- 已人工检查 1366 与 1600 两组各四页截图总览及部分原始单页；未发现明显遮挡或截断。浏览器验收与最终业务 UI 仍须分别验收。
- Reviewed both four-screen contact sheets and selected full-resolution screenshots, with no obvious clipping/occlusion; the actual SRM application still needs separate acceptance.
- 未测试真实 Windows Edge/Chrome 字体渲染、浏览器缩放、辅助技术完整审计、正式 M1-Lite 交互。
- Native Windows fonts, zoom, full accessibility audit, and integrated M1-Lite workflows were not tested.
- 测试的“已保存”文字是视觉模拟，不是后端状态；原型未触碰 SQLite、备份、PDF 字节或报价数据。
- The concept's save label is mock text; no SQLite, backup, PDF bytes or actual quote data were accessed.

## 5. 下一步 / Next Gates
1. 以 `draft/20261013-m1-storage-ui-audit` 最新开发分支为真实代码基线，参考 `prep/20261015-ui-v2-integration` 的映射文档开始新 UI 功能分支。
1. Start from the latest development base, not the design branch; consult the isolated integration-readiness documents.
2. 先做外壳和物料列表，再逐步接入供应商、报价、比价；保留所有现有 DOM ID、业务计算和持久化规则。
2. Integrate shell/items first, then suppliers/quotes/comparison, keeping DOM and all business invariants.
3. 真正代码集成后，重跑 Python/Node/Playwright 业务回归和截图，未经用户批准不合并。
3. After integration, rerun application regressions and screenshots; merge only with explicit approval.
