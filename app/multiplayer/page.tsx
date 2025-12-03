'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useWebSocket } from '@/hooks/useWebSocket';
import WaitingRoom from '@/components/WaitingRoom';
import { GameCanvas } from '@/components/GameCanvas';
import { InputField } from '@/components/InputField';
import { GameUI } from '@/components/GameUI';
import { GameOver } from '@/components/GameOver';
import { GameState } from '@/lib/types';
import { getTimeUntilWallHit } from '@/lib/gameEngine';

export default function MultiplayerPage() {
  const [gameMode, setGameMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'waiting'>('idle');
  const [isHost, setIsHost] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const gameStateRef = useRef<GameState | null>(null);

  const handleGameStateUpdate = (state: GameState) => {
    console.log('Game state updated:', state);
  };

  const handleGameStart = (initialState: GameState) => {
    console.log('Game starting:', initialState);
    setGameActive(true);
  };

  const handlePlayerJoined = (joinedPlayerName: string) => {
    console.log('Player joined:', joinedPlayerName);
  };

  const { room, gameState, isConnected, joinRoom, createRoom, startGame, submitWord, updatePlayerInput } = useWebSocket(
    handleGameStateUpdate,
    handleGameStart,
    handlePlayerJoined
  );

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setStatus('idle');
      return;
    }
    setStatus('connecting');
    setIsHost(true);
    createRoom(playerName);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      setStatus('idle');
      return;
    }
    setStatus('connecting');
    setIsHost(false);
    joinRoom(roomCode.toUpperCase(), playerName);
  };

  const handleStartGame = () => {
    startGame();
  };

  const handleInputChange = (input: string) => {
    updatePlayerInput(input);
  };

  const handleSubmitWord = () => {
    if (gameState && submitWord) {
      const timeTaken = Date.now() - gameState.wordStartedAt;
      submitWord(gameState.playerInput, timeTaken);
    }
  };

  const handlePlayAgain = () => {
    setGameActive(false);
    setShowGameOver(false);
    // Could implement rematch logic here
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Track latest gameState for timers without re-registering interval
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Derive time remaining and elapsed time from server state
  useEffect(() => {
    if (!gameActive) {
      setTimeRemaining(0);
      setElapsedTime(0);
      return;
    }

    const updateTimes = () => {
      const state = gameStateRef.current;
      if (!state) return;

      if (state.ballMovingToWall) {
        setTimeRemaining(state.ballTravelTime);
      } else {
        const seconds = getTimeUntilWallHit(state.ball, state.currentPlayer);
        setTimeRemaining(Math.max(0, seconds * 1000));
      }
      setElapsedTime(Math.max(0, Date.now() - state.wordStartedAt));
    };

    updateTimes();
    const interval = setInterval(updateTimes, 100);
    return () => clearInterval(interval);
  }, [gameActive]);

  // Delay showing game over modal so ball can visibly stop at wall
  useEffect(() => {
    if (gameState?.gameStatus === 'lost') {
      const timer = setTimeout(() => setShowGameOver(true), 2000);
      return () => clearTimeout(timer);
    }
    setShowGameOver(false);
  }, [gameState?.gameStatus]);

  // Show waiting room
  if (room && !gameActive) {
    return (
      <WaitingRoom
        room={room}
        isHost={isHost}
        onStartGame={handleStartGame}
        isReadyToStart={!!room.otherPlayerName}
      />
    );
  }

  // Show game
  if (gameActive && gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-3 md:p-6">
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="fixed top-4 right-4 z-10 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <div className="flex flex-col items-center gap-4 md:gap-8 max-w-6xl mx-auto">
          {/* UI Stats */}
          <div className="w-full">
            <GameUI gameState={gameState} timeRemaining={timeRemaining} elapsedTime={elapsedTime} />
          </div>

          {/* Game Canvas */}
          <div className="w-full max-w-4xl">
            <GameCanvas gameState={gameState} timeRemaining={timeRemaining} />
          </div>

          {/* Input Field */}
          <div className="w-full max-w-2xl px-2 md:px-0">
            <InputField
              gameState={gameState}
              playerInput={gameState.playerInput}
              onInputChange={handleInputChange}
              onSubmit={handleSubmitWord}
            />
          </div>

          {/* Game Over Modal */}
          {gameState.gameStatus === 'lost' && showGameOver && (
            <GameOver gameState={gameState} onPlayAgain={handlePlayAgain} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-white mb-2">Type Type</h1>
        <p className="text-slate-300 mb-8">Multiplayer Mode</p>

        {gameMode === 'choose' && (
          <div className="space-y-4">
            <button
              onClick={() => setGameMode('create')}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Create Room
            </button>
            <button
              onClick={() => setGameMode('join')}
              className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Join Room
            </button>
            <Link
              href="/"
              className="inline-block w-full px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Back
            </Link>
          </div>
        )}

        {gameMode === 'create' && (
          <div className="space-y-4 bg-slate-800 p-6 rounded-lg border border-slate-700">
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 text-white border border-slate-600 rounded-lg focus:border-blue-400 focus:outline-none"
            />
            <button
              onClick={handleCreateRoom}
              disabled={!playerName.trim() || status === 'connecting'}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold rounded-lg transition-colors"
            >
              {status === 'connecting' ? 'Creating...' : 'Create Room'}
            </button>
            <button
              onClick={() => setGameMode('choose')}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {gameMode === 'join' && (
          <div className="space-y-4 bg-slate-800 p-6 rounded-lg border border-slate-700">
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 text-white border border-slate-600 rounded-lg focus:border-blue-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full px-4 py-2 bg-slate-900 text-white border border-slate-600 rounded-lg focus:border-purple-400 focus:outline-none font-mono tracking-widest text-center"
            />
            <button
              onClick={handleJoinRoom}
              disabled={!playerName.trim() || !roomCode.trim() || status === 'connecting'}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white font-bold rounded-lg transition-colors"
            >
              {status === 'connecting' ? 'Joining...' : 'Join Room'}
            </button>
            <button
              onClick={() => setGameMode('choose')}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
