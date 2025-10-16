# 🔍 Отладка Telegram авторизации

## 🚀 Деплой с логированием

На сервере выполни:

```bash
cd ~/webapptraining
git pull origin main
npm run build
pm2 restart all
```

---

## 📱 Как тестировать в Telegram

### 1. Открой через Telegram Desktop или мобильное приложение
- Найди своего бота
- Нажми на синюю кнопку Web App (или команду `/start`)

### 2. Открой консоль разработчика

#### В Telegram Desktop (Windows/Mac/Linux):
1. Открой Web App
2. Нажми `Ctrl+Shift+I` (или `Cmd+Option+I` на Mac)
3. Перейди на вкладку Console

#### В мобильном Telegram (Android):
1. Включи USB debugging
2. Подключи к компьютеру
3. Открой `chrome://inspect` в Chrome
4. Найди WebView Telegram

---

## 🔎 Что смотреть в консоли браузера

После открытия Web App в консоли должно быть:

```
✅ Telegram Web App SDK loaded
📱 Telegram user: {id: 123456, first_name: "Илья", ...}
🔍 Telegram WebApp: {...}
🔍 initData: "query_id=..."
🔍 initDataUnsafe: {...}
✅ Telegram Web App detected, authenticating...
📡 Response status: 200
✅ Auth successful: {id: "tg-123456", ...}
```

### ❌ Если видишь ошибки:

**`ℹ️ Not running in Telegram Web App`**
- Web App SDK не загрузился
- Проверь что открываешь через Telegram, а не браузер

**`❌ Auth failed: {error: "..."}`**
- Ошибка на сервере
- Смотри логи PM2 (см. ниже)

**`❌ Auth error: ...`**
- Проблема с подключением к серверу
- Проверь что backend запущен

---

## 📋 Логи сервера (PM2)

На сервере выполни:

```bash
# Логи backend (должны быть эмодзи)
pm2 logs nubo-training-backend --lines 50
```

### ✅ Успешная авторизация:

```
🔍 Telegram auth request received
📦 initData length: 543
📦 initData (first 200 chars): query_id=AAHdF6IQAAAAAN0Xo...
✅ Telegram initData validation passed
👤 User param: {"id":123456,"first_name":"Илья",...
✅ Parsed Telegram user: { id: 123456, first_name: 'Илья', username: 'ilyagerz' }
✅ User created: tg-123456
```

### ❌ Если валидация не прошла:

```
🔍 Telegram auth request received
📦 initData length: 543
⚠️ Telegram initData validation failed, but continuing...
✅ Parsed Telegram user: ...
```

Это **нормально** - валидация временно отключена для отладки.

---

## ⚙️ Проверка настроек бота

### 1. Проверь что Web App настроен в BotFather:

```
/mybots → Выбери бота → Bot Settings → Menu Button → Configure Menu Button
```

URL должен быть: `https://training.nubofit.ru`

### 2. Проверь `.env.local` на сервере:

```bash
cat ~/webapptraining/.env.local | grep TELEGRAM
```

Должно быть:
```
TELEGRAM_BOT_TOKEN=8187775383:AAG6r4d_S7pOjt8UcTQzPnuNwvacriPR-B4
TELEGRAM_BOT_USERNAME=your_bot_username
```

---

## 🐛 Частые проблемы

### Проблема 1: "Данные пользователя не найдены"
**Причина:** initData не содержит параметр `user`  
**Решение:** Проверь формат initData в логах backend

### Проблема 2: Бесконечная загрузка
**Причина:** Редирект на `/auth` вместо `/dashboard`  
**Решение:** Проверь логи браузера, убедись что `setUser()` вызывается

### Проблема 3: Фото не подтягивается
**Причина:** Telegram не передает `photo_url` или оно пустое  
**Решение:** Проверь `telegramUser.photo_url` в логах backend

---

## 📝 После отладки

Когда всё заработает, скопируй сюда:
1. ✅ Что было в консоли браузера
2. ✅ Что было в логах PM2
3. ✅ Какие ошибки были (если были)

Это поможет понять проблему!

---

## 🔧 Быстрые команды

```bash
# На сервере

# 1. Обновить код
cd ~/webapptraining && git pull && npm run build && pm2 restart all

# 2. Посмотреть логи
pm2 logs --lines 100

# 3. Посмотреть только backend
pm2 logs nubo-training-backend --lines 50

# 4. Перезапустить все
pm2 restart all

# 5. Проверить статус
pm2 status
```

