'use client';

import { useState, useEffect } from 'react';
import { WorkoutExercise, WorkoutSet, SetType } from '@/types';
import { Plus, Trash2, Info, TrendingUp, Award, Timer, Zap, Link2 } from 'lucide-react';
import { RPE_DESCRIPTIONS } from '@/lib/utils';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { AMRAPTimer } from './AMRAPTimer';
import { EMOMTimer } from './EMOMTimer';
import { SupersetIndicator } from './SupersetIndicator';
import { getSupersetColor, getSupersetPosition } from '@/lib/superset-utils';

interface PreviousSetData {
  weight?: number;
  reps?: number;
}

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseNumber: number;
  allExercises: WorkoutExercise[];
  onSetComplete: (exerciseId: string, setId: string) => void;
  onUpdate: (exercise: WorkoutExercise) => void;
  onDelete: () => void;
  onSuperset?: () => void;
}

export function ExerciseCard({
  exercise,
  exerciseNumber,
  allExercises,
  onSetComplete,
  onUpdate,
  onDelete,
  onSuperset,
}: ExerciseCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [showAMRAP, setShowAMRAP] = useState(false);
  const [showEMOM, setShowEMOM] = useState(false);
  const [selectedSetForSpecial, setSelectedSetForSpecial] = useState<string | null>(null);
  const [previousSets, setPreviousSets] = useState<PreviousSetData[]>([]);

  const addSet = (setType: SetType = 'standard') => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: WorkoutSet = {
      id: `set-${Date.now()}`,
      setNumber: exercise.sets.length + 1,
      weight: lastSet?.weight,
      reps: lastSet?.reps,
      isWarmup: false,
      completed: false,
      setType,
      targetTime: setType === 'amrap' ? 60 : setType === 'emom' ? 60 : undefined,
    };

    onUpdate({
      ...exercise,
      sets: [...exercise.sets, newSet],
    });
  };

  const handleAMRAPComplete = (setId: string, time: number, reps: number) => {
    updateSet(setId, {
      actualTime: time,
      reps,
      completed: true,
      completedAt: new Date(),
    });
    setShowAMRAP(false);
    setSelectedSetForSpecial(null);
  };

  const handleEMOMComplete = (setId: string, completedRounds: number) => {
    updateSet(setId, {
      reps: completedRounds,
      completed: true,
      completedAt: new Date(),
    });
    setShowEMOM(false);
    setSelectedSetForSpecial(null);
  };

  const updateSet = (setId: string, updates: Partial<WorkoutSet>) => {
    onUpdate({
      ...exercise,
      sets: exercise.sets.map(set =>
        set.id === setId ? { ...set, ...updates } : set
      ),
    });
  };

  const deleteSet = (setId: string) => {
    if (exercise.sets.length === 1) return; // Минимум 1 подход
    
    onUpdate({
      ...exercise,
      sets: exercise.sets
        .filter(set => set.id !== setId)
        .map((set, index) => ({ ...set, setNumber: index + 1 })),
    });
  };

  const supersetPosition = getSupersetPosition(exercise, allExercises);
  const supersetColor = getSupersetColor(exercise.superset);

  // Загрузка предыдущей тренировки
  useEffect(() => {
    const loadPreviousWorkout = async () => {
      try {
        const response = await fetch(`/api/workouts/exercise/${exercise.exerciseId}?limit=1`, {
          credentials: 'include',
        });

        if (response.ok) {
          const { history } = await response.json();
          
          if (history && history.length > 0 && history[0].exercise) {
            const prevExercise = history[0].exercise;
            const prevSetsData = prevExercise.sets
              .filter((s: WorkoutSet) => s.completed && !s.isWarmup)
              .map((s: WorkoutSet) => ({
                weight: s.weight,
                reps: s.reps,
              }));
            
            setPreviousSets(prevSetsData);
          }
        }
      } catch (error) {
        console.error('Error loading previous workout:', error);
      }
    };

    loadPreviousWorkout();
  }, [exercise.exerciseId]);

  return (
    <div className={`glass-effect rounded-xl overflow-hidden card-shadow relative ${
      exercise.superset ? 'ml-3' : ''
    }`}>
      {/* Superset Indicator */}
      {exercise.superset && supersetPosition && (
        <SupersetIndicator
          supersetId={exercise.superset}
          color={supersetColor}
          position={supersetPosition}
        />
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                #{exerciseNumber}
              </span>
              <h3 className="text-lg font-bold">{exercise.exercise.name}</h3>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-nubo-gray"
              >
                <Info size={16} className="text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {exercise.exercise.muscleGroup} • {exercise.exercise.equipment.join(', ')}
            </p>
          </div>
            <div className="flex items-center space-x-2">
              {onSuperset && !exercise.superset && (
                <button
                  onClick={onSuperset}
                  className="p-2 rounded-full hover:bg-electric-lime/20 text-electric-lime"
                  title="Создать суперсет"
                >
                  <Link2 size={18} />
                </button>
              )}
              <button
                onClick={onDelete}
                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
        </div>

      </div>

      {/* Sets Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted-foreground border-b border-gray-200 dark:border-gray-800">
              <th className="py-2 px-2 text-center w-12">Сет</th>
              <th className="py-2 px-2 text-left">Пред.</th>
              <th className="py-2 px-2 text-center">Вес (кг)</th>
              <th className="py-2 px-2 text-center">Повт.</th>
              <th className="py-2 px-2 text-center">RPE</th>
              <th className="py-2 px-2 text-center w-12">✓</th>
            </tr>
          </thead>
          <tbody>
            {exercise.sets.map((set, index) => {
              // Special rendering for AMRAP/EMOM
              if (set.setType === 'amrap' || set.setType === 'emom') {
                return (
                  <tr key={set.id} className={`border-b border-gray-200 dark:border-gray-800 ${set.completed ? 'opacity-60' : ''}`}>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span className="font-medium">{set.setNumber}</span>
                        {set.setType === 'amrap' ? (
                          <Timer size={12} className="text-electric-lime" />
                        ) : (
                          <Zap size={12} className="text-electric-lime" />
                        )}
                      </div>
                    </td>
                    <td colSpan={5} className="py-3 px-2">
                      {set.completed ? (
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-electric-lime">
                            {set.setType === 'amrap' ? 'AMRAP' : 'EMOM'}
                          </span>
                          <div className="flex items-center space-x-4">
                            <span>{set.reps} {set.setType === 'amrap' ? 'повторов' : 'раундов'}</span>
                            {set.actualTime && <span className="text-muted-foreground">{Math.floor(set.actualTime / 60)}:{(set.actualTime % 60).toString().padStart(2, '0')}</span>}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedSetForSpecial(set.id);
                            if (set.setType === 'amrap') {
                              setShowAMRAP(true);
                            } else {
                              setShowEMOM(true);
                            }
                          }}
                          className="w-full py-2 px-4 bg-electric-lime/10 hover:bg-electric-lime/20 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                        >
                          {set.setType === 'amrap' ? <Timer size={16} /> : <Zap size={16} />}
                          <span className="font-medium">
                            Начать {set.setType === 'amrap' ? 'AMRAP' : 'EMOM'}
                          </span>
                          <span className="text-sm text-muted-foreground">({set.targetTime || 60}сек)</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }

              // Standard set rendering
              return (
                <tr
                  key={set.id}
                  className={`border-b border-gray-200 dark:border-gray-800 ${
                    set.completed ? 'opacity-60' : ''
                  }`}
                >
                  {/* Set Number */}
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span className="font-medium">{set.setNumber}</span>
                      {set.isWarmup && (
                        <span className="text-xs text-orange-500">W</span>
                      )}
                    </div>
                  </td>

                    {/* Previous */}
                    <td className="py-3 px-2 text-xs text-muted-foreground">
                      {previousSets[index] ? (
                        <div className="flex flex-col">
                          <span>{previousSets[index].weight}кг</span>
                          <span className="text-[10px]">×{previousSets[index].reps}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>

                  {/* Weight */}
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={set.weight || ''}
                      onChange={(e) =>
                        updateSet(set.id, {
                          weight: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      disabled={set.completed}
                      className="w-full px-2 py-1 text-center rounded bg-transparent border border-gray-300 dark:border-gray-600 focus:border-electric-lime focus:outline-none disabled:opacity-50"
                      placeholder="0"
                    />
                  </td>

                  {/* Reps */}
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={set.reps || ''}
                      onChange={(e) =>
                        updateSet(set.id, {
                          reps: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      disabled={set.completed}
                      className="w-full px-2 py-1 text-center rounded bg-transparent border border-gray-300 dark:border-gray-600 focus:border-electric-lime focus:outline-none disabled:opacity-50"
                      placeholder="0"
                    />
                  </td>

                  {/* RPE */}
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={set.rpe || ''}
                      onChange={(e) =>
                        updateSet(set.id, {
                          rpe: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      disabled={set.completed}
                      className="w-full px-2 py-1 text-center rounded bg-transparent border border-gray-300 dark:border-gray-600 focus:border-electric-lime focus:outline-none disabled:opacity-50"
                      placeholder="-"
                    />
                  </td>

                  {/* Checkbox */}
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => !set.completed && onSetComplete(exercise.id, set.id)}
                      disabled={set.completed || !set.weight || !set.reps}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        set.completed
                          ? 'bg-electric-lime border-electric-lime'
                          : 'border-gray-300 dark:border-gray-600 hover:border-electric-lime'
                      } disabled:opacity-30`}
                    >
                      {set.completed && (
                        <span className="text-nubo-dark font-bold">✓</span>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Set Button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <button
          onClick={() => addSet('standard')}
          className="w-full py-2 flex items-center justify-center space-x-2 rounded-lg hover:bg-gray-100 dark:hover:bg-nubo-gray transition-colors"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Добавить подход</span>
        </button>
        
        {/* Special Sets */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addSet('amrap')}
            className="py-2 px-3 flex items-center justify-center space-x-2 rounded-lg glass-effect hover:bg-electric-lime/10 transition-colors text-xs"
          >
            <Timer size={14} />
            <span>AMRAP</span>
          </button>
          <button
            onClick={() => addSet('emom')}
            className="py-2 px-3 flex items-center justify-center space-x-2 rounded-lg glass-effect hover:bg-electric-lime/10 transition-colors text-xs"
          >
            <Zap size={14} />
            <span>EMOM</span>
          </button>
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {showInfo && (
        <ExerciseDetailModal
          exercise={exercise.exercise}
          onClose={() => setShowInfo(false)}
          previousBest={undefined} // TODO: Передавать реальные данные предыдущей тренировки
        />
      )}

      {/* AMRAP Timer Modal */}
      {showAMRAP && selectedSetForSpecial && (
        <AMRAPTimer
          targetTime={
            exercise.sets.find((s) => s.id === selectedSetForSpecial)?.targetTime || 60
          }
          onComplete={(time, reps) => handleAMRAPComplete(selectedSetForSpecial, time, reps)}
          onCancel={() => {
            setShowAMRAP(false);
            setSelectedSetForSpecial(null);
          }}
        />
      )}

      {/* EMOM Timer Modal */}
      {showEMOM && selectedSetForSpecial && (
        <EMOMTimer
          intervalTime={
            exercise.sets.find((s) => s.id === selectedSetForSpecial)?.targetTime || 60
          }
          totalRounds={5} // TODO: Сделать настраиваемым
          onComplete={(completedRounds) =>
            handleEMOMComplete(selectedSetForSpecial, completedRounds)
          }
          onCancel={() => {
            setShowEMOM(false);
            setSelectedSetForSpecial(null);
          }}
        />
      )}
    </div>
  );
}




