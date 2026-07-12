# Keeper of the Source — build log / continuation guide

> Audit trail for agents. This file tracks what is done, what is verified, and what remains.

## Status

- **Phase:** built, CDN dependencies removed, verified locally.
- **Repository:** `minerclass/source_game`
- **Default branch:** `main`
- **Public URL target:** `https://minerclass.github.io/source_game/`

## What the game is

Player calibrates pedagogical friction across four levels (Noetic, Rhetorical, Existential, Infrastructural) to design historical inquiry tasks. Includes Sourcing audits, Socratic dialogic tables, and student revision logs.

## Key implementation decisions

- **Files:** `index.html`, `style.css`, and `game.js`. No framework, build step, package manager, CDN, or external dependency.
- **Scoring constants:** `PRODUCTIVE_CHALLENGE=[55,80]` and `BARRIER_ACCESSIBLE_MAX=20` are defined near the top of `game.js`.

## Verification checklist

- [x] No CDN or external stylesheet/script dependency in `index.html` (Google Fonts and FontAwesome removed)
- [x] System font stacks used in CSS (Segoe UI, Georgia, Consolas)
- [x] Character icons (feather, scroll, award, seats, graduate profiles) render using inline Unicode symbols
- [x] Browser playthrough confirms zero external network requests on load
- [x] Playthrough and replay cycle succeed with zero console errors

## Phase 4 - 2026-07-11

- Added named ARIA progressbars for Cognitive Challenge and Mechanical Barrier.
- JavaScript syntax check passed.
- Browser smoke checks found zero console errors and no horizontal overflow at desktop or 390px phone width.
- Level 1 source sentences and citations were intentionally held for chronology and citation approval.

## 2026-07-11 — Level 1 revision: Colonial Resistance and Liberty Claims, 1765–1773

Approved revision implemented: Level 1 reframed from a strict 1765 Stamp Act narrative to
the broader 1765–1773 frame, and the answer-revealing "[Bypass Zone: ...]" labels replaced
with three simulated flattened AI claims (explicitly labeled as simulated, not quotations).

### Verified primary-source records (verified 2026-07-11)
1. **Boston Non-Importation Agreement, August 1, 1768** — Avalon Project, Yale Law School
   (`avalon.law.yale.edu/18th_century/boston_non_importation_1768.asp`). Verified reasons:
   scarcity of money, customs duties, war-debt taxes, trade restrictions; pledges to suspend
   imports and boycott dutied goods until repeal.
   **Substitution note:** the brief's working label was "Boston merchant petition, 1765."
   The December 1765 Boston merchants' agreement is historically attested but has no stable
   public repository record we could verify; per the guardrail ("stop and document"), the
   verified 1768 agreement (inside the approved 1765–1773 frame) was used instead, and the
   approved merchant claim was minimally edited from "the Stamp Act" to "British taxes"
   (a permitted carefully edited equivalent).
2. **Resolutions of the Stamp Act Congress, October 19, 1765** — Avalon Project
   (`avalon.law.yale.edu/18th_century/resolu65.asp`; Avalon's exact page title is
   "Resolutions of the Continental Congress October 19, 1765" — noted in the in-game
   resolution text). Verified content: taxation only with consent via own representatives;
   colonies "are not, and ... cannot be, represented" in the Commons; trial by jury.
3. **Circular letter "in behalf of our fellow slaves in this province," Boston,
   April 20, 1773** — Massachusetts Historical Society Collections Online, item 443
   (`masshist.org/database/viewer.php?item_id=443`). Signers: Peter Bestes, Sambo Freeman,
   Felix Holbrook, Chester Joie. Verified opening line: "THE efforts made by the
   legislative of this province in their last sessions to free themselves from slavery,
   gave us, who are in that deplorable state, a high degree of satisfaction." The quoted
   phrase on the card ("in behalf of our fellow slaves in this province") is from the MHS
   catalog record. NOTE: the handoff's first MHS context URL (loc-slavery entry 504)
   describes the 1780 Declaration of Rights, not this petition; item 443 is the correct
   record.

### Files changed
- `game.js`: `levels[1]` (dialogue/title/prompt), `l1Sources` (claims + dated sources +
  interpretive resolutions + per-source incorrect-match hints), `buildLevel1()` (claim
  blocks with "Simulated AI claim N" tags + dated source cards + keyboard/aria labels),
  `selectCard()` (resolved claims keep their text and show interpretive resolution;
  incorrect matches give source-aware feedback and leave the claim selected/unresolved).
- `style.css`: `.claims-kicker`, `.bypass-word.claim-block` (+ resolved state),
  `.claim-tag`, `.claim-text`, `.claim-resolution`, `.source-date`.
- Levels 2–4 untouched.

### Tests (all pass, 2026-07-11, local browser)
- Title renders "Colonial Resistance and Liberty Claims, 1765–1773"; kicker labels claims
  as simulated, not quotations; all three cards show verified dates.
- Correct matches resolve with claim text preserved + interpretive resolution (merchant
  resolution explicitly labels the motive question as contested).
- Incorrect cross-match (claim 1 × 1773 circular) gives source-aware feedback; claim stays
  selected and unresolved.
- Keyboard-only: Enter/Space select claims and cards; full completion achieved by keyboard.
- Completion: schema 100 / challenge 75 / barrier 5; L2, L3, L4 load and operate; replay
  (reload) rebuilds L1 cleanly; mobile 375px overflow 0px; zero console errors;
  `node --check game.js` and `git diff --check` pass.
