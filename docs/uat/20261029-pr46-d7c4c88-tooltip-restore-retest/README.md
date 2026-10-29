# d7c4c88 TEST-ONLY evidence append

Product: `d7c4c88abd354ebdc5d3bfedfc9199e278c48483` · PR46 · Existing Draft evidence PR50.

**NOT READY: Python44PASS, Node10PASS, Chromium53PASS/5FAIL; Windows3NOT TESTED.** Scoped independent safety/tooltip checks pass; raw first-attempt timeout remains ROOT CAUSE UNKNOWN.

- [中文报告](REPORT.zh-CN.md) / [English report](REPORT.en.md)
- [Grouped requirement results](results.csv) / [112 original automation cases](automation-cases.csv)
- [Prior17 and6 mapping](PRIOR-CASES.md) / [classification](automation/failure-classification.json)
- [Issue categories](issues.json) / [all raw failures](raw-error-register.json)
- [Independent screenshots/logs/JSON](attempt-02/evidence) / [real downloads](attempt-02/downloads)
- [First original failed attempt](independent/evidence) / [first failed trace](independent/evidence/trace-first-attempt.zip)
- [Completed independent trace](attempt-02/evidence/independent-complete-trace.zip)
- [Original failure screenshots/errors](automation/failures)
- [Exact served-product identity](http-trace-identity.json) / [preservation](preservation.json)
- [Original test changes by developer, read-only audit](candidate-original-test-diff.patch)
- [New standalone independent methods](methods-attempt02) / [fresh fictional inputs](fixtures-attempt02)
- [Evidence checksum inventory](SHA256SUMS.txt)

## Original automated report, screenshots and58 traces

All469 original test-results/playwright-report files are retained without byte changes. Reassemble in this directory:

```bash
mkdir extracted
cat automation/raw-parts/all-original.tar.gz.part* | tar -xz -C extracted -f -
python -m http.server 8099 --directory extracted/playwright-report
```

Open the extracted HTML report locally; use the product's installed Playwright trace viewer for an extracted `test-results/*/trace.zip`, or the direct independent traces above. Do not upload traces elsewhere: they contain fictional data and local request details. Original and independent hashes/integrity are in `automation/original-file-manifest.json`, `automation/archive.json`, `automation/trace-integrity.json`, `independent-trace-integrity.json`.

The tar uses internal hardlinks for byte-identical report/test attachments. Extraction and every file's SHA256 were revalidated; originals are not filtered to successes. Existing reports and product/test/CI files were untouched. This appendix is Linux cloud evidence, not native Windows or official Actions evidence.
