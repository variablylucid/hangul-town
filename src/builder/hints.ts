// Block builder hints. Wording is Tess's (teaching) with Joy's warmth; change
// only with their sign-off. Every hint will also play audio once the audio
// task exists.
import type { PlaceFailure, Slot } from '../hangul/syllable';

/** After a wrong Cast, for the first wrong slot in reading order. */
export const CAST_HINTS: Record<Slot, string> = {
  initial: 'Almost! Listen again for how it begins.',
  vowel: 'Listen once more. Which vowel is in the middle?',
  final: 'Good start. Listen to how it ends.',
};

/**
 * Known vowel pairs get named instead of the general vowel hint. Key: the two
 * vowels in either order. Tess to add the other lesson pairs (아/어, 오/우,
 * 으/우, 으/이 in content/lessons.json).
 */
const VOWEL_PAIRS: Record<string, string> = {
  'ㅓㅗ': 'Listen once more. ㅗ rounds the lips; ㅓ doesn’t.',
};

export function vowelHint(built: string | undefined, target: string | undefined): string {
  const key = [built, target].sort().join('');
  return VOWEL_PAIRS[key] ?? CAST_HINTS.vowel;
}

/** When a tap can't be placed. */
export const TAP_HINTS: Partial<Record<PlaceFailure, string>> = {
  'needs-initial': 'Every block starts with a consonant. For a vowel sound, put the quiet ㅇ first.',
  'floor-too-early': 'Floor letters come last. Start with a consonant and a vowel.',
  'vowel-on-floor': 'Only consonants sit on the floor, never vowels.',
  // DRAFT (not from Tess's list): for Tess to confirm.
  'no-final-here': 'This block has no floor yet.',
  'cannot-be-final': 'That letter can’t sit on the floor.',
  'block-full': 'This block is full. Tap a letter in it to take it out.',
};

/** When the player puts a vowel in the wrong position. */
export function positionHint(vowel: string, belongs: 'right' | 'below'): string {
  return belongs === 'right' ? `${vowel} is tall, so it goes on the right.` : `${vowel} is flat, so it goes below.`;
}

/** When the first consonant has been taken out but other letters remain. */
export function missingInitialHint(removed: string | undefined): string {
  return removed === 'ㅇ'
    ? 'Every block needs a first consonant. Put ㅇ back to start it.'
    : // DRAFT fallback when the removed letter wasn't ㅇ: for Tess to confirm.
      'Every block needs a first consonant.';
}

export const END_MESSAGE = 'All three spells cast! Halmeoni would be proud.';
