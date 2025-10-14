'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  Dumbbell,
  Plus,
  TrendingUp,
  Calendar,
  Target,
  Clock,
  Zap,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import { getWeeksData } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, templates } = useAppStore();
  const [weekData, setWeekData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Генерируем данные недели
    setWeekData(getWeeksData([], 7));
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-6 glass-effect">
        <h1 className="text-2xl font-bold mb-2">
          Привет, {user.firstName || user.username || user.email}! 👋
        </h1>
        <p className="text-muted-foreground">
          Готов к тренировке?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="p-6 space-y-4">
        <Link
          href="/workout/new"
          className="block p-6 rounded-2xl bg-gradient-to-r from-electric-lime to-electric-lime/80 text-nubo-dark card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Начать тренировку</h3>
              <p className="text-sm opacity-80">Создай новую или выбери шаблон</p>
            </div>
            <Plus size={32} className="opacity-80" />
          </div>
        </Link>

        {/* Weekly Activity */}
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar size={20} />
              Активность за неделю
            </h2>
          </div>
          
          <div className="flex justify-between items-end h-32 gap-2">
            {weekData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      day.workouts > 0
                        ? 'bg-electric-lime'
                        : 'bg-muted/20'
                    }`}
                    style={{
                      height: day.workouts > 0 ? `${(day.workouts / 2) * 100}%` : '20%',
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-effect rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-electric-lime" />
              <span className="text-sm text-muted-foreground">Прогресс</span>
            </div>
            <p className="text-2xl font-bold">+12%</p>
            <p className="text-xs text-muted-foreground">за месяц</p>
          </div>

          <div className="glass-effect rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-electric-lime" />
              <span className="text-sm text-muted-foreground">Время</span>
            </div>
            <p className="text-2xl font-bold">8ч 30м</p>
            <p className="text-xs text-muted-foreground">за неделю</p>
          </div>

          <div className="glass-effect rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-electric-lime" />
              <span className="text-sm text-muted-foreground">Тоннаж</span>
            </div>
            <p className="text-2xl font-bold">24.5т</p>
            <p className="text-xs text-muted-foreground">за месяц</p>
          </div>

          <div className="glass-effect rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={18} className="text-electric-lime" />
              <span className="text-sm text-muted-foreground">Рекорды</span>
            </div>
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground">новых</p>
          </div>
        </div>

        {/* Templates */}
        {templates.length > 0 && (
          <div className="glass-effect rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target size={20} />
                Мои программы
              </h2>
              <Link href="/templates" className="text-sm text-electric-lime">
                Все
              </Link>
            </div>
            
            <div className="space-y-3">
              {templates.slice(0, 3).map((template) => (
                <Link
                  key={template.id}
                  href={`/workout/new?templateId=${template.id}`}
                  className="block p-4 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors"
                >
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {template.exercises?.length || 0} упражнений
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/history"
            className="glass-effect rounded-2xl p-4 card-hover"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-sm">История</h3>
            <p className="text-xs text-muted-foreground">Все тренировки</p>
          </Link>

          <Link
            href="/ai-program"
            className="glass-effect rounded-2xl p-4 card-hover"
          >
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-sm">AI Программа</h3>
            <p className="text-xs text-muted-foreground">Создать план</p>
          </Link>

          <Link
            href="/measurements"
            className="glass-effect rounded-2xl p-4 card-hover"
          >
            <div className="text-2xl mb-2">📏</div>
            <h3 className="font-semibold text-sm">Замеры</h3>
            <p className="text-xs text-muted-foreground">Отслеживай тело</p>
          </Link>

          <Link
            href="/records"
            className="glass-effect rounded-2xl p-4 card-hover"
          >
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-semibold text-sm">Рекорды</h3>
            <p className="text-xs text-muted-foreground">Твои достижения</p>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-border/50">
        <div className="flex justify-around items-center h-16 px-4">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-electric-lime">
            <Dumbbell size={24} />
            <span className="text-xs font-medium">Главная</span>
          </Link>
          <Link href="/templates" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Target size={24} />
            <span className="text-xs">Программы</span>
          </Link>
          <Link href="/history" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Calendar size={24} />
            <span className="text-xs">История</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <div className="w-6 h-6 rounded-full bg-electric-lime/20 flex items-center justify-center text-xs font-bold">
              {user.firstName?.[0] || user.username?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs">Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
