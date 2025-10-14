'use client';

import { X, TrendingUp } from 'lucide-react';
import type { ProgressionSuggestion } from '@/lib/auto-progression';

interface ProgressionSuggestionsProps {
  suggestions: ProgressionSuggestion[];
  onApply: (suggestion: ProgressionSuggestion) => void;
  onClose: () => void;
}

export function ProgressionSuggestions({
  suggestions,
  onApply,
  onClose,
}: ProgressionSuggestionsProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <TrendingUp size={24} className="text-electric-lime" />
            <h2 className="text-xl font-bold">Рекомендации по прогрессии</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="glass-effect rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {suggestion.type === 'linear' && 'Линейная прогрессия'}
                  {suggestion.type === 'double' && 'Двойная прогрессия'}
                  {suggestion.type === 'wave' && 'Волновая периодизация'}
                  {suggestion.type === 'deload' && 'Разгрузка'}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-electric-lime">
                    {suggestion.weight}
                  </p>
                  <p className="text-xs text-muted-foreground">кг</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-electric-lime">
                    {suggestion.reps}
                  </p>
                  <p className="text-xs text-muted-foreground">повторений</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{suggestion.reason}</p>

              <button
                onClick={() => onApply(suggestion)}
                className="w-full px-4 py-2 bg-electric-lime text-nubo-dark rounded-xl font-semibold card-hover"
              >
                Применить
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 glass-effect rounded-xl font-semibold card-hover"
        >
          Пропустить
        </button>
      </div>
    </div>
  );
}
