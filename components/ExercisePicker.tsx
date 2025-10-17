'use client';

import { useState, useEffect } from 'react';
import { X, Search, Dumbbell } from 'lucide-react';
import { getDefaultExercises, MUSCLE_GROUP_NAMES } from '@/lib/exercises-data';
import type { Exercise } from '@/types';

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');

  useEffect(() => {
    // Загружаем упражнения асинхронно
    const loadExercises = async () => {
      try {
        // Пытаемся использовать ExerciseDB
        const { getExercises } = await import('@/lib/exercises-data');
        const allExercises = await getExercises();
        setExercises(allExercises);
        setFilteredExercises(allExercises);
      } catch (error) {
        // Fallback на встроенную базу
        const allExercises = getDefaultExercises();
        setExercises(allExercises);
        setFilteredExercises(allExercises);
      }
    };
    
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
      <div className="w-full max-w-2xl max-h-[90vh] bg-background rounded-t-3xl sm:rounded-3xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-xl font-bold">Выбери упражнение</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск упражнения..."
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-effect border border-border/50 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Muscle Groups Filter */}
        <div className="p-4 border-b border-border/50 overflow-x-auto">
          <div className="flex space-x-2">
            {muscleGroups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedMuscleGroup(group)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  selectedMuscleGroup === group
                    ? 'bg-electric-lime text-nubo-dark'
                    : 'glass-effect hover:bg-muted/20'
                }`}
              >
                {group === 'all' ? 'Все' : MUSCLE_GROUP_NAMES[group]}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Упражнения не найдены</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => onSelect(exercise)}
                  className="w-full p-4 rounded-xl glass-effect hover:bg-muted/20 transition-colors text-left"
                >
                  <h3 className="font-semibold mb-1">{exercise.name}</h3>
                  <p className="text-sm text-muted-foreground">
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
