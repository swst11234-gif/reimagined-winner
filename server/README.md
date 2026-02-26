# Orders backend (Node.js + Express + SQLite)

Локальный backend для заказов тюльпанов.

## Требования

- Node.js 18+

## Установка

```bash
cd server
npm install
```

## Настройки

Скопируйте `.env.example` значения в окружение (или задайте напрямую).

- `DB_PATH` — путь к SQLite файлу (по умолчанию `./data/orders.db`)
- `ADMIN_TOKEN` — токен для admin-методов
- `PORT` — порт сервера (по умолчанию `3000`)

## Запуск

```bash
cd server
ADMIN_TOKEN=change-me npm start
```

При старте сервер логирует порт и фактический `DB_PATH`.

## API

### Health

- `GET /health` → `{ ok: true }`

### Создать заказ

- `POST /api/orders`
- body: JSON payload заказа (`qty`, `color`, `wrap`, `price`, `pickupDate`, `comment`, `contactChannel`)
- response: `{ id }` (формат `TLP-XXXX`)

### Получить заказ

- `GET /api/orders/:id`
- response: `{ id, created_at, status, payload }`

### Обновить статус (admin)

- `PATCH /api/orders/:id/status`
- headers: `Authorization: Bearer <ADMIN_TOKEN>`
- body: `{ "status": "confirmed" }`

### Список заказов (admin)

- `GET /api/admin/orders`
- `GET /api/admin/orders?status=sent`
- headers: `Authorization: Bearer <ADMIN_TOKEN>`
