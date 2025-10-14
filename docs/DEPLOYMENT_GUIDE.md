# 🚀 Гайд по деплою NUBO Training

## 📋 Подготовка к деплою

### 1. Выбор стратегии хостинга

Для Next.js + Express у тебя 3 варианта:

#### **Вариант A: Vercel + Railway (РЕКОМЕНДУЮ)**
- **Frontend (Next.js):** Vercel (бесплатно)
- **Backend (Express):** Railway (бесплатно до $5/мес)
- **Домен:** training.nubofit.ru → Vercel

**Плюсы:**
- ✅ Автоматический деплой при push в GitHub
- ✅ Бесплатный SSL
- ✅ Быстро и просто
- ✅ Отличная производительность

**Минусы:**
- ⚠️ Backend и Frontend раздельно
- ⚠️ Нужен MongoDB Atlas (база данных)

---

#### **Вариант B: Твой хостинг (VPS/Shared)**
- **Все в одном:** Frontend + Backend на твоем сервере
- **Домен:** training.nubofit.ru

**Плюсы:**
- ✅ Полный контроль
- ✅ Все в одном месте
- ✅ Можешь использовать существующую инфраструктуру

**Минусы:**
- ⚠️ Нужно настроить Node.js на хостинге
- ⚠️ Нужен PM2 для запуска
- ⚠️ Ручные обновления (или настроить CI/CD)

---

#### **Вариант C: Telegram Mini App хостинг**
- Специально для Telegram Mini Apps
- Например: Cloudflare Pages, Netlify

---

## 🎯 Рекомендация для тебя

**Вариант A (Vercel + Railway)**, потому что:
1. Быстрее всего запустить (30 минут)
2. Автоматические обновления через Git
3. Бесплатно на старте
4. Можно потом мигрировать на свой хостинг

---

## 📝 Пошаговая инструкция (Vercel + Railway)

### Шаг 1: Подготовка проекта

```bash
# 1. Создай .gitignore если нет
echo "node_modules
.next
.env.local
.DS_Store" > .gitignore

# 2. Инициализируй Git (если еще не сделал)
git init
git add .
git commit -m "Initial commit - NUBO Training v0.9.5"

# 3. Создай репозиторий на GitHub
# Перейди на github.com → New repository
# Название: nubo-training

# 4. Запуш код
git remote add origin https://github.com/ТвойUsername/nubo-training.git
git branch -M main
git push -u origin main
```

---

### Шаг 2: Деплой Backend на Railway

```
1. Открой https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Выбери nubo-training
5. Add variables:
   - NODE_ENV=production
   - JWT_SECRET=твой_секретный_ключ_минимум_32_символа
   - TELEGRAM_BOT_TOKEN=8187775383:AAG6r4d_S7pOjt8UcTQzPnuNwvacriPR-B4
   - PORT=3001
6. Settings → Networking → Generate Domain
7. Скопируй URL (например: nubo-training-production.up.railway.app)
```

**Важно:** Нужен `railway.json` в корне проекта!

---

### Шаг 3: Деплой Frontend на Vercel

```
1. Открой https://vercel.com
2. Sign up with GitHub
3. Import Project → nubo-training
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
5. Environment Variables:
   - NEXT_PUBLIC_API_URL=https://твой-railway-url.railway.app
   - NEXT_PUBLIC_APP_URL=https://training.nubofit.ru
   - JWT_SECRET=тот_же_что_в_railway
6. Deploy
7. Settings → Domains → Add training.nubofit.ru
```

---

### Шаг 4: Настройка домена

В панели управления доменом nubofit.ru:

```
Тип: CNAME
Имя: training
Значение: cname.vercel-dns.com
TTL: 3600
```

Подожди 5-30 минут → домен заработает!

---

## 🔧 Файлы для Railway

Создай `railway.json` в корне:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🗄️ MongoDB Atlas (база данных)

**КРИТИЧНО:** Перед деплоем нужна реальная база!

```
1. Открой https://cloud.mongodb.com
2. Sign up (бесплатно)
3. Create Cluster (Free M0)
4. Database Access → Add User
   - Username: nubotraining
   - Password: (сгенерируй сложный)
5. Network Access → Add IP: 0.0.0.0/0 (разрешить все)
6. Database → Connect → Drivers
7. Скопируй Connection String:
   mongodb+srv://nubotraining:<password>@cluster0.xxxxx.mongodb.net/
8. Добавь в Railway переменные:
   - MONGODB_URI=твоя_строка_подключения
```

---

## 📱 Настройка Telegram Mini App

После деплоя обнови BotFather:

```
1. Открой @BotFather
2. /mybots → Твой бот
3. Bot Settings → Menu Button → Edit Menu Button URL
4. Введи: https://training.nubofit.ru
```

---

## 🔄 Рабочий процесс после деплоя

### Обновления:
```bash
# Вносишь изменения локально
# Коммитишь
git add .
git commit -m "Added new feature"

# Пушишь в GitHub
git push

# Vercel и Railway автоматически задеплоят! 🚀
```

**Время деплоя:** 2-5 минут

---

## 🛠️ Альтернатива: Деплой на свой хостинг

### Требования к хостингу:
- ✅ Node.js 18+ поддержка
- ✅ PM2 или systemd
- ✅ Nginx (reverse proxy)
- ✅ SSL сертификат (Let's Encrypt)

### Процесс:

#### 1. На сервере:
```bash
# Установи Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установи PM2
npm install -g pm2

# Клонируй репозиторий
git clone https://github.com/ТвойUsername/nubo-training.git
cd nubo-training

# Установи зависимости
npm install

# Билд Next.js
npm run build

# Создай .env.local
nano .env.local
# (вставь переменные окружения)

# Запусти с PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 2. Nginx конфиг:
```nginx
server {
    server_name training.nubofit.ru;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend (Express)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/training.nubofit.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/training.nubofit.ru/privkey.pem;
}

server {
    listen 80;
    server_name training.nubofit.ru;
    return 301 https://$server_name$request_uri;
}
```

#### 3. SSL:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d training.nubofit.ru
```

#### 4. Обновления:
```bash
cd /path/to/nubo-training
git pull
npm install
npm run build
pm2 restart all
```

---

## 📊 Сравнение вариантов

| Критерий | Vercel+Railway | Свой хостинг |
|----------|----------------|--------------|
| **Скорость настройки** | 30 мин | 2-4 часа |
| **Стоимость (старт)** | $0 | Твой хостинг |
| **Автодеплой** | ✅ Да | ❌ Нет (настраивать) |
| **SSL** | ✅ Автоматически | Настроить Let's Encrypt |
| **Масштабирование** | ✅ Автоматически | Вручную |
| **Контроль** | Ограниченный | Полный |
| **MongoDB** | Atlas (облако) | Можно локально |

---

## 🎯 Мой совет

### На старте:
**Используй Vercel + Railway**
- Быстро запустишь
- Бесплатно
- Автообновления
- Сфокусируешься на разработке

### Когда вырастешь:
**Мигрируй на свой хостинг**
- Больше пользователей
- Нужен полный контроль
- Хочешь экономить на хостинге

---

## ✅ Чеклист перед деплоем

- [ ] MongoDB Atlas настроен
- [ ] GitHub репозиторий создан
- [ ] .env.local не в Git (.gitignore)
- [ ] JWT_SECRET >= 32 символа
- [ ] Telegram Bot Token актуален
- [ ] Все зависимости в package.json
- [ ] npm run build работает локально
- [ ] Протестировал регистрацию/логин
- [ ] Протестировал создание тренировки

---

## 🚀 Готов к деплою?

**Вариант 1 (рекомендую):** Следуй инструкции Vercel + Railway  
**Вариант 2:** Настрой свой хостинг

**Нужна помощь?** Скажи какой вариант выбрал, помогу с конфигами! 💪

