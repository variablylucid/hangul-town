// Block builder demo (builder.html): build 아, 오 and 문 by tapping letters.
// Stand-in for the spell scroll until the close-up view exists.
import './theme.css';
import './fonts.css';
import './builder-demo.css';
import { BlockBuilder, type BuilderMessage } from './builder/BlockBuilder';
import { diff, type Block, type Slot } from './hangul/syllable';

const TARGETS = ['아', '오', '문'];
// Letters taught by lesson 4 (content/lessons.json), in teaching order.
const LETTERS = ['ㅡ', 'ㅣ', 'ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅇ', 'ㅁ', 'ㄴ'];

// DRAFT hint text: for Tess (teaching) and Joy (tone) to review.
const MISS_HINTS: Record<Slot, string> = {
  initial: 'So close! Check the first letter.',
  vowel: 'Nearly there! Listen to the vowel again.',
  final: 'Almost! Check the floor of the block.',
};
const MISFIRE_HINTS: Record<BuilderMessage, string> = {
  'not-a-letter': '',
  'no-final-here': 'This block has no floor yet.',
  'cannot-be-final': 'That letter can’t sit on the floor.',
};
const NO_INITIAL = 'Every block starts with a consonant. For a vowel sound, start with the silent ㅇ.';

let step = 0;

const app = document.querySelector<HTMLElement>('#app')!;
app.innerHTML = `
  <h1 class="title" style="--title-size: 2rem; font-weight:700">Block builder</h1>
  <p class="intro">Tap letters to build each syllable, then press Cast. Tap a letter in the block to take it out.</p>
  <div class="progress" aria-label="Progress">${TARGETS.map((t) => `<span>${t}</span>`).join('')}</div>
  <p class="prompt learn" aria-live="polite"></p>
  <div id="builder"></div>
  <p class="message learn" aria-live="polite"></p>
  <div class="actions"><button type="button" class="cast" disabled>Cast</button></div>
  <p class="draft">Prototype test page. Hint wording is a draft. No audio yet: the audio task adds it.</p>`;

const prompt = app.querySelector<HTMLElement>('.prompt')!;
const message = app.querySelector<HTMLElement>('.message')!;
const cast = app.querySelector<HTMLButtonElement>('.cast')!;
const progress = [...app.querySelectorAll<HTMLElement>('.progress span')];

const builder = new BlockBuilder({
  letters: LETTERS,
  allowFinal: true,
  onChange: (block: Block, syllable) => {
    cast.disabled = syllable === null;
    message.textContent = block.vowel && !block.initial ? NO_INITIAL : '';
  },
  onMisfire: (reason) => {
    message.textContent = MISFIRE_HINTS[reason];
  },
});
app.querySelector('#builder')!.appendChild(builder.el);

function show(): void {
  progress.forEach((el, i) => {
    el.classList.toggle('done', i < step);
    el.classList.toggle('current', i === step);
  });
  if (step < TARGETS.length) {
    prompt.innerHTML = `Build <span class="emph">${TARGETS[step]}</span>`;
    cast.textContent = 'Cast';
  } else {
    prompt.textContent = 'All three built. Lovely work!';
    cast.textContent = 'Again';
    cast.disabled = false;
  }
}

cast.addEventListener('click', () => {
  if (step >= TARGETS.length) {
    step = 0;
    builder.reset();
    message.textContent = '';
    show();
    return;
  }
  const target = TARGETS[step];
  const wrong = diff(builder.getBlock(), target);
  if (wrong.length) {
    builder.fizzle();
    message.textContent = MISS_HINTS[wrong[0]];
    return;
  }
  builder.celebrate();
  message.innerHTML = `<mark class="emph">${target}</mark>!`;
  step++;
  cast.disabled = true;
  setTimeout(() => {
    builder.reset();
    if (step < TARGETS.length) message.textContent = '';
    show();
  }, 900);
});

show();
