const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'www.exercisedb.dev';
const GIFS_DIR = path.join(__dirname, '..', 'public', 'exercises', 'gifs');
const OUTPUT_JSON = path.join(__dirname, '..', 'data', 'custom-exercises.json');

// Маппинг для перевода
const muscleGroupRuToEn = {
  'Грудь': 'chest',
  'Спина': 'back',
  'Плечи': 'shoulders',
  'Ноги': 'legs',
  'Руки': 'arms',
  'Кор': 'abs',
  'Кардио': 'cardio',
  'Все тело': 'fullBody',
  'Олимпийские упражнения': 'fullBody',
  'Другое': 'other',
};

const muscleGroupEnToRu = {
  'pectorals': 'Грудь',
  'chest': 'Грудь',
  'lats': 'Спина',
  'upper back': 'Спина',
  'lower back': 'Спина',
  'back': 'Спина',
  'delts': 'Плечи',
  'shoulders': 'Плечи',
  'quads': 'Ноги',
  'glutes': 'Ноги',
  'hamstrings': 'Ноги',
  'calves': 'Ноги',
  'legs': 'Ноги',
  'biceps': 'Руки',
  'triceps': 'Руки',
  'forearms': 'Руки',
  'arms': 'Руки',
  'abs': 'Пресс',
  'obliques': 'Пресс',
  'core': 'Пресс',
  'cardiovascular': 'Кардио',
};

const equipmentEnToRu = {
  'barbell': 'Штанга',
  'dumbbell': 'Гантели',
  'machine': 'Тренажер',
  'cable': 'Кабель',
  'body weight': 'Собственный вес',
  'bodyweight': 'Собственный вес',
  'kettlebell': 'Гиря',
  'band': 'Резинка',
  'resistance band': 'Резинка',
  'smith machine': 'Тренажер',
  'assisted': 'Тренажер',
  'stability ball': 'Фитбол',
  'plate': 'Диск',
  '': 'Собственный вес',
};

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE_URL,
      path: path,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Parse error: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function searchExercise(name) {
  try {
    const query = encodeURIComponent(name);
    const path = `/api/v1/exercises/search?q=${query}&limit=1`;
    const response = await makeRequest(path);
    
    if (response.success && response.data && response.data.length > 0) {
      return response.data[0];
    }
  } catch (error) {
    console.error(`  Ошибка поиска "${name}": ${error.message}`);
  }
  return null;
}

function translateMuscleGroup(muscles) {
  if (!muscles || muscles.length === 0) return 'Грудь';
  const muscle = muscles[0].toLowerCase();
  for (const [key, value] of Object.entries(muscleGroupEnToRu)) {
    if (muscle.includes(key)) return value;
  }
  return 'Другое';
}

function translateEquipment(equipment) {
  if (!equipment) return 'Собственный вес';
  const eq = equipment.toLowerCase();
  for (const [key, value] of Object.entries(equipmentEnToRu)) {
    if (eq.includes(key)) return value;
  }
  return 'Другое';
}

function parseExerciseList(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const exercises = [];
  let currentGroup = 'Другое';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Пропускаем пустые строки
    if (!trimmed) continue;
    
    // Проверяем, является ли строка названием группы
    if (trimmed.endsWith(':')) {
      currentGroup = trimmed.slice(0, -1);
      console.log(`  Группа: ${currentGroup}`);
      continue;
    }
    
    // Пропускаем если это комментарий или слишком короткое
    if (trimmed.startsWith('#') || trimmed.length < 3) continue;
    
    // Это упражнение
    exercises.push({
      name: trimmed,
      group: currentGroup
    });
  }
  
  return exercises;
}

async function main() {
  try {
    const inputFile = process.argv[2] || path.join(__dirname, '..', 'ex.md');
    
    if (!fs.existsSync(inputFile)) {
      console.log('❌ Файл не найден:', inputFile);
      process.exit(1);
    }

    console.log('📋 Парсинг списка упражнений из', inputFile);
    const exercises = parseExerciseList(inputFile);
    console.log(`✅ Найдено ${exercises.length} упражнений\n`);

    // Создаем папку для GIF
    if (!fs.existsSync(GIFS_DIR)) {
      fs.mkdirSync(GIFS_DIR, { recursive: true });
    }

    const results = [];
    let found = 0;
    let notFound = 0;

    for (let i = 0; i < exercises.length; i++) {
      const { name, group } = exercises[i];
      process.stdout.write(`[${i + 1}/${exercises.length}] ${name}...`);

      try {
        // Ищем упражнение через API
        const exercise = await searchExercise(name);
        
        if (!exercise) {
          console.log(' ❌ Не найдено');
          notFound++;
          
          // Задержка даже для не найденных
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        // Скачиваем GIF
        let gifPath = '';
        if (exercise.gifUrl) {
          const gifFilename = `${exercise.exerciseId}.gif`;
          const gifFullPath = path.join(GIFS_DIR, gifFilename);
          
          if (!fs.existsSync(gifFullPath)) {
            try {
              await downloadFile(exercise.gifUrl, gifFullPath);
            } catch (error) {
              console.log(` ⚠️  GIF ошибка: ${error.message}`);
            }
          }
          
          gifPath = `/exercises/gifs/${gifFilename}`;
        }

        // Определяем группу мышц
        let muscleGroupRu = translateMuscleGroup(exercise.targetMuscles);
        
        // Если в русском списке была указана группа, используем её
        if (muscleGroupRuToEn[group]) {
          muscleGroupRu = group;
        }

        // Форматируем результат
        const formatted = {
          id: exercise.exerciseId,
          name: exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1),
          nameEn: exercise.name,
          category: 'strength',
          muscleGroup: muscleGroupRu,
          equipment: Array.isArray(exercise.equipments) 
            ? exercise.equipments.map(translateEquipment)
            : [translateEquipment(exercise.equipments?.[0])],
          instructions: exercise.instructions || [],
          gifUrl: gifPath,
          targetMuscles: exercise.targetMuscles || [],
          secondaryMuscles: exercise.secondaryMuscles || [],
          bodyParts: exercise.bodyParts || [],
          description: `Упражнение для ${muscleGroupRu}`,
          isCustom: false,
        };

        results.push(formatted);
        console.log(` ✅`);
        found++;

        // Задержка между запросами (2 сек для избежания rate limit)
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(` ❌ ${error.message}`);
        notFound++;
      }
    }

    // Сохраняем результат
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2), 'utf-8');

    console.log(`\n\n🎉 Готово!`);
    console.log(`   Найдено: ${found}`);
    console.log(`   Не найдено: ${notFound}`);
    console.log(`   Сохранено: ${OUTPUT_JSON}`);
    console.log(`   GIF файлы: ${GIFS_DIR}`);

    // Статистика
    const groups = {};
    results.forEach(e => {
      groups[e.muscleGroup] = (groups[e.muscleGroup] || 0) + 1;
    });

    console.log('\n📊 По группам мышц:');
    Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .forEach(([group, count]) => {
        console.log(`   ${group}: ${count}`);
      });

    console.log('\n💡 Упражнения сохранены в data/custom-exercises.json');
    console.log('💡 GIF файлы в public/exercises/gifs/');
    console.log('\n🚀 Теперь обновите приложение: npm run build');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();

