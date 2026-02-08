// ============================================
// QUEST MESSENGER - Game State Logic
// ============================================

import { CharacterName, TRUST_THRESHOLDS } from './types';

/**
 * Обновить доверие персонажа с учётом границ (0-100)
 */
export function updateTrust(currentTrust: number, change: number): number {
  const newTrust = currentTrust + change;

  // Ограничиваем значение в пределах 0-100
  return Math.max(0, Math.min(100, newTrust));
}

/**
 * Проверить должна ли быть блокировка персонажа
 */
export function shouldBlock(trust: number): boolean {
  return trust < TRUST_THRESHOLDS.BLOCK;
}

/**
 * Получить уровень доступа к секретам по текущему доверию
 */
export function getSecretAccessLevel(trust: number): 0 | 1 | 2 | 3 {
  if (trust >= TRUST_THRESHOLDS.LEVEL_3) return 3;
  if (trust >= TRUST_THRESHOLDS.LEVEL_2) return 2;
  if (trust >= TRUST_THRESHOLDS.LEVEL_1) return 1;
  return 0;
}

/**
 * Проверить какие секреты можно раскрыть при новом уровне доверия
 */
export function checkSecretsToReveal(
  characterName: CharacterName,
  oldTrust: number,
  newTrust: number,
  alreadyRevealed: string[]
): string[] {
  const oldLevel = getSecretAccessLevel(oldTrust);
  const newLevel = getSecretAccessLevel(newTrust);

  // Если уровень не изменился, ничего не раскрываем
  if (oldLevel === newLevel) return [];

  const secretsToReveal: string[] = [];

  // Определяем id секретов для каждого персонажа
  const secretsMap: Record<CharacterName, Record<number, string>> = {
    anna: {
      1: 'anna_secret_1',
      2: 'anna_secret_2',
      3: 'anna_secret_3',
    },
    boris: {
      1: 'boris_secret_1',
      2: 'boris_secret_2',
      3: 'boris_secret_3',
    },
    viktor: {
      1: 'viktor_secret_1',
      2: 'viktor_secret_2',
      3: 'viktor_secret_3',
    },
  };

  const characterSecrets = secretsMap[characterName];

  // Проверяем каждый уровень между старым и новым
  for (let level = oldLevel + 1; level <= newLevel; level++) {
    const secretId = characterSecrets[level as 1 | 2 | 3];
    if (secretId && !alreadyRevealed.includes(secretId)) {
      secretsToReveal.push(secretId);
    }
  }

  return secretsToReveal;
}

/**
 * Получить описание уровня доверия
 */
export function getTrustLevelDescription(trust: number): string {
  if (trust < TRUST_THRESHOLDS.BLOCK) return 'Заблокирован';
  if (trust < TRUST_THRESHOLDS.LEVEL_1) return 'Очень низкое';
  if (trust < TRUST_THRESHOLDS.LEVEL_2) return 'Низкое';
  if (trust < TRUST_THRESHOLDS.LEVEL_3) return 'Среднее';
  return 'Высокое';
}

/**
 * Получить цвет индикатора доверия (для UI)
 */
export function getTrustColor(trust: number): 'red' | 'yellow' | 'green' {
  if (trust < TRUST_THRESHOLDS.LEVEL_1) return 'red';
  if (trust < TRUST_THRESHOLDS.LEVEL_3) return 'yellow';
  return 'green';
}

/**
 * Проверить правильность обвинения
 */
export function checkAccusation(
  accusedCharacter: CharacterName,
  providedEvidence: string[]
): {
  correct: boolean;
  missingEvidence: string[];
} {
  const MURDERER: CharacterName = 'viktor';

  const REQUIRED_EVIDENCE = [
    'anna_secret_1', // Анна видела Виктора
    'viktor_secret_2', // Виктор шантажировал Громова
    'viktor_secret_3', // Признание Виктора
  ];

  const correct = accusedCharacter === MURDERER;

  // Проверяем какие улики не предоставлены
  const missingEvidence = REQUIRED_EVIDENCE.filter(
    (evidenceId) => !providedEvidence.includes(evidenceId)
  );

  return {
    correct,
    missingEvidence,
  };
}

/**
 * Получить подсказку для раскрытия секрета
 */
export function getSecretHint(characterName: CharacterName, currentTrust: number): string | null {
  const level = getSecretAccessLevel(currentTrust);

  if (level === 0) {
    return `Доверие слишком низкое. Нужно хотя бы ${TRUST_THRESHOLDS.LEVEL_1} для первого секрета.`;
  }

  if (level === 1) {
    return `Доверие: ${currentTrust}. До следующего секрета нужно ${TRUST_THRESHOLDS.LEVEL_2}.`;
  }

  if (level === 2) {
    return `Доверие: ${currentTrust}. До финального секрета нужно ${TRUST_THRESHOLDS.LEVEL_3}.`;
  }

  return null; // Все секреты доступны
}

/**
 * Получить название секрета по id (для отладки)
 */
export function getSecretName(secretId: string): string {
  const names: Record<string, string> = {
    anna_secret_1: 'Анна: Видела Виктора в кабинете (~23:00)',
    anna_secret_2: 'Анна: Громов был подавлен, пил виски',
    anna_secret_3: 'Анна: Роман с Громовым, он оборвал отношения',

    boris_secret_1: 'Борис: Камеры "сломались" в ночь убийства',
    boris_secret_2: 'Борис: Громов сам приказал отключить камеры',
    boris_secret_3: 'Борис: Услышал шантаж Виктора, предсмертные слова Громова',

    viktor_secret_1: 'Виктор: Нашёл схему хищений Громова',
    viktor_secret_2: 'Виктор: Шантажировал Громова',
    viktor_secret_3: 'Виктор: ПРИЗНАНИЕ В УБИЙСТВЕ',
  };

  return names[secretId] || secretId;
}

/**
 * Валидация trust значения
 */
export function validateTrust(trust: number): boolean {
  return typeof trust === 'number' && trust >= 0 && trust <= 100;
}

/**
 * Клампинг trust значения (на случай ошибок)
 */
export function clampTrust(trust: number): number {
  if (typeof trust !== 'number' || isNaN(trust)) return 50; // дефолт
  return Math.max(0, Math.min(100, Math.round(trust)));
}
