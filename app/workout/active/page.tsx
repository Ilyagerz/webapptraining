'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Play, Pause, X, Check, Plus, Link2, Save } from 'lucide-react';
import Link from 'next/link';
import { ExerciseCard } from '@/components/ExerciseCard';
import { RestTimer } from '@/components/RestTimer';
import { ExercisePicker } from '@/components/ExercisePicker';
import { generateId, formatDuration } from '@/lib/utils';
import { createSuperset, removeSupersetGroup } from '@/lib/superset-utils';
import type { WorkoutExercise, Exercise, WorkoutTemplate } from '@/types';

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
    addTemplate,
    setRestTimer,
  } = useAppStore();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [hideButtons, setHideButtons] = useState(false);

  // Получаем templateId из URL на клиенте
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setTemplateId(params.get('templateId'));
    }
  }, []);

  // Скрываем кнопки при фокусе на input
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') {
        setHideButtons(true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') {
        setHideButtons(false);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
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
    if (activeWorkout) {
      setWorkoutName(activeWorkout.name || activeWorkout.templateName || 'Новая тренировка');
      
      if (!isPaused) {
        const startTime = new Date(activeWorkout.startedAt).getTime();
        const interval = setInterval(() => {
          setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
      }
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
      restTimer: user?.settings?.restTimerDefault || 90,
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

    // Вычисляем реальную статистику
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    activeWorkout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.completed && !set.isWarmup) {
          totalSets++;
          totalReps += set.reps || 0;
          totalVolume += (set.weight || 0) * (set.reps || 0);
        }
      });
    });

    const workoutData = {
      id: generateId(),
      userId: user.id,
      name: activeWorkout.templateName || activeWorkout.name || 'Тренировка',
      templateId: activeWorkout.templateId,
      templateName: activeWorkout.templateName,
      exercises: activeWorkout.exercises,
      startedAt: activeWorkout.startedAt,
      completedAt: new Date(),
      duration: elapsedTime,
      notes: activeWorkout.notes || '',
      isActive: false,
      totalVolume,
      totalSets,
      totalReps,
    };

    // СНАЧАЛА сохраняем локально (важно!)
    addWorkout(workoutData);
    storeCompleteWorkout();

    // Закрываем таймер отдыха
    setRestTimer(false, 0);

    console.log('✅ Тренировка сохранена локально:', workoutData.id);
    console.log('📊 Статистика:', {
      totalVolume,
      totalSets,
      totalReps,
      exercises: workoutData.exercises.length
    });

    // Пытаемся сохранить на сервер (опционально)
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(workoutData),
      });

      if (response.ok) {
        console.log('✅ Тренировка также сохранена на сервере');
      }
    } catch (error) {
      console.warn('⚠️ Не удалось сохранить на сервер (не критично):', error);
    }

    // Переходим на экран результатов
    router.push(`/workout/summary?workoutId=${workoutData.id}`);
  };

  const handleCancelWorkout = () => {
    const confirm = window.confirm('Отменить тренировку? Прогресс не сохранится.');
    if (confirm) {
      storeCompleteWorkout();
      router.push('/dashboard');
    }
  };

  const handleSaveAsTemplate = () => {
    if (!activeWorkout || !user) return;

    const templateName = prompt('Название шаблона:', workoutName || 'Моя тренировка');
    if (!templateName) return;

    const template: WorkoutTemplate = {
      id: generateId(),
      userId: user.id,
      name: templateName,
      exercises: activeWorkout.exercises.map((we) => ({
        exerciseId: we.exerciseId,
        exercise: we.exercise,
        sets: we.sets.length,
        reps: we.sets[0]?.reps || 0,
        restTimer: we.restTimer,
      })),
      usageCount: 0,
      isSystemTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addTemplate(template);
    alert(`Шаблон "${templateName}" сохранен!`);
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
    <div className="min-h-screen pb-24 pt-4 bg-white dark:bg-nubo-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-nubo-dark border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={handleCancelWorkout} className="text-gray-700 dark:text-white">
              <X size={24} />
            </button>
            <div className="flex-1">
              {isEditingName ? (
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  onBlur={() => {
                    setIsEditingName(false);
                    if (activeWorkout) {
                      updateWorkout({
                        ...activeWorkout,
                        name: workoutName,
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  autoFocus
                  className="text-lg font-bold text-black dark:text-white bg-transparent border-b-2 border-electric-lime focus:outline-none w-full"
                />
              ) : (
                <h1
                  onClick={() => setIsEditingName(true)}
                  className="text-lg font-bold text-black dark:text-white cursor-pointer hover:text-electric-lime"
                >
                  {workoutName}
                </h1>
              )}
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

      {/* Action Buttons */}
      {!hideButtons && (
        <div className="fixed bottom-4 left-0 right-0 p-3 bg-white dark:bg-nubo-dark border-t border-gray-200 dark:border-gray-700 safe-bottom transition-all">
          <div className="flex gap-2 max-w-7xl mx-auto">
            <button
              onClick={handleSaveAsTemplate}
              className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg font-medium text-sm card-hover flex items-center justify-center space-x-1.5"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Сохранить</span>
              <span className="sm:hidden">Шаблон</span>
            </button>
            <button
              onClick={handleCompleteWorkout}
              className="flex-1 py-2.5 bg-electric-lime text-nubo-dark rounded-lg font-bold text-sm card-hover flex items-center justify-center space-x-1.5 shadow-lg"
            >
              <Check size={18} />
              <span>Завершить</span>
            </button>
          </div>
        </div>
      )}

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

