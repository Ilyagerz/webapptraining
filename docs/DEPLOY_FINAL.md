# 🚀 ПОЛНАЯ ИНСТРУКЦИЯ ПО ДЕПЛОЮ НА VDS (для чайников)

## 📋 Что у тебя есть:
- VDS на Debian 12
- IP адрес сервера
- Домен `training.nubofit.ru` (уже настроен)
- SSH доступ к серверу

---

## ⚠️ ВАЖНО: Сначала на локальной машине (твой Mac)

### ШАГ 0: Исправим ошибки в коде

**0.1. Открой терминал на своем Mac в папке проекта:**
```bash
cd /Users/ilagorelockin/Desktop/webapptraining
```

**0.2. Проверь, что package.json восстановлен:**
```bash
cat package.json
```
Должен увидеть нормальный JSON с зависимостями.

**0.3. Переустанови зависимости:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**0.4. Проверь сборку локально:**
```bash
NODE_ENV=production npm run build
```

Если будут ошибки - скопируй их мне, исправим!

---

## 🔧 ТЕПЕРЬ НА СЕРВЕРЕ (VDS)

### ШАГ 1: Подключись к серверу

```bash
ssh root@твой_IP_адрес
```

Введи пароль.

---

### ШАГ 2: Перейди в папку проекта

```bash
cd ~/webapptraining
```

---

### ШАГ 3: ПОЛНАЯ ОЧИСТКА (важно!)

```bash
# Останови все процессы PM2
pm2 delete all

# Удали старые файлы
rm -rf node_modules
rm -rf .next
rm -f package-lock.json

# Очисти кэш npm
npm cache clean --force
```

---

### ШАГ 4: Обнови код с твоего Mac

**Вариант А: Через Git (рекомендуется)**

**На Mac:**
```bash
# В папке /Users/ilagorelockin/Desktop/webapptraining
git add .
git commit -m "Fix build errors"
git push
```

**На сервере:**
```bash
cd ~/webapptraining
git pull
```

**Вариант Б: Через rsync (если нет Git)**

**На Mac (в новом терминале):**
```bash
rsync -avz --exclude 'node_modules' --exclude '.next' \
  /Users/ilagorelockin/Desktop/webapptraining/ \
  root@твой_IP:/root/webapptraining/
```

---

### ШАГ 5: Проверь .env.local на сервере

```bash
cat .env.local
```

**Должно быть:**
```env
JWT_SECRET=nubo-training-super-secret-jwt-key-2024-production
TELEGRAM_BOT_TOKEN=твой_токен_от_BotFather
MONGODB_URI=
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_API_URL=https://training.nubofit.ru/api
NEXT_PUBLIC_APP_URL=https://training.nubofit.ru
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=твой_бот_username
```

**Если файла нет или он неправильный:**
```bash
nano .env.local
```
Вставь содержимое выше (замени `твой_токен_от_BotFather` и `твой_бот_username`).

Сохрани: `Ctrl+O`, `Enter`, `Ctrl+X`

---

### ШАГ 6: Установи зависимости

```bash
npm install --production=false
```

Подожди 2-3 минуты.

---

### ШАГ 7: Собери проект

```bash
NODE_ENV=production npm run build
```

**ВАЖНО:** Если будут ошибки - **ОСТАНОВИСЬ** и скопируй их мне полностью!

Если все ок, увидишь:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

### ШАГ 8: Проверь, что билд создался

```bash
ls -la .next/
```

Должны быть папки: `cache`, `server`, `static`, файлы: `BUILD_ID`, `build-manifest.json`

```bash
cat .next/BUILD_ID
```

Должна быть какая-то строка (например, `abc123def456`). Если файла нет - билд не прошел!

---

### ШАГ 9: Обнови ecosystem.config.js

```bash
nano ecosystem.config.js
```

**Замени ВЕСЬ файл на:**
```javascript
module.exports = {
  apps: [
    {
      name: 'nubo-training-frontend',
      cwd: '/root/webapptraining',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/root/.pm2/logs/frontend-error.log',
      out_file: '/root/.pm2/logs/frontend-out.log',
      time: true
    },
    {
      name: 'nubo-training-backend',
      cwd: '/root/webapptraining',
      script: 'server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/root/.pm2/logs/backend-error.log',
      out_file: '/root/.pm2/logs/backend-out.log',
      time: true
    }
  ]
};
```

Сохрани: `Ctrl+O`, `Enter`, `Ctrl+X`

---

### ШАГ 10: Запусти приложение

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

### ШАГ 11: Проверь статус

```bash
pm2 status
```

**Должно быть:**
```
┌────┬────────────────────────┬─────────┬─────────┬──────────┬────────┬──────┬
│ id │ name                   │ mode    │ ↺       │ status   │ cpu    │ mem  │
├────┼────────────────────────┼─────────┼─────────┼──────────┼────────┼──────┤
│ 0  │ nubo-training-frontend │ fork    │ 0       │ online   │ 0%     │ 50mb │
│ 1  │ nubo-training-backend  │ fork    │ 0       │ online   │ 0%     │ 50mb │
└────┴────────────────────────┴─────────┴─────────┴──────────┴────────┴──────┘
```

**Оба должны быть `online` и `↺ 0` (или маленькое число)!**

Если `↺` большое число (7, 10, 15) - значит приложение падает!

---

### ШАГ 12: Проверь логи

**Фронтенд:**
```bash
pm2 logs nubo-training-frontend --lines 50
```

**Должно быть:**
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
✓ Ready in XXXms
```

**Если видишь ошибки** - скопируй их мне!

**Бэкенд:**
```bash
pm2 logs nubo-training-backend --lines 50
```

**Должно быть:**
```
✅ Загружено 23 упражнений
🚀 NUBO Training API running on port 3001
```

Нажми `Ctrl+C` чтобы выйти из логов.

---

### ШАГ 13: Проверь, что порты слушаются

```bash
# Установи net-tools если нет
apt install net-tools -y

# Проверь порты
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
```

**Должно быть:**
```
tcp  0  0  0.0.0.0:3000  0.0.0.0:*  LISTEN  12345/node
tcp  0  0  0.0.0.0:3001  0.0.0.0:*  LISTEN  12346/node
```

Если пусто - приложения не запустились!

---

### ШАГ 14: Проверь Nginx конфигурацию

```bash
cat /etc/nginx/sites-available/training.nubofit.ru
```

**Должно быть:**
```nginx
server {
    server_name training.nubofit.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/training.nubofit.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/training.nubofit.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = training.nubofit.ru) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name training.nubofit.ru;
    return 404;
}
```

**Если конфиг неправильный:**
```bash
nano /etc/nginx/sites-available/training.nubofit.ru
```
Вставь конфиг выше, сохрани.

---

### ШАГ 15: Проверь и перезапусти Nginx

```bash
# Проверь конфиг
nginx -t
```

**Должно быть:**
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Если ок:**
```bash
systemctl reload nginx
```

**Если ошибка:**
```bash
# Покажи мне ошибку, скопируй полностью
nginx -t
```

---

### ШАГ 16: Проверь Nginx логи

```bash
tail -f /var/log/nginx/nubotraining-error.log
```

Нажми `Ctrl+C` через пару секунд.

Если видишь `Connection refused` - значит фронтенд не работает на порту 3000!

---

### ШАГ 17: Открой сайт в браузере

Открой: **https://training.nubofit.ru**

**Что должно быть:**
- Загружается главная страница
- Видишь кнопку "Войти через Telegram" или форму входа
- Нет ошибок 502

**Если 502 Bad Gateway:**
```bash
# Проверь статус PM2
pm2 status

# Проверь логи фронтенда
pm2 logs nubo-training-frontend --lines 100

# Проверь, слушается ли порт 3000
netstat -tulpn | grep :3000
```

Скопируй мне результаты!

---

## 🐛 ОТЛАДКА: Если что-то не работает

### Проблема 1: PM2 показывает `status: errored` или большой `↺`

```bash
# Останови все
pm2 delete all

# Запусти фронтенд вручную для отладки
cd ~/webapptraining
NODE_ENV=production npm start
```

Смотри, какая ошибка появится. Скопируй мне!

Нажми `Ctrl+C` чтобы остановить.

---

### Проблема 2: Ошибка "Could not find a production build"

```bash
# Проверь, есть ли BUILD_ID
cat .next/BUILD_ID

# Если файла нет - пересобери
rm -rf .next
NODE_ENV=production npm run build
```

---

### Проблема 3: Ошибки TypeScript при сборке

Скопируй мне **ВСЕ** ошибки из `npm run build`, я исправлю код!

---

### Проблема 4: 502 Bad Gateway

```bash
# Проверь все по порядку:

# 1. PM2 статус
pm2 status

# 2. Порты
netstat -tulpn | grep -E ':(3000|3001)'

# 3. Логи фронтенда
pm2 logs nubo-training-frontend --lines 50

# 4. Логи бэкенда
pm2 logs nubo-training-backend --lines 50

# 5. Nginx ошибки
tail -50 /var/log/nginx/nubotraining-error.log
```

Скопируй мне результаты всех команд!

---

## ✅ ФИНАЛЬНАЯ ПРОВЕРКА

Если все работает:

1. **Открой https://training.nubofit.ru** - должна загрузиться главная
2. **Зарегистрируйся** через email/пароль
3. **Создай тренировку** - должна сохраниться
4. **Проверь Telegram бота** - отправь `/start` боту

---

## 📝 КОМАНДЫ ДЛЯ БЫСТРОЙ ПРОВЕРКИ

Сохрани себе эти команды:

```bash
# Статус приложения
pm2 status

# Логи (в реальном времени)
pm2 logs

# Перезапуск
pm2 restart all

# Остановка
pm2 stop all

# Запуск
pm2 start ecosystem.config.js

# Проверка портов
netstat -tulpn | grep -E ':(3000|3001)'

# Проверка Nginx
nginx -t
systemctl status nginx

# Просмотр ошибок Nginx
tail -100 /var/log/nginx/nubotraining-error.log
```

---

## 🆘 ЧТО ДЕЛАТЬ ЕСЛИ ЗАСТРЯЛ

**Скопируй мне результаты этих команд:**

```bash
# 1. Статус PM2
pm2 status

# 2. Логи фронтенда
pm2 logs nubo-training-frontend --lines 100 --nostream

# 3. Логи бэкенда
pm2 logs nubo-training-backend --lines 100 --nostream

# 4. Проверка портов
netstat -tulpn | grep -E ':(3000|3001)'

# 5. Проверка билда
ls -la .next/BUILD_ID

# 6. Nginx ошибки
tail -100 /var/log/nginx/nubotraining-error.log
```

И опиши, на каком шаге застрял!

---

## 🎉 ГОТОВО!

Если дошел до конца и все работает - поздравляю! 🚀

Приложение доступно по адресу: **https://training.nubofit.ru**

