# Plan: on-screen Korean keyboard

Status: **plan, with the team's answers folded in. Not built yet.** Cody's estimate was 12–20 hours; the answers below add work (see section 8).

*You should see (once built):* at name entry (end of L6), typing 박은우 and getting the right blocks; from L7, typing 물 and 이불.

## When it appears (Tess)

- The keyboard first appears at **name entry**, at the end of L6, and is the **default input from L7**.
- The **block frame stays visible above it** permanently, showing where each letter goes.
- The **tap-to-build tray stays as a toggle** until the player's typing reaches **80% first-attempt accuracy**.

## Rules from the team

- Show only taught keys, each in its real **2-beolsik** position, so the keyboard grows outward into the full layout. Untaught positions are an **open gap**, not blank keys.
- Keys are **carved wooden tiles** that **click into place** when taught.
- On phones, keys may shrink as rows fill, but **never move relative to each other**.
- On desktop, **physical keys light their tile**.
- **Never focus a real text field on phones** (no system keyboard).
- **Typing behaves exactly like a real Korean keyboard** (Lina): nothing is blocked or held back while typing.
- Same as the block builder: hints in the speech tag above the blocks; no red, no shake, no error sound; same Cast, seal and smoke; same first-Cast rating rule.
- Never label any key or letter with English letters.

## 1. Layout: real positions, growing by lesson

Chapter 1 uses 13 keys. Positions are standard 2-beolsik (the physical QWERTY key is given only for the code; it is never shown):

| Row | Keys used in Chapter 1 |
| --- | --- |
| Top | ㅂ (Q) · · ㄱ (R) |
| Home | ㅁ (A) ㄴ (S) ㅇ (D) ㄹ (F) · ㅗ (H) ㅓ (J) ㅏ (K) ㅣ (L) |
| Bottom | ㅜ (N) ㅡ (M) |

How it grows by lesson (`·` = open gap; the keyboard itself appears at name entry, but the board already holds every letter taught so far):

```
L1                  home:  · · ㅇ · · ㅗ ㅓ ㅏ ㅣ      bottom: ㅜ ㅡ
L2  + ㅁ (A)        home:  ㅁ · ㅇ · · ㅗ ㅓ ㅏ ㅣ
L3  + ㄴ (S)        home:  ㅁ ㄴ ㅇ · · ㅗ ㅓ ㅏ ㅣ
L4  + ㅂ (Q)        top:   ㅂ
L5  + ㄱ (R)        top:   ㅂ · · ㄱ
L6  (name entry; finals use the same keys)
L7  + ㄹ (F)        home:  ㅁ ㄴ ㅇ ㄹ · ㅗ ㅓ ㅏ ㅣ
```

- Each key has a fixed grid coordinate (column and row, with the real row stagger). One table in `src/keyboard/layout.ts`; which letters are taught comes from `content/lessons.json`, like the block builder.
- The base game adds the rest of the 2-beolsik layout (and Shift for ㅃ ㅉ ㄸ ㄲ ㅆ ㅒ ㅖ) without moving any key above.

## 2. Look and feel (Joy approved the mock)

- **Tile:** warm honey or maple wood with a very faint grain; the letter **carved and filled with dark ink, like a woodblock print**, in Pretendard 550. Legibility first: the ink must pass WCAG AA contrast on the wood.
- **Pressed:** the tile sinks about 2px, its shadow shrinks, and it gets a warm glow. Physical keys on desktop do the same.
- **Letter preview:** a pop-up of the letter above the finger while it's down, like phone keyboards.
- **Taught keys click into place:** the tile drops into its gap with a small settle (a wooden click sound later). Reduced motion: it simply appears.
- **Gaps:** untaught positions draw nothing.
- **First step: one tile mock, checked on a real phone** before the full set is styled.

## 3. Sizing on phones (Joy)

- Coordinates never change; the board is **scaled uniformly** to fit the width of the taught area, so keys only shrink when a new column appears.
- On **narrow screens** (by screen width, not lesson), the keyboard **drops the 16px side gutter** and keeps **4–6px** edge padding. On a 360px phone the full Chapter 1 home row (nine positions, A to L) then gets about 36px per key; keys stay at least 48px tall.
- When the board rescales, keys glide to their new size. Reduced motion: no glide.

## 4. Input

- **Taps:** each tile is a `<button>`; the typed blocks render in an ordinary `<div>`, never an `<input>` or `contenteditable`, so phones never open the system keyboard. An `aria-live` region reads out finished syllables.
- **Desktop physical keys:** `keydown` on the page while the keyboard is open, mapped by `event.code` (`KeyD`, `KeyH` …), the physical key, whatever the computer's keyboard language is. Mapped keys light their tile and type; `Backspace` takes out the last letter; `Enter` casts. Shift is ignored in Chapter 1.
- **Untaught physical keys** (Gabe and Joy): the key types nothing; its gap **shimmers faintly for about 0.3s**, with no sound, never revealing the letter, and **throttled** so mashing doesn't strobe. After **3 presses of the same untaught key**: “Grandma hasn’t taught this one yet.”
- **The computer's own Korean input is on:** if keys arrive as finished hangul or IME composition (`event.isComposing`, `key === 'Process'`) instead of plain key codes, tell the player to switch their keyboard to English. *Wording needed from Tess.*

## 5. Typing engine

A small composition engine in `src/keyboard/compose.ts`, built on `src/hangul/syllable.ts` so typing and building share one set of rules:

- Letters join in reading order: consonant → vowel → floor.
- **Final consonant jumps:** a consonant after a vowel sits on the floor; if a vowel follows, it jumps to start the next block (typing ㅇ ㅏ ㄴ ㅣ gives 안, then 아니). To keep it on the floor, the next block starts with ㅇ (밥이). The **first time** it happens, show: “A vowel needs a first consonant, so ㄴ moved over.” (with the actual letter), and save to the codex: “To keep ㄴ on the floor, start the next block with ㅇ.”
- **Backspace** removes the last letter typed, so 아니 → 안 (the ㄴ goes back to the floor), as on real Korean keyboards.
- **Compound vowels and double finals** (ㅘ, ㄺ …) aren't in Chapter 1; their keys don't exist yet.
- **Blocklist (Lina):** no blocking while typing. Only when a name or spell inscription is **committed**, `isBlockedInscription` (already in `src/hangul/syllable.ts`) rejects 년 or 놈 standing alone; they're fine inside longer words. Hint: “Let’s try a different letter here.”
- **Checking it:** es-hangul's `assemble` already does this joining, so the tests type every Chapter 1 practice word letter by letter and compare. We keep our own engine to know exactly when a floor jumps (for the hint) and to enforce taught letters. es-hangul's `romanize` is never used.

## 6. With the block builder

- The block frame above the keyboard shows the block being typed, slot by slot, using the builder's layout and styles.
- The builder's tray is a toggle (“Tap to build”) until first-attempt typing accuracy reaches 80%; then the toggle goes away. Accuracy is counted per typed word on its first Cast, using the same rule as the review rating.

## 7. Testing

- **Unit:** the layout table (each letter's 2-beolsik position; growth by lesson); the engine against es-hangul on every practice word and the four names; floor jumps and the first-time hint; Backspace; `event.code` mapping; untaught-key throttle and 3-press message; IME detection; `isBlockedInscription` on commit.
- **In the browser:** the board for each lesson at 360, 375 and 412px (no overlap, no sideways scroll, relative positions unchanged between lessons, gutter dropped on narrow screens); typing 박은우, 물 and 이불 by tapping and by physical keys; the letter preview; reduced motion.
- **Real phones:** the tile mock first, then the full keyboard on iPhone Safari and Android Chrome (no system keyboard appears).

## 8. Steps and estimate

| Step | Hours |
| --- | --- |
| 1. One wooden tile mock, checked on a real phone | 1–2 |
| 2. Layout table and a static board for any lesson | 2–3 |
| 3. Scaling, narrow-screen gutter, growth between lessons | 1–2 |
| 4. Typing engine and tests (floor jumps, Backspace, commit check) | 3–5 |
| 5. Tap input, letter preview, physical keys and lighting | 2–3 |
| 6. Untaught-key shimmer and message, Korean-input detection | 1–2 |
| 7. Full tile set, click-into-place, reduced motion | 1–2 |
| 8. Hints and codex note, tray toggle and 80% rule, name entry demo | 2–3 |
| 9. Browser and phone testing, polish | 1–2 |
| **Total** | **14–24** |

The team's answers added the letter preview, the untaught-key behaviour, Korean-input detection, the tray toggle and the codex note, so the range is about 2–4 hours above Cody's 12–20. *For Cody to confirm.*

## Still open

1. **Tess:** wording for “switch your keyboard to English” when the computer's Korean input is on.
2. **Tess:** does the 80% first-attempt accuracy count over all typed words, or the last N?
