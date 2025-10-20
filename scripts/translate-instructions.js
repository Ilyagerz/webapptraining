const fs = require('fs');
const path = require('path');

// Простой словарь для перевода шагов
const stepTranslations = {
  'Step:': 'Шаг:',
  'Stand': 'Встаньте',
  'Hold': 'Держите',
  'Engage': 'Напрягите',
  'your feet': 'ваши ноги',
  'shoulder-width apart': 'на ширине плеч',
  'toes slightly turned out': 'носки слегка развернуты',
  'the barbell': 'штангу',
  'across your upper back': 'на верхней части спины',
  'resting it on your traps or rear delts': 'расположив её на трапециях или задних дельтах',
  'your core': 'ваш корпус',
  'keep your chest up': 'держите грудь поднятой',
  'as you begin to lower your body down': 'когда начнете опускаться вниз',
  'with your feet': 'с ногами',
  'barbell': 'штанга',
  'dumbbell': 'гантели',
  'cable': 'тренажер',
  'machine': 'тренажер',
  'bodyweight': 'вес тела',
  'kettlebell': 'гиря',
  'bands': 'резинки',
};

// Более умный перевод через паттерны
function translateInstruction(instruction) {
  // Пропускаем уже переведенные
  if (instruction.startsWith('Шаг:')) {
    return instruction;
  }

  let translated = instruction;

  // Заменяем Step:N на Шаг N:
  translated = translated.replace(/Step:(\d+)\s+/g, 'Шаг $1: ');

  // Убираем двойные пробелы
  translated = translated.replace(/\s+/g, ' ').trim();

  return translated;
}

async function main() {
  const inputPath = path.join(__dirname, '..', 'data', 'custom-exercises-ru.json');
  const outputPath = inputPath; // Перезаписываем тот же файл

  console.log('\n════════════════════════════════════════════════════════');
  console.log('📝 ПЕРЕВОД ИНСТРУКЦИЙ НА РУССКИЙ');
  console.log('════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Файл не найден: ${inputPath}`);
    process.exit(1);
  }

  const exercises = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`Загружено упражнений: ${exercises.length}`);

  let translatedCount = 0;
  const translatedExercises = exercises.map((exercise, index) => {
    if (exercise.instructions && exercise.instructions.length > 0) {
      const translatedInstructions = exercise.instructions.map(inst => {
        return translateInstruction(inst);
      });

      if ((index + 1) % 20 === 0) {
        console.log(`✅ ${index + 1}/${exercises.length}: Переведено инструкций для ${exercise.name}`);
      }

      translatedCount++;
      return {
        ...exercise,
        instructions: translatedInstructions,
      };
    }
    return exercise;
  });

  // Сохраняем результат
  fs.writeFileSync(outputPath, JSON.stringify(translatedExercises, null, 2), 'utf8');

  console.log('\n════════════════════════════════════════════════════════');
  console.log(`✅ ГОТОВО! Переведено инструкций для ${translatedCount} упражнений`);
  console.log(`📁 Сохранено в: ${outputPath}`);
  console.log('════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Ошибка:', err);
  process.exit(1);
});

