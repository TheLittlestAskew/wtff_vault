#!/usr/bin/env node
/*
 * DDB Party Sheet Sync  —  Where the Flowers Forget
 * ---------------------------------------------------
 *   node ddb_party_sync.js --discover    (game day, once: auto-build the roster)
 *   node ddb_party_sync.js               (fetch every PC's sheet)
 *
 * Reads ddb_party.json. In normal mode, for each character whose DDB sheet is
 * shared it pulls the full sheet JSON from D&D Beyond's character service and writes:
 *
 *   03-Characters/01 PCs/Party Character Sheets/_raw/<CharacterName>.json   (full raw JSON)
 *   03-Characters/01 PCs/Party Character Sheets/<CharacterName> (DDB).md    (readable sheet)
 *
 * After writing each sheet it also writes a CHANGE-ONLY snapshot row to Supabase
 * (table ddb_character_snapshots, campaign_id 4). It fetches the character's most
 * recent snapshot and inserts a new row ONLY if a tracked stat (level / AC / max
 * HP / proficiency / any ability score / class string / race) changed — so every
 * row is a real event. Supabase failures are non-fatal (file sync still succeeds).
 *
 * ── --discover ──────────────────────────────────────────────────────────────
 * Run this ONCE after the campaign is live and your PC is joined to the campaign
 * page. It fetches YOUR own sheet (selfCharacterId), reads the embedded campaign
 * roster (every member's userId/characterId/characterName), and rewrites the
 * `characters` list in ddb_party.json automatically — no manual ID collection.
 * Until you've joined the campaign page, your sheet carries no roster yet, so
 * --discover will tell you to try again on game day.
 *
 * AUTH: discover and Campaign-Only fetches authenticate AS YOU via DDB_COBALT in
 * the vault .env (Cobalt session cookie → short-lived Bearer, minted each run).
 * Get it: F12 → Application → Cookies → dndbeyond.com → CobaltSession. Account-wide.
 *
 * Output files are named after the REAL character name from each fetched sheet.
 *
 * Requires: Node 18+ (built-in fetch). No npm deps.
 */

const path = require('path');
const fs = require('fs');

// Vault root derived from this script's location (<vault>\Workflows\scripts\).
const VAULT_ROOT = path.resolve(__dirname, '..', '..');
const CONFIG     = path.join(__dirname, 'ddb_party.json');
const ENV_FILE   = path.join(VAULT_ROOT, '.env');
const OUT_DIR    = path.join(VAULT_ROOT, '03-Characters', '01 PCs', 'Party Character Sheets');
const RAW_DIR    = path.join(OUT_DIR, '_raw');
const CHAR_API   = (id) => `https://character-service.dndbeyond.com/character/v5/character/${id}`;
const COBALT_API = 'https://auth-service.dndbeyond.com/v1/cobalt-token';

// ─── Supabase snapshot sink (time-series character history) ──────────
// Same project + anon key as ddb_sync_supabase.js. RLS on ddb_character_snapshots
// allows all roles (matches ddb_rolls), so the anon key can insert/select.
// THIS VAULT = Where the Flowers Forget → campaign_id 4. (SITL = 1, P&P = 2, Ashfall = 3.)
const SUPABASE_URL = 'https://vtrtyagltwdrbastpppl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cnR5YWdsdHdkcmJhc3RwcHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTY5NTAsImV4cCI6MjA5MTkzMjk1MH0.hnpwjHGIqiUN_VmmIkOAAFGGCKsyYgl7AO3FW5vDIeM';
const SUPABASE_CAMPAIGN_ID = 4;

// Tracked fields = the change-detection set. A new snapshot is written only if
// any of these differs from the character's most recent snapshot.
const SNAPSHOT_FIELDS = [
  'level', 'ac', 'hp_max', 'pb',
  'str_score', 'dex_score', 'con_score', 'int_score', 'wis_score', 'cha_score',
  'class_string', 'race',
];

const ABILITIES = [
  { id: 1, key: 'strength',     abbr: 'STR' },
  { id: 2, key: 'dexterity',    abbr: 'DEX' },
  { id: 3, key: 'constitution', abbr: 'CON' },
  { id: 4, key: 'intelligence', abbr: 'INT' },
  { id: 5, key: 'wisdom',       abbr: 'WIS' },
  { id: 6, key: 'charisma',     abbr: 'CHA' },
];

const log = (m) => console.log(m);
const mod = (score) => Math.floor((score - 10) / 2);
const signed = (n) => (n >= 0 ? `+${n}` : `${n}`);
const safe = (s) => String(s).replace(/[\\/:*?"<>|]/g, '_').trim();

// Minimal .env reader (no dotenv dependency). Returns {} if the file is missing.
function readEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

// Exchange a Cobalt session cookie for a short-lived Bearer token (minted fresh
// each run). Returns null on failure so the caller can fall back / warn.
async function getBearerFromCobalt(cobalt) {
  try {
    const res = await fetch(COBALT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': `CobaltSession=${cobalt}` },
    });
    if (!res.ok) {
      log(`  ⚠️ Cobalt exchange failed: HTTP ${res.status} (token expired? re-copy CobaltSession into .env)`);
      return null;
    }
    const data = await res.json();
    return data.token || null;
  } catch (e) {
    log(`  ⚠️ Cobalt exchange error: ${e.message}`);
    return null;
  }
}

async function authFromEnv() {
  const env = readEnv(ENV_FILE);
  if (!env.DDB_COBALT) return { headers: {}, authed: false };
  const bearer = await getBearerFromCobalt(env.DDB_COBALT);
  return bearer ? { headers: { 'Authorization': `Bearer ${bearer}` }, authed: true }
                : { headers: {}, authed: false };
}

async function fetchCharacter(id, authHeaders = {}) {
  const res = await fetch(CHAR_API(id), { headers: { 'Accept': 'application/json', ...authHeaders } });
  let body = null;
  try { body = await res.json(); } catch { /* non-json */ }
  return { status: res.status, body };
}

// ── ability / sheet rendering ────────────────────────────────────────────────
function allModifiers(char) {
  const m = char.modifiers || {};
  return Object.values(m).filter(Array.isArray).flat();
}
function computeAbility(char, ab) {
  const find = (arr) => (arr || []).find((s) => s && s.id === ab.id);
  const base = find(char.stats)?.value ?? 10;
  const bonus = find(char.bonusStats)?.value ?? 0;
  const override = find(char.overrideStats)?.value;
  let modSum = 0, setVal = null;
  for (const m of allModifiers(char)) {
    if (m.subType === `${ab.key}-score`) {
      if (m.type === 'bonus' && typeof m.value === 'number') modSum += m.value;
      if (m.type === 'set' && typeof m.value === 'number') setVal = Math.max(setVal ?? 0, m.value);
    }
  }
  let score = base + bonus + modSum;
  if (setVal !== null) score = Math.max(score, setVal);
  if (override !== null && override !== undefined) score = override;
  return score;
}
const totalLevel = (char) => (char.classes || []).reduce((n, c) => n + (c.level || 0), 0);
const profBonus = (level) => Math.ceil(level / 4) + 1;
function classLine(char) {
  return (char.classes || [])
    .map((c) => {
      const name = c.definition?.name || 'Class';
      const sub = c.subclassDefinition?.name ? ` (${c.subclassDefinition.name})` : '';
      return `${name}${sub} ${c.level || '?'}`;
    })
    .join(' / ') || '—';
}
const raceLine = (char) => char.race?.fullName || char.race?.baseRaceName || char.race?.baseName || '—';
const backgroundLine = (char) => char.background?.definition?.name || char.background?.customBackground?.name || '—';
function maxHp(char, conMod, level) {
  if (typeof char.overrideHitPoints === 'number') return char.overrideHitPoints;
  return (char.baseHitPoints || 0) + conMod * level + (char.bonusHitPoints || 0);
}
function spellNames(char) {
  const out = [];
  const push = (arr) => (arr || []).forEach((s) => {
    const def = s.definition || s;
    if (def?.name) out.push({ name: def.name, level: def.level ?? 0 });
  });
  const sp = char.spells || {};
  ['race', 'class', 'background', 'item', 'feat'].forEach((k) => push(sp[k]));
  (char.classSpells || []).forEach((cs) => push(cs.spells));
  const seen = new Set();
  return out.filter((s) => (seen.has(s.name) ? false : seen.add(s.name)));
}
// AC, computed to MATCH the DDB sheet (deterministic, no rules engine):
// equipped armor + shield + Dex (capped for medium) + class Unarmored Defense.
// Returns { ac, breakdown } so the sheet shows the math. Deliberately ignores
// item AC *modifiers* (e.g. Bracers of Defense, which DDB only applies when
// unarmored) so the number matches the sheet. Trade-off: a genuine magic AC
// item (Ring of Protection, +1 armor) won't be added — flag by hand if equipped.
const ARMOR_TYPE = { 1: 'light', 2: 'medium', 3: 'heavy', 4: 'shield' };

function armorClass(char, scores) {
  const dexMod = mod(scores.DEX);
  const worn = (char.inventory || []).filter(
    (i) => i.equipped && i.definition?.filterType === 'Armor'
  );
  const body   = worn.find((i) => ARMOR_TYPE[i.definition.armorTypeId] !== 'shield');
  const shield = worn.find((i) => ARMOR_TYPE[i.definition.armorTypeId] === 'shield');

  const parts = [];
  let ac;
  if (body) {
    const type    = ARMOR_TYPE[body.definition.armorTypeId];
    const armorAC = body.definition.armorClass || 10;
    const name    = body.definition.name || 'Armor';
    if (type === 'heavy') {
      ac = armorAC;
      parts.push(`${name} ${armorAC} (heavy, no Dex)`);
    } else if (type === 'medium') {
      const dexAdd = Math.min(dexMod, 2);
      ac = armorAC + dexAdd;
      parts.push(`${name} ${armorAC}`, `Dex ${signed(dexAdd)}${dexMod > 2 ? ' (capped)' : ''}`);
    } else {
      ac = armorAC + dexMod;
      parts.push(`${name} ${armorAC}`, `Dex ${signed(dexMod)}`);
    }
  } else {
    const cls = (char.classes || []).map((c) => c.definition?.name);
    if (cls.includes('Barbarian')) {
      const conMod = mod(scores.CON);
      ac = 10 + dexMod + conMod;
      parts.push('Unarmored Defense 10', `Dex ${signed(dexMod)}`, `Con ${signed(conMod)}`);
    } else if (cls.includes('Monk')) {
      const wisMod = mod(scores.WIS);
      ac = 10 + dexMod + wisMod;
      parts.push('Unarmored Defense 10', `Dex ${signed(dexMod)}`, `Wis ${signed(wisMod)}`);
    } else {
      ac = 10 + dexMod;
      parts.push('Base 10', `Dex ${signed(dexMod)}`);
    }
  }
  if (shield) {
    const sAC = shield.definition.armorClass || 2;
    ac += sAC;
    parts.push(`${shield.definition.name || 'Shield'} ${signed(sAC)}`);
  }
  return { ac, breakdown: parts.join(' + ') };
}

// Single source of truth for every derived number. Both renderMarkdown and the
// Supabase snapshot row read from this, so the sheet and the history can't drift.
function computeSheet(char) {
  const level = totalLevel(char);
  const pb = profBonus(level);
  const scores = {};
  ABILITIES.forEach((ab) => (scores[ab.abbr] = computeAbility(char, ab)));
  const conMod = mod(scores.CON);
  const hp = maxHp(char, conMod, level);
  const acInfo = armorClass(char, scores);
  return {
    level, pb, scores, hp,
    ac: acInfo.ac, acBreakdown: acInfo.breakdown,
    classString: classLine(char),
    race: raceLine(char),
  };
}

// ─── Supabase snapshot helpers ──────────────────────────────────────
async function supaGet(pathAndQuery) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`GET ${res.status} ${await res.text()}`);
  return res.json();
}

async function supaInsert(table, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`POST ${res.status} ${await res.text()}`);
}

function buildSnapshotRow(meta, sheet) {
  // captured_at defaults to now() in the DB; session_date is resolved in the
  // per-campaign view (left null here) unless you later pin it by hand.
  return {
    campaign_id: SUPABASE_CAMPAIGN_ID,
    character_name: meta.name,
    ddb_character_id: meta.characterId,
    level: sheet.level,
    ac: sheet.ac,
    hp_max: sheet.hp,
    pb: sheet.pb,
    str_score: sheet.scores.STR,
    dex_score: sheet.scores.DEX,
    con_score: sheet.scores.CON,
    int_score: sheet.scores.INT,
    wis_score: sheet.scores.WIS,
    cha_score: sheet.scores.CHA,
    class_string: sheet.classString,
    race: sheet.race,
    details: { ac_breakdown: sheet.acBreakdown },
  };
}

// Change-only: compare against the MOST RECENT snapshot (not all history), so a
// stat that returns to a prior value still records as a new event.
function snapshotChanged(latest, row) {
  if (!latest) return true;
  return SNAPSHOT_FIELDS.some((f) => (latest[f] ?? null) !== (row[f] ?? null));
}

async function writeSnapshotIfChanged(meta, char) {
  const sheet = computeSheet(char);
  const row = buildSnapshotRow(meta, sheet);
  const prior = await supaGet(
    `ddb_character_snapshots?campaign_id=eq.${SUPABASE_CAMPAIGN_ID}` +
    `&ddb_character_id=eq.${meta.characterId}` +
    `&select=${SNAPSHOT_FIELDS.join(',')}` +
    `&order=captured_at.desc&limit=1`
  );
  if (snapshotChanged(prior[0], row)) {
    await supaInsert('ddb_character_snapshots', row);
    return 'new';
  }
  return 'same';
}

function renderMarkdown(char, meta) {
  const sheet = computeSheet(char);
  const { level, pb, scores, hp } = sheet;
  const L = [];
  L.push('---');
  L.push('type: pc-sheet');
  L.push('source: dndbeyond');
  L.push(`ddb_character_id: ${meta.characterId}`);
  L.push(`ddb_url: https://www.dndbeyond.com/characters/${meta.characterId}`);
  L.push(`synced: ${meta.syncedIso}`);
  L.push('generated_by: ddb_party_sync.js');
  L.push('---');
  L.push('');
  L.push(`# ${char.name || meta.name} — DDB Sheet`);
  L.push('');
  L.push('> [!warning] Auto-generated from D&D Beyond — do not hand-edit (overwritten on each sync).');
  L.push(`> Some derived values are approximate. Source of truth: \`_raw/${safe(char.name || meta.name)}.json\`.`);
  L.push('');
  L.push(`- **Race:** ${raceLine(char)}`);
  L.push(`- **Class:** ${classLine(char)}`);
  L.push(`- **Total Level:** ${level}  ·  **Proficiency Bonus:** ${signed(pb)}`);
  L.push(`- **Background:** ${backgroundLine(char)}`);
  L.push(`- **Max HP (approx):** ${hp}`);
  L.push(`- **AC:** ${sheet.ac}  ·  *${sheet.acBreakdown}*`);
  if (char.currencies) {
    const c = char.currencies;
    L.push(`- **Currency:** ${c.pp || 0}pp ${c.gp || 0}gp ${c.ep || 0}ep ${c.sp || 0}sp ${c.cp || 0}cp`);
  }
  L.push('');
  L.push('## Ability Scores');
  L.push('');
  L.push('| Ability | Score | Mod |');
  L.push('| --- | :---: | :---: |');
  ABILITIES.forEach((ab) => { const s = scores[ab.abbr]; L.push(`| ${ab.abbr} | ${s} | ${signed(mod(s))} |`); });
  L.push('');
  const inv = (char.inventory || []).filter((i) => i.definition?.name);
  if (inv.length) {
    L.push(`## Inventory (${inv.length})`);
    L.push('');
    inv.forEach((i) => {
      const qty = i.quantity && i.quantity > 1 ? ` ×${i.quantity}` : '';
      const eq = i.equipped ? ' *(equipped)*' : '';
      L.push(`- ${i.definition.name}${qty}${eq}`);
    });
    L.push('');
  }
  const spells = spellNames(char);
  if (spells.length) {
    L.push(`## Spells (${spells.length})`);
    L.push('');
    const byLevel = {};
    spells.forEach((s) => ((byLevel[s.level] ||= []).push(s.name)));
    Object.keys(byLevel).map(Number).sort((a, b) => a - b).forEach((lv) => {
      const label = lv === 0 ? 'Cantrips' : `Level ${lv}`;
      L.push(`- **${label}:** ${byLevel[lv].sort().join(', ')}`);
    });
    L.push('');
  }
  if (Array.isArray(char.conditions) && char.conditions.length) {
    L.push('## Conditions');
    L.push('');
    char.conditions.forEach((c) => L.push(`- ${c.definition?.name || c.id}`));
    L.push('');
  }
  const t = char.traits || {};
  if (t.personalityTraits || t.ideals || t.bonds || t.flaws) {
    L.push('## Traits');
    L.push('');
    if (t.personalityTraits) L.push(`- **Personality:** ${t.personalityTraits}`);
    if (t.ideals)  L.push(`- **Ideals:** ${t.ideals}`);
    if (t.bonds)   L.push(`- **Bonds:** ${t.bonds}`);
    if (t.flaws)   L.push(`- **Flaws:** ${t.flaws}`);
    L.push('');
  }
  return L.join('\n');
}

function loadConfig() {
  if (!fs.existsSync(CONFIG)) { log(`❌ Missing config: ${CONFIG}`); process.exit(1); }
  return JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
}

// ── --discover: build the roster from YOUR sheet's embedded campaign list ─────
async function discover() {
  const cfg = loadConfig();
  log('═══════════════════════════════════════════');
  log(`DDB Roster Discovery  ·  ${cfg.campaign || ''}`);
  log('═══════════════════════════════════════════');

  if (!cfg.selfCharacterId) {
    log('❌ No selfCharacterId in ddb_party.json — set it to your own PC\'s characterId.');
    return;
  }
  const { headers, authed } = await authFromEnv();
  if (!authed) log('⚠️  No valid DDB_COBALT — trying anonymously (works only if your sheet is Public).');
  else log('🔑 Authenticated as you.');

  log(`Fetching your sheet (#${cfg.selfCharacterId}) to read the campaign roster…`);
  const { status, body } = await fetchCharacter(cfg.selfCharacterId, headers);
  if (status !== 200 || !body?.data) {
    log(`❌ Couldn't read your sheet (HTTP ${status}). Add DDB_COBALT to .env (your sheet is Campaign-Only) and retry.`);
    return;
  }
  const cam = body.data.campaign;
  const roster = cam?.characters || [];
  if (!cam || roster.length === 0) {
    log('⚠️  Your sheet isn\'t attached to a campaign roster yet.');
    log('    Have you JOINED the campaign page? The roster populates once you join.');
    log('    Re-run `--discover` on game day (after joining) and it\'ll fill in.');
    return;
  }

  log(`📋 Campaign "${cam.name || cfg.campaign}" — DM ${cam.dmUsername || cam.dmUserId}; ${roster.length} member(s):`);
  const characters = roster
    .filter((m) => m.characterId)
    .map((m) => {
      const o = { name: m.characterName || `Member ${m.userId}`, characterId: m.characterId,
                  _user: m.username, _userId: m.userId };
      if (m.characterId === cfg.selfCharacterId) o._self = true;
      if (m.isAssigned === false) o._note = 'unassigned in campaign';
      return o;
    });
  characters.forEach((c) => log(`   • ${c.name}  (#${c.characterId}, ${c._user})${c._self ? '  ← you' : ''}`));

  const updated = {
    _README: cfg._README,
    campaign: cam.name || cfg.campaign,
    gameId: cfg.gameId,
    selfCharacterId: cfg.selfCharacterId,
    characters,
  };
  fs.writeFileSync(CONFIG, JSON.stringify(updated, null, 2) + '\n');
  log('───────────────────────────────────────────');
  log(`✅ Wrote ${characters.length} character(s) to ddb_party.json. Now run:  node ddb_party_sync.js`);
}

// ── normal sync: fetch every character in the registry ────────────────────────
async function sync() {
  const cfg = loadConfig();
  const chars = (cfg.characters || []).filter((c) => c.characterId && c.characterId !== 0);
  const unset = (cfg.characters || []).filter((c) => !c.characterId || c.characterId === 0);

  log('═══════════════════════════════════════════');
  log(`DDB Party Sheet Sync  ·  ${cfg.campaign || ''}`);
  log('═══════════════════════════════════════════');

  if (!chars.length) {
    log('Roster is empty. Once you\'ve joined the campaign page, run:  node ddb_party_sync.js --discover');
    return;
  }

  const { headers, authed } = await authFromEnv();
  log(authed ? '🔑 DDB_COBALT found — authenticating as you (unlocks Campaign-Only sheets).'
             : 'ℹ️  No valid DDB_COBALT — anonymous mode (Public sheets only).');
  if (unset.length) log(`⚠️  ${unset.length} without an ID (skipped): ${unset.map((c) => c.name).join(', ')}`);

  fs.mkdirSync(RAW_DIR, { recursive: true });
  const syncedIso = new Date().toISOString();
  let ok = 0, priv = 0, fail = 0;
  let snapNew = 0, snapSame = 0, snapErr = 0;

  for (const c of chars) {
    process.stdout.write(`• ${c.name} (#${c.characterId})… `);
    try {
      const { status, body } = await fetchCharacter(c.characterId, headers);
      if (status === 403 || (body && body.success === false)) {
        log(authed ? '🔒 not visible to you (truly private) — skipped'
                   : '🔒 not public (Campaign-Only/Private) — skipped');
        priv++;
        continue;
      }
      if (status !== 200 || !body || !body.data) { log(`⚠️ HTTP ${status} — skipped`); fail++; continue; }
      const char = body.data;
      const fileBase = safe(char.name || c.name);
      fs.writeFileSync(path.join(RAW_DIR, `${fileBase}.json`), JSON.stringify(char, null, 2));
      fs.writeFileSync(path.join(OUT_DIR, `${fileBase} (DDB).md`), renderMarkdown(char, { ...c, syncedIso }));
      log(`✅ ${char.name || c.name} → JSON + markdown`);
      ok++;

      // ── Time-series snapshot (change-only). Isolated so a Supabase failure
      //    never corrupts the file-sync accounting or stops the run. ──
      try {
        const result = await writeSnapshotIfChanged({ name: char.name || c.name, characterId: c.characterId }, char);
        if (result === 'new') { snapNew++; log('    📸 snapshot saved (sheet changed)'); }
        else { snapSame++; }
      } catch (e) {
        snapErr++;
        log(`    ⚠️ snapshot skipped (Supabase): ${e.message}`);
      }
    } catch (e) { log(`❌ ${e.message}`); fail++; }
    await new Promise((r) => setTimeout(r, 300));
  }

  log('───────────────────────────────────────────');
  log(`Done. ${ok} synced, ${priv} skipped, ${fail} failed, ${unset.length} unset.`);
  log(`Snapshots: ${snapNew} new, ${snapSame} unchanged, ${snapErr} errored.`);
  if (priv) log(authed
    ? 'Skipped sheets are genuinely Private — only their owner or the DM can pull them.'
    : 'Add DDB_COBALT to .env to fetch Campaign-Only sheets.');
}

(async () => {
  if (process.argv.includes('--discover')) await discover();
  else await sync();
})().catch((e) => { console.error(e); process.exit(1); });
