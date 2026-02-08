-- ============================================
-- QUEST MESSENGER - Seed Data (Test Session)
-- ============================================

-- Создаём тестовую игровую сессию
INSERT INTO game_sessions (session_id, player_name, started_at, solved)
VALUES ('test_session', 'Тестовый игрок', strftime('%s', 'now'), 0);

-- Начальное состояние персонажей для тестовой сессии
INSERT INTO character_trust (session_id, character_name, trust_level, current_emotion, blocked, secrets_revealed)
VALUES
  ('test_session', 'anna', 50, 'neutral', 0, '[]'),
  ('test_session', 'boris', 40, 'neutral', 0, '[]'),
  ('test_session', 'viktor', 60, 'neutral', 0, '[]');

-- Примеры начальных сообщений (опционально, для тестирования)
-- INSERT INTO dialogue_history (session_id, character_name, message, is_player, trust_change, emotion_after)
-- VALUES
--   ('test_session', 'anna', 'Здравствуйте, Анна. Можно задать вам несколько вопросов?', 1, 0, 'neutral'),
--   ('test_session', 'anna', '*отводит взгляд*\nКонечно... О чём вы хотите узнать?', 0, 0, 'neutral');

-- Примечание: в реальной игре каждая новая сессия будет создаваться динамически
-- с уникальным session_id (UUID), а персонажи инициализируются с начальными значениями:
-- anna: trust=50, boris: trust=40, viktor: trust=60
