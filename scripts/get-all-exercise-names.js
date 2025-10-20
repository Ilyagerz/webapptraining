const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('\n════════════════════════════════════════════════════════');
console.log('📋 ПОЛУЧЕНИЕ ВСЕХ НАЗВАНИЙ УПРАЖНЕНИЙ ИЗ EXERCISEDB API');
console.log('════════════════════════════════════════════════════════\n');

const API_KEY = 'c7c62db8admsh41a2ffb71f43e71p190a4bjsn79f4fe1e3065';
const API_HOST = 'exercisedb.p.rapidapi.com';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      path: path,
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function getAllExercises() {
  const allExercises = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    try {
      console.log(`📥 Загрузка упражнений ${offset}-${offset + limit}...`);
      
      const exercises = await makeRequest(`/exercises?limit=${limit}&offset=${offset}`);
      
      if (exercises && exercises.length > 0) {
        allExercises.push(...exercises);
        offset += limit;
        
        if (exercises.length < limit) {
          hasMore = false;
        }
        
        // Задержка 2 секунды между запросами
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`❌ Ошибка: ${error.message}`);
      hasMore = false;
    }
  }

  return allExercises;
}

async function main() {
  try {
    const exercises = await getAllExercises();
    
    console.log(`\n✅ Всего загружено: ${exercises.length} упражнений`);
    
    // Извлекаем названия и базовую информацию
    const exerciseList = exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      bodyPart: ex.bodyPart,
      equipment: ex.equipment,
      target: ex.target,
    }));
    
    // Сохраняем полный список
    const outputPath = path.join(__dirname, '..', 'data', 'all-exercises-list.json');
    fs.writeFileSync(outputPath, JSON.stringify(exerciseList, null, 2), 'utf8');
    
    // Создаем текстовый файл с названиями для нейросети
    const namesPath = path.join(__dirname, '..', 'data', 'exercise-names.txt');
    const namesText = exerciseList.map((ex, i) => `${i + 1}. ${ex.name} (${ex.bodyPart}, ${ex.target}, ${ex.equipment})`).join('\n');
    fs.writeFileSync(namesPath, namesText, 'utf8');
    
    // Группировка по группам мышц
    const byBodyPart = {};
    exerciseList.forEach(ex => {
      if (!byBodyPart[ex.bodyPart]) {
        byBodyPart[ex.bodyPart] = [];
      }
      byBodyPart[ex.bodyPart].push(ex.name);
    });
    
    console.log('\n📊 Распределение по группам мышц:');
    Object.entries(byBodyPart).sort((a, b) => b[1].length - a[1].length).forEach(([part, exs]) => {
      console.log(`  ${part}: ${exs.length}`);
    });
    
    console.log('\n════════════════════════════════════════════════════════');
    console.log(`✅ Сохранено в:`);
    console.log(`   ${outputPath}`);
    console.log(`   ${namesPath}`);
    console.log('\n💡 Скопируй содержимое exercise-names.txt в ChatGPT/Claude');
    console.log('   и попроси выбрать 50 самых популярных упражнений');
    console.log('════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

main();

