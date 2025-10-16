'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Plus, Save, Trash2, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { ExercisePicker } from '@/components/ExercisePicker';
import { generateId } from '@/lib/utils';
import type { WorkoutTemplate, TemplateExercise } from '@/types';

export default function NewTemplatePage() {
  const router = useRouter();
  const { user, addTemplate } = useAppStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user]);

  const handleAddExercise = (exercise: any) => {
    const newExercise: TemplateExercise = {
      id: generateId(),
      exerciseId: exercise.id,
      exercise,
      sets: 3,
      reps: 10,
      restTimer: 90,
    };
    setExercises([...exercises, newExercise]);
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (id: string | undefined) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const handleUpdateExercise = (id: string | undefined, field: string, value: any) => {
    setExercises(exercises.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Введи название программы');
      return;
    }

    if (exercises.length === 0) {
      alert('Добавь хотя бы одно упражнение');
      return;
    }

    const template: WorkoutTemplate = {
      id: generateId(),
      userId: user!.id,
      name: name.trim(),
      description: description.trim(),
      exercises,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      isSystemTemplate: false,
    };

    addTemplate(template);
    router.push('/templates');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pb-6 pt-12 bg-white dark:bg-nubo-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-effect border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/templates">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold">Новая программа</h1>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-electric-lime text-nubo-dark rounded-xl font-semibold flex items-center space-x-2 card-hover"
          >
            <Save size={18} />
            <span>Сохранить</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Template Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Название программы *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Грудь + Трицепс"
              className="w-full px-4 py-3 rounded-xl glass-effect border border-border/50 focus:border-electric-lime focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Описание (опционально)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание программы"
              rows={3}
              className="w-full px-4 py-3 rounded-xl glass-effect border border-border/50 focus:border-electric-lime focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Упражнения</h2>

          {exercises.length === 0 ? (
            <div className="glass-effect rounded-xl p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Пока нет упражнений
              </p>
              <button
                onClick={() => setShowExercisePicker(true)}
                className="px-6 py-3 bg-electric-lime text-nubo-dark rounded-xl font-semibold card-hover"
              >
                Добавить первое упражнение
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="glass-effect rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <GripVertical size={20} className="text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{exercise.exercise.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {exercise.exercise.muscleGroup}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveExercise(exercise.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Подходы
                      </label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) =>
                          handleUpdateExercise(exercise.id, 'sets', parseInt(e.target.value) || 1)
                        }
                        min="1"
                        max="10"
                        className="w-full px-3 py-2 rounded-lg bg-muted/20 border border-border/50 focus:border-electric-lime focus:outline-none text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Повторения
                      </label>
                      <input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) =>
                          handleUpdateExercise(exercise.id, 'reps', parseInt(e.target.value) || 1)
                        }
                        min="1"
                        max="50"
                        className="w-full px-3 py-2 rounded-lg bg-muted/20 border border-border/50 focus:border-electric-lime focus:outline-none text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Отдых (сек)
                      </label>
                      <input
                        type="number"
                        value={exercise.restTimer}
                        onChange={(e) =>
                          handleUpdateExercise(exercise.id, 'restTimer', parseInt(e.target.value) || 60)
                        }
                        min="30"
                        max="300"
                        step="15"
                        className="w-full px-3 py-2 rounded-lg bg-muted/20 border border-border/50 focus:border-electric-lime focus:outline-none text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setShowExercisePicker(true)}
                className="w-full glass-effect rounded-xl p-4 flex items-center justify-center space-x-2 card-hover"
              >
                <Plus size={20} />
                <span className="font-medium">Добавить упражнение</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <ExercisePicker
          onSelect={handleAddExercise}
          onClose={() => setShowExercisePicker(false)}
        />
      )}
    </div>
  );
}
