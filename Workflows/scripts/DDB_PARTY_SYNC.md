# DDB Party Sheet Sync — Where the Flowers Remember

Pulls the party's D&D Beyond character sheets into the vault. Built **before** the campaign
starts (2026-06-14), with a `--discover` mode so you never collect character IDs by hand.

## The two-step game-day flow

```powershell
cd C:\Users\theli\wtfr_vault\Workflows\scripts
node ddb_party_sync.js --discover    # 1. auto-build the roster (run once, after joining)
node ddb_party_sync.js               # 2. fetch every PC's sheet
```

**`--discover`** fetches *your* sheet (`selfCharacterId` in `ddb_party.json`), reads the
**embedded campaign roster** (D&D Beyond ships every member's `userId` / `characterId` /
`characterName` inside your own sheet's JSON once you're in the campaign), and rewrites the
`characters` list automatically. No PDFs, no copying IDs from the campaign page.

> **Timing:** your sheet only carries the roster once you've **joined the campaign page**
> (game day). Run `--discover` before that and it'll fetch your sheet fine but report
> "not attached to a campaign roster yet — re-run on game day." That's expected.

## Setup (do this now)

1. **`selfCharacterId`** is already set to your PC (`165368339`); `gameId` is `7853407`.
2. Add your Cobalt token to the vault `.env`:  `DDB_COBALT=<value>`
   (F12 → Application → Cookies → dndbeyond.com → `CobaltSession`; account-wide, same value as
   your other vaults). `.env` is gitignored.
3. **Validate now (optional):** with the token set, `node ddb_party_sync.js --discover` will
   succeed at fetching your sheet and stop at the "no roster yet" message — confirming auth works
   ahead of game day.

## Output

- `03-Characters/01 PCs/Party Character Sheets/_raw/<CharacterName>.json` — full raw JSON
- `03-Characters/01 PCs/Party Character Sheets/<CharacterName> (DDB).md` — readable sheet

Files are named by real character name. Both are **gitignored** by default (other players'
Campaign-Only data) — see `.gitignore`. The vault isn't a git repo yet; the ignore rules take
effect the moment you `git init`.

## Pipeline watcher — already wired in

`wtfr_pipeline_watch.js` is scaffolded in this folder and **already calls
`node ddb_party_sync.js`** each session (right after the keyterms step, non-fatal). So once
the roster is discovered, every session auto-refreshes the party's sheets.

Flow: run `node ddb_party_sync.js --discover` once (after session 1, when you've joined the
campaign page) to populate the roster — then the watcher keeps everyone's sheets fresh on its
own. See `TRIGGERABLE_ACTIONS.md` for the full watcher action list and the remaining
prerequisite (the transcriber at `wtfr_transcribe\transcribe.js`).
