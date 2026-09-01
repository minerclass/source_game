# Agent Log

Append-only record of automated and agent-assisted changes to this repository.

Purpose: this work happens from more than one machine, so local notes are not a
reliable history. Anything an agent should know about a past change belongs
here, in the repository, not in a local file.

## Conventions

- Newest entry first. Never rewrite or delete an existing entry; correct it with
  a new one that says what it supersedes.
- Record what was verified and how, not just what was edited. "Fixed" without a
  check is not a result.
- Record open items and known-failing things explicitly, so the next agent does
  not rediscover them or assume they are already handled.
- No participant data, transcripts, consent records, committee or faculty names,
  credentials, or tokens.

---

## 2026-08-31 - Adopt the shared ink; ground kept local on purpose

Links the shared token file and points `--text` and `--dim` at the shared ink and muted
values, each with its pre-adoption fallback.

**The ground is deliberately not adopted.** This game re-themes itself per level through
`body[data-env]`, and the deep ground plus its per-level radial gradients carry that
atmosphere. Taking a single shared ground would flatten the thing the game uses to signal
where you are.

**Verified against every per-level gradient stop**, including the lightest (`#1e1b4b`):
`--text` moves from 14.53 to 13.78 and `--dim` from 6.3 to **7.1**, so the muted text is
actually better off. Nothing on the page drops near the 4.5 threshold.

---

## 2026-08-31 - Restore keyboard focus indication and honour prefers-reduced-motion

Found during an accessibility sweep across the dissertation ecosystem.

**Problem 1: invisible keyboard focus.** The stylesheet contained **no `:focus` rules at all**, while `.range-input` and `.sig-input` each set `outline: none` on the element itself rather than on a state, removing the ring in every state. `.sig-input` additionally sets `border: none`, leaving a text input with no focus affordance whatsoever.

**Problem 2: motion.** The page animates (2 animation or keyframes declarations) and
did not honour `prefers-reduced-motion`.

**Changed.** `style.css` only.

- Added `:focus-visible` rules restoring a visible ring, using the page's own accent
  colour so it reads as part of the design. `.sig-input` sits on a light card where the amber accent would be hard to see, so it gets a dark ring matching its own text colour instead of the global one.
- Appended a `@media (prefers-reduced-motion: reduce)` block collapsing animation and
  transition durations.

**Deliberately not removed.** The existing `outline: none` declarations were left in
place. They also serve the hover state, and removing them would change mouse appearance.
The new rules come later in the stylesheet and match their specificity, so keyboard focus
wins without altering anything a mouse user sees.

**Verified.** Driven in a real browser. A focused button resolves to `rgb(251, 191, 36)`, the amber `--accent`, at the intended width. All three new rules were confirmed present in the parsed stylesheet. `.range-input` and `.sig-input` are created during gameplay rather than at load, so their rules were verified by inspecting the parsed CSSOM rather than by focusing live elements; that is weaker evidence than the button test and is worth re-checking in play. CSS braces balance.
