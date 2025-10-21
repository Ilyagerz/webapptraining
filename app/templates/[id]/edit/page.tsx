'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { ExercisePicker } from '@/components/ExercisePicker';
import { generateId } from '@/lib/utils';
import type { TemplateExercise } from '@/types';

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const { user, templates, setTemplates } = useAppStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const template = templates.find(t => t.id === params.id);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (!template) {
      router.push('/templates');
      return;
    }

    setName(template.name);
    setDescription(template.description || '');
    setExercises(template.exercises);
  }, [user, template]);

  const handleAddExercise = (exercise: any) => {
    const newExercise: TemplateExercise = {
      id: generateId(),
      exerciseId: exercise.id,
      exercise,
      sets: 3,
      reps: 10,
      restTimer: user?.settings?.restTimerDefault || 90,
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

  const handleSave = () => {
    if (!name.trim()) {
      alert('Введи название программы');
      return;
    }

    if (exercises.length === 0) {
      alert('Добавь хотя бы одно упражнение');
      return;
    }

    const updatedTemplates = templates.map(t =>
      t.id === params.id
        ? {
            ...t,
            name: name.trim(),
            description: description.trim(),
            exercises,
            updatedAt: new Date(),
          }
        : t
    );
    
    setTemplates(updatedTemplates);
    router.push('/templates');
  };

  if (!user || !template) {
    return null;
  }

  return (
    <div className="min-h-screen pb-6 pt-22 bg-white dark:bg-nubo-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-effect border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/templates">
              <ArrowLeft size={24} className="text-black dark:text-white" />
            </Link>
            <h1 className="text-xl font-bold text-black dark:text-white">Редактировать</h1>
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
            <label className="block text-sm font-medium mb-2 text-black dark:text-white">
              Название программы *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-effect border border-border/50 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black dark:text-white">
              Описание (опционально)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl glass-effect border border-border/50 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none resize-none text-black dark:text-white"
            />
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-black dark:text-white">Упражнения</h2>

          <div className="space-y-3">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="glass-effect rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <GripVertical size={20} className="text-gray-600 dark:text-gray-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white">{exercise.exercise.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {exercise.exercise.muscleGroup}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {exercise.sets} подх. × {exercise.reps} повт. • Отдых: {exercise.restTimer} сек
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
              </div>
            ))}

            <button
              onClick={() => setShowExercisePicker(true)}
              className="w-full glass-effect rounded-xl p-4 flex items-center justify-center space-x-2 card-hover"
            >
              <Plus size={20} className="text-black dark:text-white" />
              <span className="font-medium text-black dark:text-white">Добавить упражнение</span>
            </button>
          </div>
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

