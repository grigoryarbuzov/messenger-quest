-- ============================================
-- QUEST MESSENGER - Database Schema (SQLite)
-- ============================================

-- Удаляем таблицы если существуют (для пересоздания)
DROP TABLE IF EXISTS collected_evidence;
DROP TABLE IF EXISTS dialogue_history;
DROP TABLE IF EXISTS character_trust;
DROP TABLE IF EXISTS game_sessions;

-- ============================================
-- Игровые сессии
-- ============================================
CREATE TABLE game_sessions (
    session_id TEXT PRIMARY KEY,
    player_name TEXT,
    started_at INTEGER DEFAULT (strftime('%s', 'now')),
    solved BOOLEAN DEFAULT 0,
    accused_character TEXT,
    correct_guess BOOLEAN
);

-- ============================================
-- Состояние доверия персонажей
-- ============================================
CREATE TABLE character_trust (
    session_id TEXT NOT NULL,
    character_name TEXT NOT NULL,
    trust_level INTEGER DEFAULT 50,
    current_emotion TEXT DEFAULT 'neutral',
    blocked BOOLEAN DEFAULT 0,
    secrets_revealed TEXT DEFAULT '[]',  -- JSON массив id секретов
    PRIMARY KEY (session_id, character_name),
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE
);

-- ============================================
-- История диалогов
-- ============================================
CREATE TABLE dialogue_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    character_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_player BOOLEAN NOT NULL,
    trust_change INTEGER DEFAULT 0,
    emotion_after TEXT,
    timestamp INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE
);

-- ============================================
-- Собранные улики
-- ============================================
CREATE TABLE collected_evidence (
    session_id TEXT NOT NULL,
    evidence_id TEXT NOT NULL,
    collected_at INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (session_id, evidence_id),
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE
);

-- ============================================
-- Индексы для производительности
-- ============================================
CREATE INDEX idx_dialogue_session ON dialogue_history(session_id);
CREATE INDEX idx_dialogue_character ON dialogue_history(character_name);
CREATE INDEX idx_dialogue_timestamp ON dialogue_history(timestamp);
CREATE INDEX idx_trust_session ON character_trust(session_id);
CREATE INDEX idx_evidence_session ON collected_evidence(session_id);

-- ============================================
-- Комментарии к таблицам (для документации)
-- ============================================

-- game_sessions:
--   session_id: UUID игровой сессии
--   player_name: опциональное имя игрока
--   started_at: unix timestamp начала игры
--   solved: закончена ли игра
--   accused_character: кого игрок обвинил (anna|boris|viktor)
--   correct_guess: правильно ли угадал

-- character_trust:
--   session_id: связь с сессией
--   character_name: anna|boris|viktor
--   trust_level: 0-100
--   current_emotion: neutral|defensive|angry|sad|fearful|openness|suspicious
--   blocked: заблокирован ли персонаж (trust < 10)
--   secrets_revealed: JSON массив, например: ["anna_secret_1", "anna_secret_2"]

-- dialogue_history:
--   id: автоинкремент
--   session_id: связь с сессией
--   character_name: с кем диалог
--   message: текст сообщения
--   is_player: 1 если от игрока, 0 если от персонажа
--   trust_change: изменение доверия после этого сообщения
--   emotion_after: эмоция персонажа после ответа
--   timestamp: unix timestamp сообщения

-- collected_evidence:
--   session_id: связь с сессией
--   evidence_id: id улики (из scenario.json)
--   collected_at: unix timestamp когда получена
