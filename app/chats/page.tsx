// ============================================
// Страница списка чатов
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CHARACTER_DISPLAY_NAMES } from '@/lib/types';
import { getEmotionEmoji } from '@/lib/emotionUtils';
import { loadCharacterData, loadMessages } from '@/lib/localStorage';

export default function ChatsPage() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [evidenceCount, setEvidenceCount] = useState(0);

  useEffect(() => {
    loadChats();
    loadEvidenceCount();
  }, []);

  const loadEvidenceCount = async () => {
    const { getAllEvidence } = await import('@/lib/evidenceSystem');
    const evidence = getAllEvidence();
    setEvidenceCount(evidence.length);
  };

  const loadChats = () => {
    const characters = [
      { id: 'helper', name: CHARACTER_DISPLAY_NAMES.helper, role: 'Ваш помощник' },
      { id: 'anna', name: CHARACTER_DISPLAY_NAMES.anna, role: 'Секретарь' },
      { id: 'boris', name: CHARACTER_DISPLAY_NAMES.boris, role: 'Начальник охраны' },
      { id: 'viktor', name: CHARACTER_DISPLAY_NAMES.viktor, role: 'Замдиректора' },
    ];

    const chatList = characters.map((char) => {
      const characterData = loadCharacterData(char.id as any);
      const messages = loadMessages(char.id as any);
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

      return {
        id: char.id,
        name: char.name,
        role: char.role,
        lastMessage: lastMessage?.text || 'Начните разговор...',
        lastMessageTime: lastMessage ? new Date(lastMessage.timestamp) : new Date(),
        unread: lastMessage && messages.length > 0 ? !lastMessage.isPlayer : false,
        hasMessages: messages.length > 0,
        trust: characterData?.trust || 100,
        emotion: characterData?.emotion || 'neutral',
      };
    });

    setChats(chatList);
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="h-screen flex flex-col bg-white md:bg-gray-100">
      {/* Хедер */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <h1 className="text-xl font-bold">Quest Messenger</h1>
          <button
            onClick={() => router.push('/investigation')}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 relative"
          >
            🔍 Расследование
            {evidenceCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {evidenceCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto md:max-w-2xl md:mx-auto md:w-full">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            className="bg-white border-b border-gray-200 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3"
          >
            {/* Аватар */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {chat.name.charAt(0)}
            </div>

            {/* Инфо */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-gray-900 truncate">
                  {chat.name}
                </h3>
                {chat.hasMessages && (
                  <span className="text-base">
                    {getEmotionEmoji(chat.emotion, chat.trust)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {chat.lastMessage}
              </p>
            </div>

            {/* Время и бейдж */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {chat.hasMessages && (
                <span className="text-xs text-gray-400">
                  {chat.lastMessageTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {chat.unread && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  1
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Подсказка */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 m-4">
          <p className="text-sm text-blue-800 text-center">
            💡 <strong>Совет:</strong> Начните с помощника — он расскажет о деле и даст контакты подозреваемых
          </p>
        </div>
      </div>
    </div>
  );
}
