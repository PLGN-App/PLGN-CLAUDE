---
name: gate-recovery
description: Use when any plgn MCP tool returns a string starting with "ERROR:" — especially post_create, post_update, or post_schedule failing the server validation gate on character caps or banned words. Defines revise-and-retry behaviour so commands recover instead of reporting failure.
---

# Recovering from the validation gate

plgn enforces per-platform character caps and the brand's banned-word list
**server-side**. A post cannot become scheduled or published while a check
fails. This is a guarantee, not an obstacle: it means drafts can be bold,
because bad ones cannot escape.

Never reimplement these checks. Never describe them to the user as the
plugin's protection — they are the server's.

## Procedure

1. **Read the error.** Tool handlers return a plain `ERROR: <reason>` string,
   never a stack trace. The reason names the failing check.
2. **Revise the draft for that reason only.**
   - Over the character cap → tighten the copy. Cut qualifiers and repeated
     ideas first. Never truncate mid-sentence or drop the call to action.
   - Banned word → replace the word, preserving the sentence's intent. If the
     whole idea depends on the banned word, change the idea.
3. **Retry once.**
4. **On a second failure, stop retrying.** Leave the post as a draft, and
   record it for the run's report as needing a human.

## Reporting

Report gate activity as a fact, not a fault:

> 2 posts were revised to fit LinkedIn's cap. 1 post is left as a draft —
> "growth hack" is on your banned-word list and the post's point depends on it.

Never surface a raw `ERROR:` string to the user, and never report the whole
run as failed because individual posts needed revision.

## Why one retry, not three

A cap failure is arithmetic: one honest tightening pass fixes it or reveals
the post is carrying two ideas and should be two posts. A banned-word failure
is editorial: if the first substitution does not work, the post's premise
conflicts with the brand's stated position, and that is a decision for a
person, not a retry loop.

Repeated retries also burn tokens re-deriving the same draft and, worse, tend
to degrade copy — each pass strips more voice to satisfy a constraint. Two
attempts and an honest hand-off beats five attempts and a bland post.

## What never counts as recovery

- **Truncating to fit.** A post cut mid-sentence passes the cap and fails the
  reader. Rewrite shorter instead.
- **Dropping the call to action.** It is the most cuttable-looking line and
  the reason the post exists.
- **Deleting the post.** A draft the gate rejected still holds a usable idea.
  Leave it as a draft; never call `post_delete` to clear a failure.
- **Scheduling anyway.** The server will refuse, and attempting it produces a
  second error the user then has to interpret.

## Errors that are not gate failures

Not every `ERROR:` comes from `runGate`. Handle these differently — revising
copy will not fix any of them:

- **Permission** (`minRole`) → the user's role cannot perform this action.
  Report it plainly and stop; do not retry.
- **Not found** → an id from earlier in the run is stale. Re-read with
  `post_get` or `topic_list` rather than guessing a new id.
- **Missing integration** → image generation needs a configured key. Report
  what is missing, continue with the rest of the run, and leave image slots
  empty rather than aborting.
