@echo off
rem Launches the WTFR pipeline watcher and tees all output to watcher.log.
rem Started hidden by start-watcher-hidden.vbs (which is started by Task Scheduler at logon).
cd /d "C:\Users\theli\wtfr_vault\Workflows\scripts"
"C:\Program Files\nodejs\node.exe" wtfr_pipeline_watch.js >> "C:\Users\theli\wtfr_vault\_pipeline\watcher.log" 2>&1
