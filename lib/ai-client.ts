// ============================================
// QUEST MESSENGER - AI Client (Open Router)
// ============================================

import {
  AnalyzeMessageRequest,
  AnalyzeMessageResponse,
  GenerateResponseRequest,
  GenerateResponseResponse,
} from './types';
import { getAnalyzerPrompt, getCharacterPrompt } from './prompts';

// Open Router API настройки
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-chat'; // DeepSeek V3

/**
 * Вызов Open Router API
 */
async function callOpenRouter(
  prompt: string,
  maxTokens: number = 500,
  temperature: number = 0.7
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Quest Messenger',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Open Router API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from Open Router API');
  }

  const content = data.choices[0].message.content;

  // Логирование токенов (для мониторинга расходов)
  if (data.usage) {
    console.log('[AI Usage]', {
      prompt_tokens: data.usage.prompt_tokens,
      completion_tokens: data.usage.completion_tokens,
      total_tokens: data.usage.total_tokens,
    });
  }

  return content;
}

/**
 * Анализировать сообщение игрока
 */
export async function analyzeMessage(
  request: AnalyzeMessageRequest
): Promise<AnalyzeMessageResponse> {
  try {
    // Формируем промпт
    const prompt = getAnalyzerPrompt(
      request.characterName,
      request.playerMessage,
      request.currentTrust,
      request.currentEmotion,
      request.revealedSecrets
    );

    // Вызываем AI
    const rawResponse = await callOpenRouter(prompt, 300, 0.5);

    // Парсим JSON ответ
    const response = parseAnalysisResponse(rawResponse);

    return response;
  } catch (error) {
    console.error('[analyzeMessage] Error:', error);
    throw new Error(`Failed to analyze message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Генерировать ответ персонажа
 */
export async function generateCharacterResponse(
  request: GenerateResponseRequest
): Promise<GenerateResponseResponse> {
  try {
    // Формируем промпт
    const prompt = getCharacterPrompt(
      request.characterName,
      request.playerMessage,
      request.trust,
      request.emotion,
      request.conversationHistory,
      request.revealedSecrets,
      request.panicMode,
      request.panicLevel,
      request.messagesLeft,
      request.collectedEvidence
    );

    // Вызываем AI
    const response = await callOpenRouter(prompt, 400, 0.8);

    // Очищаем ответ от возможных артефактов
    const cleanedResponse = cleanCharacterResponse(response);

    return {
      response: cleanedResponse,
    };
  } catch (error) {
    console.error('[generateCharacterResponse] Error:', error);
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Парсинг JSON ответа от анализатора
 */
function parseAnalysisResponse(rawResponse: string): AnalyzeMessageResponse {
  try {
    console.log('[parseAnalysisResponse] RAW:', rawResponse.substring(0, 200));

    // Убираем markdown блоки (```json ... ```)
    let cleaned = rawResponse.trim();

    // Извлекаем JSON из markdown блоков если они есть
    const markdownMatch = cleaned.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (markdownMatch) {
      cleaned = markdownMatch[1];
      console.log('[parseAnalysisResponse] Extracted from markdown');
    } else {
      // Если нет markdown, просто убираем обёртки
      cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    }

    // Убираем невидимые символы
    cleaned = cleaned.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF]/g, '');

    // Извлекаем первый валидный JSON объект
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    console.log('[parseAnalysisResponse] CLEANED:', cleaned.substring(0, 200));
    const parsed = JSON.parse(cleaned);
    console.log('[parseAnalysisResponse] SUCCESS');

    // Валидация
    if (typeof parsed.trustChange !== 'number') {
      throw new Error('trustChange must be a number');
    }

    if (!['neutral', 'defensive', 'angry', 'sad', 'fearful', 'openness', 'suspicious'].includes(parsed.newEmotion)) {
      throw new Error('Invalid emotion value');
    }

    return {
      trustChange: parsed.trustChange,
      newEmotion: parsed.newEmotion,
      triggerBlock: Boolean(parsed.triggerBlock),
      detectedTopics: Array.isArray(parsed.detectedTopics) ? parsed.detectedTopics : [],
      shouldRevealSecret: parsed.shouldRevealSecret || null,
      reasoning: parsed.reasoning || '',
    };
  } catch (error) {
    console.error('[parseAnalysisResponse] ❌ PARSE ERROR:');
    console.error('Error message:', error instanceof Error ? error.message : error);
    console.error('RAW response (first 500 chars):', rawResponse.substring(0, 500));
    console.error('Stack:', error instanceof Error ? error.stack : 'no stack');

    // Fallback: возвращаем нейтральный ответ
    return {
      trustChange: 0,
      newEmotion: 'neutral',
      triggerBlock: false,
      detectedTopics: [],
      shouldRevealSecret: null,
      reasoning: 'Ошибка парсинга ответа AI',
    };
  }
}

/**
 * Очистка ответа персонажа от артефактов
 */
function cleanCharacterResponse(response: string): string {
  let cleaned = response.trim();

  // Убираем префиксы типа "Анна:", "Борис:", "Виктор:"
  cleaned = cleaned.replace(/^(Анна|Борис|Виктор):\s*/i, '');

  // Убираем JSON блоки если они случайно попали
  cleaned = cleaned.replace(/```json[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/\{[\s\S]*?\}/g, '');

  // Убираем лишние пробелы
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Проверка доступности API
 */
export async function testOpenRouterConnection(): Promise<boolean> {
  try {
    const response = await callOpenRouter('Test prompt', 10, 0.5);
    return response.length > 0;
  } catch (error) {
    console.error('[testOpenRouterConnection] Failed:', error);
    return false;
  }
}
