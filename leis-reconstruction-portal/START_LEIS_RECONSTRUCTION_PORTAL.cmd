@echo off
set "RUNTIME=C:\Users\Operator\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%RUNTIME%" (start "LEIS Reconstruction Portal" /min "%RUNTIME%" "%~dp0leis_portal.py") else (start "LEIS Reconstruction Portal" /min py -3 "%~dp0leis_portal.py")
