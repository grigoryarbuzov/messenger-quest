// ============================================
// Notes Page - Заметки с уликами и алиби
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Evidence, getAllEvidence, getEvidenceStats } from '@/lib/evidenceSystem';

type Tab = 'evidence' | 'alibi';

// Максимальное количество улик в игре
const MAX_EVIDENCE = 9; // 3 от Анны, 4 от Бориса, 2 от Виктора

export default function NotesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('evidence');
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
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-3 flex items-center justify-between md:rounded-t-xl">
          <button
            onClick={() => router.push('/home')}
            className="text-white hover:text-amber-100 transition-colors"
          >
            ← Меню
          </button>
          <h1 className="text-lg font-bold">Заметки</h1>
          <div className="w-16" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'evidence'
                ? 'text-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Улики ({evidence.length}/{MAX_EVIDENCE})
            {activeTab === 'evidence' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('alibi')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'alibi'
                ? 'text-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Алиби
            {activeTab === 'alibi' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'evidence' && (
            <div className="p-3">
              {/* Progress Bar */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Прогресс</span>
                  <span className="text-sm font-bold text-amber-600">
                    {evidence.length} / {MAX_EVIDENCE}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${(evidence.length / MAX_EVIDENCE) * 100}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-2 flex-wrap mb-3">
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

              {/* Evidence List */}
              {evidence.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Улик пока нет
                  </h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Допрашивайте подозреваемых в мессенджере
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {evidence.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
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

                      <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {getSourceName(item.source).charAt(0)}
                        </div>
                        <span className="text-xs text-gray-500">
                          <span className="font-medium">{getSourceName(item.source)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'alibi' && (
            <div className="p-3">
              <div className="space-y-3">
                {/* Анна */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      А
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Анна Сергеева</h3>
                      <p className="text-xs text-gray-500">Секретарь директора</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Утверждает, что ушла домой в 22:30. Видела Виктора около кабинета директора примерно в 23:00.
                    </p>
                  </div>
                </div>

                {/* Борис */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      Б
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Борис Петров</h3>
                      <p className="text-xs text-gray-500">Начальник охраны</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      По приказу Громова отключил камеры с 22:00 до 01:00. Был на посту всю ночь.
                    </p>
                  </div>
                </div>

                {/* Виктор */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      В
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Виктор Крылов</h3>
                      <p className="text-xs text-gray-500">Заместитель директора</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Утверждает, что был в кабинете до 23:00, обсуждал финансовые вопросы с Громовым.
                    </p>
                  </div>
                </div>
              </div>

              {/* Подсказка */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-amber-800">
                  💡 <strong>Совет:</strong> Сравнивайте показания с собранными уликами. Ищите противоречия!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
