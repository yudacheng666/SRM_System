$ErrorActionPreference = 'Stop'
$runRoot = $PSScriptRoot
$workspaceRoot = Split-Path -Parent $runRoot
$sourceBase = (Get-Content -LiteralPath (Join-Path $workspaceRoot 'windows-native-current.txt')).Trim()
$sourceRoot = Join-Path $sourceBase 'fixed-source'
$nodePath = (Get-Command node -CommandType Application).Source
foreach ($folder in @('data','temp')) {
    $target = Join-Path $runRoot $folder
    if (Test-Path -LiteralPath $target) { throw "Fresh target exists: $folder" }
    New-Item -ItemType Directory -Path $target | Out-Null
}
$env:SRM_DATA_DIR = Join-Path $runRoot 'data'
$env:TEMP = Join-Path $runRoot 'temp'
$env:TMP = $env:TEMP
Set-Location -LiteralPath $sourceRoot
$whereNode = @(where.exe node)
$whereExit = $LASTEXITCODE
$nodeVersion = (node --version | Out-String).Trim()
$versionExit = $LASTEXITCODE
$identity = (& $nodePath -e 'const os=require("node:os");console.log(JSON.stringify({execPath:process.execPath,version:process.version,platform:process.platform,arch:process.arch,release:os.release(),type:os.type(),tmpdir:os.tmpdir(),versions:process.versions,cwd:process.cwd()}))' | Out-String).Trim() | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or $identity.platform -ne 'win32' -or $nodeVersion -notmatch '^v24\.') { throw 'Native Node24 mismatch' }
if ($env:NODE_OPTIONS) { throw 'Unexpected NODE_OPTIONS; inspect before original-suite execution' }
$metadata = [ordered]@{
    scope = 'WIN-02 only; D-033 native Windows Node24; no npm wrapper required'
    productSHA = '2aaa478c8f1966e41b9372d9d989c383dbaa1972'
    preflightTime = (Get-Date).ToString('o')
    os = (Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,BuildNumber,OSArchitecture)
    cmdVersion = (cmd.exe /d /c ver | Out-String).Trim()
    powershellVersion = $PSVersionTable.PSVersion.ToString()
    nodeVersion = $nodeVersion
    nodeVersionExit = $versionExit
    whereNode = $whereNode
    whereNodeExit = $whereExit
    nodeIdentity = $identity
    workingDirectory = (Get-Location).Path
    executable = $nodePath
    command = 'node --test prototype/m1-lite/tests/autosave_rules.test.cjs prototype/m1-lite/tests/supplier_package.test.cjs'
    actualArgumentList = '--test prototype/m1-lite/tests/autosave_rules.test.cjs prototype/m1-lite/tests/supplier_package.test.cjs'
    processOnlyEnvironment = [ordered]@{ SRM_DATA_DIR=$env:SRM_DATA_DIR; TEMP=$env:TEMP; TMP=$env:TMP }
    nodeOptionsPresent = [bool]$env:NODE_OPTIONS
    noInstallOrSystemPathChange = $true
    wslEnvironmentPresent = (@(Get-ChildItem Env:WSL*).Count -gt 0)
}
$metadata | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $runRoot 'environment.json') -Encoding utf8
$started = Get-Date
$process = Start-Process -FilePath $nodePath -ArgumentList $metadata.actualArgumentList -WorkingDirectory $sourceRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runRoot 'node.stdout.log') -RedirectStandardError (Join-Path $runRoot 'node.stderr.log') -PassThru
[ordered]@{pid=$process.Id;started=$started.ToString('o');executable=$nodePath;command=$metadata.command;workingDirectory=$sourceRoot} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $runRoot 'execution-start.json') -Encoding utf8
$process.WaitForExit()
$process.Refresh()
$finished = Get-Date
[ordered]@{pid=$process.Id;started=$started.ToString('o');finished=$finished.ToString('o');elapsedSeconds=($finished-$started).TotalSeconds;exitCode=$process.ExitCode;command=$metadata.command;workingDirectory=$sourceRoot;stdout='node.stdout.log';stderr='node.stderr.log'} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $runRoot 'execution.json') -Encoding utf8
Get-Content -LiteralPath (Join-Path $runRoot 'execution.json')
Get-Content -LiteralPath (Join-Path $runRoot 'node.stdout.log')
Get-Content -LiteralPath (Join-Path $runRoot 'node.stderr.log')
exit $process.ExitCode
