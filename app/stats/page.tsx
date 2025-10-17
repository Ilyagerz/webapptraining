'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Flame, Dumbbell, Calendar, Trophy, Target, BarChart3 } from 'lucide-react';

interface Stats {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  streak: number;
  lastWorkout: Date | null;
  weeklyWorkouts: number[];
  monthlyVolume: { month: string; volume: number }[];
  topExercises: { name: string; count: number }[];
  progressData: { date: string; volume: number }[];
}

export default function StatsPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadStats();
  }, [user, router]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Получаем данные из localStorage (Zustand persist)
      const storeData = localStorage.getItem('nubo-training-store');
      if (!storeData) {
        setStats({
          totalWorkouts: 0,
          totalVolume: 0,
          totalSets: 0,
          totalReps: 0,
          streak: 0,
          lastWorkout: null,
          weeklyWorkouts: [0, 0, 0, 0, 0, 0, 0],
          monthlyVolume: [],
          topExercises: [],
          progressData: [],
        });
        setLoading(false);
        return;
      }

      const store = JSON.parse(storeData);
      const workouts = store.state?.workouts || [];

      // Подсчет статистики
      const totalWorkouts = workouts.length;
      let totalVolume = 0;
      let totalSets = 0;
      let totalReps = 0;
      
      // Карта упражнений для топа
      const exerciseCounts: { [key: string]: { name: string; count: number } } = {};

      workouts.forEach((workout: any) => {
        workout.exercises?.forEach((exercise: any) => {
          // Подсчет топа упражнений
          if (exercise.name) {
            if (!exerciseCounts[exercise.exerciseId]) {
              exerciseCounts[exercise.exerciseId] = { name: exercise.name, count: 0 };
            }
            exerciseCounts[exercise.exerciseId].count++;
          }

          exercise.sets?.forEach((set: any) => {
            if (set.completed) {
              totalSets++;
              totalReps += set.reps || 0;
              totalVolume += (set.weight || 0) * (set.reps || 0);
            }
          });
        });
      });

      // Активность за неделю
      const weeklyWorkouts = [0, 0, 0, 0, 0, 0, 0];
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Понедельник
      
      workouts.forEach((workout: any) => {
        const workoutDate = new Date(workout.completedAt);
        if (workoutDate >= startOfWeek) {
          const dayIndex = workoutDate.getDay() === 0 ? 6 : workoutDate.getDay() - 1;
          weeklyWorkouts[dayIndex]++;
        }
      });

      // Прогресс за 30 дней
      const progressData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        let dayVolume = 0;
        workouts.forEach((workout: any) => {
          const workoutDateStr = new Date(workout.completedAt).toISOString().split('T')[0];
          if (workoutDateStr === dateStr) {
            workout.exercises?.forEach((exercise: any) => {
              exercise.sets?.forEach((set: any) => {
                if (set.completed) {
                  dayVolume += (set.weight || 0) * (set.reps || 0);
                }
              });
            });
          }
        });
        
        progressData.push({
          date: date.toISOString(),
          volume: dayVolume,
        });
      }

      // Топ упражнений
      const topExercises = Object.values(exerciseCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Серия дней
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      while (true) {
        const hasWorkout = workouts.some((workout: any) => {
          const workoutDate = new Date(workout.completedAt);
          workoutDate.setHours(0, 0, 0, 0);
          return workoutDate.getTime() === currentDate.getTime();
        });
        
        if (!hasWorkout) break;
        
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      setStats({
        totalWorkouts,
        totalVolume,
        totalSets,
        totalReps,
        streak,
        lastWorkout: workouts.length > 0 ? new Date(workouts[0].completedAt) : null,
        weeklyWorkouts,
        monthlyVolume: [],
        topExercises,
        progressData,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        totalWorkouts: 0,
        totalVolume: 0,
        totalSets: 0,
        totalReps: 0,
        streak: 0,
        lastWorkout: null,
        weeklyWorkouts: [0, 0, 0, 0, 0, 0, 0],
        monthlyVolume: [],
        topExercises: [],
        progressData: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-nubo-dark flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  const maxWeeklyWorkouts = Math.max(...(stats?.weeklyWorkouts || [1]));
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="min-h-screen bg-white dark:bg-nubo-dark pb-24 pt-22">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/profile">
              <ArrowLeft size={24} className="text-gray-700 dark:text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-black dark:text-white">Статистика</h1>
          </div>
          <BarChart3 size={24} className="text-electric-lime" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Time Range Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {(['week', 'month', 'year'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                timeRange === range
                  ? 'bg-electric-lime text-nubo-dark shadow-lg'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50'
              }`}
            >
              {range === 'week' ? 'Неделя' : range === 'month' ? 'Месяц' : 'Год'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Workouts */}
          <div className="glass-effect rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-electric-lime/5 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <Dumbbell size={24} className="text-electric-lime" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">
              {stats?.totalWorkouts || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Тренировок</p>
          </div>

          {/* Streak */}
          <div className="glass-effect rounded-2xl p-4 border border-orange-500/30 bg-gradient-to-br from-orange-400/10 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <Flame size={24} className="text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">
              {stats?.streak || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Дней подряд</p>
          </div>

          {/* Total Volume */}
          <div className="glass-effect rounded-2xl p-4 border border-blue-500/30 bg-gradient-to-br from-blue-400/10 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">
              {Math.round((stats?.totalVolume || 0) / 1000)}k
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Объем (кг)</p>
          </div>

          {/* Total Sets */}
          <div className="glass-effect rounded-2xl p-4 border border-purple-500/30 bg-gradient-to-br from-purple-400/10 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <Target size={24} className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">
              {stats?.totalSets || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Подходов</p>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="glass-effect rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
          <h3 className="font-semibold mb-4 text-black dark:text-white flex items-center space-x-2">
            <Calendar size={20} className="text-electric-lime" />
            <span>Активность за неделю</span>
          </h3>
          <div className="flex items-end justify-between space-x-2 h-32">
            {stats?.weeklyWorkouts.map((count, index) => {
              const height = maxWeeklyWorkouts > 0 ? (count / maxWeeklyWorkouts) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                  <div className="relative w-full flex items-end justify-center flex-1">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        count > 0
                          ? 'bg-electric-lime'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      style={{
                        height: `${Math.max(height, 10)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {weekDays[index]}
                  </span>
                  {count > 0 && (
                    <span className="text-xs text-electric-lime font-bold">
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Chart */}
        <div className="glass-effect rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
          <h3 className="font-semibold mb-4 text-black dark:text-white flex items-center space-x-2">
            <TrendingUp size={20} className="text-electric-lime" />
            <span>Прогресс объема</span>
          </h3>
          {stats?.progressData && stats.progressData.length > 0 ? (
            <div className="h-48 flex items-end justify-between space-x-1">
              {stats.progressData.map((item, index) => {
                const maxVolume = Math.max(...stats.progressData.map(d => d.volume));
                const height = maxVolume > 0 ? (item.volume / maxVolume) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                    <div
                      className="w-full bg-gradient-to-t from-electric-lime to-green-400 rounded-t-lg"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
              Недостаточно данных
            </div>
          )}
        </div>

        {/* Top Exercises */}
        {stats?.topExercises && stats.topExercises.length > 0 && (
          <div className="glass-effect rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
            <h3 className="font-semibold mb-4 text-black dark:text-white flex items-center space-x-2">
              <Trophy size={20} className="text-electric-lime" />
              <span>Топ упражнений</span>
            </h3>
            <div className="space-y-3">
              {stats.topExercises.slice(0, 5).map((exercise, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-electric-lime/20 text-electric-lime flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-black dark:text-white">{exercise.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {exercise.count} тренировок
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

