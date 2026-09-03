# TOOLS — wtff_vault

> What this project uses and what for. Maintained by the handoff motion: whenever
> a tool is used here, add or bump its row.
> Types: `Skill` · `MCP` · `CLI` · `App` · `Service` · `Site` · `Library` · `Data` · `Task`
> A `~` before a date means inferred, not observed. `—` means unknown.

## Active

| Tool | Type | Used for | Access | Last used | Cost | Notes |
|---|---|---|---|---|---|---|
| **Obsidian** | App | The vault itself — Where the Flowers Forget session notes, lore, characters | desktop | 2026-09-01 | Free | — |
| **obsidian-git** | Library | Auto-commit/backup of the vault | Obsidian plugin | ~2026-09-01 | Free | — |
| **templater-obsidian** | Library | Session/NPC/Item note templates | Obsidian plugin | ~2026-06-15 | Free | — |
| **smart-connections** | Library | Semantic search across the vault | Obsidian plugin | ~2026-06-15 | Free | — |
| **omnisearch** | Library | Full-text search across the vault | Obsidian plugin | ~2026-06-20 | Free | Only campaign vault with this one |
| **obsidian-5e-statblocks** | Library | Rendering monster/NPC statblocks | Obsidian plugin | ~2026-06-15 | Free | — |
| **obsidian-local-rest-api** | Library | Local HTTP access into the vault | Obsidian plugin | ~2026-06-15 | Free | Paired with `mcp-tools` |
| **mcp-tools** | MCP | Exposes the vault to Claude as MCP tools | Obsidian plugin | ~2026-06-15 | Free | Depends on `obsidian-local-rest-api` |
| **AssemblyAI** | Service | mp3 → session transcript | api.assemblyai.com | ~2026-08-31 | Paid | `3-5-pro` model |
| **WTFF Pipeline Watcher** | Task | Watches for new session audio and starts the transcribe→spellcheck→toast flow | Task Scheduler → `start-watcher-hidden.vbs` | 2026-09-02 | Free | State: Running. ⚠️ 72h `ExecutionTimeLimit` was the cause of a past timeout |
| **chokidar** | Library | Filesystem watching inside `wtff_pipeline_watch.js` | `Workflows/scripts` `chokidar@^5.0.0` | 2026-09-02 | Free | — |
| **BurntToast** | Library | Windows toast notifications with Review/Approve buttons | PowerShell module, `wtff_notify.ps1` | ~2026-08-31 | Free | — |
| **Supabase** | Service | `Rectrix_Caedere` — rolls and sessions for WtFF | project `vtrtyagltwdrbastpppl` | ~2026-09-01 | Free tier | Written by `Workflows/scripts/ddb_sync_supabase.js` |
| **supabase** | MCP | Vault-scoped MCP server for Supabase reads/writes | `.mcp.json` at vault root | ~2026-09-01 | Free | — |
| **ddb_party_sync.js** | Task | Syncing party/character roster from D&D Beyond | `Workflows/scripts/ddb_party_sync.js` | ~2026-06-27 | Free | — |
| **D&D Beyond** | Site | Source of roll and character data | dndbeyond.com | ~2026-09-01 | Paid | — |
| **session-index-generator** | Skill | Builds the public session index | `Workflows/scripts/generate_public_session_index.mjs` | 2026-08-31 | Free | — |
| **Node.js + npm** | CLI | Running the watcher, sync, and index-generation scripts | local install | 2026-09-01 | Free | — |
| **Python 3** | CLI | Ad-hoc correction scripts in `_pipeline/` | local install | ~2026-07-26 | Free | e.g. `S04/apply_corrections.py` |
| **git** | CLI | Version control, handoff motion | `C:\Program Files\Git` | 2026-09-01 | Free | — |
| **GitHub** | Service | Remote host for `TheLittlestAskew/wtff_vault` | github.com | 2026-09-01 | Free | — |
| **Claude Code** | App | Transcription review, session notes, the WTFF map, handoffs | CLI / IDE extension | 2026-09-01 | Paid | Map went live 2026-09-01: 27 towns, 16×12 grid |
| **septentrion-sync** | Skill | Feeds handoff state to the vault + SystemHorizon heartbeat | `~/.claude/skills/septentrion-sync` | 2026-09-02 | Free | In both `REPOS` and `TOOLS_REPOS` |

## Retired

| Tool | Type | Was used for | Retired | Why |
|---|---|---|---|---|
| ~~**AssemblyAI `3-pro`**~~ | Service | Transcription model | ~2026-08-01 | ✅ Upgraded to `3-5-pro` |
| ~~**Separate WTFF watcher config**~~ | Task | Its own standalone watcher setup | ~2026-08-24 | ✅ Unified with the SITL and Ashfall watchers into one campaign-watcher pattern |
