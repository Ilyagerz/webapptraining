const fs = require('fs');
const path = require('path');

// Функция для парсинга файла с переводами
function parseTranslationsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const translations = {};
  let currentGroup = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Пропускаем пустые строки
    if (!trimmed) continue;
    
    // Разделяем английское название и русский перевод
    // Поддерживаем оба типа тире: — (длинное) и - (обычное)
    let parts = [];
    if (trimmed.includes('—')) {
      parts = trimmed.split('—').map(p => p.trim());
    } else if (trimmed.includes(' - ')) {
      parts = trimmed.split(' - ').map(p => p.trim());
    }
    
    if (parts.length === 2) {
      // Это строка с переводом
      const englishName = parts[0].trim();
      const russianName = parts[1].trim();
      
      // Сохраняем перевод (используем нижний регистр для поиска)
      translations[englishName.toLowerCase()] = {
        russian: russianName,
        group: currentGroup
      };
    } else if (parts.length === 0 || parts.length === 1) {
      // Это группа мышц (строка без тире)
      currentGroup = trimmed;
    }
  }
  
  return translations;
}

// Функция нормализации названия для поиска
function normalizeForSearch(name) {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Удаляем все в скобках
    .replace(/\s+/g, ' ')
    .trim();
}

// Функция для поиска наиболее подходящего перевода
function findTranslation(exerciseName, translations) {
  const lowerName = exerciseName.toLowerCase();
  
  // 1. Точное совпадение
  if (translations[lowerName]) {
    return translations[lowerName].russian;
  }
  
  // 2. Совпадение без скобок
  const normalized = normalizeForSearch(exerciseName);
  for (const [key, value] of Object.entries(translations)) {
    if (normalizeForSearch(key) === normalized) {
      return value.russian;
    }
  }
  
  // 3. Частичное совпадение (без учета деталей в скобках)
  const baseName = exerciseName.split('(')[0].trim().toLowerCase();
  for (const [key, value] of Object.entries(translations)) {
    const baseKey = key.split('(')[0].trim();
    if (baseKey === baseName) {
      return value.russian;
    }
  }
  
  return null;
}

// Основная функция
async function applyManualTranslations() {
  const translationsPath = path.join(__dirname, '..', 'перевод.md');
  const inputPath = path.join(__dirname, '..', 'data', 'custom-exercises.json');
  const outputPath = path.join(__dirname, '..', 'data', 'custom-exercises-ru.json');
  
  console.log('📖 Читаю словарь переводов из:', translationsPath);
  const translations = parseTranslationsFile(translationsPath);
  console.log(`✅ Загружено ${Object.keys(translations).length} переводов`);
  
  console.log('\n📖 Читаю упражнения из:', inputPath);
  const exercises = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`📝 Найдено ${exercises.length} упражнений для перевода\n`);
  
  let translatedCount = 0;
  let notFoundCount = 0;
  const notFound = [];
  
  // Маппинг русских групп мышц в английские enum
  const russianToEnglishMuscleGroup = {
    'Ноги': 'legs',
    'Спина': 'back',
    'Плечи': 'shoulders',
    'Руки': 'arms',
    'Кор': 'abs',
    'Кардио': 'cardio',
    'Грудь': 'chest',
    'Все тело': 'fullBody',
    'Олимпийские упражнения': 'fullBody',
    'Другое': 'other'
  };

  // Маппинг русского оборудования в английские enum
  const russianToEnglishEquipment = {
    'Штанга': 'barbell',
    'Гантели': 'dumbbell',
    'Гантель': 'dumbbell',
    'Гиря': 'kettlebell',
    'Кабель': 'cable',
    'Тренажер': 'machine',
    'Резинка': 'bands',
    'Резинкой': 'bands',
    'Собственный вес': 'bodyweight',
    'Bodyweight': 'bodyweight',
    'Без оборудования': 'bodyweight',
    'Машина Смита': 'machine',
    'Смит': 'machine'
  };

  const translatedExercises = exercises.map((exercise, index) => {
    const translation = findTranslation(exercise.name, translations);
    
    // Конвертируем muscleGroup если она на русском
    let muscleGroupEnum = exercise.muscleGroup;
    if (typeof exercise.muscleGroup === 'string' && russianToEnglishMuscleGroup[exercise.muscleGroup]) {
      muscleGroupEnum = russianToEnglishMuscleGroup[exercise.muscleGroup];
    }

    // Конвертируем equipment если на русском
    let equipmentEnum = exercise.equipment;
    if (Array.isArray(exercise.equipment)) {
      equipmentEnum = exercise.equipment.map(eq => {
        if (russianToEnglishEquipment[eq]) {
          return russianToEnglishEquipment[eq];
        }
        return eq.toLowerCase();
      });
    }
    
    if (translation) {
      translatedCount++;
      if ((index + 1) % 10 === 0) {
        console.log(`✅ ${index + 1}/${exercises.length}: ${exercise.name} → ${translation}`);
      }
      return {
        ...exercise,
        name: translation,
        nameEn: exercise.name,
        muscleGroup: muscleGroupEnum,
        equipment: equipmentEnum
      };
    } else {
      notFoundCount++;
      notFound.push(exercise.name);
      console.log(`⚠️  ${index + 1}/${exercises.length}: ${exercise.name} - ПЕРЕВОД НЕ НАЙДЕН`);
      return {
        ...exercise,
        nameEn: exercise.name,
        muscleGroup: muscleGroupEnum,
        equipment: equipmentEnum
        // Оставляем name как есть
      };
    }
  });
  
  // Сохраняем результат
  fs.writeFileSync(outputPath, JSON.stringify(translatedExercises, null, 2), 'utf8');
  
  console.log('\n════════════════════════════════════════════════════════');
  console.log(`✅ Готово! Сохранено в: ${outputPath}`);
  console.log(`📊 Переведено: ${translatedCount} из ${exercises.length}`);
  console.log(`⚠️  Не найдено переводов: ${notFoundCount}`);
  
  if (notFound.length > 0) {
    console.log('\n📝 Упражнения без перевода:');
    notFound.forEach(name => console.log(`   - ${name}`));
  }
  
  // Показываем примеры успешных переводов
  console.log('\n📋 Примеры переводов:');
  for (let i = 0; i < Math.min(10, translatedExercises.length); i++) {
    if (translatedExercises[i].nameEn && translatedExercises[i].name !== translatedExercises[i].nameEn) {
      console.log(`   ${translatedExercises[i].nameEn}`);
      console.log(`   → ${translatedExercises[i].name}`);
      console.log('');
    }
  }
  
  console.log('════════════════════════════════════════════════════════\n');
}

applyManualTranslations().catch(console.error);

