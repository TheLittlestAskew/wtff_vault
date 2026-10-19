#!/usr/bin/env node
/*
 * Where the Flowers Forget — Pipeline Watcher  (Option B, review checkpoint)
 * ---------------------------------------------------------------------------
 * WATCH MODE (default):  node wtff_pipeline_watch.js
 *   Watches the Recordings folder. When a new .mp3 finishes copying it:
 *     1. refreshes keyterms (if wtff_keyterms_sync.js exists) + party sheets
 *     2. transcribes it (wtff_transcribe\transcribe.js)
 *     3. runs Convo 1 — Phase A (spell-check ONLY) via headless Claude Code
 *     4. STOPS and pings you. Nothing is applied yet.
 *
 * APPROVE MODE:  node wtff_pipeline_watch.js --approve
 *   After you've reviewed (and optionally edited) the spell-check file, this:
 *     5. runs Convo 1 — Phase B (apply corrections + generate the markdown note)
 *     6. runs Convo 2 (propagate across the vault + git commit/push)
 *
 *   Guards (added 2026-10-19 after S08, when a toast approve and a manual approve
 *   ran at the same time and the headless runs couldn't commit or read Supabase):
 *     - only one approve runs at a time (_pipeline\approve.lock)
 *     - this script pre-fetches the session's DDB rolls (read-only GET) into
 *       <pipeline>\SNN\ddb_rolls.json, so headless Claude never touches Supabase
 *     - Convo 2 refuses to start until Phase B wrote SNN\handoff.md and the note
 *     - headless Claude may run git add/commit/push (main only, no force) so it
 *       can bank its handoff
 *
 * TESTS:  node --test wtff_pipeline_watch.test.js
 *
 * Processes one session at a time. Markdown-only — no .docx is produced.
 *
 * Scaffolded 1:1 from ashfall_pipeline_watch.js (WTFF paths/branding).
 *
 * ⚠️ PREREQUISITES before this can run end-to-end:
 *    - A transcriber at Workflows\scripts\wtff_transcribe\transcribe.js
 *      (accepting:  node transcribe.js <mp3> <output.md>).
 *    - The 3 prompt templates in Workflows\Project\Automation\ (copied in as
 *      starting points — tune them for this campaign).
 *    - `npm install chokidar` in this folder, and `claude` on PATH.
 *
 * Requires: Node 18+.
 */

const path = require('path');
const fs = require('fs');
const { spawnSync, spawn } = require('child_process');

// ══════════════════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════════════════
// Vault root derived from this script's location (<vault>\Workflows\scripts\),
// so moving the vault doesn't break it.
const VAULT_ROOT    = path.resolve(__dirname, '..', '..');
const RECORDINGS    = path.join(VAULT_ROOT, 'Session_Sources', 'Recordings');

// Where the transcriber writes the raw transcript.
const RAW_DIR       = path.join(VAULT_ROOT, 'Session_Sources', 'Transcripts', 'Raw_Unedited');

// Canonical session count: "Session NN — Title.md" notes live here.
const SESSIONS_DIR  = path.join(VAULT_ROOT, '01-Sessions');

const PIPELINE_DIR  = path.join(VAULT_ROOT, '_pipeline');                       // scratch / review files
const PROMPTS_DIR   = path.join(VAULT_ROOT, 'Workflows', 'Project', 'Automation'); // the 3 prompt templates

// Transcriber location + entry file (CLI: node transcribe.js <mp3> <output.md>).
// NOTE: create this transcriber before the first real run (see PREREQUISITES).
const TRANSCRIBE_CWD = path.join(VAULT_ROOT, 'Workflows', 'scripts', 'wtff_transcribe');
const TRANSCRIBE_JS  = 'transcribe.js';

// Toast notifier + approve launcher.
const NOTIFY_PS   = path.join(__dirname, 'wtff_notify.ps1');
const APPROVE_CMD = path.join(__dirname, 'Approve-WTFF.cmd');

// Persistent status window (WPF), decoupled via STATUS_FILE.
const STATUS_WIN_PS = path.join(__dirname, 'wtff_status_window.ps1');

const LOG_FILE = path.join(PIPELINE_DIR, 'watcher.log');
const STATUS_FILE = path.join(PIPELINE_DIR, 'status.json');
const LOCK_FILE = path.join(PIPELINE_DIR, 'approve.lock');

// Headless runs can't answer permission prompts, so anything not pre-allowed is
// silently denied. These let Phase B / Convo 2 bank their own work. Push is exact
// match only (no --force); Supabase is NOT allowed (rolls are pre-fetched below).
const ALLOWED_TOOLS = [
  'Bash(git status:*)', 'Bash(git diff:*)', 'Bash(git log:*)', 'Bash(git rev-parse:*)',
  'Bash(git add:*)', 'Bash(git commit:*)',
  'Bash(git pull --rebase origin main)', 'Bash(git push)', 'Bash(git push origin main)',
];
const CLAUDE_FLAGS = '--permission-mode acceptEdits --allowedTools ' +
  ALLOWED_TOOLS.map((t) => `"${t}"`).join(' ');

// Public anon key (already published in ddb_sync_supabase.js). The view is read
// with a GET only; this script never writes to Supabase.
const SUPABASE_URL = 'https://vtrtyagltwdrbastpppl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cnR5YWdsdHdkcmJhc3RwcHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTY5NTAsImV4cCI6MjA5MTkzMjk1MH0.hnpwjHGIqiUN_VmmIkOAAFGGCKsyYgl7AO3FW5vDIeM';
// Columns copied into ddb_rolls.json. user_id / roll_id / id are left out on purpose.
const ROLL_COLUMNS = 'timestamp_iso,character,action,roll_type,roll_kind,dice_notation,individual_values,modifier,total,source';
// ══════════════════════════════════════════════════════════════════

const isWin  = process.platform === 'win32';
const catCmd = isWin ? 'type' : 'cat';

function fileLog(s) {
  try { fs.mkdirSync(PIPELINE_DIR, { recursive: true }); fs.appendFileSync(LOG_FILE, s + '\r\n'); } catch {}
}
const log    = (m) => { const s = `[${new Date().toLocaleTimeString()}] ${m}`; console.log(s); fileLog(s); };
const banner = (m) => { const s = '\n' + '═'.repeat(64) + `\n  ${m}\n` + '═'.repeat(64); console.log(s + '\n'); fileLog(s); };

function toast(title, message, opts = {}) {
  const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', NOTIFY_PS,
                '-Title', title, '-Message', message];
  if (opts.review)  args.push('-ReviewPath',  opts.review);
  if (opts.approve) args.push('-ApprovePath', opts.approve);
  try { spawnSync('powershell.exe', args, { windowsHide: true }); }
  catch (e) { log(`toast failed: ${e.message}`); }
}

function notify(message) {
  banner(message);
  process.stdout.write('\x07');
  toast('WTFF pipeline', message.split('\n')[0]);
}

// ── Status feed for the persistent window ────────────────────────────
const STAGE_DEFS = [
  { id: 'transcribe', label: 'Transcription',                work: true  },
  { id: 'phaseA',     label: 'Spell-check  ·  Convo 1A',     work: true  },
  { id: 'review',     label: 'Your review',                  work: false },
  { id: 'phaseB',     label: 'Apply + notes  ·  Convo 1B',   work: true  },
  { id: 'convo2',     label: 'Propagate + push  ·  Convo 2', work: true  },
  { id: 'publish',    label: 'Publish to site',                work: true  },
];
const nowIso = () => new Date().toISOString();

function blankStatus(session) {
  return {
    session: session || '',
    startedAt: nowIso(),
    updatedAt: nowIso(),
    stages: STAGE_DEFS.map((s) => ({
      id: s.id, label: s.label, work: s.work,
      state: 'pending', detail: '', startedAt: '', endedAt: '',
    })),
  };
}
function readStatus() {
  try { return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8')); } catch { return null; }
}
function writeStatus(s) {
  s.updatedAt = nowIso();
  try { fs.mkdirSync(PIPELINE_DIR, { recursive: true }); fs.writeFileSync(STATUS_FILE, JSON.stringify(s, null, 2)); } catch {}
}
function initStatus(session) { const s = blankStatus(session); writeStatus(s); return s; }

function setStage(id, state, detail, extra) {
  const s = readStatus() || blankStatus('');
  const st = s.stages.find((x) => x.id === id);
  if (st) {
    st.state = state;
    if (detail !== undefined) st.detail = detail;
    if (state === 'running' && !st.startedAt) st.startedAt = nowIso();
    if (state === 'done' || state === 'failed') st.endedAt = nowIso();
  }
  if (extra) Object.assign(s, extra);
  writeStatus(s);
}

function launchStatusWindow() {
  if (!fs.existsSync(STATUS_WIN_PS)) return;
  try {
    const child = spawn('powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', STATUS_WIN_PS],
      { detached: true, stdio: 'ignore', windowsHide: true });
    child.unref();
  } catch (e) { log(`status window launch failed: ${e.message}`); }
}

function newestTranscript(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter((f) => /\.(md|txt)$/i.test(f))
    .map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return files.length ? path.join(dir, files[0].f) : null;
}

// Derive session date from the recording filename; next NN from 01-Sessions.
function nextSession(mp3) {
  const base = path.basename(mp3);
  const dm = base.match(/(\d{6})/); // first 6-digit run = MMddyy
  const mmddyy = dm ? dm[1] : 'UNKNOWN';
  const iso = mmddyy !== 'UNKNOWN'
    ? `20${mmddyy.slice(4, 6)}-${mmddyy.slice(0, 2)}-${mmddyy.slice(2, 4)}`
    : 'UNKNOWN';
  let maxNn = 0;
  if (fs.existsSync(SESSIONS_DIR)) {
    for (const f of fs.readdirSync(SESSIONS_DIR)) {
      const m = f.match(/Session\s+(\d+)/i);
      if (m) maxNn = Math.max(maxNn, parseInt(m[1], 10));
    }
  }
  return { nn: String(maxNn + 1).padStart(2, '0'), mmddyy, iso };
}

function analyzeSpellcheck(file, threshold = 60) {
  let total = 0, low = 0;
  if (!fs.existsSync(file)) return { total, low };
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 4) continue;
    if (cells[0].toLowerCase() === 'original' || /^:?-{2,}/.test(cells[0])) continue;
    total++;
    const pct = cells[3].match(/(\d{1,3})\s*%/);
    if (pct && parseInt(pct[1], 10) <= threshold) low++;
  }
  return { total, low };
}

function buildPrompt(templateName, vars) {
  let tpl = fs.readFileSync(path.join(PROMPTS_DIR, templateName), 'utf8');
  for (const [k, v] of Object.entries(vars)) tpl = tpl.split(`{{${k}}}`).join(String(v));
  const dir = vars.PIPELINE_DIR || PIPELINE_DIR;
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `_prompt_${templateName.replace(/\W+/g, '_')}.txt`);
  fs.writeFileSync(out, tpl);
  return out;
}

function runClaude(promptFile) {
  const cmd = `${catCmd} "${promptFile}" | claude -p ${CLAUDE_FLAGS}`;
  const r = spawnSync(cmd, { cwd: VAULT_ROOT, shell: true, stdio: 'inherit' });
  return r.status === 0;
}

// ── WATCH-MODE handler ──
// Joint/crossover sessions run both the WtFF and WtFR parties (~14 speakers); a regular
// WtFF session is ~7 (the transcriber's default). The transcriber accepts `--speakers N`,
// but the watcher must tell it when a recording is a joint session. Detect a hint from the
// recording filename: an explicit "<N>sp"/"<N>speakers" token, or the words
// "joint"/"crossover". Returns a speaker count to pass through, or null to use the default.
function detectSpeakers(mp3) {
  const base = path.basename(mp3).toLowerCase();
  const m = base.match(/(\d{1,2})\s*(?:sp|speakers?)\b/);
  if (m) return parseInt(m[1], 10);
  if (/\b(joint|crossover)\b/.test(base)) return 14;
  return null;
}

function processRecording(mp3) {
  banner(`New recording: ${path.basename(mp3)}`);

  const sess = nextSession(mp3);
  initStatus(sess.nn);
  launchStatusWindow();
  toast('WTFF pipeline', `Processing ${path.basename(mp3)} — transcribing…`);

  fs.mkdirSync(RAW_DIR, { recursive: true });
  const transcriptOut = path.join(RAW_DIR, `${sess.nn}-${sess.mmddyy}_raw_transcript.md`);

  const keytermsScript = path.join(TRANSCRIBE_CWD, 'wtff_keyterms_sync.js');
  if (fs.existsSync(keytermsScript)) {
    log('Refreshing keyterms from vault…');
    spawnSync('node "wtff_keyterms_sync.js"', { cwd: TRANSCRIBE_CWD, shell: true, stdio: 'inherit' });
  }

  // Refresh party sheets from D&D Beyond (non-fatal). Run `node ddb_party_sync.js
  // --discover` once after session 1 to populate the roster; this keeps it fresh.
  const partyScript = path.join(__dirname, 'ddb_party_sync.js');
  if (fs.existsSync(partyScript)) {
    log('Refreshing party sheets from D&D Beyond…');
    try {
      spawnSync('node "ddb_party_sync.js"', { cwd: __dirname, shell: true, stdio: 'inherit' });
    } catch (e) { log(`Party sheet sync skipped: ${e.message}`); }
  }

  log(`Transcribing S${sess.nn} (${sess.mmddyy})… (this can take several minutes)`);
  setStage('transcribe', 'running', 'AssemblyAI — uploading & transcribing…');
  const spk = detectSpeakers(mp3);
  if (spk) log(`Joint/crossover hint in filename — transcribing with ${spk} speakers.`);
  const spkArg = spk ? `--speakers ${spk} ` : '';
  const t = spawnSync(`node "${TRANSCRIBE_JS}" ${spkArg}"${mp3}" "${transcriptOut}"`,
    { cwd: TRANSCRIBE_CWD, shell: true, stdio: 'inherit' });
  if (t.status !== 0) { setStage('transcribe', 'failed', 'See watcher.log'); return notify('Transcription FAILED — see _pipeline\\watcher.log. (Is wtff_transcribe\\transcribe.js created?)'); }

  const transcript = fs.existsSync(transcriptOut) ? transcriptOut : newestTranscript(RAW_DIR);
  if (!transcript) { setStage('transcribe', 'failed', 'No transcript produced'); return notify(`No transcript produced in ${RAW_DIR} — check the transcriber (watcher.log).`); }
  setStage('transcribe', 'done', path.basename(transcript));

  const pdir = path.join(PIPELINE_DIR, `S${sess.nn}`);
  fs.mkdirSync(pdir, { recursive: true });

  log(`Running Convo 1 — Phase A (spell-check) for S${sess.nn}…`);
  setStage('phaseA', 'running', 'Proposing spelling corrections…');
  const prompt = buildPrompt('convo1_phaseA.md', {
    TRANSCRIPT_PATH: transcript, NN: sess.nn, DATE: sess.mmddyy,
    ISO_DATE: sess.iso, PIPELINE_DIR: pdir,
  });
  const ok = runClaude(prompt);

  fs.writeFileSync(path.join(PIPELINE_DIR, 'state.json'),
    JSON.stringify({ pendingFolder: pdir, transcript, ...sess, stage: 'awaiting_approval' }, null, 2));

  if (!ok) { setStage('phaseA', 'failed', 'See watcher.log'); return notify('Phase A FAILED — see _pipeline\\watcher.log.'); }

  const spellcheck = path.join(pdir, 'spellcheck.md');
  const { total, low } = analyzeSpellcheck(spellcheck, 60);
  setStage('phaseA', 'done', `${total} correction${total === 1 ? '' : 's'} proposed`);
  setStage('review', 'awaiting', `${total} proposed · ${low} ≤60% confidence`,
    { reviewPath: spellcheck, approveCmd: APPROVE_CMD });

  banner(`READY FOR REVIEW — Session ${sess.nn}`);
  process.stdout.write('\x07');
  const msg = `Session ${sess.nn}: ${total} proposed correction${total === 1 ? '' : 's'}` +
              `, ${low} at/under 60% confidence. Review them, or approve to apply.`;
  toast(`WTFF S${sess.nn} — ready for review`, msg, { review: spellcheck, approve: APPROVE_CMD });
  log(`READY — review: ${spellcheck} | approve: double-click ${APPROVE_CMD} (or run --approve)`);
}

// ── APPROVE-MODE handler ──
// ── Publish: regenerate the site index, then commit + push ──────────────
// Added 2026-08-31. The website reads Public Session Index.json from this
// repo's main branch at request time - it is the ONLY thing the site reads for
// the session list. Pushing the notes without regenerating the index leaves the
// site silently showing the previous session, which is exactly what happened to
// SITL S23. This runs as deterministic code so it cannot be forgotten.
function publishToSite(nn) {
  const gen = path.join(VAULT_ROOT, 'Workflows', 'scripts', 'generate_public_session_index.mjs');
  if (!fs.existsSync(gen)) { log(`publish: generator missing at ${gen}`); return false; }

  log('publish: regenerating Public Session Index.json…');
  const g = spawnSync(process.execPath, [gen], { cwd: VAULT_ROOT, stdio: 'inherit' });
  if (g.status !== 0) { log('publish: index generation FAILED — nothing committed or pushed'); return false; }

  const git = (...a) => spawnSync('git', a, { cwd: VAULT_ROOT, stdio: 'inherit' });
  git('add', '-A');
  if (spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: VAULT_ROOT }).status === 0) {
    log('publish: nothing to commit — site already current');
    return true;
  }
  if (git('commit', '-m', `notes: publish session ${nn}`).status !== 0) { log('publish: commit FAILED'); return false; }
  if (git('pull', '--rebase', 'origin', 'main').status !== 0) { log('publish: pull --rebase FAILED — resolve conflicts and rerun'); return false; }
  if (git('push', 'origin', 'main').status !== 0) { log('publish: push FAILED — check network/credentials'); return false; }
  log('publish: pushed — site reflects the change within ~5 minutes');
  return true;
}

// ── Approve guards ──────────────────────────────────────────────────────
// One approve at a time. The toast button and a manual run collided on S08
// (2026-10-19): two Phase B runs edited the same transcript.
function isAlive(pid) {
  try { process.kill(pid, 0); return true; }
  catch (e) { return e.code === 'EPERM'; } // EPERM = exists, owned by someone else
}

function acquireApproveLock(lockFile = LOCK_FILE, pid = process.pid) {
  fs.mkdirSync(path.dirname(lockFile), { recursive: true });
  const body = (extra) => JSON.stringify({ pid, startedAt: nowIso(), ...extra });
  try {
    fs.writeFileSync(lockFile, body(), { flag: 'wx' });
    return { ok: true };
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
  let holder = null;
  try { holder = JSON.parse(fs.readFileSync(lockFile, 'utf8')); } catch { holder = null; }
  if (holder && Number.isInteger(holder.pid) && holder.pid !== pid && isAlive(holder.pid)) {
    return { ok: false, holder };
  }
  // Holder is gone (crash, closed window) or the file is unreadable: take it over.
  fs.writeFileSync(lockFile, body({ replacedStale: holder }));
  return { ok: true, staleReplaced: true, previous: holder };
}

function releaseApproveLock(lockFile = LOCK_FILE, pid = process.pid) {
  let holder = null;
  try { holder = JSON.parse(fs.readFileSync(lockFile, 'utf8')); } catch { return false; }
  if (!holder || holder.pid !== pid) return false; // someone else's lock: leave it
  fs.unlinkSync(lockFile);
  return true;
}

// The DDB archive stores individual_values as a JSON string ("[20, 7]").
function parseRollValues(v) {
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return v; }
}

// Read-only GET of this session's DDB rolls. Throws on any failure; the caller
// records the error in ddb_rolls.json so Phase B reports it instead of guessing.
async function fetchSessionRolls(iso, fetchImpl = fetch) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) throw new Error(`bad session date "${iso}"`);
  const url = `${SUPABASE_URL}/rest/v1/wtff_session_rolls?session_date=eq.${iso}` +
              `&select=${ROLL_COLUMNS}&order=timestamp_iso.asc`;
  const res = await fetchImpl(url, {
    method: 'GET',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase returned HTTP ${res.status}`);
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error('Supabase returned a non-array body');
  return rows.map((r) => ({ ...r, individual_values: parseRollValues(r.individual_values) }));
}

async function writeRollsFile(pdir, iso, fetchImpl = fetch) {
  const out = path.join(pdir, 'ddb_rolls.json');
  let payload;
  try {
    const rolls = await fetchSessionRolls(iso, fetchImpl);
    payload = { ok: true, session_date: iso, fetchedAt: nowIso(), count: rolls.length, rolls };
  } catch (e) {
    payload = { ok: false, session_date: iso, fetchedAt: nowIso(), error: e.message };
  }
  fs.mkdirSync(pdir, { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  return payload;
}

// Convo 2 needs Phase B's handoff plus exactly one session note. Missing either
// means Phase B didn't finish; two notes means two runs wrote one each.
function convo2Ready(pdir, nn, sessionsDir = SESSIONS_DIR) {
  const problems = [];
  const handoff = path.join(pdir, 'handoff.md');
  if (!fs.existsSync(handoff) || fs.statSync(handoff).size === 0) {
    problems.push(`no ${path.basename(pdir)}\\handoff.md from Phase B`);
  }
  const re = new RegExp(`^Session\\s+0*${parseInt(nn, 10)}\\b.*\\.md$`, 'i');
  const notes = fs.existsSync(sessionsDir) ? fs.readdirSync(sessionsDir).filter((f) => re.test(f)) : [];
  if (notes.length === 0) problems.push(`no "Session ${nn} — …" note in 01-Sessions`);
  if (notes.length > 1) problems.push(`${notes.length} Session ${nn} notes (${notes.join(', ')}); keep one`);
  return { ok: problems.length === 0, problems, notes };
}

async function approve() {
  const statePath = path.join(PIPELINE_DIR, 'state.json');
  if (!fs.existsSync(statePath)) return log('No pending session to approve.');

  const lock = acquireApproveLock();
  if (!lock.ok) {
    process.exitCode = 1;
    return notify(`Approve is already running (pid ${lock.holder.pid}, started ${lock.holder.startedAt}). ` +
                  'Not starting a second one.');
  }
  if (lock.staleReplaced) log(`Replaced a stale approve lock (${JSON.stringify(lock.previous)}).`);
  try { await runApproval(statePath); }
  finally { releaseApproveLock(); }
}

async function runApproval(statePath) {
  const st = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const pdir = st.pendingFolder;

  let s = readStatus();
  if (!s || s.session !== st.nn) {
    s = blankStatus(st.nn);
    for (const id of ['transcribe', 'phaseA']) s.stages.find((x) => x.id === id).state = 'done';
    writeStatus(s);
  }
  launchStatusWindow();
  setStage('review', 'done', 'Approved');

  banner(`Approving Session ${st.nn} — Phase B (apply + notes), then Convo 2`);

  log(`Fetching the DDB roll archive for ${st.iso} (read-only)…`);
  const rolls = await writeRollsFile(pdir, st.iso);
  if (rolls.ok) log(`DDB rolls: ${rolls.count} for ${st.iso} -> ${path.join(pdir, 'ddb_rolls.json')}`);
  else log(`⚠️ DDB roll fetch FAILED (${rolls.error}). Phase B will flag the archive as unchecked.`);

  log('Convo 1 — Phase B: applying corrections + generating the session note…');
  setStage('phaseB', 'running', 'Applying corrections + writing the note…');
  const pB = buildPrompt('convo1_phaseB_apply.md', {
    TRANSCRIPT_PATH: st.transcript, NN: st.nn, DATE: st.mmddyy,
    ISO_DATE: st.iso, PIPELINE_DIR: pdir,
  });
  if (!runClaude(pB)) { setStage('phaseB', 'failed', 'See console output above'); return notify('Phase B FAILED — see console output above.'); }
  setStage('phaseB', 'done');

  const ready = convo2Ready(pdir, st.nn);
  if (!ready.ok) {
    setStage('convo2', 'failed', ready.problems.join('; '));
    process.exitCode = 1;
    return notify(`Convo 2 NOT started: ${ready.problems.join('; ')}. Finish Phase B, then re-run approve.`);
  }

  log('Convo 2: propagating across the vault + git push…');
  setStage('convo2', 'running', 'Propagating across the vault + git push…');
  const p2 = buildPrompt('convo2_propagate.md', {
    NN: st.nn, ISO_DATE: st.iso, PIPELINE_DIR: pdir,
  });
  if (!runClaude(p2)) { setStage('convo2', 'failed', 'See console output above'); return notify('Convo 2 FAILED — see console output above.'); }
  setStage('convo2', 'done', 'Synced + pushed');

  log('Publish: regenerating the site index + pushing…');
  setStage('publish', 'running', 'Regenerating index + pushing…');
  if (!publishToSite(st.nn)) {
    setStage('publish', 'failed', 'See watcher.log');
    process.exitCode = 1;
    return notify('Publish FAILED — the WEBSITE HAS NOT been updated. See _pipeline\\watcher.log.');
  }
  setStage('publish', 'done', 'Live on rectrixcaedere.com');

  st.stage = 'complete';
  fs.writeFileSync(statePath, JSON.stringify(st, null, 2));
  notify(`Session ${st.nn} fully synced to the vault and pushed to GitHub.`);
}

module.exports = {
  detectSpeakers, nextSession, analyzeSpellcheck, isAlive, acquireApproveLock,
  releaseApproveLock, parseRollValues, fetchSessionRolls, writeRollsFile, convo2Ready,
  CLAUDE_FLAGS,
};

// ── MAIN ──
if (require.main === module) main();

function main() {
if (process.argv.includes('--approve')) {
  approve()
    .then(() => process.exit())
    .catch((e) => { log(`approve crashed: ${e.stack || e.message}`); process.exit(1); });
  return;
}

const chokidar = require('chokidar');
fs.mkdirSync(PIPELINE_DIR, { recursive: true });
banner('WTFF Pipeline Watcher — Option B  (watching for new .mp3)');
log(`Watching: ${RECORDINGS}`);
log('Leave this window open. Ctrl+C to stop.');

const seen = new Set();
chokidar
  .watch(RECORDINGS, {
    ignoreInitial: true,
    depth: 0,
    awaitWriteFinish: { stabilityThreshold: 5000, pollInterval: 500 },
  })
  .on('add', (p) => {
    if (!p.toLowerCase().endsWith('.mp3')) return;
    if (seen.has(p)) return;
    seen.add(p);
    processRecording(p);
  });
}
