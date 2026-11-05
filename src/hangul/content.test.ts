// Checks content/lessons.json against the teaching rules: every practice word
// uses only letters taught by its lesson, floors only once finals are taught,
// and no practice word is a blocked word.
import { describe, expect, it } from 'vitest';
import lessons from '../../content/lessons.json';
import { decompose, isBlockedInscription } from './syllable';

type Lesson = { id: string; type?: string; new_letters?: string[]; finals?: string[]; words?: string[]; uses?: string[] };
const all = lessons.lessons as Lesson[];

describe('content/lessons.json', () => {
  const taught = new Set<string>();
  const finals = new Set<string>();
  for (const lesson of all) {
    lesson.new_letters?.forEach((l) => taught.add(l));
    lesson.finals?.forEach((l) => finals.add(l));
    const snapshotTaught = new Set(taught);
    const snapshotFinals = new Set(finals);
    for (const word of [...(lesson.words ?? []), ...(lesson.uses ?? [])]) {
      it(`${lesson.id}: ${word} uses only taught letters`, () => {
        expect(isBlockedInscription(word)).toBe(false);
        for (const ch of word) {
          const b = decompose(ch);
          expect(b, `${ch} is a syllable`).not.toBeNull();
          expect(snapshotTaught.has(b!.initial!), `${ch}: first consonant ${b!.initial}`).toBe(true);
          expect(snapshotTaught.has(b!.vowel!), `${ch}: vowel ${b!.vowel}`).toBe(true);
          if (b!.final) expect(snapshotFinals.has(b!.final), `${ch}: floor ${b!.final}`).toBe(true);
        }
      });
    }
  }

  it('L1 tray is ㅇ ㅏ ㅓ ㅗ ㅜ ㅣ ㅡ', () => {
    expect(all[0].id).toBe('L1');
    expect((all[0] as { tray?: string[] }).tray).toEqual(['ㅇ', 'ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ', 'ㅡ']);
  });
});
