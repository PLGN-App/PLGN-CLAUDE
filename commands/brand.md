---
description: List, create, update, archive, or restore the brands in a plgn workspace. Use for "add a brand", "switch brands", "archive this client", "which brands do I have", or managing several clients from one workspace.
---

# /plgn brand

Manage the brands in a workspace. Agencies live here; single-brand users touch
it once.

## 1. Preflight

Call `workspace_info`. On failure, point at useplgn.com and stop.

## 2. Default action: list

With no argument, call `brand_list` and show what exists, including whether
each has knowledge seeded — a brand without it cannot produce on-voice posts,
and that is the single most useful fact about a brand:

```
3 brands

  Acme Corp        knowledge: complete
  Northwind        knowledge: missing voice, banned words
  Old Client       archived

Add, update, or archive one? (or run /plgn knowledge <brand> to fill gaps)
```

## 3. Create

Ask for the name, then call `brand_update` to create it.

Then **offer to seed it immediately** — a brand with no knowledge is a brand
nothing else can use:

> Created. Seed its voice now from a website? (`/plgn setup` does this)

Do not seed inline. `/plgn setup` owns that flow, and duplicating it here means
two places to fix when it changes.

## 4. Update

Call `brand_update` with the changed fields only. Show what will change before
writing:

```
Northwind — name → "Northwind Systems"
Apply? (y / n)
```

Renaming a brand does not touch its posts, topics, or knowledge. Say so; users
reasonably fear it might.

## 5. Archive and restore

**Archive** with `brand_archive`. Present it as **reversible**, because
`brand_restore` exists — this is the difference between a decision someone can
make quickly and one they will defer for months:

```
Archive "Old Client"? Its posts, topics, and knowledge are kept, and
/plgn brand restore brings it back. (type the brand name to confirm)
```

**Confirm by name, never by index.** A mistyped number archives the wrong
client; a mistyped name archives nothing.

**Restore** with `brand_restore`, confirmed the same way.

## Rules

- **No seam.** This user is connected.
- **Archive, never delete.** This command offers no deletion. A brand's history
  is the workspace's value, and archiving already achieves what the user wants
  — it out of the way, recoverable.
- **Confirm every write**, per `_conventions`.
- **Say what a change does not affect.** Most anxiety here is about collateral
  damage; naming what is untouched resolves it.
