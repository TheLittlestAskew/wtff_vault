# WTFR Convo 1 Instructions — Session Notes Generation

**Status:** Seeded starter (pre-launch). Companion to `Project_Instructions.md` (master ruleset — to be created); all shared rules, constraints, and the Source Authority Hierarchy from that file apply here.

> Convo 1 produces two things: (1) the finished session notes, and (2) the **Convo 2 Handoff Block**. Convo 2 then propagates everything into the Obsidian vault. Convo 1 never touches the vault.

---

## PURPOSE

Convo 1 turns a raw session transcript (plus roll data and source files) into accurate, fully-populated session notes. Accuracy and verbatim canon win over polish everywhere except the POV Journal. Nothing is invented; every data point is tagged to the originating real-world session date.

---

## PREREQUISITES

1. **The raw transcript** — from `Session_Sources/Transcripts/Raw_Unedited/` or pasted in. Filename: `[##]-[MMddyy]_raw_transcript.md`.
2. **Session identity** — session number, real-world play date, party present, absent players.
3. **Roll data** — see Step 3. *WTFR's DDB roll archive is not wired until a live `game_id` exists; until then, rolls come from the transcript (physical/verbal).*
4. **The notes template/generator** — see Step 6. WTFR currently uses `Templates/Session Notes Template.md`.

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
Step 6  Notes Generation                      ← build from the WTFR notes template
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
   - **Canonical spellings:** cross-check against **[WTFR campaign spelling reference — to be built]** (PC/NPC names, locations, regions, factions, setting terms). Until that reference exists, flag uncertain proper nouns rather than guessing.
   - **Line-specific replacements** where a word is both a feature and a name — never global find-replace these.
   - **Word-boundary regex** to avoid partial corruption: `re.sub(r'\bterm\b', …)`.
   - **DM audio drops:** mark clipped/garbled audio `[inaudible/cut off]` and flag — never guess.
   - **Attribution:** if a DM line may belong to an NPC, flag and ask. Don't guess.
3. **Apply** only after confirmation.
4. **Save** the corrected transcript to `Session_Sources/Transcripts/Corrected/` as `[##] - [MMddyy]_corrected.md` (script/diarized format). Record its existence for the handoff.
5. Set **Spelling Checked = Yes** in metadata.

---

## STEP 3 — ROLL DATA CROSS-REFERENCE

**The DDB roll archive is the gold standard for roll verification — once WTFR has a live `game_id`.** Until then, this step relies on the transcript.

**When the archive is live:**
1. Confirm sync: `SELECT MAX(timestamp_iso) FROM wtfr_session_rolls;` — if the session date isn't covered, flag the gap and ask before assuming. Do not fabricate.
2. Pull the session's rolls by `session_date` (Eastern Time) via the `wtfr_session_rolls` view (pre-filtered to WTFR's `game_id`/`campaign_id`).
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

**[DECISION PENDING — confirm WTFR's output format.]** SITL renders a styled `.docx` via a code generator. WTFR currently has `Templates/Session Notes Template.md` (an Obsidian template), which suggests markdown-first notes. Options:
- **Markdown:** build the notes directly from `Templates/Session Notes Template.md`, ready to drop into `01-Sessions/` in Convo 2.
- **`.docx`:** if a generator is later adopted, document its pipeline here (build → validate → deliver) and do not hardcode styles from memory.

Whichever is chosen: build from the template exactly, validate, then deliver. **File naming:** `WTFR_[##]_[MMDDYY]_[Title]` (matches the handoff block).

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
