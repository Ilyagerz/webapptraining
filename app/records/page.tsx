'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Trophy, TrendingUp, Award, Target } from 'lucide-react';
import Link from 'next/link';

export default function RecordsPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // TODO: Загрузить реальные рекорды из API
    // Пока демо-данные
    setRecords([
      {
        id: '1',
        exerciseName: 'Жим штанги лежа',
        type: 'weight',
        value: 100,
        date: new Date('2024-01-15'),
      },
      {
        id: '2',
        exerciseName: 'Приседания',
        type: 'weight',
        value: 140,
        date: new Date('2024-01-10'),
      },
      {
        id: '3',
        exerciseName: 'Становая тяга',
        type: 'weight',
        value: 160,
        date: new Date('2024-01-05'),
      },
    ]);
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pb-6 pt-22 bg-white dark:bg-nubo-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-effect border-b border-border/50 p-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Рекорды</h1>
            <p className="text-sm text-muted-foreground">Твои достижения</p>
          </div>
          <Trophy size={24} className="text-electric-lime" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-effect rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={18} className="text-electric-lime" />
              <span className="text-sm text-muted-foreground">Всего</span>
            </div>
            <p className="text-2xl font-bold">{records.length}</p>
            <p className="text-xs text-muted-foreground">рекордов</p>
          </div>

          <div className="glass-effect rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-electric-lime" />
              <span className="text-sm text-muted-foreground">Этот месяц</span>
            </div>
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground">новых</p>
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Личные рекорды</h2>

          {records.length === 0 ? (
            <div className="glass-effect rounded-xl p-8 text-center">
              <Trophy size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Пока нет рекордов
              </p>
              <p className="text-sm text-muted-foreground">
                Завершай тренировки и устанавливай новые рекорды!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record, index) => (
                <div
                  key={record.id}
                  className="glass-effect rounded-xl p-4 flex items-center space-x-4"
                >
                  <div className="w-12 h-12 rounded-full bg-electric-lime/20 flex items-center justify-center flex-shrink-0">
                    <Trophy size={24} className="text-electric-lime" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{record.exerciseName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-electric-lime">
                      {record.value}
                    </p>
                    <p className="text-xs text-muted-foreground">кг</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="glass-effect rounded-xl p-4 border-2 border-electric-lime/20">
          <div className="flex items-start space-x-3">
            <Target size={20} className="text-electric-lime flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Как устанавливать рекорды?</h3>
              <p className="text-sm text-muted-foreground">
                Рекорды автоматически фиксируются при завершении тренировки. 
                Мы отслеживаем максимальный вес и объем по каждому упражнению.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
