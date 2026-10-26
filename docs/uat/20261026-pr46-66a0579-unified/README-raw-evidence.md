# 原始证据 / Raw evidence

All441 actual Playwright result/HTML report files,including55 traces and15 failed-case originals,are losslessly archived under `automation/playwright-raw-parts/`. Identical copies use standard tar hardlinks,with original names/bytes verified. Reassemble in a new empty directory:

```sh
cat all-playwright-raw.tar.gz.part* | tar -xz -f -
```

`automation/playwright-original-file-manifest.json` contains every original path/hash; `playwright-archive.json` contains volume/archive hashes. Extracted `test-results/results.json` is original runner JSON. Open extracted trace.zip files in Playwright trace viewer; HTML index and all data are preserved.

Three independent traces/log sets live directly under `independent/evidence/` (attempt01), `attempt-02/evidence/`, `attempt-03/evidence/`. They all end with a real recorded error. `attempt-01-methods`, `attempt-02-methods`,and `methods` retain source versions; presence of planned step11 does not mean it executed (it was not reached after third runtime fault). Row-density finding was assessed read-only from already executed step06 screenshots/metrics; no fourth browser run occurred.

Fixtures were freshly generated on this SHA; unused sample fixtures do not imply those scenarios ran. `tampered-current-S4.zip` uses unsupported DEFLATED compression and did not exercise intended content-hash rejection. Read-only post-stop snapshot evidence is not a substitute for completing the blocked driver assertions. Original invalid/broken fixture files are intentional; SHA checks preserve their bytes.
