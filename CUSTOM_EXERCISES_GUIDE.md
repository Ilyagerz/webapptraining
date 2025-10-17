# 📝 Руководство по добавлению своих упражнений

## 🎯 Формат данных

Создайте файл `data/custom-exercises.json` со следующей структурой:

```json
[
  {
    "id": "bench-press",
    "name": "Жим штанги лежа",
    "nameEn": "Bench Press (Barbell)",
    "category": "strength",
    "muscleGroup": "chest",
    "equipment": ["barbell"],
    "gifUrl": "/exercises/gifs/bench-press.gif",
    "instructions": [
      "Лягте на скамью, ноги на полу",
      "Возьмите штангу чуть шире плеч",
      "Опустите штангу к груди",
      "Выжмите штангу вверх"
    ]
  }
]
```

## 🖼️ GIF файлы

### Вариант 1: По названию ID
Положите GIF в `public/exercises/gifs/` с названием, соответствующим ID:
- `bench-press.gif`
- `squat.gif`
- `deadlift.gif`

### Вариант 2: По английскому названию
GIF будет автоматически искаться по `nameEn`:
- `Bench Press (Barbell).gif` → `bench-press-barbell.gif`
- `Squat (Barbell).gif` → `squat-barbell.gif`

## 📋 Поля

### Обязательные поля:
- `id` (string) - уникальный идентификатор
- `name` (string) - название на русском
- `muscleGroup` (string) - группа мышц:
  - `chest` - грудь
  - `back` - спина
  - `shoulders` - плечи
  - `legs` - ноги
  - `arms` - руки
  - `abs` - пресс
  - `cardio` - кардио
- `equipment` (array) - оборудование:
  - `barbell` - штанга
  - `dumbbell` - гантели
  - `machine` - тренажер
  - `cable` - блоки/кроссовер
  - `bodyweight` - вес тела
  - `kettlebell` - гиря
  - `band` - резинки

### Необязательные поля:
- `nameEn` (string) - английское название
- `category` (string) - категория (strength, cardio, flexibility, etc.)
- `gifUrl` (string) - путь к GIF (если не указан, будет искаться автоматически)
- `instructions` (array) - инструкции по выполнению

## 🚀 Использование

1. Создайте `data/custom-exercises.json`
2. Добавьте GIF в `public/exercises/gifs/`
3. Перезапустите приложение
4. Упражнения появятся в списке автоматически

## 📝 Пример полного файла

```json
[
  {
    "id": "bench-press",
    "name": "Жим штанги лежа",
    "nameEn": "Bench Press (Barbell)",
    "category": "strength",
    "muscleGroup": "chest",
    "equipment": ["barbell"],
    "instructions": [
      "Лягте на скамью, стопы прижаты к полу",
      "Возьмитесь за гриф хватом шире плеч",
      "Опустите штангу к центру груди",
      "Выжмите штангу вверх до выпрямления рук"
    ]
  },
  {
    "id": "squat",
    "name": "Приседания со штангой",
    "nameEn": "Squat (Barbell)",
    "category": "strength",
    "muscleGroup": "legs",
    "equipment": ["barbell"],
    "instructions": [
      "Положите штангу на трапеции",
      "Ноги на ширине плеч",
      "Присядьте до параллели бедра с полом",
      "Встаньте, отталкиваясь пятками"
    ]
  },
  {
    "id": "deadlift",
    "name": "Становая тяга",
    "nameEn": "Deadlift (Barbell)",
    "category": "strength",
    "muscleGroup": "back",
    "equipment": ["barbell"],
    "instructions": [
      "Встаньте над штангой, ноги на ширине плеч",
      "Наклонитесь и возьмитесь за гриф",
      "Выпрямитесь, поднимая штангу",
      "Опустите штангу обратно под контролем"
    ]
  }
]
```

## ⚙️ Автоматическое сопоставление GIF

Система автоматически ищет GIF в следующем порядке:

1. Проверяет `gifUrl` в JSON
2. Ищет по ID: `/exercises/gifs/{id}.gif`
3. Ищет по английскому названию (приведенному к slug)
4. Показывает плейсхолдер, если не найдено

## 🔄 Обновление

После добавления новых упражнений:

```bash
# Перезапустите сервер разработки
npm run dev

# Или перезапустите production
npm run build
pm2 restart all
```

Упражнения будут доступны сразу после перезапуска!

