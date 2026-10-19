// Tests for the WTFF pipeline watcher.  Run:  node --test wtff_pipeline_watch.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const w = require('./wtff_pipeline_watch.js');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'wtff-test-'));

test('detectSpeakers: joint/crossover/Nsp hints, default null', () => {
  assert.strictEqual(w.detectSpeakers('08 101826 WTFF joint.mp3'), 14);
  assert.strictEqual(w.detectSpeakers('X Crossover.mp3'), 14);
  assert.strictEqual(w.detectSpeakers('08 101826 9sp.mp3'), 9);
  assert.strictEqual(w.detectSpeakers('08 101826 WTFF.mp3'), null);
  assert.strictEqual(w.detectSpeakers('disjointed.mp3'), null);
});

test('acquireApproveLock: second live holder is refused', () => {
  const lock = path.join(tmp(), 'approve.lock');
  assert.deepStrictEqual(w.acquireApproveLock(lock, process.pid), { ok: true });
  const other = w.acquireApproveLock(lock, process.pid + 1);
  assert.strictEqual(other.ok, false);
  assert.strictEqual(other.holder.pid, process.pid);
});

test('acquireApproveLock: dead holder is taken over', () => {
  const lock = path.join(tmp(), 'approve.lock');
  fs.writeFileSync(lock, JSON.stringify({ pid: 999999999, startedAt: 'x' }));
  const r = w.acquireApproveLock(lock, process.pid);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.staleReplaced, true);
  assert.strictEqual(JSON.parse(fs.readFileSync(lock, 'utf8')).pid, process.pid);
});

test('acquireApproveLock: unreadable lock file is taken over', () => {
  const lock = path.join(tmp(), 'approve.lock');
  fs.writeFileSync(lock, 'not json');
  assert.strictEqual(w.acquireApproveLock(lock, process.pid).ok, true);
});

test('releaseApproveLock: only removes its own lock', () => {
  const lock = path.join(tmp(), 'approve.lock');
  w.acquireApproveLock(lock, process.pid);
  assert.strictEqual(w.releaseApproveLock(lock, process.pid + 1), false);
  assert.ok(fs.existsSync(lock));
  assert.strictEqual(w.releaseApproveLock(lock, process.pid), true);
  assert.ok(!fs.existsSync(lock));
  assert.strictEqual(w.releaseApproveLock(lock, process.pid), false); // already gone
});

test('parseRollValues: JSON string, array, junk', () => {
  assert.deepStrictEqual(w.parseRollValues('[20, 7]'), [20, 7]);
  assert.deepStrictEqual(w.parseRollValues([2]), [2]);
  assert.strictEqual(w.parseRollValues('oops'), 'oops');
  assert.strictEqual(w.parseRollValues(null), null);
});

const fakeFetch = (status, body, seen) => async (url, opts) => {
  if (seen) { seen.url = url; seen.opts = opts; }
  return { ok: status >= 200 && status < 300, status, json: async () => body };
};

test('fetchSessionRolls: GET only, no user_id requested, values parsed', async () => {
  const seen = {};
  const rows = await w.fetchSessionRolls('2026-10-18',
    fakeFetch(200, [{ character: 'Zarna', total: 7, individual_values: '[2]' }], seen));
  assert.strictEqual(seen.opts.method, 'GET');
  assert.ok(seen.url.includes('session_date=eq.2026-10-18'));
  assert.ok(!/user_id|roll_id/.test(seen.url));
  assert.deepStrictEqual(rows[0].individual_values, [2]);
});

test('fetchSessionRolls: bad date, HTTP error, non-array all throw', async () => {
  await assert.rejects(w.fetchSessionRolls('UNKNOWN', fakeFetch(200, [])), /bad session date/);
  await assert.rejects(w.fetchSessionRolls('2026-10-18', fakeFetch(401, {})), /HTTP 401/);
  await assert.rejects(w.fetchSessionRolls('2026-10-18', fakeFetch(200, { msg: 'x' })), /non-array/);
});

test('writeRollsFile: records success and failure explicitly', async () => {
  const dir = tmp();
  const good = await w.writeRollsFile(dir, '2026-10-18', fakeFetch(200, [{ total: 1 }]));
  assert.strictEqual(good.ok, true);
  assert.strictEqual(good.count, 1);
  const bad = await w.writeRollsFile(dir, '2026-10-18', fakeFetch(500, {}));
  assert.strictEqual(bad.ok, false);
  assert.match(JSON.parse(fs.readFileSync(path.join(dir, 'ddb_rolls.json'), 'utf8')).error, /HTTP 500/);
});

test('convo2Ready: needs handoff.md and exactly one note', () => {
  const root = tmp();
  const pdir = path.join(root, 'S08');
  const sessions = path.join(root, '01-Sessions');
  fs.mkdirSync(pdir); fs.mkdirSync(sessions);
  fs.writeFileSync(path.join(sessions, 'Session 07 — Old.md'), '');
  fs.writeFileSync(path.join(sessions, 'Session 080 — Not It.md'), '');

  let r = w.convo2Ready(pdir, '08', sessions);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.problems.length, 2);

  fs.writeFileSync(path.join(pdir, 'handoff.md'), '');          // empty handoff still fails
  fs.writeFileSync(path.join(sessions, 'Session 08 — There Is Another You.md'), 'x');
  r = w.convo2Ready(pdir, '08', sessions);
  assert.deepStrictEqual(r.problems, ['no S08\\handoff.md from Phase B']);

  fs.writeFileSync(path.join(pdir, 'handoff.md'), '01-Sessions/Session 08 — There Is Another You.md');
  assert.strictEqual(w.convo2Ready(pdir, '08', sessions).ok, true);

  fs.writeFileSync(path.join(sessions, 'Session 08 — Duplicate.md'), 'x');
  r = w.convo2Ready(pdir, '08', sessions);
  assert.strictEqual(r.ok, false);
  assert.match(r.problems[0], /2 Session 08 notes/);
});

test('CLAUDE_FLAGS: git commit allowed, no push, no Supabase', () => {
  assert.match(w.CLAUDE_FLAGS, /--permission-mode acceptEdits/);
  assert.match(w.CLAUDE_FLAGS, /"Bash\(git commit:\*\)"/);
  assert.ok(!/push|pull/.test(w.CLAUDE_FLAGS));
  assert.ok(!/supabase/i.test(w.CLAUDE_FLAGS));
});
