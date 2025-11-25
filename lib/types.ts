/**
 * Core TypeScript interfaces for Type Type game
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GameStatus = 'playing' | 'lost' | 'paused' | 'waiting';
export type PlayerSide = 1 | 2;

export interface Vector2D {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Ball {
  position: Vector2D;
  velocity: Velocity;
  size: number;
  speed: number;
}

export interface PlayerScore {
  volleys: number;
  correctWords: number;
  totalWords: number;
  accuracy: number; // percentage
  averageResponseTime: number; // milliseconds
}

export interface GameState {
  // Game flow
  level: number;
  currentPlayer: PlayerSide;
  gameStatus: GameStatus;
  losingPlayer?: PlayerSide; // which player lost (only set when gameStatus is 'lost')
  
  // Ball
  ball: Ball;
  ballMovingToWall: boolean; // true when ball is moving to current player's wall after successful word
  
  // Words
  targetWord: string;
  playerInput: string;
  wordStartedAt: number; // timestamp
  
  // Scoring
  player1Score: PlayerScore;
  player2Score: PlayerScore;
  
  // Timing
  ballTravelTime: number; // milliseconds
  gameStartedAt: number; // timestamp
}

export interface GameConfig {
  initialBallSpeed: number;
  ballAcceleration: number;
  ballSize: number;
  ballZoomMultiplier: number;
  maxVerticalVelocity: number;
  ballTravelTime: number;
  timeBuffer: number;
  canvasWidth: number;
  canvasHeight: number;
  wallThickness: number;
  p1StartX: number;
  p2StartX: number;
  centerY: number;
  gravity: number;
  bounceDamping: number;
}
