Onboard Where the Flowers Forget onto the rectrixcaedere site, modeled on the existing pacts-and-power/session.html + archive.html. Create where-the-flowers-forget/session.html and where-the-flowers-forget/archive.html.
Data wiring: vault = wtff_vault (raw base https://raw.githubusercontent.com/TheLittlestAskew/wtff_vault/main); Supabase roll-view = wtff_session_rolls (already exists; same anon key/URL as PP).
Build the ARC manifest from the notes in wtff_vault/01-Sessions/ (Session NN — Title.md): read each note's frontmatter for session, date, and title; use the exact filename for the fetch path. WTFF is ongoing, so no finale flag.
Adapt for WTFF's leaner template (it differs from PP's):

POV hero band is titled "Things We Learned In The Dark", POV character is Isla. Match the ## Character POV Journal — Isla 'Bruin' Kaplan heading (PP looks for "POV Overview") and strip the "See full journal entry in .docx…" boilerplate, showing the summary.
Auto-hide any card whose section is empty — WTFF notes have no Quote Board, Profanity, Themes, Scene/Timeline, Patterns, or Continuity, so those cards should not render at all (rather than showing "—").
NPC table is 4 columns — pick the status cell by matching the "Status" header instead of a fixed column index.
For archive.html, drop PP's "Early Campaign / Lost Sessions" era and the 72/16/~35 stat bar (those are PP lore); WTFF's archive is just its session timeline + a simple stat bar (session count + date range).

Then commit/push, and confirm the page loads for ?n=01 and the newest session.
