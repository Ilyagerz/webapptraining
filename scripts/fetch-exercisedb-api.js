const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'www.exercisedb.dev';
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'exercises-full.json');
const LIMIT = 25; // Максимум на запрос по API

// Маппинг мышечных групп
const muscleGroupMap = {
  'pectoralis': 'chest',
  'chest': 'chest',
  'lats': 'back',
  'spine': 'back',
  'traps': 'back',
  'upper back': 'back',
  'lower back': 'back',
  'delts': 'shoulders',
  'shoulders': 'shoulders',
  'quads': 'legs',
  'glutes': 'legs',
  'hamstrings': 'legs',
  'calves': 'legs',
  'adductors': 'legs',
  'abductors': 'legs',
  'biceps': 'arms',
  'triceps': 'arms',
  'forearms': 'arms',
  'abs': 'abs',
  'obliques': 'abs',
  'cardiovascular': 'cardio',
};

// Маппинг оборудования
const equipmentMap = {
  'barbell': 'barbell',
  'dumbbell': 'dumbbell',
  'machine': 'machine',
  'cable': 'cable',
  'body weight': 'bodyweight',
  'bodyweight': 'bodyweight',
  'kettlebell': 'kettlebell',
  'band': 'band',
  'resistance band': 'band',
  'ez barbell': 'barbell',
  'smith machine': 'machine',
};

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE_URL,
      path: endpoint,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    console.log(`Запрос: https://${API_BASE_URL}${endpoint}`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (error) {
            reject(new Error(`Ошибка парсинга JSON: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Таймаут запроса'));
    });

    req.end();
  });
}

function getMappedMuscleGroup(muscles) {
  if (!muscles || muscles.length === 0) return 'chest';
  
  const firstMuscle = muscles[0].toLowerCase();
  for (const [key, value] of Object.entries(muscleGroupMap)) {
    if (firstMuscle.includes(key)) {
      return value;
    }
  }
  return 'chest';
}

function getMappedEquipment(equipments) {
  if (!equipments || equipments.length === 0) return ['bodyweight'];
  
  return equipments.map(eq => {
    const eqLower = eq.toLowerCase();
    for (const [key, value] of Object.entries(equipmentMap)) {
      if (eqLower.includes(key)) {
        return value;
      }
    }
    return 'bodyweight';
  });
}

async function fetchAllExercises() {
  console.log('🏋️ Загрузка упражнений с ExerciseDB API v1...\n');
  
  let allExercises = [];
  let offset = 0;
  let hasMore = true;

  try {
    while (hasMore) {
      const endpoint = `/api/v1/exercises?offset=${offset}&limit=${LIMIT}`;
      const response = await makeRequest(endpoint);

      if (response.success && response.data) {
        const exercises = response.data;
        allExercises = allExercises.concat(exercises);
        
        console.log(`✓ Загружено ${exercises.length} упражнений (всего: ${allExercises.length})`);
        
        // Проверяем, есть ли еще данные
        if (exercises.length < LIMIT) {
          hasMore = false;
        } else {
          offset += LIMIT;
          // Задержка между запросами для избежания rate limit
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else {
        console.log('⚠️ Нет больше данных');
        hasMore = false;
      }
    }

    console.log(`\n✓ Всего загружено: ${allExercises.length} упражнений`);
    return allExercises;

  } catch (error) {
    console.error('❌ Ошибка при загрузке:', error.message);
    throw error;
  }
}

function transformExercise(exercise) {
  return {
    id: exercise.exerciseId || exercise.id,
    name: exercise.name,
    nameEn: exercise.name,
    category: 'strength',
    muscleGroup: getMappedMuscleGroup(exercise.targetMuscles),
    equipment: getMappedEquipment(exercise.equipments),
    gifUrl: exercise.gifUrl || '',
    instructions: exercise.instructions || [],
    targetMuscles: exercise.targetMuscles || [],
    secondaryMuscles: exercise.secondaryMuscles || [],
    bodyParts: exercise.bodyParts || [],
  };
}

async function main() {
  try {
    // Создаем папку data если её нет
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Загружаем упражнения
    const exercises = await fetchAllExercises();
    
    // Преобразуем в нужный формат
    console.log('\n📦 Преобразование данных...');
    const transformedExercises = exercises.map(transformExercise);
    
    // Сохраняем в файл
    console.log(`💾 Сохранение в ${OUTPUT_FILE}...`);
    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(transformedExercises, null, 2),
      'utf-8'
    );
    
    console.log(`\n✅ Готово! Сохранено ${transformedExercises.length} упражнений`);
    console.log(`📁 Файл: ${OUTPUT_FILE}`);
    console.log('\n📝 Следующий шаг: npm run exercises:translate');
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();

