# /scripts — Скрипты для базы данных

## Что здесь находится

SQL скрипты и утилиты для работы с базой данных:

- **init-db.sql** — создание схемы базы данных (таблицы, индексы)
- **seed-data.sql** — начальные данные (персонажи, улики)
- **migrate-to-supabase.ts** — утилита для миграции с SQLite на Supabase

## Что нужно сделать

### init-db.sql
- [ ] Создание таблицы `game_sessions`
- [ ] Создание таблицы `character_trust`
- [ ] Создание таблицы `dialogue_history`
- [ ] Создание таблицы `collected_evidence`
- [ ] Индексы для производительности

**Схема:**
```sql
-- Игровые сессии
CREATE TABLE game_sessions (
    session_id TEXT PRIMARY KEY,
    player_name TEXT,
    started_at INTEGER DEFAULT (strftime('%s', 'now')),
    solved BOOLEAN DEFAULT 0,
    accused_character TEXT,
    correct_guess BOOLEAN
);

-- Состояние доверия по персонажам
CREATE TABLE character_trust (
    session_id TEXT NOT NULL,
    character_name TEXT NOT NULL,
    trust_level INTEGER DEFAULT 50,
    current_emotion TEXT DEFAULT 'neutral',
    blocked BOOLEAN DEFAULT 0,
    secrets_revealed TEXT DEFAULT '[]',  -- JSON массив
    PRIMARY KEY (session_id, character_name),
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id)
);

-- История диалогов
CREATE TABLE dialogue_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    character_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_player BOOLEAN NOT NULL,
    trust_change INTEGER DEFAULT 0,
    emotion_after TEXT,
    timestamp INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id)
);

-- Собранные улики
CREATE TABLE collected_evidence (
    session_id TEXT NOT NULL,
    evidence_id TEXT NOT NULL,
    collected_at INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (session_id, evidence_id),
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id)
);

-- Индексы
CREATE INDEX idx_dialogue_session ON dialogue_history(session_id);
CREATE INDEX idx_dialogue_character ON dialogue_history(character_name);
CREATE INDEX idx_trust_session ON character_trust(session_id);
```

### seed-data.sql
- [ ] Вставка начальных данных персонажей (имя, начальное доверие)
- [ ] Вставка улик из scenario.json
- [ ] Опционально: тестовая игровая сессия для дебага

**Пример:**
```sql
-- Начальное состояние персонажей (для новой сессии)
-- Эти данные копируются при создании новой сессии

-- Персонажи
INSERT INTO character_trust (session_id, character_name, trust_level, current_emotion, blocked)
VALUES
  ('test_session', 'anna', 50, 'neutral', 0),
  ('test_session', 'boris', 40, 'neutral', 0),
  ('test_session', 'viktor', 60, 'neutral', 0);
```

### migrate-to-supabase.ts (опционально)
- [ ] TypeScript скрипт для переноса SQLite → Supabase
- [ ] Чтение данных из локальной БД
- [ ] Запись в Supabase
- [ ] Логирование прогресса

## Связь с другими модулями

- Используется в `/lib/db.ts` для инициализации БД
- Данные из `/data/scenario.json` используются в `seed-data.sql`

## Как запустить

### SQLite (локально)
```bash
# 1. Создать базу данных
sqlite3 game.db < scripts/init-db.sql

# 2. Заполнить начальными данными
sqlite3 game.db < scripts/seed-data.sql

# 3. Проверить
sqlite3 game.db "SELECT * FROM character_trust;"
```

### Через npm скрипт
Добавь в `package.json`:
```json
{
  "scripts": {
    "db:init": "sqlite3 game.db < scripts/init-db.sql && sqlite3 game.db < scripts/seed-data.sql",
    "db:reset": "rm -f game.db && npm run db:init"
  }
}
```

Запуск:
```bash
npm run db:init
```

### Supabase (продакшн)
1. Создать проект на supabase.com
2. Открыть SQL Editor
3. Вставить `init-db.sql` (убрать AUTOINCREMENT → SERIAL)
4. Выполнить
5. Вставить `seed-data.sql`
6. Выполнить

## Важно для Haiku

1. Начни с **init-db.sql** — создание схемы
2. Потом **seed-data.sql** — начальные данные
3. Тестируй локально через SQLite перед Supabase

**Проверяй:** после создания таблиц проверь что можешь вставить и прочитать данные!

## Отличия SQLite vs Supabase

| SQLite | Supabase (PostgreSQL) |
|--------|----------------------|
| `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY` |
| `strftime('%s', 'now')` | `EXTRACT(EPOCH FROM NOW())` |
| `BOOLEAN` | `BOOLEAN` (одинаково) |

При миграции на Supabase нужно будет поправить SQL синтаксис.
