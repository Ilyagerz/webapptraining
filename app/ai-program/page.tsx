'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
import {
  ArrowLeft,
  Target,
  Calendar,
  Dumbbell,
  TrendingUp,
  Zap,
  Clock,
  Info,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { generateAIProgram } from '@/lib/ai-program-generator';
import type { AIProgramRequest, Equipment } from '@/types';

export default function AIProgramPage() {
  const router = useRouter();
  const { user, setTemplates, templates } = useAppStore();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [goal, setGoal] = useState<'strength' | 'hypertrophy' | 'endurance' | 'weightLoss'>('hypertrophy');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [duration, setDuration] = useState(8);
  const [equipment, setEquipment] = useState<Equipment[]>(['barbell', 'dumbbell', 'machine']);
  const [restrictions, setRestrictions] = useState('');

  if (!user) {
    router.push('/');
    return null;
  }

  const goalOptions = [
    {
      value: 'strength' as const,
      label: 'Сила',
      description: 'Увеличение максимальной силы',
      icon: <Zap size={32} />,
      color: 'bg-red-500',
    },
    {
      value: 'hypertrophy' as const,
      label: 'Масса',
      description: 'Рост мышечной массы',
      icon: <Dumbbell size={32} />,
      color: 'bg-electric-lime',
    },
    {
      value: 'endurance' as const,
      label: 'Выносливость',
      description: 'Повышение выносливости',
      icon: <TrendingUp size={32} />,
      color: 'bg-blue-500',
    },
    {
      value: 'weightLoss' as const,
      label: 'Похудение',
      description: 'Снижение веса',
      icon: <Target size={32} />,
      color: 'bg-orange-500',
    },
  ];

  const experienceOptions = [
    { value: 'beginner' as const, label: 'Новичок', description: 'Меньше 1 года' },
    { value: 'intermediate' as const, label: 'Средний', description: '1-3 года' },
    { value: 'advanced' as const, label: 'Продвинутый', description: '3+ года' },
  ];

  const equipmentOptions: Array<{ value: Equipment; label: string }> = [
    { value: 'barbell', label: 'Штанга' },
    { value: 'dumbbell', label: 'Гантели' },
    { value: 'machine', label: 'Тренажеры' },
    { value: 'cable', label: 'Блоки' },
    { value: 'bodyweight', label: 'Свой вес' },
    { value: 'kettlebell', label: 'Гири' },
    { value: 'bands', label: 'Резинки' },
  ];

  const toggleEquipment = (eq: Equipment) => {
    if (equipment.includes(eq)) {
      setEquipment(equipment.filter((e) => e !== eq));
    } else {
      setEquipment([...equipment, eq]);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);

    const request: AIProgramRequest = {
      goal,
      experience,
      daysPerWeek,
      duration,
      equipment,
      restrictions: restrictions.trim() || undefined,
    };

    try {
      // Симуляция времени генерации для эффекта
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Генерация программы
      const program = generateAIProgram(request);

      // Сохраняем все шаблоны из программы
      const newTemplates = program.templates.map((template) => ({
        ...template,
        userId: user!.id,
      }));

      setTemplates([...templates, ...newTemplates]);

      // TODO: Сохранить программу на сервер
      // await fetch('/api/ai/programs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify({ program, templates: newTemplates }),
      // });

      alert(`Программа "${program.name}" создана! Добавлено ${newTemplates.length} шаблонов тренировок.`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error generating program:', error);
      alert('Ошибка генерации программы');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-nubo-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-nubo-dark border-b border-gray-200 dark:border-gray-800 safe-top z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-nubo-gray"
            >
              <ArrowLeft size={24} />
            </Link>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Sparkles size={24} className="text-electric-lime" />
                <h1 className="text-2xl font-bold">AI Генератор программ</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Персональная программа тренировок
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full mx-1 transition-colors ${
                s <= step ? 'bg-electric-lime' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold mb-2">Какая твоя цель?</h2>
              <p className="text-muted-foreground">
                Программа будет адаптирована под твою главную цель
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGoal(option.value)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    goal === option.value
                      ? 'border-electric-lime bg-electric-lime/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-electric-lime/50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-16 h-16 ${option.color} rounded-xl flex items-center justify-center text-white`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{option.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-electric-lime text-nubo-dark rounded-xl font-bold text-lg card-hover"
            >
              Далее
            </button>
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold mb-2">Твой опыт тренировок?</h2>
              <p className="text-muted-foreground">
                Это поможет подобрать оптимальную сложность
              </p>
            </div>

            <div className="space-y-3">
              {experienceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExperience(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    experience === option.value
                      ? 'border-electric-lime bg-electric-lime/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-electric-lime/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{option.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 ${
                        experience === option.value
                          ? 'border-electric-lime bg-electric-lime'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 glass-effect rounded-xl font-bold"
              >
                Назад
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-electric-lime text-nubo-dark rounded-xl font-bold card-hover"
              >
                Далее
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Schedule & Duration */}
        {step === 3 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold mb-2">Расписание</h2>
              <p className="text-muted-foreground">
                Сколько раз в неделю планируешь тренироваться?
              </p>
            </div>

            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Тренировок в неделю</span>
                <span className="text-2xl font-bold text-electric-lime">
                  {daysPerWeek}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-electric-lime"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Длительность программы</span>
                <span className="text-2xl font-bold text-electric-lime">
                  {duration} нед.
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="16"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-electric-lime"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>4</span>
                <span>8</span>
                <span>12</span>
                <span>16</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 glass-effect rounded-xl font-bold"
              >
                Назад
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-4 bg-electric-lime text-nubo-dark rounded-xl font-bold card-hover"
              >
                Далее
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Equipment & Restrictions */}
        {step === 4 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold mb-2">Оборудование</h2>
              <p className="text-muted-foreground">
                Что доступно в твоем зале?
              </p>
            </div>

            <div className="glass-effect rounded-2xl p-4">
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map((eq) => (
                  <button
                    key={eq.value}
                    onClick={() => toggleEquipment(eq.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      equipment.includes(eq.value)
                        ? 'bg-electric-lime text-nubo-dark'
                        : 'glass-effect hover:bg-gray-100 dark:hover:bg-nubo-gray'
                    }`}
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Ограничения (опционально)
              </label>
              <textarea
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                placeholder="Травмы, проблемы со здоровьем, упражнения которые нельзя делать..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:border-electric-lime resize-none"
                rows={4}
              />
            </div>

            <div className="glass-effect rounded-xl p-4 flex items-start space-x-3">
              <Info size={20} className="text-electric-lime flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                AI создаст персонализированную программу на основе твоих ответов.
                Программа будет включать готовые шаблоны тренировок с прогрессией
                нагрузки.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 glass-effect rounded-xl font-bold"
              >
                Назад
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || equipment.length === 0}
                className="flex-1 py-4 bg-electric-lime text-nubo-dark rounded-xl font-bold card-hover flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-nubo-dark border-t-transparent rounded-full animate-spin" />
                    <span>Генерация...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Создать программу</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

