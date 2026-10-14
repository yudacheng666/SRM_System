# Windows CI 路径断言修复
# Windows CI path-assertion correction

首次 Windows job 115706784636 的 test_verified_backup 失败：Windows 临时路径使用 RUNNER~1，API 返回 runneradmin 对应的规范路径，两者是同一目标文件。
Initial Windows job 115706784636 failed test_verified_backup: the temporary path uses RUNNER~1 while the API returns the corresponding canonical runneradmin path; both identify the same target file.

store.backup 在调用前即把目标 Path.resolve()，因此测试改为与 target.resolve() 比较；仍检查备份 SQLite 的真实询价修订与再次写入拒绝，未跳过任何断言。
store.backup resolves the destination before writing, so the test compares against target.resolve(); it still checks the backed-up SQLite RFQ revision and rejects repeat writes. No assertions are skipped.

失败 job：https://github.com/yudacheng666/SRM_System/actions/runs/38519844286/job/115706784636
Failed job: https://github.com/yudacheng666/SRM_System/actions/runs/38519844286/job/115706784636

Linux 定向 store 回归 6/6 通过；修复后的 Windows 结果由最新 PR CI 链接记录。
The targeted Linux store suite passes 6/6; corrected Windows results are recorded by the latest PR CI links.
