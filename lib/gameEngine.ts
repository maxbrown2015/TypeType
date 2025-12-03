/**
 * Core game engine: Ball physics, collision detection, and game updates
 */

import {
  Ball,
  GameState,
  PlayerSide,
  Vector2D,
  Velocity,
} from '@/lib/types';
import {
  GAME_CONFIG,
  getSpeedMultiplier,
  getBallTravelTime,
} from '@/constants/gameConfig';

/**
 * Initialize ball at the starting position
 * Moves toward the specified player at increasing speed based on level
 * Ball bounces up and down as it travels
 */
export const initializeBall = (
  level: number,
  targetPlayer: PlayerSide
): Ball => {
  const speedMultiplier = getSpeedMultiplier(level);
  const baseSpeed = GAME_CONFIG.initialBallSpeed * speedMultiplier;
  
  // Random angle for vertical bounce (between -20 and 20 degrees from horizontal for shallow bounces)
  const angle = (Math.random() - 0.5) * 40 * (Math.PI / 180); // convert to radians
  const vx = targetPlayer === 2 ? baseSpeed : -baseSpeed;
  const horizontalSpeed = Math.abs(vx);
  let verticalSpeed = Math.tan(angle) * horizontalSpeed;
  
  // Cap vertical velocity to prevent excessive bouncing
  verticalSpeed = Math.max(-GAME_CONFIG.maxVerticalVelocity, Math.min(GAME_CONFIG.maxVerticalVelocity, verticalSpeed));
  
  // Ball starts at center
  const ball: Ball = {
    position: {
      x: GAME_CONFIG.canvasWidth / 2,
      y: GAME_CONFIG.centerY,
    },
    velocity: {
      vx: targetPlayer === 2 ? horizontalSpeed : -horizontalSpeed,
      vy: verticalSpeed,
    },
    size: GAME_CONFIG.ballSize,
    speed: baseSpeed,
  };
  
  return ball;
};

/**
 * Update ball position based on velocity and time delta
 * Returns new position
 */
export const updateBallPosition = (
  ball: Ball,
  deltaTime: number // seconds since last update
): Vector2D => {
  const newPosition: Vector2D = {
    x: ball.position.x + ball.velocity.vx * deltaTime,
    y: ball.position.y + ball.velocity.vy * deltaTime,
  };
  
  // Apply gravity (if any)
  if (GAME_CONFIG.gravity !== 0) {
    newPosition.y += 0.5 * GAME_CONFIG.gravity * deltaTime * deltaTime;
  }
  
  // Bounce off top and bottom walls
  const minY = ball.size / 2;
  const maxY = GAME_CONFIG.canvasHeight - ball.size / 2;
  
  if (newPosition.y < minY) {
    newPosition.y = minY;
    ball.velocity.vy *= -GAME_CONFIG.bounceDamping;
  } else if (newPosition.y > maxY) {
    newPosition.y = maxY;
    ball.velocity.vy *= -GAME_CONFIG.bounceDamping;
  }
  
  return newPosition;
};

/**
 * Check if ball has hit either side wall
 * Returns which player loses (null if no collision)
 */
export const checkWallCollision = (ball: Ball): PlayerSide | null => {
  const leftWall = GAME_CONFIG.p1StartX + GAME_CONFIG.wallThickness / 2;
  const rightWall = GAME_CONFIG.p2StartX - GAME_CONFIG.wallThickness / 2;
  
  // Ball hits left wall (P1 loses)
  if (ball.position.x - ball.size / 2 <= leftWall) {
    return 1;
  }
  
  // Ball hits right wall (P2 loses)
  if (ball.position.x + ball.size / 2 >= rightWall) {
    return 2;
  }
  
  return null;
};

/**
 * Calculate the time remaining before ball hits the wall
 */
export const getTimeUntilWallHit = (
  ball: Ball,
  player: PlayerSide
): number => {
  if (player === 1) {
    // Ball moving left toward P1
    const leftWall = GAME_CONFIG.p1StartX + GAME_CONFIG.wallThickness / 2;
    const distanceToWall = ball.position.x - leftWall;
    if (ball.velocity.vx >= 0) return Infinity; // moving away
    return Math.max(0, distanceToWall / Math.abs(ball.velocity.vx));
  } else {
    // Ball moving right toward P2
    const rightWall = GAME_CONFIG.p2StartX - GAME_CONFIG.wallThickness / 2;
    const distanceToWall = rightWall - ball.position.x;
    if (ball.velocity.vx <= 0) return Infinity; // moving away
    return Math.max(0, distanceToWall / ball.velocity.vx);
  }
};

/**
 * Bounce ball off a wall (switch direction and optionally increase speed)
 */
export const bounceBall = (ball: Ball, newLevel: number): Ball => {
  const speedMultiplier = getSpeedMultiplier(newLevel);
  const baseSpeed = GAME_CONFIG.initialBallSpeed * speedMultiplier;
  
  return {
    ...ball,
    velocity: {
      ...ball.velocity,
      vx: -ball.velocity.vx * GAME_CONFIG.bounceDamping,
    },
    speed: baseSpeed,
  };
};

/**
 * Check if player input matches target word (case-insensitive)
 */
export const validateWord = (input: string, target: string): boolean => {
  return input.trim().toLowerCase() === target.trim().toLowerCase();
};

/**
 * Calculate accuracy percentage
 */
export const calculateAccuracy = (
  correctWords: number,
  totalWords: number
): number => {
  if (totalWords === 0) return 100;
  return Math.round((correctWords / totalWords) * 100);
};

/**
 * Calculate average response time
 */
export const calculateAverageResponseTime = (
  totalTime: number,
  wordCount: number
): number => {
  if (wordCount === 0) return 0;
  return Math.round(totalTime / wordCount);
};

/**
 * Get the ball's current distance traveled
 * Useful for animation and progress tracking
 */
export const calculateBallProgress = (
  ball: Ball,
  startX: number,
  endX: number
): number => {
  const traveled = Math.abs(ball.position.x - startX);
  const totalDistance = Math.abs(endX - startX);
  return Math.min(1, Math.max(0, traveled / totalDistance));
};

/**
 * Compute keystroke stats for a typed word vs target
 * Errant keystrokes are characters that don't match their position
 * plus any extra characters beyond the target length.
 */
export const calculateKeystrokeStats = (input: string, target: string) => {
  const total = input.length;
  let errant = 0;
  
  const len = Math.min(input.length, target.length);
  for (let i = 0; i < len; i++) {
    if (input[i] !== target[i]) {
      errant += 1;
    }
  }
  
  if (input.length > target.length) {
    errant += input.length - target.length;
  }
  
  return { totalKeystrokes: total, errantKeystrokes: errant };
};
