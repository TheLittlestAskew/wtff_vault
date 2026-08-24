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
| Player roster (names) | ✅ known | Taylor (Isla "Bruin"), Lydia (Eliza), Rachel (Zarna), **Will (Artie), Evan (BE-BO), Seth (Tobias)** | PC pages; party-present lists | Session 1 (2026-06-14) |
| DDB user IDs (per player) | ✅ captured | _local only — all 6 PCs' usernames/userIds + characterIds are in gitignored `Workflows/scripts/ddb_party.json` (Artie's characterId still missing). Do NOT record IDs/usernames in this PUBLIC file (first names only)._ | Roll attribution; `user_id` → character map | Session 1 (2026-06-14) |
| Live DDB `game_id` | ✅ known | `7853407` | Roll archive wiring; `wtff_session_rolls` view; rectrixcaedere page | Session 1 (2026-06-14) |
| Your POV character (your PC) | ✅ known | Isla 'Bruin' Kaplan — Shifter Barbarian (Path of the Totem Warrior) | POV journal voice; Convo 1 POV section; `02-Character_Journal/[POV] Journal.md` | Session 1 (2026-06-14) |
| System / ruleset | ✅ known | D&D 5e (D&D Beyond back-end; ability checks, advantage/disadvantage, classes/subclasses) | Rules references in notes | Session 1 (2026-06-14) |
| Setting basics | ❓ partial | (lore lives in `04-World-Lore/`) | Locations / Regions / Factions seeding | |
| Campaign spelling terms | ❓ partial | S01 proper nouns now seeded as lore pages (Hearthread Hall, Rhusatatiam, The Uprooters, Petal Line, Hollow King, Pistil). **Pending Taylor's approval:** Aiph STT variants "Eeth/Eighth/Ava/Eiff/8th"; "Auriron" vs DM "A-U-Roran"; "Liriope Valley" vs "Liriope River Net"; Bebo "Engineering" vs "Energy". **S02 (2026-05-04, pre-campaign):** "The Overgrowth" — Adam's in-world term for intensifying natural events; first-seen in S02 transcript [00:13:35]–[00:13:39]; capitalization uncertain (lowercase in speech); lore stub seeded: `04-World-Lore/Artemesia/The Overgrowth.md` (Convo 2, S02, 2026-06-29) — ⚠️ confirm capitalization with Adam. First-seen locations (unconfirmed spellings ≤60%): Floravale, Petaline/Petal Line?, Nether Current, Blackwater Row, Bug Island, Red Haven — logged in Location Index as provisional; cross-reference world doc before seeding lore pages. **S03 (2026-07-12):** approved corrections applied per `_pipeline/S03/spellcheck.md` (Aiph variants 8th/eighth/Aef/Aeve/AIF/Abe/ave→**Aiph**; Roostation/rustication→**Rhusatatiam**; Salvador→**Salvia Forest**; Arthread/Arthrit→**Hearthread Hall**; Loot→**Lute**; Oren→**Orin**; plus PC-name STT slips). First-seen (≤60%, flagged — Convo 2 to seed & Adam to confirm): NPCs **Constance** (magic shop in [[The Burn]]), **Derek** (tinkerer, [[The Bloom]]), **Delilah** (server); locations **The Verdant Blossom** (green train), **"X Marks the Spot" Inn**; calendar term **"vent"** (Delilah, "first of vent"). ⚠ **Sunroot vs Sunroute Crossing** left unresolved — DM spoke "Sunroot" + DM art `Sunroot_Crossing.png`, existing lore page is `Sunroute Crossing.md`; confirm with Adam before renaming. | Convo 1 spell-check canon | S01 (2026-06-14) |
| Notes output format | ✅ decided | **Markdown-first** — canonical note authored from `Templates/Session Notes Template.md` into `01-Sessions/`. No `.docx` generator. | Convo 1 Step 6 | Session 1 (2026-06-14) |
| Physical-dice players | ❓ unknown | | Roll-log "physical dice" marking | |

---

## Decisions Log

Append a row whenever a convention is chosen, so the pipeline stays consistent and you can see *why* later.

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-14 | Session notes are **markdown-first**: author the canonical note from `Templates/Session Notes Template.md` into `01-Sessions/Session ## — <Title>.md` (em dash). No `.docx`. | Matches Convo 1 Step 6; SITL's styled `.docx` generator is deliberately not ported to WtFF. |
| 2026-06-14 | When the transcript contains **STT name-variants not in the approved spell-check table**, leave them verbatim and flag them — do not extend the correction beyond the approved table. | Honors "apply ONLY approved corrections / no silent fixes." (S01: Aiph variants "Eeth/Eighth/Ava/Eiff/8th" left verbatim, flagged.) |
| 2026-06-14 (Convo 2) | Seeded the **first lore/faction/NPC pages** from S01: [[The Uprooters]] (faction), [[Hearthread Hall]] & [[Rhusatatiam]] & [[The Petal Line]] (locations), [[The Hollow King]] & [[The Pistil]] (NPC stubs). Expanded [[Aiphrumfite ‘Aiph‘|Aiph]] and [[Nero]]. PC pages given descriptor/key-event sections. | First propagation pass; built from `Templates/`. No `_Campaign_Setup` pending input was newly *resolved* (POV/DM/roster/game_id already set in setup). |
| 2026-06-14 (Convo 2) | **Scrubbed DDB `username`/`user_id`/`character_id` from the tracked PC-page frontmatter** (kept first name + race + class). IDs live only in gitignored `ddb_party.json`. | Public-repo PII rule. NOTE: these values remain in prior git history — recommend history scrub + credential review (see Vault Sync Status change-log). |
| 2026-07-12 (Convo 1, S03) | **Corrected-transcript diarization convention:** because SPEAKER A carries all DM narration + every NPC voice and IC/OOC speech interleaves line-by-line, speakers are relabeled `FIRSTNAME (Character)` (first names only, PII rule) rather than split per-line into IC character names vs `(OOC)`. A header note + `_pipeline/S##/flags.md` document the OOC ranges. Logged as a transparency deviation (accuracy over polish). | Full per-line IC/OOC + per-NPC attribution isn't reliably automatable for a 147-min solo session; the labeling keeps who-spoke unambiguous without asserting IC/OOC on mixed lines. |
| 2026-07-12 (Convo 1, S03) | **No new Pending Input resolved this session.** DM (Adam), roster, POV (Bruin), game_id all re-confirmed on-air but already known; **physical-dice players remain ❓** (every S03 roll was verbal). No Supabase touched (roll archive still unwired). | Honors "only record what the session supplies." |
| 2026-08-02 (Convo 1, S04/080226) | **🛑 `04-080226_raw_transcript.md` is BLOCKED — it is a Sky Is The Limit session (DM Addison, *Out of the Abyss*), not WtFF.** Phase B was not run: no corrections applied (the approved `_pipeline/S04/spellcheck.md` approves **0 of 88** rows and is itself a blocker), **no corrected transcript written**, **no session note created**, no Supabase touched, no website `ARC` entry. Only `Session_Sources/Transcripts/Spell_Check_Logs/080226_Spell_Check_Log.md` was added. Reroute the file to the SITL pipeline (already staged there as **S21**) and clear the stray from `Raw_Unedited/`. ⚠️ **Three files claim number `04`** — only `04-072626` is the real WtFF S04, and **its session note has still never been written** (`01-Sessions/` holds S00–S03 only). **No Pending Input resolved; physical-dice players remains ❓.** A WtFF 2014/2024 house-rule claim appears at [1182, 1298] but is **second-hand from another table (≤60%) and deliberately NOT recorded** — verify against `04-072626` or with Adam. | Applying the table would have imported Forgotten Realms / *Out of the Abyss* lore into an original-setting vault ("never import external/published lore") and published a fabricated session to the live public site, which reads `01-Sessions/` from `raw.githubusercontent.com`. Logged here so the file is not reprocessed a fourth time. |
| 2026-06-21 | **WtFF rectrixcaedere session reader is live** (`where-the-flowers-forget/session.html` + `archive.html` map). Ported the SITL website wiring, adjusted for WtFF: Convo 1 Step 6 now carries a **Website Parser Contract** (load-bearing `##`/`###` heading names the reader extracts) and Convo 2 adds a **Website Session Sync** step (append to the `session.html` `ARC` array **and** the `archive.html` map list — two files; `tags:[{l,c}]`, no `rec` field). Convo 2 note step is VERIFY (not CREATE). | Site reads the note live from `raw.githubusercontent.com/.../wtff_vault/main`; heading names are load-bearing. `ddb_sessions` registration stays deferred — WtFF's session registry is the `ARC` array, and no rolls/`wtff_session_rolls` data exist yet (reader shows "roll archive pending"). |

---

## Campaign structure — TWO parallel campaigns (read before processing any session)

This world is told as **two full, parallel campaigns** that occasionally **cross over**:

- **Where the Flowers Forget (WtFF)** — *this vault's campaign.* DM: **Adam**. Taylor plays here (PC: Isla "Bruin" Kaplan). Full canon lives in this vault.
- **Where the Flowers Remember (WtFR)** — a **separate full campaign**, DM: **Alec**. **Taylor has no access to it except where it crosses over with WtFF.**

**Operating rule for the pipeline:** WtFR **story/lore is NOT built out here.** Capture WtFR events **only as crossover touchpoints, from the WtFF party's point of view** — do not infer WtFR-internal facts; if WtFF characters weren't present to witness it, it doesn't get recorded. **However, the WtFR roster IS known reference:** Taylor maintains roster cards (name, player, race, class, portrait) for the WtFR characters under `03-Characters/01 PCs/Where The Flowers Remember/`. These are **user-maintained — read them for canonical names/players, never overwrite or auto-generate them.** A WtFR name that has a roster card there is canonical (use it to correct transcript STT at normal canon confidence); only a WtFR name with *no* card stays ≤60% first-seen.

**Session types & speaker counts:**
- **Regular WtFF session:** 1 DM (Adam) + 6 PCs = **~7 speakers**. Transcribe at `--speakers 7` (the new default).
- **Joint / crossover session:** both DMs + both parties = **up to ~14 speakers**. Transcribe at `--speakers 14`. (Session 1 / 2026-06-14 was one of these.)

**WtFR roster (Taylor's cards, `01 PCs/Where The Flowers Remember/`):** Lute (Jordan), Nyx (Holly), Rowan (Josh), **Auriron** (Huey), Kidu (Kevin), Dolm (CJ); recruiter NPC **Margaret "Mags" HoneyThatcher** (run by Alec). The WtFF-side recruiter NPC is **Aiphrumfite "Aiph"** (Adam's NPC; page `03-Characters/01 PCs/Aiphrumfite 'Aiph'.md`) — that one IS WtFF canon. The transcript's "Am from Fright / Aeth" STT variants normalize to **Aiphrumfite / Aiph**.

---

## Known now (seed)

- **Campaign:** Where the Flowers Forget. Launch **2026-06-14**. (Parallel campaign: *Where the Flowers Remember*, DM Alec — crossover-only; see "Campaign structure" above.)
- **Vault:** `wtff_vault`; structure per `WtFF_Vault_Structure_Guide.md`.
- **Your role:** player — you have a POV character / your own PC page; the DM is someone else (identity pending). *(Confirm if this changes.)*
- **Roll archive:** live `game_id` is `7853407` (captured Session 1, 2026-06-14). Update the roll-archive registration / rectrixcaedere wiring from the paused `game_id 0` placeholder to `7853407`.
- **World lore + your character info** already exist in the vault; everything else accrues from play.
