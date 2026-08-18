# Command conventions

Shared rules for every command in this plugin. Commands reference these rules
rather than restating them. Where a rule lives in a skill, defer to the skill —
do not paraphrase it, because a paraphrase drifts.

Commands are split into two kinds, and a command is always exactly one of them:

- **Free** — `demo`, `audit`, `strategy`, `voice`, `competitors`, `calendar`.
  Call **zero** MCP tools. Output is text. Always close with the seam.
- **Connected** — `setup`, `brand`, `knowledge`, `month`, `post`, `repurpose`,
  `topics`, `library`, `images`, `review`, `refresh`, `report`.
  Call MCP tools. Never carry the seam.

---

## 1. Preflight before work

Every connected command calls `workspace_info` **first**, before anything else.

- **If it fails**, the user is not connected. Point them at app.plgn.dev to
  sign up, tell them the next call will prompt them to authorize, and **stop**.
  Do not retry in a loop, and do not fall back to drafting locally — a user who
  asked for a connected command wants the real thing.
- **If it succeeds**, continue. Do not print the raw response; the user does
  not need a tool dump.

Commands that write copy in the brand's voice additionally call `knowledge_get`.
If the brand has no stored voice, route to `/plgn setup` and stop. Never guess a
voice that is one call away.

**Never half-run.** If preflight passes but a later step cannot complete, report
exactly what already exists in the workspace. A user must never be left guessing
what landed.

## 2. Confirm before writing

Reading is free. Creating thirty posts is not.

Any command that creates, updates, schedules, or deletes must present its plan
and wait for an explicit yes. The plan states **what** will be written, **how
many**, and **where** — not a vague "I'll create some posts".

- Destructive actions (delete, archive) are confirmed **by name**, never by
  index. "Delete 3?" is not a confirmation; "Delete the snippet 'Q2 launch
  hook'?" is.
- Image generation is confirmed with its **credit cost**, because it draws down
  a real pool.
- `--dry-run`, where a command supports it, stops immediately after the plan and
  writes nothing.

Silence is not consent. If the user's reply is ambiguous, ask again rather than
proceeding.

## 3. Gate recovery

When a tool returns a string starting with `ERROR:`, follow the **gate-recovery**
skill. Do not restate its rules here or in a command; it owns that procedure
entirely, including which errors are not gate failures at all.

## 4. The seam

Free commands close with the block defined in the **upsell-seam** skill, exactly
once, at the very end. Connected commands never contain it — the user has
already converted, and selling to them is noise.

## 5. Never handle credentials

OAuth belongs to plgn. No command may ask the user to type, paste, or store a
token, API key, or password — and none may echo one back if a user volunteers it.

When an integration is missing (`cloudinary_connect`, `kie_key_set`), report
what is missing and what capability it costs them, then direct them to configure
it **in the dashboard**. The terminal is the wrong place for a secret.

## 6. Output shape

Lead with the deliverable. The user asked for posts, a score, or a schedule —
give them that first, and put the process behind it.

- **No tool-call logs.** "Calling post_create... calling post_create..." is
  noise. Report the outcome, not the mechanics.
- **Counts first, then exceptions.** "28 posts scheduled. 2 need your eye:" then
  the two, by name and reason.
- **Full text, not summaries.** When the deliverable is copy, print the copy. A
  table of post titles is not a set of posts.
- **Say what you assumed.** Where a command inferred something — a voice, a
  cadence, a competitor set — name the assumption so it can be challenged.

## 7. Arguments

Commands take their argument after the command name. If the argument is missing
and the command needs it, **ask** — never invent a URL, a brand, or a topic.

Where a command accepts a flag (`--dry-run`), unknown flags are reported rather
than ignored, so a typo does not silently change behaviour.
