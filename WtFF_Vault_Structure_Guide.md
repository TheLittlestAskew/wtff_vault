# Where the Flowers Forget — Obsidian Vault Structure & Content Guide

> **Vault name:** `wtff_vault`
> **Local path:** `C:\Users\theli\Obsidian Vaults\wtff_vault`
> **GitHub repo:** https://github.com/TheLittlestAskew/wtff_vault (private)
> **Campaign launch:** 2026-06-14

Defines every folder, file, and section in this vault. Mirrors the Sky Is The Limit vault structure. Authoritative reference for what goes where during post-session updates.

---

## Vault Map

```
wtff_vault/
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

#### Hub Table Schemas

Column schemas for the hub files. Header format for any per-session section is `## Session [##] — [Title] ([MM/DD/YYYY])`, newest first.

**Campaign Dashboard — Sessions**

| Column | Content |
|---|---|
| Session # | Zero-padded (01, 02, …) |
| Date | MM/DD/YYYY |
| Title | Final chosen session title (must match the session notes file exactly) |
| Notes Link | `[[Session ## — Title]]` |
| Summary | 1–2 sentence session summary |

**Campaign Dashboard — NPC Companions** (NPCs currently traveling with or allied to the party)

| Column | Content |
|---|---|
| Name | NPC name, backlinked: `[[NPC Name]]` |
| Status | Active / Left / Dead / Missing / Captured |
| Joined | Session # when they joined (or "Pre-existing") |
| Notes | Current role, relationship to party, notable changes |

**Campaign Dashboard — Key Antagonists** (known enemies, threats, opposing forces)

| Column | Content |
|---|---|
| Name | Antagonist name, backlinked |
| Affiliation | Faction, group, or independent |
| Status | Active / Defeated / Unknown / Fled |
| Last Seen | Session # and location |
| Notes | Threat level, motives, abilities observed |

**Campaign Dashboard — Locations** (all locations visited or learned about)

| Column | Content |
|---|---|
| Location | Name, backlinked: `[[Location Name]]` |
| Region | Parent region, backlinked, if applicable |
| First Visited | Session # (link with display alias, e.g. `[[Session 01 — Title\|S01]]`) |
| Status | Explored / Partially Explored / Known But Unvisited / Hostile / Safe |
| Notes | Key details, who/what is there |

**Campaign Dashboard — Open Threads** (unresolved storylines, mysteries, objectives)

| Column | Content |
|---|---|
| Thread | Description of the open question or objective |
| Introduced | Session # |
| Status | Open / In Progress / Completed (Session #) / Abandoned |
| Related | Backlinks to characters, locations, sessions involved |

**Campaign Dashboard — In-Game Timeline** (elapsed in-story time)

| Column | Content |
|---|---|
| Phase | Narrative phase description (e.g., "The Uprooter Interviews") |
| Sessions | Session range (e.g., S01, S03–S04) |
| In-Game Time | Estimated elapsed time / calendar reference |
| Notes | Special rules or context |

**Loot Tracker.md** — one section per session, newest first. Section header as above.

| Column | Content |
|---|---|
| Item Name | Name of the item or artifact |
| Acquired By | Who picked it up or received it |
| Current Holder | Who has it now (may differ from acquired by) |
| Status | Held / Equipped / Lost / Destroyed / Given Away / Stored |
| Notes | Properties, abilities, context of acquisition |
| Session Acquired | Session # (redundant with header but useful for search) |

**Quote Board Master.md** — one section per session, newest first. Verbatim only. Entry format:

```markdown
**[[Character Name]] · [Tag]**
> "[Verbatim quote]"
```

Valid tags: `[Funny]` · `[Poignant]` · `[DM Quip]` · `[Banter]` · `[Serious]` · `[Important to Story]`. Attribute to the character (in-character speech) or `Player (OOC)` for out-of-character. Preserve order of occurrence within each session.

**Profanity Ledger.md** — a running-totals section at the top, then one section per session.

Running Totals (top of file):

| Column | Content |
|---|---|
| Speaker | Player/character name |
| Campaign Total | Running count across all sessions |
| Most Common | Their most-used curse word |

Per-session table:

| Column | Content |
|---|---|
| Speaker | Who said it |
| Curse Word | The word used |
| Frequency | Count within this session |
| Context | Brief description of the moment |

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

## Corrected-Transcript Speaker-Label Conventions

The `Corrected/` transcripts are formatted as a script. These conventions are **load-bearing for Phase B output** — follow them exactly:

- Character names in **ALL CAPS** for in-character speech: `BRUIN:`, `ARTIE:`, `BE-BO:`
- Player name + `(OOC)` for out-of-character speech: `TAYLOR (OOC):`, `WILL (OOC):`
- `DM:` for DM narration (or the named DM); `NPC NAME:` when the DM is voicing a specific, identified NPC
- `[inaudible/cut off]` markers retained as-is — never guess at obscured text
- One blank line between each speaker entry
- Original timestamps preserved

## Backlink Conventions

Backlinks are the connective tissue of the vault. Every note links to related content.

| Content Type | Backlink Format | Example |
|---|---|---|
| PC names | `[[Character Name]]` | `[[Isla 'Bruin' Kaplan]]` |
| NPC names | `[[NPC Name]]` | `[[Margaret “Mags” HoneyThatcher]]` |
| Locations | `[[Location Name]]` | `[[Hearthread Hall]]` |
| Sessions | `[[Session ## — Title]]` | `[[Session 01 — Winds in the East, Mist comin' in...]]` |
| Factions | `[[Faction Name]]` | `[[The Uprooters]]` |
| Creatures | `[[Creature Name]]` | `[[Creature Name]]` |
| Plants/Fungi | `[[Plant Name]]` | `[[Plant Name]]` |

**Rules:** Backlink on first mention within a section (not every occurrence). Use a display alias when the cell needs a short form: `[[Session 01 — Title\|S01]]`, `[[Margaret “Mags” HoneyThatcher\|Mags]]`. The Campaign Dashboard links to everything — it is the central hub. Every page ends with a `## Related` section of backlinks.

## File-Naming Conventions Summary

| Type | Format | Example |
|---|---|---|
| Session Notes | `Session [##] — [Title].md` (em dash) | `Session 01 — Winds in the East, Mist comin' in....md` |
| Raw Transcripts | `[##]-[MMddyy]_raw_transcript.md` | `01-061426_raw_transcript.md` |
| Corrected Transcripts | `[##] - [MMddyy]_corrected.md` | `01 - 061426_corrected.md` |
| Spell Check Logs | `[MMddyy]_Spell_Check_Log.md` | `061426_Spell_Check_Log.md` |
| PCs | `[Character Name].md` | `Isla 'Bruin' Kaplan.md` |
| NPCs | `[NPC Name].md` | `Margaret “Mags” HoneyThatcher.md` |
| Locations | `[Location Name].md` | `Hearthread Hall.md` |
| Regions | `[Region Name].md` | `Rhus Valley.md` |
| Factions | `[Faction Name].md` | `The Uprooters.md` |
| Creatures | `[Creature Name].md` | `[Creature Name].md` |
| Plants/Fungi | `[Plant or Fungus Name].md` | `[Plant Name].md` |
| Media | Descriptive name | `region_map.png` |

> Trackers are **single files** — no S##–S## rotation. The crossover roster under `03-Characters/PCs/Where The Flowers Remember/` (WtFR) is user-maintained reference, not auto-generated.

## Pre-Launch Status (2026-06-05)
**Done:** folders, templates, Campaign-Hub trackers, mechanics scaffolds, structure guide, README, .gitignore, DM notes stub.

**Pending inputs:** player names + DDB user IDs → PC pages & attribution; DM identity → rename DM notes; live DDB `game_id` → roll archive wiring; pre-launch lore drop → World-Lore pages and the player's own PC page.

## Update Cadence
After each session, run the post-session update checklist (adapt from SITL's Convo 2). **Before writing any vault files, read** `DND_Sources/DM Notes.md` and `00-Campaign-Hub/Campaign Dashboard.md`. The Obsidian Git plugin auto-commits/pushes every ~10 minutes.
