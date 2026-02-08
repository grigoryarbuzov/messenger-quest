// ============================================
// Investigation Page
// Страница расследования с собранными уликами
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Evidence, getAllEvidence, getEvidenceStats } from '@/lib/evidenceSystem';

export default function InvestigationPage() {
  const router = useRouter();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [stats, setStats] = useState({ alibi: 0, motive: 0, secret: 0, witness: 0, fact: 0 });

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = () => {
    const allEvidence = getAllEvidence();
    setEvidence(allEvidence);
    setStats(getEvidenceStats());
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'alibi': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'motive': return 'bg-red-100 text-red-700 border-red-300';
      case 'secret': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'witness': return 'bg-green-100 text-green-700 border-green-300';
      case 'fact': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'alibi': return 'Алиби';
      case 'motive': return 'Мотив';
      case 'secret': return 'Секрет';
      case 'witness': return 'Свидетель';
      case 'fact': return 'Факт';
      default: return category;
    }
  };

  const getSourceName = (source: string) => {
    switch (source) {
      case 'anna': return 'Анна Сергеева';
      case 'boris': return 'Борис Петров';
      case 'viktor': return 'Виктор Крылов';
      default: return source;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 md:bg-gray-200 md:p-4">
      <div className="h-full flex flex-col bg-white md:max-w-md md:mx-auto md:rounded-xl md:shadow-2xl md:border md:border-gray-300 md:overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 flex items-center justify-between md:rounded-t-xl">
          <button
            onClick={() => router.push('/chats')}
            className="text-white hover:text-blue-100 transition-colors"
          >
            ← Чаты
          </button>
          <h1 className="text-lg font-bold">Расследование</h1>
          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Stats */}
        <div className="bg-white p-3 border-b border-gray-200">
          <div className="flex gap-2 flex-wrap">
            <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-xs text-blue-600 font-medium">Алиби: {stats.alibi}</span>
            </div>
            <div className="px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
              <span className="text-xs text-red-600 font-medium">Мотивы: {stats.motive}</span>
            </div>
            <div className="px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-xs text-purple-600 font-medium">Секреты: {stats.secret}</span>
            </div>
            <div className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
              <span className="text-xs text-green-600 font-medium">Свидетели: {stats.witness}</span>
            </div>
            <div className="px-3 py-1.5 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-xs text-yellow-600 font-medium">Факты: {stats.fact}</span>
            </div>
          </div>
        </div>

        {/* Evidence List */}
        <div className="flex-1 overflow-y-auto p-3">
          {evidence.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Улик пока нет
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Общайтесь с подозреваемыми, чтобы собрать информацию о деле
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {evidence.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Category Badge */}
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {getCategoryName(item.category)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Source */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {getSourceName(item.source).charAt(0)}
                    </div>
                    <span className="text-xs text-gray-500">
                      Источник: <span className="font-medium">{getSourceName(item.source)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
