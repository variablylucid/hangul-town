// Hangul block builder: tap letters in the tray and they fly into a syllable
// frame. Vertical vowels sit to the right of the first consonant, horizontal
// vowels below it, and a final consonant forms the floor. Once the block has a
// consonant and a vowel, the frame shows the real syllable in the lesson font.
//
// DOM/CSS (not Phaser) because it lives in the close-up view.
import './block-builder.css';
import { compose, place, remove, vowelShape, type Block, type Slot } from '../hangul/syllable';

export type BuilderMessage = 'not-a-letter' | 'no-final-here' | 'cannot-be-final';

export type BlockBuilderOptions = {
  /** Letters in the tray. Only taught letters, in teaching order. */
  letters: string[];
  /** Whether final consonants are taught yet (lesson 4 on). */
  allowFinal: boolean;
  /** Called after every change. `syllable` is null while the block is incomplete. */
  onChange?: (block: Block, syllable: string | null) => void;
  /** Called when a tap can't be placed, so the caller can show a gentle nudge. */
  onMisfire?: (reason: BuilderMessage, letter: string) => void;
};

const SLOTS: Slot[] = ['initial', 'vowel', 'final'];
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export class BlockBuilder {
  readonly el: HTMLElement;
  private block: Block = {};
  private history: Slot[] = [];
  private readonly frame: HTMLElement;
  private readonly composed: HTMLElement;
  private readonly slots: Record<Slot, HTMLElement>;
  private readonly pieces: Record<Slot, HTMLElement>;

  constructor(private readonly opts: BlockBuilderOptions) {
    this.el = document.createElement('div');
    this.el.className = 'bb';
    this.el.innerHTML = `
      <div class="bb-frame" role="group" aria-label="Syllable block">
        <div class="bb-ghost bb-ghost-right" aria-hidden="true"></div>
        <div class="bb-ghost bb-ghost-below" aria-hidden="true"></div>
        <div class="bb-ghost bb-ghost-floor" aria-hidden="true"></div>
        <div class="bb-composed lesson-letter" aria-live="polite"></div>
        ${SLOTS.map((s) => `<button type="button" class="bb-slot" data-slot="${s}" aria-label="${s} slot, empty"><span class="bb-piece lesson-letter"></span></button>`).join('')}
      </div>
      <div class="bb-tray" role="group" aria-label="Letters">
        ${opts.letters.map((l) => `<button type="button" class="bb-key lesson-letter" data-letter="${l}" aria-label="${l}">${l}</button>`).join('')}
      </div>
      <button type="button" class="bb-undo">Undo</button>`;

    this.frame = this.el.querySelector('.bb-frame')!;
    this.composed = this.el.querySelector('.bb-composed')!;
    this.slots = Object.fromEntries(SLOTS.map((s) => [s, this.el.querySelector(`.bb-slot[data-slot="${s}"]`)!])) as Record<Slot, HTMLElement>;
    this.pieces = Object.fromEntries(SLOTS.map((s) => [s, this.slots[s].querySelector('.bb-piece')!])) as Record<Slot, HTMLElement>;

    this.el.querySelector('.bb-tray')!.addEventListener('click', (e) => {
      const key = (e.target as HTMLElement).closest<HTMLElement>('.bb-key');
      if (key) this.tap(key.dataset.letter!, key);
    });
    // Tapping a placed letter takes it back out.
    for (const s of SLOTS) this.slots[s].addEventListener('click', () => this.take(s));
    this.el.querySelector('.bb-undo')!.addEventListener('click', () => this.undo());
    this.render(false);
  }

  getBlock(): Block {
    return { ...this.block };
  }

  syllable(): string | null {
    return compose(this.block);
  }

  reset(): void {
    this.block = {};
    this.history = [];
    this.render(false);
  }

  /** Plays a short shake on the frame: the "fizzle" for a miss. */
  fizzle(): void {
    this.pulse('bb-fizzle');
  }

  /** Plays the success glow on the frame. */
  celebrate(): void {
    this.pulse('bb-cast');
  }

  /** Places a letter as if its key were tapped. */
  tap(letter: string, from?: HTMLElement): void {
    const r = place(this.block, letter, { allowFinal: this.opts.allowFinal });
    if (!r.ok) {
      this.fizzle();
      this.opts.onMisfire?.(r.reason, letter);
      return;
    }
    const wasComplete = compose(this.block) !== null;
    this.block = r.block;
    this.history = [...this.history.filter((s) => s !== r.slot), r.slot];
    // Lay the frame out for the new shape first, so the letter flies to the right place.
    this.render(false);
    const land = () => {
      this.render(!wasComplete && compose(this.block) !== null);
      this.changed();
    };
    if (from && !reducedMotion()) this.fly(letter, from, this.slots[r.slot], land);
    else land();
  }

  undo(): void {
    const last = this.history.at(-1);
    if (last) this.take(last);
  }

  private take(slot: Slot): void {
    if (!this.block[slot]) return;
    this.block = remove(this.block, slot);
    this.history = this.history.filter((s) => this.block[s]);
    this.render(false);
    this.changed();
  }

  private changed(): void {
    this.opts.onChange?.(this.getBlock(), compose(this.block));
  }

  private render(snap: boolean): void {
    const b = this.block;
    const syllable = compose(b);
    const shape = b.vowel ? vowelShape(b.vowel) : 'open';
    this.frame.dataset.shape = shape;
    this.frame.dataset.final = b.final ? 'yes' : 'no';
    this.frame.dataset.complete = syllable ? 'yes' : 'no';
    this.frame.dataset.floor = this.opts.allowFinal && b.initial && b.vowel && !b.final ? 'open' : 'closed';
    this.composed.textContent = syllable ?? '';

    for (const s of SLOTS) {
      const letter = b[s];
      this.pieces[s].textContent = letter ?? '';
      this.slots[s].dataset.filled = letter ? 'yes' : 'no';
      this.slots[s].setAttribute('aria-label', letter ? `${letter}, tap to take out` : `${s} slot, empty`);
    }
    // A vowel placed first leaves the first-consonant slot glowing: it still needs one (e.g. silent ㅇ).
    this.slots.initial.classList.toggle('bb-wanted', !!b.vowel && !b.initial);
    if (snap) this.pulse('bb-snap');
  }

  private pulse(cls: string): void {
    this.frame.classList.remove('bb-snap', 'bb-fizzle', 'bb-cast');
    void this.frame.offsetWidth; // restart the animation
    this.frame.classList.add(cls);
  }

  /** Animates a copy of the tapped key into its slot. */
  private fly(letter: string, from: HTMLElement, to: HTMLElement, done: () => void): void {
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const ghost = document.createElement('span');
    ghost.className = 'bb-flying lesson-letter';
    ghost.textContent = letter;
    ghost.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;font-size:${getComputedStyle(from).fontSize}`;
    document.body.appendChild(ghost);
    const scale = Math.min(b.width / a.width, b.height / a.height);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = ghost.animate(
      [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx}px,${dy}px) scale(${scale})` }],
      { duration: 220, easing: 'cubic-bezier(.3,.7,.4,1)' },
    );
    anim.onfinish = anim.oncancel = () => {
      ghost.remove();
      done();
    };
  }
}
