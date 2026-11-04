// Font test page: shows Korean and English in every game font.
// Korean samples come only from the approved word list in content/words.json.
import './fonts.css';
import './fonts-test.css';
import words from '../content/words.json';

const koWords = words.words.map((w) => w.word).join(' ');
// Every modern hangul letter (consonants ㄱ–ㅎ incl. clusters, vowels ㅏ–ㅣ).
const letters = Array.from({ length: 0x3163 - 0x3131 + 1 }, (_, i) => String.fromCharCode(0x3131 + i)).join(' ');
const english = 'The quick brown fox jumps over the lazy dog. 0123456789 “Hello!” — it’s cozy…';

type FontSpec = {
  family: string;
  role: string;
  weights: number[];
  korean: boolean;
  letters?: boolean;
};

const fonts: FontSpec[] = [
  { family: 'Gowun Dodum', role: 'Learning text (Korean)', weights: [400], korean: true },
  { family: 'Nunito', role: 'Learning text (English)', weights: [400, 700, 900], korean: false },
  { family: 'Pretendard', role: 'Menus; large letters in lessons', weights: [400, 600, 800], korean: true, letters: true },
  { family: 'Gowun Batang', role: 'Titles (Korean)', weights: [400, 700], korean: true },
  { family: 'Lora', role: 'Titles (English)', weights: [400, 700], korean: false },
];

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);

function fontSection(f: FontSpec): string {
  const ff = `font-family: '${f.family}', monospace`;
  const weights = f.weights
    .map((w) => `<span style="font-weight:${w}">${w}: ${f.korean ? '안녕 ' : ''}Hello</span>`)
    .join('');
  return `
    <section>
      <h2>${f.family}</h2>
      <p class="meta">${f.role} · <span class="status" data-family="${f.family}">checking…</span></p>
      ${f.korean ? `<p class="sample big" style="${ff}">안녕 엄마 나무 문</p>` : ''}
      ${f.korean ? `<p class="sample" style="${ff}; font-size:1.25rem"><span class="label">Approved words</span>${koWords}</p>` : ''}
      ${f.letters ? `<p class="sample letters" style="${ff}">ㄱ ㄴ ㅁ ㅇ ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ</p>` : ''}
      ${f.korean ? `<p class="sample" style="${ff}; font-size:1.5rem"><span class="label">All letters</span>${letters}</p>` : ''}
      <p class="sample" style="${ff}; font-size:1.25rem"><span class="label">English</span>${esc(english)}</p>
      <p class="sample weights" style="${ff}; font-size:1.25rem"><span class="label">Weights</span>${weights}</p>
    </section>`;
}

const inUse = `
  <section>
    <h2>Fonts together</h2>
    <p class="meta">How the font pairs look when Korean and English share a line.</p>
    <p class="sample" style="font-family: var(--font-title); font-size:2rem; font-weight:700">
      <span class="label">Title · Lora + Gowun Batang</span>Hangul Town · 안녕</p>
    <p class="sample" style="font-family: var(--font-learn); font-size:1.4rem">
      <span class="label">Learning text · Nunito + Gowun Dodum</span>The 아이 is crying by the 문. Can you find the 여우?</p>
    <p class="sample" style="font-family: var(--font-ui); font-size:1.1rem">
      <span class="label">Menu · Pretendard</span>Settings · Codex · 메뉴</p>
  </section>`;

document.querySelector<HTMLElement>('#app')!.innerHTML = `
  <h1>Font test</h1>
  <p class="intro">Each game font with Korean and English. A red “not loaded” means the browser fell back to another font.</p>
  ${inUse}
  ${fonts.map(fontSection).join('')}`;

// Confirm each font file actually loaded (not a system fallback).
document.fonts.ready.then(() => {
  document.querySelectorAll<HTMLElement>('.status').forEach((el) => {
    const family = el.dataset.family!;
    const ok = [...document.fonts].some((f) => f.family.replace(/['"]/g, '') === family && f.status === 'loaded');
    el.textContent = ok ? 'loaded' : 'not loaded';
    el.classList.add(ok ? 'ok' : 'bad');
  });
});
