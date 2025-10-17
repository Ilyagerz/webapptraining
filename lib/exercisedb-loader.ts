/**
 * Загрузчик упражнений из ExerciseDB
 * Использует загруженные данные из data/exercises-full.json
 */

import type { Exercise, MuscleGroup, Equipment } from '@/types';

// Интерфейс для упражнений из ExerciseDB
export interface ExerciseDBExercise {
  id: string;
  name: string;
  originalName?: string;
  muscleGroup: string;
  secondaryMuscles?: string[];
  equipment: string;
  bodyParts?: string[];
  description: string;
  instructions: string[];
  gifUrl: string;
  gifUrlOriginal?: string;
  difficulty: string;
  category?: string;
  force?: string | null;
  mechanic?: string | null;
}

// Кэш загруженных упражнений
let exercisesCache: ExerciseDBExercise[] | null = null;

/**
 * Загружает упражнения из JSON файла
 */
export async function loadExercisesFromFile(): Promise<ExerciseDBExercise[]> {
  if (exercisesCache) {
    return exercisesCache;
  }

  try {
    // Пытаемся загрузить полную версию
    const response = await fetch('/api/exercises/all');
    if (response.ok) {
      const data = await response.json();
      exercisesCache = data;
      return data;
    }
  } catch (error) {
    console.error('Ошибка загрузки упражнений:', error);
  }

  // Возвращаем пустой массив если загрузка не удалась
  return [];
}

/**
 * Конвертирует упражнение из ExerciseDB в формат приложения
 */
export function convertExerciseDBToAppFormat(ex: ExerciseDBExercise): Omit<Exercise, 'id' | 'userId'> {
  // Мапинг групп мышц с правильной типизацией
  const muscleGroupMap: Record<string, MuscleGroup> = {
    'Грудь': 'chest',
    'Спина': 'back',
    'Плечи': 'shoulders',
    'Руки': 'arms',
    'Руки (верх)': 'arms',
    'Руки (низ)': 'arms',
    'Ноги': 'legs',
    'Ноги (верх)': 'legs',
    'Ноги (низ)': 'legs',
    'Пресс': 'abs',
    'Талия': 'abs',
    'Ягодицы': 'glutes',
  };

  // Мапинг оборудования с правильной типизацией
  const equipmentMap: Record<string, Equipment> = {
    'Штанга': 'barbell',
    'Гантели': 'dumbbell',
    'Тренажер': 'machine',
    'Кабель': 'cable',
    'Кабели': 'cable',
    'Собственный вес': 'bodyweight',
    'Без оборудования': 'bodyweight',
    'Гиря': 'kettlebell',
    'Резинка': 'bands',
    'Эспандер': 'bands',
  };

  // Определяем группу мышц
  let muscleGroup: MuscleGroup = 'other';
  for (const [rus, eng] of Object.entries(muscleGroupMap)) {
    if (ex.muscleGroup.includes(rus)) {
      muscleGroup = eng;
      break;
    }
  }

  // Определяем оборудование
  const equipmentList: Equipment[] = [];
  for (const [rus, eng] of Object.entries(equipmentMap)) {
    if (ex.equipment.includes(rus)) {
      if (!equipmentList.includes(eng)) {
        equipmentList.push(eng);
      }
    }
  }

  // Если не нашли - пытаемся напрямую
  if (equipmentList.length === 0) {
    equipmentList.push('other');
  }

  return {
    name: ex.name,
    nameEn: ex.originalName || ex.name,
    category: 'strength',
    muscleGroup,
    equipment: equipmentList,
    description: ex.description,
    instructions: ex.instructions,
    gifUrl: ex.gifUrl,
    isCustom: false,
  };
}

/**
 * Получает все упражнения в формате приложения
 */
export async function getAllExercises(): Promise<Exercise[]> {
  const exercisesDB = await loadExercisesFromFile();
  
  return exercisesDB.map((ex) => ({
    id: ex.id,
    ...convertExerciseDBToAppFormat(ex),
  }));
}

/**
 * Поиск упражнений по запросу
 */
export async function searchExercises(query: string): Promise<Exercise[]> {
  const exercises = await getAllExercises();
  
  if (!query) return exercises;
  
  const lowerQuery = query.toLowerCase();
  
  return exercises.filter(ex =>
    ex.name.toLowerCase().includes(lowerQuery) ||
    (ex.nameEn && ex.nameEn.toLowerCase().includes(lowerQuery)) ||
    ex.muscleGroup.toLowerCase().includes(lowerQuery) ||
    ex.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Фильтр по группе мышц
 */
export async function getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
  const exercises = await getAllExercises();
  
  if (muscleGroup === 'all') return exercises;
  
  return exercises.filter(ex => ex.muscleGroup === muscleGroup);
}

/**
 * Фильтр по оборудованию
 */
export async function getExercisesByEquipment(equipment: Equipment): Promise<Exercise[]> {
  const exercises = await getAllExercises();
  
  return exercises.filter(ex => ex.equipment.includes(equipment));
}

/**
 * Получить упражнение по ID
 */
export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  const exercises = await getAllExercises();
  
  return exercises.find(ex => ex.id === id);
}

/**
 * Очистить кэш (полезно при обновлении базы)
 */
export function clearCache() {
  exercisesCache = null;
}

