import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CameraUpload } from "@/components/ui/camera-upload";
import { UploadCloud, Loader2 } from "lucide-react";

interface CameraUploadSectionProps {
  side: "front" | "back";
  setSide: (side: "front" | "back") => void;
  image: string;
  setImage: (img: string) => void;
  isUploading: boolean;
  handleUpload: () => void;
  docInfo: { label: string; description: string };
}

const CameraUploadSection: React.FC<CameraUploadSectionProps> = ({
  side,
  setSide,
  image,
  setImage,
  isUploading,
  handleUpload,
  docInfo,
}) => (
  <Card className="w-full max-w-md gradient-card shadow-card border-border/50">
    <CardHeader className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <UploadCloud className="w-8 h-8 text-primary" />
      </div>
      <CardTitle className="text-2xl font-bold text-foreground">Upload {docInfo.label}</CardTitle>
      <p className="text-muted-foreground">{docInfo.description}</p>
      <div className="flex justify-center gap-4 mt-2">
        <Button variant={side === "front" ? "default" : "outline"} onClick={() => setSide("front")}>Mặt trước</Button>
        <Button variant={side === "back" ? "default" : "outline"} onClick={() => setSide("back")}>Mặt sau</Button>
      </div>
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
    </CardContent>
  </Card>
);

export default CameraUploadSection;
