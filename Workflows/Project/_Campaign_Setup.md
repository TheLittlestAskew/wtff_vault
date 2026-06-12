# _Campaign_Setup.md — Where the Flowers Remember

**This is the living bootstrap file for the documentation pipeline.** The Convo 1 and Convo 2 workflows read it *first* and update it as the campaign reveals information. Its job: hold what we already know, flag what we still need, and record decisions as they're made — so the instruction docs fill themselves in instead of waiting on a manual pass.

> Read this alongside the static instruction docs. Those define *how* the pipeline works (and rarely change). This file holds *what's specific to this campaign* — and it grows.

---

## How this self-builds

1. **Every Convo 1 and Convo 2 starts here** (their Step 0). Read this file before anything else.
2. **If a session — or out-of-game setup — reveals a pending input** (the DM's name, a player's DDB ID, the game's `game_id`, your PC, a recurring spelling, a format choice), **record the value in the Pending Inputs table below, then update any doc listed under "Unblocks."**
3. **Never invent a value.** An input stays `❓ unknown` until the campaign actually supplies it. Better an honest gap than a wrong guess.
4. **Log every convention choice** in the Decisions Log so the pipeline adapts consistently instead of re-deciding.
5. When every Pending Input is resolved, the campaign is **fully wired** — and this file becomes a decisions archive.

---

## Pending Inputs

Update Status to ✅ and fill Value the moment the campaign reveals it. Note the session (or "setup") where it surfaced.

| Input | Status | Value (once known) | Unblocks | First captured |
|---|---|---|---|---|
| DM identity | ❓ unknown | | Source authority; rename `DND_Sources/DM Notes.md` → `Notes from [DM].md` | |
| Player roster (names) | ❓ unknown | | PC pages; party-present lists | |
| DDB user IDs (per player) | ❓ unknown | _local only — kept in gitignored `Workflows/scripts/ddb_party.json`; do NOT record IDs/usernames in this PUBLIC file (first names only)_ | Roll attribution; `user_id` → character map | |
| Live DDB `game_id` | ❓ unknown | | Roll archive wiring; `wtfr_session_rolls` view; rectrixcaedere page | |
| Your POV character (your PC) | ❓ unknown | | POV journal voice; Convo 1 POV section; `02-Character_Journal/[POV] Journal.md` | |
| System / ruleset | ❓ unknown | | Rules references in notes | |
| Setting basics | ❓ partial | (lore lives in `04-World-Lore/`) | Locations / Regions / Factions seeding | |
| Campaign spelling terms | ❓ unknown | | Convo 1 spell-check canon | |
| Notes output format | ❓ undecided | | Convo 1 Step 6 — markdown via `Templates/Session Notes Template.md`, or a `.docx` generator | |
| Physical-dice players | ❓ unknown | | Roll-log "physical dice" marking | |

---

## Decisions Log

Append a row whenever a convention is chosen, so the pipeline stays consistent and you can see *why* later.

| Date | Decision | Rationale |
|---|---|---|
| | | |

---

## Known now (seed)

- **Campaign:** Where the Flowers Remember. Launch **2026-06-14**.
- **Vault:** `wtfr_vault`; structure per `WtFR_Vault_Structure_Guide.md`.
- **Your role:** player — you have a POV character / your own PC page; the DM is someone else (identity pending). *(Confirm if this changes.)*
- **Roll archive:** registered as paused (`game_id 0`) until a live game exists.
- **World lore + your character info** already exist in the vault; everything else accrues from play.
