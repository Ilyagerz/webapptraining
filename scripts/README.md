# Скрипты для работы с упражнениями

Этот каталог содержит скрипты для загрузки и перевода базы данных упражнений из ExerciseDB.

## 🚀 Быстрый старт

### 1. Загрузить упражнения из бесплатного источника

```bash
npm run exercises:fetch
```

Это загрузит ~800 упражнений из открытой базы данных и сохранит их в:
- `data/exercises-full.json` - полная версия
- `data/exercises-simplified.json` - упрощенная версия

### 2. Перевести существующий файл

```bash
npm run exercises:translate
```

Или указать конкретный файл:

```bash
node scripts/translate-exercises.js data/exercises.json
```

### 3. Загрузить и перевести автоматически

```bash
npm run exercises:update
```

## 📋 Доступные команды

| Команда | Описание |
|---------|----------|
| `npm run exercises:fetch` | Загрузить упражнения из GitHub |
| `npm run exercises:translate` | Перевести упражнения |
| `npm run exercises:fetch-api` | Загрузить из RapidAPI (нужен ключ) |
| `npm run exercises:update` | Загрузить и перевести |

## 🔧 Использование с RapidAPI

Если у вас есть ключ от RapidAPI:

```bash
# Способ 1: Через переменную окружения
export RAPIDAPI_KEY=your_key_here
npm run exercises:fetch-api

# Способ 2: Напрямую
node scripts/fetch-exercisedb.js --rapidapi --api-key your_key_here
```

## 📝 Файлы

- **fetch-exercisedb.js** - Загружает упражнения из ExerciseDB API или GitHub
- **translate-exercises.js** - Переводит упражнения на русский язык
- **translations.json** - Словарь переводов (можно редактировать)

## 🌍 Добавление переводов

Откройте `scripts/translations.json` и добавьте свои переводы:

```json
{
  "exerciseNames": {
    "push up": "отжимания",
    "pull up": "подтягивания"
  },
  "muscleGroups": {
    "chest": "Грудь",
    "back": "Спина"
  }
}
```

После изменения переводов запустите:

```bash
npm run exercises:translate
```

## 📊 Пример вывода

```
🏋️ Начинаем загрузку упражнений из ExerciseDB API...

📥 Загружаем данные с GitHub...
✅ Загружено 823 упражнений

🔄 Начинаем перевод и обработку...
   Обработано 100/823 упражнений...
   Обработано 200/823 упражнений...
   ...
✅ Обработано 823 упражнений

💾 Упражнения сохранены в: .../data/exercises-full.json
💾 Упрощенная версия сохранена в: .../data/exercises-simplified.json

📊 Статистика:

Группы мышц:
  Грудь: 85
  Спина: 92
  Плечи: 67
  ...

Оборудование:
  Штанга: 145
  Гантели: 178
  Собственный вес: 98
  ...

✅ Готово!
```

## 🔗 Ссылки

- [Полная документация](../EXERCISEDB_GUIDE.md)
- [ExerciseDB API](https://www.exercisedb.dev/)
- [Free Exercise DB](https://github.com/yuhonas/free-exercise-db)
- [RapidAPI ExerciseDB](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)

