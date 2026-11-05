# Decision log

Confirmed by the founder. Newest at the bottom. Change only with the founder's approval.

## Direction
- Cozy fantasy town RPG. You come home to Grandma and help townspeople with hangul spells; the town grows as you learn.
- Story: the player grew up in the capital and comes home to Grandma (Mom's mother), who broke her ankle and recovers as the house is restored. Chapter 1 is Grandma's house, one room per lesson as she recovers.
- The setting is a queendom, but only as a quiet background detail: never in the pitch, store page or marketing, and not part of the story until a later prince pack.
- Names: the player chooses 은우, 가은, 우빈 or 이안 (surname 박) at the end of L6. Mom is 이미란; Grandma's surname is 김. Untaught letters in names show dimmed.
- Audience: young women, mostly K-pop and K-drama fans, who want to understand idols, YouTube and TV without subtitles.
- Rejected: idol-company sim, lyric-writing as the core, a visiting-singer story.
- No real idol names, songs, groups or lookalikes anywhere.

## Teaching
- Design rule: on anything that teaches Korean, Lina (linguist) and Tess (teacher) set the requirements and have the final say; Gabe and Joy make it fun within them.
- No romanization, ever. Native audio first, plus 2–3 English anchor words per sound (optional, can be switched off), with an optional accent setting for ㅓ ㅗ ㅜ.
- Player produces Korean (building syllables, then typing); never picks from a word bank.
- Only taught letters in anything the player produces. Untaught words shimmer as unreadable.
- Review is woven into the story and run by the FSRS scheduler: echo calls, fading labels, flickering wards, morning tea and letter. No streaks; nothing restored ever breaks.
- Block builder, reading order (Tess): first consonant, then vowel, then floor; nothing is replaced, the player taps a letter to take it out. ㅇ tapped first is the silent start; ㅇ after a vowel goes to the floor.
- Block builder, fuse on Cast (Tess + Joy): while building, each letter sits in its own glowing slot in the real layout; only Cast fuses them into the finished syllable (see Right Cast and Wrong Cast below).
- No copying (Tess): never show the target as text before Cast. Reveal it after a successful Cast. (Until audio exists, a "Show me" button stands in for listening.)
- Block builder, vowel auto-placement (Tess + Lina): vowels place themselves from the start, with a visible slide: tall vowels (ㅏ ㅓ ㅣ ㅑ ㅕ ㅐ ㅔ) move right and the frame reshapes; flat vowels (ㅗ ㅜ ㅡ ㅛ ㅠ) drop below. The first time a flat vowel appears, show once: “Tall vowels stand to the right. Flat vowels lie underneath.”
- Hint placement (Tess + Joy): hints appear above the frame as a small speech tag (later from the Breath Lantern), never over a slot. The slot a hint is about gets a soft pulsing outline; for the quiet-ㅇ hint, ㅇ also glows in the tray. Max 2 lines, 16px or larger, with room for a replay-audio icon. A hint stays until the next tap, then fades; never on a timer. No red, no shake, no error sound. Vowel hints play the audio contrast first (“Listen: [target] / [yours].”), then the text; until audio exists, only the text shows.
- Grandma's name (Tess + Lina): English UI and narration say “Grandma”. Never write 할머니 in English letters anywhere. Her nameplate and spoken lines show 할머니 with ㅎ and ㄹ dimmed until taught, and her name is voiced when she appears.
- English text says “Grandma”. Never write “Halmeoni” in English letters.
- Never attach English endings to Korean words (no “할머니's”, “누나s”).
- Review rating (Tess): log only the first Cast of each item; if any hint was shown (including Show me), rate it Again.
- Chapter 1 letter order (Tess + Lina): L1 vowel strokes ㆍ ㅡ ㅣ, ㅏ ㅓ ㅗ ㅜ, silent ㅇ; L2 ㅁ; L3 ㄴ; L4 ㅂ; L5 ㄱ; L6 final consonants ㅁ ㄴ ㅇ ㅂ ㄱ, linking and name entry; the lost-boy scene; L7 ㄹ and final ㄹ. Why: ㅂ builds on ㅁ; ㅂ and ㄱ unlock most household words; ㄹ is the hardest to say, so it comes last. The y-vowels (L8), ㅐ ㅔ (L10) and later lessons are in the base game. Lessons and practice words live in `content/lessons.json`.
- Practice targets are real words wherever possible (they will come with a picture and audio). Nonsense syllables only for sound-pair listening, and never voiced if marked unsafe.
- Blocklist: 년 and 놈 can never be built or typed as player-built syllables.
- Wrong Cast (Tess + Joy): the spell sputters with a comic puff of smoke (later the Breath Lantern sneezes soot), and the letters stay in place, slightly singed and wobbling, so the retry is a one-letter fix. The hint appears above the frame. No red, shake or error sound.
- Right Cast (Tess + Joy): the pieces fuse, a glowing seal stamps on (later onto the object being fixed), then the audio plays. First casts get the full animation; repeat casts a quick one.
- Hint sizes (Lina): Korean never goes below 20px. When Korean shares a line with English, use 20px Korean with 18px English, and wrap to a second line on narrow phones rather than shrinking. When Korean sits on its own line or chip, English can stay 16px.
- Positive pedagogy: every Korean word can be tapped for a hint; wrong spells misfire with humor and a warm, specific nudge; no lives, red Xs or visible penalties. Hints and misses quietly bring the word back sooner.

## Game
- Spells: Listen, Inscribe, Cast, on Grandma's scroll. New layers unlock with learning. Spells grow harder as you recast them (cue or length changes, one at a time), gated by the scheduler. Ranks (Seed, Bud, Bloom, Full Moon) and artwork never go down; the challenge quietly steps back after a forgotten word.
- Mouth diagram: flowing breath energy over a calligraphic side profile; tongue and lips stay solid; can be turned off.
- House map: tap/click to interact; the character quickly moves to interactive things; tapping anything else just makes them look. One room per screen.
- Close-up view (portraits and the scroll) for all conversations and spells.
- Townspeople mix taught Korean words into English, ramping to full Korean lines. Never mix grammar across languages.
- Codex: a spellbook with words (voiced by whoever taught them), grammar notes, and optional recall flashcards (base game).
- Player character: you. Your Korean name is chosen at the end of L6 (see Names); choice of kinship terms (형/누나 or 오빠/언니, or a neutral path with name + 씨 or 선배).

## Scope and platforms
- Free itch.io prototype: Chapter 1, Grandma's house: lessons L1–L7 plus the lost-boy scene at the gate.
- Base game: Grandma + 3 townspeople, full alphabet, ~5.5 hrs, $7.99–9.99.
- Then three packs of 3 townspeople each, in Tess's order.
- 1.5 hours of new content per townsperson.
- Steam first, then mobile. Build mobile-friendly from day one.
- Stack: web-first TypeScript (Phaser for the house map, DOM/CSS for the close-up view), Capacitor for phones, Electron for Steam later.
- Ads/free tier: later to-do. Build an empty placeholder now.

## Art, audio, text
- Prototype art is AI-made, in a deliberate sketch style so it looks unfinished on purpose. The itch.io page labels it as AI-made art and labels the generated voices too. Never describe it as hand-drawn. Human artists before any paid version; portraits are redrawn first.
- Tiles and sprites from human-made packs; AI never draws hangul. All Korean is real text.
- Fonts: Gowun Dodum + Nunito (learning text), Pretendard (menus), Gowun Batang + Lora (titles only), Pretendard or Noto Sans KR large for letter lessons. All OFL.
- Font rules (Lina's font review): Korean learning text at least 20px on mobile and 5–10% larger than the English beside it; no faux bold or italic (`font-synthesis: none`), emphasis by colour or highlight, never bold; lesson letters in Pretendard locked at weight 550, shown with their in-block forms in lesson order; Gowun Batang for titles only, 24px or larger; all text meets WCAG AA contrast (4.5:1).
- Audio: computer voices for the prototype, checked against the Standard Korean Dictionary, two engines, speech-to-text and community spot checks. Gemini cross-checks the Korean as a free extra.

## Budget
- ~$200 native proofread once the prototype works; $300–800 Fiverr voices for key lines; $100 Steam fee. Kickstarter only after a following.
- Fonts approved for the prototype (Lina's final sign-off). No more font changes. Made-up syllables (e.g. 뮨) may appear as shape examples but are never voiced: computer voices mangle them.
- Lesson-letter example syllables are real words where possible; Lina checks every new one. Voiced syllables that computer voices may misread (e.g. as letter names: 으, 어, 느, 녀, 뇨) or that are hard to voice alone (앙) are flagged and checked by ear.

## Pending (don't build yet)
- On-screen keyboard: the plan is in `docs/plans/keyboard.md`; build only after the team approves it.
