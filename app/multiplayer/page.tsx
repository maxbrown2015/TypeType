'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function MultiplayerPage() {
  const [gameMode, setGameMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'waiting'>('idle');

  const handleGameStateUpdate = () => {};
  const handleGameStart = () => {};
  const handlePlayerJoined = () => {};

  const { room, isConnected, joinRoom, createRoom } = useWebSocket(
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
    createRoom(playerName);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      setStatus('idle');
      return;
    }
    setStatus('connecting');
    joinRoom(roomCode.toUpperCase(), playerName);
  };

  if (room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-lg bg-slate-800 p-8 rounded-lg border border-slate-700">
          <h1 className="text-4xl font-bold text-white mb-4">Room: {room.roomId}</h1>
          <p className="text-lg text-slate-300 mb-6">Waiting for opponent...</p>

          <div className="bg-slate-900 p-6 rounded-lg mb-6 border border-slate-600">
            <p className="text-sm text-slate-400 mb-2">Your Info:</p>
            <p className="text-white font-semibold mb-1">{room.playerName}</p>
            <p className="text-slate-400">Player {room.playerSide}</p>

            {room.otherPlayerName && (
              <>
                <hr className="my-4 border-slate-600" />
                <p className="text-sm text-slate-400 mb-2">Opponent:</p>
                <p className="text-white font-semibold">{room.otherPlayerName}</p>
              </>
            )}
          </div>

          <div className="space-y-3">
            <Link
              href="/game"
              className="inline-block w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              {room.otherPlayerName ? 'Start Game' : 'Go to Game'}
            </Link>
            <Link
              href="/"
              className="inline-block w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
            >
              Back to Menu
            </Link>
          </div>
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
