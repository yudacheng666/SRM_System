# Actual commands and exits / 实际命令与退出码

Product `fbb98944a4bcee439e4e81ebfe3ef710bee4a3d0`;no officialActions.Original tests/config unchanged.

|Command / phase|Exit/status|Evidence|
|---|---|---|
|`python -m unittest discover -v -s prototype/m1-lite/backend -p test_*.py`|0|[command.json](automation/python-backend/command.json),startUTC2026-10-29T14:54:41.786106+00:00,duration7.106s|
|`npm ci`|0|[command.json](automation/npm-ci/command.json),startUTC2026-10-29T14:54:48.892964+00:00,duration1.418s|
|`npm test`|0|[command.json](automation/node-business/command.json),startUTC2026-10-29T14:54:50.311236+00:00,duration0.505s|
|`npm run test:e2e`|1|[command.json](automation/chromium-e2e/command.json),startUTC2026-10-29T14:54:50.816722+00:00,duration935.109s|

Original commands run from `/workspace/srmfbb-product` with `SRM_CHROMIUM_PATH=/usr/bin/chromium`, `CI=1`,task-local npmcache and fresh SRM_DATA_DIR.Original Playwright config:workers1,retries0.

|Independent command|Exit/status|Evidence|
|---|---|---|
|`node /workspace/uatfbb/methods/driver.cjs` nonTTY bootstrap|BLOCKED stdinclosed;own processes stopped bySIGTERM,numeric exit not captured;0businessactions|bootstrap-launch-error.json|
|`node /workspace/uatfbb/methods/driver.cjs` TTY|Node later exits0 after catching verifier failure;NOT a testPASS|independent/evidence/raw-first-error.json|
|`python /workspace/uatfbb/methods/verify-exports.py /workspace/uatfbb/independent/evidence/`|1,FileNotFoundError|independent/evidence/export-validation.stderr|
|`python /workspace/uatfbb/methods-continuation/verify-exports.py /workspace/uatfbb/continuation/evidence/`|0,46checksPASS on original current downloads|continuation/evidence/export-validation.log|
|`node /workspace/uatfbb/methods-continuation/driver.cjs`|Node later exits0 after caught ReferenceError;NOT a testPASS|continuation/evidence/raw-first-error.json|
|`node /workspace/uatfbb/methods-completion/driver.cjs`|0,remaining checks complete with no caught error|completion/evidence/browser.jsonl|
|`python /workspace/uatfbb/methods-completion/verify-s4.py /workspace/uatfbb/completion/evidence/ /workspace/uatfbb/completion/downloads/current-S4-full.zip`|0,11checksPASS|completion/evidence/S4-integrity.stdout.log|
|`python /workspace/uatfbb/methods-completion/build-stored-tamper.py /workspace/uatfbb/completion/downloads/current-S4-full.zip /workspace/uatfbb/completion/downloads/tampered-STORED-S4.zip /workspace/uatfbb/completion/evidence/S4-tamper-preflight.json`|0,13preflightchecksPASS|completion/evidence/S4-tamper-preflight.json|

Absolute paths and exact inputs are retained in step/command records inside each browser.jsonl.These are actual executions,not instructions to modify the product.Windowscommands were NOTRUN.
