@echo off
setlocal
REM UI V2 review launcher: isolate all trial data from the normal SRM-Lite SQLite directory.
REM Run the existing local SRM backend; never open index.html via file://.
set "SERVER=%~dp0backend\server.py"
if not exist "%SERVER%" (
  echo ERROR: Cannot find backend\server.py. Extract the complete repository archive.
  pause
  exit /b 1
)
if defined LOCALAPPDATA (
  set "SRM_DATA_DIR=%LOCALAPPDATA%\SRM-Lite-V2-Review"
) else (
  set "SRM_DATA_DIR=%USERPROFILE%\AppData\Local\SRM-Lite-V2-Review"
)
if not exist "%SRM_DATA_DIR%" mkdir "%SRM_DATA_DIR%"
if not exist "%SRM_DATA_DIR%" (
  echo ERROR: Could not create isolated review data directory.
  pause
  exit /b 1
)
echo.
echo SRM UI V2 isolated review mode.
echo Data directory: "%SRM_DATA_DIR%"
echo This does not use the normal SRM-Lite workspace database.
echo Only test with invented, non-sensitive supplier/item records.
echo Browser opens automatically at http://127.0.0.1:8765/
echo If port 8765 is already occupied, close the running SRM server first.
echo.
python -c "import sys;sys.exit(0 if sys.version_info >= (3, 10) else 1)" >nul 2>&1
if not errorlevel 1 (
  python "%SERVER%"
  goto :finished
)
py -3 -c "import sys;sys.exit(0 if sys.version_info >= (3, 10) else 1)" >nul 2>&1
if not errorlevel 1 (
  py -3 "%SERVER%"
  goto :finished
)
echo ERROR: Python 3.10 or newer is required.
pause
exit /b 1
:finished
set "EXIT_CODE=%ERRORLEVEL%"
if not "%EXIT_CODE%"=="0" (
  echo ERROR: SRM V2 review server exited with code %EXIT_CODE%.
  pause
)
exit /b %EXIT_CODE%
