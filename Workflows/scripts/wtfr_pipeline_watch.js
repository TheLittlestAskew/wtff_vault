#!/usr/bin/env node
/*
 * Where the Flowers Forget — Pipeline Watcher  (Option B, review checkpoint)
 * ---------------------------------------------------------------------------
 * WATCH MODE (default):  node wtfr_pipeline_watch.js
 *   Watches the Recordings folder. When a new .mp3 finishes copying it:
 *     1. refreshes keyterms (if wtfr_keyterms_sync.js exists) + party sheets
 *     2. transcribes it (wtfr_transcribe\transcribe.js)
 *     3. runs Convo 1 — Phase A (spell-check ONLY) via headless Claude Code
 *     4. STOPS and pings you. Nothing is applied yet.
 *
 * APPROVE MODE:  node wtfr_pipeline_watch.js --approve
 *   After you've reviewed (and optionally edited) the spell-check file, this:
 *     5. runs Convo 1 — Phase B (apply corrections + generate the markdown note)
 *     6. runs Convo 2 (propagate across the vault + git commit/push)
 *
 * Processes one session at a time. Markdown-only — no .docx is produced.
 *
 * Scaffolded 1:1 from ashfall_pipeline_watch.js (WTFR paths/branding).
 *
 * ⚠️ PREREQUISITES before this can run end-to-end:
 *    - A transcriber at Workflows\scripts\wtfr_transcribe\transcribe.js
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
const chokidar = require('chokidar');

// ══════════════════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════════════════
const VAULT_ROOT    = 'C:\\Users\\theli\\wtfr_vault';
const RECORDINGS    = path.join(VAULT_ROOT, 'Session_Sources', 'Recordings');

// Where the transcriber writes the raw transcript.
const RAW_DIR       = path.join(VAULT_ROOT, 'Session_Sources', 'Transcripts', 'Raw_Unedited');

// Canonical session count: "Session NN — Title.md" notes live here.
const SESSIONS_DIR  = path.join(VAULT_ROOT, '01-Sessions');

const PIPELINE_DIR  = path.join(VAULT_ROOT, '_pipeline');                       // scratch / review files
const PROMPTS_DIR   = path.join(VAULT_ROOT, 'Workflows', 'Project', 'Automation'); // the 3 prompt templates

// Transcriber location + entry file (CLI: node transcribe.js <mp3> <output.md>).
// NOTE: create this transcriber before the first real run (see PREREQUISITES).
const TRANSCRIBE_CWD = path.join(VAULT_ROOT, 'Workflows', 'scripts', 'wtfr_transcribe');
const TRANSCRIBE_JS  = 'transcribe.js';

// Toast notifier + approve launcher.
const NOTIFY_PS   = path.join(__dirname, 'wtfr_notify.ps1');
const APPROVE_CMD = path.join(__dirname, 'Approve-WTFR.cmd');

// Persistent status window (WPF), decoupled via STATUS_FILE.
const STATUS_WIN_PS = path.join(__dirname, 'wtfr_status_window.ps1');

const LOG_FILE = path.join(PIPELINE_DIR, 'watcher.log');
const STATUS_FILE = path.join(PIPELINE_DIR, 'status.json');

const CLAUDE_FLAGS = '--permission-mode acceptEdits';
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
  toast('WTFR pipeline', message.split('\n')[0]);
}

// ── Status feed for the persistent window ────────────────────────────
const STAGE_DEFS = [
  { id: 'transcribe', label: 'Transcription',                work: true  },
  { id: 'phaseA',     label: 'Spell-check  ·  Convo 1A',     work: true  },
  { id: 'review',     label: 'Your review',                  work: false },
  { id: 'phaseB',     label: 'Apply + notes  ·  Convo 1B',   work: true  },
  { id: 'convo2',     label: 'Propagate + push  ·  Convo 2', work: true  },
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
function processRecording(mp3) {
  banner(`New recording: ${path.basename(mp3)}`);

  const sess = nextSession(mp3);
  initStatus(sess.nn);
  launchStatusWindow();
  toast('WTFR pipeline', `Processing ${path.basename(mp3)} — transcribing…`);

  fs.mkdirSync(RAW_DIR, { recursive: true });
  const transcriptOut = path.join(RAW_DIR, `${sess.nn}-${sess.mmddyy}_raw_transcript.md`);

  const keytermsScript = path.join(TRANSCRIBE_CWD, 'wtfr_keyterms_sync.js');
  if (fs.existsSync(keytermsScript)) {
    log('Refreshing keyterms from vault…');
    spawnSync('node "wtfr_keyterms_sync.js"', { cwd: TRANSCRIBE_CWD, shell: true, stdio: 'inherit' });
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
  const t = spawnSync(`node "${TRANSCRIBE_JS}" "${mp3}" "${transcriptOut}"`,
    { cwd: TRANSCRIBE_CWD, shell: true, stdio: 'inherit' });
  if (t.status !== 0) { setStage('transcribe', 'failed', 'See watcher.log'); return notify('Transcription FAILED — see _pipeline\\watcher.log. (Is wtfr_transcribe\\transcribe.js created?)'); }

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
  toast(`WTFR S${sess.nn} — ready for review`, msg, { review: spellcheck, approve: APPROVE_CMD });
  log(`READY — review: ${spellcheck} | approve: double-click ${APPROVE_CMD} (or run --approve)`);
}

// ── APPROVE-MODE handler ──
function approve() {
  const statePath = path.join(PIPELINE_DIR, 'state.json');
  if (!fs.existsSync(statePath)) return log('No pending session to approve.');
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

  log('Convo 1 — Phase B: applying corrections + generating the session note…');
  setStage('phaseB', 'running', 'Applying corrections + writing the note…');
  const pB = buildPrompt('convo1_phaseB_apply.md', {
    TRANSCRIPT_PATH: st.transcript, NN: st.nn, DATE: st.mmddyy,
    ISO_DATE: st.iso, PIPELINE_DIR: pdir,
  });
  if (!runClaude(pB)) { setStage('phaseB', 'failed', 'See console output above'); return notify('Phase B FAILED — see console output above.'); }
  setStage('phaseB', 'done');

  log('Convo 2: propagating across the vault + git push…');
  setStage('convo2', 'running', 'Propagating across the vault + git push…');
  const p2 = buildPrompt('convo2_propagate.md', {
    NN: st.nn, ISO_DATE: st.iso, PIPELINE_DIR: pdir,
  });
  if (!runClaude(p2)) { setStage('convo2', 'failed', 'See console output above'); return notify('Convo 2 FAILED — see console output above.'); }
  setStage('convo2', 'done', 'Synced + pushed');

  st.stage = 'complete';
  fs.writeFileSync(statePath, JSON.stringify(st, null, 2));
  notify(`Session ${st.nn} fully synced to the vault and pushed to GitHub.`);
}

// ── MAIN ──
if (process.argv.includes('--approve')) { approve(); process.exit(0); }

fs.mkdirSync(PIPELINE_DIR, { recursive: true });
banner('WTFR Pipeline Watcher — Option B  (watching for new .mp3)');
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
