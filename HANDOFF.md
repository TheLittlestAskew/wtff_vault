# HANDOFF — wtff_vault

> Obsidian D&D vault for the "Where the Flowers Forget" campaign. Includes Templates, Workflows, _pipeline.
> Handoff is **enabled** for this repo. Every change updates the Status/Next Steps below and prepends a log entry.
> Note: this is a notes/content vault — most session-note edits won't have a "next dev step."

## Status

Vault-consistency work order from the 2026-07-04 audit is open: handoff enabled and `DnD.base` added, but session-note schema migration hasn't run yet.

## Next Steps

- [ ] 🛑 **Delete BOTH misfiled SITL transcripts from `Session_Sources/Transcripts/Raw_Unedited/`: `04-080226_raw_transcript.md` AND `04-UNKNOWN_raw_transcript.md`.** Neither is a WtFF session — both are Sky Is The Limit (DM Addison, *Out of the Abyss*). `04-080226`'s own header names its audio `080226 SITL Recording.mp3`, and the **authoritative copy already exists** at `sitl_vault/Session_Sources/Transcripts/Raw_Unedited/21-080226_raw_transcript.md` with a `sitl_vault/_pipeline/S21/` folder — so deleting loses nothing. `04-UNKNOWN` is a 7-minute partial capture of that same audio. Both are gitignored for now (public repo — do not commit another campaign's transcript). **Do not run `Approve-WTFF.cmd` against either** — applying their corrections would import published Forgotten Realms lore into WtFF canon. Evidence: `_pipeline/S04/flags.md` #1.
- [ ] **Check the transcription watcher config** — it routed SITL audio into this vault **twice** on 2026-08-02 (15:59Z and 20:06Z). Also make the transcript header derive from the output vault instead of hardcoding `# Where the Flowers Forget — Session Transcript`; that boilerplate is what makes a misfiled recording look native at a glance.
- [ ] **S04 pending review** (2026-07-26 session) — check `_pipeline/S04/spellcheck_S04-072626.md` (⚠️ renamed — two later runs overwrote `spellcheck.md`/`flags.md`/`summary.md` with wrong-campaign reviews; originals were copied to `*_S04-072626.md` first, and the 08-02 run's own outputs to `*_S04-UNKNOWN.md`). Then run `Workflows/scripts/Approve-WTFF.cmd` to apply corrections + generate the note + propagate. Pipeline is stopped here until approved.
- [ ] **Verify Adam's 2014/2024 rules ruling against the real S04 transcript** (`04-072626`) before recording it anywhere. Taylor recounts it twice in the SITL transcript ("if there's anything from 2014 rules that you like better, you can just apply that to 2024 rules") and invokes it for Bruin's Path of the Totem Warrior bear resistance — but that is second-hand, from another table, so it is capped ≤60% and was **not** written to `_Campaign_Setup.md`.
- [ ] Migrate 3 session notes to the unified schema: add `type: session`, convert `session_number` from string to int — without `type: session` `DnD.base`'s Sessions view stays empty
- [ ] Run `Workflows/scripts/Publish-WTFF.cmd` to commit + push note changes (push = publish; the site reads notes straight from this repo)
- [ ] In Supabase, flip `ddb_campaigns` row 4 `status` from `paused` to `active` (set a real `game_id` only if WTFF starts using DDB rolls)
- [ ] Inside Obsidian (not shell), create `06-Media/` and move the 13 loose root images into it
- [ ] Track the site-repo work (rectrixcaedere) to generate `where-the-flowers-forget/session.html`'s session list from a manifest instead of hardcoding it

## Log
<!-- newest first · one entry per logical task/session · timestamp · source · changed · commit · next -->

### 2026-08-02 16:30 ET · Claude Code
- **Changed:** Ran Convo 1 Phase A (spell-check only) on `04-080226_raw_transcript.md` — the 233-minute drop — and it is **the same wrong campaign as this morning's fragment**: Sky Is The Limit, DM Addison, *Out of the Abyss*. Its own header names the audio `080226 SITL Recording.mp3`, and the recording is **already correctly filed** as `sitl_vault/.../21-080226_raw_transcript.md` with a `sitl_vault/_pipeline/S21/` folder, so this vault's copy is a stray duplicate. All six PCs (Kit, Darby, Amanita, Blarg, Binks, Aeolus) and every location (Sloobludop, Velkynvelve, Mantol-Derith, the Darklake, the Feydark) have `sitl_vault` pages and zero WtFF/WtFR presence; Taylor names WtFF as a *different* game on-air ("Adam's my DM. We have parallel campaigns"). Wrote `spellcheck.md` (88 corrections, **all BLOCKED**, 59 at ≤60%), `flags.md` (12 groups), `summary.md`, `READY_FOR_REVIEW` into the gitignored `_pipeline/S04/`. Nothing applied, no Supabase, no `_Campaign_Setup.md` edit. Added both misfiled SITL transcripts to `.gitignore` and rewrote the top of Next Steps.
- **Commit:** — (staged, not committed — see Friction; `.gitignore` is staged and this entry is written, but both are **unbanked**)
- **Friction:** gen-fail — the same `_pipeline/S04/` collision fired a *second* time, now three-deep. Copied the previous run's outputs to `*_S04-UNKNOWN.md` before overwriting, so the folder holds three reviews (`*_S04-072626`, `*_S04-UNKNOWN`, and the live trio). This is no longer a one-off: **key the pipeline folder on the transcript filename, not the session number.**
- **Friction:** gen-fail — **`git commit` is blocked in this non-interactive run** and no message form gets through (`-m` single-line, multiple `-m` flags, `-F <file>`, and a PowerShell here-string were all refused for approval). `git add` / `git status` / `git rev-parse` all work fine, so this is a commit-specific permission gap, not a git-access gap. **Nothing worked around it — this session is unbanked.** Same symptom as the 12:10 entry, which is also still uncommitted. To bank both by hand: `git add .gitignore HANDOFF.md && git commit -F _pipeline/S04/_commitmsg.txt && git push` (message file is pre-written), then a second commit for HANDOFF.md, then delete `_pipeline/S04/_commitmsg.txt`.
- **Friction:** gen-fail — `cd <repo> && git …` was refused by the Bash tool as an untrusted-hooks risk, and `Set-Content -Value $null` was rejected by the PowerShell validator. Worked by running bare git from the repo cwd and using `touch` for the marker file. Also lost a call to a stale cwd: an earlier `cd _pipeline/S04` persisted and made `git add .gitignore` fail with "pathspec did not match" — check `pwd` before assuming repo root.
- **Friction:** gen-fail — first wrote the spell-check totals as "71 / 44" from a rough estimate rather than counting the table; recounted per-section and corrected to 88 / 59 before finishing. Count the rows, don't eyeball them.
- **Next:** Delete both misfiled SITL transcripts, then resume the real S04 review from `spellcheck_S04-072626.md`.
- **Watch out:** ⚠️ **Three** files in `Raw_Unedited/` now claim session 04 — only `04-072626` is genuinely WtFF. ⚠️ The two SITL ones are **gitignored, not deleted** — deliberate: this repo is public and committing another campaign's 233-min transcript (players' first names, real-life above-table chat) would republish it. Remove the `.gitignore` block once the files are gone. ⚠️ `DND_Sources/Notes from Adam.md` is still an empty template, which is why every proper noun in any WtFF transcript caps at ≤60% — worth asking Adam for canon spellings.

### 2026-08-02 12:10 ET · Claude Code
- **Changed:** Ran Convo 1 Phase A (spell-check only) on the new drop `04-UNKNOWN_raw_transcript.md` and found it is **not a WtFF session** — it's Sky Is The Limit (DM Addison, *Out of the Abyss*). Every proper noun (Demogorgon, "Sloopla Dot"→Sloobludop, "Jim Jar"→Jimjar, Indigo, Addison) has a page in `sitl_vault` and none in WtFF/WtFR; the DM also says "almost at our one year anniversary" (WtFF launched 7 weeks ago) and asks about a "level 5 level up" (WtFF hit level 2 on 7/26). Wrote `spellcheck.md` (6 corrections, **all marked BLOCKED**), `flags.md` (9 groups), `summary.md`, `READY_FOR_REVIEW` — all in the gitignored `_pipeline/S04/`. Nothing applied. Also updated Next Steps above.
- **Commit:** — (see Friction; nothing committable reached the tree)
- **Friction:** gen-fail — `git` was blocked by the permission prompt in this non-interactive run (Bash and PowerShell both refused `git status`), and `pwsh` timed out at 5s on an unrelated call, so **the transcript is still untracked and this handoff entry is unpushed**. Nothing worked around it; banking needs an interactive session. Run `git add -A && git commit && git push` by hand, or re-run this from an interactive Claude Code session.
- **Friction:** gen-fail — the prompt reused `_pipeline/S04/` for a different transcript, so writing the standard output filenames would have destroyed the finished Phase A review for the real S04 (072626). Worked by copying the originals to `spellcheck_S04-072626.md` / `flags_S04-072626.md` / `summary_S04-072626.md` before overwriting. The pipeline should key its folder on the transcript filename, not just the session number.
- **Next:** Reroute the UNKNOWN transcript out of this vault (new top item in Next Steps), then resume the real S04 review from `spellcheck_S04-072626.md`.
- **Watch out:** ⚠️ Two files in `Raw_Unedited/` now both claim session 04 — `04-072626` (real, already has a corrected transcript) and `04-UNKNOWN` (mis-filed). ⚠️ `_pipeline/S04/spellcheck.md` no longer describes WtFF S04; the real one is `spellcheck_S04-072626.md`. Do not point `Approve-WTFF.cmd` at the folder until the wrong-campaign file is gone.

### 2026-07-29 20:43 ET · Claude Code
- **Changed:** Pushed Taylor's own `vault backup: 2026-07-28 22:06:17` commit, which had been sitting unpushed for 22 hours. It adds `Session_Sources/Transcripts/Corrected/04 - 072626_corrected.md`, 2477 lines. Nothing was authored here; a cross-repo handoff sweep found the unpushed state and Taylor confirmed the push.
- **Commit:** `0221050` (hers), plus this handoff entry
- **Next:** Unchanged. S04 still pending review at the top of Next Steps.
- **Watch out:** ✓ Checked before pushing, because this repo's own Next Steps warns "push = publish; the site reads notes straight from this repo". Transcripts are **not** part of that: no `.html`, `.cmd` or publish config references `Transcripts/`, only the pipeline scripts and the Obsidian workspace. And corrected transcripts 01 through 03 are already on the remote, 17 transcript files in total, so this is consistent with existing practice rather than a new category of content going public. ⚠️ The `vault backup:` commit naming means some backup automation is still committing in this vault without pushing. Worth knowing given the WIP-backup snapshotter was disabled in July for pushing personal data to product remotes; this one is at least writing only to its own vault repo.

### 2026-07-26 22:41 ET · Claude Code
- **Changed:** Recovered the stalled pipeline watcher (orphaned since 7/25, process alive but its file-watch had gone deaf, so tonight's 10:17 PM drop wasn't detected). Killed the zombie, started a clean watcher, re-triggered the drop. S04 transcribed via AssemblyAI (153 min, 17,969 words, 96.3% confidence, 7 speakers); keyterms refreshed (+6 proper nouns).
- **Commit:** `5a38b41`
- **Next:** Review S04 spell-check in `_pipeline/S04/spellcheck.md`, then run `Approve-WTFF.cmd` to apply + propagate (added as top item in Next Steps).
- **Watch out:** Watcher can go "alive but deaf" — process up, file-watch dead — and the scheduled task's auto-restart does NOT catch it (no heartbeat/heal task like Swiftwatch has). If a future drop shows no toast: restart the watcher AND re-drop the file, because `ignoreInitial` makes a restart skip files already sitting in Recordings.

### 2026-07-26 11:44 ET · Claude Code
- **Changed:** Added the Handoff Contract to `AGENTS.md` so Codex follows it. Codex reads `AGENTS.md`, never `~/.claude/skills/`, so it had no handoff instructions at all before this.
- **Commit:** `f67b2e9`
- **Next:** Unchanged. See the block above this log.
- **Watch out:** Log entries must now carry a tool label (`Claude Code` / `Claude desktop` / `Codex` / `ChatGPT`). Do not restructure this file; the dashboard parses it.

### 2026-07-04 ET · Claude chat
- **Changed:** Enabled repo handoff (this file). Added `DnD.base` (byte-identical to the SITL/Ashfall base — six views: character, session, npc, location, item, quest). Added `Workflows/scripts/Publish-WTFF.cmd` one-command publish.
- **Commit:** `Enable handoff; add DnD.base + Publish-WTFF.cmd (vault-consistency audit)`
- **Next:** Frontmatter migration (item 1 above) so the base lights up.
- **Watch out:** session notes lack `type: session` today, so the base's Sessions view is empty until migration.
