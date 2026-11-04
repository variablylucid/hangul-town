// Font test page (fonts.html): every game font with Korean and English, plus
// the checks from Lina's font review. Korean samples are the approved words,
// the alphabet, and Lina's stress-test line (a font test, not taught content).
import './theme.css';
import './fonts.css';
import './fonts-test.css';
import words from '../content/words.json';

const koWords = words.words.map((w) => w.word).join(' ');
// Every modern hangul letter (consonants ㄱ–ㅎ incl. clusters, vowels ㅏ–ㅣ).
const allLetters = Array.from({ length: 0x3163 - 0x3131 + 1 }, (_, i) => String.fromCharCode(0x3131 + i)).join(' ');
const english = 'The quick brown fox jumps over the lazy dog. 0123456789 “Hello!” — it’s cozy…';
const stress = '까 꺼 떠 뻐 써 쪄 짜 차 하 주 추 후 닭 앉 없 많 읽 값 괜찮아 할머니 의 왜 웨';
const zoomLetters = ['ㅈ', 'ㅊ', 'ㅎ', 'ㅇ', 'ㅅ', 'ㄹ'];

// --- Lesson letters ---------------------------------------------------------
// Prototype letters in Tess's lesson order (content/lessons.json), each with
// its in-block forms. Chosen and checked by Lina: forms are real words where
// possible, and she checks every new one (docs/DECISIONS.md).
//   audio: false   made-up syllable; a shape example only, never voiced
//   checkByEar     voiced, but computer voices may misread it (e.g. as a
//                  letter name); check the clip by ear before using it
type Form = { text: string; audio: boolean; checkByEar?: boolean; note?: string };
type LessonLetter = { letter: string; kind: 'consonant' | 'vowel'; lesson: string; forms: Form[] };
const f = (text: string, note?: string): Form => ({ text, audio: true, note });
const ear = (text: string, note?: string): Form => ({ text, audio: true, checkByEar: true, note });
const shapeOnly = (text: string): Form => ({ text, audio: false, note: 'shape only' });

const lessonLetters: LessonLetter[] = [
  // L1: the strokes ㅡ ㅣ, the vowels built from them, silent ㅇ (final ㅇ comes in L4)
  { letter: 'ㅡ', kind: 'vowel', lesson: 'L1', forms: [ear('으'), ear('느'), f('응')] },
  { letter: 'ㅣ', kind: 'vowel', lesson: 'L1', forms: [f('이'), f('니'), f('민')] },
  { letter: 'ㅏ', kind: 'vowel', lesson: 'L1', forms: [f('아'), f('나'), f('만')] },
  { letter: 'ㅓ', kind: 'vowel', lesson: 'L1', forms: [ear('어'), f('너'), f('먼')] },
  { letter: 'ㅗ', kind: 'vowel', lesson: 'L1', forms: [f('오'), f('노'), f('몸')] },
  { letter: 'ㅜ', kind: 'vowel', lesson: 'L1', forms: [f('우'), f('누'), f('문')] },
  { letter: 'ㅇ', kind: 'consonant', lesson: 'L1 · L4', forms: [f('아', 'silent'), f('오', 'silent'), ear('앙', '“ng”')] },
  { letter: 'ㅁ', kind: 'consonant', lesson: 'L2', forms: [f('마'), f('모'), f('맘')] },
  { letter: 'ㄴ', kind: 'consonant', lesson: 'L3', forms: [f('나'), f('노'), f('안')] },
  { letter: 'ㅑ', kind: 'vowel', lesson: 'TP1a', forms: [f('야'), f('냐'), f('냠')] },
  { letter: 'ㅕ', kind: 'vowel', lesson: 'TP1a', forms: [f('여'), ear('녀'), f('면')] },
  { letter: 'ㅛ', kind: 'vowel', lesson: 'TP1a', forms: [f('요'), ear('뇨'), f('용')] },
  { letter: 'ㅠ', kind: 'vowel', lesson: 'TP1a', forms: [f('유'), f('뉴'), shapeOnly('뮨')] },
  { letter: 'ㅐ', kind: 'vowel', lesson: 'TP1b', forms: [f('애'), f('내'), f('맨')] },
  { letter: 'ㅔ', kind: 'vowel', lesson: 'TP1b', forms: [f('에'), f('네'), f('엔')] },
];

// Splits a syllable into its letters, to check each form really uses its cell's letter.
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const JONG = ' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
function splitSyllable(s: string): { first: string; vowel: string; final: string } {
  const n = s.charCodeAt(0) - 0xac00;
  return { first: CHO[Math.floor(n / 588)], vowel: JUNG[Math.floor((n % 588) / 28)], final: JONG[n % 28].trim() };
}
const formUsesLetter = (l: LessonLetter, fm: Form) => {
  const p = splitSyllable(fm.text);
  return l.kind === 'vowel' ? p.vowel === l.letter : p.first === l.letter || p.final === l.letter;
};

type FontSpec = { family: string; role: string; weights: number[]; titleOnly?: boolean };

const koreanFonts: FontSpec[] = [
  { family: 'Gowun Dodum', role: 'Learning text (Korean)', weights: [400] },
  { family: 'Pretendard', role: 'Menus; large letters in lessons', weights: [400, 500, 600, 800] },
  { family: 'Gowun Batang', role: 'Titles only, 24px or larger', weights: [400, 700], titleOnly: true },
];
const latinFonts: FontSpec[] = [
  { family: 'Nunito', role: 'Learning text (English)', weights: [400, 700, 900] },
  { family: 'Lora', role: 'Titles (English)', weights: [400, 700] },
];

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
const ff = (family: string) => `font-family: '${family}', monospace`;
const status = (family: string) => `<span class="status" data-family="${family}">checking…</span>`;

function koreanSection(f: FontSpec): string {
  // Titles-only font: every sample at 24px or more, except the 16px stress test.
  const body = f.titleOnly ? 24 : 20;
  const weights = f.weights
    .map((w) => `<span style="font-weight:${w}">${w}: 안녕 Hello</span>`)
    .join('');
  return `
    <section>
      <h2>${f.family}</h2>
      <p class="meta">${f.role} · ${status(f.family)}</p>
      <p class="sample big" style="${ff(f.family)}">안녕 엄마 나무 문</p>
      <div class="sample" style="${ff(f.family)}">
        <span class="label">Stress test · 16px${f.titleOnly ? ' (test only; never used below 24px in the game)' : ''}</span>
        <p style="font-size:16px; margin:0">${stress}</p>
        <span class="label">Stress test · 24px</span>
        <p style="font-size:24px; margin:0">${stress}</p>
      </div>
      <div class="sample">
        <span class="label">4× zoom (96px)</span>
        <div class="zoom" style="${ff(f.family)}">${zoomLetters.map((l) => `<span>${l}</span>`).join('')}</div>
      </div>
      <p class="sample" style="${ff(f.family)}; font-size:${body}px"><span class="label">Approved words</span>${koWords}</p>
      <p class="sample" style="${ff(f.family)}; font-size:24px"><span class="label">All letters</span>${allLetters}</p>
      <p class="sample" style="${ff(f.family)}; font-size:${body}px"><span class="label">English</span>${esc(english)}</p>
      <p class="sample weights" style="${ff(f.family)}; font-size:${body}px"><span class="label">Weights</span>${weights}</p>
    </section>`;
}

function latinSection(f: FontSpec): string {
  const weights = f.weights.map((w) => `<span style="font-weight:${w}">${w}: Hello</span>`).join('');
  return `
    <section>
      <h2>${f.family}</h2>
      <p class="meta">${f.role} · ${status(f.family)}</p>
      <p class="sample" style="${ff(f.family)}; font-size:20px"><span class="label">English</span>${esc(english)}</p>
      <p class="sample weights" style="${ff(f.family)}; font-size:20px"><span class="label">Weights</span>${weights}</p>
    </section>`;
}

const together = `
  <section>
    <h2>Fonts together</h2>
    <p class="meta">How the pairs look when Korean and English share a line, at game sizes.</p>
    <span class="label">Title · Lora + Gowun Batang · 32px</span>
    <p class="sample title" style="--title-size: 32px; font-weight:700; margin-top:0">Hangul Town · 안녕</p>
    <span class="label">Learning text · Nunito + Gowun Dodum, Korean 7.5% larger</span>
    <p class="sample learn" style="margin-top:0">The 아이 is crying by the 문. Can you find the 여우?</p>
    <span class="label">Emphasis · colour or highlight, never bold</span>
    <p class="sample learn" style="margin-top:0">Say <span class="emph">엄마</span> again. Now find the <mark class="emph">나무</mark>.</p>
    <span class="label">Menu · Pretendard</span>
    <p class="sample" style="font-family: var(--font-ui); font-size:18px; margin-top:0">Settings · Codex · 메뉴</p>
  </section>`;

const lessons = `
  <section>
    <h2>Lesson letters</h2>
    <p class="meta">Pretendard, weight 550. Each prototype letter in lesson order, with its in-block forms. Dashed forms are shape examples only and never voiced; forms marked ● need their audio checked by ear. ${status('Pretendard')}</p>
    <div class="letter-grid">
      ${lessonLetters
        .map(
          (l) => `<div class="letter-card lesson-letter">
            <span class="lesson">${l.lesson}</span>
            <span class="letter">${l.letter}</span>
            <span class="forms">${l.forms
              .map(
                (fm) => `<span class="form${fm.audio ? '' : ' shape-only'}" data-audio="${fm.audio}" data-check-by-ear="${!!fm.checkByEar}">
                  <span class="syl">${fm.text}${fm.checkByEar ? '<span class="ear" title="Check by ear">●</span>' : ''}</span>${fm.note ? `<span class="note">${fm.note}</span>` : ''}
                </span>`,
              )
              .join('')}</span>
          </div>`,
        )
        .join('')}
    </div>
  </section>`;

const checks = `
  <section>
    <h2>Checks</h2>
    <p class="meta" id="device"></p>
    <table class="checks"><tbody id="rule-checks"></tbody></table>
    <h3>Text contrast (WCAG AA needs 4.5:1)</h3>
    <table class="checks"><thead><tr><th>Text</th><th>On cream (--bg)</th><th>On card</th></tr></thead><tbody id="contrast"></tbody></table>
  </section>`;

document.querySelector<HTMLElement>('#app')!.innerHTML = `
  <h1 class="title" style="--title-size: 2.2rem; font-weight:700">Font test</h1>
  <p class="intro">Each game font with Korean and English. A red “not loaded” means the browser fell back to another font. To check a phone, open this page on it and look at Checks at the bottom.</p>
  ${together}
  ${koreanFonts.map(koreanSection).join('')}
  ${lessons}
  ${latinFonts.map(latinSection).join('')}
  ${checks}`;

// --- Live checks ---------------------------------------------------------

const row = (name: string, value: string, ok: boolean) =>
  `<tr><td>${name}</td><td>${value}</td><td class="status ${ok ? 'ok' : 'bad'}">${ok ? 'pass' : 'fail'}</td></tr>`;

function luminance(rgb: number[]): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function cssColor(value: string): number[] {
  const el = document.createElement('div');
  el.style.color = value;
  document.body.appendChild(el);
  const rgb = getComputedStyle(el).color.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number);
  el.remove();
  return rgb;
}
const contrast = (fg: string, bg: string) => {
  const [a, b] = [luminance(cssColor(fg)), luminance(cssColor(bg))];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

function renderContrast(): void {
  const pairs: [string, string, string?][] = [
    ['Body text', 'var(--ink)'],
    ['Muted text', 'var(--muted)'],
    ['Emphasis colour', 'var(--emph-ink)'],
    ['Success', 'var(--ok)'],
    ['Error', 'var(--bad)'],
  ];
  const cell = (r: number) => `<td class="status ${r >= 4.5 ? 'ok' : 'bad'}">${r.toFixed(2)}:1</td>`;
  const rows = pairs.map(([name, fg]) => `<tr><td>${name}</td>${cell(contrast(fg, 'var(--bg)'))}${cell(contrast(fg, 'var(--card)'))}</tr>`);
  const mark = contrast('var(--mark-ink)', 'var(--mark-bg)');
  rows.push(`<tr><td>Highlighted text</td><td class="status ${mark >= 4.5 ? 'ok' : 'bad'}" colspan="2">${mark.toFixed(2)}:1 on its highlight</td></tr>`);
  document.querySelector('#contrast')!.innerHTML = rows.join('');
}

/** Rendered width of a Korean glyph, to measure size-adjust's real effect. */
function glyphWidth(family: string, px: number): number {
  const s = document.createElement('span');
  s.style.cssText = `font-family:'${family}';font-size:${px}px;position:absolute;visibility:hidden;white-space:nowrap`;
  s.textContent = '가나다라마바사';
  document.body.appendChild(s);
  const w = s.getBoundingClientRect().width;
  s.remove();
  return w;
}

function browserName(): string {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : 'Linux';
  const br = /CriOS|Chrome\//.test(ua) && !/Edg/.test(ua) ? 'Chrome' : /Safari\//.test(ua) && !/Chrome/.test(ua) ? 'Safari' : /Firefox|FxiOS/.test(ua) ? 'Firefox' : 'other browser';
  return `${br} on ${os}`;
}

function renderRules(): void {
  const root = getComputedStyle(document.documentElement);
  const rules: string[] = [];

  const loaded = (family: string) =>
    [...document.fonts].some((f) => f.family.replace(/['"]/g, '') === family && f.status === 'loaded');
  const families = ['Gowun Dodum', 'Gowun Dodum Learn', 'Pretendard', 'Gowun Batang', 'Nunito', 'Lora'];
  const missing = families.filter((f) => !loaded(f));
  rules.push(row('All fonts loaded', missing.length ? `missing: ${missing.join(', ')}` : `${families.length} of ${families.length}`, !missing.length));

  const english = parseFloat(root.getPropertyValue('--size-learn'));
  const scale = glyphWidth('Gowun Dodum Learn', 100) / glyphWidth('Gowun Dodum', 100);
  const korean = english * scale;
  const pct = (scale - 1) * 100;
  rules.push(row('Korean learning text ≥ 20px', `${korean.toFixed(1)}px (English ${english}px)`, korean >= 20));
  rules.push(row('Korean 5–10% larger than English', `+${pct.toFixed(1)}%`, pct >= 4.9 && pct <= 10.1));

  rules.push(row('No faux bold/italic', `font-synthesis: ${root.getPropertyValue('font-synthesis') || getComputedStyle(document.body).fontSynthesis}`, getComputedStyle(document.body).fontSynthesis === 'none'));

  const letterWeights = new Set([...document.querySelectorAll('.lesson-letter')].map((el) => getComputedStyle(el).fontWeight));
  const w = [...letterWeights].join(', ');
  rules.push(row('Lesson letters weight 550', w, w === '550'));

  const wrong = lessonLetters.flatMap((l) => l.forms.filter((fm) => !formUsesLetter(l, fm)).map((fm) => `${fm.text} in ${l.letter}`));
  rules.push(row('Every lesson form uses its letter', wrong.length ? wrong.join(', ') : 'all forms', !wrong.length));

  const batang = [...document.querySelectorAll<HTMLElement>('body *')].filter(
    (el) => getComputedStyle(el).fontFamily.includes('Gowun Batang') && el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) && !el.closest('[data-test-only]'),
  );
  const small = batang.filter((el) => parseFloat(getComputedStyle(el).fontSize) < 24);
  rules.push(row('Gowun Batang ≥ 24px (outside the 16px stress test)', small.length ? `${small.length} smaller` : `${batang.length} checked`, !small.length));

  document.querySelector('#rule-checks')!.innerHTML = rules.join('');
}

// The 16px stress test in Gowun Batang is a deliberate test-only exception.
document.querySelectorAll('.sample p[style*="font-size:16px"]').forEach((p) => p.setAttribute('data-test-only', ''));

document.querySelector('#device')!.textContent = `This browser: ${browserName()} · screen ${window.innerWidth}px wide`;
renderContrast();
document.fonts.ready.then(() => {
  document.querySelectorAll<HTMLElement>('.status[data-family]').forEach((el) => {
    const family = el.dataset.family!;
    const ok = [...document.fonts].some((f) => f.family.replace(/['"]/g, '') === family && f.status === 'loaded');
    el.textContent = ok ? 'loaded' : 'not loaded';
    el.classList.add(ok ? 'ok' : 'bad');
  });
  renderRules();
});
