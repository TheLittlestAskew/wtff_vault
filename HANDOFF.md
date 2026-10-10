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
- [ ] **Check the transcription watcher config** — it routed SITL audio into this vault **twice** on 2026-08-02 (15:59Z and 20:06Z). Also make the transcript header derive from the output vault instead of hardcoding `# Where the Flowers Forget — Session Transcript`; that boilerplate is what makes a misfiled recording look native at a glance.
- [ ] **S04 pending review** (2026-07-26 session) — check `_pipeline/S04/spellcheck_S04-072626.md`. ⚠️ **The canonical `spellcheck.md`/`flags.md`/`summary.md` no longer exist.** On 2026-08-24 the wrong-campaign trio was renamed to `*_SITL-080226-WRONGCAMPAIGN.md` so `Approve-WTFF.cmd` fails loudly instead of silently applying another campaign's corrections. Before running it, copy the real trio into the canonical names: `Copy-Item _pipeline\S04\spellcheck_S04-072626.md _pipeline\S04\spellcheck.md` (and the same for `flags`/`summary`). Also clear the stale zero-byte `READY_FOR_REVIEW` marker — it was written by the 08-02 wrong-campaign run, not by an S04 review. Pipeline is stopped here until approved.
- [ ] ⚠️ **The real WtFF S04 note has still never been written.** `01-Sessions/` holds S00–S03 only, but `Session_Sources/Transcripts/Corrected/04 - 072626_corrected.md` (125 KB) already exists and is committed — so corrections were applied at some point and only the note generation is outstanding. Confirm whether the corrected transcript is trustworthy before generating the note from it.
- [ ] **Verify Adam's 2014/2024 rules ruling against the real S04 transcript** (`04-072626`) before recording it anywhere. Taylor recounts it twice in the SITL transcript ("if there's anything from 2014 rules that you like better, you can just apply that to 2024 rules") and invokes it for Bruin's Path of the Totem Warrior bear resistance — but that is second-hand, from another table, so it is capped ≤60% and was **not** written to `_Campaign_Setup.md`.
- [ ] Migrate 3 session notes to the unified schema: add `type: session`, convert `session_number` from string to int — without `type: session` `DnD.base`'s Sessions view stays empty
- [ ] Run `Workflows/scripts/Publish-WTFF.cmd` to commit + push note changes (push = publish; the site reads notes straight from this repo)
- [ ] In Supabase, flip `ddb_campaigns` row 4 `status` from `paused` to `active` (set a real `game_id` only if WTFF starts using DDB rolls)
- [ ] Inside Obsidian (not shell), create `06-Media/` and move the 13 loose root images into it
- [x] ✅ **DONE 2026-08-31 (half of it) — the MAP is now generated from this vault.** `where-the-flowers-forget/archive.html` fetches the `map` block of `00-Campaign-Hub/Public Session Index.json` instead of hardcoding blooms, travel line and party pin (vault `2bd2674`, site `0f69051`). ⚠️ **`session.html`'s `ARC` array is STILL hardcoded** — the remaining half of this item.
- [x] ✅ **DONE 2026-08-31 — all six rings named by Taylor.** Floravale (E13) · Tidecross (G12) · Current's Rest (H10) · Thornmere (H5) · Silvaroot (D9) · Bramblequiet (E8). `unnamed_markers` is empty; the block and its ring/grid scheme are kept for reuse. Map Locations now holds **27** named towns.
- [x] ✅ **DONE 2026-09-01 — applied, authorised by Taylor.** Sunroot Crossing → (41.4, 55.8) **G7**; Rhusatatiam → (37.6, 49.3) **F7** (`b96ee03`). Published map keeps the same party/path/blooms, correctly positioned. ⚠️ Worth a look at the live site to confirm the moved blooms.
- [x] ✅ **RESOLVED 2026-08-31 — both "duplicates" were capitals, not duplicates.** Willow Haven and Zelkova City are the capitals of Salvia Forest and The Burn, drawn as **crown icons rather than town dots**. Repointed to **D8** and **I9** (`5fae10d`). ⚑ Both positions are inferred from the icon, not read from a label — worth a glance to confirm.
- [x] ✅ **DONE 2026-09-01 — all six original `archive.html` coordinates are now corrected or re-derived.** Mouth that Feeds → F14, Galium Major → E12 (both capitals, from their crowns). 🛑 **Not one of the original six survived unchanged** — the site CONFIG was eyeballed throughout, so anything else inherited from it should be re-derived rather than trusted.
- [ ] **Ask Adam for the Artemesia map at full resolution.** The best copy on hand is 1280x960 and its town type is ~5px; a larger export would close the 8 unnamed markers and the Willow Haven question together. ✅ Already confirmed off the current map: **Sunroot** (not "Sunroute"), plus **Floravale**, **Petaline** and **Brindleberry Hollow** — three entries [[Location Index]] had flagged at ≤60%.
- [ ] ▶ **When S04 is written, give the note `site_location: <key>`.** If the party went somewhere the map has never shown, **add its x/y to `00-Campaign-Hub/Map Locations.json` FIRST** — the publish deliberately fails otherwise, rather than dropping the session off the map. See [[Vault Format Reference]] § Publishing.
- [ ] ⚠️ **This file uses the legacy `## Status` / `## Next Steps` shape**, which `septentrion-sync` cannot parse (it expects `## ▶ DO NEXT`). Left as-is on purpose — restructuring it is a deliberate job, not a side effect. Worth doing when convenient.

## Log
<!-- newest first · one entry per logical task/session · timestamp · source · changed · commit · next -->

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

### 2026-10-10 17:45 ET · Claude Code
- **Changed:** S04 note "Four Blooms, Five Petals" approved by Taylor and published (`00fdc12`); ruleset reconciled to "2014 + 2024 sources allowed"; "Kelly" = STT error; S05 "Elias" = STT noise. Transcripts (Raw_Unedited, Corrected, Spelling_Corrected_Formatted) gitignored and untracked, local copies kept; PERSONAL INFORMATION REDACTION rule added to Project_Instructions and all 3 pipeline prompts (`f0c5050`). Site ARC entry for S04 (rectrixcaedere `fbff22e`).
- **Commit:** `00fdc12`, `f0c5050`
- **Next:** Commit the S04 Convo 2 propagation (agent running), regenerate the index; S05 Phase B once Taylor answers the vision-scene + ≤60% questions.
- **Watch out:** Transcripts pushed before 2026-10-10 are still in git history; scrubbing needs a history rewrite + force-push, awaiting Taylor's yes.

### 2026-10-10 17:05 ET · Claude Code
- **Changed:** S04 note "Four Blooms, Five Petals" generated from the approved corrected transcript; removed Taylor's real-life OOC pain quote from it; parked at `_pipeline/S04/REVIEW_Session 04 — Four Blooms, Five Petals.md` (gitignored) until she approves. Committed the 072626 spell-check log. `_pipeline/S04/handoff.md` ready for Convo 2.
- **Commit:** `a976adf`
- **Next:** Taylor approves S04 title/note → move note back to `01-Sessions/`, Convo 2, regenerate index, add ARC entry; then S05 rulings.
- **Watch out:** Ruleset conflict: `_Campaign_Setup` says 2014 (player-stated 10/10/26), but Adam on-air [02:30:48] says they'll "chart an in between that makes sense of like 2014 and 2024."

### 2026-10-10 16:50 ET · Claude Code
- **Changed:** S05 Phase A done: `_pipeline/S05/` spellcheck.md (78 rows, 9 ≤60%), flags.md (F1–F59), summary.md, READY_FOR_REVIEW (gitignored, awaiting Taylor). Committed parallel-session lore fixes: "remember" wording that had been corrupted to "forget" in 4 Pantheon pages, Key Story per Region and Liriope River Net; `_Campaign_Setup` ruleset = D&D 5e 2014 (player-stated 10/10/26).
- **Commit:** `0da1cd9`
- **Next:** Taylor rules on S05 (Elias, unrecorded Discord vision scenes, ≤60% rows); S04 note still generating, review before push.
- **Watch out:** `Music  Art Literature.md:5` "meant to be forgotten" may be the same remember→forget damage; not changed.

### 2026-10-10 16:25 ET · Claude Code
- **Changed:** Taylor asked to work forward from the earliest unwritten session. S05 transcribed (174 min, 7 speakers, WtFF-only, ends "Tobias is gone") and committed; Phase A spell-check running into `_pipeline/S05/`. S04 note generation running from the approved `04 - 072626_corrected.md`. Committed Taylor's player-stated OOC backstory on Bruin's page (father/brother missing, trainer became family).
- **Commit:** `4ed79a0`, `9520434`
- **Next:** Review the S04 note, then the S05 spell-check table; S06 has no recording (prose recap only), needs frontmatter + em-dash filename.
- **Watch out:** S04 "Kelly, you're here, right?" [01:21:34] answered by Taylor's label; identity unresolved.

### 2026-10-10 15:25 ET · Claude Code
- **Changed:** S07 Convo 2 propagated across 24 vault pages + new companion page `Bloom.md`; title marked approved; `Public Session Index.json` regenerated (party pin → Rhusatatiam) and pushed. Site `session.html` ARC entry added in rectrixcaedere.
- **Commit:** `0bfa8a0`, `2e187ab`
- **Next:** S04 note (corrected transcript exists) and S05 transcription (mp3 in `Recordings/`, never transcribed).
- **Watch out:** S06 note won't publish until it gets frontmatter and an em-dash filename.

### 2026-10-10 15:05 ET · Claude Code
- **Changed:** Taylor approved the S07 note; cherry-picked it onto main and pushed. Deleted the local `s07-note-review` branch and the REVIEW copy.
- **Commit:** `bf5561e`
- **Next:** commit Convo 2 propagation, regenerate the public session index, push.

### 2026-10-10 14:45 ET · Claude Code
- **Changed:** Generated the S07 session note "Omission of Truth" (~61 KB, full breakdown, Bruin POV, 31 transcript rolls, all wikilinks resolve) and added S07 spellings to `_Campaign_Setup.md`. Held on local branch `s07-note-review` pending Taylor's review.
- **Commit:** `0db680e` (local branch, not pushed)
- **Next:** Taylor reads the REVIEW copy in `_pipeline/S07/`; on OK, fast-forward main, push, run Convo 2.
- **Watch out:** pushing main publishes to the site; don't merge the branch without her OK.

### 2026-10-10 14:10 ET · Claude Code
- **Changed:** Reran S07 Phase A on the 12-speaker raw (110 corrections, Taylor approved) and rebuilt `Corrected/07 - 092026_corrected.md` with named speaker labels (320 replacements, line count preserved). Added `092026_Spell_Check_Log.md`.
- **Commit:** `62f38fc`
- **Next:** finish the S07 session note, then Taylor reviews before push/publish.
- **Watch out:** the 09-20 Phase B helper was Python, which isn't installed here; use Node for pipeline helpers.

### 2026-10-10 13:30 ET · Claude Code
- **Changed:** Replaced `Raw_Unedited/07-092026_raw_transcript.md` with a `--speakers 12` AssemblyAI rerun (universal-2, same keyterms). The old 7-label split merged five players into one label; the new split is one label per person. Old `_pipeline/S07/*` moved to `_v1_7speakers/`.
- **Commit:** `7b82324`
- **Next:** Taylor confirms the speaker map, then rerun S07 Phase A spellcheck on the new raw.
- **Watch out:** the corrected transcript from `5267c60` no longer matches the raw; don't generate a note from it.

### 2026-10-10 · Claude Code: ignore `.codex/` in this PUBLIC repo

- **Changed:** Added `.codex/` to `.gitignore` next to `.claude/`. Codex CLI created `.codex/config.toml` on 2026-09-21 and it had been sitting untracked; the file was deliberately NOT opened (config files can hold keys).
- **Commit:** `89f092d`
- **Next:** unchanged. S07 Phase B note status (started 09-20) is still unverified; check `_pipeline/S07/` and `01-Sessions/` first.

### 2026-10-01 12:45 ET · Claude Code — ignore admin-console screenshots in this PUBLIC repo

- **Changed:** Added `screencapture-*`, `**/screencapture-*` and `*dash.cloudflare*` to `.gitignore`. **All four public campaign vaults now carry the same rule** — `skitl_vault` already had it; `ashfall_vault`, `pacts_power_vault` and this one did not.
  - ✅ **Purely preventative here.** Checked before adding: no matching files were tracked **and** none were loose on disk, so unlike `ashfall_vault` (which had a stray `screencapture-dndbeyond-games-*.png` sitting untracked in its root) there was nothing to catch yet. No tracked file was newly ignored out of the index.
  - 📌 **Why a filename pattern and not reviewer judgement:** the privacy screen only reads `.md`/`.json`/`.txt`/`.canvas`/`.base`/`.html`, so images are invisible to it. And a console capture can leak an account or game ID **in the filename alone** — on 2026-09-29 a Cloudflare capture in another vault carried the account ID in its filename while the pixels looked harmless. Inspecting the image is not sufficient.
  - ⚠️ Media folders stay tracked on purpose for campaign art, which is why this is by filename pattern rather than by folder.
  - ✅ Verified both patterns match: a root-level `screencapture-*` and a nested `06-Media/screencapture-dash.cloudflare-*` are each caught.
- **Commit:** `1401c20`
- **Next:** Unchanged — the S07 pipeline work in flight is untouched by this.
- **Watch out:** ⚠️ An untracked `.codex/` directory is sitting in this working tree and is **not** from this change; left alone. ⚠️ A gitignore rule does nothing for a file that is **already committed** — if a screenshot ever does land here, it needs removing from history, not just ignoring.

> Older entries archived to `handoff-archive/2026-07.md`, `handoff-archive/2026-08.md`, `handoff-archive/2026-09.md` - everything before 2026-10-01 12:45 ET.
