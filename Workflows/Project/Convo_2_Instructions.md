# WTFR Convo 2 Instructions — Vault Updates

**Status:** Seeded starter (pre-launch). Companion to `Project_Instructions.md` (master ruleset — to be created); all shared rules and constraints from that file apply here.

This document defines the workflow for **Convo 2**: updating the Where the Flowers Remember Obsidian vault after session notes are generated in Convo 1. The vault is the campaign wiki — if it isn't in the vault, it doesn't exist for future reference.

---

## PREREQUISITES

1. **The Convo 2 Handoff Block** — pasted from the end of Convo 1.
2. **The completed session notes** — `.docx` or pasted/uploaded content from Convo 1.
3. **Obsidian MCP connected and responsive** — vault name is `wtfr_vault`. If unresponsive, say so immediately; do not draft from memory without verifying vault state. GitHub (`TheLittlestAskew/wtfr_vault`) is the fallback write path.

---

## VAULT REFERENCE

**Vault name:** `wtfr_vault` · **Local path:** `C:\Users\theli\wtfr_vault`

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
│   └── Trackers/                 (supplementary trackers as needed)
├── 01-Sessions/                  Session [##] — [Title].md
├── 02-Character_Journal/         [POV Character] Journal.md
├── 03-Characters/01 PCs | 02 NPCs/
├── 04-World-Lore/Locations|Regions|Factions/
├── 05-Mechanics/                 Roll_Statistics.md, Spell_Usage.md
├── 06-Media/                     images, maps (embed with ![[file.png]])
├── 07-Flora_Fauna/Creatures|Plants_Fungi/
├── DND_Sources/                  DM Notes.md (TOP AUTHORITY — read first)
├── Session_Sources/Transcripts/  Raw_Unedited | Corrected | Spelling_Corrected_Formatted | Spell_Check_Logs
└── Templates/                    PC, NPC, Location, Faction, Creature, Plant/Fungus, Session Notes
```

**Trackers:** single files in `00-Campaign-Hub/` (newest section first). Use `Trackers/` only for supplementary trackers. (No S##-S## rotation unless a tracker grows large enough to warrant splitting later.)

**New pages:** always build from the matching file in `Templates/`.

---

## MCP TOOLS

`obsidian:read-note` · `obsidian:edit-note` (append/prepend/replace) · `obsidian:create-note` · `obsidian:search-vault` · `obsidian:add-tags`/`remove-tags` · `obsidian:create-directory` · `obsidian:move-note` · `obsidian:delete-note`.

The Obsidian MCP can time out — the phased model below is built around that.

---

## PHASED EXECUTION

Separate reads from writes so a timeout never loses progress. Log progress to `/home/claude/convo2_progress.md`.

### PHASE 1: READ

0. Read the Handoff Block. Confirm the MCP: `obsidian:list-available-vaults` shows `wtfr_vault`.
1. **Required reads every session:**
   - `Workflows/Project/_Campaign_Setup.md` — **read first.** Holds current campaign specifics (DM, roster, POV character, format decisions) and open unknowns. If the handoff or notes reveal a pending input, **record it here and update what it unblocks** before continuing. This is how the pipeline fills itself in.
   - `DND_Sources/DM Notes.md` — **top authority for in-game content; read before drafting.**
   - `00-Campaign-Hub/Vault Sync Status.md` — last synced session, gaps.
   - `00-Campaign-Hub/Vault Format Reference.md` — append formats and conventions.
   - `00-Campaign-Hub/Campaign Dashboard.md` — current threads, NPCs, timeline.
   - `02-Character_Journal/[POV Character] Journal.md` — last entry + collapsible format.
   - The POV character's PC page (`03-Characters/01 PCs/[POV Character].md`) — current emotional state, if that page has an inner-life section.
2. **Conditional reads** (driven by the handoff): full NPC pages for major status changes; revisited location/region/faction pages with significant new events; use `search-vault` to locate append points on other PC pages without full reads.

State "Phase 1 complete. Read [X] files." when done.

### PHASE 2: DRAFT (no MCP calls)

Draft every update as a structured block, organized by file. Present the full plan before any writes.

1. **Session note** → `01-Sessions/Session ## — Title.md` (CREATE). Full markdown of all sections from the Session Notes Section Breakdown, with `[[backlinks]]` for characters, locations, regions, factions, items, and cross-session links. Em dash in filename; title matches Convo 1 exactly.
2. **Campaign Dashboard** (EDIT): Sessions row; NPC Companions / Key Antagonists; Locations; Open Threads; In-Game Timeline.
3. **Trackers** (APPEND newest-first):
   - `Loot Tracker.md` — session section (or "No new loot — [reason]").
   - `Quote Board Master.md` — verbatim quotes, tagged.
   - `Profanity Ledger.md` — table + running totals.
4. **Open Threads & Mysteries.md** (EDIT) and **Location Index.md** (EDIT) — new/resolved threads; new locations backlinked.
5. **House Rules & Rulings.md** (EDIT — only if new DM rulings).
6. **POV Journal** → `02-Character_Journal/[POV Character] Journal.md` (APPEND) — collapsible section, matching format. Hard Limits apply.
7. **PC pages** → `03-Characters/01 PCs/[Name].md`. POV character gets the full inner-life/turning-point/relationship treatment; others get session Key Events + inventory/relationship/condition updates. **Descriptor filing:** from the handoff's "Character Descriptors Surfaced This Session," APPEND session-tagged bullets to Appearance / Personality / Backstory. APPEND ONLY — never edit/delete existing bullets. Create the sections (per template) if missing. Skip characters with nothing new.
8. **NPC pages** → `03-Characters/02 NPCs/[Name].md` (EDIT/APPEND existing; CREATE new from `Templates/NPC Template.md`). Same descriptor-filing rule. Attribute DM-voiced quotes only when the speaker is clearly identified.
9. **World-Lore** → `04-World-Lore/Locations|Regions|Factions/` (CREATE from templates / APPEND).
10. **Flora & Fauna** → `07-Flora_Fauna/Creatures|Plants_Fungi/` (CREATE/APPEND). Skip if none.
11. **Mechanics** → `05-Mechanics/Spell_Usage.md` (spells cast); `Roll_Statistics.md` **only once a live `game_id` exists** — until then skip and note the gap.
12. **Vault Sync Status** (EDIT — always last): matrix row + change-log entry.

Present the plan (Creates / Appends / Edits / Skipped) and wait for confirmation.

### PHASE 3: WRITE

Order: Creates → Appends → Edits → Vault Sync Status last. Log each write. On timeout: do not retry blindly — verify with `search-vault`, retry once, then add to a "manual apply" block.

---

## CONVENTIONS

- **Backlinks:** `[[Character]]`, `[[Location]]`, `[[Session 01 — Title]]`; display override `[[Session 11 — Long_Title|Session 11]]`. Backlink on first mention within a section.
- **File naming:** sessions `Session ## — Title.md` (em dash); PCs/NPCs/locations by name; trackers single files.
- **Source authority:** `DND_Sources/DM Notes.md` → transcript → published rules. DM rulings supersede rulebook text.

## WHAT CONVO 2 DOES NOT DO

- Does not re-read transcripts, generate `.docx`, or spell-check (all Convo 1).
- Does not modify files outside the vault.
- May query the DDB roll archive if/when WTFR's `game_id` is live (separate connection; does not affect MCP stability).
