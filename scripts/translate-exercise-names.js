const fs = require('fs');
const path = require('path');

// Словарь перевода распространенных слов в названиях упражнений
const translationDict = {
  // Оборудование
  'barbell': 'штанга',
  'dumbbell': 'гантель',
  'dumbbells': 'гантели',
  'cable': 'кабель',
  'machine': 'тренажер',
  'smith machine': 'машина Смита',
  'lever': 'рычаг',
  'ez barbell': 'EZ-штанга',
  'kettlebell': 'гиря',
  'band': 'резинка',
  'bands': 'резинки',
  'resistance band': 'резинка для фитнеса',
  
  // Упражнения
  'squat': 'присед',
  'squats': 'приседания',
  'press': 'жим',
  'bench press': 'жим лежа',
  'deadlift': 'становая тяга',
  'curl': 'сгибание',
  'curls': 'сгибания',
  'extension': 'разгибание',
  'extensions': 'разгибания',
  'raise': 'подъем',
  'raises': 'подъемы',
  'row': 'тяга',
  'rows': 'тяги',
  'pull': 'тяга',
  'pulldown': 'тяга вниз',
  'pullover': 'пуловер',
  'push': 'толчок',
  'pushdown': 'толчок вниз',
  'fly': 'разведение',
  'flyes': 'разведения',
  'shrug': 'шраги',
  'shrugs': 'шраги',
  'lunge': 'выпад',
  'lunges': 'выпады',
  'calf': 'икра',
  'calves': 'икры',
  'crunch': 'скручивание',
  'crunches': 'скручивания',
  'plank': 'планка',
  'twist': 'скручивание',
  'lateral': 'боковой',
  'front': 'передний',
  'rear': 'задний',
  'decline': 'наклонный вниз',
  'incline': 'наклонный вверх',
  'flat': 'горизонтальный',
  'standing': 'стоя',
  'seated': 'сидя',
  'lying': 'лежа',
  'bent over': 'в наклоне',
  'overhead': 'над головой',
  'hammer': 'молот',
  'reverse': 'обратный',
  'close grip': 'узкий хват',
  'wide grip': 'широкий хват',
  'neutral grip': 'нейтральный хват',
  'underhand': 'обратным хватом',
  'overhand': 'прямым хватом',
  'one arm': 'одной рукой',
  'single arm': 'одной рукой',
  'alternate': 'попеременный',
  'alternating': 'попеременный',
  'arnold': 'Арнольд',
  
  // Части тела
  'chest': 'грудь',
  'back': 'спина',
  'shoulder': 'плечо',
  'shoulders': 'плечи',
  'biceps': 'бицепс',
  'triceps': 'трицепс',
  'forearm': 'предплечье',
  'forearms': 'предплечья',
  'leg': 'нога',
  'legs': 'ноги',
  'thigh': 'бедро',
  'thighs': 'бедра',
  'hamstring': 'задняя поверхность бедра',
  'hamstrings': 'задняя поверхность бедра',
  'quadriceps': 'квадрицепс',
  'glute': 'ягодица',
  'glutes': 'ягодицы',
  'abs': 'пресс',
  'abdominal': 'брюшной',
  'core': 'кор',
  'lower back': 'нижняя часть спины',
  'upper back': 'верхняя часть спины',
  'middle back': 'средняя часть спины',
  'trapezius': 'трапеция',
  'lat': 'широчайшая',
  'lats': 'широчайшие',
  'deltoid': 'дельта',
  'deltoids': 'дельты',
  
  // Действия
  'hold': 'удержание',
  'holding': 'удержание',
  'stretch': 'растяжка',
  'step': 'шаг',
  'walk': 'ходьба',
  'run': 'бег',
  'jump': 'прыжок',
  'jumping': 'прыжки',
  'kick': 'удар',
  'lift': 'подъем',
  'lower': 'опускание',
  
  // Позиции и углы
  'high': 'высокий',
  'low': 'низкий',
  'upper': 'верхний',
  'lower': 'нижний',
  'inner': 'внутренний',
  'outer': 'внешний',
  'parallel': 'параллельный',
  'full': 'полный',
  'half': 'половинный',
  'quarter': 'четверть',
  'deep': 'глубокий',
  
  // Другое
  'around': 'вокруг',
  'world': 'мир',
  'wheel': 'колесо',
  'ball': 'мяч',
  'slams': 'удары',
  'on': 'на',
  'with': 'с',
  'to': 'к',
  'the': '',
  'a': '',
  'an': '',
  'of': '',
  'and': 'и',
};

// Функция умного перевода
function translateExerciseName(englishName) {
  if (!englishName) return englishName;
  
  let translated = englishName.toLowerCase();
  
  // Сортируем ключи по длине (длинные фразы первыми)
  const sortedKeys = Object.keys(translationDict).sort((a, b) => b.length - a.length);
  
  // Заменяем английские слова на русские
  for (const key of sortedKeys) {
    const value = translationDict[key];
    if (value) {
      // Используем регулярное выражение для замены целых слов
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      translated = translated.replace(regex, value);
    }
  }
  
  // Убираем лишние пробелы
  translated = translated.replace(/\s+/g, ' ').trim();
  
  // Первая буква заглавная
  translated = translated.charAt(0).toUpperCase() + translated.slice(1);
  
  // Убираем скобки если внутри ничего полезного
  translated = translated.replace(/\(\s*\)/g, '');
  translated = translated.replace(/\s+/g, ' ').trim();
  
  return translated;
}

// Основная функция
async function translateExerciseNames() {
  const inputPath = path.join(__dirname, '..', 'data', 'custom-exercises.json');
  const outputPath = path.join(__dirname, '..', 'data', 'custom-exercises-ru.json');
  
  console.log('📖 Читаю упражнения из:', inputPath);
  
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  console.log(`📝 Переводу ${data.length} упражнений...`);
  
  const translated = data.map((exercise, index) => {
    const russianName = translateExerciseName(exercise.name);
    
    if ((index + 1) % 10 === 0) {
      console.log(`   ${index + 1}/${data.length}: ${exercise.name} → ${russianName}`);
    }
    
    return {
      ...exercise,
      name: russianName,
      nameEn: exercise.name,
    };
  });
  
  // Сохраняем
  fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2), 'utf8');
  
  console.log(`\n✅ Готово! Сохранено в: ${outputPath}`);
  console.log(`📊 Переведено ${translated.length} упражнений`);
  
  // Показываем примеры
  console.log('\n📋 Примеры переводов:');
  for (let i = 0; i < Math.min(10, translated.length); i++) {
    console.log(`   ${translated[i].nameEn}`);
    console.log(`   → ${translated[i].name}`);
    console.log('');
  }
}

translateExerciseNames().catch(console.error);

