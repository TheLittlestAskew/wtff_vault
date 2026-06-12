@echo off
rem Applies the reviewed spell-check, generates the note, propagates the vault, and pushes.
rem Launched by the "Approve & apply" toast button, the status-window button, or directly.
title WTFR - Approve session
cd /d "C:\Users\theli\wtfr_vault\Workflows\scripts"
echo Approving the pending WTFR session (Phase B + Convo 2)...
echo.
"C:\Program Files\nodejs\node.exe" wtfr_pipeline_watch.js --approve
echo.
echo Done. You can close this window.
pause
