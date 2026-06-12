# Project/ — Claude Project-Knowledge Mirror

This folder is a **git backup** of the Claude project-knowledge instruction documents for Where the Flowers Remember. These docs define how Claude turns raw sessions into the Obsidian vault.

## Why this exists

The instruction docs live inside the Claude project, where no MCP tool can read or write them — they are maintained by hand, which makes them easy to lose. Mirroring them here gives:

- A version-controlled backup and history
- A public reference for the DM and players
- A recovery source if a project doc is deleted or corrupted

## Source of truth

**The Claude project is canonical.** This folder is a copy. When you edit an instruction doc in the project, paste the new version here too. If the two ever disagree, the project wins — *unless* the project copy was lost, in which case this folder is the recovery source.

## Standard contents

Every campaign vault uses the same filenames in this folder. A campaign may not need every doc; mark those `n/a` instead of deleting the slot, so the structure stays uniform across vaults.

| Standard filename | Mirrors project doc | Purpose |
|---|---|---|
| `Project_Instructions.md` | master ruleset | Shared rules, constraints, campaign reference |
| `Convo_1_Instructions.md` | Convo 1 instructions | Session-notes generation workflow |
| `Convo_2_Instructions.md` | Convo 2 instructions | Vault-update workflow |
| `Session_Notes_Section_Breakdown.md` | section breakdown | What goes in each notes section |
| `Session_Notes_Template_Instructions.md` | template instructions | Using the notes generator |
| `Convo2_Handoff_Template.md` | handoff template | The Convo 1 → Convo 2 bridge block |

## This vault's status (Where the Flowers Remember — pre-launch, 2026-06-14)

These are **seeded starter docs** adapted from the Sky Is The Limit standard, plus a living bootstrap file. The docs are structurally complete; the campaign-specific blanks aren't meant to be filled in one sitting — they **fill themselves in as play reveals them**, via `_Campaign_Setup.md` (see below).

| Standard filename | Status |
|---|---|
| `_Campaign_Setup.md` | ✅ Living bootstrap — the self-building engine (pending inputs + decisions log). Read first by Convo 1 & 2. |
| `Project_Instructions.md` | ✅ Lean seed — role, source authority, non-negotiable constraints, and the self-building loop. Grows into a full ruleset as `_Campaign_Setup.md` resolves. |
| `Convo_1_Instructions.md` | ✅ Seeded starter (placeholders: roster, roll archive / `game_id`, notes generator, POV character, spelling reference) |
| `Convo_2_Instructions.md` | ✅ Seeded starter (aligned to the WTFR vault structure guide) |
| `Session_Notes_Section_Breakdown.md` | ✅ Seeded starter (campaign-agnostic; examples neutralized) |
| `Session_Notes_Template_Instructions.md` | ➖ n/a for now — WTFR uses `Templates/Session Notes Template.md` (an Obsidian template), not a code generator. Revisit if a generator is adopted. |
| `Convo2_Handoff_Template.md` | ✅ Seeded starter |

### How it fills itself in

`_Campaign_Setup.md` is the engine. Convo 1 and Convo 2 both read it first (their Step 0). When a session or setup reveals a pending input — the DM's name, a player's DDB ID, the live `game_id`, your PC, a recurring spelling, a format choice — it gets recorded there and propagated to whatever it unblocks. Nothing is invented; an input stays unknown until the campaign supplies it. So the scaffolding holds your intent now and adapts to the campaign as it actually unfolds.

These are the inputs the bootstrap file is waiting on:

- **Player names + DDB user IDs** → roster, roll attribution, physical-dice players
- **DM identity** → source-authority references, `DND_Sources/DM Notes.md` rename
- **Live DDB `game_id`** → roll archive wiring (`wtfr_session_rolls` view, currently not live)
- **POV character (your PC)** → POV journal voice + the POV section of Convo 1
- **Campaign canonical spellings** → a WTFR spelling reference for spell check
- **Notes output format** → markdown via `Templates/Session Notes Template.md`, or a `.docx` generator

## Sync discipline

Whenever you change an instruction doc in the Claude project:

1. Copy the full new text.
2. Replace the matching file here.
3. Commit (Obsidian Git auto-commits within ~10 min, or push manually).
