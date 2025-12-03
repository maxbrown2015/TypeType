/**
 * Game state management and initialization
 */

import { GameState, PlayerScore, PlayerSide } from '@/lib/types';
import {
  GAME_CONFIG,
  getDifficultyByLevel,
  getSpeedMultiplier,
} from '@/constants/gameConfig';
import { getRandomWord } from '@/constants/words';
import { initializeBall } from '@/lib/gameEngine';

/**
 * Create an empty player score
 */
export const createEmptyScore = (): PlayerScore => ({
  volleys: 0,
  correctWords: 0,
  totalWords: 0,
  accuracy: 100,
  averageResponseTime: 0,
  totalKeystrokes: 0,
  errantKeystrokes: 0,
});

/**
 * Initialize a new game
 */
export const initializeGame = (): GameState => {
  const startingPlayer: PlayerSide = Math.random() > 0.5 ? 1 : 2;
  const difficulty = getDifficultyByLevel(1);
  
  return {
    // Game flow
    level: 1,
    currentPlayer: startingPlayer,
    gameStatus: 'playing',
    
    // Ball - move toward current player
    ball: initializeBall(1, startingPlayer),
    ballMovingToWall: false,
    
    // Words
    targetWord: getRandomWord(difficulty),
    playerInput: '',
    wordStartedAt: Date.now(),
    
    // Scoring
    player1Score: createEmptyScore(),
    player2Score: createEmptyScore(),
    
    // Timing
    ballTravelTime: GAME_CONFIG.ballTravelTime,
    gameStartedAt: Date.now(),
  };
};

/**
 * Mark ball as moving to wall after successful word
 * Ball will continue moving to current player's wall and bounce
 * Also increases ball velocity for faster zoom effect
 */
export const markBallMovingToWall = (state: GameState): GameState => {
  return {
    ...state,
    ballMovingToWall: true,
    ball: {
      ...state.ball,
      velocity: {
        vx: state.ball.velocity.vx * GAME_CONFIG.ballZoomMultiplier,
        vy: state.ball.velocity.vy * GAME_CONFIG.ballZoomMultiplier,
      },
    },
  };
};

/**
 * Reset game state for next round but keep ball position and direction
 * Used when player successfully types a word
 * Also resets ball velocity from zoom back to normal game speed
 */
export const prepareNextRound = (
  currentState: GameState,
  nextPlayer: PlayerSide
): GameState => {
  const difficulty = getDifficultyByLevel(currentState.level);
  
  // Calculate normal velocity for this level
  const speedMultiplier = getSpeedMultiplier(currentState.level);
  const normalSpeed = GAME_CONFIG.initialBallSpeed * speedMultiplier;
  
  // Get the direction the ball was traveling (before we reverse it)
  // Since ball is zoomed, divide by zoom multiplier to get original direction
  const zoomedVx = currentState.ball.velocity.vx;
  const baseDirection = Math.sign(zoomedVx); // positive means going right (toward P2), negative means going left (toward P1)
  const reversedDirection = -baseDirection; // reverse for bounce
  
  // Generate new bounce angle for next round
  const angle = (Math.random() - 0.5) * 40 * (Math.PI / 180); // -20 to +20 degrees
  const verticalComponent = Math.tan(angle) * normalSpeed;
  let newVy = Math.max(-GAME_CONFIG.maxVerticalVelocity, Math.min(GAME_CONFIG.maxVerticalVelocity, verticalComponent));
  
  return {
    ...currentState,
    currentPlayer: nextPlayer,
    gameStatus: 'playing',
    ballMovingToWall: false,
    // Bounce ball and reset velocity to normal game speed with new angle
    ball: {
      ...currentState.ball,
      velocity: {
        vx: reversedDirection * normalSpeed,
        vy: newVy, // reset with new random bounce angle
      },
    },
    targetWord: getRandomWord(difficulty),
    playerInput: '',
    wordStartedAt: Date.now(),
  };
};

/**
 * Reset game state but keep level and scores
 */
export const resetRound = (
  currentState: GameState,
  nextPlayer: PlayerSide
): GameState => {
  const difficulty = getDifficultyByLevel(currentState.level);
  
  return {
    ...currentState,
    currentPlayer: nextPlayer,
    gameStatus: 'playing',
    ball: initializeBall(currentState.level, nextPlayer),
    targetWord: getRandomWord(difficulty),
    playerInput: '',
    wordStartedAt: Date.now(),
  };
};

/**
 * Update player score after a successful volley
 */
export const recordSuccessfulVolley = (
  state: GameState,
  player: PlayerSide,
  timeTaken: number,
  keystrokes: { total: number; errant: number }
): GameState => {
  const playerScore =
    player === 1 ? { ...state.player1Score } : { ...state.player2Score };
  
  playerScore.volleys += 1;
  playerScore.correctWords += 1;
  playerScore.totalWords += 1;
  playerScore.totalKeystrokes += keystrokes.total;
  playerScore.errantKeystrokes += keystrokes.errant;
  playerScore.averageResponseTime = Math.round(
    (playerScore.averageResponseTime * (playerScore.correctWords - 1) +
      timeTaken) /
      playerScore.correctWords
  );
  playerScore.accuracy =
    playerScore.totalKeystrokes === 0
      ? 100
      : Math.max(
          0,
          Math.round(
            ((playerScore.totalKeystrokes - playerScore.errantKeystrokes) /
              playerScore.totalKeystrokes) *
              100
          )
        );
  
  return {
    ...state,
    ...(player === 1
      ? { player1Score: playerScore }
      : { player2Score: playerScore }),
  };
};

/**
 * Record a missed word (player lost)
 */
export const recordFailedWord = (
  state: GameState,
  player: PlayerSide,
  keystrokes: { total: number; errant: number }
): GameState => {
  const playerScore =
    player === 1 ? { ...state.player1Score } : { ...state.player2Score };
  
  playerScore.totalWords += 1;
  playerScore.totalKeystrokes += keystrokes.total;
  playerScore.errantKeystrokes += keystrokes.errant;
  playerScore.accuracy =
    playerScore.totalKeystrokes === 0
      ? 100
      : Math.max(
          0,
          Math.round(
            ((playerScore.totalKeystrokes - playerScore.errantKeystrokes) /
              playerScore.totalKeystrokes) *
              100
          )
        );
  
  return {
    ...state,
    losingPlayer: player,
    ...(player === 1
      ? { player1Score: playerScore }
      : { player2Score: playerScore }),
  };
};

/**
 * Advance to next level
 */
export const advanceLevel = (state: GameState): GameState => {
  const nextLevel = state.level + 1;
  
  return {
    ...state,
    level: nextLevel,
  };
};

/**
 * Get the other player
 */
export const getOtherPlayer = (player: PlayerSide): PlayerSide => {
  return player === 1 ? 2 : 1;
};
