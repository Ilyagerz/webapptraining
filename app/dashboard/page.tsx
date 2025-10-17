'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  Dumbbell,
  Calendar,
  User,
  Play,
  Plus,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { getWeeksData } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, workouts, templates } = useAppStore();
  const [weekData, setWeekData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Генерируем данные недели из РЕАЛЬНЫХ тренировок
    setWeekData(getWeeksData(workouts, 7));
  }, [user, workouts]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-nubo-dark pt-22">
      {/* Приветствие */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-1 text-black dark:text-white">
          Привет, {user.firstName || user.username || 'Атлет'}! 👋
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Готов к тренировке?
        </p>
      </div>

      {/* Недельная статистика */}
      <div className="px-6 pb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 text-gray-600 dark:text-gray-300">
            Активность за неделю
          </h2>
          
          <div className="flex justify-between items-end h-32 gap-2">
            {weekData.map((day, index) => {
              const maxWorkouts = Math.max(...weekData.map(d => d.workouts), 1);
              const height = day.workouts > 0 ? (day.workouts / maxWorkouts) * 100 : 10;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        day.workouts > 0
                          ? 'bg-electric-lime'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      style={{
                        height: `${height}%`,
                        minHeight: '10%',
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {day.day}
                  </span>
                  {day.workouts > 0 && (
                    <span className="text-xs text-electric-lime font-bold">
                      {day.workouts}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="px-6 pb-6 space-y-3">
        {/* Пустая тренировка */}
        <Link
          href="/workout/new"
          className="block bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm card-hover"
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
        </Link>

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
                <Link
                  key={template.id}
                  href={`/workout/new?templateId=${template.id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-xl card-hover"
                >
                  <div className="font-medium text-sm text-black dark:text-white">{template.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {template.exercises.length} упражнений
                  </div>
                </Link>
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
      <div className="grid grid-cols-3 gap-3 p-4 safe-bottom bg-white dark:bg-nubo-dark border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/history"
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 card-hover border border-gray-200 dark:border-gray-700"
        >
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Calendar size={28} className="text-gray-700 dark:text-white" />
          </div>
          <span className="text-xs font-semibold text-center text-gray-700 dark:text-white">
            История
          </span>
        </Link>

        <Link
          href="/workout/new"
          className="bg-gradient-to-br from-electric-lime to-green-400 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 card-hover shadow-lg"
        >
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <Play size={32} className="text-nubo-dark" fill="currentColor" />
          </div>
          <span className="text-xs font-bold text-nubo-dark text-center">
            Начать
          </span>
        </Link>

        <Link
          href="/profile"
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 card-hover border border-gray-200 dark:border-gray-700"
        >
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt="Profile"
                className="w-14 h-14 object-cover"
              />
            ) : (
              <User size={28} className="text-gray-700 dark:text-white" />
            )}
          </div>
          <span className="text-xs font-semibold text-center text-gray-700 dark:text-white">
            Профиль
          </span>
        </Link>
      </div>
    </div>
  );
}

