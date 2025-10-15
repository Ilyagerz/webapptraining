'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Scale,
  Ruler,
  Camera,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { ProgressChart } from '@/components/charts/ProgressChart';
import type { BodyMeasurement } from '@/types';

export default function MeasurementsPage() {
  const router = useRouter();
  const { user, measurements } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<keyof BodyMeasurement['measurements'] | 'weight' | 'bodyFat'>('weight');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
  }, [user]);

  if (!user) {
    return null;
  }

  // Группировка по метрикам для отображения
  const getLatestValue = (metric: keyof BodyMeasurement['measurements'] | 'weight' | 'bodyFat') => {
    if (measurements.length === 0) return null;
    const latest = measurements[0];
    if (metric === 'weight') return latest.weight;
    if (metric === 'bodyFat') return latest.bodyFat;
    return latest.measurements[metric];
  };

  const getPreviousValue = (metric: keyof BodyMeasurement['measurements'] | 'weight' | 'bodyFat') => {
    if (measurements.length < 2) return null;
    const previous = measurements[1];
    if (metric === 'weight') return previous.weight;
    if (metric === 'bodyFat') return previous.bodyFat;
    return previous.measurements[metric];
  };

  const getChange = (metric: keyof BodyMeasurement['measurements'] | 'weight' | 'bodyFat') => {
    const latest = getLatestValue(metric);
    const previous = getPreviousValue(metric);
    if (!latest || !previous) return null;
    return latest - previous;
  };

  const metrics = [
    { key: 'weight' as const, label: 'Вес', unit: 'кг', icon: Scale },
    { key: 'bodyFat' as const, label: '% жира', unit: '%', icon: TrendingDown },
    { key: 'chest' as const, label: 'Грудь', unit: 'см', icon: Ruler },
    { key: 'waist' as const, label: 'Талия', unit: 'см', icon: Ruler },
    { key: 'hips' as const, label: 'Бедра', unit: 'см', icon: Ruler },
    { key: 'biceps' as const, label: 'Бицепс', unit: 'см', icon: Ruler },
    { key: 'thighs' as const, label: 'Бедро', unit: 'см', icon: Ruler },
    { key: 'calves' as const, label: 'Икры', unit: 'см', icon: Ruler },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-nubo-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-nubo-dark border-b border-gray-200 dark:border-gray-800 safe-top z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/profile"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-nubo-gray"
              >
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-2xl font-bold">Замеры тела</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-electric-lime text-nubo-dark rounded-xl font-medium card-hover"
            >
              <Plus size={18} />
              <span>Добавить</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Latest Metrics Grid */}
        <div>
          <h2 className="text-lg font-bold mb-4">Текущие показатели</h2>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric) => {
              const latest = getLatestValue(metric.key);
              const change = getChange(metric.key);
              const Icon = metric.icon;

              return (
                <div
                  key={metric.key}
                  className={`glass-effect rounded-xl p-4 cursor-pointer transition-all ${
                    selectedMetric === metric.key
                      ? 'ring-2 ring-electric-lime'
                      : ''
                  }`}
                  onClick={() => setSelectedMetric(metric.key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={18} className="text-muted-foreground" />
                    {change !== null && (
                      <div
                        className={`flex items-center space-x-1 text-xs ${
                          change > 0
                            ? 'text-green-500'
                            : change < 0
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {change > 0 ? (
                          <TrendingUp size={12} />
                        ) : change < 0 ? (
                          <TrendingDown size={12} />
                        ) : (
                          <Minus size={12} />
                        )}
                        <span>{Math.abs(change).toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold">
                    {latest !== null && latest !== undefined ? latest.toFixed(1) : '-'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {metric.label} ({metric.unit})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graph */}
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">
              График: {metrics.find((m) => m.key === selectedMetric)?.label}
            </h3>
          </div>
          <div className="h-64">
            <ProgressChart
              data={{
                labels: measurements
                  .slice()
                  .reverse()
                  .filter((m) => {
                    const value = selectedMetric === 'weight'
                      ? m.weight || 0
                      : selectedMetric === 'bodyFat'
                      ? m.bodyFat || 0
                      : m.measurements[selectedMetric] || 0;
                    return value > 0;
                  })
                  .map((m) => 
                    new Date(m.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
                  ),
                values: measurements
                  .slice()
                  .reverse()
                  .map((m) => 
                    selectedMetric === 'weight'
                      ? m.weight || 0
                      : selectedMetric === 'bodyFat'
                      ? m.bodyFat || 0
                      : m.measurements[selectedMetric] || 0
                  )
                  .filter((v) => v > 0),
              }}
              label={metrics.find((m) => m.key === selectedMetric)?.label || ''}
              color="#C6FF00"
            />
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="text-lg font-bold mb-4">
            История замеров ({measurements.length})
          </h2>

          {measurements.length === 0 ? (
            <div className="glass-effect rounded-xl p-12 text-center">
              <Scale size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">Нет замеров</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Начни отслеживать свой прогресс
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-6 py-3 bg-electric-lime text-nubo-dark rounded-xl font-medium card-hover"
              >
                <Plus size={18} className="mr-2" />
                Добавить первый замер
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {measurements.map((measurement, index) => {
                const prevMeasurement = index < measurements.length - 1 ? measurements[index + 1] : null;

                const weightChange = prevMeasurement && measurement.weight && prevMeasurement.weight
                  ? measurement.weight - prevMeasurement.weight
                  : null;

                return (
                  <div key={measurement.id} className="glass-effect rounded-xl p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-semibold">{formatDate(measurement.date)}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(measurement.date).toLocaleDateString('ru-RU', {
                            weekday: 'long',
                          })}
                        </div>
                      </div>
                      {index === 0 && (
                        <span className="text-xs px-2 py-1 bg-electric-lime/20 text-electric-lime rounded-full">
                          Последний
                        </span>
                      )}
                    </div>

                    {/* Main Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {measurement.weight && (
                        <div className="p-3 bg-gray-50 dark:bg-nubo-dark rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">Вес</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold">{measurement.weight} кг</span>
                            {weightChange !== null && (
                              <span
                                className={`text-xs ${
                                  weightChange > 0
                                    ? 'text-green-500'
                                    : weightChange < 0
                                    ? 'text-red-500'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {weightChange > 0 ? '+' : ''}
                                {weightChange.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {measurement.bodyFat && (
                        <div className="p-3 bg-gray-50 dark:bg-nubo-dark rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">% жира</div>
                          <div className="text-xl font-bold">{measurement.bodyFat}%</div>
                        </div>
                      )}
                    </div>

                    {/* Body Measurements */}
                    {Object.keys(measurement.measurements).length > 0 && (
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {Object.entries(measurement.measurements).map(([key, value]) => {
                          if (!value) return null;
                          const metric = metrics.find((m) => m.key === key);
                          return (
                            <div key={key} className="text-center">
                              <div className="text-xs text-muted-foreground">{metric?.label}</div>
                              <div className="font-medium">{value} см</div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Notes */}
                    {measurement.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-sm text-muted-foreground">{measurement.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Measurement Modal */}
      {showAddForm && (
        <AddMeasurementModal onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
}

// Компонент для добавления замера
function AddMeasurementModal({ onClose }: { onClose: () => void }) {
  const { user, addMeasurement } = useAppStore();
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [biceps, setBiceps] = useState('');
  const [thighs, setThighs] = useState('');
  const [calves, setCalves] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const measurement: BodyMeasurement = {
      id: `meas-${Date.now()}`,
      userId: user!.id,
      date: new Date(),
      weight: weight ? parseFloat(weight) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      measurements: {
        chest: chest ? parseFloat(chest) : undefined,
        waist: waist ? parseFloat(waist) : undefined,
        hips: hips ? parseFloat(hips) : undefined,
        biceps: biceps ? parseFloat(biceps) : undefined,
        thighs: thighs ? parseFloat(thighs) : undefined,
        calves: calves ? parseFloat(calves) : undefined,
      },
      notes,
    };

    addMeasurement(measurement);

    // TODO: Сохранить на сервер

    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-nubo-gray rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-nubo-gray border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Новый замер</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-nubo-dark"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Main Metrics */}
            <div>
              <h3 className="font-semibold mb-3">Основные показатели</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Вес (кг)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-effect focus:outline-none focus:ring-2 focus:ring-electric-lime"
                    placeholder="75.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">% жира</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-effect focus:outline-none focus:ring-2 focus:ring-electric-lime"
                    placeholder="15.0"
                  />
                </div>
              </div>
            </div>

            {/* Body Measurements */}
            <div>
              <h3 className="font-semibold mb-3">Объемы (см)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Грудь</label>
                  <input
                    type="number"
                    step="0.1"
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-effect focus:outline-none focus:ring-2 focus:ring-electric-lime"
                    placeholder="100.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Талия</label>
                  <input
                    type="number"
                    step="0.1"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-effect focus:outline-none focus:ring-2 focus:ring-electric-lime"
                    placeholder="80.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Бедра</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hips}
                    onChange={(e) => setHips(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-effect focus:outline-none focus:ring-2 focus:ring-electric-lime"
                    placeholder="95.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Бицепс</label>
                  <input
                    type="number"
                    step="0.1"
                    value={biceps}
                    onChange={(e) => setBiceps(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-effect focus:outline-none focus:ring-2 focus:ring-electric-lime"
                    placeholder="35.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Бедро</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thighs}
                    onChange={(e) => setThighs(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-effect focus:outline-none focus:ring-2 focus:ring-electric-lime"
                    placeholder="55.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Икры</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calves}
                    onChange={(e) => setCalves(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-effect focus:outline-none focus:ring-2 focus:ring-electric-lime"
                    placeholder="38.0"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Заметки (опционально)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl glass-effect focus:outline-none focus:ring-2 focus:ring-electric-lime resize-none"
                placeholder="Состояние, изменения в питании и т.д."
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving || (!weight && !bodyFat && !chest && !waist && !hips && !biceps && !thighs && !calves)}
              className="w-full py-4 bg-electric-lime text-nubo-dark rounded-xl font-bold text-lg card-hover disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить замер'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
