import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CameraUpload } from "@/components/ui/camera-upload";
import { useToast } from "@/hooks/use-toast";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { FaceAnalysisOverlay } from "@/components/ui/face-analysis-overlay";
import { AIHudOverlay } from "@/components/ui/ai-hud-overlay";
import { Shield, Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Verify = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [faceImage, setFaceImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    confidence?: number;
    user?: any;
    authenticated?: boolean;
    user_id?: string;
    user_name?: string;
    face_detection?: {
      bbox?: { x?: number; y?: number; width?: number; height?: number };
      detection_confidence?: number;
    };
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisStage, setAiAnalysisStage] = useState<'detecting' | 'analyzing' | 'processing' | 'complete'>('detecting');
  const [imageQuality, setImageQuality] = useState({
    brightness: 0.75,
    sharpness: 0.82,
    contrast: 0.68
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP entrance animations
    const tl = gsap.timeline();

    tl.fromTo(cardRef.current,
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
    )
      .fromTo(titleRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "-=0.3"
      )
      .fromTo(formRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.2"
      );
  }, []);

  const handleVerify = async () => {
    if (!faceImage) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chụp ảnh khuôn mặt để xác thực",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setVerificationResult(null);
    setIsAnalyzing(true);
    setAiAnalysisStage('analyzing');

    try {
      // First check image quality
      const base64Image = faceImage.replace(/^data:image\/[a-z]+;base64,/, '');

      console.log('Checking image quality...');
      console.log('API URL:', '/api/auth/verify-quality');

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

      // Simulate AI processing stages
      setAiAnalysisStage('processing');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Then authenticate
      console.log('Authenticating...');
      console.log('API URL:', '/api/auth/authenticate');

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
        // Lấy tên người dùng ưu tiên theo thứ tự: result.user_name, result.user.user_name, result.user.name
        const userName = result.user_name || result.user?.user_name || result.user?.name || "Người dùng";
        setVerificationResult({
          success: true,
          confidence: result.confidence,
          user: result.user,
          user_name: userName
        });
        // Lưu trạng thái xác thực và user_id vào localStorage
        localStorage.setItem('face_authenticated', 'true');
        if (result.user?.user_id) {
          localStorage.setItem('face_user_id', result.user.user_id);
        }

        // Success animation - only run if element exists
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            scale: 1.02,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
          });
        }

        // Animate result appearance - only run if element exists
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
          success: false
        });

        // Error shake animation - only run if element exists
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            x: -10,
            duration: 0.1,
            yoyo: true,
            repeat: 7,
            ease: "power2.inOut"
          });
        }

        // Animate result appearance - only run if element exists
        if (resultRef.current) {
          gsap.fromTo(resultRef.current,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)", delay: 0.2 }
          );
        }

        toast({
          title: "Xác thực thất bại",
          description: "Không thể nhận diện khuôn mặt. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Verification error:', error);

      setVerificationResult({
        success: false
      });

      // Error shake animation
      gsap.to(cardRef.current, {
        x: -10,
        duration: 0.1,
        yoyo: true,
        repeat: 7,
        ease: "power2.inOut"
      });

      toast({
        title: "Lỗi xác thực",
        description: "Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
      setAiAnalysisStage('complete');
    }
  };

  const resetVerification = () => {
    setFaceImage("");
    setVerificationResult(null);

    // Reset animations
    gsap.fromTo(formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  };

  const getCroppedFaceImage = () => {
    if (!faceImage || !verificationResult?.face_detection?.bbox) {
      return Promise.resolve(faceImage);
    }
    const img = new window.Image();
    img.src = faceImage;
    const { x, y, width, height } = verificationResult.face_detection.bbox;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return new Promise<string>((resolve) => {
      img.onload = () => {
        ctx?.drawImage(img, x, y, width, height, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(faceImage);
    });
  };

  const [croppedFace, setCroppedFace] = useState<string>("");
  useEffect(() => {
    if (verificationResult?.success && faceImage && verificationResult.face_detection?.bbox) {
      getCroppedFaceImage().then(setCroppedFace);
    } else {
      setCroppedFace(faceImage);
    }
  }, [verificationResult, faceImage]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-background/50 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      <Card ref={cardRef} className="w-full max-w-md gradient-card shadow-card border-border/50 relative">
        {!verificationResult?.success && (
          <CardHeader className="text-center space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground self-start"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Đăng ký</span>
              </Button>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div ref={titleRef}>
              <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Xác thực khuôn mặt
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Chụp ảnh để xác thực danh tính
              </CardDescription>
            </div>
          </CardHeader>
        )}

        <CardContent className="space-y-6">
          {!verificationResult && (
            <div ref={formRef} className="relative">
              <div className="space-y-4">
                <div className="relative">
                  <CameraUpload
                    onImageCapture={setFaceImage}
                    disabled={isLoading}
                    facingMode="user"
                  />
                  
                  {/* AI Analysis Overlay */}
                  {faceImage && isAnalyzing && (
                    <>
                      <FaceAnalysisOverlay
                        isAnalyzing={isAnalyzing}
                        imageDimensions={{ width: 400, height: 300 }}
                        stage={aiAnalysisStage}
                        className="absolute inset-0 rounded-lg"
                      />
                      <AIHudOverlay
                        isActive={isAnalyzing}
                        stage={aiAnalysisStage}
                        className="absolute inset-0"
                      />
                    </>
                  )}
                </div>

                {/* AI Status Display */}
                {isAnalyzing && (
                  <div className="text-center space-y-2">
                    <div className="text-sm text-primary font-medium">
                      {aiAnalysisStage === 'analyzing' && "🧠 Đang phân tích khuôn mặt..."}
                      {aiAnalysisStage === 'processing' && "⚡ Đang xử lý dữ liệu AI..."}
                      {aiAnalysisStage === 'complete' && "✅ Phân tích hoàn tất"}
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary transition-all duration-500"
                        style={{ 
                          width: aiAnalysisStage === 'analyzing' ? '33%' : 
                                 aiAnalysisStage === 'processing' ? '66%' : '100%' 
                        }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  disabled={isLoading || !faceImage}
                  className="w-full gradient-primary shadow-glow hover:shadow-lg transition-all duration-300 font-medium"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Xác thực khuôn mặt
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {verificationResult && (
            <div ref={resultRef} className="text-center space-y-4">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${verificationResult.success
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
                }`}>
                {verificationResult.success ? (
                  <CheckCircle className="w-10 h-10" />
                ) : (
                  <XCircle className="w-10 h-10" />
                )}
              </div>

              <div className="space-y-2">


                {verificationResult.success && (
                  <div className="flex flex-col items-center gap-2 mt-2">
                    <div className="flex flex-col items-center gap-1 mb-2">
                      <h3 className={`text-xl font-semibold ${verificationResult.success ? 'text-success' : 'text-destructive'
                        }`}>
                        {verificationResult.success ? 'Xác thực thành công!' : 'Xác thực thất bại'}
                      </h3>
                    </div>
                    <Avatar className="w-16 h-16 mb-2 border-2 border-primary/40 shadow-sm">
                      <AvatarImage src={croppedFace || faceImage} alt="Face" />
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                    <div className="font-semibold text-base text-foreground mb-1">
                      {verificationResult.user_name || verificationResult.user?.user_name || verificationResult.user?.name || 'Người dùng'}
                    </div>
                    {verificationResult.confidence !== undefined && (
                      <div className="text-xs text-muted-foreground mb-1">Độ tin cậy: {(verificationResult.confidence * 100).toFixed(1)}%</div>
                    )}
                  </div>
                )}

                {!verificationResult.success && (
                  <p className="text-muted-foreground">
                    Không thể nhận diện khuôn mặt của bạn
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetVerification}
                  className="flex-1"
                >
                  Thử lại
                </Button>
                {verificationResult.success && (
                  <Button
                    onClick={() => navigate('/')}
                    className="flex-1 gradient-primary"
                  >
                    Hoàn thành
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/register')}
              className="text-primary hover:text-primary/80 text-sm transition-colors"
            >
              Chưa có tài khoản? Đăng ký ngay →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;