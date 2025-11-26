'use client';

import React from 'react';
import Link from 'next/link';

interface WaitingRoomProps {
  room: {
    roomId: string;
    playerName: string;
    playerSide: number;
    otherPlayerName?: string;
  };
  isHost: boolean;
  onStartGame: () => void;
  isReadyToStart: boolean;
}

export default function WaitingRoom({
  room,
  isHost,
  onStartGame,
  isReadyToStart,
}: WaitingRoomProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-lg bg-slate-800 p-8 rounded-lg border border-slate-700">
        <h1 className="text-4xl font-bold text-white mb-2">Waiting Room</h1>
        <p className="text-slate-400 mb-8">Room Code: <span className="font-mono text-lg text-blue-400">{room.roomId}</span></p>

        <div className="bg-slate-900 p-6 rounded-lg mb-6 border border-slate-600">
          <div className="mb-6">
            <p className="text-sm text-slate-400 mb-2">You</p>
            <p className="text-white font-semibold text-lg">{room.playerName}</p>
            <p className="text-slate-400 text-sm">Player {room.playerSide}</p>
          </div>

          {room.otherPlayerName ? (
            <>
              <div className="border-t border-slate-600 my-4" />
              <div>
                <p className="text-sm text-slate-400 mb-2">Opponent</p>
                <p className="text-white font-semibold text-lg">{room.otherPlayerName}</p>
                <p className="text-slate-400 text-sm">Player {room.playerSide === 1 ? 2 : 1}</p>
              </div>
            </>
          ) : (
            <>
              <div className="border-t border-slate-600 my-4" />
              <div>
                <p className="text-sm text-slate-400 mb-2">Opponent</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <p className="text-yellow-500 font-semibold">Waiting for player...</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          {isHost ? (
            <>
              <button
                onClick={onStartGame}
                disabled={!isReadyToStart}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
              >
                {isReadyToStart ? 'Start Game' : 'Waiting for opponent...'}
              </button>
              <p className="text-sm text-slate-400">
                {isReadyToStart ? 'Both players are ready!' : 'Waiting for opponent to join...'}
              </p>
            </>
          ) : (
            <>
              <p className="text-green-500 font-semibold">✓ Connected to room</p>
              <p className="text-sm text-slate-400">Waiting for host to start...</p>
            </>
          )}

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
