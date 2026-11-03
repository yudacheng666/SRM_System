# 原始证据 / Raw evidence

Complete unedited Playwright test-results and HTML report files are losslessly archived in `automation/playwright-raw-parts/`. Identical copies use standard tar hardlinks; all original names and bytes were revalidated against the manifest. No failed sample or trace was discarded.

在空临时目录中按文件名顺序拼接解包 / Reassemble in a new empty directory:

```sh
cat playwright-all-raw.tar.gz.part* | tar -xz -f -
```

`automation/playwright-original-file-manifest.json` lists every original hash; `playwright-archive.json` lists volume/archive hashes. Extracted `test-results/results.json` is the unedited runner JSON; all50 per-case traces and server logs remain available. `playwright-report/index.html` and its data are included. Use Playwright trace viewer to inspect extracted trace ZIPs.

`independent/evidence/` directly contains34 original screenshots, one independent trace and browser/server logs. `methods/` contains new standalone diagnostic drivers, not modifications to existing repository tests. `fixtures/` contains fictional data; presence of extra unused fixtures does not imply their scenarios were executed. The prior actual fictional S4 ZIP is referenced at the immutable old evidence location, with input identity preserved in setup logs.

[原始虚构输入 ZIP / Immutable fictional seed](https://github.com/yudacheng666/SRM_System/blob/8296b853b3de03eb406ccd1f6eca50fdfdfdfa44/docs/uat/20261022-pr46-c2737f0-continuation/attempt-02/downloads/independent-S4-full.zip) and [seed checksum](seed-provenance.json).

`package.log` preserves a reporting-parser error caused by multiline unittest docstrings; `package-resume.log` records successful evidence completion. No test was rerun or reclassified; see reportingToolErrors in the raw error register.
