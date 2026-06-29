# Vault Sync Status — Where the Flowers Forget

> Tracks which sessions are fully processed into the vault and which artifacts exist for each.

**Overall status:** 🟢 Live — Sessions 01–02 synced (real S02 062826: 2026-06-29)
**Vault synced through:** **Session 02 — Something's Changing** (06/28/2026)
**Campaign launch:** 2026-06-14

## Per-Session Sync
| Session | Date | Transcript | Spell Check | Session Notes (md) | Vault Markdown | POV Journal | Rolls Synced | Status |
|---|---|---|---|---|---|---|---|---|
| 02 (062826) | 06/28/2026 | ⚠️ Missing (`02 - 062826_corrected.md` not found) | ➖ (no corrected transcript) | ✅ (markdown-first; Session 02 — Something's Changing) | ⚠️ Partial — Aiph page NOT updated (Unicode filename encoding blocks write tools; manual fix needed) | ✅ (Bruin — S02 collapsible entry) | ➖ 31 rolls per handoff; transcript-only (DDB archive not wired) | ⚠️ Partial |
| 02 (050426) | 05/04/2026 | ✅ Corrected | ✅ | ✅ (markdown-first; no .docx) | ✅ | ✅ (no IC entry; archivist stub logged — OOC session) | ➖ 0 rolls; OOC session; DDB archive not wired | ✅ Synced |
| 01 | 06/14/2026 | ✅ Corrected | ✅ | ✅ (markdown-first; no .docx) | ✅ | ✅ (Bruin) | ➖ transcript-only (DDB archive not wired) | ✅ Synced |

## Setup Checklist
| Item | Status |
|---|---|
| Folder skeleton | ✅ |
| Page templates | ✅ |
| Campaign-Hub trackers | ✅ |
| Mechanics scaffolds | ✅ |
| Player-character pages | ✅ created (6 PCs, descriptors filed S01) |
| DM identified / DM Notes file named | 🟡 DM = Adam (known); `DM Notes.md` not yet renamed to `Notes from Adam.md` |
| DDB roll archive wired (game_id) | ⏳ game_id `7853407` known; `wtff_session_rolls` view not yet created |
| World-lore pages (pre-launch lore) | ✅ S01 seeds created (Uprooters, Hearthread Hall, Rhusatatiam, Petal Line, Hollow King, Pistil) |

## Change Log
| Date | Session | Change |
|---|---|---|
| 2026-06-29 | S02 (062826) | **Convo 2 propagation (automated, non-interactive). Real play session (06/28/2026) — "Something's Changing."** Created: [[Orin]] NPC, [[Malus Thornwake]] NPC stub, [[Sunroute Crossing]] loc, [[Brindleberry Hollow]] loc, [[Cardona]] loc, [[Northern Roost Valley]] loc. Appended/edited: Loot Tracker (S02 section: 3 new items + WtFR crossover table), Quote Board (19 quotes), Profanity Ledger (9 entries + running totals), POV Journal (Bruin S02 collapsible), all 6 PC pages (descriptors + key events), Nero companion page, Hearthread Hall (description + event), The Uprooters (Open Mysteries + event), Spell_Usage (5 S02 entries), Open Threads & Mysteries (10 new threads), Location Index (4 new S02 locations), Campaign Dashboard (Sessions, NPCs, Locations, Open Threads, Timeline, session_count→2). ⚠️ **MANUAL FOLLOW-UP REQUIRED:** (1) Aiph PC page NOT updated — Unicode curly apostrophes in filename block all write tools; S02 content to add: Personality bullets (age 150-250, 150+ yr partnership with Mags, fear as flatness, unnamed "he", reads individuals) + S02 Key Event row. (2) Corrected transcript `02 - 062826_corrected.md` missing from pipeline — background agent write may have failed. (3) DM Notes.md still does not exist at expected path. |
| 2026-06-29 | S02 (050426) | **Convo 2 propagation (automated, non-interactive). Pre-campaign OOC session.** Created: [[The Overgrowth]] lore stub (`04-World-Lore/Artemesia/`), [[Mouth that Feeds]] location page, [[Shmeetz]] NPC stub. Appended: Loot Tracker (no loot note), Quote Board (8 quotes), Profanity Ledger (2 Adam DM lines + running totals updated), POV Journal (archivist stub — no IC entry), Bruin PC page (S02 Backstory + Personality + Key Event), Liriope River Net Campaign Events. Updated: Campaign Dashboard (S02 sessions row, Locations, In-Game Timeline), Location Index (Mouth that Feeds + 6 first-seen provisional locations), `_Campaign_Setup.md` (Overgrowth seeded, provisional locations logged). Vault Sync Status updated last. |
| 2026-06-29 | S02 | **Open flags carried forward:** Session number mismatch (pipeline "S02" vs audio "00") — awaiting Taylor’s confirmation to relabel. "The Overgrowth" capitalization — confirm with Adam. 6 first-seen locations (Floravale, Petaline, Nether Current, Blackwater Row, Bug Island, Red Haven) logged as provisional (≤60%) in Location Index — cross-reference world doc before seeding lore pages. ⚠️ Website sync (rectrixcaedere ARC) — **SKIPPED pending Taylor’s confirmation** of whether a pre-campaign OOC call should appear in the public site ARC. DM Notes.md does not exist yet. |
| 2026-06-19 | S01 | **Convo 2 propagation (automated, non-interactive).** Created POV journal ([[Isla ‘Bruin’ Kaplan Journal]]); lore pages [[The Uprooters]], [[Hearthread Hall]], [[Rhusatatiam]], [[The Petal Line]], [[The Hollow King]], [[The Pistil]]; companion [[Nero]]. Expanded [[Aiphrumfite ‘Aiph’\|Aiph]] and all 6 PC pages (descriptors + key events). Updated Dashboard, Loot Tracker, Quote Board, Profanity Ledger, Open Threads, Location Index; appended Rhus Valley / Liriope River Net / Flower Court lore; logged Dolm’s Mending in Spell_Usage. |
| 2026-06-19 | S01 | ⚠️ **PII:** scrubbed DDB `username`/`user_id`/`character_id` from tracked PC-page frontmatter and the DM username from the Dashboard frontmatter (kept first names). **These values remain in prior git history** of a PUBLIC repo — recommend a history scrub (e.g. `git filter-repo`) and review of whether any exposed IDs warrant action. `05-Mechanics/Roll_Statistics.md` left untouched (gap: no live `wtff_session_rolls` view). |
| 2026-06-19 | S01 | **Open flags carried forward:** Aiph STT variants, Auriron spelling, Liriope Valley vs River Net, Bebo Engineering vs Energy — all await Taylor’s approval (see [[_Campaign_Setup]]). House Rules & Rulings: no new DM rulings this session. |
