$ErrorActionPreference = 'Stop'
$runRoot = $PSScriptRoot
$workspaceRoot = Split-Path -Parent $runRoot
$sourceBase = (Get-Content -LiteralPath (Join-Path $workspaceRoot 'windows-native-current.txt')).Trim()
$sourceRoot = Join-Path $sourceBase 'fixed-source'
$pythonPath = 'C:\Users\<WINDOWS_USER>\AppData\Local\Python\pythoncore-3.15-64\python.exe'
foreach ($folder in @('data','temp','pycache')) {
    $target = Join-Path $runRoot $folder
    if (Test-Path -LiteralPath $target) { throw "Fresh run target already exists: $folder" }
    New-Item -ItemType Directory -Path $target | Out-Null
}
$env:SRM_DATA_DIR = Join-Path $runRoot 'data'
$env:TEMP = Join-Path $runRoot 'temp'
$env:TMP = $env:TEMP
$env:PYTHONPYCACHEPREFIX = Join-Path $runRoot 'pycache'
$env:PYTHONIOENCODING = 'utf-8'
$env:PATH = (Split-Path -Parent $pythonPath) + ';' + $env:PATH
Set-Location -LiteralPath $sourceRoot
$probeStarted = (Get-Date).ToString('o')
$cmdVersion = (cmd.exe /d /c ver | Out-String).Trim()
$cmdExit = $LASTEXITCODE
$wherePython = @(where.exe python)
$whereExit = $LASTEXITCODE
$pythonVersion = (python --version | Out-String).Trim()
$versionExit = $LASTEXITCODE
$pyIdentity = (& $pythonPath -c 'import os,platform,sys,sqlite3,tempfile,json;print(json.dumps({"os_name":os.name,"system":platform.system(),"release":platform.release(),"version":platform.version(),"machine":platform.machine(),"sys_version":sys.version,"executable":sys.executable,"sqlite_version":sqlite3.sqlite_version,"tempfile_root":tempfile.gettempdir()},ensure_ascii=False))' | Out-String).Trim() | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or $pyIdentity.os_name -ne 'nt' -or $pyIdentity.system -ne 'Windows' -or $pythonVersion -notmatch '^Python 3\.15\.') { throw 'Native Python3.15 prerequisite mismatch' }
$osInfo = Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,BuildNumber,OSArchitecture
$desktopPowerShell = (powershell.exe -NoProfile -Command '$PSVersionTable.PSVersion.ToString()' | Out-String).Trim()
$metadata = [ordered]@{
    scope = 'WIN-01 only; D-032 Python3.15 native Windows backend complete suite'
    productSHA = '2aaa478c8f1966e41b9372d9d989c383dbaa1972'
    preflightTime = $probeStarted
    sourceRoot = $sourceRoot
    workingDirectory = (Get-Location).Path
    executable = $pythonPath
    command = 'python -m unittest discover -v -s prototype/m1-lite/backend -p "test_*.py"'
    actualArgumentList = '-m unittest discover -v -s prototype/m1-lite/backend -p "test_*.py"'
    os = $osInfo
    cmdVersion = $cmdVersion
    cmdExit = $cmdExit
    powershellVersion = $PSVersionTable.PSVersion.ToString()
    windowsPowerShellVersion = $desktopPowerShell
    pythonVersion = $pythonVersion
    pythonVersionExit = $versionExit
    wherePython = $wherePython
    wherePythonExit = $whereExit
    pythonIdentity = $pyIdentity
    processOnlyEnvironment = [ordered]@{ SRM_DATA_DIR=$env:SRM_DATA_DIR; TEMP=$env:TEMP; TMP=$env:TMP; PYTHONPYCACHEPREFIX=$env:PYTHONPYCACHEPREFIX; PYTHONIOENCODING=$env:PYTHONIOENCODING; pathPrefix=(Split-Path -Parent $pythonPath) }
    noSystemPathChange = $true
    wslEnvironmentPresent = (@(Get-ChildItem Env:WSL*).Count -gt 0)
}
$metadata | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $runRoot 'environment.json') -Encoding utf8
$started = Get-Date
$process = Start-Process -FilePath $pythonPath -ArgumentList $metadata.actualArgumentList -WorkingDirectory $sourceRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runRoot 'unittest.stdout.log') -RedirectStandardError (Join-Path $runRoot 'unittest.stderr.log') -PassThru
$pidRecord = [ordered]@{pid=$process.Id; started=$started.ToString('o'); executable=$pythonPath; command=$metadata.command; workingDirectory=$sourceRoot}
$pidRecord | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $runRoot 'execution-start.json') -Encoding utf8
$process.WaitForExit()
$process.Refresh()
$finished = Get-Date
[ordered]@{pid=$process.Id; started=$started.ToString('o'); finished=$finished.ToString('o'); elapsedSeconds=($finished-$started).TotalSeconds; exitCode=$process.ExitCode; command=$metadata.command; workingDirectory=$sourceRoot; stdout='unittest.stdout.log'; stderr='unittest.stderr.log'} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $runRoot 'execution.json') -Encoding utf8
Get-Content -LiteralPath (Join-Path $runRoot 'execution.json')
Get-Content -LiteralPath (Join-Path $runRoot 'unittest.stderr.log') -Tail 12
exit $process.ExitCode
