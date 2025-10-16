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

      {/* Пустое пространство для контента в будущем */}
      <div className="flex-1" />

      {/* Нижние кнопки - все в один ряд */}
      <div className="grid grid-cols-3 gap-3 p-4 safe-bottom">
        <Link
          href="/history"
          className="glass-effect rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 card-hover"
        >
          <div className="w-14 h-14 rounded-full bg-electric-lime/10 flex items-center justify-center">
            <History size={28} className="text-electric-lime" />
          </div>
          <span className="text-xs font-semibold text-center">
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
          className="glass-effect rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 card-hover"
        >
          <div className="w-14 h-14 rounded-full bg-electric-lime/10 flex items-center justify-center overflow-hidden">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt="Profile"
                className="w-14 h-14 object-cover"
              />
            ) : (
              <User size={28} className="text-electric-lime" />
            )}
          </div>
          <span className="text-xs font-semibold text-center">
            Профиль
          </span>
        </Link>
      </div>
    </div>
  );
}

