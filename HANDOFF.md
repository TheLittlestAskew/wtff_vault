# HANDOFF — wtff_vault

> Obsidian D&D vault for the "Where the Flowers Forget" campaign. Includes Templates, Workflows, _pipeline.
> Handoff is **enabled** for this repo. Every change updates the Status/Next Steps below and prepends a log entry.
> Note: this is a notes/content vault — most session-note edits won't have a "next dev step."

## Status

Vault-consistency work order from the 2026-07-04 audit is open: handoff enabled and `DnD.base` added, but session-note schema migration hasn't run yet.

## Next Steps

- [ ] **S04 pending review** (2026-07-26 session) — check `_pipeline/S04/spellcheck.md`, then run `Workflows/scripts/Approve-WTFF.cmd` to apply corrections + generate the note + propagate. Pipeline is stopped here until approved.
- [ ] Migrate 3 session notes to the unified schema: add `type: session`, convert `session_number` from string to int — without `type: session` `DnD.base`'s Sessions view stays empty
- [ ] Run `Workflows/scripts/Publish-WTFF.cmd` to commit + push note changes (push = publish; the site reads notes straight from this repo)
- [ ] In Supabase, flip `ddb_campaigns` row 4 `status` from `paused` to `active` (set a real `game_id` only if WTFF starts using DDB rolls)
- [ ] Inside Obsidian (not shell), create `06-Media/` and move the 13 loose root images into it
- [ ] Track the site-repo work (rectrixcaedere) to generate `where-the-flowers-forget/session.html`'s session list from a manifest instead of hardcoding it

## Log
<!-- newest first · one entry per logical task/session · timestamp · source · changed · commit · next -->

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
