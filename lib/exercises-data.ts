import type { Exercise, MuscleGroup, Equipment } from '@/types';

// Маппинг русских названий в enum
const russianToEnglishMuscleGroup: Record<string, MuscleGroup> = {
  'Грудь': 'chest',
  'Спина': 'back',
  'Плечи': 'shoulders',
  'Ноги': 'legs',
  'Руки': 'arms',
  'Кор': 'abs',
  'Пресс': 'abs',
  'Кардио': 'cardio',
  'Все тело': 'fullBody',
  'Олимпийские упражнения': 'fullBody',
  'Другое': 'other',
  'chest': 'chest',
  'back': 'back',
  'shoulders': 'shoulders',
  'legs': 'legs',
  'arms': 'arms',
  'abs': 'abs',
  'cardio': 'cardio',
  'fullBody': 'fullBody',
  'other': 'other',
};

const russianToEnglishEquipment: Record<string, Equipment> = {
  'Штанга': 'barbell',
  'Гантели': 'dumbbell',
  'Тренажер': 'machine',
  'Кабель': 'cable',
  'Собственный вес': 'bodyweight',
  'Гиря': 'kettlebell',
  'Резинка': 'bands',
  'barbell': 'barbell',
  'dumbbell': 'dumbbell',
  'machine': 'machine',
  'cable': 'cable',
  'bodyweight': 'bodyweight',
  'kettlebell': 'kettlebell',
};

// Загрузка упражнений из translated файла
async function loadExercises() {
  try {
    // Пытаемся загрузить переведенные упражнения БЕЗ КЭША
    const response = await fetch('/api/exercises/translated', {
      cache: 'no-store', // Отключаем кэш браузера
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Преобразуем формат
      const exercises = data.map((ex: any) => ({
        id: ex.id,
        name: ex.name || ex.originalName,
        nameEn: ex.originalName || ex.nameEn,
        category: ex.category || 'strength',
        muscleGroup: russianToEnglishMuscleGroup[ex.muscleGroup] || 'chest',
        equipment: Array.isArray(ex.equipment) 
          ? ex.equipment.map((eq: string) => russianToEnglishEquipment[eq] || 'bodyweight' as Equipment)
          : [russianToEnglishEquipment[ex.equipment] || 'bodyweight' as Equipment],
        instructions: ex.instructions || [],
        gifUrl: ex.gifUrl,
        description: ex.description,
      }));
      
      console.log(`✅ Загружено ${exercises.length} упражнений из API (без кэша)`);
      return exercises;
    }
  } catch (error) {
    console.error('Error loading exercises:', error);
  }

  // Fallback to default exercises
  const fallbackExercises = getDefaultExercises();
  console.log(`⚠️ Используем fallback: ${fallbackExercises.length} упражнений`);
  return fallbackExercises;
}

export async function getExercises(customExercises: Exercise[] = []): Promise<Exercise[]> {
  const apiExercises = await loadExercises();
  
  // Объединяем API упражнения с кастомными
  return [...customExercises, ...apiExercises];
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  const exercises = await loadExercises();
  const lowerQuery = query.toLowerCase();
  
  return exercises.filter(
    (ex: Exercise) =>
      ex.name.toLowerCase().includes(lowerQuery) ||
      (ex.nameEn && ex.nameEn.toLowerCase().includes(lowerQuery)) ||
      ex.muscleGroup.toLowerCase().includes(lowerQuery) ||
      ex.equipment.some((eq: Equipment) => eq.toLowerCase().includes(lowerQuery))
  );
}

export async function getExercisesByMuscleGroup(
  muscleGroup: MuscleGroup
): Promise<Exercise[]> {
  const exercises = await loadExercises();
  return exercises.filter((ex: Exercise) => ex.muscleGroup === muscleGroup);
}

export const MUSCLE_GROUP_NAMES: Record<MuscleGroup, string> = {
  chest: 'Грудь',
  back: 'Спина',
  shoulders: 'Плечи',
  legs: 'Ноги',
  arms: 'Руки',
  abs: 'Пресс',
  cardio: 'Кардио',
  glutes: 'Ягодицы',
  fullBody: 'Все тело',
  other: 'Другое',
};

export function getDefaultExercises(): Exercise[] {
  return [
    {
      id: 'bench-press',
    name: 'Жим штанги лежа',
      nameEn: 'Bench Press (Barbell)',
    category: 'strength',
    muscleGroup: 'chest',
    equipment: ['barbell'],
    instructions: [
        'Лягте на скамью, стопы прижаты к полу',
        'Возьмитесь за гриф хватом шире плеч',
        'Опустите штангу к центру груди',
        'Выжмите штангу вверх до выпрямления рук',
      ],
      description: 'Базовое упражнение для грудных мышц',
    isCustom: false,
  },
  {
      id: 'squat',
      name: 'Приседания со штангой',
      nameEn: 'Squat (Barbell)',
    category: 'strength',
      muscleGroup: 'legs',
      equipment: ['barbell'],
    instructions: [
        'Положите штангу на трапеции',
        'Ноги на ширине плеч',
        'Присядьте до параллели бедра с полом',
        'Встаньте, отталкиваясь пятками',
      ],
      description: 'Базовое упражнение для ног',
    isCustom: false,
  },
  {
      id: 'deadlift',
    name: 'Становая тяга',
      nameEn: 'Deadlift (Barbell)',
    category: 'strength',
    muscleGroup: 'back',
    equipment: ['barbell'],
    instructions: [
        'Встаньте над штангой, ноги на ширине плеч',
      'Наклонитесь и возьмитесь за гриф',
        'Выпрямитесь, поднимая штангу',
        'Опустите штангу обратно под контролем',
      ],
    description: 'Базовое упражнение для спины',
    isCustom: false,
  },
  {
      id: 'shoulder-press',
    name: 'Жим штанги стоя',
      nameEn: 'Overhead Press (Barbell)',
    category: 'strength',
    muscleGroup: 'shoulders',
    equipment: ['barbell'],
    instructions: [
        'Встаньте, штанга на уровне плеч',
      'Выжмите штангу вверх над головой',
        'Опустите штангу обратно к плечам',
        'Повторите движение',
    ],
      description: 'Базовое упражнение для плеч',
    isCustom: false,
  },
  {
      id: 'pull-up',
      name: 'Подтягивания',
      nameEn: 'Pull-up',
    category: 'strength',
      muscleGroup: 'back',
    equipment: ['bodyweight'],
    instructions: [
        'Повисните на турнике широким хватом',
        'Подтянитесь, поднимая подбородок над перекладиной',
        'Опуститесь в исходное положение',
        'Повторите движение',
      ],
      description: 'Базовое упражнение для спины',
    isCustom: false,
  },
];
}
