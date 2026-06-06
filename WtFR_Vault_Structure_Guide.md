# Where the Flowers Remember — Obsidian Vault Structure & Content Guide

> **Vault name:** `wtfr_vault`
> **Local path:** `C:\Users\theli\wtfr_vault`
> **GitHub repo:** https://github.com/TheLittlestAskew/wtfr_vault (private)
> **Campaign launch:** 2026-06-14

Defines every folder, file, and section in this vault. Mirrors the Sky Is The Limit vault structure. Authoritative reference for what goes where during post-session updates.

---

## Vault Map

```
wtfr_vault/
├── 00-Campaign-Hub/
│   ├── Campaign Dashboard.md
│   ├── House Rules & Rulings.md
│   ├── Loot Tracker.md
│   ├── Quote Board Master.md
│   ├── Profanity Ledger.md
│   ├── Open Threads & Mysteries.md
│   ├── Location Index.md
│   ├── Vault Sync Status.md
│   ├── Vault Format Reference.md
│   └── Trackers/
├── 01-Sessions/
│   └── Session [##] — [Title].md
├── 02-Character_Journal/
│   └── [POV Character] Journal.md   (created once the PC is named)
├── 03-Characters/
│   ├── PCs/
│   └── NPCs/
├── 04-World-Lore/
│   ├── Locations/
│   ├── Regions/
│   └── Factions/
├── 05-Mechanics/
│   ├── Roll_Statistics.md
│   └── Spell_Usage.md
├── 06-Media/
├── 07-Flora_Fauna/
│   ├── Creatures/
│   └── Plants_Fungi/
├── Session_Sources/
│   ├── Recordings/                 (git-ignored; create locally)
│   └── Transcripts/
│       ├── Raw_Unedited/
│       ├── Corrected/
│       ├── Spelling_Corrected_Formatted/
│       └── Spell_Check_Logs/
├── DND_Sources/
│   └── DM Notes.md                 (rename to Notes from [DM].md once known)
└── Templates/
    ├── PC Template.md
    ├── NPC Template.md
    ├── Location Template.md
    ├── Faction Template.md
    ├── Creature Template.md
    ├── Plant Fungus Template.md
    └── Session Notes Template.md
```

---

## Folder Breakdown

### `00-Campaign-Hub/`
Central command center. Every other file links back here. Updated after every session.
- **Campaign Dashboard.md** — the hub. Tables: Sessions, NPC Companions, Key Antagonists, Locations, Open Threads, In-Game Timeline.
- **House Rules & Rulings.md** — every DM ruling/homebrew, by topic. Overrides the PHB.
- **Loot Tracker.md** — every item acquired/lost. One section per session, newest first.
- **Quote Board Master.md** — verbatim notable quotes, tagged, one section per session.
- **Profanity Ledger.md** — profanity by speaker; running totals + per-session.
- **Open Threads & Mysteries.md** — detailed unresolved storylines.
- **Location Index.md** — quick-reference of all locations, backlinked.
- **Vault Sync Status.md** — which sessions are fully processed.
- **Vault Format Reference.md** — conventions (backlinks, naming, status vocab).
- **Trackers/** — supplementary trackers as needed.

### `01-Sessions/`
One markdown file per session. **Filename:** `Session [##] — [Title].md` (zero-padded, em dash, title matches the final chosen title exactly). Full notes in markdown with `[[backlinks]]` to characters, locations, items, and other sessions. Backlink on first mention within a section.

### `02-Character_Journal/`
The player character's in-character POV journal, one growing file with a collapsible callout section per session. Paste the POV entry exactly as generated — no edits. POV Journal Hard Limits apply (no OOC, no metagaming, no mechanical language).

### `03-Characters/`
- **PCs/** — one file per player character (+ optional character-sheet PDF snapshots). Use `Templates/PC Template.md`.
- **NPCs/** — one file per NPC. Use `Templates/NPC Template.md`. Start sparse, grow over time. Attribute DM-voiced quotes only when the speaker is clearly identified.

**PC/NPC sections (skip if no info yet):** Description/Appearance · Backstory · Personality · Abilities & Class Features · Inventory/Loot · Relationships · Key Events · Key Quotes · Related. Character sheets = baseline; transcript = authority for anything during play. Update existing entries rather than duplicating; note the session where a change occurred.

### `04-World-Lore/`
- **Locations/** — specific places. Sections: Description · Notable Features · Inhabitants · History · Events · Connections · Related.
- **Regions/** — broader areas containing multiple locations. Sections: Overview · Sub-Locations · Notable Features · Factions Present · Related.
- **Factions/** — political/religious/social groups. Sections: Overview · Leadership · Members · Territory · Relationship to Party · Key Events · Related.

### `05-Mechanics/`
- **Roll_Statistics.md** — roll trends from the DDB archive. **Not wired until a live `game_id` exists** (see file).
- **Spell_Usage.md** — spells cast, by caster/session.
- Also for: first-time class features, multiclass interactions, homebrew, attunement tracking.

### `06-Media/`
All images, maps, screenshots. Set Obsidian `Settings > Files & Links > Default location for new attachments` to `06-Media`. Embed with `![[file.png]]` (optional `|width`). Keep media out of the vault root.

### `07-Flora_Fauna/`
- **Creatures/** — any creature that is NOT a playable race. Sections: Classification · Physical Description · Abilities Observed · Behavior · Threat Level · Encounters · Location · Related.
- **Plants_Fungi/** — plants/fungi/etc. Sections: Physical Description · Properties · Uses · Location Found · Encounters · Related.

### `Session_Sources/`
- **Recordings/** — audio (git-ignored; create locally).
- **Transcripts/Raw_Unedited/** — `[##]-[MMddyy]_raw_transcript.md`. READ ONLY.
- **Transcripts/Corrected/** — `[##] - [MMddyy]_corrected.md`. Script format after spell check.
- **Transcripts/Spelling_Corrected_Formatted/** — intermediate stage.
- **Transcripts/Spell_Check_Logs/** — `[MMddyy]_Spell_Check_Log.md`.

### `DND_Sources/`
Reference + DM input. `DM Notes.md` is **top authority** — read before every update; rename to `Notes from [DM].md` once known. PDFs are git-ignored.

### `Templates/`
Seven templates for consistent new notes: PC, NPC, Location, Faction, Creature, Plant/Fungus, Session Notes.

---

## Pre-Launch Status (2026-06-05)
**Done:** folders, templates, Campaign-Hub trackers, mechanics scaffolds, structure guide, README, .gitignore, DM notes stub.

**Pending inputs:** player names + DDB user IDs → PC pages & attribution; DM identity → rename DM notes; live DDB `game_id` → roll archive wiring; pre-launch lore drop → World-Lore pages and the player's own PC page.

## Update Cadence
After each session, run the post-session update checklist (adapt from SITL's Convo 2). **Before writing any vault files, read** `DND_Sources/DM Notes.md` and `00-Campaign-Hub/Campaign Dashboard.md`. The Obsidian Git plugin auto-commits/pushes every ~10 minutes.
