# 🚀 Быстрая справка NUBO Training

## 📖 Документация

| Файл | Описание |
|------|----------|
| [COLOR_GUIDE.md](COLOR_GUIDE.md) | 🎨 Как изменить цвета приложения |
| [GIT_UPDATE_GUIDE.md](GIT_UPDATE_GUIDE.md) | 🔄 Как безопасно обновить приложение |
| [EXERCISEDB_GUIDE.md](EXERCISEDB_GUIDE.md) | 🏋️ Работа с базой упражнений |
| [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md) | 📝 Все последние изменения |
| [scripts/README.md](scripts/README.md) | 🔧 Как использовать скрипты |

---

## 🎨 Изменение цветов

### Основной акцентный цвет

**Файл:** `tailwind.config.js`

```javascript
colors: {
  'electric-lime': '#C6FF00',  // ← Измените здесь
}
```

### Цвета светлой/темной темы

**Файл:** `app/globals.css`

```css
:root {
  --accent: 204 255 0;  /* Светлая тема */
}

.dark {
  --accent: 204 255 0;  /* Темная тема */
}
```

**Подробнее:** [COLOR_GUIDE.md](COLOR_GUIDE.md)

---

## 🔄 Обновление приложения

### Базовое обновление

```bash
cd /Users/ilagorelockin/Desktop/webapptraining
git pull origin main
npm install
npm run dev
```

### С сохранением изменений

```bash
git stash              # Сохранить изменения
git pull origin main   # Обновить
git stash pop          # Восстановить изменения
npm install
npm run dev
```

**⚠️ Важно:** Данные пользователей в localStorage НЕ удаляются при обновлении!

**Подробнее:** [GIT_UPDATE_GUIDE.md](GIT_UPDATE_GUIDE.md)

---

## 🏋️ База данных упражнений

### Загрузить упражнения

```bash
# Из бесплатного источника (~800 упражнений)
npm run exercises:fetch

# Результат:
# data/exercises-full.json
# data/exercises-simplified.json
```

### Перевести на русский

```bash
npm run exercises:translate
```

### Загрузить и перевести автоматически

```bash
npm run exercises:update
```

### С RapidAPI (5000+ упражнений)

```bash
export RAPIDAPI_KEY=your_key
npm run exercises:fetch-api
```

**Подробнее:** [EXERCISEDB_GUIDE.md](EXERCISEDB_GUIDE.md)

---

## 🛠️ Полезные команды

### Разработка

```bash
npm run dev              # Запустить frontend
npm run dev:backend      # Запустить backend
npm run dev:all          # Запустить оба
```

### Сборка

```bash
npm run build            # Собрать для продакшна
npm run start            # Запустить продакшн версию
```

### Упражнения

```bash
npm run exercises:fetch       # Загрузить упражнения
npm run exercises:translate   # Перевести упражнения
npm run exercises:fetch-api   # Через RapidAPI
npm run exercises:update      # Загрузить + перевести
```

---

## 📁 Структура проекта

```
webapptraining/
├── app/                    # Страницы Next.js
│   ├── dashboard/         # Главная страница
│   ├── workout/           # Страницы тренировок
│   ├── profile/           # Профиль
│   └── globals.css        # ← Глобальные стили и темы
│
├── components/            # React компоненты
│   ├── ExerciseCard.tsx  # ← Карточка упражнения
│   └── ...
│
├── data/                  # Данные
│   └── exercises.json     # База упражнений
│
├── lib/                   # Библиотеки
│   ├── store.ts          # Zustand store
│   └── exercises-data.ts # Работа с упражнениями
│
├── scripts/              # Скрипты
│   ├── fetch-exercisedb.js      # ← Загрузка упражнений
│   ├── translate-exercises.js   # ← Перевод
│   └── translations.json        # ← Словарь переводов
│
├── tailwind.config.js    # ← Конфигурация Tailwind + цвета
├── package.json          # ← Зависимости и команды
│
└── Документация/
    ├── COLOR_GUIDE.md         # Изменение цветов
    ├── GIT_UPDATE_GUIDE.md    # Обновление через Git
    ├── EXERCISEDB_GUIDE.md    # Работа с упражнениями
    ├── CHANGES_SUMMARY.md     # Сводка изменений
    └── QUICK_REFERENCE.md     # Эта справка
```

---

## 🎯 Где что находится

### Цвета приложения

| Элемент | Файл | Строка |
|---------|------|--------|
| Основные цвета | `tailwind.config.js` | 11-14 |
| Светлая тема | `app/globals.css` | 6-19 |
| Темная тема | `app/globals.css` | 21-34 |

### Компоненты тренировки

| Элемент | Файл |
|---------|------|
| Карточка упражнения | `components/ExerciseCard.tsx` |
| Выбор упражнений | `components/ExercisePicker.tsx` |
| Таймер отдыха | `components/RestTimer.tsx` |
| Активная тренировка | `app/workout/active/page.tsx` |

### База данных

| Элемент | Файл |
|---------|------|
| Упражнения | `data/exercises.json` |
| Загрузка | `scripts/fetch-exercisedb.js` |
| Перевод | `scripts/translate-exercises.js` |
| Словарь | `scripts/translations.json` |

---

## 🔧 Частые задачи

### Изменить цвет кнопки "Начать"

**Файл:** `app/dashboard/page.tsx` (строка 168)

```javascript
className="bg-gradient-to-br from-electric-lime to-green-400 ..."
//                            ↑ Измените здесь
```

### Изменить цвет полей ввода

**Файл:** `components/ExerciseCard.tsx` (строки 370, 388)

```javascript
className="... bg-gray-100 dark:bg-gray-700 ..."
//             ↑ Светлая      ↑ Темная
```

### Добавить новый перевод

**Файл:** `scripts/translations.json`

```json
{
  "exerciseNames": {
    "your exercise": "ваше упражнение"
  }
}
```

Затем: `npm run exercises:translate`

---

## 📊 Что изменилось

### ✅ Выполнено

1. ✨ Обновлен UI меню (иконки одинаковые, маленькие)
2. 🔘 Кнопка "Начать" не переходит автоматически
3. 🎨 Поля ввода серые вместо желтых
4. 📝 Текст заголовков черный/белый в зависимости от темы
5. 📚 Создана документация по цветам
6. 📚 Создана документация по Git
7. 🏋️ Создан скрипт загрузки упражнений
8. 🌍 Добавлен перевод на русский (150+ переводов)

**Подробнее:** [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)

---

## 💡 Подсказки

### Backup данных пользователей

Откройте консоль браузера (F12) и выполните:

```javascript
function backupData() {
  const data = {
    workouts: localStorage.getItem('workouts'),
    templates: localStorage.getItem('templates'),
    user: localStorage.getItem('user'),
  };
  console.log(JSON.stringify(data));
}
backupData();
```

### Проверить версию Node.js

```bash
node --version  # Должно быть >= 18
npm --version   # Должно быть >= 9
```

### Очистить кэш Next.js

```bash
rm -rf .next
npm run dev
```

### Переустановить зависимости

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Куда обратиться

### По вопросам цветов
→ [COLOR_GUIDE.md](COLOR_GUIDE.md)

### По вопросам обновлений
→ [GIT_UPDATE_GUIDE.md](GIT_UPDATE_GUIDE.md)

### По вопросам упражнений
→ [EXERCISEDB_GUIDE.md](EXERCISEDB_GUIDE.md)

### Скрипты не работают
→ [scripts/README.md](scripts/README.md)

### Полная сводка изменений
→ [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)

---

## 🔗 Полезные ссылки

- **Tailwind CSS:** https://tailwindcss.com/docs
- **Next.js:** https://nextjs.org/docs
- **ExerciseDB API:** https://www.exercisedb.dev/
- **Free Exercise DB:** https://github.com/yuhonas/free-exercise-db

---

**Последнее обновление:** 17 октября 2025  
**Версия:** 1.1.0

