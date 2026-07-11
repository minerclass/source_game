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
