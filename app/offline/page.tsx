'use client';

import { Wifi } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Wifi size={48} className="text-muted-foreground" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">Нет подключения</h1>
          <p className="text-muted-foreground">
            Проверь подключение к интернету. Некоторые функции доступны в оффлайн режиме.
          </p>
        </div>

        <button
          onClick={() => typeof window !== 'undefined' && window.location.reload()}
          className="px-8 py-3 bg-electric-lime text-nubo-dark rounded-xl font-bold card-hover"
        >
          Обновить
        </button>
      </div>
    </div>
  );
}


