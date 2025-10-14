// Утилиты для авто-прогрессии весов

import type { WorkoutSet, WorkoutExercise } from '@/types';

export type ProgressionType = 'linear' | 'double' | 'wave' | 'deload';

export interface ProgressionSuggestion {
  type: ProgressionType;
  weight: number;
  reps: number;
  reason: string;
}

// Линейная прогрессия (+2.5-5 кг)
export function calculateLinearProgression(
  currentWeight: number,
  currentReps: number,
  targetReps: number
): ProgressionSuggestion {
  // Если выполнены все повторения - увеличиваем вес
  if (currentReps >= targetReps) {
    const increment = currentWeight < 60 ? 2.5 : 5;
    return {
      type: 'linear',
      weight: currentWeight + increment,
      reps: targetReps,
      reason: `Все повторения выполнены. Увеличиваем вес на ${increment} кг`,
    };
  }

  return {
    type: 'linear',
    weight: currentWeight,
    reps: targetReps,
    reason: 'Продолжай с текущим весом до выполнения всех повторений',
  };
}

// Двойная прогрессия (сначала повторения, потом вес)
export function calculateDoubleProgression(
  currentWeight: number,
  currentReps: number,
  minReps: number,
  maxReps: number
): ProgressionSuggestion {
  // Если достигли максимума повторений - увеличиваем вес и возвращаемся к минимуму
  if (currentReps >= maxReps) {
    const increment = currentWeight < 60 ? 2.5 : 5;
    return {
      type: 'double',
      weight: currentWeight + increment,
      reps: minReps,
      reason: `Достигнут максимум повторений. Увеличиваем вес на ${increment} кг и возвращаемся к ${minReps} повторениям`,
    };
  }

  // Если меньше максимума - увеличиваем повторения
  return {
    type: 'double',
    weight: currentWeight,
    reps: Math.min(currentReps + 1, maxReps),
    reason: `Увеличиваем повторения до ${Math.min(currentReps + 1, maxReps)}`,
  };
}

// Волновая периодизация
export function calculateWaveProgression(
  week: number,
  baseWeight: number,
  baseReps: number
): ProgressionSuggestion {
  const weekInCycle = week % 3;
  
  switch (weekInCycle) {
    case 0: // Легкая неделя (85%)
      return {
        type: 'wave',
        weight: Math.round(baseWeight * 0.85 * 2) / 2,
        reps: baseReps + 2,
        reason: 'Легкая неделя: 85% от рабочего веса, больше повторений',
      };
    case 1: // Средняя неделя (95%)
      return {
        type: 'wave',
        weight: Math.round(baseWeight * 0.95 * 2) / 2,
        reps: baseReps,
        reason: 'Средняя неделя: 95% от рабочего веса',
      };
    case 2: // Тяжелая неделя (100%+)
      return {
        type: 'wave',
        weight: Math.round((baseWeight + 2.5) * 2) / 2,
        reps: baseReps,
        reason: 'Тяжелая неделя: попытка увеличить рабочий вес',
      };
    default:
      return {
        type: 'wave',
        weight: baseWeight,
        reps: baseReps,
        reason: 'Стандартная нагрузка',
      };
  }
}

// Определить необходимость разгрузки (deload)
export function shouldDeload(
  recentWorkouts: WorkoutExercise[],
  exerciseId: string
): boolean {
  // Если за последние 4 тренировки не было прогресса - нужна разгрузка
  const relevantWorkouts = recentWorkouts
    .filter(w => w.exerciseId === exerciseId)
    .slice(0, 4);

  if (relevantWorkouts.length < 4) return false;

  const weights = relevantWorkouts.map(w => {
    const maxWeight = Math.max(...w.sets.map(s => s.weight || 0));
    return maxWeight;
  });

  // Если вес не растет 4 тренировки подряд
  const isStagnant = weights.every((w, i) => i === 0 || w <= weights[i - 1]);
  
  return isStagnant;
}

// Рассчитать разгрузочную неделю
export function calculateDeload(
  currentWeight: number,
  currentReps: number
): ProgressionSuggestion {
  return {
    type: 'deload',
    weight: Math.round(currentWeight * 0.6 * 2) / 2,
    reps: Math.floor(currentReps * 0.7),
    reason: 'Разгрузочная неделя: 60% веса, 70% повторений для восстановления',
  };
}

// Получить рекомендацию по прогрессии
export function getProgressionSuggestion(
  exercise: WorkoutExercise,
  recentWorkouts: WorkoutExercise[],
  progressionType: ProgressionType = 'linear'
): ProgressionSuggestion {
  const lastSet = exercise.sets[exercise.sets.length - 1];
  const weight = lastSet?.weight || 0;
  const reps = lastSet?.reps || 0;
  const targetReps = lastSet?.targetReps || 10;

  // Проверка на необходимость разгрузки
  if (shouldDeload(recentWorkouts, exercise.exerciseId)) {
    return calculateDeload(weight, reps);
  }

  switch (progressionType) {
    case 'linear':
      return calculateLinearProgression(weight, reps, targetReps);
    case 'double':
      return calculateDoubleProgression(weight, reps, 6, 12);
    case 'wave':
      // Предполагаем, что неделя передается отдельно
      return calculateWaveProgression(1, weight, reps);
    case 'deload':
      return calculateDeload(weight, reps);
    default:
      return calculateLinearProgression(weight, reps, targetReps);
  }
}
