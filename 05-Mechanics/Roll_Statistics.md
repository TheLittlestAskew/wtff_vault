# Roll Statistics — Where the Flowers Forget

> Roll trends and stats across sessions, from the D&D Beyond roll archive (Supabase view `wtff_session_rolls`, project `Rectrix_Caedere`).

**Status:** live. 52 digital rolls archived through S07 (pulled 2026-10-11). Only rolls made on D&D Beyond's dice roller are counted; physical dice never reach the archive, so these numbers cover a small part of the table. Each session note's **DDB Roll Archive** table has the roll-by-roll detail.

## Per-Character Totals
Avg d20 uses the die kept (the higher die on advantage), before modifiers.

| Character | Total Rolls | Avg d20 | Nat 20s | Nat 1s |
|---|---|---|---|---|
| [[Isla 'Bruin' Kaplan\|Bruin]] | 43 | 10.3 (32 d20s) | 2 | 1 |
| [[Artie (Art) Veyr\|Artie]] | 4 | 3.8 (4 d20s) | 0 | 0 |
| [[Eliza Duskbloom\|Eliza]] | 4 | — (0 d20s) | 0 | 0 |
| [[BE-BO (Botanical Energy Balance Operator)\|Bebo]] | 1 | 6.0 (1 d20) | 0 | 0 |

## Per-Session Roll Counts
| Session | Date | DDB Rolls | Who rolled on DDB |
|---|---|---|---|
| S01 | 2026-06-14 | 3 | Bruin |
| S02 | 2026-06-28 | 7 | Artie, Bruin, Eliza |
| S03 | 2026-07-12 | 5 | Bruin, Eliza |
| S04 | 2026-07-26 | 20 | Bruin, Bebo, Eliza |
| S05 | 2026-08-09 | 14 | Bruin |
| S07 | 2026-09-20 | 3 | Bruin |
| S08 | 2026-10-18 | ⚠️ not queried | Pending: the DDB archive was not read for S08 (Supabase permission denied in Convo 1; this run was told not to query). Per-character totals above exclude S08. |

S00 (OOC) and S06 (no recording) have no archived rolls. **S08:** 17 transcript roll events (13 with values) are in the session note's Full Roll Log; digital rolling is evident (Rachel's die "said it was a 2," Taylor "moved it to my other screen"), so archived rows probably exist. Fill this row and the totals once `SELECT * FROM wtff_session_rolls WHERE session_date = '2026-10-18' ORDER BY timestamp_iso;` is run.
