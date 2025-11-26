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
const roomLoops = new Map();
const players = new Map();

// Game config (matching client config)
const INITIAL_TIME_LIMIT = 3000; // ms (matches client ballTravelTime)
const INITIAL_SPEED = 165; // px/s
const SPEED_MULTIPLIER = 1.05;
const BALL_SIZE = 15;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 600;
const WALL_THICKNESS = 20;
const P1_START_X = 40;
const P2_START_X = 1200 - 40;
const CENTER_Y = 300;
const BALL_ZOOM_MULTIPLIER = 3.5;
const MAX_VERTICAL_VELOCITY = 250;
const BALL_TRAVEL_TIME = 3000; // base ms, decreases by level
const GRAVITY = 0;
const BOUNCE_DAMPING = 1;
const WORD_LISTS = require('./constants/wordLists.json');
const TICK_RATE_MS = 50; // 20fps broadcast to keep network light

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

// Difficulty mapping (mirrors client)
const getDifficultyByLevel = (level) => {
  if (level <= 3) return 'easy';
  if (level <= 7) return 'medium';
  if (level <= 12) return 'hard';
  return 'expert';
};

// Helper to get random word for current level
const getRandomWord = (level = 1, usedWords = new Set()) => {
  const difficulty = getDifficultyByLevel(level);
  const list = WORD_LISTS[difficulty] || WORD_LISTS.easy;
  const filtered = list.filter((w) => !usedWords.has(w));
  const pool = filtered.length > 0 ? filtered : list;
  return pool[Math.floor(Math.random() * pool.length)];
};

const getSpeedMultiplier = (level) => Math.pow(SPEED_MULTIPLIER, level - 1);

const getBallTravelTime = (level) => {
  const reduction = Math.max(0.65, 1 - (level - 1) * 0.01);
  return BALL_TRAVEL_TIME * reduction;
};

// Initialize ball
const initializeBall = (level = 1, targetPlayer = 1) => {
  const baseSpeed = INITIAL_SPEED * getSpeedMultiplier(level);
  const angle = (Math.random() - 0.5) * (Math.PI / 9); // ±20 degrees
  const vx = targetPlayer === 2 ? baseSpeed : -baseSpeed;
  const vy = Math.tan(angle) * Math.abs(vx);
  const cappedVy = Math.max(-MAX_VERTICAL_VELOCITY, Math.min(MAX_VERTICAL_VELOCITY, vy));
  
  return {
    position: {
      x: CANVAS_WIDTH / 2,
      y: CENTER_Y,
    },
    velocity: {
      vx,
      vy: cappedVy,
    },
    size: BALL_SIZE,
    speed: baseSpeed,
  };
};

const updateBallPosition = (ball, deltaTime) => {
  const position = {
    x: ball.position.x + ball.velocity.vx * deltaTime,
    y: ball.position.y + ball.velocity.vy * deltaTime,
  };

  if (GRAVITY !== 0) {
    position.y += 0.5 * GRAVITY * deltaTime * deltaTime;
  }

  const minY = ball.size / 2;
  const maxY = CANVAS_HEIGHT - ball.size / 2;

  if (position.y < minY) {
    position.y = minY;
    ball.velocity.vy *= -BOUNCE_DAMPING;
  } else if (position.y > maxY) {
    position.y = maxY;
    ball.velocity.vy *= -BOUNCE_DAMPING;
  }

  return position;
};

const checkWallCollision = (ball) => {
  const leftWall = P1_START_X + WALL_THICKNESS / 2;
  const rightWall = P2_START_X - WALL_THICKNESS / 2;

  if (ball.position.x - ball.size / 2 <= leftWall) {
    return 1;
  }

  if (ball.position.x + ball.size / 2 >= rightWall) {
    return 2;
  }

  return null;
};

const bounceFromWall = (ball, level) => {
  const baseSpeed = INITIAL_SPEED * getSpeedMultiplier(level);
  const direction = ball.velocity.vx >= 0 ? -1 : 1; // reverse
  const angle = (Math.random() - 0.5) * (Math.PI / 9);
  const vx = direction * baseSpeed;
  const vy = Math.tan(angle) * Math.abs(vx);
  const cappedVy = Math.max(-MAX_VERTICAL_VELOCITY, Math.min(MAX_VERTICAL_VELOCITY, vy));

  return {
    ...ball,
    velocity: {
      vx,
      vy: cappedVy,
    },
    speed: Math.abs(vx),
  };
};

const stopRoomLoop = (roomId) => {
  if (roomLoops.has(roomId)) {
    clearInterval(roomLoops.get(roomId));
    roomLoops.delete(roomId);
  }
};

const startRoomLoop = (roomId) => {
  const room = getRoom(roomId);
  if (!room || !room.gameState) return;

  room.lastUpdate = Date.now();

  const loop = setInterval(() => {
    const currentRoom = getRoom(roomId);
    if (!currentRoom || !currentRoom.gameState) {
      stopRoomLoop(roomId);
      return;
    }

    const now = Date.now();
    const deltaTime = (now - currentRoom.lastUpdate) / 1000; // seconds
    currentRoom.lastUpdate = now;
    const state = currentRoom.gameState;
    if (state.gameStatus !== 'playing') {
      stopRoomLoop(roomId);
      return;
    }

    // Update ball position
    const newPosition = updateBallPosition(state.ball, deltaTime);
    state.ball.position = newPosition;

    const collision = checkWallCollision(state.ball);

    if (collision && state.ballMovingToWall) {
      // Successful volley, bounce to other player
      const nextPlayer = state.currentPlayer === 1 ? 2 : 1;
      state.currentPlayer = nextPlayer;
      state.ballMovingToWall = false;
      state.ball = bounceFromWall(state.ball, state.level);
      // Nudge ball away from wall to avoid immediate re-collision
      const leftWall = P1_START_X + WALL_THICKNESS / 2;
      const rightWall = P2_START_X - WALL_THICKNESS / 2;
      if (collision === 1) {
        state.ball.position.x = Math.max(state.ball.position.x, leftWall + state.ball.size + 2);
      } else {
        state.ball.position.x = Math.min(state.ball.position.x, rightWall - state.ball.size - 2);
      }
      state.targetWord = getRandomWord(state.level);
      state.playerInput = '';
      state.wordStartedAt = Date.now();
      state.ballTravelTime = getBallTravelTime(state.level);
    } else if (collision && !state.ballMovingToWall) {
      // Missed word -> loss
      state.gameStatus = 'lost';
      state.losingPlayer = state.currentPlayer;
      stopRoomLoop(roomId);
    }

    currentRoom.gameState = state;
    io.to(roomId).emit('game_state_update', {
      ...state,
      playerNames: {
        1: currentRoom.players.find((p) => p.playerSide === 1)?.playerName,
        2: currentRoom.players.find((p) => p.playerSide === 2)?.playerName,
      },
    });
  }, TICK_RATE_MS);

  roomLoops.set(roomId, loop);
};

// Initialize game state for a room
const initializeGameState = () => {
  const startingPlayer = Math.random() > 0.5 ? 1 : 2;

  return {
    level: 1,
    currentPlayer: startingPlayer,
    gameStatus: 'playing',
    targetWord: getRandomWord(1),
    playerInput: '',
    wordStartedAt: Date.now(),
    gameStartedAt: Date.now(),
    losingPlayer: null,
    ballTravelTime: getBallTravelTime(1),
    
    // Ball state
    ball: initializeBall(1, startingPlayer),
    ballMovingToWall: false,
    
    // Score tracking for both players
    player1Score: {
      volleys: 0,
      correctWords: 0,
      totalWords: 0,
      accuracy: 100,
      averageResponseTime: 0,
    },
    player2Score: {
      volleys: 0,
      correctWords: 0,
      totalWords: 0,
      accuracy: 100,
      averageResponseTime: 0,
    },
  };
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

    const otherPlayer = room.players.find((p) => p.socketId !== socket.id);
    const otherPlayerName = otherPlayer?.playerName;

    // Send confirmation to the joining player
    socket.emit('room_joined', {
      roomId: data.roomId,
      playerId: socket.id,
      playerSide,
      playerName: data.playerName,
      otherPlayerName: otherPlayerName,
      isConnected: true,
    });

    // Notify the other player that someone joined
    if (otherPlayer) {
      io.to(otherPlayer.socketId).emit('player_joined', {
        playerName: data.playerName,
      });
    }

    console.log(`Player ${playerSide} joined room: ${data.roomId}, Player ${playerSide}: ${data.playerName}`);
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
    stopRoomLoop(player.roomId);
    room.gameState = initializeGameState();
    
    const initialState = {
      ...room.gameState,
      playerNames: {
        1: room.players.find(p => p.playerSide === 1)?.playerName,
        2: room.players.find(p => p.playerSide === 2)?.playerName,
      },
    };

    io.to(player.roomId).emit('game_start', initialState);
    startRoomLoop(player.roomId);
    console.log(`Game started in room: ${player.roomId}`);
  });

  // Handle word submission
  socket.on('word_submitted', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const room = getRoom(player.roomId);
    if (!room || !room.gameState || room.gameState.gameStatus !== 'playing') return;

    const gameState = room.gameState;
    const isCorrect = data.word.toLowerCase() === gameState.targetWord.toLowerCase();
    const timeTaken = Date.now() - gameState.wordStartedAt;
    const playerScore = player.playerSide === 1 ? gameState.player1Score : gameState.player2Score;

    if (isCorrect) {
      // Update score
      playerScore.correctWords += 1;
      playerScore.totalWords += 1;
      playerScore.volleys += 1;
      
      // Update average response time
      const totalTime = playerScore.averageResponseTime * (playerScore.correctWords - 1) + timeTaken;
      playerScore.averageResponseTime = Math.round(totalTime / playerScore.correctWords);
      
      // Update accuracy
      playerScore.accuracy = Math.round((playerScore.correctWords / playerScore.totalWords) * 100);

      // Advance level every two volleys (both players combined)
      const totalVolleys = gameState.player1Score.volleys + gameState.player2Score.volleys;
      if (totalVolleys > 0 && totalVolleys % 2 === 0) {
        gameState.level += 1;
      }

      // Mark ball moving to wall and speed up for zoom effect
      gameState.ballMovingToWall = true;
      gameState.playerInput = data.word;
      gameState.wordStartedAt = Date.now();
      gameState.ball.velocity.vx *= BALL_ZOOM_MULTIPLIER;
      gameState.ball.velocity.vy *= BALL_ZOOM_MULTIPLIER;
      gameState.ball.speed = Math.sqrt(
        gameState.ball.velocity.vx * gameState.ball.velocity.vx +
        gameState.ball.velocity.vy * gameState.ball.velocity.vy
      );
    } else {
      // Update score even for incorrect
      playerScore.totalWords += 1;
      playerScore.accuracy = playerScore.totalWords > 0 
        ? Math.round((playerScore.correctWords / playerScore.totalWords) * 100)
        : 0;

      // Word is incorrect, current player loses
      gameState.gameStatus = 'lost';
      gameState.losingPlayer = player.playerSide;
      stopRoomLoop(player.roomId);
    }

    // Broadcast updated game state to room
    io.to(player.roomId).emit('game_state_update', {
      ...gameState,
      playerNames: {
        1: room.players.find(p => p.playerSide === 1)?.playerName,
        2: room.players.find(p => p.playerSide === 2)?.playerName,
      },
      submittedWord: data.word,
      isCorrect,
      timeTaken,
    });

    console.log(`Player ${player.playerSide} submitted "${data.word}" (correct: ${isCorrect})`);
  });

  // Handle player input update
  socket.on('player_input_update', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const room = getRoom(player.roomId);
    if (!room || !room.gameState) return;

    // Persist current player's input for authoritative state
    if (room.gameState.currentPlayer === player.playerSide) {
      room.gameState.playerInput = data.input;
    }

    // Broadcast input to other player so they can see what's being typed
    const otherPlayers = room.players.filter(p => p.socketId !== socket.id);
    otherPlayers.forEach(otherPlayer => {
      io.to(otherPlayer.socketId).emit('opponent_input_update', {
        playerSide: player.playerSide,
        input: data.input,
      });
    });
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
        if (room.players.length === 0) {
          stopRoomLoop(player.roomId);
          rooms.delete(player.roomId);
        }
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
