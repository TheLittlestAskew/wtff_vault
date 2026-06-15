// popup.js

// ─── Config ──────────────────────────────────────────────────────
const SUPABASE_URL = 'https://vtrtyagltwdrbastpppl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cnR5YWdsdHdkcmJhc3RwcHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTY5NTAsImV4cCI6MjA5MTkzMjk1MH0.hnpwjHGIqiUN_VmmIkOAAFGGCKsyYgl7AO3FW5vDIeM';
const DDB_USER_ID = 107965379;

const CAMPAIGNS = {
  'Sky Is The Limit':           { supabaseId: 1, gameId: 6907990, status: 'active' },
  'Pacts & Power':              { supabaseId: 2, gameId: 3661522, status: 'active' },
  'Ashfall Brittania':          { supabaseId: 3, gameId: 7170962, status: 'active' },
  'Where the Flowers Forget':   { supabaseId: 4, gameId: 7853407, status: 'active' },
};

// ─── Logging ─────────────────────────────────────────────────────
const logEl = document.getElementById('log');

function log(msg, type = 'info') {
  const line = document.createElement('div');
  line.className = type;
  line.textContent = msg;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

function clearLog() {
  logEl.innerHTML = '';
}

// ─── UI: Campaign list ───────────────────────────────────────────
function renderCampaigns() {
  const container = document.getElementById('campaign-list');
  container.innerHTML = '';
  for (const [name, cfg] of Object.entries(CAMPAIGNS)) {
    const row = document.createElement('div');
    row.className = 'campaign-row';
    row.id = `campaign-${cfg.supabaseId}`;
    row.innerHTML = `
      <span class="name">${name}</span>
      <span class="badge ${cfg.status}">${cfg.status}</span>
      <span class="sync-status" id="status-${cfg.supabaseId}">—</span>
    `;
    container.appendChild(row);
  }
}

function setCampaignStatus(supabaseId, msg, type = 'info') {
  const el = document.getElementById(`status-${supabaseId}`);
  if (el) {
    el.textContent = msg;
    el.style.color = type === 'ok' ? '#4d4' : type === 'error' ? '#f66' : '#888';
  }
}

// ─── Token status ────────────────────────────────────────────────
function updateTokenStatus(token, capturedAt) {
  const el = document.getElementById('token-status');
  const btn = document.getElementById('btn-sync-all');
  if (!token) {
    el.className = 'token-status warn';
    el.textContent = '⏳ No token yet — open any D&D Beyond page first.';
    btn.disabled = true;
  } else {
    const age = capturedAt ? Math.round((Date.now() - capturedAt) / 60000) : '?';
    el.className = 'token-status ok';
    el.textContent = `✅ Token captured (${age}m ago) — ready to sync.`;
    btn.disabled = false;
  }
}

// ─── Supabase helpers ────────────────────────────────────────────
async function supabaseRequest(path, method, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${method} ${path}: ${res.status} ${err}`);
  }
  return res;
}

async function getLastSyncedUnix(campaignId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/ddb_rolls?campaign_id=eq.${campaignId}&select=timestamp_unix&order=timestamp_unix.desc&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  const data = await res.json();
  return data.length > 0 ? data[0].timestamp_unix : 0;
}

async function upsertRolls(rows) {
  // Collapse rows that share the composite conflict key. A single game-log
  // message can hold several rolls with the same rollId+rollType+notation, which
  // would make Postgres try to ON CONFLICT-update the same row twice in one
  // statement (error 21000). The unique constraint only keeps one such row
  // anyway, so we keep the last occurrence. Rows with a null dice_notation are
  // left as-is (NULLs are treated as distinct by the unique key).
  const byKey = new Map();
  const deduped = [];
  for (const r of rows) {
    if (r.dice_notation == null) { deduped.push(r); continue; }
    const key = `${r.campaign_id}|${r.roll_id}|${r.roll_type}|${r.dice_notation}`;
    if (byKey.has(key)) deduped[byKey.get(key)] = r;
    else { byKey.set(key, deduped.length); deduped.push(r); }
  }

  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < deduped.length; i += BATCH) {
    const chunk = deduped.slice(i, i + BATCH);
    // Upsert against the composite unique key (not the PK), so re-seeing an
    // already-synced roll merges instead of throwing a 23505 duplicate-key 409.
    await supabaseRequest(
      'ddb_rolls?on_conflict=campaign_id,roll_id,roll_type,dice_notation',
      'POST',
      chunk
    );
    inserted += chunk.length;
    if (deduped.length > BATCH) {
      log(`  ↳ Upserted ${inserted}/${deduped.length} rolls...`);
    }
  }
  return inserted;
}

async function updateCampaignSync(campaignId, lastUnix) {
  const iso = new Date(lastUnix).toISOString();
  await supabaseRequest(
    `ddb_campaigns?id=eq.${campaignId}`,
    'PATCH',
    { last_synced_iso: iso, last_synced_unix: lastUnix }
  );
}

// ─── DDB API helpers ─────────────────────────────────────────────
// The live game-log endpoint is /v1/getmessages (the old /v1/game-log/{id}/rolls
// path is dead and returns a 403 from the API gateway). It returns the whole
// game log newest-first, paginated by a `lastKey` cursor. We fetch messages,
// keep only dice rolls (eventType "dice/roll/fulfilled"), and stop once we reach
// rolls we've already synced (afterUnix).
async function fetchDDBRolls(gameId, bearerToken, afterUnix = 0) {
  const messages = [];
  let lastEvaluatedKey = null;
  let page = 0;
  let done = false;

  while (!done) {
    page++;
    log(`  ↳ Fetching page ${page}...`);
    let url = `https://game-log-rest-live.dndbeyond.com/v1/getmessages?gameId=${gameId}&userId=${DDB_USER_ID}`;
    if (lastEvaluatedKey) url += `&lastEvaluatedKey=${encodeURIComponent(lastEvaluatedKey)}`;

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${bearerToken}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`DDB API error: ${res.status} ${errText}`);
    }

    const json = await res.json();
    const batch = json.data || [];
    if (batch.length === 0) break;

    for (const msg of batch) {
      const ts = parseInt(msg.dateTime, 10) || 0;
      if (ts <= afterUnix) { done = true; break; }
      if (msg.eventType === 'dice/roll/fulfilled' && msg.data?.rolls?.length) {
        messages.push(msg);
      }
    }

    // Pagination: the response hands back the next cursor in `lastKey`.
    const nextKey = json.lastKey?.dateTime_eventType_userId || null;
    if (!nextKey) break;
    lastEvaluatedKey = nextKey;
    if (page > 300) { log('  ⚠️ Hit 300 page limit', 'warn'); break; }
    await new Promise(r => setTimeout(r, 250));
  }

  return messages;
}

// Reconstruct a readable dice formula like "2d20+10" or "1d6+1d4" from the
// structured diceNotation object, matching the format already in the archive.
function buildDiceNotation(dn) {
  if (!dn) return null;
  const parts = (dn.set || []).map(s => {
    const die = s.dieType || (s.dice && s.dice[0] && s.dice[0].dieType) || '';
    const count = s.count || (s.dice ? s.dice.length : 1);
    return `${count}${die}`;
  });
  let notation = parts.join('+');
  const c = dn.constant || 0;
  if (c > 0) notation += `+${c}`;
  else if (c < 0) notation += `${c}`;
  return notation || null;
}

// One game-log message can contain several rolls (e.g. a to-hit + a damage
// roll sharing one rollId). Emit ONE row per roll so they map cleanly onto the
// composite unique key (campaign_id, roll_id, roll_type, dice_notation).
function normalizeMessage(msg, campaignId) {
  const ts = parseInt(msg.dateTime, 10) || 0;
  const d = msg.data || {};
  const ctx = d.context || {};
  const base = {
    campaign_id: campaignId,
    timestamp_iso: new Date(ts).toISOString(),
    timestamp_unix: ts,
    character: ctx.name || null,
    user_id: msg.userId ? parseInt(msg.userId, 10) : null,
    action: d.action || 'custom',
    source: (msg.source || 'web').toLowerCase(),
    set_id: d.setId || null,
    roll_id: d.rollId || msg.id || null,
  };
  return (d.rolls || []).map(r => ({
    ...base,
    roll_type: r.rollType || 'roll',
    roll_kind: r.rollKind || '',
    dice_notation: buildDiceNotation(r.diceNotation),
    modifier: (r.diceNotation && r.diceNotation.constant) || 0,
    total: r.result?.total ?? null,
    individual_values: r.result?.values ? JSON.stringify(r.result.values) : null,
  }));
}

// ─── Sync logic ──────────────────────────────────────────────────
async function syncCampaign(campaignName, bearerToken) {
  const cfg = CAMPAIGNS[campaignName];
  if (cfg.status !== 'active') {
    setCampaignStatus(cfg.supabaseId, 'skipped');
    return;
  }
  if (!cfg.gameId || cfg.gameId === 0) {
    log(`❌ No gameId for "${campaignName}"`, 'error');
    setCampaignStatus(cfg.supabaseId, 'no gameId', 'error');
    return;
  }

  log(`\n🎲 ${campaignName}`, 'head');
  setCampaignStatus(cfg.supabaseId, 'syncing…');

  try {
    const lastUnix = await getLastSyncedUnix(cfg.supabaseId);
    if (lastUnix > 0) {
      log(`  ↳ Last sync: ${new Date(lastUnix).toISOString()}`);
    } else {
      log('  ↳ Full sync (no existing data)');
    }

    const rawRolls = await fetchDDBRolls(cfg.gameId, bearerToken, lastUnix);
    log(`  ↳ ${rawRolls.length} new rolls found`);

    if (rawRolls.length === 0) {
      log('  ✅ Already up to date', 'ok');
      setCampaignStatus(cfg.supabaseId, 'up to date', 'ok');
      return;
    }

    const rows = rawRolls.flatMap(m => normalizeMessage(m, cfg.supabaseId));
    const count = await upsertRolls(rows);
    const maxUnix = Math.max(...rows.map(r => r.timestamp_unix));
    await updateCampaignSync(cfg.supabaseId, maxUnix);

    log(`  ✅ Synced ${count} rolls`, 'ok');
    setCampaignStatus(cfg.supabaseId, `+${count}`, 'ok');
  } catch (e) {
    log(`  ❌ ${e.message}`, 'error');
    setCampaignStatus(cfg.supabaseId, 'error', 'error');
  }
}

async function syncAll(bearerToken) {
  const btn = document.getElementById('btn-sync-all');
  btn.disabled = true;
  btn.textContent = '⏳ Syncing…';
  clearLog();
  log('══════════════════════════════', 'head');
  log('DDB Roll Sync → Supabase', 'head');
  log('══════════════════════════════', 'head');

  for (const name of Object.keys(CAMPAIGNS)) {
    await syncCampaign(name, bearerToken);
  }

  log('\n🏁 Sync complete!', 'ok');
  btn.disabled = false;
  btn.textContent = '⚡ Sync All Campaigns';
}

// ─── Init ────────────────────────────────────────────────────────
renderCampaigns();

chrome.storage.local.get(['ddb_bearer_token', 'ddb_token_captured_at'], (result) => {
  updateTokenStatus(result.ddb_bearer_token, result.ddb_token_captured_at);
});

document.getElementById('btn-sync-all').addEventListener('click', () => {
  chrome.storage.local.get(['ddb_bearer_token'], (result) => {
    if (!result.ddb_bearer_token) {
      log('❌ No token — open a D&D Beyond page first.', 'error');
      return;
    }
    syncAll(result.ddb_bearer_token);
  });
});

document.getElementById('btn-clear-log').addEventListener('click', clearLog);
