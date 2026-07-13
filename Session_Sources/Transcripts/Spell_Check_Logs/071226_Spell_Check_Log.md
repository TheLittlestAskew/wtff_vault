# Spell-Check Log — Where the Flowers Forget — Session 03 (071226)

- **Session:** 03
- **Play date:** 2026-07-12 (MMddyy 071226)
- **Raw source:** `Session_Sources/Transcripts/Raw_Unedited/03-071226_raw_transcript.md`
- **Corrected output:** `Session_Sources/Transcripts/Corrected/03 - 071226_corrected.md`
- **Approved table:** `_pipeline/S03/spellcheck.md` (reviewed & approved by Taylor — treated as final)
- **Method:** Word-boundary replacements only. No correction was made that is not in the approved table.

---

## Corrections Applied

Every row below is from the approved table. Applied with word-boundary matching so partial words were not corrupted (e.g. `\bZar\b`→`Zarna` did not touch `Zarna`; `\bave\b`→`Aiph` did not touch `have`/`gave`/`travel`).

| Heard (raw) variants | Applied Correction | Type | Notes |
|---|---|---|---|
| 8th · eighth · Aef · Aeve · AIF · Abe · Ave / ave | **Aiph** | NPC name (WtFF recruiter) | Adam's recap + narration voices Aiph throughout; per `_Campaign_Setup.md` normalization directive. Bare `a`/`the a` STT slips of the name were **not** mass-replaced (unsafe) — left verbatim, noted below. |
| Arthread Hall · Arthrit hall | **Hearthread Hall** | Location | Named as the interview site (`Notes from Adam` recap). Canon `04-World-Lore/Locations/Hearthread Hall.md`. |
| Roostation · rustication | **Rhusatatiam** | Location | Party's origin city; canon `Rhusatatiam.md`. |
| Salvador | **Salvia Forest** | Region | Eliza's origin; DM supplied "Salvia forest" in the same beat. Canon `Salvia Forest.md`. |
| Loot | **Lute** | WtFR PC (roster card) | Adam's recap only; WtFR-card rule makes it canonical. |
| Oren | **Orin** | NPC (Artie's crow familiar) | Adam's recap; canon `Orin.md`. |
| Brun · brew (as name) | **Bruin** | PC (Taylor) | STT slips of Isla "Bruin" Kaplan. |
| Zara · Zar · Zarnia | **Zarna** | PC (Rachel) | STT/diarization slips. |
| Beebo · Bibo · Beo · Debo · BBO · Bevo | **Bebo** | PC (Evan) | STT/diarization slips of BE-BO. |
| Arty | **Artie** | PC (Will) | Case-sensitive — lowercase "party" untouched. |
| Liza · Elijah | **Eliza** | PC (Lydia) | Case-sensitive — did not touch "Eliza". |
| verdant awesome · verdant bosom blossom · Blism | **Verdant Blossom** | Location (the green/lounge train) | First-seen (≤60%). DM art file `06-Media/Verdant_Blossom_Interior.png` spells it "Verdant Blossom." Clean lowercase "verdant blossom" spoken at first mention left as-is (not an approved-table original). |

---

## NOT Corrected (left verbatim, per approved table & no-silent-fix rule)

- **Sunroot / Sunroute / sunroof Crossing — CONTESTED, deliberately NOT resolved.** The approved table marks this "⚠ contested — Do NOT silently resolve." DM says "Sunroot Crossing" aloud [raw 74, 676] and DM art files are `Sunroot_Crossing.png`; the existing lore page is `Sunroute Crossing.md` (itself ≤60%); the in-world station sign STT'd as "sunroof crossing" [raw 988]. **All spellings left exactly as transcribed.** Flagged for Adam's decision (see session-note Continuity Flags and `_pipeline/S03/flags.md`).
- **"vent"** — Delilah: "the first of vent was yesterday… heading towards festival time" [raw 1326]. Likely an in-world Petal-Cycle month name; unconfirmed on `The Calendar.md`; not phonetically resolvable. Left verbatim, flagged.
- **Constance / Derek / Delilah** — first-seen NPC names; STT renders them cleanly and consistently (Constance & Derek match DM art filenames). No correction needed; flagged as first-seen.
- **"X Marks the Spot" Inn** — first-seen inn at Sunroot Crossing; trailing STT "in" is the word "Inn." No forced correction.
- **"the bloom" / "the Burn"** — canon regions; only capitalization drifts in STT. Cosmetic; left as spoken.
- **Bare "a" STT slips of "Aiph"** — several DM-narration instances where Aiph is rendered as a bare "a" (e.g. "a curated the dungeon"). Mass-replacing "a" would corrupt the text, so these were left verbatim and are flagged. Multi-character variants were corrected as above.

---

## Formatting / Diarization decisions

- **Speaker map** (from approved table): A = Adam (DM + ALL NPC voices), B = Will (Artie), C = Rachel (Zarna), D = Seth (Tobias), E = Evan (Bebo), F = Lydia (Eliza), G = Taylor (Bruin).
- Speaker letters were relabeled to **`FIRSTNAME (Character)`** (first names only, per public-repo PII rule). Because in-character and out-of-character speech interleave line-by-line and SPEAKER A carries all DM narration plus every NPC voice, a per-line IC/OOC and per-NPC split was **not** applied; a header note documents this and points to `_pipeline/S03/flags.md` for the OOC/above-table ranges. (Deviation from the ideal script format is logged here for transparency; accuracy over polish.)
- Timestamps preserved. Blank line between entries preserved.
- **Spelling Checked:** Yes.
