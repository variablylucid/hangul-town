# Plan: on-screen Korean keyboard

Status: **plan only, not built.** For the team to approve before any code. Cody's estimate: 12–20 hours.

*You should see (once built):* typing 엄마 (L6) and getting the right blocks.

## What the team asked for

- Show only taught keys, each in its real **2-beolsik** position, so the keyboard grows outward into the full layout.
- Untaught positions are an **open gap**, not blank keys.
- Keys look like **carved wooden tiles** and **click into place** when taught.
- On phones, keys may shrink as rows fill, but **never move relative to each other**.
- On desktop, **physical keys light their tile**.
- **Never focus a real text field on phones** (no system keyboard).
- The **first time a final consonant jumps** to the next block while typing, show a hint.
- Same rules as the block builder: reading order, no red, no shake, no error sound, hints in the speech tag above the blocks, 년 and 놈 never typeable.

## 1. Layout: real positions, growing by lesson

The prototype only ever uses 13 keys. Positions are standard 2-beolsik (physical QWERTY key in brackets):

| Row | Keys used in Chapter 1 |
| --- | --- |
| Top | ㅂ (Q) · · ㄱ (R) |
| Home | ㅁ (A) ㄴ (S) ㅇ (D) ㄹ (F) · ㅗ (H) ㅓ (J) ㅏ (K) ㅣ (L) |
| Bottom | ㅜ (N) ㅡ (M) |

How it grows (`·` = open gap, nothing drawn):

```
L1                  home:  · · ㅇ · · ㅗ ㅓ ㅏ ㅣ      bottom: ㅜ ㅡ (N M)
L2  + ㅁ (A)        home:  ㅁ · ㅇ · · ㅗ ㅓ ㅏ ㅣ
L3  + ㄴ (S)        home:  ㅁ ㄴ ㅇ · · ㅗ ㅓ ㅏ ㅣ
L4  + ㅂ (Q)        top row starts: ㅂ
L5  + ㄱ (R)        top:   ㅂ · · ㄱ
L6  (finals use the same keys; no new keys)
L7  + ㄹ (F)        home:  ㅁ ㄴ ㅇ ㄹ · ㅗ ㅓ ㅏ ㅣ
```

- Each key has a fixed grid coordinate (column, row, with the real row stagger of a physical keyboard). The data lives in one table in `src/keyboard/layout.ts`; the tray of taught letters comes from `content/lessons.json`, the same source as the block builder.
- The base game adds the rest of the 2-beolsik layout (ㅈ ㄷ ㅅ ㅎ, the y-vowels, ㅐ ㅔ, ㅋ ㅌ ㅊ ㅍ ㅠ, and Shift for ㅃ ㅉ ㄸ ㄲ ㅆ ㅒ ㅖ) without changing any position above.

## 2. Look and motion

- **Tiles:** carved wooden tiles in CSS: a warm wood gradient, an inset bevel and a soft drop shadow, with the letter in Pretendard 550 (the lesson-letter rule) cut into the face. No image assets are needed, so it stays crisp at any size. Joy to approve one tile mock before the full set.
- **Taught keys click into place:** when a lesson teaches a letter, its tile drops into its gap with a small settle (and later a wooden click sound). Reduced motion: it simply appears.
- **Press feedback:** a tile sinks slightly on tap or keypress and lights up (the same light shows for physical keys on desktop).
- **Gaps:** untaught positions draw nothing, so the shape of the real keyboard shows through as the gaps fill in.

## 3. Sizing on phones

- Coordinates never change; the whole keyboard is **scaled uniformly** to fit the width of the area that holds taught keys. So keys keep their relative positions and only shrink when a new column appears (e.g. ㅁ at A in L2 widens the board).
- Key sizes: L1's board spans six key positions (D to L), so keys can be large. The full Chapter 1 home row spans nine (A to L): on a 360px phone that leaves about 33px per key, so keys get narrower but stay at least 48px tall, like a phone's own keyboard. *Question for Joy:* is that acceptable, or should the board use the full screen width (no side gutter) from L4 on?
- When the board rescales, keys glide to their new size (no jump). Reduced motion: no glide.

## 4. Input

- **On-screen taps:** each tile is a `<button>`; the typed blocks render in an ordinary `<div>` (not an `<input>`, not `contenteditable`), so phones never open the system keyboard. An `aria-live` region reads out the finished syllables.
- **Desktop physical keys:** listen for `keydown` on the page while the keyboard view is open. Map by `event.code` (`KeyD`, `KeyH` …), which is the physical key, so it works whatever the computer's own keyboard language or IME is set to. Mapped keys light their tile and type; `Backspace` takes out the last letter; `Enter` casts. Shift is ignored in the prototype.
- **Untaught physical keys** (e.g. pressing F before L7) type nothing. *Question for Gabe and Joy:* should the gap briefly glow to show the key exists but isn't learned yet?

## 5. Typing engine (the hard part)

A small composition engine in `src/keyboard/compose.ts`, built on the existing `src/hangul/syllable.ts` so typing and building share one set of rules:

- Letters join in reading order: consonant → vowel → floor, exactly like the block builder.
- **Final consonant jumps:** a consonant after a vowel sits on the floor; if a vowel follows, it jumps to start the next block (안 + ㅣ → 아니, 밥 + ㅇㅣ → 밥이). The first time this happens, show the hint (wording for Tess).
- **Backspace** removes the last letter typed, so 아니 → 안 (the ㄴ jumps back onto the floor), matching how Korean keyboards behave.
- **Compound vowels and double finals** (ㅘ, ㄺ …) aren't in Chapter 1 and can't be typed; their keys or combinations don't exist yet.
- **Blocklist (년, 놈):** a subtle case. Typing 노마 passes through 놈 for a moment (ㄴ ㅗ ㅁ, then ㅏ moves ㅁ to the next block). Proposal: when a floor letter would complete a blocked syllable, it **waits beside the block, not attached**, until the next key decides. A vowel moves it to the next block (노마 types normally); anything else leaves it unplaced, with the same draft hint as the builder. *Question for Lina and Tess.*
- **Checking it:** es-hangul's `assemble` already does this joining, so the tests type every Chapter 1 practice word letter by letter and compare our engine's output with `assemble`. We still use our own engine so we know exactly when a floor jumps (for the hint) and can enforce taught letters and the blocklist. (es-hangul's `romanize` must never be used: no romanization.)

## 6. How it fits with the block builder

- Same speech-tag hints, same Cast, same seal and smoke, same first-Cast rating rule.
- The typed word shows as a row of real blocks above the keyboard, using the builder's block style.
- The keyboard replaces the builder from L6 (name entry: typing 박은우 etc.), or earlier if Tess wants typing practice sooner. *Question for Tess:* which lesson introduces typing?

## 7. Testing

- **Unit:** the layout table (each letter's 2-beolsik position, the lesson growth); the engine against es-hangul on every practice word; floor jumps; Backspace; blocklist; physical key mapping by `event.code`.
- **In the browser:** the keyboard for each lesson L1–L7 at 360, 375 and 412px wide (no overlap, keys ≥ 44px, no sideways scroll, relative positions unchanged between lessons); typing 엄마 and 밥이 by tapping and by physical keys; reduced motion.
- **Real phones:** you check iPhone Safari and Android Chrome (no system keyboard appears; taps feel right).

## 8. Steps and estimate

| Step | Hours |
| --- | --- |
| 1. Layout table and a static keyboard for any lesson | 2–3 |
| 2. Scaling on phones, growth between lessons | 1–2 |
| 3. Typing engine and its tests (floor jumps, Backspace, blocklist) | 3–5 |
| 4. Tap input, desktop physical keys and key lighting | 2–3 |
| 5. Wooden tile look, click-into-place animation, reduced motion | 2–3 |
| 6. Hints (first floor jump, blocklist) and a demo page typing 엄마 | 1–2 |
| 7. Browser and phone testing, polish | 1–2 |
| **Total** | **12–20** |

## Questions before building

1. **Tess:** which lesson first uses the keyboard, and does the block builder stay available after that?
2. **Tess:** wording for the first-floor-jump hint.
3. **Lina and Tess:** the blocklist proposal (a floor letter that would make 년 or 놈 waits unattached until the next key).
4. **Gabe and Joy:** should untaught physical keys make their gap glow briefly?
5. **Joy:** approve a single wooden-tile mock before the full set is styled.
6. **Joy:** on 360px phones the full Chapter 1 board means keys about 33px wide (48px tall). Fine, or drop the side gutter for the keyboard?
