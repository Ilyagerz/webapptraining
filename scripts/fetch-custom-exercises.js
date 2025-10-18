const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'www.exercisedb.dev';
const OUTPUT_JSON = path.join(__dirname, '..', 'data', 'custom-exercises.json');
const GIFS_DIR = path.join(__dirname, '..', 'public', 'exercises', 'gifs');

// Маппинг для перевода
const muscleGroupMap = {
  'pectoralis': 'Грудь',
  'chest': 'Грудь',
  'lats': 'Спина',
  'spine': 'Спина',
  'traps': 'Спина',
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
  'cardiovascular': 'Кардио',
};

const equipmentMap = {
  'barbell': 'Штанга',
  'dumbbell': 'Гантели',
  'machine': 'Тренажер',
  'cable': 'Кабель',
  'body weight': 'Собственный вес',
  'bodyweight': 'Собственный вес',
  'kettlebell': 'Гиря',
  'band': 'Резинка',
  'resistance band': 'Резинка',
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Следуем за редиректом
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
      fs.unlink(dest, () => {}); // Удаляем неполный файл
      reject(err);
    });
  });
}

async function fetchExercise(exerciseId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE_URL,
      path: `/api/v1/exercises/${exerciseId}`,
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

function translateMuscleGroup(muscles) {
  if (!muscles || muscles.length === 0) return 'Грудь';
  const muscle = muscles[0].toLowerCase();
  for (const [key, value] of Object.entries(muscleGroupMap)) {
    if (muscle.includes(key)) return value;
  }
  return 'Другое';
}

function translateEquipment(equipment) {
  if (!equipment) return 'Собственный вес';
  const eq = equipment.toLowerCase();
  for (const [key, value] of Object.entries(equipmentMap)) {
    if (eq.includes(key)) return value;
  }
  return 'Другое';
}

async function main() {
  try {
    // Читаем список ID из аргумента или используем дефолтный
    const listFile = process.argv[2] || path.join(__dirname, 'exercise-ids.txt');
    
    let exerciseIds = [];
    
    if (fs.existsSync(listFile)) {
      const content = fs.readFileSync(listFile, 'utf-8');
      exerciseIds = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
      console.log(`📋 Загружен список из ${exerciseIds.length} упражнений из ${listFile}`);
    } else {
      console.log('⚠️  Файл со списком не найден. Используйте:');
      console.log(`   node scripts/fetch-custom-exercises.js <путь-к-файлу.txt>`);
      console.log('\nФормат файла (по одному ID на строку):');
      console.log('VPPtusI');
      console.log('K6NnTv0');
      console.log('# комментарии начинаются с #');
      process.exit(1);
    }

    // Создаем папки
    if (!fs.existsSync(GIFS_DIR)) {
      fs.mkdirSync(GIFS_DIR, { recursive: true });
    }

    console.log('\n🏋️  Начинаем загрузку упражнений...\n');

    const results = [];
    let success = 0;
    let failed = 0;

    for (let i = 0; i < exerciseIds.length; i++) {
      const id = exerciseIds[i];
      process.stdout.write(`[${i + 1}/${exerciseIds.length}] ${id}...`);

      try {
        // Загружаем данные
        const response = await fetchExercise(id);
        
        if (!response.success || !response.data) {
          console.log(' ❌ Не найдено');
          failed++;
          continue;
        }

        const exercise = response.data;
        
        // Скачиваем GIF
        let gifPath = '';
        if (exercise.gifUrl) {
          const gifFilename = `${exercise.exerciseId}.gif`;
          const gifFullPath = path.join(GIFS_DIR, gifFilename);
          
          if (!fs.existsSync(gifFullPath)) {
            await downloadFile(exercise.gifUrl, gifFullPath);
          }
          
          gifPath = `/exercises/gifs/${gifFilename}`;
        }

        // Форматируем результат
        const formatted = {
          id: exercise.exerciseId,
          name: exercise.name,
          nameEn: exercise.name,
          category: 'strength',
          muscleGroup: translateMuscleGroup(exercise.targetMuscles),
          equipment: Array.isArray(exercise.equipments) 
            ? exercise.equipments.map(translateEquipment)
            : [translateEquipment(exercise.equipments?.[0])],
          instructions: exercise.instructions || [],
          gifUrl: gifPath,
          targetMuscles: exercise.targetMuscles || [],
          secondaryMuscles: exercise.secondaryMuscles || [],
          bodyParts: exercise.bodyParts || [],
          description: `Упражнение для ${translateMuscleGroup(exercise.targetMuscles)}`,
          isCustom: false,
        };

        results.push(formatted);
        console.log(` ✅ ${exercise.name}`);
        success++;

        // Задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.log(` ❌ ${error.message}`);
        failed++;
      }
    }

    // Сохраняем результат
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2), 'utf-8');

    console.log(`\n✅ Готово!`);
    console.log(`   Успешно: ${success}`);
    console.log(`   Ошибок: ${failed}`);
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

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();

