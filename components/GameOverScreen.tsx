'use client';

interface GameResult {
  success: boolean;
  reason: 'arrested' | 'escaped' | 'insufficient_evidence';
  evidenceCollected: string[];
}

interface Props {
  result: GameResult;
  onRestart: () => void;
}

export default function GameOverScreen({ result, onRestart }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full text-center shadow-2xl">
        {result.success ? (
          <>
            <div className="text-8xl mb-4">✅</div>
            <h2 className="text-4xl font-bold text-green-600 mb-4">
              ВИКТОР КРЫЛОВ ЗАДЕРЖАН!
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              Полиция прибыла и задержала Виктора Крылова!
            </p>
            <div className="bg-green-50 p-4 rounded-lg mb-6 border-2 border-green-200">
              <p className="text-green-800 font-bold mb-2">
                🎉 ДЕЛО РАСКРЫТО!
              </p>
              <p className="text-sm text-green-700">
                Виктор Крылов признался в убийстве Павла Громова путём
                отравления дигиталисом. Мотив: шантаж не сработал, Громов
                отказался отдавать долю компании.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-8xl mb-4">❌</div>
            <h2 className="text-4xl font-bold text-red-600 mb-4">
              {result.reason === 'escaped' ? 'ВИКТОР СБЕЖАЛ' : 'НЕУДАЧА'}
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              {result.reason === 'escaped'
                ? 'Вы не успели узнать адрес и вызвать полицию вовремя. Виктор Крылов скрылся.'
                : 'Недостаточно доказательств для выдвижения обвинения.'}
            </p>
            <div className="bg-red-50 p-4 rounded-lg mb-6 border-2 border-red-200">
              <p className="text-red-800 font-bold mb-2">
                💡 ПОДСКАЗКА
              </p>
              <p className="text-sm text-red-700">
                {result.reason === 'escaped'
                  ? 'После обвинения нужно узнать адрес Виктора у Анны или Бориса за 10 сообщений. Борис говорит правду, Анна врёт (Виктор ей угрожает)!'
                  : 'Соберите ключевые улики: показания Анны (видела Виктора), показания Бориса (слышал шантаж). Используйте правильный подход к каждому персонажу!'}
              </p>
            </div>
          </>
        )}

        <div className="mt-6 text-left bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-3 text-gray-800">
            📋 Собранные улики ({result.evidenceCollected.length}):
          </h3>
          <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
            {result.evidenceCollected.length > 0 ? (
              result.evidenceCollected.map((ev, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{ev}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">Улики не собраны</li>
            )}
          </ul>
        </div>

        <button
          onClick={onRestart}
          className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 text-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg"
        >
          🔄 Начать заново
        </button>
      </div>
    </div>
  );
}
