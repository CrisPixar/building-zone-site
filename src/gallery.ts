/* ============================================================
   Галерея: свайпы, точки, автоплей (как раньше) + ленивая
   догрузка слайдов: тянем только следующий, а не все 8 сразу.
   ============================================================ */

import { IMAGES, webp } from './data';

export function initGallery(isReady: () => boolean) {
  const track = document.getElementById('gal-track');
  const viewport = document.getElementById('gal-viewport');
  const dotsWrap = document.getElementById('gal-dots');
  const counter = document.getElementById('gal-count');
  const prevBtn = document.getElementById('gal-prev');
  const nextBtn = document.getElementById('gal-next');
  if (!track || !viewport) return { syncPlayback: () => {} };

  const total = IMAGES.length;
  const slides = Array.from(track.children);
  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll<HTMLButtonElement>('.gal-dot')) : [];
  const loading = new Set<number>();

  let idx = 0;
  let paused = false;

  // все слайды грузятся вместе со страницей (их ждёт прелоадер), поэтому
  // отдельная догрузка нужна только как страховка: если сеть не успела
  // и прелоадер отпустило по таймауту, дотягиваем текущий и следующий слайды.
  const preload = (i: number) => {
    const n = ((i % total) + total) % total;
    if (loading.has(n)) return;
    loading.add(n);
    const im = new Image();
    im.decoding = 'async';
    im.src = webp(IMAGES[n]);
  };

  const render = () => {
    track.style.transform = `translate3d(-${idx * 100}%,0,0)`;
    slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== idx)));
    dots.forEach((d, i) => {
      d.classList.toggle('on', i === idx);
      d.setAttribute('aria-pressed', String(i === idx));
    });
    if (counter) counter.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  };

  const go = (i: number) => {
    idx = ((i % total) + total) % total;
    render();
    preload(idx + 1);
  };

  render();
  if (track.firstElementChild) preload(idx + 1);

  prevBtn?.addEventListener('click', () => go(idx - 1));
  nextBtn?.addEventListener('click', () => go(idx + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

  viewport.addEventListener('mouseenter', () => (paused = true));
  viewport.addEventListener('mouseleave', () => (paused = false));

  let touchX: number | null = null;
  viewport.addEventListener(
    'touchstart',
    (e) => {
      touchX = e.touches[0].clientX;
    },
    { passive: true }
  );
  viewport.addEventListener(
    'touchend',
    (e) => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 42) go(idx + (dx < 0 ? 1 : -1));
      touchX = null;
    },
    { passive: true }
  );

  /* автоплей идёт только когда слайдер на экране, вкладка активна
     и пользователь не отключил анимации */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false;
  let timer: number | undefined;
  const syncPlayback = () => {
    window.clearInterval(timer);
    timer = undefined;
    if (!isReady() || !inView || document.hidden || reducedMotion.matches) return;
    timer = window.setInterval(() => {
      if (!paused) go(idx + 1);
    }, 5000);
  };
  const observer = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (inView) preload(idx + 1);
      syncPlayback();
    },
    { threshold: 0.1 }
  );
  observer.observe(viewport);
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', syncPlayback);

  return { syncPlayback };
}
