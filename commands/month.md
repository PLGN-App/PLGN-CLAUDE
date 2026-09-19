---
description: Fill a plgn workspace with a month of on-brand content — picks topics, writes posts in parallel, makes images, and schedules everything after your approval. Reuses topics you already have instead of creating duplicates. Supports --dry-run, --no-images and --max-images. Use for "a month of content", "fill my calendar", or "plan next month".
---

# /plgn month

Take a subject and leave the workspace with a month of scheduled, illustrated,
on-brand posts.

This command writes real data to a real account. Everything below is built
around that: plan first, ask once, write carefully, report honestly.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

Then call `context_get(role: "marketing_manager")`.

That is one read and it returns the brand in a fixed order: the record — with
the **languages** and the **timezone** this command must not guess — then the
voice and audience, then what the brand sells, then any campaign running now.

The languages are the brand's, not the user's. Someone writing to plgn in
English may publish only in Arabic.

**If the brand has no Foundation, stop and send them to `/plgn setup`.** Do
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

**Call `campaign_list` too.** A subject that matches a campaign is planned
*inside* it, which changes three things:

- every post carries `campaign_id`
- every post inherits the campaign's offerings
- every writer is given the campaign's key message, the words it must not
  use, and the words to reach for

Say which campaign you are planning inside, in the plan, before anything is
written. A month planned inside the wrong campaign inherits the wrong
constraints thirty times.

If the subject matches no campaign, that is ordinary. Plan without one and
say so — do not offer to create one here. `/plgn campaign` does that, and
creating a container as a side effect of filling it is how a workspace ends
up with four half-empty campaigns.

## 3. Show the plan, and stop

Work out the shape of the month, then show it as a short table:

```
Topics:     <name> · <name> · <name>
Campaign:   <name, or "none">
Platforms:  LinkedIn, X, Instagram
Languages:  <the brand's, from its record>
Posting:    <n>/week — <n> posts total
Images:     <n> to make — <n> credits, leaving <n>
Dates:      <start> → <end>, <timezone>
```

Four of those lines exist to be corrected. Languages and timezone come from the
brand, not from the conversation, and both are invisible when wrong. The credit
line says what is left afterwards, because that is the number people decide on.

The `Images:` figure already reflects `--no-images` and `--max-images` — zero
with the first, no more than the number given with the second — and it is an
upper bound either way, because a picture reused from the workspace costs
nothing. Both controls are described in section 7; the number here is the one
being approved.

Where the topics are new, get them from `plgn-strategist` using the subject and
the brand's saved knowledge. Where you are adding to a topic that already
exists, say so.

**Wait for a clear yes. Nothing is written before this point.**

```
Create these <n> posts?
yes / pick / no
```

`--dry-run` ends here: print the plan, write nothing, and say so.

Stop on a flag you do not recognise, and say which one. A misread flag spends
credits on the wrong posts — `--no-image` is not `--no-images`, and reading it
as nothing at all is a full month of pictures the user asked you not to make.

State the image cost in the plan, not afterwards. It spends real credits, and
it is the part a user is most likely to want reduced.

**`--yes` is not accepted by this command.** It spends credits and writes in
bulk.

## 4. Write, all at once

Start one `plgn-copywriter` per topic, **at the same time**.

Print one line before this starts and one before the images, per
**reply-style** rule 5b — writing and illustrating are the two phases long
enough that silence reads as a crash:

```
Writing 28 posts across 3 topics...
```

Per **_conventions** rule 6, each writer's prompt carries what it needs, and
the way to build it is one call:

```
context_get(role: "copywriter", campaign_id: <the campaign, when there is one>)
```

That block holds the voice, the banned words, what the brand sells with each
benefit's meanings and clichés, and — when there is a campaign — its key
message, constraints and vocabulary. Pass it into the prompt verbatim,
alongside the topic, the platforms, their character limits, the brand's
languages, and how many posts to write.

Agents cannot read skills or see this file. Whatever is in the prompt is the
whole world the writer works in.

A brand with two languages gets each post written in both, saved as captions
keyed by language — not one caption with a translation underneath.

If a writer returns fewer posts than asked because the topic was thin, take the
shortfall. Do not ask again — a thin topic is information about the plan, and it
belongs in the final report.

### Check the batch before saving

When every writer has returned, start one `plgn-brand-guard` on the whole
batch — all topics together, because voice drift and repeated openings only
show across topics. Its prompt carries the drafts, the same `context_get` block
the writers got, and each platform's character limit.

For each draft it fails, send that draft back to the writer of its topic once,
with the guard's issues quoted. Take what comes back without checking it again.

A draft that still has an issue after that one rewrite is **held back**: it is
saved as a draft in step 5 but never scheduled in step 8, and the report names
it with the issue in plain words. A draft flagged for invented proof — a
number, name, result or quote the brand's material doesn't contain — is held
back unless the rewrite removed the claim entirely.

The guard advises; it does not approve. Never tell the user a post "passed
brand-guard". plgn's server still runs its own checks on every save.

## 5. Save

Call `topic_create` **only for topics that do not already exist**. Then call
`post_create` per post, as drafts.

`post_create` also takes `campaign_id` and `offering_ids`. Set the campaign
when the month is planned inside one, and set the offerings from each post's
own `offeringNames`, matched against the offerings you were given, never
invented. Carry `knowledge_used` on every `post_create` too, copied from the
end of the `context_get(role: "copywriter", …)` read that briefed the writer
who wrote this post — it is the only record of exactly what the writer was
told, and dropping it here is not a shortcut, it is the record going missing.

When the plan marked a topic's format as a carousel — a `postType` carrying
`plannedSlides` — pass that number as `planned_slides` on posts written to
that format. When you cannot tell which draft was written to that format, do
not guess: save the post with no `planned_slides` and name it among the
report's exceptions — a missing frame count is a visible gap someone can add
later; a carousel bound to the wrong post is invisible, and nothing
downstream ever catches it.

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

Say the phase is starting and how long it takes, per **reply-style** rule 5b:

```
Making 24 images — this takes a few minutes...
```

### How many pictures to make

`--dry-run` spends nothing at all. Between that and a full run there are two
controls, and they combine:

- `--no-images` — plan, write and schedule, and make no pictures. The posts
  are saved without media and `/plgn images` can fill them later, with a brief
  behind each one.
- `--max-images 8` — make at most this many, best candidates first, and say in
  the report which posts went out without one.

Say the number you are about to spend before spending it, not after.

### Look for a picture that already exists

Call `list_images(max: 50)` before generating anything. **Reuse costs nothing
and a new picture costs a credit**, so a usable match already in the workspace
is always the better answer.

Make this call **once for the run, not once per post**: `list_images` takes no
search word, so every post would get the same list anyway. Hold what comes
back and match each post against it. Pass `folder` only when the brand keeps
its pictures in a named subfolder — the read is already scoped to this brand,
so a brand name or id passed here matches nothing at all.

The default is twenty-five and fifty is the ceiling, so `max: 50` is as much
as this check can ever see — a genuine check, not a guarantee — see
**brand-knowledge-map**. When nothing matches, say so in one line and carry on
to generate.

Reuse a match only when it actually fits this post's subject. A picture that
is merely on-brand is not a picture of the right thing, and a wrong reuse
costs more than a credit — it costs the post.

For each post that should have one, read `context_get(role: "art_director",
campaign_id: <the post's campaign, if it has one>)` for the brand's look.

Per post, not once for the run: two posts in different campaigns want
different references, and a run that reads the direction once gives them the
same one. A campaign's references are held against that campaign, so a read
made without its `campaign_id` cannot see them at all. `/plgn images` reads
the look the same way, for this reason.

Then ask `plgn-visual` whether this post needs a picture at all, and why.
That is all it answers — it does not art-direct one. Its prompt carries the
post and the brand's voice, from the `context_get(role: "copywriter", …)`
read that briefed this post's writer in step 4, and nothing else: per
**_conventions** rule 6 the agent cannot see this file, and those two are
what it takes. The `art_director` block is not its to read.

When it says yes, **write the image description yourself** — it is not
written anywhere else on this path. One paragraph: the subject, the
composition, the light, the medium, the palette, and what must not appear.
Take it one step sideways from the post's point rather than restating its
words, put the `art_director` block's preamble in front of it, and carry
that block's `never` list as exclusions. Never ask for words, letters or
logos inside the picture.

This is the quick path, on purpose. A picture worth working the idea out
for first — every idea considered, the ones that lost kept with their
reasons, and a check against the brand's rules before a credit is spent —
is what `/plgn images` is for. Point at it in the report; do not rebuild it
here.

The reference path is brand-level, not per-agent: when the brand holds a
canonical reference, call `generate_image_from_image` with it. Otherwise
call `generate_image`. See **visual-identity** for why the two are
different.

**Making an image takes time.** `generate_image` and `generate_image_from_image`
both return a job number, not an image. Check with `check_generation` on the
schedule in the **image-prompting** skill.

If it takes too long, leave the image out, note the post for the report, and
**carry on** — a missing image never blocks scheduling. A post that goes out
text-only is fine; a month that stalls waiting on a picture is not.

**Every picture gets alt text.** Once one exists, send `plgn-visual` the
post, the same voice block, and a description of the picture that was just
made; that is its second job, and it returns the alt text for it. Save the
picture and its alt text onto the post with `post_update`. This is the
plugin's busiest image path, so an image saved here without alt text is most
of a month unreadable to anyone using a screen reader.

If `plgn-visual` says the post is stronger without an image, accept that and
spend no credit.

## 8. Schedule

Call `post_schedule` across the agreed dates, following the **posting-cadence**
skill for spacing and platform mix. Posts held back in step 4 stay drafts.

Do not put one topic all in the same week. If there are fewer good posts than
slots, schedule fewer — cutting beats padding, and the plan already told the
user how many to expect.

## 9. Report

Counts first, then the exceptions by name, then the link. Step 7 makes **one
picture per post**, carousel or not — so count pictures, never frames this
run did not make, and name every post whose carousel is unfinished: the ones
that got a cover and still need their other frames, and the ones saved with
no frame count at all because step 5 could not tell which draft they were.

```
28 posts scheduled across 4 weeks · 3 topics · 24 images — one per post

  1 was planned as a carousel and has its first picture only — run
    /plgn images and ask for a carousel to make the rest
  1 was planned as a carousel but I couldn't tell which draft it was, so it
    was saved with no frame count — worth setting by hand
  2 were shortened to fit LinkedIn
  1 is still a draft — it uses "growth hack", a word you banned, and the
    post's point depends on it
  1 is still a draft — it says "40% faster onboarding" and nothing in your
    brand profile backs that number
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
