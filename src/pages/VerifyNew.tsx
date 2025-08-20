import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CameraUpload } from "@/components/ui/camera-upload";
import { AIProcessing } from "@/components/ui/ai-processing";
import { Button } from "@/components/ui/button";
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
  success?: boolean;
  message?: string;
  user_name?: string;
  face_detection?: {
    bbox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
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

export default function Verify() {
  const navigate = useNavigate();
  const [faceImage, setFaceImage] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [analysisStage, setAnalysisStage] = useState<"processing" | "analyzing" | "extracting" | "verifying">("processing");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageCapture = async (imageData: string) => {
    setFaceImage(imageData);
    setAnalysisStage("analyzing");
    setAnalysisProgress(0);
    
    // Simulate quality analysis
    const mockQuality = {
      brightness: Math.random() * 0.4 + 0.6, // 60-100%
      sharpness: Math.random() * 0.3 + 0.7,  // 70-100%
      contrast: Math.random() * 0.2 + 0.8,   // 80-100%
    };
    
    // Simulated analysis stages
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAnalysisProgress(0.25);
    setAnalysisStage("extracting");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAnalysisProgress(0.5);
    setAnalysisStage("verifying");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAnalysisProgress(0.75);
    
    try {
      setIsProcessing(true);
      const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Make API call here
      // Replace with actual API call
      const mockResult: VerificationResult = {
        success: true,
        message: "Xác thực thành công",
        user_name: "Người dùng mẫu",
        face_detection: {
          bbox: { x: 100, y: 100, width: 200, height: 200 }
        },
        quality: mockQuality
      };

      setVerificationResult(mockResult);
      setAnalysisProgress(1);
      
      if (mockResult.success) {
        // Handle successful verification
        localStorage.setItem('face_authenticated', 'true');
        if (mockResult.user?.user_id) {
          localStorage.setItem('face_user_id', mockResult.user.user_id);
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({
        success: false,
        message: "Xác thực thất bại. Vui lòng thử lại.",
        quality: mockQuality
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setFaceImage("");
    setVerificationResult(null);
    setAnalysisStage("processing");
    setAnalysisProgress(0);
  };

  const handleConfirmSuccess = () => {
    navigate("/profile");
  };

  const getCroppedFaceImage = useCallback(() => {
    if (!faceImage || !verificationResult?.face_detection?.bbox) {
      return faceImage;
    }

    const { x, y, width, height } = verificationResult.face_detection.bbox;
    // Return cropped image implementation
    return faceImage;
  }, [verificationResult, faceImage]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-8">
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
                quality={verificationResult?.quality}
              />
              {faceImage && (
                <FaceAnalysisOverlay
                  isAnalyzing={true}
                  quality={verificationResult?.quality}
                  imageDimensions={{width: 640, height: 480}}
                />
              )}
            </div>
          </div>
        )}

        {!verificationResult && (
          <Card className="p-6">
            <AIProcessing
              stage={analysisStage}
              progress={analysisProgress}
              quality={verificationResult?.quality}
            />
          </Card>
        )}

        {verificationResult && (
          <Card className="p-6 space-y-6">
            <div className="text-center">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${verificationResult.success
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
                {verificationResult.success && (
                  <>
                    <h3 className={`text-xl font-semibold ${verificationResult.success ? 'text-success' : 'text-destructive'
                      }`}>
                      {verificationResult.success ? 'Xác thực thành công!' : 'Xác thực thất bại'}
                    </h3>
                    <p className="text-muted-foreground">
                      Xin chào,{' '}
                      {verificationResult.user_name || verificationResult.user?.user_name || verificationResult.user?.name || 'Người dùng'}
                    </p>
                  </>
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
