// Hangul syllable blocks: which letter goes in which slot, and composing the
// finished block into a real syllable character.
//
// A block has three slots:
//   initial  the first consonant (silent ㅇ when the syllable starts with a vowel)
//   vowel    sits to the right (vertical vowels) or below (horizontal vowels)
//   final    optional consonant underneath: the "floor" of the block

export const INITIALS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
export const VOWELS = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
// Index 0 is "no final".
export const FINALS = ' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';

const SYLLABLE_BASE = 0xac00;
const SYLLABLE_LAST = 0xd7a3;

export type Slot = 'initial' | 'vowel' | 'final';
export type Block = { initial?: string; vowel?: string; final?: string };

/** Where a vowel sits: right of the initial, below it, or both (e.g. ㅘ). */
export type VowelShape = 'vertical' | 'horizontal' | 'mixed';

const VERTICAL = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅣ';
const HORIZONTAL = 'ㅗㅛㅜㅠㅡ';

export function isVowel(letter: string): boolean {
  return letter.length === 1 && VOWELS.includes(letter);
}

export function isConsonant(letter: string): boolean {
  return letter.length === 1 && INITIALS.includes(letter);
}

/** ㄸ ㅃ ㅉ can start a syllable but never end one. */
export function canBeFinal(letter: string): boolean {
  return letter !== ' ' && letter.length === 1 && FINALS.includes(letter);
}

export function vowelShape(vowel: string): VowelShape {
  if (VERTICAL.includes(vowel)) return 'vertical';
  if (HORIZONTAL.includes(vowel)) return 'horizontal';
  return 'mixed';
}

/** The finished syllable, or null while the block is missing its initial or vowel. */
export function compose(block: Block): string | null {
  const { initial, vowel, final } = block;
  if (!initial || !vowel) return null;
  const i = INITIALS.indexOf(initial);
  const v = VOWELS.indexOf(vowel);
  const f = final ? FINALS.indexOf(final) : 0;
  if (i < 0 || v < 0 || f < 0 || (final && f === 0)) return null;
  return String.fromCharCode(SYLLABLE_BASE + (i * 21 + v) * 28 + f);
}

/** Splits a syllable character into its block. Returns null for anything else. */
export function decompose(syllable: string): Block | null {
  const code = syllable.charCodeAt(0);
  if (syllable.length !== 1 || code < SYLLABLE_BASE || code > SYLLABLE_LAST) return null;
  const n = code - SYLLABLE_BASE;
  const final = FINALS[n % 28].trim();
  return {
    initial: INITIALS[Math.floor(n / 588)],
    vowel: VOWELS[Math.floor((n % 588) / 28)],
    ...(final ? { final } : {}),
  };
}

/** Where the player puts a vowel: to the right of the first consonant, or below it. */
export type VowelPosition = 'right' | 'below';

/** The position(s) a vowel belongs in. Mixed vowels like ㅘ use both. */
export function vowelPositions(vowel: string): VowelPosition[] {
  const shape = vowelShape(vowel);
  return shape === 'vertical' ? ['right'] : shape === 'horizontal' ? ['below'] : ['right', 'below'];
}

export type PlaceFailure =
  | 'not-a-letter'
  | 'needs-initial' // a vowel before any first consonant
  | 'floor-too-early' // a consonant after the first consonant, before the vowel
  | 'vowel-on-floor' // a vowel once the vowel slot is full
  | 'no-final-here' // finals aren't taught yet
  | 'cannot-be-final' // ㄸ ㅃ ㅉ
  | 'block-full';

export type PlaceResult = { ok: true; block: Block; slot: Slot } | { ok: false; reason: PlaceFailure };

/**
 * Puts a tapped letter in the next empty slot, in reading order: first
 * consonant, then vowel, then floor. Nothing is ever replaced; to change a
 * letter the player taps it to take it out first. So ㅇ tapped first is the
 * silent start, and ㅇ tapped after a vowel goes to the floor (앙).
 */
export function place(block: Block, letter: string, opts: { allowFinal: boolean }): PlaceResult {
  if (isVowel(letter)) {
    if (!block.initial) return { ok: false, reason: 'needs-initial' };
    if (block.vowel) return { ok: false, reason: 'vowel-on-floor' };
    return { ok: true, block: { ...block, vowel: letter }, slot: 'vowel' };
  }
  if (!isConsonant(letter)) return { ok: false, reason: 'not-a-letter' };
  if (!block.initial) return { ok: true, block: { ...block, initial: letter }, slot: 'initial' };
  if (!block.vowel) return { ok: false, reason: 'floor-too-early' };
  if (!opts.allowFinal) return { ok: false, reason: 'no-final-here' };
  if (block.final) return { ok: false, reason: 'block-full' };
  if (!canBeFinal(letter)) return { ok: false, reason: 'cannot-be-final' };
  return { ok: true, block: { ...block, final: letter }, slot: 'final' };
}

/** Takes out one letter. The others stay where they are. */
export function remove(block: Block, slot: Slot): Block {
  const next = { ...block };
  delete next[slot];
  return next;
}

/** Which slots of `built` differ from the target syllable. Empty when they match. */
export function diff(built: Block, target: string): Slot[] {
  const t = decompose(target);
  if (!t) return ['initial', 'vowel', 'final'];
  return (['initial', 'vowel', 'final'] as Slot[]).filter((s) => (built[s] ?? '') !== (t[s] ?? ''));
}
