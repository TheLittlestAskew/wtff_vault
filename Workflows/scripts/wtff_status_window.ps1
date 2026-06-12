# ════════════════════════════════════════════════════════════════════
#  WTFF Pipeline — persistent status window
# --------------------------------------------------------------------
#  A small, minimizable WPF panel that shows where the pipeline is:
#  Transcription → Spell-check (Convo 1A) → [your review] → Apply/notes
#  (Convo 1B) → Propagate + push (Convo 2).
#
#  It is DRIVEN ENTIRELY off _pipeline\status.json (written by
#  wtff_pipeline_watch.js) plus a tail of _pipeline\watcher.log, polled
#  ~every 0.75s. Nothing here talks to the pipeline directly, so you can
#  close and reopen this window any time without disturbing a run.
#
#  Honest progress only: no stage reports a true %, so a running stage
#  shows an animated "working" bar + live elapsed time, and the header
#  shows a real "Step N of 4" counter. Nothing ever fakes a percentage.
#
#  Launched (hidden host) by the watcher, or by Show-WTFF-Status.cmd.
# ════════════════════════════════════════════════════════════════════

# ── Single instance: a second launch just exits ──────────────────────
$createdNew = $false
$mutex = New-Object System.Threading.Mutex($true, 'WTFF_STATUS_WINDOW_SINGLETON', [ref]$createdNew)
if (-not $createdNew) { return }

Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase

# ── Paths (derive the vault root from this script's location) ────────
$vaultRoot  = Split-Path (Split-Path $PSScriptRoot)        # ...\wtff_vault
$statusFile = Join-Path $vaultRoot '_pipeline\status.json'
$logFile    = Join-Path $vaultRoot '_pipeline\watcher.log'

# ── Palette ──────────────────────────────────────────────────────────
$COL = @{
  pending  = '#555A66'; running  = '#5A9BD4'; awaiting = '#C8A85A'
  done     = '#6FBF73'; failed   = '#D9534F'; muted    = '#8A8A96'
  text     = '#E8E6E0'; card     = '#2A2C36'
}
$ICON = @{ pending = [char]0x25CB; running = [char]0x25B6; awaiting = [char]0x25CF;
           done = [char]0x2713; failed = [char]0x2717 }
$STEP_NO = @{ transcribe = 1; phaseA = 2; phaseB = 3; convo2 = 4 }

# ── Window shell (stage rows + log box are filled in code) ───────────
[xml]$xaml = @'
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="WTFF Pipeline" Height="540" Width="470"
        MinHeight="380" MinWidth="400"
        WindowStartupLocation="CenterScreen"
        Background="#1E1F26" UseLayoutRounding="True" SnapsToDevicePixels="True">
  <DockPanel>
    <Border DockPanel.Dock="Top" Background="#252731" Padding="16,12">
      <StackPanel>
        <TextBlock x:Name="HeaderTitle" Foreground="#E8E6E0" FontSize="16" FontWeight="SemiBold" Text="WTFF Pipeline"/>
        <TextBlock x:Name="HeaderSub" Foreground="#8A8A96" FontSize="12" Margin="0,3,0,0" Text="Idle &#8212; watching for a new recording"/>
      </StackPanel>
    </Border>
    <Border DockPanel.Dock="Bottom" Background="#16171C" Padding="12,8">
      <StackPanel>
        <TextBlock Foreground="#6A6A76" FontSize="10" Text="ACTIVITY LOG" Margin="0,0,0,4"/>
        <TextBox x:Name="LogBox" Height="116" IsReadOnly="True" BorderThickness="0"
                 Background="#0F1014" Foreground="#9AA0A6" FontFamily="Consolas" FontSize="11"
                 Padding="6,4" VerticalScrollBarVisibility="Auto" TextWrapping="NoWrap"/>
      </StackPanel>
    </Border>
    <ScrollViewer VerticalScrollBarVisibility="Auto">
      <StackPanel x:Name="StageList" Margin="12,12,12,4"/>
    </ScrollViewer>
  </DockPanel>
</Window>
'@

$reader = New-Object System.Xml.XmlNodeReader $xaml
$win    = [Windows.Markup.XamlReader]::Load($reader)

$HeaderTitle = $win.FindName('HeaderTitle')
$HeaderSub   = $win.FindName('HeaderSub')
$LogBox      = $win.FindName('LogBox')
$StageList   = $win.FindName('StageList')

# Shared state the button handlers read (refreshed every tick)
$script:reviewPath = $null
$script:approveCmd = $null
$script:rows       = @{}   # stage id -> control refs
$script:built      = $false

# ── Helpers ──────────────────────────────────────────────────────────
function Parse-Iso([string]$s) {
  if ([string]::IsNullOrWhiteSpace($s)) { return $null }
  try { return ([datetime]::Parse($s, [cultureinfo]::InvariantCulture,
        [System.Globalization.DateTimeStyles]::RoundtripKind)).ToUniversalTime() }
  catch { return $null }
}
function Format-Span([string]$startIso, [string]$endIso) {
  $start = Parse-Iso $startIso
  if (-not $start) { return '' }
  $end = if ($endIso) { Parse-Iso $endIso } else { [datetime]::UtcNow }
  if (-not $end) { $end = [datetime]::UtcNow }
  $s = $end - $start
  if ($s.Ticks -lt 0) { $s = [TimeSpan]::Zero }
  if ($s.TotalHours -ge 1) { return ('{0}:{1:00}:{2:00}' -f [int]$s.TotalHours, $s.Minutes, $s.Seconds) }
  return ('{0}:{1:00}' -f [int]$s.TotalMinutes, $s.Seconds)
}
function Brush([string]$hex) { return (New-Object Windows.Media.BrushConverter).ConvertFromString($hex) }

# Build one stage card and stash its controls
function New-StageRow($stage) {
  $card = New-Object Windows.Controls.Border
  $card.Background = Brush $COL.card
  $card.CornerRadius = '6'
  $card.Padding = '12,10'
  $card.Margin = '0,0,0,8'

  $stack = New-Object Windows.Controls.StackPanel

  $head = New-Object Windows.Controls.DockPanel
  $elapsed = New-Object Windows.Controls.TextBlock
  $elapsed.Foreground = Brush $COL.muted; $elapsed.FontSize = 11
  $elapsed.FontFamily = 'Consolas'; $elapsed.VerticalAlignment = 'Center'
  [Windows.Controls.DockPanel]::SetDock($elapsed, 'Right')
  $icon = New-Object Windows.Controls.TextBlock
  $icon.FontSize = 14; $icon.Width = 22; $icon.VerticalAlignment = 'Center'
  $label = New-Object Windows.Controls.TextBlock
  $label.Foreground = Brush $COL.text; $label.FontSize = 13; $label.FontWeight = 'SemiBold'
  $label.VerticalAlignment = 'Center'
  $head.Children.Add($elapsed) | Out-Null
  $head.Children.Add($icon) | Out-Null
  $head.Children.Add($label) | Out-Null
  $stack.Children.Add($head) | Out-Null

  $detail = New-Object Windows.Controls.TextBlock
  $detail.Foreground = Brush $COL.muted; $detail.FontSize = 11
  $detail.Margin = '22,3,0,0'; $detail.TextWrapping = 'Wrap'
  $stack.Children.Add($detail) | Out-Null

  $bar = New-Object Windows.Controls.ProgressBar
  $bar.Height = 5; $bar.Margin = '22,8,0,0'; $bar.Background = Brush '#1E1F26'
  $bar.BorderThickness = '0'; $bar.Foreground = Brush $COL.running
  $stack.Children.Add($bar) | Out-Null

  # Review gate gets action buttons (hidden unless awaiting)
  $btns = New-Object Windows.Controls.StackPanel
  $btns.Orientation = 'Horizontal'; $btns.Margin = '22,10,0,2'; $btns.Visibility = 'Collapsed'
  $openBtn = New-Object Windows.Controls.Button
  $openBtn.Content = 'Open spell-check'; $openBtn.Padding = '10,4'; $openBtn.Margin = '0,0,8,0'; $openBtn.Cursor = 'Hand'
  $apprBtn = New-Object Windows.Controls.Button
  $apprBtn.Content = 'Approve & apply'; $apprBtn.Padding = '10,4'; $apprBtn.Cursor = 'Hand'
  $openBtn.Add_Click({ if ($script:reviewPath -and (Test-Path $script:reviewPath)) { Start-Process $script:reviewPath } })
  $apprBtn.Add_Click({
    if ($script:approveCmd -and (Test-Path $script:approveCmd)) {
      Start-Process -FilePath $script:approveCmd
      $this.IsEnabled = $false; $this.Content = 'Approving' + [char]0x2026
    }
  })
  $btns.Children.Add($openBtn) | Out-Null
  $btns.Children.Add($apprBtn) | Out-Null
  $stack.Children.Add($btns) | Out-Null

  $card.Child = $stack
  return @{ Card = $card; Icon = $icon; Label = $label; Detail = $detail;
            Bar = $bar; Elapsed = $elapsed; Btns = $btns; ApprBtn = $apprBtn }
}

function Update-Row($r, $stage) {
  $state = [string]$stage.state
  $color = if ($COL.ContainsKey($state)) { $COL[$state] } else { $COL.pending }
  $r.Icon.Text = if ($ICON.ContainsKey($state)) { $ICON[$state] } else { $ICON.pending }
  $r.Icon.Foreground = Brush $color
  $r.Label.Text = [string]$stage.label
  $labelHex = if ($state -eq 'pending') { $COL.muted } else { $COL.text }
  $r.Label.Foreground = Brush $labelHex

  if ([string]::IsNullOrWhiteSpace([string]$stage.detail)) {
    $r.Detail.Visibility = 'Collapsed'
  } else {
    $r.Detail.Visibility = 'Visible'; $r.Detail.Text = [string]$stage.detail
  }

  switch ($state) {
    'running'  { $r.Bar.Visibility='Visible'; $r.Bar.IsIndeterminate=$true;  $r.Bar.Foreground=Brush $COL.running }
    'done'     { $r.Bar.Visibility='Visible'; $r.Bar.IsIndeterminate=$false; $r.Bar.Value=100; $r.Bar.Foreground=Brush $COL.done }
    'failed'   { $r.Bar.Visibility='Visible'; $r.Bar.IsIndeterminate=$false; $r.Bar.Value=100; $r.Bar.Foreground=Brush $COL.failed }
    default    { $r.Bar.Visibility='Collapsed'; $r.Bar.IsIndeterminate=$false }
  }

  if ($state -eq 'running')   { $r.Elapsed.Text = Format-Span $stage.startedAt $null }
  elseif ($state -eq 'done')  { $r.Elapsed.Text = Format-Span $stage.startedAt $stage.endedAt }
  else                        { $r.Elapsed.Text = '' }

  # Review-gate buttons only while awaiting
  $r.Btns.Visibility = if ($state -eq 'awaiting') { 'Visible' } else { 'Collapsed' }
  if ($state -eq 'awaiting') { $r.ApprBtn.IsEnabled = $true; $r.ApprBtn.Content = 'Approve & apply' }
}

function Read-Json([string]$path) {
  try {
    if (-not (Test-Path $path)) { return $null }
    $raw = Get-Content -LiteralPath $path -Raw -ErrorAction Stop
    if ([string]::IsNullOrWhiteSpace($raw)) { return $null }
    return $raw | ConvertFrom-Json -ErrorAction Stop
  } catch { return $null }   # mid-write race: keep last frame, retry next tick
}

function Refresh {
  $st = Read-Json $statusFile

  if (-not $st) {
    $HeaderSub.Text = 'Idle ' + [char]0x2014 + ' watching for a new recording'
    $win.Title = 'WTFF Pipeline'
    Tail-Log
    return
  }

  # Build rows once (order/labels come straight from the JSON)
  if (-not $script:built) {
    $StageList.Children.Clear(); $script:rows = @{}
    foreach ($stage in $st.stages) {
      $row = New-StageRow $stage
      $script:rows[[string]$stage.id] = $row
      $StageList.Children.Add($row.Card) | Out-Null
    }
    $script:built = $true
  }

  $script:reviewPath = $st.reviewPath
  $script:approveCmd = $st.approveCmd

  foreach ($stage in $st.stages) {
    $r = $script:rows[[string]$stage.id]
    if ($r) { Update-Row $r $stage }
  }

  # ── Header: honest overall state ──
  $failed   = $st.stages | Where-Object { $_.state -eq 'failed' } | Select-Object -First 1
  $review   = $st.stages | Where-Object { $_.id -eq 'review' } | Select-Object -First 1
  $running  = $st.stages | Where-Object { $_.state -eq 'running' -and $_.work } | Select-Object -First 1
  $workDone = ($st.stages | Where-Object { $_.work -and $_.state -eq 'done' }).Count
  $sess     = if ($st.session) { "Session $($st.session)  " + [char]0x00B7 + "  " } else { '' }

  if ($failed) {
    $sub = 'Failed at ' + [string]$failed.label
  } elseif ($review -and $review.state -eq 'awaiting') {
    $sub = 'Awaiting your review ' + [char]0x2014 + ' approve when ready'
  } elseif ($workDone -ge 4) {
    $sub = 'Complete ' + [char]0x2713 + ' synced + pushed'
  } elseif ($running) {
    $n = if ($STEP_NO.ContainsKey([string]$running.id)) { $STEP_NO[[string]$running.id] } else { '?' }
    $sub = "Step $n of 4  " + [char]0x00B7 + "  " + [string]$running.label
  } else {
    $sub = 'Working' + [char]0x2026
  }

  $HeaderSub.Text  = $sess + $sub
  $HeaderTitle.Text = if ($st.session) { "WTFF Pipeline  " + [char]0x00B7 + "  S$($st.session)" } else { 'WTFF Pipeline' }
  # Taskbar button text reflects state even when minimized
  $win.Title = 'WTFF ' + [char]0x00B7 + ' ' + $sub

  Tail-Log
}

function Tail-Log {
  try {
    if (-not (Test-Path $logFile)) { return }
    $lines = Get-Content -LiteralPath $logFile -Tail 18 -ErrorAction Stop
    $text  = ($lines -join "`r`n")
    if ($LogBox.Text -ne $text) { $LogBox.Text = $text; $LogBox.ScrollToEnd() }
  } catch {}
}

# ── Poll loop ────────────────────────────────────────────────────────
$timer = New-Object Windows.Threading.DispatcherTimer
$timer.Interval = [TimeSpan]::FromMilliseconds(750)
$timer.Add_Tick({ Refresh })
$timer.Start()

$win.Add_Closed({ $timer.Stop(); try { $mutex.ReleaseMutex() } catch {} })

Refresh                       # paint immediately, don't wait for first tick

# Self-test hook: WTFF_STATUS_SELFTEST=1 auto-closes after ~2.5s so the window
# can be exercised headlessly in CI/smoke runs. No effect in normal use.
if ($env:WTFF_STATUS_SELFTEST -eq '1') {
  $closer = New-Object Windows.Threading.DispatcherTimer
  $closer.Interval = [TimeSpan]::FromMilliseconds(2500)
  $closer.Add_Tick({ $closer.Stop(); $win.Close() })
  $closer.Start()
}

$win.ShowDialog() | Out-Null
