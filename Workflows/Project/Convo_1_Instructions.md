# WTFF Convo 1 Instructions — Session Notes Generation

**Status:** Seeded starter (pre-launch). Companion to `Project_Instructions.md` (master ruleset — to be created); all shared rules, constraints, and the Source Authority Hierarchy from that file apply here.

> Convo 1 produces two things: (1) the finished session notes, and (2) the **Convo 2 Handoff Block**. Convo 2 then propagates everything into the Obsidian vault. Convo 1 never touches the vault.

---

## PURPOSE

Convo 1 turns a raw session transcript (plus roll data and source files) into accurate, fully-populated session notes. Accuracy and verbatim canon win over polish everywhere except the POV Journal. Nothing is invented; every data point is tagged to the originating real-world session date.

---

## PREREQUISITES

1. **The raw transcript** — from `Session_Sources/Transcripts/Raw_Unedited/` or pasted in. Filename: `[##]-[MMddyy]_raw_transcript.md`.
2. **Session identity** — session number, real-world play date, party present, absent players.
3. **Roll data** — see Step 3. *WTFF's DDB roll archive is not wired until a live `game_id` exists; until then, rolls come from the transcript (physical/verbal).*
4. **The notes template/generator** — see Step 6. WTFF currently uses `Templates/Session Notes Template.md`.

If the transcript is missing, say so immediately. Do not draft from memory.

---

## WHAT CONVO 1 DOES NOT DO

- Does not update the Obsidian vault (Convo 2's job).
- Does not pull from prior sessions to rewrite history — sessions are delineated by real-world play date; preserve and flag discrepancies.
- Does not invent. Unknown / missing / ambiguous = `[Unknown/Ambiguous]`. The only narrative-license exception is the POV Journal.

---

## PHASED EXECUTION

Spell check always precedes notes generation. Log progress to `/home/claude/convo1_progress.md`.

```
Step 0  Consult & Update Campaign Setup       ← read _Campaign_Setup.md; capture any newly-revealed inputs
Step 1  Intake & Session Identification
Step 2  Spell Check & Transcript Correction   ← review-before-apply, then save corrected transcript
Step 3  Roll Data Cross-Reference             ← roll archive once game_id is live; transcript until then
Step 4  Session Notes Drafting                ← sections per the Section Breakdown
Step 5  Title Selection                       ← 5 options, confirm final
Step 6  Notes Generation                      ← build from the WTFF notes template
Step 7  Convo 2 Handoff Block
```

---

## STEP 0 — CONSULT & UPDATE CAMPAIGN SETUP

Read `_Campaign_Setup.md` first. It holds this campaign's specifics (DM, roster, `game_id`, POV character, spelling terms, format decisions) and what's still unknown.

- If this session — or anything said in setup — **reveals a pending input**, record the value in `_Campaign_Setup.md` and update any doc it unblocks. This is how the pipeline fills itself in.
- Where a step below references a `[PENDING ...]` value, **pull the current value from `_Campaign_Setup.md`** rather than re-asking. If still unknown there, treat it as unknown and flag it.
- Never invent a value to fill a gap.

---

## STEP 1 — INTAKE & SESSION IDENTIFICATION

1. Confirm session number (`01`, `02`, …), date (`MM/DD/YYYY`), party present, absent players.
2. Locate the raw transcript. `.docx` transcripts are plain ASCII inside — read with `cat` + `grep -n`. Large transcripts: read in ~200-line batches via `sed -n 'START,ENDp'`.
3. Note unusual circumstances up front: split session, absent players, short run time, guest player. Surface these in the notes and handoff.
4. **[PENDING ROSTER]** Note any DM-assigned creatures/companions that specific players roll for (e.g., pets, familiars), once the roster is known.

---

## STEP 2 — SPELL CHECK & TRANSCRIPT CORRECTION

**No silent fixes.** Every correction is proposed in a table and confirmed *before* it is applied.

1. **Spell-check table:** Line/Context | Heard (raw) | Proposed Correction | Reason.
2. **Correction rules:**
   - **Source-material spelling overrides** DM pronunciation and speech-to-text.
   - **[PENDING ROSTER] Non-native English speakers:** note any players with heavy accents and prefer context over auto-correction.
   - **Canonical spellings:** cross-check against **[WTFF campaign spelling reference — to be built]** (PC/NPC names, locations, regions, factions, setting terms). Until that reference exists, flag uncertain proper nouns rather than guessing.
   - **Line-specific replacements** where a word is both a feature and a name — never global find-replace these.
   - **Word-boundary regex** to avoid partial corruption: `re.sub(r'\bterm\b', …)`.
   - **DM audio drops:** mark clipped/garbled audio `[inaudible/cut off]` and flag — never guess.
   - **Attribution:** if a DM line may belong to an NPC, flag and ask. Don't guess.
3. **Apply** only after confirmation.
4. **Save** the corrected transcript to `Session_Sources/Transcripts/Corrected/` as `[##] - [MMddyy]_corrected.md` (script/diarized format). Record its existence for the handoff.
5. Set **Spelling Checked = Yes** in metadata.

---

## STEP 3 — ROLL DATA CROSS-REFERENCE

**The DDB roll archive is the gold standard for roll verification — once WTFF has a live `game_id`.** Until then, this step relies on the transcript.

**When the archive is live** — the queries below are a COMMENTED template; **they are NOT wired until a `game_id` roll-archive exists for WtFF.** WtFF's `game_id` is `7853407` and the view will be `wtff_session_rolls` (pre-filtered to `campaign_id = 4`, with `session_date` derived in Eastern Time). Do not run these until the view exists.

```sql
-- NOT WIRED YET — template only. Enable once the wtff_session_rolls view exists (game_id 7853407, campaign_id 4).
-- 1. Confirm sync (latest synced roll):
-- SELECT MAX(timestamp_iso) FROM wtff_session_rolls;
-- 2. Pull the session's rolls (Eastern Time session_date):
-- SELECT * FROM wtff_session_rolls WHERE session_date = 'YYYY-MM-DD';
-- per character:
-- SELECT * FROM wtff_session_rolls WHERE session_date = 'YYYY-MM-DD' AND character = 'Isla ''Bruin'' Kaplan';
-- counts:
-- SELECT character, COUNT(*) AS rolls FROM wtff_session_rolls WHERE session_date = 'YYYY-MM-DD' GROUP BY character ORDER BY rolls DESC;
```

1. Confirm sync: `SELECT MAX(timestamp_iso) FROM wtff_session_rolls;` — if the session date isn't covered, flag the gap and ask before assuming. Do not fabricate.
2. Pull the session's rolls by `session_date` (Eastern Time) via the `wtff_session_rolls` view (pre-filtered to WTFF's `game_id` 7853407 / `campaign_id` 4).
3. **Cross-reference rules:** use the archive for exact values/timing/who-rolled; the transcript for narrative context, DM rulings, in-fiction outcomes, dialogue.
   - Roll in transcript but not archive → flag "transcript-only."
   - Roll in archive but not transcript → likely a quick mechanical roll.
   - **Physical dice** (players who roll real dice won't appear in DDB): if the transcript confirms a result, include it in the Roll Log marked `physical dice roll`. **[PENDING ROSTER]** note which players use physical dice — zero archive entries for them is expected, not an error.
4. **Data quirks:** DM-controlled creatures appear in the log (monsters, not party members); `action = "custom"` with no name is usually a freeform DM-prompted roll; attribute empty-character rows via transcript and `user_id` mapping (**[PENDING: player → character map]**); summoned creatures get their own entries.

**Until the archive is live:** log every roll result confirmed in the transcript, marked `physical/verbal`. Note in the handoff that the archive is not yet wired.

---

## STEP 4 — SESSION NOTES DRAFTING

**Content authority:** `Session_Notes_Section_Breakdown.md`. Do not alter or skip sections. Tables must have enough rows to cover the full session. Capture every plot development equally — no chronological bias. Tag every event, roll, quote, and decision to the correct session date and character.

The POV Journal (section 2) is the storytelling exception. In-character, in-world, from **[POV CHARACTER — your PC, name once defined]**. Apply the POV Journal Hard Limits from the master ruleset and use **[the POV character's voice guide — define once the PC is established]**. Before writing, read the POV character's current emotional state from their PC page. Test: *Could the POV character know, feel, or observe this from inside the story?*

---

## STEP 5 — TITLE SELECTION

1. Propose 5 options, one per type: Humorous, Dramatic, Serious, Straightforward, Quote-based.
2. Present for the user's choice (tappable options preferred).
3. Record the final chosen title (and any alternative names suggested during play).

---

## STEP 6 — NOTES GENERATION

**WtFF is markdown-first — there is NO `.docx` generator.** Author the finished notes as a markdown note directly, using `Templates/Session Notes Template.md` (the Obsidian template) as the structural skeleton. (SITL renders a styled `.docx` via a code generator; WtFF deliberately does not — do not invent or hardcode a `.docx` pipeline. If one is ever adopted, record that decision in `_Campaign_Setup.md` first, then document its build → validate → deliver pipeline here.)

This is the 8-section notes content from Step 4, rendered to markdown with frontmatter and Obsidian backlinks:

- **Source of structure:** `Templates/Session Notes Template.md` — follow its section order and headings exactly. **Content authority** remains `Session_Notes_Section_Breakdown.md`.
- **Frontmatter** — tags, aliases, session date, session number.
- **Backlinks** — `[[Character Name]]` for every PC and NPC, `[[Location Name]]` for every location/region/faction, `[[Session ## — Title]]` for cross-session references.
- **Target / file naming:** write into `01-Sessions/` as `Session [##] — [Title].md` (em dash — matching existing vault files and the Convo 2 / Section Breakdown convention). Title matches the final chosen title from Step 5 exactly.

Convo 1 authors this note; Convo 2 verifies it and propagates everything else into the rest of the vault. Build from the template exactly, validate, then record the note's path for the handoff block.

---

## STEP 7 — CONVO 2 HANDOFF BLOCK

Output the handoff block (from `Convo2_Handoff_Template.md`) for the user to copy into a fresh Convo 2 chat. It carries session metadata, the corrected-transcript location, key events, the "Character Descriptors Surfaced This Session" list, Convo 1 flags, and roll-archive status.

---

## CATCH-UP / BATCH NOTES

Process multiple sessions in chronological order by real-world play date — one full Convo 1 per session. Never merge sessions. Preserve and flag cross-session discrepancies rather than reconciling silently.

---

## COMPLETION CRITERIA

1. ✅ Corrected transcript saved to `Session_Sources/Transcripts/Corrected/`.
2. ✅ Roll data cross-referenced (or the archive-not-live gap flagged).
3. ✅ All sections complete, tables fully populated, every datum date/character-tagged.
4. ✅ POV Journal passes the Hard Limits test.
5. ✅ Final title confirmed and recorded.
6. ✅ Notes generated from the template, validated, delivered.
7. ✅ Convo 2 Handoff Block output.
