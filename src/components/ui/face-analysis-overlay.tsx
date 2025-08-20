import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface FaceAnalysisOverlayProps {
  isAnalyzing: boolean;
  imageDimensions?: { width: number; height: number };
  className?: string;
  quality?: {
    brightness?: number;
    sharpness?: number;
    contrast?: number;
  };
}

export function FaceAnalysisOverlay({
  isAnalyzing,
  imageDimensions,
  className,
  quality
}: FaceAnalysisOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  // Neural network points
  const points = useRef<Point[]>([
    { x: 0.3, y: 0.2 },   // Left eye
    { x: 0.7, y: 0.2 },   // Right eye
    { x: 0.5, y: 0.35 },  // Nose
    { x: 0.5, y: 0.6 },   // Mouth
    { x: 0.2, y: 0.3 },   // Left cheek
    { x: 0.8, y: 0.3 },   // Right cheek
    { x: 0.5, y: 0.1 },   // Forehead
    { x: 0.3, y: 0.5 },   // Left jaw
    { x: 0.7, y: 0.5 },   // Right jaw
    { x: 0.5, y: 0.7 },   // Chin
  ]);

  // Animation
  useEffect(() => {
    if (!isAnalyzing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const animate = () => {
      if (!canvas || !ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update canvas size if needed
      if (imageDimensions) {
        canvas.width = imageDimensions.width;
        canvas.height = imageDimensions.height;
      }

      // Draw neural network
      ctx.strokeStyle = 'rgba(64, 179, 255, 0.5)';
      ctx.fillStyle = 'rgba(64, 179, 255, 0.8)';
      
      points.current.forEach((point, i) => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        
        // Draw node
        ctx.beginPath();
        const radius = 4 + Math.sin(time + i) * 2;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connections
        points.current.forEach((otherPoint, j) => {
          if (i === j) return;
          const distance = Math.hypot(
            otherPoint.x - point.x,
            otherPoint.y - point.y
          );
          if (distance < 0.3) {
            const opacity = (1 - distance / 0.3) * 0.5;
            ctx.strokeStyle = `rgba(64, 179, 255, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
              otherPoint.x * canvas.width,
              otherPoint.y * canvas.height
            );
            ctx.stroke();
          }
        });
      });

      // Draw radar sweep
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const angle = time % (Math.PI * 2);
      
      const gradient = ctx.createLinearGradient(
        centerX,
        centerY,
        centerX + Math.cos(angle) * canvas.width,
        centerY + Math.sin(angle) * canvas.width
      );
      gradient.addColorStop(0, 'rgba(64, 179, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(64, 179, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, canvas.width, angle - 0.2, angle + 0.2);
      ctx.closePath();
      ctx.fill();

      // Draw HUD elements
      if (quality) {
        drawHUDElement(ctx, 'Brightness', quality.brightness || 0, 20);
        drawHUDElement(ctx, 'Sharpness', quality.sharpness || 0, 60);
        drawHUDElement(ctx, 'Contrast', quality.contrast || 0, 100);
      }

      time += 0.02;
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isAnalyzing, imageDimensions, quality]);

  const drawHUDElement = (
    ctx: CanvasRenderingContext2D,
    label: string,
    value: number,
    yOffset: number
  ) => {
    const x = 20;
    const y = yOffset;
    
    ctx.fillStyle = 'rgba(64, 179, 255, 0.8)';
    ctx.font = '12px monospace';
    ctx.fillText(`${label}: ${Math.round(value * 100)}%`, x, y);
    
    // Progress bar
    ctx.fillStyle = 'rgba(64, 179, 255, 0.2)';
    ctx.fillRect(x + 100, y - 8, 100, 4);
    ctx.fillStyle = 'rgba(64, 179, 255, 0.8)';
    ctx.fillRect(x + 100, y - 8, value * 100, 4);
  };

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ opacity: isAnalyzing ? 1 : 0, transition: 'opacity 0.3s' }}
      />
    </div>
  );
}
