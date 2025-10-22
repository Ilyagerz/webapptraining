#!/usr/bin/env node

/**
 * 📊 Статистика покрытия GIF в упражнениях
 * 
 * Использование:
 *   npm run exercises:gif-stats
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

  const withGif = exercises.filter(ex => ex.gifUrl && ex.gifUrl.trim() !== '');
  const withoutGif = exercises.filter(ex => !ex.gifUrl || ex.gifUrl.trim() === '');

  const percentage = ((withGif.length / exercises.length) * 100).toFixed(1);

  console.log('\n════════════════════════════════════════');
  console.log('📊 СТАТИСТИКА GIF');
  console.log('════════════════════════════════════════');
  console.log(`✅ С GIF:      ${withGif.length} упражнений (${percentage}%)`);
  console.log(`❌ Без GIF:    ${withoutGif.length} упражнений (${(100 - parseFloat(percentage)).toFixed(1)}%)`);
  console.log(`📝 Всего:      ${exercises.length} упражнений`);
  console.log('════════════════════════════════════════\n');

  // Прогресс-бар
  const barLength = 40;
  const filled = Math.round((withGif.length / exercises.length) * barLength);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  console.log(`Прогресс: [${bar}] ${percentage}%\n`);

  if (withoutGif.length > 0) {
    console.log('💡 Чтобы добавить GIF:');
    console.log('   npm run exercises:auto-match-gifs');
    console.log('\n💡 Список упражнений без GIF:');
    console.log('   npm run exercises:missing-gifs');
  } else {
    console.log('🎉 Отлично! Все упражнения имеют GIF!');
  }

} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
}

