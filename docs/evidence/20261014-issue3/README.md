# SRM 虚构验收证据索引（轻量版本）
# SRM Synthetic Acceptance Evidence Index (Lightweight)

## 结果 / Results

- 首次云端全量 Playwright 8/8、Python 38/38、Node 2/2 通过；随后补充断言的定向 Playwright 2/2 通过。最新代码修复仍需新的 CI 验证。
- Initial cloud runs passed Playwright 8/8, Python 38/38 and Node 2/2; targeted browser reruns passed 2/2. New code fixes still require a fresh CI run.
- 轻量结果保留在 `summary.json`，历史证据 SHA-256 列表保留在 `SHA256SUMS`。
- Lightweight results remain in `summary.json`; `SHA256SUMS` records hashes of the original evidence set.

## CI 测试产物 / CI Artifacts

- 初次成功的 GitHub Actions 运行： https://github.com/yudacheng666/SRM_System/actions/runs/38520182940
- Initial successful GitHub Actions run: https://github.com/yudacheng666/SRM_System/actions/runs/38520182940
- 产物名称：`srm-playwright-evidence`（包含 Playwright Trace、截图、日志、浏览器下载等）。
- Artifact: `srm-playwright-evidence` (Playwright traces, screenshots, logs and browser downloads).
- GitHub Actions Artifacts 保存期限：**14 天**，到期需重新执行测试生成新证据；历史提交仍可追溯。
- GitHub Actions artifact retention: **14 days**; rerun tests to generate new evidence after expiration. Old commits remain traceable.
- 最新 PR 自动化任务的产物以当次 CI 运行页面为准；不是每次运行都会保留相同的原始文件名。
- For new PR runs, open the corresponding CI run page; exact generated filenames may vary.

## 历史记录 / Historical Evidence

- 原始完整证据在早期测试提交 `08ddba9cea200fe2b1bcbd6cce202f24db68d0d2` 中留有历史记录。为减少当前分支体积，从分支最新快照移除已由 Actions 收集的二进制/运行日志。
- The initial evidence remains traceable at historical commit `08ddba9cea200fe2b1bcbd6cce202f24db68d0d2`; redundant binaries/logs have been removed from the branch's latest snapshot in favor of CI artifacts.
- 本操作不会改写 Git 提交历史，因此不会声称能消除已有历史 Git 对象的大小；未来测试产物不再提交到仓库。
- This does **not rewrite Git history** and therefore does not erase historical Git object sizes; future runtime evidence must stay out of committed source.
- 全部测试样本使用虚构数据；不得提交任何真实公司、供应商、物料、订单或报价。
- All fixtures are synthetic; never commit real company, supplier, material, order or quote details.

## 调试 / Debugging

```sh
npm ci
npx playwright install --with-deps chromium
npm run test:e2e
npx playwright show-report
```

- 失败 Trace 和浏览器截图从测试目录 `test-results/` 或对应 GitHub Actions Artifacts 查看。
- Find failure traces and browser screenshots in `test-results/` or in the run-specific GitHub Actions artifact.
