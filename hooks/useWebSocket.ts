/**
 * Custom hook for WebSocket connection and multiplayer game sync
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '@/lib/types';

export interface GameRoom {
  roomId: string;
  playerId: string;
  playerSide: 1 | 2;
  playerName: string;
  otherPlayerName?: string;
  isConnected: boolean;
}

export const useWebSocket = (
  onGameStateUpdate: (state: GameState) => void,
  onGameStart: (initialState: GameState) => void,
  onPlayerJoined: (playerName: string) => void
) => {
  const socketRef = useRef<Socket | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('room_joined', (data: GameRoom) => {
      console.log('Joined room:', data);
      setRoom(data);
    });

    socket.on('player_joined', (data: { playerName: string }) => {
      onPlayerJoined(data.playerName);
      setRoom((prev) =>
        prev ? { ...prev, otherPlayerName: data.playerName } : null
      );
    });

    socket.on('game_start', (initialState: GameState) => {
      console.log('Game started');
      onGameStart(initialState);
    });

    socket.on('game_state_update', (state: GameState) => {
      onGameStateUpdate(state);
    });

    socket.on('error', (error: string) => {
      console.error('Socket error:', error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [onGameStateUpdate, onGameStart, onPlayerJoined]);

  // Join or create a room
  const joinRoom = useCallback((roomId: string, playerName: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('join_room', { roomId, playerName });
  }, []);

  // Create a new room
  const createRoom = useCallback((playerName: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('create_room', { playerName });
  }, []);

  // Submit word to server
  const submitWord = useCallback((word: string, timeTaken: number) => {
    if (!socketRef.current) return;
    socketRef.current.emit('word_submitted', { word, timeTaken });
  }, []);

  // Start game when both players are ready
  const startGame = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('start_game', {});
  }, []);

  return {
    room,
    isConnected,
    joinRoom,
    createRoom,
    submitWord,
    startGame,
    socket: socketRef.current,
  };
};
