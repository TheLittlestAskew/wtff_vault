# Roll Statistics — Where the Flowers Remember

> Roll trends and stats across sessions, sourced from the D&D Beyond roll archive (Supabase, SystemHorizon project).

## ⚠️ Roll archive: NOT YET WIRED
This campaign cannot sync DDB rolls until it has a live D&D Beyond **game_id**.

- In `ddb_campaigns`: **id 4**, sheet_name `Where the Flowers Remember`, **game_id `0`**, status **paused**.
- Once the DDB game exists, update `ddb_campaigns` row 4 with the real `game_id` and flip status to `active`, then a `wtfr_session_rolls` view can be created (mirror of `sitl_session_rolls`).
- Sync uses `ddb_sync_supabase.js` → `await syncCampaign('Where the Flowers Remember', 'BEARER_TOKEN')`.

_Pending: DDB game_id, player DDB user IDs for attribution._

---

## Per-Character Totals
| Character | Total Rolls | Avg d20 | Crit Successes | Crit Fails |
|---|---|---|---|---|
| | | | | |

## Per-Session Roll Counts
| Session | Date | Total Rolls | Notes |
|---|---|---|---|
| | | | |
