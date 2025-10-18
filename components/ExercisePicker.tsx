'use client';

import { useState, useEffect } from 'react';
import { X, Search, Dumbbell } from 'lucide-react';
import { getExercises, MUSCLE_GROUP_NAMES } from '@/lib/exercises-data';
import type { Exercise, MuscleGroup } from '@/types';

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загружаем упражнения асинхронно
    async function loadExercises() {
      try {
        const allExercises = await getExercises();
        console.log(`✅ ExercisePicker: Загружено ${allExercises.length} упражнений`);
        setExercises(allExercises);
        setFilteredExercises(allExercises);
      } catch (error) {
        console.error('Ошибка загрузки упражнений:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadExercises();
  }, []);

  useEffect(() => {
    let filtered = exercises;

    if (selectedMuscleGroup !== 'all') {
      filtered = filtered.filter(ex => ex.muscleGroup === selectedMuscleGroup);
    }

    if (searchQuery) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
  }, [searchQuery, selectedMuscleGroup, exercises]);

  const muscleGroups = ['all', 'chest', 'back', 'shoulders', 'legs', 'arms', 'abs'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Выбери упражнение {!loading && `(${exercises.length})`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-700 dark:text-white" />
          </button>
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
                key={group}
                onClick={() => setSelectedMuscleGroup(group)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  selectedMuscleGroup === group
                    ? 'bg-electric-lime text-nubo-dark'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {group === 'all' ? 'Все' : MUSCLE_GROUP_NAMES[group as MuscleGroup]}
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
                <button
                  key={exercise.id}
                  onClick={() => onSelect(exercise)}
                  className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="font-semibold mb-1 text-black dark:text-white">{exercise.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {MUSCLE_GROUP_NAMES[exercise.muscleGroup]}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
