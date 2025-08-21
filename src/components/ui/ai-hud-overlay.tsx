import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { Brain, Eye, Zap, Target, Radar } from "lucide-react";

interface AIHudOverlayProps {
  isActive: boolean;
  stage?: 'detecting' | 'analyzing' | 'processing' | 'complete';
  quality?: {
    brightness?: number;
    sharpness?: number;
    contrast?: number;
  };
  faceData?: {
    confidence?: number;
    landmarks?: number;
    emotions?: string[];
  };
  className?: string;
}

export function AIHudOverlay({
  isActive,
  stage = 'detecting',
  quality,
  faceData,
  className
}: AIHudOverlayProps) {
  const [scanProgress, setScanProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);

  const analysisSteps = [
    { label: "Face Detection", icon: Target, duration: 1000 },
    { label: "Feature Mapping", icon: Radar, duration: 1500 },
    { label: "Quality Analysis", icon: Eye, duration: 1200 },
    { label: "Neural Processing", icon: Brain, duration: 2000 },
    { label: "Authentication", icon: Zap, duration: 800 }
  ];

  useEffect(() => {
    if (!isActive) {
      setScanProgress(0);
      setAnalysisStep(0);
      return;
    }

    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Step through analysis phases
    let stepTimeout: NodeJS.Timeout;
    const nextStep = (index: number) => {
      if (index < analysisSteps.length) {
        setAnalysisStep(index);
        stepTimeout = setTimeout(() => nextStep(index + 1), analysisSteps[index].duration);
      }
    };
    nextStep(0);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [isActive]);

  if (!isActive) return null;

  const currentStep = analysisSteps[analysisStep];
  const CurrentIcon = currentStep?.icon || Brain;

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Sci-fi Frame Border */}
      <div className="absolute inset-4 border-2 border-primary/30 rounded-lg">
        <div className="absolute -top-1 -left-1 w-6 h-6 border-l-2 border-t-2 border-primary" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-r-2 border-t-2 border-primary" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-2 border-b-2 border-primary" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-2 border-b-2 border-primary" />
      </div>

      {/* Top HUD Panel */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
        {/* Left Panel - Analysis Status */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-primary/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <CurrentIcon className="w-6 h-6 text-primary animate-neural-pulse" />
              <div className="absolute inset-0 w-6 h-6 border-2 border-primary rounded-full animate-ping opacity-30" />
            </div>
            <div>
              <div className="text-sm font-medium text-primary-foreground">
                {currentStep?.label || "Initializing"}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                AI ANALYSIS ACTIVE
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-mono">{Math.round(scanProgress)}%</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300 animate-pulse"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Quality Metrics */}
        {quality && (
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-primary/50 min-w-[200px]">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              IMAGE QUALITY
            </div>
            
            <div className="space-y-3">
              {[
                { label: 'Brightness', value: quality.brightness || 0, color: 'hsl(60, 100%, 50%)', icon: '☀️' },
                { label: 'Sharpness', value: quality.sharpness || 0, color: 'hsl(180, 100%, 50%)', icon: '🎯' },
                { label: 'Contrast', value: quality.contrast || 0, color: 'hsl(300, 100%, 50%)', icon: '⚡' }
              ].map((metric, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-primary-foreground flex items-center gap-1">
                      <span className="text-xs">{metric.icon}</span>
                      {metric.label}
                    </span>
                    <span className="text-xs font-mono text-primary">
                      {Math.round(metric.value * 100)}
                    </span>
                  </div>
                  <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${metric.value * 100}%`,
                        background: `linear-gradient(90deg, ${metric.color}aa, ${metric.color})`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom HUD Panel */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-primary/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Neural Network Active
                </span>
              </div>
              
              {faceData && (
                <div className="flex items-center gap-4 text-xs">
                  {faceData.confidence && (
                    <span className="text-primary">
                      Confidence: {Math.round(faceData.confidence * 100)}%
                    </span>
                  )}
                  {faceData.landmarks && (
                    <span className="text-primary">
                      Landmarks: {faceData.landmarks}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Analysis Steps Indicator */}
            <div className="flex items-center gap-2">
              {analysisSteps.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i === analysisStep;
                const isComplete = i < analysisStep;
                
                return (
                  <div
                    key={i}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      {
                        "border-primary bg-primary/20": isActive,
                        "border-primary-glow bg-primary-glow/30": isComplete,
                        "border-muted": !isActive && !isComplete
                      }
                    )}
                  >
                    <StepIcon className={cn("w-3 h-3", {
                      "text-primary animate-pulse": isActive,
                      "text-primary-glow": isComplete,
                      "text-muted": !isActive && !isComplete
                    })} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Central Scanning Reticle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-32 h-32">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-radar" />
          
          {/* Inner pulsing ring */}
          <div className="absolute inset-4 border border-primary/50 rounded-full animate-pulse" />
          
          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-0.5 bg-primary" />
            <div className="w-0.5 h-4 bg-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          
          {/* Corner brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary" />
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary" />
        </div>
      </div>
    </div>
  );
}