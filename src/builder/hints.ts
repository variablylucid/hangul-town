// Block builder hints. Wording is Tess's (teaching) with Joy's warmth; change
// only with their sign-off.
//
// Each hint knows which slot it is about (that slot gets a soft pulsing
// outline) and, where it applies, which tray key to glow. `audio` lists what
// will play once the audio task exists; until then only `text` shows.
// Never attach English endings to Korean words in hint text.
import type { Block, PlaceFailure, Slot } from '../hangul/syllable';
import { compose, decompose } from '../hangul/syllable';

export type Hint = {
  text: string;
  /** Tess's shorter wording, used when `text` would wrap past 2 lines. */
  short?: string;
  /** The slot the hint is about. */
  about?: Slot;
  /** A tray letter to glow, e.g. ㅇ for the quiet-ㅇ hint. */
  glowKey?: string;
  /** Syllables to play, in order, once audio exists (e.g. target then yours). */
  audio?: string[];
  /** 'note' teaches something new rather than correcting a miss. */
  kind: 'hint' | 'note';
};

const hint = (text: string, about?: Slot, extra: Partial<Hint> = {}): Hint => ({ text, about, kind: 'hint', ...extra });

/** Shown once, the first time a flat vowel appears. */
export const SHAPE_NOTE: Hint = { text: 'Tall vowels stand to the right. Flat vowels lie underneath.', about: 'vowel', kind: 'note' };

/** When a tapped letter can't be placed. */
export function tapHint(reason: PlaceFailure, letter: string): Hint | null {
  switch (reason) {
    case 'needs-initial':
      return hint('Every block starts with a consonant. For a vowel sound, put ㅇ first.', 'initial', {
        glowKey: 'ㅇ',
        short: 'Blocks start with a consonant. For a vowel sound, start with ㅇ.',
      });
    case 'floor-too-early':
      return hint('Floor letters come last. Start with a consonant and a vowel.', 'final');
    case 'vowel-on-floor':
      return hint('Only consonants sit on the floor, never vowels.', 'final');
    case 'no-final-here': // lessons 1–3: floors aren't taught yet
      return hint('No floors yet. Consonant + vowel is a full block. Cast!');
    case 'cannot-be-final':
      return hint(`${letter} never sits on the floor.`, 'final');
    case 'block-full':
      return hint('This block is full. Tap a letter in it to swap it out.');
    case 'not-a-letter':
      return null;
  }
}

/** When the first consonant has been taken out but other letters remain. Never names any other letter. */
export function missingInitialHint(removed: string | undefined): Hint {
  return removed === 'ㅇ'
    ? hint('Every block needs a first consonant. Put ㅇ back.', 'initial', { glowKey: 'ㅇ' })
    : hint('Every block needs a first consonant. Pick one.', 'initial');
}

/**
 * Known vowel pairs (Tess and Lina), checked in both directions. Key: the two
 * vowels sorted.
 */
const VOWEL_PAIRS: Record<string, string> = {
  'ㅓㅗ': 'ㅗ rounds the lips; ㅓ doesn’t.',
  'ㅏㅓ': 'ㅏ drops the jaw wide; ㅓ opens halfway.',
  'ㅗㅜ': 'Both are round. ㅜ is tighter and pushed forward.',
  'ㅜㅡ': 'ㅡ spreads the lips; ㅜ rounds them.',
  'ㅡㅣ': 'Both spread. ㅣ pushes the tongue forward, like ‘see’.',
};

export function vowelPairLine(a: string | undefined, b: string | undefined): string | undefined {
  if (!a || !b) return undefined;
  return VOWEL_PAIRS[[a, b].sort().join('')];
}

/**
 * After a wrong Cast, for the first wrong slot in reading order. Vowel hints
 * have two parts: the audio contrast first ("Listen: [target] / [yours].",
 * played once audio exists), then the text.
 */
export function castHint(slot: Slot, built: Block, target: string): Hint {
  switch (slot) {
    case 'initial':
      return hint('Almost! Listen again for how it begins.', 'initial', { audio: [target] });
    case 'final':
      return hint('Good start. Listen to how it ends.', 'final', { audio: [target] });
    case 'vowel': {
      const yours = compose(built);
      const line = vowelPairLine(decompose(target)?.vowel, built.vowel) ?? 'Watch Grandma’s lips.';
      return hint(line, 'vowel', { audio: yours ? [target, yours] : [target] });
    }
  }
}

/** When a committed name or inscription is a blocked word standing alone (isBlockedInscription). */
export const INSCRIPTION_BLOCKED_HINT: Hint = { text: 'Let’s try a different letter here.', kind: 'hint' };

export const END_MESSAGE = 'All three spells cast! Grandma would be proud.';
