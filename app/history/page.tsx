'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Calendar, Clock, Dumbbell, TrendingUp, User } from 'lucide-react';
import Link from 'next/link';
import { formatDuration, formatDateShort, generateId } from '@/lib/utils';
import type { Workout } from '@/types';
import { WorkoutCalendar } from '@/components/WorkoutCalendar';

export default function HistoryPage() {
  const router = useRouter();
  const { user, setActiveWorkout } = useAppStore();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    loadWorkouts();
  }, [user]);

  const loadWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setWorkouts(data.workouts || []);
      }
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24 pt-22 bg-white dark:bg-nubo-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-nubo-dark border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard">
            <ArrowLeft size={24} className="text-gray-700 dark:text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-black dark:text-white">История</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Все тренировки</p>
          </div>
          <button
            onClick={() => setShowCalendar(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Calendar size={24} className="text-gray-700 dark:text-white" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Всего</p>
            <p className="text-2xl font-bold text-black dark:text-white">{workouts.length}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Этот месяц</p>
            <p className="text-2xl font-bold">
              {workouts.filter(w => {
                const date = new Date(w.completedAt || w.startedAt);
                const now = new Date();
                return date.getMonth() === now.getMonth();
              }).length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Эта неделя</p>
            <p className="text-2xl font-bold text-black dark:text-white">
              {workouts.filter(w => {
                const date = new Date(w.completedAt || w.startedAt);
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return date >= weekAgo;
              }).length}
            </p>
          </div>
        </div>

        {/* Workouts List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-black dark:text-white">Тренировки</h2>

          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-gray-600 dark:text-gray-300">Загрузка...</p>
            </div>
          ) : workouts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
              <Dumbbell size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Пока нет тренировок
              </p>
              <Link
                href="/workout/new"
                className="inline-block px-6 py-3 bg-electric-lime text-nubo-dark rounded-xl font-semibold card-hover"
              >
                Начать тренировку
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <Link
                  key={workout.id}
                  href={`/workout/summary?workoutId=${workout.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm card-hover"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-black dark:text-white">{workout.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDateShort(new Date(workout.completedAt || workout.startedAt))}
                      </p>
                    </div>
                    {workout.duration && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                        <Clock size={16} />
                        <span>{formatDuration(workout.duration)}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">Упражнений</p>
                      <p className="font-semibold text-black dark:text-white">{workout.exercises?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">Подходов</p>
                      <p className="font-semibold text-black dark:text-white">{workout.totalSets || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">Объем</p>
                      <p className="font-semibold text-black dark:text-white">{workout.totalVolume || 0} кг</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Нижние кнопки навигации */}
      <div className="fixed bottom-0 left-0 right-0 grid grid-cols-3 gap-3 p-4 safe-bottom bg-white dark:bg-nubo-dark border-t border-gray-200 dark:border-gray-700 z-50">
        <Link
          href="/history"
          className="bg-electric-lime text-nubo-dark rounded-2xl p-4 flex flex-col items-center justify-center space-y-2"
        >
          <Calendar size={24} className="text-nubo-dark" />
          <span className="text-xs font-medium text-center text-nubo-dark">
            История
          </span>
        </Link>

        <button
          onClick={() => {
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
          }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 card-hover border border-gray-200 dark:border-gray-700"
        >
          <Dumbbell size={24} className="text-gray-700 dark:text-white" />
          <span className="text-xs font-medium text-gray-700 dark:text-white text-center">
            Начать
          </span>
        </button>

        <Link
          href="/profile"
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 card-hover border border-gray-200 dark:border-gray-700"
        >
          {user?.photoUrl ? (
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

      {/* Calendar Modal */}
      {showCalendar && (
        <WorkoutCalendar
          workouts={workouts}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}
