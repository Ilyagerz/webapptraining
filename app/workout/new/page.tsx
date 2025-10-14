'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { getProgressionSuggestions } from '@/lib/auto-progression';
import { ProgressionSuggestions } from '@/components/ProgressionSuggestions';
import type { ProgressionSuggestion } from '@/lib/auto-progression';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import type { Workout, WorkoutTemplate } from '@/types';

export default function NewWorkoutPage() {
  const router = useRouter();
  const { user, templates, setActiveWorkout } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState<WorkoutTemplate[]>([]);
  const [progressionSuggestions, setProgressionSuggestions] = useState<ProgressionSuggestion[]>([]);
  const [showProgressionModal, setShowProgressionModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    setFilteredTemplates(
      templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [user, templates, searchQuery]);

  const startEmptyWorkout = () => {
    const newWorkout: Workout = {
      id: generateId(),
      userId: user!.id,
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
  };

  const startFromTemplate = (template: WorkoutTemplate) => {
    // TODO: Проверить историю тренировок и показать рекомендации по прогрессии
    // const suggestions = getProgressionSuggestions([], template.exercises, 'double');
    // if (suggestions.length > 0) {
    //   setProgressionSuggestions(suggestions);
    //   setShowProgressionModal(true);
    //   return;
    // }

    const newWorkout: Workout = {
      id: generateId(),
      userId: user!.id,
      templateId: template.id,
      templateName: template.name,
      name: template.name,
      startedAt: new Date(),
      exercises: template.exercises.map(te => ({
        id: generateId(),
        exerciseId: te.exerciseId,
        exercise: te.exercise,
        sets: Array.from({ length: te.sets }, (_, i) => ({
          id: generateId(),
          setNumber: i + 1,
          weight: te.targetWeight,
          reps: undefined,
          isWarmup: false,
          completed: false,
          setType: 'standard' as const,
        })),
        notes: te.notes,
        superset: te.superset,
        restTimer: te.restTimer,
      })),
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
      isActive: true,
    };

    setActiveWorkout(newWorkout);
    router.push('/workout/active');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-nubo-dark pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-nubo-dark border-b border-gray-200 dark:border-gray-800 safe-top z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-nubo-gray transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold">Начать тренировку</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Empty Workout */}
        <button
          onClick={startEmptyWorkout}
          className="w-full glass-effect rounded-2xl p-6 text-left card-hover card-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Пустая тренировка</h3>
              <p className="text-sm text-muted-foreground">
                Начни с нуля и добавляй упражнения по ходу
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-electric-lime flex items-center justify-center">
              <Plus size={24} className="text-nubo-dark" />
            </div>
          </div>
        </button>

        {/* Search Templates */}
        <div>
          <h2 className="text-xl font-bold mb-4">Или выбери шаблон</h2>
          
          {templates.length > 0 && (
            <div className="relative mb-4">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Поиск шаблонов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl glass-effect focus:outline-none focus:ring-2 focus:ring-electric-lime"
              />
            </div>
          )}

          <div className="space-y-3">
            {filteredTemplates.length === 0 ? (
              <div className="glass-effect rounded-xl p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Шаблоны не найдены'
                    : 'У тебя пока нет шаблонов'}
                </p>
                <Link
                  href="/templates/new"
                  className="inline-flex items-center px-6 py-3 bg-nubo-dark dark:bg-white text-white dark:text-nubo-dark rounded-xl font-medium card-hover"
                >
                  <Plus size={18} className="mr-2" />
                  Создать шаблон
                </Link>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => startFromTemplate(template)}
                  className="w-full glass-effect rounded-xl p-4 text-left card-hover card-shadow"
                >
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {template.exercises.length} упражнений •{' '}
                    {template.exercises.reduce((sum, e) => sum + e.sets, 0)}{' '}
                    подходов
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




