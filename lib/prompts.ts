// ============================================
// QUEST MESSENGER - Prompts Loader
// ============================================

import fs from 'fs';
import path from 'path';
import { CharacterName, PromptVariables, ConversationMessage } from './types';

// Путь к папке с промптами
const PROMPTS_DIR = path.join(process.cwd(), 'data', 'prompts');

// Кэш промптов (чтобы не читать файл каждый раз)
const promptCache: Map<string, string> = new Map();

/**
 * Загрузить промпт из файла
 */
export function loadPrompt(promptName: string): string {
  // Проверяем кэш
  if (promptCache.has(promptName)) {
    return promptCache.get(promptName)!;
  }

  // Читаем файл
  const filePath = path.join(PROMPTS_DIR, `${promptName}.txt`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt file not found: ${promptName}.txt`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Сохраняем в кэш
  promptCache.set(promptName, content);

  return content;
}

/**
 * Форматировать промпт с подстановкой переменных
 */
export function formatPrompt(promptName: string, variables: PromptVariables): string {
  let prompt = loadPrompt(promptName);

  // Подстановка переменных
  if (variables.characterName !== undefined) {
    prompt = prompt.replace(/{characterName}/g, variables.characterName);
  }

  if (variables.trust !== undefined) {
    prompt = prompt.replace(/{trust}/g, variables.trust.toString());
  }

  if (variables.emotion !== undefined) {
    prompt = prompt.replace(/{emotion}/g, variables.emotion);
  }

  if (variables.revealedSecrets !== undefined) {
    const secretsStr = variables.revealedSecrets.length > 0
      ? JSON.stringify(variables.revealedSecrets, null, 2)
      : '[]';
    prompt = prompt.replace(/{revealedSecrets}/g, secretsStr);
  }

  if (variables.conversationHistory !== undefined) {
    const historyStr = formatConversationHistory(variables.conversationHistory);
    prompt = prompt.replace(/{conversationHistory}/g, historyStr);
  }

  if (variables.playerMessage !== undefined) {
    prompt = prompt.replace(/{playerMessage}/g, variables.playerMessage);
  }

  if (variables.characterBio !== undefined) {
    prompt = prompt.replace(/{characterBio}/g, variables.characterBio);
  }

  if (variables.characterSecrets !== undefined) {
    prompt = prompt.replace(/{characterSecrets}/g, variables.characterSecrets);
  }

  if (variables.currentTrust !== undefined) {
    prompt = prompt.replace(/{currentTrust}/g, variables.currentTrust.toString());
  }

  if (variables.currentEmotion !== undefined) {
    prompt = prompt.replace(/{currentEmotion}/g, variables.currentEmotion);
  }

  // Переменные для режима паники
  if (variables.panicLevel !== undefined) {
    prompt = prompt.replace(/{panicLevel}/g, variables.panicLevel.toString());
  }

  if (variables.messagesLeft !== undefined) {
    prompt = prompt.replace(/{messagesLeft}/g, variables.messagesLeft.toString());
  }

  // Переменные для улик
  if (variables.collectedEvidence !== undefined) {
    prompt = prompt.replace(/{collectedEvidence}/g, variables.collectedEvidence);
  } else {
    // Дефолтное значение если улики не переданы
    prompt = prompt.replace(/{collectedEvidence}/g, '[Информация об уликах недоступна]');
  }

  return prompt;
}

/**
 * Форматировать историю диалога для промпта
 */
function formatConversationHistory(history: ConversationMessage[]): string {
  if (history.length === 0) {
    return '[Диалог только начинается]';
  }

  return history
    .map((msg) => {
      const role = msg.role === 'player' ? 'Игрок' : getRoleDisplayName(msg.role as CharacterName);
      return `${role}: ${msg.message}`;
    })
    .join('\n');
}

/**
 * Получить отображаемое имя роли
 */
function getRoleDisplayName(role: CharacterName): string {
  const names: Record<CharacterName, string> = {
    anna: 'Анна',
    boris: 'Борис',
    viktor: 'Виктор',
  };
  return names[role];
}

/**
 * Получить промпт анализатора
 */
export function getAnalyzerPrompt(
  characterName: CharacterName,
  playerMessage: string,
  currentTrust: number,
  currentEmotion: string,
  revealedSecrets: string[]
): string {
  const characterBio = getCharacterBio(characterName);
  const characterSecrets = getCharacterSecrets(characterName);

  return formatPrompt('analyzer', {
    characterName,
    characterBio,
    characterSecrets,
    playerMessage,
    currentTrust,
    currentEmotion: currentEmotion as any,
    revealedSecrets,
  });
}

/**
 * Получить промпт персонажа
 */
export function getCharacterPrompt(
  characterName: CharacterName,
  playerMessage: string,
  trust: number,
  emotion: string,
  conversationHistory: ConversationMessage[],
  revealedSecrets: string[],
  panicMode?: boolean,
  panicLevel?: number,
  messagesLeft?: number,
  collectedEvidence?: string
): string {
  // Для Виктора в режиме паники используем специальный промпт
  const promptName = panicMode && characterName === 'viktor'
    ? 'viktor-panic'
    : `${characterName}-base`;

  const variables: any = {
    trust,
    emotion: emotion as any,
    revealedSecrets,
    conversationHistory,
    playerMessage,
  };

  // Добавляем переменные для режима паники
  if (panicMode && panicLevel !== undefined && messagesLeft !== undefined) {
    variables.panicLevel = panicLevel;
    variables.messagesLeft = messagesLeft;
  }

  // Добавляем улики (только для помощника)
  if (characterName === 'helper' && collectedEvidence !== undefined) {
    variables.collectedEvidence = collectedEvidence;
  }

  return formatPrompt(promptName, variables);
}

/**
 * Получить краткую биографию персонажа (для анализатора)
 */
function getCharacterBio(characterName: CharacterName): string {
  const bios: Record<CharacterName, string> = {
    helper: 'Детектив-помощник игрока. Нейтральный наблюдатель, помогает анализировать улики и направляет расследование.',

    anna: 'Анна Соколова, 28 лет, секретарь директора. Выросла в детском доме, нервная, неуверенная. Громов дал ей работу когда никто не брал. Боится конфликтов, избегает зрительного контакта, часто теребит браслет.',

    boris: 'Борис Титов, 45 лет, начальник охраны. Бывший военный, замкнутый, честный. У него есть дочь Катя. Очень сдержанный, не любит пустой болтовни. Уважает иерархию и дисциплину.',

    viktor: 'Виктор Крылов, 38 лет, заместитель директора. Амбициозный, харизматичный, обаятельный. Любит когда его хвалят - комплименты дают +12-15 к доверию. Умеет манипулировать людьми.',
  };

  return bios[characterName];
}

/**
 * Получить список секретов персонажа (для анализатора)
 */
function getCharacterSecrets(characterName: CharacterName): string {
  const secrets: Record<CharacterName, string> = {
    helper: '[У помощника нет секретов - он нейтральный наблюдатель]',

    anna: `СЕКРЕТЫ АННЫ (раскрываются постепенно при росте доверия):

Уровень 1 (trust >= 30):
- anna_romance: Тайный роман с Громовым (полгода, он оборвал за неделю до смерти)
- Анна начинает открываться, может признать роман

Уровень 2 (trust >= 60):
- Анна может рассказать про камеры охраны (отключены)
- Может упомянуть что видела кого-то у кабинета

Уровень 3 (trust >= 70):
- anna_saw_viktor: КЛЮЧЕВАЯ УЛИКА - Анна видела Виктора выходящим из кабинета директора поздно вечером в пятницу (ночь убийства)
- Может указать на Виктора как подозреваемого`,

    boris: `СЕКРЕТЫ БОРИСА (раскрываются постепенно при росте доверия):

Уровень 1 (trust >= 40):
- boris_cameras: Камеры были отключены с 22:00 до 01:00 в ночь убийства
- Борис может признать что отключил их

Уровень 2 (trust >= 60):
- boris_order: Громов САМ приказал отключить камеры, сказав что ждёт "важного человека"
- Это алиби Бориса

Уровень 3 (trust >= 80):
- boris_blackmail: КЛЮЧЕВАЯ УЛИКА - Виктор шантажировал Громова, требовал 30% компании и должность гендира
- boris_warning: Громов предупредил "Если что-то случится — ищи среди своих"`,

    viktor: `СЕКРЕТЫ ВИКТОРА (раскрываются постепенно при росте доверия):

Уровень 1 (trust >= 40):
- viktor_audit: Виктор обнаружил хищения Громова (около 2 млн рублей через фиктивные контракты)
- Виктор может обвинять Анну в убийстве из ревности

Уровень 2 (trust >= 70):
- Виктор может признать что шантажировал Громова
- Может рассказать про конфликт с директором

Уровень 3 (trust >= 85):
- viktor_confession: ВЫИГРЫШНАЯ УЛИКА - ПРИЗНАНИЕ в убийстве! Виктор подсыпал яд (дигиталис) в виски Громова`,
  };

  return secrets[characterName];
}

/**
 * Очистить кэш промптов (для тестирования)
 */
export function clearPromptCache(): void {
  promptCache.clear();
}
