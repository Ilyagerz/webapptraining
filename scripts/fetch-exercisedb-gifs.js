#!/usr/bin/env node

/**
 * 🎬 Скрипт для получения всех упражнений и GIF из ExerciseDB API
 * 
 * Создает файл data/exercisedb-gifs.json с полной базой данных упражнений
 * 
 * Использование:
 *   npm run exercises:fetch-gifs
 * 
 * Требования:
 *   - Аккаунт на RapidAPI
 *   - API ключ в .env.local (RAPIDAPI_KEY)
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const OUTPUT_FILE = path.join(__dirname, '../data/exercisedb-gifs.json');

if (!RAPIDAPI_KEY) {
  console.error('❌ Ошибка: RAPIDAPI_KEY не найден в .env.local');
  console.log('\n📝 Инструкция:');
  console.log('1. Зарегистрируйтесь на https://rapidapi.com/');
  console.log('2. Подпишитесь на ExerciseDB API (Free план)');
  console.log('3. Создайте файл .env.local в корне проекта');
  console.log('4. Добавьте строку: RAPIDAPI_KEY=ваш_ключ_здесь');
  process.exit(1);
}

async function fetchAllExercises() {
  console.log('🔍 Получаем список всех упражнений из ExerciseDB...\n');

  try {
    const response = await fetch('https://exercisedb.p.rapidapi.com/exercises?limit=0&offset=0', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      if (response.status === 451) {
        console.error('❌ HTTP 451: Доступ заблокирован (санкции)');
        console.log('\n💡 Решение: Используйте VPN или готовую базу данных');
        process.exit(1);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const exercises = await response.json();
    
    console.log(`✅ Получено ${exercises.length} упражнений`);
    console.log('📝 Обработка данных...\n');

    // Преобразуем в удобный формат
    const formattedExercises = exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      nameRu: translateExerciseName(ex.name),
      gifUrl: ex.gifUrl,
      bodyPart: ex.bodyPart,
      target: ex.target,
      equipment: ex.equipment,
      secondaryMuscles: ex.secondaryMuscles || [],
      instructions: ex.instructions || []
    }));

    // Группируем по группам мышц для удобства
    const grouped = {
      totalExercises: formattedExercises.length,
      lastUpdated: new Date().toISOString(),
      byBodyPart: {},
      byEquipment: {},
      exercises: formattedExercises
    };

    // Группировка по частям тела
    formattedExercises.forEach(ex => {
      if (!grouped.byBodyPart[ex.bodyPart]) {
        grouped.byBodyPart[ex.bodyPart] = [];
      }
      grouped.byBodyPart[ex.bodyPart].push(ex.id);
    });

    // Группировка по оборудованию
    formattedExercises.forEach(ex => {
      if (!grouped.byEquipment[ex.equipment]) {
        grouped.byEquipment[ex.equipment] = [];
      }
      grouped.byEquipment[ex.equipment].push(ex.id);
    });

    // Сохраняем в файл
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(grouped, null, 2), 'utf-8');

    console.log(`✅ База данных сохранена: ${OUTPUT_FILE}`);
    console.log(`📊 Всего упражнений: ${formattedExercises.length}`);
    console.log(`🏋️  Группы мышц: ${Object.keys(grouped.byBodyPart).length}`);
    console.log(`🔧 Виды оборудования: ${Object.keys(grouped.byEquipment).length}`);
    
    // Статистика по группам
    console.log('\n📈 Распределение по группам мышц:');
    Object.entries(grouped.byBodyPart)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .forEach(([bodyPart, ids]) => {
        console.log(`   ${bodyPart.padEnd(20)} : ${ids.length} упражнений`);
      });

    console.log('\n✨ Готово! Теперь вы можете использовать:');
    console.log('   npm run exercises:search-gif "название упражнения"');
    console.log('   npm run exercises:auto-match-gifs');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Простая транслитерация названий (можно улучшить)
function translateExerciseName(name) {
  const translations = {
    'bench press': 'жим лежа',
    'squat': 'приседания',
    'deadlift': 'становая тяга',
    'pull up': 'подтягивания',
    'push up': 'отжимания',
    'barbell': 'штанга',
    'dumbbell': 'гантели',
    'cable': 'блок',
    'machine': 'тренажер',
    'bodyweight': 'собственный вес',
    // Добавьте больше по необходимости
  };

  let translated = name.toLowerCase();
  for (const [eng, rus] of Object.entries(translations)) {
    translated = translated.replace(new RegExp(eng, 'gi'), rus);
  }
  
  return translated;
}

// Запускаем
fetchAllExercises();

