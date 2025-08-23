import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { Brain, Eye, Zap } from "lucide-react";

interface AIHudOverlayProps {
  isActive: boolean;
  stage?: 'detecting' | 'analyzing' | 'processing' | 'complete';
  className?: string;
}

export function AIHudOverlay({
  isActive,
  stage = 'detecting',
  className
}: AIHudOverlayProps) {
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps = [
    { label: "Nhận diện", icon: Eye },
    { label: "Phân tích", icon: Brain },
    { label: "Xác thực", icon: Zap }
  ];

  useEffect(() => {
    if (!isActive) {
      setScanProgress(0);
      setCurrentStep(0);
      return;
    }

    // Simple progress simulation
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    // Cycle through steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % analysisSteps.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isActive]);

  if (!isActive) return null;

  const step = analysisSteps[currentStep];
  const StepIcon = step?.icon || Brain;

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Simple status panel */}
      <div className="absolute top-6 right-6">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <StepIcon className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm text-primary-foreground font-medium">
              {step?.label || "Khởi tạo"}
            </span>
          </div>
          
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Tiến độ</span>
            <span className="text-primary">{Math.round(scanProgress)}%</span>
          </div>
          <div className="h-1 bg-black/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Simple center reticle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-16 h-16 border-2 border-primary/40 rounded-full animate-pulse">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
        </div>
      </div>
    </div>
  );
}