/**
 * Game configuration constants
 */

import { GameConfig } from '@/lib/types';

export const GAME_CONFIG: GameConfig = {
  // Ball physics
  initialBallSpeed: 165, // pixels per second (increased from 150)
  ballAcceleration: 1.05, // multiply by this each volley (gentler curve)
  ballSize: 15,
  ballZoomMultiplier: 3.5, // speed multiplier when moving to wall after successful word
  maxVerticalVelocity: 250, // cap vertical velocity to prevent excessive bouncing
  
  // Timing
  ballTravelTime: 3000, // milliseconds for ball to reach opposite wall (more generous)
  timeBuffer: 500, // extra ms before automatic loss
  
  // Canvas dimensions
  canvasWidth: 1200,
  canvasHeight: 600,
  wallThickness: 20,
  
  // Player zones
  p1StartX: 40, // pixel from left where P1 wall is
  p2StartX: 1200 - 40, // pixel from left where P2 wall is
  centerY: 300, // middle height of canvas
  
  // Physics
  gravity: 0, // no gravity - 2D side view
  bounceDamping: 1, // perfect bounce (1 = no energy loss)
};

// Difficulty thresholds - more generous progression
export const getDifficultyByLevel = (level: number) => {
  if (level <= 3) return 'easy';
  if (level <= 7) return 'medium';
  if (level <= 12) return 'hard';
  return 'expert';
};

// Speed scaling
export const getSpeedMultiplier = (level: number): number => {
  return Math.pow(GAME_CONFIG.ballAcceleration, level - 1);
};

// Ball travel time (decreases more gradually)
export const getBallTravelTime = (level: number): number => {
  const reduction = Math.max(0.65, 1 - (level - 1) * 0.01);
  return GAME_CONFIG.ballTravelTime * reduction;
};
