# WTFF Convo 2 Instructions — Vault Updates

**Status:** Seeded starter (pre-launch). Companion to `Project_Instructions.md` (master ruleset — to be created); all shared rules and constraints from that file apply here.

This document defines the workflow for **Convo 2**: updating the Where the Flowers Forget Obsidian vault after session notes are generated in Convo 1. The vault is the campaign wiki — if it isn't in the vault, it doesn't exist for future reference.

---

## PREREQUISITES

1. **The Convo 2 Handoff Block** — pasted from the end of Convo 1.
2. **The completed session note** — the markdown note created in Convo 1. Its exact path is the **first line of `handoff.md`** (e.g. `01-Sessions/Session ## — Title.md`). Read that file; do not look for `.docx` or pasted/uploaded content — WtFF is markdown-only.
3. **Obsidian MCP connected and responsive** — vault name is `wtff_vault`. If unresponsive, say so immediately; do not draft from memory without verifying vault state. GitHub (`TheLittlestAskew/wtff_vault`) is the fallback write path.

---

## VAULT REFERENCE

**Vault name:** `wtff_vault` · **Local path:** `C:\Users\theli\Obsidian Vaults\wtff_vault`

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

0. Read the Handoff Block. Confirm the MCP: `obsidian:list-available-vaults` shows `wtff_vault`.
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

1. **Session note** → `01-Sessions/Session ## — Title.md` (VERIFY — do not recreate). Convo 1 (Phase B) already authored this note. Confirm it exists and is complete — all sections from the Session Notes Section Breakdown, frontmatter, and `[[backlinks]]` for characters, locations, regions, factions, items, and cross-session links (em dash in filename; title matches Convo 1 exactly). Do **not** create or overwrite it. Only create it if it is genuinely missing (Convo 1 was skipped) — never produce a duplicate file.
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
12. **Website session sync (rectrixcaedere.com)** — **SEPARATE REPO** (`TheLittlestAskew/rectrixcaedere`), *not* the vault; deploy on its own. The WtFF reader holds a hardcoded registry, so a new session does NOT appear on the site until added in **two** places:
    - **`where-the-flowers-forget/session.html` → the `ARC` array.** Append an entry:
      ```js
      {n:'##',d:'YYYY-MM-DD',lbl:'Month D, YYYY',t:'<display title>',
       f:SS+'/Session%20##%20%E2%80%94%20<URL-encoded title>.md',
       tags:[{l:'<label>',c:'<class>'}]}
      ```
      `f` must be the **exact** `01-Sessions/` filename, URL-encoded (`%20`=space, `%E2%80%94`=em dash) — a mismatch makes the note body fail to load. `t` is a curated display title (may differ from the note title). `tags` is optional; valid `c` classes: `subdm` (crossover / guest DM), `rp` (roleplay), `combat`, `cliff` (cliffhanger), `level` (level-up), `sun`. **WtFF uses no `rec` audio field** (that's SITL) — omit it.
    - **`where-the-flowers-forget/archive.html` → the map's location→sessions list.** Add `{n:'##',title:'<title>',date:'MM/DD/YYYY',href:'/where-the-flowers-forget/session.html?n=##'}` under the `at:` location where the session happens. If that location isn't on the map yet, first add it to the `L` locations dict (`key:{x,y,name,region}`, `x`/`y` as map-relative %).
    - The reader fetches the note body live from `raw.githubusercontent.com/.../wtff_vault/main`; the vault must stay public (it is). Rolls pull from `wtff_session_rolls` by date — **none exist yet**, so the site shows "roll archive pending"; nothing to wire here until the DDB game is live.
    - The automated `convo2_propagate` runner pushes **only the vault repo** — this website step is manual / a separate deploy. SHA-verify the push to `rectrixcaedere`.
13. **Vault Sync Status** (EDIT — always last): matrix row + change-log entry.

Present the plan (Creates / Appends / Edits / Skipped) and wait for confirmation. Use this format:

```
## Update Plan — Session [##]

**Creates:** [count] new files
  - [list each new file with path]

**Appends:** [count] files
  - [list each file]

**Edits:** [count] files
  - [list each file + brief description of what changes]

**Skipped (N/A this session):**
  - [list any skipped items and why — e.g. Roll_Statistics.md (roll archive not yet wired)]

Ready to execute writes?
```

Confirm, then proceed to Phase 3.

### PHASE 3: WRITE

Order: Creates → Appends → Edits → Vault Sync Status last. Log each write. On a failed/incomplete write: do not retry blindly — verify the content landed (re-read the file or `search-vault`), retry once, then add to a "manual apply" block.

---

## CONVENTIONS

- **Backlinks:** `[[Character]]`, `[[Location]]`, `[[Session 01 — Title]]`; display override `[[Session 11 — Long_Title|Session 11]]`. Backlink on first mention within a section.
- **File naming:** sessions `Session ## — Title.md` (em dash); PCs/NPCs/locations by name; trackers single files.
- **Source authority:** `DND_Sources/DM Notes.md` → transcript → published rules. DM rulings supersede rulebook text.

## ENVIRONMENT & MCP-FAILURE RECOVERY

WtFF normally runs Convo 2 **inside Claude Code with native filesystem access** to the vault (see the ENVIRONMENT OVERRIDE in the `convo2_propagate.md` runner): read and edit vault files directly, no `obsidian:` tools, no MCP-timeout dance. Keep the READ → DRAFT → WRITE discipline regardless — it is good practice, not just timeout defense.

The protocol below is a **fallback** for the legacy/manual path where Convo 2 runs through the Obsidian MCP instead of native filesystem access:

1. **Phase 1 (reads):** If a read times out, ask Taylor to restart. Use `search-vault` as a fallback — line numbers and content snippets are often enough to proceed. Log every successful read so restarts don't repeat work.
2. **Phase 2 (drafting):** No MCP calls. Cannot fail.
3. **Phase 3 (writes):** If a write times out, do NOT retry blindly. Verify first with `search-vault`. If the content is there, move on. If not, retry once. Two failures on the same file → add it to a "manual apply" block.
4. **If the MCP is completely down for the session:** draft all updates in Phase 2 and present them as **manual-apply blocks** (file path, operation, full content) so Taylor can apply them by hand or the next Convo 2 can execute them. Under native filesystem access this case does not arise — write directly.
5. **Progress tracking:** `/home/claude/convo2_progress.md` tracks completed reads and writes across restarts.

---

## CATCH-UP SESSIONS

If `Vault Sync Status.md` shows gaps for prior sessions, process sessions in **chronological order** (oldest gap first) so backlinks and timeline entries land in sequence.

Taylor may also ask to catch up a **single file across multiple sessions** (e.g. "Loot Tracker is 3 sessions behind"). In that case focus on that one file across the gap sessions — append a newest-first section per missing session — rather than running full propagation for each.

---

## COMPLETION CRITERIA

A session is fully synced when ALL of the following are ✅ (or ➖ if not applicable):

| # | Item | Target File | "Done" Means |
|---|---|---|---|
| 1 | Session Note | `01-Sessions/Session ## — Title.md` | Full markdown, all sections, backlinks (created in Convo 1 Phase B) |
| 2 | Corrected Transcript | `Session_Sources/Transcripts/Corrected/` | Confirmed present in vault (from Convo 1) |
| 3 | Dashboard | `00-Campaign-Hub/Campaign Dashboard.md` | Sessions row, NPCs / Key Antagonists, locations, threads, timeline updated |
| 4 | Loot Tracker | `00-Campaign-Hub/Loot Tracker.md` | Newest-first session section added (or "No new loot — [reason]") |
| 5 | Quote Board | `00-Campaign-Hub/Quote Board Master.md` | Newest-first section with all verbatim quotes, tagged |
| 6 | Profanity Ledger | `00-Campaign-Hub/Profanity Ledger.md` | Newest-first section added, running totals updated |
| 7 | Roll Stats | `05-Mechanics/Roll_Statistics.md` | ➖ until a live `game_id` / `wtff_session_rolls` view exists; note the gap |
| 8 | POV Journal | `02-Character_Journal/[POV Character] Journal.md` | Collapsible section added for this session (Hard Limits respected) |
| 9 | PC Pages | `03-Characters/01 PCs/*.md` | All present PCs updated; descriptors APPEND-only |
| 10 | NPC Pages | `03-Characters/02 NPCs/*.md` | New NPCs created from template, existing NPCs updated |
| 11 | World-Lore | `04-World-Lore/Locations\|Regions\|Factions/*.md` | New pages created from templates, revisited pages updated |
| 12 | Flora/Fauna | `07-Flora_Fauna/Creatures\|Plants_Fungi/*.md` | New creatures/plants created, existing updated (➖ if none) |
| 13 | Mechanics / Rulings | `05-Mechanics/Spell_Usage.md`; `00-Campaign-Hub/House Rules & Rulings.md` | Spells cast logged; new DM rulings added (➖ if none) |
| 14 | Website session entry | `rectrixcaedere` → `where-the-flowers-forget/session.html` (`ARC`) + `archive.html` (map) | New `ARC` entry + map session/marker added and deployed (separate repo). ➖ only if the site reader doesn't exist yet |

`Vault Sync Status.md` is updated **LAST**: ✅/➖ for every per-session column (Transcript · Spell Check · Session Notes (md) · Vault Markdown · POV Journal · Rolls Synced) plus a dated change-log entry.

---

## WHAT CONVO 2 DOES NOT DO

- Does not re-read transcripts, generate `.docx`, or spell-check (all Convo 1).
- Does not modify vault content from memory — only from the Convo 1 note and handoff. The **one** file it touches outside the vault is the website registry in the `rectrixcaedere` repo (Step 12 / checklist 14), deployed separately.
- May query the DDB roll archive if/when WTFF's `game_id` is live (separate connection; does not affect MCP stability).
