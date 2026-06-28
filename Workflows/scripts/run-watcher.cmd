@echo off
rem Launches the WTFF pipeline watcher and tees all output to watcher.log.
rem Started hidden by start-watcher-hidden.vbs (which is started by Task Scheduler at logon).
rem %~dp0 = this script's folder (<vault>\Workflows\scripts\); ..\..\ = vault root.
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" wtff_pipeline_watch.js >> "%~dp0..\..\_pipeline\watcher.log" 2>&1
