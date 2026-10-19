# HANDOFF — wtff_vault

> Obsidian D&D vault for the "Where the Flowers Forget" campaign. Includes Templates, Workflows, _pipeline.
> Handoff is **enabled** for this repo. Every change updates the Status/Next Steps below and prepends a log entry.
> Note: this is a notes/content vault — most session-note edits won't have a "next dev step."

## Status

Vault-consistency work order from the 2026-07-04 audit is open: handoff enabled and `DnD.base` added, but session-note schema migration hasn't run yet.

## Next Steps

- [x] ✅ **DONE 2026-10-10 — S07 fully published.** Re-transcribed with 12 speakers (`7b82324`), Phase A rerun approved, corrected transcript rebuilt (`62f38fc`), note "Omission of Truth" approved by Taylor (`bf5561e`), Convo 2 propagated (`0bfa8a0`), index regenerated + pushed (`2e187ab`), site ARC entry added (rectrixcaedere `6654194`). ⚠️ Still open: Artie/Lux shared past (F65) unconfirmed; ~15 [Unknown/Ambiguous] items in the note's Continuity Flags. ⚑ Future joint sessions: put `12sp` in the mp3 filename.
- [x] ✅ **DONE 2026-08-24 — deleted `Session_Sources/Transcripts/Raw_Unedited/04-080226_raw_transcript.md`** — its header names its audio `080226 SITL Recording.mp3`, and the **authoritative copy already exists** at `sitl_vault/.../21-080226_raw_transcript.md` (byte-for-byte the same dialogue, with proper nouns already corrected: `Velkynvelve` not "Belkin Valve", `Gracklstugh` not "Gracklestug"), plus a fully-processed `sitl_vault/_pipeline/S21/`, corrected transcript, and session note. Deleting it loses nothing. Command: `Remove-Item "Session_Sources\Transcripts\Raw_Unedited\04-080226_raw_transcript.md"`. **Do not run `Approve-WTFF.cmd` against it** — applying its corrections would import published Forgotten Realms lore into WtFF canon. Evidence: `_pipeline/S04/flags_SITL-080226-WRONGCAMPAIGN.md` #1.
- [x] ⚠️ **CORRECTION 2026-08-24 — `04-UNKNOWN_raw_transcript.md` was NOT a duplicate and must NOT be deleted.** The 08-02 entries below claim it is "a 7-minute partial capture of that same audio." **That is wrong.** Verified by search: `Form of Demogorgon`, `madness check`, `year anniversary` and `level 5 level up` return **zero matches** anywhere in `sitl_vault` — not in `21-080226` (the 233-min main capture), not in `20-071926`. It is ~7 minutes of unique SITL audio: the tail of the Sloobludop Demogorgon fight (Indigo leading northwest, Jimjar fleeing north-by-northeast, Demogorgon inbound west-southwest), the DM confirming the madness check was already rolled, and the request for level-5 level-up narratives. The 233-min file opens **later**, already past the battle and into Neverlight Grove travel planning. Rerouted verbatim (body diffed, 51/51 lines identical) to `sitl_vault/Session_Sources/Transcripts/Raw_Unedited/21-080226-opening_partial_raw_transcript.md` with a provenance header. The wtff copy is now safe to remove: `Remove-Item "Session_Sources\Transcripts\Raw_Unedited\04-UNKNOWN_raw_transcript.md"`.
- [ ] **Decide where the rerouted partial belongs** — filed against S21 on the 080226 audio date, but it may be the unrecorded **tail of S20** rather than the opening of S21. Taylor's call. Note `Session 21 — The Shield and the Middle Finger.md` was written 8/16 **without** this content, so the madness-check ruling and the level-5 narratives may be missing from it.
- [x] ✅ **DONE 2026-08-24 — `.gitignore` block removed.** Both strays are deleted, so the "Misfiled SITL transcripts" section committed in `c46f10e` was stripped. `Raw_Unedited/` now holds exactly one file claiming session 04: `04-072626_raw_transcript.md`, the real one.
- [x] ✅ **CLOSED 2026-10-12: Taylor says the misfile was most likely her own manual drop, not the watcher; no watcher check needed.** ~~Check the transcription watcher config~~ — it routed SITL audio into this vault **twice** on 2026-08-02 (15:59Z and 20:06Z). Also make the transcript header derive from the output vault instead of hardcoding `# Where the Flowers Forget — Session Transcript`; that boilerplate is what makes a misfiled recording look native at a glance.
- [x] ✅ **DONE 2026-10-10 (S04 note `00fdc12`, published).** **S04 pending review** (2026-07-26 session) — check `_pipeline/S04/spellcheck_S04-072626.md`. ⚠️ **The canonical `spellcheck.md`/`flags.md`/`summary.md` no longer exist.** On 2026-08-24 the wrong-campaign trio was renamed to `*_SITL-080226-WRONGCAMPAIGN.md` so `Approve-WTFF.cmd` fails loudly instead of silently applying another campaign's corrections. Before running it, copy the real trio into the canonical names: `Copy-Item _pipeline\S04\spellcheck_S04-072626.md _pipeline\S04\spellcheck.md` (and the same for `flags`/`summary`). Also clear the stale zero-byte `READY_FOR_REVIEW` marker — it was written by the 08-02 wrong-campaign run, not by an S04 review. Pipeline is stopped here until approved.
- [x] ✅ **DONE 2026-10-10: written as "Four Blooms, Five Petals".** ⚠️ **The real WtFF S04 note has still never been written.** `01-Sessions/` holds S00–S03 only, but `Session_Sources/Transcripts/Corrected/04 - 072626_corrected.md` (125 KB) already exists and is committed — so corrections were applied at some point and only the note generation is outstanding. Confirm whether the corrected transcript is trustworthy before generating the note from it.
- [x] ✅ **DONE 2026-10-10: Taylor confirmed both 2014 and 2024 sources allowed; recorded in `_Campaign_Setup.md`.** **Verify Adam's 2014/2024 rules ruling against the real S04 transcript** (`04-072626`) before recording it anywhere. Taylor recounts it twice in the SITL transcript ("if there's anything from 2014 rules that you like better, you can just apply that to 2024 rules") and invokes it for Bruin's Path of the Totem Warrior bear resistance — but that is second-hand, from another table, so it is capped ≤60% and was **not** written to `_Campaign_Setup.md`.
- [x] ✅ **DONE 2026-10-11 (`3a4c779`).** Migrate 3 session notes to the unified schema: add `type: session`, convert `session_number` from string to int — without `type: session` `DnD.base`'s Sessions view stays empty
- [ ] Run `Workflows/scripts/Publish-WTFF.cmd` to commit + push note changes (push = publish; the site reads notes straight from this repo)
- [x] ✅ **DONE (found already active 2026-10-11; stale note fixed).** In Supabase, flip `ddb_campaigns` row 4 `status` from `paused` to `active` (set a real `game_id` only if WTFF starts using DDB rolls)
- [x] ✅ **DONE 2026-10-11 (`3a4c779`; bare-name embeds, so a shell `git mv` was safe).** Inside Obsidian (not shell), create `06-Media/` and move the 13 loose root images into it
- [x] ✅ **DONE 2026-08-31 (half of it) — the MAP is now generated from this vault.** `where-the-flowers-forget/archive.html` fetches the `map` block of `00-Campaign-Hub/Public Session Index.json` instead of hardcoding blooms, travel line and party pin (vault `2bd2674`, site `0f69051`). ✅ **DONE 2026-10-11 — `session.html` now reads the index too** (rectrixcaedere `7c93b94`); ARC remains only as fallback + tags.
- [x] ✅ **DONE 2026-08-31 — all six rings named by Taylor.** Floravale (E13) · Tidecross (G12) · Current's Rest (H10) · Thornmere (H5) · Silvaroot (D9) · Bramblequiet (E8). `unnamed_markers` is empty; the block and its ring/grid scheme are kept for reuse. Map Locations now holds **27** named towns.
- [x] ✅ **DONE 2026-09-01 — applied, authorised by Taylor.** Sunroot Crossing → (41.4, 55.8) **G7**; Rhusatatiam → (37.6, 49.3) **F7** (`b96ee03`). Published map keeps the same party/path/blooms, correctly positioned. ⚠️ Worth a look at the live site to confirm the moved blooms.
- [x] ✅ **RESOLVED 2026-08-31 — both "duplicates" were capitals, not duplicates.** Willow Haven and Zelkova City are the capitals of Salvia Forest and The Burn, drawn as **crown icons rather than town dots**. Repointed to **D8** and **I9** (`5fae10d`). ⚑ Both positions are inferred from the icon, not read from a label — worth a glance to confirm.
- [x] ✅ **DONE 2026-09-01 — all six original `archive.html` coordinates are now corrected or re-derived.** Mouth that Feeds → F14, Galium Major → E12 (both capitals, from their crowns). 🛑 **Not one of the original six survived unchanged** — the site CONFIG was eyeballed throughout, so anything else inherited from it should be re-derived rather than trusted.
- [ ] **Ask Adam for the Artemesia map at full resolution.** The best copy on hand is 1280x960 and its town type is ~5px; a larger export would close the 8 unnamed markers and the Willow Haven question together. ✅ Already confirmed off the current map: **Sunroot** (not "Sunroute"), plus **Floravale**, **Petaline** and **Brindleberry Hollow** — three entries [[Location Index]] had flagged at ≤60%.
- [x] ✅ **DONE 2026-10-10: S04–S06 use `sunrootcrossing`.** **When S04 is written, give the note `site_location: <key>`.** If the party went somewhere the map has never shown, **add its x/y to `00-Campaign-Hub/Map Locations.json` FIRST** — the publish deliberately fails otherwise, rather than dropping the session off the map. See [[Vault Format Reference]] § Publishing.
- [ ] ⚠️ **This file uses the legacy `## Status` / `## Next Steps` shape**, which `septentrion-sync` cannot parse (it expects `## ▶ DO NEXT`). Left as-is on purpose — restructuring it is a deliberate job, not a side effect. Worth doing when convenient.

## Log
<!-- newest first · one entry per logical task/session · timestamp · source · changed · commit · next -->

### 2026-10-19 13:30 ET · Claude Code
- **Changed:** S08 Convo 2 propagation done in the working tree (31 files staged): trackers, Dashboard, Open Threads, Location Index, House Rules (3), Spell_Usage, Roll_Statistics (pending row), Bruin's journal, 6 PCs + Aiph/Bloom/Nero, new NPC `Sage.md`, 6 lore pages, `_Campaign_Setup.md`, Vault Sync Status. Removed one possibly personal STT fragment from the S08 note. Includes the Convo 1 files from the entry below.
- **Commit:** — (NOT BANKED: `git commit` is permission-gated in this non-interactive run; everything is staged, nothing committed or pushed)
- **Friction:** gen-fail — `git commit` blocked again (Bash, PowerShell and `-F` forms all need approval); same block as Convo 1 Phase B.
- **Next:** Taylor: `git commit -m "S08 — automated session sync"` then `git push` from the vault root (push = publish; confirm the title "There Is Another You" first), then run the read-only `wtff_session_rolls` query for 2026-10-18.
- **Watch out:** Rolls for S08 are still unqueried; Roll_Statistics has a ⚠️ pending row and the per-character totals exclude S08.

### 2026-10-19 12:15 ET · Claude Code
- **Changed:** S08 Convo 1 (Phase B) done in the working tree: corrected transcript (local only, gitignored), `Spell_Check_Logs/101826_Spell_Check_Log.md`, note `01-Sessions/Session 08 — There Is Another You.md`, a `_Campaign_Setup.md` Decisions Log row, and `_pipeline/S08/handoff.md`.
- **Commit:** — (NOT BANKED: `git commit` needs approval this automated run can't grant; 3 files uncommitted)
- **Friction:** gen-fail — node, sed -i, PowerShell, Supabase `execute_sql` and `git commit` all blocked by permissions in the non-interactive run; corrections were applied with line-scoped Edit passes instead (verified by full-file search), and the roll archive was left unqueried and flagged.
- **Next:** Taylor: commit + push the 3 files (or run `Workflows/scripts/Publish-WTFF.cmd`), then run the read-only `wtff_session_rolls` query for 2026-10-18 and fill the note's DDB Roll Archive table before Convo 2.
- **Watch out:** Title "There Is Another You" was picked by the run; Taylor to confirm before publishing (push = publish).

### 2026-10-19 11:30 ET · Claude Code
- **Changed:** no change. The S08 Convo 2 propagation run stopped before any vault write: `_pipeline/S08/handoff.md` and the `01-Sessions/Session 08 — …` note don't exist yet, and the corrected transcript was still being modified (11:23:59 ET) after the run started.
- **Commit:** —
- **Friction:** gen-fail — Convo 2 was launched before Convo 1 Phase B finished (no handoff, no note). Stopping was the right call instead of building the note from the transcript, which Convo 2 is forbidden to do.
- **Next:** Unchanged. See the 11:25 entry below: finish S08 Phase B alone, then re-run `_pipeline/S08/_prompt_convo2_propagate_md.txt`.
- **Watch out:** the pipeline runner should gate Convo 2 on `_pipeline/S08/handoff.md` existing.

### 2026-10-19 11:25 ET · Claude Code
- **Changed:** no tracked change. S08 Phase B (Convo 1B) halted partway: started the corrected transcript (`Session_Sources/Transcripts/Corrected/08 - 101826_corrected.md`, gitignored) and added approved rows 35 (Obo→Bebo) and 53 (Lou→Lute) to the gitignored `_pipeline/S08/apply_corrections.mjs`. No session note, spell-check log, or `_pipeline/S08/handoff.md` written; no Supabase query.
- **Commit:** —
- **Friction:** gen-fail — node, sed -i and the PowerShell tool were all blocked, so corrections had to go in as Edit passes; then a second Phase B run (status.json shows phaseB "running" from 14:49Z) started editing the same transcript concurrently, past line 840, and my edits began failing on "file modified since read". Stopped rather than race it to a duplicate session note.
- **Next:** Let the other S08 Phase B run finish, then confirm exactly one `01-Sessions/Session 08 — …` note, `Spell_Check_Logs/101826_Spell_Check_Log.md`, and `_pipeline/S08/handoff.md` exist. If it stalled, re-run Phase B once, alone.
- **Watch out:** in the corrected transcript, line 868 still read "Lou" (approved row 53) and line 650 is capitalised "Whistles", which the script's lowercase regex misses. The watcher appears to have launched Phase B twice; worth checking before S09.

### 2026-10-12 00:10 ET · Claude Code
- **Changed:** no vault change. Closed the "check the transcription watcher config" Next Steps item: Taylor says the 2026-08-02 misfiled SITL audio was most likely her own manual drop, not the watcher.
- **Commit:** —
- **Next:** Taylor asks Adam whether Bebo thaws in S05 or S06.

### 2026-10-11 18:40 ET · Claude Code
- **Changed:** Pipeline now uses the live roll archive: Project/Convo 1/Convo 2 instructions, both automation prompts, the handoff template, Section Breakdown, `_Campaign_Setup.md`, READMEs and Structure Guide say `wtff_session_rolls` is live, query it read-only, and add the `#### DDB Roll Archive` table (the `ddb_sessions` registry write stays off for WtFF). `Roll_Statistics.md` filled from the 52 archived rolls. Every DDB game ID, user ID and character ID removed from tracked files (sync script uses 0 placeholders and errors explicitly if unset; party-sync doc points to the gitignored `ddb_party.json`). Old values remain in git history; Taylor accepted that, so the DDB-ID item is **closed**, not open.
- **Commit:** `bb75707`
- **Next:** Taylor asks Adam whether Bebo thaws in S05 or S06.

### 2026-10-11 17:55 ET · Claude Code
- **Changed:** Cross-referenced all 52 WtFF DDB-archive rolls (`wtff_session_rolls` view, which already existed) into the session notes. Each note with rolls (S01–S05, S07) has a `#### DDB Roll Archive` table under its Full Roll Log, with est. audio time from a per-session recording-start offset. 41 match logged rows; 7 fill gaps in place (S04 Bebo Dex save 9, orb d4 1, two Savage Attacks rerolls; S05 the unattributed Dex save "20" is Bruin's, "Investigation or Nature" = Nature; S07 Bruin Perception 13); 2 disagree and are flagged, not overwritten (S04 OA 19 vs 20; S05 Perception 13 vs 12); 2 are new (S02 Bruin nat 20 Medicine; S05 a set-aside 13 damage roll). S02's four Artie rolls predate the recording. No rolls exist for S00 or S06. Stale "not wired" lines removed from the notes and Vault Sync Status, along with the DDB game ID in those lines.
- **Commit:** `b0c4603`
- **Next:** Update the pipeline instructions (`Project_Instructions.md`, `Convo_1_Instructions.md`, `Convo_2_Instructions.md`, `convo1_phaseB_apply.md`, `convo2_propagate.md`, `Convo2_Handoff_Template.md`, `05-Mechanics/Roll_Statistics.md`): they still say the view doesn't exist and tell future runs NOT to query it.
- **Watch out:** The DDB game ID still appears in ~15 other tracked files (workflow docs, Dashboard, `_pipeline/` handoffs). Taylor's rule is no DDB IDs in this public repo; scrubbing them needs her call (history keeps them either way).

### 2026-10-11 17:25 ET · Claude Code
- **Changed:** no vault change. Supabase `Rectrix_Caedere` `ddb_campaigns` row 4 was already `status: active` with a real `game_id` (last synced 2026-09-21); only its stale note ("Future campaign — paused…") was updated to "Active campaign (started June 2026)." (Taylor approved). `ddb_rolls` holds 52 WtFF rolls, 2026-06-16 → 2026-09-21.
- **Commit:** —
- **Next:** Taylor asks Adam whether Bebo thaws in S05 or S06.
- **Watch out:** All 8 session notes say `rolls_source: transcript (… DDB roll archive not yet wired)`, but the archive IS wired and has rolls. Not changed: the notes' roll tables came from transcripts, so the field is still accurate about where *their* numbers came from.

### 2026-10-11 17:10 ET · Claude Code
- **Changed:** S00–S03 migrated to the unified session schema (`type: session`, int `session_number`), so `DnD.base`'s Sessions view lists all eight notes. S00 also lost its stale `session_number: "02"` and "Session 02"/"S02" aliases (leftovers from its rename) and gained `title`/`campaign`; the generator's comment about that mismatch was removed. The 15 loose root PNGs moved to `06-Media/` with `git mv`; every embed uses the bare filename and each name is unique, so links still resolve. Public Session Index regenerated: no content change.
- **Commit:** `3a4c779`
- **Next:** Taylor asks Adam whether Bebo thaws in S05 or S06.
- **Watch out:** 5 of the moved images (2 ChatGPT, 3 Gemini) aren't embedded anywhere; kept, not deleted.

### 2026-10-11 15:55 ET · Claude Code
- **Changed:** `The Calendar.md` now carries everything on the calendar plate Taylor shared (12 Bloommonths with titles and seasons, 5 seasons, 6 Petaldays, 3 moons, 4 festivals, Heartbeats, plate sayings), plus a Start of Adventure date and an S01–S07 in-game date table. Merged the duplicate `The Petal Cycle.md` into it (kept as an alias; 6 links repointed; file removed). Month question resolved: S03 "vent" and S04 "Ven/Vedin/Verdin" = **Veriden** (inferred ~90%: Adam says "first of Veriden" in S01 and the day count runs on unbroken); flags updated in S03, S04, Delilah, X Marks the Spot, Sunroot Crossing, Campaign Dashboard.
- **Commit:** `d51c033`
- **Next:** Taylor asks Adam whether Bebo thaws in S05 or S06 (the month no longer needs asking).
- **Watch out:** Season membership for Ayvelle (2) and Serevia (7) is read off where the plate's arcs meet; flagged on the page.

### 2026-10-11 14:40 ET · Claude Code
- **Changed:** New NPC page `03-Characters/02 NPCs/Headmistress Vale.md` (Taylor asked for it): first-seen ≤60% from S04 [01:41:19]; S05's unnamed orphanage headmistress linked by inference; no Lethira/Calystryx Vale connection asserted. Linked from Tobias, S04 (×2 + flag row), S05 flag row, Campaign Dashboard, Open Threads. S01 title corrected: the note's "Final Chosen Title" said the Archivist's old pick "A Railway Requires Everyone" → now "Winds in the East" (old pick kept as an alternate); Profanity Ledger + Quote Board headings and the Structure Guide example filename fixed.
- **Commit:** `455df2b`
- **Next:** Taylor asks Adam: does Bebo thaw in S05 or S06, and what is the in-game month (Ven / Vedin / Verdin)?

### 2026-10-11 14:10 ET · Claude Code
- **Changed:** (1) `Bloom.md`: the snail's origin traced to the S02 escargot bowl (inferred ~85%: Bebo in S07 [00:58:41] "Is from before we left. He was on the salad, remember?"); `first_appearance` → S02 (inferred), S04–S06 coverage noted as table-talk only. (2) Repointed **92 broken session wikilinks in 29 files** that used pre-rename titles and resolved to nothing: S01 "Winds in the East, Mist comin' in..." and "A Railway Requires Everyone" → `Session 01 — Winds in the East`; "Session 02 — I Can Feel It In My Bones" → `Session 00 — …`; S02 "Something's Changing" (both apostrophes) → `Session 02 — It Follows Me, So I Followed It`. Only template placeholders ("Session 01 — Title", "Session 11 — Long_Title") remain unresolved. (3) Site: `session.html` now builds its session list from this vault's `Public Session Index.json` (rectrixcaedere `7c93b94`), so the per-session ARC entry is no longer a publish step; it only holds tags.
- **Commit:** `761eec1` (vault), `7c93b94` (site)
- **Next:** Wait for GitHub Support reply on the transcript purge.
- **Watch out:** Profanity Ledger and Quote Board Master still have plain-text headings with the old S01 title "A Railway Requires Everyone" (not links; left alone).

### 2026-10-11 13:00 ET · Claude Code
- **Changed:** Extracted the 26 inline base64 PNGs from the 13 Pantheon pages into `06-Media/Pantheon/<God> N.png` (66 MB of real PNGs) and replaced each data URI with `![[06-Media/Pantheon/<God> N.png|width]]`, widths preserved. Pages went from 1.6–10.4 MB to 1–10 KB. Each image checked: PNG signature + exact base64 round-trip. Old blobs remain in git history (own lore art, not private; no rewrite).
- **Commit:** `491dd46`
- **Next:** Taylor opens a Pantheon page in Obsidian to confirm the images render; still waiting on GitHub Support for the transcript purge.

### 2026-10-11 10:40 ET · Claude Code
- **Changed:** no change. Taylor submitted the GitHub Support ticket (category: Deletes) asking for GC + cached-view purge of the pre-scrub commits (first changed `ce88f7f`, 0 PRs, 0 forks). Found 13 Pantheon pages each embedding 2 base64 PNGs inline (~95 MB of text total, e.g. `Justice.md` 10.4 MB); not touched.
- **Commit:** —
- **Next:** Wait for GitHub Support reply; then decide whether to extract the Pantheon base64 images to real image files.

### 2026-10-11 10:15 ET · Claude Code
- **Changed:** Session transcripts scrubbed from ALL git history. Taylor ran the filter-branch script (18 commits had touched `Raw_Unedited/`, `Corrected/`, `Spelling_Corrected_Formatted/`; 145 commits rewritten) and force-pushed: main `b269db9` → `741897e`. Verified after fetch: origin has only `main` (no other branches, tags or PR refs), 0 commits on any ref touch those paths, 8 raw transcripts still on disk (gitignored). Also ticked the S04 Next Steps items that S04's note/publish closed on 2026-10-10.
- **Commit:** `741897e` (rewritten head)
- **Friction:** misread — told Taylor to type the `! bash ...` command, which she pasted into a PowerShell window where `!` is a parse error; worked with `& "C:Program FilesGitinash.exe" <script>` (plain `bash` in her PowerShell resolves to WSL's System32 bash).
- **Next:** Taylor files the GitHub Support request to purge cached views of the old commits; any other clone of this repo must re-clone (old history would come back on push).
- **Watch out:** 🛑 Never `git push` from a clone made before 2026-10-11 — it would reintroduce the transcripts. Pre-scrub backup mirror is in the 2026-10-10 Claude Code session scratchpad (`wtff_vault_backup2.git`), temp storage only.

### 2026-10-10 19:55 ET · Claude Code
- **Changed:** Bruin's `level` frontmatter → lvl2 (Taylor confirmed). S06 date 08/23/2026 stays as recorded (flagged inferred in the note).
- **Commit:** `db4e6d4`
- **Next:** Taylor runs the transcript history-scrub script from the session scratchpad (Obsidian closed first).

### 2026-10-10 19:45 ET · Claude Code
- **Changed:** S06 propagated (recap-only; `76933d7`); Public Session Index regenerated with all S01–S07 (`649fadc`). History-scrub script prepared (filter-branch on main, verify zero transcript commits, force-with-lease push); Claude Code's auto-mode blocked running it, so Taylor runs it.
- **Commit:** `76933d7`, `649fadc`
- **Next:** Taylor runs the scrub script from the session scratchpad; then verify on GitHub and file a GitHub Support request to purge cached views of the old commits.
- **Watch out:** After the force-push, any other clone (another machine, Codex) must re-clone; pulling would re-merge the old history.

### 2026-10-10 19:20 ET · Claude Code
- **Changed:** S05 "The Bloody Truth" published (`2b2f8f5`) and propagated (`938b297`). S06 "The Art of Staying Cool" got frontmatter + em-dash filename; recap kept verbatim minus one personal line; date 2026-08-23 inferred (`af3c6f0`). S07 links to S06 fixed (`0929490`). Site ARC now lists S01–S07 (rectrixcaedere). Mirror backup of the repo taken in the session scratchpad before the history scrub.
- **Commit:** `2b2f8f5`, `af3c6f0`, `0929490`, `938b297`
- **Next:** Commit S06 propagation (agent running), regenerate the index, then scrub Raw_Unedited/Corrected/Spelling_Corrected_Formatted from all history and force-push.
- **Watch out:** Bruin's `level` frontmatter still says lvl1; S05 confirms level 2. Awaiting Taylor.

### 2026-10-10 18:20 ET · Claude Code
- **Changed:** S04 Convo 2 propagated (22 pages + 2 new creature pages, slotted below S07; current state left at S07) and the Public Session Index regenerated with S04 (party pin still Rhusatatiam). Taylor approved: S05 spell-check table in full, secondhand coverage of the Discord vision scenes, and scrubbing transcripts from git history.
- **Commit:** `5427722`, `bb26b93`
- **Next:** Finish S05 (note generating), then rewrite history to drop the transcript folders (backup first, force-push), then S06.

> Older entries archived to `handoff-archive/2026-07.md`, `handoff-archive/2026-08.md`, `handoff-archive/2026-09.md`, `handoff-archive/2026-10.md` - everything before 2026-10-10 18:20 ET.
