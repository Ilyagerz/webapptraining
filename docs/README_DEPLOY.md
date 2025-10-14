# 🚀 Деплой NUBO Training на VDS

## 📦 Что внутри:

Это полное приложение для тренировок с:
- ✅ Next.js 14 (фронтенд)
- ✅ Express.js (бэкенд API)
- ✅ JWT аутентификация
- ✅ Telegram Web App интеграция
- ✅ PWA поддержка
- ✅ Шаблоны тренировок
- ✅ История упражнений
- ✅ Графики прогресса
- ✅ AI генератор программ
- ✅ AMRAP/EMOM режимы
- ✅ Суперсеты

---

## 🎯 БЫСТРЫЙ СТАРТ

### 1. Прочитай инструкции:

📖 **`START_HERE.md`** - начни отсюда!

Остальные файлы:
- `DEPLOY_FINAL.md` - подробная инструкция
- `QUICK_FIX.md` - решение проблем
- `ШПАРГАЛКА.md` - команды для копирования
- `DEPLOY_COMMANDS.sh` - автоматический деплой

---

### 2. На сервере запусти:

```bash
cd ~/webapptraining
bash DEPLOY_COMMANDS.sh
```

---

### 3. Открой в браузере:

**https://training.nubofit.ru**

---

## 🏗️ Архитектура:

```
┌─────────────────────────────────────────────┐
│          Nginx (порт 80/443)                │
│          training.nubofit.ru                │
└──────────────┬──────────────────────────────┘
               │
               ├─────────────────────────┐
               │                         │
               ▼                         ▼
┌──────────────────────┐    ┌──────────────────────┐
│   Next.js Frontend   │    │   Express Backend    │
│     (порт 3000)      │◄───┤     (порт 3001)      │
│                      │    │                      │
│  - SSR/SSG           │    │  - REST API          │
│  - React UI          │    │  - JWT Auth          │
│  - PWA               │    │  - In-memory DB      │
│  - Telegram WebApp   │    │  - Exercises         │
└──────────────────────┘    └──────────────────────┘
```

---

## 🔧 Технологии:

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state)
- Chart.js (графики)
- Lucide Icons

**Backend:**
- Express.js
- JWT (jsonwebtoken)
- bcrypt (пароли)
- CORS
- dotenv

**Деплой:**
- PM2 (process manager)
- Nginx (reverse proxy)
- Let's Encrypt (SSL)
- Debian 12 (VDS)

---

## 📁 Структура проекта:

```
webapptraining/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Главная страница
│   ├── auth/              # Аутентификация
│   ├── dashboard/         # Дашборд
│   ├── workout/           # Тренировки
│   ├── templates/         # Шаблоны
│   ├── exercise/          # Упражнения
│   ├── measurements/      # Замеры
│   └── ai-program/        # AI генератор
├── components/            # React компоненты
├── lib/                   # Утилиты
├── server/                # Express бэкенд
│   └── index.js          # API сервер
├── types/                 # TypeScript типы
├── data/                  # Данные (упражнения)
├── public/                # Статика
├── .env.local            # Переменные окружения
├── ecosystem.config.js   # PM2 конфиг
├── next.config.js        # Next.js конфиг
└── package.json          # Зависимости
```

---

## 🌐 Переменные окружения (.env.local):

```env
# JWT Secret (минимум 32 символа)
JWT_SECRET=your-secret-key

# Telegram Bot Token
TELEGRAM_BOT_TOKEN=123456:ABC-DEF

# URLs
NEXT_PUBLIC_API_URL=https://training.nubofit.ru/api
NEXT_PUBLIC_APP_URL=https://training.nubofit.ru

# Telegram Bot Username
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot

# Environment
NODE_ENV=production
PORT=3001
```

---

## 🔄 Процесс деплоя:

1. **Остановка** старых процессов (PM2)
2. **Очистка** кэша и старых файлов
3. **Установка** зависимостей (npm install)
4. **Сборка** проекта (npm run build)
5. **Запуск** через PM2
6. **Проверка** статуса и портов
7. **Перезагрузка** Nginx

---

## 📊 Мониторинг:

```bash
# Статус приложений
pm2 status

# Логи в реальном времени
pm2 logs

# Использование ресурсов
pm2 monit

# Проверка портов
netstat -tulpn | grep -E ':(3000|3001)'
```

---

## 🆘 Поддержка:

Если что-то не работает:

1. Проверь `pm2 status` - оба должны быть `online`
2. Проверь `pm2 logs` - ищи ошибки
3. Проверь порты - должны слушаться 3000 и 3001
4. Читай `QUICK_FIX.md` - там решения частых проблем
5. Запусти диагностику из `ШПАРГАЛКА.md`

---

## 📚 Документация:

- **START_HERE.md** - 🎯 Начни отсюда
- **DEPLOY_FINAL.md** - 📖 Полная инструкция (17 шагов)
- **QUICK_FIX.md** - 🚨 Решение проблем
- **ШПАРГАЛКА.md** - 📝 Команды для копирования
- **DEPLOY_COMMANDS.sh** - 🤖 Автоматический скрипт
- **nginx.conf.example** - ⚙️ Конфиг Nginx
- **ecosystem.config.js** - 🔧 Конфиг PM2

---

## ✅ Чеклист успешного деплоя:

- [ ] PM2: оба процесса `online`, `↺ 0`
- [ ] Порты: 3000 и 3001 слушаются
- [ ] Nginx: `active (running)`
- [ ] SSL: сертификат валидный
- [ ] Сайт: открывается без ошибок
- [ ] Регистрация: работает
- [ ] Вход: работает
- [ ] Тренировки: создаются и сохраняются
- [ ] Telegram: бот отвечает

---

## 🎉 Готово!

После успешного деплоя приложение доступно по адресу:

**https://training.nubofit.ru**

Удачи! 💪

