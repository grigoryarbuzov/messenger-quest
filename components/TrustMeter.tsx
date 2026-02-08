// ============================================
// TrustMeter Component
// Индикатор доверия персонажа
// ============================================

import React from 'react';
import { TrustMeterProps } from '@/lib/types';
import { getTrustLevelDescription, getTrustColor } from '@/lib/game-state';

export default function TrustMeter({ trust, characterName }: TrustMeterProps) {
  const color = getTrustColor(trust);
  const label = getTrustLevelDescription(trust);

  const colorClasses = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          Доверие {characterName}
        </span>
        <span className="text-sm text-gray-600">
          {label} ({trust}/100)
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${trust}%` }}
        />
      </div>
    </div>
  );
}
