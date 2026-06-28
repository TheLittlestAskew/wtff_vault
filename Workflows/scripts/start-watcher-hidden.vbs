' Starts run-watcher.cmd with no visible window (0 = hidden, True = wait so the
' scheduled task stays "Running" and can auto-restart the watcher if it dies).
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
' Resolve run-watcher.cmd relative to this script's own folder, so moving the vault doesn't break it.
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.Run """" & scriptDir & "\run-watcher.cmd""", 0, True
