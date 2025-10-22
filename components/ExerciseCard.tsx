'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  MoreVertical,
  Info,
  Link2,
  Unlink,
  Timer,
  Zap,
} from 'lucide-react';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { AMRAPTimer } from './AMRAPTimer';
import { EMOMTimer } from './EMOMTimer';
import { SupersetIndicator } from './SupersetIndicator';
import { getSupersetColor, getSupersetPosition } from '@/lib/superset-utils';
import { generateId } from '@/lib/utils';
import type { WorkoutExercise, WorkoutSet, PreviousSetData } from '@/types';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  allExercises: WorkoutExercise[];
  onUpdate: (exercise: WorkoutExercise) => void;
  onRemove: () => void;
  onRemoveSuperset?: (supersetId: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (exerciseId: string) => void;
}

export function ExerciseCard({
  exercise,
  allExercises,
  onUpdate,
  onRemove,
  onRemoveSuperset,
  isSelected,
  onToggleSelect,
}: ExerciseCardProps) {
  const { startRestTimer } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAMRAPTimer, setShowAMRAPTimer] = useState(false);
  const [showEMOMTimer, setShowEMOMTimer] = useState(false);
  const [activeSetIndex, setActiveSetIndex] = useState<number | null>(null);
  const [previousData, setPreviousData] = useState<PreviousSetData[]>([]);

  // Загрузка предыдущих данных
  useEffect(() => {
    const fetchPreviousData = async () => {
      try {
        const response = await fetch(
          `/api/workouts/exercise/${exercise.exerciseId}?limit=1`,
          {
            credentials: 'include',
          }
        );

        if (response.ok) {
          const workouts = await response.json();
          if (workouts.length > 0) {
            const lastWorkout = workouts[0];
            const exerciseData = lastWorkout.exercises.find(
              (e: any) => e.exerciseId === exercise.exerciseId
            );

            if (exerciseData && exerciseData.sets) {
              const prevSets: PreviousSetData[] = exerciseData.sets.map(
                (set: any) => ({
                  weight: set.weight,
                  reps: set.reps,
                })
              );
              setPreviousData(prevSets);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching previous workout data:', error);
      }
      
      // FALLBACK: Загрузка из localStorage
      try {
        const storeData = typeof window !== 'undefined' ? localStorage.getItem('nubo-training-storage') : null;
        if (!storeData) return;

        const { state } = JSON.parse(storeData);
        const workouts = state.workouts || [];

        // Находим последнюю завершенную тренировку с этим упражнением
        const relevantWorkouts = workouts
          .filter((w: any) => 
            w.completedAt && 
            w.exercises?.some((e: any) => e.exerciseId === exercise.exerciseId)
          )
          .sort((a: any, b: any) => 
            new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
          );

        if (relevantWorkouts.length > 0) {
          const lastWorkout = relevantWorkouts[0];
          const exerciseData = lastWorkout.exercises.find(
            (e: any) => e.exerciseId === exercise.exerciseId
          );

          if (exerciseData && exerciseData.sets) {
            const prevSets: PreviousSetData[] = exerciseData.sets
              .filter((s: any) => s.completed && !s.isWarmup)
              .map((set: any) => ({
                weight: set.weight || 0,
                reps: set.reps || 0,
              }));
            
            if (prevSets.length > 0) {
              console.log(`📊 ${exercise.exercise.name}: Найдено ${prevSets.length} подходов из прошлого раза`);
              setPreviousData(prevSets);
            }
          }
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    };

    fetchPreviousData();
  }, [exercise.exerciseId]);

  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;
  const supersetColor = exercise.superset ? getSupersetColor(exercise.superset) : '';
  const supersetPosition = exercise.superset ? getSupersetPosition(exercise) : null;

  const addSet = (setType: 'standard' | 'amrap' | 'emom' = 'standard') => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: WorkoutSet = {
      id: generateId(),
      setNumber: exercise.sets.length + 1,
      reps: lastSet?.reps || 0,
      weight: lastSet?.weight || 0,
      completed: false,
      isWarmup: false,
      setType,
      targetTime: setType === 'amrap' ? 60 : setType === 'emom' ? 60 : undefined,
    };

    onUpdate({
      ...exercise,
      sets: [...exercise.sets, newSet],
    });
  };

  const removeSet = (index: number) => {
    if (exercise.sets.length === 1) return;

    onUpdate({
      ...exercise,
      sets: exercise.sets.filter((_, i) => i !== index),
    });
  };

  const updateSet = (index: number, updates: Partial<WorkoutSet>) => {
    const updatedSets = exercise.sets.map((set, i) =>
      i === index ? { ...set, ...updates } : set
    );

    onUpdate({
      ...exercise,
      sets: updatedSets,
    });
  };

  const toggleSetComplete = (index: number) => {
    const set = exercise.sets[index];
    const wasCompleted = set.completed;

    updateSet(index, { completed: !wasCompleted });

    // Запустить таймер отдыха если подход завершен
    if (!wasCompleted && exercise.restTimer) {
      startRestTimer(exercise.restTimer);
    }
  };

  const handleAMRAPComplete = (reps: number, actualTime: number) => {
    if (activeSetIndex !== null) {
      updateSet(activeSetIndex, {
        reps,
        actualTime,
        completed: true,
      });

      if (exercise.restTimer) {
        startRestTimer(exercise.restTimer);
      }
    }

    setShowAMRAPTimer(false);
    setActiveSetIndex(null);
  };

  const handleEMOMComplete = () => {
    if (activeSetIndex !== null) {
      updateSet(activeSetIndex, {
        completed: true,
      });

      if (exercise.restTimer) {
        startRestTimer(exercise.restTimer);
      }
    }

    setShowEMOMTimer(false);
    setActiveSetIndex(null);
  };

  const startAMRAP = (index: number) => {
    setActiveSetIndex(index);
    setShowAMRAPTimer(true);
  };

  const startEMOM = (index: number) => {
    setActiveSetIndex(index);
    setShowEMOMTimer(true);
  };

  return (
    <div
      className={`glass-effect rounded-xl overflow-hidden transition-all ${
        isSelected ? 'ring-2 ring-electric-lime' : ''
      }`}
    >
      {/* Superset Indicator */}
      {exercise.superset && (
        <SupersetIndicator exercise={exercise} />
      )}

      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-black dark:text-white">{exercise.exercise.name}</h3>
              {onToggleSelect && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(exercise.exerciseId);
                  }}
                  className={`p-1 rounded ${
                    isSelected
                      ? 'bg-electric-lime text-nubo-dark'
                      : 'hover:bg-muted/20'
                  }`}
                >
                  <Link2 size={16} />
                </button>
              )}
            </div>
            <p className="text-sm text-black dark:text-white">
              {exercise.exercise.muscleGroup}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-black dark:text-white">
                {completedSets}/{totalSets} подходов
              </span>
              {exercise.superset && onRemoveSuperset && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSuperset(exercise.superset!);
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  <Unlink size={14} className="inline" /> Разделить
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailModal(true);
              }}
              className="p-2 hover:bg-muted/20 rounded-lg"
            >
              <Info size={18} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 hover:bg-muted/20 rounded-lg"
              >
                <MoreVertical size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-nubo-dark border border-border rounded-lg shadow-lg overflow-hidden z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addSet('amrap');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-muted/20 flex items-center space-x-2"
                  >
                    <Zap size={16} />
                    <span>AMRAP подход</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addSet('emom');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-muted/20 flex items-center space-x-2"
                  >
                    <Timer size={16} />
                    <span>EMOM подход</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-red-500/10 text-red-500 flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Удалить</span>
                  </button>
                </div>
              )}
            </div>

            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Sets Table */}
      {isExpanded && (
        <div className="border-t border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-black dark:text-white border-b border-border/50">
                  <th className="px-2 py-2 text-left">Подход</th>
                  <th className="px-2 py-2 text-center">Пред.</th>
                  <th className="px-2 py-2 text-center">Вес (кг)</th>
                  <th className="px-2 py-2 text-center">Повт.</th>
                  <th className="px-2 py-2 text-center">RPE</th>
                  <th className="px-2 py-2 text-center">✓</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set, index) => {
                  const prevSet = previousData[index];

                  return (
                    <tr
                      key={index}
                      className={`border-b border-border/30 last:border-0 ${
                        set.completed ? 'bg-green-500/5' : ''
                      }`}
                    >
                      <td className="px-2 py-2 text-sm font-medium">
                        {index + 1}
                        {set.setType === 'amrap' && (
                          <Zap size={12} className="inline ml-1 text-orange-500" />
                        )}
                        {set.setType === 'emom' && (
                          <Timer size={12} className="inline ml-1 text-blue-500" />
                        )}
                      </td>

                      <td className="px-2 py-2 text-center text-xs text-muted-foreground">
                        {prevSet ? (
                          <div>
                            <div>{prevSet.weight}кг</div>
                            <div>×{prevSet.reps}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="px-2 py-2">
                        {set.setType === 'standard' ? (
                          <input
                            type="number"
                            value={set.weight || ''}
                            onChange={(e) =>
                              updateSet(index, {
                                weight: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder={previousData[index]?.weight ? String(previousData[index].weight) : ''}
                            className="w-16 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none text-center text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            step="0.5"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>

                      <td className="px-2 py-2">
                        {set.setType === 'standard' ? (
                          <input
                            type="number"
                            value={set.reps || ''}
                            onChange={(e) =>
                              updateSet(index, {
                                reps: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder={previousData[index]?.reps ? String(previousData[index].reps) : ''}
                            className="w-16 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none text-center text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                          />
                        ) : set.completed ? (
                          <span className="text-sm">{set.reps || 0}</span>
                        ) : (
                          <button
                            onClick={() => {
                              if (set.setType === 'amrap') {
                                startAMRAP(index);
                              } else if (set.setType === 'emom') {
                                startEMOM(index);
                              }
                            }}
                            className="px-3 py-1 bg-electric-lime text-nubo-dark rounded text-xs font-semibold"
                          >
                            Старт
                          </button>
                        )}
                      </td>

                      {/* RPE Column */}
                      <td className="px-2 py-2">
                        {set.completed ? (
                          <input
                            type="number"
                            value={set.rpe || ''}
                            onChange={(e) =>
                              updateSet(index, {
                                rpe: parseInt(e.target.value) || undefined,
                              })
                            }
                            placeholder="-"
                            min="1"
                            max="10"
                            className="w-12 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none text-center text-sm text-black dark:text-white"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>

                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={set.completed}
                          onChange={() => toggleSetComplete(index)}
                          className="w-5 h-5 rounded accent-electric-lime cursor-pointer"
                        />
                      </td>

                      <td className="px-2 py-2">
                        {exercise.sets.length > 1 && (
                          <button
                            onClick={() => removeSet(index)}
                            className="p-1 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Set Button */}
          <div className="p-2">
            <button
              onClick={() => addSet('standard')}
              className="w-full py-2 glass-effect rounded-lg flex items-center justify-center space-x-2 hover:bg-muted/20"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">Добавить подход</span>
            </button>
          </div>

          {/* Notes */}
          <div className="p-3 border-t border-border/50">
            <textarea
              value={exercise.notes || ''}
              onChange={(e) =>
                onUpdate({
                  ...exercise,
                  notes: e.target.value,
                })
              }
              placeholder="Заметки..."
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none resize-none text-sm text-black dark:text-white"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {showDetailModal && (
        <ExerciseDetailModal
          exercise={exercise.exercise}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showAMRAPTimer && activeSetIndex !== null && (
        <AMRAPTimer
          targetTime={exercise.sets[activeSetIndex].targetTime || 60}
          onComplete={handleAMRAPComplete}
          onClose={() => {
            setShowAMRAPTimer(false);
            setActiveSetIndex(null);
          }}
        />
      )}

      {showEMOMTimer && activeSetIndex !== null && (
        <EMOMTimer
          rounds={exercise.sets[activeSetIndex].reps || 5}
          intervalSeconds={exercise.sets[activeSetIndex].targetTime || 60}
          onComplete={handleEMOMComplete}
          onClose={() => {
            setShowEMOMTimer(false);
            setActiveSetIndex(null);
          }}
        />
      )}
    </div>
  );
}

