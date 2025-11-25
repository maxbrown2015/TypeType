/**
 * Custom hook for managing game state and game loop
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, PlayerSide } from '@/lib/types';
import {
  initializeGame,
  prepareNextRound,
  markBallMovingToWall,
  recordSuccessfulVolley,
  recordFailedWord,
  advanceLevel,
  getOtherPlayer,
} from '@/lib/gameState';
import {
  updateBallPosition,
  checkWallCollision,
  validateWord,
  bounceBall,
  getTimeUntilWallHit,
} from '@/lib/gameEngine';
import { GAME_CONFIG, getBallTravelTime } from '@/constants/gameConfig';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const roundStartRef = useRef<number>(0);

  // Initialize game
  const startGame = useCallback(() => {
    const newGame = initializeGame();
    setGameState(newGame);
    setTimeRemaining(getBallTravelTime(newGame.level));
    setElapsedTime(0);
    lastUpdateRef.current = Date.now();
    roundStartRef.current = Date.now();
  }, []);

  // Update player input
  const updateInput = useCallback((input: string) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        playerInput: input,
      };
    });
  }, []);

  // Submit word
  const submitWord = useCallback(() => {
    setGameState((prev) => {
      if (!prev || prev.gameStatus !== 'playing') return prev;

      const isCorrect = validateWord(prev.playerInput, prev.targetWord);

      if (!isCorrect) {
        // Word is incorrect - just keep the input and let player backspace and fix it
        // The input field will show red feedback
        return prev;
      }

      // Word is correct - mark ball to move to wall and bounce
      const timeTaken = Date.now() - prev.wordStartedAt;
      let nextState = recordSuccessfulVolley(prev, prev.currentPlayer, timeTaken);

      // Every 2 volleys, advance level
      if (nextState.player1Score.volleys + nextState.player2Score.volleys > 0) {
        const totalVolleys = nextState.player1Score.volleys + nextState.player2Score.volleys;
        if (totalVolleys % 2 === 0) {
          nextState = advanceLevel(nextState);
          // Update speed for new level
          nextState.ball.speed = nextState.ball.speed * 1.05;
        }
      }

      // Mark ball as moving to wall - it will continue on its path and bounce
      nextState = markBallMovingToWall(nextState);

      return nextState;
    });
  }, []);

  // Game loop - update ball position and check collisions
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'playing') {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // seconds
      lastUpdateRef.current = now;

      setGameState((prev) => {
        if (!prev || prev.gameStatus !== 'playing') return prev;

        // Update ball position
        const newPosition = updateBallPosition(prev.ball, deltaTime);
        const updatedBall = {
          ...prev.ball,
          position: newPosition,
        };

        // Check wall collision
        const losingPlayer = checkWallCollision(updatedBall);
        
        // If ball is moving to wall after successful word, bounce it
        if (prev.ballMovingToWall && losingPlayer) {
          // Ball has reached the wall safely - bounce it and prepare next round
          const nextPlayer = getOtherPlayer(prev.currentPlayer);
          let nextState = prepareNextRound(prev, nextPlayer);
          
          // Ensure ball position is safely away from wall to prevent re-collision
          // Calculate safe zone boundaries
          const leftWall = GAME_CONFIG.p1StartX + GAME_CONFIG.wallThickness / 2;
          const rightWall = GAME_CONFIG.p2StartX - GAME_CONFIG.wallThickness / 2;
          const safeMargin = GAME_CONFIG.ballSize + 5;
          
          let newX = updatedBall.position.x;
          if (losingPlayer === 1) {
            // Ball bounced off left wall, move it right
            newX = Math.max(updatedBall.position.x, leftWall + safeMargin);
          } else {
            // Ball bounced off right wall, move it left
            newX = Math.min(updatedBall.position.x, rightWall - safeMargin);
          }
          
          nextState.ball = {
            ...nextState.ball,
            position: {
              ...updatedBall.position,
              x: newX,
            },
          };
          nextState.ballTravelTime = getBallTravelTime(nextState.level);
          // Reset elapsed time for new round
          roundStartRef.current = now;
          setElapsedTime(0);
          return nextState;
        }
        
        // Normal wall collision (player loses because they didn't type in time)
        if (losingPlayer && !prev.ballMovingToWall) {
          return {
            ...recordFailedWord(prev, losingPlayer),
            ball: updatedBall,
            gameStatus: 'lost',
          };
        }

        // Update time remaining (only if not moving to wall)
        if (!prev.ballMovingToWall) {
          const newTimeRemaining = getTimeUntilWallHit(
            updatedBall,
            prev.currentPlayer
          );
          setTimeRemaining(Math.max(0, newTimeRemaining));
          // Update elapsed time for this turn
          const turnElapsed = (now - roundStartRef.current) / 1000; // in seconds
          setElapsedTime(Math.max(0, turnElapsed * 1000)); // convert back to ms
        } else {
          // While moving to wall, show time for next player
          setTimeRemaining(prev.ballTravelTime);
        }

        return {
          ...prev,
          ball: updatedBall,
        };
      });
    }, 1000 / 60); // 60 FPS

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState]);

  // Auto-lose if time runs out
  useEffect(() => {
    if (timeRemaining <= 0 && gameState?.gameStatus === 'playing') {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...recordFailedWord(prev, prev.currentPlayer),
          gameStatus: 'lost',
        };
      });
    }
  }, [timeRemaining, gameState?.gameStatus]);

  return {
    gameState,
    timeRemaining,
    elapsedTime,
    startGame,
    updateInput,
    submitWord,
  };
};
