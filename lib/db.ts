// ============================================
// QUEST MESSENGER - Database Client (sql.js)
// ============================================

import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs/promises';
import path from 'path';
import {
  GameSession,
  CharacterState,
  Message,
  CollectedEvidence,
  CharacterName,
  Emotion,
} from './types';

// Путь к файлу базы данных
const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'game.db');

// Singleton инстанс базы данных
let dbInstance: SqlJsDatabase | null = null;
let SQL: any = null;

/**
 * Инициализировать sql.js
 */
async function initSql() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

/**
 * Получить подключение к базе данных (singleton)
 */
export async function getDb(): Promise<SqlJsDatabase> {
  if (!dbInstance) {
    const SQL = await initSql();

    try {
      // Попытка загрузить существующую БД
      const buffer = await fs.readFile(DB_PATH);
      dbInstance = new SQL.Database(buffer);
      console.log('📂 База данных загружена из файла');
    } catch (error) {
      // Создаём новую БД если файл не существует
      dbInstance = new SQL.Database();
      console.log('📁 Создана новая база данных');

      // Инициализируем схему
      await initDatabase();
    }
  }
  return dbInstance;
}

/**
 * Сохранить БД в файл
 */
export async function saveDb(): Promise<void> {
  if (!dbInstance) return;

  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  await fs.writeFile(DB_PATH, buffer);
}

/**
 * Закрыть подключение к базе данных
 */
export async function closeDb(): Promise<void> {
  if (dbInstance) {
    await saveDb();
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Инициализировать схему БД
 */
async function initDatabase(): Promise<void> {
  const db = await getDb();

  // Создаём таблицы
  const schema = `
    -- Игровые сессии
    CREATE TABLE IF NOT EXISTS game_sessions (
        session_id TEXT PRIMARY KEY,
        player_name TEXT,
        started_at INTEGER DEFAULT (strftime('%s', 'now')),
        solved INTEGER DEFAULT 0,
        accused_character TEXT,
        correct_guess INTEGER
    );

    -- Состояние доверия персонажей
    CREATE TABLE IF NOT EXISTS character_trust (
        session_id TEXT NOT NULL,
        character_name TEXT NOT NULL,
        trust_level INTEGER DEFAULT 50,
        current_emotion TEXT DEFAULT 'neutral',
        blocked INTEGER DEFAULT 0,
        secrets_revealed TEXT DEFAULT '[]',
        PRIMARY KEY (session_id, character_name),
        FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE
    );

    -- История диалогов
    CREATE TABLE IF NOT EXISTS dialogue_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        character_name TEXT NOT NULL,
        message TEXT NOT NULL,
        is_player INTEGER NOT NULL,
        trust_change INTEGER DEFAULT 0,
        emotion_after TEXT,
        timestamp INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE
    );

    -- Собранные улики
    CREATE TABLE IF NOT EXISTS collected_evidence (
        session_id TEXT NOT NULL,
        evidence_id TEXT NOT NULL,
        collected_at INTEGER DEFAULT (strftime('%s', 'now')),
        PRIMARY KEY (session_id, evidence_id),
        FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE
    );

    -- Индексы
    CREATE INDEX IF NOT EXISTS idx_dialogue_session ON dialogue_history(session_id);
    CREATE INDEX IF NOT EXISTS idx_dialogue_character ON dialogue_history(character_name);
    CREATE INDEX IF NOT EXISTS idx_trust_session ON character_trust(session_id);
  `;

  db.exec(schema);
  await saveDb();
  console.log('✅ Схема БД инициализирована');
}

// ============================================
// GAME SESSIONS
// ============================================

/**
 * Создать новую игровую сессию
 */
export async function createGameSession(sessionId: string, playerName?: string): Promise<GameSession> {
  const db = await getDb();

  db.run(
    'INSERT INTO game_sessions (session_id, player_name) VALUES (?, ?)',
    [sessionId, playerName || null]
  );

  await saveDb();

  return {
    sessionId,
    playerName,
    startedAt: Math.floor(Date.now() / 1000),
    solved: false,
  };
}

/**
 * Получить игровую сессию
 */
export async function getGameSession(sessionId: string): Promise<GameSession | null> {
  const db = await getDb();

  const result = db.exec('SELECT * FROM game_sessions WHERE session_id = ?', [sessionId]);

  if (!result.length || !result[0].values.length) return null;

  const row = result[0];
  const values = row.values[0];
  const columns = row.columns;

  const getCol = (name: string) => {
    const idx = columns.indexOf(name);
    return values[idx];
  };

  return {
    sessionId: getCol('session_id') as string,
    playerName: getCol('player_name') as string | undefined,
    startedAt: getCol('started_at') as number,
    solved: Boolean(getCol('solved')),
    accusedCharacter: getCol('accused_character') as CharacterName | undefined,
    correctGuess: getCol('correct_guess') !== null ? Boolean(getCol('correct_guess')) : undefined,
  };
}

/**
 * Завершить игровую сессию
 */
export async function finishGameSession(
  sessionId: string,
  accusedCharacter: CharacterName,
  correctGuess: boolean
): Promise<void> {
  const db = await getDb();

  db.run(
    'UPDATE game_sessions SET solved = 1, accused_character = ?, correct_guess = ? WHERE session_id = ?',
    [accusedCharacter, correctGuess ? 1 : 0, sessionId]
  );

  await saveDb();
}

// ============================================
// CHARACTER TRUST
// ============================================

/**
 * Инициализировать состояние персонажа
 */
export async function initCharacterState(
  sessionId: string,
  characterName: CharacterName,
  initialTrust: number
): Promise<void> {
  const db = await getDb();

  db.run(
    'INSERT INTO character_trust (session_id, character_name, trust_level) VALUES (?, ?, ?)',
    [sessionId, characterName, initialTrust]
  );

  await saveDb();
}

/**
 * Получить состояние персонажа
 */
export async function getCharacterState(sessionId: string, characterName: CharacterName): Promise<CharacterState | null> {
  const db = await getDb();

  const result = db.exec(
    'SELECT * FROM character_trust WHERE session_id = ? AND character_name = ?',
    [sessionId, characterName]
  );

  if (!result.length || !result[0].values.length) return null;

  const row = result[0];
  const values = row.values[0];
  const columns = row.columns;

  const getCol = (name: string) => {
    const idx = columns.indexOf(name);
    return values[idx];
  };

  return {
    sessionId: getCol('session_id') as string,
    characterName: getCol('character_name') as CharacterName,
    trustLevel: getCol('trust_level') as number,
    currentEmotion: getCol('current_emotion') as Emotion,
    blocked: Boolean(getCol('blocked')),
    secretsRevealed: JSON.parse(getCol('secrets_revealed') as string),
  };
}

/**
 * Обновить состояние персонажа
 */
export async function updateCharacterState(
  sessionId: string,
  characterName: CharacterName,
  updates: {
    trustLevel?: number;
    currentEmotion?: Emotion;
    blocked?: boolean;
    secretsRevealed?: string[];
  }
): Promise<void> {
  const db = await getDb();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.trustLevel !== undefined) {
    fields.push('trust_level = ?');
    values.push(updates.trustLevel);
  }

  if (updates.currentEmotion !== undefined) {
    fields.push('current_emotion = ?');
    values.push(updates.currentEmotion);
  }

  if (updates.blocked !== undefined) {
    fields.push('blocked = ?');
    values.push(updates.blocked ? 1 : 0);
  }

  if (updates.secretsRevealed !== undefined) {
    fields.push('secrets_revealed = ?');
    values.push(JSON.stringify(updates.secretsRevealed));
  }

  if (fields.length === 0) return;

  values.push(sessionId, characterName);

  db.run(
    `UPDATE character_trust SET ${fields.join(', ')} WHERE session_id = ? AND character_name = ?`,
    values
  );

  await saveDb();
}

// ============================================
// DIALOGUE HISTORY
// ============================================

/**
 * Добавить сообщение в историю
 */
export async function addMessage(
  sessionId: string,
  characterName: CharacterName,
  message: string,
  isPlayer: boolean,
  trustChange?: number,
  emotionAfter?: Emotion
): Promise<number> {
  const db = await getDb();

  db.run(
    'INSERT INTO dialogue_history (session_id, character_name, message, is_player, trust_change, emotion_after) VALUES (?, ?, ?, ?, ?, ?)',
    [sessionId, characterName, message, isPlayer ? 1 : 0, trustChange || 0, emotionAfter || null]
  );

  await saveDb();

  // Получаем ID последней вставки
  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0].values[0][0] as number;
}

/**
 * Получить историю диалога
 */
export async function getDialogueHistory(sessionId: string, characterName: CharacterName, limit?: number): Promise<Message[]> {
  const db = await getDb();

  const query = `
    SELECT * FROM dialogue_history
    WHERE session_id = ? AND character_name = ?
    ORDER BY timestamp DESC
    ${limit ? `LIMIT ${limit}` : ''}
  `;

  const result = db.exec(query, [sessionId, characterName]);

  if (!result.length) return [];

  const row = result[0];
  const messages: Message[] = [];

  for (const values of row.values.reverse()) {
    const getCol = (name: string) => {
      const idx = row.columns.indexOf(name);
      return values[idx];
    };

    messages.push({
      id: getCol('id') as number,
      sessionId: getCol('session_id') as string,
      characterName: getCol('character_name') as CharacterName,
      text: getCol('message') as string,
      isPlayer: Boolean(getCol('is_player')),
      trustChange: getCol('trust_change') as number,
      emotionAfter: getCol('emotion_after') as Emotion | undefined,
      timestamp: getCol('timestamp') as number,
    });
  }

  return messages;
}

// ============================================
// EVIDENCE
// ============================================

/**
 * Добавить улику
 */
export async function addEvidence(sessionId: string, evidenceId: string): Promise<void> {
  const db = await getDb();

  db.run(
    'INSERT OR IGNORE INTO collected_evidence (session_id, evidence_id) VALUES (?, ?)',
    [sessionId, evidenceId]
  );

  await saveDb();
}

/**
 * Получить все улики
 */
export async function getCollectedEvidence(sessionId: string): Promise<CollectedEvidence[]> {
  const db = await getDb();

  const result = db.exec('SELECT * FROM collected_evidence WHERE session_id = ? ORDER BY collected_at ASC', [sessionId]);

  if (!result.length) return [];

  const row = result[0];
  const evidence: CollectedEvidence[] = [];

  for (const values of row.values) {
    const getCol = (name: string) => {
      const idx = row.columns.indexOf(name);
      return values[idx];
    };

    evidence.push({
      sessionId: getCol('session_id') as string,
      evidenceId: getCol('evidence_id') as string,
      collectedAt: getCol('collected_at') as number,
    });
  }

  return evidence;
}

// ============================================
// УТИЛИТЫ
// ============================================

/**
 * Инициализировать новую игровую сессию со всеми персонажами
 */
export async function initNewGame(sessionId: string, playerName?: string): Promise<void> {
  await createGameSession(sessionId, playerName);
  await initCharacterState(sessionId, 'anna', 50);
  await initCharacterState(sessionId, 'boris', 40);
  await initCharacterState(sessionId, 'viktor', 60);
  console.log(`✅ Новая игра создана: ${sessionId}`);
}

/**
 * Удалить игровую сессию
 */
export async function deleteGameSession(sessionId: string): Promise<void> {
  const db = await getDb();

  db.run('DELETE FROM game_sessions WHERE session_id = ?', [sessionId]);

  await saveDb();
}
