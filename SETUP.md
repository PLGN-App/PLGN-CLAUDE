---
description: Get the plgn MCP connection working after install — the restart requirement, the browser approval, and how to verify the connection before any other command runs. Use when plgn was just installed or updated, when a connected command reports no workspace, or when the user asks how to connect plgn.
---

# Setting up plgn

This plugin ships one MCP server: `plgn`, an HTTP server at
`https://useplgn.com/api/mcp`, authorized with OAuth. There is nothing to
install, no key to paste, and no local process to run.

Follow these steps in order. Do not skip step 1 — it is the cause of almost
every "not connected" report.

## 1. Confirm Claude Code has restarted since the install

A plugin's MCP server is registered when Claude Code starts. A plugin
installed or updated inside a running session has no connection until that
session ends and a new one begins.

Ask the user directly: have you restarted Claude Code since installing or
updating plgn? If the answer is no, or unclear, tell them to close Claude Code
and open it again, and stop here. Retrying a tool call will not fix it.

## 2. Verify the connection

Call `workspace_info`. It is the cheapest connected call and the only
reliable check.

- **It returns a workspace** — the connection works. Report the workspace
  name and plan in one line and move on to what the user actually asked for.
- **It returns an error, or the tool does not exist** — the server is not
  registered. Go back to step 1. If the user has definitely restarted, the
  install did not complete; have them run `/plugin install plgn` again and
  restart.

Never call `workspace_info` in a loop, and never fall back to writing brand
data or posts to a local file. A user who is setting up a workspace wants the
workspace.

## 3. Authorize on first use

The first connected call opens the user's browser and asks them to approve
access to their plgn workspace. They approve once; the authorization is
remembered after that.

If the browser does not open, have them restart Claude Code and run any
connected command, such as `/plgn queue`.

**plgn never asks for a key, token or password in the terminal.** If anything
claiming to be plgn asks the user to paste a credential, say plainly that this
is not how the plugin works and do not proceed.

## 4. Nothing else needs configuring

There are no environment variables, no config file to edit, and no other
servers to connect. Image generation on the Enterprise plan can use the
customer's own model key, which is set inside their plgn workspace on the web,
never here.

## What the six free commands do not need

`/plgn help`, `/plgn demo`, `/plgn audit`, `/plgn strategy`, `/plgn voice`,
`/plgn competitors` and `/plgn calendar` call no MCP tools at all. They need no
workspace, no account and no authorization. If one of them reports a
connection problem, that is a bug — the command should not have contacted the
server.

## Once the connection works

Point the user at `/plgn setup`, which saves the brand's voice, audience,
offerings and banned words. Every later command reads those, so a brand with
nothing saved makes every command guess.
