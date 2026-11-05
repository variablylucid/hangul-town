// Block builder demo (builder.html): build a lesson's practice words, one
// block at a time. Stand-in for the spell scroll until the close-up view exists.
//
// - Tray and targets come from content/lessons.json. Pick a lesson with the
//   menu (or ?lesson=L6). Each run practises the lesson's first three words.
// - No copying (Tess): targets are hidden behind "Show me" until audio exists;
//   progress chips are dots until each word is cast.
// - Repeat casts of a syllable get the quicker (review) success animation.
import './theme.css';
import './fonts.css';
import './builder-demo.css';
import lessonData from '../content/lessons.json';
import { BlockBuilder } from './builder/BlockBuilder';
import { END_MESSAGE } from './builder/hints';

type Lesson = { id: string; type?: string; tray?: string[]; new_letters?: string[]; finals?: string[]; words?: string[] };
const lessons = (lessonData.lessons as Lesson[]).filter((l) => l.type !== 'scene');

const params = new URLSearchParams(location.search);
const lessonIndex = Math.max(0, lessons.findIndex((l) => l.id === params.get('lesson')));
const lesson = lessons[lessonIndex];

// Tray: every letter taught so far, in teaching order (L1 has its own tray order).
const taught = lessons.slice(0, lessonIndex + 1);
const LETTERS = [...new Set([...(lessons[0].tray ?? []), ...taught.flatMap((l) => l.new_letters ?? [])])];
const allowFinal = taught.some((l) => (l.finals ?? []).length > 0);
const WORDS = (lesson.words ?? []).slice(0, 3);

let wordIndex = 0;
let blockIndex = 0;
let hintShown = false;
// Tess's rule: only the first Cast counts; any hint before it rates the word Again.
let firstCast = true;
const castBefore = new Set<string>();

// Stand-in for the spellbook, so the seal has somewhere to fly.
const BOOK_ICON = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 19a2 2 0 0 1 2-2h13" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`;

const app = document.querySelector<HTMLElement>('#app')!;
app.innerHTML = `
  <div class="spellbook" aria-label="Spellbook">${BOOK_ICON}<span>Spellbook</span></div>
  <h1 class="title" style="--title-size: 2rem; font-weight:700">Block builder</h1>
  <label class="lesson-pick">Lesson
    <select>${lessons.map((l, i) => `<option value="${l.id}"${i === lessonIndex ? ' selected' : ''}>${l.id}</option>`).join('')}</select>
  </label>
  <p class="intro">Build each word one block at a time: first consonant, vowel, then floor. Tap a letter in the block to take it out. Press Cast when the block is ready.</p>
  <div class="progress" aria-label="Words">${WORDS.map(() => `<span aria-hidden="true"></span>`).join('')}</div>
  <div class="word-line" aria-label="This word so far"></div>
  <div class="prompt">
    <span class="step"></span>
    <button type="button" class="show-me">Show me</button>
    <span class="reveal learn" aria-live="polite"></span>
  </div>
  <div id="builder"></div>
  <p class="message learn" aria-live="polite"></p>
  <div class="actions"><button type="button" class="cast" disabled>Cast</button></div>
  <p class="draft">Prototype test page. No audio or pictures yet: once they exist, you’ll hear each word instead of using Show me.</p>`;

const q = <T extends HTMLElement>(sel: string) => app.querySelector<T>(sel)!;
const stepLabel = q('.step');
const showMe = q<HTMLButtonElement>('.show-me');
const reveal = q('.reveal');
const message = q('.message');
const cast = q<HTMLButtonElement>('.cast');
const wordLine = q('.word-line');
const chips = [...app.querySelectorAll<HTMLElement>('.progress span')];

q<HTMLSelectElement>('.lesson-pick select').addEventListener('change', (e) => {
  location.search = `?lesson=${(e.target as HTMLSelectElement).value}`;
});

const builder = new BlockBuilder({
  letters: LETTERS,
  allowFinal,
  onChange: (s) => {
    if (wordIndex < WORDS.length) cast.disabled = !s.canCast;
  },
  // Hints show in the builder's own speech tag; here we only note that one was shown.
  onHint: (h) => {
    if (h.kind === 'hint') hintShown = true;
  },
  // No objects yet: the light flows to this word's progress chip instead.
  objectTarget: () => chips[wordIndex] ?? null,
  spellbookTarget: () => app.querySelector('.spellbook'),
});
q('#builder').appendChild(builder.el);

const word = () => WORDS[wordIndex];

/** The word line: finished blocks of this word, then a dot for each block still to build. */
function showWordLine(): void {
  if (wordIndex >= WORDS.length) {
    wordLine.innerHTML = '';
    return;
  }
  wordLine.innerHTML = [...word()]
    .map((syl, i) => (i < blockIndex ? `<span class="done lesson-letter">${syl}</span>` : `<span class="${i === blockIndex ? 'current' : ''}"></span>`))
    .join('');
}

function show(): void {
  chips.forEach((el, i) => {
    el.textContent = i < wordIndex ? WORDS[i] : '';
    el.classList.toggle('done', i < wordIndex);
    el.classList.toggle('current', i === wordIndex);
  });
  reveal.textContent = '';
  showWordLine();
  if (wordIndex < WORDS.length) {
    const blocks = word().length;
    stepLabel.textContent = `Word ${wordIndex + 1} of ${WORDS.length}${blocks > 1 ? ` · block ${blockIndex + 1} of ${blocks}` : ''}`;
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
  hintShown = true;
  reveal.innerHTML = `Build <span class="emph">${word()}</span>`;
});

cast.addEventListener('click', async () => {
  if (wordIndex >= WORDS.length) {
    wordIndex = blockIndex = 0;
    hintShown = false;
    firstCast = true;
    message.textContent = '';
    builder.reset();
    show();
    return;
  }
  cast.disabled = true;
  message.textContent = '';
  const target = word()[blockIndex];
  const { correct, wrong } = await builder.cast(target, { quick: castBefore.has(target) });
  if (firstCast && (correct || wrong.length)) {
    // Rated on the word's first Cast. Stand-in for the review scheduler task.
    firstCast = false;
    chips[wordIndex].dataset.rating = correct && !hintShown ? 'good' : 'again';
  }
  if (!correct) return;
  castBefore.add(target);
  blockIndex++;
  if (blockIndex >= word().length) {
    message.innerHTML = `<mark class="emph">${word()}</mark>`;
    wordIndex++;
    blockIndex = 0;
    hintShown = false;
    firstCast = true;
  }
  showWordLine();
  setTimeout(() => {
    builder.reset();
    if (wordIndex < WORDS.length) message.textContent = '';
    show();
  }, 500);
});

show();
