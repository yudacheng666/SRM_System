# Raw evidence / 原始证据

Only this new directory appended to existing Draft PR50; every historical directory unchanged. reports/results.csv separate overlapping automation and independent sets.

Each automation/phase1 or phase2 holds command logs, original results JSON, complete HTML report and all original runner files as lossless standard tar/gzip with content-deduplicated hardlinks. To reconstruct within that phase:

```bash
cat raw-parts/all-original.tar.gz.part* | tar -xz -f -
```

Validate archive.json/original-file-manifest.json. Original attachment runtime paths are mapped to the matching extracted phase. Use `npx playwright show-trace test-results/<case>/trace.zip` or `npx playwright show-report playwright-report`. trace-integrity.json inventories files actually present, without claiming missing traces exist.

independent/ is the preserved first attempt ending in missing oracle fixture. attempt-01-fixtures/ retains its inputs. methods/ is its standalone driver source. methods-attempt02/ changes runtime paths only; attempt-02/ is the fresh complete run. driver-fixture-correction-01.json records the sole correction. Copy-only validator preflight is not counted as UAT; all real final46checks live in attempt-02/evidence/export-checks.json.

All material/supplier/pricing/PDFs are fictitious, all SQLite is task-local. No old business data/ZIP used as input. Standalone helpers have absolute runtime paths as execution provenance; preflight before reproduction in a new isolated folder. They do not modify original product tests. Validate delivered files with `sha256sum -c SHA256SUMS`; inventory excludes itself.
