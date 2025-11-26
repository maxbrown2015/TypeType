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
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // Store callback refs to avoid recreating listeners
  const onGameStateUpdateRef = useRef(onGameStateUpdate);
  const onGameStartRef = useRef(onGameStart);
  const onPlayerJoinedRef = useRef(onPlayerJoined);

  // Update refs when callbacks change
  useEffect(() => {
    onGameStateUpdateRef.current = onGameStateUpdate;
    onGameStartRef.current = onGameStart;
    onPlayerJoinedRef.current = onPlayerJoined;
  }, [onGameStateUpdate, onGameStart, onPlayerJoined]);

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

    socket.on('player_joined', (data: { playerName: string; otherPlayerName?: string }) => {
      console.log('Player joined event:', data);
      onPlayerJoinedRef.current(data.playerName);
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          otherPlayerName: data.otherPlayerName || data.playerName,
        };
      });
    });

    socket.on('game_start', (initialState: GameState) => {
      console.log('Game started with state:', initialState);
      setGameState(initialState);
      onGameStartRef.current(initialState);
    });

    socket.on('game_state_update', (state: GameState) => {
      console.log('Game state update:', state);
      setGameState(state);
      onGameStateUpdateRef.current(state);
    });

    socket.on('opponent_input_update', (data: { playerSide: number; input: string }) => {
      console.log('Opponent input:', data);
    });

    socket.on('player_disconnected', (data: { playerSide: number }) => {
      console.log('Player disconnected:', data);
    });

    socket.on('error', (error: string) => {
      console.error('Socket error:', error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

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

  // Send live input to server (and sync locally)
  const updatePlayerInput = useCallback((input: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('player_input_update', { input });
    setGameState((prev) => (prev ? { ...prev, playerInput: input } : prev));
  }, []);

  // Start game when both players are ready
  const startGame = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('start_game', {});
  }, []);

  return {
    room,
    gameState,
    isConnected,
    joinRoom,
    createRoom,
    submitWord,
    startGame,
    updatePlayerInput,
    socket: socketRef.current,
  };
};
