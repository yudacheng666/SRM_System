# Executed command map (local paths redacted)

Initial native preflight: CMD `ver`; PowerShell `$PSVersionTable`; Windows PowerShell `powershell -NoProfile -Command '$PSVersionTable.PSVersion.ToString()'`; native Python3.15 platform query; CMD `py -3.13 --version` exit1; CMD `node --version & where node & npm --version` exit1. Commands required by WIN01/02 were not run because required versions were missing. No installation or system PATH changes.

Source: complete specified-SHA GitHub recursive tree and raw blob retrieval, all146 Git blob hashes verified. `Get-FileHash <ISOLATED_ROOT>\fixed-source\prototype\m1-lite\index.html -Algorithm SHA256`. Final source verification checks the same146 blobs.

Each BAT launch sets only process environment: `$env:SRM_DATA_DIR=<task-created-directory>` and prefixes the already-installed Python3.15 directory to process PATH. First launch cwd is fixed-source: `cmd /d /c 'call prototype\m1-lite\run_local.bat'`. Second cwd is `<ISOLATED_ROOT>\其他 工作目录`: `cmd /d /c 'call "<ISOLATED_ROOT>\fixed-source\prototype\m1-lite\run_local.bat"'`. Third uses a distinct new empty restore data directory and the same absolute BAT. Ports were checked free before launch. Each launch remains running (not a terminal exit0 assertion); logs/PIDs saved. Each is stopped via Ctrl+C to its own exec session; wrappers exit1, final process absence/free-port check exit0.

The following independent Python3.15 driver commands were run using an explicit installed executable path. Driver and logs are included; this is not WIN01's full Python3.13 suite:

1. `python.exe <ISOLATED_ROOT>\windows-checkpoint.py seed` -> exit1, original error preserved.
2. Driver-only checkpoint addition: explicitly select each target RFQ via `/api/active/select` with expectedActive before PDF upload. No product/assertion changes.
3. `python.exe <ISOLATED_ROOT>\windows-checkpoint.py assets` -> exit0.
4. Stop first task server; restart BAT from Chinese/space cwd.
5. `python.exe <ISOLATED_ROOT>\windows-checkpoint.py backup` -> exit0; includes restart snapshot/PDF verification.
6. Stop second server; start BAT with newly created empty restore data root.
7. `python.exe <ISOLATED_ROOT>\windows-checkpoint.py restore` -> exit0; includes empty target check, full restore, snapshot/PDF checks, second-restore rejection, complete logical DB and all PDF hash equality.
8. Stop final server; native CIM task-process count0 and exclusive loopback bind success -> exit0.

Browser notes are transcribed tool observations, not screenshots: original Edge tab URL was http://127.0.0.1:8765/; buyer A was created/named/saved. New B confirmation interrupted CDP commands. Current retry `edge.tabs.list()` returned “Browser is not available: 2”; `cua.listBrowsers()` returned only IAB and MCP Apps. No native browser access was available for further UI acceptance. No IAB result is substituted.

Source ZIP attempt returned404; git clone initial DNS/thread failure and subsequent incomplete clone stopped withCtrl+C. Full verified API tree retrieval replaced these failed acquisition attempts. Original incomplete candidate directories were not tested or modified.
