/* ============================================================
   Разметка страницы (тот же DOM и те же классы, что и раньше).
   Собирается один раз при старте - без фреймворка и VDOM.
   ============================================================ */

import {
  ABOUT_IMAGE,
  ADD_SERVER_LINK,
  ADDRESS,
  FEATURES,
  IMAGES,
  IMG_H,
  IMG_W,
  MARQUEE,
  NAMES,
  NAV_LINKS,
  SITE,
  STATS,
  TG_LINK,
  jpg,
  webp,
} from './data';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** заголовок hero: буквы, выезжающие по одной (задержки как раньше) */
function heroTitle(): string {
  const words = ['Building', 'Zone'];
  let i = 0;
  return words
    .map(
      (word) =>
        `<span class="ht-word">${[...word]
          .map((ch) => `<span class="ht-letter" style="animation-delay:${(0.32 + i++ * 0.045).toFixed(3)}s">${ch}</span>`)
          .join('')}</span>`
    )
    .join('');
}

function marquee(): string {
  const set = MARQUEE.map((m) => `<span style="padding:0;gap:44px;letter-spacing:0.4em">${m} <i>✦</i></span>`).join('');
  return `<div class="marquee-track"><span>${set}</span><span>${set}</span></div>`;
}

function stats(): string {
  return STATS.map(
    (s, i) =>
      `<div class="stat reveal d${i + 1}"><div class="stat-num" data-count="${s.n}" data-suffix="${esc(s.suffix)}">0${esc(
        s.suffix
      )}</div><div class="stat-label">${esc(s.label)}</div></div>`
  ).join('');
}

function features(): string {
  return FEATURES.map(
    (f, i) =>
      `<div class="f-card spotlight reveal d${(i % 3) + 1}"><span class="f-num">${String(i + 1).padStart(
        2,
        '0'
      )}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div>`
  ).join('');
}

function slides(): string {
  return IMAGES.map((name, i) => {
    const first = i === 0;
    return (
      `<div class="slide" aria-hidden="${i !== 0}">` +
      `<picture>` +
      `<source srcset="${webp(name)}" type="image/webp" />` +
      // Все слайды грузятся сразу вместе со страницей (их ждёт прелоадер),
      // чтобы при листании не было чёрных кадров. Первый - с высоким приоритетом.
      `<img src="${jpg(name)}" alt="${esc(
        `Постройка Building Zone, фото ${i + 1} из ${IMAGES.length}`
      )}" width="${IMG_W}" height="${IMG_H}" decoding="async" loading="eager" ` +
      `fetchpriority="${first ? 'high' : 'low'}" draggable="false" />` +
      `</picture></div>`
    );
  }).join('');
}

function dots(): string {
  return IMAGES.map(
    (_, i) =>
      `<button class="gal-dot${i === 0 ? ' on' : ''}" aria-label="Слайд ${i + 1}" aria-pressed="${
        i === 0 ? 'true' : 'false'
      }"></button>`
  ).join('');
}

/** строка терминала: ключ - значение (+ кнопка «copy» и/или ссылка) */
function line(key: string, value: string, opts: { copy?: string; href?: string; external?: boolean } = {}): string {
  const text = opts.href
    ? `<a class="t-v" href="${opts.href}"${
        opts.external ? ' target="_blank" rel="noopener noreferrer"' : ' title="Добавить сервер в Minecraft"'
      }>${esc(value)}</a>`
    : `<span class="t-v">${esc(value)}</span>`;
  const btn = opts.copy
    ? `<button class="t-copy" type="button" data-copy="${esc(opts.copy)}">copy</button>`
    : '';
  return `<div class="t-line"><span class="t-k">${esc(key)}</span><span class="t-val">${text}${btn}</span></div>`;
}

export function buildPage(): string {
  return /* html */ `
      <!-- прелоадер - реальный прогресс загрузки сайта -->
      <div class="preloader" id="preloader" aria-hidden="false">
        <div class="pre-cube"></div>
        <div class="pre-logo">Building Zone</div>
        <div class="pre-bar"><div class="pre-fill" id="pre-fill"></div></div>
        <div class="pre-count" id="pre-count">000 %</div>
      </div>

      <!-- курсор -->
      <div class="cursor-dot" id="cursor-dot"></div>
      <div class="cursor-ring" id="cursor-ring"></div>

      <!-- прогресс скролла -->
      <div class="progress" id="progress"></div>

      <!-- навигация -->
      <nav class="nav" id="nav">
        <a href="#top" class="nav-logo">Building Zone</a>
        <div class="nav-links">${NAV_LINKS.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}</div>
        <a href="${TG_LINK}" target="_blank" rel="noopener noreferrer" class="nav-tg magnetic">Telegram</a>
      </nav>

      <!-- hero -->
      <header class="hero" id="top">
        <canvas id="voxels" aria-hidden="true"></canvas>
        <div class="hero-grid-overlay"></div>
        <div class="orbit o1"></div>
        <div class="orbit o2"></div>
        <div class="orbit o3"></div>
        <div class="hero-side left">Est. Season 3 - Minecraft Bedrock</div>
        <div class="hero-side right">${esc(SITE.host)} : ${esc(SITE.port)}</div>

        <div class="hero-content">
          <div class="badge"><span class="dot"></span>Сервер онлайн 24/7</div>
          <h1 class="hero-title">${heroTitle()}</h1>
          <p class="hero-sub">Место, где встречаются красота построек и вдохновение. Творческое пространство для тех, кто ценит эстетику мира Minecraft.</p>
          <div class="hero-btns">
            <a href="#connect" class="btn btn-primary magnetic">Подключиться</a>
            <a href="${TG_LINK}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary magnetic">Telegram-канал</a>
          </div>
        </div>

        <div class="scroll-hint">
          <div class="mouse"><span></span></div>
          Листайте
        </div>
      </header>

      <!-- бегущая строка -->
      <div class="marquee" aria-hidden="true">${marquee()}</div>

      <!-- о сервере -->
      <section class="about" id="about">
        <div class="container">
          <div class="sec-head reveal">
            <div class="sec-tag">01 - О сервере</div>
            <h2 class="section-title grad-text" data-scramble>История в каждом блоке</h2>
            <p class="section-sub">Продуманные постройки, атмосферные локации и дружелюбное сообщество</p>
          </div>
          <div class="about-grid">
            <div class="about-text reveal">
              <p class="about-lead"><strong>Building Zone</strong> - творческое пространство, созданное для тех, кто ценит эстетику мира Minecraft.</p>
              <p>Здесь вы найдёте продуманные постройки, атмосферные локации и дружелюбное сообщество игроков, которые вдохновляются созданием чего-то по-настоящему красивого.</p>
              <p>За все сезоны проекта было построено очень много красивых, спорных и даже маленьких построек. Но все они имеют вес и право войти в Историю.</p>
              <div class="stats">${stats()}</div>
            </div>
            <div class="about-visual reveal d2">
              <div class="about-photo spotlight">
                <picture>
                  <source srcset="${webp(ABOUT_IMAGE)}" type="image/webp" />
                  <img src="${jpg(ABOUT_IMAGE)}" alt="Постройка игроков Building Zone" width="${IMG_W}" height="${IMG_H}" decoding="async" loading="lazy" fetchpriority="low" />
                </picture>
                <div class="about-photo-glow"></div>
                <div class="about-badge">Сезон 3</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- возможности -->
      <section class="features" id="features">
        <div class="container">
          <div class="sec-head reveal">
            <div class="sec-tag">02 - Возможности</div>
            <h2 class="section-title grad-text" data-scramble>Всё для творчества</h2>
            <p class="section-sub">Всё, что нужно для комфортного строительства и вдохновения</p>
          </div>
          <div class="features-grid">${features()}</div>
        </div>
      </section>

      <!-- галерея -->
      <section class="gallery" id="gallery">
        <div class="container">
          <div class="sec-head reveal">
            <div class="sec-tag">03 - Галерея</div>
            <h2 class="section-title grad-text" data-scramble>Постройки сервера</h2>
            <p class="section-sub">Оцените атмосферу сервера сами - листайте слайды</p>
          </div>
          <div class="gal-viewport reveal" id="gal-viewport">
            <div class="gal-track" id="gal-track">${slides()}</div>
          </div>
          <div class="gal-ctl reveal d1">
            <button class="gal-btn" type="button" id="gal-prev" aria-label="Назад">←</button>
            <div class="gal-dots" id="gal-dots">${dots()}</div>
            <span class="gal-count" id="gal-count">01 / ${String(IMAGES.length).padStart(2, '0')}</span>
            <button class="gal-btn" type="button" id="gal-next" aria-label="Вперёд">→</button>
          </div>
        </div>
      </section>

      <!-- подключение - терминал -->
      <section class="connect" id="connect">
        <div class="container">
          <div class="sec-head reveal">
            <div class="sec-tag">04 - Подключение</div>
            <h2 class="section-title grad-text" data-scramble>Канал связи открыт</h2>
            <p class="section-sub">Сервер работает постоянно - заходите в любое время</p>
          </div>
          <div class="term reveal">
            <div class="term-head">
              <span class="t-dot r"></span>
              <span class="t-dot y"></span>
              <span class="t-dot g"></span>
              <span class="term-title">building-zone - connect.exe</span>
            </div>
            <div class="term-body">
              <div class="t-prompt"><span class="u">player@bedrock</span>:<span class="c">~</span>$ connect Building Zone</div>
              ${line('Адрес сервера', SITE.host, { copy: SITE.host, href: ADD_SERVER_LINK })}
              ${line('Порт', SITE.port, { copy: SITE.port })}
              ${line('Полный адрес', ADDRESS, { copy: ADDRESS, href: ADD_SERVER_LINK })}
              ${line('Версия', SITE.version)}
              ${line('Название в IceCube', SITE.clientName)}
              ${line('Имя при подключении', 'любое')}
              ${line('Сайт', SITE.domain, { href: SITE.url, external: true })}
              <div class="term-cursor">awaiting connection <span class="blink">▊</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- благодарности -->
      <section class="thanks">
        <div class="container">
          <div class="sec-head reveal" style="margin-bottom:0">
            <div class="sec-tag">05 - Благодарности</div>
            <h2 class="section-title grad-text" data-scramble>Хранителям сервера</h2>
          </div>
          <blockquote class="quote reveal">Огромнейшая благодарность людям, которые хранят покой и красоту сервера. Спасибо, что вы со мной.</blockquote>
          <div class="names reveal d1">${NAMES.map((n) => `<span class="name-tag">${esc(n)}</span>`).join('')}</div>
        </div>
      </section>

      <!-- cta -->
      <section class="cta">
        <div class="cta-box reveal">
          <h2>Самое безопасное место для строительства</h2>
          <p>Присоединяйся к нашему сообществу и создавай свою историю</p>
          <a href="${TG_LINK}" target="_blank" rel="noopener noreferrer" class="btn-3d">Telegram-канал <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <!-- footer -->
      <footer>
        <div class="f-logo">Building Zone</div>
        <div class="f-links">
          <a href="#about">О сервере</a>
          <a href="#gallery">Галерея</a>
          <a href="#connect">Подключение</a>
          <a href="${TG_LINK}" target="_blank" rel="noopener noreferrer">Наш Telegram</a>
        </div>
        <p>© Oxxygen Production · Создано с ❤️ для игроков</p>
        <p class="f-ip" style="margin-top:10px">Сервер: ${esc(ADDRESS)} · Версия ${esc(SITE.version)}</p>
      </footer>`;
}
