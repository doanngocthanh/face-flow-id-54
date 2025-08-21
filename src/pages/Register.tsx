import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CameraUpload } from "@/components/ui/camera-upload";
import { useToast } from "@/hooks/use-toast";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { UserPlus, Loader2, Shield, ArrowLeft } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [faceImage, setFaceImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

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

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên của bạn",
        variant: "destructive",
      });
      return;
    }

  // Sinh userId và truyền sang camera-capture
  const userId = generateUUID();
  navigate('/camera-capture', { state: { userName: name.trim(), userId } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-background/50 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      <Card ref={cardRef} className="w-full max-w-md gradient-card shadow-card border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/verify')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Xác thực</span>
            </Button>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div ref={titleRef}>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Đăng ký khuôn mặt
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Xác thực danh tính bằng khuôn mặt
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent ref={formRef} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Họ và tên
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Nhập họ và tên của bạn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border focus:border-primary transition-colors"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleRegister}
            disabled={isLoading || !name.trim()}
            className="w-full gradient-primary shadow-glow hover:shadow-lg transition-all duration-300 font-medium"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Bắt đầu đăng ký khuôn mặt
              </>
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/verify')}
              className="text-primary hover:text-primary/80 text-sm transition-colors"
            >
              Đã có tài khoản? Xác thực ngay →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;