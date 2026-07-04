@echo off
setlocal
REM Publish-WTFF.cmd - commit all note changes and push to GitHub.
REM The website reads session notes directly from this repo's main branch,
REM so a successful push IS the publish. Allow ~5 minutes for CDN cache.
cd /d "%~dp0..\.."
git add -A
git diff --cached --quiet
if %errorlevel%==0 (
  echo Nothing to publish - no changes since last push.
  pause
  exit /b 0
)
git commit -m "notes: publish %DATE% %TIME%"
git pull --rebase origin main
if errorlevel 1 (
  echo PULL FAILED - resolve conflicts in Obsidian Git, then rerun this file.
  pause
  exit /b 1
)
git push origin main
if errorlevel 1 (
  echo PUSH FAILED - check network/credentials and rerun.
  pause
  exit /b 1
)
echo Published. Site reflects changes within ~5 minutes.
pause
