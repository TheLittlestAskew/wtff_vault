@echo off
setlocal
REM Publish-WTFF.cmd - regenerate the public session index, then commit and push.
REM The website reads session notes AND Public Session Index.json directly from
REM this repo's main branch, so a successful push IS the publish.
REM Allow ~5 minutes for CDN cache.
cd /d "%~dp0..\.."

REM --- Step 1: regenerate the public session index -------------------------
REM Added 2026-08-31. Without this the site silently shows stale data: the notes
REM get pushed but the index still describes an older session list.
REM WTFF-SPECIFIC: this index also drives the Map of Artemesia - the blooms, the
REM travel line and the "party is here" pin on where-the-flowers-forget/archive.html.
REM A session note needs `site_location:` pointing at a key in
REM 00-Campaign-Hub\Map Locations.json, or this step fails on purpose rather than
REM dropping the session off the map.
echo Regenerating Public Session Index.json (sessions + map) ...
node "Workflows\scripts\generate_public_session_index.mjs"
if errorlevel 1 (
  echo.
  echo INDEX GENERATION FAILED - nothing has been committed or pushed.
  echo Most likely cause: a session note is missing `site_location`, or its
  echo location has no x/y entry in 00-Campaign-Hub\Map Locations.json.
  echo Fix what it reported above, then rerun this file.
  pause
  exit /b 1
)
echo.

REM --- Step 2: commit and push --------------------------------------------
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
echo Published. Site and map reflect changes within ~5 minutes.
pause
