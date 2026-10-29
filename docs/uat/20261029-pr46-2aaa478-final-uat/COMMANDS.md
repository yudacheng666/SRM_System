# Actual commands and exits / 实际命令与退出码

Product `2aaa478c8f1966e41b9372d9d989c383dbaa1972`.Main corrected run in required order:

|Command|CWD|Exit|Evidence|
|---|---|---:|---|
|`npm ci`|/workspace/srm2aaa-product|0|[setup/npm-ci](setup/npm-ci/command.json),startUTC2026-10-29T15:55:47.848573+00:00,duration2.115s|
|`npx --no-install playwright test prototype/m1-lite/tests/e2e/ui-v3-integration.spec.cjs --grep UI V3 integration: theme, active navigation and responsive workspace`|/workspace/srm2aaa-product|0|[focused/ui-v3](focused/ui-v3/command.json),startUTC2026-10-29T15:55:49.966794+00:00,duration23.263s|
|`python -m unittest discover -v -s prototype/m1-lite/backend -p test_*.py`|/workspace/srm2aaa-product|0|[automation/python-backend](automation/python-backend/command.json),startUTC2026-10-29T15:56:13.231123+00:00,duration7.047s|
|`npm test`|/workspace/srm2aaa-product|0|[automation/node-business](automation/node-business/command.json),startUTC2026-10-29T15:56:20.278106+00:00,duration0.912s|
|`npm run test:e2e`|/workspace/srm2aaa-product|0|[automation/chromium-e2e](automation/chromium-e2e/command.json),startUTC2026-10-29T15:56:21.190887+00:00,duration879.548s|

|Additional actual execution|Exit/status|Evidence|
|---|---|---|
|`node /workspace/uat2aaa/methods/run-independent.cjs`|0;single fresh noninteractive run|independent/evidence/command.json|
|Initial same-case selector with `--grep ^UI V3 integration:`|1;0cases;notPASS|initial-selection-no-tests/ui-v3/command.json|
|Premature full suite before selector correction|130(SIGINT);13complete/45skipped;INCOMPLETE,not acceptance|initial-interrupted-suite/chromium-e2e/command.json|
|`python /workspace/uat2aaa/audit-focused-trace.py` / `audit-full-ui-trace.py`|0after read-only auditor scope correction;100body/79post-loop each|focused-assertion-audit.json/full-ui-assertion-audit.json|

Independent actual Python subprocess commands and browser operations appear verbatim in browser.jsonl step-source records;46export,30backup-class,11S4 integrity and13tamper-fixturechecks all exit0.All original suites use supported SRM_CHROMIUM_PATH=/usr/bin/chromium,CI=1,task-local npmcache and isolated SRM_DATA_DIR.No original config edits,nativeWindows commands orActions dispatch.
