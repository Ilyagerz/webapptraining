// Telegram Web App utilities

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export function getTelegramWebApp() {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp || null;
}

export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.Telegram?.WebApp?.initData;
}

export function getTelegramUser() {
  const tg = getTelegramWebApp();
  if (!tg || !tg.initDataUnsafe) return null;
  return tg.initDataUnsafe.user || null;
}

export function closeTelegramWebApp() {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.close();
  }
}

export function expandTelegramWebApp() {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.expand();
  }
}

export function setTelegramHeaderColor(color: string) {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.setHeaderColor(color);
  }
}

export function setTelegramBackgroundColor(color: string) {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.setBackgroundColor(color);
  }
}

export function showTelegramBackButton(callback?: () => void) {
  const tg = getTelegramWebApp();
  if (tg && tg.BackButton) {
    tg.BackButton.show();
    if (callback) {
      tg.BackButton.onClick(callback);
    }
  }
}

export function hideTelegramBackButton() {
  const tg = getTelegramWebApp();
  if (tg && tg.BackButton) {
    tg.BackButton.hide();
  }
}

export function showTelegramMainButton(text: string, callback?: () => void) {
  const tg = getTelegramWebApp();
  if (tg && tg.MainButton) {
    tg.MainButton.setText(text);
    tg.MainButton.show();
    if (callback) {
      tg.MainButton.onClick(callback);
    }
  }
}

export function hideTelegramMainButton() {
  const tg = getTelegramWebApp();
  if (tg && tg.MainButton) {
    tg.MainButton.hide();
  }
}

export function vibrateHaptic(type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
  const tg = getTelegramWebApp();
  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
}

export function notificationHaptic(type: 'error' | 'success' | 'warning') {
  const tg = getTelegramWebApp();
  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred(type);
  }
}

export function getTelegramColorScheme(): 'light' | 'dark' | null {
  const tg = getTelegramWebApp();
  if (!tg) return null;
  return tg.colorScheme === 'dark' ? 'dark' : 'light';
}
