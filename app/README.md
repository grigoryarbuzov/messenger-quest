# /app — Страницы и роуты приложения

## Что здесь находится

Next.js 14 App Router структура:

- **page.tsx** — главная страница (выбор персонажа)
- **chat/[character]/page.tsx** — страница диалога с персонажем
- **api/** — backend API routes (см. `/app/api/README.md`)
- **layout.tsx** — общий layout приложения
- **globals.css** — глобальные стили

## Что нужно сделать

### page.tsx (главная страница)
- [ ] Заголовок квеста
- [ ] Краткое описание завязки
- [ ] 3 карточки персонажей (`CharacterCard`)
- [ ] Кнопки "Начать разговор" → редирект на `/chat/[character]`
- [ ] Опционально: кнопка "Продолжить игру" если есть сохранённая сессия

**Структура:**
```tsx
export default function HomePage() {
  const characters = ['anna', 'boris', 'viktor'];

  return (
    <div className="container mx-auto p-8">
      <h1>Quest Messenger</h1>
      <p>Директор компании найден мёртвым. Раскройте убийство.</p>

      <div className="grid grid-cols-3 gap-4">
        {characters.map(char => (
          <CharacterCard
            key={char}
            character={getCharacterData(char)}
            onStartChat={() => router.push(`/chat/${char}`)}
          />
        ))}
      </div>
    </div>
  );
}
```

### chat/[character]/page.tsx (чат с персонажем)
- [ ] Получить `character` из URL params
- [ ] Загрузить состояние персонажа (trust, emotion, history)
- [ ] Отобразить историю сообщений (`MessageBubble`)
- [ ] Показать `TrustMeter` и `EmotionIndicator`
- [ ] Поле ввода (`ChatInput`)
- [ ] Боковая панель с уликами (`EvidencePanel`)
- [ ] Обработка отправки сообщения:
  1. Вызов `/api/analyze` для анализа
  2. Обновление trust и emotion
  3. Вызов `/api/respond` для ответа персонажа
  4. Добавление в историю
  5. Сохранение в БД через `/api/state`

**Структура:**
```tsx
'use client';

export default function ChatPage({ params }: { params: { character: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [trust, setTrust] = useState(50);
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [isBlocked, setIsBlocked] = useState(false);

  const handleSendMessage = async (playerMessage: string) => {
    // 1. Анализ сообщения
    const analysis = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        characterName: params.character,
        playerMessage,
        currentTrust: trust,
        currentEmotion: emotion,
        revealedSecrets: []
      })
    }).then(r => r.json());

    // 2. Обновить trust и emotion
    const newTrust = trust + analysis.trustChange;
    setTrust(newTrust);
    setEmotion(analysis.newEmotion);
    setIsBlocked(analysis.triggerBlock || newTrust < 10);

    // 3. Генерация ответа персонажа
    const response = await fetch('/api/respond', {
      method: 'POST',
      body: JSON.stringify({
        characterName: params.character,
        playerMessage,
        trust: newTrust,
        emotion: analysis.newEmotion,
        conversationHistory: messages.slice(-5),
        revealedSecrets: []
      })
    }).then(r => r.json());

    // 4. Добавить в историю
    setMessages([
      ...messages,
      { text: playerMessage, isPlayer: true, timestamp: new Date() },
      { text: response.response, isPlayer: false, emotion: analysis.newEmotion, timestamp: new Date() }
    ]);

    // 5. Сохранить в БД
    await fetch('/api/state', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: sessionId,
        characterName: params.character,
        trust: newTrust,
        emotion: analysis.newEmotion,
        lastMessage: response.response
      })
    });
  };

  return (
    <div className="flex h-screen">
      {/* Основной чат */}
      <div className="flex-1 flex flex-col">
        {/* Хедер с trust и emotion */}
        <div className="p-4 border-b">
          <TrustMeter trust={trust} characterName={params.character} />
          <EmotionIndicator emotion={emotion} />
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} {...msg} />
          ))}
        </div>

        {/* Поле ввода */}
        <ChatInput onSend={handleSendMessage} disabled={isBlocked} />
      </div>

      {/* Боковая панель с уликами */}
      <div className="w-80 border-l p-4">
        <EvidencePanel evidence={evidence} />
      </div>
    </div>
  );
}
```

### layout.tsx
- [ ] Общий layout для всех страниц
- [ ] Meta tags (title, description)
- [ ] Подключение шрифтов
- [ ] Tailwind CSS

**Структура:**
```tsx
export const metadata = {
  title: 'Quest Messenger',
  description: 'Детективный квест в формате мессенджера'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

### globals.css
- [ ] Tailwind импорты
- [ ] Кастомные стили (если нужно)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Кастомные стили */
.message-bubble {
  @apply max-w-[70%] rounded-2xl px-4 py-2;
}
```

## Связь с другими модулями

- Использует компоненты из `/components`
- Вызывает API routes из `/app/api`
- Использует типы из `/lib/types.ts`

## Важно для Haiku

1. Начни с **layout.tsx** и **globals.css** — базовая настройка
2. Потом **page.tsx** — главная страница (простая)
3. Финал: **chat/[character]/page.tsx** — самая сложная страница

**Тестируй:** проверяй каждую страницу локально `npm run dev`!

## Пример навигации

```
/ (главная)
  ├── CharacterCard: Анна → click
  └── /chat/anna
        ├── Загрузка state
        ├── Отображение чата
        └── Отправка сообщения → API calls → обновление UI
```
