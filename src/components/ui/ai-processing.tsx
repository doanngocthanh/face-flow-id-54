import React from "react"
import { Loader2, Brain, Scan, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIProcessingProps {
  stage?: "analyzing" | "extracting" | "verifying" | "processing"
  className?: string
  quality?: {
    brightness?: number;
    sharpness?: number;
    contrast?: number;
  }
  progress?: number
}

export function AIProcessing({ stage = "processing", className, progress }: AIProcessingProps) {
  const stages = {
    analyzing: {
      icon: Brain,
      text: "Đang phân tích khuôn mặt...",
      description: "AI đang nhận diện đặc điểm sinh trắc học",
      labels: ["Phân tích khuôn mặt", "Kiểm tra chất lượng", "Đánh giá ánh sáng"]
    },
    extracting: {
      icon: Scan,
      text: "Đang trích xuất thông tin...",
      description: "Quét và phân tích dữ liệu sinh trắc học",
      labels: ["Trích xuất đặc điểm", "Phân tích cấu trúc", "Xác định các điểm chính"]
    },
    verifying: {
      icon: Eye,
      text: "Đang xác minh dữ liệu...",
      description: "Kiểm tra và so sánh thông tin",
      labels: ["Xác thực danh tính", "Kiểm tra chống giả mạo", "Đối chiếu dữ liệu"]
    },
    processing: {
      icon: Loader2,
      text: "Đang xử lý...",
      description: "Vui lòng chờ trong giây lát",
      labels: ["Xử lý dữ liệu", "Chuẩn bị kết quả", "Hoàn tất quy trình"]
    }
  }

  const currentStage = stages[stage]
  const Icon = currentStage.icon

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-6 p-8",
      "gradient-card rounded-xl shadow-card border border-border/50",
      className
    )}>
      {/* AI Processing Animation */}
      <div className="relative">
        {/* Outer pulse ring */}
        <div className="absolute inset-0 animate-ping">
          <div className="w-20 h-20 rounded-full bg-primary/30" />
        </div>
        
        {/* Middle pulse ring */}
        <div className="absolute inset-2 animate-pulse-glow">
          <div className="w-16 h-16 rounded-full bg-primary/50" />
        </div>
        
        {/* Inner icon container */}
        <div className="relative w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <Icon className={cn(
            "w-8 h-8 text-primary",
            stage === "processing" && "animate-spin",
            stage === "analyzing" && "animate-neural-pulse",
            stage === "extracting" && "animate-pulse",
            stage === "verifying" && "animate-bounce"
          )} />
        </div>
      </div>

      {/* Processing Text */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold processing-text">
          {currentStage.text}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {currentStage.description}
        </p>
      </div>

      {/* Analysis Labels */}
      <div className="flex flex-col space-y-2 mt-4">
        {currentStage.labels.map((label, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center space-x-2 text-sm",
              "opacity-60 transition-opacity duration-300",
              {
                "opacity-100": true
              }
            )}
            style={{
              animationDelay: `${i * 0.5}s`
            }}
          >
            <div className="w-4 h-4 rounded-full bg-primary/20 animate-pulse"
                 style={{ animationDelay: `${i * 0.2}s` }} />
            <span className="text-primary">{label}</span>
          </div>
        ))}
      </div>
      
      {/* Progress Indicator */}
      {progress !== undefined && (
        <div className="w-full max-w-xs mt-4">
          <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 animate-pulse"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface ScanOverlayProps {
  children: React.ReactNode
  isScanning?: boolean
  className?: string
}

export function ScanOverlay({ children, isScanning = false, className }: ScanOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      
      {isScanning && (
        <>
          {/* Scanning overlay */}
          <div className="absolute inset-0 loading-overlay rounded-lg" />
          
          {/* Scanning line */}
          <div className="absolute inset-0 animate-ai-scan rounded-lg" />
          
          {/* Corner indicators */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-primary animate-pulse" />
          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-primary animate-pulse" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-primary animate-pulse" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-primary animate-pulse" />
        </>
      )}
    </div>
  )
}

interface RadarScanProps {
  className?: string
}

export function RadarScan({ className }: RadarScanProps) {
  return (
    <div className={cn("relative w-32 h-32", className)}>
      {/* Radar circles */}
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
      <div className="absolute inset-4 rounded-full border border-primary/30" />
      <div className="absolute inset-8 rounded-full border border-primary/40" />
      
      {/* Rotating radar line */}
      <div className="absolute inset-0 animate-radar">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent top-1/2 origin-center" />
      </div>
      
      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2" />
    </div>
  )
}