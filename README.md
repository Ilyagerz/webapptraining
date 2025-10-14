# 🏋️ NUBO Training - Твой персональный тренер

Приложение для тренировок с AI генератором программ, отслеживанием прогресса и интеграцией с Telegram.

---

## ✅ ВСЕ ФАЙЛЫ ВОССТАНОВЛЕНЫ!

Все 22 пустых файла успешно восстановлены. Проект готов к работе!

---

## 🚀 БЫСТРЫЙ СТАРТ

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

Создай файл `.env.local`:

```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
MONGODB_URI=
NODE_ENV=development
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

### 3. Запуск

```bash
# Запуск фронтенда и бэкенда одновременно
npm run dev:all
```

Откроется:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

---

## 📚 ДОКУМЕНТАЦИЯ

Вся документация находится в папке `docs/`:

### Основные руководства:
- **`docs/GIT_GUIDE.md`** - Полное руководство по Git (НАЧНИ ОТСЮДА!)
- **`docs/DEPLOY_FINAL.md`** - Деплой на VDS
- **`docs/FIX_SERVER_BUILD.md`** - Решение проблем со сборкой

---

## 🎯 ЧТО ДАЛЬШЕ?

### 1. Настрой Git (5 минут)

```bash
# Инициализируй Git
git init

# Настрой свои данные
git config --global user.name "Твое Имя"
git config --global user.email "твой@email.com"

# Первый коммит
git add .
git commit -m "Initial commit: все файлы восстановлены"
```

**Подробнее:** `docs/GIT_GUIDE.md`

### 2. Исправь ошибки сборки

В проекте есть несколько ошибок TypeScript, которые нужно исправить.

Запусти сборку и исправь ошибки:

```bash
npm run build
```

### 3. Задеплой на сервер

Когда все ошибки исправлены:

```bash
# На сервере
cd ~/webapptraining
git pull
bash DEPLOY_COMMANDS.sh
```

**Подробнее:** `docs/DEPLOY_FINAL.md`

---

## 🛠️ ТЕХНОЛОГИИ

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Express.js, JWT, bcrypt
- **State:** Zustand
- **Charts:** Chart.js
- **Icons:** Lucide React
- **Deployment:** PM2, Nginx, Let's Encrypt

---

## 📁 СТРУКТУРА ПРОЕКТА

```
webapptraining/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Главная страница
│   ├── workout/           # Тренировки
│   ├── templates/         # Шаблоны программ
│   ├── ai-program/        # AI генератор
│   └── ...
├── components/            # React компоненты
├── lib/                   # Утилиты и хелперы
├── server/                # Express бэкенд
├── types/                 # TypeScript типы
├── docs/                  # Документация
└── data/                  # Данные (упражнения)
```

---

## 🐛 ИЗВЕСТНЫЕ ПРОБЛЕМЫ

1. **Ошибки TypeScript при сборке** - нужно исправить типы в нескольких файлах
2. **Некоторые компоненты используют демо-данные** - нужно подключить к API

---

## 💡 ПОЛЕЗНЫЕ КОМАНДЫ

```bash
# Разработка
npm run dev              # Только фронтенд
npm run dev:backend      # Только бэкенд
npm run dev:all          # Фронтенд + Бэкенд

# Сборка
npm run build            # Продакшн сборка
npm start                # Запуск продакшн версии

# Git
git status               # Статус изменений
git add .                # Добавить все файлы
git commit -m "message"  # Сохранить изменения
git push                 # Отправить на GitHub
```

---

## 📞 ПОДДЕРЖКА

Если возникли проблемы:

1. Проверь `docs/QUICK_FIX.md` - решения частых проблем
2. Запусти диагностику из `docs/ШПАРГАЛКА.md`
3. Проверь логи: `pm2 logs`

---

## 🎉 ГОТОВО!

Проект восстановлен и готов к работе!

**Следующие шаги:**
1. Прочитай `docs/GIT_GUIDE.md`
2. Настрой Git репозиторий
3. Исправь ошибки сборки
4. Задеплой на сервер

**Удачи! 💪**
