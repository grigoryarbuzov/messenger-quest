// ============================================
// Home Screen - Главное меню смартфона
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearGameData } from '@/lib/localStorage';
import { getAllEvidence } from '@/lib/evidenceSystem';

export default function HomeScreen() {
  const router = useRouter();
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    loadEvidenceCount();
  }, []);

  const loadEvidenceCount = () => {
    const evidence = getAllEvidence();
    setEvidenceCount(evidence.length);
  };

  const handleReset = () => {
    clearGameData();
    setShowResetConfirm(false);
    router.push('/');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const currentTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black flex flex-col">
      {/* Статус бар */}
      <div className="px-4 py-2 flex justify-between items-center text-white text-xs">
        <span>{currentTime}</span>
        <div className="flex gap-2">
          <span>📶</span>
          <span>📳</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Заголовок */}
      <div className="px-6 py-8 text-center">
        <h1 className="text-white text-2xl font-bold mb-2">Quest Detective</h1>
        <p className="text-slate-400 text-sm">Дело об убийстве в НейроТех</p>
      </div>

      {/* Иконки приложений */}
      <div className="flex-1 px-8 py-4">
        <div className="grid grid-cols-3 gap-6">
          {/* Мессенджер */}
          <button
            onClick={() => router.push('/chats')}
            className="flex flex-col items-center gap-3 transition-transform active:scale-95"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center relative">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-white text-xs font-medium">Мессенджер</span>
          </button>

          {/* Заметки */}
          <button
            onClick={() => router.push('/notes')}
            className="flex flex-col items-center gap-3 transition-transform active:scale-95 relative"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg flex items-center justify-center relative">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {evidenceCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {evidenceCount}
                </div>
              )}
            </div>
            <span className="text-white text-xs font-medium">Заметки</span>
          </button>

          {/* Настройки */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex flex-col items-center gap-3 transition-transform active:scale-95"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-white text-xs font-medium">Сброс</span>
          </button>
        </div>
      </div>

      {/* Индикатор снизу */}
      <div className="px-6 pb-8 flex justify-center">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-white rounded-full" />
          <div className="w-2 h-2 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Модальное окно подтверждения сброса */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Сбросить игру?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Все диалоги, улики и прогресс будут удалены. Это действие нельзя отменить.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
