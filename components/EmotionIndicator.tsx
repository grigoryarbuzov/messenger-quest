// ============================================
// EmotionIndicator Component
// Индикатор текущей эмоции персонажа
// ============================================

import React from 'react';
import { EmotionIndicatorProps, EMOTION_EMOJI, Emotion } from '@/lib/types';

const EMOTION_LABELS: Record<Emotion, string> = {
  neutral: 'Нейтральное',
  defensive: 'Защищается',
  angry: 'Раздражён',
  sad: 'Грустный',
  fearful: 'Испуган',
  openness: 'Открыт',
  suspicious: 'Подозрительный',
};

const EMOTION_COLORS: Record<Emotion, string> = {
  neutral: 'text-gray-600',
  defensive: 'text-orange-600',
  angry: 'text-red-600',
  sad: 'text-blue-600',
  fearful: 'text-purple-600',
  openness: 'text-green-600',
  suspicious: 'text-yellow-600',
};

export default function EmotionIndicator({ emotion }: EmotionIndicatorProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
      <span className="text-lg">{EMOTION_EMOJI[emotion]}</span>
      <span className={`text-sm font-medium ${EMOTION_COLORS[emotion]}`}>
        {EMOTION_LABELS[emotion]}
      </span>
    </div>
  );
}
