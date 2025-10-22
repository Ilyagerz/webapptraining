'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
import {
  Award,
  Clock,
  TrendingUp,
  Dumbbell,
  Target,
  Zap,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import { formatDuration, calculateWorkoutVolume } from '@/lib/utils';
import type { Workout, WorkoutRecord, WorkoutExercise } from '@/types';

export default function WorkoutSummaryPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  
  // Получаем ID из URL на клиентской стороне
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setWorkoutId(params.get('workoutId'));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const loadWorkout = async () => {
      if (!workoutId) {
        setLoading(false);
        return;
      }

      try {
        // Загружаем тренировку из Zustand store (localStorage)
        const storedData = typeof window !== 'undefined' ? localStorage.getItem('nubo-training-storage') : null;
        if (storedData) {
          const store = JSON.parse(storedData);
          const workouts = store.state?.workouts || [];
          console.log('🔍 Ищем тренировку ID:', workoutId, 'Всего тренировок:', workouts.length);
          const loadedWorkout = workouts.find((w: Workout) => w.id === workoutId);
          
          if (loadedWorkout) {
            console.log('✅ Workout loaded:', loadedWorkout);
            
            // Преобразуем даты из строк в Date объекты
            const workout = {
              ...loadedWorkout,
              startedAt: new Date(loadedWorkout.startedAt),
              completedAt: loadedWorkout.completedAt ? new Date(loadedWorkout.completedAt) : undefined,
            };
            
            // Вычисляем рекорды
            const records = await calculateRecords(workout);
            
            setWorkout({
              ...workout,
              records,
            });
          } else {
            console.error('❌ Workout not found in store. WorkoutId:', workoutId);
            console.log('Available workouts:', workouts.map((w: any) => ({ id: w.id, name: w.name })));
          }
        }
      } catch (error) {
        console.error('Error loading workout:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [user, workoutId]);

  // Функция для вычисления рекордов
  const calculateRecords = async (completedWorkout: Workout) => {
    const records: WorkoutRecord[] = [];

    try {
      // Загружаем предыдущие тренировки
      const response = await fetch('/api/workouts?limit=50', {
        credentials: 'include',
      });

      if (!response.ok) return records;

      const { workouts: previousWorkouts } = await response.json();

      // Для каждого упражнения проверяем рекорды
      completedWorkout.exercises?.forEach((exercise) => {
        const completedSets = exercise.sets.filter(s => s.completed && !s.isWarmup);
        if (completedSets.length === 0) return;

        // Максимальный вес
        const maxWeight = Math.max(...completedSets.map(s => s.weight || 0));
        
        // Максимальный объем за подход
        const maxVolume = Math.max(...completedSets.map(s => (s.weight || 0) * (s.reps || 0)));

        // Ищем предыдущие тренировки с этим упражнением
        const previousExercises = previousWorkouts
          .filter((w: Workout) => 
            w.id !== completedWorkout.id && 
            w.completedAt &&
            w.exercises?.some(ex => ex.exerciseId === exercise.exerciseId)
          )
          .flatMap((w: Workout) => 
            w.exercises?.filter(ex => ex.exerciseId === exercise.exerciseId) || []
          );

        if (previousExercises.length > 0) {
          // Находим предыдущий максимальный вес
          const previousMaxWeight = Math.max(
            ...previousExercises.flatMap((ex: WorkoutExercise) => 
              ex.sets.filter(s => s.completed && !s.isWarmup).map(s => s.weight || 0)
            )
          );

          // Находим предыдущий максимальный объем
          const previousMaxVolume = Math.max(
            ...previousExercises.flatMap((ex: WorkoutExercise) =>
              ex.sets.filter(s => s.completed && !s.isWarmup).map(s => (s.weight || 0) * (s.reps || 0))
            )
          );

          // Проверяем рекорд по весу
          if (maxWeight > previousMaxWeight) {
            records.push({
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.exercise.name,
              type: 'weight',
              value: maxWeight,
              previousValue: previousMaxWeight,
            });
          }

          // Проверяем рекорд по объему
          if (maxVolume > previousMaxVolume) {
            records.push({
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.exercise.name,
              type: 'volume',
              value: maxVolume,
              previousValue: previousMaxVolume,
            });
          }
        } else {
          // Первая тренировка с этим упражнением - все рекорды!
          records.push({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exercise.name,
            type: 'weight',
            value: maxWeight,
          });
        }
      });
    } catch (error) {
      console.error('Error calculating records:', error);
    }

    return records;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-22 bg-white dark:bg-nubo-dark">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-electric-lime rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-electric-lime rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-electric-lime rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (!workout) {
    console.error('❌ Workout not found for ID:', workoutId);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-22 bg-white dark:bg-nubo-dark p-6">
        <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">Тренировка не найдена</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Не удалось загрузить данные тренировки</p>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-electric-lime text-nubo-dark rounded-xl font-semibold"
        >
          На главную
        </Link>
      </div>
    );
  }

  const hasRecords = workout.records && workout.records.length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-nubo-dark pb-24 pt-22">
      {/* Success Banner */}
      <div className="bg-gradient-to-br from-electric-lime to-green-400 text-nubo-dark safe-top">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
            <CheckCircle2 size={48} className="text-electric-lime" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Отличная работа!</h1>
          <p className="text-lg opacity-90">Тренировка завершена</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Workout Info */}
        <div className="glass-effect rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-1">{workout.name}</h2>
          {workout.templateName && (
            <p className="text-sm text-muted-foreground mb-4">
              Программа: {workout.templateName}
            </p>
          )}

          {/* Main Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-nubo-dark rounded-xl">
              <Clock size={24} className="mx-auto mb-2 text-electric-lime" />
              <div className="text-2xl font-bold">
                {workout.duration ? formatDuration(workout.duration) : '-'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Время</div>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-nubo-dark rounded-xl">
              <TrendingUp size={24} className="mx-auto mb-2 text-electric-lime" />
              <div className="text-2xl font-bold">{workout.totalVolume}</div>
              <div className="text-xs text-muted-foreground mt-1">кг объем</div>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-nubo-dark rounded-xl">
              <Dumbbell size={24} className="mx-auto mb-2 text-electric-lime" />
              <div className="text-2xl font-bold">{workout.totalSets}</div>
              <div className="text-xs text-muted-foreground mt-1">подходов</div>
            </div>
          </div>
        </div>

        {/* Records */}
        {hasRecords && (
          <div className="glass-effect rounded-2xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award size={24} className="text-yellow-500" />
              <h3 className="text-xl font-bold">
                Новые рекорды! ({workout.records!.length})
              </h3>
            </div>

            <div className="space-y-3">
              {workout.records!.map((record, index) => (
                <div
                  key={index}
                  className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Award size={20} className="text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{record.exerciseName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {record.type === 'weight' && 'Максимальный вес'}
                          {record.type === '1rm' && 'Расчетный 1RM'}
                          {record.type === 'volume' && 'Объем'}
                          {record.type === 'reps' && 'Повторения'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
                        {record.value} кг
                      </div>
                      {record.previousValue && (
                        <div className="text-xs text-muted-foreground">
                          было: {record.previousValue} кг
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercises List */}
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 text-black dark:text-white">Выполненные упражнения</h3>

          <div className="space-y-4">
            {(workout.exercises || []).map((exercise, index) => {
              const completedSets = exercise.sets.filter((s) => s.completed);
              const totalExerciseVolume = completedSets.reduce(
                (sum, set) => sum + (set.weight || 0) * (set.reps || 0),
                0
              );

              // Проверяем есть ли рекорд для этого упражнения
              const hasRecord = workout.records?.some(
                (r) => r.exerciseId === exercise.exerciseId
              );

              return (
                <div
                  key={exercise.id}
                  className="p-4 bg-gray-50 dark:bg-nubo-dark rounded-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <h4 className="font-semibold">{exercise.exercise.name}</h4>
                      {hasRecord && (
                        <Award size={16} className="text-yellow-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {totalExerciseVolume} кг
                    </div>
                  </div>

                  <div className="space-y-1">
                    {completedSets.map((set) => (
                      <div
                        key={set.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          Подход {set.setNumber}
                          {set.isWarmup && ' (Разминка)'}
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">
                            {set.weight} кг × {set.reps}
                          </span>
                          {set.rpe && (
                            <span className="text-xs text-muted-foreground">
                              RPE {set.rpe}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights (Placeholder) */}
        <div className="glass-effect rounded-2xl p-6 border-2 border-electric-lime/20">
          <div className="flex items-center space-x-2 mb-3">
            <Zap size={20} className="text-electric-lime" />
            <h3 className="font-bold">AI Анализ</h3>
            <span className="text-xs px-2 py-1 bg-electric-lime/20 text-electric-lime rounded-full">
              SOON
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Скоро здесь появится AI анализ твоей тренировки: рекомендации по прогрессии,
            сравнение с предыдущими тренировками и советы по технике.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full py-4 bg-electric-lime text-nubo-dark text-center rounded-xl font-bold text-lg card-hover"
          >
            Готово
          </Link>

          <button
            onClick={() => {
              // TODO: Share functionality
              alert('Share функция будет доступна скоро!');
            }}
            className="w-full flex items-center justify-center space-x-2 py-3 glass-effect rounded-xl font-medium card-hover"
          >
            <Share2 size={18} />
            <span>Поделиться результатом</span>
          </button>
        </div>
      </div>
    </div>
  );
}

