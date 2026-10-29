# 2aaa478 TEST-ONLY evidence append

Product `2aaa478c8f1966e41b9372d9d989c383dbaa1972`.Cloud scopePASS/READYonly;complete M1 merge gateNOTREADY,Windows3NOTTESTED.

- [中文报告](REPORT.zh-CN.md) / [English report](REPORT.en.md)
- [Itemized results](RESULTS.md) / [CSV](results.csv) / [112primarycases](automation-cases.csv)
- [Commands/exits](COMMANDS.md)
- [Focused100body/79post-loop assertions](focused-assertion-audit.json) / [same proof in full suite](full-ui-assertion-audit.json)
- [Current previous-five case results](prior-five-current-results.json)
- [Fresh independent screenshots/logs/trace/data checks](independent/evidence) / [actual downloadedfiles](independent/downloads)
- [First-searchrAF data](independent/evidence/assign-search-first-frames.jsonl)
- [Raw error/correction register](raw-error-register.json)
- [Initial no-match selector](initial-selection-no-tests) / [preserved interrupted early suite](initial-interrupted-suite)
- [Exact version/HTTP](http-trace-identity.json) / [preservation](preservation.json) / [checksum inventory](SHA256SUMS.txt)
- [New standalone independent methods](methods/run-independent.cjs) / [fresh fictional inputs](fixtures)

## Reassemble raw reports without changing any artifact bytes

Each of `automation`, `focused`, `initial-selection-no-tests`, `initial-interrupted-suite` contains an independent complete archive,manifest,parts and integrity report.Example for the primary run:

```bash
mkdir extracted-primary
cat automation/raw-parts/all-original.tar.gz.part* | tar -xz -C extracted-primary -f -
python -m http.server 8099 --directory extracted-primary/playwright-report
```

Repeat into a different extraction directory for each other phase.Do not mix archives.Internal tarhardlinks deduplicate identical attachments;all original file hashes were revalidated after extraction.Use a local Playwright trace viewer for original test-results/*/trace.zip or the direct independent trace.All phases,including initial0-case failure/interrupted13-of58stage,are retained;only corrected ordered complete run determines primary acceptance.No old-SHA PASS transfer or product/test/CI/memory/main changes.NoActions,merge orclosure.
