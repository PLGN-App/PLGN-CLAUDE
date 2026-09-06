---
name: gate-recovery
description: Use when any plgn tool returns a result starting with "ERROR:" — especially post_create, post_update or post_schedule failing plgn's checks on length or banned words. Defines the fix-and-retry behaviour so commands recover instead of reporting failure.
---

# Recovering when a check blocks a post

plgn checks character limits and the brand's banned words **on the server**. A
post cannot be scheduled or published while a check fails. This is a guarantee,
not an obstacle: it means drafts can be bold, because bad ones cannot get out.

Never rebuild these checks yourself. Never describe them to the user as the
plugin's protection — they are the server's.

## What to do

1. **Read the reason.** Tools return a plain `ERROR: <reason>` string, never a
   stack trace. The reason names what failed.
2. **Fix that reason only.**
   - Too long → tighten the writing. Cut qualifiers and repeated points first.
     Never cut off mid-sentence, and never drop the call to action.
   - Banned word → replace the word, keeping the sentence's meaning. If the whole
     point depends on that word, the point has to change.
3. **Try once more.**
4. **If it fails again, stop.** Leave the post as a draft and note it for the
   report as needing a person.

## Telling the user

Describe it as a fact, not a fault, and follow the **reply-style** skill — a
normal sentence in their language, never the raw error:

> 2 posts were shortened to fit LinkedIn. 1 is still a draft — it uses "growth
> hack", a word you banned, and the post's point depends on it.

Never show a raw `ERROR:` string, and never call the whole run a failure because
a few posts needed changing.

## Why one retry, not three

Being too long is arithmetic: one honest tightening pass fixes it, or shows the
post is carrying two ideas and should be two posts.

A banned word is editorial: if the first replacement does not work, the post's
premise disagrees with what the brand stands for, and that is a decision for a
person, not a loop.

Repeated tries also burn effort rebuilding the same draft and, worse, tend to
make the writing worse — each pass strips out more voice to satisfy a rule. Two
attempts and an honest hand-off beats five attempts and a flat post.

## What does not count as recovering

- **Cutting it off to fit.** A post cut mid-sentence passes the check and fails
  the reader. Rewrite it shorter instead.
- **Dropping the call to action.** It looks like the easiest line to cut and it
  is the reason the post exists.
- **Deleting the post.** A blocked draft still holds a usable idea. Leave it as
  a draft; never call `post_delete` to clear a problem.
- **Trying to schedule it anyway.** The server will refuse, and you get a second
  error the user then has to interpret.

## Errors that are not about the checks

Not every `ERROR:` comes from the content checks. These need different handling —
rewriting the copy will not fix any of them:

- **Not allowed** → the user's role cannot do this. Say so plainly and stop; do
  not retry.
- **Not found** → an id from earlier in the run is stale. Read it back with
  `post_get` or `topic_list` rather than guessing a new one.
- **Something isn't connected** → making images needs a key. Say what is
  missing, carry on with the rest of the run, and leave the picture out rather
  than stopping.
