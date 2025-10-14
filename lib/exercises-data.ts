// База упражнений на русском языке
import type { Exercise } from '@/types';

export const DEFAULT_EXERCISES: Omit<Exercise, 'id' | 'userId'>[] = [
  // ГРУДЬ
  {
    name: 'Жим штанги лежа',
    nameEn: 'Barbell Bench Press',
    category: 'strength',
    muscleGroup: 'chest',
    equipment: ['barbell'],
    description: 'Базовое упражнение для развития грудных мышц',
    instructions: [
      'Лягте на скамью, стопы упираются в пол',
      'Возьмитесь за гриф хватом чуть шире плеч',
      'Опустите штангу к середине груди',
      'Выжмите штангу вверх, напрягая грудные мышцы',
    ],
    isCustom: false,
  },
  {
    name: 'Жим гантелей лежа',
    nameEn: 'Dumbbell Bench Press',
    category: 'strength',
    muscleGroup: 'chest',
    equipment: ['dumbbell'],
    description: 'Жим гантелей для груди с большей амплитудой движения',
    instructions: [
      'Лягте на скамью с гантелями в руках',
      'Опустите гантели вниз, разводя локти в стороны',
      'Выжмите гантели вверх, сводя их в верхней точке',
    ],
    isCustom: false,
  },
  {
    name: 'Отжимания от пола',
    nameEn: 'Push-ups',
    category: 'strength',
    muscleGroup: 'chest',
    equipment: ['bodyweight'],
    description: 'Классическое упражнение с собственным весом',
    instructions: [
      'Примите упор лежа, руки на ширине плеч',
      'Опуститесь вниз, сгибая локти',
      'Отожмитесь вверх, напрягая грудь и трицепсы',
    ],
    isCustom: false,
  },
  {
    name: 'Разводка гантелей лежа',
    nameEn: 'Dumbbell Flyes',
    category: 'strength',
    muscleGroup: 'chest',
    equipment: ['dumbbell'],
    description: 'Изолирующее упражнение для груди',
    instructions: [
      'Лягте на скамью с гантелями над грудью',
      'Разведите руки в стороны, слегка согнув локти',
      'Сведите гантели над грудью по дуге',
    ],
    isCustom: false,
  },

  // СПИНА
  {
    name: 'Становая тяга',
    nameEn: 'Deadlift',
    category: 'strength',
    muscleGroup: 'back',
    equipment: ['barbell'],
    description: 'Базовое упражнение для всей задней цепи',
    instructions: [
      'Встаньте перед штангой, ноги на ширине плеч',
      'Наклонитесь и возьмитесь за гриф',
      'Поднимите штангу, выпрямляя спину и ноги',
      'Опустите штангу обратно контролируемым движением',
    ],
    isCustom: false,
  },
  {
    name: 'Подтягивания',
    nameEn: 'Pull-ups',
    category: 'strength',
    muscleGroup: 'back',
    equipment: ['bodyweight'],
    description: 'Базовое упражнение для спины',
    instructions: [
      'Повисните на перекладине широким хватом',
      'Подтянитесь вверх, сводя лопатки',
      'Опуститесь вниз контролируемо',
    ],
    isCustom: false,
  },
  {
    name: 'Тяга штанги в наклоне',
    nameEn: 'Barbell Row',
    category: 'strength',
    muscleGroup: 'back',
    equipment: ['barbell'],
    description: 'Базовое упражнение для толщины спины',
    instructions: [
      'Наклонитесь вперед, спина прямая',
      'Подтяните штангу к нижней части живота',
      'Опустите штангу контролируемо',
    ],
    isCustom: false,
  },
  {
    name: 'Тяга гантели в наклоне',
    nameEn: 'Dumbbell Row',
    category: 'strength',
    muscleGroup: 'back',
    equipment: ['dumbbell'],
    description: 'Односторонняя тяга для спины',
    instructions: [
      'Упритесь коленом и рукой в скамью',
      'Подтяните гантель к поясу',
      'Опустите гантель вниз',
    ],
    isCustom: false,
  },
  {
    name: 'Тяга верхнего блока',
    nameEn: 'Lat Pulldown',
    category: 'strength',
    muscleGroup: 'back',
    equipment: ['cable', 'machine'],
    description: 'Упражнение для широчайших мышц',
    instructions: [
      'Сядьте в тренажер, возьмитесь за рукоять широким хватом',
      'Подтяните рукоять к верхней части груди',
      'Верните рукоять вверх контролируемо',
    ],
    isCustom: false,
  },

  // ПЛЕЧИ
  {
    name: 'Жим штанги стоя',
    nameEn: 'Military Press',
    category: 'strength',
    muscleGroup: 'shoulders',
    equipment: ['barbell'],
    description: 'Базовое упражнение для дельтовидных мышц',
    instructions: [
      'Встаньте прямо, штанга на уровне плеч',
      'Выжмите штангу вверх над головой',
      'Опустите штангу к плечам',
    ],
    isCustom: false,
  },
  {
    name: 'Жим гантелей сидя',
    nameEn: 'Seated Dumbbell Press',
    category: 'strength',
    muscleGroup: 'shoulders',
    equipment: ['dumbbell'],
    description: 'Жим для развития плеч',
    instructions: [
      'Сядьте на скамью с гантелями у плеч',
      'Выжмите гантели вверх',
      'Опустите гантели к плечам',
    ],
    isCustom: false,
  },
  {
    name: 'Разводка гантелей стоя',
    nameEn: 'Lateral Raises',
    category: 'strength',
    muscleGroup: 'shoulders',
    equipment: ['dumbbell'],
    description: 'Изолирующее упражнение для средних дельт',
    instructions: [
      'Встаньте с гантелями в руках',
      'Поднимите руки в стороны до уровня плеч',
      'Опустите гантели вниз',
    ],
    isCustom: false,
  },

  // НОГИ
  {
    name: 'Приседания со штангой',
    nameEn: 'Barbell Squat',
    category: 'strength',
    muscleGroup: 'legs',
    equipment: ['barbell'],
    description: 'Базовое упражнение для ног',
    instructions: [
      'Положите штангу на трапеции',
      'Присядьте до параллели с полом',
      'Встаньте, отталкиваясь пятками',
    ],
    isCustom: false,
  },
  {
    name: 'Жим ногами',
    nameEn: 'Leg Press',
    category: 'strength',
    muscleGroup: 'legs',
    equipment: ['machine'],
    description: 'Базовое упражнение в тренажере',
    instructions: [
      'Сядьте в тренажер, ноги на платформе',
      'Опустите платформу, сгибая ноги',
      'Выжмите платформу вверх',
    ],
    isCustom: false,
  },
  {
    name: 'Выпады с гантелями',
    nameEn: 'Dumbbell Lunges',
    category: 'strength',
    muscleGroup: 'legs',
    equipment: ['dumbbell'],
    description: 'Упражнение для ног и ягодиц',
    instructions: [
      'Встаньте с гантелями в руках',
      'Сделайте шаг вперед и присядьте',
      'Вернитесь в исходное положение',
    ],
    isCustom: false,
  },
  {
    name: 'Румынская тяга',
    nameEn: 'Romanian Deadlift',
    category: 'strength',
    muscleGroup: 'legs',
    equipment: ['barbell'],
    description: 'Упражнение для задней поверхности бедра',
    instructions: [
      'Встаньте со штангой в руках',
      'Наклонитесь вперед, отводя таз назад',
      'Вернитесь в исходное положение',
    ],
    isCustom: false,
  },
  {
    name: 'Сгибания ног лежа',
    nameEn: 'Leg Curls',
    category: 'strength',
    muscleGroup: 'legs',
    equipment: ['machine'],
    description: 'Изолирующее упражнение для бицепса бедра',
    instructions: [
      'Лягте в тренажер лицом вниз',
      'Согните ноги, подтягивая валик к ягодицам',
      'Разогните ноги контролируемо',
    ],
    isCustom: false,
  },

  // РУКИ
  {
    name: 'Подъем штанги на бицепс',
    nameEn: 'Barbell Curl',
    category: 'strength',
    muscleGroup: 'arms',
    equipment: ['barbell'],
    description: 'Базовое упражнение для бицепса',
    instructions: [
      'Встаньте со штангой в руках',
      'Согните руки, поднимая штангу к плечам',
      'Опустите штангу вниз',
    ],
    isCustom: false,
  },
  {
    name: 'Подъем гантелей на бицепс',
    nameEn: 'Dumbbell Curl',
    category: 'strength',
    muscleGroup: 'arms',
    equipment: ['dumbbell'],
    description: 'Упражнение для бицепса с гантелями',
    instructions: [
      'Встаньте с гантелями в руках',
      'Поднимите гантели к плечам, супинируя кисти',
      'Опустите гантели вниз',
    ],
    isCustom: false,
  },
  {
    name: 'Французский жим',
    nameEn: 'Skull Crushers',
    category: 'strength',
    muscleGroup: 'arms',
    equipment: ['barbell'],
    description: 'Упражнение для трицепса',
    instructions: [
      'Лягте на скамью со штангой над головой',
      'Согните руки, опуская штангу ко лбу',
      'Разогните руки, выпрямляя трицепсы',
    ],
    isCustom: false,
  },
  {
    name: 'Разгибания на блоке',
    nameEn: 'Tricep Pushdown',
    category: 'strength',
    muscleGroup: 'arms',
    equipment: ['cable'],
    description: 'Изолирующее упражнение для трицепса',
    instructions: [
      'Встаньте перед верхним блоком',
      'Разогните руки вниз, держась за рукоять',
      'Согните руки обратно',
    ],
    isCustom: false,
  },

  // ПРЕСС
  {
    name: 'Скручивания',
    nameEn: 'Crunches',
    category: 'strength',
    muscleGroup: 'abs',
    equipment: ['bodyweight'],
    description: 'Базовое упражнение для пресса',
    instructions: [
      'Лягте на спину, ноги согнуты',
      'Поднимите плечи к коленям',
      'Опуститесь обратно',
    ],
    isCustom: false,
  },
  {
    name: 'Планка',
    nameEn: 'Plank',
    category: 'strength',
    muscleGroup: 'abs',
    equipment: ['bodyweight'],
    description: 'Статическое упражнение для кора',
    instructions: [
      'Примите упор на предплечьях и носках',
      'Держите тело прямо',
      'Удерживайте положение заданное время',
    ],
    isCustom: false,
  },
  {
    name: 'Подъем ног в висе',
    nameEn: 'Hanging Leg Raises',
    category: 'strength',
    muscleGroup: 'abs',
    equipment: ['bodyweight'],
    description: 'Упражнение для нижнего пресса',
    instructions: [
      'Повисните на перекладине',
      'Поднимите прямые ноги до параллели с полом',
      'Опустите ноги вниз',
    ],
    isCustom: false,
  },
];

// Функция для генерации ID упражнения
export function generateExerciseId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

// Функция для получения упражнений с ID
export function getDefaultExercises(): Exercise[] {
  return DEFAULT_EXERCISES.map(exercise => ({
    ...exercise,
    id: generateExerciseId(exercise.name),
  }));
}

// Названия групп мышц на русском
export const MUSCLE_GROUP_NAMES: Record<string, string> = {
  chest: 'Грудь',
  back: 'Спина',
  shoulders: 'Плечи',
  arms: 'Руки',
  legs: 'Ноги',
  abs: 'Пресс',
  glutes: 'Ягодицы',
  fullBody: 'Все тело',
  other: 'Другое',
};

// Названия оборудования на русском
export const EQUIPMENT_NAMES: Record<string, string> = {
  barbell: 'Штанга',
  dumbbell: 'Гантели',
  machine: 'Тренажер',
  cable: 'Блоки',
  bodyweight: 'Свой вес',
  kettlebell: 'Гири',
  bands: 'Резинки',
  other: 'Другое',
};
