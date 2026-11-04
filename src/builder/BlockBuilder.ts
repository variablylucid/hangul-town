// Hangul block builder: tap letters in the tray and they fly into a syllable
// frame, in reading order: first consonant, then vowel, then floor.
//
//   - Before a vowel, the frame shows the first-consonant slot, faint outlines
//     of both vowel positions (right and below) and the full-width floor.
//   - Vowels place themselves with a visible slide: the vowel lands in the
//     middle of the frame, the frame reshapes, and the vowel slides right
//     (tall vowels) or drops below (flat vowels).
//   - While building, each letter sits in its own softly glowing slot in the
//     real layout. Only Cast fuses them into the finished syllable.
//   - Hints appear in a speech tag above the frame, never over a slot. The
//     slot a hint is about gets a soft pulsing outline. A hint stays until the
//     next tap. No red, no shake, no error sound.
//
// DOM/CSS (not Phaser) because it lives in the close-up view.
import './block-builder.css';
import { compose, diff, place, remove, vowelShape, type Block, type Slot } from '../hangul/syllable';
import { SHAPE_NOTE, castHint, missingInitialHint, tapHint, type Hint } from './hints';

export type BuilderState = {
  block: Block;
  /** True when Cast can be pressed: a first consonant and a vowel. */
  canCast: boolean;
  /** True after a successful Cast, until reset(). */
  complete: boolean;
};

export type BlockBuilderOptions = {
  /** Letters in the tray. Only taught letters, in teaching order. */
  letters: string[];
  /** Whether final consonants are taught yet (lesson 4 on). */
  allowFinal: boolean;
  /** Whether the tall/flat vowel note was already shown (it shows once). */
  shapeNoteShown?: boolean;
  onChange?: (state: BuilderState) => void;
  /** Every hint or note shown, e.g. for the review rating (any hint → Again). */
  onHint?: (hint: Hint) => void;
};

export type CastResult = { correct: boolean; wrong: Slot[] };

const SLOTS: Slot[] = ['initial', 'vowel', 'final'];
type Rect = [left: number, top: number, width: number, height: number]; // % of the frame
type Layout = Partial<Record<Slot | 'right' | 'below', Rect>>;

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

const RESHAPE_MS = 220; // matches the slot transition in block-builder.css
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finished = (a: Animation) => new Promise<void>((done) => ((a.onfinish = a.oncancel = () => done()), undefined));
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const center = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

const UNDO_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M9 14 4 9l5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SPEAKER_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

export class BlockBuilder {
  readonly el: HTMLElement;
  private block: Block = {};
  private history: Slot[] = [];
  private lastRemovedInitial: string | undefined;
  private check: Slot | null = null;
  private complete = false;
  private landing: Slot | null = null;
  private shapeNoteShown: boolean;
  private current: Hint | null = null;
  /** Taps run one after another, so quick tapping never races an animation. */
  private queue: Promise<void> = Promise.resolve();

  private readonly frame: HTMLElement;
  private readonly composed: HTMLElement;
  private readonly tag: HTMLElement;
  private readonly tagText: HTMLElement;
  private readonly slots: Record<Slot, HTMLElement>;
  private readonly pieces: Record<Slot, HTMLElement>;
  private readonly ghosts: Record<'right' | 'below', HTMLElement>;
  private readonly keys: Map<string, HTMLElement>;

  constructor(private readonly opts: BlockBuilderOptions) {
    this.shapeNoteShown = opts.shapeNoteShown ?? false;
    this.el = document.createElement('div');
    this.el.className = 'bb';
    this.el.innerHTML = `
      <div class="bb-tag-row">
        <div class="bb-tag" role="status" aria-live="polite" data-state="empty">
          <span class="bb-tag-text learn"></span>
          <!-- Replay-audio button: hidden until the audio task exists; its space is kept. -->
          <button type="button" class="bb-replay" aria-label="Hear it again" tabindex="-1" hidden>${SPEAKER_ICON}</button>
        </div>
      </div>
      <div class="bb-frame" role="group" aria-label="Syllable block">
        <div class="bb-bloom" aria-hidden="true"></div>
        <div class="bb-ghost" data-pos="right" aria-hidden="true"></div>
        <div class="bb-ghost" data-pos="below" aria-hidden="true"></div>
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
    this.tag = q('.bb-tag');
    this.tagText = q('.bb-tag-text');
    this.slots = Object.fromEntries(SLOTS.map((s) => [s, q(`.bb-slot[data-slot="${s}"]`)])) as Record<Slot, HTMLElement>;
    this.pieces = Object.fromEntries(SLOTS.map((s) => [s, this.slots[s].querySelector('.bb-piece')!])) as Record<Slot, HTMLElement>;
    this.ghosts = { right: q('.bb-ghost[data-pos="right"]'), below: q('.bb-ghost[data-pos="below"]') };
    this.keys = new Map([...this.el.querySelectorAll<HTMLElement>('.bb-key')].map((k) => [k.dataset.letter!, k]));

    q('.bb-tray').addEventListener('click', (e) => {
      const key = (e.target as HTMLElement).closest<HTMLElement>('.bb-key');
      if (key) this.tap(key.dataset.letter!, key);
    });
    for (const s of SLOTS) this.slots[s].addEventListener('click', () => this.enqueue(() => this.tapSlot(s)));
    q('.bb-undo').addEventListener('click', () => this.enqueue(() => this.undo()));
    this.render();
  }

  get noteShown(): boolean {
    return this.shapeNoteShown;
  }

  getBlock(): Block {
    return { ...this.block };
  }

  reset(): void {
    this.block = {};
    this.history = [];
    this.lastRemovedInitial = undefined;
    this.check = null;
    this.complete = false;
    this.clearHint(false);
    this.render();
    this.changed();
  }

  /** A tray letter, as if its key were tapped. */
  tap(letter: string, from?: HTMLElement): void {
    this.enqueue(() => this.placeLetter(letter, from));
  }

  /** Fuses the pieces and checks them against the target syllable. */
  cast(target: string): Promise<CastResult> {
    let result: CastResult = { correct: false, wrong: [] };
    return this.enqueue(async () => {
      this.clearHint();
      if (!this.canCast()) return;
      const wrong = diff(this.block, target);
      result = { correct: !wrong.length, wrong };
      if (!wrong.length) {
        await this.fuse();
        this.complete = true;
        this.render();
      } else {
        await this.splitBack();
        this.check = wrong[0];
        this.render();
        this.showHint(castHint(wrong[0], this.block, target));
      }
      this.changed();
    }).then(() => result);
  }

  // --- taps ------------------------------------------------------------------

  private enqueue(job: () => void | Promise<void>): Promise<void> {
    this.queue = this.queue.then(job, job);
    return this.queue;
  }

  private async placeLetter(letter: string, from?: HTMLElement): Promise<void> {
    if (this.complete) return;
    this.clearHint();
    this.check = null;
    const r = place(this.block, letter, this.opts);
    if (!r.ok) {
      this.render();
      const h = tapHint(r.reason, letter);
      if (h) this.showHint(h);
      return;
    }
    this.block = r.block;
    this.history = [...this.history.filter((s) => s !== r.slot), r.slot];
    if (r.slot === 'initial') this.lastRemovedInitial = undefined;

    if (r.slot === 'vowel') await this.slideVowelIn(letter, from);
    else await this.flyIn(letter, from, r.slot);

    if (r.slot === 'vowel' && !this.shapeNoteShown && vowelShape(letter) === 'horizontal') {
      this.shapeNoteShown = true;
      this.showHint(SHAPE_NOTE);
    }
    this.changed();
  }

  private tapSlot(slot: Slot): void {
    if (this.complete) return;
    this.clearHint();
    if (this.block[slot]) return this.take(slot);
    if (slot === 'final' && !this.block.vowel) {
      const h = tapHint('floor-too-early', '');
      if (h) this.showHint(h);
    }
  }

  private undo(): void {
    if (this.complete) return;
    this.clearHint();
    const last = this.history.at(-1);
    if (last) this.take(last);
  }

  private take(slot: Slot): void {
    const letter = this.block[slot];
    if (!letter) return;
    if (slot === 'initial') this.lastRemovedInitial = letter;
    this.block = remove(this.block, slot);
    this.history = this.history.filter((s) => s !== slot);
    this.check = null;
    this.render();
    if (!this.block.initial && (this.block.vowel || this.block.final)) this.showHint(missingInitialHint(this.lastRemovedInitial));
    this.changed();
  }

  private canCast(): boolean {
    return !this.complete && compose(this.block) !== null;
  }

  // --- hints -----------------------------------------------------------------

  private showHint(h: Hint): void {
    this.current = h;
    // Korean runs get their own span so they can stay at least 20px.
    const esc = h.text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
    this.tagText.innerHTML = esc.replace(/[\u3131-\u318E\uAC00-\uD7A3]+/g, (m) => `<span class="ko" lang="ko">${m}</span>`);
    this.tag.dataset.state = 'shown';
    this.tag.dataset.kind = h.kind;
    this.applyHintFocus();
    this.opts.onHint?.(h);
  }

  /** Fades the current hint out. Called on the next tap; never on a timer. */
  private clearHint(fade = true): void {
    if (!this.current) return;
    this.current = null;
    this.tag.dataset.state = fade ? 'fading' : 'empty';
    this.applyHintFocus();
  }

  private applyHintFocus(): void {
    for (const s of SLOTS) this.slots[s].classList.toggle('bb-about', this.current?.about === s);
    for (const [l, k] of this.keys) k.classList.toggle('bb-key-glow', this.current?.glowKey === l);
  }

  // --- animation -------------------------------------------------------------

  /** Flies a copy of `letter` from the key to its slot; the slot glows just before it lands. */
  private async flyIn(letter: string, from: HTMLElement | undefined, slot: Slot): Promise<void> {
    this.landing = slot;
    this.render();
    const target = this.slots[slot];
    if (from && !reducedMotion()) {
      await this.fly(letter, from.getBoundingClientRect(), target.getBoundingClientRect(), getComputedStyle(from).fontSize, target);
    }
    this.land(slot);
  }

  /**
   * A vowel lands in the middle of the frame, the frame reshapes, then the
   * vowel slides right (tall) or drops below (flat) into its slot.
   */
  private async slideVowelIn(letter: string, from?: HTMLElement): Promise<void> {
    if (!from || reducedMotion()) {
      this.landing = 'vowel';
      this.render();
      return this.land('vowel');
    }
    const fontSize = getComputedStyle(from).fontSize;
    const f = this.frame.getBoundingClientRect();
    const mid = new DOMRect(f.left + f.width * 0.22, f.top + f.height * 0.22, f.width * 0.56, f.height * 0.56);
    const hover = this.ghost(letter, from.getBoundingClientRect(), fontSize);
    await finished(this.move(hover, from.getBoundingClientRect(), mid, 220));
    // Reshape the frame while the vowel hovers in the middle.
    this.landing = 'vowel';
    this.render();
    await sleep(RESHAPE_MS);
    const target = this.slots.vowel;
    await this.fly(letter, from.getBoundingClientRect(), target.getBoundingClientRect(), fontSize, target, mid, hover);
    this.land('vowel');
  }

  private land(slot: Slot): void {
    const target = this.slots[slot];
    target.classList.remove('bb-incoming');
    this.landing = null;
    this.render();
    this.pulse(target, 'bb-landed');
  }

  private ghost(letter: string, at: DOMRect, fontSize: string): HTMLElement {
    const g = document.createElement('span');
    g.className = 'bb-flying lesson-letter';
    g.textContent = letter;
    g.style.cssText = `left:${at.left}px;top:${at.top}px;width:${at.width}px;height:${at.height}px;font-size:${fontSize}`;
    document.body.appendChild(g);
    return g;
  }

  /** Animates a ghost (positioned at `origin`) from rect `a` to rect `b`, scaled to fit. */
  private move(g: HTMLElement, origin: DOMRect, b: DOMRect, ms: number, a: DOMRect = origin): Animation {
    const fit = (r: DOMRect) => Math.max(0.6, Math.min(r.width / origin.width, r.height / origin.height, 2.5));
    const t = (r: DOMRect) => {
      const c = center(r);
      const o = center(origin);
      return `translate(${c.x - o.x}px,${c.y - o.y}px) scale(${r === origin ? 1 : fit(r)})`;
    };
    return g.animate([{ transform: t(a) }, { transform: t(b) }], { duration: ms, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' });
  }

  private async fly(letter: string, origin: DOMRect, to: DOMRect, fontSize: string, target: HTMLElement, via?: DOMRect, existing?: HTMLElement): Promise<void> {
    const g = existing ?? this.ghost(letter, origin, fontSize);
    const anim = this.move(g, origin, to, 240, via ?? origin);
    setTimeout(() => target.classList.add('bb-incoming'), 110);
    await finished(anim);
    g.remove();
  }

  /** Success: pieces slide together, an ink bloom, the finished block and a few petals. */
  private async fuse(): Promise<void> {
    if (reducedMotion()) return;
    const c = center(this.frame.getBoundingClientRect());
    const slides = SLOTS.filter((s) => this.block[s]).map((s) => {
      const p = center(this.pieces[s].getBoundingClientRect());
      return this.pieces[s].animate(
        [{ transform: 'none', opacity: 1 }, { transform: `translate(${c.x - p.x}px,${c.y - p.y}px) scale(.55)`, opacity: 0 }],
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
    const c = center(this.frame.getBoundingClientRect());
    const anims = SLOTS.filter((s) => this.block[s]).map((s) => {
      const p = center(this.pieces[s].getBoundingClientRect());
      return this.pieces[s].animate(
        [{ transform: 'none' }, { transform: `translate(${(c.x - p.x) * 0.35}px,${(c.y - p.y) * 0.35}px) scale(.9)`, offset: 0.4 }, { transform: 'none' }],
        { duration: 420, easing: 'ease-in-out' },
      );
    });
    await Promise.all(anims.map(finished));
  }

  // --- rendering -------------------------------------------------------------

  private render(): void {
    const b = this.block;
    const shape = b.vowel ? vowelShape(b.vowel) : 'open';
    const rects = layout(shape, this.opts.allowFinal);
    const f = this.frame.dataset;
    f.shape = shape;
    f.complete = this.complete ? 'yes' : 'no';

    const put = (el: HTMLElement, r: Rect | undefined) => {
      el.hidden = !r;
      if (r) Object.assign(el.style, { left: `${r[0]}%`, top: `${r[1]}%`, width: `${r[2]}%`, height: `${r[3]}%` });
    };
    for (const s of SLOTS) {
      const el = this.slots[s];
      put(el, rects[s]);
      const letter = b[s];
      this.pieces[s].textContent = letter ?? '';
      el.dataset.filled = letter ? 'yes' : 'no';
      el.classList.toggle('bb-hidden-piece', this.landing === s);
      el.classList.toggle('bb-check', this.check === s);
      el.setAttribute('aria-label', letter ? `${letter}: tap to take it out` : s === 'initial' ? 'First consonant: empty' : s === 'vowel' ? 'Vowel: empty' : 'Floor: empty');
    }
    put(this.ghosts.right, rects.right);
    put(this.ghosts.below, rects.below);
    // The empty first-consonant slot pulses while other letters wait on it.
    this.slots.initial.classList.toggle('bb-wanted', !b.initial && !!(b.vowel || b.final));
    this.composed.textContent = this.complete ? (compose(b) ?? '') : '';
  }

  private changed(): void {
    this.opts.onChange?.({ block: this.getBlock(), canCast: this.canCast(), complete: this.complete });
  }

  private pulse(el: HTMLElement, cls: string): void {
    el.classList.remove(cls);
    void el.offsetWidth; // restart the animation
    el.classList.add(cls);
    el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
  }
}
