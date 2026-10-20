# OBS-01逐次结果 / Per-attempt results

UTC时间；北京时间=UTC+08:00。FAIL均为20秒异常等待；EXPECTED_BLOCK为1秒的已禁用负向控制。
No rows omitted. Exact flags are only available when the CDP entry logpoint was enabled.

| ID | 开始UTC | 场景 / Mode | 结果 | 点击前disabled | 可信click | 入口dirty/busy | 备份请求 / HTTP | 下载 | 证据 |
|---|---|---|---|---|---:|---|---|---|---|
| D01 | 2026-10-20T02:34:48.207Z | RFQ-return-1500ms-admin-immediate | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/D01.zip) | [screen](evidence/D01-after.png) |
| D02 | 2026-10-20T02:35:31.963Z | natural-RFQ-return-1500ms-admin-immediate | FAIL | False | 1 | True/False | 0 / none | none | [screen](evidence/D02-after.png) |
| D03 | 2026-10-20T02:35:54.803Z | natural-RFQ-return-1500ms-admin-immediate | FAIL | False | 1 | True/False | 0 / none | none | [screen](evidence/D03-after.png) |
| D04 | 2026-10-20T02:36:18.130Z | natural-RFQ-return-1500ms-admin-immediate | FAIL | False | 1 | True/False | 0 / none | none | [screen](evidence/D04-after.png) |
| D05 | 2026-10-20T02:36:41.038Z | natural-RFQ-return-1500ms-admin-immediate | FAIL | False | 1 | True/False | 0 / none | none | [screen](evidence/D05-after.png) |
| D06 | 2026-10-20T02:37:03.947Z | natural-RFQ-return-1500ms-admin-immediate | FAIL | False | 1 | True/False | 0 / none | none | [screen](evidence/D06-after.png) |
| D07 | 2026-10-20T02:37:26.857Z | natural-RFQ-return-1500ms-admin-immediate | FAIL | False | 1 | True/False | 0 / none | none | [screen](evidence/D07-after.png) |
| D08 | 2026-10-20T02:37:49.724Z | natural-RFQ-return-1500ms-admin-immediate | FAIL | False | 1 | True/False | 0 / none | none | [screen](evidence/D08-after.png) |
| D09 | 2026-10-20T02:38:12.761Z | natural-RFQ-return-1500ms-admin-immediate | FAIL | False | 1 | True/False | 0 / none | none | [screen](evidence/D09-after.png) |
| D10 | 2026-10-20T02:38:35.591Z | natural-RFQ-return-1500ms-admin-immediate | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/D10.zip) | [screen](evidence/D10-after.png) |
| D11 | 2026-10-20T02:38:39.566Z | same-RFQ-return-admin-wait1000ms | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/D11.zip) | [screen](evidence/D11-after.png) |
| D12 | 2026-10-20T02:38:43.653Z | same-RFQ-return-admin-wait1000ms | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/D12.zip) | [screen](evidence/D12-after.png) |
| D13 | 2026-10-20T02:38:48.320Z | same-RFQ-return-admin-wait1000ms | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/D13.zip) | [screen](evidence/D13-after.png) |
| D14 | 2026-10-20T02:38:52.375Z | same-RFQ-return-admin-wait1000ms | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/D14.zip) | [screen](evidence/D14-after.png) |
| D15 | 2026-10-20T02:38:55.321Z | natural-return-admin-immediate-no-CDP-logpoint | FAIL | False | 1 | NOT OBSERVED | 0 / none | none | [screen](evidence/D15-after.png) |
| D16 | 2026-10-20T02:39:18.047Z | natural-return-admin-immediate-no-CDP-logpoint | FAIL | False | 1 | NOT OBSERVED | 0 / none | none | [screen](evidence/D16-after.png) |
| D17 | 2026-10-20T02:39:41.756Z | natural-return-admin-immediate-no-CDP-logpoint | FAIL | False | 1 | NOT OBSERVED | 0 / none | none | [screen](evidence/D17-after.png) |
| D18 | 2026-10-20T02:40:04.998Z | natural-return-admin-immediate-no-CDP-logpoint | FAIL | False | 1 | NOT OBSERVED | 0 / none | none | [screen](evidence/D18-after.png) |
| S01 | 2026-10-20T02:40:32.308Z | controlled-3000ms-auto-save-in-flight-disabled-click | PASS_EXPECTED_BLOCK | True | 0 | NOT OBSERVED | 0 / none | none | [screen](evidence/S01-after.png) |
| S02 | 2026-10-20T02:40:33.850Z | same-state-after-delayed-autosave-completes | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/S02.zip) | [screen](evidence/S02-after.png) |
| S03 | 2026-10-20T02:42:18.453Z | natural-autosave-just-completed-admin-immediate | FAIL | False | 1 | True/False | 0 / none | none | [screen](evidence/S03-after.png) |
| S04 | 2026-10-20T02:42:39.855Z | retry-after-one-poll-no-business-change | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/S04.zip) | [screen](evidence/S04-after.png) |
| C01 | 2026-10-20T02:42:43.651Z | same-RFQ-return-open-native-details-no-header-admin | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/C01.zip) | [screen](evidence/C01-after.png) |
| C02 | 2026-10-20T02:42:46.793Z | same-RFQ-return-open-native-details-no-header-admin | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/C02.zip) | [screen](evidence/C02-after.png) |
| R01 | 2026-10-20T02:42:49.703Z | header-immediate-trace-reproduction | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/R01.zip) | [screen](evidence/R01-after.png) |
| R02 | 2026-10-20T02:42:53.856Z | same-header-path-wait1000ms-trace-control | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/R02.zip) | [screen](evidence/R02-after.png) |
| S05 | 2026-10-20T02:43:01.580Z | controlled-auto-save-in-flight-repeat | PASS_EXPECTED_BLOCK | True | 0 | NOT OBSERVED | 0 / none | none | [screen](evidence/S05-after.png) |
| S06 | 2026-10-20T02:43:04.299Z | after-delayed-autosave-complete-cleanup-awaited | PASS | False | 1 | False/False | 2 / 201/200 | [ZIP](downloads/S06.zip) | [screen](evidence/S06-after.png) |

完整前/后状态、请求总耗时和原始下载事件见 [JSON](evidence/attempts-enriched.json)。截图不替代事件证据。
