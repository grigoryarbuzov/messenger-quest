// ============================================
// QUEST MESSENGER - Accusation System
// Система финального обвинения
// ============================================

export interface AccusationRequirements {
  minEvidence: number;
  requiredEvidence: string[];
  requiredTriggers: string[];
}

export const ACCUSATION_REQUIREMENTS: AccusationRequirements = {
  minEvidence: 5, // Минимум 5 улик для обвинения
  requiredEvidence: [
    'boris_blackmail',   // Борис слышал шантаж Виктора (КЛЮЧЕВАЯ)
    'anna_saw_viktor',   // Анна видела Виктора у кабинета (КЛЮЧЕВАЯ)
  ],
  requiredTriggers: [], // Триггеры не требуются для обвинения
};

export const ACCUSATION_MESSAGES_LIMIT = 10;

// Ключевые слова для детектирования адреса в ответе Виктора
export const ADDRESS_KEYWORDS = [
  'нейротех',
  'новосибирск',
  'офис',
  'адрес',
  'улица',
  'академгородок',
];

/**
 * Проверить можно ли выдвинуть обвинение
 */
export function canAccuse(
  evidence: string[],
  triggers: string[]
): { canAccuse: boolean; missing: string[] } {
  const missing: string[] = [];

  // Проверка обязательных улик
  for (const req of ACCUSATION_REQUIREMENTS.requiredEvidence) {
    if (!evidence.includes(req)) {
      missing.push(`Улика: ${req}`);
    }
  }

  // Проверка триггеров
  for (const req of ACCUSATION_REQUIREMENTS.requiredTriggers) {
    if (!triggers.includes(req)) {
      missing.push(`Триггер: ${req}`);
    }
  }

  const canAccuse =
    missing.length === 0 &&
    evidence.length >= ACCUSATION_REQUIREMENTS.minEvidence;

  return { canAccuse, missing };
}

/**
 * Детектировать адрес в сообщении Виктора
 */
export function detectAddressInMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Проверяем наличие минимум 2 ключевых слов
  const matchCount = ADDRESS_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword.toLowerCase())
  ).length;

  return matchCount >= 2;
}

/**
 * Рассчитать увеличение уровня паники
 */
export function calculatePanicIncrease(message: string, currentPanic: number): number {
  const lower = message.toLowerCase();
  let increase = 10; // базовый рост

  // Бонусы за правильную психологию
  if (lower.includes('полиция') || lower.includes('менты')) increase += 15;
  if (lower.includes('знаю где ты') || lower.includes('найдут')) increase += 20;
  if (lower.includes('помогу') || lower.includes('вместе')) increase += 10;
  if (lower.includes('куда') || lower.includes('адрес') || lower.includes('где')) increase += 5;
  if (lower.includes('окружили') || lower.includes('перекрыли')) increase += 25;

  // После 50 паники - ускоренный рост
  if (currentPanic >= 50) {
    increase *= 1.5;
  }

  return Math.floor(increase);
}
