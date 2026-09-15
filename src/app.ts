/* ============================================================
   Точка сборки страницы: разметка + все эффекты + прелоадер.
   ============================================================ */

import {
  initCursor,
  initMagnetic,
  initRevealAnimations,
  initScrollProgress,
  initSpotlight,
  pauseInBackgroundTab,
  pauseWhenOffscreen,
} from './effects';
import { initGallery } from './gallery';
import { buildPage } from './markup';
import { startVoxels } from './voxels';

export function mount(root: HTMLElement) {
  root.innerHTML = `<div id="page">${buildPage()}</div>`;

  const page = document.getElementById('page');
  const preloader = document.getElementById('preloader');
  const fill = document.getElementById('pre-fill');
  const counter = document.getElementById('pre-count');
  const nav = document.getElementById('nav');
  const bar = document.getElementById('progress');

  let loaded = false;
  const isReady = () => loaded;

  document.body.style.overflow = 'hidden';

  /* ---------- прелоадер: ждём шрифты и первый слайд ---------- */

  let finished = false;
  const marks = new Set<string>();
  const need = 2;
  const setProgress = (v: number) => {
    if (fill) fill.style.width = `${v}%`;
    if (counter) counter.textContent = `${String(v).padStart(3, '0')} %`;
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    setProgress(100);
    window.setTimeout(onLoaded, 320);
  };
  const mark = (key: string) => {
    if (finished) return;
    marks.add(key);
    setProgress(Math.min(99, Math.round((marks.size / need) * 100)));
    if (marks.size >= need) finish();
  };

  // первый слайд уже есть в разметке - ждём именно его, без второго запроса
  const firstSlide = document.querySelector<HTMLImageElement>('#gal-track img');
  if (firstSlide && firstSlide.complete) mark('slide');
  else if (firstSlide) {
    firstSlide.addEventListener('load', () => mark('slide'), { once: true });
    firstSlide.addEventListener('error', () => mark('slide'), { once: true });
  } else {
    mark('slide');
  }

  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  if (fonts) fonts.then(() => mark('fonts'), () => mark('fonts'));
  else mark('fonts');

  // страховка: застрявшая сеть или шрифты не должны держать прелоадер вечно
  const hardStop = window.setTimeout(finish, 6000);

  function onLoaded() {
    if (loaded) return;
    loaded = true;
    window.clearTimeout(hardStop);
    page?.classList.add('ready');
    nav?.classList.add('show');
    preloader?.classList.add('done');
    preloader?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    gallery.syncPlayback();
    const canvas = document.getElementById('voxels');
    if (canvas) startVoxels(canvas as HTMLCanvasElement);
  }

  /* ---------- клики: копирование адреса ---------- */

  const legacyCopy = (text: string) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  };

  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-copy]');
    if (!btn) return;
    const text = btn.dataset.copy || '';
    const done = () => {
      btn.classList.add('ok');
      btn.textContent = '✓ ok';
      window.setTimeout(() => {
        btn.classList.remove('ok');
        btn.textContent = 'copy';
      }, 1600);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done, () => (legacyCopy(text) ? done() : undefined));
    } else if (legacyCopy(text)) {
      done();
    }
  });

  /* ---------- битые картинки не показываем ---------- */

  document.querySelectorAll<HTMLImageElement>('img').forEach((img) =>
    img.addEventListener('error', () => {
      img.style.visibility = 'hidden';
    })
  );

  /* ---------- эффекты ---------- */

  initScrollProgress(nav, bar);
  initCursor(document.getElementById('cursor-dot'), document.getElementById('cursor-ring'));
  initRevealAnimations();
  initSpotlight();
  initMagnetic();
  pauseInBackgroundTab();

  const gallery = initGallery(isReady);

  // тяжёлые бесконечные анимации стоят на паузе, пока блок вне экрана
  pauseWhenOffscreen(document.querySelector('.hero'), 'hero-idle');
  pauseWhenOffscreen(document.querySelector('.marquee'), 'marquee-idle');
  pauseWhenOffscreen(document.querySelector('.cta-box'), 'cta-idle');

  setProgress(0);
}
