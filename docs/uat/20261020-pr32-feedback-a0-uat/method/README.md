# Independent method / 独立方法

All drivers are newly authored or adapted independent UI methods, archived as review-only TXT. No existing product test was changed. Authoritative executed code is the `step`/`command` records in browser.jsonl. 02b-tie-observation and09-obs-safety were not run; archived source/fixture presence is not a claim of coverage. The new feedback/fault drivers are separate from product test44 and use actual UI plus read-only state/SQLite validation.

方法修正完整保留：准备脚本忘记展开项目区再点击保存，产生一次driver timeout；主浏览器只读logpoint查找旧保护代码字符串，安装失败一次，07b只恢复观察器，没有重复绑定网络监听。两者均未修改产品。真实冲突首条样本在点击前按钮已disabled、警告未建立，不能判断警告保留；用真实PUT闸门安排双窗口保存顺序后重新验证。原始false和trace均保留，不能宣称所有原始断言无条件通过。

SAVE500/CONFLICT409 fulfill and OFFLINE abort explicitly inject failures into real browser autosave requests, without mutating product state. BUSY holds one real PUT and releases it unchanged. REAL409-BARRIER holds a stale real request, lets another GUI window commit to real SQLite, then releases it to the actual backend409. REAL-SERVICE-DOWN stops only the owned9033 service, observes actual network save failure, restarts the same service/data and saves through UI. No production/user directory was accessed.
