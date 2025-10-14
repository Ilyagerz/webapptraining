// Скрипт для импорта упражнений из готового списка
const fs = require('fs');
const path = require('path');

// Готовые упражнения с русскими названиями
const exercises = [
  // === ГРУДЬ ===
  {
    id: 'zhim-shtangi-lezha',
    name: 'Жим штанги лежа',
    muscleGroup: 'chest',
    equipment: 'Штанга',
    description: 'Базовое упражнение для развития грудных мышц, трицепсов и передних дельт',
    instructions: '1. Лягте на горизонтальную скамью, ступни прижаты к полу\n2. Возьмите штангу хватом чуть шире плеч\n3. Снимите штангу и опустите до касания груди\n4. Мощно выжмите штангу вверх\n5. В верхней точке не блокируйте локти полностью',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
    difficulty: 'intermediate',
  },
  {
    id: 'zhim-gantelej-lezha',
    name: 'Жим гантелей лежа',
    muscleGroup: 'chest',
    equipment: 'Гантели',
    description: 'Позволяет лучше растянуть грудные мышцы и работать с каждой стороной независимо',
    instructions: '1. Лягте на скамью с гантелями\n2. Поднимите гантели над грудью\n3. Опустите гантели по сторонам груди\n4. Выжмите вверх, сводя в верхней точке',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bench-Press.gif',
    difficulty: 'intermediate',
  },
  {
    id: 'razvedenie-gantelej',
    name: 'Разведение гантелей лежа',
    muscleGroup: 'chest',
    equipment: 'Гантели',
    description: 'Изолирующее упражнение для растяжки и наполнения грудных мышц',
    instructions: '1. Лягте на скамью с гантелями над грудью\n2. Слегка согните локти\n3. Разведите руки в стороны\n4. Сведите гантели над грудью',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif',
    difficulty: 'beginner',
  },
  {
    id: 'otzhimaniya-na-brusyah',
    name: 'Отжимания на брусьях',
    muscleGroup: 'chest',
    equipment: 'Брусья',
    description: 'Базовое упражнение с собственным весом для груди и трицепсов',
    instructions: '1. Запрыгните на брусья\n2. Наклоните корпус вперед\n3. Опуститесь вниз до растяжения груди\n4. Выжмите себя вверх',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Chest-Dips.gif',
    difficulty: 'intermediate',
  },

  // === СПИНА ===
  {
    id: 'stanovaya-tyaga',
    name: 'Становая тяга',
    muscleGroup: 'back',
    equipment: 'Штанга',
    description: 'Главное базовое упражнение, задействует все тело',
    instructions: '1. Встаньте перед штангой, ноги на ширине плеч\n2. Возьмите штангу хватом чуть шире плеч\n3. Держите спину прямой\n4. Поднимите штангу, разгибая ноги и спину\n5. В верхней точке полностью распрямитесь',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
    difficulty: 'advanced',
  },
  {
    id: 'tyaga-shtangi-v-naklone',
    name: 'Тяга штанги в наклоне',
    muscleGroup: 'back',
    equipment: 'Штанга',
    description: 'Базовое упражнение для толщины спины',
    instructions: '1. Наклонитесь вперед, спина прямая\n2. Возьмите штангу хватом на ширине плеч\n3. Тяните штангу к низу живота\n4. Сводите лопатки в верхней точке',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif',
    difficulty: 'intermediate',
  },
  {
    id: 'podtyagivaniya',
    name: 'Подтягивания',
    muscleGroup: 'back',
    equipment: 'Турник',
    description: 'Лучшее упражнение с собственным весом для спины',
    instructions: '1. Возьмитесь за перекладину\n2. Подтянитесь до подбородка\n3. Плавно опуститесь вниз\n4. Держите тело ровно',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif',
    difficulty: 'intermediate',
  },
  {
    id: 'tyaga-verh-bloka',
    name: 'Тяга верхнего блока',
    muscleGroup: 'back',
    equipment: 'Блок',
    description: 'Альтернатива подтягиваниям, развивает ширину спины',
    instructions: '1. Сядьте в тренажер\n2. Возьмитесь за рукоять широким хватом\n3. Тяните к груди\n4. Сводите лопатки',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LAT-PULL-DOWN.gif',
    difficulty: 'beginner',
  },

  // === НОГИ ===
  {
    id: 'prisedaniya-so-shtangoj',
    name: 'Приседания со штангой',
    muscleGroup: 'legs',
    equipment: 'Штанга',
    description: 'Король упражнений для ног, развивает силу и массу',
    instructions: '1. Положите штангу на верх трапеций\n2. Ноги на ширине плеч\n3. Присядьте до параллели или ниже\n4. Вернитесь в исходное положение\n5. Держите спину прямой',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif',
    difficulty: 'advanced',
  },
  {
    id: 'zhim-nogami',
    name: 'Жим ногами',
    muscleGroup: 'legs',
    equipment: 'Тренажер',
    description: 'Безопасная альтернатива приседаниям, позволяет работать с большими весами',
    instructions: '1. Сядьте в тренажер\n2. Поставьте ноги на платформу\n3. Выжмите платформу вверх\n4. Опустите контролируемо\n5. Не блокируйте колени полностью',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-PRESS.gif',
    difficulty: 'beginner',
  },
  {
    id: 'vydpady',
    name: 'Выпады',
    muscleGroup: 'legs',
    equipment: 'Гантели',
    description: 'Развивают квадрицепсы, ягодицы и улучшают баланс',
    instructions: '1. Возьмите гантели в руки\n2. Сделайте шаг вперед\n3. Опуститесь до касания коленом пола\n4. Вернитесь в исходное положение',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif',
    difficulty: 'beginner',
  },
  {
    id: 'sgibanie-nog',
    name: 'Сгибания ног лежа',
    muscleGroup: 'legs',
    equipment: 'Тренажер',
    description: 'Изолирующее упражнение для бицепса бедра',
    instructions: '1. Лягте в тренажер лицом вниз\n2. Заведите ноги под валик\n3. Согните ноги к ягодицам\n4. Плавно опустите',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif',
    difficulty: 'beginner',
  },
  {
    id: 'razgibanie-nog',
    name: 'Разгибания ног сидя',
    muscleGroup: 'legs',
    equipment: 'Тренажер',
    description: 'Изолирующее упражнение для квадрицепсов',
    instructions: '1. Сядьте в тренажер\n2. Заведите ноги под валик\n3. Разогните ноги\n4. Задержитесь в верхней точке',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif',
    difficulty: 'beginner',
  },

  // === ПЛЕЧИ ===
  {
    id: 'zhim-shtangi-stoya',
    name: 'Жим штанги стоя',
    muscleGroup: 'shoulders',
    equipment: 'Штанга',
    description: 'Базовое упражнение для дельтовидных мышц',
    instructions: '1. Встаньте прямо, штанга на уровне плеч\n2. Выжмите штангу вверх над головой\n3. Опустите контролируемо\n4. Не прогибайтесь в пояснице',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Standing-Military-Press.gif',
    difficulty: 'intermediate',
  },
  {
    id: 'zhim-gantelej-sidya',
    name: 'Жим гантелей сидя',
    muscleGroup: 'shoulders',
    equipment: 'Гантели',
    description: 'Развивает передние и средние дельты',
    instructions: '1. Сядьте на скамью со спинкой\n2. Поднимите гантели к плечам\n3. Выжмите вверх\n4. Опустите к плечам',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif',
    difficulty: 'beginner',
  },
  {
    id: 'razvedenie-gantelej-v-storony',
    name: 'Разведение гантелей в стороны',
    muscleGroup: 'shoulders',
    equipment: 'Гантели',
    description: 'Изолирует средние дельты, создает ширину плеч',
    instructions: '1. Встаньте прямо с гантелями\n2. Слегка согните локти\n3. Поднимите руки в стороны до уровня плеч\n4. Плавно опустите',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',
    difficulty: 'beginner',
  },

  // === РУКИ ===
  {
    id: 'podem-shtangi-na-biceps',
    name: 'Подъем штанги на бицепс',
    muscleGroup: 'arms',
    equipment: 'Штанга',
    description: 'Классическое упражнение для бицепсов',
    instructions: '1. Встаньте прямо, штанга в руках\n2. Согните руки в локтях\n3. Поднимите штангу к плечам\n4. Опустите контролируемо\n5. Не раскачивайтесь',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif',
    difficulty: 'beginner',
  },
  {
    id: 'podem-gantelej-na-biceps',
    name: 'Подъем гантелей на бицепс',
    muscleGroup: 'arms',
    equipment: 'Гантели',
    description: 'Позволяет работать с каждой рукой независимо',
    instructions: '1. Встаньте с гантелями в руках\n2. Сгибайте руки поочередно или одновременно\n3. Разворачивайте кисть при подъеме\n4. Контролируйте негативную фазу',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif',
    difficulty: 'beginner',
  },
  {
    id: 'francuzskij-zhim',
    name: 'Французский жим лежа',
    muscleGroup: 'arms',
    equipment: 'Штанга',
    description: 'Лучшее упражнение для трицепсов',
    instructions: '1. Лягте на скамью\n2. Поднимите штангу вверх\n3. Согните руки, опуская штангу ко лбу\n4. Разогните руки\n5. Локти неподвижны',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Lying-Triceps-Extension-Skull-Crusher.gif',
    difficulty: 'intermediate',
  },
  {
    id: 'razgibanie-ruk-na-bloke',
    name: 'Разгибание рук на верхнем блоке',
    muscleGroup: 'arms',
    equipment: 'Блок',
    description: 'Изолирующее упражнение для трицепсов',
    instructions: '1. Встаньте у верхнего блока\n2. Возьмите рукоять\n3. Разгибайте руки вниз\n4. Локти прижаты к корпусу',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Pushdown.gif',
    difficulty: 'beginner',
  },

  // === ПРЕСС ===
  {
    id: 'skruchivaniya',
    name: 'Скручивания',
    muscleGroup: 'abs',
    equipment: 'Без оборудования',
    description: 'Базовое упражнение для пресса',
    instructions: '1. Лягте на спину, ноги согнуты\n2. Руки за головой\n3. Поднимите плечи к коленям\n4. Напрягайте пресс в верхней точке',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif',
    difficulty: 'beginner',
  },
  {
    id: 'planka',
    name: 'Планка',
    muscleGroup: 'abs',
    equipment: 'Без оборудования',
    description: 'Статическое упражнение для кора',
    instructions: '1. Примите упор лежа на предплечьях\n2. Тело прямое от головы до пят\n3. Напрягите пресс и ягодицы\n4. Держите позицию',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif',
    difficulty: 'beginner',
  },
  {
    id: 'podjem-nog-v-vise',
    name: 'Подъем ног в висе',
    muscleGroup: 'abs',
    equipment: 'Турник',
    description: 'Продвинутое упражнение для нижнего пресса',
    instructions: '1. Повисните на турнике\n2. Поднимите прямые ноги до параллели\n3. Опустите контролируемо\n4. Не раскачивайтесь',
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hanging-Leg-Raise.gif',
    difficulty: 'advanced',
  },
];

async function main() {
  console.log('🏋️ Создаем файл с упражнениями...\n');
  
  // Создаем директорию data
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Сохраняем упражнения
  const outputPath = path.join(dataDir, 'exercises.json');
  fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2), 'utf-8');
  
  console.log(`✅ Создано ${exercises.length} упражнений!`);
  console.log(`📁 Сохранено в: ${outputPath}\n`);
  
  // Статистика
  const stats = {
    chest: exercises.filter(e => e.muscleGroup === 'chest').length,
    back: exercises.filter(e => e.muscleGroup === 'back').length,
    legs: exercises.filter(e => e.muscleGroup === 'legs').length,
    shoulders: exercises.filter(e => e.muscleGroup === 'shoulders').length,
    arms: exercises.filter(e => e.muscleGroup === 'arms').length,
    abs: exercises.filter(e => e.muscleGroup === 'abs').length,
  };
  
  console.log('📊 Статистика по группам мышц:');
  console.log(`   Грудь: ${stats.chest}`);
  console.log(`   Спина: ${stats.back}`);
  console.log(`   Ноги: ${stats.legs}`);
  console.log(`   Плечи: ${stats.shoulders}`);
  console.log(`   Руки: ${stats.arms}`);
  console.log(`   Пресс: ${stats.abs}`);
  console.log(`\n🎯 Всего: ${exercises.length} упражнений`);
}

main().catch(console.error);

