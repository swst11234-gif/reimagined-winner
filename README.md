# MVP витрина цветов (GitHub Pages)

Статический сайт для малого бизнеса: клиент быстро выбирает букет и отправляет заявку в WhatsApp или Telegram без корзины и онлайн-оплаты.

## Структура

```text
/docs
  index.html
  styles.css
  app.js
  /data/products.json
  /assets/*
```

## Как включить GitHub Pages

1. Откройте репозиторий на GitHub.
2. Перейдите в **Settings → Pages**.
3. В блоке **Build and deployment** выберите:
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/docs`
4. Сохраните. Через 1–2 минуты сайт станет доступен по ссылке из этого же раздела.

## Как редактировать товары

Все товары лежат в файле: `docs/data/products.json`.

Для каждого товара заполните поля:

- `id` — уникальный ID (латиница, без пробелов)
- `title` — название
- `price` — цена числом, без валюты
- `category` — тип (`букет`, `композиция`, `розы`, `сезонное`)
- `tags` — массив меток (например: `"хит"`, `"новинка"`)
- `short` — короткое описание для карточки
- `description` — полное описание
- `composition` — состав
- `size` — размер
- `images` — массив путей до фото (например: `"assets/my-bouquet.jpg"`)
- `availability` — `in_stock` или `preorder`

После изменения `products.json` просто закоммитьте изменения — GitHub Pages обновит сайт автоматически.

## Как добавить фото

1. Загрузите изображения в `docs/assets/`.
2. В товаре в `products.json` укажите путь к файлу относительно `docs/`, например:
   - `"assets/rose-19.jpg"`
3. Можно указывать несколько фото в массиве `images`, они покажутся в модальном окне.

## Как поменять контакты и настройки магазина

Откройте `docs/app.js` и отредактируйте объект `CONFIG`:

- `shopName`
- `city`
- `phone`
- `whatsappNumber`
- `telegramUsernameOrLink`
- `preferredMessenger` (`"whatsapp"` или `"telegram"`)
- `currency`
- `workingHours`
- `deliveryInfo`
- `minimumOrder`

## Локальный запуск

Можно открыть `docs/index.html` в браузере.

Если браузер блокирует загрузку JSON через `fetch` при открытии файла напрямую (`file://`), запустите локальный сервер в корне проекта:

```bash
python3 -m http.server 8000
```

И откройте `http://localhost:8000/docs/`.
