'use client';

import { useState } from 'react';
import { X, Plus, Upload, Dumbbell } from 'lucide-react';
import type { MuscleGroup, Equipment } from '@/types';

interface CreateCustomExerciseProps {
  onSave: (exercise: {
    name: string;
    nameEn?: string;
    muscleGroup: MuscleGroup;
    equipment: Equipment[];
    instructions?: string[];
    description?: string;
    gifUrl?: string;
  }) => void;
  onClose: () => void;
}

export function CreateCustomExercise({ onSave, onClose }: CreateCustomExerciseProps) {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('chest');
  const [equipment, setEquipment] = useState<Equipment[]>(['bodyweight']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [description, setDescription] = useState('');
  const [gifUrl, setGifUrl] = useState('');

  const muscleGroups: { value: MuscleGroup; label: string }[] = [
    { value: 'chest', label: 'Грудь' },
    { value: 'back', label: 'Спина' },
    { value: 'shoulders', label: 'Плечи' },
    { value: 'legs', label: 'Ноги' },
    { value: 'arms', label: 'Руки' },
    { value: 'abs', label: 'Пресс' },
    { value: 'cardio', label: 'Кардио' },
    { value: 'fullBody', label: 'Все тело' },
    { value: 'other', label: 'Другое' },
  ];

  const equipmentOptions: { value: Equipment; label: string }[] = [
    { value: 'barbell', label: 'Штанга' },
    { value: 'dumbbell', label: 'Гантели' },
    { value: 'machine', label: 'Тренажер' },
    { value: 'cable', label: 'Кабель' },
    { value: 'bodyweight', label: 'Собственный вес' },
    { value: 'kettlebell', label: 'Гиря' },
    { value: 'bands', label: 'Резинки' },
  ];

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleEquipmentToggle = (eq: Equipment) => {
    if (equipment.includes(eq)) {
      setEquipment(equipment.filter(e => e !== eq));
    } else {
      setEquipment([...equipment, eq]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Пожалуйста, введите название упражнения');
      return;
    }
    
    if (equipment.length === 0) {
      alert('Пожалуйста, выберите хотя бы один тип оборудования');
      return;
    }

    onSave({
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      muscleGroup,
      equipment,
      instructions: instructions.filter(i => i.trim()),
      description: description.trim(),
      gifUrl: gifUrl.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4">
      <div className="w-full h-[95vh] sm:max-w-2xl sm:h-auto sm:max-h-[90vh] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-electric-lime/10 rounded-xl">
              <Dumbbell className="text-electric-lime" size={24} />
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white">Создать упражнение</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Название упражнения *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Жим лежа"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-electric-lime focus:border-transparent"
              required
            />
          </div>

          {/* Английское название (опционально) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Английское название (опционально)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Например: Bench Press"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-electric-lime focus:border-transparent"
            />
          </div>

          {/* Группа мышц */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Группа мышц *
            </label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-electric-lime focus:border-transparent"
            >
              {muscleGroups.map(mg => (
                <option key={mg.value} value={mg.value}>{mg.label}</option>
              ))}
            </select>
          </div>

          {/* Оборудование */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Оборудование * (можно выбрать несколько)
            </label>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map(eq => (
                <button
                  key={eq.value}
                  type="button"
                  onClick={() => handleEquipmentToggle(eq.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    equipment.includes(eq.value)
                      ? 'bg-electric-lime text-nubo-dark'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание (опционально)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание упражнения"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-electric-lime focus:border-transparent resize-none"
            />
          </div>

          {/* Инструкции */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Инструкции (опционально)
              </label>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="flex items-center gap-1 px-3 py-1 text-sm text-electric-lime hover:bg-electric-lime/10 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Добавить шаг
              </button>
            </div>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={`Шаг ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-electric-lime focus:border-transparent"
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(index)}
                      className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* GIF URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ссылка на GIF (опционально)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={gifUrl}
                onChange={(e) => setGifUrl(e.target.value)}
                placeholder="https://example.com/exercise.gif"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-electric-lime focus:border-transparent"
              />
              <button
                type="button"
                className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Загрузить GIF"
              >
                <Upload size={20} />
              </button>
            </div>
            {gifUrl && (
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <img
                  src={gifUrl}
                  alt="Preview"
                  className="w-full h-48 object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-electric-lime text-nubo-dark rounded-xl font-medium hover:bg-electric-lime/90 transition-colors"
          >
            Сохранить упражнение
          </button>
        </div>
      </div>
    </div>
  );
}

