# /app/api — Backend API Routes

## Что здесь находится

Next.js API routes для обработки игровой логики:

- **analyze/** — анализ сообщения игрока (доверие, эмоции)
- **respond/** — генерация ответа персонажа
- **state/** — сохранение/загрузка game state

## Архитектура

### /api/analyze/route.ts
**Задача:** Анализирует сообщение игрока и определяет влияние на доверие/эмоции персонажа.

**Input:**
```json
{
  "characterName": "anna",
  "playerMessage": "Почему ты была в офисе так поздно?",
  "currentTrust": 50,
  "currentEmotion": "neutral",
  "revealedSecrets": ["secret_lvl1"]
}
```

**Output:**
```json
{
  "trustChange": -10,
  "newEmotion": "defensive",
  "triggerBlock": false,
  "detectedTopics": ["работа", "время"],
  "shouldRevealSecret": null,
  "reasoning": "Вопрос немного подозрительный, персонаж настораживается"
}
```

### /api/respond/route.ts
**Задача:** Генерирует ответ персонажа в его характере с учётом эмоции и доверия.

**Input:**
```json
{
  "characterName": "anna",
  "playerMessage": "Почему ты была в офисе так поздно?",
  "trust": 40,
  "emotion": "defensive",
  "conversationHistory": [
    {"role": "player", "message": "Привет, Анна"},
    {"role": "anna", "message": "Здравствуйте..."}
  ],
  "revealedSecrets": []
}
```

**Output:**
```json
{
  "response": "*отводит взгляд*\nЯ... работала. Директор просил доделать отчёт.\n*теребит браслет*"
}
```

### /api/state/route.ts
**Задача:** Сохранение и загрузка состояния игры в базу данных.

**Endpoints:**
- `POST /api/state` — сохранить state
- `GET /api/state?sessionId=xxx` — загрузить state

## Что нужно сделать

### analyze/route.ts
- [ ] POST endpoint
- [ ] Валидация input данных
- [ ] Вызов `analyzeMessage()` из `ai-client.ts`
- [ ] Обработка ошибок AI API
- [ ] Возврат результата анализа

### respond/route.ts
- [ ] POST endpoint
- [ ] Валидация input данных
- [ ] Вызов `generateCharacterResponse()` из `ai-client.ts`
- [ ] Обработка ошибок AI API
- [ ] Возврат ответа персонажа

### state/route.ts
- [ ] POST endpoint — сохранение state
  - Сохранить в `character_trust`
  - Сохранить в `dialogue_history`
  - Сохранить в `collected_evidence`
- [ ] GET endpoint — загрузка state
  - Получить весь state по `sessionId`
- [ ] Обработка ошибок БД

## Связь с другими модулями

- Использует `/lib/ai-client.ts` для AI запросов
- Использует `/lib/db.ts` для работы с БД
- Использует `/lib/game-state.ts` для логики игры
- Вызывается из компонентов `/components` через `fetch()`

## Технические детали

### Error Handling
```typescript
try {
  const result = await analyzeMessage(...);
  return NextResponse.json(result);
} catch (error) {
  console.error('Analysis error:', error);
  return NextResponse.json(
    { error: 'Failed to analyze message' },
    { status: 500 }
  );
}
```

### CORS (если нужно)
```typescript
return NextResponse.json(data, {
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
});
```

## Важно для Haiku

1. Начни с `state/route.ts` — самый простой (просто CRUD в БД)
2. Потом `analyze/route.ts` — вызов AI для анализа
3. Финал: `respond/route.ts` — вызов AI для ответа

**Проверяй:** каждый endpoint должен работать через Postman/curl перед интеграцией во фронтенд!
