# alania.fun — поездки по Северной Осетии

Одностраничный сайт индивидуальных поездок по Северной Осетии-Алании. Главная задача — показать туристу места, помочь выбрать направление и обсудить стоимость в WhatsApp. Эльбрус представлен в небольшом блоке о водителе. Визуальное направление и источники описаны в `DESIGN.md`.

Адрес сайта — [alania.fun](https://alania.fun/).

## Локальный запуск и сборка

Локально используй Node.js 22.23.5 и npm 10.9.9 из `D:\soft\node-v22.23.5`. В текущей сессии PowerShell можно задать путь командой `$env:Path="D:\soft\node-v22.23.5;$env:Path"`. GitHub Actions использует отдельную облачную среду Node 24.

```bash
npm ci
npm run dev
npm run build
npm run preview
npm run smoke -- http://localhost:4173/
```

Сборка генерирует HTML и JSON-LD из компонентов и данных React. В браузере React подключает интерактивность к готовой странице. При отключённом JavaScript доступны контент, телефон и WhatsApp. Vite использует `base: "./"`. GitHub Pages публикует `dist` в корне `alania.fun`.

## Деплой и откат

GitHub Pages публикует сайт через `.github/workflows/pages.yml` после изменений в `master`. Pull request в `master` проверяет сборку. Для повторной публикации запусти **Deploy GitHub Pages** из ветки `master`. Сверь SHA в Actions и запусти `npm run smoke` для проверки публичного адреса.

Для отката создай PR с отменой проблемного коммита в `master`, дождись деплоя и снова запусти smoke. При полном откате восстановления сохрани триггер workflow на `master`, чтобы отмена опубликовалась. Предыдущий артефакт был собран из `5db270f063480d364776c695f8a0eb52079a0374` в [Actions run 26033342652](https://github.com/ogelslamovuk/alania.fun/actions/runs/26033342652).

## DNS и HTTPS

Если RDAP показывает `*.verification-hold.suspended-domain.com`, подтверди зарегистрированный контактный email у провайдера домена. После возврата исходных NS сверь A/AAAA для корня и CNAME для `www` с инструкцией GitHub. Сохрани почтовые записи и записи верификации. Оставь **Enforce HTTPS** включённым в Pages. При корректном DNS GitHub Pages выпускает и автоматически продлевает бесплатный сертификат Let's Encrypt. Команда `npm run smoke` проверяет доверенный HTTPS и редиректы с HTTP и `www` на канонический адрес. [Настройка домена в GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Форма заявки

GitHub Actions передаёт в сборку публичную переменную репозитория `VITE_LEAD_ENDPOINT`. Для разработки скопируй `.env.example` в `.env.local` и используй тестовый или перехваченный endpoint. Форма подтверждает отправку после ответа HTTP 2xx с JSON `{"ok":true}`. Без endpoint форма открывает черновик в WhatsApp, который отправляет сам посетитель.

Код действующего Cloudflare Worker находится в `scripts/cloudflare-telegram-worker.js`. Worker публикуется отдельно от GitHub Pages через существующий аккаунт Cloudflare. Храни `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` в секретах Worker. Для `ALLOWED_ORIGIN` используй `https://alania.fun`. Проверяй CORS запросом OPTIONS, а контракт доставки тестируй с имитацией ответа Telegram.

## Где редактировать контент

В `src/data/content.ts` меняются:

- телефон, WhatsApp и Telegram — `phoneNumber`, `contacts`;
- первый экран и информация об Эльбрусе — `hero`, `about`;
- маршруты и ориентиры стоимости — `trips`, `prices`;
- отзывы и ответы на вопросы — `reviews`, `faq`.

В `prices.items` указывай согласованную с Эльбрусом стоимость. Источники рыночных ориентиров хранятся в `pricing-notes.md`. Подписи к видео, навигация и форма редактируются в `src/App.tsx`.

## Изображения

Файлы для сайта лежат в `public/images`. При замене снимка обнови в `src/data/content.ts` его пути, фактические размеры JPEG и альтернативный текст. Для первого экрана используются AVIF для мобильного и широкого экрана, WebP и JPEG. Источники и лицензии указаны в `image-credits.md`.

Короткий ролик находится в `public/videos/ossetia-road.mp4`, постер — `public/images/ossetia-road-poster.webp`. Исходные `IMG_1967.MOV` и `IMG_1968.MOV` хранятся локально и исключены из Git. Видео запускает посетитель, при первой загрузке страницы ролик не скачивается.

Шрифт Source Sans 3 размещён в `public/fonts`, CSS в `src/fonts.css`. Сохраняй файлы лицензий рядом со шрифтами. Тестовые рендеры и временные профили размещай в `.artifacts/`, после проверки останавливай запущенные dev/preview-процессы.

## Поиск и ответы ИИ

Сборка создаёт доступный без JavaScript HTML и JSON-LD из актуального контента. В `src/structured-data.ts` связаны сайт, страница, Эльбрус, услуга, маршруты и FAQ. Заголовки и Open Graph редактируются в `index.html`. Сохраняй `public/robots.txt`, `public/sitemap.xml` и файлы подтверждения Яндекса и Google. Изменения текста нужно проверять и в видимом интерфейсе, и в собранном HTML. Индексация и позиции зависят от поисковых систем.
