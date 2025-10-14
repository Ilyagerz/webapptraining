// Утилиты для работы с суперсетами

import type { WorkoutExercise } from '@/types';

// Создать суперсет из двух упражнений
export function createSuperset(
  exercises: WorkoutExercise[],
  exerciseId1: string,
  exerciseId2: string
): WorkoutExercise[] {
  const supersetId = `superset-${Date.now()}`;
  
  return exercises.map(ex => {
    if (ex.id === exerciseId1 || ex.id === exerciseId2) {
      return {
        ...ex,
        supersetId,
        supersetOrder: ex.id === exerciseId1 ? 1 : 2,
      };
    }
    return ex;
  });
}

// Удалить суперсет
export function removeSupersetGroup(
  exercises: WorkoutExercise[],
  supersetId: string
): WorkoutExercise[] {
  return exercises.map(ex => {
    if (ex.supersetId === supersetId) {
      const { supersetId: _, supersetOrder: __, ...rest } = ex;
      return rest as WorkoutExercise;
    }
    return ex;
  });
}

// Получить цвет для суперсета
export function getSupersetColor(supersetId: string): string {
  const colors = [
    'bg-blue-500/20 border-blue-500',
    'bg-green-500/20 border-green-500',
    'bg-purple-500/20 border-purple-500',
    'bg-orange-500/20 border-orange-500',
    'bg-pink-500/20 border-pink-500',
    'bg-cyan-500/20 border-cyan-500',
  ];
  
  // Простой хэш для консистентного цвета
  const hash = supersetId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Получить позицию упражнения в суперсете
export function getSupersetPosition(exercise: WorkoutExercise): string {
  if (!exercise.supersetId) return '';
  return exercise.supersetOrder === 1 ? 'A' : 'B';
}

// Проверить, является ли упражнение частью суперсета
export function isInSuperset(exercise: WorkoutExercise): boolean {
  return !!exercise.supersetId;
}

// Получить все упражнения в суперсете
export function getSupersetExercises(
  exercises: WorkoutExercise[],
  supersetId: string
): WorkoutExercise[] {
  return exercises.filter(ex => ex.supersetId === supersetId);
}

// Получить партнера по суперсету
export function getSupersetPartner(
  exercises: WorkoutExercise[],
  exercise: WorkoutExercise
): WorkoutExercise | null {
  if (!exercise.supersetId) return null;
  
  return exercises.find(
    ex => ex.supersetId === exercise.supersetId && ex.id !== exercise.id
  ) || null;
}
