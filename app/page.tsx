'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getTelegramWebApp } from '@/lib/telegram';

export default function Home() {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const authenticateUser = async () => {
      // Даем время Telegram SDK загрузиться
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const tg = getTelegramWebApp();
      
      console.log('🔍 Telegram WebApp:', tg);
      console.log('🔍 initData:', tg?.initData);
      console.log('🔍 initDataUnsafe:', tg?.initDataUnsafe);
      
      if (tg && tg.initData) {
        // Авторизация через Telegram
        console.log('✅ Telegram Web App detected, authenticating...');
        
        try {
          const response = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ initData: tg.initData }),
          });

          console.log('📡 Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Auth successful:', data.user);
            setUser(data.user);
            router.push('/dashboard');
          } else {
            const errorData = await response.json();
            console.error('❌ Auth failed:', errorData);
            setError(errorData.error || 'Ошибка авторизации');
            setLoading(false);
          }
        } catch (error) {
          console.error('❌ Auth error:', error);
          setError('Ошибка подключения к серверу');
          setLoading(false);
        }
      } else {
        // PWA режим без Telegram
        console.log('ℹ️ Not in Telegram, checking for existing user...');
        if (user) {
          router.push('/dashboard');
        } else {
          // Перенаправляем на страницу входа
          router.push('/auth');
        }
        setLoading(false);
      }
    };

    authenticateUser();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Logo */}
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-electric-lime to-green-400 rounded-3xl flex items-center justify-center shadow-xl">
            <span className="text-4xl font-bold text-nubo-dark">N</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            NUBO Training
          </h1>
          <p className="text-muted-foreground">
            Твой персональный дневник тренировок
          </p>
        </div>

        {/* Loading / Error */}
        <div className="space-y-4">
          {loading ? (
            <>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-electric-lime rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-electric-lime rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-electric-lime rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-sm text-muted-foreground">
                Загрузка...
              </p>
            </>
          ) : error ? (
            <>
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => typeof window !== 'undefined' && window.location.reload()}
                className="px-6 py-3 bg-electric-lime text-nubo-dark rounded-xl font-bold"
              >
                Попробовать снова
              </button>
            </>
          ) : null}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="p-4 rounded-xl glass-effect">
            <div className="text-2xl mb-2">💪</div>
            <h3 className="font-semibold text-sm">Тренировки</h3>
            <p className="text-xs text-muted-foreground">Отслеживай прогресс</p>
          </div>
          <div className="p-4 rounded-xl glass-effect">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-sm">Статистика</h3>
            <p className="text-xs text-muted-foreground">Анализируй результаты</p>
          </div>
          <div className="p-4 rounded-xl glass-effect">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-sm">AI Программы</h3>
            <p className="text-xs text-muted-foreground">Персональные планы</p>
          </div>
          <div className="p-4 rounded-xl glass-effect">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold text-sm">Оффлайн</h3>
            <p className="text-xs text-muted-foreground">Работа без сети</p>
          </div>
        </div>
      </div>
    </div>
  );
}

