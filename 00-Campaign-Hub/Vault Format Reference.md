# Vault Format Reference — Where the Flowers Forget

> Quick reference for the conventions used throughout this vault. Mirrors the Sky Is The Limit vault.

## Backlink Conventions
| Content Type | Backlink Format | Example |
|---|---|---|
| PC names | `[[Character Name]]` | `[[Character Name]]` |
| NPC names | `[[NPC Name]]` | `[[NPC Name]]` |
| Locations | `[[Location Name]]` | `[[Location Name]]` |
| Sessions | `[[Session ## — Title]]` | `[[Session 01 — Title]]` |
| Factions | `[[Faction Name]]` | `[[Faction Name]]` |
| Creatures | `[[Creature Name]]` | `[[Creature Name]]` |
| Plants/Fungi | `[[Plant Name]]` | `[[Plant Name]]` |

**Rules:** Backlink on first mention within a section (not every occurrence). The Campaign Dashboard links to everything. Every page ends with a `## Related` section of backlinks.

## File Naming
| Type | Format | Example |
|---|---|---|
| Session Notes | `Session [##] — [Title].md` | `Session 01 — The First Bloom.md` |
| Raw Transcripts | `[##]-[MMddyy]_raw_transcript.md` | `01-061426_raw_transcript.md` |
| Corrected Transcripts | `[##] - [MMddyy]_corrected.md` | `01 - 061426_corrected.md` |
| Spell Check Logs | `[MMddyy]_Spell_Check_Log.md` | `061426_Spell_Check_Log.md` |
| PCs | `[Character Name].md` | `[Character Name].md` |
| NPCs | `[NPC Name].md` | `[NPC Name].md` |
| Locations | `[Location Name].md` | `[Location Name].md` |
| Regions | `[Region Name].md` | `[Region Name].md` |
| Factions | `[Faction Name].md` | `[Faction Name].md` |
| Creatures | `[Creature Name].md` | `[Creature Name].md` |
| Plants/Fungi | `[Plant or Fungus Name].md` | `[Plant Name].md` |
| Media | Descriptive name | `region_map.png` |

## Speaker Label Conventions (Corrected Transcripts)
- Character names in ALL CAPS for in-character speech: `NAME:`
- Player names + (OOC) for out-of-character: `PLAYER (OOC):`
- `DM:` (or named DM) for DM narration; `NPC NAME:` when the DM voices a specific identified NPC
- `[inaudible/cut off]` markers retained as-is
- Blank line between each speaker entry; original timestamps preserved

## Frontmatter `status` Vocabularies
- **PC/NPC:** Alive / Dead / Missing / Captured / Cursed / Unknown
- **Location:** Explored / Partially Explored / Known But Unvisited / Hostile / Safe
- **Faction relationship:** Hostile / Neutral / Friendly / Allied / Unknown

---

## Publishing to the website + the Map of Artemesia

> Added 2026-08-31. Before this, the map's blooms, travel line and "party is here"
> pin were **hardcoded** in `where-the-flowers-forget/archive.html` in the site repo
> and had to be hand-edited after every session. They now come from this vault.

### The one required key

Every session note from **S01** onward must carry:

```yaml
site_location: sunrootcrossing
```

That value is a **key into [[Map Locations|00-Campaign-Hub/Map Locations.json]]**, not a
display name. It is what places the session's bloom on the map, extends the travel
line, and moves the "party is here" pin (the pin always follows the **highest-numbered**
session).

Optional passthrough keys, used by the session page if present: `site_region`,
`site_arc`, `site_events` (a YAML list).

### Adding a place the map has never shown

🛑 **Coordinates cannot be derived — a human has to look at the map image.**

1. Open `/assets/img/Artemesia_Map.webp` (aspect ratio 980×735).
2. Estimate the position as **percentages from the top-left**, 0–100.
3. Add an entry to `00-Campaign-Hub/Map Locations.json`:
   ```json
   "brindleberryhollow": { "x": 61, "y": 44, "name": "Brindleberry Hollow", "region": "— (unknown)" }
   ```
4. Reference the key from the session note's `site_location`.

⚠️ **If you skip step 3, the publish FAILS on purpose** with
`site_location "…" has no entry in 00-Campaign-Hub/Map Locations.json`. That is
deliberate — the alternative is a session that silently never appears on the map.

### How publishing actually works

`Workflows\scripts\Publish-WTFF.cmd` (and the pipeline watcher's **Publish** stage)
regenerate `00-Campaign-Hub/Public Session Index.json`, then commit and push.
`archive.html` fetches that JSON from this repo's `main` at request time, so **the
push is the publish** (~5 min for CDN).

⚠️ The `FALLBACK` block still in `archive.html` is a frozen snapshot used only when
that fetch fails. **Do not hand-edit it to publish a session** — the live index
overwrites it on the next successful load, so you would be the only person who ever
sees the change.

### Sessions excluded on purpose

- **S00** — pre-campaign character creation; not on the site. Its frontmatter also
  disagrees with its filename (`session_number: "02"` in a file named `Session 00`),
  which is a pre-existing inconsistency left alone rather than guessed at.
