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
Images:     24 to generate (24 points — the price depends on the image model)
Window:     Sep 1 → Sep 28

Proceed? yes

28 posts scheduled across 4 weeks · 3 pillars · 24 images

  2 revised to fit LinkedIn's cap
  1 left as a draft — "growth hack" is on your banned-word list and the
    post's point depends on it
  1 has no image yet — still being made; the post is scheduled without one
    for now, check again later

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
/plugin marketplace add PLGN-App/PLGN-CLAUDE
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

Seven commands, including `help`, work with no account, no sign-up and no keys.
Each free command except `help` ends with a two-line note pointing to
useplgn.com, shown once per session. If you don't like what `/plgn demo`
writes, stop here — nothing else will change your mind.

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
| A free command asks you to sign in | That's a bug — the free commands never need an account, and never read or write a workspace |

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
| `/plgn month <subject>` | A month of posts: written, illustrated, scheduled. Control the images with `--no-images` or `--max-images` |
| `/plgn post <idea>` | One post — the ten-times-a-day command |
| `/plgn repurpose <url>` | One article into many posts, plus saved snippets |
| `/plgn queue` | What's blocked, missing an image, too short, or ready — and fix it |
| `/plgn visuals <refs>` | Work out how the brand's pictures look, and save it so new images match |
| `/plgn images [filters]` | Fill in missing pictures, with the points cost stated first. Narrow with `--campaign`, `--platform`, `--status`, `--from`/`--to` |
| `/plgn topics` | Which topics repeat themselves, and which need more posts |
| `/plgn library [filters]` | Tidy duplicate snippets and overlapping hashtag sets. Narrow with `--kind`, `--platform` |
| `/plgn knowledge` | Check the brand profile for gaps, stale entries and conflicts |
| `/plgn assets` | Save the brand's real things — logo, character, people, places — so pictures are built around them, not invented |
| `/plgn brand` | List, create, rename, archive and restore brands |
| `/plgn undo` | Take back the last batch of posts — unschedule or delete |
| `/plgn refresh [filters]` | Rewrite and reschedule older posts that still hold up. Narrow with `--platform`, `--campaign`, `--topic` |
| `/plgn report` | What went out, how topics balanced, how the plan held |
| `/plgn why <post>` | Read back the thinking behind one picture — no writing |

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
`reference/_conventions.md` rule 6.

Nothing runs locally except Markdown. The plugin ships no scripts, stores no
state, and never handles a credential — OAuth belongs to plgn.

---

## Data, privacy and support

**What leaves your machine.** The seven free commands never read or write a
plgn workspace. Except `help`, they fetch the public pages you name (and, for
`competitors`, the competitor sites you approve) and print the result in your
terminal. If plgn is already connected, `audit` and `competitors` do that
reading through plgn's read-only research tools — sending plgn the addresses,
account names and searches they read, so it can also read public posts — and
without plgn they use Claude Code's own web fetch. The connected commands fetch the same kinds of pages, read your
workspace, and send what you approve saving — brand entries, offerings, topics,
post copy, snippets, image descriptions, schedule dates, and any reference
images you point `/plgn visuals` at, including local files — to
`https://useplgn.com/api/mcp`, the workspace they belong to. Image descriptions
are passed to plgn's image-generation provider to make the pictures. Web pages
the plugin fetches are treated as material to read, never as instructions.

**What the plugin does not do.** It ships no hooks, no scripts and no
executables — only Markdown and JSON. It registers exactly one MCP server, the
one listed in `.mcp.json`. It makes no analytics calls, sends no usage pings and
contains no telemetry of any kind. It reads local files only when you point a
command at them, such as reference images for `/plgn visuals`, and it never
handles a credential: authorization is OAuth in your
browser, and no key is ever pasted into the terminal.

**Account and cost.** The free commands need no account. The connected commands
need a plgn workspace, which is a paid subscription with a 14-day trial and no
card required. Image generation spends points from your workspace balance; every
command that would spend them states the cost and waits for your confirmation
first. Pricing is at [useplgn.com](https://useplgn.com).

**Organic posts only.** plgn writes, illustrates and schedules organic social
posts for a brand's own accounts. It does not buy, target or manage ads.

**Images.** plgn generates images as production assets for posts it is already
writing for your brand, against a visual direction saved in your workspace. It
is not a general-purpose image generator and has no interface for one.

**Privacy policy** — [useplgn.com/privacy](https://useplgn.com/privacy)
**Terms** — [useplgn.com/terms](https://useplgn.com/terms)
**Support** — [support@useplgn.com](mailto:support@useplgn.com), or open an
issue on [this repository](https://github.com/PLGN-App/PLGN-CLAUDE/issues).

---

## License

MIT — see [LICENSE](LICENSE).
