import { describe, expect, it } from 'vitest';
import { canBeFinal, compose, decompose, diff, place, remove, vowelPositions, vowelShape, type Block } from './syllable';

const build = (letters: string[], allowFinal = true): Block =>
  letters.reduce<Block>((b, l) => {
    const r = place(b, l, { allowFinal });
    if (!r.ok) throw new Error(`${l}: ${r.reason}`);
    return r.block;
  }, {});

const opts = { allowFinal: true };

describe('compose', () => {
  it('builds the demo syllables', () => {
    expect(compose(build(['ㅇ', 'ㅏ']))).toBe('아');
    expect(compose(build(['ㅇ', 'ㅗ']))).toBe('오');
    expect(compose(build(['ㅁ', 'ㅜ', 'ㄴ']))).toBe('문');
  });

  it('builds every approved-word syllable from its letters, in reading order', () => {
    for (const s of '아이오모마어머나너누무니엄언안문눈몸응엉멍녕우유여야옹냠요뇨네내애메뉴') {
      const { initial, vowel, final } = decompose(s)!;
      expect(compose(build([initial!, vowel!, ...(final ? [final] : [])]))).toBe(s);
    }
  });

  it('needs a first consonant and a vowel', () => {
    expect(compose({})).toBeNull();
    expect(compose({ initial: 'ㅇ' })).toBeNull();
    expect(compose({ vowel: 'ㅏ' })).toBeNull();
    expect(compose({ initial: 'ㅁ', final: 'ㄴ' })).toBeNull();
  });

  it('covers the first and last syllables', () => {
    expect(compose({ initial: 'ㄱ', vowel: 'ㅏ' })).toBe('가');
    expect(compose({ initial: 'ㅎ', vowel: 'ㅣ', final: 'ㅎ' })).toBe('힣');
  });
});

describe('decompose', () => {
  it('splits syllables into slots', () => {
    expect(decompose('문')).toEqual({ initial: 'ㅁ', vowel: 'ㅜ', final: 'ㄴ' });
    expect(decompose('아')).toEqual({ initial: 'ㅇ', vowel: 'ㅏ' });
  });

  it('rejects non-syllables', () => {
    expect(decompose('ㅏ')).toBeNull();
    expect(decompose('a')).toBeNull();
    expect(decompose('')).toBeNull();
  });
});

describe('place (reading order)', () => {
  it('ㅇ tapped first is the silent start; ㅇ after a vowel goes to the floor', () => {
    expect(build(['ㅇ', 'ㅏ', 'ㅇ'])).toEqual({ initial: 'ㅇ', vowel: 'ㅏ', final: 'ㅇ' });
    expect(compose(build(['ㅇ', 'ㅏ', 'ㅇ']))).toBe('앙');
  });

  it('refuses a vowel before the first consonant', () => {
    expect(place({}, 'ㅏ', opts)).toEqual({ ok: false, reason: 'needs-initial' });
  });

  it('refuses a vowel when only the vowel is left after the first consonant was taken out', () => {
    expect(place({ vowel: 'ㅏ' }, 'ㅓ', opts)).toEqual({ ok: false, reason: 'needs-initial' });
  });

  it('refuses a floor consonant before the vowel', () => {
    expect(place({ initial: 'ㅁ' }, 'ㄴ', opts)).toEqual({ ok: false, reason: 'floor-too-early' });
  });

  it('refuses a second vowel: only consonants sit on the floor', () => {
    expect(place({ initial: 'ㅇ', vowel: 'ㅏ' }, 'ㅓ', opts)).toEqual({ ok: false, reason: 'vowel-on-floor' });
  });

  it('refuses a final when finals are not taught yet', () => {
    expect(place({ initial: 'ㅁ', vowel: 'ㅜ' }, 'ㄴ', { allowFinal: false })).toEqual({ ok: false, reason: 'no-final-here' });
  });

  it('refuses ㄸ ㅃ ㅉ as finals', () => {
    expect(canBeFinal('ㄸ')).toBe(false);
    expect(place({ initial: 'ㅁ', vowel: 'ㅜ' }, 'ㄸ', opts)).toEqual({ ok: false, reason: 'cannot-be-final' });
  });

  it('never replaces a letter in a full block', () => {
    expect(place({ initial: 'ㅁ', vowel: 'ㅜ', final: 'ㄴ' }, 'ㅁ', opts)).toEqual({ ok: false, reason: 'block-full' });
  });

  it('refills a taken-out first consonant even when the vowel and floor stay', () => {
    expect(place({ vowel: 'ㅜ', final: 'ㄴ' }, 'ㅁ', opts)).toEqual({ ok: true, slot: 'initial', block: { initial: 'ㅁ', vowel: 'ㅜ', final: 'ㄴ' } });
  });

  it('ignores anything that is not a hangul letter', () => {
    expect(place({}, 'a', opts)).toEqual({ ok: false, reason: 'not-a-letter' });
  });
});

describe('blocklist', () => {
  it('never lets the player build 년 or 놈, in any order', () => {
    expect(place({ initial: 'ㄴ', vowel: 'ㅗ' }, 'ㅁ', opts)).toEqual({ ok: false, reason: 'blocked' });
    expect(place({ initial: 'ㄴ', vowel: 'ㅕ' }, 'ㄴ', opts)).toEqual({ ok: false, reason: 'blocked' });
    // Putting the first consonant back after taking it out.
    expect(place({ vowel: 'ㅗ', final: 'ㅁ' }, 'ㄴ', opts)).toEqual({ ok: false, reason: 'blocked' });
  });

  it('still allows the open syllables and other floors', () => {
    expect(place({ initial: 'ㄴ', vowel: 'ㅗ' }, 'ㄴ', opts)).toMatchObject({ ok: true });
    expect(compose({ initial: 'ㄴ', vowel: 'ㅗ' })).toBe('노');
  });
});

describe('remove', () => {
  it('takes out only that letter', () => {
    const mun = { initial: 'ㅁ', vowel: 'ㅜ', final: 'ㄴ' };
    expect(remove(mun, 'initial')).toEqual({ vowel: 'ㅜ', final: 'ㄴ' });
    expect(remove(mun, 'vowel')).toEqual({ initial: 'ㅁ', final: 'ㄴ' });
    expect(remove(mun, 'final')).toEqual({ initial: 'ㅁ', vowel: 'ㅜ' });
  });
});

describe('vowel shape and position', () => {
  it('knows where each prototype vowel sits', () => {
    for (const v of 'ㅏㅓㅣㅑㅕㅐㅔ') {
      expect(vowelShape(v)).toBe('vertical');
      expect(vowelPositions(v)).toEqual(['right']);
    }
    for (const v of 'ㅗㅜㅡㅛㅠ') {
      expect(vowelShape(v)).toBe('horizontal');
      expect(vowelPositions(v)).toEqual(['below']);
    }
    expect(vowelPositions('ㅘ')).toEqual(['right', 'below']);
  });
});

describe('diff', () => {
  it('names the slots that differ', () => {
    expect(diff({ initial: 'ㅇ', vowel: 'ㅏ' }, '아')).toEqual([]);
    expect(diff({ initial: 'ㅇ', vowel: 'ㅓ' }, '아')).toEqual(['vowel']);
    expect(diff({ initial: 'ㅁ', vowel: 'ㅜ' }, '문')).toEqual(['final']);
    expect(diff({ initial: 'ㄴ', vowel: 'ㅜ', final: 'ㄴ' }, '문')).toEqual(['initial']);
  });
});
