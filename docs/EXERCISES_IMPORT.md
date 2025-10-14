# 🏋️ Импорт упражнений из API

## 📋 План действий

### 1. Источник данных
Используем открытое API: **https://wger.de/api/v2/**

**Доступные данные:**
- Упражнения с описаниями
- GIF-анимации
- Мышечные группы
- Оборудование
- Категории

---

## 🛠️ Шаг 1: Создаем скрипт импорта

Создай файл `scripts/import-exercises.js`:

```javascript
// Скрипт для импорта упражнений из wger.de API

const fs = require('fs');
const path = require('path');

// Маппинг мышечных групп
const muscleGroupMap = {
  'biceps': 'arms',
  'triceps': 'arms',
  'shoulders': 'shoulders',
  'chest': 'chest',
  'back': 'back',
  'abs': 'abs',
  'quadriceps': 'legs',
  'hamstrings': 'legs',
  'calves': 'legs',
  'glutes': 'legs',
};

// Маппинг оборудования
const equipmentMap = {
  'barbell': 'Штанга',
  'dumbbell': 'Гантели',
  'bench': 'Скамья',
  'pull-up bar': 'Турник',
  'none': 'Без оборудования',
  'cable': 'Блок',
  'machine': 'Тренажер',
  'ez-bar': 'EZ-гриф',
  'kettlebell': 'Гиря',
};

async function fetchExercises() {
  const exercises = [];
  
  // Эндпоинты API
  const baseUrl = 'https://wger.de/api/v2';
  
  // Популярные упражнения (ID из wger.de)
  const popularExercises = [
    { id: 84, nameRu: 'Жим штанги лежа', muscleGroup: 'chest' },
    { id: 88, nameRu: 'Приседания со штангой', muscleGroup: 'legs' },
    { id: 27, nameRu: 'Становая тяга', muscleGroup: 'back' },
    { id: 74, nameRu: 'Жим штанги стоя', muscleGroup: 'shoulders' },
    { id: 86, nameRu: 'Тяга штанги в наклоне', muscleGroup: 'back' },
    { id: 345, nameRu: 'Подтягивания', muscleGroup: 'back' },
    { id: 90, nameRu: 'Отжимания на брусьях', muscleGroup: 'chest' },
    { id: 116, nameRu: 'Жим гантелей лежа', muscleGroup: 'chest' },
    { id: 125, nameRu: 'Разведение гантелей лежа', muscleGroup: 'chest' },
    { id: 76, nameRu: 'Подъем штанги на бицепс', muscleGroup: 'arms' },
    { id: 82, nameRu: 'Французский жим', muscleGroup: 'arms' },
    { id: 129, nameRu: 'Подъем гантелей на бицепс', muscleGroup: 'arms' },
    { id: 139, nameRu: 'Жим ногами', muscleGroup: 'legs' },
    { id: 141, nameRu: 'Разгибания ног', muscleGroup: 'legs' },
    { id: 142, nameRu: 'Сгибания ног', muscleGroup: 'legs' },
    { id: 91, nameRu: 'Планка', muscleGroup: 'abs' },
    { id: 128, nameRu: 'Скручивания', muscleGroup: 'abs' },
  ];
  
  for (const ex of popularExercises) {
    try {
      const response = await fetch(`${baseUrl}/exercise/${ex.id}/`);
      const data = await response.json();
      
      // Получаем GIF
      let gifUrl = '';
      if (data.variations && data.variations.length > 0) {
        const varResponse = await fetch(`${baseUrl}/exerciseimage/?exercise=${ex.id}`);
        const varData = await varResponse.json();
        if (varData.results && varData.results.length > 0) {
          gifUrl = varData.results[0].image || '';
        }
      }
      
      exercises.push({
        id: `ex-${ex.id}`,
        name: ex.nameRu,
        nameEn: data.name || '',
        muscleGroup: ex.muscleGroup,
        equipment: equipmentMap[data.equipment?.[0]?.name] || 'Различное',
        description: data.description || '',
        instructions: data.instructions || '',
        gifUrl: gifUrl,
        difficulty: 'intermediate',
      });
      
      console.log(`✅ Импортировано: ${ex.nameRu}`);
      
      // Задержка чтобы не спамить API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Ошибка при импорте ${ex.nameRu}:`, error.message);
    }
  }
  
  return exercises;
}

async function main() {
  console.log('🏋️ Начинаем импорт упражнений...\n');
  
  const exercises = await fetchExercises();
  
  // Сохраняем в JSON
  const outputPath = path.join(__dirname, '..', 'data', 'exercises.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2));
  
  console.log(`\n✅ Импортировано ${exercises.length} упражнений!`);
  console.log(`📁 Сохранено в: ${outputPath}`);
}

main().catch(console.error);
```

---

## 🚀 Шаг 2: Запуск импорта

```bash
# 1. Создай скрипт
mkdir -p scripts
# (скопируй код выше в scripts/import-exercises.js)

# 2. Запусти
node scripts/import-exercises.js

# 3. Проверь результат
cat data/exercises.json
```

---

## 📝 Шаг 3: Альтернатива - ручной JSON

Если не хочешь заморачиваться с API, создай `data/exercises.json`:

```json
[
  {
    "id": "zhim-shtangi-lezha",
    "name": "Жим штанги лежа",
    "muscleGroup": "chest",
    "equipment": "Штанга",
    "description": "Базовое упражнение для развития грудных мышц",
    "instructions": "1. Лягте на скамью\n2. Возьмите штангу\n3. Опустите до груди\n4. Выжмите вверх",
    "gifUrl": "https://example.com/bench-press.gif",
    "difficulty": "intermediate"
  },
  {
    "id": "prisedaniya",
    "name": "Приседания со штангой",
    "muscleGroup": "legs",
    "equipment": "Штанга",
    "description": "Базовое упражнение для ног",
    "instructions": "1. Положите штангу на плечи\n2. Присядьте до параллели\n3. Вернитесь в исходное положение",
    "gifUrl": "",
    "difficulty": "intermediate"
  }
]
```

---

## 🔧 Шаг 4: Загрузка в базу

Создай `scripts/seed-exercises.js`:

```javascript
const fs = require('fs');
const path = require('path');

// Этот скрипт добавляет упражнения в in-memory хранилище сервера
// Позже когда подключишь MongoDB - будет загружать туда

async function seedExercises() {
  const exercisesPath = path.join(__dirname, '..', 'data', 'exercises.json');
  const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));
  
  console.log(`📚 Загружено ${exercises.length} упражнений из файла`);
  
  for (const exercise of exercises) {
    try {
      const response = await fetch('http://localhost:3001/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exercise),
      });
      
      if (response.ok) {
        console.log(`✅ ${exercise.name}`);
      } else {
        console.error(`❌ Ошибка: ${exercise.name}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка при загрузке ${exercise.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Импорт завершен!');
}

seedExercises().catch(console.error);
```

---

## 📋 Готовый список популярных упражнений

Хочешь я создам готовый `exercises.json` с популярными упражнениями?

**Включит:**
- 50+ упражнений
- Все мышечные группы
- Русские названия
- Описания и инструкции
- Ссылки на GIF (где доступны)

---

## 🎯 Рекомендация

**Для старта:**
1. Я создам готовый `data/exercises.json` с популярными упражнениями
2. Ты просто импортируешь его
3. Позже добавишь еще упражнения по мере надобности

**Для продакшена:**
- Подключим полноценную базу упражнений через API
- Или загрузим в MongoDB полный список

**Что делаем сейчас?** Создать готовый exercises.json? 💪

