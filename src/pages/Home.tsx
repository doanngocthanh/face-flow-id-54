import AppFooter from "@/components/ui/AppFooter";
import AppHeader from "@/components/ui/AppHeader";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, UserPlus, LogOut, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Home = () => {
  // ...existing code...
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
        key: 'cccd',
        label: 'Căn cước công dân',
        description: 'Nhận diện và OCR CCCD (mặt trước, mặt sau)',
        icon: <FileText className="w-8 h-8 text-primary" />,
    },
    {
        key: 'gplx',
        label: 'Giấy phép lái xe',
        description: 'Nhận diện và OCR GPLX các loại',
        icon: <UploadCloud className="w-8 h-8 text-primary" />,
    },
  
    // Thêm các loại giấy tờ khác nếu cần
];

  const handleSelectDoc = (docKey: string) => {
    // Chuyển sang trang upload tương ứng, ví dụ /upload/:docKey
    navigate(`/upload/${docKey}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex flex-col">
  {/* Header */}
  <AppHeader />
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-6">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Chọn loại giấy tờ để upload</h1>
            <p className="text-muted-foreground">Hệ thống hỗ trợ nhận diện và OCR nhiều loại giấy tờ phổ biến.</p>
          </div>
          <div
            className={
              `grid gap-4 sm:gap-6 mb-8 ` +
              (documents.length === 1
                ? 'grid-cols-1'
                : documents.length === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : documents.length === 3
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5')
            }
          >
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
            {!isAuthenticated ? (
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
            ) : null}
            <div className="w-full flex justify-center mt-4">
              <Button
                variant="secondary"
                onClick={() => navigate("/ocr-guide")}
                className="w-full sm:w-auto rounded-lg px-4 py-2"
              >
                Hướng dẫn nhận diện & OCR các loại thẻ
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
    <AppFooter />
    </div>
  );
};

export default Home;
