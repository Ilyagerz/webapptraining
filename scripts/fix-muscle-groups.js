const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'data', 'custom-exercises-ru.json');

console.log('\n════════════════════════════════════════════════════════');
console.log('🔧 ИСПРАВЛЕНИЕ ГРУПП МЫШЦ');
console.log('════════════════════════════════════════════════════════\n');

const exercises = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
console.log(`Всего упражнений: ${exercises.length}`);

// Правила исправления на основе названий
const rules = [
  // Икры (calves) → legs
  { pattern: /calf|носки/i, correctGroup: 'legs', reason: 'Икры' },
  
  // Грудь (chest)
  { pattern: /bench press|chest|грудь|жим лежа/i, correctGroup: 'chest', reason: 'Грудь' },
  
  // Спина (back)
  { pattern: /pull.*up|row|lat|спина|тяга|подтягивания/i, correctGroup: 'back', reason: 'Спина' },
  
  // Ноги (legs)
  { pattern: /squat|leg|deadlift|ноги|присед|выпад|lunge/i, correctGroup: 'legs', reason: 'Ноги' },
  
  // Плечи (shoulders)
  { pattern: /shoulder|delt|lateral raise|плечи|дельт/i, correctGroup: 'shoulders', reason: 'Плечи' },
  
  // Руки (arms)
  { pattern: /bicep|tricep|curl|бицепс|трицепс|сгибани.*рук|разгибани.*рук/i, correctGroup: 'arms', reason: 'Руки' },
  
  // Пресс (abs)
  { pattern: /crunch|plank|sit.*up|ab|пресс|планка|скручивани/i, correctGroup: 'abs', reason: 'Пресс' },
  
  // Кардио (cardio)
  { pattern: /run|jog|skip|rope|burpee|бег|скакалка|берпи|mountain climber/i, correctGroup: 'cardio', reason: 'Кардио' },
  
  // Все тело (fullBody)
  { pattern: /clean|snatch|thruster|swing|взятие|рывок|толчок|махи гирей/i, correctGroup: 'fullBody', reason: 'Все тело' },
];

let fixed = 0;
const fixedExercises = exercises.map(ex => {
  const searchText = `${ex.name} ${ex.nameEn}`.toLowerCase();
  
  for (const rule of rules) {
    if (rule.pattern.test(searchText)) {
      if (ex.muscleGroup !== rule.correctGroup) {
        console.log(`🔧 ${ex.name}`);
        console.log(`   Было: ${ex.muscleGroup} → Стало: ${rule.correctGroup} (${rule.reason})`);
        fixed++;
        return {
          ...ex,
          muscleGroup: rule.correctGroup
        };
      }
      break; // Нашли правило, прерываем
    }
  }
  
  return ex;
});

console.log(`\n✅ Исправлено: ${fixed} упражнений`);

// Статистика по группам
const stats = {};
fixedExercises.forEach(ex => {
  stats[ex.muscleGroup] = (stats[ex.muscleGroup] || 0) + 1;
});

console.log('\n📊 Распределение по группам:');
Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([group, count]) => {
  console.log(`  ${group}: ${count}`);
});

// Сохраняем
fs.writeFileSync(inputPath, JSON.stringify(fixedExercises, null, 2), 'utf8');

console.log('\n════════════════════════════════════════════════════════');
console.log(`✅ ГОТОВО! Сохранено в ${inputPath}`);
console.log('════════════════════════════════════════════════════════\n');

