# WTFF Pipeline Automation — Setup Runbook

Option B: drop an `.mp3` → auto-transcribe → auto spell-check → **you approve** → auto-apply + auto-propagate + auto-push. No `.docx`.

---

## 1. Where each file goes

| File (from this build) | Put it here in the vault |
|---|---|
| `wtff_pipeline_watch.js` | `Workflows\scripts\` (run it from here) |
| `automation\convo1_phaseA.md` | `Workflows\Project\Automation\` |
| `automation\convo1_phaseB_apply.md` | `Workflows\Project\Automation\` |
| `automation\convo2_propagate.md` | `Workflows\Project\Automation\` |
| `mcp.json` | vault root, **renamed to** `.mcp.json` |

The watcher auto-creates `_pipeline\` (scratch/review files) on first run.

---

## 2. One-time setup (≈15 min, do once)

1. **Install Claude Code** if you haven't: `npm install -g @anthropic-ai/claude-code`, then run `claude` once in the vault and log in.
2. **Install the watcher dependency:** open a terminal in `Workflows\scripts\` and run `npm install chokidar`.
3. **Supabase token (for unattended roll queries):**
   - Generate a Personal Access Token at `https://supabase.com/dashboard/account/tokens`.
   - Set it as a Windows **user** environment variable named `SUPABASE_ACCESS_TOKEN` (search "Edit environment variables for your account"). Open a fresh terminal after.
   - This keeps the token out of the repo — `.mcp.json` only references `${SUPABASE_ACCESS_TOKEN}`.
4. **Verify the MCP:** in the vault root run `claude` then `/mcp` — `supabase` should show connected. Ask it to run a quick `SELECT COUNT(*) FROM wtff_session_rolls;` to confirm.
5. **Open `wtff_pipeline_watch.js` and check the CONFIG block** — especially `RAW_DIR`. Your Convo 2 doc says the transcriber writes to `Raw_Unedited`; older notes say `Raw`. Set whichever is real, and confirm `TRANSCRIBE_CWD` points at the folder holding `transcribe.js` (`Workflows\scripts\wtff_transcribe`).
6. **`.gitignore`:** add `_pipeline/` (transient scratch). `.mcp.json` has no secret in it, so committing it is optional/safe.
7. ✅ **`.docx` removal done** (see next section) — completed 2026-06-13.

---

## 3. Remove `.docx` from the instructions — ✅ DONE (2026-06-13)

The `.docx` / legacy docx-generator session-notes wording has been stripped from the instruction files. The canonical session-notes artifact is now the `01-Sessions/` markdown note, written during Convo 1. Changes made:

- `Convo_1_Instructions.md`: removed the `.docx` generation step (flow is now 6 steps), the docx-generator prerequisite, the `.docx` handoff/completion references, and the legacy structure note.
- `Convo_2_Instructions.md`: changed "the .docx from Convo 1" → "the markdown note from Convo 1"; removed the "Does not generate .docx" line.
- `Project_Instructions.md`: removed "Step 7: Generate .docx" (steps renumbered), the `.docx`/docx-generator Source Files rows, and the `.docx` deliverable + Drive-storage rows.
- `Convo2_Handoff_Template.md`: removed the `.docx` Session File field.
- `Session_Notes_Template_Instructions.md`: marked RETIRED — the legacy docx generator is no longer used. (Adapt or skip if this file does not exist in the WTFF vault.)
- `WTFF_Vault_Structure_Guide.md`: removed the "adapted from the .docx output" wording. (Adapt or skip if this file does not exist in the WTFF vault.)

The only remaining `.docx` mentions are protective "no `.docx`" guards and input-transcript references. The legacy docx-generator skill is now dead weight; archive it when convenient.

---

## 4. Daily use

1. **Start the watcher** (leave the window open): from `Workflows\scripts\` run
   `node wtff_pipeline_watch.js`
2. **Drop the session `.mp3`** into `Session_Sources\Recordings\`.
3. Wait. It transcribes, runs the spell-check pass, then **beeps + prints `READY FOR REVIEW`**.
4. **Review** `_pipeline\S##\spellcheck.md` (and `flags.md`). Edit the table directly if a correction is wrong — your edits are treated as final.
5. **Approve:** run `node wtff_pipeline_watch.js --approve`. It applies corrections, writes the markdown note, propagates the whole vault, and pushes to GitHub.

That's the only manual step: the spell-check glance. Everything else is hands-off.

---

## 5. Two things to know

- **Billing (kicks in June 15, 2026):** headless `claude -p` usage on subscription plans draws from a separate monthly Agent SDK credit pool, distinct from your interactive limits. This whole pipeline runs on `claude -p`, so heavy session-processing pulls from that pool.
- **Permissions:** the watcher uses `--permission-mode acceptEdits` (auto-accepts file edits). If the Phase-B / Convo-2 legs stall asking to confirm a `git push` or bash command, change `CLAUDE_FLAGS` in the watcher to `--dangerously-skip-permissions` (fully unattended) **or** scope it, e.g. add allowed bash like `--allowedTools "Read,Edit,Write,Bash(git*),Bash(node*)"`. Start with acceptEdits; only loosen if it actually blocks.

---

## 6. What changed vs. the old flow

- Vault writes are now **native file edits** in Claude Code — no Obsidian MCP, no 4-minute timeouts, no read/draft/write phasing.
- GitHub is a **plain `git push`** — the old ~21KB inline-push ceiling and blob-SHA ritual were GitHub-*MCP* artifacts and no longer apply.
- Supabase stays via MCP (read-only, scoped to your project).
- Convo 1 now writes the `01-Sessions` markdown note directly (no redundant rebuild in Convo 2), and **no `.docx` is produced anywhere.**
