# WTFR toast notifier. Called by wtfr_pipeline_watch.js.
# Shows a Windows toast; if -ReviewPath/-ApprovePath are given it adds buttons
# that open the spell-check file or launch the approve step.
param(
  [string]$Title       = 'WTFR pipeline',
  [string]$Message     = '',
  [string]$ReviewPath  = '',
  [string]$ApprovePath = ''
)

try {
  Import-Module BurntToast -ErrorAction Stop
} catch {
  # BurntToast not available — fall back to a simple popup so the ping isn't lost.
  Add-Type -AssemblyName System.Windows.Forms
  [System.Windows.Forms.MessageBox]::Show($Message, $Title) | Out-Null
  return
}

$buttons = @()
if ($ReviewPath)  { $buttons += New-BTButton -Content 'Review changes'  -Arguments $ReviewPath  -ActivationType Protocol }
if ($ApprovePath) { $buttons += New-BTButton -Content 'Approve & apply' -Arguments $ApprovePath -ActivationType Protocol }

$binding = New-BTBinding -Children (New-BTText -Content $Title), (New-BTText -Content $Message)
$visual  = New-BTVisual -BindingGeneric $binding

if ($buttons.Count -gt 0) {
  # -Scenario Reminder keeps the toast on screen until you act/dismiss it
  # (instead of auto-hiding after ~5s), so the approval ping can't be missed.
  # Reminder scenario requires at least one button, which we have here.
  $content = New-BTContent -Visual $visual -Actions (New-BTAction -Buttons $buttons) -Scenario Reminder
} else {
  # Plain status/failure toasts have no buttons, so they use the default
  # (auto-hide) behavior and still land in the Action Center.
  $content = New-BTContent -Visual $visual
}
Submit-BTNotification -Content $content
