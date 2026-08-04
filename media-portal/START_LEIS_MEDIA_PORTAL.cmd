@echo off
REM Original, permanent launcher location for LEIS Media Portal.
set "RUNTIME=C:\Users\Operator\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%RUNTIME%" (
  start "LEIS Media Portal" /min "%RUNTIME%" "%~dp0portal.py"
) else (
  start "LEIS Media Portal" /min py -3 "%~dp0portal.py"
)
echo LEIS Media Portal is opening in your browser.
