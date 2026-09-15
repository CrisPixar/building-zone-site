# Building Zone - сайт Minecraft-сервера

Одностраничный сайт сервера **Building Zone** (Minecraft Bedrock): воксельный фон на canvas,
бегущая строка, статистика, галерея построек, терминал с данными для подключения и благодарности.

Стек: React 19 + TypeScript + Vite 7 + Tailwind 4 (`vite-plugin-singlefile` собирает всё в один `index.html`).

## Запуск

```bash
npm install
npm run dev      # разработка
npm run build    # сборка в dist/
npm run preview  # посмотреть собранную версию
```

## Структура

```
index.html                 точка входа
src/App.tsx                вся страница: hero, галерея, терминал, футер
src/index.css              стили (галерея, прелоадер, анимации)
public/images/             рабочие фото галереи: one.jpg ... eight.jpg
assets/originals/          исходные скриншоты 2400x1080 без сжатия
```

## Галерея

В галерее 8 слайдов - это файлы `public/images/one.jpg` ... `eight.jpg` (имя файла = порядок слайда).
Фото живут в `public/` и адресуются как `./images/one.jpg`, поэтому имена менять нельзя,
иначе слайд останется без картинки.

Что важно при замене фото:

- файл должен называться точно `one.jpg` ... `eight.jpg` (регистр имеет значение);
- держите вес в разумных пределах: для веб-версии достаточно 1920 px по ширине и качества ~80
  (сейчас все 8 фото занимают ~1.4 MB вместо прежних 13 MB);
- оригиналы складывайте в `assets/originals/`, а в `public/images/` - сжатую версию.

## Проверка, что все слайды на месте

Любая из команд должна показать ровно 8 файлов:

```bash
ls public/images
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/images/eight.jpg   # 200
```
