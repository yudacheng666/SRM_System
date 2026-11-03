# fbb9894 TEST-ONLY append to existing DraftPR50

Product `fbb98944a4bcee439e4e81ebfe3ef710bee4a3d0`. **NOT READY:Python44PASS,Node10PASS,Chromium57PASS/1FAIL;Windows3NOTTESTED.**

- [中文报告](REPORT.zh-CN.md) / [English report](REPORT.en.md)
- [逐项结果](RESULTS.md) / [CSV](results.csv) / [112 original automation cases](automation-cases.csv)
- [Current original five cases,4PASS/1FAIL](focus-original-five) / [focus summary](focus-five-results.json)
- [One raw automated failure](automation/failures/FAIL-01) / [classification](automation/failure-classification.json)
- [Actual commands/exits](COMMANDS.md)
- [First-click full rAF diagnostics](independent/evidence/assign-search-first-frames.jsonl) / [NOT REPRODUCED summary](independent/evidence/assign-search-diagnostic-summary.json)
- [18page screenshots,83tooltips,first attempt,backup class evidence](independent/evidence)
- [Original current-SHA real downloads](independent/downloads)
- [Corrected original-file verification,persistence and retained second error](continuation/evidence)
- [Completed save/conflict/outage/STOREDtamper/fullrestore/nonempty/supplier checks](completion/evidence) / [actual final downloads](completion/downloads)
- [All raw harness failures/corrections](raw-error-register.json) / [bootstrap logs](bootstrap-stdin-closed/evidence)
- [HTTP/source identity](http-trace-identity.json) / [preservation](preservation.json) / [checksums](SHA256SUMS.txt)
- [Standalone original independent methods](methods), [verifier correction methods](methods-continuation), [completion methods](methods-completion), [fresh fictional fixture recipe/inputs](fixtures)

## Reassemble the complete original automated report

All461original files in test-results/playwright-report are retained byte-for-byte,including58traces,screenshots,logs and downloads.Deduplication uses internal tar hardlinks only;every original fileSHA256 was revalidated after extraction.

```bash
mkdir extracted
cat automation/raw-parts/all-original.tar.gz.part* | tar -xz -C extracted -f -
python -m http.server 8099 --directory extracted/playwright-report
```

Use the local Playwright trace viewer for extracted `test-results/*/trace.zip` or direct focused/independent traceZIPs.Existing negative inputs are intentionally malformed;output ZIP CRC checks are documented separately in automation/trace-integrity.json.Full original hashes and archive parts are in automation/original-file-manifest.json and automation/archive.json.

All3executed independent phases have valid retained traces;the0-action stdinclosed bootstrap could not export a completed trace and is explicitlyNOTAVAILABLE.No successes-only filtering,no historical PASS transfer,no product/originaltests/CI/main/memory changes,noActions,no merge/closure.
