// ============================================
// API Route: /api/state
// Сохранение и загрузка game state
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getGameSession,
  getCharacterState,
  updateCharacterState,
  addMessage,
  addEvidence,
  getCollectedEvidence,
  getDialogueHistory,
} from '@/lib/db';
import { CharacterName } from '@/lib/types';

// GET /api/state?sessionId=xxx&characterName=anna
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const characterName = searchParams.get('characterName') as CharacterName;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
        { status: 400 }
      );
    }

    // Загружаем состояние сессии
    const session = await getGameSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Если указан персонаж - загружаем его состояние
    let characterState = null;
    let messages: any[] = [];

    if (characterName) {
      characterState = await getCharacterState(sessionId, characterName);
      messages = await getDialogueHistory(sessionId, characterName);
    }

    // Загружаем собранные улики
    const evidence = await getCollectedEvidence(sessionId);

    return NextResponse.json({
      session,
      characterState,
      messages,
      evidence,
    });
  } catch (error) {
    console.error('[/api/state GET] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to load state',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/state
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      sessionId,
      characterName,
      trustLevel,
      currentEmotion,
      blocked,
      secretsRevealed,
      message,
      isPlayer,
      trustChange,
      emotionAfter,
      evidenceId,
    } = body;

    if (!sessionId || !characterName) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, characterName' },
        { status: 400 }
      );
    }

    // Обновляем состояние персонажа
    await updateCharacterState(sessionId, characterName as CharacterName, {
      trustLevel,
      currentEmotion,
      blocked,
      secretsRevealed,
    });

    // Добавляем сообщение в историю (если передано)
    if (message !== undefined) {
      await addMessage(
        sessionId,
        characterName as CharacterName,
        message,
        isPlayer,
        trustChange,
        emotionAfter
      );
    }

    // Добавляем улику (если передана)
    if (evidenceId) {
      await addEvidence(sessionId, evidenceId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[/api/state POST] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to save state',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
