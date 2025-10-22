#!/usr/bin/env node

/**
 * 🔍 Скрипт для поиска GIF по названию упражнения
 * 
 * Использование:
 *   npm run exercises:search-gif "bench press"
 *   npm run exercises:search-gif "становая тяга"
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../data/exercisedb-gifs.json');
const searchQuery = process.argv[2];

if (!searchQuery) {
  console.error('❌ Ошибка: Укажите название упражнения');
  console.log('\n📝 Использование:');
  console.log('   npm run exercises:search-gif "bench press"');
  console.log('   npm run exercises:search-gif "становая тяга"');
  process.exit(1);
}

if (!fs.existsSync(DB_FILE)) {
  console.error('❌ База данных не найдена!');
  console.log('\n💡 Сначала создайте базу данных:');
  console.log('   npm run exercises:fetch-gifs');
  process.exit(1);
}

try {
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  const query = searchQuery.toLowerCase();

  console.log(`🔍 Поиск: "${searchQuery}"\n`);

  // Ищем совпадения
  const matches = data.exercises.filter(ex => 
    ex.name.toLowerCase().includes(query) ||
    ex.nameRu.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    console.log('❌ Упражнения не найдены');
    console.log('\n💡 Попробуйте:');
    console.log('   - Использовать английское название');
    console.log('   - Упростить запрос (например, "press" вместо "bench press")');
    console.log('   - Проверить правильность написания');
    process.exit(0);
  }

  console.log(`✅ Найдено упражнений: ${matches.length}\n`);

  matches.slice(0, 20).forEach((ex, index) => {
    console.log(`${index + 1}. ${ex.name}`);
    console.log(`   RU: ${ex.nameRu}`);
    console.log(`   ID: ${ex.id}`);
    console.log(`   GIF: ${ex.gifUrl}`);
    console.log(`   Группа: ${ex.bodyPart} → ${ex.target}`);
    console.log(`   Оборудование: ${ex.equipment}`);
    console.log('');
  });

  if (matches.length > 20) {
    console.log(`... и еще ${matches.length - 20} упражнений\n`);
  }

  console.log('💡 Скопируйте gifUrl и добавьте в ваше упражнение!');

} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
}

