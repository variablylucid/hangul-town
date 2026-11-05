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
- [x] Block builder round 4: smoke-puff wrong Cast, seal-stamp right Cast, lesson word targets, 년/놈 blocklist, hint sizes — *you should see: building 아이, 오이, 이 in lesson 1*
- [x] Plan the on-screen keyboard (`docs/plans/keyboard.md`)
- [ ] Korean typing on the on-screen keyboard (after the plan is approved) — *you should see: typing 엄마 and getting the right blocks*
- [ ] Review scheduler (FSRS) with first-attempt rating and the practice-vs-review rule (log only the first Cast; any hint shown → Again)
- [ ] Hint bubbles: tap any Korean word for audio + picture, then meaning, then next letter
- [ ] Audio playback with generated voices, every clip listed for checking
- [ ] One-click bug report (game state, log, screenshot)

## Chapter 1: Grandma's house (L1–L7 + the gate scene)
- [x] New lesson order in `content/lessons.json` (Tess and Lina approved); old word list marked superseded
- [ ] Tess and Lina: rebuild `content/words.json` for the new order; update the end check (it still uses 네/아니요)
- [ ] House map: one room per lesson as Grandma recovers; tap to interact
- [ ] Close-up view with Grandma's portrait (nameplate 할머니, ㅎ and ㄹ dimmed until taught) and the spell scroll
- [ ] Lessons 1–7 with the breath-energy diagram
- [ ] Name entry at the end of L6 (은우, 가은, 우빈, 이안; surname 박)
- [ ] Scene: the lost boy at the gate (누나/언니, 응/아니)
- [ ] Fading labels, echo calls and morning tea review
- [ ] End check (the thank-you letter) and the next-day probe

## Base game (later)
- [ ] y-vowels (L8), ㅐ ㅔ (L10) and later lessons

## Before itch.io
- [ ] Codex: words with audio and grammar notes
- [ ] Check every audio clip (dictionary, two engines, speech-to-text, Gemini, community)
- [ ] Credits and font licenses screen; AI-art and generated-voice labels (sketch style; never “hand-drawn”)
- [ ] Track your weekly hours for the first 4 weeks
