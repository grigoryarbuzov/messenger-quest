// ============================================
// QUEST MESSENGER - Evidence System
// Система автоматического сбора улик
// ============================================

import { CharacterName } from './types';

export interface Evidence {
  id: string;
  title: string;
  description: string;
  source: CharacterName;
  timestamp: Date;
  category: 'alibi' | 'motive' | 'secret' | 'witness' | 'fact';
}

interface EvidenceKeywords {
  keywords: string[];
  evidence: Omit<Evidence, 'timestamp'>;
}

// База ключевых фраз для автоматического определения улик
// ВАЖНО: Все keywords должны присутствовать в сообщении (AND, не OR)
const EVIDENCE_DATABASE: EvidenceKeywords[] = [
  // ========== АННА ==========
  // Улика 1: Роман с Громовым (ЛОЖНЫЙ МОТИВ)
  {
    keywords: ['роман', 'громов', 'отношения'],
    evidence: {
      id: 'anna_romance',
      title: 'Тайный роман',
      description: 'У Анны был роман с Громовым последние полгода. Он оборвал отношения за неделю до смерти.',
      source: 'anna',
      category: 'secret',
    },
  },
  // Улика 2: Виктор у кабинета (КЛЮЧЕВАЯ)
  {
    keywords: ['виктор', 'кабинет', 'вечер'],
    evidence: {
      id: 'anna_saw_viktor',
      title: 'Свидетель: Виктор у кабинета',
      description: 'Анна видела Виктора Крылова выходящим из кабинета директора поздно вечером в пятницу (ночь убийства).',
      source: 'anna',
      category: 'witness',
    },
  },
  // Улика 3: Виски (деталь)
  {
    keywords: ['виски', 'бутылк', 'пил'],
    evidence: {
      id: 'anna_whisky',
      title: 'Странная привычка',
      description: 'Громов в последние недели часто пил виски (Macallan 18), хотя раньше никогда не пил.',
      source: 'anna',
      category: 'fact',
    },
  },

  // ========== БОРИС ==========
  // Улика 4: Камеры отключены
  {
    keywords: ['камер', 'отключ'],
    evidence: {
      id: 'boris_cameras',
      title: 'Камеры отключены',
      description: 'Камеры наблюдения были отключены с 22:00 до 01:00 в ночь убийства.',
      source: 'boris',
      category: 'fact',
    },
  },
  // Улика 5: Приказ Громова
  {
    keywords: ['громов', 'приказ', 'отключить'],
    evidence: {
      id: 'boris_order',
      title: 'Приказ от жертвы',
      description: 'Громов САМ приказал Борису отключить камеры, сказав что ждёт "важного человека".',
      source: 'boris',
      category: 'alibi',
    },
  },
  // Улика 6: Шантаж Виктора (КЛЮЧЕВАЯ)
  {
    keywords: ['виктор', 'шантаж'],
    evidence: {
      id: 'boris_blackmail',
      title: 'Шантаж Виктора',
      description: 'Борис слышал разговор: Виктор шантажировал Громова, требуя 30% компании и должность гендира, угрожая полицией.',
      source: 'boris',
      category: 'motive',
    },
  },
  // Улика 7: Предупреждение
  {
    keywords: ['среди своих', 'случится'],
    evidence: {
      id: 'boris_warning',
      title: 'Последние слова жертвы',
      description: 'За день до смерти Громов предупредил Бориса: "Если что-то случится — ищи среди своих".',
      source: 'boris',
      category: 'witness',
    },
  },

  // ========== ВИКТОР ==========
  // Улика 8: Виктор обвиняет Анну
  {
    keywords: ['анна', 'роман', 'ревность'],
    evidence: {
      id: 'viktor_blames_anna',
      title: 'Виктор обвиняет Анну',
      description: 'Виктор утверждает что Анна могла убить Громова из ревности после разрыва их романа.',
      source: 'viktor',
      category: 'motive',
    },
  },
  // Улика 9: Хищения (его мотив для шантажа)
  {
    keywords: ['аудит', 'хищен', 'миллион'],
    evidence: {
      id: 'viktor_audit',
      title: 'Обнаружены хищения',
      description: 'Виктор обнаружил что Громов выводил около 2 миллионов рублей через фиктивные контракты.',
      source: 'viktor',
      category: 'fact',
    },
  },
  // Улика 10: ПРИЗНАНИЕ (ВЫИГРЫШНАЯ)
  {
    keywords: ['убил', 'виски', 'яд'],
    evidence: {
      id: 'viktor_confession',
      title: '🔴 ПРИЗНАНИЕ УБИЙЦЫ',
      description: 'Виктор признался в убийстве! Он подсыпал яд (дигиталис) в виски Громова в пятницу вечером. Мотив: шантаж не сработал.',
      source: 'viktor',
      category: 'secret',
    },
  },

  // ========== АННА (АДРЕС - НЕПРАВИЛЬНЫЙ) ==========
  // Улика 11: Адрес от Анны (ЛОЖНЫЙ)
  {
    keywords: ['адрес', 'виктор', 'живёт', 'кирова'],
    evidence: {
      id: 'anna_fake_address',
      title: '❌ Адрес от Анны (ЛОЖНЫЙ)',
      description: 'Анна сказала что Виктор живёт на улице Кирова, 12. НО это ложь - Виктор ей угрожает, она боится.',
      source: 'anna',
      category: 'fact',
    },
  },

  // ========== БОРИС (АДРЕС - ПРАВИЛЬНЫЙ) ==========
  // Улика 12: Адрес от Бориса (ПРАВИЛЬНЫЙ)
  {
    keywords: ['адрес', 'виктор', 'живёт', 'красный проспект', '25'],
    evidence: {
      id: 'boris_real_address',
      title: '✅ Адрес от Бориса (ПРАВИЛЬНЫЙ)',
      description: 'Борис сказал что Виктор живёт на Красном проспекте, дом 25, квартира 48. Борис честный - это правда.',
      source: 'boris',
      category: 'fact',
    },
  },
];

/**
 * Анализирует сообщение на наличие улик
 * СТРОГАЯ ПРОВЕРКА - улика добавляется только если ВСЕ ключевые слова присутствуют
 */
export function detectEvidence(message: string, source: CharacterName): Evidence[] {
  const messageLower = message.toLowerCase();
  const detected: Evidence[] = [];

  for (const item of EVIDENCE_DATABASE) {
    // Проверяем что источник совпадает
    if (item.evidence.source !== source) continue;

    // ВАЖНО: Проверяем что ВСЕ ключевые слова присутствуют (через AND, а не OR)
    const hasAllKeywords = item.keywords.every(keyword =>
      messageLower.includes(keyword.toLowerCase())
    );

    if (hasAllKeywords) {
      detected.push({
        ...item.evidence,
        timestamp: new Date(),
      });
    }
  }

  return detected;
}

/**
 * Сохранить улики в LocalStorage
 */
export function saveEvidence(evidence: Evidence[]): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getAllEvidence();
    const combined = [...existing];

    // Добавляем только новые улики (по id)
    for (const ev of evidence) {
      if (!combined.find(e => e.id === ev.id)) {
        combined.push(ev);
      }
    }

    localStorage.setItem('quest_messenger_evidence', JSON.stringify(combined));
    console.log('✅ Улики сохранены:', evidence.map(e => e.title));
  } catch (error) {
    console.error('Ошибка сохранения улик:', error);
  }
}

/**
 * Получить все собранные улики
 */
export function getAllEvidence(): Evidence[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem('quest_messenger_evidence');
    if (!data) return [];

    const parsed = JSON.parse(data);
    // Восстанавливаем Date объекты
    return parsed.map((e: any) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }));
  } catch (error) {
    console.error('Ошибка загрузки улик:', error);
    return [];
  }
}

/**
 * Очистить все улики
 */
export function clearEvidence(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('quest_messenger_evidence');
}

/**
 * Получить количество улик по категориям
 */
export function getEvidenceStats(): Record<string, number> {
  const evidence = getAllEvidence();
  const stats: Record<string, number> = {
    alibi: 0,
    motive: 0,
    secret: 0,
    witness: 0,
    fact: 0,
  };

  evidence.forEach(e => {
    stats[e.category]++;
  });

  return stats;
}

/**
 * Проверить, достаточно ли улик для обвинения
 * Возвращает объект с результатом проверки
 */
export function checkAccusationReadiness(): {
  canAccuse: boolean;
  hasConfession: boolean;
  evidenceCount: number;
  missingEvidence: string[];
} {
  const evidence = getAllEvidence();
  const hasConfession = evidence.some(e => e.id === 'viktor_confession');
  const evidenceCount = evidence.length;

  // Минимальные требования для успешного обвинения
  const requiredEvidenceIds = [
    'boris_blackmail',   // Борис слышал шантаж Виктора (КЛЮЧЕВАЯ)
    'anna_saw_viktor',   // Анна видела Виктора у кабинета (КЛЮЧЕВАЯ)
  ];

  const hasRequiredEvidence = requiredEvidenceIds.filter(id =>
    evidence.some(e => e.id === id)
  );

  const missingEvidence = requiredEvidenceIds.filter(id =>
    !evidence.some(e => e.id === id)
  );

  // Для победы нужно либо признание, либо минимум 5 улик включая ОБЕ ключевые
  const canAccuse = hasConfession || (evidenceCount >= 5 && missingEvidence.length === 0);

  return {
    canAccuse,
    hasConfession,
    evidenceCount,
    missingEvidence,
  };
}

/**
 * Проверить, есть ли правильный адрес (от Бориса)
 */
export function hasCorrectAddress(): boolean {
  const evidence = getAllEvidence();
  return evidence.some(e => e.id === 'boris_real_address');
}

/**
 * Проверить адрес в сообщении Помощнику
 * Возвращает true если адрес правильный (Красный проспект, 25)
 */
export function checkAddressInMessage(message: string): 'correct' | 'wrong' | 'none' {
  const lowerMessage = message.toLowerCase();

  // Правильный адрес: Красный проспект, 25
  const correctKeywords = ['красный', 'проспект', '25'];
  const hasCorrect = correctKeywords.every(keyword => lowerMessage.includes(keyword));

  if (hasCorrect) {
    return 'correct';
  }

  // Неправильный адрес: Кирова, 12
  const wrongKeywords = ['кирова', '12'];
  const hasWrong = wrongKeywords.every(keyword => lowerMessage.includes(keyword));

  if (hasWrong) {
    return 'wrong';
  }

  return 'none';
}
