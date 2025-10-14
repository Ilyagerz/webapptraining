import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

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
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
