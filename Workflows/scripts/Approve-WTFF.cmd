@echo off
rem Applies the reviewed spell-check, generates the note, propagates the vault, and pushes.
rem Launched by the "Approve & apply" toast button, the status-window button, or directly.
title WTFF - Approve session
cd /d "%~dp0"
echo Approving the pending WTFF session (Phase B + Convo 2)...
echo.
"C:\Program Files\nodejs\node.exe" wtff_pipeline_watch.js --approve
echo.
echo Done. You can close this window.
pause
