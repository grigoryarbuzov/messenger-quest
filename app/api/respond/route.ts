// ============================================
// API Route: /api/respond
// Генерация ответа персонажа
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateCharacterResponse } from '@/lib/ai-client';
import { GenerateResponseRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: GenerateResponseRequest = await req.json();

    // Валидация входных данных
    if (!body.characterName || !body.playerMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: characterName, playerMessage' },
        { status: 400 }
      );
    }

    if (typeof body.trust !== 'number' || body.trust < 0 || body.trust > 100) {
      return NextResponse.json(
        { error: 'Invalid trust value (must be 0-100)' },
        { status: 400 }
      );
    }

    // Вызов AI для генерации ответа
    const response = await generateCharacterResponse({
      characterName: body.characterName,
      playerMessage: body.playerMessage,
      trust: body.trust,
      emotion: body.emotion,
      conversationHistory: body.conversationHistory || [],
      revealedSecrets: body.revealedSecrets || [],
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[/api/respond] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
