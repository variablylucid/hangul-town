import { describe, expect, it } from 'vitest';
import { canBeFinal, compose, decompose, diff, place, remove, vowelShape, type Block } from './syllable';

const build = (letters: string[], allowFinal = true): Block =>
  letters.reduce<Block>((b, l) => {
    const r = place(b, l, { allowFinal });
    if (!r.ok) throw new Error(`${l}: ${r.reason}`);
    return r.block;
  }, {});

describe('compose', () => {
  it('builds the demo syllables', () => {
    expect(compose(build(['ㅇ', 'ㅏ']))).toBe('아');
    expect(compose(build(['ㅇ', 'ㅗ']))).toBe('오');
    expect(compose(build(['ㅁ', 'ㅜ', 'ㄴ']))).toBe('문');
  });

  it('builds every approved-word syllable from its letters', () => {
    for (const s of '아이오모마어머나너누무니엄언안문눈몸응엉멍녕우유여야옹냠요뇨네내애메뉴') {
      expect(compose(decompose(s)!)).toBe(s);
    }
  });

  it('needs an initial and a vowel', () => {
    expect(compose({})).toBeNull();
    expect(compose({ initial: 'ㅇ' })).toBeNull();
    expect(compose({ vowel: 'ㅏ' })).toBeNull();
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

describe('place', () => {
  it('puts a vowel tapped first in the vowel slot, leaving the initial empty', () => {
    const r = place({}, 'ㅏ', { allowFinal: true });
    expect(r).toMatchObject({ ok: true, slot: 'vowel', block: { vowel: 'ㅏ' } });
  });

  it('fills the initial after a vowel tapped first', () => {
    expect(compose(build(['ㅏ', 'ㅇ']))).toBe('아');
  });

  it('replaces the initial until a vowel is placed', () => {
    const r = place({ initial: 'ㅁ' }, 'ㄴ', { allowFinal: true });
    expect(r).toMatchObject({ ok: true, slot: 'initial', replaced: 'ㅁ', block: { initial: 'ㄴ' } });
  });

  it('replaces the vowel', () => {
    const r = place({ initial: 'ㅇ', vowel: 'ㅏ' }, 'ㅓ', { allowFinal: false });
    expect(r).toMatchObject({ ok: true, slot: 'vowel', replaced: 'ㅏ' });
  });

  it('puts a consonant after the vowel in the final slot', () => {
    expect(place({ initial: 'ㅁ', vowel: 'ㅜ' }, 'ㄴ', { allowFinal: true })).toMatchObject({ ok: true, slot: 'final' });
  });

  it('refuses a final when finals are not taught yet', () => {
    expect(place({ initial: 'ㅁ', vowel: 'ㅜ' }, 'ㄴ', { allowFinal: false })).toEqual({ ok: false, reason: 'no-final-here' });
  });

  it('refuses ㄸ ㅃ ㅉ as finals', () => {
    expect(canBeFinal('ㄸ')).toBe(false);
    expect(place({ initial: 'ㅁ', vowel: 'ㅜ' }, 'ㄸ', { allowFinal: true })).toEqual({ ok: false, reason: 'cannot-be-final' });
  });

  it('ignores anything that is not a hangul letter', () => {
    expect(place({}, 'a', { allowFinal: true })).toEqual({ ok: false, reason: 'not-a-letter' });
  });
});

describe('remove', () => {
  it('empties one slot', () => {
    expect(remove({ initial: 'ㅁ', vowel: 'ㅜ', final: 'ㄴ' }, 'final')).toEqual({ initial: 'ㅁ', vowel: 'ㅜ' });
  });

  it('takes the final with the vowel', () => {
    expect(remove({ initial: 'ㅁ', vowel: 'ㅜ', final: 'ㄴ' }, 'vowel')).toEqual({ initial: 'ㅁ' });
  });
});

describe('vowelShape', () => {
  it('knows where each prototype vowel sits', () => {
    for (const v of 'ㅏㅓㅣㅑㅕㅐㅔ') expect(vowelShape(v)).toBe('vertical');
    for (const v of 'ㅗㅜㅡㅛㅠ') expect(vowelShape(v)).toBe('horizontal');
    expect(vowelShape('ㅘ')).toBe('mixed');
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
