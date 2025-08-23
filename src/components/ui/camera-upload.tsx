import * as React from "react";
import { Camera, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FaceAnalysisOverlay } from "./face-analysis-overlay";

interface CameraUploadProps {
  onImageCapture: (imageData: string) => void;
  className?: string;
  disabled?: boolean;
  facingMode?: "user" | "environment";
  quality?: {
    brightness?: number;
    sharpness?: number;
    contrast?: number;
  };
}

export const CameraUpload = React.forwardRef<
  HTMLDivElement,
  CameraUploadProps
>(({ onImageCapture, className, disabled = false, facingMode = "environment", ...props }, ref) => {
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const isFrontCamera = facingMode === "user";

  const startCamera = async () => {
    try {
      console.log("Attempting to start camera...");
      setIsCapturing(true);
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

  // const isFrontCamera = facingMode === "user";
      // First check if any video input devices are available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error("No camera devices found. Please check your camera connection.");
      }

      console.log("Available video devices:", videoDevices.length);
      
      // Try different constraints if the first attempt fails
      const constraints = [
        // First try: Full HD resolution
        {
          video: { 
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        },
        // Second try: HD resolution
        {
          video: { 
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        // Third try: Lower resolution
        {
          video: { 
            facingMode,
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        // Last try: Any camera
        { video: true }
      ];
      
      let stream = null;
      let error = null;
      
      for (const constraint of constraints) {
        try {
          console.log("Trying camera with constraints:", constraint);
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          if (stream) break;
        } catch (e) {
          error = e;
          console.log("Failed with constraints:", constraint, e);
          continue;
        }
      }
      
      if (!stream) {
        throw error || new Error("Could not start camera with any configuration");
      }

      console.log("Camera started successfully");
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded successfully");
          videoRef.current?.play();
        };
      }
    } catch (error) {
      console.error("Camera error details:", error);
      setIsCapturing(false);
      
      let errorMessage = "Không thể truy cập camera";
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Vui lòng cho phép truy cập camera";
        } else if (error.name === "NotFoundError") {
          errorMessage = "Không tìm thấy camera";
        } else if (error.name === "NotSupportedError") {
          errorMessage = "Trình duyệt không hỗ trợ camera";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera đang được sử dụng bởi ứng dụng khác";
        }
      }
      
      // Show error to user (we'll need to pass this up to parent component)
      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    console.log("Attempting to capture photo...");
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error("Video not ready for capture");
        alert("Video chưa sẵn sàng. Vui lòng đợi một chút.");
        return;
      }

      // Crop to match the visible frame (center crop)
      const displayWidth = video.clientWidth;
      const displayHeight = video.clientHeight;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Calculate cropping area to match display aspect ratio
      let sx = 0, sy = 0, sw = videoWidth, sh = videoHeight;
      if (videoWidth / videoHeight > displayWidth / displayHeight) {
        // Video is wider than display: crop horizontally
        sw = videoHeight * (displayWidth / displayHeight);
        sx = (videoWidth - sw) / 2;
      } else {
        // Video is taller than display: crop vertically
        sh = videoWidth * (displayHeight / displayWidth);
        sy = (videoHeight - sh) / 2;
      }

      // Crop đúng vùng hiển thị, upscale canvas lên 2x để tăng pixel density
      const upscale = 3;
      canvas.width = sw * upscale;
      canvas.height = sh * upscale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (isFrontCamera) {
          ctx.save();
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw * upscale, sh * upscale);
          ctx.restore();
        } else {
          ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw * upscale, sh * upscale);
        }
        const imageData = canvas.toDataURL('image/jpeg', 1.0); // JPEG chất lượng cao, pixel density rất cao
        console.log("Photo captured successfully (cropped & upscaled JPEG x3)");
        setPreviewImage(imageData);
        onImageCapture(imageData);
        stopCamera();
      } else {
        console.error("Could not get canvas context");
        alert("Không thể chụp ảnh. Vui lòng thử lại.");
      }
    } else {
      console.error("Video or canvas ref not available");
      alert("Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Vui lòng chọn file ảnh");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log("File loaded successfully");
        setPreviewImage(result);
        onImageCapture(result);
      };
      reader.onerror = () => {
        console.error("Error reading file");
        alert("Không thể đọc file. Vui lòng thử lại.");
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div ref={ref} className={cn("w-full flex flex-col items-center justify-center", className)} {...props}>
      <canvas ref={canvasRef} className="hidden" />

      {previewImage ? (
        <div className="relative rounded-xl overflow-hidden shadow-card w-full max-w-xs mx-auto">
          <img
            src={previewImage}
            alt="Captured face"
            className="w-full h-64 object-cover rounded-xl"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={clearImage}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="bg-success text-success-foreground rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          </div>
        </div>
      ) : isCapturing ? (
        <div className="relative rounded-xl overflow-hidden shadow-card w-full max-w-xs mx-auto">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 object-cover transform -scale-x-100 rounded-xl"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={stopCamera}
            >
              Hủy
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={capturePhoto}
              className="gradient-primary shadow-glow"
            >
              <Camera className="h-4 w-4 mr-2" />
              Chụp ảnh
            </Button>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-2xl p-6 text-center bg-white/80 shadow-md w-full max-w-xs mx-auto flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
              <Camera className="w-6 h-6 text-primary" />
            </span>
            <Button
              variant="outline"
              onClick={startCamera}
              disabled={disabled}
              className="w-40 h-12 rounded-full font-semibold text-base flex items-center justify-center gap-2 shadow-sm border border-primary"
            >
              <Camera className="h-5 w-5 mr-2" />
              Camera
            </Button>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Chỉ chụp ảnh khuôn mặt trực tiếp từ camera
          </p>
        </div>
      )}
    </div>
  );
});

CameraUpload.displayName = "CameraUpload";