// ============================================
// QUEST MESSENGER - Emotion Utilities
// ============================================

import { Emotion } from './types';

/**
 * Получить эмоджи-индикатор на основе эмоции и уровня доверия
 */
export function getEmotionEmoji(emotion: Emotion, trust: number): string {
  // Если доверие критически низкое - показываем злость/блокировку
  if (trust < 10) {
    return '🚫';
  }

  // Основная логика по эмоциям
  switch (emotion) {
    case 'neutral':
      if (trust < 30) return '😐';
      if (trust < 60) return '🙂';
      return '😊';

    case 'defensive':
      if (trust < 30) return '😤';
      return '🛡️';

    case 'angry':
      return '😠';

    case 'sad':
      return '😢';

    case 'fearful':
      return '😰';

    case 'openness':
      if (trust >= 70) return '😊';
      return '🙂';

    case 'suspicious':
      return '🤨';

    default:
      return '😐';
  }
}

/**
 * Получить текстовое описание эмоции
 */
export function getEmotionLabel(emotion: Emotion): string {
  const labels: Record<Emotion, string> = {
    neutral: 'Нейтрален',
    defensive: 'Защищается',
    angry: 'Раздражён',
    sad: 'Грустит',
    fearful: 'Напуган',
    openness: 'Открыт',
    suspicious: 'Подозрительный',
  };

  return labels[emotion] || 'Неизвестно';
}

/**
 * Получить цвет индикатора на основе уровня доверия
 */
export function getTrustColor(trust: number): string {
  if (trust < 20) return 'text-red-400';
  if (trust < 40) return 'text-orange-400';
  if (trust < 60) return 'text-yellow-400';
  if (trust < 80) return 'text-green-400';
  return 'text-emerald-400';
}
