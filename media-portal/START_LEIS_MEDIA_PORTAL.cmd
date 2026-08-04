@echo off
REM Original, permanent launcher location for LEIS Media Portal.
netstat -ano | findstr /R /C:":8787 .*LISTENING" >nul
if not errorlevel 1 (
  start "" "http://127.0.0.1:8787/"
  exit /b 0
)
set "RUNTIME=C:\Users\Operator\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%RUNTIME%" (
  start "LEIS Media Portal" /min "%RUNTIME%" "%~dp0portal.py"
) else (
  start "LEIS Media Portal" /min py -3 "%~dp0portal.py"
)
echo LEIS Media Portal is opening in your browser.
