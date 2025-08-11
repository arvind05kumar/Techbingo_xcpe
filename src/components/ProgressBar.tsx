import React from 'react';
import { GameState } from '../types';

const BOARD_SIZE = 5;

interface ProgressBarProps {
  gameState: GameState;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ gameState }) => {
  const totalCells = BOARD_SIZE * BOARD_SIZE;
  const answeredCells = gameState.correctAnswers.size + gameState.wrongAnswers.size;
  const progress = (answeredCells / totalCells) * 100;
  const correctProgress = (gameState.correctAnswers.size / totalCells) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progress: {Math.round(progress)}%
        </span>
        <span className="text-sm font-medium text-green-600">
          Correct: {gameState.correctAnswers.size}/{totalCells}
        </span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${correctProgress}%` }}
        />
        <div
          className="h-full bg-red-500 transition-all duration-300 -mt-4"
          style={{ width: `${progress - correctProgress}%`, marginLeft: `${correctProgress}%` }}
        />
      </div>
    </div>
  );
};