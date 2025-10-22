#!/usr/bin/env node

/**
 * 🤖 Автоматический подбор GIF для упражнений
 * 
 * Читает custom-exercises-ru.json и автоматически подбирает GIF из ExerciseDB
 * 
 * Использование:
 *   npm run exercises:auto-match-gifs
 */

const fs = require('fs');
const path = require('path');

const EXERCISES_FILE = path.join(__dirname, '../data/custom-exercises-ru.json');
const DB_FILE = path.join(__dirname, '../data/exercisedb-gifs.json');
const OUTPUT_FILE = path.join(__dirname, '../data/custom-exercises-ru-with-gifs.json');

if (!fs.existsSync(DB_FILE)) {
  console.error('❌ База данных ExerciseDB не найдена!');
  console.log('\n💡 Сначала создайте базу данных:');
  console.log('   npm run exercises:fetch-gifs');
  process.exit(1);
}

if (!fs.existsSync(EXERCISES_FILE)) {
  console.error('❌ Файл упражнений не найден:', EXERCISES_FILE);
  process.exit(1);
}

try {
  const exercises = JSON.parse(fs.readFileSync(EXERCISES_FILE, 'utf-8'));
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

  console.log('🤖 Автоматический подбор GIF...\n');
  console.log(`📊 Всего упражнений: ${exercises.length}`);
  console.log(`📚 База данных: ${db.exercises.length} упражнений\n`);

  let matched = 0;
  let skipped = 0;
  let notFound = 0;

  const updatedExercises = exercises.map(ex => {
    // Если уже есть GIF, пропускаем
    if (ex.gifUrl && ex.gifUrl.trim() !== '') {
      skipped++;
      return ex;
    }

    // Ищем совпадение по английскому названию
    const nameEn = (ex.nameEn || ex.name).toLowerCase().trim();
    
    // Точное совпадение
    let match = db.exercises.find(dbEx => 
      dbEx.name.toLowerCase() === nameEn
    );

    // Частичное совпадение
    if (!match) {
      match = db.exercises.find(dbEx => 
        dbEx.name.toLowerCase().includes(nameEn) ||
        nameEn.includes(dbEx.name.toLowerCase())
      );
    }

    if (match) {
      matched++;
      console.log(`✅ ${ex.name}`);
      console.log(`   → ${match.name}`);
      console.log(`   → ${match.gifUrl}\n`);
      
      return {
        ...ex,
        gifUrl: match.gifUrl
      };
    } else {
      notFound++;
      console.log(`❌ ${ex.name} (${ex.nameEn})`);
      console.log(`   → Не найдено\n`);
      return ex;
    }
  });

  // Сохраняем результат
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updatedExercises, null, 2), 'utf-8');

  console.log('\n════════════════════════════════════════');
  console.log('📊 СТАТИСТИКА:');
  console.log('════════════════════════════════════════');
  console.log(`✅ Найдено GIF:        ${matched} упражнений`);
  console.log(`⏭️  Пропущено (есть):  ${skipped} упражнений`);
  console.log(`❌ Не найдено:         ${notFound} упражнений`);
  console.log(`📝 Всего:              ${exercises.length} упражнений`);
  console.log('════════════════════════════════════════\n');

  console.log(`💾 Результат сохранен: ${OUTPUT_FILE}`);
  
  if (notFound > 0) {
    console.log('\n💡 Для упражнений без GIF попробуйте:');
    console.log('   1. npm run exercises:search-gif "название"');
    console.log('   2. Подберите вручную похожее упражнение');
    console.log('   3. Загрузите свой GIF в /public/exercises/gifs/');
  }

  console.log('\n✨ Чтобы применить изменения, замените файл:');
  console.log(`   cp ${OUTPUT_FILE} ${EXERCISES_FILE}`);

} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
}

