'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '@/lib/types';
import { GAME_CONFIG } from '@/constants/gameConfig';

interface GameCanvasProps {
  gameState: GameState | null;
  timeRemaining: number;
}

interface TrailParticle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  timeRemaining,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailParticle[]>([]);
  const lastBallPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update trail
    const ball = gameState.ball;
    const dx = ball.position.x - lastBallPosRef.current.x;
    const dy = ball.position.y - lastBallPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 2) {
      trailRef.current.push({
        x: lastBallPosRef.current.x,
        y: lastBallPosRef.current.y,
        age: 0,
        maxAge: 8,
      });
    }

    lastBallPosRef.current = { x: ball.position.x, y: ball.position.y };

    // Age trail particles
    trailRef.current = trailRef.current
      .map((p) => ({ ...p, age: p.age + 1 }))
      .filter((p) => p.age < p.maxAge);

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line (dashed)
    ctx.strokeStyle = '#475569';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw side walls with gradient
    const wallGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    wallGradient.addColorStop(0, '#64748b');
    wallGradient.addColorStop(0.5, '#475569');
    wallGradient.addColorStop(1, '#64748b');

    ctx.fillStyle = wallGradient;
    // Left wall (P1)
    ctx.fillRect(
      GAME_CONFIG.p1StartX - GAME_CONFIG.wallThickness / 2,
      0,
      GAME_CONFIG.wallThickness,
      canvas.height
    );
    // Right wall (P2)
    ctx.fillRect(
      GAME_CONFIG.p2StartX - GAME_CONFIG.wallThickness / 2,
      0,
      GAME_CONFIG.wallThickness,
      canvas.height
    );

    // Draw top and bottom walls
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw ball trail
    trailRef.current.forEach((particle) => {
      const opacity = 1 - particle.age / particle.maxAge;
      const size = ball.size * (1 - particle.age / particle.maxAge * 0.5);
      ctx.fillStyle = `rgba(59, 130, 246, ${opacity * 0.4})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw ball glow effect
    const gradient = ctx.createRadialGradient(
      ball.position.x,
      ball.position.y,
      0,
      ball.position.x,
      ball.position.y,
      ball.size * 3
    );
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(
      ball.position.x - ball.size * 3,
      ball.position.y - ball.size * 3,
      ball.size * 6,
      ball.size * 6
    );

    // Draw ball with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Draw ball
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, ball.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw ball highlight
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(
      ball.position.x - ball.size / 3,
      ball.position.y - ball.size / 3,
      ball.size / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw player zones with dynamic highlighting
    const zoneHeight = 120;
    const zoneY = canvas.height / 2 - zoneHeight / 2;

    // P1 zone (left)
    ctx.fillStyle =
      gameState.currentPlayer === 1
        ? 'rgba(34, 197, 94, 0.2)'
        : 'rgba(100, 116, 139, 0.1)';
    ctx.fillRect(
      0,
      zoneY,
      GAME_CONFIG.p1StartX + GAME_CONFIG.wallThickness / 2,
      zoneHeight
    );
    ctx.strokeStyle =
      gameState.currentPlayer === 1 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      0,
      zoneY,
      GAME_CONFIG.p1StartX + GAME_CONFIG.wallThickness / 2,
      zoneHeight
    );

    // P2 zone (right)
    ctx.fillStyle =
      gameState.currentPlayer === 2
        ? 'rgba(34, 197, 94, 0.2)'
        : 'rgba(100, 116, 139, 0.1)';
    ctx.fillRect(
      GAME_CONFIG.p2StartX - GAME_CONFIG.wallThickness / 2,
      zoneY,
      canvas.width - (GAME_CONFIG.p2StartX - GAME_CONFIG.wallThickness / 2),
      zoneHeight
    );
    ctx.strokeStyle =
      gameState.currentPlayer === 2 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      GAME_CONFIG.p2StartX - GAME_CONFIG.wallThickness / 2,
      zoneY,
      canvas.width - (GAME_CONFIG.p2StartX - GAME_CONFIG.wallThickness / 2),
      zoneHeight
    );

    // Draw player labels
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';

    ctx.fillText(
      'Player 1',
      GAME_CONFIG.p1StartX / 2,
      zoneY - 20
    );
    ctx.fillText(
      'Player 2',
      GAME_CONFIG.p2StartX + (canvas.width - GAME_CONFIG.p2StartX) / 2,
      zoneY - 20
    );

    // Draw time remaining bar
    if (gameState.gameStatus === 'playing') {
      const barWidth = 240;
      const barHeight = 12;
      const barX = canvas.width / 2 - barWidth / 2;
      const barY = 20;
      const barRadius = 6;

      // Background with rounded corners
      ctx.fillStyle = '#1e293b';
      roundRect(ctx, barX, barY, barWidth, barHeight, barRadius);
      ctx.fill();

      // Fill based on time remaining
      const fillWidth = (timeRemaining / gameState.ballTravelTime) * barWidth;
      const fillColor =
        timeRemaining > gameState.ballTravelTime * 0.66
          ? '#22c55e'
          : timeRemaining > gameState.ballTravelTime * 0.33
            ? '#eab308'
            : '#ef4444';
      ctx.fillStyle = fillColor;
      roundRect(ctx, barX, barY, fillWidth, barHeight, barRadius);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      roundRect(ctx, barX, barY, barWidth, barHeight, barRadius);
      ctx.stroke();
    }
  }, [gameState, timeRemaining]);

  // Helper function to draw rounded rectangles
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONFIG.canvasWidth}
      height={GAME_CONFIG.canvasHeight}
      className="border-2 border-slate-600 rounded-lg bg-slate-900 w-full"
      style={{ maxWidth: '100%', height: 'auto', aspectRatio: `${GAME_CONFIG.canvasWidth}/${GAME_CONFIG.canvasHeight}` }}
    />
  );
};
