# /components — UI Компоненты

## Что здесь находится

React компоненты для интерфейса мессенджера:

- **MessageBubble.tsx** — пузырь сообщения (игрок/персонаж)
- **ChatInput.tsx** — поле ввода сообщения
- **TrustMeter.tsx** — индикатор доверия персонажа
- **EmotionIndicator.tsx** — индикатор текущей эмоции
- **EvidencePanel.tsx** — панель собранных улик
- **CharacterCard.tsx** — карточка персонажа на главной странице

## Что нужно сделать

### MessageBubble.tsx
- [ ] Компонент пузыря сообщения
- [ ] Разные стили для игрока (синий, справа) и персонажа (серый, слева)
- [ ] Отображение timestamp
- [ ] Отображение эмоции персонажа (emoji)
- [ ] Поддержка markdown текста (жесты: `*теребит браслет*`)

**Props:**
```typescript
interface MessageBubbleProps {
  message: string;
  isPlayer: boolean;
  emotion?: Emotion;
  timestamp: Date;
}
```

### ChatInput.tsx
- [ ] Поле ввода текста
- [ ] Кнопка "Отправить"
- [ ] Disabled state (когда персонаж заблокировал)
- [ ] Enter для отправки
- [ ] Автофокус при загрузке

**Props:**
```typescript
interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}
```

### TrustMeter.tsx
- [ ] Progress bar (0-100)
- [ ] Цвета: красный (<30), жёлтый (30-70), зелёный (>70)
- [ ] Анимация изменения
- [ ] Текст: "Низкое/Среднее/Высокое доверие"

**Props:**
```typescript
interface TrustMeterProps {
  trust: number;
  characterName: string;
}
```

### EmotionIndicator.tsx
- [ ] Отображение текущей эмоции персонажа
- [ ] Emoji + текст (например: 😠 Раздражён)
- [ ] Плавная смена эмоций (transition)

**Props:**
```typescript
interface EmotionIndicatorProps {
  emotion: Emotion;
}
```

### EvidencePanel.tsx
- [ ] Список собранных улик
- [ ] Группировка по персонажам
- [ ] Кликабельные улики (можно использовать в диалоге)
- [ ] Счётчик улик (5/12)

**Props:**
```typescript
interface EvidencePanelProps {
  evidence: Evidence[];
  onEvidenceClick?: (evidenceId: string) => void;
}
```

### CharacterCard.tsx
- [ ] Карточка персонажа на главной странице
- [ ] Аватар
- [ ] Имя, должность
- [ ] Кнопка "Начать разговор"
- [ ] Индикатор прогресса (если уже общались)

**Props:**
```typescript
interface CharacterCardProps {
  character: Character;
  onStartChat: (characterName: string) => void;
}
```

## Связь с другими модулями

- Используются на страницах `/app/page.tsx` и `/app/chat/[character]/page.tsx`
- Получают данные из `/lib/game-state.ts`
- Вызывают API routes `/app/api/*` через fetch

## Технические детали

### Tailwind CSS
Используем Tailwind для стилизации:
```tsx
<div className="bg-blue-500 text-white rounded-2xl px-4 py-2">
  {message}
</div>
```

### TypeScript типы
Импортируй типы из `/lib/types.ts`:
```tsx
import { Emotion, Evidence, Character } from '@/lib/types';
```

### Анимации
Используй Tailwind transitions:
```tsx
<div className="transition-all duration-500 ease-in-out">
  {/* content */}
</div>
```

## Важно для Haiku

1. Начни с **MessageBubble** — самый базовый компонент
2. Потом **ChatInput** — простой input + button
3. Затем **TrustMeter** — progress bar
4. Потом **EmotionIndicator** — просто emoji + текст
5. Затем **CharacterCard** — для главной страницы
6. Финал: **EvidencePanel** — самый сложный

**Тестируй:** каждый компонент в изоляции перед интеграцией в страницы!

## Примеры использования

```tsx
// MessageBubble
<MessageBubble
  message="*отводит взгляд* Не знаю..."
  isPlayer={false}
  emotion="defensive"
  timestamp={new Date()}
/>

// ChatInput
<ChatInput
  onSend={(msg) => handleSend(msg)}
  disabled={isBlocked}
  placeholder="Напишите сообщение..."
/>

// TrustMeter
<TrustMeter trust={45} characterName="Анна" />
```
