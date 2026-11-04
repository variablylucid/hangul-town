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
| `src/fonts.css` | Font files, the four font roles (`--font-learn`, `--font-ui`, `--font-title`, `--font-letter`) and Lina's type rules (`.learn`, `.title`, `.lesson-letter`, `.emph`). |
| `src/theme.css` | Colours. Every text colour passes WCAG AA; the font test page re-checks them live. |
| `src/assets/fonts/` | Subset web fonts. Rebuild with `python3 scripts/subset_fonts.py` (needs `pip install fonttools brotli`). |
| `public/licenses/fonts/` | OFL license for each font; shipped with the game. |
| `fonts.html` | Font test page: Korean and English in every font, plus live checks for Lina's font rules. Open it on a phone to check that phone. |
| `src/` | Game code: `main.ts` starts Phaser; `scenes/` holds game scenes. `#ui` in `index.html` is the DOM layer for the close-up view. |

## Status

Design complete for the free itch.io prototype. Project scaffold in place (Vite, TypeScript, Phaser, es-hangul, ts-fsrs); the game shows a blank window.

## Preview

Every merge to `main` rebuilds the game and publishes it at **https://variablylucid.github.io/hangul-town/** (font test page: https://variablylucid.github.io/hangul-town/fonts.html) (see `.github/workflows/deploy-preview.yml`). It takes a minute or two after each merge.

## Running it

Needs Node 20+.

```bash
npm install
npm run dev      # starts a local server; open the URL it prints
npm run build    # typecheck + production build into dist/ (for itch.io)
```

All Korean content is AI-verified only and awaits a native-speaker proofread.
