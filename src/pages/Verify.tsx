import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CameraUpload } from "@/components/ui/camera-upload";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

const Verify = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [faceImage, setFaceImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    confidence?: number;
    user?: any;
  } | null>(null);
  
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

    try {
      // First check image quality
      const base64Image = faceImage.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const qualityResponse = await fetch('http://vue.io.vn/api/auth/verify-quality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image
        }),
      });

      if (!qualityResponse.ok) {
        throw new Error('Ảnh không đạt chất lượng yêu cầu');
      }

      // Then authenticate
      const authResponse = await fetch('http://vue.io.vn/api/auth/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image
        }),
      });

      const result = await authResponse.json();

      if (authResponse.ok && result.success) {
        setVerificationResult({
          success: true,
          confidence: result.confidence,
          user: result.user
        });

        // Success animation
        gsap.to(cardRef.current, {
          scale: 1.02,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });

        // Animate result appearance
        gsap.fromTo(resultRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)", delay: 0.2 }
        );

        toast({
          title: "Xác thực thành công!",
          description: `Chào mừng trở lại, ${result.user?.name || 'người dùng'}!`,
        });
      } else {
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

        // Animate result appearance
        gsap.fromTo(resultRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)", delay: 0.2 }
        );

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-background/50">
      <Card ref={cardRef} className="w-full max-w-md gradient-card shadow-card border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại
            </Button>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16"></div>
          </div>
          <div ref={titleRef}>
            <CardTitle className="text-2xl font-bold text-foreground">Xác thực khuôn mặt</CardTitle>
            <CardDescription className="text-muted-foreground">
              Chụp ảnh để xác thực danh tính
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!verificationResult && (
            <div ref={formRef}>
              <div className="space-y-4">
                <CameraUpload
                  onImageCapture={setFaceImage}
                  disabled={isLoading}
                />

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
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                verificationResult.success 
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
                <h3 className={`text-xl font-semibold ${
                  verificationResult.success ? 'text-success' : 'text-destructive'
                }`}>
                  {verificationResult.success ? 'Xác thực thành công!' : 'Xác thực thất bại'}
                </h3>
                
                {verificationResult.success && verificationResult.user && (
                  <div className="space-y-1">
                    <p className="text-foreground font-medium">
                      Chào mừng, {verificationResult.user.name}!
                    </p>
                    {verificationResult.confidence && (
                      <p className="text-sm text-muted-foreground">
                        Độ tin cậy: {(verificationResult.confidence * 100).toFixed(1)}%
                      </p>
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
              onClick={() => navigate('/')}
              className="text-primary hover:text-primary/80 text-sm"
            >
              Chưa có tài khoản? Đăng ký →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;