' Starts run-watcher.cmd with no visible window (0 = hidden, True = wait so the
' scheduled task stays "Running" and can auto-restart the watcher if it dies).
Set sh = CreateObject("WScript.Shell")
sh.Run "C:\Users\theli\wtff_vault\Workflows\scripts\run-watcher.cmd", 0, True
