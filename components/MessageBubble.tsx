// ============================================
// MessageBubble Component
// Пузырь сообщения в чате
// ============================================

import React from 'react';
import { MessageBubbleProps, EMOTION_EMOJI } from '@/lib/types';

export default function MessageBubble({
  message,
  isPlayer,
  emotion,
  timestamp,
  image,
}: MessageBubbleProps) {
  const timeStr = timestamp.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isPlayer ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`
          max-w-[75%] rounded-lg px-3 py-2 shadow-sm
          ${
            isPlayer
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-white text-gray-900 rounded-bl-none'
          }
        `}
      >
        {/* Эмоция персонажа (только для не-игрока) */}
        {!isPlayer && emotion && emotion !== 'neutral' && (
          <div className="text-xs opacity-60 mb-0.5">
            {EMOTION_EMOJI[emotion]}
          </div>
        )}

        {/* Изображение (если есть) */}
        {image && (
          <div className="mb-2">
            <img
              src={image}
              alt="Attachment"
              className="rounded-lg max-w-full h-auto"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}

        {/* Текст сообщения */}
        <div className="whitespace-pre-wrap leading-relaxed text-sm">{message}</div>

        {/* Timestamp */}
        <div className={`text-xs mt-1 text-right ${
          isPlayer ? 'text-blue-100' : 'text-gray-400'
        }`}>
          {timeStr}
        </div>
      </div>
    </div>
  );
}
