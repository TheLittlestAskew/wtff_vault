@echo off
rem ─────────────────────────────────────────────────────────────────────────
rem  One-time installer: registers the "WTFF Pipeline Watcher" logon task,
rem  mirroring sitl's. Starts the hidden watcher at every logon.
rem  Self-elevates via UAC (task creation needs admin). Just double-click it.
rem ─────────────────────────────────────────────────────────────────────────
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Requesting administrator rights...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

set "VBS=%~dp0start-watcher-hidden.vbs"
set "TASK=WTFF Pipeline Watcher"
schtasks /Create /TN "%TASK%" /TR "wscript.exe \"%VBS%\"" /SC ONLOGON /RL LIMITED /F

rem ───────────────────────────────────────────────────────────────
rem  Harden the settings. `schtasks /Create` inherits Windows DEFAULTS:
rem  ExecutionTimeLimit=PT72H, StopIfGoingOnBatteries=True, RestartCount=0.
rem  This is a long-running logon watcher, so the 72h limit KILLS IT every
rem  three days and RestartCount=0 means it never comes back. This task is
rem  where that was found (2026-08-28: Ready, last result 0x800705B4 =
rem  timeout, node child left orphaned and invisible to Task Scheduler).
rem  PT0S means "no limit". Do NOT drop this block: without it the installer
rem  recreates the exact bug it was written to fix.
rem ───────────────────────────────────────────────────────────────
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew -StartWhenAvailable; Set-ScheduledTask -TaskName '%TASK%' -Settings $s | Out-Null; $t = Get-ScheduledTask -TaskName '%TASK%'; Write-Host ('  ExecutionTimeLimit = ' + $t.Settings.ExecutionTimeLimit + '   (expect PT0S)'); Write-Host ('  RestartCount       = ' + $t.Settings.RestartCount + '   (expect 3)'); Write-Host ('  StopIfOnBatteries  = ' + $t.Settings.StopIfGoingOnBatteries + '   (expect False)')"

echo.
if %errorlevel%==0 (
  echo Done. "WTFF Pipeline Watcher" is registered and will start hidden at next logon.
  echo To start it now without logging out, double-click start-watcher-hidden.vbs.
) else (
  echo Registration FAILED ^(exit %errorlevel%^). See the message above.
)
echo.
pause
