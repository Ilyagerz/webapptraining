'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { getTelegramColorScheme } from '@/lib/telegram';

export function ThemeProvider() {
  const { theme, setTheme } = useAppStore();

  useEffect(() => {
    // Автоматически применяем тему из Telegram при загрузке
    const telegramTheme = getTelegramColorScheme();
    
    if (telegramTheme) {
      setTheme(telegramTheme);
    }

    // Применяем тему к документу
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return null;
}

