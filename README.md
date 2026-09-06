# plgn for Claude Code

**Marketing content that ships.** Draft a month of on-brand posts from your
terminal — then persist, validate, illustrate, and schedule them into a real
workspace.

---

## The flagship

```
> /plgn month "Q3 launch"

Pillars:    Migration horror stories · Pricing without traps · Founder notes
Platforms:  LinkedIn, X, Instagram
Cadence:    7/week — 28 posts total
Images:     24 to generate (24 credits)
Window:     Sep 1 → Sep 28

Proceed? yes

28 posts scheduled across 4 weeks · 3 pillars · 24 images

  2 revised to fit LinkedIn's cap
  1 left as a draft — "growth hack" is on your banned-word list and the
    post's point depends on it
  1 has no image — generation timed out; the post is scheduled without one

Review at useplgn.com
```

Three pillars drafted in parallel, every post checked against your banned-word
list **server-side**, images generated, the month scheduled. One confirmation.

---

## Try it with no account

`/plgn demo` needs no signup, no key, and no workspace. Point it at any URL:

```
> /plgn demo https://yoursite.com

Voice inferred from your homepage and about page.

Three pillars: Migration horror stories · Pricing without traps · Founder notes

── LinkedIn ─────────────────────────────
[pillar: Migration horror stories]
Most teams lose the first week of every quarter.

Not to holidays. To deciding what to do.
...
```

Seven full posts, ready to publish. Not summaries, not titles — copy you can
paste.

---

## Install

```
/plugin marketplace add Ahmed-Hashim/plgn-claude
/plugin install plgn
```

Then connect:

```
/plgn setup
```

You'll be prompted to authorize via plgn. No keys to paste, no config to edit —
the plugin ships the connection.

---

## Commands

### Free — no account needed

| Command | What you get |
|---|---|
| `/plgn help` | Every command in one list — no account needed |
| `/plgn demo <url>` | 7 ready-to-post drafts from any website |
| `/plgn audit <url>` | A 0–100 score across six weighted areas, plus three fixes |
| `/plgn strategy <url>` | Positioning and 3–5 content topics, with the evidence for each |
| `/plgn voice <url>` | Tone, words, rhythm, banned words, before/after rewrites |
| `/plgn competitors <url>` | What rivals all say — and the gaps none of them cover |
| `/plgn calendar <subject>` | A 30-day plan: date, platform, topic, hook, brief |

### Connected — writes to your workspace

| Command | What it does |
|---|---|
| `/plgn setup` | Connect, pick a brand, learn its voice from your site |
| `/plgn month <subject>` | A month of posts: written, illustrated, scheduled |
| `/plgn post <idea>` | One post — the ten-times-a-day command |
| `/plgn repurpose <url>` | One article into many posts, plus saved snippets |
| `/plgn queue` | What's blocked, missing an image, too short, or ready — and fix it |
| `/plgn images` | Fill in missing pictures, with the credit cost stated first |
| `/plgn topics` | Which topics repeat themselves, and which need more posts |
| `/plgn library` | Tidy duplicate snippets and overlapping hashtag sets |
| `/plgn knowledge` | Check the brand profile for gaps, stale entries and conflicts |
| `/plgn brand` | List, create, rename, archive and restore brands |
| `/plgn refresh` | Rewrite and reschedule older posts that still hold up |
| `/plgn report` | What went out, how topics balanced, how the plan held |

---

## What plgn adds

The free layer drafts. That's genuinely useful, and it's also where a terminal
stops being enough:

| | Free | Connected |
|---|---|---|
| Drafting posts in your voice | ✅ | ✅ |
| Saved anywhere | ❌ text in your terminal | ✅ real workspace |
| Checked against your banned words | ❌ | ✅ enforced server-side |
| Images generated | ❌ | ✅ |
| Scheduled | ❌ | ✅ |
| Reviewable by your team | ❌ | ✅ dashboard |

The checks are worth calling out: character limits and banned words are enforced
**on the server**, not by the agent. A post cannot be scheduled while
a check fails — regardless of what the model does. Drafts can be bold, because
bad ones can't escape.

---

## How it works

```
commands/   entry points     — one job each, own the confirmation gate
   ↓
agents/     parallel workers — fresh context each, return findings only
   ↓
skills/     shared know-how  — imported by many commands, one source of truth
   ↓
MCP tools   the server       — validation, persistence, tenant scoping
```

`/plgn month` starts one copywriter per topic so a month is written in parallel
rather than one post at a time. Platform limits, brand voice, error recovery and
**how plgn talks to you** each live in exactly one skill file, so commands can't
drift apart as the plugin grows.

Because agents run in their own context and cannot read those skill files,
commands pass the rules an agent needs directly in its prompt — see
`commands/_conventions.md` rule 6.

Nothing runs locally except Markdown. The plugin ships no scripts, stores no
state, and never handles a credential — OAuth belongs to plgn.

---

## License

MIT — see [LICENSE](LICENSE).
