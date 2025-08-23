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
import { FaceAnalysisOverlay } from "@/components/ui/face-analysis-overlay";
import { AIHudOverlay } from "@/components/ui/ai-hud-overlay";

const CameraCapture = () => {
  const [fallbackMode, setFallbackMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { userName, userId } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraErrorDetail, setCameraErrorDetail] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [hasTriedCapture, setHasTriedCapture] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [aiAnalysisStage, setAiAnalysisStage] = useState<'detecting' | 'analyzing' | 'processing' | 'complete'>('detecting');
  const [imageQuality, setImageQuality] = useState({
    brightness: 0.75,
    sharpness: 0.82,
    contrast: 0.68
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Khai báo các hàm trước khi dùng trong useEffect
  const stopCamera = () => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped track: ${track.kind} - ${track.label}`);
      });
      setCurrentStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const detectFace = () => {
    if (!videoRef.current || isProcessing || !currentStream) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    
    // Enhanced face detection simulation
    const hasVideoData = video.currentTime > 0 && 
                         !video.paused && 
                         !video.ended && 
                         video.readyState >= 2;
    
    // Check if camera is actually capturing (not a black screen)
    let hasContent = false;
    if (hasVideoData) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, 100, 100);
          const imageData = ctx.getImageData(0, 0, 100, 100);
          const data = imageData.data;
          let nonBlackPixels = 0;
          for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness > 20) nonBlackPixels++;
          }
          hasContent = nonBlackPixels > (data.length / 4) * 0.1;
        }
      } catch (e) {
        hasContent = true;
      }
    }
    
    setFaceDetected(hasVideoData && hasContent);
    // Đã loại bỏ chức năng tự động chụp
  };

  const checkCameraSupport = (): boolean => {
    // Check for getUserMedia support across different browsers
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return true;
    }
    
    // Check for legacy webkit and moz implementations
    const legacyGetUserMedia = (navigator as any).getUserMedia || 
                              (navigator as any).webkitGetUserMedia || 
                              (navigator as any).mozGetUserMedia ||
                              (navigator as any).msGetUserMedia;
    
    if (legacyGetUserMedia) {
      // Polyfill for older browsers
      if (!navigator.mediaDevices) {
        (navigator as any).mediaDevices = {};
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia = (constraints) => {
          return new Promise((resolve, reject) => {
            legacyGetUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      }
      return true;
    }
    
    return false;
  };

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setCameraError(null);
      setCameraErrorDetail(null);

      // Stop existing stream first
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        setCurrentStream(null);
      }

      // Enhanced device enumeration with error handling
      let devices: MediaDeviceInfo[] = [];
      try {
        devices = await navigator.mediaDevices.enumerateDevices();
      } catch (e) {
        console.warn("Could not enumerate devices:", e);
      }

      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log(`Found ${videoDevices.length} video devices`);

      // Progressive constraint fallback for maximum compatibility
      const constraintSets = [
        // High quality front camera
        {
          video: { 
            facingMode: "user",
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 60 }
          }
        },
        // Medium quality front camera
        {
          video: { 
            facingMode: "user",
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 24, max: 30 }
          }
        },
        // Basic quality front camera
        {
          video: { 
            facingMode: "user",
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 15, max: 30 }
          }
        },
        // Front camera without resolution constraints
        {
          video: { 
            facingMode: "user"
          }
        },
        // Any camera without facing mode
        {
          video: true
        },
        // Specific device ID fallback (if we have devices)
        ...(videoDevices.length > 0 ? videoDevices.slice(0, 3).map(device => ({
          video: { 
            deviceId: device.deviceId,
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        })) : []),
        // Legacy browser support
        {
          video: {
            mandatory: {
              minWidth: 320,
              minHeight: 240,
              maxWidth: 1280,
              maxHeight: 720
            },
            optional: [{ facingMode: "user" }]
          }
        } as any
      ];

      let stream: MediaStream | null = null;
      let lastError: any = null;

      for (let i = 0; i < constraintSets.length; i++) {
        const constraint = constraintSets[i];
        console.log(`Trying constraint set ${i + 1}:`, constraint);
        
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          if (stream && stream.getVideoTracks().length > 0) {
            console.log(`Success with constraint set ${i + 1}`);
            const videoTrack = stream.getVideoTracks()[0];
            console.log("Video track settings:", videoTrack.getSettings());
            break;
          }
        } catch (error) {
          lastError = error;
          console.warn(`Constraint set ${i + 1} failed:`, error);
          
          // Stop any tracks that might have been created
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
          }
        }
      }

      // If all constraint sets failed
      if (!stream) {
        throw lastError || new Error("Không thể khởi động camera với bất kỳ cấu hình nào");
      }

      setCurrentStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Enhanced video loading with timeout
        const videoLoadPromise = new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          
          const onLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            clearTimeout(timeoutId);
            resolve();
          };
          
          const onError = (e: any) => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            clearTimeout(timeoutId);
            reject(new Error(`Video loading error: ${e.message || 'Unknown error'}`));
          };
          
          const timeoutId = setTimeout(() => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error("Video loading timeout"));
          }, 10000);
          
          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
        });

        try {
          await videoRef.current.play();
          await videoLoadPromise;
          setIsLoading(false);
        } catch (playError) {
          console.error("Play error:", playError);
          // Try to play again after a short delay
          setTimeout(async () => {
            try {
              await videoRef.current?.play();
              setIsLoading(false);
            } catch (e) {
              throw new Error("Không thể phát video từ camera");
            }
          }, 500);
        }
      }
    } catch (error) {
      setIsLoading(false);
      
      // Stop any stream that might have been created
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        setCurrentStream(null);
      }

      let errorMessage = "Không thể truy cập camera";
      let errorDetail = "";
      
      if (error instanceof Error) {
        errorDetail = `${error.name}: ${error.message}`;
        
        // Enhanced error handling for different scenarios
        switch (error.name) {
          case "NotAllowedError":
          case "PermissionDeniedError":
            errorMessage = "Vui lòng cho phép truy cập camera trong cài đặt trình duyệt";
            break;
          case "NotFoundError":
          case "DevicesNotFoundError":
            errorMessage = "Không tìm thấy camera. Vui lòng kết nối camera và thử lại";
            break;
          case "NotSupportedError":
          case "ConstraintNotSatisfiedError":
            errorMessage = "Camera không tương thích. Hãy thử với trình duyệt Chrome, Firefox hoặc Edge";
            break;
          case "NotReadableError":
          case "TrackStartError":
            errorMessage = "Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng khác và thử lại";
            break;
          case "AbortError":
            errorMessage = "Truy cập camera bị gián đoạn. Vui lòng thử lại";
            break;
          case "SecurityError":
            errorMessage = "Không thể truy cập camera do hạn chế bảo mật. Hãy thử truy cập qua HTTPS";
            break;
          default:
            if (error.message.includes('Permission')) {
              errorMessage = "Vui lòng cho phép truy cập camera";
            } else if (error.message.includes('not found')) {
              errorMessage = "Không tìm thấy camera";
            } else if (error.message.includes('timeout')) {
              errorMessage = "Camera mất quá nhiều thời gian để khởi động. Vui lòng thử lại";
            } else if (error.message) {
              errorMessage = error.message;
            }
        }
      } else {
        errorDetail = String(error);
      }
      
      setCameraError(errorMessage);
      setCameraErrorDetail(errorDetail);
      
      // Auto-fallback to file upload for certain errors
      if (error instanceof Error && 
          (error.name === "NotSupportedError" || 
           error.name === "NotFoundError" || 
           error.message.includes('not supported'))) {
        setTimeout(() => {
          setFallbackMode(true);
        }, 3000);
      }
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || !currentStream) return;
    setIsProcessing(true);
    setAiAnalysisStage('analyzing');
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("Video chưa sẵn sàng để chụp");
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Cannot get canvas context");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
      let imageData: string;
      try {
        imageData = canvas.toDataURL('image/jpeg', 0.8);
      } catch (e) {
        imageData = canvas.toDataURL('image/png');
      }
      if (!imageData || imageData.length < 1000) {
        throw new Error("Dữ liệu ảnh không hợp lệ");
      }
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          duration: 0.1,
          yoyo: true,
          repeat: 1
        });
      }
      // Simulate AI analysis stages with realistic timings
      setAiAnalysisStage('processing');
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Update image quality metrics during processing
      setImageQuality({
        brightness: 0.8 + Math.random() * 0.2,
        sharpness: 0.75 + Math.random() * 0.25, 
        contrast: 0.7 + Math.random() * 0.3
      });
      
      // Kiểm tra gương mặt trước khi đăng ký
      setPendingImage(imageData);
      const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      try {
        const res = await fetch('/api/auth/authenticate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image })
        });
        const result = await res.json();
        if (result.success && result.user) {
          setExistingUser(result.user);
          setShowConfirm(true);
          setIsProcessing(false);
          return;
        }
      } catch (e) {}
      // Nếu chưa có user, tiến hành đăng ký luôn
      await registerUser(imageData);
    } catch (error) {
      console.error("Capture error:", error);
      toast({
        title: "Lỗi chụp ảnh",
        description: error instanceof Error ? error.message : "Không thể chụp ảnh. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setAiAnalysisStage('complete');
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

      // Kiểm tra thông tin đầu vào
      if (!userName || !userId) {
        throw new Error("Thiếu thông tin userName hoặc userId");
      }

      console.log('Registering user:', userName, userId);
      console.log('API URL:', '/api/register/');

      // Validate dữ liệu với cả user_id
      const validateResponse = await fetch('/api/register/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: userName,
          user_id: userId,
          image: base64Image
        }),
      });

      const validateResult = await validateResponse.json();
      console.log('Validation result:', validateResult);

      if (!validateResult.valid) {
        throw new Error(validateResult.errors ? validateResult.errors.join(', ') : 'Dữ liệu không hợp lệ');
      }

      const requestBody = {
        user_name: userName,
        image: base64Image,
        user_id: userId
      };

      console.log('Request body keys:', Object.keys(requestBody));

      const response = await fetch('/api/register/', {
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

  // Xử lý xác nhận popup
  const handleConfirmRegister = async () => {
    setShowConfirm(false);
    if (pendingImage) {
      setIsProcessing(true);
      await registerUser(pendingImage);
      setIsProcessing(false);
      setPendingImage(null);
    }
  };
  const handleCancelRegister = () => {
    setShowConfirm(false);
    setIsProcessing(false);
    setPendingImage(null);
    setHasTriedCapture(false);
  };

  const handleRetry = () => {
    setCameraError(null);
    setCameraErrorDetail(null);
    setCaptureCount(0);
    setFaceDetected(false);
    setIsProcessing(false);
    setHasTriedCapture(false);
    startCamera();
  };

  const handleBack = () => {
    stopCamera();
    navigate('/register');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Lỗi file",
          description: "Vui lòng chọn file ảnh hợp lệ",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File quá lớn",
          description: "Vui lòng chọn ảnh nhỏ hơn 10MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.onerror = () => {
        toast({
          title: "Lỗi đọc file",
          description: "Không thể đọc file ảnh. Vui lòng thử lại",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!userName) {
      navigate('/register');
      return;
    }

    // Enhanced camera support detection
    const hasCamera = checkCameraSupport();
    if (!hasCamera) {
      setFallbackMode(true);
    } else {
      startCamera();
    }

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
    if (videoRef.current && !cameraError && currentStream) {
      const interval = setInterval(detectFace, 500);
      return () => clearInterval(interval);
    }
  }, [cameraError, currentStream, faceDetected, hasTriedCapture, isProcessing]);

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
            {cameraErrorDetail && (
              <pre className="text-xs text-destructive mt-2 break-words whitespace-pre-wrap border border-destructive/30 rounded p-2 bg-destructive/5">
                {cameraErrorDetail}
              </pre>
            )}
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
            <Button 
              onClick={() => setFallbackMode(true)} 
              className="flex-1 bg-primary/80 hover:bg-primary"
            >
              Chọn ảnh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (fallbackMode) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Camera className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Tải ảnh khuôn mặt</h2>
            <p className="text-muted-foreground">
              {cameraError ? 
                "Không thể mở camera. Vui lòng chọn ảnh khuôn mặt để đăng ký." :
                "Trình duyệt của bạn không hỗ trợ camera. Vui lòng chọn ảnh khuôn mặt để đăng ký."
              }
            </p>
          </div>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileUpload}
              className="hidden"
              id="photo-upload"
            />
            <label 
              htmlFor="photo-upload"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-4 h-4 mr-2" />
              Chọn ảnh từ thiết bị
            </label>
            
            {uploadedImage && (
              <div className="space-y-4">
                <img 
                  src={uploadedImage} 
                  alt="Preview" 
                  className="mx-auto rounded-lg shadow-md w-48 h-48 object-cover border-2 border-primary/20" 
                />
                <p className="text-sm text-muted-foreground">
                  Ảnh đã được tải lên thành công
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <Button
              onClick={() => {
                if (uploadedImage) {
                  setIsProcessing(true);
                  registerUser(uploadedImage);
                }
              }}
              className="flex-1 gradient-primary"
              disabled={!uploadedImage || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? "Đang xử lý..." : "Đăng ký"}
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
        controls={false}
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
            <p className="text-sm text-white/70">Vui lòng cho phép truy cập camera nếu được hỏi</p>
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
                </div>
                
                {/* Advanced AI Analysis Overlays */}
                {(isProcessing || faceDetected) && (
                  <>
                    {/* Face Analysis Overlay with Neural Network */}
                    <FaceAnalysisOverlay
                      isAnalyzing={isProcessing || faceDetected}
                      imageDimensions={{ width: 320, height: 400 }}
                      stage={aiAnalysisStage}
                      className="w-64 h-80 rounded-3xl overflow-hidden"
                    />
                    
                    {/* AI HUD Overlay */}
                    {isProcessing && (
                      <AIHudOverlay
                        isActive={isProcessing}
                        stage={aiAnalysisStage}
                        className="w-64 h-80"
                      />
                    )}
                  </>
                )}
                
                {/* Top info */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center text-white">
                  <h1 className="text-2xl font-bold mb-2">Đăng ký khuôn mặt</h1>
                  <p className="text-white/80">Chào {userName}! Hãy đưa mặt vào khung để đăng ký</p>
                </div>
                
                {/* Progress */}
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center text-white">
                  <div className="flex space-x-2 mb-2">
                    {/* Chỉ chụp 1 lần, ẩn hướng dẫn số lượng ảnh */}
                  </div>
                  <p className="text-sm text-white/80">
                    {isProcessing ? "AI đang phân tích khuôn mặt..." : "Tự động chụp khi phát hiện mặt"}
                  </p>
                </div>
                
                {/* Controls */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <Button
                    size="lg"
                    onClick={capturePhoto}
                    disabled={!faceDetected || isProcessing}
                    className="gradient-primary shadow-glow"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 mr-2" />
                    )}
                    {isProcessing ? "Đang phân tích..." : "Chụp thủ công"}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setFallbackMode(true)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    disabled={isProcessing}
                  >
                    Chọn ảnh
                  </Button>
                </div>
              </>
            )}
      </div>

      {/* Popup xác nhận nếu đã có user */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 shadow-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-bold mb-2">Gương mặt đã đăng ký</h2>
            <div className="mb-2">Bạn đã đăng ký với tên: <span className="font-semibold">{existingUser?.user_name || existingUser?.name || 'Người dùng'}</span></div>
            <div className="mb-4 text-sm text-muted-foreground">Bạn có muốn đăng ký lại với gương mặt này không?</div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleCancelRegister} disabled={isProcessing}>Không phải tôi</Button>
              <Button onClick={handleConfirmRegister} disabled={isProcessing} className="gradient-primary">Đăng ký lại</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;