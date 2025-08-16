import * as React from "react";
import { Camera, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CameraUploadProps {
  onImageCapture: (imageData: string) => void;
  className?: string;
  disabled?: boolean;
}

export const CameraUpload = React.forwardRef<
  HTMLDivElement,
  CameraUploadProps
>(({ onImageCapture, className, disabled = false, ...props }, ref) => {
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      console.log("Attempting to start camera...");
      setIsCapturing(true);
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }
      
      const constraints = {
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      console.log("Requesting camera permission...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera permission granted, setting up video stream...");
      
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
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        console.log("Photo captured successfully");
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
    <div ref={ref} className={cn("relative", className)} {...props}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
        disabled={disabled}
      />
      
      <canvas ref={canvasRef} className="hidden" />

      {previewImage ? (
        <div className="relative rounded-xl overflow-hidden shadow-card">
          <img
            src={previewImage}
            alt="Captured face"
            className="w-full h-64 object-cover"
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
        <div className="relative rounded-xl overflow-hidden shadow-card">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
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
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center space-y-4 gradient-card">
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={startCamera}
              disabled={disabled}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Chụp ảnh hoặc tải lên ảnh khuôn mặt
          </p>
        </div>
      )}
    </div>
  );
});

CameraUpload.displayName = "CameraUpload";