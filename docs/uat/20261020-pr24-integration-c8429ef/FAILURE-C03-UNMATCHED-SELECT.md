# C03 first failure — TEST PRECONDITION / 首失败：测试前置条件

Product: `c8429ef51731da570c7a556d7cdce89e7123e739`. Original independent step: [01-materials-drawings](method/01-materials-drawings.js.txt).

Actual action `selectOption('RFQ-L00003')` on `[data-batch-target="2"]` timed out20s because unmatched file has no candidate RFQ options. Existing per-row focus/global manual-target route was not used. This is a mistaken independent-test operation prerequisite, not a confirmed product defect. Environment showed no outage. No product severity P1/P2/P3 assigned.

[Original failure PNG](evidence/FAIL-first-observed.png) clearly shows the unmatched placeholder and existing manual controls. [Original trace](evidence/independent-browser-trace.zip), [selection excerpts](evidence/FAIL-trace-selection-excerpts.json), [source excerpt](evidence/FAIL-readonly-source.txt), [raw stop](evidence/failure-stop.json), [classification](evidence/FAIL-classification.json).

正确但本轮未操作的路径：未匹配文件“指定此文件”→全局“手工指定到”选择目标RFQ行→“指定给选中文件”→核对并确认关联。只读源码和入口存在不是功能验收PASS。

Correct unexecuted path: focus unmatched file, choose global manual RFQ target, assign to selected file, inspect and confirm. Do not infer success from source.

No browser retry, script fix/reexecution or later supplier/quote/restore/UI tests followed. Staged multiple-candidate selection was not committed. SQLite current/PDF and captured memory equal saved pre-preview state. Further work requires a separate next run; raw failure remains unchanged.
