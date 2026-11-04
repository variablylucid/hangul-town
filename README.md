# Hangul Town (working title)

A cozy fantasy town RPG for learning Korean. You move in with your grandmother (Halmeoni) and help townspeople by casting hangul spells, learning real words, grammar and sound rules as you go.

**Full design:** the "Korean Learning Game — Design Workshop" Claude Doc: https://claude.ai/artifact/8GRC1C3zKQEhjtxsHara4y

## Start here (for every new work session)

1. Read `docs/DECISIONS.md` — everything already decided. Don't reopen these without the founder.
2. Read `docs/TEAM.md` — who decides what. Lina and Tess have the final say on anything that teaches Korean.
3. Pick the next item from `docs/TASKS.md`, keep tasks small, and commit after each one.

## Layout

| Path | What it holds |
| --- | --- |
| `content/words.json` | The 34 approved prototype words. Never edit without Tess and Lina's sign-off. |
| `content/lessons.json` | Lesson order, review schedule and end check for the prototype. |
| `docs/` | Decisions, team roles, task list. |
| `src/` | Game code (not started yet). |

## Status

Design complete for the free itch.io prototype. Code not started: the first build step needs package installs (Vite, TypeScript, Phaser, es-hangul, ts-fsrs), which must run in an environment with npm access.

All Korean content is AI-verified only and awaits a native-speaker proofread.
