// ============================================
// API Route: /api/analyze
// Анализ сообщения игрока
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeMessage } from '@/lib/ai-client';
import { AnalyzeMessageRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeMessageRequest = await req.json();

    // Валидация входных данных
    if (!body.characterName || !body.playerMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: characterName, playerMessage' },
        { status: 400 }
      );
    }

    if (typeof body.currentTrust !== 'number' || body.currentTrust < 0 || body.currentTrust > 100) {
      return NextResponse.json(
        { error: 'Invalid currentTrust value (must be 0-100)' },
        { status: 400 }
      );
    }

    // Вызов AI для анализа
    const analysis = await analyzeMessage({
      characterName: body.characterName,
      playerMessage: body.playerMessage,
      currentTrust: body.currentTrust,
      currentEmotion: body.currentEmotion,
      revealedSecrets: body.revealedSecrets || [],
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('[/api/analyze] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to analyze message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
