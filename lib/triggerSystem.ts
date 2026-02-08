// ============================================
// QUEST MESSENGER - Trigger System
// Система триггеров и блокировок доверия
// ============================================

import { CharacterName } from './types';

// ============================================
// ИНТЕРФЕЙСЫ
// ============================================

export interface Trigger {
  id: string;
  name: string;
  description: string;
  conditions: {
    type: 'keyword' | 'trust_level' | 'evidence_collected' | 'trigger_activated';
    characterId?: CharacterName;
    keywords?: string[];
    minTrustLevel?: number;
    requiredEvidence?: string[];
    requiredTriggers?: string[];
  };
  effects: {
    type: 'unlock_trust' | 'reveal_info' | 'add_evidence' | 'enable_accusation';
    characterId?: CharacterName;
    unlockTrustCap?: number;
    revealInfo?: string;
    addEvidence?: string;
  }[];
  isActive: boolean;
  activatedAt?: Date;
}

export interface TrustLock {
  characterId: CharacterName;
  maxTrustLevel: number;
  requiredTrigger: string;
  description: string;
}

export interface EvidenceState {
  collected: string[];
  analyzed: string[];
  pending: string[];
}

// ============================================
// БЛОКИРОВКИ ДОВЕРИЯ
// ============================================

export const TRUST_LOCKS: Record<string, TrustLock> = {
  boris: {
    characterId: 'boris',
    maxTrustLevel: 60,
    requiredTrigger: 'boris_daughter_unlock',
    description: 'Борис закрыт. Нужен личный подход - узнай про его слабое место.',
  },
};

// ============================================
// ТРИГГЕРЫ ИГРЫ
// ============================================

export const GAME_TRIGGERS: Trigger[] = [
  // ========== БОРИС - РАЗБЛОКИРОВКА ЧЕРЕЗ ДОЧЬ ==========
  {
    id: 'boris_daughter_unlock',
    name: 'Борис открылся через дочь',
    description: 'Упоминание дочери Кати разблокирует доверие Бориса',
    conditions: {
      type: 'keyword',
      characterId: 'boris',
      keywords: ['дочь', 'катя', 'дочка', 'ребенок', 'семья'],
    },
    effects: [
      {
        type: 'unlock_trust',
        characterId: 'boris',
        unlockTrustCap: 100,
      },
    ],
    isActive: false,
  },

  // ========== ВИКТОР ОБВИНЯЕТ АННУ ==========
  {
    id: 'viktor_blames_anna',
    name: 'Виктор обвиняет Анну',
    description: 'Виктор рассказывает что Анна могла убить из ревности',
    conditions: {
      type: 'trust_level',
      characterId: 'viktor',
      minTrustLevel: 40,
    },
    effects: [
      {
        type: 'add_evidence',
        addEvidence: 'viktor_blames_anna',
      },
    ],
    isActive: false,
  },

  // ========== АННА РАСКРЫВАЕТ МОТИВ ВИКТОРА ==========
  {
    id: 'anna_reveals_viktor_motive',
    name: 'Анна опровергает Виктора',
    description: 'Анна показывает что у Виктора был мотив',
    conditions: {
      type: 'evidence_collected',
      characterId: 'anna',
      requiredEvidence: ['viktor_blames_anna'],
    },
    effects: [
      {
        type: 'add_evidence',
        addEvidence: 'viktor_has_motive',
      },
    ],
    isActive: false,
  },

  // ========== БОРИС РАССКАЗЫВАЕТ АДРЕС ==========
  {
    id: 'boris_reveals_address',
    name: 'Борис рассказал адрес офиса',
    description: 'Борис доверяет и рассказывает адрес для вызова полиции',
    conditions: {
      type: 'trust_level',
      characterId: 'boris',
      minTrustLevel: 80,
    },
    effects: [
      {
        type: 'add_evidence',
        addEvidence: 'office_address',
      },
    ],
    isActive: false,
  },

  // ========== ГОТОВНОСТЬ К ОБВИНЕНИЮ ==========
  {
    id: 'ready_to_accuse',
    name: 'Достаточно улик для обвинения',
    description: 'Собраны ключевые улики для обвинения Виктора',
    conditions: {
      type: 'evidence_collected',
      requiredEvidence: ['boris_blackmail', 'anna_saw_viktor', 'office_address'],
    },
    effects: [
      {
        type: 'enable_accusation',
      },
    ],
    isActive: false,
  },

  // ========== ГОТОВНОСТЬ ОБВИНИТЬ ВИКТОРА (ТРИГГЕР ДЛЯ ПОМОЩНИКА) ==========
  {
    id: 'ready_to_accuse_viktor',
    name: 'Готовность обвинить Виктора',
    description: 'Собрано достаточно улик против Виктора',
    conditions: {
      type: 'evidence_collected',
      requiredEvidence: ['anna_saw_viktor', 'boris_blackmail', 'viktor_audit'],
    },
    effects: [
      {
        type: 'reveal_info',
      },
    ],
    isActive: false,
  },
];

// ============================================
// МЕНЕДЖЕР ТРИГГЕРОВ
// ============================================

class TriggerManager {
  private triggers: Trigger[];
  private activatedTriggers: Set<string>;

  constructor() {
    this.triggers = [...GAME_TRIGGERS];
    this.activatedTriggers = new Set();
  }

  /**
   * Загрузить состояние из сохранения
   */
  loadState(activatedIds: string[]): void {
    this.activatedTriggers = new Set(activatedIds);
    this.triggers.forEach(trigger => {
      if (this.activatedTriggers.has(trigger.id)) {
        trigger.isActive = true;
      }
    });
  }

  /**
   * Проверить триггеры на активацию
   */
  checkTriggers(context: {
    characterId?: CharacterName;
    message?: string;
    trustLevel?: number;
    evidence?: string[];
  }): string[] {
    const newlyActivated: string[] = [];

    for (const trigger of this.triggers) {
      // Пропускаем уже активированные
      if (trigger.isActive) continue;

      // Проверяем условия
      const shouldActivate = this.checkConditions(trigger, context);

      if (shouldActivate) {
        trigger.isActive = true;
        trigger.activatedAt = new Date();
        this.activatedTriggers.add(trigger.id);
        newlyActivated.push(trigger.id);

        console.log(`🔓 Триггер активирован: ${trigger.name}`);
      }
    }

    return newlyActivated;
  }

  /**
   * Проверить условия триггера
   */
  private checkConditions(
    trigger: Trigger,
    context: {
      characterId?: CharacterName;
      message?: string;
      trustLevel?: number;
      evidence?: string[];
    }
  ): boolean {
    const { conditions } = trigger;

    // Проверка персонажа
    if (conditions.characterId && conditions.characterId !== context.characterId) {
      return false;
    }

    // Проверка по типу условия
    switch (conditions.type) {
      case 'keyword':
        if (!context.message) return false;
        const messageLower = context.message.toLowerCase();
        return conditions.keywords?.some(kw => messageLower.includes(kw.toLowerCase())) || false;

      case 'trust_level':
        if (context.trustLevel === undefined) return false;
        return context.trustLevel >= (conditions.minTrustLevel || 0);

      case 'evidence_collected':
        if (!context.evidence) return false;
        return conditions.requiredEvidence?.every(ev => context.evidence?.includes(ev)) || false;

      case 'trigger_activated':
        return conditions.requiredTriggers?.every(id => this.activatedTriggers.has(id)) || false;

      default:
        return false;
    }
  }

  /**
   * Получить блокировку доверия для персонажа
   */
  getTrustLock(characterId: CharacterName): TrustLock | null {
    const lock = TRUST_LOCKS[characterId];
    if (!lock) return null;

    // Проверяем активирован ли триггер разблокировки
    if (this.activatedTriggers.has(lock.requiredTrigger)) {
      return null; // Блокировка снята
    }

    return lock;
  }

  /**
   * Получить максимальное доверие для персонажа
   */
  getMaxTrustLevel(characterId: CharacterName): number {
    const lock = this.getTrustLock(characterId);
    return lock ? lock.maxTrustLevel : 100;
  }

  /**
   * Получить все активированные триггеры
   */
  getActivatedTriggers(): string[] {
    return Array.from(this.activatedTriggers);
  }

  /**
   * Проверить активирован ли триггер
   */
  isTriggerActive(triggerId: string): boolean {
    return this.activatedTriggers.has(triggerId);
  }
}

// Singleton экземпляр
let managerInstance: TriggerManager | null = null;

export function getTriggerManager(): TriggerManager {
  if (!managerInstance) {
    managerInstance = new TriggerManager();
  }
  return managerInstance;
}

export function resetTriggerManager(): void {
  managerInstance = null;
}
