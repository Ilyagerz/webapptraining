const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'data', 'custom-exercises-ru.json');

console.log('\n════════════════════════════════════════════════════════');
console.log('🧹 ОЧИСТКА УПРАЖНЕНИЙ ОТ ДУБЛИКАТОВ');
console.log('════════════════════════════════════════════════════════\n');

const exercises = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
console.log(`Всего упражнений: ${exercises.length}`);

// Находим дубликаты по nameEn
const nameEnMap = new Map();
const duplicates = [];

exercises.forEach((ex, index) => {
  const key = ex.nameEn || ex.name;
  if (nameEnMap.has(key)) {
    duplicates.push({ original: nameEnMap.get(key), duplicate: index, name: ex.name });
  } else {
    nameEnMap.set(key, index);
  }
});

console.log(`\n❌ Найдено дубликатов: ${duplicates.length}`);
if (duplicates.length > 0) {
  console.log('\nПримеры дубликатов:');
  duplicates.slice(0, 10).forEach(d => {
    console.log(`  - ${d.name} (индексы: ${d.original}, ${d.duplicate})`);
  });
}

// Удаляем дубликаты, оставляем только уникальные
const uniqueExercises = [];
const seen = new Set();

exercises.forEach(ex => {
  const key = ex.nameEn || ex.name;
  if (!seen.has(key)) {
    seen.add(key);
    uniqueExercises.push(ex);
  }
});

console.log(`\n✅ Уникальных упражнений: ${uniqueExercises.length}`);

// Анализируем распределение по группам мышц
const muscleGroupStats = {};
uniqueExercises.forEach(ex => {
  const mg = ex.muscleGroup || 'unknown';
  muscleGroupStats[mg] = (muscleGroupStats[mg] || 0) + 1;
});

console.log('\n📊 Распределение по группам мышц:');
Object.entries(muscleGroupStats).sort((a, b) => b[1] - a[1]).forEach(([group, count]) => {
  console.log(`  ${group}: ${count}`);
});

// Проверяем проблемные упражнения
console.log('\n🔍 Проверка упражнений на носки в группе "chest":');
const calfInChest = uniqueExercises.filter(ex => 
  ex.muscleGroup === 'chest' && 
  (ex.name.toLowerCase().includes('носки') || ex.nameEn?.toLowerCase().includes('calf'))
);
if (calfInChest.length > 0) {
  console.log(`❌ Найдено ${calfInChest.length} упражнений на носки в группе "chest"`);
  calfInChest.forEach(ex => {
    console.log(`  - ${ex.name} (${ex.nameEn})`);
  });
} else {
  console.log('✅ Упражнений на носки в группе "chest" не найдено');
}

// Сохраняем очищенные данные
const outputPath = inputPath;
fs.writeFileSync(outputPath, JSON.stringify(uniqueExercises, null, 2), 'utf8');

console.log('\n════════════════════════════════════════════════════════');
console.log(`✅ ГОТОВО! Сохранено ${uniqueExercises.length} уникальных упражнений`);
console.log(`📁 Файл: ${outputPath}`);
console.log('════════════════════════════════════════════════════════\n');

