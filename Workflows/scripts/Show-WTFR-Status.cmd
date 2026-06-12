@echo off
rem Opens the WTFR pipeline status window. Safe to run any time — if a window is
rem already open this just exits (single-instance). Closing it never affects a run.
start "" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0wtfr_status_window.ps1"
