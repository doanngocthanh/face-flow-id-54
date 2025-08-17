import React from "react";
import AppHeader from "@/components/ui/AppHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const Profile = () => {
  // Giả lập lấy thông tin từ localStorage hoặc API
  const userId = localStorage.getItem('face_user_id') || "Chưa xác thực";
  const authenticated = localStorage.getItem('face_authenticated') === 'true';

  // Có thể lấy thêm thông tin từ API nếu cần
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/50">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md gradient-card shadow-card border-border/50">
          <CardHeader className="text-center space-y-4">
            <User className="w-12 h-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-2xl font-bold text-foreground">Thông tin của tôi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 items-center">
              <div className="font-semibold text-lg text-primary">User ID:</div>
              <div className="text-base text-muted-foreground">{userId}</div>
              <div className="font-semibold text-lg text-primary">Trạng thái xác thực:</div>
              <div className={`text-base ${authenticated ? 'text-success' : 'text-destructive'}`}>{authenticated ? 'Đã xác thực' : 'Chưa xác thực'}</div>
            </div>
            <div className="text-center pt-4">
              <Button variant="outline" onClick={() => window.history.back()}>
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
