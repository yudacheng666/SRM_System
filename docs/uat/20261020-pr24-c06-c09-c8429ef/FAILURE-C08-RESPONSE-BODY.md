# C08 first failure — independent response-body observer

Exact product`c8429ef51731da570c7a556d7cdce89e7123e739`.

Real restore POST HTTP200 passes. Next `restoreResponse.json()` throws CDP`Network.getResponseBody: No resource with given identifier found` while product auto-reloads. Source success handler calls location.reload; actual server log showsPOST200→GET/. Trace has status200 but body unavailable. Classification TEST PRECONDITION / response-resource lifetime through navigation; exact Chrome mechanism unproven. No confirmed product P1/P2/P3 or backend restore failure. No unobserved verified/restored flags inferred.

[Raw stop](evidence/failure-stop.json) · [original driver](method/08-C08-backup-restore.js.txt) · [trace](evidence/independent-browser-trace.zip) · [network/protocol excerpts](evidence/FAIL-response-json-trace-excerpts.json) · [classification](evidence/FAIL-classification.json) · [source](evidence/FAIL-readonly-reload-source.txt).

首失败后没有修改脚本重试，没有浏览器继续或非空恢复/C09。事后只读恢复数据与备份源完全相同，是分类证据而非原断言已通过。失败PNG是主工作区，非恢复页。trace也无法恢复原响应体，未知字段保持未知。

No retry, script correction/continuation or nonempty/C09 after first failure. Readonly post-stop restored data equals source, classification fact only. Failure PNG is main workspace, not restore page. Missing original response body remains unknown. Future reviewed run can verify status + actual DB/reloaded UI without relying on a body retained after navigation.
