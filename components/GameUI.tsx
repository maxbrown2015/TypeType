'use client';

import React from 'react';
import { GameState } from '@/lib/types';

interface GameUIProps {
  gameState: GameState | null;
  timeRemaining: number;
  elapsedTime: number;
}

export const GameUI: React.FC<GameUIProps> = ({ gameState, timeRemaining, elapsedTime }) => {
  if (!gameState) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 px-2 md:px-4 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Type Type</h1>
          <p className="text-xs md:text-sm text-slate-400">Level {gameState.level}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
            {gameState.currentPlayer === 1 ? 'Player 1 Turn' : 'Player 2 Turn'}
          </p>
          <p className="text-2xl md:text-3xl font-mono font-bold text-blue-400">
            {(elapsedTime / 1000).toFixed(2)}s
          </p>
        </div>
      </div>

      {/* Score boards - stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-2 md:px-4">
        {/* Player 1 */}
        <div
          className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
            gameState.currentPlayer === 1
              ? 'border-green-500 bg-green-950'
              : 'border-slate-600 bg-slate-800'
          }`}
        >
          <h3 className="text-base md:text-lg font-bold text-white mb-2">Player 1</h3>
          <div className="space-y-1 text-xs md:text-sm">
            <p className="text-slate-300">
              Accuracy: <span className="font-bold text-blue-400">{gameState.player1Score.accuracy}%</span>
            </p>
            <p className="text-slate-300">
              Correct: <span className="font-bold text-cyan-400">{gameState.player1Score.correctWords}</span>
            </p>
            {gameState.player1Score.averageResponseTime > 0 && (
              <p className="text-slate-300">
                Avg Time:{' '}
                <span className="font-bold text-yellow-400">
                  {gameState.player1Score.averageResponseTime}ms
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Player 2 */}
        <div
          className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
            gameState.currentPlayer === 2
              ? 'border-fuchsia-500 bg-fuchsia-950'
              : 'border-slate-600 bg-slate-800'
          }`}
        >
          <h3 className="text-base md:text-lg font-bold text-white mb-2">Player 2</h3>
          <div className="space-y-1 text-xs md:text-sm">
            <p className="text-slate-300">
              Accuracy: <span className="font-bold text-blue-400">{gameState.player2Score.accuracy}%</span>
            </p>
            <p className="text-slate-300">
              Correct: <span className="font-bold text-cyan-400">{gameState.player2Score.correctWords}</span>
            </p>
            {gameState.player2Score.averageResponseTime > 0 && (
              <p className="text-slate-300">
                Avg Time:{' '}
                <span className="font-bold text-yellow-400">
                  {gameState.player2Score.averageResponseTime}ms
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Game status indicator */}
      {gameState.gameStatus === 'lost' && (
        <div className="px-2 md:px-4 py-3 mt-4 bg-red-900 border border-red-500 rounded-lg">
          <p className="text-red-200 font-semibold text-center text-sm md:text-base">Game Over!</p>
        </div>
      )}
    </div>
  );
};
