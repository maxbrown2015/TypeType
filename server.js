/**
 * Simple Socket.IO server for Type Type multiplayer
 * Run this with: node server.js
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Game rooms storage
const rooms = new Map();
const players = new Map();

// Helper to get room
const getRoom = (roomId) => rooms.get(roomId);

// Helper to create or get room
const ensureRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      players: [],
      gameState: null,
      isGameStarted: false,
    });
  }
  return rooms.get(roomId);
};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Create a new room
  socket.on('create_room', (data) => {
    const roomId = uuidv4().substring(0, 6).toUpperCase();
    const playerSide = 1;

    const room = ensureRoom(roomId);
    room.players.push({
      socketId: socket.id,
      playerName: data.playerName,
      playerSide,
    });

    players.set(socket.id, {
      roomId,
      playerSide,
      playerName: data.playerName,
    });

    socket.join(roomId);
    socket.emit('room_joined', {
      roomId,
      playerId: socket.id,
      playerSide,
      playerName: data.playerName,
      isConnected: true,
    });

    console.log(`Room created: ${roomId}, Player 1: ${data.playerName}`);
  });

  // Join existing room
  socket.on('join_room', (data) => {
    const room = getRoom(data.roomId);

    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', 'Room is full');
      return;
    }

    const playerSide = room.players.length === 1 ? 2 : 1;
    room.players.push({
      socketId: socket.id,
      playerName: data.playerName,
      playerSide,
    });

    players.set(socket.id, {
      roomId: data.roomId,
      playerSide,
      playerName: data.playerName,
    });

    socket.join(data.roomId);

    socket.emit('room_joined', {
      roomId: data.roomId,
      playerId: socket.id,
      playerSide,
      playerName: data.playerName,
      isConnected: true,
    });

    // Notify other player
    const otherPlayer = room.players.find((p) => p.socketId !== socket.id);
    io.to(data.roomId).emit('player_joined', {
      playerName: data.playerName,
    });

    console.log(`Player 2 joined room: ${data.roomId}, Player 2: ${data.playerName}`);
  });

  // Start game
  socket.on('start_game', () => {
    const player = players.get(socket.id);
    if (!player) return;

    const room = getRoom(player.roomId);
    if (!room || room.players.length < 2) {
      socket.emit('error', 'Cannot start game: not enough players');
      return;
    }

    room.isGameStarted = true;
    io.to(player.roomId).emit('game_start', {
      level: 1,
      message: 'Game started!',
    });

    console.log(`Game started in room: ${player.roomId}`);
  });

  // Handle word submission
  socket.on('word_submitted', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const room = getRoom(player.roomId);
    if (!room) return;

    // Broadcast to room that a word was submitted
    io.to(player.roomId).emit('word_submitted_event', {
      playerSide: player.playerSide,
      word: data.word,
      timeTaken: data.timeTaken,
    });

    console.log(`Player ${player.playerSide} submitted: ${data.word}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      const room = getRoom(player.roomId);
      if (room) {
        room.players = room.players.filter((p) => p.socketId !== socket.id);
        io.to(player.roomId).emit('player_disconnected', {
          playerSide: player.playerSide,
        });
      }
      players.delete(socket.id);
    }
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
