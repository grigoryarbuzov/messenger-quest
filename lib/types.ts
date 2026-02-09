// ============================================
// QUEST MESSENGER - TypeScript Types
// ============================================

// ============================================
// ПЕРСОНАЖИ
// ============================================

export type CharacterName = 'helper' | 'anna' | 'boris' | 'viktor';

export type Emotion =
  | 'neutral'      // Нейтральная
  | 'defensive'    // Защищается
  | 'angry'        // Злой
  | 'sad'          // Грустный
  | 'fearful'      // Испуганный
  | 'openness'     // Открытый
  | 'suspicious';  // Подозрительный

export interface Character {
  id: CharacterName;
  name: string;
  age: number;
  role: string;
  initialTrust: number;
  background: string;
  characterTraits: string[];
  secrets: {
    level1: Secret[];
    level2: Secret[];
    level3: Secret[];
  };
  blockTriggers: string[];
}

export interface Secret {
  id: string;
  trustRequired: number;
  text: string;
  relatedEvidence?: string[];
}

// ============================================
// ИГРОВАЯ СЕССИЯ
// ============================================

export interface GameSession {
  sessionId: string;
  playerName?: string;
  startedAt: number;
  solved: boolean;
  accusedCharacter?: CharacterName;
  correctGuess?: boolean;
}

export interface CharacterState {
  sessionId: string;
  characterName: CharacterName;
  trustLevel: number;
  currentEmotion: Emotion;
  blocked: boolean;
  secretsRevealed: string[]; // массив id раскрытых секретов
}

// ============================================
// СООБЩЕНИЯ
// ============================================

export interface Message {
  id?: number;
  sessionId: string;
  characterName: CharacterName;
  text: string;
  isPlayer: boolean;
  trustChange?: number;
  emotionAfter?: Emotion;
  timestamp: number;
}

export interface MessageBubbleProps {
  message: string;
  isPlayer: boolean;
  emotion?: Emotion;
  timestamp: Date;
  image?: string; // URL изображения (опционально)
}

// ============================================
// УЛИКИ
// ============================================

export type EvidenceType = 'fact' | 'secret' | 'contradiction' | 'motive';

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  source: CharacterName;
  relevantTo: CharacterName[];
  collectedFrom?: string; // id секрета из которого получена улика
}

export interface CollectedEvidence {
  sessionId: string;
  evidenceId: string;
  collectedAt: number;
}

// ============================================
// AI ИНТЕГРАЦИЯ
// ============================================

export interface AnalyzeMessageRequest {
  characterName: CharacterName;
  playerMessage: string;
  currentTrust: number;
  currentEmotion: Emotion;
  revealedSecrets: string[];
}

export interface AnalyzeMessageResponse {
  trustChange: number;         // от -30 до +20
  newEmotion: Emotion;
  triggerBlock: boolean;
  detectedTopics: string[];
  shouldRevealSecret: string | null;  // id секрета или null
  reasoning: string;
}

export interface GenerateResponseRequest {
  characterName: CharacterName;
  playerMessage: string;
  trust: number;
  emotion: Emotion;
  conversationHistory: ConversationMessage[];
  revealedSecrets: string[];
  // Для режима паники Виктора
  panicMode?: boolean;
  panicLevel?: number;
  messagesLeft?: number;
  // Для помощника - собранные улики
  collectedEvidence?: string;
}

export interface ConversationMessage {
  role: 'player' | CharacterName;
  message: string;
}

export interface GenerateResponseResponse {
  response: string;
}

// ============================================
// ПРОМПТЫ
// ============================================

export interface PromptVariables {
  trust?: number;
  emotion?: Emotion;
  revealedSecrets?: string[];
  conversationHistory?: ConversationMessage[];
  playerMessage?: string;
  characterName?: CharacterName;
  characterBio?: string;
  currentTrust?: number;
  currentEmotion?: Emotion;
}

// ============================================
// GAME STATE
// ============================================

export type GamePhase = 'investigation' | 'accusation_dialogue' | 'game_over';

export interface GameState {
  session: GameSession;
  characterStates: Map<CharacterName, CharacterState>;
  collectedEvidence: Evidence[];
  conversationHistories: Map<CharacterName, Message[]>;
  phase: GamePhase;
  accusationState?: AccusationState;
}

export interface AccusationState {
  messagesLeft: number;
  addressRevealed: boolean;
  victorPanicLevel: number; // 0-100
  startedAt: number;
}

export interface UpdateTrustParams {
  currentTrust: number;
  change: number;
}

export interface CheckSecretRevealParams {
  characterName: CharacterName;
  currentTrust: number;
  revealedSecrets: string[];
}

// ============================================
// КОМПОНЕНТЫ UI
// ============================================

export interface TrustMeterProps {
  trust: number;
  characterName: string;
}

export interface EmotionIndicatorProps {
  emotion: Emotion;
}

export interface EvidencePanelProps {
  evidence: Evidence[];
  onEvidenceClick?: (evidenceId: string) => void;
}

export interface CharacterCardProps {
  character: Character;
  onStartChat: (characterName: CharacterName) => void;
  progress?: number; // 0-100, процент прогресса с персонажем
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

// ============================================
// РЕШЕНИЕ КВЕСТА
// ============================================

export interface Solution {
  murderer: CharacterName;
  requiredEvidence: string[];
  explanation: string;
}

export interface AccusationResult {
  correct: boolean;
  accused: CharacterName;
  actualMurderer: CharacterName;
  evidenceProvided: string[];
  missingEvidence: string[];
}

// ============================================
// УТИЛИТЫ
// ============================================

export type TrustLevel = number; // 0-100

export const TRUST_THRESHOLDS = {
  BLOCK: 10,
  LEVEL_1: 30,
  LEVEL_2: 60,
  LEVEL_3: 85,
} as const;

export const INITIAL_TRUST: Record<CharacterName, number> = {
  helper: 100,  // Помощник всегда на вашей стороне
  anna: 50,
  boris: 40,
  viktor: 60,
};

export const EMOTION_EMOJI: Record<Emotion, string> = {
  neutral: '😐',
  defensive: '🛡️',
  angry: '😠',
  sad: '😢',
  fearful: '😰',
  openness: '😊',
  suspicious: '🤨',
};

export const CHARACTER_DISPLAY_NAMES: Record<CharacterName, string> = {
  helper: 'Ваш помощник',
  anna: 'Анна Соколова',
  boris: 'Борис Титов',
  viktor: 'Виктор Крылов',
};
