// Block builder demo (builder.html): build 아, 오 and 문 by tapping letters.
// Stand-in for the spell scroll until the close-up view exists.
//
// No copying (Tess): the target is never shown before Cast. Until audio
// exists it sits behind "Show me"; the progress chips are dots until each
// syllable is cast.
import './theme.css';
import './fonts.css';
import './builder-demo.css';
import { BlockBuilder } from './builder/BlockBuilder';
import { END_MESSAGE } from './builder/hints';

const TARGETS = ['아', '오', '문'];
// Letters taught by lesson 4 (content/lessons.json), in teaching order.
const LETTERS = ['ㅡ', 'ㅣ', 'ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅇ', 'ㅁ', 'ㄴ'];

let step = 0;

const app = document.querySelector<HTMLElement>('#app')!;
app.innerHTML = `
  <h1 class="title" style="--title-size: 2rem; font-weight:700">Block builder</h1>
  <p class="intro">Build each syllable in reading order: first consonant, vowel, then floor. Tap a letter in the block to take it out. Press Cast when it’s ready.</p>
  <div class="progress" aria-label="Progress">${TARGETS.map(() => `<span aria-hidden="true"></span>`).join('')}</div>
  <div class="prompt">
    <span class="step"></span>
    <button type="button" class="show-me">Show me</button>
    <span class="reveal learn" aria-live="polite"></span>
  </div>
  <div id="builder"></div>
  <p class="message learn" aria-live="polite"></p>
  <div class="actions"><button type="button" class="cast" disabled>Cast</button></div>
  <p class="draft">Prototype test page. No audio yet: once the audio task exists, you’ll hear each syllable instead of using Show me, and every hint will play audio too.</p>`;

const q = <T extends HTMLElement>(sel: string) => app.querySelector<T>(sel)!;
const stepLabel = q('.step');
const showMe = q<HTMLButtonElement>('.show-me');
const reveal = q('.reveal');
const message = q('.message');
const cast = q<HTMLButtonElement>('.cast');
const chips = [...app.querySelectorAll<HTMLElement>('.progress span')];

const builder = new BlockBuilder({
  letters: LETTERS,
  allowFinal: true,
  onChange: (s) => {
    if (step < TARGETS.length) cast.disabled = !s.canCast;
  },
  onHint: (hint) => {
    message.textContent = hint ?? '';
  },
});
q('#builder').appendChild(builder.el);

function show(): void {
  chips.forEach((el, i) => {
    el.textContent = i < step ? TARGETS[i] : '';
    el.classList.toggle('done', i < step);
    el.classList.toggle('current', i === step);
  });
  reveal.textContent = '';
  if (step < TARGETS.length) {
    stepLabel.textContent = `Syllable ${step + 1} of ${TARGETS.length}`;
    showMe.hidden = false;
    cast.textContent = 'Cast';
    cast.disabled = true;
  } else {
    stepLabel.textContent = '';
    showMe.hidden = true;
    message.textContent = END_MESSAGE;
    cast.textContent = 'Again';
    cast.disabled = false;
  }
}

showMe.addEventListener('click', () => {
  reveal.innerHTML = `Build <span class="emph">${TARGETS[step]}</span>`;
});

cast.addEventListener('click', async () => {
  if (step >= TARGETS.length) {
    step = 0;
    builder.reset();
    show();
    return;
  }
  cast.disabled = true;
  const target = TARGETS[step];
  const { correct } = await builder.cast(target);
  if (!correct) return;
  message.innerHTML = `<mark class="emph">${target}</mark>`;
  step++;
  chips[step - 1].textContent = target;
  chips[step - 1].classList.add('done');
  setTimeout(() => {
    builder.reset();
    show();
  }, 1300);
});

show();
