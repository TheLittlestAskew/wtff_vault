#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// DDB Roll Archive — One-Time Excel → Supabase Import
//
// PURPOSE: Migrate all existing roll data from ddb_roll_archive.xlsx
// into the Supabase ddb_rolls table. Run this ONCE.
//
// SETUP:
//   npm install xlsx dotenv
//
// USAGE:
//   node import_rolls_to_supabase.js path/to/ddb_roll_archive.xlsx
//
// SAFE TO RE-RUN: Uses upsert with unique constraint, so duplicates
// are ignored.
// ═══════════════════════════════════════════════════════════════════

const XLSX = require('xlsx');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// ── Load .env from vault root ───────────────────────────────
const dotenvPath = require('path').resolve(__dirname, '..', '.env');
require('dotenv').config({ path: dotenvPath });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_KEY.');
  console.error('Make sure .env exists in the vault root with both values set.');
  process.exit(1);
}

// Campaign name → Supabase campaign ID mapping
const CAMPAIGN_MAP = {
  'Sky Is The Limit':           1,
  'Pacts & Power':              2,
  'Ashfall Brittania':          3,
  'Where the Flowers Forget':   4,
};

// ─── HTTP helper (no external deps beyond xlsx) ──────────────────

function supabaseFetch(path, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/rest/v1/${path}`, SUPABASE_URL);
    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal',
      },
    };

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Supabase ${method} ${path}: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ─── Import logic ────────────────────────────────────────────────

async function importSheet(sheetName, ws, campaignId) {
  const jsonRows = XLSX.utils.sheet_to_json(ws);
  console.log(`\n📊 ${sheetName}: ${jsonRows.length} rows found`);

  if (jsonRows.length === 0) return 0;

  // Map Excel columns to Supabase schema
  const rows = jsonRows.map(row => {
    // Handle individualValues — could be string, array, or JSON
    let iv = row.individualValues || null;
    if (typeof iv === 'string') {
      try { iv = JSON.parse(iv); } catch { /* leave as string */ }
    }
    if (iv && !Array.isArray(iv)) iv = [iv];

    return {
      campaign_id: campaignId,
      timestamp_iso: row.timestamp_iso || (row.timestamp_unix ? new Date(row.timestamp_unix).toISOString() : new Date(0).toISOString()),
      timestamp_unix: row.timestamp_unix || 0,
      character: row.character || null,
      user_id: row.userId || null,
      action: row.action || 'custom',
      roll_type: row.rollType || 'roll',
      roll_kind: row.rollKind || '',
      dice_notation: row.diceNotation || null,
      modifier: typeof row.modifier === 'number' ? row.modifier : 0,
      total: typeof row.total === 'number' ? row.total : null,
      individual_values: iv ? JSON.stringify(iv) : null,
      source: row.source || 'web',
      set_id: row.setId || null,
      roll_id: row.rollId || null,
    };
  });

  // Filter out rows with no timestamp (bad data)
  const valid = rows.filter(r => r.timestamp_unix > 0);
  const skipped = rows.length - valid.length;
  if (skipped > 0) {
    console.log(`  ⚠️  Skipped ${skipped} rows with no timestamp`);
  }

  // Batch upsert in chunks of 500
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < valid.length; i += BATCH) {
    const chunk = valid.slice(i, i + BATCH);
    try {
      await supabaseFetch('ddb_rolls', 'POST', chunk);
      inserted += chunk.length;
      process.stdout.write(`  ↳ ${inserted}/${valid.length}\r`);
    } catch (err) {
      console.error(`\n  ❌ Batch error at row ${i}: ${err.message}`);
      // Try individual inserts for this batch to identify the problem row
      for (const row of chunk) {
        try {
          await supabaseFetch('ddb_rolls', 'POST', [row]);
          inserted++;
        } catch (e2) {
          console.error(`  ❌ Row error (rollId: ${row.roll_id}, char: ${row.character}): ${e2.message}`);
        }
      }
    }
  }

  console.log(`  ✅ Imported ${inserted} rolls`);

  // Update campaign sync timestamp
  const maxUnix = Math.max(...valid.map(r => r.timestamp_unix));
  if (maxUnix > 0) {
    const iso = new Date(maxUnix).toISOString();
    await supabaseFetch(`ddb_campaigns?id=eq.${campaignId}`, 'PATCH', {
      last_synced_iso: iso,
      last_synced_unix: maxUnix,
    });
    console.log(`  ↳ Campaign sync timestamp updated: ${iso}`);
  }

  return inserted;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node import_rolls_to_supabase.js <path_to_ddb_roll_archive.xlsx>');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════');
  console.log('DDB Roll Archive → Supabase Import');
  console.log('═══════════════════════════════════════════');
  console.log(`File: ${filePath}`);

  const wb = XLSX.readFile(filePath);
  console.log(`Sheets found: ${wb.SheetNames.join(', ')}`);

  let totalImported = 0;

  for (const [sheetName, campaignId] of Object.entries(CAMPAIGN_MAP)) {
    const ws = wb.Sheets[sheetName];
    if (!ws) {
      console.log(`\n⏩ Sheet "${sheetName}" not found, skipping`);
      continue;
    }
    const count = await importSheet(sheetName, ws, campaignId);
    totalImported += count;
  }

  // Also check the _config sheet for game_id values
  const configWs = wb.Sheets['_config'];
  if (configWs) {
    const configRows = XLSX.utils.sheet_to_json(configWs);
    console.log('\n📋 _config sheet found. Campaign IDs:');
    for (const row of configRows) {
      const name = row.sheet_name || row.sheetName;
      const gid = row.gameId || row.game_id;
      if (name && gid) {
        console.log(`  ${name}: gameId = ${gid}`);
        // Update the campaign record with the actual game_id
        const cid = CAMPAIGN_MAP[name];
        if (cid) {
          await supabaseFetch(`ddb_campaigns?id=eq.${cid}`, 'PATCH', { game_id: gid });
          console.log(`    ↳ Updated in Supabase`);
        }
      }
    }
  }

  console.log(`\n🏁 Import complete. Total rolls imported: ${totalImported}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
