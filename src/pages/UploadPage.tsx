import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CameraUpload } from "@/components/ui/camera-upload";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Loader2 } from "lucide-react";

const docTypes: Record<string, { label: string; description: string }> = {
  cmnd: {
    label: "CMND/CCCD",
    description: "Chứng minh nhân dân/Căn cước công dân",
  },
  passport: {
    label: "Passport",
    description: "Hộ chiếu",
  },
  driver: {
    label: "Bằng lái xe",
    description: "Giấy phép lái xe",
  },
};

const UploadPage = () => {
  const { docType } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [image, setImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const docInfo = docTypes[docType || ""] || {
    label: "Giấy tờ khác",
    description: "Upload giấy tờ tuỳ thân",
  };

  const handleUpload = async () => {
    if (!image) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ảnh giấy tờ để upload",
        variant: "destructive",
      });
      return;
    }
    setIsUploading(true);
    // TODO: Gửi ảnh giấy tờ lên server
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Upload thành công!",
        description: `${docInfo.label} đã được upload thành công.`,
      });
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-background/50">
      <Card className="w-full max-w-md gradient-card shadow-card border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Upload {docInfo.label}</CardTitle>
          <p className="text-muted-foreground">{docInfo.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <CameraUpload
            onImageCapture={setImage}
            disabled={isUploading}
          />
          <Button
            onClick={handleUpload}
            disabled={isUploading || !image}
            className="w-full gradient-primary shadow-glow font-medium"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang upload...
              </>
            ) : (
              <>Upload giấy tờ</>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full mt-2"
          >
            Quay lại trang chủ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;
