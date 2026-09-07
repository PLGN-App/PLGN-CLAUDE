# Command conventions

Shared rules for every command in this plugin. Commands point at these rules
instead of repeating them. Where a rule lives in a skill, use the skill — do
not rewrite it here, because a copy drifts away from the original over time.

Commands come in two kinds. Every command is exactly one of them:

- **Free** — `demo`, `audit`, `strategy`, `voice`, `competitors`, `calendar`.
  Call **zero** MCP tools. Output is text. Always close with the seam.
- **Connected** — `setup`, `brandkit`, `brand`, `knowledge`, `month`, `post`, `undo`,
  `repurpose`, `topics`, `library`, `images`, `visuals`, `queue`, `refresh`,
  `report`.
  Call MCP tools. Never carry the seam.

`help` is neither. It prints the command list and calls nothing.

---

## 1. How to talk to the user

Everything a command prints follows the **reply-style** skill. It sets the
language, the reading level, the tone, the length, and the words that must
never reach the user.

Two rules from it matter so much they are repeated here:

- **Reply in the language the user wrote in.** Arabic in, Arabic out.
- **Never print an internal name** — no tool names, no agent names, no
  `ERROR:` text, no "cadence" or "pillar" or "gate".

## 2. Check the connection before working

Every connected command calls `workspace_info` **first**, before anything
else.

**If it fails**, the user is not connected. Print exactly this, then stop:

> You're not connected to a workspace yet. Create one at **useplgn.com**, then
> run this command again — you'll be asked to approve access.

Translate it into the user's language, but keep the meaning and the link. Do
not retry in a loop, and do not offer to write something locally instead. A
user who ran a connected command wants the real thing.

**If it succeeds**, carry on. Print nothing. A check that passes is silent.

Commands that write copy in a brand's voice also call `knowledge_get`. If the
brand has no stored voice, send the user to `/plgn setup` and stop. Never guess
a voice that is one call away.

**Never stop halfway in silence.** If the check passes but a later step fails,
say exactly what is in the workspace now. A user must never have to guess what
was saved.

## 3. Ask before writing

Reading is free. Creating thirty posts is not.

Any command that creates, updates, schedules or deletes must show its plan and
wait for a clear yes. The plan says **what** will be written, **how many**, and
**where** — never a vague "I'll create some posts".

Ask using one of the two formats in **reply-style**:

```
A list of things     →   yes / pick / no
One thing            →   yes / edit / no
```

Three exceptions to the format:

- **Deleting or archiving** is confirmed by **name**, not by number. "Delete 3?"
  is not a confirmation. "Delete the snippet 'Q2 launch hook'?" is.
- **Generating images** states the credit cost in the question, because it
  spends from a real balance.
- **`--dry-run`** stops right after the plan and writes nothing.

Silence is not a yes. If the answer is unclear, ask again.

## 4. Flags

Every command that writes accepts:

- **`--dry-run`** — show the plan, write nothing, say that nothing was written.

These commands also accept `--yes`, which skips the confirmation:
`post`, `topics`.

`--yes` is **never** accepted by `month`, `images`, `visuals`, `brandkit`, `undo`,
`repurpose`, `refresh`, `library`, `brand` or `knowledge`. Those either spend
credits, write in bulk, or remove things.

Unknown flags are reported, never ignored, so a typo cannot quietly change what
happens.

## 5. When a tool returns an error

Any tool result starting with `ERROR:` is handled by the **gate-recovery**
skill. It owns that procedure, including which errors are not gate failures at
all. Describe the outcome to the user using **reply-style** rule 6.

## 6. Briefing an agent

Agents run in their own context. They cannot see this file, the skills, or the
conversation.

So a command that starts an agent must **put the rules it needs into the
agent's prompt**. Do not tell an agent to "read the platform-specs skill" and
assume it can. Pass the numbers, limits and voice rules it needs directly.

Agents never call tools that write. The command owns every write.

## 7. The seam

Free commands close with the block from the **upsell-seam** skill, once, at the
very end. Connected commands never contain it — that user has already signed
up, and selling to them is noise.

## 8. Never handle credentials

Sign-in belongs to plgn. No command may ask the user to type, paste or store a
token, API key or password, and none may repeat one back if a user sends one.

When something is not connected (`cloudinary_connect`, `kie_key_set`), say what
is missing and what it costs them, then point them at the dashboard. A terminal
is the wrong place for a secret.

## 9. Shape of the output

Lead with the thing the user asked for. Put the process behind it.

- **No tool logs.** "Calling post_create..." is noise.
- **Counts first, then the exceptions.** "28 posts scheduled. 2 need your eye:"
  then those two, by name and reason.
- **Full text, not summaries.** When the deliverable is copy, print the copy.
  A table of post titles is not a set of posts.
- **Say what you assumed**, so the user can correct it.

## 10. Arguments

The argument comes after the command name. If it is missing and the command
needs it, **ask** — never invent a URL, a brand or a subject.
