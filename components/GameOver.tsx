'use client';

import React from 'react';
import { GameState } from '@/lib/types';

interface GameOverProps {
  gameState: GameState;
  onPlayAgain: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ gameState, onPlayAgain }) => {
  const p1Total = gameState.player1Score.volleys + gameState.player2Score.volleys;
  // Winner is whoever didn't lose
  const winner = gameState.losingPlayer === 1 ? 'Player 2' : gameState.losingPlayer === 2 ? 'Player 1' : 'Tie';

  const getBetterPlayer = () => {
    if (gameState.player1Score.accuracy > gameState.player2Score.accuracy) {
      return 'P1 had better accuracy';
    } else if (gameState.player2Score.accuracy > gameState.player1Score.accuracy) {
      return 'P2 had better accuracy';
    }
    return 'Tied on accuracy';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-8 max-w-md w-full mx-4">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          Game Over!
        </h2>

        {/* Winner */}
        <div className="text-center mb-8 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400 mb-2 uppercase tracking-wide">
            Winner
          </p>
          <p className="text-2xl font-bold text-green-400">{winner}</p>
          <p className="text-xs text-slate-500 mt-2">{getBetterPlayer()}</p>
        </div>

        {/* Stats */}
        <div className="space-y-4 mb-8">
          {/* Player 1 */}
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="font-bold text-white mb-2">Player 1</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-400">Accuracy</p>
                <p className="text-lg font-bold text-blue-400">
                  {gameState.player1Score.accuracy}%
                </p>
              </div>
              <div>
                <p className="text-slate-400">Avg Time</p>
                <p className="text-lg font-bold text-yellow-400">
                  {gameState.player1Score.averageResponseTime}ms
                </p>
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="font-bold text-white mb-2">Player 2</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-400">Accuracy</p>
                <p className="text-lg font-bold text-blue-400">
                  {gameState.player2Score.accuracy}%
                </p>
              </div>
              <div>
                <p className="text-slate-400">Avg Time</p>
                <p className="text-lg font-bold text-yellow-400">
                  {gameState.player2Score.averageResponseTime}ms
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={onPlayAgain}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors active:scale-95"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
