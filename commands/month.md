---
description: Fill a plgn workspace with a month of on-brand content — picks topics, writes posts in parallel, makes images, and schedules everything after your approval. Reuses topics you already have instead of creating duplicates. Supports --dry-run. Use for "a month of content", "fill my calendar", or "plan next month".
---

# /plgn month

Take a subject and leave the workspace with a month of scheduled, illustrated,
on-brand posts.

This command writes real data to a real account. Everything below is built
around that: plan first, ask once, write carefully, report honestly.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

Then call `brand_list` and `knowledge_get`.

`brand_list` carries two things this command must not guess: the brand's
**banned words** and the **languages it publishes in**. Read both before
writing anything. The languages are the brand's, not the user's — someone
writing to plgn in English may publish only in Arabic.

**If the brand has no saved voice, stop and send them to `/plgn setup`.** Do
not work a voice out from a website here. Guessing is the free layer's
compromise; a connected user has a real profile one call away, and thirty posts
in a guessed voice is thirty posts to redo.

## 2. Look at what's already there

**Call `topic_list` before deciding anything.** A workspace usually already
holds topics — campaigns, launches, themes — and this command must build on
them rather than making a second copy.

- **The subject matches an existing topic** → call `topic_get` on it. You now
  have its description and every post already in it. Plan around that: fill the
  gaps, do not repeat what is there. Say which topic you are adding to.
- **No argument was given** → show the list and ask which one:

  ```
  Which topic should I plan for?

    1  Ramadan 2026        12 posts (4 scheduled)
    2  Migration stories    8 posts (8 published)
    3  Something new

  yes / pick / no
  ```

- **Nothing matches** → say so, and say you will make a new topic.

**Never call `topic_create` for a name that already exists.** Running this
command twice must not leave two topics with the same name.

Note: `topic_list` returns names and counts, not descriptions. Use `topic_get`
on the one you are going to use.

## 3. Show the plan, and stop

Work out the shape of the month, then show it as a short table:

```
Topics:     <name> · <name> · <name>
Platforms:  LinkedIn, X, Instagram
Posting:    <n>/week — <n> posts total
Images:     <n> to make (<n> credits)
Dates:      <start> → <end>
```

Where the topics are new, get them from `plgn-strategist` using the subject and
the brand's saved knowledge. Where you are adding to a topic that already
exists, say so.

**Wait for a clear yes. Nothing is written before this point.**

```
Create these <n> posts?
yes / pick / no
```

`--dry-run` ends here: print the plan, write nothing, and say so.

State the image cost in the plan, not afterwards. It spends real credits, and
it is the part a user is most likely to want reduced.

**`--yes` is not accepted by this command.** It spends credits and writes in
bulk.

## 4. Write, all at once

Start one `plgn-copywriter` per topic, **at the same time**.

Per **_conventions** rule 6, each writer's prompt must carry what it needs:
the topic and its argument, the brand's voice and banned words, the platforms,
the character limits for those platforms, the **languages the brand publishes
in**, and how many posts to write. Agents cannot read skills or see this file.

A brand with two languages gets each post written in both, saved as captions
keyed by language — not one caption with a translation underneath.

If a writer returns fewer posts than asked because the topic was thin, take the
shortfall. Do not ask again — a thin topic is information about the plan, and it
belongs in the final report.

## 5. Save

Call `topic_create` **only for topics that do not already exist**. Then call
`post_create` per post, as drafts.

**Stamp every post in this run with the same run marker**, per the
**brand-knowledge-map** skill. It costs nothing, the reader never sees it, and
it is the only thing that makes `/plgn undo` able to take this run back. A
month saved without it can only be undone by hand, thirty posts at a time.

**Record the ids the tools return.** Never assume the order matches your draft
order, and never guess an id — read it from the response. If a later step needs
a post you cannot identify, read it back with `post_get` or `post_list`.

Nothing is scheduled until step 8.

## 6. Handle anything that fails

On any `ERROR:`, follow the **gate-recovery** skill. Describe the outcome using
**reply-style** rule 6 — a normal sentence, never the raw error.

**Never stop the whole run for one post.** Twenty-nine good posts and one honest
hand-off is a successful run. Track anything left as a draft for the report.

## 7. Images

For each post that should have one, get the description from `plgn-visual`,
then call `generate_image`.

**Making an image takes time.** `generate_image` returns a job number, not an
image. Check with `check_generation` on the schedule in the **image-prompting**
skill.

If it takes too long, leave the image out, note the post for the report, and
**carry on** — a missing image never blocks scheduling. A post that goes out
text-only is fine; a month that stalls waiting on a picture is not.

If `plgn-visual` says the post is stronger without an image, accept that and
spend no credit.

## 8. Schedule

Call `post_schedule` across the agreed dates, following the **posting-cadence**
skill for spacing and platform mix.

Do not put one topic all in the same week. If there are fewer good posts than
slots, schedule fewer — cutting beats padding, and the plan already told the
user how many to expect.

## 9. Report

Counts first, then the exceptions by name, then the link.

```
28 posts scheduled across 4 weeks · 3 topics · 24 images

  2 were shortened to fit LinkedIn
  1 is still a draft — it uses "growth hack", a word you banned, and the
    post's point depends on it
  1 has no image — that one took too long; the post goes out without it

Review at useplgn.com
```

Never print a raw `ERROR:`. Never call the run failed because a few posts
needed a person.

## If the run stops halfway

If a tool goes down, the user interrupts, or a limit is hit — **say exactly
what is in the workspace right now**: what was created, what was scheduled,
what is still a draft.

A user must never have to guess what was saved. That is the difference between
a run they can pick up from and one they have to clean up by hand.

## Notes

- **No seam.** This user is already signed up.
- **Ask once, not thirty times.** Confirm the plan in step 3, then run. Do not
  stop for each post — that is what the plan was for.
- Replies follow the **reply-style** skill, including the user's language.
