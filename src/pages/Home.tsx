import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CameraUpload } from "@/components/ui/camera-upload";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, UserPlus } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthenticated = localStorage.getItem('face_authenticated') === 'true';

  React.useEffect(() => {
    if (!isAuthenticated && window.location.pathname === '/') {
      navigate('/verify');
    }
  }, [isAuthenticated, navigate]);
  // Danh sách các loại giấy tờ
  const documents = [
    {
      key: 'cmnd',
      label: 'CMND/CCCD',
      description: 'Chứng minh nhân dân/Căn cước công dân',
      icon: <FileText className="w-8 h-8 text-primary" />,
    },
    {
      key: 'passport',
      label: 'Passport',
      description: 'Hộ chiếu',
      icon: <UploadCloud className="w-8 h-8 text-primary" />,
    },
    {
      key: 'driver',
      label: 'Bằng lái xe',
      description: 'Giấy phép lái xe',
      icon: <UserPlus className="w-8 h-8 text-primary" />,
    },
    // Có thể thêm các loại giấy tờ khác
  ];

  const handleSelectDoc = (docKey: string) => {
    // Chuyển sang trang upload tương ứng, ví dụ /upload/:docKey
    navigate(`/upload/${docKey}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-background to-background/50">
      <Card className="w-full max-w-2xl gradient-card shadow-card border-border/50">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-2xl font-bold text-foreground">Trang chủ eKYC</CardTitle>
          <p className="text-muted-foreground">Chọn loại giấy tờ để upload</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {documents.map(doc => (
              <div
                key={doc.key}
                className="group cursor-pointer bg-background rounded-xl shadow-card border border-border/30 p-6 flex flex-col items-center justify-center transition hover:bg-primary/10 hover:shadow-lg"
                onClick={() => handleSelectDoc(doc.key)}
              >
                <div className="mb-3">{doc.icon}</div>
                <div className="font-semibold text-lg text-primary group-hover:underline">{doc.label}</div>
                <div className="text-xs text-muted-foreground mt-1 text-center">{doc.description}</div>
                <div className="mt-2 text-xs text-primary/70 opacity-0 group-hover:opacity-100 transition">Click để upload</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center w-full pt-2 pb-2">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/register")}
                className="w-full sm:flex-1 rounded-lg px-4 py-2"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Đăng ký khuôn mặt
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/verify")}
                className="w-full sm:flex-1 rounded-lg px-4 py-2"
              >
                <FileText className="w-4 h-4 mr-2" />
                Xác thực khuôn mặt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
