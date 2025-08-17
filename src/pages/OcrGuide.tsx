import AppFooter from "@/components/ui/AppFooter";

import React, { useState } from "react";
import AppHeader from "@/components/ui/AppHeader";
// Modal hiển thị hình ảnh full screen
const ImageModal = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
    <div className="relative max-w-full max-h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl border-4 border-primary bg-white object-contain"
      />
      <button
        className="absolute top-2 right-2 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-primary/80 transition"
        onClick={onClose}
        aria-label="Đóng"
      >
        ×
      </button>
    </div>
  </div>
);
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeCheck, CreditCard, IdCard, ScanLine } from "lucide-react";

const cardTypes = [
  {
    name: "Căn cước công dân",
    description: "Nhận diện mặt trước & mặt sau. Trích xuất: Họ tên, ngày sinh, số CCCD, ngày cấp, địa chỉ, giới tính, quốc tịch, mã QR.",
    image: "/static/images/mockup/cancuoc.jpg",
    icon: <IdCard className="w-6 h-6 text-primary" />,
    sides: ["Mặt trước", "Mặt sau"]
  },
  {
    name: "Căn cước công dân QR",
    description: "Nhận diện mặt trước. Trích xuất: Họ tên, số CCCD, ngày sinh, mã QR, địa chỉ, ngày cấp.",
    image: "/static/images/mockup/cccd_qr.jpg",
    icon: <ScanLine className="w-6 h-6 text-primary" />,
    sides: ["Mặt trước", "Mặt sau"]
  },
  {
    name: "Giấy phép lái xe",
    description: "Nhận diện mặt trước. Trích xuất: Họ tên, số GPLX, ngày sinh, hạng, ngày cấp, nơi cấp, ảnh chân dung.",
    image: "/static/images/mockup/giaypheplaixe.jpg",
    icon: <CreditCard className="w-6 h-6 text-primary" />,
   sides: ["Mặt trước", "Mặt sau"]
  }
];


const OcrGuide = () => {
  const [modalImg, setModalImg] = useState<{ src: string; alt: string } | null>(null);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex flex-col">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-5xl">
          <Card className="w-full gradient-card shadow-card border-border/50 mb-8">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-extrabold text-primary mb-2 flex items-center justify-center gap-2">
                <BadgeCheck className="w-7 h-7 text-success" />
                Hướng dẫn nhận diện & OCR các loại thẻ
              </CardTitle>
              <div className="text-base text-muted-foreground font-medium max-w-xl mx-auto">
                Hệ thống hỗ trợ nhận diện và trích xuất thông tin tự động từ các loại giấy tờ phổ biến. Vui lòng tham khảo các mẫu thẻ dưới đây để đảm bảo kết quả OCR chính xác nhất.
              </div>
            </CardHeader>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cardTypes.map((type) => (
              <Card key={type.name} className="flex flex-col h-full shadow-card border border-border/30 rounded-xl bg-gradient-to-br from-primary/5 to-background/40">
                <CardHeader className="flex flex-col items-center gap-2 pb-0">
                  <div className="mb-2">{type.icon}</div>
                  <div className="font-bold text-lg text-primary text-center">{type.name}</div>
                  <div className="flex flex-wrap gap-2 justify-center mb-1">
                    {type.sides && type.sides.map(side => (
                      <span key={side} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold border border-primary/20">{side}</span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-2 pt-0">
                  <div className="relative w-52 h-36 flex items-center justify-center cursor-pointer" onClick={() => setModalImg({ src: type.image, alt: type.name })}>
                    <img
                      src={type.image}
                      alt={type.name}
                      className="w-full h-full object-cover rounded-lg border-2 border-primary/30 shadow-md hover:border-primary hover:shadow-xl transition"
                    />
                    <span className="absolute top-2 right-2 bg-primary/80 text-white text-xs px-2 py-0.5 rounded shadow">Mẫu</span>
                    <span className="absolute bottom-2 right-2 bg-white/80 text-primary text-xs px-2 py-0.5 rounded shadow border border-primary/30">Click để xem lớn</span>
                  </div>
                  <div className="text-sm text-muted-foreground text-center font-medium mt-2">{type.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center pt-8">
            <Button variant="outline" size="lg" className="rounded-xl px-6 py-2 font-semibold" onClick={() => window.history.back()}>
              Quay lại trang trước
            </Button>
          </div>
        </div>
        {modalImg && (
          <ImageModal src={modalImg.src} alt={modalImg.alt} onClose={() => setModalImg(null)} />
        )}
      </div>
    <AppFooter />
    </div>
  );
};

export default OcrGuide;
