'use client';

import { WorkoutTemplate } from '@/types';
import { Dumbbell, Clock, Edit2, Play } from 'lucide-react';
import Link from 'next/link';

interface TemplateCardProps {
  template: WorkoutTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const totalSets = template.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const estimatedTime = template.exercises.length * 10; // Примерная оценка

  return (
    <div className="glass-effect rounded-xl p-4 card-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
          {template.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          )}
        </div>
        <div className="ml-4">
          <div className="w-10 h-10 rounded-full bg-electric-lime/20 flex items-center justify-center">
            <Dumbbell size={20} className="text-electric-lime" />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center space-x-1">
          <Dumbbell size={14} />
          <span>{template.exercises.length} упражнений</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock size={14} />
          <span>~{estimatedTime} мин</span>
        </div>
      </div>

      {template.usageCount > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xs text-muted-foreground">
            Выполнено {template.usageCount} раз
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/workout/start?templateId=${template.id}`}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-electric-lime text-nubo-dark rounded-lg font-medium card-hover"
        >
          <Play size={16} />
          <span>Начать</span>
        </Link>
        {!template.isSystemTemplate && (
          <Link
            href={`/templates/${template.id}/edit`}
            className="flex items-center justify-center space-x-2 px-4 py-2 glass-effect rounded-lg font-medium card-hover"
          >
            <Edit2 size={16} />
            <span>Изменить</span>
          </Link>
        )}
      </div>
    </div>
  );
}




