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
  Clock,
  X,
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

  const exportData = () => {
    try {
      const data = localStorage.getItem('nubo-training-storage');
      if (!data) {
        alert('Нет данных для экспорта');
        return;
      }
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nubo-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert('✅ Данные экспортированы успешно!');
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('❌ Ошибка при экспорте данных');
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result as string;
          // Проверяем, что это валидный JSON
          JSON.parse(data);
          
          if (confirm('⚠️ Импорт данных заменит текущие данные. Продолжить?')) {
            localStorage.setItem('nubo-training-storage', data);
            alert('✅ Данные импортированы! Страница перезагрузится.');
            location.reload();
          }
        } catch (error) {
          console.error('Ошибка импорта:', error);
          alert('❌ Некорректный файл данных');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-nubo-dark pb-24 pt-22">
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

        {/* Stats Grid - УБРАНО по запросу пользователя */}

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link
            href="/measurements"
            className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between card-hover border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-electric-lime/20 flex items-center justify-center">
                <Ruler size={20} className="text-black dark:text-electric-lime" />
              </div>
              <div>
                <div className="font-semibold text-black dark:text-white">Замеры</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Отслеживай изменения
                </div>
              </div>
            </div>
            <span className="text-gray-600 dark:text-gray-300">→</span>
          </Link>

          <Link
            href="/records"
            className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between card-hover border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Award size={20} className="text-black dark:text-yellow-500" />
              </div>
              <div>
                <div className="font-semibold text-black dark:text-white">Рекорды</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Твои достижения
                </div>
              </div>
            </div>
            <span className="text-gray-600 dark:text-gray-300">→</span>
          </Link>

          <Link
            href="/stats"
            className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between card-hover border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-electric-lime/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-black dark:text-electric-lime" />
              </div>
              <div>
                <div className="font-semibold text-black dark:text-white">Статистика</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Прогресс и достижения
                </div>
              </div>
            </div>
            <span className="text-gray-600 dark:text-gray-300">→</span>
          </Link>
        </div>

        {/* Экспорт/Импорт данных */}
        <div className="px-6 pb-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            🛡️ Резервное копирование
          </h3>
          
          <button
            onClick={exportData}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-electric-lime dark:hover:border-electric-lime transition-colors shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Download size={20} className="text-green-600 dark:text-green-500" />
              </div>
              <div className="text-left">
                <div className="font-medium text-black dark:text-white">Экспорт данных</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Сохранить резервную копию</div>
              </div>
            </div>
          </button>

          <button
            onClick={importData}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-electric-lime dark:hover:border-electric-lime transition-colors shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Upload size={20} className="text-blue-600 dark:text-blue-500" />
              </div>
              <div className="text-left">
                <div className="font-medium text-black dark:text-white">Импорт данных</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Восстановить из файла</div>
              </div>
            </div>
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSettings(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 border border-gray-200 dark:border-gray-700 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl text-black dark:text-white">Настройки</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={24} className="text-gray-700 dark:text-white" />
                </button>
              </div>

            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? (
                  <Moon size={20} className="text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun size={20} className="text-gray-600 dark:text-gray-300" />
                )}
                <span className="font-medium text-black dark:text-white">Тема</span>
              </div>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium text-black dark:text-white border border-gray-200 dark:border-gray-600"
              >
                {theme === 'light' ? 'Светлая' : 'Тёмная'}
              </button>
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Volume2 size={20} className="text-gray-600 dark:text-gray-300" />
                <span className="font-medium text-black dark:text-white">Звук</span>
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
                <Vibrate size={20} className="text-gray-600 dark:text-gray-300" />
                <span className="font-medium text-black dark:text-white">Вибрация</span>
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

            {/* Rest Timer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock size={20} className="text-gray-600 dark:text-gray-300" />
                <span className="font-medium text-black dark:text-white">Таймер отдыха</span>
              </div>
              <select
                value={user.settings.restTimerDefault}
                onChange={(e) =>
                  updateSettings({ restTimerDefault: Number(e.target.value) })
                }
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium text-black dark:text-white border border-gray-200 dark:border-gray-600"
              >
                <option value={30}>30 сек</option>
                <option value={60}>1 мин</option>
                <option value={90}>1.5 мин</option>
                <option value={120}>2 мин</option>
                <option value={180}>3 мин</option>
                <option value={240}>4 мин</option>
                <option value={300}>5 мин</option>
              </select>
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
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-3 gap-3 p-4 safe-bottom bg-white dark:bg-nubo-dark border-t border-gray-200 dark:border-gray-700 z-50">
        <Link
          href="/history"
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 card-hover border border-gray-200 dark:border-gray-700"
        >
          <Calendar size={24} className="text-gray-700 dark:text-white" />
          <span className="text-xs font-medium text-center text-gray-700 dark:text-white">
            История
          </span>
        </Link>

        <Link
          href="/dashboard"
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 card-hover border border-gray-200 dark:border-gray-700"
        >
          <Dumbbell size={24} className="text-gray-700 dark:text-white" />
          <span className="text-xs font-medium text-center text-gray-700 dark:text-white">
            Начать
          </span>
        </Link>

        <Link
          href="/profile"
          className="bg-electric-lime text-nubo-dark rounded-2xl p-4 flex flex-col items-center justify-center space-y-2"
        >
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt="Profile"
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <User size={24} className="text-nubo-dark" />
          )}
          <span className="text-xs font-medium text-center text-nubo-dark">
            Профиль
          </span>
        </Link>
      </nav>
    </div>
  );
}




