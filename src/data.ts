/* ============================================================
   Данные сайта Building Zone.
   Всё, что нужно менять при переезде/смене адреса - здесь.
   ============================================================ */

export const SITE = {
  name: 'Building Zone',
  /** сайт проекта */
  domain: 'buildzone.lol',
  url: 'https://buildzone.lol/',
  /** адрес игрового сервера (Bedrock) */
  host: 'play.buildzone.lol',
  port: '25903',
  version: '1.21.50–51',
  /** клиент Bedrock: имя сервера в списке */
  clientName: 'Building Zone',
  telegram: 'https://t.me/buildingzone_cube',
} as const;

export const TG_LINK = SITE.telegram;

/** play.buildzone.lol:25903 */
export const ADDRESS = `${SITE.host}:${SITE.port}`;

/** deep-link: добавляет сервер в список серверов Minecraft Bedrock по клику */
export const ADD_SERVER_LINK = `minecraft://?addExternalServer=${encodeURIComponent(SITE.clientName)}|${ADDRESS}`;

/* ---------- фото галереи: public/images/<name>.jpg + <name>.webp ---------- */

export const IMAGES = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'] as const;

export const IMG_W = 1920;
export const IMG_H = 864;

export const jpg = (name: string) => `./images/${name}.jpg`;
export const webp = (name: string) => `./images/${name}.webp`;

/** фото в блоке «о сервере» */
export const ABOUT_IMAGE = IMAGES[6];

/* ---------- контент ---------- */

export const FEATURES = [
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

export const NAMES = ['Padjilloi', 'AstutePlot58', 'Dezik9410', 'WaryMold3335', 'УниБлок'];

export const STATS = [
  { n: 3, suffix: '', label: 'сезона истории' },
  { n: 100, suffix: '+', label: 'построек на карте' },
  { n: 20, suffix: '+', label: 'игроков в комьюнити' },
  { n: 100, suffix: '%', label: 'аптайм 24/7' },
];

export const MARQUEE = ['Строй', 'Вдохновляй', 'Создавай', 'Делись', 'Мечтай', 'Исследуй'];

export const NAV_LINKS = [
  { href: '#about', label: 'О сервере' },
  { href: '#features', label: 'Возможности' },
  { href: '#gallery', label: 'Галерея' },
  { href: '#connect', label: 'Подключение' },
];
