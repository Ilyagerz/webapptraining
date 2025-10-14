'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  ArrowLeft,
  Plus,
  Timer,
  Check,
  X,
  MoreVertical,
  Trophy,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { formatTime, calculateWorkoutVolume, vibrate, playSound } from '@/lib/utils';
import { ExerciseCard } from '@/components/ExerciseCard';
import { RestTimer } from '@/components/RestTimer';
import { ExercisePicker } from '@/components/ExercisePicker';
import { createSuperset, removeSupersetGroup } from '@/lib/superset-utils';

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const {
    user,
    activeWorkout,
    updateActiveWorkout,
    setActiveWorkout,
    restTimerActive,
    setRestTimer,
  } = useAppStore();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [selectedForSuperset, setSelectedForSuperset] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!user || !activeWorkout) {
      router.push('/dashboard');
      return;
    }

    // Секундомер тренировки
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000
      );
      setElapsedTime(elapsed);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user, activeWorkout]);

  if (!user || !activeWorkout) {
    return null;
  }

  const handleFinishWorkout = async () => {
    // Проверяем невыполненные подходы
    const hasIncomplete = activeWorkout.exercises.some(ex =>
      ex.sets.some(set => !set.completed)
    );

    if (hasIncomplete) {
      setShowFinishDialog(true);
      return;
    }

    completeWorkout();
  };

  const completeWorkout = async () => {
    const totalVolume = calculateWorkoutVolume(activeWorkout);
    const totalSets = activeWorkout.exercises.reduce((sum, ex) =>
      sum + ex.sets.filter(s => s.completed).length, 0
    );
    const totalReps = activeWorkout.exercises.reduce((sum, ex) =>
      sum + ex.sets.reduce((rSum, s) => rSum + (s.completed ? (s.reps || 0) : 0), 0), 0
    );

    const completedWorkout = {
      ...activeWorkout,
      completedAt: new Date(),
      duration: elapsedTime,
      totalVolume,
      totalSets,
      totalReps,
      isActive: false,
    };

    try {
      // Сохраняем тренировку на сервер
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(completedWorkout),
      });

      if (!response.ok) {
        throw new Error('Failed to save workout');
      }

      console.log('✅ Тренировка сохранена');
    } catch (error) {
      console.error('Ошибка сохранения тренировки:', error);
      // Продолжаем даже если не удалось сохранить
    }

    setActiveWorkout(null);
    router.push(`/workout/summary?id=${completedWorkout.id}`);
  };

  const handleCancelWorkout = () => {
    if (confirm('Отменить тренировку? Все данные будут потеряны.')) {
      setActiveWorkout(null);
      router.push('/dashboard');
    }
  };

  const handleSuperset = (exerciseId: string) => {
    if (selectedForSuperset.includes(exerciseId)) {
      // Deselect
      setSelectedForSuperset((prev) => prev.filter((id) => id !== exerciseId));
    } else {
      // Select
      const newSelected = [...selectedForSuperset, exerciseId];
      setSelectedForSuperset(newSelected);

      // If 2 or more selected, create superset
      if (newSelected.length >= 2) {
        const selectedExercises = activeWorkout.exercises.filter((ex) =>
          newSelected.includes(ex.id)
        );
        const withSuperset = createSuperset(selectedExercises);
        
        const updatedExercises = activeWorkout.exercises.map((ex) => {
          const updated = withSuperset.find((s) => s.id === ex.id);
          return updated || ex;
        });

        updateActiveWorkout({ exercises: updatedExercises });
        setSelectedForSuperset([]);
      }
    }
  };

  const handleRemoveSuperset = (supersetId: string) => {
    const updatedExercises = removeSupersetGroup(activeWorkout.exercises, supersetId);
    updateActiveWorkout({ exercises: updatedExercises });
  };

  const handleSetComplete = (exerciseId: string, setId: string) => {
    const updatedExercises = activeWorkout.exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set => {
            if (set.id === setId && !set.completed) {
              vibrate();
              playSound('complete');
              
              // Запуск таймера отдыха
              const restTime = ex.restTimer || user.settings.restTimerDefault || 90;
              if (user.settings.autoStartTimer) {
                setRestTimer(true, restTime);
              }
              
              return { ...set, completed: true, completedAt: new Date() };
            }
            return set;
          }),
        };
      }
      return ex;
    });

    updateActiveWorkout({ exercises: updatedExercises });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-nubo-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-nubo-dark border-b border-gray-200 dark:border-gray-800 safe-top z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <button
                onClick={handleCancelWorkout}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-nubo-gray"
              >
                <X size={24} />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full recording-indicator" />
                  <span className="text-sm font-medium">Идёт тренировка</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock size={14} />
                  <span>{formatTime(elapsedTime)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleFinishWorkout}
              className="px-6 py-2 bg-electric-lime text-nubo-dark rounded-xl font-medium card-hover"
            >
              Закончить
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Workout Name */}
        <div className="glass-effect rounded-xl p-4">
          <input
            type="text"
            value={activeWorkout.name}
            onChange={(e) => updateActiveWorkout({ name: e.target.value })}
            className="w-full bg-transparent text-xl font-bold focus:outline-none"
            placeholder="Название тренировки"
          />
        </div>

        {/* Exercises */}
        {activeWorkout.exercises.length === 0 ? (
          <div className="glass-effect rounded-xl p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Добавь упражнения чтобы начать
            </p>
            <button
              onClick={() => setShowExercisePicker(true)}
              className="inline-flex items-center px-6 py-3 bg-nubo-dark dark:bg-white text-white dark:text-nubo-dark rounded-xl font-medium card-hover"
            >
              <Plus size={18} className="mr-2" />
              Добавить упражнение
            </button>
          </div>
        ) : (
              <div className="space-y-4">
                {activeWorkout.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="relative">
                    {/* Superset Label */}
                    {exercise.superset && 
                     index > 0 && 
                     activeWorkout.exercises[index - 1].superset === exercise.superset && (
                      <div className="flex items-center justify-center my-2">
                        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-electric-lime/20 text-electric-lime text-xs font-medium">
                          <span>↕</span>
                          <span>Выполняй поочередно</span>
                        </div>
                      </div>
                    )}
                    
                    <ExerciseCard
                      exercise={exercise}
                      exerciseNumber={index + 1}
                      allExercises={activeWorkout.exercises}
                      onSetComplete={handleSetComplete}
                      onUpdate={(updated) => {
                        const updatedExercises = [...activeWorkout.exercises];
                        updatedExercises[index] = updated;
                        updateActiveWorkout({ exercises: updatedExercises });
                      }}
                      onDelete={() => {
                        const updatedExercises = activeWorkout.exercises.filter(
                          (_, i) => i !== index
                        );
                        updateActiveWorkout({ exercises: updatedExercises });
                      }}
                      onSuperset={() => handleSuperset(exercise.id)}
                    />

                    {/* Superset Remove Button */}
                    {exercise.superset && 
                     index === activeWorkout.exercises.findIndex((e) => e.superset === exercise.superset) && (
                      <button
                        onClick={() => handleRemoveSuperset(exercise.superset!)}
                        className="absolute -top-2 -right-2 z-10 p-1.5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
          </div>
        )}

        {/* Add Exercise Button */}
        <button
          onClick={() => setShowExercisePicker(true)}
          className="w-full glass-effect rounded-xl p-4 flex items-center justify-center space-x-2 card-hover"
        >
          <Plus size={20} />
          <span className="font-medium">Добавить упражнение</span>
        </button>
      </div>

      {/* Rest Timer */}
      {restTimerActive && <RestTimer />}

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <ExercisePicker
          onSelect={(exercise) => {
                const newExercise = {
                  id: `ex-${Date.now()}`,
                  exerciseId: exercise.id,
                  exercise,
                  sets: [
                    {
                      id: `set-${Date.now()}`,
                      setNumber: 1,
                      isWarmup: false,
                      completed: false,
                      setType: 'standard' as const,
                    },
                  ],
                };

            updateActiveWorkout({
              exercises: [...activeWorkout.exercises, newExercise],
            });
            setShowExercisePicker(false);
          }}
          onClose={() => setShowExercisePicker(false)}
        />
      )}

      {/* Finish Dialog */}
      {showFinishDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-nubo-gray rounded-2xl p-6 max-w-md w-full animate-slide-up">
            <h3 className="text-xl font-bold mb-2">Завершить тренировку?</h3>
            <p className="text-muted-foreground mb-6">
              У тебя есть невыполненные подходы. Что делать с ними?
            </p>
            <div className="space-y-3">
              <button
                onClick={completeWorkout}
                className="w-full py-3 bg-electric-lime text-nubo-dark rounded-xl font-medium card-hover"
              >
                Завершить как есть
              </button>
              <button
                onClick={() => setShowFinishDialog(false)}
                className="w-full py-3 glass-effect rounded-xl font-medium card-hover"
              >
                Продолжить тренировку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




