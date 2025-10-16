# 🚀 Инструкция по деплою на сервер

## ✅ Локальная сборка прошла успешно!

Все файлы восстановлены и проект успешно собран локально.

---

## 📋 Что нужно сделать на сервере

### 1️⃣ Подключись к серверу

```bash
ssh root@твой-сервер-ip
cd ~/webapptraining
```

### 2️⃣ Получи последние изменения

```bash
git pull origin main
```

Если Git не установлен:
```bash
apt update && apt install -y git
```

Если репозиторий еще не настроен:
```bash
git init
git remote add origin https://github.com/твой-username/webapptraining.git
git fetch origin
git checkout main
```

### 3️⃣ Установи зависимости

```bash
npm install
```

### 4️⃣ Собери проект

```bash
NODE_ENV=production npm run build
```

### 5️⃣ Проверь сборку

```bash
ls -la .next/BUILD_ID
```

Должен показать файл с датой создания.

### 6️⃣ Перезапусти PM2

```bash
pm2 restart all
pm2 logs --lines 50
```

### 7️⃣ Проверь статус

```bash
pm2 status
```

Оба процесса (`nubo-training-frontend` и `nubo-training-backend`) должны быть `online`.

### 8️⃣ Открой сайт

Открой в браузере: https://training.nubofit.ru

---

## 🔧 Если что-то пошло не так

### Проблема: Git pull не работает

```bash
# Проверь статус
git status

# Если есть локальные изменения, отмени их
git reset --hard origin/main

# Попробуй снова
git pull origin main
```

### Проблема: Ошибки при сборке

```bash
# Очисти кеш и node_modules
rm -rf node_modules .next
npm cache clean --force
npm install
npm run build
```

### Проблема: PM2 не запускается

```bash
# Останови все процессы
pm2 stop all
pm2 delete all

# Запусти заново
pm2 start ecosystem.config.js

# Сохрани конфигурацию
pm2 save
pm2 startup
```

### Проблема: 502 Bad Gateway

```bash
# Проверь логи
pm2 logs nubo-training-frontend --lines 100
pm2 logs nubo-training-backend --lines 100

# Проверь, что порты слушаются
ss -tulpn | grep :3000
ss -tulpn | grep :3001

# Перезапусти Nginx
systemctl restart nginx
```

---

## 📝 Важные замечания

1. **`.env.local`** должен быть на сервере с правильными настройками
2. **`data/exercises.json`** должен существовать (если нет - скопируй локальный)
3. **PM2** должен быть настроен для автозапуска при перезагрузке сервера
4. **Nginx** должен проксировать запросы на порт 3000

---

## ✨ После успешного деплоя

Проверь все ключевые функции:
- ✅ Регистрация/вход
- ✅ Создание программы
- ✅ Запуск тренировки
- ✅ Завершение тренировки
- ✅ Просмотр истории
- ✅ Вход через Telegram (если настроен)

---

## 🆘 Помощь

Если застрял - смотри логи:
```bash
# PM2 логи
pm2 logs --lines 200

# Nginx логи
tail -f /var/log/nginx/nubotraining-error.log

# Системные логи
journalctl -u nginx -n 100
```

