# Vault Sync Status — Where the Flowers Forget

> Tracks which sessions are fully processed into the vault and which artifacts exist for each.

**Overall status:** 🟢 Live — Sessions 01–02 synced (S02: 2026-06-29)
**Vault synced through:** **Session 02 — I Can Feel It In My Bones** (05/04/2026 — pre-campaign; pipeline label S02)
**Campaign launch:** 2026-06-14

## Per-Session Sync
| Session | Date | Transcript | Spell Check | Session Notes (md) | Vault Markdown | POV Journal | Rolls Synced | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | 05/04/2026 | ✅ Corrected | ✅ | ✅ (markdown-first; no .docx) | ✅ | ✅ (no IC entry; archivist stub logged — OOC session) | ➖ 0 rolls; OOC session; DDB archive not wired | ✅ Synced |
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
| 2026-06-29 | S02 | **Convo 2 propagation (automated, non-interactive). Pre-campaign OOC session.** Created: [[The Overgrowth]] lore stub (`04-World-Lore/Artemesia/`), [[Mouth that Feeds]] location page, [[Shmeetz]] NPC stub. Appended: Loot Tracker (no loot note), Quote Board (8 quotes), Profanity Ledger (2 Adam DM lines + running totals updated), POV Journal (archivist stub — no IC entry), Bruin PC page (S02 Backstory + Personality + Key Event), Liriope River Net Campaign Events. Updated: Campaign Dashboard (S02 sessions row, Locations, In-Game Timeline), Location Index (Mouth that Feeds + 6 first-seen provisional locations), `_Campaign_Setup.md` (Overgrowth seeded, provisional locations logged). Vault Sync Status updated last. |
| 2026-06-29 | S02 | **Open flags carried forward:** Session number mismatch (pipeline "S02" vs audio "00") — awaiting Taylor’s confirmation to relabel. "The Overgrowth" capitalization — confirm with Adam. 6 first-seen locations (Floravale, Petaline, Nether Current, Blackwater Row, Bug Island, Red Haven) logged as provisional (≤60%) in Location Index — cross-reference world doc before seeding lore pages. ⚠️ Website sync (rectrixcaedere ARC) — **SKIPPED pending Taylor’s confirmation** of whether a pre-campaign OOC call should appear in the public site ARC. DM Notes.md does not exist yet. |
| 2026-06-19 | S01 | **Convo 2 propagation (automated, non-interactive).** Created POV journal ([[Isla ‘Bruin’ Kaplan Journal]]); lore pages [[The Uprooters]], [[Hearthread Hall]], [[Rhusatatiam]], [[The Petal Line]], [[The Hollow King]], [[The Pistil]]; companion [[Nero]]. Expanded [[Aiphrumfite ‘Aiph’\|Aiph]] and all 6 PC pages (descriptors + key events). Updated Dashboard, Loot Tracker, Quote Board, Profanity Ledger, Open Threads, Location Index; appended Rhus Valley / Liriope River Net / Flower Court lore; logged Dolm’s Mending in Spell_Usage. |
| 2026-06-19 | S01 | ⚠️ **PII:** scrubbed DDB `username`/`user_id`/`character_id` from tracked PC-page frontmatter and the DM username from the Dashboard frontmatter (kept first names). **These values remain in prior git history** of a PUBLIC repo — recommend a history scrub (e.g. `git filter-repo`) and review of whether any exposed IDs warrant action. `05-Mechanics/Roll_Statistics.md` left untouched (gap: no live `wtff_session_rolls` view). |
| 2026-06-19 | S01 | **Open flags carried forward:** Aiph STT variants, Auriron spelling, Liriope Valley vs River Net, Bebo Engineering vs Energy — all await Taylor’s approval (see [[_Campaign_Setup]]). House Rules & Rulings: no new DM rulings this session. |
