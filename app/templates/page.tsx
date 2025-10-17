'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { ArrowLeft, Plus, Dumbbell, Calendar, Edit, Trash2 } from 'lucide-react';

export default function TemplatesPage() {
  const router = useRouter();
  const { user, templates, setTemplates } = useAppStore();

  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      router.push('/');
    }
  }, [user, router]);

  const handleDeleteTemplate = (templateId: string) => {
    const confirm = window.confirm('Удалить программу?');
    if (confirm) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  if (!user) {
    return null;
  }

  const userTemplates = templates.filter(t => t.userId === user.id || !t.userId);

  return (
    <div className="min-h-screen bg-white dark:bg-nubo-dark pb-24 pt-6">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-nubo-dark border-b border-gray-200 dark:border-gray-800 safe-top z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <ArrowLeft size={24} className="text-gray-700 dark:text-white cursor-pointer" />
              </Link>
              <h1 className="text-2xl font-bold text-black dark:text-white">Мои программы</h1>
            </div>
            <Link
              href="/templates/new"
              className="p-2 bg-electric-lime text-nubo-dark rounded-xl hover:bg-electric-lime/90 transition-colors"
            >
              <Plus size={24} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {userTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">Нет программ</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Создай свою первую программу тренировок
            </p>
            <Link
              href="/templates/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-electric-lime text-nubo-dark rounded-xl font-semibold card-hover"
            >
              <Plus size={20} />
              <span>Создать программу</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {userTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 card-hover"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-black dark:text-white mb-1">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Dumbbell size={16} />
                        <span>{template.exercises.length} упражнений</span>
                      </div>
                      {template.usageCount !== undefined && template.usageCount > 0 && (
                        <div className="flex items-center space-x-1">
                          <Calendar size={16} />
                          <span>Использовано: {template.usageCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/templates/${template.id}/edit`}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit size={20} className="text-gray-700 dark:text-white" />
                    </Link>
                    {!template.isSystemTemplate && (
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} className="text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

