# Typographer plugin follow-ups

## typographer-plugin leftovers, added 2026-10-07

- [x] A1. `agents/plgn-creative-director.md`: The sentence "Without that line you write no words for the picture: the designer writes them" is now out of date. The designer now writes no words without a typography block. In images item 5, the retry prompt never says to repeat the line "An art director takes this idea next," so a retry can come back without image_words, skip 4b, and lose words with no warning. Change the director's sentence to "no words are drawn". In images item 5, say the retry prompt ends with the same line, so image_words come back.

- [x] A2. `commands/month.md` line 367: States that the look "has no type system in it" as fact, but the look's content and textInImage can still describe type, and the typographer's own rule already covers this case. Also, the person's pick of type system is never saved, so every images or month run asks the question again. Use the agent's own condition ("when the look names no type system"). Later, think about saving the person's pick on the brand so the question is asked only once.
  Saving the person's type-system pick on the brand is a server change; deferred.

- [x] A3. `commands/month.md` line 481: The step 9 example names only the shorter line, but decision 6 says step 9 "names the line and the shorter one", and nothing says which post it was. Example should be: `1 quote card's line "<the hook>" is long for its frame (<post title>) — a shorter one: "…"; /plgn images can remake it`.

- [x] A4. `docs/superpowers/plans/2026-10-07-typographer-plugin.md`: Decisions 2 and 10 say "Flagged in Open", but the plan has no Open section, so the desk risk is not written down. Also, the plan commit d20b983 uses the default identity (Ahmed Hashim), not the PLGN identity. Add the Open section (post.md gets no 4b; desk 0.11.0 must ship the typographer before or together with taking in plugin 1.16.0). Use the PLGN identity for doc commits too.

- [x] A5. `agents/plgn-typographer.md`: The answer has room for only one `fit`, so a post with two lines that are too long can flag only one. In the example, "inside the 10% safe zone" can be misread as inside the edge to keep clear, and the cream headline sits in a scene the order says is mostly cream. Optionally allow `fit` to be a list keyed by text. In the example, write "inside the safe area, clear of the 10% edge" and pick a headline colour that stands out from the scene.
  fit stays one object per the spec; the example was fixed.
