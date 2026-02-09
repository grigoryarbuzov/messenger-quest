// ============================================
// Chat Page
// Страница диалога с персонажем
// ============================================

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import MessageBubble from '@/components/MessageBubble';
import ChatInput from '@/components/ChatInput';
import AccusationCounter from '@/components/AccusationCounter';
import GameOverScreen from '@/components/GameOverScreen';
import { getEmotionEmoji } from '@/lib/emotionUtils';
import { getTriggerManager } from '@/lib/triggerSystem';
import {
  loadActivatedTriggers,
  saveActivatedTriggers
} from '@/lib/localStorage';
import {
  canAccuse,
  calculatePanicIncrease,
  detectAddressInMessage,
  ACCUSATION_MESSAGES_LIMIT,
} from '@/lib/accusationSystem';
import { getAllEvidence } from '@/lib/evidenceSystem';
import {
  CharacterName,
  Emotion,
  CHARACTER_DISPLAY_NAMES,
  INITIAL_TRUST,
  GamePhase,
  AccusationState,
} from '@/lib/types';

interface Message {
  text: string;
  isPlayer: boolean;
  emotion?: Emotion;
  timestamp: Date;
  image?: string; // URL изображения
}

export default function ChatPage({
  params,
}: {
  params: { character: CharacterName };
}) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [trust, setTrust] = useState(INITIAL_TRUST[params.character]);
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [showAccusationModal, setShowAccusationModal] = useState(false);
  const [accusationResult, setAccusationResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  // Новые состояния для системы обвинения
  const [gamePhase, setGamePhase] = useState<GamePhase>('investigation');
  const [accusationState, setAccusationState] = useState<AccusationState>({
    messagesLeft: ACCUSATION_MESSAGES_LIMIT,
    addressRevealed: false, // Не используется в новой механике
    victorPanicLevel: 0,
    startedAt: Date.now(),
  });
  const [activatedTriggers, setActivatedTriggers] = useState<string[]>([]);

  const characterName = CHARACTER_DISPLAY_NAMES[params.character];

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Инициализация сессии при загрузке
  useEffect(() => {
    initializeSession();

    // Загружаем триггеры
    const savedTriggers = loadActivatedTriggers();
    setActivatedTriggers(savedTriggers);
    getTriggerManager().loadState(savedTriggers);

    console.log('✅ Триггеры загружены:', savedTriggers);
  }, []);

  const initializeSession = async () => {
    console.log('🚀 initializeSession запущена для персонажа:', params.character);
    const { loadCharacterData, loadMessages, addMessage, initGame } = await import('@/lib/localStorage');

    // Загружаем данные из LocalStorage
    let characterData = loadCharacterData(params.character);
    console.log('📦 characterData:', characterData);

    if (characterData) {
      // Есть сохранённые данные - загружаем их
      const savedMessages = loadMessages(params.character);

      if (savedMessages.length > 0) {
        const loadedMessages = savedMessages.map((msg) => ({
          text: msg.text,
          isPlayer: msg.isPlayer,
          emotion: msg.emotion,
          timestamp: new Date(msg.timestamp),
          image: msg.image,
        }));

        setMessages(loadedMessages);
        // У Помощника нет доверия
        if (params.character !== 'helper') {
          setTrust(characterData.trust);
        }
        setEmotion(characterData.emotion);
        setIsBlocked(characterData.blocked);

        console.log('✅ Состояние загружено из LocalStorage');
        return;
      }
    }

    // Если данных нет - создаём новую игру
    if (!characterData) {
      initGame(sessionId);
      characterData = loadCharacterData(params.character);
    }

    // Показываем приветствие ТОЛЬКО для helper
    // Остальные персонажи (anna, boris, viktor) начинают с пустым чатом
    if (params.character === 'helper') {
      const messages = loadMessages(params.character);
      console.log('💬 Загружено сообщений для helper:', messages.length, messages);

      // ИСПРАВЛЕНИЕ: Если первое сообщение НЕ содержит картинку - пересоздаём приветствие
      const needsRecreate = messages.length === 0 || !messages[0].image;

      if (messages.length > 0 && !needsRecreate) {
        console.log('📚 Загружаем СТАРЫЕ сообщения с картинкой');
        const loadedMessages = messages.map((msg) => ({
          text: msg.text,
          isPlayer: msg.isPlayer,
          emotion: msg.emotion,
          timestamp: new Date(msg.timestamp),
          image: msg.image,
        }));
        setMessages(loadedMessages);
      } else {
        // Первое приветствие от помощника с изображением места преступления
        console.log('🎬 Создаём НОВОЕ приветственное сообщение с картинкой для helper (старые сообщения будут удалены)');

        // Очищаем старые сообщения helper
        const gameData = localStorage.getItem('quest_messenger_save');
        if (gameData) {
          const parsed = JSON.parse(gameData);
          parsed.characters.helper.messages = [];
          localStorage.setItem('quest_messenger_save', JSON.stringify(parsed));
        }

        const welcomeMessage: Message = {
          text: 'Доброе утро. Вчера в 23:15 директор компании "НейроТех" Павел Громов найден мёртвым в своём кабинете.\n\nОфициально - сердечный приступ. Но есть основания полагать что это убийство.\n\nВаша задача: допросить подозреваемых и найти убийцу. Начните с Анны Соколовой - секретаря директора.',
          isPlayer: false,
          emotion: 'neutral',
          timestamp: new Date(),
          image: '/images/messages/crime_scene.png',
        };
        console.log('📸 Сообщение с картинкой:', welcomeMessage);
        setMessages([welcomeMessage]);
        addMessage(params.character, welcomeMessage.text, false, 'neutral', welcomeMessage.image);
      }
    } else {
      // Для anna, boris, viktor - пустой чат, нет приветствия
      setMessages([]);
    }

    console.log('✅ Новая сессия создана в LocalStorage');
  };

  const handleSendMessage = async (playerMessage: string) => {
    if (isBlocked || isLoading) return;

    // ЛОГИКА ДЛЯ ПОМОЩНИКА
    if (params.character === 'helper') {
      // Детектируем адрес в режиме обвинения
      if (gamePhase === 'accusation_dialogue') {
        const { checkAddressInMessage } = await import('@/lib/evidenceSystem');
        const addressCheck = checkAddressInMessage(playerMessage);

        if (addressCheck === 'correct') {
          // ПОБЕДА: Правильный адрес от Бориса
          setGamePhase('game_over');
          setAccusationResult({
            success: true,
            message: 'ВИКТОР КРЫЛОВ ЗАДЕРЖАН!',
            details: 'Вы узнали правильный адрес от Бориса!\n\nПолиция прибыла на Красный проспект, дом 25 и задержала Виктора при попытке скрыться!',
          });
          return;
        } else if (addressCheck === 'wrong') {
          // ПОРАЖЕНИЕ: Неправильный адрес от Анны
          setGamePhase('game_over');
          setAccusationResult({
            success: false,
            message: 'ВИКТОР СБЕЖАЛ',
            details: 'Вы дали неправильный адрес от Анны!\n\nПолиция прибыла на улицу Кирова, 12 - квартира пустая. Анна обманула вас (Виктор ей угрожал). Виктор успел скрыться.',
          });
          return;
        }
        // Если адрес не детектирован - продолжаем обычный диалог
      }
    }

    setIsLoading(true);

    try {
      // ЛОГИКА ДЛЯ РЕЖИМА ОБВИНЕНИЯ (10 сообщений на узнать адрес)
      if (gamePhase === 'accusation_dialogue') {
        // Виктор заблокирован - не отвечает
        if (params.character === 'viktor') {
          const playerMsg: Message = {
            text: playerMessage,
            isPlayer: true,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, playerMsg]);

          const blockedMsg: Message = {
            text: '*Виктор Крылов заблокировал вас. Сообщения не доставляются.*',
            isPlayer: false,
            emotion: 'neutral',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, blockedMsg]);

          setIsLoading(false);
          return;
        }

        // Для остальных персонажей (Анна, Борис) - уменьшаем счётчик
        const newMessagesLeft = accusationState.messagesLeft - 1;

        console.log(`⏱️ Сообщений осталось: ${newMessagesLeft}`);

        // Обновляем accusationState
        setAccusationState({
          ...accusationState,
          messagesLeft: newMessagesLeft,
        });

        // Проверяем условия завершения
        if (newMessagesLeft <= 0) {
          // Время вышло - ПОРАЖЕНИЕ
          setGamePhase('game_over');
          setAccusationResult({
            success: false,
            message: 'ВИКТОР СБЕЖАЛ',
            details: 'Вы не успели узнать адрес и написать Помощнику вовремя. Виктор Крылов скрылся.',
          });
          setIsLoading(false);
          return;
        }

        // Продолжаем обычный диалог с Анной/Борисом/Помощником
      }

      // ОБЫЧНАЯ ЛОГИКА ДЛЯ РЕЖИМА INVESTIGATION

      // ПРОВЕРКА: Обвинение Виктора в обычном режиме
      if (params.character === 'viktor' && gamePhase === 'investigation') {
        const messageNormalized = playerMessage.toLowerCase();
        const accusationKeywords = ['обвиняю', 'убил', 'виновен', 'убийц', 'преступ'];
        const isAccusation = accusationKeywords.some(keyword => messageNormalized.includes(keyword));

        if (isAccusation) {
          console.log('🚨 Игрок обвинил Виктора! Проверяем улики...');

          // Проверяем условия для обвинения
          const { checkAccusationReadiness } = await import('@/lib/evidenceSystem');
          const accusationStatus = checkAccusationReadiness();

          if (!accusationStatus.canAccuse) {
            // Недостаточно улик - добавляем сообщение игрока и даём ответ Виктора что доказательств нет
            const playerMsg: Message = {
              text: playerMessage,
              isPlayer: true,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, playerMsg]);

            const failureMsg: Message = {
              text: `Обвиняете меня? На каком основании? ${accusationStatus.missingEvidence.length > 0
                ? `У вас нет даже ключевых улик! Я позову адвоката, и вы пожалеете об этом.`
                : `У вас всего ${accusationStatus.evidenceCount} улик, это ничего не доказывает!`} Не смешите меня!`,
              isPlayer: false,
              emotion: 'angry',
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, failureMsg]);

            console.log('❌ Недостаточно улик для обвинения');
            setIsLoading(false);
            return;
          }

          // Достаточно улик - Виктор БЛОКИРУЕТ игрока!
          console.log('✅ Достаточно улик! Виктор блокирует игрока...');

          // Добавляем сообщение игрока
          const playerMsg: Message = {
            text: playerMessage,
            isPlayer: true,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, playerMsg]);

          // Виктор отвечает и блокирует
          const viktorBlockMsg: Message = {
            text: 'Вы... что вы себе позволяете?! У вас нет никаких доказательств! Я не намерен это терпеть!\n\n*ВИКТОР КРЫЛОВ ЗАБЛОКИРОВАЛ ВАС*',
            isPlayer: false,
            emotion: 'angry',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, viktorBlockMsg]);

          // Системное сообщение
          const systemMsg: Message = {
            text: '🚨 ВИКТОР ЗАБЛОКИРОВАЛ ВАС!\n\n⏱️ У вас есть 10 СООБЩЕНИЙ чтобы узнать его ДОМАШНИЙ АДРЕС.\n\n📍 Спросите у АННЫ или БОРИСА где живёт Виктор.\n⚠️ ВАЖНО: Борис честный - скажет правду. Анна врёт (Виктор ей угрожает)!\n\n✅ Узнали адрес? Напишите его ПОМОЩНИКУ - он вызовет полицию!',
            isPlayer: false,
            emotion: 'neutral',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, systemMsg]);

          // Устанавливаем gamePhase = accusation_dialogue
          setGamePhase('accusation_dialogue');

          // Сбрасываем accusationState
          setAccusationState({
            messagesLeft: ACCUSATION_MESSAGES_LIMIT,
            addressRevealed: false,
            victorPanicLevel: 0,
            startedAt: Date.now(),
          });

          // Блокируем Виктора
          setIsBlocked(true);

          // Сохраняем сообщения
          const { addMessage: saveMessage } = await import('@/lib/localStorage');
          saveMessage('viktor', playerMessage, true);
          saveMessage('viktor', viktorBlockMsg.text, false, 'angry');
          saveMessage('viktor', systemMsg.text, false, 'neutral');

          setIsLoading(false);
          return;
        }
      }

      // 1. Добавляем сообщение игрока
      const playerMsg: Message = {
        text: playerMessage,
        isPlayer: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, playerMsg]);

      // 2. Проверяем триггеры ДО отправки (keywords в сообщении)
      const triggerManager = getTriggerManager();
      const collectedEvidence = getAllEvidence();

      const triggersBeforeMessage = triggerManager.checkTriggers({
        characterId: params.character,
        message: playerMessage,
        trustLevel: trust,
        evidence: collectedEvidence.map(e => e.id),
      });

      if (triggersBeforeMessage.length > 0) {
        const updatedTriggers = [...activatedTriggers, ...triggersBeforeMessage];
        setActivatedTriggers(updatedTriggers);
        saveActivatedTriggers(updatedTriggers);
        console.log('🔓 Триггеры активированы ДО сообщения:', triggersBeforeMessage);
      }

      // 3. Анализируем сообщение через AI
      // Получаем ВСЕ собранные улики ПЕРЕД анализом
      const evidenceForAnalysis = getAllEvidence();
      const revealedSecretIdsForAnalysis = evidenceForAnalysis.map(e => e.id);

      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: params.character,
          playerMessage,
          currentTrust: trust,
          currentEmotion: emotion,
          revealedSecrets: revealedSecretIdsForAnalysis, // ✅ Передаём реальные улики
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze message');
      }

      const analysis = await analysisResponse.json();

      // 4. Применяем ограничение по maxTrustLevel из TriggerManager
      // У Помощника нет доверия!
      let newTrust = trust;

      if (params.character !== 'helper') {
        const maxTrustLevel = triggerManager.getMaxTrustLevel(params.character);
        newTrust = Math.max(0, Math.min(100, trust + analysis.trustChange));

        // Ограничиваем доверие максимальным уровнем
        if (newTrust > maxTrustLevel) {
          newTrust = maxTrustLevel;
          console.log(`⚠️ Доверие ограничено до ${maxTrustLevel} (блокировка активна)`);
        }

        setTrust(newTrust);
      }

      setEmotion(analysis.newEmotion);

      // 5. Проверяем триггеры ПОСЛЕ анализа (trust level)
      const triggersAfterMessage = triggerManager.checkTriggers({
        characterId: params.character,
        trustLevel: newTrust,
        evidence: collectedEvidence.map(e => e.id),
      });

      if (triggersAfterMessage.length > 0) {
        const updatedTriggers = [...activatedTriggers, ...triggersAfterMessage];
        setActivatedTriggers(updatedTriggers);
        saveActivatedTriggers(updatedTriggers);
        console.log('🔓 Триггеры активированы ПОСЛЕ сообщения:', triggersAfterMessage);
      }

      // 6. Проверяем блокировку
      if (analysis.triggerBlock || newTrust < 10) {
        setIsBlocked(true);
        setMessages((prev) => [
          ...prev,
          {
            text: '*персонаж заблокировал вас*\nДоверие слишком низкое. Диалог окончен.',
            isPlayer: false,
            emotion: 'angry',
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
        return;
      }

      // 7. Генерируем ответ персонажа
      // Получаем ВСЕ собранные улики из LocalStorage
      const allEvidence = getAllEvidence();
      const revealedSecretIds = allEvidence.map(e => e.id);

      const requestBody: any = {
        characterName: params.character,
        playerMessage,
        trust: newTrust,
        emotion: analysis.newEmotion,
        conversationHistory: messages.slice(-5).map((msg) => ({
          role: msg.isPlayer ? 'player' : params.character,
          message: msg.text,
        })),
        revealedSecrets: revealedSecretIds, // ✅ Передаём реальные улики
      };

      // Для помощника добавляем детальную информацию о собранных уликах
      if (params.character === 'helper') {
        const evidenceList = allEvidence.length > 0
          ? allEvidence.map(e => `- ${e.id}: ${e.title} (от ${e.source})`).join('\n')
          : '[Улик пока нет]';
        requestBody.collectedEvidence = `Всего улик: ${allEvidence.length}\n${evidenceList}`;
      }

      const responseResponse = await fetch('/api/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!responseResponse.ok) {
        throw new Error('Failed to generate response');
      }

      const responseData = await responseResponse.json();

      // 8. Добавляем ответ персонажа
      const characterMsg: Message = {
        text: responseData.response,
        isPlayer: false,
        emotion: analysis.newEmotion,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, characterMsg]);

      // 9. КРИТИЧНО: Проверяем улики в ответе персонажа (investigation mode)
      if (params.character !== 'helper') {
        const { detectEvidence, saveEvidence } = await import('@/lib/evidenceSystem');
        const detectedEvidence = detectEvidence(responseData.response, params.character);

        if (detectedEvidence.length > 0) {
          saveEvidence(detectedEvidence);
          console.log('🔍 Обнаружены улики:', detectedEvidence.map(e => e.title));

          // Показываем зеленое уведомление с описанием
          detectedEvidence.forEach(ev => {
            toast.success(`Новая улика: ${ev.title}`, {
              description: ev.description,
              duration: 4000,
            });
          });
        }
      }

      // 10. Сохраняем state в LocalStorage
      const { addMessage: saveMessage, saveCharacterState } = await import('@/lib/localStorage');

      // Сохраняем сообщение игрока
      saveMessage(params.character, playerMessage, true);

      // Сохраняем ответ персонажа
      saveMessage(params.character, responseData.response, false, analysis.newEmotion);

      // Сохраняем состояние персонажа с актуальными уликами
      const currentEvidence = getAllEvidence();
      saveCharacterState(
        params.character,
        newTrust,
        analysis.newEmotion,
        isBlocked,
        currentEvidence.map(e => e.id) // ✅ Сохраняем актуальные улики
      );

      console.log('✅ Состояние сохранено в LocalStorage');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          text: 'Ошибка отправки сообщения. Попробуйте ещё раз.',
          isPlayer: false,
          emotion: 'neutral',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccuse = async (accused: string) => {
    setShowAccusationModal(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/accuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accused }),
      });

      const result = await response.json();
      setAccusationResult(result);
    } catch (error) {
      console.error('Error making accusation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Новая функция для обвинения Виктора через кнопку AccusationButton
  const handleAccuseViktor = () => {
    // Проверяем условия для обвинения
    const evidence = getAllEvidence();
    const { canAccuse: canAccuseCheck } = canAccuse(
      evidence.map(e => e.id),
      activatedTriggers
    );

    if (!canAccuseCheck) {
      console.warn('❌ Недостаточно улик для обвинения');
      return;
    }

    console.log('🚨 Начинаем режим обвинения Виктора!');

    // Устанавливаем gamePhase = accusation_dialogue
    setGamePhase('accusation_dialogue');

    // Сбрасываем accusationState
    setAccusationState({
      messagesLeft: ACCUSATION_MESSAGES_LIMIT,
      addressRevealed: false,
      victorPanicLevel: 0,
      startedAt: Date.now(),
    });

    // Добавляем системное сообщение
    const systemMsg: Message = {
      text: '🚨 ВЫ ВЫДВИНУЛИ ОБВИНЕНИЕ ПРОТИВ ВИКТОРА КРЫЛОВА!\n\nУ вас есть 10 сообщений, чтобы выведать адрес офиса. Давите психологически, блефуйте, притворяйтесь союзником. Когда паника достигнет 80+, он может проговориться!',
      isPlayer: false,
      emotion: 'neutral',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMsg]);
  };

  const handleGameRestart = () => {
    // Очищаем все данные
    const { clearGameData, clearTriggers } = require('@/lib/localStorage');
    const { clearEvidence } = require('@/lib/evidenceSystem');

    clearGameData();
    clearTriggers();
    clearEvidence();

    // Перезагружаем страницу
    router.push('/home');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 md:bg-gray-200 md:p-4">
      <div className="h-full flex flex-col bg-white md:max-w-md md:mx-auto md:rounded-xl md:shadow-2xl md:border md:border-gray-300 md:overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 flex items-center justify-between md:rounded-t-xl">
          <button
            onClick={() => router.push('/chats')}
            className="text-white hover:text-blue-100 transition-colors"
          >
            ← Назад
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold border-2 border-white/30">
              {characterName.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-base flex items-center gap-1.5">
                {characterName}
                <motion.span
                  key={emotion}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 12
                  }}
                  className="text-lg inline-block"
                >
                  {getEmotionEmoji(emotion, trust)}
                </motion.span>
              </h2>
              <p className="text-xs text-blue-100">
                {params.character === 'helper' && 'Ваш помощник'}
                {params.character === 'anna' && 'Секретарь директора'}
                {params.character === 'boris' && 'Начальник охраны'}
                {params.character === 'viktor' && 'Заместитель директора'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 chat-container bg-[#e5ddd5] md:bg-white">
          <div className="w-full">
          {messages.map((msg, idx) => (
            <div key={idx} className="message-bubble">
              <MessageBubble
                message={msg.text}
                isPlayer={msg.isPlayer}
                emotion={msg.emotion}
                timestamp={msg.timestamp}
                image={msg.image}
              />
            </div>
          ))}

            {/* Индикатор печати с анимацией */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start mb-3"
              >
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm rounded-bl-none">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0,
                        ease: 'easeInOut'
                      }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0.15,
                        ease: 'easeInOut'
                      }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0.3,
                        ease: 'easeInOut'
                      }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={isBlocked || isLoading}
          placeholder={
            isBlocked
              ? 'Персонаж заблокировал вас'
              : isLoading
              ? 'Печатает...'
              : 'Напишите сообщение...'
          }
        />
      </div>

      {/* Accusation Counter (если accusation_dialogue) */}
      {gamePhase === 'accusation_dialogue' && (
        <AccusationCounter
          messagesLeft={accusationState.messagesLeft}
        />
      )}

      {/* Game Over Screen */}
      {gamePhase === 'game_over' && accusationResult && (
        <GameOverScreen
          result={{
            success: accusationResult.success,
            reason: accusationResult.success
              ? 'arrested'
              : accusationState.addressRevealed
              ? 'insufficient_evidence'
              : 'escaped',
            evidenceCollected: getAllEvidence().map(e => e.title),
          }}
          onRestart={handleGameRestart}
        />
      )}

      {/* Модальное окно выбора подозреваемого */}
      {showAccusationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Кого обвиняете?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Выберите подозреваемого. Это решение необратимо!
            </p>
            <div className="space-y-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAccuse('anna')}
                className="w-full px-4 py-3 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded-lg font-medium transition-colors text-left"
              >
                👩 Анна Соколова (Секретарь)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAccuse('boris')}
                className="w-full px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors text-left"
              >
                👨 Борис Петров (Охранник)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAccuse('viktor')}
                className="w-full px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-medium transition-colors text-left"
              >
                👔 Виктор Крылов (Замдиректора)
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAccusationModal(false)}
              className="w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Отмена
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Модальное окно результата (только для старой системы обвинения через helper) */}
      {accusationResult && gamePhase !== 'game_over' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <motion.h3
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 15 }}
              className={`text-xl font-bold mb-3 ${
                accusationResult.success ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {accusationResult.message}
            </motion.h3>
            <p className="text-sm text-gray-700 mb-6 leading-relaxed whitespace-pre-line">
              {accusationResult.details}
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setAccusationResult(null);
                  router.push('/home');
                }}
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Главное меню
              </motion.button>
              {!accusationResult.success && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setAccusationResult(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Продолжить
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
