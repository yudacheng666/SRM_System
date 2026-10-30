# TEST-ONLY dialog preflight V1

This directory implements PR50 task [6518106279](https://github.com/yudacheng666/SRM_System/pull/50#issuecomment-6518106279). It is a static test-system change, **not a Windows buyer acceptance run**. No package installation, npm, product edits, original-suite execution or CI edits are needed.

Frozen product/original-test SHA: `2aaa478c8f1966e41b9372d9d989c383dbaa1972`. The referenced file is [prototype/m1-lite/index.html](https://github.com/yudacheng666/SRM_System/blob/2aaa478c8f1966e41b9372d9d989c383dbaa1972/prototype/m1-lite/index.html); required raw SHA256 is `bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3`.

## Entry points and guarantees

- `schema.cjs`: strict closed action schema plus semantic policy compiler. Unknown fields/types/selectors/operations/scenarios are rejected. No default dialog policy. Every input/click explicitly declares `dialog: none | expected`. There is no arbitrary JavaScript/expression step, selector wildcard, executable condition or fallback to the legacy driver.
- `dialog-policy.json`: versioned SHA-bound registry of 28 operations (27 reviewed, 1 needs review), exact selectors, source functions/line ranges/anchors, trigger scenarios, allowed dialog types/messages/decisions and persistence postconditions. `build-policy.cjs` deterministically generates this registry and its fictional contract fixtures.
- `preflight.cjs`: **static-only CLI**. Reads source/policy/action files; validates the entire manifest and frozen source hash; writes a machine-readable report and exits0 for PASS or2 for rejection. Does not import a browser adapter, start processes, connect to CDP or issue business HTTP requests. JSON parsing/I/O errors are also reported.
- `guarded-driver.cjs`: the execution gate validates **all files before invoking its injected launch callback**. It freezes the compiled snapshot. Contract-test documents are never executable buyer plans. It subscribes to the bound session before Page.enable and before input. Expected dialogs are processed only after exact type/message/default matching, using that same session. It waits for all closed events, ACK responses and original input completion. Unknown/mismatched/foreign-session dialogs stop the plan, retain the original event, abort pending transport requests and send **no accept or cancel ACK** for that dialog. No screenshot/ACK retry loop follows a modal failure.
- `cdp-adapter.cjs`: new native Node24 target-bound transport behind `runPreparedPlan`. No top-level connection or browser/service launch. The factory is reached only after the gate succeeds. Only an explicit loopback WebSocket target is accepted. Native mouse/keyboard/file input is used. This round tests the adapter with a fake WebSocket; it was not connected to Edge.

Dynamic messages are expanded from named templates with bounded integer or finite-enum parameters, then matched in full. Supplier identity, all12 lines' displayed scope, hidden-filter warning and count are preserved. A prefix or `includes()` match is insufficient. Prompt steps declare exact default value, accept/cancel and explicit input text (including an explicit empty string); cancel must terminate the remaining edit sequence. There is no generic “accept any dialog”.

The preserved old `act-alert.cjs` remains historical evidence. Its unguarded entry point must not be used for a future continuation. `runPreparedPlan` is the new guarded entry point; it does not silently execute legacy JSON or patch the product.

## Reproduce only these new checks

Use the existing native Node24 executable. From this directory, with the existing isolated frozen source and its verified146-blob manifest:

```powershell
node verify-static.cjs '..\windows-native-ae2779a1\fixed-source\prototype\m1-lite\index.html' '..\windows-win03-alert-8cd91b98\source-before.json'
```

If node.exe is not on PATH, invoke its existing absolute executable path; do not install anything. `verify-static.cjs` runs syntax checks, only the three new `*.test.cjs` files, positive/negative static CLI checks and read-only146-file source verification. All child processes are that same Node executable with `windowsHide:true`.

For only the new unit tests:

```powershell
$env:SRM_FROZEN_SOURCE = (Resolve-Path '..\windows-native-ae2779a1\fixed-source\prototype\m1-lite\index.html').Path
node --test --test-reporter=tap schema.test.cjs runtime.test.cjs adapter.test.cjs
```

`tests-final.stdout.log`, `commands.json`, `preflight-pass.json`, `preflight-reject-assignment.json`, `preflight-reject-json.json` and `static-summary.json` preserve actual results. Runtime and adapter JSONL logs are explicitly **mock** events. Earlier development-run logs remain preserved separately; the final test total is not a sum of runs.

## Deliberate limits

The two positive JSON files contain **38 interaction contract cases**, including mutually exclusive scenarios. They are marked `purpose:contract-test` and cannot run as a buyer plan. They do not include the full procurement flow, fixtures/download/restart/S4/layout assertions or executable business postconditions. Postconditions in the policy are required future acceptance evidence, not results obtained by this round.

The quote partial-import operation remains `needs-review` and is rejected even though its source dialog shape is catalogued. Drawing-upload/version/hash conflict fixtures and further quote-input branches still need review. All unregistered selectors (including other supplier bulk variants) are rejected. Legacy wait/expression/reload/navigate/REST-verification step types are intentionally not admitted by this first schema; add reviewed, declarative operations before proposing a complete future plan. No arbitrary expression escape hatch is provided.

Before any separately authorized real Windows continuation, finalize a complete buyer action plan, required conditional fixtures and state/evidence assertions; require its entire static preflight to pass. This round authorizes no real continuation. Prior WIN03 remains BLOCKED/NOT READY; earlier material/supplier PASS evidence is not repeated or reclassified.
