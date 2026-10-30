# Static preparation evidence — not a Windows UAT runner

**PLAN BLOCKED: NEEDS REVIEW.** Read [中文](REPORT.zh-CN.md) / [English](REPORT.en.md).

This is not a ready Windows buyer runner. Nine complete-scope candidate documents contain219steps. Whole-plan audit reuses the unchanged V1 schema for108native inputs but rejects execution because111control/oracle steps lack implementations.

No live entry point was added. requireReady always rejects these candidates before any injected launch/connect/HTTP/write callback. JSON status edits cannot override the gate. Do not remove steps, drop postconditions, relabel them as checkpoints or use contract-test as buyer execution.

Reproduce only static/mock checks, setting SRM_PRODUCT_ROOT to a detached2aaa478source and SRM_FROZEN_SOURCE to its prototype/m1-lite/index.html:

~~~text
node --test --test-isolation=none --test-reporter=tap toolchain-v1/schema.test.cjs toolchain-v1/runtime.test.cjs toolchain-v1/adapter.test.cjs
node --test --test-isolation=none --test-reporter=tap buyer-plan.test.cjs
node fixture-audit.cjs
node buyer-preflight.cjs <fixed-product-root> new-report.json
~~~

Last command intentionally exits2/BLOCKED. No npm install, original business suite, service or browser command is needed. Use a new copy to preserve published logs. The generator writes only its own evidence directory. Fourteen V1 code/policy/corpus files are unchanged; mock logs are newly generated here. Historical V1 is read-only.

- summary/results: distinguish tool PASS, plan BLOCKED and business NOT TESTED.
- preflight/needs-review/capabilities: exact unimplemented execution gaps.
- source-to-action: all219source/UI/dialog/data contracts.
- source-review: pure frozen-source fixture evaluation.
- fixtures: fictional input bytes, not business outputs.
- logs/raw-error-register/commands: all success, negative, blocked and preparation-error records.
- source-verification/v1-provenance/SHA256SUMS: integrity.

No screenshots or browser traces are expected: no real browser/CDP/service/business HTTP was started. Mock JSONL is not a Windows trace.
