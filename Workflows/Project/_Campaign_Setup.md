# _Campaign_Setup.md — Where the Flowers Forget

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
| DM identity | ✅ known | **Adam** runs WtFF (this campaign). **Alec** runs the parallel campaign *Where the Flowers Remember* (WtFR). | Source authority; rename `DND_Sources/DM Notes.md` → `Notes from Adam.md` | Session 1 (2026-06-14) |
| Player roster (names) | ❓ partial | Taylor (Isla), Lydia (Eliza), Rachel (Zarna); players behind Artie / BE-BO / Tobias not yet known by first name | PC pages; party-present lists | Session 1 (2026-06-14) |
| DDB user IDs (per player) | ✅ captured | _local only — all 6 PCs' usernames/userIds + characterIds are in gitignored `Workflows/scripts/ddb_party.json` (Artie's characterId still missing). Do NOT record IDs/usernames in this PUBLIC file (first names only)._ | Roll attribution; `user_id` → character map | Session 1 (2026-06-14) |
| Live DDB `game_id` | ✅ known | `7853407` | Roll archive wiring; `wtff_session_rolls` view; rectrixcaedere page | Session 1 (2026-06-14) |
| Your POV character (your PC) | ✅ known | Isla 'Bruin' Kaplan — Shifter Barbarian (Path of the Totem Warrior) | POV journal voice; Convo 1 POV section; `02-Character_Journal/[POV] Journal.md` | Session 1 (2026-06-14) |
| System / ruleset | ✅ known | D&D 5e (D&D Beyond back-end; ability checks, advantage/disadvantage, classes/subclasses) | Rules references in notes | Session 1 (2026-06-14) |
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

## Campaign structure — TWO parallel campaigns (read before processing any session)

This world is told as **two full, parallel campaigns** that occasionally **cross over**:

- **Where the Flowers Forget (WtFF)** — *this vault's campaign.* DM: **Adam**. Taylor plays here (PC: Isla "Bruin" Kaplan). Full canon lives in this vault.
- **Where the Flowers Remember (WtFR)** — a **separate full campaign**, DM: **Alec**. **Taylor has no access to it except where it crosses over with WtFF.**

**Operating rule for the pipeline:** WtFR is **NOT** built out as canon here. Capture WtFR people, places, and events **only as crossover touchpoints, from the WtFF party's point of view** — lightweight stubs, never full character sheets or lore pages. Do not infer WtFR-internal facts; if WtFF characters weren't present to witness it, it doesn't get recorded.

**Session types & speaker counts:**
- **Regular WtFF session:** 1 DM (Adam) + 6 PCs = **~7 speakers**. Transcribe at `--speakers 7` (the new default).
- **Joint / crossover session:** both DMs + both parties = **up to ~14 speakers**. Transcribe at `--speakers 14`. (Session 1 / 2026-06-14 was one of these.)

**WtFR contacts seen in crossover so far (stubs only):** PCs — Lute, Nyx (Holly), Rowan (Josh), Auroran (Huey), Kidu, Dolm; recruiter NPC — Margaret "Mags" Honeythatch. File crossover stubs under `03-Characters/05 Crossover (WtFR)/`. The WtFF-side recruiter NPC is **Aeth / Amprum Fright** (Adam's NPC) — that one IS WtFF canon.

---

## Known now (seed)

- **Campaign:** Where the Flowers Forget. Launch **2026-06-14**. (Parallel campaign: *Where the Flowers Remember*, DM Alec — crossover-only; see "Campaign structure" above.)
- **Vault:** `wtff_vault`; structure per `WtFF_Vault_Structure_Guide.md`.
- **Your role:** player — you have a POV character / your own PC page; the DM is someone else (identity pending). *(Confirm if this changes.)*
- **Roll archive:** live `game_id` is `7853407` (captured Session 1, 2026-06-14). Update the roll-archive registration / rectrixcaedere wiring from the paused `game_id 0` placeholder to `7853407`.
- **World lore + your character info** already exist in the vault; everything else accrues from play.
