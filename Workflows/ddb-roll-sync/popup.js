// popup.js

// ─── Config ──────────────────────────────────────────────────────
const SUPABASE_URL = 'https://vtrtyagltwdrbastpppl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cnR5YWdsdHdkcmJhc3RwcHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTY5NTAsImV4cCI6MjA5MTkzMjk1MH0.hnpwjHGIqiUN_VmmIkOAAFGGCKsyYgl7AO3FW5vDIeM';
const DDB_USER_ID = 107965379;

const CAMPAIGNS = {
  'Sky Is The Limit':           { supabaseId: 1, gameId: 6907990, status: 'active' },
  'Pacts & Power':              { supabaseId: 2, gameId: 3661522, status: 'active' },
  'Ashfall Brittania':          { supabaseId: 3, gameId: 7170962, status: 'active' },
  'Where the Flowers Remember': { supabaseId: 4, gameId: 0,       status: 'paused' },
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
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    await supabaseRequest('ddb_rolls', 'POST', chunk);
    inserted += chunk.length;
    if (rows.length > BATCH) {
      log(`  ↳ Upserted ${inserted}/${rows.length} rolls...`);
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
async function fetchDDBRolls(gameId, bearerToken, afterUnix = 0) {
  const allRolls = [];
  let nextUrl = `https://game-log-rest-live.dndbeyond.com/v1/game-log/${gameId}/rolls?userId=${DDB_USER_ID}&limit=100`;
  let page = 0;
  let done = false;

  while (nextUrl && !done) {
    page++;
    log(`  ↳ Fetching page ${page}...`);
    const res = await fetch(nextUrl, {
      headers: { 'Authorization': `Bearer ${bearerToken}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`DDB API error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const rolls = data.data || [];
    if (rolls.length === 0) break;

    for (const roll of rolls) {
      const ts = roll.dateTime ? new Date(roll.dateTime).getTime() : (roll.timestamp || 0);
      if (ts <= afterUnix) { done = true; break; }
      allRolls.push(roll);
    }

    nextUrl = data.pagination?.next || null;
    if (page > 200) { log('  ⚠️ Hit 200 page limit', 'warn'); break; }
    await new Promise(r => setTimeout(r, 300));
  }

  return allRolls;
}

function normalizeDDBRoll(raw, campaignId) {
  const ts = raw.dateTime ? new Date(raw.dateTime).getTime() : (raw.timestamp || 0);
  let individualValues = null;
  if (raw.rolls && Array.isArray(raw.rolls)) {
    individualValues = raw.rolls.flatMap(r => (r.dice || []).flatMap(d => d.results || []));
  } else if (raw.result?.values) {
    individualValues = raw.result.values;
  }
  return {
    campaign_id: campaignId,
    timestamp_iso: new Date(ts).toISOString(),
    timestamp_unix: ts,
    character: raw.context?.characterName || raw.characterName || null,
    user_id: raw.userId || raw.context?.userId || null,
    action: raw.context?.action || raw.action || 'custom',
    roll_type: raw.rollType || raw.context?.rollType || 'roll',
    roll_kind: raw.rollKind || raw.context?.rollKind || '',
    dice_notation: raw.diceNotation || raw.notation || null,
    modifier: raw.modifier || 0,
    total: raw.result?.total ?? raw.total ?? null,
    individual_values: individualValues ? JSON.stringify(individualValues) : null,
    source: raw.source || 'web',
    set_id: raw.setId || null,
    roll_id: raw.rollId || raw.id || null,
  };
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

    const rows = rawRolls.map(r => normalizeDDBRoll(r, cfg.supabaseId));
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