import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserPlus, Eye, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // GSAP entrance animations
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
    )
    .fromTo(heroRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(cardsRef.current?.children,
      { opacity: 0, y: 30, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.5, 
        stagger: 0.2, 
        ease: "back.out(1.7)" 
      },
      "-=0.3"
    );

    // Floating animation for the main icon
    gsap.to(".floating-icon", {
      y: -10,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });

    // Sparkle animation
    gsap.to(".sparkle", {
      rotate: 360,
      duration: 4,
      ease: "none",
      repeat: -1
    });
  }, []);

  const handleNavigation = (path: string) => {
    // Exit animation
    gsap.to([heroRef.current, cardsRef.current], {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => navigate(path)
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-background/50">
      <div className="w-full max-w-4xl space-y-8">
        {/* Hero Section */}
        <div ref={heroRef} className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="floating-icon mx-auto w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center shadow-glow">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <Sparkles className="sparkle absolute -top-2 -right-2 w-6 h-6 text-primary" />
          </div>
          
          <div ref={titleRef} className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              eKYC App
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ứng dụng xác thực danh tính hiện đại với công nghệ nhận diện khuôn mặt AI
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="gradient-card shadow-card border-border/50 hover:shadow-glow transition-all duration-300 cursor-pointer group"
                onClick={() => handleNavigation('/register')}>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">Đăng ký mới</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-muted-foreground mb-4">
                Tạo tài khoản và đăng ký khuôn mặt của bạn
              </CardDescription>
              <Button 
                className="w-full gradient-primary shadow-glow hover:shadow-lg transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigation('/register');
                }}
              >
                Bắt đầu đăng ký
              </Button>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-border/50 hover:shadow-glow transition-all duration-300 cursor-pointer group"
                onClick={() => handleNavigation('/verify')}>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">Xác thực</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-muted-foreground mb-4">
                Xác thực danh tính bằng khuôn mặt đã đăng ký
              </CardDescription>
              <Button 
                variant="outline"
                className="w-full border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigation('/verify');
                }}
              >
                Xác thực ngay
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <p>An toàn</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p>Nhanh chóng</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-primary" />
              </div>
              <p>Chính xác</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
