'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Calendar, Clock, Dumbbell, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatDuration, formatDateShort } from '@/lib/utils';

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-effect border-b border-border/50 p-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">История</h1>
            <p className="text-sm text-muted-foreground">Все тренировки</p>
          </div>
          <Calendar size={24} className="text-electric-lime" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-effect rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Всего</p>
            <p className="text-2xl font-bold">{workouts.length}</p>
          </div>

          <div className="glass-effect rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Этот месяц</p>
            <p className="text-2xl font-bold">
              {workouts.filter(w => {
                const date = new Date(w.completedAt || w.startedAt);
                const now = new Date();
                return date.getMonth() === now.getMonth();
              }).length}
            </p>
          </div>

          <div className="glass-effect rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Эта неделя</p>
            <p className="text-2xl font-bold">
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
          <h2 className="text-lg font-semibold">Тренировки</h2>

          {loading ? (
            <div className="glass-effect rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : workouts.length === 0 ? (
            <div className="glass-effect rounded-xl p-8 text-center">
              <Dumbbell size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
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
                  href={`/workout/summary?id=${workout.id}`}
                  className="block glass-effect rounded-xl p-4 card-hover"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{workout.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDateShort(new Date(workout.completedAt || workout.startedAt))}
                      </p>
                    </div>
                    {workout.duration && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock size={16} />
                        <span>{formatDuration(workout.duration)}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Упражнений</p>
                      <p className="font-semibold">{workout.exercises?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Подходов</p>
                      <p className="font-semibold">{workout.totalSets || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Объем</p>
                      <p className="font-semibold">{workout.totalVolume || 0} кг</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
