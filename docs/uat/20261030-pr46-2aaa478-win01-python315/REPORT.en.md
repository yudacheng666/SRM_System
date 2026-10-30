# WIN-01 native Windows Python3.15 full backend suite

WIN-01 PASS: 44 passed, zero failures/errors/skips, actual process exit0. Overall NOT READY: WIN-02 Node22 remains NOT TESTED and WIN-03 native browser buyer workflow remains BLOCKED. This run implements only D-032/latest task comment6514275508, preserving all earlier evidence and official CI configuration.

Actual native Windows11 Pro x64 build26200.9711; PowerShell7.6.5 and Windows PowerShell5.1.26100.9711; installed Python3.15.0 (MSC v.1951 AMD64), os.name=nt, platform.system()=Windows, SQLite3.53.4. A process-only PATH prefix selects the valid installed executable ahead of WindowsApps; no installs, downgrades or system PATH changes.

From complete exact-product-source repository root, invoked the original unchanged command: python -m unittest discover -v -s prototype/m1-lite/backend -p "test_*.py". Native processPID17552 ran from2026-10-30 11:34:15.226+08:00 to11:34:25.926+08:00; unittest reports44 tests in9.552s, OK; process exit0. stdout is an actual empty0-byte file; full original stderr is12582bytes. All44 individual ok results are indexed in results.csv. Module counts: auto_backup10, s3_regression8, s4_backup8, s4_server4, server7, store7. One full run, no retry, skip, assertion change or driver correction.

Reviewed actual SQLite, PDF, ZIP, S4 and HTTP tests, including full archive roundtrip with two RFQs/history/PDF bytes; nonempty rejection; tampered PDF/database/manifest and missing/extra entries; backup policy/retention; HTTP restore and409 overwrite rejection. Expected negative-case HTTP400/403/404/409 are not test failures. No incompatibility was found by this suite; uncovered buyer functionality is not inferred safe.

Product/test commit2aaa478c8f1966e41b9372d9d989c383dbaa1972 remained PR46 HEAD. Fresh GitHub exact-SHA recursive tree was compared against all146 local raw Git blobs including all6 test files, before and after running. No original file changed. Source is a complete GitHub API tree/blob materialization, not a git checkout. HTML SHA256 remains bf1415deb388b35ea36c12c46773e3eea75fe22dfb02d7aac7720d40d9d438d3. No new HTTP page request was performed this scope.

Fresh run root isolates SRM_DATA_DIR, TEMP/TMP and bytecode. PYTHONIOENCODING=utf-8 controls output encoding only. Original tests use synthetic temporary fixtures; no business directory was accessed or overwritten. Teardown left temp/data empty and the native test process exited. No BAT/browser service was launched.

Only a fresh versioned evidence directory is appended to existing DraftPR50, preserving all old blobs. Published copies replace local root/user paths with placeholders; checksums record original and published hashes. No product/original-test/CI/main/M1 change, Linux/Node rerun, Actions trigger, merge or PR closure. WIN-01 PASS does not authorize merging or make the complete Windows gate READY.
