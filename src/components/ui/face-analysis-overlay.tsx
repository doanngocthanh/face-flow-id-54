import React, { useEffect, useRef, useState } from 'react';
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
  stage?: 'detecting' | 'analyzing' | 'processing' | 'complete';
  showMesh?: boolean;
  showHUD?: boolean;
}

export function FaceAnalysisOverlay({
  isAnalyzing,
  imageDimensions,
  className,
  quality,
  stage = 'detecting',
  showMesh = true,
  showHUD = true
}: FaceAnalysisOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meshCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const meshRafRef = useRef<number>();
  const [analysisLabels] = useState([
    { text: "Phân tích khuôn mặt", delay: 0 },
    { text: "Nhận diện đặc điểm", delay: 800 },
    { text: "Kiểm tra chất lượng", delay: 1600 },
    { text: "Đánh giá ánh sáng", delay: 2400 },
    { text: "Xác thực danh tính", delay: 3200 }
  ]);

  // Enhanced neural network points for face mapping
  const facePoints = useRef<Point[]>([
    { x: 0.3, y: 0.25 },   // Left eye
    { x: 0.7, y: 0.25 },   // Right eye
    { x: 0.5, y: 0.35 },   // Nose tip
    { x: 0.45, y: 0.55 },  // Left mouth
    { x: 0.55, y: 0.55 },  // Right mouth
    { x: 0.25, y: 0.3 },   // Left cheek
    { x: 0.75, y: 0.3 },   // Right cheek
    { x: 0.5, y: 0.15 },   // Forehead center
    { x: 0.35, y: 0.45 },  // Left jaw
    { x: 0.65, y: 0.45 },  // Right jaw
    { x: 0.5, y: 0.7 },    // Chin
    { x: 0.4, y: 0.2 },    // Left eyebrow
    { x: 0.6, y: 0.2 },    // Right eyebrow
    { x: 0.5, y: 0.3 },    // Nose bridge
    { x: 0.35, y: 0.55 },  // Left mouth corner
    { x: 0.65, y: 0.55 },  // Right mouth corner
  ]);

  // 3D Mesh points for face mesh overlay
  const meshPoints = useRef<Point[][]>([
    // Horizontal lines
    Array.from({ length: 8 }, (_, i) => ({ x: 0.2 + (i * 0.08), y: 0.2 })),
    Array.from({ length: 8 }, (_, i) => ({ x: 0.2 + (i * 0.08), y: 0.3 })),
    Array.from({ length: 8 }, (_, i) => ({ x: 0.2 + (i * 0.08), y: 0.4 })),
    Array.from({ length: 8 }, (_, i) => ({ x: 0.2 + (i * 0.08), y: 0.5 })),
    Array.from({ length: 8 }, (_, i) => ({ x: 0.2 + (i * 0.08), y: 0.6 })),
    Array.from({ length: 8 }, (_, i) => ({ x: 0.2 + (i * 0.08), y: 0.7 })),
    // Vertical lines
    Array.from({ length: 6 }, (_, i) => ({ x: 0.3, y: 0.2 + (i * 0.1) })),
    Array.from({ length: 6 }, (_, i) => ({ x: 0.4, y: 0.2 + (i * 0.1) })),
    Array.from({ length: 6 }, (_, i) => ({ x: 0.5, y: 0.2 + (i * 0.1) })),
    Array.from({ length: 6 }, (_, i) => ({ x: 0.6, y: 0.2 + (i * 0.1) })),
    Array.from({ length: 6 }, (_, i) => ({ x: 0.7, y: 0.2 + (i * 0.1) })),
  ]);

  // Neural Network Animation
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

      // Enhanced Neural Network with pulse waves
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      const [h, s, l] = primaryColor.split(' ').map(v => parseFloat(v.replace('%', '')));
      
      facePoints.current.forEach((point, i) => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        
        // Pulsing nodes with wave effect
        const waveRadius = 15 + Math.sin(time * 2 + i * 0.5) * 8;
        const nodeRadius = 3 + Math.sin(time * 3 + i) * 1.5;
        
        // Outer pulse ring
        ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${0.3 + Math.sin(time * 2 + i) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner node
        ctx.fillStyle = `hsla(${h}, ${s}%, ${l + 20}%, 0.9)`;
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Neural connections with data flow effect
        facePoints.current.forEach((otherPoint, j) => {
          if (i === j) return;
          const distance = Math.hypot(otherPoint.x - point.x, otherPoint.y - point.y);
          if (distance < 0.25) {
            const opacity = (1 - distance / 0.25) * 0.6;
            const flowOffset = (time * 50 + i * 10) % 20;
            
            ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.lineDashOffset = -flowOffset;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(otherPoint.x * canvas.width, otherPoint.y * canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      });

      // Advanced Radar Sweep with depth layers
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const angle = (time * 1.5) % (Math.PI * 2);
      
      // Multi-layer radar sweep
      for (let layer = 0; layer < 3; layer++) {
        const layerAngle = angle + (layer * Math.PI * 2 / 3);
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width * 0.8);
        gradient.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${0.4 - layer * 0.1})`);
        gradient.addColorStop(0.7, `hsla(${h}, ${s}%, ${l}%, ${0.1 - layer * 0.03})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, canvas.width * 0.8, layerAngle - 0.15, layerAngle + 0.15);
        ctx.closePath();
        ctx.fill();
      }

      time += 0.016;
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isAnalyzing, imageDimensions]);

  // 3D Face Mesh Animation
  useEffect(() => {
    if (!isAnalyzing || !showMesh) return;

    const canvas = meshCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let meshTime = 0;
    const animateMesh = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (imageDimensions) {
        canvas.width = imageDimensions.width;
        canvas.height = imageDimensions.height;
      }

      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      const [h, s, l] = primaryColor.split(' ').map(v => parseFloat(v.replace('%', '')));

      // Draw 3D mesh with depth and perspective
      ctx.strokeStyle = `hsla(${h}, ${s}%, ${l + 10}%, 0.4)`;
      ctx.lineWidth = 1;

      // Horizontal mesh lines with wave distortion
      meshPoints.current.slice(0, 6).forEach((line, lineIndex) => {
        ctx.beginPath();
        line.forEach((point, pointIndex) => {
          const x = point.x * canvas.width;
          const waveOffset = Math.sin(meshTime + pointIndex * 0.5 + lineIndex * 0.3) * 3;
          const y = (point.y * canvas.height) + waveOffset;
          
          if (pointIndex === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      });

      // Vertical mesh lines with pulse effect
      meshPoints.current.slice(6).forEach((line, lineIndex) => {
        const pulseIntensity = 0.7 + Math.sin(meshTime * 2 + lineIndex * 0.8) * 0.3;
        ctx.strokeStyle = `hsla(${h}, ${s}%, ${l + 10}%, ${0.4 * pulseIntensity})`;
        
        ctx.beginPath();
        line.forEach((point, pointIndex) => {
          const x = point.x * canvas.width;
          const y = point.y * canvas.height;
          
          if (pointIndex === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      });

      // Face landmark highlights
      const landmarks = [
        { x: 0.3, y: 0.25, label: 'L.Eye' },
        { x: 0.7, y: 0.25, label: 'R.Eye' },
        { x: 0.5, y: 0.35, label: 'Nose' },
        { x: 0.5, y: 0.55, label: 'Mouth' }
      ];

      landmarks.forEach((landmark, i) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        const glowRadius = 8 + Math.sin(meshTime * 3 + i) * 2;
        
        // Glowing landmark indicator
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        gradient.addColorStop(0, `hsla(${h}, ${s}%, ${l + 30}%, 0.8)`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      meshTime += 0.02;
      meshRafRef.current = requestAnimationFrame(animateMesh);
    };

    animateMesh();

    return () => {
      if (meshRafRef.current) {
        cancelAnimationFrame(meshRafRef.current);
      }
    };
  }, [isAnalyzing, showMesh, imageDimensions]);

  // Analysis Labels Component
  const AnalysisLabels = () => {
    if (!isAnalyzing) return null;

    return (
      <div className="absolute top-4 left-4 space-y-2">
        {analysisLabels.map((label, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center space-x-2 text-sm font-medium",
              "bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1",
              "border border-primary/30",
              "animate-fade-in opacity-0"
            )}
            style={{
              animationDelay: `${label.delay}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary-foreground">{label.text}</span>
          </div>
        ))}
      </div>
    );
  };

  // HUD Metrics Component
  const HUDMetrics = () => {
    if (!showHUD || !quality) return null;

    const metrics = [
      { label: 'Brightness', value: quality.brightness || 0, icon: '☀️' },
      { label: 'Sharpness', value: quality.sharpness || 0, icon: '🔍' },
      { label: 'Contrast', value: quality.contrast || 0, icon: '⚡' }
    ];

    return (
      <div className="absolute top-4 right-4 space-y-3">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className={cn(
              "bg-black/30 backdrop-blur-sm rounded-lg p-3 min-w-[160px]",
              "border border-primary/40",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${i * 200}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-primary-foreground flex items-center gap-1">
                <span>{metric.icon}</span>
                {metric.label}
              </span>
              <span className="text-xs text-primary font-mono">
                {Math.round(metric.value * 100)}%
              </span>
            </div>
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
                style={{ width: `${metric.value * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Neural Network Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: isAnalyzing ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
      />
      
      {/* 3D Mesh Layer */}
      {showMesh && (
        <canvas
          ref={meshCanvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: isAnalyzing ? 0.7 : 0, transition: 'opacity 0.5s ease-in-out' }}
        />
      )}

      {/* Depth Scan Effect */}
      {isAnalyzing && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-depth-scan" />
        </div>
      )}

      {/* Analysis Labels */}
      <AnalysisLabels />

      {/* HUD Metrics */}
      <HUDMetrics />

      {/* Corner Frame Indicators */}
      {isAnalyzing && (
        <>
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary animate-pulse" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary animate-pulse" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary animate-pulse" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary animate-pulse" />
        </>
      )}
    </div>
  );
}
