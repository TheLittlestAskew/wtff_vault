#!/usr/bin/env node
/**
 * Builds the public session registry consumed live by rectrixcaedere.com.
 *
 * WTFF differs from SITL and Ashfall in one important way: its archive page IS
 * the Map of Artemesia. So this generator emits an extra `map` block —
 * locations, the travelled path, the "party is here" pin, and the event blooms —
 * which where-the-flowers-forget/archive.html renders directly. Before
 * 2026-08-31 all of that was hardcoded in the HTML and had to be hand-edited
 * after every session.
 *
 * Coordinates are NOT derived from anything. They live in
 * 00-Campaign-Hub/Map Locations.json because only a human looking at the map
 * image can decide where a new place sits. A session whose `site_location`
 * has no entry there fails the build loudly rather than vanishing off the map.
 *
 * Session 00 is deliberately excluded: it is a pre-campaign character-creation
 * session, it is not on the site, and its frontmatter disagrees with its
 * filename (`session_number: "02"` in a file named `Session 00`).
 *
 * Run:  node Workflows/scripts/generate_public_session_index.mjs
 * Test: node Workflows/scripts/generate_public_session_index.mjs --self-test
 */
import assert from 'node:assert/strict';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const vaultRoot = path.resolve(scriptDir, '..', '..');
const sessionsDir = path.join(vaultRoot, '01-Sessions');
const hubDir = path.join(vaultRoot, '00-Campaign-Hub');
const locationsPath = path.join(hubDir, 'Map Locations.json');
const outputPath = path.join(hubDir, 'Public Session Index.json');

/** S00 is pre-campaign; the published run starts at S01. */
const FIRST_PUBLISHED = 1;
const NOTE_PATTERN = /^Session\s+(\d+(?:\.\d+)?)\s+—\s+(.+)\.md$/;
/** site_location is what puts a session on the map, so it is not optional. */
const REQUIRED_SITE_KEYS = ['site_location'];
const SESSION_HREF = '/where-the-flowers-forget/session.html?n=';

function normalizeSessionNumber(value) {
  const raw = String(value).trim();
  if (!/^\d+(?:\.\d+)?$/.test(raw)) throw new Error(`Invalid session number: ${value}`);
  const [whole, fraction] = raw.split('.');
  return `${whole.padStart(2, '0')}${fraction ? `.${fraction}` : ''}`;
}

/** Strips one layer of YAML quoting; refuses backslash escapes rather than guessing. */
function unquote(value) {
  const raw = value.trim();
  const quoted = /^"([\s\S]*)"$/.exec(raw) || /^'([\s\S]*)'$/.exec(raw);
  if (!quoted) return raw;
  if (quoted[1].includes('\\')) throw new Error(`Backslash escapes are not supported in frontmatter: ${raw}`);
  return quoted[1];
}

/** Parses scalars and block sequences out of a note's frontmatter. Dates stay strings. */
function frontmatter(markdown) {
  const block = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(markdown);
  if (!block) throw new Error('note has no YAML frontmatter block');
  const data = {};
  let listKey = null;
  for (const line of block[1].split(/\r?\n/)) {
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && listKey) { data[listKey].push(unquote(item[1])); continue; }
    const pair = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!pair) continue;
    listKey = null;
    if (pair[2].trim() === '') { listKey = pair[1]; data[listKey] = []; }
    else data[pair[1]] = unquote(pair[2]);
  }
  return data;
}

/**
 * Formats a YYYY-MM-DD session date for display.
 * UTC throughout on purpose: formatting an ET session date in local time rolls
 * it back a day, which would mislabel the bloom on the map.
 */
function sessionDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  if (!match) throw new Error(`session_date must be YYYY-MM-DD, received: ${value}`);
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) {
    throw new Error(`Invalid calendar date: ${value}`);
  }
  const fmt = (monthStyle) => date.toLocaleDateString('en-US', { month: monthStyle, day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  return { iso: `${year}-${month}-${day}`, label: fmt('long'), labelShort: fmt('short'), us: `${month}/${day}/${year}` };
}

function buildEntry(file, note, known) {
  const [, rawNumber] = NOTE_PATTERN.exec(file);
  const n = normalizeSessionNumber(rawNumber);
  const fm = frontmatter(note);
  const declared = fm.session_number ?? fm.session;
  if (declared !== undefined && normalizeSessionNumber(declared) !== n) {
    throw new Error(`frontmatter says session ${declared} but the filename says ${n}`);
  }
  if (!fm.title) throw new Error('frontmatter has no title');
  const missing = REQUIRED_SITE_KEYS.filter((key) => !fm[key] || !fm[key].length);
  if (missing.length) throw new Error(`frontmatter is missing ${missing.join(', ')}`);
  const loc = String(fm.site_location).trim();
  if (known && !known.has(loc)) {
    throw new Error(`site_location "${loc}" has no entry in 00-Campaign-Hub/Map Locations.json — add its x/y there first`);
  }
  const date = sessionDate(fm.session_date);
  // The note title carries the "Session NN — " prefix in this vault; the site
  // shows the bare title, so strip it if present.
  const title = fm.title.replace(/^Session\s+\d+(?:\.\d+)?\s+—\s+/, '');
  return {
    n,
    t: title,
    d: date.iso,
    lbl: date.label,
    lbl_short: date.labelShort,
    lbl_us: date.us,
    at: loc,
    f: encodeURI(`01-Sessions/${file}`),
    href: `${SESSION_HREF}${n}`,
    ...(fm.site_region ? { r: fm.site_region } : {}),
    ...(fm.site_arc ? { arc: fm.site_arc } : {}),
    ...(Array.isArray(fm.site_events) && fm.site_events.length ? { ev: fm.site_events } : {}),
  };
}

/**
 * Turns the ordered session list into the map block archive.html renders.
 * `path` is the travel line: each location the party has been to, in first-visit
 * order, with consecutive repeats collapsed so a two-session stay is one point.
 */
function buildMap(sessions, locations) {
  const events = [];
  const byLoc = new Map();
  for (const s of sessions) {
    if (!byLoc.has(s.at)) {
      const bucket = { at: s.at, sessions: [] };
      byLoc.set(s.at, bucket);
      events.push(bucket);
    }
    byLoc.get(s.at).sessions.push({ n: s.n, title: s.t, date: s.lbl_us, href: s.href });
  }
  const travelled = [];
  for (const s of sessions) if (travelled[travelled.length - 1] !== s.at) travelled.push(s.at);
  return {
    party: sessions.length ? sessions[sessions.length - 1].at : null,
    path: travelled,
    locations,
    events,
  };
}

async function buildIndex() {
  let locationFile;
  try {
    locationFile = JSON.parse(await readFile(locationsPath, 'utf8'));
  } catch (error) {
    throw new Error(`could not read 00-Campaign-Hub/Map Locations.json: ${error.message}`);
  }
  const locations = locationFile.locations;
  if (!locations || typeof locations !== 'object') throw new Error('Map Locations.json has no "locations" object');
  for (const [key, v] of Object.entries(locations)) {
    if (typeof v.x !== 'number' || typeof v.y !== 'number') throw new Error(`location "${key}" needs numeric x and y`);
    if (v.x < 0 || v.x > 100 || v.y < 0 || v.y > 100) throw new Error(`location "${key}" x/y must be 0-100 percentages`);
    if (!v.name) throw new Error(`location "${key}" needs a name`);
  }
  const known = new Set(Object.keys(locations));

  const files = (await readdir(sessionsDir)).filter((file) => NOTE_PATTERN.test(file));
  const sessions = [];
  const allSessions = [];
  const failures = [];
  for (const file of files.sort()) {
    const [, rawNumber] = NOTE_PATTERN.exec(file);
    const n = normalizeSessionNumber(rawNumber);
    if (Number.parseFloat(n) < FIRST_PUBLISHED) continue; // S00, pre-campaign
    const note = await readFile(path.join(sessionsDir, file), 'utf8');
    try {
      allSessions.push({ n, d: sessionDate(frontmatter(note).session_date).iso });
    } catch (error) {
      failures.push(`S${n} (all_sessions): ${error.message}.`);
    }
    try {
      sessions.push(buildEntry(file, note, known));
    } catch (error) {
      failures.push(`S${n}: ${error.message}.`);
    }
  }
  if (failures.length) throw new Error(`Public session index not written:\n- ${failures.join('\n- ')}`);
  if (!sessions.length) throw new Error(`No publishable session notes found at or after S${FIRST_PUBLISHED}.`);
  const byNumber = (a, b) => Number.parseFloat(a.n) - Number.parseFloat(b.n);
  sessions.sort(byNumber);
  allSessions.sort(byNumber);
  return {
    version: 1,
    generated_at: new Date().toISOString(),
    first_published_session: normalizeSessionNumber(FIRST_PUBLISHED),
    map: buildMap(sessions, locations),
    all_sessions: allSessions,
    sessions,
  };
}

function selfTest() {
  assert.equal(normalizeSessionNumber('3'), '03');
  assert.equal(normalizeSessionNumber('12'), '12');
  assert.throws(() => normalizeSessionNumber('three'));

  assert.equal(sessionDate('2026-07-12').iso, '2026-07-12');
  assert.equal(sessionDate('2026-07-12').us, '07/12/2026');
  assert.equal(sessionDate('2026-01-01').label, 'January 1, 2026');
  assert.throws(() => sessionDate('07/12/2026'));
  assert.throws(() => sessionDate('2026-02-30'));

  const known = new Set(['rhusatatiam', 'sunrootcrossing']);
  const note = '---\nsession_number: "03"\nsession_date: 2026-07-12\ntitle: "Session 03 — Raise a Glass"\nsite_location: sunrootcrossing\n---\n';
  const e = buildEntry('Session 03 — Raise a Glass.md', note, known);
  assert.equal(e.n, '03');
  assert.equal(e.at, 'sunrootcrossing');
  assert.equal(e.t, 'Raise a Glass', 'the "Session NN — " prefix must be stripped for the site');
  assert.equal(e.lbl_us, '07/12/2026');
  assert.equal(e.href, '/where-the-flowers-forget/session.html?n=03');

  // A location with no coordinates must fail loudly, not drop off the map.
  assert.throws(
    () => buildEntry('Session 04 — Elsewhere.md', '---\nsession_number: "04"\nsession_date: 2026-07-26\ntitle: Elsewhere\nsite_location: nowheresville\n---\n', known),
    /Map Locations\.json/,
  );
  // A note that never got site_location must fail rather than publish off-map.
  assert.throws(
    () => buildEntry('Session 04 — Nowhere.md', '---\nsession_number: "04"\nsession_date: 2026-07-26\ntitle: Nowhere\n---\n', known),
    /site_location/,
  );
  // A mislabelled note must fail rather than publish under the wrong number.
  assert.throws(
    () => buildEntry('Session 04 — Wrong.md', '---\nsession_number: "05"\nsession_date: 2026-07-26\ntitle: Wrong\nsite_location: rhusatatiam\n---\n', known),
    /filename/,
  );

  // Map assembly: two sessions in one place collapse to one bloom and one path point.
  const locs = { rhusatatiam: { x: 33, y: 50, name: 'Rhusatatiam' }, sunrootcrossing: { x: 50, y: 57, name: 'Sunroot Crossing' } };
  const m = buildMap([
    { n: '01', t: 'A', at: 'rhusatatiam', lbl_us: '06/14/2026', href: 'h1' },
    { n: '02', t: 'B', at: 'rhusatatiam', lbl_us: '06/28/2026', href: 'h2' },
    { n: '03', t: 'C', at: 'sunrootcrossing', lbl_us: '07/12/2026', href: 'h3' },
  ], locs);
  assert.deepEqual(m.path, ['rhusatatiam', 'sunrootcrossing']);
  assert.equal(m.party, 'sunrootcrossing', 'the pin follows the latest session');
  assert.equal(m.events.length, 2);
  assert.equal(m.events[0].sessions.length, 2, 'both Rhusatatiam sessions share one bloom');
  assert.equal(m.events[1].sessions[0].n, '03');

  // A return visit must not duplicate the path point but must reopen a bloom order.
  const m2 = buildMap([
    { n: '01', t: 'A', at: 'rhusatatiam', lbl_us: 'x', href: 'h' },
    { n: '02', t: 'B', at: 'sunrootcrossing', lbl_us: 'x', href: 'h' },
    { n: '03', t: 'C', at: 'rhusatatiam', lbl_us: 'x', href: 'h' },
  ], locs);
  assert.deepEqual(m2.path, ['rhusatatiam', 'sunrootcrossing', 'rhusatatiam'], 'a return trip draws a return leg');
  assert.equal(m2.events.length, 2, 'but it reuses the existing bloom');
  assert.equal(m2.events[0].sessions.length, 2);
  assert.equal(m2.party, 'rhusatatiam');

  console.log('generate_public_session_index: self-test passed');
}

async function main() {
  if (process.argv.includes('--self-test')) return selfTest();
  const index = await buildIndex();
  await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  const s = index.sessions;
  console.log(`generate_public_session_index: wrote ${s.length} sessions (S${s[0].n}-S${s[s.length - 1].n}), ${index.map.events.length} map bloom(s), party at "${index.map.party}" -> ${path.relative(vaultRoot, outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
