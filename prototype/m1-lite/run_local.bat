@echo off
setlocal
REM Use ASCII-only batch text for consistent Windows CMD parsing.
REM Resolve the backend script relative to this launcher, regardless of the current folder.
set "SERVER=%~dp0backend\server.py"
if not exist "%SERVER%" (
    echo ERROR: backend\server.py was not found next to this launcher.
    echo Re-download the complete prototype folder and try again.
    pause
    exit /b 1
)
REM Prefer a working Python 3.10+ installation, not an unusable WindowsApps alias.
python -c "import sys;sys.exit(0 if sys.version_info >= (3, 10) else 1)" >nul 2>&1
if not errorlevel 1 (
    python "%SERVER%"
    goto :finished
)
REM Fall back to the classic Windows Python launcher when present.
py -3 -c "import sys;sys.exit(0 if sys.version_info >= (3, 10) else 1)" >nul 2>&1
if not errorlevel 1 (
    py -3 "%SERVER%"
    goto :finished
)
echo ERROR: Python 3.10 or newer is required.
echo Check installation with: python --version
pause
exit /b 1
:finished
set "EXIT_CODE=%ERRORLEVEL%"
if not "%EXIT_CODE%"=="0" (
    echo.
    echo ERROR: The SRM local server exited with error code %EXIT_CODE%.
    echo If the port is already in use, close the previous server first.
    pause
)
exit /b %EXIT_CODE%
