# Leftovers sweep, plugin (plgn-claude), 2026-10-07

Owner ruling, 2026-10-07: "go on all the leftovers so we finish all updates". Every open reviewer note on the
plugin is closed in one sweep: fixed, or ticked with one line that says why no text changes. Nothing here
changes a decision the owner took earlier. The result ships as 1.15.1 (version bump is the last task).

## The lists this sweep closes

Every `- [ ]` item in these files, in this order. Read each item in its file; the item is the spec. The
`_dev/` folder is git-ignored: the follow-up files there are edited on disk and are not committed; the plugin
files they name are.

1. `_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md`: s1, c1, s2, a5, c2.
2. `_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md`: a10-a19. (a1-a9 are desk items for
   phase 3; leave them open.)
3. From the server repo `plgn/docs/notes/2026-10-07-product-sheets-follow-ups.md` (read-only here): PS9-PS15 are
   plugin files. Fix them here and record each in `CHANGELOG.md` under 1.15.1 or in a new file
   `_dev/superpowers-docs/specs/2026-10-07-product-sheets-plugin-closed.md` (one line each) so the server sweep
   can tick them.
4. From the desk repo `plgn-desk/docs/notes/2026-10-01-crew-follow-ups.md`, section "For the plugin, added
   2026-10-07 (desk-links plan)" (read-only here): PS1, PS2, PS3 on `commands/product-sheet.md`. Record them in
   the same closed file.
5. Last task: `CHANGELOG.md` entry for 1.15.1 (wording fixes, no new tool), version bump in every place the
   repo keeps it (`.claude-plugin/plugin.json`, `marketplace.json` if present, README badge if any), and
   `node _dev/scripts/validate.mjs` green.

## Rulings for the items that had a choice (decided 2026-10-07, not to be reopened)

- a13 (c-d), a18, a6: prompt length against the 1,000-character model cap is phase 3 (the desk's picture job will
  cut and reconcile); in this sweep only add the line the item asks for in the designer file: a one-frame prompt
  is written to fit 1,000 characters when the model named in the quote has that cap, physical truth never cut.
  Tick a18's "add a10 to follow-ups" by reference.
- PS10: the phase-1 line caps are retired; record the new caps (designer 261, art director 260, images.md 312) in
  the agency-roles follow-ups file and in validate.mjs if it checks them. Do not reflow to meet the old caps.
- PS11: a neutral quote example ("<model>, <n> points each, 2 at most") and a sentence for a balance that covers
  only one picture (make the front first; the use grid waits).
- PS12: pass `variant` only when the offering has variants, `use_map` only for a use sheet; say that a new run
  retires an older draft of the same variant and kind, including one waiting for approval, and ask before that.
- PS3 (desk file): the grid's address comes from `check_generation` in Claude Code; in the desk it will come from
  the desk's sheet job (phase 3); write the sentence so both clients share one text.
- a12 (d): restore the one sentence that the director does not choose what physically carries the frame.
- a15 and a12 (a): show all six candidates in the example (the plan asked for a complete valid answer).
- a19: the command starts the art director's prompt with "Job B: write the order for this post."; brandkit's
  "in two jobs" becomes "in two passes of Job A".

## Rules for every builder

- Field names that code parses never change (brief_create candidates/frames; the desk's crew-answers.ts,
  handoffs.ts parseChecks, picture-job.ts; the desk overlays under resources/desk/agents). Wording only.
- Checks: `node _dev/scripts/validate.mjs`; `npm test` if the repo has one. Every command keeps its frontmatter.
- "points" never "credits"; lowercase "plgn"; Western digits; no model names with fixed prices in examples.
- Each item is ticked in its own file: `- [x] <id>. ... Fixed: <one line>` or `Noted: <one line>`; the commit
  message names the ids it closes. Lines wrap at the file's own width.
