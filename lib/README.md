# /lib — Библиотеки и утилиты

## Что здесь находится

Ключевая бизнес-логика приложения:
- **ai-client.ts** — интеграция с Open Router API (DeepSeek V3)
- **game-state.ts** — управление состоянием игры (доверие, эмоции, улики)
- **db.ts** — клиент базы данных (SQLite локально, Supabase в проде)
- **prompts.ts** — загрузка и форматирование промптов из /data/prompts
- **types.ts** — TypeScript типы для всего проекта

## Связь с другими модулями

- **API Routes** (`/app/api/*`) используют эти библиотеки для обработки запросов
- **Components** (`/components`) получают данные через эти утилиты
- **Prompts** (`/data/prompts`) загружаются через `prompts.ts`

## Что нужно сделать

### ai-client.ts
- [ ] Настроить Open Router API клиент
- [ ] Функция `analyzeMessage()` — анализ сообщения игрока
- [ ] Функция `generateCharacterResponse()` — генерация ответа персонажа
- [ ] Обработка ошибок и retry логики
- [ ] Логирование токенов (для мониторинга расходов)

### game-state.ts
- [ ] Класс/интерфейс `GameState`
- [ ] Логика изменения доверия (trust)
- [ ] Логика смены эмоций
- [ ] Система раскрытия секретов по порогам доверия
- [ ] Проверка блокировки персонажа (trust < 10)
- [ ] Управление собранными уликами

### db.ts
- [ ] SQLite клиент для локальной разработки
- [ ] Supabase клиент для продакшна
- [ ] CRUD операции для всех таблиц:
  - `game_sessions`
  - `character_trust`
  - `dialogue_history`
  - `collected_evidence`
- [ ] Миграция с SQLite на Supabase

### prompts.ts
- [ ] Загрузка промптов из `/data/prompts/*.txt`
- [ ] Функция `formatPrompt()` — подстановка переменных ({trust}, {emotion}, etc)
- [ ] Кэширование промптов для производительности

### types.ts
- [ ] `Character` — тип персонажа
- [ ] `Message` — тип сообщения
- [ ] `GameSession` — тип игровой сессии
- [ ] `TrustLevel` — 0-100
- [ ] `Emotion` — "neutral" | "defensive" | "angry" | ...
- [ ] `Evidence` — тип улики
- [ ] `AnalysisResult` — результат анализа сообщения
- [ ] `CharacterState` — состояние персонажа

## Технические детали

### Open Router API
- **Модель:** deepseek/deepseek-chat
- **Стоимость:** $0.27 input / $1.10 output за 1M токенов
- **Endpoint:** https://openrouter.ai/api/v1/chat/completions
- **Auth:** Bearer token в headers

### SQLite Schema
См. `/scripts/init-db.sql`

### Supabase Migration
- Использовать тот же SQL schema
- Переключение через env variable `DATABASE_URL`

## Пример использования

```typescript
// ai-client.ts
import { analyzeMessage, generateCharacterResponse } from '@/lib/ai-client';

const analysis = await analyzeMessage({
  characterName: 'anna',
  playerMessage: 'Почему ты была в офисе так поздно?',
  currentTrust: 45,
  currentEmotion: 'neutral',
  revealedSecrets: []
});
// => { trustChange: -10, newEmotion: 'defensive', ... }

// game-state.ts
import { updateTrust, checkSecretReveal } from '@/lib/game-state';

const newTrust = updateTrust(currentTrust, analysis.trustChange);
const secretToReveal = checkSecretReveal('anna', newTrust, revealedSecrets);
```

## Важно для Haiku

При работе над этим модулем:
1. Начни с `types.ts` — определи все типы
2. Потом `db.ts` — подключи базу данных
3. Затем `prompts.ts` — загрузка промптов
4. Потом `game-state.ts` — логика игры
5. Финал: `ai-client.ts` — интеграция AI

**Не забудь:** все функции должны иметь обработку ошибок и TypeScript типы!
