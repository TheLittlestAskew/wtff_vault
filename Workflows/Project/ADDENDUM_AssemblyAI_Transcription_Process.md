# ADDENDUM: AssemblyAI Transcription Process

**Added:** 2026-05-15
**Applies to:** Convo 1, Step 2 (Spell Check) and Step 3 (Corrected Transcript)
**Script location:** `wtff_vault\Workflows\scripts\wtff_transcribe\transcribe.js`

---

## Overview

Session recordings are now transcribed locally via a Node.js script that calls the AssemblyAI API with campaign-specific vocabulary pre-loaded. This replaces the previous workflow of using raw speech-to-text output from the recording platform and dramatically reduces the number of spelling corrections needed in Step 2.

The script produces a Raw/Unedited Transcript saved as `.md` in the vault. This Raw/Unedited Transcript is then reviewed, corrected, and moved to the Corrected folder as part of the normal Convo 1 workflow.

---

## Prerequisites

1. **Node.js v18+** installed
2. **AssemblyAI API key** — set as environment variable `ASSEMBLYAI_API_KEY` or hardcoded in the script's `API_KEY` constant
3. **Session recording** (.mp3, .mp4, .m4a, .wav, .webm, .ogg, .flac) placed in `wtff_vault\Session_Sources\Recordings\`

---

## How to Run

### Option A: Interactive Picker (Recommended)
```
cd C:\Users\theli\Obsidian Vaults\wtff_vault\Workflows\scripts\wtff_transcribe
node transcribe.js
```
Lists all recordings in the Recordings folder sorted newest-first. Pick by number.

### Option B: Direct Filename
```
node "C:\Users\theli\Obsidian Vaults\wtff_vault\Workflows\scripts\wtff_transcribe\transcribe.js" "061426_Where_the_Flowers_Forget_Recording.mp3"
```
⚠️ Filenames with spaces **must** be wrapped in quotes.
⚠️ Include the file extension (.mp3, .m4a, etc.).

### What Happens
1. Script uploads the audio file to AssemblyAI
2. Submits transcription request with the campaign-specific keyterms and custom spelling corrections
3. Polls until transcription completes (typically 2–5 minutes depending on length)
4. Saves formatted transcript to `wtff_vault\Session_Sources\Transcripts\Raw_Unedited\[filename]_transcript.md`
5. Prints summary with duration, confidence score, word count, and speaker count

---

## Vault File Flow

```
Session_Sources/
├── Recordings/
│   └── 061426_Where_the_Flowers_Forget_Recording.mp3      ← original audio
└── Transcripts/
    ├── Raw_Unedited/
    │   └── 061426_Where_the_Flowers_Forget_Recording_transcript.md  ← script output
    └── Corrected/
        └── 01_061426_corrected.md                  ← after spell check + formatting
```

**Raw → Corrected process:**
1. Run `transcribe.js` → Raw/Unedited Transcript lands in `Transcripts/Raw_Unedited/`
2. Claude performs Step 2 spell check against the Raw/Unedited Transcript
3. Taylor confirms corrections
4. Claude applies corrections, reformats to script format, saves to `Transcripts/Corrected/` as `[Session#]_[MMddyy]_corrected.md`

---

## What the Script Does to Improve Accuracy

### Keyterms Prompt
Tells AssemblyAI's model to prioritize recognizing campaign-specific words during transcription. Organized by category:

- Player characters and player names
- NPC companions, allies, antagonists ([[PLACEHOLDER: list key recurring NPCs from Artemesia here]])
- Deities and powers of the setting ([[PLACEHOLDER: list relevant deities/powers]])
- Major locations ([[PLACEHOLDER: list major Artemesia locations]])
- Regions, sub-locations, materials ([[PLACEHOLDER: list regions/materials]])
- Creatures and monsters ([[PLACEHOLDER: list recurring creature types]])
- D&D spells used by the party
- D&D mechanics terminology (Battle Master, superiority dice, Wild Shape, etc.)
- Factions and legendary lore NPCs ([[PLACEHOLDER: list factions/legendary NPCs]])

### Custom Spelling Corrections
Post-transcription find-and-replace for known misheard variants. Examples (fill in once the
first sessions surface real mishearings):

| Misheard | Corrected To |
|---|---|
| [[PLACEHOLDER: misheard variant]] | Isla |
| [[PLACEHOLDER: misheard variant]] | Artie |
| [[PLACEHOLDER: misheard variant]] | Bebo |
| [[PLACEHOLDER: misheard variant]] | Eliza |
| [[PLACEHOLDER: misheard variant]] | Tobias |
| [[PLACEHOLDER: misheard variant]] | Zarna |

⚠️ **AssemblyAI limitation:** The `custom_spelling` `to` field accepts single words only. Multi-word corrections (e.g., "Faerie Fire", or a two-word proper name) are handled by keyterms instead, which boosts recognition of the correct phrase during transcription.

### Speaker Diarization
Configured to expect 7 speakers (DM + 6 players). AssemblyAI labels speakers as A–G. In practice:

- The model sometimes identifies speakers by character/player name
- The DM frequently gets split into two speaker labels due to mic quality shifts
- The quieter-voiced players are the most commonly mislabeled speakers
- Speaker mapping must be verified each session during the spell check step

---

## Maintaining the Vocabulary

As the campaign progresses, new terms need to be added to the script. Edit `transcribe.js` directly:

- **New NPCs/locations/creatures:** Add to the appropriate category in `WTFF_KEYTERMS`
- **New misheard variants discovered during spell check:** Add to `WTFF_CUSTOM_SPELLING`
- Remember: `custom_spelling` `from` and `to` values must each be single words
- Maximum 1,000 keyterms (plenty of headroom)

After each session's spell check, Claude should recommend any new terms to add based on corrections made.

---

## Recordings Storage

- **Primary (vault):** `C:\Users\theli\Obsidian Vaults\wtff_vault\Session_Sources\Recordings\`
- **Original backup (OneDrive):** [[PLACEHOLDER: OneDrive backup path for Where the Flowers Forget recordings]]

The script points to the vault copy. Originals remain in OneDrive as backup.

---

## Impact on Convo 1 Workflow

The transcription script changes the **input** to Convo 1 but not the process itself:

| Step | Before | After                                                    |
| -------------------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| **Input** | Raw/Unedited Transcript from recording platform (.docx) | Raw/Unedited Transcript from AssemblyAI via script (.md) |
| **Step 2: Spell Check** | 30+ corrections typical | ~5–10 corrections typical                                |
| **Step 3: Corrected Transcript** | Apply corrections + reformat | Apply corrections + reformat (same process, less work)   |
| **Steps 4–8** | No change | No change                                                |

The spell check step is still required. The script catches most campaign-specific terms but will miss new names, unusual pronunciations, and context-dependent corrections (e.g., a common word that sounds like a proper noun). Claude still performs the full cross-reference against source files.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| "File not found" | Wrap filename in quotes if it has spaces. Include the file extension. |
| "Access denied" | You ran the .js file directly instead of with `node`. Use `node transcribe.js` |
| "custom_spelling 'to' fields must contain only one word" | A `to` value in `WTFF_CUSTOM_SPELLING` has multiple words. Fix it to a single word or remove the rule and rely on keyterms instead. |
| API key error | Set `ASSEMBLYAI_API_KEY` environment variable or edit the `API_KEY` constant in the script |
| Old version running | Make sure you're running the copy in `wtff_vault\Workflows\scripts\wtff_transcribe\`, not an old copy elsewhere. Use the full path: `node "C:\Users\theli\Obsidian Vaults\wtff_vault\Workflows\scripts\wtff_transcribe\transcribe.js"` |
| Transcripts saving as .txt | Update script — output extension should be `.md` |
| Speaker labels wrong | Speaker diarization varies between runs. Always verify mapping during spell check. |
