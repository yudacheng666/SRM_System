# C06 first failure — TEST PRECONDITION / 面板状态前置错误

Product`c8429ef51731da570c7a556d7cdce89e7123e739`.

Supplier-generation path opens`pilotReportPanel`; A/B/batch/CSV downloads succeed. Report panel remains open after navigation. Failed independent [C06driver](method/05-C06-exports.js.txt) unconditionally clicks`pilotReportOpen` before selecting comparison. Toggle handler sets an already showing panel to display:none. Hidden select then times out20s. No product severity assigned; no environmental outage evidenced.

[Original screenshot](evidence/FAIL-first-observed.png) · [original trace](evidence/independent-browser-trace.zip) · [panel block→none trace excerpts](evidence/FAIL-report-panel-trace-excerpts.json) · [read-only toggle source](evidence/FAIL-readonly-source.txt) · [raw stop](evidence/failure-stop.json) · [classification](evidence/FAIL-classification.json).

首次超时立即停止，未修正失败驱动、未重试、未进入C07–C09。下一轮应读取可见状态，面板已打开就直接选择；本轮未执行。已保存业务/PDF在C06前后相同。

First timeout stops all expansion. No failed-driver correction/retry, no C07–C09. A reviewed future run should inspect visibility before toggling; route not executed here. Existing downloads are archived, full business-content validator never ran; comparison/business workbook absent.
