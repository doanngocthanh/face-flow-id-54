import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  X, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RotateCcw,
  User
} from "lucide-react";

const CameraCapture = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { userName } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userName) {
      navigate('/register');
      return;
    }
    
    startCamera();
    
    // Entrance animation
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }
    );

    return () => {
      stopCamera();
    };
  }, [userName, navigate]);

  useEffect(() => {
    // Start face detection when camera is ready
    if (videoRef.current && !cameraError) {
      const interval = setInterval(detectFace, 500);
      return () => clearInterval(interval);
    }
  }, [cameraError]);

  const startCamera = async () => {
    try {
      console.log("Starting full-screen camera...");
      setIsLoading(true);
      setCameraError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera không được hỗ trợ trên trình duyệt này");
      }

      // Check available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error("Không tìm thấy camera. Vui lòng kiểm tra kết nối camera của bạn.");
      }

      console.log("Available video devices:", videoDevices.map(d => d.label || 'Unnamed Camera'));
      
      // Try different constraints if the first attempt fails
      const constraints = [
        // First try: Full HD
        {
          video: { 
            facingMode: "user",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          }
        },
        // Second try: HD
        {
          video: { 
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }
        },
        // Last try: Any camera
        { 
          video: {
            facingMode: "user"
          }
        }
      ];
      
      let stream = null;
      let lastError = null;
      
      for (const constraint of constraints) {
        try {
          console.log("Trying camera with constraints:", constraint);
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          if (stream) {
            console.log("Successfully started camera with constraints:", constraint);
            break;
          }
        } catch (e) {
          lastError = e;
          console.log("Failed with constraints:", constraint, e);
          continue;
        }
      }
      
      if (!stream) {
        throw lastError || new Error("Không thể khởi động camera với bất kỳ cấu hình nào");
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsLoading(false);
          console.log("Camera started successfully");
        };
      }
    } catch (error) {
      console.error("Camera error:", error);
      setIsLoading(false);
      
      let errorMessage = "Không thể truy cập camera";
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Vui lòng cho phép truy cập camera để tiếp tục";
        } else if (error.name === "NotFoundError") {
          errorMessage = "Không tìm thấy camera. Vui lòng kiểm tra kết nối và khởi động lại camera của bạn";
        } else if (error.name === "NotSupportedError") {
          errorMessage = "Trình duyệt không hỗ trợ camera. Vui lòng thử với Chrome hoặc Edge";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng đang sử dụng camera";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      setCameraError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const detectFace = () => {
    if (!videoRef.current || isProcessing) return;
    
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Simplified face detection - check if video is showing content
    // In a real app, you'd use a face detection library like face-api.js
    const hasVideoData = video.currentTime > 0 && !video.paused && !video.ended;
    
    if (hasVideoData) {
      setFaceDetected(true);
      
      // Auto capture after detecting face for 2 seconds
      if (faceDetected && captureCount < 3) {
        setTimeout(() => {
          if (faceDetected && !isProcessing) {
            capturePhoto();
          }
        }, 2000);
      }
    } else {
      setFaceDetected(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Cannot get canvas context");
      
      // Flip image horizontally (mirror effect)
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0);
      ctx.scale(-1, 1);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Flash effect
      gsap.to(overlayRef.current, {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        duration: 0.1,
        yoyo: true,
        repeat: 1
      });

      setCaptureCount(prev => prev + 1);
      
      // Register user
      await registerUser(imageData);
      
    } catch (error) {
      console.error("Capture error:", error);
      toast({
        title: "Lỗi chụp ảnh",
        description: "Không thể chụp ảnh. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const registerUser = async (imageData: string) => {
    try {
      const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      
      console.log('Registering user:', userName);
      console.log('API URL:', 'http://vue.io.vn/api/register/');
      
      // First validate the data
      const validateResponse = await fetch('http://vue.io.vn/api/register/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          image: base64Image
        }),
      });

      const validateResult = await validateResponse.json();
      console.log('Validation result:', validateResult);

      if (!validateResult.valid) {
        throw new Error(validateResult.errors ? validateResult.errors.join(', ') : 'Dữ liệu không hợp lệ');
      }

      const requestBody = {
        name: userName,
        image: base64Image,
        user_id: generateUUID()
      };
      
      console.log('Request body keys:', Object.keys(requestBody));
      
      const response = await fetch('http://vue.io.vn/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok && responseData.success) {
        // Success animation
        gsap.to(statusRef.current, {
          scale: 1.2,
          duration: 0.3,
          yoyo: true,
          repeat: 1
        });

        toast({
          title: "Đăng ký thành công!",
          description: `Chào mừng ${userName}! Bạn đã được đăng ký thành công.`,
        });

        // Navigate after success
        setTimeout(() => {
          navigate('/verify');
        }, 2000);
        
      } else {
        throw new Error(responseData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = "Không thể đăng ký. Vui lòng thử lại.";
      if (error instanceof Error) {
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Đăng ký thất bại",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Allow retry
      setCaptureCount(0);
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setCameraError(null);
    setCaptureCount(0);
    setFaceDetected(false);
    startCamera();
  };

  const handleBack = () => {
    stopCamera();
    navigate('/register');
  };

  if (cameraError) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Lỗi Camera</h2>
            <p className="text-muted-foreground">{cameraError}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <Button onClick={handleRetry} className="flex-1 gradient-primary">
              <RotateCcw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover transform -scale-x-100"
        autoPlay
        playsInline
        muted
      />
      
      {/* Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/20 flex items-center justify-center"
      >
        {/* Loading */}
        {isLoading && (
          <div className="text-center text-white space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin" />
            <p className="text-lg">Đang khởi động camera...</p>
          </div>
        )}
        
        {/* Face detection overlay */}
        {!isLoading && (
          <>
            {/* Face frame */}
            <div className="relative">
              <div className={`w-64 h-80 border-4 rounded-3xl transition-colors duration-300 ${
                faceDetected ? 'border-success shadow-glow' : 'border-white/50'
              }`}>
                {/* Corner decorations */}
                <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-2xl"></div>
                <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-2xl"></div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-2xl"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-2xl"></div>
              </div>
              
              {/* Status indicator */}
              <div 
                ref={statusRef}
                className={`absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-white font-medium transition-colors duration-300 ${
                  faceDetected ? 'bg-success' : 'bg-white/20'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </div>
                ) : faceDetected ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Phát hiện khuôn mặt</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Đưa mặt vào khung</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Top info */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center text-white">
              <h1 className="text-2xl font-bold mb-2">Đăng ký khuôn mặt</h1>
              <p className="text-white/80">Chào {userName}! Hãy đưa mặt vào khung để đăng ký</p>
            </div>
            
            {/* Progress */}
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center text-white">
              <div className="flex space-x-2 mb-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      captureCount >= step ? 'bg-success' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-white/80">
                Ảnh {captureCount}/3 • Tự động chụp khi phát hiện mặt
              </p>
            </div>
            
            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleBack}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <X className="w-5 h-5 mr-2" />
                Hủy
              </Button>
              
              <Button
                size="lg"
                onClick={capturePhoto}
                disabled={!faceDetected || isProcessing}
                className="gradient-primary shadow-glow"
              >
                <Camera className="w-5 h-5 mr-2" />
                Chụp thủ công
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;