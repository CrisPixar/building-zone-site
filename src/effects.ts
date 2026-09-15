/* ============================================================
   Мелкие интерактивные эффекты (курсор, магнит, прожектор,
   reveal, scramble, счётчики, прогресс скролла).
   ============================================================ */

const finePointer = () => window.matchMedia('(pointer: fine)').matches;

/* ---------- пауза CSS-анимаций на скрытых блоках ---------- */

/** вешает класс на <body>, когда элемент вне экрана (экономит CPU/батарею) */
export function pauseWhenOffscreen(el: Element | null, bodyClass: string) {
  if (!el) return;
  const io = new IntersectionObserver(([entry]) => document.body.classList.toggle(bodyClass, !entry.isIntersecting), {
    threshold: 0,
  });
  io.observe(el);
}

export function pauseInBackgroundTab() {
  const sync = () => document.body.classList.toggle('tab-idle', document.hidden);
  document.addEventListener('visibilitychange', sync);
  sync();
}

/* ---------- прогресс скролла + фон навбара ---------- */

export function initScrollProgress(nav: HTMLElement | null, bar: HTMLElement | null) {
  let raf = 0;
  const update = () => {
    raf = 0;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav?.classList.toggle('scrolled', y > 40);
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

/* ---------- кастомный курсор ---------- */

export function initCursor(dot: HTMLElement | null, ring: HTMLElement | null) {
  if (!dot || !ring) return;
  if (!window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;
  let raf = 0;
  const loop = () => {
    raf = 0;
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    const settled = Math.abs(mx - rx) + Math.abs(my - ry) < 0.2;
    if (settled) {
      rx = mx;
      ry = my;
    }
    dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
    if (!settled) raf = requestAnimationFrame(loop);
  };
  const move = (e: MouseEvent) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.opacity = '1';
    ring.style.opacity = '1';
    if (!raf) raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  };
  const over = (e: MouseEvent) => {
    const t = e.target as HTMLElement | null;
    ring.classList.toggle('hovered', !!t?.closest('a,button,.gal-dot'));
  };
  window.addEventListener('mousemove', move, { passive: true });
  window.addEventListener('mouseover', over, { passive: true });
  document.addEventListener('mouseleave', stop);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
}

/* ---------- reveal, scramble, счётчики ---------- */

const SCR_CHARS = '█▓▒░<>/\\|+=*-BZ';

function scramble(el: HTMLElement) {
  const final = el.dataset.final || el.textContent || '';
  let frame = 0;
  const total = Math.max(18, final.length * 2);
  const iv = window.setInterval(() => {
    frame++;
    const p = frame / total;
    let out = '';
    for (let i = 0; i < final.length; i++) {
      if (final[i] === ' ') {
        out += ' ';
        continue;
      }
      out += i / final.length < p ? final[i] : SCR_CHARS[(Math.random() * SCR_CHARS.length) | 0];
    }
    el.textContent = out;
    if (frame >= total) {
      el.textContent = final;
      window.clearInterval(iv);
    }
  }, 28);
}

export function initRevealAnimations() {
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  const so = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          scramble(e.target as HTMLElement);
          so.unobserve(e.target);
        }
      }),
    { threshold: 0.6 }
  );
  document.querySelectorAll('[data-scramble]').forEach((el) => {
    el.setAttribute('data-final', el.textContent || '');
    so.observe(el);
  });

  const co = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const target = Number(el.dataset.count || 0);
        const suffix = el.dataset.suffix || '';
        const t0 = performance.now();
        const dur = 1400;
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * eased)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        co.unobserve(el);
      }),
    { threshold: 0.6 }
  );
  document.querySelectorAll('[data-count]').forEach((el) => co.observe(el));
}

/* ---------- прожектор карточек ---------- */

export function initSpotlight() {
  if (!finePointer()) return;
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.spotlight'));
  const move = (e: MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  cards.forEach((c) => c.addEventListener('mousemove', move, { passive: true }));
}

/* ---------- магнитные кнопки ---------- */

export function initMagnetic() {
  if (!finePointer()) return;
  const els = Array.from(document.querySelectorAll<HTMLElement>('.magnetic'));
  const frames = new WeakMap<HTMLElement, number>();
  const apply = (el: HTMLElement, x: number, y: number) => {
    const prev = frames.get(el);
    if (prev) cancelAnimationFrame(prev);
    frames.set(
      el,
      requestAnimationFrame(() => {
        el.style.transform = `translate3d(${x}px,${y}px,0)`;
      })
    );
  };
  const move = (e: MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    apply(el, (e.clientX - r.left - r.width / 2) * 0.18, (e.clientY - r.top - r.height / 2) * 0.18);
  };
  const leave = (e: MouseEvent) => apply(e.currentTarget as HTMLElement, 0, 0);
  els.forEach((c) => {
    c.addEventListener('mousemove', move, { passive: true });
    c.addEventListener('mouseleave', leave);
  });
}
