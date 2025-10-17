/**
 * Скрипт для перевода упражнений на русский язык
 * Использует словарь переводов из translations.json
 */

const fs = require('fs');
const path = require('path');

// Загрузка переводов
const translationsPath = path.join(__dirname, 'translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));

/**
 * Переводит текст используя словарь
 */
function translateText(text, context = 'general') {
  if (!text) return text;
  
  const lowerText = text.toLowerCase().trim();
  
  // Проверяем точные совпадения в разных категориях
  const categories = [
    'exerciseNames',
    'muscleGroups',
    'bodyParts',
    'equipment',
    'positions',
    'difficulty',
    'category',
    'force',
    'mechanic',
  ];
  
  for (const category of categories) {
    if (translations[category] && translations[category][lowerText]) {
      return translations[category][lowerText];
    }
  }
  
  // Построчная замена слов
  let result = lowerText;
  
  // Заменяем слова из всех категорий
  Object.values(translations).forEach(categoryDict => {
    Object.entries(categoryDict).forEach(([eng, rus]) => {
      // Используем границы слов для точной замены
      const regex = new RegExp(`\\b${eng}\\b`, 'gi');
      result = result.replace(regex, rus);
    });
  });
  
  // Удаляем лишние пробелы
  result = result.replace(/\s+/g, ' ').trim();
  
  // Делаем первую букву заглавной
  if (result) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  
  return result;
}

/**
 * Переводит массив строк
 */
function translateArray(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(item => translateText(item));
}

/**
 * Переводит название упражнения более умно
 */
function translateExerciseName(name) {
  if (!name) return name;
  
  // Проверяем точное совпадение
  const lowerName = name.toLowerCase();
  if (translations.exerciseNames[lowerName]) {
    return translations.exerciseNames[lowerName];
  }
  
  // Разбиваем на части и переводим каждую
  let parts = name.toLowerCase().split(/[\s-]+/);
  let translatedParts = [];
  
  for (let part of parts) {
    let translated = false;
    
    // Проверяем во всех категориях
    for (let category of Object.keys(translations)) {
      if (translations[category][part]) {
        translatedParts.push(translations[category][part]);
        translated = true;
        break;
      }
    }
    
    if (!translated) {
      translatedParts.push(part);
    }
  }
  
  // Собираем результат
  let result = translatedParts.join(' ');
  
  // Делаем первую букву заглавной
  result = result.charAt(0).toUpperCase() + result.slice(1);
  
  return result;
}

/**
 * Основная функция перевода упражнения
 */
function translateExercise(exercise) {
  const translated = {
    id: exercise.id,
    name: translateExerciseName(exercise.name),
    originalName: exercise.name,
  };
  
  // Переводим группу мышц
  if (exercise.target) {
    translated.muscleGroup = translateText(exercise.target);
  } else if (exercise.primaryMuscles) {
    translated.muscleGroup = translateArray(exercise.primaryMuscles).join(', ');
  } else if (exercise.muscleGroup) {
    translated.muscleGroup = translateText(exercise.muscleGroup);
  }
  
  // Переводим вторичные мышцы
  if (exercise.secondaryMuscles) {
    translated.secondaryMuscles = translateArray(exercise.secondaryMuscles);
  } else if (exercise.synergists) {
    translated.secondaryMuscles = translateArray(exercise.synergists);
  }
  
  // Переводим оборудование
  if (exercise.equipment) {
    if (Array.isArray(exercise.equipment)) {
      translated.equipment = translateArray(exercise.equipment).join(', ');
    } else {
      translated.equipment = translateText(exercise.equipment);
    }
  }
  
  // Переводим части тела
  if (exercise.bodyPart) {
    if (Array.isArray(exercise.bodyPart)) {
      translated.bodyParts = translateArray(exercise.bodyPart);
    } else {
      translated.bodyParts = [translateText(exercise.bodyPart)];
    }
  }
  
  // Инструкции
  if (exercise.instructions) {
    if (Array.isArray(exercise.instructions)) {
      translated.instructions = exercise.instructions;
    } else {
      translated.instructions = [exercise.instructions];
    }
  }
  
  // Описание
  if (exercise.description) {
    translated.description = exercise.description;
  } else if (translated.muscleGroup) {
    translated.description = `Упражнение для ${translated.muscleGroup}`;
  }
  
  // GIF URL
  if (exercise.gifUrl) {
    translated.gifUrl = exercise.gifUrl;
  } else if (exercise.images && exercise.images.length > 0) {
    translated.gifUrl = exercise.images[0];
  }
  
  // Сложность
  if (exercise.level) {
    translated.difficulty = translateText(exercise.level, 'difficulty');
  } else if (exercise.difficulty) {
    translated.difficulty = translateText(exercise.difficulty, 'difficulty');
  } else {
    translated.difficulty = 'Средний';
  }
  
  // Категория
  if (exercise.category) {
    translated.category = translateText(exercise.category, 'category');
  }
  
  // Тип силы
  if (exercise.force) {
    translated.force = translateText(exercise.force, 'force');
  }
  
  // Механика
  if (exercise.mechanic) {
    translated.mechanic = translateText(exercise.mechanic, 'mechanic');
  }
  
  return translated;
}

/**
 * Основная функция
 */
async function main() {
  console.log('🔄 Начинаем перевод упражнений...\n');
  
  try {
    // Путь к исходному файлу
    const inputPath = process.argv[2] || path.join(__dirname, '..', 'data', 'exercises.json');
    
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Файл не найден: ${inputPath}`);
      console.log('Использование: node scripts/translate-exercises.js [путь_к_файлу]');
      process.exit(1);
    }
    
    console.log(`📂 Читаем файл: ${inputPath}`);
    
    // Читаем файл
    const data = fs.readFileSync(inputPath, 'utf-8');
    const exercises = JSON.parse(data);
    
    if (!Array.isArray(exercises)) {
      console.error('❌ Файл не содержит массив упражнений');
      process.exit(1);
    }
    
    console.log(`✅ Загружено ${exercises.length} упражнений\n`);
    
    // Переводим
    console.log('🌍 Переводим упражнения...\n');
    const translatedExercises = [];
    
    for (let i = 0; i < exercises.length; i++) {
      if ((i + 1) % 100 === 0) {
        console.log(`   Переведено ${i + 1}/${exercises.length}...`);
      }
      
      const translated = translateExercise(exercises[i]);
      translatedExercises.push(translated);
    }
    
    console.log(`\n✅ Переведено ${translatedExercises.length} упражнений\n`);
    
    // Сохраняем результат
    const outputPath = inputPath.replace('.json', '-translated.json');
    fs.writeFileSync(outputPath, JSON.stringify(translatedExercises, null, 2), 'utf-8');
    
    console.log(`💾 Результат сохранен в: ${outputPath}\n`);
    
    // Статистика
    console.log('📊 Статистика перевода:\n');
    
    // Группы мышц
    const muscleGroups = new Set();
    translatedExercises.forEach(ex => {
      if (ex.muscleGroup) muscleGroups.add(ex.muscleGroup);
    });
    
    console.log(`Групп мышц: ${muscleGroups.size}`);
    console.log('Топ-10 групп:');
    const muscleCount = {};
    translatedExercises.forEach(ex => {
      const muscle = ex.muscleGroup;
      muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
    });
    Object.entries(muscleCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([muscle, count]) => {
        console.log(`  ${muscle}: ${count}`);
      });
    
    // Оборудование
    console.log('\nТоп-10 видов оборудования:');
    const equipmentCount = {};
    translatedExercises.forEach(ex => {
      const equipment = ex.equipment;
      equipmentCount[equipment] = (equipmentCount[equipment] || 0) + 1;
    });
    Object.entries(equipmentCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([equipment, count]) => {
        console.log(`  ${equipment}: ${count}`);
      });
    
    // Примеры переводов
    console.log('\n📝 Примеры переводов:\n');
    translatedExercises.slice(0, 5).forEach(ex => {
      console.log(`  ${ex.originalName} → ${ex.name}`);
    });
    
    console.log('\n✅ Готово!\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Экспорт для использования в других скриптах
module.exports = {
  translateText,
  translateArray,
  translateExerciseName,
  translateExercise,
};

// Запуск если вызван напрямую
if (require.main === module) {
  main();
}

