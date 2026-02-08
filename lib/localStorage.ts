// ============================================
// QUEST MESSENGER - LocalStorage Client
// ============================================

import { CharacterName, Emotion } from './types';

interface StoredMessage {
  text: string;
  isPlayer: boolean;
  emotion?: Emotion;
  timestamp: string;
}

interface CharacterData {
  trust: number;
  emotion: Emotion;
  blocked: boolean;
  secretsRevealed: string[];
  messages: StoredMessage[];
}

interface GameData {
  sessionId: string;
  characters: {
    helper: CharacterData;
    anna: CharacterData;
    boris: CharacterData;
    viktor: CharacterData;
  };
}

const STORAGE_KEY = 'quest_messenger_save';

/**
 * Получить данные из LocalStorage
 */
function getGameData(): GameData | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Ошибка чтения LocalStorage:', error);
    return null;
  }
}

/**
 * Сохранить данные в LocalStorage
 */
function saveGameData(data: GameData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Ошибка записи LocalStorage:', error);
  }
}

/**
 * Создать начальные данные персонажа
 */
function createInitialCharacterData(trust: number): CharacterData {
  return {
    trust,
    emotion: 'neutral',
    blocked: false,
    secretsRevealed: [],
    messages: [],
  };
}

/**
 * Инициализировать новую игру
 */
export function initGame(sessionId: string): void {
  const gameData: GameData = {
    sessionId,
    characters: {
      helper: createInitialCharacterData(100),  // Помощник всегда на вашей стороне
      anna: createInitialCharacterData(50),
      boris: createInitialCharacterData(40),
      viktor: createInitialCharacterData(60),
    },
  };

  // Добавляем начальное сообщение ТОЛЬКО от помощника
  gameData.characters.helper.messages.push({
    text: 'Здравствуйте! Произошло убийство директора компании "НейроТех" Павла Громова. Официально — сердечный приступ, но есть основания полагать, что это убийство. Вам нужно опросить подозреваемых и найти виновного. Спросите меня о деле или подозреваемых.',
    isPlayer: false,
    emotion: 'neutral',
    timestamp: new Date().toISOString(),
  });

  // Остальные персонажи (anna, boris, viktor) начинают с пустыми чатами

  saveGameData(gameData);
  console.log('✅ Новая игра создана в LocalStorage');
}

/**
 * Загрузить данные персонажа
 */
export function loadCharacterData(characterName: CharacterName): CharacterData | null {
  const gameData = getGameData();

  if (!gameData) return null;

  return gameData.characters[characterName] || null;
}

/**
 * Сохранить состояние персонажа
 */
export function saveCharacterState(
  characterName: CharacterName,
  trust: number,
  emotion: Emotion,
  blocked: boolean,
  secretsRevealed: string[]
): void {
  let gameData = getGameData();

  if (!gameData) {
    initGame(`session_${Date.now()}`);
    gameData = getGameData();
  }

  if (!gameData) return;

  gameData.characters[characterName] = {
    ...gameData.characters[characterName],
    trust,
    emotion,
    blocked,
    secretsRevealed,
  };

  saveGameData(gameData);
}

/**
 * Добавить сообщение
 */
export function addMessage(
  characterName: CharacterName,
  text: string,
  isPlayer: boolean,
  emotion?: Emotion
): void {
  let gameData = getGameData();

  if (!gameData) {
    initGame(`session_${Date.now()}`);
    gameData = getGameData();
  }

  if (!gameData) return;

  const message: StoredMessage = {
    text,
    isPlayer,
    emotion,
    timestamp: new Date().toISOString(),
  };

  gameData.characters[characterName].messages.push(message);

  saveGameData(gameData);
  console.log('✅ Сообщение сохранено в LocalStorage');
}

/**
 * Загрузить сообщения персонажа
 */
export function loadMessages(characterName: CharacterName): StoredMessage[] {
  const characterData = loadCharacterData(characterName);

  if (!characterData) return [];

  return characterData.messages;
}

/**
 * Очистить все данные
 */
export function clearGameData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('quest_messenger_evidence');
  console.log('🗑️ Данные игры очищены');
}

/**
 * Экспорт данных (для отладки)
 */
export function exportGameData(): string {
  const gameData = getGameData();
  return JSON.stringify(gameData, null, 2);
}

// ============================================
// ТРИГГЕРЫ
// ============================================

const TRIGGERS_KEY = 'quest_messenger_triggers';

/**
 * Сохранить активированные триггеры
 */
export function saveActivatedTriggers(triggers: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(TRIGGERS_KEY, JSON.stringify(triggers));
    console.log('✅ Триггеры сохранены:', triggers);
  } catch (error) {
    console.error('Ошибка сохранения триггеров:', error);
  }
}

/**
 * Загрузить активированные триггеры
 */
export function loadActivatedTriggers(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(TRIGGERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Ошибка загрузки триггеров:', error);
    return [];
  }
}

/**
 * Очистить триггеры
 */
export function clearTriggers(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TRIGGERS_KEY);
}
