# Follow-ups

## portable-skills leftovers, added 2026-10-08

- [ ] P1. `agents/plgn-researcher.md, agents/plgn-art-director.md, commands/assets.md, skills/visual-identity/SKILL.md`: Some Claude-Code-only wording (WebFetch/Read behavior, role isolation claims) is outside the D2 flag list and ships unchanged to other tools. Add WebFetch to flagged, reword in tool-neutral terms like "fetch the page with your web tool, then open the saved file", and rephrase isolation as "work only from what your prompt gives you". Test: verify flagged words match FLAGGED output.

- [ ] P2. `_dev/test/portable.test.mjs`: Assertions are loose (startsWith instead of exact match) and error paths untested (empty/quoted/block descriptions, duplicate names, --out refusal on root/ancestor). Assert exact messages like `errors.includes('commands/x.md:6: flagged "Task tool"')` and add one case each for the edge cases. Test: npm test passes all assertions.

- [ ] P3. `_dev/portable-repo/generate.yml`: Failed git ls-remote is swallowed by `|| true` under bash -e, producing misleading error "PLGN-CLAUDE has no vX.Y.Z tag yet" when the real issue is network/GitHub outage. Put ls-remote output in a variable with its own failure message. Test: workflow still fails correctly with clearer diagnostics.

- [ ] P4. `docs/superpowers/specs/2026-10-08-portable-skills-design.md`: Spec hard-codes 52 skills and 26 commands in several places ("Install plgn's 52 skills", doctor row "52 of 52", plgn-setup test), but real count is 53 (plugin.json has 27 commands including product-sheet). Tell plgn-setup lane to derive the total from bundled skills/ folder instead of typing 52. Test: spec and lane agree on 53.

- [ ] P5. `package.json`: Task command "node --test _dev/test/" fails on Node 24 because no test file is loaded. Use the glob form "node --test _dev/test/*.test.mjs" or "npm test" from package.json. Test: npm test succeeds on Node 24.
