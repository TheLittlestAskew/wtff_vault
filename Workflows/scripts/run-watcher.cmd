@echo off
rem Launches the WTFF pipeline watcher and tees all output to watcher.log.
rem Started hidden by start-watcher-hidden.vbs (which is started by Task Scheduler at logon).
cd /d "C:\Users\theli\wtff_vault\Workflows\scripts"
"C:\Program Files\nodejs\node.exe" wtff_pipeline_watch.js >> "C:\Users\theli\wtff_vault\_pipeline\watcher.log" 2>&1
