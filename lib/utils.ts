// Утилиты для приложения NUBO Training
import type { Workout, WorkoutExercise, WorkoutSet } from '@/types';

export function cn(...inputs: any[]) {
  // Simple className merger without external deps
  return inputs.filter(Boolean).join(' ');
}

// Форматирование времени
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  if (minutes > 0) {
    return `${minutes}м ${secs}с`;
  }
  return `${secs}с`;
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Расчет объема тренировки
export function calculateWorkoutVolume(workout: Workout): number {
  let volume = 0;
  
  workout.exercises.forEach(exercise => {
    exercise.sets.forEach(set => {
      if (set.completed && set.weight && set.reps) {
        volume += set.weight * set.reps;
      }
    });
  });
  
  return Math.round(volume);
}

// Расчет общего количества подходов
export function calculateTotalSets(workout: Workout): number {
  return workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.filter(set => set.completed).length;
  }, 0);
}

// Расчет общего количества повторений
export function calculateTotalReps(workout: Workout): number {
  return workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((setTotal, set) => {
      return setTotal + (set.completed && set.reps ? set.reps : 0);
    }, 0);
  }, 0);
}

// Расчет 1RM по формуле Brzycki
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (36 / (37 - reps)));
}

// Расчет 1RM по формуле Epley
export function calculate1RMEpley(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

// Расчет процента от 1RM
export function calculatePercentOf1RM(weight: number, oneRM: number): number {
  return Math.round((weight / oneRM) * 100);
}

// Генерация ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Форматирование даты
export function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateStr = date.toDateString();
  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();
  
  if (dateStr === todayStr) return 'Сегодня';
  if (dateStr === yesterdayStr) return 'Вчера';
  
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

// Проверка, является ли упражнение новым рекордом
export function isNewRecord(
  currentSet: WorkoutSet,
  previousBest: { weight?: number; reps?: number; volume?: number }
): boolean {
  if (!currentSet.weight || !currentSet.reps) return false;
  
  const currentVolume = currentSet.weight * currentSet.reps;
  const current1RM = calculate1RM(currentSet.weight, currentSet.reps);
  
  if (previousBest.weight && currentSet.weight > previousBest.weight) return true;
  if (previousBest.volume && currentVolume > previousBest.volume) return true;
  
  // Проверяем 1RM если есть данные
  if (previousBest.weight && previousBest.reps) {
    const previous1RM = calculate1RM(previousBest.weight, previousBest.reps);
    if (current1RM > previous1RM) return true;
  }
  
  return false;
}

// Плейт калькулятор
export interface PlateConfiguration {
  barWeight: number;
  plates: Array<{ weight: number; count: number }>;
  totalWeight: number;
}

export function calculatePlates(
  targetWeight: number,
  barWeight: number = 20,
  availablePlates: number[] = [25, 20, 15, 10, 5, 2.5, 1.25]
): PlateConfiguration {
  const weightPerSide = (targetWeight - barWeight) / 2;
  const plates: Array<{ weight: number; count: number }> = [];
  
  let remaining = weightPerSide;
  
  for (const plate of availablePlates) {
    if (remaining >= plate) {
      const count = Math.floor(remaining / plate);
      plates.push({ weight: plate, count });
      remaining -= plate * count;
    }
  }
  
  const actualTotal = barWeight + plates.reduce((sum, p) => sum + p.weight * p.count * 2, 0);
  
  return {
    barWeight,
    plates,
    totalWeight: actualTotal,
  };
}

// Вибрация (если поддерживается)
export function vibrate(pattern: number | number[] = 200): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// Воспроизведение звука
export function playSound(type: 'complete' | 'timer' | 'record' = 'complete'): void {
  if (typeof window === 'undefined') return;
  
  const context = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  if (type === 'complete') {
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.15);
  } else if (type === 'timer') {
    oscillator.frequency.value = 440;
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  } else if (type === 'record') {
    // Два быстрых звука для рекорда
    oscillator.frequency.value = 1000;
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.setValueAtTime(0, context.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, context.currentTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
  }
}

// Получение недель для графика
export function getWeeksData(workouts: Workout[], daysCount: number = 7): Array<{ day: string; workouts: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const days: Array<{ day: string; workouts: number }> = [];
  
  // Создаем массив последних daysCount дней
  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const dayOfWeek = date.getDay();
    const dayName = dayNames[dayOfWeek];
    
    // Подсчитываем тренировки в этот день
    const workoutCount = workouts.filter(workout => {
      const workoutDate = new Date(workout.completedAt || workout.startedAt);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === date.getTime();
    }).length;
    
    days.push({
      day: dayName,
      workouts: workoutCount
    });
  }
  
  return days;
}

// Описание RPE
export const RPE_DESCRIPTIONS: Record<number, string> = {
  1: 'Очень легко',
  2: 'Легко',
  3: 'Умеренно легко',
  4: 'Средне легко',
  5: 'Средне',
  6: 'Средне тяжело',
  7: 'Тяжело',
  8: 'Очень тяжело (2-3 повтора в запасе)',
  9: 'Максимально тяжело (1 повтор в запасе)',
  10: 'Максимум (0 повторов в запасе)',
};



