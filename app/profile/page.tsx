'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  ArrowLeft,
  Settings,
  TrendingUp,
  Award,
  Activity,
  Ruler,
  Moon,
  Sun,
  Bell,
  Volume2,
  Vibrate,
  LogOut,
  User,
  Dumbbell,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, theme, setTheme, updateSettings, workouts } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
  }, [user]);

  if (!user) {
    return null;
  }

  // Рассчитываем реальную статистику
  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
  const totalRecords = workouts.reduce((sum, w) => sum + (w.records?.length || 0), 0);
  
  // Подсчет дней подряд
  let currentStreak = 0;
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime()
  );
  
  if (sortedWorkouts.length > 0) {
    currentStreak = 1;
    for (let i = 1; i < sortedWorkouts.length; i++) {
      const prevDate = new Date(sortedWorkouts[i-1].completedAt || sortedWorkouts[i-1].startedAt);
      const currDate = new Date(sortedWorkouts[i].completedAt || sortedWorkouts[i].startedAt);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) currentStreak++;
      else break;
    }
  }

  const handleLogout = async () => {
    if (confirm('Выйти из аккаунта?')) {
      // TODO: Logout API call
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-nubo-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-nubo-dark border-b border-gray-200 dark:border-gray-800 safe-top z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-nubo-gray"
              >
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-2xl font-bold">Профиль</h1>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-nubo-gray"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* User Info */}
        <div className="glass-effect rounded-2xl p-6 text-center">
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.firstName}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-electric-lime to-green-400 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-nubo-dark">
                {user.firstName?.charAt(0) || 'U'}
              </span>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-1">
            {user.firstName} {user.lastName}
          </h2>
          {user.username && (
            <p className="text-muted-foreground">@{user.username}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-effect rounded-xl p-6 text-center">
            <Dumbbell size={24} className="mx-auto mb-2 text-electric-lime" />
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <div className="text-sm text-muted-foreground">Тренировок</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center">
            <TrendingUp size={24} className="mx-auto mb-2 text-electric-lime" />
            <div className="text-2xl font-bold">
              {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}т` : `${totalVolume}кг`}
            </div>
            <div className="text-sm text-muted-foreground">Объем</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center">
            <Award size={24} className="mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{totalRecords}</div>
            <div className="text-sm text-muted-foreground">Рекордов</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center">
            <Activity size={24} className="mx-auto mb-2 text-electric-lime" />
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="text-sm text-muted-foreground">Дней подряд</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link
            href="/measurements"
            className="glass-effect rounded-xl p-4 flex items-center justify-between card-hover"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-electric-lime/20 flex items-center justify-center">
                <Ruler size={20} className="text-electric-lime" />
              </div>
              <div>
                <div className="font-semibold">Замеры</div>
                <div className="text-sm text-muted-foreground">
                  Отслеживай изменения
                </div>
              </div>
            </div>
            <span className="text-muted-foreground">→</span>
          </Link>

          <Link
            href="/records"
            className="glass-effect rounded-xl p-4 flex items-center justify-between card-hover"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Award size={20} className="text-yellow-500" />
              </div>
              <div>
                <div className="font-semibold">Рекорды</div>
                <div className="text-sm text-muted-foreground">
                  Твои достижения
                </div>
              </div>
            </div>
            <span className="text-muted-foreground">→</span>
          </Link>

          <Link
            href="/stats"
            className="glass-effect rounded-xl p-4 flex items-center justify-between card-hover"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-electric-lime/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-electric-lime" />
              </div>
              <div>
                <div className="font-semibold">Статистика</div>
                <div className="text-sm text-muted-foreground">
                  Графики и анализ
                </div>
              </div>
            </div>
            <span className="text-muted-foreground">→</span>
          </Link>

          <Link
            href="/plate-calculator"
            className="glass-effect rounded-xl p-4 flex items-center justify-between card-hover"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-electric-lime/20 flex items-center justify-center">
                <Dumbbell size={20} className="text-electric-lime" />
              </div>
              <div>
                <div className="font-semibold">Плейт-калькулятор</div>
                <div className="text-sm text-muted-foreground">
                  Какие диски ставить
                </div>
              </div>
            </div>
            <span className="text-muted-foreground">→</span>
          </Link>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="glass-effect rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-lg mb-4">Настройки</h3>

            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? (
                  <Moon size={20} className="text-muted-foreground" />
                ) : (
                  <Sun size={20} className="text-muted-foreground" />
                )}
                <span className="font-medium">Тема</span>
              </div>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="px-4 py-2 glass-effect rounded-lg font-medium"
              >
                {theme === 'light' ? 'Светлая' : 'Тёмная'}
              </button>
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Volume2 size={20} className="text-muted-foreground" />
                <span className="font-medium">Звук</span>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={user.settings.soundEnabled}
                  onChange={(e) =>
                    updateSettings({ soundEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <span className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-electric-lime transition-colors cursor-pointer"></span>
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></span>
              </label>
            </div>

            {/* Vibration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Vibrate size={20} className="text-muted-foreground" />
                <span className="font-medium">Вибрация</span>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={user.settings.vibrationEnabled}
                  onChange={(e) =>
                    updateSettings({ vibrationEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <span className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-electric-lime transition-colors cursor-pointer"></span>
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></span>
              </label>
            </div>

            {/* Auto Timer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity size={20} className="text-muted-foreground" />
                <span className="font-medium">Авто-таймер</span>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={user.settings.autoStartTimer}
                  onChange={(e) =>
                    updateSettings({ autoStartTimer: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <span className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-electric-lime transition-colors cursor-pointer"></span>
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></span>
              </label>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full py-3 flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl font-medium card-hover"
            >
              <LogOut size={18} />
              <span>Выйти</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-nubo-dark border-t border-gray-200 dark:border-gray-800 safe-bottom">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 py-3">
            <Link
              href="/history"
              className="flex flex-col items-center justify-center space-y-1 py-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-nubo-gray"
            >
              <Calendar size={24} />
              <span className="text-xs">История</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex flex-col items-center justify-center space-y-1 py-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-nubo-gray"
            >
              <Dumbbell size={24} />
              <span className="text-xs">Начать</span>
            </Link>
            <Link
              href="/profile"
              className="flex flex-col items-center justify-center space-y-1 py-2 rounded-xl bg-electric-lime text-nubo-dark"
            >
              <User size={24} />
              <span className="text-xs font-medium">Профиль</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}




