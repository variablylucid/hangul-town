# Decision log

Confirmed by the founder. Newest at the bottom. Change only with the founder's approval.

## Direction
- Cozy fantasy town RPG. You move in with Halmeoni and help townspeople with hangul spells; the town grows as you learn.
- Audience: young women, mostly K-pop and K-drama fans, who want to understand idols, YouTube and TV without subtitles.
- Rejected: idol-company sim, lyric-writing as the core, a visiting-singer story.
- No real idol names, songs, groups or lookalikes anywhere.

## Teaching
- Design rule: on anything that teaches Korean, Lina (linguist) and Tess (teacher) set the requirements and have the final say; Gabe and Joy make it fun within them.
- No romanization, ever. Native audio first, plus 2–3 English anchor words per sound (optional, can be switched off), with an optional accent setting for ㅓ ㅗ ㅜ.
- Player produces Korean (building syllables, then typing); never picks from a word bank.
- Only taught letters in anything the player produces. Untaught words shimmer as unreadable.
- Review is woven into the story and run by the FSRS scheduler: echo calls, fading labels, flickering wards, morning tea and letter. No streaks; nothing restored ever breaks.
- Positive pedagogy: every Korean word can be tapped for a hint; wrong spells misfire with humor and a warm, specific nudge; no lives, red Xs or visible penalties. Hints and misses quietly bring the word back sooner.

## Game
- Spells: Listen, Inscribe, Cast, on Halmeoni's scroll. New layers unlock with learning. Spells grow harder as you recast them (cue or length changes, one at a time), gated by the scheduler. Ranks (Seed, Bud, Bloom, Full Moon) and artwork never go down; the challenge quietly steps back after a forgotten word.
- Mouth diagram: flowing breath energy over a calligraphic side profile; tongue and lips stay solid; can be turned off.
- House map: tap/click to interact; the character quickly moves to interactive things; tapping anything else just makes them look. One room per screen.
- Close-up view (portraits and the scroll) for all conversations and spells.
- Townspeople mix taught Korean words into English, ramping to full Korean lines. Never mix grammar across languages.
- Codex: a spellbook with words (voiced by whoever taught them), grammar notes, and optional recall flashcards (base game).
- Player character: you. A Korean house name from Halmeoni at first; choice of kinship terms (형/누나 or 오빠/언니, or a neutral path with name + 씨 or 선배).

## Scope and platforms
- Free itch.io prototype: Halmeoni's 5 lessons (~1 hr) + townsperson #1, the lost child (~1.5 hrs).
- Base game: Halmeoni + 3 townspeople, full alphabet, ~5.5 hrs, $7.99–9.99.
- Then three packs of 3 townspeople each, in Tess's order.
- 1.5 hours of new content per townsperson.
- Steam first, then mobile. Build mobile-friendly from day one.
- Stack: web-first TypeScript (Phaser for the house map, DOM/CSS for the close-up view), Capacitor for phones, Electron for Steam later.
- Ads/free tier: later to-do. Build an empty placeholder now.

## Art, audio, text
- AI concept art for the prototype only (labeled on itch.io); human artists before any paid version. Portraits are redrawn first.
- Tiles and sprites from human-made packs; AI never draws hangul. All Korean is real text.
- Fonts: Gowun Dodum + Nunito (learning text), Pretendard (menus), Gowun Batang + Lora (titles only), Pretendard or Noto Sans KR large for letter lessons. All OFL.
- Font rules (Lina's font review): Korean learning text at least 20px on mobile and 5–10% larger than the English beside it; no faux bold or italic (`font-synthesis: none`), emphasis by colour or highlight, never bold; lesson letters in Pretendard locked at weight 550, shown with their in-block forms in lesson order; Gowun Batang for titles only, 24px or larger; all text meets WCAG AA contrast (4.5:1).
- Audio: computer voices for the prototype, checked against the Standard Korean Dictionary, two engines, speech-to-text and community spot checks. Gemini cross-checks the Korean as a free extra.

## Budget
- ~$200 native proofread once the prototype works; $300–800 Fiverr voices for key lines; $100 Steam fee. Kickstarter only after a following.
- Fonts approved for the prototype (Lina's final sign-off). No more font changes. Made-up syllables (e.g. 뮨) may appear as shape examples but are never voiced: computer voices mangle them.
- Lesson-letter example syllables are real words where possible; Lina checks every new one. Voiced syllables that computer voices may misread (e.g. as letter names: 으, 어, 느, 녀, 뇨) or that are hard to voice alone (앙) are flagged and checked by ear.
