# Keeper of the Source

A historical inquiry simulator about sourcing, verification, and careful evidence work. You play an Inquiry Architect who designs tasks across four levels, keeping the thinking that historical inquiry needs while removing barriers that shut students out.

Allow about ten minutes. Written for grades 6-12 and for teacher professional learning.

Play it at <https://minerclass.github.io/source_game/>.

## How it works

The game moves through four levels, one for each part of the pedagogical friction framework.

1. **Noetic Sourcing.** Audit simulated AI claims against primary sources in the frame "Colonial Resistance and Liberty Claims, 1765-1773."
2. **Rhetorical Contextualization.** Work through a Socratic dialogic table.
3. **Existential Corroboration.** Review student revision at the authorial desk.
4. **Infrastructural Policy.** Calibrate supports for three student profiles and see how policy choices become challenge or barrier.

Two meters, Cognitive Challenge and Mechanical Barrier, track each design choice.

## Sources

Level 1 draws on three primary-source records, each verified on July 11, 2026:

- Boston Non-Importation Agreement, August 1, 1768. Avalon Project, Yale Law School.
- Resolutions of the Stamp Act Congress, October 19, 1765. Avalon Project, Yale Law School.
- Circular letter "in behalf of our fellow slaves in this province," Boston, April 20, 1773. Massachusetts Historical Society Collections Online, item 443.

The AI claims in Level 1 are written for the game and labeled as simulated. They are not quotations from any model. `BUILD_LOG.md` records the verification details and one documented source substitution.

## Run it locally

Open `index.html` in a current browser. There is no build step, framework, package manager, or account. The page links one shared stylesheet, `https://minerclass.github.io/tokens.css`, and falls back to its own colours when that file is unavailable.

## Conceptual grounding

Pedagogical friction, productive and exclusionary friction, and unproductive success as used here come from the framework Micah Miner is developing in his dissertation research. They are presented as proposals in progress, not as established terms or completed findings.

## What this does not claim

- All scores, stats, and achievements are illustrative models of the pedagogical friction framework, not validated learning assessment instruments.
- The students in the game are fictional design profiles. They are not participants and do not represent real learners.
- Nothing here calls an AI service. The "AI" choices are scripted teaching examples.
- The game does not measure learning, does not evidence any dissertation claim, and reports no findings.
- No participant, student, or staff data is used, collected, stored, or transmitted.

## Accessibility

Sound is off by default. Keyboard focus is visible, and animation respects the system reduced-motion setting. The two meters are named ARIA progress bars. The game was checked at desktop and 390px phone widths with no horizontal overflow.

## Implementation

Three files: `index.html`, `style.css`, and `game.js`. Icons are inline Unicode symbols and fonts are system stacks. The calibration constants `PRODUCTIVE_CHALLENGE = [55, 80]` and `BARRIER_ACCESSIBLE_MAX = 20` sit near the top of `game.js`. GitHub Pages publishes from `main` through `.github/workflows/pages.yml`.

## Related simulation

Out of Time: <https://minerclass.github.io/historical-inquiry-friction/out-of-time/>

## Logs

`BUILD_LOG.md` records how the game was built and what was verified. `AGENT_LOG.md` is an append-only record of agent-assisted changes. Neither file holds participant data, credentials, or tokens.

## Related

- Games hub: <https://minerclass.github.io/games-hub/>
- Dissertation overview: <https://minerclass.github.io/dissertation-overview/>
