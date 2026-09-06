---
description: Connect Claude Code to a plgn workspace and prepare a brand — verifies the MCP connection, picks or creates a brand, and seeds its voice, audience, offers, and banned words from your website. Run this once before /plgn month. Use for "connect plgn", "set up my workspace", or first-time onboarding.
---

# /plgn setup

Get from installed to ready. Run once per brand.

Everything after this command assumes it has run, so it is worth doing
properly — a brand with no stored voice makes every later command guess.

## 1. Preflight

Call `workspace_info`.

**If it fails**, the user is not connected. Say exactly what to do, then stop:

> Not connected yet. Create a workspace at **useplgn.com**, then run this
> command again — you'll be prompted to authorize.

Do not retry in a loop. Do not offer to draft something locally instead; a user
who ran `setup` wants a connection, not a consolation prize.

**If it succeeds**, continue without printing the raw response.

## 2. Report state

One short block, no tool dump:

```
Workspace: <name> · Plan: <plan> · Image credits: <n>
```

If the plan is free-tier, say what that limits in one line. State it as a fact,
not a pitch — they are already a customer.

## 3. Brand

Call `brand_list`.

- **Brands exist** → list them and ask which to configure. If exactly one
  exists, name it and confirm rather than assuming.
- **None exist** → ask for a brand name, then create it with `brand_update`.

One brand per run. If they want three set up, run the command three times —
seeding four knowledge categories per brand is not something to batch silently.

## 4. Seed knowledge

This is the step that makes every later command work, so do not rush it.

**Ask for the brand's website.** If they have none, ask them to describe the
business in a few sentences and work from that — say plainly that a description
produces a thinner voice profile than a site does.

**Delegate to `plgn-researcher`.** Use its findings to draft four entries:

| Category | Drawn from |
|---|---|
| voice | `voiceMarkers` — tone, vocabulary, rhythm, what they never do |
| audience | `audience` — who they address and what those people already know |
| offers | `offers` — what is sold, named the way the brand names it |
| banned words | proposed from the site's register, then confirmed |

**Show all four and confirm before writing.** Print the drafted entries in
full. This is the brand's identity as the system will understand it — the user
must see it, and it is far cheaper to fix now than after thirty posts inherit
it.

**Then write one `knowledge_add` call per category.** Four calls, not one
combined entry, so later edits with `knowledge_update` are surgical rather than
a full rewrite.

Banned words deserve a direct question — most people have not thought about it:

> Any words this brand refuses to use? Competitor names, industry clichés,
> claims you can't back. I've proposed: <list>.

## 5. Integrations

Report status plainly, with the capability cost:

- `cloudinary_connect` — without it, generated images have nowhere to live.
- `kie_key_set` — without it (or platform credits), image generation is
  unavailable and posts ship text-only.

**Never ask them to type a key into the terminal.** Direct them to configure it
in the dashboard. Missing integrations are not a blocker for this command —
report and continue.

## 6. Finish

```
Ready. Run /plgn month <topic>.
```

If integrations are missing, add one line naming what will be skipped until
they are configured.

## Notes

- **No seam.** This user is connected. Selling to them here is noise.
- **Confirm before writing**, per `_conventions` — both the brand and the four
  knowledge entries.
- **Idempotent.** If run again on a configured brand, report what already
  exists and offer to update rather than duplicating entries. Setup should
  never silently double a brand's knowledge.
