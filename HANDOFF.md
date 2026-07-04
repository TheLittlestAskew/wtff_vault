# HANDOFF — wtff_vault

> Obsidian D&D vault for the "Where the Flowers Forget" campaign. Includes Templates, Workflows, _pipeline.
> Handoff is **enabled** for this repo. Every change updates the DO NEXT block below and prepends a log entry.
> Note: this is a notes/content vault — most session-note edits won't have a "next dev step." Use the DO NEXT block for things like next-session prep if useful, or leave it as "—".

## ▶ DO NEXT — vault-consistency work order (from 2026-07-04 audit)
1. **Claude Code:** migrate 3 session notes to the unified schema (add `type: session`; `session_number: "02"` → `2` as int; `session_date` already correct ✓). Without `type: session` the new DnD.base shows zero sessions.
2. **Publish command:** `Workflows/scripts/Publish-WTFF.cmd` (double-click) commits + pushes all note changes; the site reads notes straight from this repo, so push = publish.
3. Supabase registry: `ddb_campaigns` row 4 still says `status = paused / game_id = 0` — flip to active; set real game_id if WTFF ever uses DDB rolls (current rolls are physical/transcript per S02 note).
4. Housekeeping (inside Obsidian, NOT shell): create `06-Media/` and move the 13 loose images at vault root into it.
5. Site note: `where-the-flowers-forget/session.html` on the site hardcodes its session list; adding a session to the site list is a site-repo edit until the list is generated from a manifest (tracked in rectrixcaedere work).

---

## Log
<!-- newest first · one entry per logical task/session · timestamp · source · changed · commit · next -->

### 2026-07-04 ET · Claude chat
- **Changed:** Enabled repo handoff (this file). Added `DnD.base` (byte-identical to the SITL/Ashfall base — six views: character, session, npc, location, item, quest). Added `Workflows/scripts/Publish-WTFF.cmd` one-command publish.
- **Commit:** `Enable handoff; add DnD.base + Publish-WTFF.cmd (vault-consistency audit)`
- **Next:** Frontmatter migration (item 1 above) so the base lights up.
- **Watch out:** session notes lack `type: session` today, so the base's Sessions view is empty until migration.
