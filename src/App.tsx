import { useEffect, useRef, useState } from 'react';

const IP = '89.188.109.183';
const PORT = '25903';
const TG_LINK = 'https://t.me/buildingzone_cube';

const FEATURES = [
  {
    title: 'Уникальные постройки',
    text: 'Каждая работа участников - произведение искусства, созданное с душой и вдохновлением. От маленьких домиков до грандиозных городов.',
  },
  {
    title: 'Творческая атмосфера',
    text: 'Свобода самовыражения и поддержка сообщества - главные ценности проекта. Здесь не судят, а вдохновляют.',
  },
  {
    title: 'Активная поддержка',
    text: 'Команда сервера всегда на связи и готова помочь в любой ситуации. Ваш вопрос не останется без ответа.',
  },
  {
    title: 'Надёжные плагины',
    text: 'Плагины, готовые к любой неприятности: приваты, откат грифа и защита мира. Ваш прогресс всегда в безопасности.',
  },
  {
    title: 'Атмосферные локации',
    text: 'Продуманные спавны, дороги и природные ансамбли - исследовать мир так же приятно, как и строить.',
  },
  {
    title: 'Дружное комьюнити',
    text: 'Игроки, которые вдохновляются созданием чего-то по-настоящему красивого. Вместе строить веселее.',
  },
];

const SLIDES = [
  './images/one.jpg',
  './images/two.jpg',
  './images/three.jpg',
  './images/four.jpg',
  './images/five.jpg',
  './images/six.jpg',
  './images/seven.jpg',
  './images/eight.jpg',
];

const NAMES = ['Padjilloi', 'AstutePlot58', 'Dezik9410', 'WaryMold3335', 'УниБлок'];

const STATS = [
  { n: 3, suffix: '', label: 'сезона истории' },
  { n: 100, suffix: '+', label: 'построек на карте' },
  { n: 20, suffix: '+', label: 'игроков в комьюнити' },
  { n: 100, suffix: '%', label: 'аптайм 24/7' },
];

const MARQUEE = ['Строй', 'Вдохновляй', 'Создавай', 'Делись', 'Мечтай', 'Исследуй'];

const NAV_LINKS = [
  { href: '#about', label: 'О сервере' },
  { href: '#features', label: 'Возможности' },
  { href: '#gallery', label: 'Галерея' },
  { href: '#connect', label: 'Подключение' },
];

/* ============ лёгкое воксельное поле на canvas ============ */

type Voxel = {
  x: number;
  y: number;
  s: number;
  v: number;
  ph: number;
  d: number;
  hue: number;
  a: number;
};

function drawCube(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, hue: number, a: number) {
  const depth = s * 0.95;
  const top: [number, number] = [x, y - s * 0.5];
  const right: [number, number] = [x + s, y];
  const bottom: [number, number] = [x, y + s * 0.5];
  const left: [number, number] = [x - s, y];
  const poly = (pts: [number, number][]) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fill();
  };
  ctx.fillStyle = `hsla(${hue},95%,68%,${a})`;
  poly([top, right, bottom, left]);
  ctx.fillStyle = `hsla(${hue},90%,52%,${a})`;
  poly([left, bottom, [bottom[0], bottom[1] + depth], [left[0], left[1] + depth]]);
  ctx.fillStyle = `hsla(${hue},85%,40%,${a})`;
  poly([right, bottom, [bottom[0], bottom[1] + depth], [right[0], right[1] + depth]]);
}

function VoxelCanvas({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (anywhere: boolean): Voxel => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 70,
      s: 7 + Math.random() * 16,
      v: 0.16 + Math.random() * 0.4,
      ph: Math.random() * Math.PI * 2,
      d: 0.3 + Math.random() * 0.7,
      hue: 12 + Math.random() * 24,
      a: 0.05 + Math.random() * 0.11,
    });

    const N = w < 768 ? 14 : 26;
    const cubes: Voxel[] = Array.from({ length: N }, () => spawn(true));

    let tmx = 0;
    let tmy = 0;
    let mx = 0;
    let my = 0;
    let inView = false;
    const onMove = (e: MouseEvent) => {
      if (!inView || reducedMotion.matches) return;
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let raf = 0;
    let last = performance.now();
    let t = 0;
    const draw = (now: number) => {
      const dt = Math.min(2, (now - last) / 16.67);
      last = now;
      t += 0.008 * dt;
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;
      ctx.clearRect(0, 0, w, h);
      for (const c of cubes) {
        c.y -= c.v * dt;
        if (c.y < -80) Object.assign(c, spawn(false));
        const px = c.x + mx * 22 * c.d + Math.sin(t * 2 + c.ph) * 6;
        const py = c.y + my * 16 * c.d;
        drawCube(ctx, px, py, c.s, c.hue, c.a);
      }
      raf = requestAnimationFrame(draw);
    };

    // Keep a single animation loop, and only while the hero is visible.
    const syncPlayback = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (inView && !document.hidden && !reducedMotion.matches) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(canvas);
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', syncPlayback);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('visibilitychange', syncPlayback);
      reducedMotion.removeEventListener('change', syncPlayback);
    };
  }, [enabled]);

  return <canvas id="voxels" ref={ref} aria-hidden="true" />;
}

/* ============ расшифровка заголовков ============ */

const SCR_CHARS = '█▓▒░<>/\\|+=*—BZ';
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

/* ============ приложение ============ */

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState('');
  const [idx, setIdx] = useState(0);

  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);
  const touchX = useRef<number | null>(null);

  /* настоящая загрузка: шрифты + все фото галереи */
  useEffect(() => {
    let alive = true;
    const done = new Set<string>();
    const total = SLIDES.length;

    const tick = () => {
      if (!alive) return;
      setProgress(Math.min(99, Math.round((done.size / total) * 100)));
    };

    const loadImg = (src: string) =>
      new Promise<void>((resolve) => {
        const im = new Image();
        const fin = () => {
          done.add(src);
          tick();
          resolve();
        };
        im.onload = fin;
        im.onerror = fin; // фото нет - просто чёрный слайд, загрузка идёт дальше
        im.src = src;
      });

    Promise.all([
      ...SLIDES.map(loadImg),
      (document as Document & { fonts?: FontFaceSet }).fonts?.ready ?? Promise.resolve(),
    ]).then(() => {
      if (!alive) return;
      setProgress(100);
      window.setTimeout(() => alive && setLoaded(true), 320);
    });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = loaded ? '' : 'hidden';
  }, [loaded]);

  /* кастомный курсор */
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
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
    const onVisibilityChange = () => {
      if (document.hidden) stop();
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      ring.classList.toggle('hovered', !!t?.closest('a,button,.gal-dot'));
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    document.addEventListener('mouseleave', stop);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      document.removeEventListener('mouseleave', stop);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stop();
    };
  }, []);

  /* навбар + прогресс скролла (через rAF, без layout-трэша) */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      navRef.current?.classList.toggle('scrolled', y > 40);
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /* reveal + scramble + счётчики */
  useEffect(() => {
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

    return () => {
      io.disconnect();
      so.disconnect();
      co.disconnect();
    };
  }, []);

  /* прожектор карточек (только CSS-переменные) */
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.spotlight'));
    const move = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    cards.forEach((c) => c.addEventListener('mousemove', move, { passive: true }));
    return () => cards.forEach((c) => c.removeEventListener('mousemove', move));
  }, []);

  /* магнитные кнопки (rAF, без дёрганья) */
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
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
    return () =>
      els.forEach((c) => {
        c.removeEventListener('mousemove', move);
        c.removeEventListener('mouseleave', leave);
        const frame = frames.get(c);
        if (frame !== undefined) cancelAnimationFrame(frame);
      });
  }, []);

  /* автоплей слайдера */
  useEffect(() => {
    const gallery = galleryRef.current;
    if (!loaded || !gallery) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    let timer: number | undefined;
    const syncPlayback = () => {
      window.clearInterval(timer);
      timer = undefined;
      if (!inView || document.hidden || reducedMotion.matches) return;
      timer = window.setInterval(() => {
        if (!pauseRef.current) setIdx((i) => (i + 1) % SLIDES.length);
      }, 5000);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.1 });
    observer.observe(gallery);
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', syncPlayback);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      reducedMotion.removeEventListener('change', syncPlayback);
    };
  }, [loaded]);

  const copy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      /* noop */
    }
    setCopied(key);
    window.setTimeout(() => setCopied(''), 1600);
  };

  const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.visibility = 'hidden';
  };

  const titleWords = ['Building', 'Zone'];
  let letterIdx = 0;

  return (
    <div className={loaded ? 'ready' : ''}>
      {/* прелоадер - реальный прогресс загрузки сайта */}
      <div className={`preloader ${loaded ? 'done' : ''}`} aria-hidden={loaded}>
        <div className="pre-cube" />
        <div className="pre-logo">Building Zone</div>
        <div className="pre-bar">
          <div className="pre-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="pre-count">{String(progress).padStart(3, '0')} %</div>
      </div>

      {/* курсор */}
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />

      {/* прогресс скролла */}
      <div className="progress" ref={barRef} />

      {/* навигация */}
      <nav className={`nav ${loaded ? 'show' : ''}`} ref={navRef}>
        <a href="#top" className="nav-logo">
          Building Zone
        </a>
        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <a href={TG_LINK} target="_blank" rel="noopener noreferrer" className="nav-tg magnetic">
          Telegram
        </a>
      </nav>

      {/* hero */}
      <header className="hero" id="top">
        <VoxelCanvas enabled={loaded} />
        <div className="hero-grid-overlay" />
        <div className="orbit o1" />
        <div className="orbit o2" />
        <div className="orbit o3" />
        <div className="hero-side left">Est. Season 3 - Minecraft Bedrock</div>
        <div className="hero-side right">89.188.109.183 : 25903</div>

        <div className="hero-content">
          <div className="badge">
            <span className="dot" />
            Сервер онлайн 24/7
          </div>
          <h1 className="hero-title">
            {titleWords.map((wd, wi) => (
              <span className="ht-word" key={wi}>
                {wd.split('').map((ch, ci) => {
                  const delay = 0.32 + letterIdx++ * 0.045;
                  return (
                    <span className="ht-letter" style={{ animationDelay: `${delay}s` }} key={ci}>
                      {ch}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>
          <p className="hero-sub">
            Место, где встречаются красота построек и вдохновение. Творческое пространство для тех, кто ценит
            эстетику мира Minecraft.
          </p>
          <div className="hero-btns">
            <a href="#connect" className="btn btn-primary magnetic">
              Подключиться
            </a>
            <a href={TG_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-secondary magnetic">
              Telegram-канал
            </a>
          </div>
        </div>

        <div className="scroll-hint">
          <div className="mouse">
            <span />
          </div>
          Листайте
        </div>
      </header>

      {/* бегущая строка */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((n) => (
            <span key={n}>
              {MARQUEE.map((m, i) => (
                <span key={i} style={{ padding: 0, gap: 44, letterSpacing: '0.4em' }}>
                  {m} <i>✦</i>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* о сервере */}
      <section className="about" id="about">
        <div className="container">
          <div className="sec-head reveal">
            <div className="sec-tag">01 - О сервере</div>
            <h2 className="section-title grad-text" data-scramble>
              История в каждом блоке
            </h2>
            <p className="section-sub">Продуманные постройки, атмосферные локации и дружелюбное сообщество</p>
          </div>
          <div className="about-grid">
            <div className="about-text reveal">
              <p className="about-lead">
                <strong>Building Zone</strong> - творческое пространство, созданное для тех, кто ценит эстетику
                мира Minecraft.
              </p>
              <p>
                Здесь вы найдёте продуманные постройки, атмосферные локации и дружелюбное сообщество игроков,
                которые вдохновляются созданием чего-то по-настоящему красивого.
              </p>
              <p>
                За все сезоны проекта было построено очень много красивых, спорных и даже маленьких построек.
                Но все они имеют вес и право войти в Историю.
              </p>
              <div className="stats">
                {STATS.map((s, i) => (
                  <div className={`stat reveal d${i + 1}`} key={i}>
                    <div className="stat-num" data-count={s.n} data-suffix={s.suffix}>
                      0{s.suffix}
                    </div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-visual reveal d2">
              <div className="about-photo spotlight">
                <img src={SLIDES[6]} alt="Постройка игроков Building Zone" decoding="async" onError={hideBroken} />
                <div className="about-photo-glow" />
                <div className="about-badge">
                  Сезон 3
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* возможности */}
      <section className="features" id="features">
        <div className="container">
          <div className="sec-head reveal">
            <div className="sec-tag">02 - Возможности</div>
            <h2 className="section-title grad-text" data-scramble>
              Всё для творчества
            </h2>
            <p className="section-sub">Всё, что нужно для комфортного строительства и вдохновения</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div className={`f-card spotlight reveal d${(i % 3) + 1}`} key={i}>
                <span className="f-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* галерея */}
      <section className="gallery" id="gallery" ref={galleryRef}>
        <div className="container">
          <div className="sec-head reveal">
            <div className="sec-tag">03 - Галерея</div>
            <h2 className="section-title grad-text" data-scramble>
              Постройки сервера
            </h2>
            <p className="section-sub">Оцените атмосферу сервера сами - листайте слайды</p>
          </div>
          <div
            className="gal-viewport reveal"
            onMouseEnter={() => (pauseRef.current = true)}
            onMouseLeave={() => (pauseRef.current = false)}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current == null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 42) setIdx((i) => (i + (dx < 0 ? 1 : -1) + SLIDES.length) % SLIDES.length);
              touchX.current = null;
            }}
          >
            <div className="gal-track" style={{ transform: `translate3d(-${idx * 100}%,0,0)` }}>
              {SLIDES.map((src, i) => (
                <div className="slide" key={src} aria-hidden={i !== idx}>
                  <img
                    src={src}
                    alt={`Постройка Building Zone, фото ${i + 1}`}
                    decoding="async"
                    draggable={false}
                    onError={hideBroken}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="gal-ctl reveal d1">
            <button
              className="gal-btn"
              aria-label="Назад"
              onClick={() => setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
            >
              ←
            </button>
            <div className="gal-dots">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`gal-dot ${i === idx ? 'on' : ''}`}
                  aria-label={`Слайд ${i + 1}`}
                  aria-pressed={i === idx}
                  onClick={() => setIdx(i)}
                />
              ))}
            </div>
            <span className="gal-count">
              {String(idx + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
            </span>
            <button className="gal-btn" aria-label="Вперёд" onClick={() => setIdx((i) => (i + 1) % SLIDES.length)}>
              →
            </button>
          </div>
        </div>
      </section>

      {/* подключение - терминал */}
      <section className="connect" id="connect">
        <div className="container">
          <div className="sec-head reveal">
            <div className="sec-tag">04 - Подключение</div>
            <h2 className="section-title grad-text" data-scramble>
              Канал связи открыт
            </h2>
            <p className="section-sub">Сервер работает постоянно - заходите в любое время</p>
          </div>
          <div className="term reveal">
            <div className="term-head">
              <span className="t-dot r" />
              <span className="t-dot y" />
              <span className="t-dot g" />
              <span className="term-title">building-zone - connect.exe</span>
            </div>
            <div className="term-body">
              <div className="t-prompt">
                <span className="u">player@bedrock</span>:<span className="c">~</span>$ connect Building Zone
              </div>
              <div className="t-line">
                <span className="t-k">IP адрес</span>
                <span className="t-val">
                  <span className="t-v">{IP}</span>
                  <button className={`t-copy ${copied === 'ip2' ? 'ok' : ''}`} onClick={() => copy(IP, 'ip2')}>
                    {copied === 'ip2' ? '✓ ok' : 'copy'}
                  </button>
                </span>
              </div>
              <div className="t-line">
                <span className="t-k">Полный адрес</span>
                <span className="t-val">
                  <span className="t-v">
                    {IP}:{PORT}
                  </span>
                  <button
                    className={`t-copy ${copied === 'full' ? 'ok' : ''}`}
                    onClick={() => copy(`${IP}:${PORT}`, 'full')}
                  >
                    {copied === 'full' ? '✓ ok' : 'copy'}
                  </button>
                </span>
              </div>
              <div className="t-line">
                <span className="t-k">Версия</span>
                <span className="t-v">1.21.50–51</span>
              </div>
              <div className="t-line">
                <span className="t-k">Название в IceCube</span>
                <span className="t-v">Building Zone</span>
              </div>
              <div className="t-line">
                <span className="t-k">Имя при подключении</span>
                <span className="t-v">любое</span>
              </div>
              <div className="term-cursor">
                awaiting connection <span className="blink">▊</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* благодарности */}
      <section className="thanks">
        <div className="container">
          <div className="sec-head reveal" style={{ marginBottom: 0 }}>
            <div className="sec-tag">05 - Благодарности</div>
            <h2 className="section-title grad-text" data-scramble>
              Хранителям сервера
            </h2>
          </div>
          <blockquote className="quote reveal">
            Огромнейшая благодарность людям, которые хранят покой и красоту сервера. Спасибо, что вы со мной.
          </blockquote>
          <div className="names reveal d1">
            {NAMES.map((n) => (
              <span className="name-tag" key={n}>
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="cta">
        <div className="cta-box reveal">
          <h2>Самое безопасное место для строительства</h2>
          <p>Присоединяйся к нашему сообществу и создавай свою историю</p>
          <a href={TG_LINK} target="_blank" rel="noopener noreferrer" className="btn-3d">
            Telegram-канал <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* footer */}
      <footer>
        <div className="f-logo">
          Building Zone
        </div>
        <div className="f-links">
          <a href="#about">О сервере</a>
          <a href="#gallery">Галерея</a>
          <a href="#connect">Подключение</a>
          <a href={TG_LINK} target="_blank" rel="noopener noreferrer">
            Наш Telegram
          </a>
        </div>
        <p>© Oxxygen Production · Создано с ❤️ для игроков</p>
        <p className="f-ip" style={{ marginTop: 10 }}>
          IP: {IP}:{PORT} · Версия 1.21.50–51
        </p>
      </footer>
    </div>
  );
}
