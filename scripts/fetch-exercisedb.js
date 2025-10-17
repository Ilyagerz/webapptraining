/**
 * Скрипт для загрузки упражнений из ExerciseDB API v1
 * и перевода их на русский язык
 * 
 * Использование:
 * node scripts/fetch-exercisedb.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Базовый URL для ExerciseDB API v1
const BASE_URL = 'https://exercisedb.p.rapidapi.com';

// Словарь для перевода
const TRANSLATIONS = {
  // Группы мышц
  'chest': 'Грудь',
  'back': 'Спина',
  'shoulders': 'Плечи',
  'biceps': 'Бицепс',
  'triceps': 'Трицепс',
  'legs': 'Ноги',
  'abs': 'Пресс',
  'glutes': 'Ягодицы',
  'quads': 'Квадрицепсы',
  'hamstrings': 'Бицепс бедра',
  'calves': 'Икры',
  'forearms': 'Предплечья',
  'traps': 'Трапеции',
  'lats': 'Широчайшие',
  'lower back': 'Поясница',
  'upper back': 'Верх спины',
  'middle back': 'Середина спины',
  'cardio': 'Кардио',
  'neck': 'Шея',
  'adductors': 'Приводящие',
  'abductors': 'Отводящие',
  
  // Части тела (bodyParts)
  'upper arms': 'Руки (верх)',
  'lower arms': 'Руки (низ)',
  'upper legs': 'Ноги (верх)',
  'lower legs': 'Ноги (низ)',
  'waist': 'Талия',
  
  // Оборудование
  'barbell': 'Штанга',
  'dumbbell': 'Гантели',
  'cable': 'Кабель',
  'machine': 'Тренажер',
  'body weight': 'Собственный вес',
  'assisted': 'С помощью',
  'band': 'Резинка',
  'medicine ball': 'Медбол',
  'stability ball': 'Фитбол',
  'kettlebell': 'Гиря',
  'ez barbell': 'EZ-штанга',
  'trap bar': 'Трэп-гриф',
  'smith machine': 'Машина Смита',
  'leverage machine': 'Рычажный тренажер',
  'rope': 'Канат',
  'skierg machine': 'Лыжный тренажер',
  'sled machine': 'Сани',
  'upper body ergometer': 'Эргометр для верха тела',
  'elliptical machine': 'Эллиптический тренажер',
  'stationary bike': 'Велотренажер',
  'roller': 'Ролик',
  'wheel roller': 'Колесо-ролик',
  'resistance band': 'Эспандер',
  'bosu ball': 'Платформа BOSU',
  'weighted': 'С отягощением',
  'tire': 'Покрышка',
  
  // Общие слова для перевода названий
  'push': 'жим',
  'pull': 'тяга',
  'press': 'жим',
  'curl': 'сгибание',
  'raise': 'подъем',
  'fly': 'разведение',
  'row': 'тяга',
  'squat': 'приседание',
  'lunge': 'выпад',
  'deadlift': 'становая тяга',
  'bench': 'лежа',
  'incline': 'наклонный',
  'decline': 'обратный наклон',
  'flat': 'горизонтальный',
  'standing': 'стоя',
  'seated': 'сидя',
  'lying': 'лежа',
  'kneeling': 'на коленях',
};

// Функция для выполнения HTTP запросов
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Функция для загрузки файла (GIF)
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    const protocol = url.startsWith('https') ? https : require('http');
    
    protocol.get(url, (response) => {
      // Следовать редиректам
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Функция для перевода текста (упрощенная версия)
function translateText(text) {
  if (!text) return text;
  
  let translated = text.toLowerCase();
  
  // Заменяем известные слова
  Object.keys(TRANSLATIONS).forEach(key => {
    const regex = new RegExp(key, 'gi');
    translated = translated.replace(regex, TRANSLATIONS[key]);
  });
  
  // Делаем первую букву заглавной
  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

// Функция для перевода массива
function translateArray(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(item => {
    const key = item.toLowerCase();
    return TRANSLATIONS[key] || item;
  });
}

// Основная функция
async function fetchExercises() {
  console.log('🏋️ Начинаем загрузку упражнений из ExerciseDB API...\n');
  
  try {
    // Примечание: Для использования ExerciseDB API нужен API ключ от RapidAPI
    // Можно использовать их открытый GitHub репозиторий или mock данные
    
    console.log('⚠️ ВНИМАНИЕ: Для работы с ExerciseDB API v1 через RapidAPI нужен API ключ.');
    console.log('📦 Вместо этого используем открытые данные из их GitHub репозитория.\n');
    
    // URL к открытым данным ExerciseDB на GitHub
    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
    
    console.log('📥 Загружаем данные с GitHub...');
    
    // Загружаем данные
    const exercises = await makeRequest(GITHUB_RAW_URL);
    
    if (!Array.isArray(exercises)) {
      throw new Error('Не удалось получить массив упражнений');
    }
    
    console.log(`✅ Загружено ${exercises.length} упражнений\n`);
    
    console.log('🔄 Начинаем перевод и обработку...\n');
    
    // Обрабатываем упражнения
    const processedExercises = exercises.map((exercise, index) => {
      if ((index + 1) % 100 === 0) {
        console.log(`   Обработано ${index + 1}/${exercises.length} упражнений...`);
      }
      
      return {
        id: exercise.id || `exercise-${index}`,
        name: translateText(exercise.name),
        originalName: exercise.name,
        muscleGroup: translateArray(exercise.primaryMuscles || exercise.target || []).join(', '),
        secondaryMuscles: translateArray(exercise.secondaryMuscles || []),
        equipment: translateArray(exercise.equipment ? [exercise.equipment] : []).join(', ') || 'Без оборудования',
        bodyParts: translateArray(exercise.bodyPart ? [exercise.bodyPart] : []),
        description: `Упражнение для ${translateArray(exercise.primaryMuscles || []).join(', ')}`,
        instructions: exercise.instructions || [],
        gifUrl: exercise.images?.[0] || '',
        difficulty: exercise.level || 'intermediate',
        category: exercise.category || 'strength',
        force: exercise.force || null,
        mechanic: exercise.mechanic || null,
      };
    });
    
    console.log(`\n✅ Обработано ${processedExercises.length} упражнений\n`);
    
    // Создаем директории если их нет
    const dataDir = path.join(__dirname, '..', 'data');
    const gifsDir = path.join(__dirname, '..', 'public', 'exercises', 'gifs');
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(gifsDir)) {
      fs.mkdirSync(gifsDir, { recursive: true });
      console.log(`📁 Создана директория: ${gifsDir}\n`);
    }
    
    // Загружаем GIF файлы
    console.log('🎬 Начинаем загрузку GIF анимаций...\n');
    
    let downloadedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < processedExercises.length; i++) {
      const exercise = processedExercises[i];
      
      if ((i + 1) % 50 === 0) {
        console.log(`   Загружено ${downloadedCount} GIF файлов (${i + 1}/${processedExercises.length})...`);
      }
      
      if (!exercise.gifUrl) {
        skippedCount++;
        continue;
      }
      
      try {
        // Получаем имя файла из URL или создаем на основе ID
        const urlParts = exercise.gifUrl.split('/');
        const originalFilename = urlParts[urlParts.length - 1];
        const extension = originalFilename.includes('.gif') ? '.gif' : '.gif';
        const filename = `${exercise.id}${extension}`;
        const filepath = path.join(gifsDir, filename);
        
        // Проверяем, существует ли файл
        if (fs.existsSync(filepath)) {
          // Обновляем путь к локальному файлу
          exercise.gifUrl = `/exercises/gifs/${filename}`;
          exercise.gifUrlOriginal = exercise.gifUrl;
          skippedCount++;
          continue;
        }
        
        // Загружаем файл
        await downloadFile(exercise.gifUrl, filepath);
        
        // Сохраняем оригинальный URL и обновляем на локальный
        exercise.gifUrlOriginal = exercise.gifUrl;
        exercise.gifUrl = `/exercises/gifs/${filename}`;
        
        downloadedCount++;
        
        // Небольшая задержка чтобы не перегрузить сервер
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`   ❌ Ошибка загрузки GIF для ${exercise.name}: ${error.message}`);
        errorCount++;
        // Оставляем оригинальный URL если загрузка не удалась
      }
    }
    
    console.log(`\n📊 Результат загрузки GIF:`);
    console.log(`   ✅ Загружено: ${downloadedCount}`);
    console.log(`   ⏭️  Пропущено (уже существуют): ${skippedCount}`);
    console.log(`   ❌ Ошибок: ${errorCount}\n`);
    
    // Сохраняем в файл
    const outputPath = path.join(dataDir, 'exercises-full.json');
    fs.writeFileSync(outputPath, JSON.stringify(processedExercises, null, 2), 'utf-8');
    
    console.log(`💾 Упражнения сохранены в: ${outputPath}\n`);
    
    // Создаем упрощенную версию для быстрой загрузки
    const simplifiedExercises = processedExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      gifUrl: ex.gifUrl,
    }));
    
    const simplifiedPath = path.join(dataDir, 'exercises-simplified.json');
    fs.writeFileSync(simplifiedPath, JSON.stringify(simplifiedExercises, null, 2), 'utf-8');
    
    console.log(`💾 Упрощенная версия сохранена в: ${simplifiedPath}\n`);
    
    // Статистика
    console.log('📊 Статистика:');
    
    const muscleGroups = {};
    const equipmentTypes = {};
    
    processedExercises.forEach(ex => {
      // Подсчет по группам мышц
      const muscle = ex.muscleGroup;
      muscleGroups[muscle] = (muscleGroups[muscle] || 0) + 1;
      
      // Подсчет по оборудованию
      const equip = ex.equipment;
      equipmentTypes[equip] = (equipmentTypes[equip] || 0) + 1;
    });
    
    console.log('\nГруппы мышц:');
    Object.entries(muscleGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([muscle, count]) => {
        console.log(`  ${muscle}: ${count}`);
      });
    
    console.log('\nОборудование:');
    Object.entries(equipmentTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([equip, count]) => {
        console.log(`  ${equip}: ${count}`);
      });
    
    console.log('\n✅ Готово! Теперь можно использовать новую базу упражнений.\n');
    
    console.log('📝 Чтобы использовать новую базу, обновите файл lib/exercises-data.ts\n');
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке упражнений:', error.message);
    process.exit(1);
  }
}

// Альтернативная функция для использования ExerciseDB API через RapidAPI
async function fetchFromRapidAPI(apiKey) {
  console.log('🔑 Используем RapidAPI ExerciseDB...\n');
  
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
    }
  };
  
  try {
    // Получаем список всех упражнений
    console.log('📥 Загружаем упражнения...');
    const exercises = await makeRequest(`${BASE_URL}/exercises?limit=1500`, options);
    
    console.log(`✅ Загружено ${exercises.length} упражнений\n`);
    
    // Обрабатываем и переводим
    const processedExercises = exercises.map((exercise) => ({
      id: exercise.id,
      name: translateText(exercise.name),
      originalName: exercise.name,
      muscleGroup: translateArray([exercise.target]).join(', '),
      secondaryMuscles: translateArray(exercise.secondaryMuscles || []),
      equipment: translateArray([exercise.equipment]).join(', '),
      bodyParts: translateArray([exercise.bodyPart]),
      description: `Упражнение для ${translateArray([exercise.target]).join(', ')}`,
      instructions: exercise.instructions || [],
      gifUrl: exercise.gifUrl || '',
      difficulty: 'intermediate',
    }));
    
    // Сохраняем
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const outputPath = path.join(dataDir, 'exercises-rapidapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(processedExercises, null, 2), 'utf-8');
    
    console.log(`💾 Упражнения сохранены в: ${outputPath}\n`);
    console.log('✅ Готово!\n');
    
  } catch (error) {
    console.error('❌ Ошибка при работе с RapidAPI:', error.message);
    throw error;
  }
}

// Запуск
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--rapidapi') || args.includes('-r')) {
    // Использовать RapidAPI
    const apiKeyIndex = args.findIndex(arg => arg === '--api-key' || arg === '-k');
    const apiKey = apiKeyIndex >= 0 ? args[apiKeyIndex + 1] : process.env.RAPIDAPI_KEY;
    
    if (!apiKey) {
      console.error('❌ Ошибка: Нужен API ключ от RapidAPI');
      console.log('Использование: node scripts/fetch-exercisedb.js --rapidapi --api-key YOUR_KEY');
      console.log('Или установите переменную окружения: RAPIDAPI_KEY=YOUR_KEY');
      process.exit(1);
    }
    
    fetchFromRapidAPI(apiKey);
  } else {
    // Использовать бесплатный источник
    fetchExercises();
  }
}

module.exports = { fetchExercises, fetchFromRapidAPI, translateText };

