// Hangul block builder: tap letters in the tray and they fly into a syllable
// frame, in reading order: first consonant, then vowel, then floor.
//
//   - Before a vowel, the frame shows the first-consonant slot, faint outlines
//     of both vowel positions (right and below) and the full-width floor.
//   - Tapping a vowel holds it just above the frame while both positions glow; the
//     player taps where it goes. After enough correct placements in a row the
//     builder places vowels itself.
//   - While building, each letter sits in its own softly glowing slot in the
//     real layout. Only Cast fuses them into the finished syllable.
//
// DOM/CSS (not Phaser) because it lives in the close-up view.
import './block-builder.css';
import {
  compose,
  decompose,
  diff,
  place,
  remove,
  vowelPositions,
  vowelShape,
  type Block,
  type Slot,
  type VowelPosition,
} from '../hangul/syllable';
import { CAST_HINTS, TAP_HINTS, missingInitialHint, positionHint, vowelHint } from './hints';

export type BuilderState = {
  block: Block;
  /** True when Cast can be pressed: a first consonant and a placed vowel. */
  canCast: boolean;
  /** True after a successful Cast, until reset(). */
  complete: boolean;
};

export type BlockBuilderOptions = {
  /** Letters in the tray. Only taught letters, in teaching order. */
  letters: string[];
  /** Whether final consonants are taught yet (lesson 4 on). */
  allowFinal: boolean;
  /** Correct vowel placements in a row before vowels place themselves. */
  autoPlaceAfter?: number;
  /** Correct placements already made (carry over between builders). */
  placementStreak?: number;
  onChange?: (state: BuilderState) => void;
  /** A hint to show (null clears it). Each hint will also play audio later. */
  onHint?: (hint: string | null) => void;
};

export type CastResult = { correct: boolean; wrong: Slot[] };

const SLOTS: Slot[] = ['initial', 'vowel', 'final'];
const POSITIONS: VowelPosition[] = ['right', 'below'];
type Rect = [left: number, top: number, width: number, height: number]; // % of the frame
type Layout = Partial<Record<Slot | VowelPosition, Rect>>;

/** Slot regions. The floor always spans the full width at the bottom. */
function layout(shape: 'open' | 'vertical' | 'horizontal' | 'mixed', floor: boolean): Layout {
  const final: Rect = [4, 72, 92, 24];
  if (floor) {
    switch (shape) {
      case 'open':
        return { initial: [4, 4, 50, 42], right: [58, 4, 38, 42], below: [4, 50, 50, 18], final };
      case 'horizontal':
        return { initial: [4, 4, 92, 38], vowel: [4, 44, 92, 24], final };
      default: // vertical; mixed vowels (ㅘ…) aren't in the prototype yet and borrow this
        return { initial: [4, 4, 52, 64], vowel: [58, 4, 38, 64], final };
    }
  }
  switch (shape) {
    case 'open':
      return { initial: [4, 4, 50, 52], right: [58, 4, 38, 52], below: [4, 60, 50, 36] };
    case 'horizontal':
      return { initial: [4, 4, 92, 52], vowel: [4, 60, 92, 36] };
    default:
      return { initial: [4, 4, 52, 92], vowel: [58, 4, 38, 92] };
  }
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finished = (a: Animation) => new Promise<void>((done) => ((a.onfinish = a.oncancel = () => done()), undefined));

const UNDO_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M9 14 4 9l5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class BlockBuilder {
  readonly el: HTMLElement;
  private block: Block = {};
  /** A tapped vowel waiting for the player to choose its position. */
  private pending: string | null = null;
  private history: Slot[] = [];
  private lastRemovedInitial: string | undefined;
  private check: Slot | null = null;
  private complete = false;
  private busy = false;
  private landing: Slot | 'held' | null = null;
  private streak: number;
  private readonly autoPlaceAfter: number;

  private readonly frame: HTMLElement;
  private readonly composed: HTMLElement;
  private readonly held: HTMLElement;
  private readonly slots: Record<Slot, HTMLElement>;
  private readonly pieces: Record<Slot, HTMLElement>;
  private readonly positions: Record<VowelPosition, HTMLElement>;

  constructor(private readonly opts: BlockBuilderOptions) {
    this.streak = opts.placementStreak ?? 0;
    this.autoPlaceAfter = opts.autoPlaceAfter ?? 3;
    this.el = document.createElement('div');
    this.el.className = 'bb';
    this.el.innerHTML = `
      <div class="bb-hand"><span class="bb-held lesson-letter" aria-live="polite"></span></div>
      <div class="bb-frame" role="group" aria-label="Syllable block">
        <div class="bb-bloom" aria-hidden="true"></div>
        ${POSITIONS.map((p) => `<button type="button" class="bb-pos" data-pos="${p}" aria-label="Put the vowel ${p === 'right' ? 'on the right' : 'below'}"></button>`).join('')}
        ${SLOTS.map((s) => `<button type="button" class="bb-slot" data-slot="${s}"><span class="bb-piece lesson-letter"></span></button>`).join('')}
        <div class="bb-composed lesson-letter" aria-live="polite"></div>
      </div>
      <div class="bb-tray" role="group" aria-label="Letters">
        ${opts.letters.map((l) => `<button type="button" class="bb-key lesson-letter" data-letter="${l}" aria-label="${l}">${l}</button>`).join('')}
      </div>
      <button type="button" class="bb-undo">${UNDO_ICON}<span>Undo</span></button>`;

    const q = <T extends HTMLElement>(sel: string) => this.el.querySelector<T>(sel)!;
    this.frame = q('.bb-frame');
    this.composed = q('.bb-composed');
    this.held = q('.bb-held');
    this.slots = Object.fromEntries(SLOTS.map((s) => [s, q(`.bb-slot[data-slot="${s}"]`)])) as Record<Slot, HTMLElement>;
    this.pieces = Object.fromEntries(SLOTS.map((s) => [s, this.slots[s].querySelector('.bb-piece')!])) as Record<Slot, HTMLElement>;
    this.positions = Object.fromEntries(POSITIONS.map((p) => [p, q(`.bb-pos[data-pos="${p}"]`)])) as Record<VowelPosition, HTMLElement>;

    q('.bb-tray').addEventListener('click', (e) => {
      const key = (e.target as HTMLElement).closest<HTMLElement>('.bb-key');
      if (key) this.tap(key.dataset.letter!, key);
    });
    for (const s of SLOTS) this.slots[s].addEventListener('click', () => this.tapSlot(s));
    for (const p of POSITIONS) this.positions[p].addEventListener('click', () => this.choose(p));
    q('.bb-undo').addEventListener('click', () => this.undo());
    this.render();
  }

  get placementStreak(): number {
    return this.streak;
  }

  getBlock(): Block {
    return { ...this.block };
  }

  reset(): void {
    this.block = {};
    this.pending = null;
    this.history = [];
    this.lastRemovedInitial = undefined;
    this.check = null;
    this.complete = false;
    this.render();
    this.hint(null);
    this.changed();
  }

  /** A tray letter, as if its key were tapped. */
  tap(letter: string, from?: HTMLElement): void {
    if (this.busy || this.complete) return;
    this.check = null;

    if (this.pending) {
      // Another vowel swaps the held one; a consonant just re-glows the choices.
      if (place({ ...this.block }, letter, this.opts).ok) {
        this.pending = letter;
        this.flyIn(letter, from, 'held');
      } else this.pulse(this.frame, 'bb-choose-again');
      return;
    }

    const r = place(this.block, letter, this.opts);
    if (!r.ok) {
      this.fizzle();
      if (r.reason === 'needs-initial') this.pulse(this.slots.initial, 'bb-nudge');
      this.hint(TAP_HINTS[r.reason] ?? null);
      return;
    }
    this.hint(null);

    if (r.slot === 'vowel' && this.streak < this.autoPlaceAfter) {
      this.pending = letter;
      this.flyIn(letter, from, 'held');
      return;
    }
    this.commit(r.block, r.slot, letter, from);
  }

  /** The player chooses where the held vowel goes. */
  choose(pos: VowelPosition): void {
    if (this.busy || !this.pending) return;
    const vowel = this.pending;
    const belongs = vowelPositions(vowel);
    if (!belongs.includes(pos)) {
      this.streak = 0;
      this.fizzle();
      this.hint(positionHint(vowel, belongs[0]));
      return;
    }
    this.streak++;
    this.pending = null;
    this.hint(null);
    this.commit({ ...this.block, vowel }, 'vowel', vowel, this.held);
  }

  undo(): void {
    if (this.busy || this.complete) return;
    if (this.pending) {
      this.pending = null;
      this.render();
      this.changed();
      return;
    }
    const last = this.history.at(-1);
    if (last) this.take(last);
  }

  /** Fuses the pieces and checks them against the target syllable. */
  async cast(target: string): Promise<CastResult> {
    if (this.busy || !this.canCast()) return { correct: false, wrong: [] };
    this.busy = true;
    const wrong = diff(this.block, target);
    if (!wrong.length) {
      this.hint(null);
      await this.fuse();
      this.complete = true;
      this.render();
    } else {
      await this.splitBack();
      this.check = wrong[0];
      this.render();
      this.hint(wrong[0] === 'vowel' ? vowelHint(this.block.vowel, decompose(target)?.vowel) : CAST_HINTS[wrong[0]]);
    }
    this.busy = false;
    this.changed();
    return { correct: !wrong.length, wrong };
  }

  fizzle(): void {
    this.pulse(this.frame, 'bb-fizzle');
  }

  // --- internals -------------------------------------------------------------

  private canCast(): boolean {
    return !this.pending && !this.complete && compose(this.block) !== null;
  }

  private tapSlot(slot: Slot): void {
    if (this.busy || this.complete) return;
    if (this.block[slot]) return this.take(slot);
    if (slot === 'final' && !this.block.vowel) {
      this.fizzle();
      this.hint(TAP_HINTS['floor-too-early']!);
    }
  }

  private take(slot: Slot): void {
    const letter = this.block[slot];
    if (!letter) return;
    if (slot === 'initial') this.lastRemovedInitial = letter;
    this.block = remove(this.block, slot);
    this.history = this.history.filter((s) => s !== slot);
    if (!this.block.initial) this.pending = null;
    this.check = null;
    this.render();
    const orphaned = !this.block.initial && (this.block.vowel || this.block.final);
    this.hint(orphaned ? missingInitialHint(this.lastRemovedInitial) : null);
    this.changed();
  }

  private commit(block: Block, slot: Slot, letter: string, from?: HTMLElement): void {
    this.block = block;
    this.history = [...this.history.filter((s) => s !== slot), slot];
    if (slot === 'initial') this.lastRemovedInitial = undefined;
    // Lay the frame out for the new shape first, so the letter flies to the right place.
    this.flyIn(letter, from, slot);
  }

  /** Flies a copy of `letter` from `from` to a slot (or the held spot); the target glows just before it lands. */
  private flyIn(letter: string, from: HTMLElement | undefined, to: Slot | 'held'): void {
    this.landing = to;
    this.render();
    const target = to === 'held' ? this.held : this.slots[to];
    const land = () => {
      target.classList.remove('bb-incoming');
      this.landing = null;
      this.render();
      this.pulse(target, 'bb-landed');
      this.changed();
    };
    if (!from || reducedMotion()) return land();

    const a = from.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const ghost = document.createElement('span');
    ghost.className = 'bb-flying lesson-letter';
    ghost.textContent = letter;
    ghost.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;font-size:${getComputedStyle(from).fontSize}`;
    document.body.appendChild(ghost);
    const scale = Math.max(0.6, Math.min(b.width / a.width, b.height / a.height, 2.5));
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = ghost.animate(
      [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx}px,${dy}px) scale(${scale})` }],
      { duration: 240, easing: 'cubic-bezier(.3,.7,.4,1)' },
    );
    setTimeout(() => target.classList.add('bb-incoming'), 110);
    finished(anim).then(() => {
      ghost.remove();
      land();
    });
  }

  /** Success: pieces slide together, an ink bloom, the finished block and a few petals. */
  private async fuse(): Promise<void> {
    if (reducedMotion()) return;
    const f = this.frame.getBoundingClientRect();
    const cx = f.left + f.width / 2;
    const cy = f.top + f.height / 2;
    const slides = SLOTS.filter((s) => this.block[s]).map((s) => {
      const r = this.pieces[s].getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2);
      const dy = cy - (r.top + r.height / 2);
      return this.pieces[s].animate(
        [{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.55)`, opacity: 0 }],
        { duration: 280, easing: 'ease-in', fill: 'forwards' },
      );
    });
    await Promise.all(slides.map(finished));
    this.el.querySelector<HTMLElement>('.bb-bloom')!.animate(
      [{ transform: 'scale(.2)', opacity: 0.9 }, { transform: 'scale(1.35)', opacity: 0 }],
      { duration: 650, easing: 'ease-out' },
    );
    this.complete = true;
    this.render();
    // Audio for the finished syllable plays here once the audio task exists.
    const appear = this.composed.animate(
      [{ transform: 'scale(.8)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 260, easing: 'cubic-bezier(.3,1.4,.5,1)' },
    );
    this.petals();
    slides.forEach((a) => a.cancel());
    await finished(appear);
  }

  private petals(): void {
    for (let i = 0; i < 7; i++) {
      const p = document.createElement('span');
      p.className = 'bb-petal';
      this.frame.appendChild(p);
      const angle = (i / 7) * Math.PI * 2 + Math.random() * 0.6;
      const dist = this.frame.clientWidth * (0.5 + Math.random() * 0.25);
      const a = p.animate(
        [
          { transform: 'translate(-50%,-50%) rotate(0deg) scale(.6)', opacity: 0 },
          { opacity: 1, offset: 0.2 },
          { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) rotate(${200 + Math.random() * 160}deg) scale(1)`, opacity: 0 },
        ],
        { duration: 900 + Math.random() * 300, easing: 'cubic-bezier(.2,.7,.4,1)' },
      );
      finished(a).then(() => p.remove());
    }
  }

  /** Wrong Cast: the pieces start to slide together, then split back apart. */
  private async splitBack(): Promise<void> {
    if (reducedMotion()) return;
    const f = this.frame.getBoundingClientRect();
    const cx = f.left + f.width / 2;
    const cy = f.top + f.height / 2;
    const anims = SLOTS.filter((s) => this.block[s]).map((s) => {
      const r = this.pieces[s].getBoundingClientRect();
      const dx = (cx - (r.left + r.width / 2)) * 0.35;
      const dy = (cy - (r.top + r.height / 2)) * 0.35;
      return this.pieces[s].animate(
        [{ transform: 'none' }, { transform: `translate(${dx}px,${dy}px) scale(.9)`, offset: 0.4 }, { transform: 'none' }],
        { duration: 420, easing: 'ease-in-out' },
      );
    });
    await Promise.all(anims.map(finished));
  }

  private render(): void {
    const b = this.block;
    const shape = b.vowel ? vowelShape(b.vowel) : 'open';
    const rects = layout(shape, this.opts.allowFinal);
    const f = this.frame.dataset;
    f.shape = shape;
    f.choosing = this.pending ? 'yes' : 'no';
    f.complete = this.complete ? 'yes' : 'no';
    f.floor = this.opts.allowFinal ? 'yes' : 'no';

    const place = (el: HTMLElement, r: Rect | undefined) => {
      el.hidden = !r;
      if (r) Object.assign(el.style, { left: `${r[0]}%`, top: `${r[1]}%`, width: `${r[2]}%`, height: `${r[3]}%` });
    };
    for (const s of SLOTS) {
      const el = this.slots[s];
      place(el, rects[s]);
      const letter = b[s];
      this.pieces[s].textContent = letter ?? '';
      el.dataset.filled = letter ? 'yes' : 'no';
      el.classList.toggle('bb-hidden-piece', this.landing === s);
      el.classList.toggle('bb-check', this.check === s);
      el.setAttribute('aria-label', letter ? `${letter}: tap to take it out` : s === 'initial' ? 'First consonant: empty' : s === 'vowel' ? 'Vowel: empty' : 'Floor: empty');
    }
    for (const p of POSITIONS) place(this.positions[p], rects[p]);
    // Pulse the empty first-consonant slot when other letters are waiting on it.
    this.slots.initial.classList.toggle('bb-wanted', !b.initial && !!(b.vowel || b.final));
    if (b.initial) this.slots.initial.classList.remove('bb-nudge');

    this.held.textContent = this.pending ?? '';
    this.held.classList.toggle('bb-hidden-piece', this.landing === 'held');
    this.composed.textContent = this.complete ? (compose(b) ?? '') : '';
  }

  private changed(): void {
    this.opts.onChange?.({ block: this.getBlock(), canCast: this.canCast() && !this.landing, complete: this.complete });
  }

  private hint(text: string | null): void {
    this.opts.onHint?.(text);
  }

  private pulse(el: HTMLElement, cls: string): void {
    el.classList.remove(cls);
    void el.offsetWidth; // restart the animation
    el.classList.add(cls);
    el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
  }
}
