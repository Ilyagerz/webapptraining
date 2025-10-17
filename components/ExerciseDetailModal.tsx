'use client';

import { X, Info } from 'lucide-react';
import type { Exercise } from '@/types';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-background rounded-t-3xl sm:rounded-3xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-xl font-bold">{exercise.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* GIF Animation */}
          {exercise.gifUrl && (
            <div className="flex justify-center">
              <img
                src={exercise.gifUrl}
                alt={exercise.name}
                className="max-w-full h-auto rounded-xl"
                loading="lazy"
                onError={(e) => {
                  // Скрываем изображение если загрузка не удалась
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Description */}
          {exercise.description && (
            <div>
              <h3 className="font-semibold mb-2">Описание</h3>
              <p className="text-muted-foreground">{exercise.description}</p>
            </div>
          )}

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Техника выполнения</h3>
              <ol className="space-y-2">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="flex space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-electric-lime/20 text-electric-lime flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Info */}
          <div className="glass-effect rounded-xl p-4 border-2 border-electric-lime/20">
            <div className="flex items-start space-x-3">
              <Info size={20} className="text-electric-lime flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Группа мышц</h4>
                <p className="text-sm text-muted-foreground">{exercise.muscleGroup}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-electric-lime text-nubo-dark rounded-xl font-semibold card-hover"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
