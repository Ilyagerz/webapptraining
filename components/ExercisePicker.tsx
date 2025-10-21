'use client';

import { useState, useEffect } from 'react';
import { X, Search, Dumbbell, Plus, Info } from 'lucide-react';
import { getExercises, MUSCLE_GROUP_NAMES } from '@/lib/exercises-data';
import type { Exercise, MuscleGroup } from '@/types';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { CreateCustomExercise } from './CreateCustomExercise';
import { useAppStore } from '@/lib/store';

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const { customExercises, addCustomExercise } = useAppStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Загружаем упражнения асинхронно
    async function loadExercises() {
      try {
        const allExercises = await getExercises(customExercises);
        console.log(`✅ ExercisePicker: Загружено ${allExercises.length} упражнений (${customExercises.length} кастомных)`);
        setExercises(allExercises);
        setFilteredExercises(allExercises);
      } catch (error) {
        console.error('Ошибка загрузки упражнений:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadExercises();
  }, [customExercises]);

  useEffect(() => {
    let filtered = exercises;

    if (selectedMuscleGroup !== 'all') {
      filtered = filtered.filter(ex => ex.muscleGroup === selectedMuscleGroup);
    }

    if (searchQuery) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.nameEn?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
  }, [searchQuery, selectedMuscleGroup, exercises]);

  const muscleGroups: { key: MuscleGroup | 'all'; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'chest', label: 'Грудь' },
    { key: 'back', label: 'Спина' },
    { key: 'shoulders', label: 'Плечи' },
    { key: 'legs', label: 'Ноги' },
    { key: 'arms', label: 'Руки' },
    { key: 'abs', label: 'Пресс' },
    { key: 'cardio', label: 'Кардио' },
    { key: 'fullBody', label: 'Все тело' },
    { key: 'other', label: 'Другое' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Выбери упражнение {!loading && `(${filteredExercises.length})`}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="p-2 hover:bg-electric-lime hover:text-nubo-dark rounded-lg transition-colors bg-gray-100 dark:bg-gray-800"
              title="Создать своё упражнение"
            >
              <Plus size={24} className="text-gray-700 dark:text-white hover:text-nubo-dark" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-700 dark:text-white" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск упражнения..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-electric-lime dark:focus:border-electric-lime focus:outline-none text-black dark:text-white"
            />
          </div>
        </div>

        {/* Muscle Groups */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex space-x-2 overflow-x-auto no-scrollbar">
            {muscleGroups.map((group) => (
              <button
                key={group.key}
                onClick={() => setSelectedMuscleGroup(group.key)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  selectedMuscleGroup === group.key
                    ? 'bg-electric-lime text-nubo-dark'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-electric-lime"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Загрузка упражнений...</p>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-gray-600 dark:text-gray-300">Упражнения не найдены</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center gap-3 w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-electric-lime transition-colors"
                >
                  {/* GIF Thumbnail */}
                  {exercise.gifUrl && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Exercise Info */}
                  <button
                    onClick={() => onSelect(exercise)}
                    className="flex-1 text-left"
                  >
                    <h3 className="font-semibold mb-1 text-black dark:text-white">
                      {exercise.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {MUSCLE_GROUP_NAMES[exercise.muscleGroup]}
                    </p>
                  </button>

                  {/* Info Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExercise(exercise);
                    }}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Подробная информация"
                  >
                    <Info size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}

      {/* Create Custom Exercise Modal */}
      {showCreateForm && (
        <CreateCustomExercise
          onSave={(newExercise) => {
            addCustomExercise(newExercise);
            setShowCreateForm(false);
          }}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}
