# Task list (prototype)

Small steps, one commit each. The founder approves how each step plays, using the "you should see" line.

## Setup
- [x] Content data: approved word list and lesson plan (`content/`)
- [x] Project memory files (`README.md`, `docs/`)
- [x] Create the GitHub repository and push this project
- [x] Install Vite, TypeScript, Phaser, es-hangul, ts-fsrs; get a blank page running — *you should see: a blank game window in the browser*
- [x] Add fonts (Gowun Dodum, Pretendard, Gowun Batang, Nunito, Lora), subset for Korean — *you should see: a test page showing Korean and English in each font*
- [x] Lina's font review: stress test, 4× zoom, sizes, no faux bold, lesson letters, contrast — *you should see: every row under Checks on the font test page says pass*
- [x] Lina's final font sign-off: fonts approved for the prototype; lesson-letter fixes (weight locked at 550, lesson order, ㅇ's two jobs, no audio for made-up syllables)
- [x] Open the font test page on a real iPhone (Safari) and Android phone (Chrome) — *you should see: every row under Checks says pass* (Android: pass. iPhone: pass.)

## Core systems
- [x] Hangul block builder: letters snap into a syllable frame — *you should see: building 아, 오, 문 by tapping letters*
- [x] Block builder fixes (Lina, Tess, Joy): reading order, choose the vowel position, fuse on Cast, no copying, Tess's hints — *you should see: building 아, 오, 문 with the target hidden behind Show me*
- [x] Block builder round 3 (Tess, Lina, Joy): vowels auto-place with a slide, hints in a speech tag above the frame, Grandma naming — *you should see: vowels sliding into place and hints above the block*
- [ ] Korean typing on the on-screen keyboard — *you should see: typing 엄마 and getting the right blocks*
- [ ] Review scheduler (FSRS) with first-attempt rating and the practice-vs-review rule (log only the first Cast; any hint shown → Again)
- [ ] Hint bubbles: tap any Korean word for audio + picture, then meaning, then next letter
- [ ] Audio playback with generated voices, every clip listed for checking
- [ ] One-click bug report (game state, log, screenshot)

## Grandma's house
- [ ] House map: bedroom, main room and kitchen, study, yard and gate; tap to interact
- [ ] Close-up view with Grandma's portrait and the spell scroll
- [ ] Lessons 1–5 with the breath-energy diagram
- [ ] Fading labels and morning tea review

## Townsperson #1: the lost child
- [ ] Story scenes, y-vowels and ㅐ/ㅔ, kinship words
- [ ] Echo calls review
- [ ] End check (the thank-you letter) and the next-day probe

## Before itch.io
- [ ] Codex: words with audio and grammar notes
- [ ] Check every audio clip (dictionary, two engines, speech-to-text, Gemini, community)
- [ ] Credits and font licenses screen; AI-art disclosure
- [ ] Track your weekly hours for the first 4 weeks
