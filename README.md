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

## Getting started

You need [Claude Code](https://claude.com/claude-code) installed. Everything
else happens inside it.

### 1. Install the plugin

In Claude Code, run:

```
/plugin marketplace add Ahmed-Hashim/plgn-claude
/plugin install plgn
```

### 2. Restart Claude Code

**This step is required, and skipping it is the most common problem.** The
plugin ships its own connection to plgn's server, and that connection is only
picked up when Claude Code starts. Until you restart, `/plgn setup` will report
that it can't find a workspace no matter what you do.

Close Claude Code and open it again.

### 3. Try it with no account

```
/plgn help                        every command, in one list
/plgn demo https://yoursite.com   7 posts written from your own site
```

Six commands work with no account, no sign-up and no keys. If you don't like
what `/plgn demo` writes, stop here — nothing else will change your mind.

### 4. Create a workspace

Go to **[useplgn.com](https://useplgn.com)** and create one. This is where
posts, topics, images and your brand's voice are stored.

### 5. Connect and set up your brand

```
/plgn setup
```

The first time a command needs your workspace, your browser opens and asks you
to approve access. Approve it once and you're done.

**You will never be asked to paste a key, token or password into the terminal.**
If anything ever asks you to, something is wrong — that is not how this works.

`/plgn setup` then reads your website and writes four things about your brand:
how it sounds, who it talks to, what it sells, and words it refuses to use.
It shows you all four before saving anything. Everything written later is built
on these, so it's worth reading them properly.

Want the brand known properly — its look, its competitors, its topics and the
lines it already reuses? Run `/plgn brandkit <url>` after setup. It reads your
own posts as well as your site, and asks at most five questions, each one with
an answer already drafted.

Running something with a start and an end — Ramadan, a launch, a season? Make
it a campaign with `/plgn campaign`, then plan inside it with
`/plgn month "Ramadan"`. Every post in the campaign then says the same one
thing, differently, and stops saying it when the campaign ends.

### 6. Write your first month

```
/plgn month "your subject" --dry-run
```

`--dry-run` shows the plan — topics, how many posts, how many images and what
they cost — and writes nothing. When it looks right, run it again without the
flag.

---

## Keeping the plugin up to date

Installed plugins do not update themselves. To get the latest version:

```
claude plugin marketplace update plgn
claude plugin update plgn
```

Then **restart Claude Code again**. Both commands run in your normal terminal,
not inside Claude Code.

### If something isn't working

| What you see | What it means |
|---|---|
| `/plgn setup` says you're not connected, but you are | You haven't restarted Claude Code since installing or updating |
| A command mentions a domain that isn't `useplgn.com` | Your installed copy is old — update it, then restart |
| Your browser never opens to approve access | Restart, then run any connected command such as `/plgn queue` |
| A free command asks you to sign in | That's a bug — the six free commands never contact the server |

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
| `/plgn brandkit <url>` | Learn a brand in one run — voice, look, competitors, topics, reusable lines |
| `/plgn campaign` | Start a campaign — one thing you're saying for a while, with dates |
| `/plgn month <subject>` | A month of posts: written, illustrated, scheduled |
| `/plgn post <idea>` | One post — the ten-times-a-day command |
| `/plgn repurpose <url>` | One article into many posts, plus saved snippets |
| `/plgn queue` | What's blocked, missing an image, too short, or ready — and fix it |
| `/plgn visuals <refs>` | Work out how the brand's pictures look, and save it so new images match |
| `/plgn images` | Fill in missing pictures, with the credit cost stated first |
| `/plgn topics` | Which topics repeat themselves, and which need more posts |
| `/plgn library` | Tidy duplicate snippets and overlapping hashtag sets |
| `/plgn knowledge` | Check the brand profile for gaps, stale entries and conflicts |
| `/plgn brand` | List, create, rename, archive and restore brands |
| `/plgn undo` | Take back the last batch of posts — unschedule or delete |
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
