# Raw evidence / 原始证据

Only product f8a67d7 was tested in this directory. Windows is NOT TESTED; executed evidence is Linux supplemental. Historical evidence is unchanged.

`automation/` contains original command logs, JSON results and failure classifications. All 446 original runner and HTML-report files are preserved in a standard tar/gzip archive; identical contents use standard tar hardlinks without losing any original path or byte. From that folder, reconstruct with:

```bash
cat raw-parts/all-original.tar.gz.part* | tar -xz -f -
```

Check `archive.json` and `original-file-manifest.json`. Original absolute attachment paths map to extracted `test-results/` paths. Open available traces with `npx playwright show-trace test-results/<case>/trace.zip`, or the report with `npx playwright show-report playwright-report`. `trace-integrity.json` inventories files actually present.

Independent records:

- `independent/`: initial null-demo driver error.
- `attempt-02/`: main buyer and backup flow, ending at an outdated nonempty-refusal text assertion.
- `continuation/`: current-task nonempty backend refusal and actual offline save/restart checks.

All failed traces, screenshots, logs and source records remain unchanged. New standalone drivers under `methods*/` are execution evidence; original product tests were not edited. Absolute runtime paths are provenance: preflight before reproducing in a new isolated folder. Only fictional data was used; no old database/archive or production data was imported.

Validate delivered files from this directory with `sha256sum -c SHA256SUMS`. The checksum list intentionally excludes itself.
