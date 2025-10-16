'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  Dumbbell,
  History,
  User,
  Play,
} from 'lucide-react';
import Link from 'next/link';
import { getWeeksData } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, workouts } = useAppStore();
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-nubo-dark">
      {/* Приветствие */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-1">
          Привет, {user.firstName || user.username || 'Атлет'}! 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Готов к тренировке?
        </p>
      </div>

      {/* Недельная статистика */}
      <div className="px-6 pb-6">
        <div className="glass-effect rounded-2xl p-6">
          <h2 className="text-sm font-semibold mb-4 text-muted-foreground">
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
                  <span className="text-xs text-muted-foreground font-medium">
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

      {/* Центральная кнопка "Начать" */}
      <div className="flex-1 flex items-center justify-center px-6">
        <Link
          href="/workout/new"
          className="relative group"
        >
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-electric-lime to-green-400 shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-active:scale-95">
            <div className="text-center">
              <Play size={64} className="mx-auto mb-2 text-nubo-dark" fill="currentColor" />
              <span className="text-2xl font-bold text-nubo-dark">
                Начать
              </span>
            </div>
          </div>
          {/* Пульсирующее кольцо */}
          <div className="absolute inset-0 rounded-full bg-electric-lime opacity-20 animate-ping" />
        </Link>
      </div>

      {/* Нижние кнопки */}
      <div className="grid grid-cols-2 gap-4 p-6 safe-bottom">
        <Link
          href="/history"
          className="glass-effect rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 card-hover"
        >
          <div className="w-16 h-16 rounded-full bg-electric-lime/10 flex items-center justify-center">
            <History size={32} className="text-electric-lime" />
          </div>
          <span className="text-sm font-semibold text-center">
            История
          </span>
        </Link>

        <Link
          href="/profile"
          className="glass-effect rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 card-hover"
        >
          <div className="w-16 h-16 rounded-full bg-electric-lime/10 flex items-center justify-center">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User size={32} className="text-electric-lime" />
            )}
          </div>
          <span className="text-sm font-semibold text-center">
            Профиль
          </span>
        </Link>
      </div>
    </div>
  );
}

