# Quest Messenger — Структура проекта

## Быстрый старт для Haiku

Это документ-навигатор по проекту. **Перед началом работы над любым модулем — открой соответствующий README.**

## Структура папок

```
quest-messenger/
├── quest-messenger-README.md    ← 📖 ГЛАВНЫЙ README со всеми деталями
├── PROJECT_STRUCTURE.md          ← 📍 ТЫ ЗДЕСЬ (навигатор)
│
├── app/                          ← Страницы и API routes
│   ├── README.md                 ← Как работают страницы
│   ├── page.tsx                  ← Главная страница
│   ├── layout.tsx                ← Общий layout
│   ├── globals.css               ← Стили
│   ├── chat/[character]/
│   │   └── page.tsx              ← Страница чата
│   └── api/                      ← Backend API
│       ├── README.md             ← Как работают API routes
│       ├── analyze/route.ts      ← Анализ сообщений
│       ├── respond/route.ts      ← Генерация ответов
│       └── state/route.ts        ← Сохранение state
│
├── components/                   ← UI компоненты
│   ├── README.md                 ← Список всех компонентов
│   ├── MessageBubble.tsx         ← Пузырь сообщения
│   ├── ChatInput.tsx             ← Поле ввода
│   ├── TrustMeter.tsx            ← Индикатор доверия
│   ├── EmotionIndicator.tsx      ← Индикатор эмоции
│   ├── EvidencePanel.tsx         ← Панель улик
│   └── CharacterCard.tsx         ← Карточка персонажа
│
├── lib/                          ← Бизнес-логика
│   ├── README.md                 ← Подробное описание
│   ├── types.ts                  ← TypeScript типы
│   ├── db.ts                     ← База данных (SQLite/Supabase)
│   ├── ai-client.ts              ← Open Router интеграция
│   ├── game-state.ts             ← Логика игры
│   └── prompts.ts                ← Загрузка промптов
│
├── data/                         ← Статические данные
│   ├── README.md                 ← Что здесь хранится
│   ├── scenario.json             ← Полный сценарий квеста
│   └── prompts/                  ← AI промпты
│       ├── anna-base.txt         ← Промпт Анны
│       ├── boris-base.txt        ← Промпт Бориса
│       ├── viktor-base.txt       ← Промпт Виктора
│       └── analyzer.txt          ← Промпт анализатора
│
├── scripts/                      ← Утилиты и скрипты
│   ├── README.md                 ← Как запустить
│   ├── init-db.sql               ← Создание БД
│   └── seed-data.sql             ← Начальные данные
│
├── public/
│   └── avatars/                  ← Аватарки персонажей
│
├── .env.local                    ← Переменные окружения
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## Порядок разработки (рекомендуемый)

### Этап 1: Фундамент
1. **lib/types.ts** — определи все TypeScript типы
2. **scripts/init-db.sql** — создай схему БД
3. **lib/db.ts** — подключи SQLite
4. ✅ Тест: проверь что можешь записать/прочитать из БД

### Этап 2: Данные
5. **data/scenario.json** — структура всего квеста
6. **data/prompts/analyzer.txt** — промпт анализатора
7. **data/prompts/{character}-base.txt** — промпты персонажей
8. **lib/prompts.ts** — загрузка и форматирование промптов
9. ✅ Тест: загрузи промпт и подставь переменные

### Этап 3: AI интеграция
10. **lib/ai-client.ts** — Open Router клиент
11. ✅ Тест: вызови `analyzeMessage()` и `generateCharacterResponse()`

### Этап 4: Backend
12. **lib/game-state.ts** — логика изменения trust/emotion
13. **app/api/analyze/route.ts** — API для анализа
14. **app/api/respond/route.ts** — API для ответов
15. **app/api/state/route.ts** — API для сохранения state
16. ✅ Тест: вызови API через Postman/curl

### Этап 5: Frontend компоненты
17. **components/MessageBubble.tsx**
18. **components/ChatInput.tsx**
19. **components/TrustMeter.tsx**
20. **components/EmotionIndicator.tsx**
21. **components/CharacterCard.tsx**
22. **components/EvidencePanel.tsx**
23. ✅ Тест: отрисуй каждый компонент отдельно

### Этап 6: Страницы
24. **app/layout.tsx** + **app/globals.css**
25. **app/page.tsx** — главная страница
26. **app/chat/[character]/page.tsx** — страница чата
27. ✅ Тест: пройди весь флоу локально

### Этап 7: Полировка
28. Система блокировки (trust < 10)
29. Финальная сцена обвинения
30. Отладка и багфиксы
31. ✅ Тест: полное прохождение квеста

---

## Где что искать?

### Нужно понять механику доверия?
→ Читай главный `quest-messenger-README.md`, раздел "Игровая механика"

### Нужно создать компонент?
→ Читай `/components/README.md`

### Нужно сделать API endpoint?
→ Читай `/app/api/README.md`

### Нужно работать с AI?
→ Читай `/lib/README.md` (секция ai-client.ts) и `/data/README.md` (промпты)

### Нужно настроить БД?
→ Читай `/scripts/README.md`

### Нужно понять game state?
→ Читай `/lib/README.md` (секция game-state.ts)

---

## Cheat Sheet для Haiku

### TypeScript типы
```typescript
// lib/types.ts
type Emotion = 'neutral' | 'defensive' | 'angry' | 'sad' | 'fearful' | 'openness' | 'suspicious';
type TrustLevel = number; // 0-100
```

### API вызовы
```typescript
// Анализ сообщения
const analysis = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({ characterName, playerMessage, currentTrust, currentEmotion, revealedSecrets })
});

// Генерация ответа
const response = await fetch('/api/respond', {
  method: 'POST',
  body: JSON.stringify({ characterName, playerMessage, trust, emotion, conversationHistory, revealedSecrets })
});
```

### БД операции
```typescript
// Сохранение состояния персонажа
await db.run(`
  UPDATE character_trust
  SET trust_level = ?, current_emotion = ?
  WHERE session_id = ? AND character_name = ?
`, [newTrust, newEmotion, sessionId, characterName]);
```

### Форматирование промпта
```typescript
// lib/prompts.ts
const prompt = formatPrompt('anna-base', {
  trust: 45,
  emotion: 'defensive',
  revealedSecrets: ['secret_1'],
  conversationHistory: lastMessages,
  playerMessage: 'Почему ты врёшь?'
});
```

---

## Важные заметки

### Стоимость AI
- DeepSeek V3: $0.27 input / $1.10 output за 1M токенов
- ~$0.0008 за одно сообщение
- ~$0.70 на полное прохождение

### Базы данных
- **Локально:** SQLite (файл `game.db`)
- **Прод:** Supabase (PostgreSQL)
- Переключение через `DATABASE_URL` в `.env.local`

### Tailwind классы
```tsx
// Пузырь игрока
<div className="bg-blue-500 text-white rounded-2xl px-4 py-2 max-w-[70%] ml-auto" />

// Пузырь персонажа
<div className="bg-gray-200 text-gray-900 rounded-2xl px-4 py-2 max-w-[70%]" />
```

---

## Текущий статус проекта

✅ Архитектура и документация
⬜ База данных
⬜ AI интеграция
⬜ Backend API
⬜ UI компоненты
⬜ Страницы
⬜ Тестирование

**Следующий шаг:** Начать с `/lib/types.ts` и `/scripts/init-db.sql`

---

**Версия:** 1.0
**Обновлено:** 23 января 2026
**Для Haiku:** Всегда читай README перед началом работы над модулем!
