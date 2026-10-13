@echo off
REM 中文：切换到本脚本所在项目目录。
REM English: Run from the local prototype folder.
cd /d "%~dp0backend"
REM 中文：优先使用 Windows Python Launcher，后备为 python 命令。
REM English: Prefer Windows Python Launcher, fall back to python.
where py >nul 2>nul
if %ERRORLEVEL%==0 (
    py -3 server.py
) else (
    python server.py
)
if errorlevel 1 (
    echo SRM failed to start. Check that Python 3.10+ is installed.
    pause
)
