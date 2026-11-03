# Raw evidence / 原始证据

Only this new directory appended to existing Draft PR50; historical reports unchanged. See bilingual reports and results.csv.

Automation files for BOTH runs are retained with original path/bytes/hash, including HTML report duplicate paths (standard tar hardlinks deduplicate content). Original attachment paths reference runtime /tmp/srm795-product; use the corresponding phase extraction.

For each automation/phase1 or phase2, download raw-parts/all-original.tar.gz.part* in numeric order into a local copy, then:

```bash
cat raw-parts/all-original.tar.gz.part* | tar -xz -f -
```

Validate archive.json and original-file-manifest.json SHA256. Use local `npx playwright show-trace test-results/<case>/trace.zip` for available original traces, or `npx playwright show-report playwright-report` for the HTML report. Phase1 AF04 has no trace attachment after a trace-finalization ZIP error; screenshots/context/server logs remain. trace-integrity.json validates the files that actually exist, not nonexistent attachments.

Independent successful attempt03 includes independent-trace.zip and screenshots/browser.jsonl/server logs/downloads. Failed attempts independent/ and attempt-02/ remain unchanged. methods/ contains NEW independent drivers only; product/original tests/CI were never edited. Driver helper absolute runtime paths are provenance, not portable entrypoints; review before reproducing in a fresh isolated folder. No production data is included.

Validate all delivered files using `sha256sum -c SHA256SUMS` from this directory. SHA256SUMS intentionally excludes itself.
