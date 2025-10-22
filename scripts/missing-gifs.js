#!/usr/bin/env node

/**
 * 📋 Список упражнений без GIF
 * 
 * Использование:
 *   npm run exercises:missing-gifs
 */

const fs = require('fs');
const path = require('path');

const EXERCISES_FILE = path.join(__dirname, '../data/custom-exercises-ru.json');

if (!fs.existsSync(EXERCISES_FILE)) {
  console.error('❌ Файл упражнений не найден:', EXERCISES_FILE);
  process.exit(1);
}

try {
  const exercises = JSON.parse(fs.readFileSync(EXERCISES_FILE, 'utf-8'));
  const withoutGif = exercises.filter(ex => !ex.gifUrl || ex.gifUrl.trim() === '');

  if (withoutGif.length === 0) {
    console.log('🎉 Отлично! Все упражнения имеют GIF!');
    process.exit(0);
  }

  console.log('\n════════════════════════════════════════');
  console.log(`❌ УПРАЖНЕНИЯ БЕЗ GIF (${withoutGif.length})`);
  console.log('════════════════════════════════════════\n');

  // Группируем по группам мышц
  const byMuscleGroup = {};
  withoutGif.forEach(ex => {
    const group = ex.muscleGroup || 'other';
    if (!byMuscleGroup[group]) {
      byMuscleGroup[group] = [];
    }
    byMuscleGroup[group].push(ex);
  });

  Object.entries(byMuscleGroup).forEach(([group, exs]) => {
    console.log(`\n🏋️  ${group.toUpperCase()} (${exs.length}):`);
    console.log('─'.repeat(50));
    exs.forEach(ex => {
      console.log(`• ${ex.name}`);
      if (ex.nameEn) {
        console.log(`  EN: ${ex.nameEn}`);
      }
    });
  });

  console.log('\n════════════════════════════════════════');
  console.log('💡 СЛЕДУЮЩИЕ ШАГИ:');
  console.log('════════════════════════════════════════');
  console.log('1. Автоматический подбор:');
  console.log('   npm run exercises:auto-match-gifs');
  console.log('');
  console.log('2. Поиск конкретного упражнения:');
  console.log('   npm run exercises:search-gif "bench press"');
  console.log('');
  console.log('3. Ручное добавление:');
  console.log('   - Найдите GIF на https://exercisedb.io/');
  console.log('   - Добавьте gifUrl в data/custom-exercises-ru.json');
  console.log('');

} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
}

