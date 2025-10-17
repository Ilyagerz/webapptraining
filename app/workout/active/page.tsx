'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Play, Pause, X, Check, Plus, Link2 } from 'lucide-react';
import Link from 'next/link';
import { ExerciseCard } from '@/components/ExerciseCard';
import { RestTimer } from '@/components/RestTimer';
import { ExercisePicker } from '@/components/ExercisePicker';
import { generateId, formatDuration } from '@/lib/utils';
import { createSuperset, removeSupersetGroup } from '@/lib/superset-utils';
import type { WorkoutExercise, Exercise } from '@/types';

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string | null>(null);

  const {
    user,
    templates,
    activeWorkout,
    startWorkout,
    updateWorkout,
    completeWorkout: storeCompleteWorkout,
    addWorkout,
  } = useAppStore();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  // Получаем templateId из URL на клиенте
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setTemplateId(params.get('templateId'));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (!activeWorkout && templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        const exercises: WorkoutExercise[] = template.exercises.map((te) => ({
          id: generateId(),
          exerciseId: te.exerciseId,
          exercise: te.exercise,
          sets: Array.from({ length: te.sets }, (_, i) => ({
            id: generateId(),
            setNumber: i + 1,
            reps: te.reps || 0,
            weight: 0,
            completed: false,
            isWarmup: false,
            setType: 'standard' as const,
          })),
          notes: '',
          restTimer: te.restTimer,
        }));

        startWorkout({
          templateId: template.id,
          templateName: template.name,
          exercises,
          startedAt: new Date(),
        });
      }
    } else if (!activeWorkout) {
      // Пустая тренировка
      startWorkout({
        exercises: [],
        startedAt: new Date(),
      });
    }
  }, [user, templateId]);

  useEffect(() => {
    if (activeWorkout && !isPaused) {
      const startTime = new Date(activeWorkout.startedAt).getTime();
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeWorkout, isPaused]);

  const handleAddExercise = (exercise: Exercise) => {
    if (!activeWorkout) return;

    const newExercise: WorkoutExercise = {
      id: generateId(),
      exerciseId: exercise.id,
      exercise,
      sets: [
        {
          id: generateId(),
          setNumber: 1,
          reps: 0,
          weight: 0,
          completed: false,
          isWarmup: false,
          setType: 'standard' as const,
        },
      ],
      notes: '',
      restTimer: 90,
    };

    updateWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newExercise],
    });

    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    if (!activeWorkout) return;

    updateWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.filter(
        (e) => e.exerciseId !== exerciseId
      ),
    });
  };

  const handleUpdateExercise = (
    exerciseId: string,
    updatedExercise: WorkoutExercise
  ) => {
    if (!activeWorkout) return;

    updateWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((e) =>
        e.exerciseId === exerciseId ? updatedExercise : e
      ),
    });
  };

  const handleToggleSuperset = () => {
    if (!activeWorkout || selectedExercises.length !== 2) return;

    const updated = createSuperset(
      activeWorkout.exercises,
      selectedExercises[0],
      selectedExercises[1]
    );

    updateWorkout({
      ...activeWorkout,
      exercises: updated,
    });

    setSelectedExercises([]);
  };

  const handleRemoveSuperset = (supersetId: string) => {
    if (!activeWorkout) return;

    const updated = removeSupersetGroup(activeWorkout.exercises, supersetId);

    updateWorkout({
      ...activeWorkout,
      exercises: updated,
    });
  };

  const handleCompleteWorkout = async () => {
    if (!activeWorkout || !user) return;

    const completedExercises = activeWorkout.exercises.filter((e) =>
      e.sets.some((s) => s.completed)
    );

    if (completedExercises.length === 0) {
      const confirm = window.confirm(
        'Ты не отметил ни одного подхода. Всё равно завершить?'
      );
      if (!confirm) return;
    }

    const workoutData = {
      id: generateId(),
      userId: user.id,
      name: activeWorkout.templateName || 'Тренировка',
      templateId: activeWorkout.templateId,
      templateName: activeWorkout.templateName || 'Тренировка',
      exercises: activeWorkout.exercises,
      startedAt: activeWorkout.startedAt,
      completedAt: new Date(),
      duration: elapsedTime,
      notes: activeWorkout.notes || '',
      isActive: false,
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
    };

    try {
      // Сохранить на сервер
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(workoutData),
      });

      if (!response.ok) {
        throw new Error('Failed to save workout');
      }

      const savedWorkout = await response.json();

      // Также сохраняем локально
      addWorkout(savedWorkout);
      storeCompleteWorkout();

      router.push(`/workout/summary?workoutId=${savedWorkout.id}`);
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Ошибка сохранения тренировки');
    }
  };

  const handleCancelWorkout = () => {
    const confirm = window.confirm('Отменить тренировку? Прогресс не сохранится.');
    if (confirm) {
      storeCompleteWorkout();
      router.push('/dashboard');
    }
  };

  if (!user || !activeWorkout) {
    return null;
  }

  const totalSets = activeWorkout.exercises.reduce(
    (sum, e) => sum + e.sets.length,
    0
  );
  const completedSets = activeWorkout.exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <div className="min-h-screen pb-32 pt-4 bg-white dark:bg-nubo-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-nubo-dark border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={handleCancelWorkout} className="text-gray-700 dark:text-white">
              <X size={24} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-black dark:text-white">
                {activeWorkout.templateName || 'Тренировка'}
              </h1>
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                <span>{formatDuration(elapsedTime)}</span>
                <span>•</span>
                <span>
                  {completedSets}/{totalSets} подходов
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-white"
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
        </div>

        {/* Superset Controls */}
        {selectedExercises.length > 0 && (
          <div className="mt-3 p-3 bg-electric-lime/10 border border-electric-lime rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black dark:text-white">
                {selectedExercises.length === 1
                  ? 'Выбери второе упражнение для суперсета'
                  : 'Создать суперсет?'}
              </span>
              <div className="flex items-center space-x-2">
                {selectedExercises.length === 2 && (
                  <button
                    onClick={handleToggleSuperset}
                    className="px-3 py-1 bg-electric-lime text-nubo-dark rounded-lg text-sm font-semibold"
                  >
                    <Link2 size={16} className="inline mr-1" />
                    Объединить
                  </button>
                )}
                <button
                  onClick={() => setSelectedExercises([])}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-black dark:text-white border border-gray-200 dark:border-gray-600"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exercises */}
      <div className="p-4 space-y-4">
        {activeWorkout.exercises.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Пока нет упражнений
            </p>
            <button
              onClick={() => setShowExercisePicker(true)}
              className="px-6 py-3 bg-electric-lime text-nubo-dark rounded-xl font-semibold card-hover"
            >
              Добавить первое упражнение
            </button>
          </div>
        ) : (
          <>
            {activeWorkout.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.exerciseId}
                exercise={exercise}
                allExercises={activeWorkout.exercises}
                onUpdate={(updated) =>
                  handleUpdateExercise(exercise.exerciseId, updated)
                }
                onRemove={() => handleRemoveExercise(exercise.exerciseId)}
                onRemoveSuperset={handleRemoveSuperset}
                isSelected={selectedExercises.includes(exercise.exerciseId)}
                onToggleSelect={(id) => {
                  if (selectedExercises.includes(id)) {
                    setSelectedExercises(selectedExercises.filter((i) => i !== id));
                  } else if (selectedExercises.length < 2) {
                    setSelectedExercises([...selectedExercises, id]);
                  }
                }}
              />
            ))}

            <button
              onClick={() => setShowExercisePicker(true)}
              className="w-full glass-effect rounded-xl p-4 flex items-center justify-center space-x-2 card-hover"
            >
              <Plus size={20} />
              <span className="font-medium">Добавить упражнение</span>
            </button>
          </>
        )}
      </div>

      {/* Complete Button */}
      <div className="fixed bottom-4 left-0 right-0 p-4 bg-white dark:bg-nubo-dark border-t border-gray-200 dark:border-gray-700 safe-bottom">
        <button
          onClick={handleCompleteWorkout}
          className="w-full py-4 bg-electric-lime text-nubo-dark rounded-xl font-bold text-lg card-hover flex items-center justify-center space-x-2 shadow-lg"
        >
          <Check size={24} />
          <span>Завершить тренировку</span>
        </button>
      </div>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <ExercisePicker
          onSelect={handleAddExercise}
          onClose={() => setShowExercisePicker(false)}
        />
      )}

      {/* Rest Timer */}
      <RestTimer />
    </div>
  );
}

