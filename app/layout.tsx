import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'NUBO Training - Твой персональный тренер',
  description: 'Приложение для тренировок с AI генератором программ',
  manifest: '/manifest.json',
  themeColor: '#C6FF00',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NUBO Training',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <script src="https://telegram.org/js/telegram-web-app.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Telegram Web App SDK initialization
              window.addEventListener('load', function() {
                if (window.Telegram && window.Telegram.WebApp) {
                  console.log('✅ Telegram Web App SDK loaded');
                  window.Telegram.WebApp.ready();
                  window.Telegram.WebApp.expand();
                  console.log('📱 Telegram user:', window.Telegram.WebApp.initDataUnsafe?.user);
                } else {
                  console.log('ℹ️ Not running in Telegram Web App');
                }
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider />
        {children}
      </body>
    </html>
  );
}
