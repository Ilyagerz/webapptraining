'use client';

import { useState, useEffect } from 'react';
import { X, Info, TrendingUp, Trophy, BarChart3 } from 'lucide-react';
import type { Exercise } from '@/types';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
}

type Tab = 'resume' | 'history' | 'chart' | 'records';

interface WorkoutHistory {
  date: string;
  completedSets: number;
  totalVolume: number;
  sets: Array<{
    weight: number;
    reps: number;
  }>;
}

interface PersonalRecords {
  maxWeight: number;
  maxVolume: number;
  estimated1RM: number;
}

export function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('resume');
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [records, setRecords] = useState<PersonalRecords | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'records') {
      loadExerciseData();
    }
  }, [activeTab, exercise.id]);

  const loadExerciseData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workouts/exercise/${exercise.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const workouts = await response.json();
        
        // Обработка истории
        const historyData = workouts.map((workout: any) => {
          const exerciseData = workout.exercises.find((e: any) => e.exerciseId === exercise.id);
          const completedSets = exerciseData?.sets.filter((s: any) => s.completed) || [];
          const totalVolume = completedSets.reduce((sum: number, s: any) => sum + (s.weight * s.reps), 0);
          
          return {
            date: new Date(workout.completedAt).toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'short',
              year: 'numeric' 
            }),
            completedSets: completedSets.length,
            totalVolume,
            sets: completedSets.map((s: any) => ({
              weight: s.weight,
              reps: s.reps,
            })),
          };
        });
        
        setHistory(historyData);

        // Расчет рекордов
        if (historyData.length > 0) {
          const allSets = historyData.flatMap((h: WorkoutHistory) => h.sets);
          const maxWeight = Math.max(...allSets.map((s: { weight: number; reps: number }) => s.weight));
          const maxVolume = Math.max(...historyData.map((h: WorkoutHistory) => h.totalVolume));
          
          // Формула Brzycki для 1RM
          const heaviestSet = allSets.reduce((prev: { weight: number; reps: number }, current: { weight: number; reps: number }) => 
            (prev.weight * (1 + prev.reps / 30)) > (current.weight * (1 + current.reps / 30)) ? prev : current
          );
          const estimated1RM = Math.round(heaviestSet.weight * (1 + heaviestSet.reps / 30));
          
          setRecords({
            maxWeight,
            maxVolume,
            estimated1RM,
          });
        }
      }
    } catch (error) {
      console.error('Error loading exercise data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'resume' as Tab, label: 'Резюме', icon: Info },
    { id: 'history' as Tab, label: 'История', icon: TrendingUp },
    { id: 'chart' as Tab, label: 'График', icon: BarChart3 },
    { id: 'records' as Tab, label: 'Рекорды', icon: Trophy },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl border border-white/20 dark:border-gray-700/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">{exercise.name}</h2>
            {exercise.nameEn && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{exercise.nameEn}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-700 dark:text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200/50 dark:border-gray-700/50 px-4 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-electric-lime border-b-2 border-electric-lime'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'resume' && (
            <div className="space-y-6">
              {/* GIF Animation */}
              {exercise.gifUrl && (
                <div className="flex justify-center">
                  <img
                    src={exercise.gifUrl}
                    alt={exercise.name}
                    className="max-w-full h-auto rounded-2xl shadow-lg"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Instructions */}
              {exercise.instructions && exercise.instructions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-black dark:text-white">Инструкции</h3>
                  <ol className="space-y-3">
                    {exercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-electric-lime/20 text-electric-lime flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Info Card */}
              <div className="glass-effect rounded-2xl p-4 border border-electric-lime/20 bg-gradient-to-br from-electric-lime/5 to-transparent">
                <div className="flex items-start space-x-3">
                  <Info size={20} className="text-electric-lime flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2 text-black dark:text-white">Группа мышц</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{exercise.muscleGroup}</p>
                    {exercise.equipment && exercise.equipment.length > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Оборудование: {exercise.equipment.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Загрузка...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  История тренировок пока пуста
                </div>
              ) : (
                history.map((item, index) => (
                  <div
                    key={index}
                    className="glass-effect rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-black dark:text-white">
                          {item.date}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Выполнено сетов: {item.completedSets}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-electric-lime">{item.totalVolume} кг</p>
                        <p className="text-xs text-gray-500">Объем</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {item.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className="text-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                        >
                          <p className="text-sm font-semibold text-black dark:text-white">
                            {set.weight} × {set.reps}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="text-center py-12">
              <BarChart3 size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">График прогресса</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Функция в разработке
              </p>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Загрузка...</div>
              ) : !records ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Рекорды пока не установлены
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      ЛИЧНЫЕ РЕКОРДЫ
                    </h3>
                  </div>

                  {/* 1МП */}
                  <div className="glass-effect rounded-2xl p-6 border border-yellow-500/30 bg-gradient-to-br from-yellow-400/10 to-transparent">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">1МП</p>
                        <p className="text-3xl font-bold text-black dark:text-white mt-1">
                          {records.estimated1RM} kg
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                        <Trophy size={24} className="text-yellow-900" />
                      </div>
                    </div>
                  </div>

                  {/* Вес */}
                  <div className="glass-effect rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Вес</p>
                    <p className="text-2xl font-bold text-black dark:text-white mt-1">
                      {records.maxWeight} kg (×5)
                    </p>
                  </div>

                  {/* Макс. объем */}
                  <div className="glass-effect rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Макс. объем</p>
                    <p className="text-2xl font-bold text-black dark:text-white mt-1">
                      {records.maxVolume} kg
                    </p>
                  </div>

                  {/* Прогноз */}
                  <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <h4 className="text-sm font-semibold mb-2 text-black dark:text-white">ПРОГНОЗ</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div>1: {records.estimated1RM} kg</div>
                      <div>2: {Math.round(records.estimated1RM * 0.95)} kg</div>
                      <div>3: {Math.round(records.estimated1RM * 0.92)} kg</div>
                      <div>4: {Math.round(records.estimated1RM * 0.89)} kg</div>
                      <div>5: {Math.round(records.estimated1RM * 0.86)} kg</div>
                      <div>6: {Math.round(records.estimated1RM * 0.83)} kg</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
