'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameCanvas } from '@/components/GameCanvas';
import { InputField } from '@/components/InputField';
import { GameUI } from '@/components/GameUI';
import { GameOver } from '@/components/GameOver';
import { useGameState } from '@/hooks/useGameState';

export default function GamePage() {
  const { gameState, timeRemaining, elapsedTime, startGame, updateInput, submitWord } =
    useGameState();
  const [gameStarted, setGameStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Play background music when game starts
  useEffect(() => {
    if (gameStarted && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.3;
      audioRef.current.play().catch(() => {
        // Autoplay might be blocked by browser
        console.log('Audio autoplay was blocked');
      });
    } else if (!gameStarted && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [gameStarted, isMuted]);

  const handleStartGame = () => {
    setGameStarted(true);
    startGame();
  };

  const handlePlayAgain = () => {
    setGameStarted(false);
    setTimeout(() => handleStartGame(), 100);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0.3 : 0;
    }
  };

  if (!gameStarted || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4 md:p-6">
        <div className="text-center max-w-lg">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Type Type</h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8">
            A competitive typing game where every word counts
          </p>
          <div className="bg-slate-800 p-6 md:p-8 rounded-lg border border-slate-700 mb-8">
            <p className="text-slate-400 mb-4 font-semibold">How to Play:</p>
            <ul className="text-left text-slate-300 text-sm space-y-2">
              <li>✓ Type the displayed word before the ball reaches your wall</li>
              <li>✓ Submit by pressing Enter or clicking the Submit button</li>
              <li>✓ Successfully typed words advance the level</li>
              <li>✓ Ball gets faster with each volley</li>
              <li>✗ Miss or time out = Game Over</li>
            </ul>
          </div>
          <button
            onClick={handleStartGame}
            className="px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors active:scale-95"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-3 md:p-6">
      {/* Background music */}
      <audio
        ref={audioRef}
        src="/pixel-fight-8-bit-arcade-music-background-music-for-video-208775.mp3"
        loop
      />

      {/* Mute button */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-10 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      <div className="flex flex-col items-center gap-4 md:gap-8 max-w-6xl mx-auto">
        {/* UI Stats - responsive */}
        <div className="w-full">
          <GameUI gameState={gameState} timeRemaining={timeRemaining} elapsedTime={elapsedTime} />
        </div>

        {/* Game Canvas - responsive */}
        <div className="w-full max-w-4xl">
          <GameCanvas gameState={gameState} timeRemaining={timeRemaining} />
        </div>

        {/* Input Field - responsive */}
        <div className="w-full max-w-2xl px-2 md:px-0">
          <InputField
            gameState={gameState}
            playerInput={gameState.playerInput}
            onInputChange={updateInput}
            onSubmit={submitWord}
          />
        </div>

        {/* Game Over Modal */}
        {gameState.gameStatus === 'lost' && (
          <GameOver gameState={gameState} onPlayAgain={handlePlayAgain} />
        )}
      </div>
    </div>
  );
}
