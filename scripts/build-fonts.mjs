/**
 * Встраивает файлы шрифтов из assets/fonts в CSS как data:URI.
 *
 * Зачем: шрифты лежат прямо в HTML страницы, поэтому их не может подменить
 * ни браузер, ни мобильный WebView (в Telegram, Safari и т.п.), ни кэш,
 * ни блокировка внешних доменов. Ни одного отдельного запроса за шрифтом
 * при этом не делается, а значит нет и мигания системным шрифтом.
 *
 * Запускается автоматически перед `npm run dev` и `npm run build`,
 * результат - src/fonts.generated.css (в git не хранится).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const fontsDir = path.join(root, 'assets', 'fonts');
const outFile = path.join(root, 'src', 'fonts.generated.css');

/** наборы символов: те же, что у Google Fonts, поэтому подстановка совпадает */
const SUBSETS = {
  cyrillic:
    'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
  latin:
    'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
};

/** font-display: у заголовочного шрифта block (как раньше), у остальных swap */
const FAMILIES = {
  unbounded: { family: 'Unbounded', display: 'block' },
  'golos-text': { family: 'Golos Text', display: 'swap' },
  'jetbrains-mono': { family: 'JetBrains Mono', display: 'swap' },
};

const files = fs.readdirSync(fontsDir).filter((f) => f.endsWith('.woff2')).sort();
if (files.length === 0) {
  console.error('[build-fonts] не нашёл ни одного .woff2 в assets/fonts');
  process.exit(1);
}

const blocks = [];
let rawBytes = 0;
let base64Bytes = 0;

for (const file of files) {
  // имя вида <slug>-<subset>-<weight>-<style>.woff2, напр. golos-text-cyrillic-400-normal.woff2
  const m = file.match(/^(.+?)-(cyrillic|latin)-(\d+)-(normal|italic)\.woff2$/);
  if (!m) {
    console.warn('[build-fonts] пропускаю файл с непонятным именем:', file);
    continue;
  }
  const [, slug, subset, weight, style] = m;
  const meta = FAMILIES[slug];
  if (!meta) {
    console.warn('[build-fonts] пропускаю неизвестное семейство:', file);
    continue;
  }

  const buf = fs.readFileSync(path.join(fontsDir, file));
  const b64 = buf.toString('base64');
  rawBytes += buf.length;
  base64Bytes += b64.length;

  blocks.push(
    `@font-face {\n` +
      `  font-family: '${meta.family}';\n` +
      `  font-style: ${style};\n` +
      `  font-weight: ${weight};\n` +
      `  font-display: ${meta.display};\n` +
      `  src: url(data:font/woff2;base64,${b64}) format('woff2');\n` +
      `  unicode-range: ${SUBSETS[subset]};\n` +
      `}`
  );
}

const header =
  '/* СГЕНЕРИРОВАНО scripts/build-fonts.mjs - не редактировать вручную.\n' +
  '   Шрифты встроены в страницу как data:URI, исходники лежат в assets/fonts/. */\n\n';

fs.writeFileSync(outFile, header + blocks.join('\n\n') + '\n', 'utf8');

const kb = (n) => (n / 1024).toFixed(1);
console.log(
  `[build-fonts] встроено шрифтов: ${blocks.length} | исходники ${kb(rawBytes)} KB -> CSS ${kb(base64Bytes)} KB -> ${path.relative(root, outFile)}`
);
