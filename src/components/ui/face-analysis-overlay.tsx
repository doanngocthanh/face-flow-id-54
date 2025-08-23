import React, { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";

interface FaceAnalysisOverlayProps {
  isAnalyzing: boolean;
  imageDimensions?: { width: number; height: number };
  className?: string;
  stage?: 'detecting' | 'analyzing' | 'processing' | 'complete';
}

export function FaceAnalysisOverlay({
  isAnalyzing,
  imageDimensions,
  className,
  stage = 'detecting'
}: FaceAnalysisOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const [currentLabel, setCurrentLabel] = useState(0);
  
  const analysisLabels = [
    "Phân tích khuôn mặt",
    "Nhận diện đặc điểm", 
    "Kiểm tra chất lượng"
  ];

  // Simple radar sweep animation
  useEffect(() => {
    if (!isAnalyzing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const animate = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (imageDimensions) {
        canvas.width = imageDimensions.width;
        canvas.height = imageDimensions.height;
      }

      // Simple radar sweep
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const angle = (time * 2) % (Math.PI * 2);
      
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width * 0.6);
      gradient.addColorStop(0, 'hsla(var(--primary), 0.3)');
      gradient.addColorStop(0.8, 'hsla(var(--primary), 0.1)');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, canvas.width * 0.6, angle - 0.2, angle + 0.2);
      ctx.closePath();
      ctx.fill();

      time += 0.02;
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isAnalyzing, imageDimensions]);

  // Cycle through analysis labels
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentLabel(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentLabel(prev => (prev + 1) % analysisLabels.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isAnalyzing]);


  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Simple radar sweep */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: isAnalyzing ? 0.6 : 0, transition: 'opacity 0.3s ease-in-out' }}
      />

      {/* Scanning line */}
      {isAnalyzing && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-depth-scan" />
        </div>
      )}

      {/* Simple analysis status */}
      {isAnalyzing && (
        <div className="absolute top-6 left-6">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-primary/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-primary-foreground font-medium">
                {analysisLabels[currentLabel]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Corner indicators */}
      {isAnalyzing && (
        <>
          <div className="absolute top-6 left-6 w-6 h-6 border-l-2 border-t-2 border-primary/50" />
          <div className="absolute top-6 right-6 w-6 h-6 border-r-2 border-t-2 border-primary/50" />
          <div className="absolute bottom-6 left-6 w-6 h-6 border-l-2 border-b-2 border-primary/50" />
          <div className="absolute bottom-6 right-6 w-6 h-6 border-r-2 border-b-2 border-primary/50" />
        </>
      )}
    </div>
  );
}
