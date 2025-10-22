'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  Dumbbell,
  Calendar,
  User,
  Plus,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { getWeeksData, generateId } from '@/lib/utils';
import type { Workout } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, workouts, templates, setActiveWorkout, startWorkout } = useAppStore();

  const startEmptyWorkout = () => {
    if (!user) return;
    
    const newWorkout: Workout = {
      id: generateId(),
      userId: user.id,
      name: 'Новая тренировка',
      startedAt: new Date(),
      exercises: [],
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
      isActive: true,
    };

    setActiveWorkout(newWorkout);
    router.push('/workout/active');
  };

  const startWorkoutFromTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    // Создаем тренировку из шаблона
    const workout = {
      id: generateId(),
      name: template.name,
      templateId: template.id,
      templateName: template.name,
      exercises: template.exercises.map((te) => ({
        id: generateId(),
        exerciseId: te.exerciseId,
        exercise: te.exercise,
        sets: Array.from({ length: te.sets }, (_, i) => ({
          id: generateId(),
          setNumber: i + 1,
          reps: 0, // НЕ берем из шаблона - пользователь сам введет
          weight: 0,
          completed: false,
          isWarmup: false,
          setType: 'standard' as const,
        })),
        notes: '',
        restTimer: te.restTimer || 90,
        supersetId: undefined,
      })),
      startedAt: new Date(),
      isActive: true,
      notes: '',
    };

    startWorkout(workout);
    router.push('/workout/active');
  };

  const [weekData, setWeekData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Генерируем данные недели из РЕАЛЬНЫХ тренировок
    const weeklyData = getWeeksData(workouts, 7);
    console.log('📊 Недельная активность:', weeklyData, 'Тренировок:', workouts.length);
    setWeekData(weeklyData);
  }, [user, workouts]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-nubo-dark pt-22 pb-24">
      {/* Приветствие */}
      <div className="p-6 pb-3">
        <h1 className="text-2xl font-bold mb-1 text-black dark:text-white">
          Привет, {user.firstName || user.username || 'Атлет'}! 👋
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Готов к тренировке?
        </p>
      </div>

      {/* Панель мониторинга */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-black dark:text-white">
            Панель мониторинга
          </h2>
          <button className="text-blue-500 text-sm font-medium flex items-center gap-1">
            <span className="text-xl">+</span> Виджет
          </button>
        </div>

        {/* Виджет - Тренировки за неделю */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-semibold mb-4 text-black dark:text-white">
            Тренировки за неделю
          </h3>
          
          <div className="mb-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Активность</span>
            </div>
            
            {/* Столбчатая диаграмма как на скрине */}
            <div className="flex items-end justify-between gap-2 mb-3" style={{ height: '120px' }}>
              {weekData.map((day, index) => {
                const maxWorkouts = Math.max(...weekData.map(d => d.workouts), 1);
                const height = day.workouts > 0 ? (day.workouts / maxWorkouts) * 100 : 5;
                const isActive = day.workouts > 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                      <div
                        className={`w-full rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-t from-purple-600 to-purple-400'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        style={{
                          height: `${height}%`,
                          minHeight: '8px',
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Цель справа снизу */}
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {weekData.filter(d => d.workouts > 0).length}
                  </span>
                </div>
                <span className="text-2xl font-bold text-black dark:text-white">
                  {weekData.filter(d => d.workouts > 0).length}
                </span>
                <span className="text-gray-400 text-sm ml-1">
                  / {user.settings?.weeklyGoal || 3}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Быстрые действия */}
      <div className="px-6 pb-6 space-y-3">
        {/* Пустая тренировка */}
        <button
          onClick={startEmptyWorkout}
          className="block w-full bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm card-hover text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Plus size={24} className="text-gray-700 dark:text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-black dark:text-white">Пустая тренировка</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Начать без шаблона</div>
            </div>
          </div>
        </button>

        {/* Шаблоны */}
        {templates.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-black dark:text-white">Мои программы</h3>
              <Link href="/templates" className="text-sm text-electric-lime">
                Все →
              </Link>
            </div>
            <div className="space-y-2">
              {templates.slice(0, 3).map((template) => (
                <button
                  key={template.id}
                  onClick={() => startWorkoutFromTemplate(template.id)}
                  className="block w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl card-hover text-left"
                >
                  <div className="font-medium text-sm text-black dark:text-white">{template.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {template.exercises.length} упражнений
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Создать программу */}
        <Link
          href="/templates/new"
          className="block bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm card-hover"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <FileText size={24} className="text-gray-700 dark:text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-black dark:text-white">Создать программу</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Новый шаблон тренировки</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Пустое пространство */}
      <div className="flex-1" />

      {/* Нижние кнопки - все в один ряд */}
      <div className="fixed bottom-0 left-0 right-0 grid grid-cols-3 gap-3 p-4 safe-bottom bg-white dark:bg-nubo-dark border-t border-gray-200 dark:border-gray-700 z-50">
        <Link
          href="/history"
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 card-hover border border-gray-200 dark:border-gray-700"
        >
          <Calendar size={24} className="text-gray-700 dark:text-white" />
          <span className="text-xs font-medium text-center text-gray-700 dark:text-white">
            История
          </span>
        </Link>

        <button
          onClick={() => router.push('/workout/new')}
          className="bg-gradient-to-br from-electric-lime to-green-400 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 card-hover shadow-lg"
        >
          <Dumbbell size={24} className="text-nubo-dark" />
          <span className="text-xs font-medium text-nubo-dark text-center">
            Начать
          </span>
        </button>

        <Link
          href="/profile"
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 card-hover border border-gray-200 dark:border-gray-700"
        >
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt="Profile"
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <User size={24} className="text-gray-700 dark:text-white" />
          )}
          <span className="text-xs font-medium text-center text-gray-700 dark:text-white">
            Профиль
          </span>
        </Link>
      </div>
    </div>
  );
}

