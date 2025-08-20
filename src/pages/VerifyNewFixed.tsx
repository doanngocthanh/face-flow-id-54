import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CameraUpload } from "@/components/ui/camera-upload";
import { AIProcessing } from "@/components/ui/ai-processing";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { gsap } from "gsap";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FaceAnalysisOverlay } from "@/components/ui/face-analysis-overlay";

interface VerificationResult {
  success: boolean;
  message?: string;
  confidence?: number;
  user_name?: string;
  face_detection?: {
    bbox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    detection_confidence?: number;
  };
  user?: {
    user_id?: string;
    user_name?: string;
    name?: string;
  };
  quality?: {
    brightness: number;
    sharpness: number;
    contrast: number;
  };
}

export default function VerifyNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [faceImage, setFaceImage] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [analysisStage, setAnalysisStage] = useState<"processing" | "analyzing" | "extracting" | "verifying">("processing");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Refs for animations
  const cardRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Animation effect on mount
  useEffect(() => {
    const tl = gsap.timeline();
    if (cardRef.current) {
      tl.fromTo(cardRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }, []);

  const handleImageCapture = async (imageData: string) => {
    if (!imageData) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chụp ảnh khuôn mặt để xác thực",
        variant: "destructive",
      });
      return;
    }

    setFaceImage(imageData);
    setIsProcessing(true);
    setAnalysisStage("analyzing");
    
    try {
      const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

      // Kiểm tra chất lượng ảnh
      console.log('Checking image quality...');
      const qualityResponse = await fetch('/api/auth/verify-quality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image
        }),
      });

      console.log('Quality check response status:', qualityResponse.status);
      const qualityResult = await qualityResponse.json();
      console.log('Quality check result:', qualityResult);

      if (!qualityResponse.ok || !qualityResult.is_good) {
        throw new Error(qualityResult.message || 'Ảnh không đạt chất lượng yêu cầu');
      }

      // Xác thực khuôn mặt
      setAnalysisStage("verifying");
      console.log('Authenticating...');
      const authResponse = await fetch('/api/auth/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image
        }),
      });

      console.log('Auth response status:', authResponse.status);
      const result = await authResponse.json();
      console.log('Auth result:', result);
      
      if (result.success) {
        const userName = result.user_name || result.user?.user_name || result.user?.name || "Người dùng";
        
        setVerificationResult({
          success: true,
          confidence: result.confidence,
          user: result.user,
          user_name: userName,
          face_detection: result.face_detection,
          quality: qualityResult.quality
        });

        // Lưu trạng thái xác thực
        localStorage.setItem('face_authenticated', 'true');
        if (result.user?.user_id) {
          localStorage.setItem('face_user_id', result.user.user_id);
        }

        // Animation khi thành công
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            scale: 1.02,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
          });
        }

        if (resultRef.current) {
          gsap.fromTo(resultRef.current,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)", delay: 0.2 }
          );
        }

        toast({
          title: "Xác thực thành công!",
          description: `Chào mừng trở lại, ${userName}!`,
        });
      } else {
        setVerificationResult({
          success: false,
          message: result.message || "Xác thực thất bại",
          quality: qualityResult.quality
        });

        toast({
          title: "Xác thực thất bại",
          description: result.message || "Không thể xác thực khuôn mặt",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({
        success: false,
        message: error instanceof Error ? error.message : "Xác thực thất bại. Vui lòng thử lại."
      });

      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra trong quá trình xác thực",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setAnalysisStage("processing");
    }
  };

  const handleRetry = () => {
    setFaceImage("");
    setVerificationResult(null);
    setAnalysisStage("processing");
    setIsProcessing(false);
  };

  const handleConfirmSuccess = () => {
    navigate("/profile");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-8" ref={cardRef}>
        {!verificationResult?.success && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">
              Xác thực khuôn mặt
            </h2>
            <p className="text-muted-foreground text-center">
              Vui lòng chụp ảnh khuôn mặt của bạn để xác thực
            </p>

            <div className="relative">
              <CameraUpload
                onImageCapture={handleImageCapture}
                disabled={isProcessing}
                facingMode="user"
              />
              {faceImage && (
                <FaceAnalysisOverlay
                  isAnalyzing={isProcessing}
                  imageDimensions={
                    verificationResult?.face_detection?.bbox ? {
                      width: verificationResult.face_detection.bbox.width,
                      height: verificationResult.face_detection.bbox.height
                    } : undefined
                  }
                  quality={verificationResult?.quality}
                />
              )}
            </div>
          </div>
        )}

        {isProcessing && (
          <Card className="p-6">
            <AIProcessing
              stage={analysisStage}
              quality={verificationResult?.quality}
            />
          </Card>
        )}

        {verificationResult && (
          <Card className="p-6 space-y-6" ref={resultRef}>
            <div className="text-center">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                verificationResult.success
                  ? 'bg-success/20'
                  : 'bg-destructive/20'
              }`}>
                {verificationResult.success ? (
                  <Check className="w-10 h-10 text-success" />
                ) : (
                  <X className="w-10 h-10 text-destructive" />
                )}
              </div>

              <div className="mt-6 space-y-2">
                <h3 className={`text-xl font-semibold ${
                  verificationResult.success ? 'text-success' : 'text-destructive'
                }`}>
                  {verificationResult.success ? 'Xác thực thành công!' : 'Xác thực thất bại'}
                </h3>
                {verificationResult.success && (
                  <p className="text-muted-foreground">
                    Xin chào,{' '}
                    {verificationResult.user_name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {verificationResult.message}
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={handleRetry}
              >
                Thử lại
              </Button>
              {verificationResult.success && (
                <Button onClick={() => setShowConfirmDialog(true)}>
                  Tiếp tục
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thông tin</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đã được xác thực thành công. Tiếp tục để truy cập vào hệ thống?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSuccess}>
              Tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
