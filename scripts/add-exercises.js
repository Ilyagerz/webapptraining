const fs = require('fs');
const path = require('path');

console.log('\n════════════════════════════════════════════════════════');
console.log('➕ ДОБАВЛЕНИЕ НОВЫХ УПРАЖНЕНИЙ');
console.log('════════════════════════════════════════════════════════\n');

// Читаем текущую базу
const currentPath = path.join(__dirname, '..', 'data', 'custom-exercises-ru.json');
const currentExercises = JSON.parse(fs.readFileSync(currentPath, 'utf8'));

// Читаем новые упражнения
const newPath = path.join(__dirname, '..', 'data', 'additional-exercises.json');
const newExercises = JSON.parse(fs.readFileSync(newPath, 'utf8'));

console.log(`📊 Текущая база: ${currentExercises.length} упражнений`);
console.log(`📥 Новые упражнения: ${newExercises.length}`);

// Проверяем на дубликаты по английскому названию
const existingNamesEn = new Set(currentExercises.map(ex => ex.nameEn?.toLowerCase()));
const existingNamesRu = new Set(currentExercises.map(ex => ex.name?.toLowerCase()));

const toAdd = [];
const duplicates = [];

newExercises.forEach(ex => {
  const nameEnLower = ex.nameEn?.toLowerCase();
  const nameRuLower = ex.name?.toLowerCase();
  
  if (existingNamesEn.has(nameEnLower) || existingNamesRu.has(nameRuLower)) {
    duplicates.push(ex.name);
  } else {
    toAdd.push(ex);
  }
});

if (duplicates.length > 0) {
  console.log(`\n⚠️  Найдено дубликатов: ${duplicates.length}`);
  duplicates.forEach(name => {
    console.log(`   - ${name}`);
  });
}

if (toAdd.length === 0) {
  console.log('\n✅ Все упражнения уже есть в базе!');
  console.log('════════════════════════════════════════════════════════\n');
  process.exit(0);
}

console.log(`\n➕ Будет добавлено: ${toAdd.length} упражнений\n`);

toAdd.forEach((ex, i) => {
  console.log(`${i + 1}. ${ex.name} (${ex.muscleGroup})`);
});

// Объединяем
const merged = [...currentExercises, ...toAdd];

// Сортируем по группам мышц
merged.sort((a, b) => {
  if (a.muscleGroup === b.muscleGroup) {
    return a.name.localeCompare(b.name, 'ru');
  }
  return a.muscleGroup.localeCompare(b.muscleGroup);
});

// Сохраняем
fs.writeFileSync(currentPath, JSON.stringify(merged, null, 2), 'utf8');

console.log('\n════════════════════════════════════════════════════════');
console.log(`✅ ГОТОВО! Теперь в базе: ${merged.length} упражнений`);
console.log(`   Было: ${currentExercises.length}`);
console.log(`   Добавлено: ${toAdd.length}`);
console.log('════════════════════════════════════════════════════════\n');

// Статистика по группам
const stats = {};
merged.forEach(ex => {
  stats[ex.muscleGroup] = (stats[ex.muscleGroup] || 0) + 1;
});

console.log('📊 Распределение по группам:');
Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([group, count]) => {
  console.log(`  ${group}: ${count}`);
});
console.log();

