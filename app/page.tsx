// ============================================
// Главная страница - Экран блокировки
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [swipeY, setSwipeY] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY;

    if (deltaY > 0) {
      setSwipeY(Math.min(deltaY, 200));

      if (deltaY > 150 && !isUnlocking) {
        setIsUnlocking(true);
        setTimeout(() => {
          router.push('/home');
        }, 300);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isUnlocking) {
      setSwipeY(0);
    }
  };

  const handleClick = () => {
    setIsUnlocking(true);
    setTimeout(() => {
      router.push('/home');
    }, 300);
  };

  const currentTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

  const notificationOpacity = Math.max(0, 1 - swipeY / 100);
  const notificationScale = Math.max(0.9, 1 - swipeY / 400);

  return (
    <div
      className="h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black flex flex-col items-center justify-center relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Фоновая текстура */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIi8+PC9nPjwvc3ZnPg==')] opacity-20" />

      {/* Время */}
      <div className="text-white text-center mb-16 z-10">
        <div className="text-8xl font-extralight tracking-tight mb-3" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {currentTime}
        </div>
        <div className="text-lg text-slate-400 font-light capitalize">
          {currentDate}
        </div>
      </div>

      {/* Уведомление */}
      <div
        className="mb-20 px-4 w-full max-w-md z-10"
        style={{
          transform: `translateY(-${swipeY}px) scale(${notificationScale})`,
          opacity: notificationOpacity,
          transition: isUnlocking ? 'all 0.3s ease-out' : 'none',
        }}
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-2xl">
          <div className="flex items-start gap-4">
            {/* Иконка */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Контент */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white text-base">Детектив</span>
                <span className="text-xs text-slate-400">сейчас</span>
              </div>
              <h3 className="text-white font-medium mb-1.5 leading-snug">
                Новое расследование
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                Произошло убийство директора компании "НейроТех". Откройте мессенджер для начала расследования.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Индикатор свайпа */}
      <div
        className="text-center cursor-pointer z-10"
        onClick={handleClick}
        style={{
          opacity: isUnlocking ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
        }}
      >
        <div className="text-slate-400 text-sm mb-4 font-light">
          Свайпните вверх или нажмите
        </div>

        {/* Анимированная иконка */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Пульсирующий круг */}
            <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" />

            {/* Основная кнопка */}
            <div className="relative w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:border-white/50 hover:scale-110">
              <svg
                className="w-8 h-8 text-white animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ animationDuration: '2s' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Прогресс свайпа */}
        {swipeY > 0 && (
          <div className="mt-6">
            <div className="w-32 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{ width: `${Math.min(100, (swipeY / 150) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {swipeY > 150 ? 'Отпустите' : `${Math.round((swipeY / 150) * 100)}%`}
            </div>
          </div>
        )}
      </div>

      {/* Индикатор разблокировки */}
      {isUnlocking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-white text-xl font-light animate-pulse">
            Открытие...
          </div>
        </div>
      )}
    </div>
  );
}
