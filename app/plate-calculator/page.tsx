'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Calculator } from 'lucide-react';
import Link from 'next/link';
import { calculatePlates } from '@/lib/utils';

export default function PlateCalculatorPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [targetWeight, setTargetWeight] = useState(60);
  const [barWeight, setBarWeight] = useState(20);
  const [plates, setPlates] = useState<{ weight: number; count: number }[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
  }, [user]);

  useEffect(() => {
    const result = calculatePlates(targetWeight, barWeight);
    setPlates(result.plates);
  }, [targetWeight, barWeight]);

  if (!user) {
    return null;
  }

  const totalPlatesWeight = plates.reduce((sum, p) => sum + p.weight * p.count, 0) * 2;
  const actualWeight = barWeight + totalPlatesWeight;

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-effect border-b border-border/50 p-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Калькулятор блинов</h1>
            <p className="text-sm text-muted-foreground">Для штанги</p>
          </div>
          <Calculator size={24} className="text-electric-lime" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Inputs */}
        <div className="glass-effect rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Целевой вес (кг)
            </label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
              min="0"
              step="2.5"
              className="w-full px-4 py-3 rounded-xl glass-effect border border-border/50 focus:border-electric-lime focus:outline-none text-center text-2xl font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Вес грифа (кг)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 20, 25].map((weight) => (
                <button
                  key={weight}
                  onClick={() => setBarWeight(weight)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                    barWeight === weight
                      ? 'bg-electric-lime text-nubo-dark'
                      : 'glass-effect hover:bg-muted/20'
                  }`}
                >
                  {weight} кг
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="glass-effect rounded-2xl p-6 border-2 border-electric-lime/20">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Итоговый вес</p>
            <p className="text-5xl font-bold text-electric-lime">{actualWeight}</p>
            <p className="text-sm text-muted-foreground mt-1">кг</p>
          </div>

          {Math.abs(actualWeight - targetWeight) > 0.1 && (
            <div className="text-center text-sm text-muted-foreground mb-4">
              {actualWeight < targetWeight ? (
                <span>На {(targetWeight - actualWeight).toFixed(1)} кг меньше цели</span>
              ) : (
                <span>На {(actualWeight - targetWeight).toFixed(1)} кг больше цели</span>
              )}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium text-center">На каждую сторону:</p>
            
            {plates.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Только гриф
              </p>
            ) : (
              <div className="space-y-2">
                {plates.map((plate, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{
                          backgroundColor: `hsl(${(plate.weight / 25) * 120}, 70%, 50%)`,
                          color: 'white',
                        }}
                      >
                        {plate.weight}
                      </div>
                      <span className="font-medium">{plate.weight} кг</span>
                    </div>
                    <span className="text-2xl font-bold">× {plate.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visual Representation */}
        <div className="glass-effect rounded-2xl p-6">
          <p className="text-sm font-medium text-center mb-4">Визуализация</p>
          
          <div className="flex items-center justify-center space-x-1">
            {/* Left plates */}
            <div className="flex items-center space-x-1">
              {plates.map((plate, plateIndex) =>
                Array.from({ length: plate.count }).map((_, countIndex) => (
                  <div
                    key={`left-${plateIndex}-${countIndex}`}
                    className="rounded"
                    style={{
                      width: `${Math.max(20, plate.weight / 2)}px`,
                      height: `${Math.max(40, plate.weight * 2)}px`,
                      backgroundColor: `hsl(${(plate.weight / 25) * 120}, 70%, 50%)`,
                    }}
                  />
                ))
              )}
            </div>

            {/* Bar */}
            <div className="w-32 h-2 bg-muted rounded-full" />

            {/* Right plates */}
            <div className="flex items-center space-x-1">
              {plates.map((plate, plateIndex) =>
                Array.from({ length: plate.count }).map((_, countIndex) => (
                  <div
                    key={`right-${plateIndex}-${countIndex}`}
                    className="rounded"
                    style={{
                      width: `${Math.max(20, plate.weight / 2)}px`,
                      height: `${Math.max(40, plate.weight * 2)}px`,
                      backgroundColor: `hsl(${(plate.weight / 25) * 120}, 70%, 50%)`,
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="glass-effect rounded-xl p-4 border-2 border-electric-lime/20">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Совет:</strong> Калькулятор автоматически подбирает оптимальную комбинацию блинов. 
            Доступные веса: 25, 20, 15, 10, 5, 2.5, 1.25 кг.
          </p>
        </div>
      </div>
    </div>
  );
}
