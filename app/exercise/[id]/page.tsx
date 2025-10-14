'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, calculate1RM } from '@/lib/utils';
import { ProgressChart } from '@/components/charts/ProgressChart';
import type { Exercise } from '@/types';

// Временный тип для истории упражнения
interface ExerciseHistory {
  date: Date;
  sets: Array<{
    weight: number;
    reps: number;
    rpe?: number;
  }>;
  workoutName: string;
  totalVolume: number;
}

interface ExerciseRecords {
  maxWeight: { value: number; date: Date };
  max1RM: { value: number; date: Date };
  maxVolume: { value: number; date: Date };
  maxReps: { value: number; reps: number; weight: number; date: Date };
}

export default function ExerciseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, exercises: allExercises } = useAppStore();
  const exerciseId = params.id as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'records'>('info');
  const [history, setHistory] = useState<ExerciseHistory[]>([]);
  const [records, setRecords] = useState<ExerciseRecords | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Находим упражнение
    const foundExercise = allExercises.find((ex) => ex.id === exerciseId);
    if (!foundExercise) {
      router.push('/dashboard');
      return;
    }

    setExercise(foundExercise);

    // TODO: Загрузить реальную историю с сервера
    // Временные демо-данные
    const demoHistory: ExerciseHistory[] = [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        workoutName: 'Push Day A',
        sets: [
          { weight: 80, reps: 10, rpe: 8 },
          { weight: 80, reps: 9, rpe: 8 },
          { weight: 75, reps: 10, rpe: 7 },
        ],
        totalVolume: 2400,
      },
      {
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        workoutName: 'Push Day A',
        sets: [
          { weight: 77.5, reps: 10, rpe: 8 },
          { weight: 77.5, reps: 9, rpe: 8 },
          { weight: 75, reps: 9, rpe: 7 },
        ],
        totalVolume: 2287.5,
      },
      {
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        workoutName: 'Push Day A',
        sets: [
          { weight: 75, reps: 10, rpe: 7 },
          { weight: 75, reps: 10, rpe: 8 },
          { weight: 75, reps: 9, rpe: 8 },
        ],
        totalVolume: 2175,
      },
    ];

    const demoRecords: ExerciseRecords = {
      maxWeight: { value: 80, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      max1RM: { value: 106, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      maxVolume: { value: 2400, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      maxReps: {
        value: 10,
        reps: 10,
        weight: 80,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    };

    setHistory(demoHistory);
    setRecords(demoRecords);
    setLoading(false);
  }, [user, exerciseId, allExercises]);

  if (loading || !exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-electric-lime rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-electric-lime rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-electric-lime rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-nubo-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-nubo-dark border-b border-gray-200 dark:border-gray-800 safe-top z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-nubo-gray"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{exercise.name}</h1>
              <p className="text-sm text-muted-foreground">{exercise.muscleGroup}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors ${
                activeTab === 'info'
                  ? 'border-b-2 border-electric-lime text-electric-lime'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Info size={18} />
              <span>Описание</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'border-b-2 border-electric-lime text-electric-lime'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar size={18} />
              <span>История</span>
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors ${
                activeTab === 'records'
                  ? 'border-b-2 border-electric-lime text-electric-lime'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Award size={18} />
              <span>Рекорды</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Exercise Image/GIF */}
            <div className="glass-effect rounded-2xl p-8 text-center">
              <div className="w-full h-48 bg-gray-100 dark:bg-nubo-gray rounded-xl flex items-center justify-center mb-4">
                <div className="text-6xl">💪</div>
              </div>
              <p className="text-sm text-muted-foreground">
                {exercise.gifUrl ? 'GIF загружается...' : 'GIF скоро появится'}
              </p>
            </div>

            {/* Description */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="font-bold mb-3">Описание</h3>
              <p className="text-muted-foreground">{exercise.description}</p>
            </div>

            {/* Instructions */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="font-bold mb-3">Инструкция</h3>
              <ol className="space-y-2">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="flex space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-electric-lime/20 text-electric-lime flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Details */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="font-bold mb-3">Детали</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Категория</div>
                  <div className="font-medium capitalize">{exercise.category}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Группа мышц</div>
                  <div className="font-medium">{exercise.muscleGroup}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">Оборудование</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {exercise.equipment.map((eq, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-nubo-gray rounded-full text-sm"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Progress Chart */}
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center">
                  <TrendingUp size={20} className="mr-2 text-electric-lime" />
                  График прогресса
                </h3>
              </div>
              <div className="h-64">
                <ProgressChart
                  data={history.map((entry) => ({
                    date: entry.date,
                    value: Math.max(...entry.sets.map((s) => s.weight)),
                  }))}
                  label="Максимальный вес"
                  color="#d4ff00"
                  yAxisLabel="Вес (кг)"
                />
              </div>
            </div>

            {/* History List */}
            <div className="space-y-3">
              <h3 className="font-bold">История тренировок ({history.length})</h3>

              {history.map((entry, index) => {
                const maxWeight = Math.max(...entry.sets.map((s) => s.weight));
                const totalReps = entry.sets.reduce((sum, s) => sum + s.reps, 0);
                const avgRPE = entry.sets
                  .filter((s) => s.rpe)
                  .reduce((sum, s, _, arr) => sum + (s.rpe || 0) / arr.length, 0);

                return (
                  <div key={index} className="glass-effect rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold">{formatDate(entry.date)}</div>
                        <div className="text-sm text-muted-foreground">{entry.workoutName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{entry.totalVolume} кг</div>
                        <div className="text-xs text-muted-foreground">объем</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 bg-gray-50 dark:bg-nubo-dark rounded-lg">
                        <div className="text-lg font-bold">{entry.sets.length}</div>
                        <div className="text-xs text-muted-foreground">подходов</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-nubo-dark rounded-lg">
                        <div className="text-lg font-bold">{maxWeight} кг</div>
                        <div className="text-xs text-muted-foreground">макс вес</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-nubo-dark rounded-lg">
                        <div className="text-lg font-bold">{totalReps}</div>
                        <div className="text-xs text-muted-foreground">повторов</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {entry.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">Подход {setIndex + 1}</span>
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">
                              {set.weight} кг × {set.reps}
                            </span>
                            {set.rpe && (
                              <span className="text-xs text-muted-foreground">RPE {set.rpe}</span>
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
        )}

        {/* Records Tab */}
        {activeTab === 'records' && records && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Max Weight */}
              <div className="glass-effect rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Award size={20} className="text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(records.maxWeight.date)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                  {records.maxWeight.value} кг
                </div>
                <div className="text-sm text-muted-foreground">Максимальный вес</div>
              </div>

              {/* Max 1RM */}
              <div className="glass-effect rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Award size={20} className="text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(records.max1RM.date)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                  {records.max1RM.value} кг
                </div>
                <div className="text-sm text-muted-foreground">Расчетный 1RM</div>
              </div>

              {/* Max Volume */}
              <div className="glass-effect rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Award size={20} className="text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(records.maxVolume.date)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                  {records.maxVolume.value} кг
                </div>
                <div className="text-sm text-muted-foreground">Максимальный объем</div>
              </div>

              {/* Max Reps */}
              <div className="glass-effect rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Award size={20} className="text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(records.maxReps.date)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                  {records.maxReps.reps}
                </div>
                <div className="text-sm text-muted-foreground">
                  Макс повторов ({records.maxReps.weight} кг)
                </div>
              </div>
            </div>

            {/* 1RM Explanation */}
            <div className="glass-effect rounded-xl p-4 border-l-4 border-electric-lime">
              <h4 className="font-semibold mb-2">💡 Что такое 1RM?</h4>
              <p className="text-sm text-muted-foreground">
                <strong>1RM (One Rep Max)</strong> - это максимальный вес, который ты можешь поднять
                на одно повторение. Мы рассчитываем его по формуле Brzycki на основе твоих рабочих
                подходов.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Формула: <code className="px-2 py-1 bg-gray-100 dark:bg-nubo-gray rounded">
                  1RM = вес × (36 / (37 - повторения))
                </code>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



