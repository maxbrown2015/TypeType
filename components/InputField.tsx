'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '@/lib/types';

interface InputFieldProps {
  gameState: GameState | null;
  playerInput: string;
  onInputChange: (input: string) => void;
  onSubmit: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  gameState,
  playerInput,
  onInputChange,
  onSubmit,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Auto-focus input when it's current player's turn
  useEffect(() => {
    if (gameState?.gameStatus === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState?.currentPlayer, gameState?.gameStatus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const isCorrect =
    gameState?.playerInput &&
    gameState?.targetWord &&
    gameState.playerInput.toLowerCase().trim() ===
      gameState.targetWord.toLowerCase().trim();

  const isWrong =
    gameState?.playerInput &&
    gameState?.targetWord &&
    gameState.playerInput.toLowerCase().trim() !==
      gameState.targetWord.toLowerCase().trim() &&
    playerInput.length > 0;

  const progress = gameState?.targetWord
    ? (playerInput.length / gameState.targetWord.length) * 100
    : 0;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      {/* Target word display */}
      <div className="text-center">
        <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Type this word:</p>
        <p className="text-5xl font-bold text-blue-400 tracking-widest drop-shadow-lg">
          {gameState?.targetWord || '...'}
        </p>
      </div>

      {/* Input field with progress */}
      <div className="w-full">
        <input
          ref={inputRef}
          type="text"
          value={playerInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={gameState?.gameStatus !== 'playing'}
          placeholder="Start typing..."
          className={`
            px-6 py-4 text-2xl font-mono text-center rounded-lg
            border-2 transition-all w-full
            ${
              gameState?.gameStatus !== 'playing'
                ? 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed'
                : isCorrect
                  ? 'bg-green-900 border-green-400 text-green-300 shadow-lg shadow-green-500/50'
                  : isWrong
                    ? 'bg-red-900 border-red-400 text-red-300 shadow-lg shadow-red-500/30'
                    : 'bg-slate-800 border-slate-500 text-slate-100 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/50 focus:outline-none'
            }
          `}
        />

        {/* Progress bar */}
        <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              isCorrect ? 'bg-green-500' : isWrong ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Feedback message with animation */}
      <div className="h-8 flex items-center">
        {isCorrect && (
          <p className="text-lg font-bold text-green-400 animate-pulse">
            ✓ Correct! Great job!
          </p>
        )}
        {isWrong && (
          <p className="text-lg font-bold text-red-400">✗ Not quite</p>
        )}
        {gameState?.gameStatus === 'lost' && (
          <p className="text-lg font-bold text-red-500">Game Over!</p>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={gameState?.gameStatus !== 'playing' || !playerInput}
        className={`
          px-8 py-3 text-lg font-bold rounded-lg transition-all
          ${
            gameState?.gameStatus !== 'playing' || !playerInput
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg hover:shadow-blue-500/50'
          }
        `}
      >
        Submit (Enter)
      </button>

      {/* Character counter */}
      <div className="flex gap-2 text-xs text-slate-500">
        <p>
          {playerInput.length} / {gameState?.targetWord?.length || 0} characters
        </p>
        {gameState?.targetWord && playerInput.length === gameState.targetWord.length && !isCorrect && (
          <p className="text-yellow-400">⚠ Check spelling</p>
        )}
      </div>
    </div>
  );
};
