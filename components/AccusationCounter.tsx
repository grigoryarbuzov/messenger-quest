'use client';

interface Props {
  messagesLeft: number;
}

export default function AccusationCounter({ messagesLeft }: Props) {
  return (
    <div className="fixed top-4 right-4 bg-gradient-to-br from-red-600 to-red-800 text-white p-4 rounded-lg shadow-2xl z-50 min-w-[250px]">
      <div className="text-sm font-bold mb-3 text-center border-b border-red-400 pb-2">
        🚨 ВИКТОР ЗАБЛОКИРОВАН
      </div>

      <div className="mb-3">
        <div className="text-xs mb-1 text-red-200">Сообщений осталось:</div>
        <div className="text-4xl font-mono font-bold text-center">
          {messagesLeft}<span className="text-2xl text-red-300">/10</span>
        </div>
      </div>

      <div className="text-xs mt-3 pt-3 border-t border-red-400 text-center text-red-100">
        Узнайте адрес Виктора у Анны или Бориса
      </div>

      <div className="mt-2 text-xs bg-yellow-500 text-black p-2 rounded font-bold text-center">
        Напишите адрес ПОМОЩНИКУ!
      </div>
    </div>
  );
}
