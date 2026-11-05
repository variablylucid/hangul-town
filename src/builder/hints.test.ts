import { describe, expect, it } from 'vitest';
import { castHint, END_MESSAGE, missingInitialHint, tapHint, vowelPairLine } from './hints';

describe('vowel pairs', () => {
  it('names every known pair in both directions', () => {
    const pairs: [string, string][] = [['ㅗ', 'ㅓ'], ['ㅏ', 'ㅓ'], ['ㅗ', 'ㅜ'], ['ㅡ', 'ㅜ'], ['ㅡ', 'ㅣ']];
    for (const [a, b] of pairs) {
      expect(vowelPairLine(a, b)).toBeTruthy();
      expect(vowelPairLine(b, a)).toBe(vowelPairLine(a, b));
    }
  });

  it('uses the pair line for a known pair, with the audio contrast target first', () => {
    expect(castHint('vowel', { initial: 'ㅇ', vowel: 'ㅓ' }, '오')).toMatchObject({
      text: 'ㅗ rounds the lips; ㅓ doesn’t.',
      about: 'vowel',
      audio: ['오', '어'],
    });
    expect(castHint('vowel', { initial: 'ㅇ', vowel: 'ㅗ' }, '어').text).toBe('ㅗ rounds the lips; ㅓ doesn’t.');
  });

  it('falls back to watching Grandma’s lips for other vowel misses', () => {
    expect(castHint('vowel', { initial: 'ㅇ', vowel: 'ㅣ' }, '오')).toMatchObject({ text: 'Watch Grandma’s lips.', audio: ['오', '이'] });
  });
});

describe('tap hints', () => {
  it('glows ㅇ in the tray for the quiet-ㅇ hint, with Tess’s shorter fallback', () => {
    expect(tapHint('needs-initial', 'ㅏ')).toEqual({
      text: 'Every block starts with a consonant. For a vowel sound, put ㅇ first.',
      short: 'Blocks start with a consonant. For a vowel sound, start with ㅇ.',
      about: 'initial',
      glowKey: 'ㅇ',
      kind: 'hint',
    });
  });

  it('fills in the letter that can’t sit on the floor', () => {
    expect(tapHint('cannot-be-final', 'ㄸ')!.text).toBe('ㄸ never sits on the floor.');
  });
});

describe('missing first consonant', () => {
  it('asks for ㅇ back only when ㅇ was taken out', () => {
    expect(missingInitialHint('ㅇ').text).toBe('Every block needs a first consonant. Put ㅇ back to start it.');
    expect(missingInitialHint('ㅁ').text).toBe('Every block needs a first consonant. Choose one from the tray.');
    expect(missingInitialHint('ㅁ').text).not.toContain('ㅁ');
  });
});

describe('wording rules', () => {
  it('never writes 할머니 in English letters', () => {
    expect(END_MESSAGE).toBe('All three spells cast! Grandma would be proud.');
    expect(END_MESSAGE.toLowerCase()).not.toContain('halmeoni');
  });
});
