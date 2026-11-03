param([string]$DataName='data-origin',[switch]$Existing)
$ErrorActionPreference='Stop'
$root=$PSScriptRoot
if($DataName -notmatch '^[a-z0-9-]+$'){throw 'Unsafe data child name'}
$base=(Get-Content -LiteralPath (Join-Path (Split-Path -Parent $root) 'windows-native-current.txt')).Trim()
$source=Join-Path $base 'fixed-source'
$data=Join-Path $root $DataName
$sock=[System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback,8765)
try{$sock.Start()}finally{$sock.Stop()}
if($Existing){if(-not (Test-Path -LiteralPath $data)){throw 'Existing task data missing'}}else{if(Test-Path -LiteralPath $data){throw 'Fresh target already exists'};New-Item -ItemType Directory -Path $data | Out-Null}
$temp=Join-Path $root 'temp';New-Item -ItemType Directory -Path $temp -Force | Out-Null
$env:SRM_DATA_DIR=$data;$env:TEMP=$temp;$env:TMP=$temp
$env:PATH='C:\Users\<WINDOWS_USER>\AppData\Local\Python\pythoncore-3.15-64;'+$env:PATH
$node=(Get-Command node).Source.Replace('\','/')
$open=(Join-Path $root 'browser-open.cjs').Replace('\','/')
$env:BROWSER='"'+$node+'" "'+$open+'" %s'
$stamp=Get-Date -Format yyyyMMdd-HHmmss
[ordered]@{time=(Get-Date).ToString('o');data=$data;browserHook=$env:BROWSER;source=$source;existing=[bool]$Existing} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $root "service-$stamp.environment.json")
Set-Location -LiteralPath $source
cmd /d /c 'call prototype\m1-lite\run_local.bat' 2>&1 | Tee-Object -FilePath (Join-Path $root "service-$stamp.log")
exit $LASTEXITCODE
