import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AppHeader = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('face_authenticated') === 'true';

  return (
    <div className="w-full flex items-center justify-between px-6 py-4 bg-primary/90 shadow-sm border-b border-border/30">
      <div className="flex items-center gap-3">
        <img
          src="/static/images/ai-logo.png"
          alt="Logo AI"
          className="w-8 h-8"
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/favicon.ico";
          }}
        />
        <span className="text-xl font-bold text-white tracking-wide">eKYC App</span>
      </div>
      <div className="flex items-center gap-2">
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            title="Thông tin của tôi"
            onClick={() => navigate('/profile')}
            className="rounded-full text-white hover:bg-primary/80"
          >
            <User className="w-5 h-5" />
          </Button>
        )}
        {isAuthenticated && (
          <Button
            variant="destructive"
            size="icon"
            title="Đăng xuất"
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              navigate('/verify');
            }}
            className="rounded-full ml-2 text-white bg-destructive/90 hover:bg-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppHeader;
