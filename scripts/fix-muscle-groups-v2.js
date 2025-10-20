const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'data', 'custom-exercises-ru.json');

console.log('\n════════════════════════════════════════════════════════');
console.log('🔧 ИСПРАВЛЕНИЕ ГРУПП МЫШЦ V2 (БОЛЕЕ ТОЧНОЕ)');
console.log('════════════════════════════════════════════════════════\n');

const exercises = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
console.log(`Всего упражнений: ${exercises.length}`);

// Более точные правила с приоритетом
const getCorrectMuscleGroup = (name, nameEn) => {
  const searchText = `${name} ${nameEn}`.toLowerCase();
  
  // ПРЕСС (высокий приоритет - многие упражнения содержат "leg" но это пресс)
  if (/(crunch|plank|скручивани|планка|ab\s|пресс|v.*up)/i.test(searchText)) {
    return 'abs';
  }
  
  // ИКРЫ → НОГИ (высокий приоритет)
  if (/(calf|носки|икр)/i.test(searchText)) {
    return 'legs';
  }
  
  // ГРУДЬ
  if (/(bench press|chest|грудь|жим лежа|pec|fly|разведени.*гант)/i.test(searchText) && 
      !/(incline row|lat)/i.test(searchText)) {
    return 'chest';
  }
  
  // СПИНА (проверяем раньше legs, так как становая тяга часто путается)
  if (/(pull.*up|row|lat|спина|тяга|подтягивани|deadlift|тяга.*штанги|тяга.*блока)/i.test(searchText) &&
      !/(носки|calf)/i.test(searchText)) {
    return 'back';
  }
  
  // НОГИ
  if (/(squat|присед|выпад|lunge|leg press|ног|жим ногами)/i.test(searchText) &&
      !/( в висе| подъем.*ног|knee raise)/i.test(searchText)) {
    return 'legs';
  }
  
  // ПЛЕЧИ
  if (/(shoulder|delt|lateral raise|плечи|дельт|жим.*стоя|overhead press|армейский)/i.test(searchText)) {
    return 'shoulders';
  }
  
  // РУКИ
  if (/(bicep|tricep|curl|бицепс|трицепс|сгибани.*рук|разгибани.*рук|молот|на бицепс)/i.test(searchText) &&
      !/(махи|swing|rope|канат|протяжка)/i.test(searchText)) {
    return 'arms';
  }
  
  // КАРДИО
  if (/(run|jog|skip|rope|burpee|бег|скакалка|берпи|mountain climber|скалолаз)/i.test(searchText)) {
    return 'cardio';
  }
  
  // ВСЁ ТЕЛО
  if (/(clean|snatch|thruster|swing|взятие|рывок|толчок|махи гирей|турецк)/i.test(searchText)) {
    return 'fullBody';
  }
  
  return null; // Не определено
};

let fixed = 0;
const fixedExercises = exercises.map(ex => {
  const correctGroup = getCorrectMuscleGroup(ex.name, ex.nameEn);
  
  if (correctGroup && ex.muscleGroup !== correctGroup) {
    console.log(`🔧 ${ex.name} (${ex.nameEn})`);
    console.log(`   ${ex.muscleGroup} → ${correctGroup}`);
    fixed++;
    return {
      ...ex,
      muscleGroup: correctGroup
    };
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

